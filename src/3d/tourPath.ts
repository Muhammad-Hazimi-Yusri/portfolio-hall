import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export interface TourWaypoint {
  position: Vector3
  target: Vector3
  progress: number // 0–1
}

/**
 * Camera waypoints tracing a linear path along the boardwalk.
 *
 * Physical layout (top-down, z+ = forward along boardwalk):
 *   ARRIVAL      z≈0,    cylinder d=8
 *   GALLERY      z 8→58, rect 10×50, wall at x=-5
 *   OBSERVATORY  z≈68,   cylinder d=14
 *   HORIZON      z 75→90, rect 4×15
 *
 * Route: approach over water → arrival → gallery walk → observatory → horizon
 */
export const TOUR_WAYPOINTS: TourWaypoint[] = [
  // Intro (0.00–0.15): approach over water → land on arrival platform
  { progress: 0.00, position: new Vector3(0, 2.5, -5),   target: new Vector3(0, 1.6, 10) },
  { progress: 0.10, position: new Vector3(0, 1.8, 2),    target: new Vector3(0, 1.6, 15) },

  // Projects (0.15–0.65): walk along gallery, glancing left at paintings
  { progress: 0.15, position: new Vector3(1, 1.6, 8),    target: new Vector3(-4, 1.6, 14) },
  { progress: 0.25, position: new Vector3(1.5, 1.6, 18), target: new Vector3(-4, 1.6, 22) },
  { progress: 0.35, position: new Vector3(1, 1.6, 28),   target: new Vector3(-4, 1.6, 32) },
  { progress: 0.45, position: new Vector3(1.5, 1.6, 38), target: new Vector3(-4, 1.6, 42) },
  { progress: 0.55, position: new Vector3(1, 1.6, 48),   target: new Vector3(-4, 1.6, 52) },
  { progress: 0.62, position: new Vector3(0, 1.6, 56),   target: new Vector3(0, 1.6, 68) },

  // Impact (0.65–0.85): arriving at the wider observatory platform
  { progress: 0.65, position: new Vector3(0, 1.6, 62),   target: new Vector3(0, 1.6, 68) },
  { progress: 0.75, position: new Vector3(2, 1.8, 68),   target: new Vector3(-2, 1.4, 70) },
  { progress: 0.82, position: new Vector3(-1, 1.6, 72),  target: new Vector3(0, 1.6, 80) },

  // Contact (0.85–1.00): walking toward the vanishing point
  { progress: 0.85, position: new Vector3(0, 1.6, 76),   target: new Vector3(0, 1.6, 88) },
  { progress: 1.00, position: new Vector3(0, 1.5, 84),   target: new Vector3(0, 1.6, 95) },
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
