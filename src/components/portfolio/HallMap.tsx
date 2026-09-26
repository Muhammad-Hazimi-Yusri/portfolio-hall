import { useEffect, useId, useRef, useState } from 'react'
import { hallDecks, hallStops, galleryPosition, galleryColumns, hallPlantings } from '@/data/hallLayout'
import { experience, professionalWork, projects } from '@/data/portfolio'
import type { Project } from '@/data/portfolio'
import { countryLabel, emptyCommunity, visitPosition, zoneLabel } from '@/data/community'
import type { Community } from '@/data/community'
import { projectWorlds, projectWorldRoute, worldForProject } from '@/data/projectWorlds'
import type { ProjectWorldId } from '@/data/projectWorlds'

const exhibits = [...professionalWork, ...projects]
const columns = galleryColumns(exhibits.map((_, index) => galleryPosition(index, exhibits.length)))

type PreviewHandlers = { hover: (id: string | null) => void; focus: (id: string | null) => void }
function previewEvents(id: string, handlers: PreviewHandlers) {
  return {
    onMouseEnter: () => handlers.hover(id), onMouseLeave: () => handlers.hover(null),
    onFocus: () => handlers.focus(id), onBlur: () => handlers.focus(null),
  }
}

function Drawing({ view, section, community, preview, focused, detailed, handlers, compact = false }: { view: string; section: string; community: Community; preview: string | null; focused: string | null; detailed: boolean; handlers: PreviewHandlers; compact?: boolean }) {
  const gridId = useId()
  const scale = compact ? 5.9 : 6.2
  const point = (x: number, z: number) => compact ? [65 + z * scale, 116 + x * scale] : [125 + x * scale, 602 - z * scale]
  const selectedProject = exhibits.findIndex(item => item.id === view)
  const selectedExperience = experience.findIndex(item => `experience/${item.id}` === view)
  const selectedZ = selectedProject >= 0 ? galleryPosition(selectedProject, exhibits.length) : selectedExperience >= 0 ? selectedExperience === 2 ? 69 : 65 : hallStops.find(stop => stop.id === section)?.z ?? 0
  const selectedX = selectedExperience >= 0 ? [-2.75, 2.75, 0][selectedExperience] : 0
  const [markerX, markerY] = point(selectedX, selectedZ)
  const focusProject = exhibits.findIndex(item => item.id === focused)
  const focusExperience = experience.findIndex(item => `experience/${item.id}` === focused)
  const focusZ = focusProject >= 0 ? galleryPosition(focusProject, exhibits.length) : focusExperience >= 0 ? focusExperience === 2 ? 69 : 65 : selectedZ
  const galleryX = compact ? -2 : -1.5
  const focusX = focusExperience >= 0 ? [-2.75, 2.75, 0][focusExperience] : focusProject >= 0 ? galleryX : selectedExperience >= 0 ? selectedX : selectedProject >= 0 || section === 'work' || section === 'projects' ? galleryX : 0
  const [focusMapX, focusMapY] = point(focusX, focusZ)
  const zoom = detailed ? compact ? 4 : 3.2 : 1
  const transform = detailed ? `translate(${(compact ? 330 : 209) - focusMapX * zoom} ${(compact ? 116 : 332) - focusMapY * zoom}) scale(${zoom})` : 'translate(0 0) scale(1)'
  const deckShapes = hallDecks.map(deck => {
    const [cx, cy] = point(deck.x, deck.z)
    const width = (compact ? deck.depth : deck.width) * scale, height = (compact ? deck.width : deck.depth) * scale
    return deck.round ? <circle key={deck.id} cx={cx} cy={cy} r={deck.width * scale / 2} />
      : <rect key={deck.id} x={cx - width / 2} y={cy - height / 2} width={width} height={height} />
  })
  const [startX, startY] = point(0, 0), [endX, endY] = point(0, 87)
  return <svg className={`${compact ? 'map-drawing map-drawing-compact' : 'map-drawing map-drawing-full'}${detailed ? ' is-detailed' : ''}`} viewBox={compact ? '0 14 660 194' : '48 22 322 620'} aria-label="Interactive floor plan of Balairung">
    <defs><pattern id={gridId} width="31" height="31" patternUnits="userSpaceOnUse"><path d="M31 0H0V31" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".15" /></pattern></defs>
    <rect x={compact ? 0 : 48} y={compact ? 0 : 22} width={compact ? 660 : 322} height={compact ? 245 : 620} fill={`url(#${gridId})`} aria-hidden="true" />
    <g className="map-cartography" transform={transform}>
    <g className="map-foundation" transform="translate(2 3)" aria-hidden="true">{deckShapes}</g>
    <g className="map-deck" aria-hidden="true">{deckShapes}</g>
    <g className="map-structure" aria-hidden="true">
      <path className="map-gallery-wall" d={`M${point(-5, 8).join(' ')}L${point(-5, 58).join(' ')}`} />
      {columns.flatMap(z => [-4.65, 4.65].map(x => {
        const [cx, cy] = point(x, z)
        return <rect key={`${x}/${z}`} x={cx - .18 * scale} y={cy - .18 * scale} width={.36 * scale} height={.36 * scale} />
      }))}
    </g>
    <g className="map-timber" aria-hidden="true">{[4, 5, 6, 7, 58, 59, 60, 61, 62, 76, 78, 80, 82].map(z => {
      const [x, y] = point(0, z)
      return <path key={z} d={compact ? 'M' + x + ' ' + (y - 10) + 'v20' : 'M' + (x - 10) + ' ' + y + 'h20'} />
    })}</g>
    <path className="map-route" d={'M' + startX + ' ' + startY + 'L' + endX + ' ' + endY} fill="none" aria-hidden="true" />
    <path className="map-route-progress" d={`M${startX} ${startY}L${point(0, selectedZ).join(' ')}L${markerX} ${markerY}`} fill="none" aria-hidden="true" />
    <g className="map-architecture" aria-hidden="true">
      {exhibits.map((item, index) => {
        const [x, y] = point(-5.3, galleryPosition(index, exhibits.length))
        return <path key={item.id} d={compact ? 'M' + (x - 10) + ' ' + y + 'h20' : 'M' + x + ' ' + (y - 10) + 'v20'} />
      })}
      {[24, 43].map(z => { const [x, y] = point(3.4, z); return <rect key={z} x={x - (compact ? 8 : 3)} y={y - (compact ? 3 : 8)} width={compact ? 16 : 6} height={compact ? 6 : 16} /> })}
      {hallPlantings.map(plant => { const [x, y] = point(plant.x, plant.z); return <circle className="map-plant" key={`${plant.x}/${plant.z}`} cx={x} cy={y} r={3.5 * plant.scale} /> })}
    </g>
    <g className="map-exhibits">{exhibits.map((project, index) => {
      const [x, y] = point(-3.85, galleryPosition(index, exhibits.length))
      return compact && !detailed ? <rect aria-hidden="true" className={'map-exhibit' + (project.id === view ? ' selected' : '') + (project.id === preview ? ' is-preview' : '')} key={project.id} x={x - 7} y={y - 3} width="14" height="6" />
        : <a key={project.id} href={'#project/' + project.id} aria-label={'Open ' + project.title} aria-current={project.id === view ? 'location' : undefined} data-preview={project.id === preview || undefined} {...previewEvents(project.id, handlers)}>
          <title>{project.title}</title><rect className="map-hit-area" x={x - (compact ? 12 : 37)} y={y - (compact ? 12 : 13)} width={compact ? 24 : 49} height={compact ? 24 : 26} />
          <rect className="map-exhibit" x={x - (compact ? 7 : 3)} y={y - (compact ? 3 : 7)} width={compact ? 14 : 6} height={compact ? 6 : 14} />
          <text x={compact ? x : x - 18} y={y + (compact ? 16 : 4)} textAnchor={compact ? 'middle' : 'end'}>{String(index + 1).padStart(2, '0')}</text>
        </a>
    })}</g>
    <g className="map-experience">{experience.map((item, index) => {
      const [x, y] = point([-2.75, 2.75, 0][index], index === 2 ? 69 : 65)
      return compact && !detailed ? <circle className={preview === `experience/${item.id}` ? 'is-preview' : undefined} key={item.id} cx={x} cy={y} r="5" /> : <a key={item.id} href={'#experience/' + item.id} aria-label={'Open ' + item.organisation + ' experience'} aria-current={selectedExperience === index ? 'location' : undefined} data-preview={preview === `experience/${item.id}` || undefined} {...previewEvents(`experience/${item.id}`, handlers)}>
        <title>{item.organisation}</title><circle className="map-hit-area" cx={x} cy={y} r="12" /><circle cx={x} cy={y} r="5" />
      </a>
    })}</g>
    <g className="map-location" transform={`translate(${markerX} ${markerY}) scale(${1 / Math.sqrt(zoom)})`} aria-hidden="true"><circle className="map-location-halo" r="12" /><path className="map-location-marker" d="M0-7L6 0L0 7L-6 0Z" /></g>
    {!compact && !detailed && <g className="map-visitor-boats">{community.visits.map((visit, index) => {
      const [, y] = point(0, visitPosition(visit, index).z)
      return <a key={index} href="#guestbook/visitors" aria-label={`Visitor log: ${countryLabel(visit.country)}, last at ${zoneLabel[visit.zone]}`}><g transform={`translate(${336 + index % 3 * 12} ${y})`}><title>{countryLabel(visit.country)} · {zoneLabel[visit.zone]}</title><rect className="map-hit-area" x="-5" y="-9" width="11" height="16" /><path d="M-3 5L-4-2L0-7L4-2L3 5Z" /><path d="M0 1V-4L6-2H0" /></g></a>
    })}</g>}
    {!detailed && <g className="map-room-links">{hallStops.map((stop, index) => {
      const [x, y] = point(0, stop.z)
      const labelX = compact ? x : 187
      const labelY = compact ? index === 1 || index === 3 ? 185 : 42 : y
      return <a key={stop.id} href={'#' + stop.id} aria-label={'Go to ' + stop.label} aria-current={stop.id === section ? 'location' : undefined}>
        <path className="map-leader" d={compact ? 'M' + x + ' ' + (y + (labelY > y ? 42 : -35)) + 'V' + (labelY + (labelY > y ? -27 : 14)) : 'M' + (x + (index === 3 ? 46 : 33)) + ' ' + y + 'H' + (labelX - 8)} />
        <rect className="map-hit-area" x={compact ? labelX - 47 : labelX - 7} y={labelY - (compact ? 23 : 31)} width={compact ? 94 : 76} height={compact ? 44 : 52} rx="2" />
        <text className="map-room-number" x={labelX} y={labelY - (compact ? 9 : 17)} textAnchor={compact ? 'middle' : 'start'}>{stop.number}</text>
        <text className="map-room-name" x={labelX} y={labelY + 9} textAnchor={compact ? 'middle' : 'start'}>{stop.label}</text>
      </a>
    })}</g>}
    </g>
  </svg>
}

function IndexGroup({ title, items, view, preview, handlers }: { title: string; items: Project[]; view: string; preview: string | null; handlers: PreviewHandlers }) {
  return <section className="map-index-group"><h3>{title}<span>{String(items.length).padStart(2, '0')}</span></h3>{items.map(item => <a key={item.id} href={'#project/' + item.id} aria-current={item.id === view ? 'location' : undefined} data-preview={item.id === preview || undefined} {...previewEvents(item.id, handlers)}>
    <span className="map-index-number">{String(exhibits.indexOf(item) + 1).padStart(2, '0')}</span><span>{item.title}</span><span className="map-index-arrow" aria-hidden="true">↗</span>
  </a>)}</section>
}

export default function HallMap({ view, section, community = emptyCommunity, onOpenWorld }: { view: string; section: string; community?: Community; onOpenWorld: (route: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null), [focused, setFocused] = useState<string | null>(null)
  const [detailed, setDetailed] = useState(false)
  const directoryRef = useRef<HTMLElement>(null)
  const preview = focused ?? hovered
  const handlers = { hover: setHovered, focus: setFocused }
  const project = exhibits.find(item => item.id === view)
  const role = experience.find(item => 'experience/' + item.id === view)
  const spaceRoute = (id: ProjectWorldId) => projectWorldRoute(id, worldForProject(view) === id ? view : projectWorlds[id].projects[0])
  const stop = hallStops.find(item => item.id === section) ?? hallStops[0]
  const previewProject = exhibits.find(item => item.id === preview)
  const previewRole = experience.find(item => `experience/${item.id}` === preview)
  const planTitle = previewProject?.title ?? previewRole?.organisation ?? project?.title ?? role?.organisation ?? stop.label
  const isPreviewing = Boolean(preview && preview !== view)
  useEffect(() => {
    const directory = directoryRef.current
    if (!directory) return
    const revealCurrent = () => {
      const current = directory.querySelector<HTMLElement>('a[aria-current]')
      if (!current || !directory.clientHeight) return
      // Move only this directory, never the document or its reading panel.
      const bounds = directory.getBoundingClientRect(), item = current.getBoundingClientRect()
      const heading = current.closest('section')?.querySelector('h3')?.getBoundingClientRect().height ?? 0
      if (item.top < bounds.top + heading) directory.scrollTop += item.top - bounds.top - heading
      else if (item.bottom > bounds.bottom) directory.scrollTop += item.bottom - bounds.bottom
    }
    revealCurrent()
    const observer = new ResizeObserver(revealCurrent)
    observer.observe(directory)
    return () => observer.disconnect()
  }, [view])
  return <div className="hall-map">
    <div className="map-toolbar">
    <div className="map-heading"><span>Floor plan</span><span className={isPreviewing ? 'map-preview-label' : undefined} title={isPreviewing ? planTitle : undefined}>{isPreviewing ? <>On the plan · <strong>{planTitle}</strong></> : <>{exhibits.length} exhibits · {experience.length} roles</>}</span></div>
    <div className="map-navigation-controls"><button className="map-scale" onClick={() => setDetailed(value => !value)} aria-label={detailed ? 'Show the whole hall on the map' : 'Look closer at this area of the map'}><span className="map-scale-symbol" aria-hidden="true">{detailed ? '−' : '+'}</span><span className="map-scale-label">{detailed ? 'Whole hall' : 'Closer view'}</span></button>
    <select className="map-jump" aria-label="Jump to an exhibit or 3D space" value={project ? `#project/${project.id}` : role ? `#experience/${role.id}` : ''} onChange={event => { const route = event.target.value; if (route.startsWith('#world/')) onOpenWorld(route); else window.location.hash = route }}>
      <option value="" disabled>Choose an exhibit or space</option>
      <optgroup label="Professional work">{professionalWork.map(item => <option key={item.id} value={`#project/${item.id}`}>{String(exhibits.indexOf(item) + 1).padStart(2, '0')} · {item.title}</option>)}</optgroup>
      <optgroup label="Projects">{projects.map(item => <option key={item.id} value={`#project/${item.id}`}>{String(exhibits.indexOf(item) + 1).padStart(2, '0')} · {item.title}</option>)}</optgroup>
      <optgroup label="Experience">{experience.map(item => <option key={item.id} value={`#experience/${item.id}`}>{item.organisation}</option>)}</optgroup>
      <optgroup label="Open a 3D project space">{(Object.keys(projectWorlds) as ProjectWorldId[]).map(id => <option key={id} value={spaceRoute(id)}>{projectWorlds[id].title}</option>)}</optgroup>
    </select>
    </div>
    </div>
    <div className="map-body">
      <div className="map-plan"><Drawing view={view} section={section} community={community} preview={preview} focused={focused} detailed={detailed} handlers={handlers} /><Drawing view={view} section={section} community={community} preview={preview} focused={focused} detailed={detailed} handlers={handlers} compact />
        <div className="map-current map-legend"><span><i className="map-current-dot" aria-hidden="true" />Your place</span>{!detailed && community.visits.length > 0 && <span title="Recent browser sessions, shown at their last section"><svg viewBox="-6 -8 16 16" width="16" height="16" aria-hidden="true"><path d="M-3 5L-4-2L0-7L4-2L3 5Z" /><path d="M0 1V-4L6-2H0" /></svg>Recent visitors</span>}</div>
      </div>
      <nav ref={directoryRef} className="map-exhibit-index" aria-label="Exhibits on the floor plan" data-hall-scroll="native">
        <IndexGroup title="Professional work" items={professionalWork} view={view} preview={preview} handlers={handlers} />
        <IndexGroup title="Projects" items={projects} view={view} preview={preview} handlers={handlers} />
        <section className="map-index-group"><h3>Experience<span>{String(experience.length).padStart(2, '0')}</span></h3>{experience.map(item => <a key={item.id} href={'#experience/' + item.id} aria-current={role === item ? 'location' : undefined} data-preview={preview === `experience/${item.id}` || undefined} {...previewEvents(`experience/${item.id}`, handlers)}><span className="map-index-role" aria-hidden="true">○</span><span>{item.organisation}</span><span className="map-index-arrow" aria-hidden="true">↗</span></a>)}</section>
        <section className="map-index-group map-spaces" aria-label="3D project spaces"><h3>Project spaces<span>3D</span></h3>{(Object.keys(projectWorlds) as ProjectWorldId[]).map(id => <a key={id} href={spaceRoute(id)}><span>{projectWorlds[id].title}</span><small>Enter <span aria-hidden="true">↗</span></small></a>)}</section>
      </nav>
    </div>
  </div>
}
