import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import LiveProjectBrowser from '../../src/components/portfolio/LiveProjectBrowser'
import { projects } from '../../src/data/portfolio'
import '../../src/components/portfolio/portfolio.css'

// Dev-only browser fixture. Vite's production entry does not include tools/.
// An interactive and a blank document exercise the real wrapper without
// depending on a remote app, signing in, or changing any public project URL.
export default function BrowserFixture() {
  const [blank, setBlank] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [delayed, setDelayed] = useState(false)
  const project = {
    ...projects[0], id: 'local-frame-check', title: 'Local iframe check',
    liveApp: { url: delayed ? 'http://127.0.0.1:5192/slow.html' : new URL(`./embedded-app.html${blank ? '?blank' : ''}`, window.location.href).href },
  }
  return <div className="portfolio">
    <header className="site-header"><strong>Local iframe check</strong><button onClick={() => { setDelayed(false); setBlank(value => !value) }}>{blank ? 'Use interactive document' : 'Use blank document'}</button><button onClick={() => { setBlank(false); setDelayed(value => !value) }}>{delayed ? 'Use immediate document' : 'Use delayed document'}</button></header>
    <div className={`hall-browser live-app-open${expanded ? ' live-app-expanded' : ''}`}>
      <section className="hall-stage app-stage"><LiveProjectBrowser key={`${blank}/${delayed}`} project={project} expanded={expanded} onToggleExpanded={() => setExpanded(value => !value)} /></section>
      <aside className="hall-reading-shell"><p>Set the counter to two, expand and restore, then reload. The counter should survive resizing and reset only on Reload.</p><p>Choose the blank document to verify that recovery controls remain after a load event with no usable app.</p><p>The delayed document needs the loopback helper: node tools/fixtures/iframe-delay-server.mjs. It responds after 14 seconds.</p></aside>
    </div>
  </div>
}

if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<BrowserFixture />)
