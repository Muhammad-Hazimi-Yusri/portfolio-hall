import { useEffect, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import type { POI } from '@/types/poi'

type Props = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
  onLook: (x: number, y: number) => void
  onJump: () => void
  onInteract: () => void
  nearbyTitle?: string
  nearbyAction?: string
  pois: POI[]
  onTeleportToPOI: (poi: POI) => void
  onSwitchMode?: () => void
  gyroEnabled: boolean
  onGyroToggle: () => void
  onGyroRecenter: () => void
  sprintEnabled: boolean
  onSprintToggle: () => void
  portrait: boolean
}

export function MobileControls(props: Props) {
  const held = useRef(new Map<number, [number, number]>())
  const look = useRef<{ id: number; x: number; y: number } | null>(null)
  const [direction, setDirection] = useState({ x: 0, y: 0 })
  const [destination, setDestination] = useState('')
  const latest = useRef(props); latest.current = props

  const updateMove = () => {
    let x = 0, y = 0
    held.current.forEach(value => { x += value[0]; y += value[1] })
    setDirection({ x, y })
    if (x || y) latest.current.onMove(x, y)
    else latest.current.onMoveEnd()
  }
  const release = (id: number) => { held.current.delete(id); updateMove() }
  const press = (event: ReactPointerEvent<HTMLButtonElement>, x: number, y: number) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    held.current.set(event.pointerId, [x, y]); updateMove()
  }
  useEffect(() => {
    const stop = () => { held.current.clear(); look.current = null; setDirection({ x: 0, y: 0 }); latest.current.onMoveEnd() }
    stop()
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', stop)
    return () => { stop(); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', stop) }
  }, [props.portrait])

  const directions = [
    { label: 'Move forward', symbol: '↑', x: 0, y: 1, area: 'forward' },
    { label: 'Move left', symbol: '←', x: -1, y: 0, area: 'left' },
    { label: 'Move right', symbol: '→', x: 1, y: 0, area: 'right' },
    { label: 'Move backward', symbol: '↓', x: 0, y: -1, area: 'backward' },
  ]
  return <div className={`walk-touch-controls ${props.portrait ? 'portrait' : 'landscape'}`}>
    <div className="walk-touch-nav">
      <button onClick={props.onSwitchMode}>← Portfolio</button>
      <select aria-label="Go to an exhibit" value={destination} onChange={event => {
        setDestination(event.target.value)
        const poi = props.pois.find(item => item.id === event.target.value)
        held.current.clear(); updateMove()
        if (poi) props.onTeleportToPOI(poi)
      }}>
        <option value="">Go to an exhibit…</option>
        {props.pois.map(poi => <option key={poi.id} value={poi.id}>{poi.experienceDisplay?.name ?? poi.content.title}</option>)}
      </select>
    </div>
    <div className="walk-look-pad" aria-label="Drag to look around"
      onPointerDown={event => {
        if (look.current) return
        event.currentTarget.setPointerCapture(event.pointerId)
        look.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      }}
      onPointerMove={event => {
        const point = look.current
        if (!point || point.id !== event.pointerId) return
        props.onLook(event.clientX - point.x, event.clientY - point.y)
        look.current = { id: point.id, x: event.clientX, y: event.clientY }
      }}
      onPointerUp={() => { look.current = null }}
      onPointerCancel={() => { look.current = null }}
      onLostPointerCapture={() => { look.current = null }}
    ><span>Drag to look</span></div>
    <div className="walk-touch-panel">
      <div className="walk-dpad" role="group" aria-label="Movement">
        <span aria-hidden="true">Walk</span>
        {directions.map(({ label, symbol, x, y, area }, index) => <button key={label} aria-label={label}
          className={direction.x * x > 0 || direction.y * y > 0 ? 'held' : ''}
          style={{ gridArea: area }}
          onPointerDown={event => press(event, x, y)}
          onPointerUp={event => release(event.pointerId)}
          onPointerCancel={event => release(event.pointerId)}
          onLostPointerCapture={event => release(event.pointerId)}
          onKeyDown={event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); held.current.set(-index - 1, [x, y]); updateMove() } }}
          onKeyUp={event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); release(-index - 1) } }}
          onBlur={() => release(-index - 1)}
        >{symbol}</button>)}
      </div>
      <div className="walk-touch-actions">
        <button className="walk-touch-inspect" disabled={!props.nearbyTitle} onClick={() => { held.current.clear(); updateMove(); props.onInteract() }}>
          {props.nearbyTitle ? `${props.nearbyAction ?? 'Inspect'} ${props.nearbyTitle}` : 'Face a nearby exhibit'}
        </button>
        <div className="walk-touch-options">
          <button onClick={props.onJump}>Jump</button>
          <button onClick={props.onSprintToggle} aria-pressed={props.sprintEnabled}>{props.sprintEnabled ? 'Running' : 'Run'}</button>
          {'DeviceOrientationEvent' in window && <button onClick={props.onGyroToggle} aria-pressed={props.gyroEnabled}>Tilt look</button>}
          {props.gyroEnabled && <button onClick={props.onGyroRecenter}>Recenter</button>}
        </div>
      </div>
    </div>
  </div>
}
