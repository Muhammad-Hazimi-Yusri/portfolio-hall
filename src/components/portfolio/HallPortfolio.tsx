import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { experience, professionalWork, profile, projects } from '@/data/portfolio'
import type { Project } from '@/data/portfolio'
import { ProjectPage } from './Portfolio'

const HallScene = lazy(() => import('./HallScene'))
const stops = [
  { id: '', label: 'Entrance' },
  { id: 'work', label: 'Work' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

class SceneBoundary extends Component<{ children: ReactNode; onUnavailable: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.onUnavailable() }
  render() { return this.state.failed ? null : this.props.children }
}

function HallMap() {
  return <svg className="hall-map" viewBox="0 0 540 440" role="img" aria-label="Plan of Balairung: entrance, project gallery, experience and contact">
    <g fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M182 346V97H310V346Z" fill="#e1f0f4" /><circle cx="246" cy="370" r="44" fill="#e1f0f4" />
      <circle cx="246" cy="73" r="35" fill="#e1f0f4" /><path d="M246 38V16" />
      <path d="M246 338V118" strokeDasharray="4 7" opacity=".45" />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M182 ${112 + i * 21}h11v12h-11`} fill="#3285a2" />)}
      <path d="M196 290H113M196 185H113M277 73H357M246 16H357" strokeWidth="1" />
    </g>
    <g fill="currentColor" fontFamily="Inter, sans-serif" fontSize="12">
      <text x="101" y="294" textAnchor="end">Work</text><text x="101" y="189" textAnchor="end">Projects</text>
      <text x="368" y="77">Experience</text><text x="368" y="20">Contact</text>
      <text x="246" y="374" textAnchor="middle">Entrance</text>
    </g>
  </svg>
}

function ProjectList({ items }: { items: Project[] }) {
  return <div className="exhibit-list">{items.map(project => <a className="exhibit-link" href={`#project/${project.id}`} key={project.id}>
    {project.image ? <img src={`${import.meta.env.BASE_URL}${project.image.src}`} alt="" loading="lazy" /> : <span className="exhibit-type" aria-hidden="true">{project.tools[0].split(' / ')[0]}</span>}
    <span className="exhibit-copy"><strong>{project.title}</strong><span>{project.summary}</span><small>{project.status}</small></span>
    <span className="exhibit-arrow" aria-hidden="true">↗</span>
  </a>)}</div>
}

function Entrance() {
  return <>
    <p className="panel-kicker">Muhammad Hazimi Yusri · {profile.location}</p>
    <h1 tabIndex={-1}>Hi, I’m Hazimi.</h1>
    <p className="panel-lead">I work on power systems at TNEI, and build software along the way.</p>
    <p>I’m a graduate consultant in the Connections team. My work involves power-system studies, site-test analysis and engineering reports. I also develop tools for the team.</p>
    <p>Outside work, I make web apps and experiment with graphics, AI and VR. This hall is one of those experiments.</p>
    <div className="entrance-actions"><a className="solid-link" href="#work">See my work <span aria-hidden="true">→</span></a><a href="#cv">Read my CV ↗</a></div>
    <section className="entrance-picks"><h2>A few places to start</h2><ProjectList items={[professionalWork[1], projects.find(item => item.id === 'avvr')!]} /><a className="all-projects-link" href="#projects">Browse all {projects.length} projects →</a></section>
    <p className="hall-explanation"><strong>Balairung</strong> means a hall or gathering place in Malay. Here, it’s a place for my work. Use the links to browse, or walk around the hall.</p>
  </>
}

function Work() {
  return <>
    <p className="panel-kicker">TNEI · Connections · Apr 2026 – present</p>
    <h1 tabIndex={-1}>Professional work</h1>
    <p className="panel-lead">Power-system studies, and tools for the work around them.</p>
    <p>I use PowerFactory and IPSA for studies, analyse site-test recordings and prepare engineering reports. These are two internal tools I’m developing alongside that work.</p>
    <ProjectList items={professionalWork} />
    <p className="content-note">Both tools are still in development. These notes cover my contribution at a high level; company code and client data are private.</p>
    <a className="all-projects-link" href="#about">Earlier roles at Audioscenic and Southampton →</a>
  </>
}

function Projects() {
  return <>
    <p className="panel-kicker">Personal & university work</p>
    <h1 tabIndex={-1}>Projects</h1>
    <p>Things I’ve made, worked on with a team, or am still figuring out. Open a project for my contribution, its current state and links to try it.</p>
    <ProjectList items={projects} />
  </>
}

function Experience() {
  return <>
    <p className="panel-kicker">Background</p><h1 tabIndex={-1}>Experience</h1>
    <div className="experience-list">{experience.map(item => <section className="experience-item" key={item.organisation}>
      <p className="experience-date">{item.dates}</p><h2>{item.organisation}</h2><p className="experience-role">{item.title}</p><p>{item.description}</p><p className="tool-line">{item.tools}</p>
    </section>)}</div>
    <section className="education"><h2>University of Southampton</h2><p>MEng Electrical & Electronic Engineering<br />First Class Honours · 2021–2025</p></section>
    <p className="content-note">I use AI coding tools in my projects. The project notes describe what I contributed and what builds on other people’s work.</p>
    <a className="solid-link" href="#cv">Read / print my CV ↗</a>
  </>
}

function Contact() {
  return <>
    <p className="panel-kicker">Get in touch</p><h1 tabIndex={-1}>Contact</h1>
    <p className="panel-lead">I’m interested in solutions engineering and roles where I can build software with the people who need it.</p>
    <p>My background is in power systems, Python tools and technical integration. I’m based in Liverpool.</p>
    <div className="contact-options"><a href={`mailto:${profile.email}`}>{profile.email} ↗</a><a href={profile.linkedin}>LinkedIn ↗</a><a href={profile.github}>GitHub · Web & university projects ↗</a><a href={profile.experiments}>GitHub · Graphics & VR experiments ↗</a><a href="#cv">Read / print my CV →</a></div>
  </>
}

function initialLiveView() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('force2d') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try { return sessionStorage.getItem('balairung-map') !== 'true' } catch { return true }
}

export default function HallPortfolio({ hash, project }: { hash: string; project?: Project }) {
  const view = hash.replace(/^#/, '')
  const section = project ? professionalWork.includes(project) ? 'work' : 'projects' : stops.some(stop => stop.id === view) ? view : ''
  const [live, setLive] = useState(initialLiveView)
  const [ready, setReady] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const onReady = useCallback(() => setReady(true), [])
  const onUnavailable = useCallback(() => { setUnavailable(true); setReady(false) }, [])
  const toggleLive = () => {
    const next = unavailable || !live
    setLive(next); setReady(false); setUnavailable(false)
    try { sessionStorage.setItem('balairung-map', String(!next)) } catch { /* Storage may be disabled. */ }
  }
  useEffect(() => { panelRef.current?.scrollTo(0, 0) }, [hash])
  return <div className="hall-browser">
    <section className={`hall-stage${ready && live ? ' scene-ready' : ''}`} aria-label="Balairung gallery">
      <div className="stage-caption"><strong>Balairung</strong><span>{project ? project.title : section === '' ? 'A place for my work' : stops.find(stop => stop.id === section)?.label}</span></div>
      <HallMap />
      {live && !unavailable && <SceneBoundary onUnavailable={onUnavailable}><Suspense fallback={null}><HallScene view={project?.id ?? section} onReady={onReady} onUnavailable={onUnavailable} /></Suspense></SceneBoundary>}
      <div className="stage-controls"><button onClick={toggleLive}>{unavailable ? 'Retry 3D' : live ? 'Use hall map' : 'Show 3D hall'}</button><a href="#explore">Walk around <span aria-hidden="true">↗</span></a></div>
      {unavailable && <p className="graphics-note" role="status">3D is unavailable. All the work is still here to browse.</p>}
      <nav className="hall-stops" aria-label="Places in the hall">{stops.map(stop => <a key={stop.id} href={`#${stop.id}`} aria-current={stop.id === section ? 'location' : undefined}><span aria-hidden="true" />{stop.label}</a>)}</nav>
    </section>
    <div className="hall-reading" ref={panelRef}>
      {project ? <ProjectPage project={project} /> : <main id="main" className="hall-panel" tabIndex={-1}>
        {view.startsWith('project/') ? <><h1 tabIndex={-1}>Project not found</h1><a href="#projects">Browse projects →</a></> : section === 'work' ? <Work /> : section === 'projects' ? <Projects /> : section === 'about' ? <Experience /> : section === 'contact' ? <Contact /> : <Entrance />}
      </main>}
      <footer className="panel-footer"><span>{profile.shortName}</span><span>Updated {profile.updated}</span></footer>
    </div>
  </div>
}
