import { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import VisitorBook from '../../src/components/portfolio/VisitorBook'
import { readCommunity } from '../../src/data/community'
import '../../src/components/portfolio/portfolio.css'

const community = readCommunity({ mode: 'local', days: [], visits: [], notes: [
  { id: 'wide', name: 'Local fixture — wide text', message: '界'.repeat(180) },
  { id: 'unbroken', name: 'Local fixture — unbroken text', message: 'W'.repeat(180) },
] })
const refresh = async () => undefined
const histories = {
  'Full history': readCommunity({ ...community, days: Array.from({ length: 28 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, i + 1)).toISOString().slice(0, 10), visits: [0, 1, 5, 12, 4, 0, 8][i % 7] })) }),
  'Empty history': readCommunity({ ...community, days: Array.from({ length: 28 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, i + 1)).toISOString().slice(0, 10), visits: 0 })) }),
  'One day': readCommunity({ ...community, days: [{ day: '2026-09-28', visits: 3 }] }),
}

export default function GuestbookFixture() {
  const [open, setOpen] = useState(true), [requests, setRequests] = useState(0), [pending, setPending] = useState(false)
  const [history, setHistory] = useState<keyof typeof histories>('Full history'), [chartRequest, setChartRequest] = useState(0)
  const response = useRef<{ resolve: (text: string) => void; reject: (error: Error) => void } | null>(null)
  const leaveNote = () => new Promise<string>((resolve, reject) => {
    response.current = { resolve, reject }; setPending(true); setRequests(value => value + 1)
  })
  return <main className="portfolio" style={{ maxWidth: 620, margin: '0 auto', padding: 24 }}>
    <h1>Guestbook fixture</h1><p>Local UI checks only. No visitor service or note submission requests.</p>
    <button onClick={() => setOpen(value => !value)}>{open ? 'Close book' : 'Open book'}</button>
    <p>{Object.keys(histories).map(key => <button key={key} onClick={() => { setHistory(key as keyof typeof histories); setChartRequest(value => value + 1) }}>{key}</button>)}</p>
    <p role="status">Simulated submissions: {requests}</p>
    {pending && <><button onClick={() => { response.current?.resolve('Simulated reply: saved locally.'); setPending(false) }}>Complete simulated send</button> <button onClick={() => { response.current?.reject(new Error('Simulated connection failure. Your draft is still here.')); setPending(false) }}>Fail simulated send</button></>}
    {open && <VisitorBook community={histories[history]} connected localPreview refresh={refresh} leaveNote={leaveNote} focusRequest={chartRequest ? { intent: 'analytics', key: chartRequest } : undefined} />}
  </main>
}
if (import.meta.env.DEV) {
  const root = createRoot(document.getElementById('root')!)
  root.render(<GuestbookFixture />)
  import.meta.hot?.dispose(() => root.unmount())
}
