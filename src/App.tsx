import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Resume, SiteHeader, SiteFooter } from '@/components/portfolio/Portfolio'
import HallPortfolio from '@/components/portfolio/HallPortfolio'
import { projects, professionalWork, profile } from '@/data/portfolio'
import { worldProjectFromHash, worldFromHash } from '@/data/projectWorlds'
import '@/components/portfolio/portfolio.css'
import { createWalkEntry } from '@/components/portfolio/hallNavigation'
import type { HallPose, WalkEntry } from '@/components/portfolio/hallNavigation'
import { LoadingScreen } from '@/components/LoadingScreen'

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
  const [route, setRoute] = useState({ hash: window.location.hash, previousHash: '', fromScroll: false, key: 0, projectStep: null as string | null })
  const { hash } = route
  const renderedHash = useRef(hash)
  const browsePose = useRef<HallPose | null>(null)
  const walkEntry = useRef<WalkEntry | null>(null)
  const savedWalk = useRef<WalkEntry | null>(null)
  const onWalkAround = useCallback((view: string) => {
    savedWalk.current = null
    walkEntry.current = createWalkEntry(view, window.location.hash, browsePose.current)
  }, [])
  const rememberWalk = useCallback((entry: WalkEntry) => {
    savedWalk.current = { position: { ...entry.position }, target: { ...entry.target }, returnHash: entry.returnHash }
  }, [])
  const resumeWalk = useCallback(() => {
    if (!savedWalk.current) return
    walkEntry.current = savedWalk.current
    savedWalk.current = null
    window.location.hash = '#explore'
  }, [])
  renderedHash.current = hash
  const capture = import.meta.env.DEV && new URLSearchParams(window.location.search).get('capture') === 'true'
  const exploring = hash === '#explore'
  const resume = hash === '#cv'
  const world = worldFromHash(hash)
  const withinWorld = world !== null && worldFromHash(route.previousHash) === world
  const project = [...professionalWork, ...projects].find(item => hash === `#project/${item.id}` || (item.liveApp && hash === `#app/${item.id}`) || worldProjectFromHash(hash) === item.id)
  const returningToNotes = Boolean(project && hash === `#project/${project.id}` && (route.previousHash === `#app/${project.id}` || worldProjectFromHash(route.previousHash) === project.id))
  const galleryProject = [...professionalWork, ...projects].find(item => hash === `#gallery/${item.id}`)
  const activeProject = project ?? galleryProject
  const active = activeProject ? professionalWork.includes(activeProject) ? 'work' : 'projects' : hash.startsWith('#experience/') ? 'about' : hash.startsWith('#guestbook') ? 'contact' : hash.slice(1)
  const canResumeWalk = Boolean(savedWalk.current && (project || hash.startsWith('#experience/')))
  useEffect(() => {
    // A deliberate return to the gallery/overview ends this exhibit visit.
    if (!exploring && !project && !hash.startsWith('#experience/')) savedWalk.current = null
  }, [hash, exploring, project])

  useEffect(() => {
    const sync = () => {
      if (window.location.hash === '#main') return
      // Browser Back should restore the same walk as the explicit return button.
      if (window.location.hash === '#explore' && savedWalk.current) {
        walkEntry.current = savedWalk.current
        savedWalk.current = null
      }
      const projectStep = document.activeElement?.getAttribute('data-project-step') ?? null
      setRoute(previous => ({ hash: window.location.hash, previousHash: previous.hash, fromScroll: false, key: previous.key + 1, projectStep }))
    }
    const sameLink = (event: MouseEvent) => {
      const link = (event.target as Element).closest?.('a[href^="#"]')
      const href = link?.getAttribute('href')
      if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && href !== '#main' && href === (window.location.hash || '#')) { event.preventDefault(); sync() }
    }
    window.addEventListener('hashchange', sync)
    document.addEventListener('click', sameLink)
    return () => { window.removeEventListener('hashchange', sync); document.removeEventListener('click', sameLink) }
  }, [])

  const onSectionChange = useCallback((section: string) => {
    // A card click/hash navigation can arrive before React commits its new
    // content. An old scroll frame must never overwrite that destination.
    if ((window.location.hash || '#') !== (renderedHash.current || '#')) return
    const next = `#${section}`
    if ((window.location.hash || '#') === next) return
    window.history.replaceState(null, '', next)
    setRoute(previous => ({ hash: next, previousHash: previous.hash, fromScroll: true, key: previous.key, projectStep: null }))
  }, [])

  useEffect(() => {
    document.title = `${project ? project.title : resume ? 'CV' : 'Balairung'} — ${profile.name}`
    // Station links are controls inside one exhibit. Keep their keyboard focus
    // and the phone's page position instead of jumping to the new case heading.
    // The lazy guestbook reveals and focuses its requested heading or form once
    // mounted. A generic Contact focus would steal focus back on the next frame.
    if (route.fromScroll || (withinWorld && !route.projectStep) || returningToNotes || hash.startsWith('#guestbook')) return
    const frame = requestAnimationFrame(() => {
      if (galleryProject) {
        document.querySelector<HTMLElement>(`[data-hall-view="${galleryProject.id}"]`)?.focus({ preventScroll: true })
        return
      }
      const tour = document.querySelector('.hall-tour')
      if (tour) {
        const stop = [...tour.querySelectorAll<HTMLElement>('[data-hall-stop]')].find(item => item.dataset.hallStop === hash.slice(1))
        stop?.querySelector<HTMLElement>('.section-title')?.focus({ preventScroll: true })
      } else {
        // Reading arrows open the new notes; station controls keep the island
        // in view. A taller exhibit must not push the focused phone bar away.
        if (withinWorld && window.innerWidth <= 760) document.querySelector('main')?.scrollIntoView({ block: 'start', behavior: 'instant' })
        else window.scrollTo(0, 0)
        // The sticky arrows are a repeatable browsing control. Keep their
        // keyboard focus through a project change, including at either end.
        // Ordinary card navigation still focuses the title.
        if (route.projectStep && (withinWorld || (hash.startsWith('#project/') && route.previousHash.startsWith('#project/')))) {
          const control = document.querySelector<HTMLElement>(`[data-project-step="${route.projectStep}"]`)
          if (control) { control.focus({ preventScroll: true }); return }
        }
        if (hash) document.querySelector<HTMLElement>(hash.startsWith('#app/') ? '.live-browser-close' : 'main h1')?.focus({ preventScroll: true })
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, project, galleryProject, resume, route.fromScroll, route.key, route.previousHash, route.projectStep, withinWorld, returningToNotes])

  if (capture) return <div className="hall-experience"><Suspense fallback={<p>Loading capture tools…</p>}><CaptureMode /></Suspense></div>
  if (exploring) return <HallBoundary><Suspense fallback={<LoadingScreen returnHref={walkEntry.current?.returnHash ?? '#'} />}><HallExperience entry={walkEntry.current ?? createWalkEntry('', '#')} onOpenExhibit={rememberWalk} /></Suspense></HallBoundary>

  return (
    <div className={`portfolio${resume ? ' resume-view' : ''}`}>
      <a className="skip-link" href="#main" onClick={event => { event.preventDefault(); document.getElementById('main')?.focus() }}>Skip to content</a>
      <SiteHeader active={active} />
      {resume ? <><Resume /><SiteFooter /></> : <HallPortfolio hash={hash} project={project} world={world} withinWorld={withinWorld} returningToNotes={returningToNotes} navigationKey={route.key} fromScroll={route.fromScroll} onSectionChange={onSectionChange} browsePose={browsePose} onWalkAround={onWalkAround} onResumeWalk={canResumeWalk ? resumeWalk : undefined} />}
    </div>
  )
}
