import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import type { POI } from '@/types/poi'
import { inspectionTarget } from './exhibitViewing'

type POIMeshMap = Map<string, { mesh: Mesh; poi: POI }>

export function setupInteraction(
  scene: Scene,
  camera: Camera,
  poiMeshes: POIMeshMap,
  onInteract: (poi: POI) => void,
  onNearbyChange: (poi: POI | null) => void
) {
  let nearbyPOI: POI | null = null
  const forwardAxis = new Vector3(0, 0, 1), forward = Vector3.Zero()
  const targets = [...poiMeshes.values()].map(({ mesh, poi }) => {
    const position = mesh.getAbsolutePosition().clone()
    // Pedestal roots are at floor level; use their display, not their base.
    if (poi.type !== 'painting') position.y = poi.experienceDisplay ? 1.9 : 1.37
    return { value: poi, position, reach: poi.type === 'painting' || poi.experienceDisplay ? 7.4 : poi.type === 'pedestal' ? 4.5 : 3.5 }
  })
  const contact = targets.find(target => target.value.id === 'contact')

  // A few vector comparisons, with no scene-wide ray cast or frame allocations.
  const observer = scene.onBeforeRenderObservable.add(() => {
    if (contact) {
      contact.position.y = scene.metadata?.guestbookActive ? 2.045 : 1.37
      contact.reach = scene.metadata?.guestbookActive ? 9.4 : 4.5
    }
    camera.getDirectionToRef(forwardAxis, forward)
    const closest = scene.metadata?.travelActive || scene.metadata?.inputPaused ? null
      : inspectionTarget(camera.position, forward, targets, { fov: camera.fov, aspect: scene.getEngine().getAspectRatio(camera) })

    if (closest !== nearbyPOI) {
      nearbyPOI = closest
      onNearbyChange(nearbyPOI)
    }
  })

  // E key to interact
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey && nearbyPOI && !scene.metadata?.inputPaused &&
        (document.pointerLockElement === scene.getEngine().getRenderingCanvas() || document.activeElement === scene.getEngine().getRenderingCanvas())) {
      onInteract(nearbyPOI)
    }
  }

  window.addEventListener('keydown', onKeyDown)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    scene.onBeforeRenderObservable.remove(observer)
  }
}
