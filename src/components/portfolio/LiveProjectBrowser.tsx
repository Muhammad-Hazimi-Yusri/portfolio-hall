import { useEffect, useRef, useState } from 'react'
import type { Project } from '@/data/portfolio'

/** Mount exactly one live site, only after a visitor opens its frame. */
export default function LiveProjectBrowser({ project, expanded, onToggleExpanded, onResumeWalk }: { project: Project; expanded: boolean; onToggleExpanded: () => void; onResumeWalk?: () => void }) {
  // A frame's load event also fires for some blocked/error documents. It only
  // ends the waiting message; recovery controls remain available in every state.
  const [waiting, setWaiting] = useState(true)
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [notice, setNotice] = useState<'loading' | 'help' | null>('loading')
  const frameRef = useRef<HTMLIFrameElement>(null)
  const noticeRef = useRef<HTMLDivElement>(null)
  const reloadRef = useRef<HTMLButtonElement>(null)
  const focusFrameAfterNotice = useRef(false)
  useEffect(() => {
    if (!notice && focusFrameAfterNotice.current) {
      focusFrameAfterNotice.current = false
      frameRef.current?.focus({ preventScroll: true })
    }
  }, [notice])
  useEffect(() => {
    // Replacing the lazy placeholder removes its focused Gallery control.
    // Restore it only if focus was lost, without taking focus from the notes.
    if (document.activeElement === document.body) document.querySelector<HTMLElement>('.live-browser-close')?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    if (!waiting) return
    const timer = window.setTimeout(() => setSlow(true), 10000)
    return () => window.clearTimeout(timer)
  }, [waiting, attempt])
  const url = project.liveApp!.url
  const address = new URL(url)
  const showFrame = () => { focusFrameAfterNotice.current = true; setNotice(null) }
  const reload = () => {
    if (noticeRef.current?.contains(document.activeElement)) reloadRef.current?.focus({ preventScroll: true })
    focusFrameAfterNotice.current = false
    setWaiting(true); setSlow(false); setNotice('loading'); setAttempt(value => value + 1)
  }
  const loaded = () => {
    if (notice === 'loading' && noticeRef.current?.contains(document.activeElement)) focusFrameAfterNotice.current = true
    setWaiting(false); setSlow(false); setNotice(value => value === 'loading' ? null : value)
  }
  const openHelp = () => {
    setNotice('help')
    requestAnimationFrame(() => noticeRef.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true }))
  }
  return <section className="live-project-browser" aria-label={`${project.title} live app`} onKeyDown={event => {
    if (notice && event.key === 'Escape' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      event.preventDefault(); event.stopPropagation(); showFrame()
    }
  }}>
    <header className="live-browser-toolbar">
      {onResumeWalk ? <button className="live-browser-close" onClick={onResumeWalk} aria-label="Close app and resume walk">← Back to walk</button> : <a href={`#gallery/${project.id}`} className="live-browser-close" aria-label="Close app and return to gallery">← Gallery</a>}
      <span className="live-browser-address" title={`App home: ${url}`}><span>{address.hostname}{address.pathname.replace(/\/$/, '')}</span>{waiting && <span className="live-browser-status" role={notice ? undefined : 'status'}>{slow ? 'Still waiting for app…' : 'Opening app…'}</span>}</span>
      <div className="live-browser-actions">
        <button ref={reloadRef} onClick={reload} aria-label="Reload app">Reload</button>
        <button className="live-browser-expand" onClick={onToggleExpanded} aria-label={expanded ? 'Restore app view' : 'Expand app view'} aria-keyshortcuts={expanded ? 'Escape' : undefined} title={expanded ? 'Restore app view (Esc outside the app)' : 'Expand app view'} aria-pressed={expanded}>{expanded ? 'Restore' : 'Expand'}</button>
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} in a new tab`}>Open app ↗</a>
      </div>
    </header>
    <div className="live-browser-viewport">
      <iframe ref={frameRef} key={attempt} title={`${project.title} — interactive app`} src={url} onLoad={loaded} tabIndex={notice ? -1 : 0} aria-hidden={Boolean(notice)}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-pointer-lock"
        allow="fullscreen" referrerPolicy="no-referrer" />
      {notice && <div ref={noticeRef} className="live-browser-notice">
        <div>
          <p className="live-notice-kicker">{notice === 'help' ? 'App help' : 'Live app'}</p>
          <h2>{notice === 'help' ? 'App not showing?' : slow ? 'Taking a little longer' : `Opening ${project.title}`}</h2>
          <p role="status">{notice === 'help' ? 'Try reloading, or use the app in its own tab. The portfolio stays open here.' : slow ? 'The app hasn’t finished opening. You can open it separately or view what has loaded so far.' : 'The app is loading here. You can also open it in its own tab.'}</p>
          <div className="live-notice-actions">
            <a href={url} target="_blank" rel="noopener noreferrer">Open separately ↗</a>
            {(slow || notice === 'help') && <button onClick={reload}>Try again</button>}
            <button onClick={showFrame}>{notice === 'help' ? 'Back to app' : 'View app'}</button>
          </div>
        </div>
      </div>}
    </div>
    <footer><button className="live-browser-help" onClick={openHelp}>App not showing?</button><a href={`#project/${project.id}`}>Project notes</a></footer>
  </section>
}
