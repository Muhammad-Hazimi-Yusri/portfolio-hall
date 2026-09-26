import { experience, professionalWork, profile, projects } from '@/data/portfolio'
import type { Project } from '@/data/portfolio'
import { worldForProject, projectWorlds, projectWorldRoute } from '@/data/projectWorlds'
import { projectNeighbours } from './hallNavigation'
import ProjectMedia from './ProjectMedia'
import type { Ref, ReactNode } from 'react'
import type { ProjectMediaHandle } from './ProjectMedia'

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <span aria-hidden="true" className="link-arrow">{diagonal ? '↗' : '→'}</span>
}

export function SiteHeader({ active = '' }: { active?: string }) {
  return <header className="site-header">
    <a className="wordmark" href="#" aria-label={`${profile.name}, home`}><svg viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M4 29V9L17 3L30 9V29M4 9L17 15L30 9M17 15V31M9 12V26M25 12V26" stroke="currentColor" strokeWidth="1.5" /></svg><span><strong>Balairung</strong><span>{profile.shortName}</span></span></a>
    <nav aria-label="Main navigation">
      <a href="#work" aria-current={active === 'work' ? 'page' : undefined}>Work</a><a href="#projects" aria-current={active === 'projects' ? 'page' : undefined}>Projects</a><a href="#about" aria-current={active === 'about' ? 'page' : undefined}>Experience</a><a href="#contact" aria-current={active === 'contact' ? 'page' : undefined}>Contact</a><a className="cv-link" href="#cv" aria-current={active === 'cv' ? 'page' : undefined}>CV <Arrow diagonal /></a>
    </nav>
  </header>
}

export function SiteFooter() {
  return <footer className="site-footer page-width"><p>{profile.name}</p><p>Updated {profile.updated}</p><a href="#">Back to Balairung <Arrow /></a></footer>
}

function ProjectLinks({ project, onWalkAround, showWalkHere, onPlayVideo }: { project: Project; onWalkAround?: () => void; showWalkHere: boolean; onPlayVideo?: (id: string, origin: HTMLElement | null) => void }) {
  if (!project.links.length && !showWalkHere) return null
  return <div className="project-actions">
    {project.liveApp && <a className="project-primary-action" href={`#app/${project.id}`}>Try live app <Arrow /></a>}
    {project.links.map((link, index) => project.video && onPlayVideo && link.url === `https://youtu.be/${project.video.youtubeId}`
      ? <button key={link.url} className={index === 0 ? 'project-primary-action' : undefined} onClick={event => onPlayVideo(project.id, event.currentTarget)} aria-haspopup="dialog">{link.label} <span aria-hidden="true">▷</span></button>
      : <a key={link.url}
      className={!project.liveApp && index === 0 ? 'project-primary-action' : undefined}
      href={link.url} onClick={link.url === '#explore' ? onWalkAround : undefined}
      target={link.url.startsWith('https:') ? '_blank' : undefined}
      rel={link.url.startsWith('https:') ? 'noopener noreferrer' : undefined}>
      {link.label} <Arrow diagonal={!link.url.startsWith('#')} />
    </a>)}
    {showWalkHere && !project.links.some(link => link.url === '#explore') && <a href="#explore" onClick={onWalkAround} title="Start walking from this view">Walk here <Arrow diagonal /></a>}
  </div>
}

export function ProjectPage({ project, inWorld = false, keyboardNavigation = true, onWalkAround, onResumeWalk, onImageViewerChange, mediaRef, onPlayVideo, exhibitNote }: { project: Project; inWorld?: boolean; keyboardNavigation?: boolean; onWalkAround?: () => void; onResumeWalk?: () => void; onImageViewerChange?: (open: boolean) => void; mediaRef?: Ref<ProjectMediaHandle>; onPlayVideo?: (id: string, origin: HTMLElement | null) => void; exhibitNote?: ReactNode }) {
  const internal = professionalWork.some(item => item.id === project.id)
  const world = worldForProject(project.id)
  const { previous, next, index, count } = projectNeighbours(project.id, inWorld ? world : null)
  const projectRoute = (id: string) => inWorld && world ? projectWorldRoute(world, id) : `#project/${id}`
  const backRoute = inWorld ? `#project/${project.id}` : `#gallery/${project.id}`
  return <main id="main" className="project-page page-width" tabIndex={-1} data-hall-view={project.id} data-hall-section={internal ? 'work' : 'projects'}>
    <nav className="project-focus-bar" aria-label="Project navigation">
      {onResumeWalk ? <button onClick={onResumeWalk}>← Back to walk</button> : <a href={backRoute}>← {inWorld ? 'Return to hall' : 'Back to gallery'}</a>}
      <span role="status" aria-atomic="true"><span className="sr-only">{project.title}. </span>{inWorld ? count > 1 ? 'Exhibit ' : 'Project space' : <span className="sr-only">Project </span>}{(!inWorld || count > 1) && <>{index + 1} / {count}</>}</span>
      {count > 1 && <div>
        {previous ? <a data-project-step="previous" href={projectRoute(previous.id)} aria-label={`Previous project: ${previous.title}`} aria-keyshortcuts={keyboardNavigation ? 'ArrowLeft' : undefined} title={previous.title}>← <span>Previous</span></a>
          : <button type="button" data-project-step="previous" className="project-end" aria-disabled="true" aria-label="First project" title="First project">← <span>Previous</span></button>}
        {next ? <a data-project-step="next" href={projectRoute(next.id)} aria-label={`Next project: ${next.title}`} aria-keyshortcuts={keyboardNavigation ? 'ArrowRight' : undefined} title={next.title}><span>Next</span> →</a>
          : <button type="button" data-project-step="next" className="project-end" aria-disabled="true" aria-label="Last project" title="Last project"><span>Next</span> →</button>}
      </div>}
    </nav>
    {count > 1 && keyboardNavigation && <p className="project-key-hint"><span><kbd>←</kbd> <kbd>→</kbd> {inWorld ? 'Switch exhibits' : 'Browse projects'}</span><span><kbd>Esc</kbd> {onResumeWalk ? 'Walk' : inWorld ? 'Hall' : 'Gallery'}</span></p>}
    <header className="project-heading"><p className="eyebrow">{project.category}</p><h1 tabIndex={-1}>{project.title}</h1><p className="project-lead">{project.summary}</p><ProjectLinks project={project} onWalkAround={onWalkAround} showWalkHere={Boolean(!inWorld && keyboardNavigation && onWalkAround)} onPlayVideo={onPlayVideo} /></header>
    {world && inWorld && <p className="world-reading-note">{projectWorlds[world].provenance}</p>}
    {exhibitNote}
    {project.image && <ProjectMedia key={project.id} title={project.title} image={project.image} gallery={project.gallery} onOpenChange={onImageViewerChange} viewerRef={mediaRef} />}
    <div className="project-facts"><div><h2>My role</h2><p>{project.role}</p></div><div><h2>Status</h2><p>{project.status}</p></div><div><h2>Tools</h2><p>{project.tools.join(', ')}</p></div></div>
    <div className="case-body"><section><h2>The problem</h2><p>{project.problem}</p></section><section><h2>My contribution</h2><ul>{project.contribution.map(item => <li key={item}>{item}</li>)}</ul></section><section className="current-state"><h2>Where it stands</h2><p>{project.currentState}</p></section>{internal && <p className="privacy-note">This is a high-level account of internal work. Source code, client details and company systems are not public.</p>}</div>
    {world && !inWorld && <aside className="project-world-invitation"><span className="world-symbol" aria-hidden="true">↗</span><div><p className="eyebrow">Explore in this hall</p><h2>{projectWorlds[world].title}</h2><p>{projectWorlds[world].description}</p><a href={projectWorldRoute(world, project.id)}>Enter the project island <Arrow /></a><p className="world-provenance">{projectWorlds[world].provenance}</p></div></aside>}
    <div className="case-end"><a href={backRoute}>← {inWorld ? 'Return to hall' : 'Continue through the gallery'}</a>{next ? <a data-project-step="next" href={projectRoute(next.id)}>Next: {next.title} <Arrow /></a> : <a href={`mailto:${profile.email}`}>Talk about this project <Arrow diagonal /></a>}</div>
  </main>
}

export function Resume() {
  const selected = ['food-wars', 'avvr', 'petbot'].map(id => projects.find(project => project.id === id)!)
  return <main id="main" className="resume page-width" tabIndex={-1}>
    <div className="resume-toolbar"><a href="#about">← Back to portfolio</a><button className="solid-link" onClick={() => window.print()}>Print / save as PDF <Arrow /></button></div>
    <article className="resume-paper"><header><h1 tabIndex={-1}>{profile.name}</h1><p className="resume-subtitle">Power systems · Software development · Technical integration</p><div className="resume-contact"><span>{profile.location}</span><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={profile.linkedin}>LinkedIn</a><a href={profile.github}>GitHub</a><a href={profile.experiments}>Graphics & VR repos</a></div></header>
      <p className="resume-summary">Power systems consultant with professional Python development experience and a First Class MEng. Building internal engineering tools alongside web applications, AI integrations and interactive 3D projects. Interested in hands-on software delivery, solutions engineering and immersive technology. Remote-first; open to hybrid roles around Liverpool and Manchester.</p>
      <section><h2>Experience</h2>{experience.map(item => <div className="resume-entry" key={item.organisation}><div className="resume-entry-heading"><h3>{item.organisation} · {item.title}</h3><span>{item.dates}</span></div><p>{item.description}</p>{item.organisation === 'TNEI' && <p>Internal reporting workbench: FastAPI, React and PostgreSQL, hosted on a company Ubuntu VM with Docker and Microsoft SSO. Under development.</p>}</div>)}</section>
      <section><h2>Selected projects</h2>{selected.map(project => <div className="resume-entry" key={project.id}><div className="resume-entry-heading"><h3><a href={project.links[0].url}>{project.title}</a></h3><span>{project.status}</span></div><p>{project.role} {project.id === 'food-wars' ? 'Next.js and Supabase kitchen app with Ollama and an OAuth-protected MCP interface.' : project.id === 'avvr' ? 'Integrated existing reconstruction models, Unity and spatial audio; built a PyQt6 debugging interface.' : 'Developed the Flask/Socket.IO server and integrated local LLM processing and sentiment analysis.'}</p></div>)}</section>
      <section><h2>Education</h2><div className="resume-entry-heading"><h3>University of Southampton · MEng Electrical & Electronic Engineering</h3><span>2021–2025</span></div><p>First Class Honours</p></section>
      <section><h2>Technical experience</h2><p>Python, TypeScript / JavaScript, SQL, C# · React / Next.js, FastAPI, Flask · Docker, Linux, Git, GitHub Actions, pytest, Vitest, Playwright · PowerFactory, IPSA</p></section>
      <p className="resume-date">Updated {profile.updated}</p>
    </article>
  </main>
}
