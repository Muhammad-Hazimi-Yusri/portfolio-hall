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

// Returns zone name for world coordinates (Z-based linear detection)
function getZoneForPosition(_wx: number, wz: number): string {
  if (wz < 4)  return 'Arrival'
  if (wz < 61) return 'Gallery'
  if (wz < 75) return 'Observatory'
  if (wz <= 92) return 'Horizon'
  return ''
}

type VB = { x: number; y: number; w: number; h: number }

// Returns a horizontal-strip viewBox centered on the player's Z position
function computeDynamicVB(px: number, pz: number, pois: POI[]): VB {
  const MIN_HALF_X = 8
  const MAX_HALF_X = 25
  const PADDING    = 2
  const STRIP_HALF_Y = 3 // fixed narrow height

  // 3 nearest POIs by distance (Z dominant, X compressed)
  const nearest = [...pois]
    .sort((a, b) =>
      Math.hypot(a.position.z - pz, (a.position.x - px) * 0.2) -
      Math.hypot(b.position.z - pz, (b.position.x - px) * 0.2)
    )
    .slice(0, 3)

  let maxDZ = 0
  for (const p of nearest) {
    maxDZ = Math.max(maxDZ, Math.abs(p.position.z - pz))
  }

  const halfX = Math.max(MIN_HALF_X, Math.min(MAX_HALF_X, maxDZ + PADDING))

  // Center on player Z in SVG space (svgX = worldZ)
  let vbX = pz - halfX
  const vbY = -STRIP_HALF_Y

  // Clamp to full-strip SVG extents
  vbX = Math.max(-5, Math.min(vbX, 95 - halfX * 2))

  return { x: vbX, y: vbY, w: halfX * 2, h: STRIP_HALF_Y * 2 }
}

const FULL_VB: VB = { x: -5, y: -3, w: 100, h: 6 }

function vbToString(v: VB): string {
  return `${v.x.toFixed(2)} ${v.y.toFixed(2)} ${v.w.toFixed(2)} ${v.h.toFixed(2)}`
}

export function Minimap({ pois, cameraRef, onTeleport, onTeleportToPOI, isPortrait }: MinimapProps) {
  const [playerPos, setPlayerPos]     = useState({ x: 0, z: 2 })
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
    // SVG X = world Z, SVG Y = -world X * 0.2
    const clampedZ = Math.max(-2, Math.min(90, svgPt.x))
    const clampedX = Math.max(-5, Math.min(5, -svgPt.y / 0.2))
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
  // Babylon: rotation.y=0 → +z (forward). SVG X = world Z, so facing +Z = SVG +X = 0°.
  const rotDeg = -90 + (playerRot * 180) / Math.PI

  // Player SVG position: Z → SVG X, X → SVG Y (compressed)
  const mapX = playerPos.z
  const mapY = -playerPos.x * 0.2

  // Arrow size scales with viewBox width so it stays visually proportional
  const vbParts = viewBoxStr.split(' ').map(Number)
  const vbW = vbParts[2] ?? 100
  const arrowScale = Math.max(0.15, Math.min(0.6, vbW / 100))

  // Visible POIs: filter to current viewBox bounds in dynamic mode; show all in full map
  const vbMinX = vbParts[0], vbMinY = vbParts[1]
  const vbMaxX = vbMinX + vbW, vbMaxY = vbMinY + (vbParts[3] ?? 6)
  const visiblePois = fullMap
    ? pois
    : pois.filter(p => {
        const sx = p.position.z, sy = -p.position.x * 0.2
        return sx >= vbMinX && sx <= vbMaxX && sy >= vbMinY && sy <= vbMaxY
      })

  // In full map mode, show a dashed rect representing where the dynamic zoom is
  const dynVB = fullMap ? computeDynamicVB(playerPos.x, playerPos.z, pois) : null

  const showMobile = isMobile()
  const hidden = showMobile && isPortrait

  const containerSize = showMobile ? 'w-48 h-16' : 'w-64 h-20'

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
            {/* Water background */}
            <rect x="-5" y="-3" width="100" height="6"
              fill="rgba(56,189,248,0.08)" rx="1" />

            {/* Arrival platform */}
            <circle cx="0" cy="0" r="2"
              fill="rgba(226,232,240,0.4)" stroke="currentColor" strokeWidth="0.06" className="text-hall-muted/40" />

            {/* Gallery walkway */}
            <rect x="8" y="-1" width="50" height="2"
              fill="rgba(226,232,240,0.4)" stroke="currentColor" strokeWidth="0.06" className="text-hall-muted/40" />

            {/* Observatory platform */}
            <circle cx="68" cy="0" r="3.5"
              fill="rgba(226,232,240,0.4)" stroke="currentColor" strokeWidth="0.06" className="text-hall-muted/40" />

            {/* Horizon path */}
            <rect x="75" y="-0.5" width="15" height="1"
              fill="rgba(226,232,240,0.35)" stroke="currentColor" strokeWidth="0.06" className="text-hall-muted/40" />

            {/* Zone labels (only in full map) */}
            {fullMap && (
              <>
                <text x="0" y="2.5" textAnchor="middle"
                  className="fill-hall-muted/50 pointer-events-none" style={{ fontSize: '1px' }}>
                  Arrival
                </text>
                <text x="33" y="2.5" textAnchor="middle"
                  className="fill-hall-muted/50 pointer-events-none" style={{ fontSize: '1px' }}>
                  Gallery
                </text>
                <text x="68" y="2.5" textAnchor="middle"
                  className="fill-hall-muted/50 pointer-events-none" style={{ fontSize: '1px' }}>
                  Observatory
                </text>
                <text x="82.5" y="2.5" textAnchor="middle"
                  className="fill-hall-muted/50 pointer-events-none" style={{ fontSize: '1px' }}>
                  Horizon
                </text>
              </>
            )}

            {/* Dynamic-zoom viewport indicator (dashed rect, full map only) */}
            {dynVB && (
              <rect
                x={dynVB.x} y={dynVB.y} width={dynVB.w} height={dynVB.h}
                fill="none" stroke="#38BDF8" strokeWidth="0.1"
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
                  cx={poi.position.z}
                  cy={-poi.position.x * 0.2}
                  r={fullMap ? 0.4 : 0.25}
                  className="fill-hall-muted/60"
                />
                {fullMap && (
                  <text
                    x={poi.position.z}
                    y={-poi.position.x * 0.2 + 0.8}
                    textAnchor="middle"
                    className="fill-hall-muted pointer-events-none" style={{ fontSize: '0.5px' }}
                  >
                    {poi.content.title}
                  </text>
                )}
              </g>
            ))}

            {/* Player indicator (arrow scales with zoom) */}
            <g transform={`translate(${mapX}, ${mapY}) rotate(${rotDeg})`}>
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
            {fullMap ? '\u22A1' : '\u229E'}
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
