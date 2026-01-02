export function setupPointerLock(canvas: HTMLCanvasElement) {
  const requestLock = () => {
    canvas.requestPointerLock()
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

  return () => {
    canvas.removeEventListener('click', requestLock)
    document.removeEventListener('pointerlockchange', onLockChange)
  }
}