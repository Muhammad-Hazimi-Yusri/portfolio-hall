import { useEffect, useRef, useState } from 'react'
import type { POI } from '@/types/poi'
import type { CameraRef } from '@/3d/cameraRef'
import { isMobile } from '@/utils/detection'

type ProgressStripProps = {
  pois: POI[]
  cameraRef: CameraRef
  onTeleport: (x: number, z: number) => void
  onTeleportToPOI: (poi: POI) => void
  isPortrait: boolean
}

function getZoneForPosition(wz: number): string {
  if (wz < 4) return 'Arrival'
  if (wz < 61) return 'Gallery'
  if (wz < 75) return 'Observatory'
  if (wz <= 92) return 'Horizon'
  return ''
}

// Zone boundaries as percentages of the 0–90 range
const toPercent = (z: number) => `${(z / 90) * 100}%`

export function ProgressStrip({ pois, cameraRef, onTeleport, onTeleportToPOI, isPortrait }: ProgressStripProps) {
  const [playerZ, setPlayerZ] = useState(2)
  const [currentZone, setCurrentZone] = useState('')
  const trackRef = useRef<HTMLDivElement>(null)

  // RAF loop: track player position at ~10fps
  useEffect(() => {
    let frame = 0
    let rafId: number

    const update = () => {
      frame++
      if (frame % 6 === 0) {
        const { position } = cameraRef.current
        setPlayerZ(position.z)
        setCurrentZone(getZoneForPosition(position.z))
      }
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [cameraRef])

  const teleportFromClientX = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const worldZ = ratio * 90
    onTeleport(0, worldZ)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    teleportFromClientX(e.clientX)
  }

  const handleTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (touch) teleportFromClientX(touch.clientX)
  }

  const showMobile = isMobile()
  if (showMobile && isPortrait) return null

  const playerPercent = toPercent(playerZ)

  return (
    <div
      className="absolute bottom-0 left-0 w-full h-12 z-40 glass-panel flex flex-col"
      aria-hidden="true"
    >
      {/* Zone label */}
      {currentZone && (
        <span className="absolute top-0.5 left-3 text-[10px] text-hall-muted pointer-events-none select-none z-10">
          {currentZone}
        </span>
      )}

      {/* Track area */}
      <div
        ref={trackRef}
        className="flex-1 relative mx-4 cursor-crosshair"
        onClick={handleClick}
        onTouchEnd={handleTouch}
      >
        {/* Track background line */}
        <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-hall-frame rounded-full" />

        {/* Zone segments */}
        <div className="absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-hall-frame"
          style={{ left: toPercent(0), width: toPercent(6) }} />
        <div className="absolute top-1/2 -translate-y-1/2 h-[5px] rounded-full bg-hall-frame"
          style={{ left: toPercent(8), width: toPercent(50) }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-hall-frame/50 -translate-x-1/2"
          style={{ left: toPercent(68) }} />
        <div className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full bg-hall-frame/30"
          style={{ left: toPercent(76), width: toPercent(14) }} />

        {/* POI dots */}
        {pois.map(poi => (
          <div
            key={poi.id}
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-hall-accent/50 hover:bg-hall-accent cursor-pointer z-10"
            style={{ left: toPercent(poi.position.z) }}
            onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }}
          />
        ))}

        {/* Player glow ring */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-hall-accent/30 pointer-events-none"
          style={{ left: playerPercent }}
        />
        {/* Player position dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-hall-accent pointer-events-none z-10"
          style={{ left: playerPercent }}
        />
      </div>

      {/* Zone labels */}
      <div className="h-4 flex items-start px-4 pointer-events-none select-none">
        <span className="text-[10px] text-hall-muted absolute" style={{ left: `calc(${toPercent(3)} + 1rem)`, transform: 'translateX(-50%)' }}>Arrival</span>
        <span className="text-[10px] text-hall-muted absolute" style={{ left: `calc(${toPercent(33)} + 1rem)`, transform: 'translateX(-50%)' }}>Gallery</span>
        <span className="text-[10px] text-hall-muted absolute" style={{ left: `calc(${toPercent(68)} + 1rem)`, transform: 'translateX(-50%)' }}>Observatory</span>
        <span className="text-[10px] text-hall-muted absolute" style={{ left: `calc(${toPercent(83)} + 1rem)`, transform: 'translateX(-50%)' }}>Horizon</span>
      </div>
    </div>
  )
}
