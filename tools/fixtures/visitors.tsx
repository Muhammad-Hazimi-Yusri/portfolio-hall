import { useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import HallScene from '../../src/components/portfolio/HallScene'
import type { HallScrollFrame } from '../../src/components/portfolio/hallScroll'
import type { SpatialTone } from '../../src/components/portfolio/useSpatialTone'
import type { HallPose } from '../../src/components/portfolio/hallNavigation'
import { emptyCommunity, readCommunity } from '../../src/data/community'
import type { GuestbookIntent } from '../../src/data/community'
import '../../src/components/portfolio/portfolio.css'

const synthetic = readCommunity({
  mode: 'local',
  days: Array.from({ length: 28 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, i + 1)).toISOString().slice(0, 10), visits: [0, 1, 2, 4, 6, 3, 7, 5, 8, 12, 7, 3, 9, 4][i % 14] })),
  visits: Array.from({ length: 12 }, (_, i) => ({ country: ['GB', 'MY', 'JP', '??'][i % 4], zone: 'entrance' })),
  notes: Array.from({ length: 12 }, (_, i) => ({ id: `${i}`, name: `Test visitor ${i + 1}`, message: i === 0 ? '界'.repeat(180) : i === 1 ? 'W'.repeat(180) : 'Synthetic test note. This is a local rendering fixture, not a note from a real visitor. Longer text wraps across the board without escaping its paper panel.' })),
})

export default function VisitorFixture() {
  const [populated, setPopulated] = useState(true)
  const [snapshot, setSnapshot] = useState(synthetic)
  const [refreshes, setRefreshes] = useState(0)
  const [view, setView] = useState('')
  const [ready, setReady] = useState(false)
  const [intent, setIntent] = useState<GuestbookIntent | null>(null)
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => setReady(false), [])
  const onSourceChange = useCallback(() => undefined, [])
  const onExhibitHint = useCallback(() => undefined, [])
  const onFrameImage = useCallback(() => undefined, [])
  const onProjectVideo = useCallback(() => undefined, [])
  const onArchiveState = useCallback(() => undefined, [])
  const onLookChange = useCallback(() => undefined, [])
  const resetLook = useRef<() => void>(() => {})
  const browsePose = useRef<HallPose | null>(null)
  const scrollFrame = useRef<HallScrollFrame | null>(null), audioRef = useRef<SpatialTone | null>(null), worldAction = useRef<string | null>(null)
  return <main className="portfolio">
    <header style={{ padding: 16 }}><strong>Synthetic visitor fixture · local only</strong><p>12 boats, 28 daily counts, 12 notes. No requests to a visitor service.</p><button onClick={() => setPopulated(value => !value)}>{populated ? 'Remove visitors' : 'Restore visitors'}</button> <button onClick={() => setView(view ? '' : 'contact')}>{view ? 'Entrance view' : 'Guestbook view'}</button> <button onClick={() => { setSnapshot(value => structuredClone(value)); setRefreshes(value => value + 1) }}>Refresh unchanged visits</button> <span>{refreshes} refreshes · {ready ? 'Scene ready' : 'Loading scene'}</span></header>
    <section className={`hall-stage${ready ? ' scene-ready' : ''}`} style={{ width: 656, height: 636, maxWidth: '100%' }}>
      <HallScene community={populated ? snapshot : emptyCommunity} view={view} world={null} sourcePosition={0} onSourceChange={onSourceChange} audioRef={audioRef} worldAction={worldAction} scrollFrame={scrollFrame} logosPaused highlightedExperience={null} onReady={onReady} onUnavailable={onUnavailable} browsePose={browsePose} focusedProject={null} onExhibitHint={onExhibitHint} onFrameImage={onFrameImage} onProjectVideo={onProjectVideo} onGuestbook={setIntent} avvrPresentation="model" onArchiveState={onArchiveState} onLookChange={onLookChange} resetLook={resetLook} />
    </section>
    <p role="status">{intent ? `Guestbook action: ${intent}` : 'Select a paper or the board.'}</p>
  </main>
}
if (import.meta.env.DEV) {
  const root = createRoot(document.getElementById('root')!)
  root.render(<VisitorFixture />)
  import.meta.hot?.dispose(() => root.unmount())
}
