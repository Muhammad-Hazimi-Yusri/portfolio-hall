export type Point3 = { x: number; y: number; z: number }

// The hall frame faces +X, with +Z to the viewer's right. Its destination
// faces -Z, with +X to the viewer's right. This is a rigid rotation, not a fade.
export function throughPortal(point: Point3, hall: Point3, world: Point3): Point3 {
  return { x: world.x + point.z - hall.z, y: world.y + point.y - hall.y, z: world.z - point.x + hall.x }
}

export function backThroughPortal(point: Point3, hall: Point3, world: Point3): Point3 {
  return { x: hall.x - point.z + world.z, y: hall.y + point.y - world.y, z: hall.z + point.x - world.x }
}

/** Projection through a physical rectangle, so the view shifts with the viewer. */
export function portalFrustum(width: number, height: number, right: number, up: number, distance: number, near = 0.01, far = 250, halfZ = false): number[] {
  const d = Math.max(near, distance)
  const left = (-width / 2 - right) * near / d
  const r = (width / 2 - right) * near / d
  const bottom = (-height / 2 - up) * near / d
  const top = (height / 2 - up) * near / d
  return [
    2 * near / (r - left), 0, 0, 0,
    0, 2 * near / (top - bottom), 0, 0,
    -(r + left) / (r - left), -(top + bottom) / (top - bottom), (halfZ ? far : far + near) / (far - near), 1,
    0, 0, -(halfZ ? 1 : 2) * far * near / (far - near), 0,
  ]
}

export function smoothStep(t: number) {
  const bounded = Math.max(0, Math.min(1, t))
  return bounded * bounded * (3 - 2 * bounded)
}

/** Emerge along the doorway normal, then turn toward the actual browse pose. */
export function portalExitPose(hall: Point3, destination: { position: Point3; target: Point3 }, progress: number) {
  const t = Math.max(0, Math.min(1, progress)), turn = smoothStep(t)
  const position = {
    x: hall.x + (destination.position.x - hall.x) * t,
    y: hall.y + (destination.position.y - hall.y) * turn,
    z: hall.z + (destination.position.z - hall.z) * turn,
  }
  const dx = destination.target.x - destination.position.x
  const dy = destination.target.y - destination.position.y
  const dz = destination.target.z - destination.position.z
  const heading = Math.atan2(dz, dx) * turn
  const pitch = Math.atan2(dy, Math.hypot(dx, dz)) * turn
  const distance = 4 + (Math.hypot(dx, dy, dz) - 4) * turn
  const flat = Math.cos(pitch) * distance
  return { position, target: {
    x: position.x + Math.cos(heading) * flat,
    y: position.y + Math.sin(pitch) * distance,
    z: position.z + Math.sin(heading) * flat,
  } }
}

/** Thumbnail windows need fewer refreshes; the actual crossing stays full-rate. */
export function portalRefreshInterval(distanceSquared: number, travelling: boolean) {
  return travelling ? 0 : distanceSquared < 64 ? 1000 / 60 : 1000 / 20
}
