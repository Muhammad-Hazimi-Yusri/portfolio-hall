import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import type { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { Scene } from '@babylonjs/core/scene'
import type { POI } from '@/types/poi'
import { EYE_HEIGHT, shortestYaw } from './locomotion'
import { galleryViewingDistance, guestbookViewingDistance } from './exhibitViewing'
import { walkablePoint } from '../components/portfolio/hallNavigation'

export type FlyToTarget = { x: number; z: number; lookAtX?: number; lookAtZ?: number }
const flights = new WeakMap<UniversalCamera, () => void>()

/** Short, interruptible travel at eye height. A new destination cancels the old one. */
export function flyTo(
  scene: Scene, camera: UniversalCamera, target: FlyToTarget,
  onStart: () => void, onComplete: () => void,
) {
  flights.get(camera)?.()
  onStart()
  const initiatingFocus = document.activeElement
  camera.detachControl()
  camera.cameraDirection.setAll(0); camera.cameraRotation.setAll(0)
  const from = camera.position.clone(), pitch = camera.rotation.x, yaw = camera.rotation.y
  const destination = new Vector3(target.x, EYE_HEIGHT, target.z)
  const dx = (target.lookAtX ?? target.x) - target.x
  const dz = (target.lookAtZ ?? target.z + 8) - target.z
  const endYaw = shortestYaw(yaw, Math.atan2(dx, dz))
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : Math.min(650, 220 + Vector3.Distance(from, destination) * 6)
  const started = performance.now()
  let finished = false
  const finish = (restoreControls = true) => {
    if (finished) return
    finished = true
    scene.onBeforeAnimationsObservable.remove(observer)
    camera.onDisposeObservable.remove(disposeObserver)
    flights.delete(camera)
    camera.cameraDirection.setAll(0); camera.cameraRotation.setAll(0)
    if (restoreControls && !camera.isDisposed()) {
      const canvas = scene.getEngine().getRenderingCanvas()!
      camera.attachControl(canvas, true)
      // A destination button hands keyboard movement back to the scene. Do
      // not steal focus if the visitor tabbed to another control in flight.
      if (document.activeElement === initiatingFocus || document.activeElement === document.body) canvas.focus({ preventScroll: true })
    }
    onComplete()
  }
  const observer = scene.onBeforeAnimationsObservable.add(() => {
    const progress = duration ? Math.min(1, (performance.now() - started) / duration) : 1
    const mix = progress * progress * (3 - 2 * progress)
    Vector3.LerpToRef(from, destination, mix, camera.position)
    camera.rotation.set(pitch * (1 - mix), yaw + (endYaw - yaw) * mix, 0)
    if (progress === 1) finish()
  })
  const disposeObserver = camera.onDisposeObservable.addOnce(() => finish(false))
  flights.set(camera, () => finish(false))
}

/** Stay inside the walkable hall and face the exhibit. */
export function getApproachPosition(poi: POI, fov?: number, aspect?: number, guestbook = false) {
  const radians = poi.rotation * Math.PI / 180
  if (poi.experienceDisplay) {
    // The plaque is fixed to the plinth's front, unlike the rotating logo.
    // Leave room for both on phones, and keep the wider approach on the deck.
    const distance = Math.max(4.1, galleryViewingDistance(fov, aspect))
    const position = walkablePoint({ x: poi.position.x - Math.sin(radians) * distance, y: EYE_HEIGHT, z: poi.position.z - Math.cos(radians) * distance })
    return { x: position.x, z: position.z }
  }
  // The entrance/contact signs face local -Z. Gallery frames are approached
  // from the other side of their anchors.
  const distance = poi.id === 'contact' && guestbook ? -guestbookViewingDistance(fov, aspect)
    : poi.type === 'painting' ? galleryViewingDistance(fov, aspect)
    : poi.type === 'pedestal' && !poi.experienceDisplay ? -Math.min(4.1, galleryViewingDistance(fov, aspect)) : 2.5
  return { x: poi.position.x + Math.sin(radians) * distance, z: poi.position.z + Math.cos(radians) * distance }
}
