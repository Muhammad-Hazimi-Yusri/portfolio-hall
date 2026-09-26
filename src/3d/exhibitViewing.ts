type Point = { x: number; y: number; z: number }

/** Leave room for the full 2.9 m frame, its plaque and the walking controls.
 * A narrow portrait view needs a longer approach, within the clear aisle. */
export function galleryViewingDistance(fov = .95, aspect = 16 / 9) {
  const usableFov = Number.isFinite(fov) && fov > .2 && fov < 2.5 ? fov : .95
  const usableAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9
  return Math.min(7, Math.max(3.8, 1.5 / (Math.tan(usableFov / 2) * usableAspect * .84)))
}

/** The note board is wider than a gallery frame, and stands on the end terrace. */
export function guestbookViewingDistance(fov = .95, aspect = 16 / 9) {
  const usableFov = Number.isFinite(fov) && fov > .2 && fov < 2.5 ? fov : .95
  const usableAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9
  return Math.min(9, Math.max(4.8, 1.9 / (Math.tan(usableFov / 2) * usableAspect * .84)))
}

export type InspectionTarget<T> = { value: T; position: Point; reach: number }

/** Prefer the nearby exhibit the visitor faces, rather than an object behind
 * them. A small distance bias breaks ties without overpowering their gaze. */
export function inspectionTarget<T>(position: Point, forward: Point, targets: InspectionTarget<T>[], view?: { fov: number; aspect: number }): T | null {
  const forwardLength = Math.hypot(forward.x, forward.y, forward.z)
  if (forwardLength < .0001) return null
  // Portrait views have a much narrower horizontal field of view. Do not offer
  // a nearby frame after it has passed out of sight at the side of the screen.
  const minimumAlignment = view ? Math.max(.72, Math.cos(Math.atan(Math.tan(view.fov / 2) * view.aspect))) : .72
  let selected: T | null = null, bestScore = -Infinity
  for (const target of targets) {
    const dx = target.position.x - position.x, dy = target.position.y - position.y, dz = target.position.z - position.z
    const distanceSquared = dx * dx + dy * dy + dz * dz
    if (distanceSquared > target.reach * target.reach || distanceSquared < .0001) continue
    const distance = Math.sqrt(distanceSquared)
    const alignment = (dx * forward.x + dy * forward.y + dz * forward.z) / (distance * forwardLength)
    if (alignment < minimumAlignment) continue
    const score = alignment - distance * .012
    if (score > bestScore) { bestScore = score; selected = target.value }
  }
  return selected
}
