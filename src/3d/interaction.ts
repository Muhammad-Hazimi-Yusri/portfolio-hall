import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { POI } from '@/types/poi'

type POIMeshMap = Map<string, { mesh: Mesh; poi: POI }>

export function setupInteraction(
  scene: Scene,
  camera: { position: Vector3 },
  poiMeshes: POIMeshMap,
  onInteract: (poi: POI) => void,
  onNearbyChange: (poi: POI | null) => void
) {
  const interactDistance = 2.5
  let nearbyPOI: POI | null = null

  // Check proximity each frame
  scene.onBeforeRenderObservable.add(() => {
    let closest: POI | null = null
    let closestDist = Infinity

    poiMeshes.forEach(({ mesh, poi }) => {
      const dist = Vector3.Distance(
        camera.position,
        mesh.position
      )
      if (dist < interactDistance && dist < closestDist) {
        closest = poi
        closestDist = dist
      }
    })

    if (closest !== nearbyPOI) {
      nearbyPOI = closest
      onNearbyChange(nearbyPOI)
    }
  })

  // E key to interact
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === 'KeyE' && nearbyPOI) {
      onInteract(nearbyPOI)
    }
  }

  window.addEventListener('keydown', onKeyDown)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
  }
}