import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export interface TourWaypoint {
  position: Vector3
  target: Vector3
  progress: number // 0–1
}

/**
 * Camera waypoints tracing a path through the castle.
 *
 * Physical layout (top-down, z+ = south toward entrance):
 *   RECEPTION  z 8→18,  x -5→5
 *   COURTYARD  z -8→8,  x -8→8
 *   MAIN_HALL  z -22→-8, x -8→8
 *   GARDEN     z -6→6,  x -20→-8  (west of courtyard)
 *
 * Route: gate → reception → quick courtyard transit → main hall gallery
 *        → back to courtyard → west into garden
 */
export const TOUR_WAYPOINTS: TourWaypoint[] = [
  // Intro (0.00–0.15): approach gate → enter reception
  { progress: 0.00, position: new Vector3(0, 2.5, 22),    target: new Vector3(0, 1.6, 13) },
  { progress: 0.10, position: new Vector3(0, 1.8, 17),    target: new Vector3(0, 1.6, 8) },

  // Projects (0.15–0.65): reception → courtyard → main hall gallery
  { progress: 0.15, position: new Vector3(0, 1.6, 13),    target: new Vector3(0, 1.6, -8) },
  { progress: 0.22, position: new Vector3(0, 1.6, -2),    target: new Vector3(0, 1.6, -12) },
  { progress: 0.30, position: new Vector3(3, 1.6, -12),   target: new Vector3(-5, 1.6, -15) },
  { progress: 0.45, position: new Vector3(-3, 1.6, -16),  target: new Vector3(5, 1.6, -16) },
  { progress: 0.55, position: new Vector3(0, 1.6, -19),   target: new Vector3(0, 1.6, -8) },

  // Impact (0.65–0.85): back into courtyard
  { progress: 0.65, position: new Vector3(0, 1.6, -6),    target: new Vector3(-4, 1.6, 0) },
  { progress: 0.75, position: new Vector3(-3, 1.6, 0),    target: new Vector3(-12, 1.6, 0) },

  // Contact (0.85–1.00): into garden, settling
  { progress: 0.85, position: new Vector3(-9, 1.6, 0),    target: new Vector3(-12, 1.6, 0) },
  { progress: 1.00, position: new Vector3(-10, 1.4, 0),   target: new Vector3(-14, 1.6, 0) },
]

/** Smoothstep easing: t * t * (3 - 2t) */
function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

/**
 * Interpolate camera position and look-at target for a given scroll progress.
 * Finds the two bracketing waypoints and lerps with smoothstep easing.
 */
export function getCameraStateAtProgress(progress: number): {
  position: Vector3
  target: Vector3
} {
  const wp = TOUR_WAYPOINTS

  // Clamp to extremes
  if (progress <= wp[0].progress) {
    return { position: wp[0].position.clone(), target: wp[0].target.clone() }
  }
  if (progress >= wp[wp.length - 1].progress) {
    return {
      position: wp[wp.length - 1].position.clone(),
      target: wp[wp.length - 1].target.clone(),
    }
  }

  // Find bracketing waypoints
  let i = 0
  for (; i < wp.length - 1; i++) {
    if (progress >= wp[i].progress && progress <= wp[i + 1].progress) break
  }

  const a = wp[i]
  const b = wp[i + 1]
  const raw = (progress - a.progress) / (b.progress - a.progress)
  const t = smoothstep(raw)

  return {
    position: Vector3.Lerp(a.position, b.position, t),
    target: Vector3.Lerp(a.target, b.target, t),
  }
}
