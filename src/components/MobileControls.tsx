import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'

type MobileControlsProps = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
  onLook: (deltaX: number, deltaY: number) => void
}

export function MobileControls({ onMove, onMoveEnd, onLook }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const lookRef = useRef<HTMLDivElement>(null)
  const touchId = useRef<number | null>(null)
  const lastTouch = useRef<{ x: number; y: number } | null>(null)

  // Joystick setup
  useEffect(() => {
    if (!joystickRef.current) return

    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'dynamic',
      color: '#e94560',
      size: 120,
    })

    manager.on('move', (_, data) => {
      if (data.vector) {
        onMove(data.vector.x, data.vector.y)
      }
    })

    manager.on('end', () => {
      onMoveEnd()
    })

    return () => {
      manager.destroy()
    }
  }, [onMove, onMoveEnd])

  // Look touch setup
  useEffect(() => {
    const lookZone = lookRef.current
    if (!lookZone) return

    const onTouchStart = (e: TouchEvent) => {
      if (touchId.current !== null) return // already tracking a touch
      const touch = e.changedTouches[0]
      touchId.current = touch.identifier
      lastTouch.current = { x: touch.clientX, y: touch.clientY }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (touchId.current === null || !lastTouch.current) return
      
      // Find our tracked touch
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i]
        if (touch.identifier === touchId.current) {
          const deltaX = touch.clientX - lastTouch.current.x
          const deltaY = touch.clientY - lastTouch.current.y
          lastTouch.current = { x: touch.clientX, y: touch.clientY }
          onLook(deltaX, deltaY)
          break
        }
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId.current) {
          touchId.current = null
          lastTouch.current = null
          break
        }
      }
    }

    lookZone.addEventListener('touchstart', onTouchStart)
    lookZone.addEventListener('touchmove', onTouchMove)
    lookZone.addEventListener('touchend', onTouchEnd)

    return () => {
      lookZone.removeEventListener('touchstart', onTouchStart)
      lookZone.removeEventListener('touchmove', onTouchMove)
      lookZone.removeEventListener('touchend', onTouchEnd)
    }
  }, [onLook])

  return (
    <>
      <div
        ref={joystickRef}
        className="absolute inset-y-0 left-0 w-1/2 z-40 touch-none"
      />
      <div
        ref={lookRef}
        className="absolute inset-y-0 right-0 w-1/2 z-40 touch-none"
      />
    </>
  )
}