import { Component, lazy, Suspense, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Resume, SiteHeader, SiteFooter } from '@/components/portfolio/Portfolio'
import HallPortfolio from '@/components/portfolio/HallPortfolio'
import { projects, professionalWork, profile } from '@/data/portfolio'
import '@/components/portfolio/portfolio.css'

const HallExperience = lazy(() => import('@/components/portfolio/HallExperience'))
const CaptureMode = lazy(() => import('@/components/tour/CaptureMode').then(m => ({ default: m.CaptureMode })))

class HallBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? (
      <main className="portfolio-status"><h1>The hall couldn’t load.</h1><p>You can still read all the project notes.</p><a href="#projects">Back to projects →</a></main>
    ) : this.props.children
  }
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  const capture = import.meta.env.DEV && new URLSearchParams(window.location.search).get('capture') === 'true'
  const exploring = hash === '#explore'
  const resume = hash === '#cv'
  const project = [...professionalWork, ...projects].find(item => hash === `#project/${item.id}`)
  const active = project ? professionalWork.includes(project) ? 'work' : 'projects' : hash.slice(1)

  useEffect(() => {
    const sync = () => { if (window.location.hash !== '#main') setHash(window.location.hash) }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    document.title = `${project ? project.title : resume ? 'CV' : 'Balairung'} — ${profile.name}`
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      if (hash) document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, project, resume])

  if (capture) return <div className="hall-experience"><Suspense fallback={<p>Loading capture tools…</p>}><CaptureMode /></Suspense></div>
  if (exploring) return <HallBoundary><Suspense fallback={<main className="portfolio-status"><p>Loading the hall…</p><a href="#projects">Back to projects →</a></main>}><HallExperience /></Suspense></HallBoundary>

  return (
    <div className={`portfolio${resume ? ' resume-view' : ''}`}>
      <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
      <SiteHeader active={active} />
      {resume ? <><Resume /><SiteFooter /></> : <HallPortfolio hash={hash} project={project} />}
    </div>
  )
}
