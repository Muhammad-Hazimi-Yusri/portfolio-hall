export function setupPointerLock(canvas: HTMLCanvasElement, onError: () => void = () => {}, enabled: () => boolean = () => true) {
  const requestLock = (event: MouseEvent) => {
    if (!enabled() || (event as PointerEvent).pointerType === 'touch' || document.pointerLockElement === canvas) return
    canvas.focus({ preventScroll: true })
    try {
      const request = canvas.requestPointerLock()
      request?.catch(onError)
    } catch { onError() }
  }

  const onLockChange = () => {
    if (document.pointerLockElement === canvas) {
      canvas.classList.add('cursor-none')
    } else {
      canvas.classList.remove('cursor-none')
    }
  }

  canvas.addEventListener('click', requestLock)
  document.addEventListener('pointerlockchange', onLockChange)
  document.addEventListener('pointerlockerror', onError)

  return () => {
    canvas.removeEventListener('click', requestLock)
    document.removeEventListener('pointerlockchange', onLockChange)
    document.removeEventListener('pointerlockerror', onError)
    if (document.pointerLockElement === canvas) document.exitPointerLock()
  }
}
