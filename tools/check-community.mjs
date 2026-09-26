// Behavioural checks for the visitor wall:  node --test tools/check-community.mjs
// Uses only node:test, node:sqlite and the real fetch handler through the D1-style adapter.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { request as httpRequest } from 'node:http'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import worker, { LIMITS } from '../community/worker.mjs'
import { createD1, prepareDatabase, startServer } from './community-local.mjs'

const ORIGIN = 'http://localhost:5186'
const DAY = 86_400_000
const NOON = Date.parse('2026-03-10T12:00:00Z')
const newSession = () => crypto.randomUUID()

async function makeEnv(overrides = {}) {
  const db = new DatabaseSync(':memory:')
  await prepareDatabase(db)
  return { db, env: { DB: createD1(db), LOCAL_PREVIEW: '1', ALLOWED_ORIGINS: ORIGIN, ...overrides } }
}

function call(env, path, { method = 'GET', body, origin = ORIGIN, type = 'application/json', host = '127.0.0.1', headers = {}, cf } = {}) {
  const init = { method, headers: new Headers(headers) }
  if (origin) init.headers.set('Origin', origin)
  if (body !== undefined) {
    if (type) init.headers.set('Content-Type', type)
    const raw = typeof body === 'string' || body instanceof Uint8Array || body instanceof ReadableStream
    init.body = raw ? body : JSON.stringify(body)
    if (body instanceof ReadableStream) init.duplex = 'half'
  }
  const request = new Request(`http://${host}${path}`, init)
  if (cf) request.cf = cf
  return worker.fetch(request, env)
}
const post = (env, path, body, options = {}) => call(env, path, { method: 'POST', body, ...options })
async function summaryOf(env, options) {
  const response = await call(env, '/summary', options)
  assert.equal(response.status, 200)
  return response.json()
}
const total = days => days.reduce((sum, entry) => sum + entry.visits, 0)

test('daily visits count each browser session once per UTC date, including across midnight', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-03-10T23:59:30Z') })
  const { env } = await makeEnv()
  const a = newSession(), b = newSession()
  for (const zone of ['entrance', 'work', 'projects']) assert.equal((await post(env, '/visit', { session: a, zone })).status, 200)
  await post(env, '/visit', { session: b, zone: 'about' })
  await post(env, '/visit', { session: a.toUpperCase(), zone: 'work' }) // same UUID, different case
  t.mock.timers.setTime(Date.parse('2026-03-11T00:00:30Z'))
  await post(env, '/visit', { session: a, zone: 'contact' })
  await post(env, '/visit', { session: a, zone: 'projects' })

  const data = await summaryOf(env)
  assert.equal(data.mode, 'local')
  assert.equal(data.days.length, 28)
  assert.equal(data.days[0].day, '2026-02-12')
  assert.deepEqual(data.days.slice(-2), [{ day: '2026-03-10', visits: 2 }, { day: '2026-03-11', visits: 1 }])
  assert.equal(total(data.days), 3)
  // One boat per browser, showing only its latest section.
  assert.deepEqual(data.visits, [{ country: '??', zone: 'projects' }, { country: '??', zone: 'about' }])
})

test('summary covers 28 days, samples at most 12 boats and takes country only from Cloudflare', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON - 30 * DAY })
  const { env } = await makeEnv()
  await post(env, '/visit', { session: newSession(), zone: 'work' })
  t.mock.timers.setTime(NOON)
  for (let i = 0; i < 14; i++) await post(env, '/visit', { session: newSession(), zone: 'projects' })
  t.mock.timers.setTime(NOON + 2 * 60_000)
  await post(env, '/visit', { session: newSession(), zone: 'about', country: 'US' }, { cf: { country: 'NZ' } })

  let data = await summaryOf(env)
  assert.deepEqual(data.days.at(-1), { day: '2026-03-10', visits: 15 })
  assert.equal(total(data.days), 15, 'the 30-day-old visit is outside the window')
  assert.equal(data.visits.length, LIMITS.boats)
  assert.deepEqual(data.visits[0], { country: 'NZ', zone: 'about' })
  assert.ok(data.visits.slice(1).every(boat => boat.country === '??'))

  t.mock.timers.setTime(NOON + 3 * 60_000)
  await post(env, '/visit', { session: newSession(), zone: 'contact', country: 'NZ' }, { cf: { country: 'T1' } })
  data = await summaryOf(env)
  assert.deepEqual(data.visits[0], { country: '??', zone: 'contact' })
})

test('storage keeps no raw session, IP address, user agent or movement trail', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const { db, env } = await makeEnv()
  const session = newSession()
  const headers = { 'User-Agent': 'CheckAgent/1.0', 'CF-Connecting-IP': '203.0.113.9', 'X-Forwarded-For': '198.51.100.7' }
  for (const zone of ['entrance', 'work', 'about']) await post(env, '/visit', { session, zone }, { headers })
  t.mock.timers.setTime(NOON + DAY)
  await post(env, '/visit', { session, zone: 'contact' }, { headers })
  assert.equal((await post(env, '/note', { session, name: 'Ana', message: 'Lovely hall' }, { headers })).status, 201)

  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map(row => row.name)
  const stored = JSON.stringify(tables.map(name => db.prepare(`SELECT * FROM "${name}"`).all()))
  for (const secret of [session, '203.0.113.9', '198.51.100.7', 'CheckAgent']) assert.ok(!stored.includes(secret), `${secret} was stored`)
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM presence').get().n, 1)
  const keys = db.prepare('SELECT visitor FROM visit_days').all().map(row => row.visitor)
  assert.equal(keys.length, 2)
  assert.notEqual(keys[0], keys[1], 'daily keys must not link days together')
})

test('origins match exactly, and writes need an allowed origin and a JSON content type', async () => {
  const { env } = await makeEnv({ ALLOWED_ORIGINS: ` ${ORIGIN} , https://hall.example/ , null, *` })
  const allowed = await call(env, '/summary')
  assert.equal(allowed.status, 200)
  assert.equal(allowed.headers.get('Access-Control-Allow-Origin'), ORIGIN)
  for (const origin of ['http://localhost:51860', 'http://LOCALHOST:5186', 'https://hall.example', 'https://hall.example/', 'null', '*']) {
    const denied = await call(env, '/summary', { origin })
    assert.equal(denied.status, 403, origin)
    assert.equal(denied.headers.get('Access-Control-Allow-Origin'), null)
  }
  const direct = await call(env, '/summary', { origin: null })
  assert.equal(direct.status, 200)
  assert.equal(direct.headers.get('Access-Control-Allow-Origin'), null)
  const preflight = await call(env, '/note', { method: 'OPTIONS' })
  assert.equal(preflight.status, 204)
  assert.match(preflight.headers.get('Access-Control-Allow-Methods'), /POST/)
  assert.match(preflight.headers.get('Access-Control-Allow-Headers'), /Content-Type/i)

  const visit = { session: newSession(), zone: 'work' }
  assert.equal((await post(env, '/visit', visit, { origin: null })).status, 403)
  assert.equal((await post(env, '/visit', visit, { type: 'text/plain' })).status, 415)
  assert.equal((await post(env, '/visit', visit, { type: 'application/jsonx' })).status, 415)
  assert.equal((await post(env, '/visit', visit, { type: 'application/json; charset=utf-8' })).status, 200)
  assert.equal((await call(env, '/visit')).status, 404)
  assert.equal((await post(env, '/admin', visit)).status, 404)
})

test('bodies are bounded while streaming; aborted, malformed and invalid input is refused', { timeout: 10_000 }, async () => {
  const { env } = await makeEnv()
  let pulled = 0
  const endless = new ReadableStream({ pull(controller) { pulled += 1024; controller.enqueue(new Uint8Array(1024).fill(0x20)) } })
  assert.equal((await post(env, '/note', endless)).status, 413)
  assert.ok(pulled <= LIMITS.bodyBytes + 4 * 1024, `read ${pulled} bytes of an endless body`)
  assert.equal((await post(env, '/visit', ' '.repeat(LIMITS.bodyBytes + 1))).status, 413)

  const aborted = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('{"session":')) },
    pull(controller) { controller.error(new Error('connection reset')) },
  })
  assert.equal((await post(env, '/note', aborted)).status, 400)

  const session = newSession()
  const invalid = ['', '{', 'null', '[]', '"text"', new Uint8Array([0x7b, 0xff, 0x7d]),
    { session: '------------------------------------', zone: 'work' },
    { session: 'zzzzzzzz-zzzz-4zzz-8zzz-zzzzzzzzzzzz', zone: 'work' },
    { session: `${session}0`, zone: 'work' },
    { session, zone: 'basement' }, { session, zone: ['work'] }, { session: [session], zone: 'work' }, { session }]
  for (const body of invalid) assert.equal((await post(env, '/visit', body)).status, 400, String(JSON.stringify(body)))
  assert.equal((await post(env, '/visit', { session, zone: 'work' })).status, 200)
  assert.equal(total((await summaryOf(env)).days), 1)
})

test('notes are plain, bounded text', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const { env } = await makeEnv()
  const rejected = [
    { message: 'bell\u0007' }, { message: '\u001b[31mred' }, { message: 'abc‮txt.exe' }, { message: 'broken \uD800 pair' },
    { message: 'x' }, { message: '     ' }, { message: 'y'.repeat(LIMITS.messageChars + 1) }, { message: 42 }, {},
    { name: 'n'.repeat(LIMITS.nameChars + 1), message: 'Hello' }, { name: 5, message: 'Hello' }, { name: 'Nul\u0000', message: 'Hello' },
  ]
  for (const fields of rejected) assert.equal((await post(env, '/note', { session: newSession(), ...fields })).status, 400, JSON.stringify(fields))

  const waves = '🌊'.repeat(LIMITS.messageChars) // counted as characters, not UTF-16 units
  assert.equal((await post(env, '/note', { session: newSession(), name: 'Sea', message: waves })).status, 201)
  t.mock.timers.setTime(NOON + 1000)
  const created = await post(env, '/note', { session: newSession(), name: '  ', message: '  Hello\n\tthere  ' })
  assert.equal(created.status, 201)
  assert.deepEqual(await created.json(), { ok: true, local: true })
  const { notes } = await summaryOf(env)
  assert.deepEqual(notes.map(({ name, message }) => ({ name, message })), [{ name: 'A visitor', message: 'Hello there' }, { name: 'Sea', message: waves }])
  assert.deepEqual(Object.keys(notes[0]).sort(), ['id', 'message', 'name'])
})

test('live notes stay pending until approved; local approval needs LOCAL_PREVIEW on loopback', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const { db, env } = await makeEnv()
  const closed = { ...env, LOCAL_PREVIEW: undefined }
  assert.equal((await post(closed, '/visit', { session: newSession(), zone: 'work' })).status, 403)
  assert.equal((await post(closed, '/note', { session: newSession(), message: 'Hello' })).status, 403)
  // A LOCAL_PREVIEW setting that leaks into a deployment neither opens writes nor approves notes.
  const leaked = { host: 'hall.example.workers.dev' }
  assert.equal((await post(env, '/note', { session: newSession(), message: 'Hello' }, leaked)).status, 403)
  assert.equal((await summaryOf(env, leaked)).mode, 'live')

  const live = { ...env, LOCAL_PREVIEW: undefined, PUBLIC_WRITES: '1' }
  const pending = await post(live, '/note', { session: newSession(), name: 'Rin', message: 'Waiting for review' })
  assert.equal(pending.status, 201)
  assert.deepEqual(await pending.json(), { ok: true, local: false })
  let data = await summaryOf(live)
  assert.equal(data.mode, 'live')
  assert.deepEqual(data.notes, [])
  db.prepare('UPDATE notes SET approved = 1 WHERE message = ?').run('Waiting for review') // the documented moderation step
  assert.deepEqual((await summaryOf(live)).notes.map(note => note.message), ['Waiting for review'])

  for (let i = 0; i < 13; i++) {
    t.mock.timers.setTime(NOON + (i + 1) * 1000)
    assert.equal((await post(env, '/note', { session: newSession(), message: `Local note ${i}` })).status, 201)
  }
  data = await summaryOf(env)
  assert.equal(data.mode, 'local')
  assert.equal(data.notes.length, LIMITS.notes)
  assert.equal(data.notes[0].message, 'Local note 12')
})

test('note throttles hold under concurrent requests and reset on the next UTC day', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const { env } = await makeEnv()
  const statuses = responses => responses.map(response => response.status)
  const count = (list, status) => list.filter(value => value === status).length

  const session = newSession()
  const same = statuses(await Promise.all(Array.from({ length: 10 }, (_, i) => post(env, '/note', { session, message: `Same browser ${i}` }))))
  assert.equal(count(same, 201), LIMITS.notesPerSessionPerDay)
  assert.equal(count(same, 429), 10 - LIMITS.notesPerSessionPerDay)

  const crowd = statuses(await Promise.all(Array.from({ length: LIMITS.notesPerDay + 10 }, (_, i) => post(env, '/note', { session: newSession(), message: `Crowd ${i}` }))))
  assert.equal(count(crowd, 201), LIMITS.notesPerDay - LIMITS.notesPerSessionPerDay)
  assert.equal(count(crowd, 429), 10 + LIMITS.notesPerSessionPerDay)

  t.mock.timers.setTime(Date.parse('2026-03-11T00:00:01Z'))
  assert.equal((await post(env, '/note', { session, message: 'A new day' })).status, 201)
})

test('retention bounds visits, presence and pending notes but keeps approved notes', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const { db, env } = await makeEnv()
  const live = { ...env, LOCAL_PREVIEW: undefined, PUBLIC_WRITES: '1' }
  await post(env, '/visit', { session: newSession(), zone: 'work' })
  await post(env, '/note', { session: newSession(), message: 'Approved locally' })
  await post(live, '/note', { session: newSession(), message: 'Never reviewed' })
  const rows = table => db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n

  t.mock.timers.setTime(NOON + 2 * DAY)
  await worker.scheduled({}, env)
  assert.deepEqual([rows('visit_days'), rows('presence'), rows('notes')], [1, 0, 2])

  t.mock.timers.setTime(NOON + 31 * DAY)
  await worker.scheduled({}, env)
  assert.deepEqual([rows('visit_days'), rows('presence')], [0, 0])
  assert.deepEqual(db.prepare('SELECT message FROM notes').all().map(row => row.message), ['Approved locally'])
})

test('an old local database is migrated in place without losing or double counting visits', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: NOON })
  const db = new DatabaseSync(':memory:')
  db.exec(`CREATE TABLE visits (session TEXT PRIMARY KEY, day TEXT NOT NULL, country TEXT NOT NULL, zone TEXT NOT NULL, last_seen INTEGER NOT NULL);
    CREATE INDEX visits_day ON visits(day);
    CREATE TABLE notes (id TEXT PRIMARY KEY, session TEXT NOT NULL, name TEXT NOT NULL, message TEXT NOT NULL, created INTEGER NOT NULL, approved INTEGER NOT NULL DEFAULT 0);`)
  const [a, b, c] = [newSession(), newSession(), newSession()]
  const add = db.prepare('INSERT INTO visits VALUES (?, ?, ?, ?, ?)')
  add.run(a, '2026-03-10', '??', 'work', NOON - 60_000)
  add.run(b, '2026-03-10', '??', 'about', NOON - 120_000)
  add.run(c, '2026-03-09', '??', 'entrance', NOON - DAY)
  db.prepare('INSERT INTO notes VALUES (?, ?, ?, ?, ?, 1)').run('old-note', a, 'Old', 'Still here', NOON - DAY)

  assert.equal(await prepareDatabase(db), 3)
  const env = { DB: createD1(db), LOCAL_PREVIEW: '1', ALLOWED_ORIGINS: ORIGIN }
  await post(env, '/visit', { session: a, zone: 'contact' }) // same browser returns the same day
  const data = await summaryOf(env)
  assert.deepEqual(data.days.slice(-2), [{ day: '2026-03-09', visits: 1 }, { day: '2026-03-10', visits: 2 }])
  assert.deepEqual(data.visits, [{ country: '??', zone: 'contact' }, { country: '??', zone: 'about' }])
  assert.deepEqual(data.notes.map(note => note.message), ['Still here'])
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM visits_legacy_v1').get().n, 3, 'old rows are kept')
  assert.equal(await prepareDatabase(db), 0, 'migration runs once')
})

test('an unexpected table shape stops the local database instead of miscounting', async () => {
  const db = new DatabaseSync(':memory:')
  db.exec('CREATE TABLE presence (visitor TEXT PRIMARY KEY, zone TEXT)')
  await assert.rejects(prepareDatabase(db), /presence is missing country, last_seen/)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'visit_days'").get().n, 0, 'nothing was changed')
  db.close()
  const badKey = new DatabaseSync(':memory:')
  badKey.exec('CREATE TABLE visit_days (day TEXT NOT NULL, visitor TEXT NOT NULL)')
  await assert.rejects(prepareDatabase(badKey), /unexpected primary key/)
  assert.equal(badKey.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'notes'").get().n, 0)
  badKey.close()
  const badLegacy = new DatabaseSync(':memory:')
  badLegacy.exec('CREATE TABLE visits (session TEXT PRIMARY KEY, day TEXT)')
  await assert.rejects(prepareDatabase(badLegacy), /visits is missing country, zone, last_seen/)
  assert.equal(badLegacy.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'visit_days'").get().n, 0)
  badLegacy.close()
})

function httpCall(port, { method = 'GET', path = '/summary', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest({ host: '127.0.0.1', port, method, path, headers, agent: false }, response => {
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve({ status: response.statusCode, text: Buffer.concat(chunks).toString('utf8') }))
    })
    request.on('error', reject)
    request.end(body)
  })
}

function abortedUpload(port) {
  return new Promise(resolve => {
    const headers = { Origin: ORIGIN, 'Content-Type': 'application/json', 'Content-Length': '500' }
    const request = httpRequest({ host: '127.0.0.1', port, method: 'POST', path: '/note', headers, agent: false })
    request.on('error', () => {})
    request.on('close', () => setTimeout(resolve, 50))
    request.write('{"session":', () => setTimeout(() => request.destroy(), 20))
  })
}

test('local server listens on loopback only, bounds bodies, survives aborted uploads and closes cleanly', async t => {
  const dir = mkdtempSync(join(tmpdir(), 'hall-community-'))
  const dbPath = join(dir, 'wall.sqlite')
  let service = await startServer({ port: 0, dbPath, log: () => {} })
  t.after(async () => { await service.close(); rmSync(dir, { recursive: true, force: true }) })
  assert.equal(service.server.address().address, '127.0.0.1')

  const write = { Origin: ORIGIN, 'Content-Type': 'application/json' }
  const visit = JSON.stringify({ session: newSession(), zone: 'work' })
  assert.equal((await httpCall(service.port, { method: 'POST', path: '/visit', headers: write, body: visit })).status, 200)
  assert.equal((await httpCall(service.port, { method: 'POST', path: '/note', headers: write, body: 'x'.repeat(20_000) })).status, 413)
  assert.equal((await httpCall(service.port, { method: 'DELETE', path: '/summary' })).status, 405)
  await abortedUpload(service.port)
  const summary = await httpCall(service.port)
  assert.equal(summary.status, 200)
  assert.equal(JSON.parse(summary.text).mode, 'local')

  await service.close()
  assert.equal(service.server.listening, false)
  service = await startServer({ port: 0, dbPath, log: () => {} })
  assert.equal(total(JSON.parse((await httpCall(service.port)).text).days), 1, 'data persists in the configured file')
})
