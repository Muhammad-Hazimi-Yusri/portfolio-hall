import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'
import type { HallScrollFrame } from './hallScroll'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
// Browse mode loads independently of the free-roam renderer; register picking here.
import '@babylonjs/core/Culling/ray'
import { createEngine, createScene } from '@/3d/engine'
import { createEnvironment } from '@/3d/scene'
import { createSceneMaterials } from '@/3d/materials'
import { createPOIMeshes } from '@/3d/pois'
import { createLights } from '@/3d/lights'
import { pois } from '@/data/pois'
import { projects } from '@/data/portfolio'
import { projectWorldRoute, type ProjectWorldId } from '@/data/projectWorlds'
import type { SpatialTone } from './useSpatialTone'
import { createProjectPortal } from '@/3d/projectPortal'
import { deferProjectPortal } from '@/3d/deferredProjectPortal'
import { createListeningRoom, HALL_LAYER } from '@/3d/listeningRoom'
import type { AvvrArchiveState, AvvrPresentation } from '@/data/avvrArchive'
import { createHardwareWorkshop } from '@/3d/hardwareWorkshop'
import { droneBuildDetail } from '@/data/droneBuild'
import type { DroneBuildDetail } from '@/data/droneBuild'
import { createVisitorDisplay } from '@/3d/visitorDisplay'
import type { Community } from '@/data/community'
import type { HallPose } from './hallNavigation'
import { exhibitAction } from './hallNavigation'
import type { ExhibitAction } from './hallNavigation'
import { createProjectNavigation } from '@/3d/projectNavigation'
import { createBrowseLook } from '@/3d/browseLook'

function viewpoint(view: string) {
  if (view === 'visitor-landscape') return { position: new Vector3(-105, 48, 42), target: new Vector3(48, 2.8, 42) }
  if (view.startsWith('experience/')) {
    const display = pois.find(poi => poi.id === view.slice('experience/'.length) && poi.experienceDisplay)
    if (display) return { position: new Vector3(display.position.x - Math.sign(display.position.x) * 1.3, 2.35, display.position.z - 4.3), target: new Vector3(display.position.x, 1.2, display.position.z) }
  }
  const exhibit = pois.find(poi => poi.content.links?.some(link => link.url === `#project/${view}`))
  if (exhibit) return { position: new Vector3(.75, 2.15, exhibit.position.z - 1.15), target: new Vector3(-4.5, 1.8, exhibit.position.z) }
  switch (view) {
    case 'work': return { position: new Vector3(1, 2.2, 7), target: new Vector3(-4.5, 1.5, 14) }
    case 'projects': {
      // Begin before the first public exhibit. A fixed middle-of-gallery pose
      // made the opening frames disappear behind the visitor, then scrolling
      // to the first row sent the camera backwards.
      const first = pois.find(poi => poi.content.links?.some(link => link.url === `#project/${projects[0]?.id}`))
      const z = first?.position.z ?? 18.8
      return { position: new Vector3(1, 2.35, z - 3.8), target: new Vector3(-4.5, 1.7, z + 2.2) }
    }
    case 'about': return { position: new Vector3(10.5, 7.6, 61), target: new Vector3(-.5, 1.4, 67.5) }
    case 'contact': return { position: new Vector3(2.8, 2.7, 79), target: new Vector3(0, 1.8, 86) }
    default: return { position: new Vector3(14.5, 8.5, -15), target: new Vector3(0, 1.4, 12) }
  }
}

type Props = {
  community: Community
  visitorDay?: MutableRefObject<string | null>
  view: string
  world: ProjectWorldId | null
  sourcePosition: number
  onSourceChange: (index: number) => void
  droneDetail: DroneBuildDetail | null
  onDroneDetail: (detail: DroneBuildDetail | null) => void
  audioRef: MutableRefObject<SpatialTone | null>
  worldAction: MutableRefObject<string | null>
  avvrPresentation: AvvrPresentation
  onArchiveState: (state: AvvrArchiveState) => void
  scrollFrame: MutableRefObject<HallScrollFrame | null>
  logosPaused: boolean
  highlightedExperience: string | null
  suspended?: boolean
  onReady: () => void
  onUnavailable: () => void
  browsePose: MutableRefObject<HallPose | null>
  focusedProject: string | null
  onExhibitHint: (action: ExhibitAction | null) => void
  onFrameImage: () => void
  onProjectVideo: (id: string) => void
  onGuestbook: (intent: import('@/data/community').GuestbookIntent) => void
  onLookChange: (active: boolean) => void
  resetLook: MutableRefObject<() => void>
}

export default function HallScene({ community, visitorDay, view, world, sourcePosition, onSourceChange, droneDetail, onDroneDetail, audioRef, worldAction, avvrPresentation, onArchiveState, scrollFrame, logosPaused, highlightedExperience, suspended = false, onReady, onUnavailable, browsePose, focusedProject, onExhibitHint, onFrameImage, onProjectVideo, onGuestbook, onLookChange, resetLook }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef(view)
  const pausedRef = useRef(logosPaused)
  const highlightedRef = useRef(highlightedExperience)
  const worldRef = useRef(world)
  const presentationRef = useRef(avvrPresentation)
  presentationRef.current = avvrPresentation
  const sourceRef = useRef(sourcePosition)
  const detailRef = useRef(droneDetail)
  detailRef.current = droneDetail
  const suspendedRef = useRef(suspended)
  const communityRef = useRef(community)
  const focusedRef = useRef(focusedProject)
  useEffect(() => { focusedRef.current = focusedProject }, [focusedProject])
  useEffect(() => { communityRef.current = community }, [community])
  useEffect(() => { suspendedRef.current = suspended }, [suspended])
  useEffect(() => { worldRef.current = world }, [world])
  useEffect(() => { sourceRef.current = sourcePosition }, [sourcePosition])
  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { pausedRef.current = logosPaused }, [logosPaused])
  useEffect(() => { highlightedRef.current = highlightedExperience }, [highlightedExperience])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let engine: ReturnType<typeof createEngine> | undefined
    let dispose = () => undefined as void
    try {
      engine = createEngine(canvas)
      const activeEngine = engine
      activeEngine.canvasTabIndex = -1
      canvas.tabIndex = -1
      // One render pixel per CSS pixel. Do not multiply the cost on Retina screens.
      activeEngine.setHardwareScalingLevel(1)
      const scene = createScene(activeEngine)
      // Browse controls live in HTML. Babylon's default canvas.focus() can
      // scroll a partly visible canvas between pointer-down and pointer-up,
      // causing the first exhibit pick to miss and moving the reading panel.
      scene.preventDefaultOnPointerDown = false
      scene.preventDefaultOnPointerUp = false
      const keepPagePosition = (event: PointerEvent) => event.preventDefault()
      canvas.addEventListener('pointerdown', keepPagePosition)
      activeEngine.onDisposeObservable.addOnce(() => canvas.removeEventListener('pointerdown', keepPagePosition))
      canvas.style.touchAction = 'pan-y'
      scene.metadata = { logosPaused: pausedRef.current, hoveredExperienceId: null, waterRefreshMs: 1000 / 30 }
      const environment = createEnvironment(scene, createSceneMaterials(scene))
      const visitors = createVisitorDisplay(scene)
      const navigation = createProjectNavigation(scene)
      const { meshMap } = createPOIMeshes(scene, pois)
      createLights(scene, environment, meshMap)
      const frameHighlight = new StandardMaterial('hovered-frame-bronze', scene)
      frameHighlight.diffuseColor = Color3.FromHexString('#9e7f54')
      frameHighlight.specularColor = new Color3(.28, .25, .2)
      const frameParts = new Map([...meshMap.values()].filter(({ poi }) => poi.type === 'painting').map(({ mesh, poi }) => [
        poi.content.links!.find(link => link.url.startsWith('#project/'))!.url.slice('#project/'.length),
        mesh.getChildMeshes().filter(child => child.name.startsWith(`${poi.id}-frame-`)).map(child => ({ mesh: child, material: child.material })),
      ] as const))
      let hovered: ExhibitAction | null = null
      let hoveredFrame: string | undefined
      const setHover = (action: ExhibitAction | null, navigationRoute: string | null = null) => {
        const id = !worldRef.current && !navigationRoute ? action?.projectId ?? action?.route : undefined
        if (id !== hoveredFrame) {
          for (const part of frameParts.get(hoveredFrame ?? '') ?? []) part.mesh.material = part.material
          for (const part of frameParts.get(id ?? '') ?? []) part.mesh.material = frameHighlight
          hoveredFrame = id
          scene.metadata.needsRender = true
        }
        navigation.setHovered(navigationRoute)
        if (action?.route !== hovered?.route || action?.kind !== hovered?.kind || action?.label !== hovered?.label || action?.title !== hovered?.title) {
          hovered = action
          onExhibitHint(action)
        }
        canvas.style.cursor = action ? 'pointer' : 'grab'
      }
      let lookSensitivity = .0018
      const look = createBrowseLook(canvas, {
        enabled: () => !worldRef.current && !suspendedRef.current && !portalOwned,
        wake: () => { scene.metadata.needsRender = true },
        onChange: onLookChange,
        onDrag: () => { setHover(null); scene.metadata.hoveredExperienceId = null },
        radiansPerPixel: () => lookSensitivity,
      })
      resetLook.current = () => look.reset()
      activeEngine.onDisposeObservable.addOnce(() => { resetLook.current = () => {}; look.dispose() })
      for (const { mesh, poi } of meshMap.values()) {
        const route = poi.content.links?.find(link => link.url.startsWith('#'))?.url
          ?? (poi.section === 'experience' ? '#about' : poi.section === 'contact' ? '#contact' : undefined)
        if (!route) continue
        for (const child of mesh.getChildMeshes()) child.metadata = { portfolioRoute: route }
        if (poi.type === 'pedestal' && !poi.experienceDisplay) {
          frameParts.set(route, mesh.getChildMeshes().filter(child => child.name === `${poi.id}-stand`).map(child => ({ mesh: child, material: child.material })))
        }
      }
      scene.pointerMovePredicate = mesh => Boolean(mesh.metadata?.portfolioRoute || mesh.metadata?.worldAction) && Boolean(mesh.layerMask & (scene.activeCamera?.layerMask ?? 0))
      scene.pointerDownPredicate = scene.pointerMovePredicate
      scene.pointerUpPredicate = scene.pointerMovePredicate
      scene.onPointerObservable.add(event => {
        if ((event.type === PointerEventTypes.POINTERPICK && look.blocksPick) || (event.type === PointerEventTypes.POINTERMOVE && look.dragging)) return
        const route = event.pickInfo?.pickedMesh?.metadata?.portfolioRoute
        const action = event.pickInfo?.pickedMesh?.metadata?.worldAction as string | undefined
        const navigationLabel = event.pickInfo?.pickedMesh?.metadata?.navigationLabel as string | undefined
        const detail = action?.startsWith('detail-') ? droneBuildDetail(action.slice(7)) : null
        const guestbookIntent = event.pickInfo?.pickedMesh?.metadata?.guestbookIntent as import('@/data/community').GuestbookIntent | undefined
        const destination: ExhibitAction | null = guestbookIntent
          ? { kind: 'route', route, label: guestbookIntent === 'analytics' ? 'Explore the visitor landscape' : guestbookIntent === 'visitors' ? 'View visitor log' : guestbookIntent === 'write' ? 'Leave a note' : 'Read visitor notes', title: guestbookIntent === 'analytics' || guestbookIntent === 'visitors' ? navigationLabel ?? 'Visitor log' : 'Guestbook' }
          : detail
            ? { kind: 'route', route, label: 'Inspect build note', title: navigationLabel ?? 'Drone component' }
          : action === 'image'
            ? { kind: 'image', route: window.location.hash, label: 'Enlarge image', title: navigationLabel ?? 'Project image' }
            : route ? exhibitAction(route, focusedRef.current, navigationLabel, action) : null
        if (event.type === PointerEventTypes.POINTERMOVE) {
          setHover(destination, navigationLabel ? route : null)
          if (action) canvas.style.cursor = 'pointer'
          scene.metadata.hoveredExperienceId = route?.startsWith('#experience/') ? route.slice('#experience/'.length) : null
        }
        if (event.type === PointerEventTypes.POINTERPICK) {
          setHover(null)
          if (guestbookIntent) onGuestbook(guestbookIntent)
          else if (detail && worldRef.current === 'hardware' && viewRef.current === 'fpv-drone') onDroneDetail(detail)
          else if (destination?.kind === 'image') onFrameImage()
          else if (destination?.kind === 'video' && destination.projectId) onProjectVideo(destination.projectId)
          else if (destination?.kind === 'notes') {
            const heading = document.querySelector<HTMLElement>('.project-heading h1')
            heading?.scrollIntoView({ block: 'start', behavior: 'auto' })
            heading?.focus({ preventScroll: true })
          }
          else if (route === '#contact' && window.location.hash === '#contact') {
            const destination = document.querySelector<HTMLElement>('.hall-reading [data-hall-section="contact"] a[href^="mailto:"]')
            destination?.scrollIntoView({ block: 'center', behavior: 'auto' })
            destination?.focus({ preventScroll: true })
          }
          else if (route && route !== window.location.hash) window.location.hash = route
          else if (action?.startsWith('source-')) onSourceChange(action === 'source-next' ? (sourceRef.current + 1) % (worldRef.current === 'hardware' ? 2 : 3) : Number(action.slice(-1)))
          else if (action === 'notes') document.querySelector('.case-image')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, PointerEventTypes.POINTERMOVE | PointerEventTypes.POINTERPICK)
      const initial = viewpoint(viewRef.current)
      const camera = new UniversalCamera('browse-camera', initial.position, scene)
      // Keep exhibits in frame in the tall desktop pane as well as the wide mobile stage.
      const fitCamera = () => {
        camera.fov = Math.max(0.78, 2 * Math.atan(Math.tan(0.47) / activeEngine.getAspectRatio(camera)))
        lookSensitivity = camera.fov / Math.max(1, activeEngine.getRenderHeight())
      }
      fitCamera()
      camera.inputs.clear()
      camera.minZ = 0.1
      camera.maxZ = 1600
      let target = initial.target
      camera.setTarget(target)
      let mayPreparePortal = false
      const preparePortal = (worldId: ProjectWorldId, projectIds: string[], build: Parameters<typeof createProjectPortal>[5]) => {
        const entries = projectIds.map(projectId => ({ projectId, hallZ: pois.find(poi => poi.id === projectId)!.position.z }))
        const frames = entries.map(entry => {
          const mesh = scene.getMeshByName(entry.projectId)!
          mesh.computeWorldMatrix(true)
          // The original artwork keeps the same portal action before its live
          // window exists, including a click made while the camera is moving.
          mesh.metadata = { ...mesh.metadata, portfolioRoute: projectWorldRoute(worldId, entry.projectId) }
          return { mesh, center: new Vector3(-4.44, 1.92, entry.hallZ) }
        })
        return deferProjectPortal(() => createProjectPortal(scene, camera, canvas, entries, worldId, build, viewpoint), () => {
          if (!mayPreparePortal || camera.layerMask !== HALL_LAYER || scene.metadata.profilePortalsDisabled || camera.position.x <= -4.44) return false
          camera.getViewMatrix(); camera.getProjectionMatrix()
          // Prepare a nearby visible frame after motion settles, so first-time
          // geometry work cannot interrupt a scroll or drag. Direct entry is
          // still synchronous and never waits for an approach timer.
          return frames.some(frame => Vector3.DistanceSquared(camera.position, frame.center) < 30 * 30 && camera.isInFrustum(frame.mesh))
        })
      }
      const portals = {
        avvr: preparePortal('avvr', ['avvr'], scene => createListeningRoom(scene, onArchiveState)),
        hardware: preparePortal('hardware', ['petbot', 'fpv-drone'], createHardwareWorkshop),
      }
      let portal = portals.avvr
      let portalOwned = false
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let firstFrame = true
      let lastFrame = performance.now()
      let settleUntil = lastFrame + 1500
      let lastInteraction = ''
      let lastHoverContext = ''
      let lastAudio: SpatialTone | null = null
      let lastLookRoute = viewRef.current, lastLookProgress = scrollFrame.current?.progress
      let lastLookWorld = worldRef.current
      const lookedTarget = new Vector3()
      let resized = true
      const render = () => {
        if (document.hidden || suspendedRef.current) return
        visitors.update(communityRef.current)
        const landscapeView = viewRef.current === 'visitor-landscape'
        visitors.selectDay(landscapeView ? visitorDay?.current ?? null : null)
        const now = performance.now()
        const elapsed = Math.min(now - lastFrame, 80)
        lastFrame = now
        const scroll = worldRef.current || landscapeView ? null : scrollFrame.current
        if (viewRef.current !== lastLookRoute || worldRef.current !== lastLookWorld || scroll?.progress !== lastLookProgress) look.reset(Boolean(worldRef.current))
        lastLookRoute = viewRef.current; lastLookWorld = worldRef.current; lastLookProgress = scroll?.progress
        const looking = look.update(elapsed, reduceMotion.matches)
        const currentView = scroll?.view ?? viewRef.current
        const hoverContext = `${currentView}/${focusedRef.current}/${worldRef.current}`
        if (hoverContext !== lastHoverContext) { setHover(null); lastHoverContext = hoverContext }
        navigation.update(worldRef.current ? null : focusedRef.current, elapsed, reduceMotion.matches)
        scene.metadata.logosPaused = pausedRef.current
        scene.metadata.selectedExperienceId = currentView.startsWith('experience/') ? currentView.slice('experience/'.length) : null
        scene.metadata.highlightedExperienceId = highlightedRef.current
        scene.metadata.experienceOverview = currentView === 'about'
        const destination = viewpoint(scroll?.from ?? viewRef.current)
        if (scroll) {
          const next = viewpoint(scroll.to)
          destination.position = Vector3.Lerp(destination.position, next.position, scroll.mix)
          destination.target = Vector3.Lerp(destination.target, next.target, scroll.mix)
          const travel = Math.sin(scroll.mix * Math.PI)
          if ((scroll.from === 'about' || scroll.from.startsWith('experience/')) && (scroll.to === 'about' || scroll.to.startsWith('experience/'))) destination.position.z -= travel * 4.4
          else if (scroll.from !== scroll.to) destination.position.x += travel * 0.8
          if (scroll.from === scroll.to && scroll.from.includes('experience/')) destination.position.y += scroll.progress * 0.12
          else if (scroll.from === scroll.to && !['', 'work', 'projects', 'about', 'contact'].includes(scroll.from)) destination.position.z += scroll.progress * 0.22
        }
        const amount = reduceMotion.matches ? 1 : 1 - Math.exp(-elapsed / 210)
        // Finish a return before another destination takes ownership of the camera.
        if (portal.phase === 'hall' && worldRef.current) portal = portals[worldRef.current]
        if (worldRef.current) portal.setProject(viewRef.current)
        if (worldRef.current === 'avvr') portal.setPresentation(presentationRef.current)
        else if (worldRef.current === 'hardware') portal.setPresentation(detailRef.current ?? '')
        portal.setSource(worldRef.current ? sourceRef.current : 0)
        if (worldAction.current) {
          if (worldAction.current === 'reset') portal.resetView()
          else portal.rotate(worldAction.current === 'left' ? -.25 : .25)
          worldAction.current = null
        }
        const selectedPortal = worldRef.current ? portals[worldRef.current] : null
        const controlled = portal.update(selectedPortal === portal, now, reduceMotion.matches, destination, Boolean(audioRef.current))
        if (lastAudio !== audioRef.current) { lastAudio = audioRef.current; scene.metadata.needsRender = true }
        if (controlled) {
          // A walk requested during portal travel must not reuse the old hall
          // view, or project an island's distant coordinates onto the hall floor.
          const hallTarget = scene.activeCamera === camera && camera.layerMask === HALL_LAYER ? camera.getTarget() : null
          browsePose.current = hallTarget ? {
            position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            target: { x: hallTarget.x, y: hallTarget.y, z: hallTarget.z },
          } : null
        }
        if (portalOwned && !controlled) target = camera.getTarget().clone()
        portalOwned = controlled
        const moving = !controlled && Vector3.DistanceSquared(camera.position, destination.position) + Vector3.DistanceSquared(target, destination.target) > 0.000001
        const interaction = `${pausedRef.current}/${highlightedRef.current}/${scene.metadata.hoveredExperienceId}/${currentView}`
        if (interaction !== lastInteraction || moving) settleUntil = now + 1500
        lastInteraction = interaction
        // Each visible logo schedules its own next update. Tracking can settle;
        // gentle idle motion uses 30 Hz without slowing camera or portal travel.
        const logoDue = now >= (scene.metadata.logoFrameAt ?? Infinity)
        if (!firstFrame && !moving && !looking && !logoDue && !resized && !scene.metadata.needsRender && !scene.metadata.profileContinuous && now > settleUntil) return
        if (!controlled) {
          camera.position = moving ? Vector3.Lerp(camera.position, destination.position, amount) : destination.position
          target = moving ? Vector3.Lerp(target, destination.target, amount) : destination.target
          look.apply(camera.position, target, lookedTarget)
          camera.setTarget(lookedTarget)
          browsePose.current = { position: { x: camera.position.x, y: camera.position.y, z: camera.position.z }, target: { x: lookedTarget.x, y: lookedTarget.y, z: lookedTarget.z } }
          mayPreparePortal = !moving && !looking && !look.dragging
          Object.values(portals).forEach(item => item.preview(now, Boolean(scene.metadata.portalPreviewsDirty)))
          scene.metadata.portalPreviewsDirty = false
        }
        const audio = audioRef.current
        if (audio && portal.phase === 'world') {
          const listener = audio.context.listener
          const position = portal.listeningCamera.position
          const direction = portal.listeningCamera.target.subtract(position).normalize()
          listener.positionX.value = position.x; listener.positionY.value = position.y; listener.positionZ.value = position.z
          listener.forwardX.value = direction.x; listener.forwardY.value = direction.y; listener.forwardZ.value = direction.z
          listener.upX.value = 0; listener.upY.value = 1; listener.upZ.value = 0
          audio.panner.positionX.value = portal.source.x; audio.panner.positionY.value = portal.source.y; audio.panner.positionZ.value = portal.source.z
          audio.start()
        }
        scene.metadata.needsRender = false
        scene.metadata.logoFrameAt = Infinity
        resized = false
        scene.render()
        if (firstFrame) { firstFrame = false; onReady() }
      }
      const resize = new ResizeObserver(() => { activeEngine.resize(); fitCamera(); Object.values(portals).forEach(item => item.resize()); resized = true })
      resize.observe(canvas)
      canvas.addEventListener('webglcontextlost', onUnavailable)
      const clearHover = () => { scene.metadata.hoveredExperienceId = null; setHover(null) }
      canvas.addEventListener('pointerleave', clearHover)
      activeEngine.runRenderLoop(render)
      dispose = () => {
        resize.disconnect()
        canvas.removeEventListener('webglcontextlost', onUnavailable)
        canvas.removeEventListener('pointerleave', clearHover)
        activeEngine.stopRenderLoop(render)
        Object.values(portals).forEach(item => item.dispose())
        visitors.dispose()
        scene.dispose()
      }
    } catch {
      onUnavailable()
    }
    return () => { dispose(); engine?.dispose() }
  }, [onReady, onUnavailable, scrollFrame, audioRef, worldAction, onSourceChange, onDroneDetail, onArchiveState, browsePose, visitorDay, onExhibitHint, onFrameImage, onProjectVideo, onGuestbook, onLookChange, resetLook])

  return <canvas ref={canvasRef} className="hall-canvas" aria-hidden="true" />
}
