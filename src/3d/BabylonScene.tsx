import { useEffect, useRef, useState, useCallback } from 'react'
import { createEngine, createScene } from './engine'
import { createEnvironment } from './scene'
import { createLights } from './lights'
import { createFirstPersonCamera } from './camera'
import { setupPointerLock } from './pointerLock'
import { createPOIMeshes } from './pois'
import { createSlideshow } from './paintingSlideshow'
import type { SlideshowInstance } from './paintingSlideshow'
import { loadProjectSplat } from './projectSplatLoader'
import type { ProjectSplatInstance } from './projectSplatLoader'
import { setupInteraction } from './interaction'
import { createCameraRefDefault } from './cameraRef'
import { flyTo, getApproachPosition } from './flyTo'
import { checkVRSupport, createXRExperience, setupVRLocomotion, setupVRMenuButton, setupSeatedMode } from './webxr'
import { setupHandTracking } from './vrInteraction'
import { createVRFpsCounter } from './vrUI'
import { applyVRLighting } from './lights'
import type { LightsResult } from './lights'
import { loadAssets, reloadAllAssets, toggleAssetFallback } from './assetLoader'
import type { LoadAssetsOptions } from './assetLoader'
import { AssetDebugOverlay } from './assetDebug'
import { createSceneMaterials } from './materials'
import poisData from '@/data/pois'
import type { POI } from '@/types/poi'
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { Scene as BabylonScene_ } from '@babylonjs/core/scene'
import type { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import { WebXRState } from '@babylonjs/core/XR/webXRTypes'
import { isMobile } from '@/utils/detection'
import { loadAvatar } from './avatarLoader'
import type { AvatarInstance } from './avatarLoader'
import { MobileControls } from '@/components/MobileControls'
import { ProgressStrip } from '@/components/ProgressStrip'
import { ThreeDSidebar } from '@/components/ThreeDSidebar'
import { AvatarToggle } from '@/components/AvatarToggle'
import { SplatLoadIndicator } from '@/components/SplatLoadIndicator'
import { createVisitorDisplay } from './visitorDisplay'
import type { Community, VisitorZone } from '@/data/community'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import type { HallPose } from '@/components/portfolio/hallNavigation'

type BabylonSceneProps = {
  community: Community
  onVisitorZoneChange: (zone: VisitorZone) => void
  onInspect: (poi: POI) => void
  onVisitorLog?: (intent: 'visitors' | 'analytics') => void
  onSwitchMode?: () => void
  onLoadProgress?: (progress: number, stage: string) => void
  initialCameraPosition?: { x: number; y: number; z: number }
  initialCameraTarget?: { x: number; y: number; z: number }
  inputPaused?: boolean
  onPose?: (pose: HallPose) => void
}

export function BabylonScene({ community, onVisitorZoneChange, onInspect, onVisitorLog, onSwitchMode, onLoadProgress, initialCameraPosition, initialCameraTarget, inputPaused = false, onPose }: BabylonSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nearbyPOI, setNearbyPOI] = useState<POI | null>(null)
  const [visitorZone, setVisitorZone] = useState<VisitorZone>('entrance')
  useEffect(() => { onVisitorZoneChange(visitorZone) }, [visitorZone, onVisitorZoneChange])
  const communityRef = useRef(community)
  useEffect(() => { communityRef.current = community }, [community])
  const joystickRef = useRef({ x: 0, y: 0 })
  const [showMobileControls, setShowMobileControls] = useState(() => isMobile() || window.innerWidth <= 760 || window.matchMedia('(pointer: coarse)').matches)
  const lookRef = useRef({ x: 0, y: 0 })
  const jumpRef = useRef(false)
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const sprintRef = useRef(false)
  const [sprintEnabled, setSprintEnabled] = useState(false)
  const [gyroEnabled, setGyroEnabled] = useState(false)
  const gyroRef = useRef(false)
  const recenterGyroRef = useRef(false)
  const landscapeModeRef = useRef(window.innerWidth > window.innerHeight)
  const [pointerLocked, setPointerLocked] = useState(false)
  const [pointerError, setPointerError] = useState(false)
  const pointerReleasedAt = useRef(-Infinity)

  // Asset dev tooling (refs are stable — dev keyboard handler and overlay callbacks use them)
  const loadAssetsOptionsRef = useRef<LoadAssetsOptions>({})
  const [showDebugOverlay, setShowDebugOverlay] = useState(false)

  // Navigation state
  const cameraRef = useRef(createCameraRefDefault())
  const babylonCameraRef = useRef<UniversalCamera | null>(null)
  const sceneRef = useRef<BabylonScene_ | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // WebXR state
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [isInVR, setIsInVR] = useState(false)
  const xrExperienceRef = useRef<WebXRDefaultExperience | null>(null)

  // Avatar state
  const avatarRef = useRef<AvatarInstance | null>(null)
  const [avatarState, setAvatarState] = useState<{
    loaded: boolean
    mode: 'mesh' | 'splat'
    splatAvailable: boolean
    splatLoading: boolean
  }>({ loaded: false, mode: 'mesh', splatAvailable: false, splatLoading: false })

  // Project splat loading state — shows which scan is currently downloading
  const [loadingSplatTitle, setLoadingSplatTitle] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
      landscapeModeRef.current = window.innerWidth > window.innerHeight
      setShowMobileControls(isMobile() || window.innerWidth <= 760 || window.matchMedia('(pointer: coarse)').matches)
      joystickRef.current = { x: 0, y: 0 }; lookRef.current = { x: 0, y: 0 }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Auto-collapse sidebar on pointer lock (desktop only)
  useEffect(() => {
    if (showMobileControls) return
    const onLockChange = () => {
      const locked = document.pointerLockElement === canvasRef.current
      setPointerLocked(locked)
      if (locked) { setSidebarOpen(false); setPointerError(false) }
      else pointerReleasedAt.current = performance.now()
    }
    document.addEventListener('pointerlockchange', onLockChange)
    return () => document.removeEventListener('pointerlockchange', onLockChange)
  }, [showMobileControls])

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || inputPaused || isInVR || !sceneRef.current || document.querySelector('dialog[open]')) return
      // Escape belongs to mouse capture first. Some browsers dispatch its
      // keydown after pointerlockchange; do not leave the hall on that press.
      if (document.pointerLockElement || performance.now() - pointerReleasedAt.current < 350) return
      event.preventDefault()
      if (sidebarOpen) {
        setSidebarOpen(false)
        document.querySelector<HTMLButtonElement>('.walk-directory-toggle')?.focus({ preventScroll: true })
      } else onSwitchMode?.()
    }
    const released = (event: KeyboardEvent) => { if (event.key === 'Escape') pointerReleasedAt.current = -Infinity }
    window.addEventListener('keydown', key)
    window.addEventListener('keyup', released)
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('keyup', released) }
  }, [inputPaused, isInVR, sidebarOpen, onSwitchMode])

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.metadata.inputPaused = inputPaused
      sceneRef.current.metadata.needsRender = true
    }
    if (inputPaused) {
      joystickRef.current = { x: 0, y: 0 }; lookRef.current = { x: 0, y: 0 }; jumpRef.current = false
      babylonCameraRef.current?.cameraDirection.setAll(0)
    }
  }, [inputPaused])

  // Dev-only: backtick toggles debug overlay; Ctrl+Shift+R reloads assets only
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setShowDebugOverlay(prev => !prev)
        return
      }
      // e.key === 'R' (uppercase) is correct when Shift is held
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault() // block browser hard-refresh in some browsers
        const scene = sceneRef.current
        if (scene) reloadAllAssets(scene, loadAssetsOptionsRef.current)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, []) // empty deps: refs are stable; import.meta.env.DEV is a compile-time constant

  const handleJump = useCallback(() => {
    jumpRef.current = true
  }, [])

  const handleLook = useCallback((deltaX: number, deltaY: number) => {
    lookRef.current.x += deltaX; lookRef.current.y += deltaY
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

    // Track clicks select a real nearby display, instead of an arbitrary point
    // with the previous (possibly sky-facing) camera orientation.
    if (lookAtX === undefined || lookAtZ === undefined) {
      const nearest = poisData.pois.reduce((best, poi) => Math.abs(poi.position.z - z) < Math.abs(best.position.z - z) ? poi : best)
      const approach = getApproachPosition(nearest, camera.fov, scene.getEngine().getAspectRatio(camera), Boolean(scene.metadata?.guestbookActive))
      x = approach.x; z = approach.z; lookAtX = nearest.position.x; lookAtZ = nearest.position.z
    }

    joystickRef.current = { x: 0, y: 0 }; lookRef.current = { x: 0, y: 0 }
    flyTo(
      scene,
      camera,
      { x, z, lookAtX, lookAtZ },
      () => { camera.checkCollisions = false; cameraRef.current.isFlyingTo = true; scene.metadata.travelActive = true },
      () => {
        camera.checkCollisions = true
        cameraRef.current.isFlyingTo = false
        scene.metadata.travelActive = false
      },
    )
  }, [])

  const handleTeleportToPOI = useCallback((poi: POI) => {
    const camera = babylonCameraRef.current, scene = sceneRef.current
    if (!camera || !scene) return
    const approach = getApproachPosition(poi, camera.fov, scene.getEngine().getAspectRatio(camera), Boolean(scene.metadata?.guestbookActive))
    handleTeleport(approach.x, approach.z, poi.position.x, poi.position.z)
  }, [handleTeleport])

  const handleEnterVR = useCallback(async () => {
    const xr = xrExperienceRef.current
    const fpCam = babylonCameraRef.current
    if (!xr || !fpCam) return
    // Place XR rig at player's x,z; y=0 because local-floor tracks head height from floor
    xr.baseExperience.camera.position.set(fpCam.position.x, 0, fpCam.position.z)
    await xr.baseExperience.enterXRAsync('immersive-vr', 'local-floor')
  }, [])

  const handleExitVR = useCallback(async () => {
    await xrExperienceRef.current?.baseExperience.exitXRAsync()
  }, [])

  const handleAvatarToggle = useCallback(() => {
    const av = avatarRef.current
    if (!av) return
    if (av.getMode() === 'mesh') {
      av.showSplat()
    } else {
      av.showMesh()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let unmounted = false
    let cleanupHands: (() => void) | null = null
    let fpsCtr: ReturnType<typeof createVRFpsCounter> | null = null
    let lightsResult: LightsResult | null = null

    onLoadProgress?.(0, 'engine')
    const engine = createEngine(canvas)
    const scene = createScene(engine)
    scene.metadata = { inputPaused, waterRefreshMs: 1000 / 30 }
    const wake = () => { if (!unmounted && !scene.isDisposed && scene.metadata) scene.metadata.needsRender = true }
    scene.onNewMeshAddedObservable.add(wake)
    scene.onMeshRemovedObservable.add(wake)
    scene.onDataLoadedObservable.add(() => {
      if (unmounted) return
      wake()
      scene.executeWhenReady(wake)
    })
    const resizeObserver = engine.onResizeObservable.add(wake)
    document.addEventListener('visibilitychange', wake)
    onLoadProgress?.(15, 'scene')

    const mats = createSceneMaterials(scene)
    const castle = createEnvironment(scene, mats)
    const visitors = createVisitorDisplay(scene)
    onLoadProgress?.(40, 'scene')

    const { camera, hasPendingInput } = createFirstPersonCamera(
      scene, canvas, joystickRef, lookRef, jumpRef, sprintRef,
      gyroRef, landscapeModeRef, cameraRef,
      initialCameraPosition, initialCameraTarget,
      recenterGyroRef,
    )
    babylonCameraRef.current = camera
    sceneRef.current = scene

    onLoadProgress?.(50, 'textures')
    const { meshMap: poiMeshes, slideshowTargets, splatTargets } = createPOIMeshes(scene, poisData.pois as POI[])
    onLoadProgress?.(70, 'textures')

    const lights = createLights(scene, castle, poiMeshes)
    lightsResult = lights

    // Load architectural .glb assets — non-blocking, scene renders immediately with fallbacks
    const loadOpts: LoadAssetsOptions = {
      sunShadowGen: lights.sunShadowGen,
      indoorShadowGen: lights.indoorShadowGen,
      sceneMaterials: mats,
    }
    loadAssetsOptionsRef.current = loadOpts
    loadAssets(scene, loadOpts)

    // The arrival portrait is irrelevant when entering beside a distant project.
    // Defer its assets until the visitor actually reaches the first platform.
    let avatarRequested = false
    const avatarObserver = scene.onBeforeRenderObservable.add(() => {
      if (avatarRequested || camera.position.z > 8) return
      avatarRequested = true
      scene.onBeforeRenderObservable.remove(avatarObserver)
      void loadAvatar(scene, {
        onModeChange: (mode) => {
          wake()
          if (!unmounted) setAvatarState(prev => ({ ...prev, mode }))
        },
        onSplatLoadStart: () => {
          if (!unmounted) setAvatarState(prev => ({ ...prev, splatLoading: true }))
        },
        onSplatLoadEnd: () => {
          wake()
          if (!unmounted) setAvatarState(prev => ({ ...prev, splatLoading: false }))
        },
      }).then(instance => {
        if (unmounted) { instance?.dispose(); return }
        wake()
        avatarRef.current = instance
        setAvatarState({
          loaded: true,
          mode: instance?.getMode() ?? 'mesh',
          splatAvailable: instance?.isSplatAvailable() ?? false,
          splatLoading: false,
        })
      })
    })

    // Create painting slideshows (staggered start, distance-based pausing)
    const slideshows: SlideshowInstance[] = slideshowTargets.map((target, i) =>
      createSlideshow({
        poiId: target.poi.id,
        canvasMesh: target.mesh,
        images: target.images,
        scene,
        delayMs: i * 400,
        camera,
      })
    )

    // Create project splat instances (proximity-triggered lazy loading)
    const loadingTitles: string[] = []
    const splatInstances: ProjectSplatInstance[] = splatTargets.map(target =>
      loadProjectSplat(scene, target.poi, target.pedestalGroup, {
        onLoadStart: (title) => {
          if (unmounted) return
          loadingTitles.push(title)
          setLoadingSplatTitle(loadingTitles[loadingTitles.length - 1])
        },
        onLoadEnd: () => {
          if (unmounted) return
          wake()
          loadingTitles.shift()
          setLoadingSplatTitle(loadingTitles.length > 0 ? loadingTitles[loadingTitles.length - 1] : null)
        },
      })
    )
    const splatProximityObserver = splatInstances.length > 0
      ? scene.onBeforeRenderObservable.add(() => {
          splatInstances.forEach(inst => inst.checkProximity(camera.position))
        })
      : null

    onLoadProgress?.(90, 'textures')

    const cleanupPointerLock = setupPointerLock(canvas, () => setPointerError(true), () => !cameraRef.current.isFlyingTo && !scene.metadata.inputPaused)
    const cleanupInteraction = setupInteraction(
      scene,
      camera,
      poiMeshes,
      onInspect,
      setNearbyPOI
    )

    scene.executeWhenReady(() => { if (!unmounted) { wake(); onLoadProgress?.(100, 'ready') } })
    let lastPoseAt = -Infinity
    let lastVisitorZone: VisitorZone = 'entrance'
    let settleUntil = performance.now() + 1200
    const drawnPosition = camera.position.clone(), drawnRotation = camera.rotation.clone()
    scene.onPointerObservable.add(event => {
      if (event.type !== PointerEventTypes.POINTERPICK) return
      const route = event.pickInfo?.pickedMesh?.metadata?.portfolioRoute
      const visitorIntent = route === '#guestbook/analytics' ? 'analytics' : route === '#guestbook/visitors' ? 'visitors' : null
      if (visitorIntent && onVisitorLog) {
        // The click that selected the data must not also lock the mouse behind
        // the dialog. Set this before the canvas click listener runs.
        scene.metadata.inputPaused = true
        onVisitorLog(visitorIntent)
      } else if (route === '#contact' || visitorIntent) window.location.hash = route
    })
    const render = () => {
      if (document.hidden || (scene.metadata.inputPaused && !cameraRef.current.isInVR)) return
      visitors.update(communityRef.current)
      const now = performance.now()
      const moving = hasPendingInput() || cameraRef.current.isFlyingTo ||
        !drawnPosition.equals(camera.position) || !drawnRotation.equals(camera.rotation)
      if (moving || scene.metadata.needsRender) settleUntil = now + 200
      // Polling input stays cheap; scene traversal, draw calls and water passes
      // stop once the view settles. XR keeps its headset-driven frame cadence.
      if (!cameraRef.current.isInVR && !moving && !scene.metadata.needsRender &&
          !scene.metadata.profileContinuous && now < (scene.metadata.logoFrameAt ?? Infinity) &&
          !slideshows.some(slideshow => slideshow.needsFrame()) && now > settleUntil) return
      scene.metadata.needsRender = false
      scene.metadata.logoFrameAt = Infinity
      scene.render()
      drawnPosition.copyFrom(camera.position); drawnRotation.copyFrom(camera.rotation)
      const z = camera.position.z
      const zone: VisitorZone = z > 79 ? 'contact' : z > 59 ? 'about' : z > 20 ? 'projects' : z > 7 ? 'work' : 'entrance'
      if (zone !== lastVisitorZone) { lastVisitorZone = zone; setVisitorZone(zone) }
      if (onPose && performance.now() - lastPoseAt > 100) {
        lastPoseAt = performance.now()
        const position = camera.position, target = camera.getTarget()
        onPose({ position: { x: position.x, y: position.y, z: position.z }, target: { x: target.x, y: target.y, z: target.z } })
      }
    }
    engine.runRenderLoop(render)

    // WebXR — check support and set up experience helper
    const pendingLinks: string[] = []

    checkVRSupport().then(async (supported) => {
      if (unmounted) return
      setIsVRSupported(supported)
      if (!supported) return
      try {
        const xr = await createXRExperience(scene, castle.grounds)
        if (unmounted) { xr.dispose(); return }
        xrExperienceRef.current = xr
        setupVRLocomotion(scene, xr, castle.grounds)
        cleanupHands = setupHandTracking(scene, xr, castle.grounds, {
          poiMeshes,
          onLinkQueued: (url) => { pendingLinks.push(url) },
        })

        // VR comfort + performance
        fpsCtr = createVRFpsCounter(scene, xr)
        const seatedToggle = setupSeatedMode(xr)
        setupVRMenuButton(
          xr, scene,
          () => fpsCtr!.toggle(),   // Y button — toggle FPS counter
          () => seatedToggle(),      // X button — toggle seated mode
        )

        xr.baseExperience.onStateChangedObservable.add((state) => {
          wake()
          if (state === WebXRState.IN_XR) {
            setIsInVR(true)
            cameraRef.current.isInVR = true
            camera.detachControl()
            document.exitPointerLock()
            if (lightsResult) applyVRLighting(lightsResult, true)
          } else if (state === WebXRState.NOT_IN_XR) {
            setIsInVR(false)
            cameraRef.current.isInVR = false
            camera.attachControl(canvas, true)
            if (lightsResult) applyVRLighting(lightsResult, false)
            // Open any links the user queued while in VR
            pendingLinks.splice(0).forEach(url => window.open(url, '_blank', 'noopener'))
          }
        })
      } catch (e) {
        console.error('[WebXR] setup failed', e)
      }
    })

    return () => {
      unmounted = true
      slideshows.forEach(s => s.dispose())
      if (splatProximityObserver) scene.onBeforeRenderObservable.remove(splatProximityObserver)
      splatInstances.forEach(s => s.dispose())
      avatarRef.current?.dispose()
      avatarRef.current = null
      cleanupHands?.()
      fpsCtr?.dispose()
      babylonCameraRef.current = null
      sceneRef.current = null
      xrExperienceRef.current = null
      cleanupPointerLock()
      cleanupInteraction()
      document.removeEventListener('visibilitychange', wake)
      engine.onResizeObservable.remove(resizeObserver)
      engine.stopRenderLoop(render)
      visitors.dispose()
      scene.dispose()
      engine.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- initialCamera props are read once on mount, not reactive
  }, [onInspect, onLoadProgress, onVisitorLog])

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} tabIndex={0} aria-label="Walk around Balairung. Use W A S D or arrow keys to move, drag to look and E to inspect. Escape releases the mouse; press again to return to the portfolio." className="walk-canvas w-full h-full outline-none" />
      {pointerLocked && !isInVR && !showMobileControls && <div className={`walk-reticle${nearbyPOI ? ' is-target' : ''}`} aria-hidden="true" />}
      {!isInVR && !showMobileControls && <div className="walk-guidance">
        {nearbyPOI && <button onClick={() => onInspect(nearbyPOI)} className="walk-inspect">
          <span><small>{nearbyPOI.id === 'contact' && community.mode !== 'offline' ? 'Read guestbook' : nearbyPOI.experienceDisplay ? 'Experience' : 'Read notes'}</small><strong>{nearbyPOI.experienceDisplay?.name ?? nearbyPOI.content.title}</strong></span><kbd>E</kbd>
        </button>}
        <div className="walk-help">
        <span>{pointerLocked ? 'WASD / arrows to walk · Shift to run · E to inspect · Esc to release mouse' : pointerError ? 'Drag to look · WASD / arrows to walk · Esc to return' : 'Click to look · WASD / arrows to walk · E to inspect · Esc to return'}</span>
        {pointerLocked && <button onClick={() => document.exitPointerLock()}>Release mouse</button>}
        </div>
      </div>}

      {isVRSupported && (
        <button
          onClick={isInVR ? handleExitVR : handleEnterVR}
          className="absolute top-14 right-4 z-50 px-4 py-2 bg-hall-accent text-white rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
        >
          {isInVR ? 'Exit VR' : 'Enter VR'}
        </button>
      )}

      {!isInVR && !showMobileControls && (
        <ProgressStrip
          pois={poisData.pois as POI[]}
          cameraRef={cameraRef}
          onTeleport={handleTeleport}
          onTeleportToPOI={handleTeleportToPOI}
          isPortrait={isPortrait}
          nearbyId={nearbyPOI?.id}
        />
      )}

      {!isInVR && !showMobileControls && visitorZone === 'entrance' && avatarState.loaded && (
        <AvatarToggle
          mode={avatarState.mode}
          splatAvailable={avatarState.splatAvailable}
          splatLoading={avatarState.splatLoading}
          onToggle={handleAvatarToggle}
        />
      )}

      {!isInVR && <SplatLoadIndicator loadingTitle={loadingSplatTitle} />}

      {!isInVR && !showMobileControls && (
        <ThreeDSidebar
          pois={poisData.pois as POI[]}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(prev => !prev)}
          onTeleportToPOI={handleTeleportToPOI}
          currentZone={visitorZone === 'entrance' ? 'arrival' : visitorZone === 'about' ? 'observatory' : visitorZone === 'contact' ? 'horizon' : 'gallery'}
          nearbyId={nearbyPOI?.id}
        />
      )}

      {!isInVR && showMobileControls && (
        <MobileControls
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          onLook={handleLook}
          onJump={handleJump}
          onInteract={() => nearbyPOI && onInspect(nearbyPOI)}
          nearbyTitle={nearbyPOI?.id === 'contact' && community.mode !== 'offline' ? 'guestbook' : nearbyPOI?.experienceDisplay?.name ?? nearbyPOI?.content.title}
          nearbyAction={nearbyPOI?.id === 'contact' && community.mode !== 'offline' ? 'Read' : undefined}
          pois={poisData.pois as POI[]}
          onTeleportToPOI={handleTeleportToPOI}
          onSwitchMode={onSwitchMode}
          gyroEnabled={gyroEnabled}
          onGyroRecenter={() => { recenterGyroRef.current = true }}
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
          portrait={isPortrait}
        />
      )}
            

      {import.meta.env.DEV && showDebugOverlay && (
        <AssetDebugOverlay
          scene={sceneRef.current}
          onReload={() => {
            const scene = sceneRef.current
            if (scene) reloadAllAssets(scene, loadAssetsOptionsRef.current)
          }}
          onToggleAsset={(assetId) => {
            const scene = sceneRef.current
            if (scene) toggleAssetFallback(scene, assetId, loadAssetsOptionsRef.current)
          }}
        />
      )}
    </div>
  )
}
