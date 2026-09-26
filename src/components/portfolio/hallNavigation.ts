import { hallDecks, hallPlantings, hallStops } from '@/data/hallLayout'
import { pois } from '@/data/pois'
import { experience, professionalWork, projects } from '@/data/portfolio'
import { projectWorlds, worldFromHash, worldProjectFromHash } from '@/data/projectWorlds'
import type { ProjectWorldId } from '@/data/projectWorlds'
import { inspectionTarget } from '@/3d/exhibitViewing'

export type HallPoint = { x: number; y: number; z: number }
export type HallPose = { position: HallPoint; target: HallPoint }
export type WalkEntry = HallPose & { returnHash: string }
const eyeHeight = 1.6
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))
const projectsById = new Map([...professionalWork, ...projects].map(project => [project.id, project]))

export type ExhibitAction = { kind: 'route' | 'image' | 'notes' | 'video'; route: string; label: string; title: string; projectId?: string }

/** Use the same action for the hover hint and the pick. A selected still image
 * should open its viewer instead of navigating to the page already on screen. */
export function exhibitAction(route: string, focusedProject: string | null, navigationLabel?: string, action?: string): ExhibitAction {
  const [, type, id] = route.match(/^#(project|app)\/([^/]+)$/) ?? []
  const project = projectsById.get(id)
  if (project) {
    if (action === 'video' && project.video) return { kind: 'video', route, label: project.video.label, title: project.video.title, projectId: project.id }
    const label = navigationLabel?.startsWith('Previous:') ? 'Previous project' : 'Next project'
    if (navigationLabel) return { kind: 'route', route, label, title: project.title, projectId: project.id }
    if (type === 'app') return { kind: 'route', route, label: 'Try live app', title: project.title, projectId: project.id }
    if (focusedProject === project.id) return { kind: project.image ? 'image' : 'notes', route, label: project.image ? 'Enlarge image' : 'Read project notes', title: project.title, projectId: project.id }
    return { kind: 'route', route, label: 'Open project', title: project.title, projectId: project.id }
  }
  const world = worldFromHash(route)
  if (world) return { kind: 'route', route, label: 'Enter the island', title: projectWorlds[world].title, projectId: worldProjectFromHash(route) ?? undefined }
  const role = experience.find(item => route === `#experience/${item.id}`)
  if (role) return { kind: 'route', route, label: 'View experience', title: role.organisation }
  const stop = hallStops.find(item => `#${item.id}` === route)
  return { kind: 'route', route, label: route === '#work' ? 'Enter the gallery' : 'Go to', title: stop?.label ?? 'Portfolio' }
}

export function projectNeighbours(id: string, world: ProjectWorldId | null = null) {
  const siblings = world ? projectWorlds[world].projects.map(id => projectsById.get(id)!)
    : professionalWork.some(project => project.id === id) ? professionalWork : projects
  const index = siblings.findIndex(project => project.id === id)
  return { previous: siblings[index - 1], next: index >= 0 ? siblings[index + 1] : undefined, index, count: siblings.length }
}

/** An aerial browse camera must land on the nearest safe, body-width surface. */
export function walkablePoint(point: HallPoint): HallPoint {
  const candidates = hallDecks.map(deck => {
    let dx = point.x - deck.x, dz = point.z - deck.z
    if (deck.round) {
      const radius = deck.width / 2 - .8, distance = Math.hypot(dx, dz)
      if (distance > radius) { dx *= radius / distance; dz *= radius / distance }
    } else {
      dx = clamp(dx, -deck.width / 2 + .8, deck.width / 2 - .8)
      dz = clamp(dz, -deck.depth / 2 + .8, deck.depth / 2 - .8)
    }
    const candidate = { x: deck.x + dx, y: eyeHeight, z: deck.z + dz }
    // Planting sits on the outer edges. An aerial camera can project onto a
    // pot, so move that landing a body-width inward into the open aisle.
    for (const plant of hallPlantings) {
      const clearance = .47 * plant.scale + .55
      if (Math.hypot(candidate.x - plant.x, candidate.z - plant.z) < clearance) {
        candidate.x = plant.x - Math.sign(plant.x) * clearance
      }
    }
    return candidate
  })
  return candidates.reduce((best, candidate) => Math.hypot(candidate.x - point.x, candidate.z - point.z) < Math.hypot(best.x - point.x, best.z - point.z) ? candidate : best)
}

export function createWalkEntry(view: string, hash: string, pose?: HallPose | null): WalkEntry {
  const project = [...professionalWork, ...projects].find(item => item.id === view)
  const poi = pois.find(item => view === `experience/${item.id}` || item.content.links?.some(link => link.url === `#project/${view}`))
  const z = ({ work: 8.5, projects: 24, about: 61, contact: 82.5, 'visitor-landscape': 82.5 } as Record<string, number>)[view] ?? 2
  const fallback: HallPose = poi ? {
    position: { x: poi.type === 'painting' ? -.15 : poi.position.x - Math.sign(poi.position.x) * 1.3, y: eyeHeight, z: poi.position.z - (poi.type === 'painting' ? 2.3 : 4.3) },
    target: { x: poi.position.x, y: 1.8, z: poi.position.z },
  } : { position: { x: 0, y: eyeHeight, z }, target: { x: view === 'work' || view === 'projects' ? -4.5 : 0, y: eyeHeight, z: z + 7 } }
  const usable = pose && [...Object.values(pose.position), ...Object.values(pose.target)].every(Number.isFinite) ? pose : fallback
  const position = walkablePoint(usable.position)
  const target = { ...usable.target, y: clamp(usable.target.y, .8, 2.2) }
  if (Math.hypot(target.x - position.x, target.z - position.z) < .1) target.z += 3
  const returnHash = hash.startsWith('#project/') || hash.startsWith('#guestbook') ? hash : project ? `#gallery/${project.id}` : `#${view}`
  return { position, target, returnHash }
}

/** Returning after a walk opens the work now beside the visitor. */
export function returnFromWalk(entry: WalkEntry, current?: HallPose | null) {
  if (!current || Math.hypot(current.position.x - entry.position.x, current.position.z - entry.position.z) < 1.5) return entry.returnHash
  const { x, z } = current.position
  if (z < 7) return '#'
  if (z > 78) return '#contact'
  // Fitted phone approaches can sit on the bridge, beyond the old five-metre
  // proximity cutoff. Keep the experience actually faced from that position.
  const facing = { x: current.target.x - x, y: current.target.y - current.position.y, z: current.target.z - z }
  const facedExperience = inspectionTarget(current.position, facing, pois.filter(poi => poi.experienceDisplay).map(poi => ({
    value: poi.id, position: { ...poi.position, y: 1.9 }, reach: 7.4,
  })))
  if (facedExperience) return `#experience/${facedExperience}`
  if (z > 59) {
    const display = pois.filter(poi => poi.experienceDisplay).sort((a, b) => Math.hypot(a.position.x - x, a.position.z - z) - Math.hypot(b.position.x - x, b.position.z - z))[0]
    return display && Math.hypot(display.position.x - x, display.position.z - z) < 5 ? `#experience/${display.id}` : '#about'
  }
  const painting = pois.filter(poi => poi.type === 'painting').sort((a, b) => Math.abs(a.position.z - z) - Math.abs(b.position.z - z))[0]
  const link = painting?.content.links?.find(link => link.url.startsWith('#project/'))
  return link?.url.replace('#project/', '#gallery/') ?? '#projects'
}
