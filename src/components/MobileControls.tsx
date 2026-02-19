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

  const btnBase = "w-12 h-12 bg-[#2a2a2a] rounded-lg flex items-center justify-center text-2xl text-gray-300 select-none transition-colors"
  const activeClass = "bg-[#1a1a1a] text-white"

  return (
    <div ref={dpadRef} className="relative grid grid-cols-3 gap-0.5 touch-none"
      style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}
    >
      <div />
      <div className={`${btnBase} rounded-b-none ${activeDir.y > 0 ? activeClass : ''}`}>▲</div>
      <div />
      <div className={`${btnBase} rounded-r-none ${activeDir.x < 0 ? activeClass : ''}`}>◀</div>
      {/* Center connector piece */}
      <div className="w-12 h-12 bg-[#252525] flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#1e1e1e]" />
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
      <div className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${active ? 'bg-hall-accent' : 'bg-gray-500'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-gray-200 shadow transition-transform ${active ? 'translate-x-7' : 'translate-x-1'}`} />
      </div>
      <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wide font-medium"
        style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(0,0,0,0.2)' }}
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
        className={`${btnClass} bg-[#9B2257] text-white active:bg-[#7a1a45] ${canInteract ? 'ring-2 ring-white' : ''} absolute -top-4 right-0`}
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
        className={`${btnClass} bg-[#9B2257] text-white active:bg-[#7a1a45] absolute bottom-0 left-0`}
        onTouchStart={onJump}
      >
        B
      </button>
    </div>
  )
}

const SECTIONS = ['projects', 'about', 'skills', 'contact'] as const

type TopScreenProps = {
  pois: POI[]
  playerPos: { x: number; z: number }
  playerRot: number
  onTeleportToPOI: (poi: POI) => void
  onTeleport: (x: number, z: number) => void
  onSwitchMode?: () => void
}

function TopScreen({ pois, playerPos, playerRot, onTeleportToPOI, onTeleport, onSwitchMode }: TopScreenProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const rotDeg = -180 + (playerRot * 180) / Math.PI
  const mapX = -playerPos.x

  const teleportFromPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return
    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const svgPt = pt.matrixTransform(ctm.inverse())
    // Negate X back to world coords (SVG X is negated for left-handed correction)
    const clampedX = Math.max(-7, Math.min(7, -svgPt.x))
    const clampedZ = Math.max(-6.5, Math.min(6.5, svgPt.y))
    onTeleport(clampedX, clampedZ)
  }, [onTeleport])

  const handleMapClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    teleportFromPoint(e.clientX, e.clientY)
  }, [teleportFromPoint])

  const handleMapTouch = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (touch) teleportFromPoint(touch.clientX, touch.clientY)
  }, [teleportFromPoint])

  return (
    <div className="relative" style={{ height: '20%', background: '#8a8a8a' }}>
      {/* Screen content — inset bezel */}
      <div className="relative h-full flex mx-2 my-1 rounded-t-md border-2 border-[#444] overflow-hidden"
        style={{
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.15)',
          background: '#080c08',
        }}
      >
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)' }}
        />
        {/* Minimap — left half */}
        <div className="w-3/5 p-1 border-r border-[#1a1a1a] cursor-crosshair">
          <svg
            ref={svgRef}
            viewBox="-10 -9 20 18"
            className="w-full h-full"
            onTouchEnd={handleMapTouch}
            onClick={handleMapClick}
          >
            {/* Hall outline */}
            <rect x="-8" y="-7" width="16" height="14" fill="none" stroke="#3a5a3a" strokeWidth="0.3" />
            {/* Door */}
            <rect x="-1" y="6.9" width="2" height="0.3" fill="#e94560" opacity="0.4" />
            {/* POI markers with labels — click goes to approach position */}
            {pois.map((poi) => (
              <g key={poi.id} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }} onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }} className="cursor-pointer">
                <circle
                  cx={-poi.position.x}
                  cy={poi.position.z}
                  r="0.4"
                  fill="#6a8a6a"
                  opacity="0.8"
                />
                <text
                  x={-poi.position.x}
                  y={poi.position.z + 1.0}
                  textAnchor="middle"
                  fill="#5a7a5a"
                  fontSize="0.7"
                  className="pointer-events-none"
                >
                  {poi.content.title}
                </text>
              </g>
            ))}
            {/* Player indicator */}
            <g transform={`translate(${mapX}, ${playerPos.z}) rotate(${rotDeg})`}>
              <polygon points="0,-0.7 -0.5,0.5 0.5,0.5" fill="#e94560" />
            </g>
          </svg>
        </div>
        {/* Nav sections — right half */}
        <div className="w-2/5 p-1.5 pt-1 flex flex-col gap-0.5 overflow-y-auto">
          {SECTIONS.map((section) => {
            const sectionPois = pois.filter((p) => p.section === section)
            if (sectionPois.length === 0) return null
            return (
              <div key={section}>
                <div className="text-[8px] text-[#5a7a5a] uppercase tracking-wider font-bold px-1">
                  {section}
                </div>
                {sectionPois.map((poi) => (
                  <button
                    key={poi.id}
                    onTouchEnd={(e) => { e.preventDefault(); onTeleportToPOI(poi) }}
                    onClick={() => onTeleportToPOI(poi)}
                    className="block w-full text-left text-[10px] text-[#8ab88a] px-1 py-0.5 rounded active:bg-white/10 truncate"
                  >
                    {poi.content.title}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
        {/* Exit 3D button — subtle, matching UI */}
        {onSwitchMode && (
          <button
            onTouchEnd={(e) => { e.preventDefault(); onSwitchMode() }}
            onClick={onSwitchMode}
            className="absolute top-1 right-1 px-2 py-0.5 bg-[#555] border border-[#777] rounded text-[8px] text-gray-300 uppercase tracking-wider active:bg-[#666] z-30"
          >
            Exit 3D
          </button>
        )}
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
  const TOP_SCREEN_HEIGHT = 0.20

  const portrait = !landscapeMode

  const joystickRef = useRef<HTMLDivElement>(null)
  const lookRef = useRef<HTMLDivElement>(null)
  const touchId = useRef<number | null>(null)
  const lastTouch = useRef<{ x: number; y: number } | null>(null)

  // Track player position for top screen minimap
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 5 })
  const [playerRot, setPlayerRot] = useState(0)

  useEffect(() => {
    if (!portrait) return
    let frameCount = 0
    let rafId: number
    const update = () => {
      frameCount++
      if (frameCount % 6 === 0) {
        const { position, rotationY } = cameraRef.current
        setPlayerPos({ x: position.x, z: position.z })
        setPlayerRot(rotationY)
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
      color: '#e94560',
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
    const lookHeight = (1 - CONTROL_PANEL_HEIGHT - TOP_SCREEN_HEIGHT) * 100

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
                className="bg-hall-accent text-white px-6 py-2 rounded-lg text-sm font-medium"
              >
                Ready
              </button>
            </div>
          </div>
        )}

        {/* 3DS Top Screen — minimap + nav */}
        <TopScreen
          pois={pois}
          playerPos={playerPos}
          playerRot={playerRot}
          onTeleportToPOI={onTeleportToPOI}
          onTeleport={onTeleport}
          onSwitchMode={onSwitchMode}
        />

        {/* Middle area - main viewport (transparent so canvas shows through) */}
        <div
          ref={lookRef}
          className="touch-none border-x-[8px] border-[#8a8a8a]"
          style={{ height: `${lookHeight}%`, boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6), inset 0 -4px 12px rgba(0,0,0,0.4), inset 4px 0 12px rgba(0,0,0,0.4), inset -4px 0 12px rgba(0,0,0,0.4)' }}
        />

        {/* Bottom controls - GameBoy style */}
        <div
          className="flex flex-col justify-center touch-none border-t-2 border-[#999]"
          style={{
            height: `${CONTROL_PANEL_HEIGHT * 100}%`,
            background: 'linear-gradient(to bottom, #9a9a9a, #8a8a8a 30%, #7e7e7e)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
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
              className="bg-hall-accent text-white px-6 py-2 rounded-lg text-sm font-medium"
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
          className={`px-3 py-2 rounded text-sm font-medium ${gyroEnabled ? 'bg-hall-accent text-white' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Gyro
        </button>
        {gyroEnabled && (
          <button
            onTouchEnd={(e) => { e.preventDefault(); onLandscapeModeToggle() }}
            onClick={onLandscapeModeToggle}
            className={`px-3 py-2 rounded text-sm font-medium ${landscapeMode ? 'bg-hall-accent text-white' : 'bg-hall-surface/80 text-hall-text'}`}
          >
            Landscape
          </button>
        )}
        <button
          onTouchEnd={(e) => { e.preventDefault(); onSprintToggle() }}
          onClick={onSprintToggle}
          className={`px-3 py-2 rounded text-sm font-medium ${sprintEnabled ? 'bg-hall-accent text-white' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Run
        </button>
      </div>
    </>
  )
}
