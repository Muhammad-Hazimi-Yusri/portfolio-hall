import { useEffect, useRef, useState, useCallback } from 'react'
import nipplejs from 'nipplejs'
import type { POI } from '@/types/poi'
import type { CameraRef } from '@/3d/cameraRef'


type DPadProps = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
}

type ActionButtonsProps = {
  canInteract: boolean
  onInteract: () => void
  onMoveEnd: () => void
  onJump: () => void
}

type ToggleButtonsProps = {
  gyroEnabled: boolean
  onGyroToggle: () => void
  landscapeMode: boolean
  onLandscapeModeToggle: () => void
  sprintEnabled: boolean
  onSprintToggle: () => void
}

function DPad({ onMove, onMoveEnd }: DPadProps) {
  const dpadRef = useRef<HTMLDivElement>(null)
  const [activeDir, setActiveDir] = useState({ x: 0, y: 0 })

  const calculateDirection = (touchX: number, touchY: number) => {
    if (!dpadRef.current) return { x: 0, y: 0 }

    const rect = dpadRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = touchX - centerX
    const dy = touchY - centerY

    const threshold = 15
    let x = 0, y = 0

    if (Math.abs(dx) > threshold) x = dx > 0 ? 1 : -1
    if (Math.abs(dy) > threshold) y = dy > 0 ? -1 : 1

    return { x, y }
  }

  useEffect(() => {
    const updateFromTouches = (touches: TouchList) => {
      if (!dpadRef.current) return
      const rect = dpadRef.current.getBoundingClientRect()

      let totalX = 0, totalY = 0

      for (let i = 0; i < touches.length; i++) {
        const t = touches[i]
        if (t.clientX >= rect.left && t.clientX <= rect.right &&
            t.clientY >= rect.top && t.clientY <= rect.bottom) {
          const dir = calculateDirection(t.clientX, t.clientY)
          totalX += dir.x
          totalY += dir.y
        }
      }

      totalX = Math.max(-1, Math.min(1, totalX))
      totalY = Math.max(-1, Math.min(1, totalY))

      setActiveDir({ x: totalX, y: totalY })

      if (totalX !== 0 || totalY !== 0) {
        onMove(totalX, totalY)
      } else {
        onMoveEnd()
      }
    }

    const dpad = dpadRef.current
    if (!dpad) return

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      updateFromTouches(e.touches)
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      updateFromTouches(e.touches)
    }
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length === 0) {
        setActiveDir({ x: 0, y: 0 })
        onMoveEnd()
      } else {
        updateFromTouches(e.touches)
      }
    }

    dpad.addEventListener('touchstart', onTouchStart, { passive: false })
    dpad.addEventListener('touchmove', onTouchMove, { passive: false })
    dpad.addEventListener('touchend', onTouchEnd, { passive: false })
    dpad.addEventListener('touchcancel', onTouchEnd, { passive: false })

    return () => {
      dpad.removeEventListener('touchstart', onTouchStart)
      dpad.removeEventListener('touchmove', onTouchMove)
      dpad.removeEventListener('touchend', onTouchEnd)
      dpad.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onMove, onMoveEnd])

  const btnBase = "w-12 h-12 bg-hall-bg rounded-lg flex items-center justify-center text-2xl text-hall-muted select-none transition-colors"
  const activeClass = "bg-[#0F0A07] text-hall-accent"

  return (
    <div ref={dpadRef} className="relative grid grid-cols-3 gap-0.5 touch-none"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
    >
      <div />
      <div className={`${btnBase} rounded-b-none ${activeDir.y > 0 ? activeClass : ''}`}>▲</div>
      <div />
      <div className={`${btnBase} rounded-r-none ${activeDir.x < 0 ? activeClass : ''}`}>◀</div>
      {/* Center connector piece */}
      <div className="w-12 h-12 bg-hall-bg flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-hall-accent" />
      </div>
      <div className={`${btnBase} rounded-l-none ${activeDir.x > 0 ? activeClass : ''}`}>▶</div>
      <div />
      <div className={`${btnBase} rounded-t-none ${activeDir.y < 0 ? activeClass : ''}`}>▼</div>
      <div />
    </div>
  )
}

function ToggleButtons({ gyroEnabled, onGyroToggle, landscapeMode, onLandscapeModeToggle, sprintEnabled, onSprintToggle }: ToggleButtonsProps) {
  const Toggle = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
    <button
      onTouchEnd={(e) => { e.preventDefault(); onToggle() }}
      onClick={onToggle}
      className="flex flex-col items-center -rotate-[25deg]"
    >
      <div className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${active ? 'bg-hall-accent' : 'bg-hall-frame-light'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-gray-200 shadow transition-transform ${active ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
      <span className="text-[9px] text-hall-muted mt-1 uppercase tracking-wide font-medium"
        style={{ textShadow: '1px 1px 0 rgba(232,223,208,0.3), -1px -1px 0 rgba(28,20,16,0.4)' }}
      >
        {label}
      </span>
    </button>
  )

  return (
    <div className="flex gap-6">
      <Toggle label="Gyro" active={gyroEnabled} onToggle={onGyroToggle} />
      {gyroEnabled && (
        <Toggle label="Landscape" active={landscapeMode} onToggle={onLandscapeModeToggle} />
      )}
      <Toggle label="Run" active={sprintEnabled} onToggle={onSprintToggle} />
    </div>
  )
}

function ActionButtons({ canInteract, onInteract, onMoveEnd, onJump }: ActionButtonsProps) {
  const btnClass = "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold select-none shadow-md"

  return (
    <div className="relative w-32 h-20">
      <button
        className={`${btnClass} bg-hall-accent-warm text-hall-text active:bg-[#8C3425] ${canInteract ? 'ring-2 ring-hall-accent' : ''} absolute -top-4 right-0`}
        onTouchEnd={(e) => {
          e.preventDefault()
          if (canInteract) { onMoveEnd(); onInteract() }
        }}
        onClick={() => {
          if (canInteract) {
            onMoveEnd()
            onInteract()
          }
        }}
      >
        A
      </button>
      <button
        className={`${btnClass} bg-hall-frame-light text-hall-text active:bg-hall-frame absolute bottom-0 left-0`}
        onTouchStart={onJump}
      >
        B
      </button>
    </div>
  )
}

const POI_SECTIONS = ['projects', 'about', 'skills', 'contact'] as const

const toPercent = (z: number) => `${(z / 90) * 100}%`

type MiniProgressTrackProps = {
  playerZ: number
  pois: POI[]
  onTeleport: (x: number, z: number) => void
  onTeleportToPOI: (poi: POI) => void
}

function MiniProgressTrack({ playerZ, pois, onTeleport, onTeleportToPOI }: MiniProgressTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const teleportFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    onTeleport(0, ratio * 90)
  }, [onTeleport])

  return (
    <div
      ref={trackRef}
      className="relative h-full cursor-crosshair"
      onClick={(e) => teleportFromClientX(e.clientX)}
      onTouchEnd={(e) => { e.preventDefault(); const t = e.changedTouches[0]; if (t) teleportFromClientX(t.clientX) }}
    >
      {/* Track line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-hall-frame/50 rounded-full" />
      {/* Zone ticks */}
      <div className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-hall-frame/70"
        style={{ left: toPercent(8), width: toPercent(50) }} />
      <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-hall-frame/40 -translate-x-1/2"
        style={{ left: toPercent(68) }} />
      {/* POI dots */}
      {pois.map(poi => (
        <div
          key={poi.id}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-hall-accent/40 z-10"
          style={{ left: toPercent(poi.position.z) }}
          onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }}
          onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }}
        />
      ))}
      {/* Player dot */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-hall-accent pointer-events-none z-10"
        style={{ left: toPercent(playerZ) }}
      />
    </div>
  )
}

type POIPopoverProps = {
  pois: POI[]
  onTeleportToPOI: (poi: POI) => void
  onClose: () => void
}

function POIPopover({ pois, onTeleportToPOI, onClose }: POIPopoverProps) {
  return (
    <div className="absolute inset-0 z-[55]" onClick={onClose}>
      <div
        className="absolute top-11 right-2 w-48 max-h-[50vh] overflow-y-auto glass-panel-dark rounded-lg p-2"
        onClick={(e) => e.stopPropagation()}
      >
        {POI_SECTIONS.map((section) => {
          const sectionPois = pois.filter((p) => p.section === section)
          if (sectionPois.length === 0) return null
          return (
            <div key={section} className="mb-1">
              <div className="text-[9px] text-hall-muted uppercase tracking-wider font-bold px-1 py-0.5">
                {section}
              </div>
              {sectionPois.map((poi) => (
                <button
                  key={poi.id}
                  onTouchEnd={(e) => { e.preventDefault(); onTeleportToPOI(poi); onClose() }}
                  onClick={() => { onTeleportToPOI(poi); onClose() }}
                  className="block w-full text-left text-[11px] text-hall-muted px-2 py-1 rounded active:bg-hall-accent/10 active:text-hall-accent truncate"
                >
                  {poi.content.title}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

type MobileControlsProps = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
  onLook: (deltaX: number, deltaY: number) => void
  onJump: () => void
  onInteract: () => void
  canInteract: boolean
  pois: POI[]
  cameraRef: CameraRef
  onTeleportToPOI: (poi: POI) => void
  onTeleport: (x: number, z: number) => void
  onSwitchMode?: () => void
  gyroEnabled: boolean
  onGyroToggle: () => void
  sprintEnabled: boolean
  onSprintToggle: () => void
  landscapeMode: boolean
  onLandscapeModeToggle: () => void
  showControlsHint: 'portrait' | 'landscape-confirm' | null
  onDismissHint: () => void
  onLandscapeConfirm: () => void
}

export function MobileControls({
  onMove,
  onMoveEnd,
  onLook,
  onJump,
  onInteract,
  canInteract,
  pois,
  cameraRef,
  onTeleportToPOI,
  onTeleport,
  onSwitchMode,
  gyroEnabled,
  onGyroToggle,
  sprintEnabled,
  onSprintToggle,
  landscapeMode,
  onLandscapeModeToggle,
  showControlsHint,
  onDismissHint,
  onLandscapeConfirm
}: MobileControlsProps) {
  const CONTROL_PANEL_HEIGHT = 0.30

  const portrait = !landscapeMode
  const [showPOIPopover, setShowPOIPopover] = useState(false)

  const joystickRef = useRef<HTMLDivElement>(null)
  const lookRef = useRef<HTMLDivElement>(null)
  const touchId = useRef<number | null>(null)
  const lastTouch = useRef<{ x: number; y: number } | null>(null)

  // Track player position for toolbar progress track
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 5 })

  useEffect(() => {
    if (!portrait) return
    let frameCount = 0
    let rafId: number
    const update = () => {
      frameCount++
      if (frameCount % 6 === 0) {
        const { position } = cameraRef.current
        setPlayerPos({ x: position.x, z: position.z })
      }
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [cameraRef, portrait])

  // Joystick setup - only in landscape
  useEffect(() => {
    if (portrait) return
    if (!joystickRef.current) return

    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'dynamic',
      color: '#38BDF8',
      size: 120,
    })

    manager.on('move', (_, data) => {
      if (data.vector) {
        onMove(data.vector.x, data.vector.y)
      }
    })

    manager.on('end', () => {
      onMoveEnd()
    })

    return () => {
      manager.destroy()
      onMoveEnd()
    }
  }, [onMove, onMoveEnd, portrait])

  // Look touch setup
  useEffect(() => {
    const lookZone = lookRef.current
    if (!lookZone) return

    const onTouchStart = (e: TouchEvent) => {
      if (touchId.current !== null) return
      const touch = e.changedTouches[0]
      touchId.current = touch.identifier
      lastTouch.current = { x: touch.clientX, y: touch.clientY }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current === null || !lastTouch.current) return

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (touch.identifier === touchId.current) {
          const deltaX = touch.clientX - lastTouch.current.x
          const deltaY = touch.clientY - lastTouch.current.y
          lastTouch.current = { x: touch.clientX, y: touch.clientY }
          onLook(deltaX, deltaY)
          break
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId.current) {
          touchId.current = null
          lastTouch.current = null
          break
        }
      }
    }

    lookZone.addEventListener('touchstart', onTouchStart)
    lookZone.addEventListener('touchmove', onTouchMove)
    lookZone.addEventListener('touchend', onTouchEnd)

    return () => {
      lookZone.removeEventListener('touchstart', onTouchStart)
      lookZone.removeEventListener('touchmove', onTouchMove)
      lookZone.removeEventListener('touchend', onTouchEnd)
    }
  }, [onLook, portrait])

  const isLandscapeConfirm = showControlsHint === 'landscape-confirm'

  const hintMessage = showControlsHint === 'portrait'
    ? 'Drag screen to look around. Use D-pad to move.'
    : null

  if (portrait) {
    return (
      <div className="absolute inset-0 z-40 flex flex-col">
        {/* Hint popup */}
        {hintMessage && (
          <div
            className="absolute inset-0 z-[60] flex items-center justify-center"
            onClick={onDismissHint}
          >
            <div className="bg-black/80 text-white text-center px-6 py-4 rounded-xl max-w-[80%] text-sm">
              {hintMessage}
            </div>
          </div>
        )}
        {/* Landscape confirmation modal */}
        {isLandscapeConfirm && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center">
            <div className="bg-black/80 text-white text-center px-6 py-4 rounded-xl max-w-[80%]">
              <p className="text-sm mb-4">Rotate your device to landscape orientation</p>
              <button
                onClick={onLandscapeConfirm}
                className="bg-hall-accent text-hall-bg px-6 py-2 rounded-lg text-sm font-medium"
              >
                Ready
              </button>
            </div>
          </div>
        )}

        {/* Compact toolbar — replaces old minimap */}
        <div className="h-10 flex items-center px-2 gap-2 glass-panel-dark z-50 shrink-0">
          {onSwitchMode && (
            <button
              onTouchEnd={(e) => { e.preventDefault(); onSwitchMode() }}
              onClick={onSwitchMode}
              className="px-2 py-1 text-[10px] text-hall-muted border border-hall-accent/30 rounded uppercase tracking-wider shrink-0"
            >
              Exit 3D
            </button>
          )}
          <div className="flex-1 h-6 relative">
            <MiniProgressTrack
              playerZ={playerPos.z}
              pois={pois}
              onTeleport={onTeleport}
              onTeleportToPOI={onTeleportToPOI}
            />
          </div>
          <button
            onTouchEnd={(e) => { e.preventDefault(); setShowPOIPopover(prev => !prev) }}
            onClick={() => setShowPOIPopover(prev => !prev)}
            className="px-2 py-1 text-[10px] text-hall-accent font-medium shrink-0"
          >
            POIs {showPOIPopover ? '▲' : '▼'}
          </button>
        </div>

        {/* POI popover */}
        {showPOIPopover && (
          <POIPopover
            pois={pois}
            onTeleportToPOI={onTeleportToPOI}
            onClose={() => setShowPOIPopover(false)}
          />
        )}

        {/* Middle area - main viewport (transparent so canvas shows through) */}
        <div
          ref={lookRef}
          className="flex-1 touch-none border-x border-hall-frame/30"
        />

        {/* Bottom controls - GameBoy style */}
        <div
          className="flex flex-col justify-center touch-none border-t-2 border-hall-accent shrink-0"
          style={{
            height: `${CONTROL_PANEL_HEIGHT * 100}%`,
            background: 'linear-gradient(to bottom, #334155, #1E293B 30%, #0F172A)',
            boxShadow: 'inset 0 1px 0 rgba(56,189,248,0.15)',
          }}
        >
          {/* Top row: D-pad + A/B buttons */}
          <div className="flex items-center justify-center gap-8">
            <DPad onMove={onMove} onMoveEnd={onMoveEnd} />
            <ActionButtons canInteract={canInteract} onInteract={onInteract} onMoveEnd={onMoveEnd} onJump={onJump} />
          </div>
          {/* Bottom row: Toggles */}
          <div className="flex justify-center mt-1">
            <ToggleButtons
              gyroEnabled={gyroEnabled}
              onGyroToggle={onGyroToggle}
              landscapeMode={landscapeMode}
              onLandscapeModeToggle={onLandscapeModeToggle}
              sprintEnabled={sprintEnabled}
              onSprintToggle={onSprintToggle}
            />
          </div>
        </div>
      </div>
    )
  }

  // Landscape mode
  return (
    <>
      {/* Landscape confirmation modal */}
      {isLandscapeConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center">
          <div className="bg-black/80 text-white text-center px-6 py-4 rounded-xl max-w-[80%]">
            <p className="text-sm mb-4">Rotate your device to landscape orientation</p>
            <button
              onClick={onLandscapeConfirm}
              className="bg-hall-accent text-hall-bg px-6 py-2 rounded-lg text-sm font-medium"
            >
              Ready
            </button>
          </div>
        </div>
      )}
      <div
        ref={joystickRef}
        className="absolute inset-y-0 left-0 w-1/2 z-40 touch-none"
      />
      <div
        ref={lookRef}
        className="absolute inset-y-0 right-0 w-1/2 z-40 touch-none"
      />
      {/* Exit 3D button — landscape */}
      {onSwitchMode && (
        <button
          onTouchEnd={(e) => { e.preventDefault(); onSwitchMode() }}
          onClick={onSwitchMode}
          className="absolute top-2 right-2 z-50 px-3 py-1 bg-hall-surface/80 text-hall-text rounded text-sm"
        >
          Exit 3D
        </button>
      )}
      {/* Landscape toggles */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-50">
        <button
          onTouchEnd={(e) => { e.preventDefault(); onGyroToggle() }}
          onClick={onGyroToggle}
          className={`px-3 py-2 rounded text-sm font-medium ${gyroEnabled ? 'bg-hall-accent text-hall-bg' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Gyro
        </button>
        {gyroEnabled && (
          <button
            onTouchEnd={(e) => { e.preventDefault(); onLandscapeModeToggle() }}
            onClick={onLandscapeModeToggle}
            className={`px-3 py-2 rounded text-sm font-medium ${landscapeMode ? 'bg-hall-accent text-hall-bg' : 'bg-hall-surface/80 text-hall-text'}`}
          >
            Landscape
          </button>
        )}
        <button
          onTouchEnd={(e) => { e.preventDefault(); onSprintToggle() }}
          onClick={onSprintToggle}
          className={`px-3 py-2 rounded text-sm font-medium ${sprintEnabled ? 'bg-hall-accent text-hall-bg' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Run
        </button>
      </div>
    </>
  )
}
