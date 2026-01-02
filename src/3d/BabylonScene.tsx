import { useEffect, useRef, useState, useCallback } from 'react'
import { createEngine, createScene } from './engine'
import { createHall } from './scene'
import { createLights } from './lights'
import { createFirstPersonCamera } from './camera'
import { setupPointerLock } from './pointerLock'
import { createPOIMeshes } from './pois'
import { setupInteraction } from './interaction'
import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'
import { isMobile } from '@/utils/detection'
import { MobileControls } from '@/components/MobileControls'

type BabylonSceneProps = {
  onInspect: (poi: POI) => void
}

export function BabylonScene({ onInspect }: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nearbyPOI, setNearbyPOI] = useState<POI | null>(null)

  const joystickRef = useRef({ x: 0, y: 0 })
  const showMobileControls = isMobile()

  const handleMove = useCallback((x: number, y: number) => {
    joystickRef.current = { x, y }
  }, [])

  const handleMoveEnd = useCallback(() => {
    joystickRef.current = { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = createEngine(canvas)
    const scene = createScene(engine)

    createHall(scene)
    createLights(scene)
    const camera = createFirstPersonCamera(scene, canvas, joystickRef)
    const poiMeshes = createPOIMeshes(scene, poisData.pois as POI[])

    const cleanupPointerLock = setupPointerLock(canvas)
    const cleanupInteraction = setupInteraction(
      scene,
      camera,
      poiMeshes,
      onInspect,
      setNearbyPOI
    )

    engine.runRenderLoop(() => scene.render())

    return () => {
      cleanupPointerLock()
      cleanupInteraction()
      scene.dispose()
      engine.dispose()
    }
  }, [onInspect])

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full outline-none" />
      
      {showMobileControls && (
        <MobileControls onMove={handleMove} onMoveEnd={handleMoveEnd} />
      )}
      
      {nearbyPOI && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-hall-surface/90 px-4 py-2 rounded">
          Press <span className="text-hall-accent font-bold">E</span> to inspect {nearbyPOI.content.title}
        </div>
      )}
    </div>
  )
}