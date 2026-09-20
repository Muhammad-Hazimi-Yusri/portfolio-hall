// Spatial presentation of the same reviewed content used by the main portfolio.
import { experience, profile, projects, professionalWork } from './portfolio'
import type { POI } from '@/types/poi'

const thumbnail = (path: string) => `${import.meta.env.BASE_URL}${path}`
const defaultThumbnail = thumbnail('favicon.svg')
const galleryProjects = [...professionalWork, ...projects]

export const pois: POI[] = [
  {
    id: 'about', type: 'pedestal', section: 'about', zone: 'arrival',
    position: { x: 0, z: 0 }, rotation: 180,
    content: { title: profile.name, thumbnail: defaultThumbnail, description: 'Graduate consultant in TNEI’s Connections team, based in Liverpool. I work on power-system studies and develop engineering tools, web applications and graphics experiments.', links: [{ label: 'Read the portfolio', url: '#about' }] },
  },
  {
    id: 'contact', type: 'pedestal', section: 'contact', zone: 'horizon',
    position: { x: 0, z: 85 }, rotation: 0,
    content: { title: 'Contact', thumbnail: defaultThumbnail, description: 'Interested in software delivery, applied AI and technical consulting roles.', links: [{ label: 'Email', url: `mailto:${profile.email}` }, { label: 'LinkedIn', url: profile.linkedin }, { label: 'GitHub', url: profile.github }] },
  },
  ...experience.map((item, index): POI => ({
    id: ['tnei', 'audioscenic', 'southampton-research'][index],
    type: 'pedestal', section: 'experience', zone: 'observatory',
    position: { x: [-3, 3, 0][index], z: index === 2 ? 71 : 65 }, rotation: 0,
    content: { title: `${item.organisation} — ${item.title}`, thumbnail: defaultThumbnail, description: `${item.dates}. ${item.description}` },
  })),
  ...galleryProjects.map((project, index): POI => ({
    id: project.id === 'balairung' ? 'portfolio-hall' : project.id,
    type: 'painting', section: 'projects', zone: 'gallery',
    position: { x: -4.5, z: 10 + index * (44 / Math.max(9, galleryProjects.length - 1)) }, rotation: 90,
    content: {
      title: project.title,
      thumbnail: project.image ? thumbnail(project.image.src) : '',
      thumbnails: project.image ? [thumbnail(project.image.src)] : undefined,
      description: `${project.summary} ${project.role} ${project.currentState}`,
      storyHook: project.summary, challenge: project.problem,
      approach: project.contribution.join(' '), outcome: project.currentState,
      tags: project.tools,
      links: [{ label: 'Project notes', url: `#project/${project.id}` }, ...project.links.filter(link => link.url !== '#explore')],
    },
  })),
]

export default { pois }
