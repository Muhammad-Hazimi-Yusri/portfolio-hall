import { useEffect, useRef, useState } from 'react'
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

// Returns zone name for world coordinates, or '' if transitional/unknown
function getZoneForPosition(wx: number, wz: number): string {
  if (wx >= -8 && wx <= 8 && wz >= -22 && wz <= -8) return 'Main Hall'
  if (wx >= -8 && wx <= 8 && wz >= -8  && wz <= 8)  return 'Courtyard'
  if (wx >= -5 && wx <= 5 && wz >= 8   && wz <= 18) return 'Reception'
  if (wx >= -20 && wx <= -8 && wz >= -6 && wz <= 6) return 'Garden'
  return ''
}

type VB = { x: number; y: number; w: number; h: number }

// Returns the dynamic-zoom viewBox centered on player, sized to show the 3 nearest POIs
function computeDynamicVB(px: number, pz: number, pois: POI[]): VB {
  const MIN_HALF = 4    // → 8×8 minimum viewBox
  const MAX_HALF = 15   // → 30×30 maximum viewBox
  const PADDING  = 1.5  // units of breathing room beyond the farthest of the 3 POIs

  // 3 nearest POIs by Euclidean distance
  const nearest = [...pois]
    .sort((a, b) =>
      Math.hypot(a.position.x - px, a.position.z - pz) -
      Math.hypot(b.position.x - px, b.position.z - pz)
    )
    .slice(0, 3)

  // Max axis distance from player to any of the 3 (same in world and SVG space due to negation symmetry)
  let maxDX = 0, maxDZ = 0
  for (const p of nearest) {
    maxDX = Math.max(maxDX, Math.abs(p.position.x - px))
    maxDZ = Math.max(maxDZ, Math.abs(p.position.z - pz))
  }

  const halfW = Math.max(MIN_HALF, Math.min(MAX_HALF, maxDX + PADDING))
  const halfH = Math.max(MIN_HALF, Math.min(MAX_HALF, maxDZ + PADDING))

  // Center on player in SVG space (svgX = -worldX, svgY = worldZ)
  let vbX = -px - halfW
  let vbY =  pz - halfH

  // Clamp to full-castle SVG extents so viewBox never shows empty space
  vbX = Math.max(-22, Math.min(vbX, 22 - halfW * 2))
  vbY = Math.max(-24, Math.min(vbY, 20 - halfH * 2))

  return { x: vbX, y: vbY, w: halfW * 2, h: halfH * 2 }
}

const FULL_VB: VB = { x: -22, y: -24, w: 44, h: 44 }

function vbToString(v: VB): string {
  return `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`
}

export function Minimap({ pois, cameraRef, onTeleport, onTeleportToPOI, isPortrait }: MinimapProps) {
  const [playerPos, setPlayerPos]     = useState({ x: 0, z: 5 })
  const [playerRot, setPlayerRot]     = useState(0)
  const [collapsed, setCollapsed]     = useState(false)
  const [fullMap, setFullMap]         = useState(false)
  const [viewBoxStr, setViewBoxStr]   = useState(vbToString(FULL_VB))
  const [currentZone, setCurrentZone] = useState('')

  const svgRef       = useRef<SVGSVGElement>(null)
  const currentVBRef = useRef<VB>({ ...FULL_VB })
  const targetVBRef  = useRef<VB>({ ...FULL_VB })
  const fullMapRef   = useRef(false)
  const poisRef      = useRef(pois)

  // Keep refs in sync with props/state
  useEffect(() => { fullMapRef.current = fullMap }, [fullMap])
  useEffect(() => { poisRef.current = pois }, [pois])

  // RAF loop: player tracking at ~10fps, viewBox lerp at 60fps
  useEffect(() => {
    let frame = 0
    let rafId: number

    const update = () => {
      frame++

      if (frame % 6 === 0) {
        const { position, rotationY } = cameraRef.current
        setPlayerPos({ x: position.x, z: position.z })
        setPlayerRot(rotationY)
        setCurrentZone(getZoneForPosition(position.x, position.z))
        targetVBRef.current = fullMapRef.current
          ? { ...FULL_VB }
          : computeDynamicVB(position.x, position.z, poisRef.current)
      }

      // Lerp current viewBox toward target at 60fps for smooth transitions
      const c = currentVBRef.current
      const t = targetVBRef.current
      const LERP = 0.10
      c.x += (t.x - c.x) * LERP
      c.y += (t.y - c.y) * LERP
      c.w += (t.w - c.w) * LERP
      c.h += (t.h - c.h) * LERP

      const delta = Math.abs(c.x - t.x) + Math.abs(c.y - t.y) + Math.abs(c.w - t.w) + Math.abs(c.h - t.h)
      if (delta > 0.01) {
        setViewBoxStr(vbToString(c))
      } else if (delta > 0) {
        Object.assign(c, t)
        setViewBoxStr(vbToString(t))
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
    const clampedX = Math.max(-20, Math.min(8,  -svgPt.x))
    const clampedZ = Math.max(-22, Math.min(18,  svgPt.y))
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

  // Player direction indicator
  // Babylon: rotation.y=0 → +z (south), PI → -z (north); SVG (negated X): rotate(0) → north
  const rotDeg = -180 + (playerRot * 180) / Math.PI

  // Player SVG position
  const mapX = -playerPos.x

  // Arrow size scales with viewBox width so it stays visually proportional
  const vbParts = viewBoxStr.split(' ').map(Number)
  const vbW = vbParts[2] ?? 44
  const vbH = vbParts[3] ?? 44
  const arrowScale = Math.max(0.25, Math.min(1.0, vbW / 44))

  // Visible POIs: filter to current viewBox bounds in dynamic mode; show all in full map
  const vbMinX = vbParts[0], vbMinY = vbParts[1]
  const vbMaxX = vbMinX + vbW, vbMaxY = vbMinY + vbH
  const visiblePois = fullMap
    ? pois
    : pois.filter(p => {
        const sx = -p.position.x, sz = p.position.z
        return sx >= vbMinX && sx <= vbMaxX && sz >= vbMinY && sz <= vbMaxY
      })

  // In full map mode, show a dashed rect representing where the dynamic zoom is
  const dynVB = fullMap ? computeDynamicVB(playerPos.x, playerPos.z, pois) : null

  const showMobile = isMobile()
  const hidden = showMobile && isPortrait

  const containerSize = showMobile ? 'w-56 h-56' : 'w-80 h-80'

  if (hidden) return null

  return (
    <div
      className={`absolute z-40 ${showMobile ? 'top-2 left-2' : 'top-4 left-4'}`}
    >
      {!collapsed && (
        <div className={`relative ${containerSize} bg-hall-bg/80 backdrop-blur-sm rounded-lg border border-hall-muted/30 p-1 cursor-crosshair`}>
          <svg
            ref={svgRef}
            viewBox={viewBoxStr}
            className="w-full h-full"
            onTouchEnd={handleTouch}
            onClick={handleClick}
          >
            {/* Zone outlines (SVG X negated vs world X) */}
            {/* Courtyard */}
            <rect x="-8" y="-8" width="16" height="16"
              fill="rgba(60,80,50,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Reception */}
            <rect x="-5" y="8" width="10" height="10"
              fill="rgba(90,65,45,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Main Hall */}
            <rect x="-8" y="-22" width="16" height="14"
              fill="rgba(40,30,22,0.2)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />
            {/* Garden */}
            <rect x="8" y="-6" width="12" height="12"
              fill="rgba(50,80,45,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted/50" />

            {/* Doorway connectors */}
            <line x1="-1.5" y1="18"  x2="1.5"  y2="18"  stroke="#C9A84C" strokeWidth="0.3" />
            <line x1="-1.5" y1="-8"  x2="1.5"  y2="-8"  stroke="#C9A84C" strokeWidth="0.3" />
            <line x1="8"    y1="-1.5" x2="8"   y2="1.5"  stroke="#C9A84C" strokeWidth="0.3" />

            {/* Dynamic-zoom viewport indicator (dashed gold rect) shown only in full map mode */}
            {dynVB && (
              <rect
                x={dynVB.x} y={dynVB.y} width={dynVB.w} height={dynVB.h}
                fill="none" stroke="#C9A84C" strokeWidth="0.3"
                strokeDasharray="1 0.5" opacity="0.7"
              />
            )}

            {/* POI markers — only those visible in current viewBox */}
            {visiblePois.map((poi) => (
              <g
                key={poi.id}
                onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); onTeleportToPOI(poi) }}
                onClick={(e) => { e.stopPropagation(); onTeleportToPOI(poi) }}
                className="cursor-pointer"
              >
                <circle
                  cx={-poi.position.x}
                  cy={poi.position.z}
                  r={fullMap ? 0.4 : 0.3}
                  className="fill-hall-muted/60"
                />
                {fullMap && (
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

            {/* Player indicator (arrow scales with zoom) */}
            <g transform={`translate(${mapX}, ${playerPos.z}) rotate(${rotDeg})`}>
              <polygon
                points={`0,${-0.6 * arrowScale} ${-0.4 * arrowScale},${0.4 * arrowScale} ${0.4 * arrowScale},${0.4 * arrowScale}`}
                className="fill-hall-accent"
              />
            </g>
          </svg>

          {/* Zone label — top-left corner of map */}
          {currentZone && (
            <div className="absolute top-1.5 left-1.5 text-[9px] text-hall-muted/60 pointer-events-none select-none leading-none">
              {currentZone}
            </div>
          )}

          {/* Full map toggle — bottom-right corner of map */}
          <button
            className="absolute bottom-1.5 right-1.5 text-xs bg-hall-bg/80 px-1.5 py-0.5 rounded border border-hall-muted/30 text-hall-accent hover:text-hall-text z-10"
            onClick={(e) => { e.stopPropagation(); setFullMap(f => !f) }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setFullMap(f => !f) }}
          >
            {fullMap ? '⊡' : '⊞'}
          </button>
        </div>
      )}

      {/* Collapse / show button */}
      <div className="flex gap-1 mt-1">
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
