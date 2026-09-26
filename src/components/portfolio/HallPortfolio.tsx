import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode, MutableRefObject } from 'react'
import { experience, professionalWork, profile, projects } from '@/data/portfolio'
import type { Project } from '@/data/portfolio'
import { ProjectPage } from './Portfolio'
import { useHallScroll } from './useHallScroll'
import HallMap from './HallMap'
import { hallStops as stops } from '@/data/hallLayout'
import { worldForProject, projectWorlds, projectWorldRoute, worldProjectFromHash } from '@/data/projectWorlds'
import type { ProjectWorldId } from '@/data/projectWorlds'
import { useSpatialTone } from './useSpatialTone'
import ProjectVideo from './ProjectVideo'
import { useCommunity } from './useCommunity'
import { projectNeighbours } from './hallNavigation'
import type { ExhibitAction, HallPose } from './hallNavigation'
import type { ProjectMediaHandle } from './ProjectMedia'
import type { AvvrArchiveState, AvvrPresentation } from '@/data/avvrArchive'
import { avvrArchiveEnabled } from '@/data/avvrArchive'
import type { GuestbookIntent } from '@/data/community'
import type { DroneBuildDetail } from '@/data/droneBuild'

const HallScene = lazy(() => import('./HallScene'))
const LiveProjectBrowser = lazy(() => import('./LiveProjectBrowser'))
const VisitorBook = lazy(() => import('./VisitorBook'))
const DroneBuildNotes = lazy(() => import('./DroneBuildNotes'))
const ProjectIslandControls = lazy(() => import('./ProjectIslandControls'))

class ViewBoundary extends Component<{ children: ReactNode; onUnavailable?: () => void; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable?.() }
  render() { return this.state.failed ? this.props.fallback ?? null : this.props.children }
}

function AppFallback({ project, waiting = false, onResumeWalk }: { project: Project; waiting?: boolean; onResumeWalk?: () => void }) {
  return <section className="live-project-browser" aria-label={`${project.title} live app`}>
    <header className="live-browser-toolbar">
      {onResumeWalk ? <button className="live-browser-close" onClick={onResumeWalk}>← Back to walk</button> : <a className="live-browser-close" href={`#gallery/${project.id}`}>← Gallery</a>}
      <a href={project.liveApp!.url} target="_blank" rel="noopener noreferrer">Open app ↗</a>
    </header>
    <p className="live-browser-loading" role="status">{waiting ? 'Opening app…' : 'The viewer could not open. Try Open app to use it in a separate tab.'}</p>
  </section>
}

function ProjectList({ items, follow = true, compact = false }: { items: Project[]; follow?: boolean; compact?: boolean }) {
  return <div className={`exhibit-list${compact ? ' exhibit-list-compact' : ''}`}>{items.map(project => {
    const number = [...professionalWork, ...projects].findIndex(item => item.id === project.id) + 1
    const preview = !compact && project.image
    return <div className={`exhibit-entry${preview ? ' exhibit-entry-preview' : ''}${project.liveApp && !compact ? ' has-live-app' : ''}`} key={project.id}><a className={`exhibit-link${preview ? ' exhibit-with-preview' : ''}`} href={`#project/${project.id}`} data-hall-view={follow ? project.id : undefined} data-hall-section={professionalWork.includes(project) ? 'work' : 'projects'}>
      <span className="exhibit-number" aria-hidden="true">{String(number).padStart(2, '0')}{preview && follow && <span className="exhibit-in-view">In view</span>}</span>
      {(compact || preview) && project.image && <img className="exhibit-thumbnail" src={`${import.meta.env.BASE_URL}${project.image.src}`} alt="" loading="lazy" decoding="async" width={project.image.width ?? 1920} height={project.image.height ?? 1080} />}
      <span className="exhibit-copy"><small>{project.category}</small><strong>{project.title}</strong><span>{project.summary}</span><small className="exhibit-status">{project.status}</small></span>
      <span className="exhibit-arrow" aria-hidden="true">↗</span>
    </a>{project.liveApp && !compact && <div className="exhibit-actions"><a href={`#app/${project.id}`} aria-label={`Try ${project.title} here`}>Try here →</a><a href={project.liveApp.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} in a new tab`}>Open app ↗</a></div>}</div>
  })}</div>
}

function Entrance() {
  const featured = projects.find(item => item.id === 'avvr')!
  return <>
    <p className="panel-kicker entrance-kicker"><span>Engineering & software</span><span className="kicker-location">{profile.availability}</span></p>
    <h1 className="section-title entrance-title" tabIndex={-1}><span>Hazimi</span> <em>Yusri.</em></h1>
    <p className="panel-lead">I’m a power systems consultant at TNEI, building Python and web tools alongside power system studies.</p>
    <p className="entrance-interests">After hours: <a href="#project/petbot">local AI and robots</a>, <a href="#project/avvr">VR</a>, and <a href="#project/food-wars">web apps</a>.</p>
    <div className="entrance-actions"><a className="solid-link" href="#work">See my work <span aria-hidden="true">→</span></a><a href="#cv">Read my CV ↗</a></div>
    <section className="entrance-picks"><h2>Selected work</h2>
      <a className="entrance-feature" href={`#project/${featured.id}`}>
        {featured.image && <img src={`${import.meta.env.BASE_URL}${featured.image.src}`} alt="" width={featured.image.width ?? 1920} height={featured.image.height ?? 1080} decoding="async" />}
        <span className="entrance-feature-copy"><small>{featured.status}</small><strong>{featured.title}<span aria-hidden="true">↗</span></strong><span>{featured.role}</span></span>
      </a>
      <ProjectList compact follow={false} items={[professionalWork[1]]} /><a className="all-projects-link" href="#projects">Browse all {projects.length} personal & university projects <span aria-hidden="true">↗</span></a>
    </section>
    <p className="hall-explanation"><strong>Balairung <span aria-hidden="true">/</span></strong> Malay for a gathering hall. A place for my work, and the things I’m still exploring.</p>
  </>
}

function Work({ heading: Heading = 'h1' }: { heading?: 'h1' | 'h2' }) {
  return <>
    <p className="panel-kicker">TNEI · Connections · Apr 2026 – present</p>
    <Heading className="section-title" tabIndex={-1}>Professional work</Heading>
    <p className="panel-lead">From site-test recordings to engineering reports.</p>
    <p>I work in TNEI’s Connections team, using PowerFactory and IPSA for studies. I’m also developing these tools for analysing measurements and preparing reports.</p>
    <ProjectList items={professionalWork} />
    <p className="content-note">Both tools are still in development. These notes cover my contribution at a high level; company code and client data are private.</p>
    <a className="all-projects-link" href="#about">Earlier roles at Audioscenic and Southampton →</a>
  </>
}

function Projects({ heading: Heading = 'h1' }: { heading?: 'h1' | 'h2' }) {
  return <>
    <p className="panel-kicker">Personal & university work</p>
    <Heading className="section-title" tabIndex={-1}>Projects</Heading>
    <p>Web apps, VR, a robot and a drone. Some are published university projects; others are experiments I’m still working on.</p>
    <ProjectList items={projects} />
  </>
}

function Experience({ selectedId, onHighlight, heading: Heading = 'h1' }: { selectedId?: string; onHighlight: (id: string | null) => void; heading?: 'h1' | 'h2' }) {
  const selected = experience.find(item => item.id === selectedId)
  return <>
    <p className="panel-kicker">Background</p><Heading className="section-title" tabIndex={-1}>Experience</Heading>
    <nav className="experience-selector" aria-label="Experience displays"><a href="#about" aria-current={!selected ? 'page' : undefined}>All</a>{experience.map(item => <a key={item.id} href={`#experience/${item.id}`} aria-current={selected === item ? 'page' : undefined} onMouseEnter={() => onHighlight(item.id)} onMouseLeave={() => onHighlight(null)} onFocus={() => onHighlight(item.id)} onBlur={() => onHighlight(null)}>{item.id === 'southampton-research' ? 'Southampton' : item.organisation}</a>)}</nav>
    <div className="experience-list">{(selected ? [selected] : experience).map(item => <section className="experience-item" key={item.organisation} data-hall-view={`experience/${item.id}`} data-hall-section="about">
      <header className="experience-heading">
        <p className="experience-date">{item.dates}</p><p className="experience-organisation">{item.organisation}</p>
        <div className="experience-mark" style={{ background: item.logo.background }}><img src={`${import.meta.env.BASE_URL}${item.logo.src}`} alt="" /></div>
        <h2>{item.title}</h2>
      </header>
      <p>{item.description}</p><p className="tool-line"><span>Tools & methods</span>{item.tools}</p>
      {item.id === 'tnei' && <nav className="experience-work" aria-label="TNEI work notes">{professionalWork.map(work => <a key={work.id} href={`#project/${work.id}`}>{work.title}<span aria-hidden="true">↗</span></a>)}</nav>}
      {!selected && <a className="experience-focus" href={`#experience/${item.id}`} aria-label={`View ${item.organisation} in the hall`}>View this display <span aria-hidden="true">↗</span></a>}
    </section>)}</div>
    <section className="education"><h2>University of Southampton</h2><p>MEng Electrical & Electronic Engineering<br />First Class Honours · 2021–2025</p></section>
    <p className="content-note">I use AI coding tools in my projects. The project notes describe what I contributed and what builds on other people’s work.</p>
    <a className="solid-link" href="#cv">Read / print my CV ↗</a>
  </>
}

function Contact({ heading: Heading = 'h1' }: { heading?: 'h1' | 'h2' }) {
  return <>
    <p className="panel-kicker">Get in touch</p><Heading className="section-title" tabIndex={-1}>Contact</Heading>
    <p className="panel-lead">Building something with AI, 3D or engineering data?</p>
    <p>I’m interested in applied AI, immersive technology and solutions engineering roles where I can work directly with users and build the software with them. Email me with what your team is working on.</p>
    <p className="working-preference">{profile.workingPreference}</p>
    <div className="contact-options"><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><a href={profile.linkedin}>LinkedIn ↗</a><a href={profile.github}>GitHub · Web & university projects ↗</a><a href={profile.experiments}>GitHub · Graphics & VR experiments ↗</a><a href="#cv">Read / print my CV →</a></div>
  </>
}

function initialLiveView() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('force2d') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return sessionStorage.getItem('balairung-map') !== 'true' } catch { return true }
}

export default function HallPortfolio({ hash, project, world, withinWorld, returningToNotes, navigationKey, fromScroll, onSectionChange, browsePose, onWalkAround, onResumeWalk }: { hash: string; project?: Project; world: ProjectWorldId | null; withinWorld: boolean; returningToNotes: boolean; navigationKey: number; fromScroll: boolean; onSectionChange: (section: string) => void; browsePose: MutableRefObject<HallPose | null>; onWalkAround: (view: string) => void; onResumeWalk?: () => void }) {
  const view = hash.replace(/^#/, '')
  const selectedExperience = view.startsWith('experience/') ? experience.find(item => item.id === view.slice('experience/'.length)) : undefined
  const galleryProject = [...professionalWork, ...projects].find(item => hash === `#gallery/${item.id}`)
  const contextProject = project ?? galleryProject
  const section = contextProject ? professionalWork.includes(contextProject) ? 'work' : 'projects' : selectedExperience ? 'about' : view.startsWith('guestbook') ? 'contact' : stops.some(stop => stop.id === view) ? view : ''
  const visitorLog = useCommunity(section)
  const appOpen = Boolean(project?.liveApp && hash === `#app/${project.id}`)
  const [live, setLive] = useState(initialLiveView)
  const [hallVisited, setHallVisited] = useState(!appOpen)
  const [appExpanded, setAppExpanded] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [video, setVideo] = useState<{ project: Project; origin: HTMLElement | null } | null>(null)
  const [lookingAround, setLookingAround] = useState(false)
  const resetLook = useRef<() => void>(() => {})
  const [exhibitHint, setExhibitHint] = useState<ExhibitAction | null>(null)
  const [guestbookAction, setGuestbookAction] = useState(0)
  const openGuestbook = useCallback((intent: GuestbookIntent) => {
    setGuestbookAction(value => value + 1)
    window.location.hash = intent === 'read' ? '#guestbook' : `#guestbook/${intent}`
  }, [])
  const guestbookFocus = view.startsWith('guestbook') ? { intent: view === 'guestbook/analytics' ? 'analytics' as const : view === 'guestbook/visitors' ? 'visitors' as const : view === 'guestbook/write' ? 'write' as const : 'read' as const, key: navigationKey + guestbookAction } : undefined
  const landscapeOpen = guestbookFocus?.intent === 'analytics'
  const visitorDay = useRef<string | null>(null)
  const selectVisitorDay = useCallback((day: string | null) => { visitorDay.current = day }, [])
  const mediaRef = useRef<ProjectMediaHandle>(null)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const [logosPaused, setLogosPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [highlightedExperience, setHighlightedExperience] = useState<string | null>(null)
  const [scrollEnabled, setScrollEnabled] = useState(() => { try { return localStorage.getItem('balairung-scroll-with-hall') !== 'false' } catch { return true } })
  const [sourcePosition, setSourcePosition] = useState(0)
  const [droneDetail, setDroneDetail] = useState<DroneBuildDetail | null>(null)
  const [avvrPresentation, setAvvrPresentation] = useState<AvvrPresentation>(avvrArchiveEnabled ? 'model' : 'sound')
  const [archiveState, setArchiveState] = useState<AvvrArchiveState>({ model: 'loading', photo: 'idle' })
  const worldAction = useRef<string | null>(null)
  const onSourceChange = useCallback((index: number) => { setSourcePosition(index); if (index === 1) setDroneDetail(null) }, [])
  const onDroneDetail = useCallback((detail: DroneBuildDetail | null) => { setDroneDetail(detail); if (detail) setSourcePosition(0) }, [])
  const { audioRef, playing, error: audioError, toggle: toggleAudio, volume, setVolume } = useSpatialTone(Boolean(world === 'avvr' && avvrPresentation === 'sound' && live && !unavailable))
  const panelRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  const openVideo = useCallback((id: string, origin: HTMLElement | null) => {
    const project = projects.find(item => item.id === id && item.video)
    if (project) setVideo({ project, origin })
  }, [])
  const openSceneVideo = useCallback((id: string) => openVideo(id, stageRef.current?.querySelector<HTMLElement>('.world-video-button') ?? stageRef.current?.querySelector<HTMLElement>('.focus-exit') ?? null), [openVideo])
  const closeVideo = useCallback(() => setVideo(null), [])
  const stageReturnControl = useCallback(() => {
    const exit = stageRef.current?.querySelector<HTMLElement>('.focus-exit, .scroll-toggle')
    // Phone project views use the reading bar's Back control. Do not restore
    // focus to the duplicate stage control hidden by that layout.
    if (exit?.getClientRects().length) return exit
    return panelRef.current?.querySelector<HTMLElement>('.project-focus-bar a, .project-focus-bar button') ?? null
  }, [])
  const restoreLook = useCallback(() => {
    resetLook.current()
    stageReturnControl()?.focus({ preventScroll: true })
  }, [stageReturnControl])
  const openFrameImage = useCallback(() => {
    mediaRef.current?.openFrame(stageReturnControl())
  }, [stageReturnControl])
  const continuous = scrollEnabled && !project && !view.startsWith('project/') && !view.startsWith('world/') && !view.startsWith('app/') && !selectedExperience
  const { frameRef, activeView, revealRef } = useHallScroll({ enabled: scrollEnabled && !world && !appOpen, continuous, mapVisible: !live || unavailable, preservePagePosition: withinWorld, notesId: project && !world && !appOpen ? project.id : undefined, restoreNotes: returningToNotes, view: project?.id ?? view, section, navigationTarget: galleryProject?.id, navigationKey, fromScroll, panelRef, stageRef, onSectionChange, onLeaveProject: project && !world && !appOpen ? () => { window.location.hash = `#gallery/${project.id}` } : undefined })
  const revealGuestbook = useCallback((element: HTMLElement) => revealRef.current(element), [revealRef])
  const sceneView = landscapeOpen ? 'visitor-landscape' : project?.id ?? (scrollEnabled ? activeView : galleryProject?.id ?? (selectedExperience ? view : section))
  const displayedProject = [...professionalWork, ...projects].find(item => item.id === sceneView)
  const displayedWorld = displayedProject ? worldForProject(displayedProject.id) : null
  const displayedExperience = experience.find(item => `experience/${item.id}` === sceneView)
  const projectEscapeHint = onResumeWalk ? 'Esc to return to your walk' : 'Esc to leave project'
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(false) }, [])
  const toggleLive = () => {
    const next = unavailable || !live
    setLive(next); setReady(false); setUnavailable(false)
    try { sessionStorage.setItem('balairung-map', String(!next)) } catch { /* Storage may be disabled. */ }
  }
  const openMapWorld = useCallback((route: string) => {
    setLive(true); setUnavailable(false); setReady(false); setHallVisited(true)
    try { sessionStorage.setItem('balairung-map', 'false') } catch { /* Storage may be disabled. */ }
    window.location.hash = route
  }, [])
  const toggleScroll = () => {
    setScrollEnabled(value => { try { localStorage.setItem('balairung-scroll-with-hall', String(!value)) } catch { /* Storage may be disabled. */ } return !value })
  }
  useEffect(() => { setHighlightedExperience(null); setExhibitHint(null); setLookingAround(false) }, [hash, live])
  useEffect(() => { if (!live || unavailable) browsePose.current = null }, [live, unavailable, browsePose])
  useEffect(() => { setSourcePosition(0); setDroneDetail(null) }, [world, project?.id])
  useEffect(() => { setAvvrPresentation(avvrArchiveEnabled ? 'model' : 'sound') }, [world])
  useEffect(() => { if (!appOpen) setHallVisited(true) }, [appOpen])
  useEffect(() => { setAppExpanded(false) }, [hash])
  useEffect(() => { setVideo(null) }, [hash])
  useEffect(() => {
    if (!project && !selectedExperience && !lookingAround && !landscapeOpen) return
    const navigate = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.repeat) return
      if (document.querySelector('dialog[open]')) return
      if (event.key !== 'Escape' && event.target instanceof Element && event.target.closest('dialog[open], input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"], iframe')) return
      if (event.key === 'Escape') {
        event.preventDefault()
        if (world === 'hardware' && droneDetail) {
          setDroneDetail(null)
          stageRef.current?.querySelector<HTMLButtonElement>(`[data-drone-detail="${droneDetail}"]`)?.focus({ preventScroll: true })
        } else if (world === 'avvr' && avvrPresentation.startsWith('labels/')) {
          setAvvrPresentation('labels')
          stageRef.current?.querySelector<HTMLButtonElement>(`[data-avvr-class="${avvrPresentation.slice(7)}"]`)?.focus({ preventScroll: true })
        } else if (appOpen && appExpanded) {
          setAppExpanded(false)
          stageRef.current?.querySelector<HTMLButtonElement>('.live-browser-expand')?.focus({ preventScroll: true })
        } else if (onResumeWalk) onResumeWalk()
        else if (selectedExperience) window.location.hash = '#about'
        else if (landscapeOpen) window.location.hash = '#guestbook'
        else if (!project) restoreLook()
        else window.location.hash = world ? `#project/${project.id}` : `#gallery/${project.id}`
      } else if (project && !appOpen && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        // Hash navigation is synchronous; React may not have committed the
        // preceding key press yet. Follow the actual route so quick taps count.
        const stationControl = event.target instanceof Element ? event.target.closest('.world-stations') : null
        // Operating the model or its sound controls must not change exhibits.
        if (event.target instanceof Element && event.target.closest('.world-instruments') && !stationControl) return
        const id = world ? worldProjectFromHash(window.location.hash) : window.location.hash.startsWith('#project/') ? window.location.hash.slice('#project/'.length) : null
        if (!id) return
        const neighbours = projectNeighbours(id, world)
        if (neighbours.count < 2) return
        const direction = event.key === 'ArrowLeft' ? 'previous' : 'next'
        const adjacent = neighbours[direction]
        event.preventDefault()
        if (adjacent) {
          const route = world ? projectWorldRoute(world, adjacent.id) : `#project/${adjacent.id}`
          if (world && !stationControl) panelRef.current?.querySelector<HTMLElement>(`[data-project-step="${direction}"]`)?.focus({ preventScroll: true })
          window.location.hash = route
          stationControl?.querySelector<HTMLElement>(`a[href="${route}"]`)?.focus({ preventScroll: true })
        }
      }
    }
    window.addEventListener('keydown', navigate)
    return () => window.removeEventListener('keydown', navigate)
  }, [world, project, selectedExperience, appOpen, appExpanded, lookingAround, landscapeOpen, droneDetail, avvrPresentation, restoreLook, onResumeWalk])
  return <div className={`hall-browser${scrollEnabled && !world && !appOpen ? ' scroll-linked' : ''}${world ? ' world-open' : ''}${appOpen ? ` live-app-open${appExpanded ? ' live-app-expanded' : ''}` : ''}`} onClick={event => {
    if ((live && !unavailable) || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return
    const route = event.target.closest('a')?.getAttribute('href')
    // Entering a project space is an explicit request for its 3D view, whether
    // the visitor uses the map, the stage action or the project notes.
    if (route?.startsWith('#world/')) { event.preventDefault(); openMapWorld(route) }
  }}>
    <section ref={stageRef} className={`hall-stage${project && !world && !appOpen ? ' project-stage' : ''}${selectedExperience ? ' experience-stage' : ''}${landscapeOpen ? ' analytics-stage' : ''}${lookingAround && !world ? ' looking-around' : ''}${ready && live ? ' scene-ready' : ''}${!live || unavailable ? ' map-visible' : ''}${appOpen ? ' app-stage' : ''}${world && live && !unavailable ? ` world-stage${world === 'hardware' ? ' hardware-stage' : ''}` : ''}`} aria-label={world ? projectWorlds[world].title : 'Balairung gallery'}>
      <div className="stage-caption"><strong>{world ? `Balairung / ${world === 'avvr' ? 'AVVR' : 'Hardware'}` : `Balairung / ${stops.find(stop => stop.id === section)?.number ?? '01'}`}</strong><span key={sceneView}>{landscapeOpen ? 'Visitor landscape' : world ? projectWorlds[world].title : displayedProject?.title ?? displayedExperience?.organisation ?? stops.find(stop => stop.id === section)?.label}</span></div>
      {!appOpen && (!ready || !live || unavailable) && <HallMap view={sceneView} section={section} community={visitorLog.community} onOpenWorld={openMapWorld} />}
      {live && !unavailable && (hallVisited || !appOpen) && <ViewBoundary onUnavailable={onUnavailable}><Suspense fallback={null}><HallScene community={visitorLog.community} visitorDay={visitorDay} view={landscapeOpen ? 'visitor-landscape' : project?.id ?? galleryProject?.id ?? (selectedExperience ? view : section)} world={world} sourcePosition={sourcePosition} onSourceChange={onSourceChange} droneDetail={droneDetail} onDroneDetail={onDroneDetail} audioRef={audioRef} worldAction={worldAction} avvrPresentation={avvrPresentation} onArchiveState={setArchiveState} scrollFrame={frameRef} logosPaused={logosPaused} highlightedExperience={highlightedExperience} suspended={appOpen || imageViewerOpen || Boolean(video)} onReady={onReady} onUnavailable={onUnavailable} browsePose={browsePose} focusedProject={!world && !appOpen ? project?.id ?? null : null} onExhibitHint={setExhibitHint} onFrameImage={openFrameImage} onProjectVideo={openSceneVideo} onGuestbook={openGuestbook} onLookChange={setLookingAround} resetLook={resetLook} /></Suspense></ViewBoundary>}
      {lookingAround && !world && !appOpen && live && ready && <button className="browse-look-reset" aria-keyshortcuts={!project && !selectedExperience ? 'Escape' : undefined} onClick={restoreLook}><span aria-hidden="true">↺</span> Reset view</button>}
      <div className="hall-atmosphere" aria-hidden="true" />
      <div className="stage-toggles">{onResumeWalk && !appOpen ? <button className="focus-exit world-exit" onClick={onResumeWalk} aria-keyshortcuts="Escape">← Back to walk</button> : world ? <a className="focus-exit world-exit" aria-label="Return to hall" href={`#project/${project?.id ?? projectWorlds[world].projects[0]}`}>← Hall</a> : project && !appOpen ? <a className="focus-exit" href={`#gallery/${project.id}`}>× Back to gallery</a> : selectedExperience ? <a className="focus-exit" href="#about" aria-keyshortcuts="Escape">← All experience</a> : landscapeOpen ? <a className="focus-exit" href="#guestbook" aria-keyshortcuts="Escape">← Back to hall</a> : !appOpen && <button className="scroll-toggle" role="switch" aria-checked={scrollEnabled} onClick={toggleScroll}><span>Scroll with hall</span><span className="switch-track" aria-hidden="true" /></button>}</div>
      {world && live && ready && !unavailable && <div className="world-instruments" aria-label="Project island controls">
        <Suspense fallback={<p role="status">Opening exhibit controls…</p>}><ProjectIslandControls world={world} project={project} presentation={avvrPresentation} onPresentation={setAvvrPresentation} archiveState={archiveState} sourcePosition={sourcePosition} onSourceChange={onSourceChange} worldAction={worldAction} droneDetail={droneDetail} onDroneDetail={onDroneDetail} audio={{ playing, error: audioError, toggle: toggleAudio, volume, onVolume: setVolume }} onVideo={openVideo} onMap={toggleLive} /></Suspense>
      </div>}
      {(!world || !live || !ready || unavailable) && <div className="stage-controls"><button onClick={toggleLive}><svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true"><path d="m2 4 5-2 6 2 5-2v14l-5 2-6-2-5 2V4Z" /><path d="M7 2v14M13 4v14" /></svg>{unavailable ? 'Retry 3D' : live ? 'Use hall map' : world ? 'Show 3D island' : 'Show 3D hall'}</button>{section === 'about' && sceneView !== 'about' && live && !unavailable && <button className="logo-motion-button" onClick={() => setLogosPaused(value => !value)} aria-pressed={logosPaused} aria-label={logosPaused ? 'Play logos' : 'Pause logos'} title={logosPaused ? 'Play logos' : 'Pause logos'}><span className="logo-motion-symbol" aria-hidden="true">{logosPaused ? '▷' : 'Ⅱ'}</span><span className="logo-motion-label" aria-hidden="true">{logosPaused ? 'Play logos' : 'Pause logos'}</span></button>}{world ? <a href={`#project/${project?.id ?? projectWorlds[world].projects[0]}`}>← Return to hall</a> : displayedProject?.liveApp ? <a href={`#app/${displayedProject.id}`}>Try live app ↗</a> : displayedWorld && displayedProject ? <a href={projectWorldRoute(displayedWorld, displayedProject.id)}>Enter the island ↗</a> : <a href="#explore" onClick={() => onWalkAround(sceneView)} title="Start walking from this view">Walk here <span aria-hidden="true">↗</span></a>}</div>}
      {ready && live && !appOpen && <p className={`stage-hint${exhibitHint ? ' is-target' : ''}`}>{exhibitHint ? <><strong>{exhibitHint.label}</strong><span aria-hidden="true"> · </span><span>{exhibitHint.title}</span></> : landscapeOpen ? 'Choose a day in the chart · Esc to return' : world ? world === 'hardware' && droneDetail ? 'Drag to inspect · Esc to show the whole drone' : world === 'avvr' && avvrPresentation.startsWith('labels/') ? 'Drag to inspect · Esc to show all labels' : world === 'avvr' && avvrPresentation === 'photo' ? 'Drag to look around · Esc to return' : 'Drag to look around · scroll to zoom · Esc to return' : selectedExperience ? (onResumeWalk ? 'Drag to look around · Esc to walk' : 'Drag to look around · Esc to all experience') : lookingAround ? project ? `Scroll to continue · ${projectEscapeHint}` : 'Scroll to continue · Esc to reset view' : project?.liveApp ? `Select the frame to try the live app · ${projectEscapeHint}` : project?.image && !displayedWorld ? `Select the frame to enlarge its image · ${projectEscapeHint}` : project ? `Scroll over the hall to browse · ${projectEscapeHint}` : displayedProject?.liveApp ? 'Select the frame to try the live app.' : displayedWorld ? 'Step through the frame into the project.' : <><span className="pointer-look-hint">Drag to look around · </span>Select an exhibit to open its notes.</>}</p>}
      {unavailable && <p className="graphics-note" role="status">3D is unavailable. All the work is still here to browse.</p>}
      <nav className="hall-stops" aria-label="Places in the hall">{stops.map(stop => <a key={stop.id} href={`#${stop.id}`} aria-current={stop.id === section ? 'location' : undefined}><span aria-hidden="true">{stop.number}</span>{stop.label}</a>)}</nav>
      {appOpen && project && <ViewBoundary key={project.id} fallback={<AppFallback project={project} onResumeWalk={onResumeWalk} />}><Suspense fallback={<AppFallback project={project} waiting onResumeWalk={onResumeWalk} />}><LiveProjectBrowser project={project} expanded={appExpanded} onToggleExpanded={() => setAppExpanded(value => !value)} onResumeWalk={onResumeWalk} /></Suspense></ViewBoundary>}
    </section>
    <div className="hall-reading-shell"><div className="hall-reading" ref={panelRef}>
      {project ? <ProjectPage project={project} inWorld={Boolean(world)} keyboardNavigation={!appOpen} onWalkAround={() => onWalkAround(sceneView)} onResumeWalk={onResumeWalk} onImageViewerChange={setImageViewerOpen} mediaRef={mediaRef} onPlayVideo={openVideo} exhibitNote={world === 'hardware' && project.id === 'fpv-drone' && live && !unavailable ? <Suspense fallback={null}><DroneBuildNotes selected={droneDetail} onSelect={onDroneDetail} placement="page" /></Suspense> : undefined} /> : continuous ? <main id="main" className="hall-panel hall-tour" tabIndex={-1}>
        <section data-hall-stop="" data-hall-view="" data-hall-section=""><Entrance />{visitorLog.enabled && <div className="visitor-arrival"><a href="#guestbook/analytics">{visitorLog.localPreview ? 'Local visitor preview' : 'Visitor log'}{visitorLog.connected ? ` · ${visitorLog.community.total} ${visitorLog.community.total === 1 ? 'visit' : 'visits'} in 28 days` : ''}</a><a href="#guestbook">Guestbook →</a></div>}</section>
        <section data-hall-stop="work" data-hall-view="work" data-hall-section="work"><Work heading="h2" /></section>
        <section data-hall-stop="projects" data-hall-view="projects" data-hall-section="projects"><Projects heading="h2" /></section>
        <section data-hall-stop="about" data-hall-view="about" data-hall-section="about"><Experience heading="h2" onHighlight={setHighlightedExperience} /></section>
        <section data-hall-stop="contact" data-hall-view="contact" data-hall-section="contact"><Contact heading="h2" />{visitorLog.enabled && <Suspense fallback={<p className="content-note">Opening the guestbook…</p>}><VisitorBook {...visitorLog} focusRequest={guestbookFocus} onReveal={revealGuestbook} onDaySelect={selectVisitorDay} /></Suspense>}</section>
      </main> : <main id="main" className="hall-panel" tabIndex={-1} data-hall-stop={section} data-hall-view={selectedExperience ? view : section} data-hall-section={section}>
        {view.startsWith('project/') || view.startsWith('world/') ? <><h1 tabIndex={-1}>Project not found</h1><a href="#projects">Browse projects →</a></> : section === 'work' ? <Work /> : section === 'projects' ? <Projects /> : section === 'about' ? <Experience selectedId={selectedExperience?.id} onHighlight={setHighlightedExperience} /> : section === 'contact' ? <><Contact />{visitorLog.enabled && <Suspense fallback={<p className="content-note">Opening the guestbook…</p>}><VisitorBook {...visitorLog} focusRequest={guestbookFocus} onReveal={revealGuestbook} onDaySelect={selectVisitorDay} /></Suspense>}</> : <Entrance />}
      </main>}
      <footer className="panel-footer"><span>{profile.shortName}</span><a href={`${import.meta.env.BASE_URL}scene-credits.html`} target="_blank" rel="noreferrer">Scene credits ↗</a><span>Updated {profile.updated}</span></footer>
    </div></div>
    {video && <ProjectVideo key={video.project.id} project={video.project} returnFocus={video.origin} onClose={closeVideo} />}
  </div>
}
