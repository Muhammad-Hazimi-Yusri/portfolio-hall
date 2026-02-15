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
  const lookRef = useRef({ x: 0, y: 0 })
  const jumpRef = useRef(false)
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const sprintRef = useRef(false)
  const [sprintEnabled, setSprintEnabled] = useState(false)
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const gyroRef = useRef(false)
  const [landscapeMode, setLandscapeMode] = useState(false)
  const landscapeModeRef = useRef(false)
  const [showControlsHint, setShowControlsHint] = useState<'portrait' | 'landscape' | null>(null)

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Show portrait hint on first mobile load
  useEffect(() => {
    if (showMobileControls) {
      setShowControlsHint('portrait')
      const timer = setTimeout(() => setShowControlsHint(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [showMobileControls])

  const handleJump = useCallback(() => {
    jumpRef.current = true
  }, [])

  const handleLook = useCallback((deltaX: number, deltaY: number) => {
    lookRef.current = { x: deltaX, y: deltaY }
  }, [])

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
    const camera = createFirstPersonCamera(scene, canvas, joystickRef, lookRef, jumpRef, sprintRef, gyroRef, landscapeModeRef)
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
        <MobileControls 
          onMove={handleMove} 
          onMoveEnd={handleMoveEnd}
          onLook={handleLook}
          onJump={handleJump}
          onInteract={() => nearbyPOI && onInspect(nearbyPOI)}
          canInteract={nearbyPOI !== null}
          gyroEnabled={gyroEnabled}
          onGyroToggle={async () => {
            if (!gyroEnabled) {
              // Request permission on iOS
              if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
                try {
                  const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
                  if (permission !== 'granted') return
                } catch {
                  return
                }
              }
            }
            setGyroEnabled(prev => !prev)
            gyroRef.current = !gyroRef.current
          }}
          sprintEnabled={sprintEnabled}
          onSprintToggle={() => {
            setSprintEnabled(prev => !prev)
            sprintRef.current = !sprintRef.current
          }}
          landscapeMode={landscapeMode}
          onLandscapeModeToggle={() => {
            const newVal = !landscapeMode
            setLandscapeMode(newVal)
            landscapeModeRef.current = newVal
            if (newVal) {
              setShowControlsHint('landscape')
              setTimeout(() => setShowControlsHint(null), 4000)
            }
          }}
          showControlsHint={showControlsHint}
          onDismissHint={() => setShowControlsHint(null)}
        />
      )}
            
      {nearbyPOI && !(showMobileControls && isPortrait) && (
        <button
          onClick={() => onInspect(nearbyPOI)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-hall-surface/90 px-4 py-2 rounded z-50"
        >
          {showMobileControls ? (
            <span>Tap to inspect <span className="text-hall-accent font-bold">{nearbyPOI.content.title}</span></span>
          ) : (
            <span>Press <span className="text-hall-accent font-bold">E</span> to inspect {nearbyPOI.content.title}</span>
          )}
        </button>
      )}
    </div>
  )
}