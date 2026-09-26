import { lazy, Suspense } from 'react'
import type { MutableRefObject } from 'react'
import type { Project } from '@/data/portfolio'
import { projectWorlds, projectWorldRoute } from '@/data/projectWorlds'
import type { ProjectWorldId } from '@/data/projectWorlds'
import { avvrArchiveEnabled, avvrClasses } from '@/data/avvrArchive'
import type { AvvrArchiveState, AvvrPresentation } from '@/data/avvrArchive'
import type { DroneBuildDetail } from '@/data/droneBuild'

const DroneBuildNotes = lazy(() => import('./DroneBuildNotes'))

type Props = {
  world: ProjectWorldId
  project?: Project
  presentation: AvvrPresentation
  onPresentation: (mode: AvvrPresentation) => void
  archiveState: AvvrArchiveState
  sourcePosition: number
  onSourceChange: (index: number) => void
  worldAction: MutableRefObject<string | null>
  droneDetail: DroneBuildDetail | null
  onDroneDetail: (detail: DroneBuildDetail | null) => void
  audio: { playing: boolean; error: boolean; toggle: () => void; volume: number; onVolume: (volume: number) => void }
  onVideo: (id: string, origin: HTMLElement | null) => void
  onMap: () => void
}

/** Load exhibit-specific controls only when a visitor enters a project space. */
export default function ProjectIslandControls({ world, project, presentation, onPresentation, archiveState, sourcePosition, onSourceChange, worldAction, droneDetail, onDroneDetail, audio, onVideo, onMap }: Props) {
  const labels = presentation === 'labels' || presentation.startsWith('labels/')
  const selectedClass = avvrClasses.find(item => presentation === `labels/${item.name}`)
  const archiveStatus = presentation === 'photo'
    ? archiveState.photo === 'error' ? 'Photo unavailable. Try Reconstruction or Sound demo.' : archiveState.photo !== 'ready' ? 'Opening the source photograph…' : 'Original 360° photograph'
    : archiveState.model === 'error' ? 'Model unavailable. Try the source photograph or sound demo.' : archiveState.model === 'loading' ? 'Opening the archived model…' : selectedClass ? `${selectedClass.name} predictions highlighted` : 'Listening room · ceiling removed'
  const resetView = () => {
    onDroneDetail(null)
    if (selectedClass) onPresentation('labels')
    worldAction.current = 'reset'
  }
  return <>
    {world === 'avvr' && avvrArchiveEnabled && <div className="archive-views" role="group" aria-label="AVVR exhibit views">
      <button aria-pressed={presentation === 'model' || labels} onClick={() => onPresentation('model')}>Reconstruction</button>
      <button aria-pressed={presentation === 'photo'} onClick={() => onPresentation('photo')}>360° source</button>
      <button aria-pressed={presentation === 'sound'} onClick={() => onPresentation('sound')}>Sound demo</button>
    </div>}
    {world === 'hardware' && <nav className="world-stations" aria-label="Workshop stations">{projectWorlds.hardware.projects.map(id => <a key={id} href={projectWorldRoute('hardware', id)} aria-current={project?.id === id ? 'location' : undefined}>{id === 'petbot' ? '01 / PetBot' : '02 / FPV drone'}</a>)}</nav>}
    <div className="world-interaction-row">
      {world === 'avvr' && presentation !== 'sound' ? <div className="archive-options">
        {presentation !== 'photo' && <button aria-pressed={labels} onClick={() => onPresentation(labels ? 'model' : 'labels')}>Model labels</button>}
        <span role="status">{archiveStatus}</span>
      </div> : <fieldset><legend>{world === 'avvr' ? 'Sound source' : project?.id === 'fpv-drone' ? 'Flight pad' : 'PetBot assembly'}</legend>{(world === 'avvr' ? ['Left', 'Centre', 'Right'] : project?.id === 'fpv-drone' ? ['Landed', 'Hover'] : ['Assembled', 'Open shell']).map((label, index) => <button key={label} aria-pressed={sourcePosition === index} onClick={() => onSourceChange(index)}>{label}</button>)}</fieldset>}
      <div className="world-view-controls"><button aria-label="Orbit room left" onClick={() => { worldAction.current = 'left' }}>←</button><button aria-label="Reset view" title="Reset view" onClick={resetView}><span className="world-reset-icon" aria-hidden="true">↺</span><span className="world-reset-label" aria-hidden="true">Reset view</span></button><button aria-label="Orbit room right" onClick={() => { worldAction.current = 'right' }}>→</button></div>
    </div>
    {world === 'avvr' && labels && <div className="archive-predictions">
      <p>Highlight a prediction</p>
      <div className="archive-legend" role="group" aria-label="Model predictions">
        <button data-avvr-class="all" aria-pressed={!selectedClass} onClick={() => onPresentation('labels')}>All</button>
        {avvrClasses.map(item => <button key={item.name} data-avvr-class={item.name} aria-pressed={selectedClass === item} onClick={() => onPresentation(selectedClass === item ? 'labels' : `labels/${item.name}`)}><i aria-hidden="true" style={{ background: `rgb(${item.color.map(value => Math.round(value * 255)).join(' ')})` }} />{item.name}</button>)}
      </div>
    </div>}
    <div className="world-listen">{world === 'avvr' ? presentation === 'sound' ? <><button className="world-play" onClick={audio.toggle} aria-pressed={audio.playing}><span aria-hidden="true">{audio.playing ? '■' : '▷'}</span>{audio.playing ? 'Stop sound' : 'Play sound'}</button><label className="world-volume">Volume<input type="range" min="0" max="100" step="5" value={Math.round(audio.volume * 100)} onChange={event => audio.onVolume(Number(event.target.value) / 100)} aria-valuetext={`${Math.round(audio.volume * 100)} percent`} /></label></> : <a href="https://cvssp.org/data/s3a/public/AV-Analysis2/" target="_blank" rel="noreferrer">S3A scene data & research ↗</a> : project?.video && <button className="world-video-button" onClick={event => onVideo(project.id, event.currentTarget)} aria-haspopup="dialog"><span aria-hidden="true">▷</span> {project.id === 'fpv-drone' ? 'Watch the flight' : 'Watch the team demo'}</button>}<button className="world-map-button" onClick={onMap}>Use hall map</button></div>
    {world === 'avvr' && <p className="world-audio-note" role={audio.error && presentation === 'sound' ? 'status' : undefined}>{presentation === 'sound' ? audio.error ? 'Audio could not start. Try Play sound again, or explore the room without it.' : 'A separate spatial-audio illustration. Headphones recommended.' : labels ? 'Predicted classes from the archived pipeline, including its mistakes.' : presentation === 'photo' ? 'Look around from the original camera position.' : 'Original project geometry, shown with a neutral display finish.'}</p>}
    {world === 'hardware' && project?.id === 'fpv-drone' && <Suspense fallback={null}><DroneBuildNotes selected={droneDetail} onSelect={onDroneDetail} /></Suspense>}
  </>
}
