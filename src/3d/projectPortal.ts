import type { Scene } from '@babylonjs/core/scene'
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Plane } from '@babylonjs/core/Maths/math.plane'
import { Frustum } from '@babylonjs/core/Maths/math.frustum'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture'
import { HALL_LAYER } from './listeningRoom'
import { backThroughPortal, portalExitPose, portalFrustum, portalRefreshInterval, smoothStep, throughPortal } from './portalMath'

type Phase = 'hall' | 'enter' | 'world' | 'exit'
type WorldGeometry = {
  origin: Vector3; layer: number; meshes: Mesh[]; landing: Vector3; target: Vector3; source: Vector3
  setSource: (index: number) => void
  setProject?: (id: string) => void
  viewForProject?: (id: string) => { position: Vector3; target: Vector3 }
  entryForProject?: (id: string) => Vector3
  setPresentation?: (mode: string) => void
  presentationView?: () => { key: string; position: Vector3; target: Vector3; mode: 'default' | 'model' | 'panorama'; transition?: 'smooth'; minRadius?: number }
  previewReady?: () => boolean
  animate: (now: number, playing: boolean, reducedMotion: boolean) => void
}
type PortalEntry = { projectId: string; hallZ: number }
const vector = (point: { x: number; y: number; z: number }) => new Vector3(point.x, point.y, point.z)

/** One engine and one scene: the frame is a window into already-created geometry. */
export function createProjectPortal(scene: Scene, camera: UniversalCamera, canvas: HTMLCanvasElement, entries: PortalEntry[], worldId: string, build: (scene: Scene) => WorldGeometry, frameView: (projectId: string) => { position: Vector3; target: Vector3 }) {
  const buildStart = import.meta.env.DEV ? { time: performance.now(), meshes: scene.meshes.length, textures: scene.textures.length } : null
  const hall = new Vector3(-4.44, 1.92, entries[0].hallZ)
  let projectId = entries[0].projectId
  const hallMeshes = scene.meshes.filter(mesh => Boolean(mesh.layerMask & HALL_LAYER))
  const room = build(scene)
  const world = (room.entryForProject?.(projectId) ?? room.origin).clone(), WORLD_LAYER = room.layer
  const hallColor = scene.clearColor.clone()
  const worldColor = new Color4(.035, .095, .13, 1)
  const frameWidth = 2.9, frameHeight = 1.94
  const reducePreviewMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const previews: RenderTargetTexture[] = []
  const previewSize = () => {
    // A phone's small stage does not need desktop-sized offscreen renders.
    const width = Math.min(640, Math.max(320, Math.round(scene.getEngine().getRenderWidth() / 64) * 64))
    return { width, height: Math.round(width * frameHeight / frameWidth) }
  }

  const windowView = (name: string, position: Vector3, rotation: number, layer: number, destination: 'hall' | 'world', anchor = hall, worldAnchor = world) => {
    const previewCamera = new FreeCamera(`${name}-camera`, Vector3.Zero(), scene)
    previewCamera.inputs.clear(); previewCamera.minZ = .01; previewCamera.maxZ = 250
    previewCamera.layerMask = destination === 'world' ? WORLD_LAYER : HALL_LAYER
    const texture = new RenderTargetTexture(`${name}-view`, previewSize(), scene, false)
    texture.activeCamera = previewCamera
    texture.renderList = destination === 'world' ? room.meshes : hallMeshes
    texture.forceLayerMaskCheck = true; texture.refreshRate = 0
    // Babylon intentionally does not frustum-cull an explicit renderList.
    // Filter it for this small window instead of drawing the entire destination.
    const destinationMeshes = texture.renderList
    const planes = Frustum.GetPlanes(Matrix.Identity())
    texture.getCustomRenderList = () => {
      previewCamera.getViewMatrix(); previewCamera.getProjectionMatrix()
      Frustum.GetPlanesToRef(previewCamera.getTransformationMatrix(), planes)
      return destinationMeshes.filter(item => {
        if (!item.isEnabled() || !item.isVisible || !item.getTotalVertices()) return false
        item.computeWorldMatrix()
        return item.isInFrustum(planes)
      })
    }
    texture.clearColor = destination === 'world' ? worldColor : hallColor
    let previousClip: Scene['clipPlane']
    texture.onBeforeRenderObservable.add(() => {
      previousClip = scene.clipPlane
      scene.clipPlane = destination === 'world' ? new Plane(0, 0, -1, worldAnchor.z) : new Plane(-1, 0, 0, anchor.x)
    })
    texture.onAfterRenderObservable.add(() => { scene.clipPlane = previousClip })
    // A wide-angle/distant frame begins as its existing project artwork. Do
    // not spend a first offscreen render on a window nobody can yet look into.
    let registered = false
    previews.push(texture)
    const material = new StandardMaterial(`${name}-material`, scene)
    material.disableLighting = true; material.emissiveTexture = texture; material.emissiveColor = Color3.Black()
    material.fogEnabled = false
    if (destination === 'world') {
      material.alpha = 0
      material.transparencyMode = StandardMaterial.MATERIAL_ALPHABLEND
    }
    // The reverse side must disappear during the crossing, or it briefly
    // blocks the destination with a reflected view of the room just left.
    const mesh = MeshBuilder.CreatePlane(name, { width: frameWidth, height: frameHeight }, scene)
    mesh.position.copyFrom(position); mesh.rotation.y = rotation; mesh.material = material; mesh.layerMask = layer
    mesh.computeWorldMatrix(true)
    const previousPosition = new Vector3(Infinity, Infinity, Infinity)
    let refreshed = -Infinity
    let revealedAt: number | null = null
    return { mesh, update(viewer: Camera, now: number, force = false, travelling = false) {
      if (scene.metadata.profilePortalsDisabled) {
        if (destination === 'world' && material.alpha !== 0) { material.alpha = 0; scene.metadata.needsRender = true }
        return
      }
      if (!(viewer.layerMask & layer)) return
      const position = viewer.position
      const entering = destination === 'world'
      const distance = entering ? position.x - anchor.x : position.z - worldAnchor.z
      if (distance <= 0) return // The back of this window is not visible.
      const distanceSquared = Vector3.DistanceSquared(position, mesh.position)
      const right = entering ? position.z - anchor.z : worldAnchor.x - position.x
      const up = position.y - (entering ? anchor.y : worldAnchor.y)
      let opacity = 1
      if (entering) {
        // At a grazing angle the ray can miss the whole island, leaving an
        // empty blue rectangle. Reveal the actual window only as its view
        // becomes useful; the opaque original artwork remains behind it.
        // Keep this plane pickable throughout, so the action never changes.
        const facing = smoothStep((1.05 - Math.max(Math.abs(right), Math.abs(up) * 1.8) / distance) / .3)
        const proximity = travelling ? 1 : smoothStep((24 * 24 - distanceSquared) / (24 * 24 - 18 * 18))
        opacity = facing * proximity
        if (opacity === 0) {
          if (material.alpha !== 0) { material.alpha = 0; scene.metadata.needsRender = true }
          return
        }
      }
      viewer.getViewMatrix(); viewer.getProjectionMatrix()
      if (!travelling && !viewer.isInFrustum(mesh)) return
      if (entering) {
        revealedAt ??= now
        // A newly prepared island dissolves through the original project
        // image. Crossing and reduced-motion views use the window immediately.
        opacity *= travelling || reducePreviewMotion.matches ? 1 : smoothStep((now - revealedAt) / 260)
        if (material.alpha !== opacity) { material.alpha = opacity; scene.metadata.needsRender = true }
      }
      if (!force && now - refreshed < portalRefreshInterval(distanceSquared, travelling)) return
      if (!force && Vector3.DistanceSquared(previousPosition, position) < .000001) return
      previousPosition.copyFrom(position); refreshed = now
      previewCamera.position.copyFrom(entering ? vector(throughPortal(position, anchor, worldAnchor)) : vector(backThroughPortal(position, anchor, worldAnchor)))
      previewCamera.setTarget(previewCamera.position.add(entering ? new Vector3(0, 0, 1) : new Vector3(1, 0, 0)))
      previewCamera.freezeProjectionMatrix(Matrix.FromArray(portalFrustum(frameWidth, frameHeight, right, up, distance, .01, 250, scene.getEngine().isNDCHalfZRange)))
      if (!registered) { scene.customRenderTargets.push(texture); registered = true }
      texture.resetRefreshCounter()
    } }
  }
  const entrances = entries.map(entry => {
    const center = new Vector3(-4.44, 1.92, entry.hallZ)
    // Every frame has its own doorway into the shared room. A selected station
    // must not move the other frame's preview or reuse its camera transform.
    const worldCenter = (room.entryForProject?.(entry.projectId) ?? room.origin).clone()
    const window = windowView(`${entry.projectId}-portal`, center, -Math.PI / 2, HALL_LAYER, 'world', center, worldCenter)
    window.mesh.metadata = { portfolioRoute: `#world/${worldId}/${entry.projectId}` }
    return { ...entry, center, worldCenter, window }
  })
  let entrance = entrances[0].window
  const exit = windowView(`${worldId}-return-portal`, world, Math.PI, WORLD_LAYER, 'hall')
  exit.mesh.metadata = { portfolioRoute: `#project/${projectId}` }
  const frameMat = new StandardMaterial(`${worldId}-return-frame-timber`, scene)
  frameMat.diffuseColor = Color3.FromHexString('#866a50'); frameMat.fogEnabled = false
  const returnMeshes = [exit.mesh]
  for (const [w, h, x, y] of [[3.06, .08, 0, 1.01], [3.06, .08, 0, -1.01], [.08, 1.94, -1.49, 0], [.08, 1.94, 1.49, 0]]) {
    const bar = MeshBuilder.CreateBox(`${worldId}-return-frame`, { width: w, height: h, depth: .12 }, scene)
    bar.position.set(world.x + x, world.y + y, world.z + .02); bar.material = frameMat; bar.layerMask = WORLD_LAYER
    bar.metadata = { portfolioRoute: `#project/${projectId}` }
    returnMeshes.push(bar)
  }
  // These cameras never become independent scenes, and do not receive input
  // until travel is complete. Orbit limits keep visitors on the inhabited side.
  const orbit = new ArcRotateCamera(`${worldId}-room-camera`, -Math.PI / 2, 1.22, 8, room.target, scene)
  orbit.layerMask = WORLD_LAYER; orbit.minZ = .03; orbit.maxZ = 230
  orbit.lowerRadiusLimit = 4; orbit.upperRadiusLimit = 20
  orbit.lowerBetaLimit = .45; orbit.upperBetaLimit = 1.48
  orbit.lowerAlphaLimit = -Math.PI * .92; orbit.upperAlphaLimit = -Math.PI * .08
  orbit.panningSensibility = 0; orbit.wheelDeltaPercentage = .012; orbit.pinchDeltaPercentage = .008
  // A short drag should not coast around behind the room's edge screens.
  orbit.inertia = .5
  orbit.angularSensibilityX = 1100; orbit.angularSensibilityY = 1100
  orbit.fov = camera.fov
  const stopOrbit = () => {
    orbit.inertialAlphaOffset = 0; orbit.inertialBetaOffset = 0; orbit.inertialRadiusOffset = 0
    orbit.inertialPanningX = 0; orbit.inertialPanningY = 0
  }
  scene.activeCamera = camera
  let phase: Phase = 'hall', started = 0
  let startPosition = camera.position.clone(), startTarget = camera.getTarget().clone()
  const exitDestination = frameView(projectId)
  let landing = room.viewForProject?.(projectId).position ?? room.landing
  let roomTarget = room.viewForProject?.(projectId).target ?? room.target
  let focus: { position: Vector3; target: Vector3; toPosition: Vector3; toTarget: Vector3; started: number; duration: number } | null = null
  const focusView = (position: Vector3, target: Vector3, duration = 700) => {
    stopOrbit()
    focus = { position: orbit.position.clone(), target: orbit.target.clone(), toPosition: position.clone(), toTarget: target.clone(), started: performance.now(), duration }
    scene.metadata.needsRender = true
  }
  const lastOrbitView = Matrix.Zero()
  let lastSource = -1
  let lastPresentation = '', presentationView = ''
  let orbitMode: 'default' | 'model' | 'panorama' = 'default'
  let returnVisible = true
  let lastPlaying = false
  let awakeUntil = 0
  const lastPreviewPosition = new Vector3(Infinity, Infinity, Infinity)
  const setPose = (position: Vector3, target: Vector3, inWorld: boolean) => {
    camera.position.copyFrom(position); camera.setTarget(target)
    camera.layerMask = inWorld ? WORLD_LAYER : HALL_LAYER
    scene.clearColor.copyFrom(inWorld ? worldColor : hallColor)
  }
  const finishEnter = () => {
    phase = 'world'; focus = null; stopOrbit(); orbit.target.copyFrom(roomTarget); orbit.setPosition(landing)
    scene.activeCamera = orbit; orbit.attachControl(canvas, true)
    canvas.style.touchAction = 'none'; awakeUntil = performance.now() + 1200
  }
  const finishExit = () => {
    phase = 'hall'; focus = null; scene.activeCamera = camera; canvas.style.touchAction = 'pan-y'
    setPose(exitDestination.position, exitDestination.target, false)
  }
  const input = (event: Event) => { awakeUntil = performance.now() + 1400; if (event.type !== 'pointermove') focus = null }
  canvas.addEventListener('pointermove', input); canvas.addEventListener('pointerdown', input); canvas.addEventListener('wheel', input, { passive: true })
  const portal = {
    get phase() { return phase },
    get source() { return room.source },
    get listeningCamera() { return orbit },
    preview(now: number, force = false) {
      if (camera.layerMask !== HALL_LAYER) return
      if (room.previewReady?.() === false) return
      entrances.forEach(entry => entry.window.update(camera, now, force))
    },
    setProject(id: string) {
      if (projectId === id || phase === 'enter' || phase === 'exit') return
      const entry = entrances.find(item => item.projectId === id)
      if (!entry) return
      projectId = id; hall.copyFrom(entry.center); entrance = entry.window
      const shift = entry.worldCenter.subtract(world)
      world.copyFrom(entry.worldCenter)
      const destination = frameView(id)
      exitDestination.position.copyFrom(destination.position); exitDestination.target.copyFrom(destination.target)
      returnMeshes.forEach(mesh => {
        mesh.position.addInPlace(shift); mesh.computeWorldMatrix(true)
        mesh.metadata = { portfolioRoute: `#project/${id}` }
      })
      room.setProject?.(id); lastSource = -1
      const view = room.viewForProject?.(id)
      landing = view?.position ?? room.landing; roomTarget = view?.target ?? room.target
      if (phase === 'world') focusView(landing, roomTarget, 850)
      exit.update(scene.activeCamera ?? camera, performance.now(), true)
      scene.metadata.needsRender = true
    },
    setSource(index: number) { if (index !== lastSource) { lastSource = index; room.setSource(index); awakeUntil = performance.now() + 200 } },
    setPresentation(mode: string) { if (mode !== lastPresentation) { lastPresentation = mode; room.setPresentation?.(mode) } },
    resize() {
      orbit.fov = orbitMode === 'panorama' ? 1.22 : camera.fov; awakeUntil = performance.now() + 300
      const size = previewSize()
      previews.forEach(texture => { if (texture.getSize().width !== size.width) texture.resize(size) })
      scene.metadata.portalPreviewsDirty = true
    },
    resetView() { focusView(landing, roomTarget) },
    rotate(amount: number) {
      const alpha = Math.max(orbit.lowerAlphaLimit ?? -Infinity, Math.min(orbit.upperAlphaLimit ?? Infinity, orbit.alpha + amount))
      const horizontal = Math.sin(orbit.beta) * orbit.radius
      focusView(orbit.target.add(new Vector3(Math.cos(alpha) * horizontal, Math.cos(orbit.beta) * orbit.radius, Math.sin(alpha) * horizontal)), orbit.target, 360)
    },
    /** Returns true while portal travel or world interaction owns the camera. */
    update(wantsWorld: boolean, now: number, reducedMotion: boolean, destination: { position: Vector3; target: Vector3 }, playing: boolean) {
      const presentation = room.presentationView?.()
      if (presentation && presentation.key !== presentationView) {
        presentationView = presentation.key; orbitMode = presentation.mode
        landing = presentation.position; roomTarget = presentation.target
        const panoramic = orbitMode === 'panorama', freeOrbit = orbitMode !== 'default'
        orbit.lowerRadiusLimit = panoramic ? .002 : presentation.minRadius ?? 4; orbit.upperRadiusLimit = panoramic ? .002 : 20
        orbit.lowerBetaLimit = panoramic ? .12 : .35; orbit.upperBetaLimit = panoramic ? Math.PI - .12 : 1.48
        orbit.lowerAlphaLimit = freeOrbit ? null : -Math.PI * .92; orbit.upperAlphaLimit = freeOrbit ? null : -Math.PI * .08
        orbit.fov = panoramic ? 1.22 : camera.fov
        if (phase === 'world') {
          // A panorama is a photograph from one position. Do not fake a dolly
          // through it or interpolate from the tabletop's orbit centre.
          if (presentation.transition === 'smooth') focusView(landing, roomTarget, 600)
          else { stopOrbit(); focus = null; orbit.target.copyFrom(roomTarget); orbit.setPosition(landing) }
        }
        scene.metadata.needsRender = true
      }
      if (wantsWorld && (phase === 'hall' || phase === 'exit')) {
        // An interrupted return starts from the actual current pose.
        if (camera.layerMask === WORLD_LAYER) { finishEnter() }
        else { phase = 'enter'; started = now; startPosition = camera.position.clone(); startTarget = camera.getTarget().clone(); scene.activeCamera = camera }
      } else if (!wantsWorld && (phase === 'world' || phase === 'enter')) {
        if (phase === 'enter' && camera.layerMask === HALL_LAYER) { phase = 'hall' }
        else {
          startPosition = (scene.activeCamera ?? camera).position.clone()
          startTarget = scene.activeCamera === orbit ? orbit.target.clone() : camera.getTarget().clone()
          phase = 'exit'; started = now; orbit.detachControl(); stopOrbit(); scene.activeCamera = camera
        }
      }
      if (phase === 'enter') {
        const t = (now - started) / 2800
        if (reducedMotion || t >= 1) { setPose(landing, roomTarget, true); finishEnter() }
        else if (t < .22) {
          const a = smoothStep(t / .22)
          setPose(Vector3.Lerp(startPosition, hall.add(new Vector3(3.7, 0, 0)), a), Vector3.Lerp(startTarget, hall, a), false)
        } else if (t < .64) {
          // A single continuous distance goes from in front of the frame to
          // inside the room. Changing layer/coordinate system at zero is invisible.
          const a = smoothStep((t - .22) / .42)
          const distance = 3.7 - a * 3.95
          if (distance > .015) setPose(hall.add(new Vector3(distance, 0, 0)), hall.add(new Vector3(-4, 0, 0)), false)
          else {
            setPose(world.add(new Vector3(0, 0, -distance)), world.add(new Vector3(0, 0, 4)), true)
          }
        } else {
          const a = smoothStep((t - .64) / .36)
          setPose(Vector3.Lerp(world.add(new Vector3(0, 0, .25)), landing, a), Vector3.Lerp(world.add(new Vector3(0, 0, 4)), roomTarget, a), true)
        }
      } else if (phase === 'exit') {
        // Reading-position restoration can add a small offset to this same
        // frame's camera. Keep it, without redirecting a crossing to another stop.
        if (Vector3.DistanceSquared(destination.target, exitDestination.target) < .000001) exitDestination.position.copyFrom(destination.position)
        const t = (now - started) / 2600
        if (reducedMotion || t >= 1) {
          finishExit()
          if (reducedMotion) setPose(destination.position, destination.target, false)
        }
        else if (t < .4) {
          const a = smoothStep(t / .4)
          setPose(Vector3.Lerp(startPosition, world.add(new Vector3(0, 0, 3.7)), a), Vector3.Lerp(startTarget, world, a), true)
        } else {
          const a = smoothStep((t - .4) / .6)
          const exitDepth = exitDestination.position.x - hall.x
          const distance = 3.7 - a * (3.7 + exitDepth)
          if (distance > .015) setPose(world.add(new Vector3(0, 0, distance)), world.add(new Vector3(0, 0, -4)), true)
          else {
            // Finish at the same pose used by project browsing. Keeping a
            // separate fixed return pose caused a second camera correction.
            const pose = portalExitPose(hall, exitDestination, -distance / exitDepth)
            setPose(vector(pose.position), vector(pose.target), false)
          }
        }
      }
      // Keep the window visible right up to the crossing; the browse near plane
      // otherwise clips it first and produces a flash of the wall behind it.
      camera.minZ = phase === 'enter' || phase === 'exit' ? .005 : .1
      if (playing !== lastPlaying) { scene.metadata.needsRender = true; lastPlaying = playing }
      if (phase === 'world' && focus) {
        const t = reducedMotion ? 1 : Math.min(1, (now - focus.started) / focus.duration)
        orbit.target.copyFrom(Vector3.Lerp(focus.target, focus.toTarget, smoothStep(t)))
        orbit.setPosition(Vector3.Lerp(focus.position, focus.toPosition, smoothStep(t)))
        if (t === 1) focus = null
        scene.metadata.needsRender = true
      }
      room.animate(now, phase === 'world' && playing, reducedMotion)
      // The archived object and source photograph have no physical doorway.
      // Keep their views clean; restore the portal for travel back to the hall.
      const showReturn = phase !== 'world' || orbitMode === 'default'
      if (showReturn !== returnVisible) {
        returnVisible = showReturn; returnMeshes.forEach(mesh => mesh.setEnabled(showReturn))
        scene.metadata.needsRender = true
      }
      const active = scene.activeCamera ?? camera
      if (active.layerMask === WORLD_LAYER && returnVisible) exit.update(active, now, false, phase === 'exit')
      else if ((phase === 'enter' || phase === 'exit') && room.previewReady?.() !== false) entrance.update(camera, now, false, true)
      // A cached preview is refreshed when entering view, not every idle frame.
      const previewChanged = !lastPreviewPosition.equalsWithEpsilon(active.position, .001)
      lastPreviewPosition.copyFrom(active.position)
      if (phase === 'world') {
        const current = orbit.getViewMatrix()
        const changed = !lastOrbitView.equals(current)
        lastOrbitView.copyFrom(current)
        if (changed || now < awakeUntil || previewChanged) scene.metadata.needsRender = true
      } else if (phase !== 'hall' || previewChanged) scene.metadata.needsRender = true
      scene.metadata.portalPhase = `${worldId}/${phase}`
      return phase !== 'hall'
    },
    dispose() {
      orbit.detachControl()
      canvas.removeEventListener('pointermove', input); canvas.removeEventListener('pointerdown', input); canvas.removeEventListener('wheel', input)
      // All meshes, textures and cameras are owned and disposed by the scene.
      previews.forEach(texture => texture.onBeforeRenderObservable.clear())
    },
  }
  if (buildStart) {
    scene.metadata.portalBuilds ??= []
    scene.metadata.portalBuilds.push({
      world: worldId,
      ms: Number((performance.now() - buildStart.time).toFixed(2)),
      meshes: scene.meshes.length - buildStart.meshes,
      textures: scene.textures.length - buildStart.textures,
    })
  }
  return portal
}
