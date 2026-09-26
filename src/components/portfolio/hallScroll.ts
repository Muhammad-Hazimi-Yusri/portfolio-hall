export type HallScrollAnchor = { view: string; section: string; top: number }
export type HallScrollFrame = { from: string; to: string; mix: number; view: string; section: string; progress: number }

/** Navigation and scroll selection must agree on the same reading line. */
export function hallAnchorTop(contentTop: number, viewportHeight: number, maximum: number) {
  const inset = Math.min(48, Math.max(0, viewportHeight) * .1)
  return Math.max(0, Math.min(maximum, contentTop - inset))
}

export function hallScrollFrame(anchors: HallScrollAnchor[], position: number, maximum: number): HallScrollFrame | null {
  if (!anchors.length) return null
  const progress = maximum > 0 ? Math.max(0, Math.min(1, position / maximum)) : 0
  let index = 0
  while (index < anchors.length - 1 && anchors[index + 1].top <= position) index++
  const from = anchors[index], to = anchors[Math.min(index + 1, anchors.length - 1)]
  const raw = to.top > from.top ? Math.max(0, Math.min(1, (position - from.top) / (to.top - from.top))) : 0
  const mix = raw * raw * (3 - 2 * raw)
  const current = mix < 0.5 ? from : to
  return { from: from.view, to: to.view, mix, view: current.view, section: current.section, progress }
}

/** Uniform treatment of an entire upcoming section, released before reading. */
export function sectionDefocus(top: number, viewportHeight: number) {
  const height = Math.max(1, viewportHeight)
  const amount = Math.max(0, Math.min(1, (top / height - .24) / .58))
  return amount * amount * (3 - 2 * amount)
}
