import { useEffect, useMemo, useRef, useState } from 'react'
import type { POI } from '@/types/poi'
import type { CameraRef } from '@/3d/cameraRef'
import { isMobile } from '@/utils/detection'

type ProgressStripProps = {
  pois: POI[]
  cameraRef: CameraRef
  onTeleport: (x: number, z: number) => void
  onTeleportToPOI: (poi: POI) => void
  isPortrait: boolean
  nearbyId?: string
}

function getZoneForPosition(wz: number): string {
  if (wz < 4) return 'Entrance'
  if (wz < 61) return 'Gallery'
  if (wz < 75) return 'Experience'
  if (wz <= 92) return 'Contact'
  return ''
}

// Zone boundaries as percentages of the 0–90 range
const toPercent = (z: number) => `${(z / 90) * 100}%`

export function ProgressStrip({ pois, cameraRef, onTeleport, onTeleportToPOI, isPortrait, nearbyId }: ProgressStripProps) {
  const [playerZ, setPlayerZ] = useState(2)
  const [currentZone, setCurrentZone] = useState('')
  const trackRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const orderedPois = useMemo(() => [...pois].sort((a, b) => a.position.z - b.position.z || a.position.x - b.position.x), [pois])
  const preview = orderedPois.find(poi => poi.id === (hovered ?? focused))

  // RAF loop: track player position at ~10fps
  useEffect(() => {
    let lastUpdate = 0
    let rafId: number

    const update = (now: number) => {
      if (!document.hidden && now - lastUpdate >= 100) {
        lastUpdate = now
        const { position } = cameraRef.current
        setPlayerZ(Math.round(position.z * 20) / 20)
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

  // The round end platforms extend beyond the strip's 0–90 m axis. Keep the
  // visitor marker visible there instead of letting it fall outside the rail.
  const playerPercent = toPercent(Math.max(0, Math.min(90, playerZ)))

  return (
    <div
      className="walk-route"
      role="navigation"
      aria-label="Destinations in the hall"
    >
      <div className="walk-route-heading"><span><i aria-hidden="true" />You · {currentZone || 'Entrance'}</span><span className={preview ? 'is-preview' : undefined}>{preview ? `Go to ${preview.experienceDisplay?.name ?? preview.content.title}` : 'Choose a destination'}</span></div>

      {/* Track area */}
      <div
        ref={trackRef}
        className="walk-route-track"
        onClick={handleClick}
        onTouchEnd={handleTouch}
      >
        {/* Track background line */}
        <div className="walk-route-line" />

        {/* Zone segments */}
        <div className="walk-route-gallery"
          style={{ left: toPercent(8), width: toPercent(50) }} />
        <div className="walk-route-platform"
          style={{ left: toPercent(68) }} />

        {/* POI dots */}
        {orderedPois.map((poi, index) => (
          <button
            key={poi.id}
            aria-label={`Go to ${poi.experienceDisplay?.name ?? poi.content.title}`}
            aria-current={nearbyId === poi.id ? 'location' : undefined}
            className="walk-route-stop"
            onMouseEnter={() => setHovered(poi.id)} onMouseLeave={() => setHovered(null)}
            onFocus={() => setFocused(poi.id)} onBlur={() => setFocused(null)}
            onKeyDown={event => {
              if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
              const next = event.key === 'ArrowLeft' ? Math.max(0, index - 1) : event.key === 'ArrowRight' ? Math.min(orderedPois.length - 1, index + 1) : event.key === 'Home' ? 0 : event.key === 'End' ? orderedPois.length - 1 : null
              if (next === null) return
              event.preventDefault()
              trackRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus({ preventScroll: true })
            }}
            style={{ left: toPercent(poi.position.z), top: poi.experienceDisplay ? `calc(50% + ${Math.sign(poi.position.x) * 14}px)` : '50%' }}
            onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }}
          ><span aria-hidden="true" /></button>
        ))}

        {/* A bordered diamond distinguishes the visitor from exhibit dots. */}
        <div
          role="img"
          aria-label={`Your position: ${currentZone || 'Entrance'}`}
          className="walk-route-player"
          style={{ left: playerPercent }}
        />
      </div>

      {/* Zone labels */}
      <div className="walk-route-labels">
        <span style={{ left: toPercent(3) }}>Entrance</span>
        <span style={{ left: toPercent(33) }}>Gallery</span>
        <span style={{ left: toPercent(68) }}>Experience</span>
        <span style={{ left: toPercent(83) }}>Contact</span>
      </div>
    </div>
  )
}
