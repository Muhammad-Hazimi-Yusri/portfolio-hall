// Local preview of the visitor wall. Listens on 127.0.0.1 only; data stays in the ignored _local/ folder.
//   node tools/community-local.mjs
// Environment: COMMUNITY_PORT (default 5190, 0 = any free port), COMMUNITY_DB (default
// _local/community.sqlite, or :memory:), COMMUNITY_ORIGINS (comma-separated exact origins).
import { createServer } from 'node:http'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import worker, { LIMITS, applyRetention, presenceKey, visitorKey } from '../community/worker.mjs'

const SCHEMA = readFileSync(new URL('../community/schema.sql', import.meta.url), 'utf8')
const DEFAULT_DB = fileURLToPath(new URL('../_local/community.sqlite', import.meta.url))
const DEFAULT_ORIGINS = 'http://127.0.0.1:5186,http://127.0.0.1:5187,http://localhost:5186,http://localhost:5187'
const REQUIRED_COLUMNS = {
  visit_days: ['day', 'visitor'],
  presence: ['visitor', 'country', 'zone', 'last_seen'],
  notes: ['id', 'session', 'name', 'message', 'created', 'approved'],
  visits: ['session', 'day', 'country', 'zone', 'last_seen'],
}
const PRIMARY_KEYS = { visit_days: ['day', 'visitor'], presence: ['visitor'], notes: ['id'], visits: ['session'] }
const LEGACY_TABLE = 'visits_legacy_v1'
const FORWARDED_HEADERS = ['origin', 'content-type', 'content-length']

// Minimal D1-style adapter over node:sqlite: prepare/bind/all/first/run and a transactional batch.
export function createD1(db) {
  const compiled = new Map()
  const compile = sql => {
    let entry = compiled.get(sql)
    if (!entry) {
      // D1 uses numbered ?N parameters; rewrite to plain ? with an explicit argument order.
      const order = []
      const text = sql.replace(/\?(\d+)/g, (_, number) => { order.push(Number(number) - 1); return '?' })
      entry = { statement: db.prepare(text), order, reader: /^\s*(select|with|pragma)\b/i.test(sql) }
      compiled.set(sql, entry)
    }
    return entry
  }
  const execute = (sql, args) => {
    const { statement, order, reader } = compile(sql)
    const values = order.length ? order.map(index => args[index]) : args
    if (reader) return { success: true, results: statement.all(...values), meta: { changes: 0 } }
    const info = statement.run(...values)
    return { success: true, results: [], meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } }
  }
  // D1 is remote and asynchronous; yielding a macrotask keeps check-then-write races visible in tests.
  const tick = () => new Promise(done => setImmediate(done))
  const bound = (sql, args) => ({
    sql,
    args,
    bind: (...values) => bound(sql, values),
    async all() { await tick(); return execute(sql, args) },
    async run() { await tick(); return execute(sql, args) },
    async first(column) {
      await tick()
      const row = execute(sql, args).results[0]
      if (row === undefined) return null
      return column ? row[column] ?? null : row
    },
  })
  return {
    prepare: sql => bound(sql, []),
    async batch(statements) {
      await tick()
      db.exec('BEGIN IMMEDIATE')
      try {
        const results = statements.map(statement => execute(statement.sql, statement.args))
        db.exec('COMMIT')
        return results
      } catch (error) {
        db.exec('ROLLBACK')
        throw error
      }
    },
  }
}

function assertColumns(db) {
  for (const [table, needed] of Object.entries(REQUIRED_COLUMNS)) {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all()
    const found = columns.map(column => column.name)
    const missing = needed.filter(name => !found.includes(name))
    if (found.length && missing.length) {
      throw new Error(`Table ${table} is missing ${missing.join(', ')}. Move the database file aside and start again; nothing was changed.`)
    }
    if (columns.length) {
      const key = columns.filter(column => column.pk).sort((a, b) => a.pk - b.pk).map(column => column.name)
      if (key.join(',') !== PRIMARY_KEYS[table].join(',')) {
        throw new Error(`Table ${table} has an unexpected primary key; nothing was changed.`)
      }
      for (const column of columns.filter(column => needed.includes(column.name))) {
        const expected = ['last_seen', 'created', 'approved'].includes(column.name) ? 'INTEGER' : 'TEXT'
        if (column.type.toUpperCase() !== expected) throw new Error(`Table ${table} has an unexpected type for ${column.name}; nothing was changed.`)
      }
    }
  }
}

// Creates the current schema and migrates the earlier single `visits` table. Returns rows migrated.
export async function prepareDatabase(db) {
  assertColumns(db)
  const hasTable = name => db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !== undefined
  const legacy = hasTable('visits')
  if (legacy && hasTable(LEGACY_TABLE)) throw new Error(`Both visits and ${LEGACY_TABLE} exist. Resolve them by hand; nothing was changed.`)
  // The old table kept one row per session on its first day. Each row is still a true visit on that day.
  const rows = legacy ? db.prepare('SELECT session, day, country, zone, last_seen FROM visits').all() : []
  const keyed = await Promise.all(rows.map(async row => ({
    ...row,
    visitor: await visitorKey(row.day, String(row.session)),
    presence: await presenceKey(String(row.session)),
  })))
  db.exec('BEGIN IMMEDIATE')
  try {
    db.exec(SCHEMA)
    assertColumns(db)
    const addDay = db.prepare('INSERT OR IGNORE INTO visit_days (day, visitor) VALUES (?, ?)')
    const addPresence = db.prepare('INSERT OR IGNORE INTO presence (visitor, country, zone, last_seen) VALUES (?, ?, ?, ?)')
    for (const row of keyed) {
      addDay.run(row.day, row.visitor)
      addPresence.run(row.presence, row.country, row.zone, row.last_seen - (row.last_seen % 60_000))
    }
    if (legacy) db.exec(`ALTER TABLE visits RENAME TO ${LEGACY_TABLE}`) // kept, never deleted
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
  return rows.length
}

// Buffers at most `limit` bytes. Oversized uploads are drained and discarded (bounded by requestTimeout).
function readBody(incoming, limit) {
  return new Promise((resolveBody, reject) => {
    const chunks = []
    let size = 0
    incoming.on('data', chunk => { size += chunk.length; if (size <= limit) chunks.push(chunk) })
    incoming.on('end', () => resolveBody(size > limit ? null : Buffer.concat(chunks)))
    incoming.on('error', reject)
    incoming.on('close', () => { if (!incoming.complete) reject(new Error('Upload aborted.')) })
  })
}

async function handle(incoming, outgoing, env) {
  outgoing.on('error', () => {})
  const send = (status, headers, text) => {
    if (!outgoing.headersSent && !outgoing.destroyed) outgoing.writeHead(status, headers).end(text)
  }
  const fail = (status, error) => send(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, JSON.stringify({ error }))
  let body
  try { body = await readBody(incoming, LIMITS.bodyBytes) } catch { outgoing.destroy(); return }
  if (body === null) return fail(413, 'Message too large.')
  if (!['GET', 'POST', 'OPTIONS'].includes(incoming.method)) return fail(405, 'Method not allowed.')
  try {
    const headers = new Headers()
    for (const name of FORWARDED_HEADERS) if (typeof incoming.headers[name] === 'string') headers.set(name, incoming.headers[name])
    const path = (incoming.url || '/').split('?')[0]
    const request = new Request(`http://127.0.0.1${path.startsWith('/') ? path : '/'}`, {
      method: incoming.method,
      headers,
      body: incoming.method === 'POST' && body.length ? body : undefined,
    })
    const response = await worker.fetch(request, env)
    send(response.status, Object.fromEntries(response.headers), await response.text())
  } catch (error) {
    console.error('Local visitor wall error:', error?.message || error)
    fail(500, 'Local wall error.')
  }
}

export async function startServer({ port = 5190, dbPath = DEFAULT_DB, origins = DEFAULT_ORIGINS, log = console.log } = {}) {
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true })
  const db = new DatabaseSync(dbPath)
  let pruning
  try {
    const migrated = await prepareDatabase(db)
    if (migrated) log(`Migrated ${migrated} visit rows from the old schema; the original table is kept as ${LEGACY_TABLE}.`)
    const env = { DB: createD1(db), LOCAL_PREVIEW: '1', ALLOWED_ORIGINS: origins }
    await applyRetention(env.DB)
    pruning = setInterval(() => applyRetention(env.DB).catch(error => log(`Retention failed: ${error.message}`)), 3_600_000)
    pruning.unref()
    const server = createServer((incoming, outgoing) => { handle(incoming, outgoing, env).catch(() => outgoing.destroy()) })
    server.headersTimeout = 5_000
    server.requestTimeout = 10_000
    await new Promise((listening, failed) => {
      server.once('error', failed)
      server.listen(port, '127.0.0.1', () => { server.off('error', failed); listening() }) // loopback only
    })
    let closing
    const close = () => (closing ??= new Promise(closed => {
      clearInterval(pruning)
      const force = setTimeout(() => server.closeAllConnections(), 2_000)
      force.unref()
      server.close(() => { clearTimeout(force); db.close(); closed() })
    }))
    const actualPort = server.address().port
    return { server, port: actualPort, url: `http://127.0.0.1:${actualPort}`, dbPath, close }
  } catch (error) {
    clearInterval(pruning)
    db.close()
    throw error
  }
}

const invokedDirectly = Boolean(process.argv[1]) && resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase()
if (invokedDirectly) {
  const port = Number(process.env.COMMUNITY_PORT || 5190)
  const dbPath = process.env.COMMUNITY_DB === ':memory:' ? ':memory:' : resolve(process.env.COMMUNITY_DB || DEFAULT_DB)
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error('COMMUNITY_PORT must be an integer from 0 to 65535.')
    process.exitCode = 1
  } else {
    startServer({ port, dbPath, origins: process.env.COMMUNITY_ORIGINS || DEFAULT_ORIGINS }).then(service => {
      console.log(`Local visitor wall: ${service.url} · loopback only · data: ${dbPath}`)
      const stop = () => { console.log('Closing the local visitor wall…'); service.close() }
      process.once('SIGINT', stop)
      process.once('SIGTERM', stop)
    }, error => {
      console.error(`Local visitor wall could not start: ${error.message}`)
      process.exitCode = 1
    })
  }
}
