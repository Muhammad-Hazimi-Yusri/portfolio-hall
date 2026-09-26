import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import type { PointerEvent, RefObject } from 'react'
import { countryLabel, zoneLabel } from '@/data/community'
import type { Community, GuestbookIntent } from '@/data/community'
import { countryFlagUrl } from '@/data/countryFlags'

type Props = {
  community: Community
  connected: boolean
  localPreview: boolean
  refresh: () => Promise<void>
  leaveNote: (name: string, message: string) => Promise<string>
  embedded?: boolean
  focusRequest?: { intent: GuestbookIntent; key: number }
  onReveal?: (element: HTMLElement) => void
  onDaySelect?: (day: string | null) => void
}
const draftKey = 'balairung-note-draft'
function savedDraft() {
  try {
    const value = JSON.parse(sessionStorage.getItem(draftKey) || '{}')
    return { name: typeof value?.name === 'string' ? value.name.slice(0, 32) : '', message: typeof value?.message === 'string' ? value.message.slice(0, 180) : '' }
  } catch { return { name: '', message: '' } }
}

// Browse and walking mode share one draft and pending send in this tab. Closing
// a modal must not lose its reply or allow a second submission while it is busy.
let noteState = { draft: savedDraft(), status: '', sending: false }
const draftListeners = new Set<() => void>()
const getNoteState = () => noteState
const subscribeToDraft = (listener: () => void) => { draftListeners.add(listener); return () => { draftListeners.delete(listener) } }
function updateNoteState(update: Partial<typeof noteState>) {
  noteState = { ...noteState, ...update }
  if (update.draft) try {
    if (noteState.draft.name || noteState.draft.message) sessionStorage.setItem(draftKey, JSON.stringify(noteState.draft))
    else sessionStorage.removeItem(draftKey)
  } catch { /* The shared draft still works when browser storage is unavailable. */ }
  draftListeners.forEach(listener => listener())
}

function VisitorChart({ community, boatsRef, chartRef, onDaySelect, landscapeActive }: { community: Community; boatsRef: RefObject<HTMLHeadingElement>; chartRef: RefObject<HTMLHeadingElement>; onDaySelect?: Props['onDaySelect']; landscapeActive: boolean }) {
  const fleetId = useId()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const maximum = Math.max(1, ...community.days.map(day => day.visits))
  const visitLabel = community.total === 1 ? 'visit' : 'visits'
  const intervals = Math.max(1, community.days.length - 1)
  const dayX = (index: number) => community.days.length > 1 ? 12 + index * 336 / intervals : 180
  const points = community.days.map((day, index) => `${dayX(index)},${90 - day.visits / maximum * 66}`)
  const selectedIndex = Math.max(0, selectedDate && community.days.some(day => day.day === selectedDate) ? community.days.findIndex(day => day.day === selectedDate) : community.days.length - 1)
  const selected = community.days[selectedIndex]
  useEffect(() => { onDaySelect?.(selected?.day ?? null) }, [selected?.day, onDaySelect])
  const selectDay = (index: number) => setSelectedDate(community.days[index]?.day ?? null)
  const selectAt = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) * 360 / bounds.width
    selectDay(Math.min(community.days.length - 1, Math.max(0, Math.round((x - 12) / 336 * intervals))))
  }
  const dateLabel = (day?: string) => day ? new Date(`${day}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : ''
  return <figure className="visitor-chart">
    <figcaption><div><h3 ref={chartRef} tabIndex={-1}>Visits by day</h3><span>Past 28 days · UTC{community.mode === 'local' ? ' · Local preview' : ''}</span></div><strong>{community.total.toLocaleString()} <span>{visitLabel}</span></strong></figcaption>
    {onDaySelect && !landscapeActive && <a className="visitor-landscape-link" href="#guestbook/analytics">View the visitor landscape <span aria-hidden="true">↗</span></a>}
    <svg viewBox="0 0 360 112" role="img" aria-label={`${community.total} ${visitLabel} in the past 28 days; daily peak ${community.total ? maximum : 0}.${community.days.length > 1 ? ' Choose a day with the selector below for its exact count.' : ''}`} onPointerDown={selectAt} onPointerMove={event => { if (event.pointerType === 'mouse') selectAt(event) }}>
      <path className="visitor-chart-grid" d="M12 24H348M12 90H348" />
      {points.length > 1 && <><path className="visitor-chart-area" d={`M12 90L${points.join('L')}L348 90Z`} /><polyline className="visitor-chart-line" points={points.join(' ')} /></>}
      {selected && <g className="visitor-chart-selection"><path d={`M${dayX(selectedIndex)} 24V90`} /><circle cx={dayX(selectedIndex)} cy={90 - selected.visits / maximum * 66} r="3.5" /></g>}
      <text x="12" y="15">{community.total ? maximum : 0} / day</text><text x={dayX(0)} y="108" textAnchor={community.days.length === 1 ? 'middle' : 'start'}>{dateLabel(community.days[0]?.day)}</text>{community.days.length > 1 && <text x="348" y="108" textAnchor="end">{dateLabel(community.days[community.days.length - 1]?.day)}</text>}
    </svg>
    {selected && <div className="visitor-day-inspector">
      <div className="visitor-day-readout"><time dateTime={selected.day}>{dateLabel(selected.day)}</time><strong>{selected.visits.toLocaleString()} {selected.visits === 1 ? 'visit' : 'visits'}</strong></div>
      {community.days.length > 1 ? <><input type="range" aria-label="Day in visitor history" aria-valuetext={`${dateLabel(selected.day)}, ${selected.visits} ${selected.visits === 1 ? 'visit' : 'visits'}`} min="0" max={community.days.length - 1} step="1" value={selectedIndex} onChange={event => selectDay(Number(event.target.value))} /><span>Choose a day to inspect its count.</span></> : <span>One recorded day.</span>}
    </div>}
    <p className="content-note">Each contour in the landscape represents a day. Its height follows that day’s count, with the busiest day forming the highest ridge. One visit is counted per browser session per day.</p>
    <section className="visitor-fleet" aria-labelledby={fleetId}>
      <div className="visitor-fleet-heading"><h3 ref={boatsRef} id={fleetId} tabIndex={-1}>Recent boats</h3><span>{community.visits.length} {community.visits.length === 1 ? 'visit' : 'visits'}</span></div>
      <p>{community.mode === 'local' ? 'Local preview. ' : ''}Each boat marks a recent browser session, placed by its last recorded section. These are visits from the past day, not people online now.</p>
      {community.visits.length ? <ul>{community.visits.map((visit, index) => {
        const flag = countryFlagUrl(visit.country)
        return <li key={index}><span className="visitor-fleet-number">{String(index + 1).padStart(2, '0')}</span><span className="visitor-fleet-country">{flag ? <img src={flag} width="24" height="18" alt="" loading="lazy" /> : <span className="visitor-flag-unknown" aria-hidden="true">—</span>}{countryLabel(visit.country)}</span><a href={visit.zone === 'entrance' ? '#' : `#${visit.zone}`}>{zoneLabel[visit.zone]} <span aria-hidden="true">↗</span></a></li>
      })}</ul> : <p>No recent visits are recorded.</p>}
    </section>
    {!!community.days.length && <details className="visitor-details"><summary>Daily counts & how visits are counted</summary>
      <div className="visitor-day-list">{community.days.map(day => <div key={day.day}><time dateTime={day.day}>{dateLabel(day.day)}</time><span>{day.visits}</span></div>)}</div>
      <p>Flags show countries; a dash means unknown. A country code appears on a boat if its flag is unavailable.</p>
      <p>A random identifier stays in this tab. The service uses hashed keys to count daily visits and remembers each recent visitor’s country and last section. Visits do not store names, IP addresses or a path through the hall. Do Not Track and Global Privacy Control skip visit collection.</p>
    </details>}
  </figure>
}

function reveal(element: HTMLElement) {
  element.scrollIntoView({ block: 'start', behavior: 'instant' })
  element.focus({ preventScroll: true })
}

export default function VisitorBook({ community, connected, localPreview, refresh, leaveNote, embedded = false, focusRequest, onReveal = reveal, onDaySelect }: Props) {
  const { draft, status, sending } = useSyncExternalStore(subscribeToDraft, getNoteState)
  const id = useId(), headingRef = useRef<HTMLHeadingElement>(null), noteRef = useRef<HTMLTextAreaElement>(null)
  const analyticsRef = useRef<HTMLDetailsElement>(null), boatsRef = useRef<HTMLHeadingElement>(null), chartRef = useRef<HTMLHeadingElement>(null)
  const intent = focusRequest?.intent, requestKey = focusRequest?.key
  const visitsReady = (intent === 'visitors' || intent === 'analytics') && community.mode !== 'offline'
  useEffect(() => {
    if ((intent === 'visitors' || intent === 'analytics') && analyticsRef.current) analyticsRef.current.open = true
    const target = intent === 'analytics' ? chartRef.current ?? headingRef.current : intent === 'visitors' ? boatsRef.current ?? headingRef.current : intent === 'write' ? noteRef.current : intent === 'read' ? headingRef.current : null
    if (target) onReveal(target)
  }, [intent, requestKey, onReveal, visitsReady])
  const Heading = embedded ? 'h3' : 'h2'
  return <section className={`visitor-book${embedded ? ' visitor-book-embedded' : ''}`} aria-labelledby={`${id}-heading`}>
    <div className="visitor-book-heading"><div>{!embedded && <p className="panel-kicker">Visitors</p>}<Heading ref={headingRef} tabIndex={-1} id={`${id}-heading`}>{embedded ? 'Visitor notes' : 'The guestbook'}</Heading></div><button type="button" onClick={() => { if (noteRef.current) onReveal(noteRef.current) }}>Write a note <span aria-hidden="true">↘</span></button></div>
    {(localPreview || community.mode === 'local') && <p className="community-status">Local preview · these visits and notes are not public.</p>}
    {!connected && <div className="community-status"><p>{community.mode === 'offline' ? 'The guestbook is not connected. You can write a draft while it is offline.' : 'Connection lost. Showing the last visitor log received.'}</p><button type="button" onClick={() => void refresh()}>Retry connection</button></div>}
    {community.notes.length ? <div className="wall-notes" aria-label="Notes from visitors">{community.notes.map((note, index) => <blockquote key={note.id}><span className="wall-note-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{note.message}</p><cite>{note.name}</cite></blockquote>)}</div> : connected && <p className="guestbook-empty">No notes here yet. You can leave the first.</p>}
    <form onSubmit={async event => {
      event.preventDefault()
      if (noteState.sending || !draft.message.trim()) return
      updateNoteState({ sending: true, status: '' })
      try { updateNoteState({ status: await leaveNote(draft.name, draft.message), draft: { ...draft, message: '' } }) }
      catch (error) { updateNoteState({ status: error instanceof Error ? error.message : 'Could not send. Your draft is still here.' }) }
      finally { updateNoteState({ sending: false }) }
    }}>
      <h3>Leave a note</h3><p>A thought about a project, or a hello.</p>
      <label>Your name <span>(optional)</span><input value={draft.name} onChange={event => updateNoteState({ status: '', draft: { ...draft, name: event.target.value } })} disabled={sending} maxLength={32} autoComplete="nickname" /></label>
      <label>Your note<textarea ref={noteRef} value={draft.message} onChange={event => updateNoteState({ status: '', draft: { ...draft, message: event.target.value } })} disabled={sending} maxLength={180} minLength={2} required rows={4} aria-describedby={`${id}-privacy`} /></label>
      <div className="note-submit"><button className="solid-link" disabled={sending || !connected || draft.message.trim().length < 2}>{sending ? 'Sending…' : community.mode === 'local' ? 'Add to local wall' : 'Leave a note'}</button><span>{draft.message.length} / 180</span></div>
      <p id={`${id}-privacy`} className="content-note">Public notes are reviewed first. Please leave out private information. Unsent text stays in this tab.</p>
      <p role="status" className="note-status">{status}</p>
    </form>
    {community.mode !== 'offline' && <details ref={analyticsRef} className="guestbook-analytics"><summary>Visitor log <span>{community.total.toLocaleString()} {community.total === 1 ? 'visit' : 'visits'} · past 28 days</span></summary><VisitorChart community={community} boatsRef={boatsRef} chartRef={chartRef} onDaySelect={onDaySelect} landscapeActive={intent === 'analytics'} /></details>}
  </section>
}
