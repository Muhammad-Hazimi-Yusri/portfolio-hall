// Side-effect: registers the HAND_TRACKING feature with Babylon's feature manager
import '@babylonjs/core/XR/features/WebXRHandTracking'
import type { WebXRHandTracking, WebXRHand, WebXRHandJoint } from '@babylonjs/core/XR/features/WebXRHandTracking'
import { WebXRFeatureName } from '@babylonjs/core/XR/webXRFeaturesManager'
import type { WebXRDefaultExperience } from '@babylonjs/core/XR/webXRDefaultExperience'
import type { Scene } from '@babylonjs/core/scene'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer'
import { Ray } from '@babylonjs/core/Culling/ray'
import { flashVignette } from './webxr'
import { createHoverLabel, showVRPanel, type PanelResult } from './vrUI'
import type { POI } from '@/types/poi'

// Pinch is detected when thumb tip and index tip are closer than PINCH_ON.
// It releases only when they separate past PINCH_OFF — hysteresis prevents chatter.
const PINCH_ON  = 0.035   // 3.5 cm
const PINCH_OFF = 0.050   // 5.0 cm
const EMA_K     = 0.3     // exponential moving average factor for direction smoothing
const MAX_POI_DIST = 10   // metres — POIs beyond this are not selectable

type POIOptions = {
  poiMeshes: Map<string, { mesh: Mesh; poi: POI }>
  onLinkQueued: (url: string) => void
}

/**
 * Enable Babylon.js hand tracking for the active XR session.
 *
 * - Babylon renders default joint/hand meshes automatically (natural finger movement)
 * - Right hand: pinch (thumb + index) triggers VR POI interaction via `onVRSelectAttempt`
 * - Right hand: index-finger direction is EMA-smoothed each frame for ray casting
 * - Left hand: pinch confirms gaze teleport — a gold disc on the floor previews the
 *   landing spot; pinch moves the XR rig to that X/Z position
 * - When `poiOptions` is provided (Slice 4+): hover ray casting, HighlightLayer, floating
 *   labels, and the teak+gold info panel are all active
 * - Graceful switching: hand visuals hide when controllers are picked back up
 *
 * Returns a cleanup fn — call it before scene.dispose() in the component cleanup.
 */
export function setupHandTracking(
  scene: Scene,
  xr: WebXRDefaultExperience,
  grounds: AbstractMesh[],
  poiOptions?: POIOptions,
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
  // EMA-smoothed direction of the right index finger — used for POI ray casting
  const smoothedDir = new Vector3(0, 0, -1)
  let lastFloorHit: Vector3 | null = null

  // ── POI interaction state (only when poiOptions provided) ──────────────────
  const hl = poiOptions ? new HighlightLayer('vrHoverHL', scene) : null
  const goldColor = new Color3(0.79, 0.62, 0.18)  // #CA9933

  // Flat set of all POI group + child meshes, for fast pick-filter
  const poiMeshList = new Set<AbstractMesh>()
  if (poiOptions) {
    for (const { mesh } of poiOptions.poiMeshes.values()) {
      poiMeshList.add(mesh)
      for (const child of mesh.getChildMeshes()) poiMeshList.add(child)
    }
  }

  let hoveredPOI: POI | null = null
  let lastHoveredPOI: POI | null = null
  let hoverLabelDispose: (() => void) | null = null
  let panelDispose: (() => void) | null = null
  let panelRef: PanelResult | null = null

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

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Find the POI entry whose group or child mesh matches `picked`. */
  function findPoiByMesh(picked: AbstractMesh | null | undefined): { mesh: Mesh; poi: POI } | null {
    if (!picked || !poiOptions) return null
    for (const entry of poiOptions.poiMeshes.values()) {
      if (picked === entry.mesh) return entry
      for (const child of entry.mesh.getChildMeshes()) {
        if (picked === child) return entry
      }
    }
    return null
  }

  /** Open the teak+gold VR info panel for `poi`. */
  function openPanel(poi: POI): void {
    panelDispose?.()
    hl?.removeAllMeshes()
    hoverLabelDispose?.()
    hoverLabelDispose = null
    lastHoveredPOI = null   // force label/highlight to re-evaluate after panel closes

    const result = showVRPanel(
      scene,
      poi,
      xrCamera.position,
      xrCamera.getForwardRay(1).direction,
      () => {
        panelDispose = null
        panelRef = null
      },
    )
    panelDispose = result.dispose
    panelRef = result
  }

  /**
   * Handle a "select" attempt from the given ray origin + direction.
   * Called on right-hand pinch and on controller trigger press.
   */
  function onVRSelectAttempt(rayOrigin: Vector3, rayDir: Vector3): void {
    if (!poiOptions) return
    const ray = new Ray(rayOrigin, rayDir.normalize(), 15)
    const hit = scene.pickWithRay(ray, (m) => m.isPickable && !grounds.includes(m) && m !== tipIndicator && m !== gazeDisc)

    if (panelRef) {
      // Panel is open — route to close or link
      if (panelRef.isCloseButton(hit?.pickedMesh)) {
        panelDispose?.()
        panelDispose = null
        panelRef = null
      } else {
        const url = panelRef.getLinkUrl(hit?.pickedMesh)
        if (url) poiOptions.onLinkQueued(url)
      }
    } else {
      // Panel not open — inspect hovered POI (within distance limit)
      const entry = findPoiByMesh(hit?.pickedMesh)
      if (entry && (hit?.distance ?? Infinity) < MAX_POI_DIST) {
        openPanel(entry.poi)
      } else if (hoveredPOI) {
        openPanel(hoveredPOI)
      }
    }
  }

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

  // ── Controller event listeners ─────────────────────────────────────────────
  if (poiOptions) {
    xr.input.onControllerAddedObservable.add((ctrl) => {
      ctrl.onMotionControllerInitObservable.addOnce((mc) => {
        // Trigger → VR select
        mc.getComponentOfType('trigger')?.onButtonStateChangedObservable.add(({ pressed }) => {
          if (!pressed) return
          const ptr = ctrl.pointer
          if (!ptr) return
          const dir = Vector3.TransformNormal(Vector3.Forward(), ptr.getWorldMatrix()).normalize()
          onVRSelectAttempt(ptr.absolutePosition, dir)
        })

        // B button (right) / Y button (left) → close panel
        const closeBtn = mc.getComponent('b-button') ?? mc.getComponent('y-button')
        closeBtn?.onButtonStateChangedObservable.add(({ pressed }) => {
          if (pressed && panelRef) {
            panelDispose?.()
            panelDispose = null
            panelRef = null
          }
        })
      })
    })
  }

  // ── Per-frame update ───────────────────────────────────────────────────────
  const obs = scene.onBeforeRenderObservable.add(() => {
    // ── POI hover ray casting ─────────────────────────────────────────────
    if (poiOptions && !panelRef) {
      hoveredPOI = null
      let hitDist = Infinity

      // 1. Controller rays (priority when controllers are active)
      for (const ctrl of xr.input.controllers) {
        const ptr = ctrl.pointer
        if (!ptr) continue
        const dir = Vector3.TransformNormal(Vector3.Forward(), ptr.getWorldMatrix()).normalize()
        const ray = new Ray(ptr.absolutePosition, dir, MAX_POI_DIST)
        const hit = scene.pickWithRay(ray, (m) => poiMeshList.has(m))
        if (hit?.hit && hit.distance < MAX_POI_DIST && hit.distance < hitDist) {
          const entry = findPoiByMesh(hit.pickedMesh)
          if (entry) { hoveredPOI = entry.poi; hitDist = hit.distance }
        }
      }

      // 2. Hand ray fallback (when no controller hit and hands are detected)
      if (!hoveredPOI && handsDetected > 0) {
        const rightHand = handTracking.getHandByHandedness('right')
        const indexTip = rightHand ? _joint(rightHand, 'index-finger-tip') : undefined
        if (indexTip) {
          const ray = new Ray(indexTip.absolutePosition, smoothedDir, MAX_POI_DIST)
          const hit = scene.pickWithRay(ray, (m) => poiMeshList.has(m))
          if (hit?.hit && hit.distance < MAX_POI_DIST) {
            const entry = findPoiByMesh(hit.pickedMesh)
            if (entry) hoveredPOI = entry.poi
          }
        }
      }

      // 3. Update HighlightLayer + label when hovered POI changes
      if (hoveredPOI !== lastHoveredPOI) {
        hl?.removeAllMeshes()
        hoverLabelDispose?.()
        hoverLabelDispose = null

        if (hoveredPOI) {
          const { mesh } = poiOptions.poiMeshes.get(hoveredPOI.id)!
          hl?.addMesh(mesh, goldColor)
          for (const child of mesh.getChildMeshes()) {
            if (child instanceof Mesh) hl?.addMesh(child, goldColor)
          }
          hoverLabelDispose = createHoverLabel(scene, hoveredPOI.content.title, mesh.absolutePosition)
        }

        lastHoveredPOI = hoveredPOI
      }
    }

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
          if (poiOptions) {
            // VR POI select attempt via hand ray
            onVRSelectAttempt(indexTip.absolutePosition, smoothedDir)
          } else {
            // Fallback: still fire the legacy custom event
            canvas?.dispatchEvent(new CustomEvent('xr-pinch-select', { bubbles: true }))
          }
        } else if (rightPinchActive && dist > PINCH_OFF) {
          rightPinchActive = false
        }

        // EMA-smooth the pointing direction for ray casting
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
    hl?.dispose()
    hoverLabelDispose?.()
    panelDispose?.()
  }
}

/** Safely retrieve a joint mesh — returns undefined if the joint is not yet tracked */
function _joint(hand: WebXRHand, joint: string): AbstractMesh | undefined {
  try {
    return hand.getJointMesh(joint as WebXRHandJoint) as AbstractMesh | undefined
  } catch {
    return undefined
  }
}
