export const EYE_HEIGHT = 1.6
export const WALK_SPEED = 2.6
export const RUN_SPEED = 5.2

/** World-space displacement in metres, independent of camera pitch and fps. */
export function walkingStep(x: number, forward: number, yaw: number, seconds: number, running: boolean) {
  const length = Math.hypot(x, forward)
  if (length < .08) return { x: 0, z: 0 }
  const distance = (running ? RUN_SPEED : WALK_SPEED) * Math.max(0, Math.min(.05, seconds)) / Math.max(1, length)
  return {
    x: (x * Math.cos(yaw) + forward * Math.sin(yaw)) * distance,
    z: (forward * Math.cos(yaw) - x * Math.sin(yaw)) * distance,
  }
}

export function jumpStep(height: number, velocity: number, seconds: number, jump: boolean) {
  const dt = Math.max(0, Math.min(.05, seconds)), gravity = 12
  if (jump && height <= EYE_HEIGHT + .001) velocity = 4
  const next = height + velocity * dt - .5 * gravity * dt * dt
  return next <= EYE_HEIGHT ? { height: EYE_HEIGHT, velocity: 0 } : { height: next, velocity: velocity - gravity * dt }
}

export function shortestYaw(from: number, to: number) {
  return from + Math.atan2(Math.sin(to - from), Math.cos(to - from))
}
