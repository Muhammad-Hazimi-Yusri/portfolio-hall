import { experience, professionalWork, profile, projects } from '@/data/portfolio'
import type { Project } from '@/data/portfolio'

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

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

function ProjectLinks({ project }: { project: Project }) {
  if (!project.links.length) return null
  return <div className="text-links">{project.links.map(link => <a key={link.url} href={link.url}>{link.label} <Arrow diagonal={!link.url.startsWith('#')} /></a>)}</div>
}

function ProjectImage({ project }: { project: Project }) {
  if (!project.image) return null
  return <img src={assetUrl(project.image.src)} alt={project.image.alt} width={project.image.width ?? 1920} height={project.image.height ?? 1080} loading="lazy" decoding="async" />
}

export function ProjectPage({ project }: { project: Project }) {
  const internal = professionalWork.some(item => item.id === project.id)
  return <main id="main" className="project-page page-width" tabIndex={-1}>
    <a className="back-link" href={internal ? '#work' : '#projects'}>← {internal ? 'Professional work' : 'All projects'}</a>
    <header className="project-heading"><p className="eyebrow">{project.category}</p><h1 tabIndex={-1}>{project.title}</h1><p className="project-lead">{project.summary}</p><ProjectLinks project={project} /></header>
    <div className="project-facts"><div><h2>My role</h2><p>{project.role}</p></div><div><h2>Status</h2><p>{project.status}</p></div><div><h2>Tools</h2><p>{project.tools.join(', ')}</p></div></div>
    {project.image && <figure className="case-image"><ProjectImage project={project} /><figcaption>{project.image.caption}</figcaption></figure>}
    <div className="case-body"><section><h2>The problem</h2><p>{project.problem}</p></section><section><h2>My contribution</h2><ul>{project.contribution.map(item => <li key={item}>{item}</li>)}</ul></section><section className="current-state"><h2>Where it stands</h2><p>{project.currentState}</p></section>{internal && <p className="privacy-note">This is a high-level account of internal work. Source code, client details and company systems are not public.</p>}</div>
    <div className="case-end"><a href={internal ? '#work' : '#projects'}>← Back to {internal ? 'professional work' : 'projects'}</a><a href={`mailto:${profile.email}`}>Talk about this project <Arrow diagonal /></a></div>
  </main>
}

export function Resume() {
  const selected = ['food-wars', 'avvr', 'petbot'].map(id => projects.find(project => project.id === id)!)
  return <main id="main" className="resume page-width" tabIndex={-1}>
    <div className="resume-toolbar"><a href="#about">← Back to portfolio</a><button className="solid-link" onClick={() => window.print()}>Print / save as PDF <Arrow /></button></div>
    <article className="resume-paper"><header><h1 tabIndex={-1}>{profile.name}</h1><p className="resume-subtitle">Power systems · Software development · Technical integration</p><div className="resume-contact"><span>{profile.location}</span><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={profile.linkedin}>LinkedIn</a><a href={profile.github}>GitHub</a><a href={profile.experiments}>Graphics & VR repos</a></div></header>
      <p className="resume-summary">First Class MEng graduate and power-systems consultant with professional Python development experience. Building internal engineering tools and personal web, AI-integration and graphics projects. Interested in software delivery and technical consulting roles.</p>
      <section><h2>Experience</h2>{experience.map(item => <div className="resume-entry" key={item.organisation}><div className="resume-entry-heading"><h3>{item.organisation} · {item.title}</h3><span>{item.dates}</span></div><p>{item.description}</p>{item.organisation === 'TNEI' && <p>Internal reporting workbench: FastAPI, React and PostgreSQL, hosted on a company Ubuntu VM with Docker and Microsoft SSO. Under development.</p>}</div>)}</section>
      <section><h2>Selected projects</h2>{selected.map(project => <div className="resume-entry" key={project.id}><div className="resume-entry-heading"><h3><a href={project.links[0].url}>{project.title}</a></h3><span>{project.status}</span></div><p>{project.role} {project.id === 'food-wars' ? 'Next.js and Supabase kitchen app with Ollama and an OAuth-protected MCP interface.' : project.id === 'avvr' ? 'Integrated existing reconstruction models, Unity and spatial audio; built a PyQt6 debugging interface.' : 'Developed the Flask/Socket.IO server and integrated local LLM processing and sentiment analysis.'}</p></div>)}</section>
      <section><h2>Education</h2><div className="resume-entry-heading"><h3>University of Southampton · MEng Electrical & Electronic Engineering</h3><span>2021–2025</span></div><p>First Class Honours</p></section>
      <section><h2>Technical experience</h2><p>Python, TypeScript / JavaScript, SQL, C# · React / Next.js, FastAPI, Flask · Docker, Linux, Git, GitHub Actions, pytest, Vitest, Playwright · PowerFactory, IPSA</p></section>
      <p className="resume-date">Updated {profile.updated}</p>
    </article>
  </main>
}
