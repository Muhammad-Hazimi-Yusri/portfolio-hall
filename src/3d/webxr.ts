import { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import { WebXRFeatureName } from '@babylonjs/core/XR/webXRFeaturesManager'
import type { WebXRMotionControllerTeleportation } from '@babylonjs/core/XR/features/WebXRControllerTeleportation'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Layer } from '@babylonjs/core/Layers/layer'
import { Color4 } from '@babylonjs/core/Maths/math.color'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
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
      // Suppress Babylon's default button; we render our own styled one.
      // htmlButtonFactory was removed from the public type in Babylon.js v7 but
      // still works at runtime — suppress the excess-property error.
      // @ts-expect-error htmlButtonFactory removed from public types in Babylon.js v7 but still works at runtime
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

  // ── Smooth locomotion vignette ────────────────────────────────────────────
  // Persistent layer that fades IN while the left thumbstick is active and
  // fades OUT when released. Softer than the snap-turn flash (max 0.4 vs 0.7).
  const locoLayer = new Layer('locoFade', null, scene, false)  // false = foreground
  locoLayer.color = new Color4(0, 0, 0, 0)
  let locoAlpha = 0

  scene.onBeforeRenderObservable.add(() => {
    const dt = scene.getEngine().getDeltaTime()
    const leftCtrl = xr.input.controllers.find(
      (c) => c.inputSource.handedness === 'left',
    )
    let isMoving = false
    // Read thumbstick axes directly from the gamepad (axes[2] = X, axes[3] = Y
    // on Quest Pro left controller per the WebXR Gamepad standard mapping).
    const gp = leftCtrl?.inputSource.gamepad
    if (gp) {
      const ax = gp.axes[2] ?? 0
      const ay = gp.axes[3] ?? 0
      isMoving = Math.sqrt(ax * ax + ay * ay) > 0.2  // matches movementThreshold
    }
    const target = isMoving ? 0.4 : 0
    // Faster fade-in (30 ms) than fade-out (100 ms) to feel responsive
    locoAlpha += (target - locoAlpha) * Math.min(dt / (isMoving ? 30 : 100), 1)
    locoLayer.color.a = locoAlpha
  })
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

/**
 * Poll left-controller buttons each frame and fire callbacks on rising edge.
 *
 * Meta Quest Pro left controller mapping (WebXR Gamepad API):
 *   button[3] → X button  (onXButton)
 *   button[4] → Y button  (onYButton)
 *
 * Returns the scene observer so the caller can remove it on cleanup.
 */
export function setupVRMenuButton(
  xr: WebXRDefaultExperience,
  scene: Scene,
  onYButton: () => void,
  onXButton: () => void,
) {
  let prevY = false
  let prevX = false

  return scene.onBeforeRenderObservable.add(() => {
    const leftCtrl = xr.input.controllers.find(
      (c) => c.inputSource.handedness === 'left',
    )
    const gp = leftCtrl?.inputSource.gamepad
    if (!gp) return

    const curY = gp.buttons[4]?.pressed ?? false
    const curX = gp.buttons[3]?.pressed ?? false

    if (curY && !prevY) onYButton()
    if (curX && !prevX) onXButton()

    prevY = curY
    prevX = curX
  })!
}

/**
 * Offset the XR camera rig so a seated player (eye height ~0.9 m) sees the
 * scene at a comfortable standing-equivalent scale.
 *
 * The offset is applied to the camera's parent TransformNode (the rig),
 * which shifts the entire tracked coordinate frame up without fighting the
 * native per-frame head-position updates on the camera itself.
 *
 * Returns toggle(): call to switch seated ↔ standing mode.
 */
export function setupSeatedMode(xr: WebXRDefaultExperience): () => void {
  const SEATED_OFFSET = 0.7  // metres — lifts rig for a seated eye height of ~0.9 m
  let isSeated = false

  return function toggle() {
    isSeated = !isSeated
    const rig = xr.baseExperience.camera.parent
    if (rig) {
      // TransformNode.position is safe to set here; XR tracking updates the
      // camera's own position relative to the rig each frame.
      (rig as TransformNode).position.y = isSeated ? SEATED_OFFSET : 0
    }
  }
}
