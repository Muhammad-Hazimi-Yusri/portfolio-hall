import { Vector3 } from '@babylonjs/core/Maths/math.vector'

export interface TourWaypoint {
  position: Vector3
  target: Vector3
  progress: number // 0–1
}

/**
 * Camera waypoints tracing a path through the castle.
 * Coordinates are best-guess estimates — tune after visual QA.
 */
export const TOUR_WAYPOINTS: TourWaypoint[] = [
  // Intro: approaching the gate
  { progress: 0.00, position: new Vector3(0, 2.5, 22),   target: new Vector3(0, 1.6, 8) },
  { progress: 0.10, position: new Vector3(0, 1.8, 18),   target: new Vector3(0, 1.6, 8) },

  // Projects: entering and walking through main hall
  { progress: 0.15, position: new Vector3(0, 1.6, 16),   target: new Vector3(0, 1.6, 0) },
  { progress: 0.30, position: new Vector3(0, 1.6, 8),    target: new Vector3(-4, 1.6, 4) },
  { progress: 0.45, position: new Vector3(0, 1.6, 0),    target: new Vector3(4, 1.6, -4) },
  { progress: 0.55, position: new Vector3(0, 1.6, -8),   target: new Vector3(0, 1.6, -16) },

  // Impact: courtyard area
  { progress: 0.65, position: new Vector3(0, 1.6, -16),  target: new Vector3(-8, 1.6, -20) },
  { progress: 0.75, position: new Vector3(-4, 1.8, -20), target: new Vector3(0, 1.4, -24) },

  // Contact: garden, settling down
  { progress: 0.85, position: new Vector3(0, 1.6, -24),  target: new Vector3(0, 1.6, -28) },
  { progress: 1.00, position: new Vector3(0, 1.4, -26),  target: new Vector3(0, 1.6, -30) },
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
