import { useEffect, useRef, useState } from 'react'
import type { POI } from '@/types/poi'
import type { CameraRef } from '@/3d/cameraRef'
import { isMobile } from '@/utils/detection'

type MinimapProps = {
  pois: POI[]
  cameraRef: CameraRef
  onTeleport: (x: number, z: number) => void
  isPortrait: boolean
}

export function Minimap({ pois, cameraRef, onTeleport, isPortrait }: MinimapProps) {
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 5 })
  const [playerRot, setPlayerRot] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const showMobile = isMobile()

  // Hide in portrait on mobile
  if (showMobile && isPortrait) return null

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

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return

    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const ctm = svg.getScreenCTM()
    if (!ctm) return
    const svgPt = pt.matrixTransform(ctm.inverse())

    // Clamp to hall bounds with margin from walls
    const clampedX = Math.max(-7, Math.min(7, svgPt.x))
    const clampedZ = Math.max(-6.5, Math.min(6.5, svgPt.y))
    onTeleport(clampedX, clampedZ)
  }

  // Player direction indicator (triangle pointing in camera direction)
  // SVG rotation: negate rotationY and convert to degrees (Babylon Y rotation is inverted)
  const rotDeg = (-playerRot * 180) / Math.PI

  return (
    <div
      className={`absolute z-30 ${
        showMobile ? 'bottom-20 right-2' : 'bottom-4 right-4'
      }`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -top-6 right-0 text-xs bg-hall-bg/80 px-2 py-0.5 rounded-t text-hall-muted hover:text-hall-text"
      >
        {collapsed ? 'Map' : 'Hide'}
      </button>

      {!collapsed && (
        <div className="w-32 h-28 bg-hall-bg/80 backdrop-blur-sm rounded-lg border border-hall-muted/30 p-1 cursor-crosshair">
          <svg
            ref={svgRef}
            viewBox="-10 -12 20 16"
            className="w-full h-full"
            onClick={handleClick}
          >
            {/* Hall outline */}
            <rect
              x="-8" y="-7" width="16" height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.2"
              className="text-hall-muted/50"
            />

            {/* Door */}
            <rect x="-1" y="6.9" width="2" height="0.3" className="fill-hall-accent/50" />

            {/* POI markers */}
            {pois.map((poi) => (
              <circle
                key={poi.id}
                cx={poi.position.x}
                cy={poi.position.z}
                r="0.4"
                className="fill-hall-muted/60"
              />
            ))}

            {/* Player indicator */}
            <g transform={`translate(${playerPos.x}, ${playerPos.z}) rotate(${rotDeg})`}>
              <polygon
                points="0,-0.6 -0.4,0.4 0.4,0.4"
                className="fill-hall-accent"
              />
            </g>
          </svg>
        </div>
      )}
    </div>
  )
}
