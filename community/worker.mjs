// Visitor wall for the portfolio hall: an honest 28-day count of browser sessions, a few
// recent "boats" and moderated notes. Runs as a Cloudflare Worker with a D1 binding named DB,
// or locally through tools/community-local.mjs. Storage and limits are described in README.md.

export const ZONES = Object.freeze(['entrance', 'work', 'projects', 'about', 'contact'])
export const LIMITS = Object.freeze({
  bodyBytes: 4096, // largest accepted JSON body, enforced while the body streams in
  days: 28, // daily counts returned, oldest first, today (UTC) last
  boats: 12, // most recently active sessions from the last 24 hours
  notes: 12, // newest approved notes
  visitsPerDay: 5000, // storage bound: a day's count stops rising here
  notesPerSessionPerDay: 3,
  notesPerDay: 100,
  pendingNoteDays: 30,
  nameChars: 32,
  messageChars: 180,
})

const DAY = 86_400_000
const zoneSet = new Set(ZONES)
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]'])
// Checked after whitespace is collapsed: remaining C0/C1 controls and bidi overrides/isolates.
const FORBIDDEN_TEXT = /[\p{Cc}‪-‮⁦-⁩]/u

const SQL = {
  // Each write is one conditional statement, so concurrent requests cannot pass a cap together.
  countVisit: `INSERT INTO visit_days (day, visitor) SELECT ?1, ?2
    WHERE NOT EXISTS (SELECT 1 FROM visit_days WHERE day = ?1 AND visitor = ?2)
      AND (SELECT COUNT(*) FROM visit_days WHERE day = ?1) < ?3`,
  touchPresence: `INSERT INTO presence (visitor, country, zone, last_seen) SELECT ?1, ?2, ?3, ?4
    WHERE EXISTS (SELECT 1 FROM visit_days WHERE day = ?5 AND visitor = ?6)
    ON CONFLICT (visitor) DO UPDATE SET country = excluded.country, zone = excluded.zone, last_seen = excluded.last_seen`,
  addNote: `INSERT INTO notes (id, session, name, message, created, approved) SELECT ?1, ?2, ?3, ?4, ?5, ?6
    WHERE (SELECT COUNT(*) FROM notes WHERE session = ?2 AND created >= ?7) < ?8
      AND (SELECT COUNT(*) FROM notes WHERE created >= ?7) < ?9`,
  daily: 'SELECT day, COUNT(*) AS visits FROM visit_days WHERE day >= ?1 GROUP BY day',
  boats: 'SELECT country, zone FROM presence WHERE last_seen > ?1 ORDER BY last_seen DESC LIMIT ?2',
  notes: 'SELECT id, name, message FROM notes WHERE approved = 1 ORDER BY created DESC LIMIT ?1',
}

const isoDay = ms => new Date(ms).toISOString().slice(0, 10)
const startOfDay = ms => ms - (ms % DAY)
const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value)
export const validSession = value => typeof value === 'string' && UUID.test(value)

export async function hashKey(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
// Raw session IDs are never stored. Daily keys differ per UTC date, so days cannot be linked.
export const visitorKey = (day, session) => hashKey(`visit:${day}:${session.toLowerCase()}`)
export const presenceKey = session => hashKey(`presence:${session.toLowerCase()}`)
const noteKey = (day, session) => hashKey(`note:${day}:${session.toLowerCase()}`)

function cleanText(value, maxChars) {
  if (typeof value !== 'string' || !value.isWellFormed()) return null
  const text = value.normalize('NFC').replace(/\s+/gu, ' ').trim()
  if (FORBIDDEN_TEXT.test(text) || [...text].length > maxChars) return null
  return text
}

export function parseVisit(input) {
  if (!isRecord(input) || !validSession(input.session) || typeof input.zone !== 'string' || !zoneSet.has(input.zone)) return null
  return { session: input.session.toLowerCase(), zone: input.zone }
}

export function parseNote(input) {
  if (!isRecord(input) || !validSession(input.session)) return null
  if (input.name != null && typeof input.name !== 'string') return null
  const message = cleanText(input.message, LIMITS.messageChars)
  const name = cleanText(input.name ?? '', LIMITS.nameChars)
  if (message === null || name === null || [...message].length < 2) return null
  return { session: input.session.toLowerCase(), name: name || 'A visitor', message }
}

function allowedOrigins(setting) {
  const origins = new Set()
  for (const entry of String(setting || '').split(',')) {
    const origin = entry.trim()
    // Only exact origins (scheme://host[:port], no path or trailing slash) are honoured.
    try { if (origin && new URL(origin).origin === origin) origins.add(origin) } catch { /* ignored */ }
  }
  return origins
}

const isJson = request => (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase() === 'application/json'

// Reads at most LIMITS.bodyBytes from the stream; never buffers an unbounded body.
async function readJson(request) {
  if (Number(request.headers.get('Content-Length')) > LIMITS.bodyBytes) return { status: 413 }
  if (!request.body) return { status: 400 }
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  try {
    for (let part = await reader.read(); !part.done; part = await reader.read()) {
      size += part.value.byteLength
      if (size > LIMITS.bodyBytes) {
        reader.cancel().catch(() => {})
        return { status: 413 }
      }
      chunks.push(part.value)
    }
  } catch {
    return { status: 400 } // body aborted or unreadable
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  try { return { value: JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) } } catch { return { status: 400 } }
}

async function summary(db, now, local) {
  const today = startOfDay(now)
  const [daily, boats, notes] = await db.batch([
    db.prepare(SQL.daily).bind(isoDay(today - (LIMITS.days - 1) * DAY)),
    db.prepare(SQL.boats).bind(now - DAY, LIMITS.boats),
    db.prepare(SQL.notes).bind(LIMITS.notes),
  ])
  const counts = new Map(daily.results.map(row => [row.day, Number(row.visits)]))
  const days = Array.from({ length: LIMITS.days }, (_, index) => {
    const day = isoDay(today - (LIMITS.days - 1 - index) * DAY)
    return { day, visits: counts.get(day) ?? 0 }
  })
  return {
    mode: local ? 'local' : 'live',
    days,
    visits: boats.results.map(({ country, zone }) => ({ country, zone })),
    notes: notes.results.map(({ id, name, message }) => ({ id, name, message })),
  }
}

async function recordVisit(db, input, cf, now) {
  const visit = parseVisit(input)
  if (!visit) return [{ error: 'Invalid visit.' }, 400]
  // Country comes only from Cloudflare request metadata, never from the client body.
  const country = typeof cf?.country === 'string' && /^[A-Z]{2}$/.test(cf.country) ? cf.country : '??'
  const day = isoDay(now)
  const [visitor, presence] = await Promise.all([visitorKey(day, visit.session), presenceKey(visit.session)])
  await db.batch([
    db.prepare(SQL.countVisit).bind(day, visitor, LIMITS.visitsPerDay),
    // Latest section only, time rounded to the minute: no movement trail is kept.
    db.prepare(SQL.touchPresence).bind(presence, country, visit.zone, now - (now % 60_000), day, visitor),
  ])
  return [{ ok: true }, 200]
}

async function addNote(db, input, now, local) {
  const note = parseNote(input)
  if (!note) return [{ error: `Use a name of up to ${LIMITS.nameChars} characters and a note of 2–${LIMITS.messageChars} characters, as plain text.` }, 400]
  const author = await noteKey(isoDay(now), note.session)
  const result = await db.prepare(SQL.addNote)
    .bind(crypto.randomUUID(), author, note.name, note.message, now, local ? 1 : 0, startOfDay(now), LIMITS.notesPerSessionPerDay, LIMITS.notesPerDay)
    .run()
  if (!result?.meta?.changes) return [{ error: 'The wall has reached its note limit for now. Please try tomorrow.' }, 429]
  return [{ ok: true, local }, 201]
}

export async function applyRetention(db, now = Date.now()) {
  await db.batch([
    db.prepare('DELETE FROM visit_days WHERE day < ?1').bind(isoDay(startOfDay(now) - (LIMITS.days - 1) * DAY)),
    db.prepare('DELETE FROM presence WHERE last_seen <= ?1').bind(now - DAY),
    db.prepare('DELETE FROM notes WHERE approved = 0 AND created < ?1').bind(now - LIMITS.pendingNoteDays * DAY),
  ])
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin')
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' }
    const reply = (value, status = 200) => new Response(JSON.stringify(value), { status, headers })
    if (origin !== null) {
      if (!allowedOrigins(env.ALLOWED_ORIGINS).has(origin)) return reply({ error: 'Origin not allowed.' }, 403)
      headers['Access-Control-Allow-Origin'] = origin
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...headers, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } })
    }
    // LOCAL_PREVIEW only takes effect on a loopback host, so a leaked setting cannot auto-approve live notes.
    const local = env.LOCAL_PREVIEW === '1' && LOOPBACK.has(url.hostname)
    const now = Date.now()
    try {
      if (request.method === 'GET' && url.pathname === '/summary') return reply(await summary(env.DB, now, local))
      if (request.method !== 'POST' || (url.pathname !== '/visit' && url.pathname !== '/note')) return reply({ error: 'Not found.' }, 404)
      if (!local && env.PUBLIC_WRITES !== '1') return reply({ error: 'Visits and notes are not being accepted.' }, 403)
      if (origin === null) return reply({ error: 'Use the portfolio to send a visit or note.' }, 403)
      if (!isJson(request)) return reply({ error: 'Send JSON.' }, 415)
      const body = await readJson(request)
      if (body.status) return reply({ error: body.status === 413 ? 'Message too large.' : 'Invalid message.' }, body.status)
      const [value, status] = url.pathname === '/visit'
        ? await recordVisit(env.DB, body.value, request.cf, now)
        : await addNote(env.DB, body.value, now, local)
      return reply(value, status)
    } catch (error) {
      console.error('Visitor wall error:', error?.message || error)
      return reply({ error: 'The wall is unavailable. Please try again later.' }, 503)
    }
  },
  async scheduled(_event, env) {
    await applyRetention(env.DB)
  },
}
