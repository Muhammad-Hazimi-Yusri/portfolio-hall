import { useCallback, useEffect, useRef, useState } from 'react'
import { emptyCommunity, readCommunity, visitorZones } from '@/data/community'
import type { VisitorZone } from '@/data/community'

const localHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)
const localPreview = localHost && new URLSearchParams(window.location.search).get('community') === 'local'
// No service, polling, storage or visit collection on the unconfigured site.
const endpoint = (localPreview ? 'http://127.0.0.1:5190' : import.meta.env.VITE_HALL_COMMUNITY_URL || '').replace(/\/$/, '')
let memorySession: string | undefined
function sessionId() {
  if (memorySession) return memorySession
  try {
    const saved = sessionStorage.getItem('balairung-visit')
    memorySession = saved && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(saved) ? saved : crypto.randomUUID()
    sessionStorage.setItem('balairung-visit', memorySession)
  } catch { memorySession = crypto.randomUUID() }
  return memorySession
}

async function readReply(response: Response): Promise<Record<string, unknown>> {
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Empty response')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    let chunk = await reader.read()
    while (!chunk.done) {
      const { value } = chunk
      size += value.length
      if (size > 32_768) throw new Error('Response too large')
      chunks.push(value)
      chunk = await reader.read()
    }
  } finally { await reader.cancel().catch(() => undefined) }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  const value: unknown = JSON.parse(new TextDecoder().decode(bytes))
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid response')
  return value as Record<string, unknown>
}

export function useCommunity(section: string) {
  const [community, setCommunity] = useState(emptyCommunity)
  const [connected, setConnected] = useState(false)
  const request = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    if (!endpoint || document.hidden || request.current) return
    const controller = new AbortController()
    request.current = controller
    const timeout = window.setTimeout(() => controller.abort(), 6000)
    try {
      const response = await fetch(`${endpoint}/summary`, { credentials: 'omit', signal: controller.signal })
      if (!response.ok) throw new Error('Unavailable')
      const next = readCommunity(await readReply(response))
      if (next.mode === 'offline') throw new Error('Invalid summary')
      if (controller.signal.aborted) return
      setCommunity(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
      setConnected(true)
    } catch { if (request.current === controller) setConnected(false) }
    finally { window.clearTimeout(timeout); if (request.current === controller) request.current = null }
  }, [])
  useEffect(() => {
    if (!endpoint) return
    void refresh()
    const timer = window.setInterval(() => void refresh(), 60_000)
    const visible = () => { if (!document.hidden) void refresh() }
    document.addEventListener('visibilitychange', visible)
    return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', visible); request.current?.abort(); request.current = null }
  }, [refresh])
  useEffect(() => {
    const privacyRequested = navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
    if (!endpoint || privacyRequested) return
    const zone: VisitorZone = visitorZones.includes(section as VisitorZone) ? section as VisitorZone : 'entrance'
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      if (document.hidden) return
      void fetch(`${endpoint}/visit`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: sessionId(), zone }), signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]) }).then(response => { if (response.ok) void refresh() }).catch(() => undefined)
    }, 1500)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [section, refresh])
  const leaveNote = useCallback(async (name: string, message: string) => {
    if (!endpoint) throw new Error('The guestbook is not connected. Your draft is still here.')
    let response: Response, result: Record<string, unknown>
    try {
      response = await fetch(`${endpoint}/note`, { method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: sessionId(), name, message }), signal: AbortSignal.timeout(10_000) })
      result = await readReply(response)
    } catch { throw new Error('Could not reach the guestbook. Your draft is still here; try again when connected.') }
    if (!response.ok || result.ok !== true) throw new Error(typeof result.error === 'string' ? result.error.slice(0, 220) : 'The note could not be sent. Your draft is still here.')
    void refresh()
    return result.local === true ? 'Saved to the local wall. This note is not public.' : 'Thank you. Your note is waiting for review.'
  }, [refresh])
  return { community, connected, enabled: Boolean(endpoint), localPreview, refresh, leaveNote }
}
