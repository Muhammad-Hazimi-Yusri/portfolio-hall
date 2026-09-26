/// <reference lib="es2021.intl" />
export const visitorZones = ['entrance', 'work', 'projects', 'about', 'contact'] as const
export type VisitorZone = typeof visitorZones[number]
export type HallVisit = { country: string; zone: VisitorZone }
export type GuestbookIntent = 'read' | 'write' | 'visitors' | 'analytics'
export type WallNote = { id: string; name: string; message: string }
export type Community = {
  mode: 'offline' | 'local' | 'live'
  days: { day: string; visits: number }[]
  visits: HallVisit[]
  notes: WallNote[]
  total: number
}
export const emptyCommunity: Community = { mode: 'offline', days: [], visits: [], notes: [], total: 0 }

/** Bound all public data before it reaches text textures or scene geometry. */
export function readCommunity(value: unknown): Community {
  if (!value || typeof value !== 'object') return emptyCommunity
  const input = value as Record<string, unknown>
  if (input.mode !== 'local' && input.mode !== 'live') return emptyCommunity
  const rows = (key: string) => (Array.isArray(input[key]) ? input[key].slice(0, 100) : []).filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === 'object')
  const counts = new Map<string, number>()
  for (const row of rows('days')) {
    if (typeof row.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.day)) continue
    const date = new Date(`${row.day}T00:00:00Z`)
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== row.day) continue
    if (typeof row.visits !== 'number' || !Number.isFinite(row.visits)) continue
    counts.set(row.day, Math.min(1_000_000, Math.max(0, Math.floor(row.visits))))
  }
  const days = [...counts].sort(([a], [b]) => a.localeCompare(b)).slice(-28).map(([day, visits]) => ({ day, visits }))
  const cleanText = (value: string, limit: number) => value.replace(/\p{Cc}/gu, ' ').trim().slice(0, limit)
  return {
    mode: input.mode, days, total: days.reduce((sum, row) => sum + row.visits, 0),
    visits: rows('visits').filter(row => row && visitorZones.includes(row.zone as VisitorZone)).slice(0, 12).map(row => ({ country: typeof row.country === 'string' && /^[A-Z]{2}$/.test(row.country) ? row.country : '??', zone: row.zone as VisitorZone })),
    notes: rows('notes').filter(row => typeof row.message === 'string' && row.message.trim()).slice(0, 12).map((row, index) => ({ id: `${index}-${typeof row.id === 'string' ? row.id.slice(0, 48) : ''}`, name: typeof row.name === 'string' ? cleanText(row.name, 32) || 'A visitor' : 'A visitor', message: cleanText(row.message as string, 180) })),
  }
}

export function visitPosition(visit: HallVisit, index: number) {
  // Keep the entrance fleet beside the approach so more of it stays visible
  // above the lower edge of a short desktop pane.
  const z = { entrance: 3, work: 16, projects: 37, about: 68, contact: 86 }[visit.zone]
  const column = index % 3, row = Math.floor(index / 3)
  return {
    x: 8.1 + column * 2.05 + (row % 2) * .55 + Math.sin(index * 2.4) * .18,
    z: z - 3.6 + row * 2.65 + column * .36 + Math.cos(index * 1.9) * .22,
    heading: -.22 + Math.sin(index * 1.73) * .34,
  }
}

export function ridgeHeights(days: Community['days']) {
  const counts = Array.from({ length: 28 }, (_, index) => days[index]?.visits ?? 0)
  const maximum = Math.max(1, ...counts)
  return counts.map(count => count / maximum * 12)
}

const countryNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null
export const countryLabel = (code: string) => code === '??' ? 'Unknown country' : countryNames?.of(code) ?? code
export const zoneLabel: Record<VisitorZone, string> = { entrance: 'Entrance', work: 'Work', projects: 'Projects', about: 'Experience', contact: 'Contact' }
