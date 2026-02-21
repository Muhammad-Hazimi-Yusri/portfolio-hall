import { useEffect, useRef, useState, useCallback } from 'react'
import { createEngine, createScene } from './engine'
import { createCastle } from './scene'
import { createLights } from './lights'
import { createFirstPersonCamera } from './camera'
import { setupPointerLock } from './pointerLock'
import { createPOIMeshes } from './pois'
import { setupInteraction } from './interaction'
import { createCameraRefDefault } from './cameraRef'
import { flyToCinematic, getApproachPosition } from './flyTo'
import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { Scene as BabylonScene_ } from '@babylonjs/core/scene'
import { isMobile } from '@/utils/detection'
import { MobileControls } from '@/components/MobileControls'
import { Minimap } from '@/components/Minimap'
import { ThreeDSidebar } from '@/components/ThreeDSidebar'

type BabylonSceneProps = {
  onInspect: (poi: POI) => void
  onSwitchMode?: () => void
  onLoadProgress?: (progress: number, stage: string) => void
}

export function BabylonScene({ onInspect, onSwitchMode, onLoadProgress }: BabylonSceneProps) {
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
  const [showControlsHint, setShowControlsHint] = useState<'portrait' | 'landscape-confirm' | null>(null)

  // Navigation state
  const cameraRef = useRef(createCameraRefDefault())
  const babylonCameraRef = useRef<UniversalCamera | null>(null)
  const sceneRef = useRef<BabylonScene_ | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-collapse sidebar on pointer lock (desktop only)
  useEffect(() => {
    if (showMobileControls) return
    const onLockChange = () => {
      setSidebarOpen(!document.pointerLockElement)
    }
    document.addEventListener('pointerlockchange', onLockChange)
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [showMobileControls])

  // Show portrait hint on first mobile load
  useEffect(() => {
    if (showMobileControls) {
      setShowControlsHint('portrait')
      const timer = setTimeout(() => setShowControlsHint(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [showMobileControls])

  // Lock portrait orientation when landscape mode is off
  useEffect(() => {
    if (!showMobileControls) return
    const orient = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
    try {
      if (landscapeMode) {
        orient.lock?.('landscape')?.catch(() => {})
      } else {
        orient.lock?.('portrait')?.catch(() => {})
      }
    } catch { /* API not supported */ }
    return () => {
      try { orient.unlock() } catch { /* ignore */ }
    }
  }, [landscapeMode, showMobileControls])

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

  const handleTeleport = useCallback((x: number, z: number, lookAtX?: number, lookAtZ?: number) => {
    const camera = babylonCameraRef.current
    const scene = sceneRef.current
    if (!camera || !scene) return

    cameraRef.current.isFlyingTo = true

    flyToCinematic(
      scene,
      camera,
      { x, z, lookAtX, lookAtZ },
      () => { camera.checkCollisions = false },
      () => {
        camera.checkCollisions = true
        cameraRef.current.isFlyingTo = false
      },
    )
  }, [])

  const handleTeleportToPOI = useCallback((poi: POI) => {
    const approach = getApproachPosition(poi)
    handleTeleport(approach.x, approach.z, poi.position.x, poi.position.z)
  }, [handleTeleport])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    onLoadProgress?.(0, 'engine')
    const engine = createEngine(canvas)
    const scene = createScene(engine)
    onLoadProgress?.(15, 'scene')

    const castle = createCastle(scene)
    onLoadProgress?.(40, 'scene')

    const camera = createFirstPersonCamera(scene, canvas, joystickRef, lookRef, jumpRef, sprintRef, gyroRef, landscapeModeRef, cameraRef)
    babylonCameraRef.current = camera
    sceneRef.current = scene

    onLoadProgress?.(50, 'textures')
    const poiMeshes = createPOIMeshes(scene, poisData.pois as POI[])
    onLoadProgress?.(70, 'textures')

    createLights(scene, castle, poiMeshes)
    onLoadProgress?.(90, 'textures')

    const cleanupPointerLock = setupPointerLock(canvas)
    const cleanupInteraction = setupInteraction(
      scene,
      camera,
      poiMeshes,
      onInspect,
      setNearbyPOI
    )

    onLoadProgress?.(100, 'ready')
    engine.runRenderLoop(() => scene.render())

    return () => {
      babylonCameraRef.current = null
      sceneRef.current = null
      cleanupPointerLock()
      cleanupInteraction()
      scene.dispose()
      engine.dispose()
    }
  }, [onInspect, onLoadProgress])

  // Counter-rotate layout to stay portrait when device is physically in landscape
  const needsRotation = showMobileControls && !landscapeMode && !isPortrait

  return (
    <div
      className="w-full h-full relative"
      style={needsRotation ? {
        transform: 'rotate(-90deg)',
        transformOrigin: 'center center',
        width: '100vh',
        height: '100vw',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-50vw',
        marginLeft: '-50vh',
      } : undefined}
    >
      <canvas ref={canvasRef} className="w-full h-full outline-none" />

      <Minimap
        pois={poisData.pois as POI[]}
        cameraRef={cameraRef}
        onTeleport={handleTeleport}
        onTeleportToPOI={handleTeleportToPOI}
        isPortrait={isPortrait}
      />

      <ThreeDSidebar
        pois={poisData.pois as POI[]}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(prev => !prev)}
        onTeleportToPOI={handleTeleportToPOI}
        isPortrait={isPortrait}
      />

      {showMobileControls && (
        <MobileControls
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          onLook={handleLook}
          onJump={handleJump}
          onInteract={() => nearbyPOI && onInspect(nearbyPOI)}
          canInteract={nearbyPOI !== null}
          pois={poisData.pois as POI[]}
          cameraRef={cameraRef}
          onTeleportToPOI={handleTeleportToPOI}
          onTeleport={handleTeleport}
          onSwitchMode={onSwitchMode}
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
            // Disable gyro immediately before orientation change
            setGyroEnabled(false)
            gyroRef.current = false
            setLandscapeMode(newVal)
            landscapeModeRef.current = newVal
            if (newVal) {
              // Show confirmation modal - user must tap Ready after rotating
              setShowControlsHint('landscape-confirm')
            }
          }}
          showControlsHint={showControlsHint}
          onDismissHint={() => setShowControlsHint(null)}
          onLandscapeConfirm={() => {
            setShowControlsHint(null)
            setGyroEnabled(true)
            gyroRef.current = true
          }}
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