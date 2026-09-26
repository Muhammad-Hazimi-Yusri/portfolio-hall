import { droneBuildNotes, droneBuildSource } from '@/data/droneBuild'
import type { DroneBuildDetail } from '@/data/droneBuild'

export default function DroneBuildNotes({ selected, onSelect, placement = 'controls' }: { selected: DroneBuildDetail | null; onSelect: (detail: DroneBuildDetail | null) => void; placement?: 'controls' | 'page' }) {
  const note = droneBuildNotes.find(item => item.id === selected)
  const close = () => {
    onSelect(null)
    document.querySelector<HTMLButtonElement>(`[data-drone-detail="${selected}"]`)?.focus({ preventScroll: true })
  }
  const content = note && <div className={`drone-build-note drone-build-note-${placement === 'page' ? 'page' : 'stage'}`} aria-live="polite" aria-atomic="true">
    {placement === 'page' && <p className="eyebrow">Build note · {note.label}</p>}
    <div className="drone-note-heading"><h2>{note.title}</h2><button onClick={close} aria-label="Close build note and show the whole drone">×</button></div><p>{note.text}</p><a href={droneBuildSource} target="_blank" rel="noreferrer">Original build diary · 2023 ↗</a>
  </div>
  if (placement === 'page') return content
  return <section className="drone-build-notes" aria-label="Drone build notes">
    <div className="drone-detail-choices" role="group" aria-label="Inspect a drone component">
      <span>Build notes</span>
      {droneBuildNotes.map((item, index) => <button key={item.id} data-drone-detail={item.id} aria-pressed={selected === item.id} onClick={() => onSelect(selected === item.id ? null : item.id)}><span aria-hidden="true">0{index + 1}</span>{item.label}</button>)}
    </div>
    <p className="drone-note-prompt">Select a component on the model, or choose a build note.</p>
    {content}
  </section>
}
