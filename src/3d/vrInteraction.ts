// Side-effect: registers the HAND_TRACKING feature with Babylon's feature manager
import '@babylonjs/core/XR/features/WebXRHandTracking'
import type { WebXRHandTracking, WebXRHand, XRHandJoint } from '@babylonjs/core/XR/features/WebXRHandTracking'
import { WebXRFeatureName } from '@babylonjs/core/XR/webXRFeaturesManager'
import type { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { flashVignette } from './webxr'

// Pinch is detected when thumb tip and index tip are closer than PINCH_ON.
// It releases only when they separate past PINCH_OFF — hysteresis prevents chatter.
const PINCH_ON  = 0.035   // 3.5 cm
const PINCH_OFF = 0.050   // 5.0 cm
const EMA_K     = 0.3     // exponential moving average factor for direction smoothing

/**
 * Enable Babylon.js hand tracking for the active XR session.
 *
 * - Babylon renders default joint/hand meshes automatically (natural finger movement)
 * - Right hand: pinch (thumb + index) fires an `xr-pinch-select` CustomEvent on the
 *   canvas — slice 4 will listen for this to trigger POI inspection
 * - Right hand: index-finger direction is EMA-smoothed each frame for use by the
 *   slice-4 ray cast (infrastructure only; no ray-cast POI hit in this slice)
 * - Left hand: pinch confirms gaze teleport — a gold disc on the floor previews the
 *   landing spot; pinch moves the XR rig to that X/Z position
 * - Graceful switching: hand visuals hide when controllers are picked back up
 *
 * Returns a cleanup fn — call it before scene.dispose() in the component cleanup.
 */
export function setupHandTracking(
  scene: Scene,
  xr: WebXRDefaultExperience,
  grounds: AbstractMesh[],
): () => void {
  const fm = xr.baseExperience.featuresManager
  const xrCamera = xr.baseExperience.camera

  const handTracking = fm.enableFeature(
    WebXRFeatureName.HAND_TRACKING,
    'latest',
    { xrInput: xr.input },
  ) as WebXRHandTracking | null

  if (!handTracking) {
    console.warn('[HandTracking] Feature unavailable on this device/session — skipping.')
    return () => {}
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let handsDetected = 0
  let rightPinchActive = false
  let leftPinchActive = false
  // EMA-smoothed direction of the right index finger — consumed by slice 4
  const smoothedDir = new Vector3(0, 0, -1)
  let lastFloorHit: Vector3 | null = null

  // ── Visuals ─────────────────────────────────────────────────────────────────
  // Tiny sphere anchored at the right index fingertip — marks the pointer origin
  const tipIndicator = MeshBuilder.CreateSphere(
    'handTipIndicator',
    { diameter: 0.02, segments: 6 },
    scene,
  )
  const tipMat = new StandardMaterial('handTipMat', scene)
  tipMat.emissiveColor = new Color3(1, 1, 1)
  tipMat.disableLighting = true
  tipIndicator.material = tipMat
  tipIndicator.isVisible = false
  tipIndicator.isPickable = false

  // Gold disc that previews the gaze-teleport landing spot
  const gazeDisc = MeshBuilder.CreateDisc(
    'handGazeDisc',
    { radius: 0.35, tessellation: 32 },
    scene,
  )
  const discMat = new StandardMaterial('handGazeDiscMat', scene)
  discMat.emissiveColor = new Color3(0.792, 0.6, 0.2)   // #CA9933 — matches the controller ring
  discMat.alpha = 0.75
  discMat.disableLighting = true
  discMat.backFaceCulling = false
  gazeDisc.rotation.x = Math.PI / 2    // lie flat on floor
  gazeDisc.isVisible = false
  gazeDisc.isPickable = false
  gazeDisc.material = discMat

  // ── Hand-count tracking ────────────────────────────────────────────────────
  handTracking.onHandAddedObservable.add(() => { handsDetected++ })
  handTracking.onHandRemovedObservable.add(() => {
    handsDetected = Math.max(0, handsDetected - 1)
    if (handsDetected === 0) {
      // Controller picked back up — hide all hand-specific visuals
      tipIndicator.isVisible = false
      gazeDisc.isVisible = false
      rightPinchActive = false
      leftPinchActive = false
    }
  })

  // ── Per-frame update ───────────────────────────────────────────────────────
  const obs = scene.onBeforeRenderObservable.add(() => {
    if (handsDetected === 0) return

    const canvas = scene.getEngine().getRenderingCanvas()

    // ── Right hand: pointer direction + pinch select ─────────────────────────
    const rightHand = handTracking.getHandByHandedness('right')
    if (rightHand) {
      const indexTip  = _joint(rightHand, 'index-finger-tip')
      const thumbTip  = _joint(rightHand, 'thumb-tip')
      const indexProx = _joint(rightHand, 'index-finger-phalanx-proximal')

      if (indexTip && thumbTip) {
        const dist = Vector3.Distance(indexTip.absolutePosition, thumbTip.absolutePosition)

        if (!rightPinchActive && dist < PINCH_ON) {
          rightPinchActive = true
          console.log('[HandTracking] right pinch')
          // slice 4 will listen for this event to trigger POI inspection
          canvas?.dispatchEvent(new CustomEvent('xr-pinch-select', { bubbles: true }))
        } else if (rightPinchActive && dist > PINCH_OFF) {
          rightPinchActive = false
        }

        // EMA-smooth the pointing direction for slice 4's ray cast
        if (indexProx) {
          const rawDir = indexTip.absolutePosition.subtract(indexProx.absolutePosition)
          if (rawDir.length() > 0.001) {
            Vector3.LerpToRef(smoothedDir, rawDir.normalize(), EMA_K, smoothedDir)
            smoothedDir.normalize()
          }
        }

        tipIndicator.position.copyFrom(indexTip.absolutePosition)
        tipIndicator.isVisible = true
      } else {
        tipIndicator.isVisible = false
      }
    } else {
      tipIndicator.isVisible = false
    }

    // ── Left hand: confirm gaze teleport ────────────────────────────────────
    const leftHand = handTracking.getHandByHandedness('left')
    if (leftHand) {
      const lThumb = _joint(leftHand, 'thumb-tip')
      const lIndex = _joint(leftHand, 'index-finger-tip')

      if (lThumb && lIndex) {
        const dist = Vector3.Distance(lThumb.absolutePosition, lIndex.absolutePosition)

        if (!leftPinchActive && dist < PINCH_ON) {
          leftPinchActive = true
          if (lastFloorHit) {
            // Preserve Y (headset-tracked head height); move only X/Z
            xrCamera.position.x = lastFloorHit.x
            xrCamera.position.z = lastFloorHit.z
            flashVignette(scene)
          }
        } else if (leftPinchActive && dist > PINCH_OFF) {
          leftPinchActive = false
        }
      }
    }

    // ── Gaze target: forward ray from XR camera onto floor ──────────────────
    const ray = xrCamera.getForwardRay(12)
    const hit = scene.pickWithRay(ray, (mesh) => grounds.includes(mesh))
    if (hit?.hit && hit.pickedPoint) {
      lastFloorHit = hit.pickedPoint.clone()
      gazeDisc.position.copyFrom(hit.pickedPoint)
      gazeDisc.position.y += 0.005   // prevent z-fighting
      gazeDisc.isVisible = true
    } else {
      lastFloorHit = null
      gazeDisc.isVisible = false
    }
  })

  return () => {
    scene.onBeforeRenderObservable.remove(obs)
    tipIndicator.dispose()
    gazeDisc.dispose()
  }
}

/** Safely retrieve a joint mesh — returns undefined if the joint is not yet tracked */
function _joint(hand: WebXRHand, joint: XRHandJoint): AbstractMesh | undefined {
  try {
    return hand.getJointMesh(joint) as AbstractMesh | undefined
  } catch {
    return undefined
  }
}
