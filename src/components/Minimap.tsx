import { useEffect, useRef, useState, useMemo } from 'react'
import type { POI } from '@/types/poi'
import type { CameraRef } from '@/3d/cameraRef'
import { isMobile } from '@/utils/detection'

type MinimapProps = {
  pois: POI[]
  cameraRef: CameraRef
  onTeleport: (x: number, z: number) => void
  onTeleportToPOI: (poi: POI) => void
  isPortrait: boolean
}

export function Minimap({ pois, cameraRef, onTeleport, onTeleportToPOI, isPortrait }: MinimapProps) {
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 5 })
  const [playerRot, setPlayerRot] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const showMobile = isMobile()
  const hidden = showMobile && isPortrait

  // Sync player position from cameraRef at ~10fps
  useEffect(() => {
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
  }, [cameraRef])

  const teleportFromPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = clientX
    pt.y = clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const svgPt = pt.matrixTransform(ctm.inverse())

    // Negate X back to world coords (SVG X is negated for left-handed correction)
    const clampedX = Math.max(-20, Math.min(8, -svgPt.x))
    const clampedZ = Math.max(-22, Math.min(18, svgPt.y))
    onTeleport(clampedX, clampedZ)
  }

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    teleportFromPoint(e.clientX, e.clientY)
  }

  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    if (touch) teleportFromPoint(touch.clientX, touch.clientY)
  }

  // Player direction indicator rotation
  // Babylon: rotation.y=0 → +z (south), PI → -z (north), PI/2 → east
  // SVG (with negated X): rotate(0) → up (north), rotate(90) → left (east in world)
  // Negate rotation to compensate for X-axis flip
  const rotDeg = -180 + (playerRot * 180) / Math.PI

  // Map X for SVG display (negate for left-handed → top-down correction)
  const mapX = -playerPos.x

  // Dynamic viewBox for small mode: include player + nearby POIs with padding
  const smallViewBox = useMemo(() => {
    const PADDING = 3
    const MIN_HALF = 4

    // Start with player position (negated X)
    let minX = -playerPos.x
    let maxX = -playerPos.x
    let minZ = playerPos.z
    let maxZ = playerPos.z

    // Include nearby POIs (within 8 units)
    for (const poi of pois) {
      const dx = poi.position.x - playerPos.x
      const dz = poi.position.z - playerPos.z
      if (Math.sqrt(dx * dx + dz * dz) < 8) {
        minX = Math.min(minX, -poi.position.x)
        maxX = Math.max(maxX, -poi.position.x)
        minZ = Math.min(minZ, poi.position.z)
        maxZ = Math.max(maxZ, poi.position.z)
      }
    }

    // Ensure minimum size
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2
    const halfW = Math.max(MIN_HALF, (maxX - minX) / 2 + PADDING)
    const halfH = Math.max(MIN_HALF, (maxZ - minZ) / 2 + PADDING)

    return `${cx - halfW} ${cz - halfH} ${halfW * 2} ${halfH * 2}`
  }, [playerPos.x, playerPos.z, pois])

  const viewBox = expanded ? '-22 -24 44 44' : smallViewBox

  const containerSize = expanded
    ? (showMobile ? 'w-56 h-56' : 'w-80 h-80')
    : (showMobile ? 'w-36 h-32' : 'w-40 h-36')

  // Hide in portrait on mobile (after all hooks)
  if (hidden) return null

  return (
    <div
      className={`absolute z-40 ${
        showMobile ? 'top-2 left-2' : 'top-4 left-4'
      }`}
    >
      {!collapsed && (
        <div className={`${containerSize} bg-hall-bg/80 backdrop-blur-sm rounded-lg border border-hall-muted/30 p-1 cursor-crosshair transition-all duration-200`}>
          <svg
            ref={svgRef}
            viewBox={viewBox}
            className="w-full h-full"
            onTouchEnd={handleTouch}
            onClick={handleClick}
          >
            {/* Zone outlines (negated X for SVG) */}
            {/* Courtyard (center, open air) */}
            <rect x="-8" y="-8" width="16" height="16"
              fill="rgba(60,80,50,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Reception (south wing) */}
            <rect x="-5" y="8" width="10" height="10"
              fill="rgba(90,65,45,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Main Hall (north wing) */}
            <rect x="-8" y="-22" width="16" height="14"
              fill="rgba(40,30,22,0.2)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Garden (west wing) */}
            <rect x="8" y="-6" width="12" height="12"
              fill="rgba(50,80,45,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />

            {/* Doorway connectors (gold lines) */}
            <line x1="-1.5" y1="18" x2="1.5" y2="18" stroke="#C9A84C" strokeWidth="0.3" />
            <line x1="-1.5" y1="-8" x2="1.5" y2="-8" stroke="#C9A84C" strokeWidth="0.3" />
            <line x1="8" y1="-1.5" x2="8" y2="1.5" stroke="#C9A84C" strokeWidth="0.3" />

            {/* POI markers (negate X for left-handed correction) — click goes to approach position */}
            {pois.map((poi) => (
              <g key={poi.id} onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }} onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }} className="cursor-pointer">
                <circle
                  cx={-poi.position.x}
                  cy={poi.position.z}
                  r={expanded ? 0.4 : 0.3}
                  className="fill-hall-muted/60"
                />
                {expanded && (
                  <text
                    x={-poi.position.x}
                    y={poi.position.z + 1.0}
                    textAnchor="middle"
                    className="fill-hall-muted text-[0.6px] pointer-events-none"
                  >
                    {poi.content.title}
                  </text>
                )}
              </g>
            ))}

            {/* Player indicator (negated X) */}
            <g transform={`translate(${mapX}, ${playerPos.z}) rotate(${rotDeg})`}>
              <polygon
                points="0,-0.6 -0.4,0.4 0.4,0.4"
                className="fill-hall-accent"
              />
            </g>
          </svg>
        </div>
      )}
      <div className="flex gap-1 mt-1">
        {!collapsed && (
          <button
            onTouchEnd={(e) => { e.preventDefault(); setExpanded(!expanded) }}
            onClick={() => setExpanded(!expanded)}
            className="text-xs bg-hall-bg/80 px-2 py-0.5 rounded-b text-hall-muted hover:text-hall-text"
          >
            {expanded ? '[-]' : '[+]'}
          </button>
        )}
        <button
          onTouchEnd={(e) => { e.preventDefault(); setCollapsed(!collapsed) }}
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs bg-hall-bg/80 px-2 py-0.5 rounded-b text-hall-muted hover:text-hall-text"
        >
          {collapsed ? 'Map' : 'Hide'}
        </button>
      </div>
    </div>
  )
}
