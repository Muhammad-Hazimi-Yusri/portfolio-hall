export type LogoMotion = 'left-right' | 'right-left' | 'bob'

export function idleLogoPose(motion: LogoMotion, elapsed: number) {
  // The front points along -Z: positive yaw turns its face to the viewer's left.
  const swing = Math.sin(elapsed * Math.PI / 6) * Math.PI / 9
  return {
    yaw: motion === 'bob' ? 0 : motion === 'left-right' ? swing : -swing,
    lift: motion === 'bob' ? Math.sin(elapsed * Math.PI / 1.8) * 0.13 : 0,
  }
}

export function logoTracksCamera(selected: boolean, hovered: boolean, distance: number, wasNear: boolean) {
  // Hysteresis avoids switching repeatedly when walking along the boundary.
  const near = distance < (wasNear ? 7 : 6)
  return { near, tracking: selected || hovered || near }
}

export function facingYaw(dx: number, dz: number) {
  return Math.atan2(-dx, -dz)
}

export function approachAngle(current: number, target: number, amount: number) {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current))
  return current + difference * amount
}
