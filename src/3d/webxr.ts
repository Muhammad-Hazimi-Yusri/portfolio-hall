import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import { WebXRFeatureName } from '@babylonjs/core/XR/webXRFeaturesManager'
import type { WebXRMotionControllerTeleportation } from '@babylonjs/core/XR/features/WebXRControllerTeleportation'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Layer } from '@babylonjs/core/Layers/layer'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'

// Side-effects: register features with the feature manager
import '@babylonjs/core/XR/features/WebXRControllerMovement'
import '@babylonjs/core/XR/features/WebXRControllerTeleportation'

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

export function setupVRLocomotion(
  scene: Scene,
  xr: WebXRDefaultExperience,
  grounds: AbstractMesh[],
): void {
  const fm = xr.baseExperience.featuresManager
  const xrCamera = xr.baseExperience.camera

  // Wall collision — reuse the same collision setup as the desktop FPS camera
  xrCamera.checkCollisions = true
  xrCamera.ellipsoid = new Vector3(0.5, 0.9, 0.5)

  // ── Left thumbstick: smooth locomotion ────────────────────────────────────
  // movementSpeed default is 1.0; 0.1 is comfortable (~matches desktop walkSpeed 0.6)
  // Tune if too fast/slow: desktop speed per-frame ≈ 0.032 units at 60 fps
  fm.enableFeature(WebXRFeatureName.MOVEMENT, 'latest', {
    xrInput: xr.input,
    movementOrientationFollowsViewerPose: true,  // head-relative, not controller-relative
    movementOrientationFollowsController: false,
    movementSpeed: 0.1,
    movementThreshold: 0.2,  // ~0.2 dead zone to avoid drift
    rotationEnabled: false,  // snap turn handled by TELEPORTATION below
  })

  // ── Right thumbstick: parabolic teleport + 45° snap turn ─────────────────
  const teleportation = fm.enableFeature(
    WebXRFeatureName.TELEPORTATION,
    'stable',
    {
      xrInput: xr.input,
      floorMeshes: grounds,  // only ground planes are valid targets
      defaultTargetMeshOptions: {
        teleportationFillColor: '#CA9933',   // teak & gold theme — gold ring
        teleportationBorderColor: '#A07720',
      },
    },
  ) as WebXRMotionControllerTeleportation

  // Instance properties not available as constructor options in v7
  teleportation.rotationEnabled = true
  teleportation.rotationAngle = Math.PI / 4  // 45° snap
  teleportation.parabolicCheckRadius = 5

  // Brief vignette flash on snap turn for comfort
  teleportation.onAfterCameraTeleportRotation.add(() => flashVignette(scene))
}

export function flashVignette(scene: Scene): void {
  const layer = new Layer('snapFade', null, scene, false)  // false = foreground overlay
  layer.color = new Color4(0, 0, 0, 0.7)
  let ms = 0
  const obs = scene.onBeforeRenderObservable.add(() => {
    ms += scene.getEngine().getDeltaTime()
    const t = Math.min(ms / 300, 1)  // fade out over 300 ms
    layer.color.a = 0.7 * (1 - t)
    if (t >= 1) {
      scene.onBeforeRenderObservable.remove(obs)
      layer.dispose()
    }
  })
}
