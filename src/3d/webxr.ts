import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'

export async function checkVRSupport(): Promise<boolean> {
  if (!navigator.xr) return false
  try {
    return await navigator.xr.isSessionSupported('immersive-vr')
  } catch {
    return false
  }
}

export async function createXRExperience(
  scene: Scene,
  floorMeshes: AbstractMesh[],
): Promise<WebXRDefaultExperience> {
  return WebXRDefaultExperience.CreateAsync(scene, {
    disableTeleportation: true,
    floorMeshes,
    uiOptions: {
      sessionMode: 'immersive-vr',
      referenceSpaceType: 'local-floor',
      // Suppress Babylon's default button; we render our own styled one
      htmlButtonFactory: () => {
        const el = document.createElement('button')
        el.style.display = 'none'
        return el
      },
    },
  })
}
