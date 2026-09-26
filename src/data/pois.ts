// Spatial presentation of the same reviewed content used by the main portfolio.
import { experience, profile, projects, professionalWork } from './portfolio'
import type { POI } from '@/types/poi'
import { galleryPosition } from './hallLayout'

const thumbnail = (path: string) => `${import.meta.env.BASE_URL}${path}`
const defaultThumbnail = thumbnail('favicon.svg')
const galleryProjects = [...professionalWork, ...projects]

export const pois: POI[] = [
  {
    id: 'about', type: 'pedestal', section: 'about', zone: 'arrival',
    position: { x: 0, z: 0 }, rotation: 0,
    content: { title: 'Gallery guide', thumbnail: defaultThumbnail, description: 'Power systems consultant in TNEI’s Connections team, based in Liverpool. I develop engineering tools, web applications and interactive 3D projects.', links: [{ label: 'Enter the gallery', url: '#work' }, { label: 'Personal projects', url: '#projects' }, { label: 'Experience', url: '#about' }] },
  },
  {
    id: 'contact', type: 'pedestal', section: 'contact', zone: 'horizon',
    position: { x: 0, z: 85 }, rotation: 0,
    content: { title: 'Contact', thumbnail: defaultThumbnail, description: 'Open to conversations about applied AI, immersive technology and technical product development.', links: [{ label: 'Email', url: `mailto:${profile.email}` }, { label: 'LinkedIn', url: profile.linkedin }, { label: 'GitHub', url: profile.github }] },
  },
  ...experience.map((item, index): POI => ({
    id: item.id,
    type: 'pedestal', section: 'experience', zone: 'observatory',
    position: { x: [-2.75, 2.75, 0][index], z: index === 2 ? 69 : 65 }, rotation: 0,
    content: { title: `${item.organisation} — ${item.title}`, category: item.dates, role: item.title, storyHook: item.description, thumbnail: thumbnail(item.logo.src), description: `${item.dates}. ${item.description}`, links: [{ label: 'View experience', url: `#experience/${item.id}` }] },
    experienceDisplay: { name: item.organisation, role: item.title, dates: item.dates, src: thumbnail(item.logo.src), ink: item.logo.ink, motion: item.logo.motion, width: item.logo.width },
  })),
  ...galleryProjects.map((project, index): POI => ({
    id: project.id === 'balairung' ? 'portfolio-hall' : project.id,
    type: 'painting', section: 'projects', zone: 'gallery',
    position: { x: -4.5, z: galleryPosition(index, galleryProjects.length) }, rotation: 90,
    content: {
      title: project.title,
      category: project.category, role: project.role, status: project.status, exhibitSteps: project.exhibitSteps,
      thumbnail: project.image ? thumbnail(project.image.src) : '',
      imageCaption: project.image?.caption,
      image: project.image, gallery: project.gallery,
      thumbnails: project.image ? [thumbnail(project.image.src)] : undefined,
      description: `${project.summary} ${project.role} ${project.currentState}`,
      storyHook: project.summary, challenge: project.problem,
      approach: project.contribution.join(' '), outcome: project.currentState,
      tags: project.tools,
      links: [...(project.liveApp ? [{ label: 'Try live app', url: `#app/${project.id}` }] : []), { label: 'Project notes', url: `#project/${project.id}` }, ...project.links.filter(link => link.url !== '#explore')],
    },
  })),
]

export default { pois }
