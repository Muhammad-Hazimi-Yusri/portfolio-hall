type Point = { x: number; y: number; z: number }
type Options = {
  enabled: () => boolean
  wake: () => void
  onChange: (active: boolean) => void
  onDrag: () => void
  radiansPerPixel: () => number
}

const wrap = (angle: number) => Math.atan2(Math.sin(angle), Math.cos(angle))
const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value))

/** Look from the current place without changing the guided path or camera roll. */
export function lookTarget(position: Point, target: Point, yaw: number, pitch: number, result: Point) {
  const dx = target.x - position.x, dy = target.y - position.y, dz = target.z - position.z
  const horizontal = Math.hypot(dx, dz), distance = Math.max(.1, Math.hypot(horizontal, dy))
  const heading = Math.atan2(dx, dz) + yaw
  const elevation = clamp(Math.atan2(dy, horizontal) + pitch, -1.15, 1.15)
  const flat = Math.cos(elevation) * distance
  result.x = position.x + Math.sin(heading) * flat
  result.y = position.y + Math.sin(elevation) * distance
  result.z = position.z + Math.cos(heading) * flat
}

/** Pointer look reuses the scene's render loop. Touch retains native scrolling. */
export function createBrowseLook(canvas: HTMLCanvasElement, options: Options) {
  let pointer: number | null = null, originX = 0, originY = 0, lastX = 0, lastY = 0
  let dragging = false, suppressPick = false, notified = false
  let yaw = 0, pitch = 0, wantedYaw = 0, wantedPitch = 0
  const report = () => {
    const active = Math.abs(yaw) + Math.abs(pitch) + Math.abs(wantedYaw) + Math.abs(wantedPitch) > .001
    if (notified !== active) { notified = active; options.onChange(active) }
  }
  const release = () => {
    const id = pointer
    if (dragging) canvas.classList.remove('is-looking')
    pointer = null; dragging = false
    if (id !== null && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id)
  }
  const cancel = () => { release(); options.wake() }
  const reset = (immediate = false) => {
    const changed = pointer !== null || yaw !== 0 || pitch !== 0 || wantedYaw !== 0 || wantedPitch !== 0
    release(); wantedYaw = 0; wantedPitch = 0
    if (immediate) { yaw = 0; pitch = 0 }
    if (changed) { report(); options.wake() }
  }
  const down = (event: PointerEvent) => {
    // Babylon may finish its pick after the DOM release handlers. Keep the
    // previous drag suppressed until the next actual pointer gesture begins.
    // Clear this even in island/touch mode, which owns its own input handling.
    suppressPick = false
    if (!options.enabled() || event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return
    pointer = event.pointerId
    originX = lastX = event.clientX; originY = lastY = event.clientY
  }
  const move = (event: PointerEvent) => {
    if (pointer !== event.pointerId) return
    if (!options.enabled() || !(event.buttons & 1)) { cancel(); return }
    if (!dragging) {
      if (Math.hypot(event.clientX - originX, event.clientY - originY) < 6) return
      dragging = true; suppressPick = true; canvas.classList.add('is-looking')
      canvas.setPointerCapture(event.pointerId)
      options.onDrag()
    }
    const sensitivity = options.radiansPerPixel()
    wantedYaw = wrap(wantedYaw - (event.clientX - lastX) * sensitivity)
    wantedPitch = clamp(wantedPitch + (event.clientY - lastY) * sensitivity, -.65, .65)
    lastX = event.clientX; lastY = event.clientY
    event.preventDefault(); options.wake()
  }
  const up = (event: PointerEvent) => {
    if (pointer !== event.pointerId) return
    // A short drag can be below Babylon's own swipe threshold. A final move
    // with buttons=0 may also have released capture before this event arrives.
    suppressPick ||= dragging
    release(); options.wake()
  }
  const lost = (event: PointerEvent) => { if (pointer === event.pointerId) cancel() }
  canvas.addEventListener('pointerdown', down, { capture: true })
  canvas.addEventListener('pointermove', move, { capture: true })
  canvas.addEventListener('pointerup', up, { capture: true })
  canvas.addEventListener('pointercancel', lost)
  canvas.addEventListener('lostpointercapture', lost)
  window.addEventListener('blur', cancel)

  return {
    get dragging() { return dragging },
    get blocksPick() { return dragging || suppressPick },
    reset,
    update(milliseconds: number, reducedMotion: boolean) {
      const oldYaw = yaw, oldPitch = pitch
      const amount = dragging || reducedMotion ? 1 : 1 - Math.exp(-Math.min(milliseconds, 80) / 110)
      yaw = wrap(yaw + wrap(wantedYaw - yaw) * amount)
      pitch += (wantedPitch - pitch) * amount
      if (Math.abs(wrap(wantedYaw - yaw)) + Math.abs(wantedPitch - pitch) < .0001) { yaw = wantedYaw; pitch = wantedPitch }
      report()
      return yaw !== oldYaw || pitch !== oldPitch
    },
    apply(position: Point, target: Point, result: Point) { lookTarget(position, target, yaw, pitch, result) },
    dispose() {
      canvas.removeEventListener('pointerdown', down, { capture: true })
      canvas.removeEventListener('pointermove', move, { capture: true })
      canvas.removeEventListener('pointerup', up, { capture: true })
      canvas.removeEventListener('pointercancel', lost)
      canvas.removeEventListener('lostpointercapture', lost)
      window.removeEventListener('blur', cancel)
      release()
    },
  }
}
