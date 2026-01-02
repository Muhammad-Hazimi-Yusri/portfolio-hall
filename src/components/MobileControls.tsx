import { useEffect, useRef } from 'react'
import nipplejs from 'nipplejs'

type MobileControlsProps = {
  onMove: (x: number, y: number) => void  // -1 to 1 for each axis
  onMoveEnd: () => void
}

export function MobileControls({ onMove, onMoveEnd }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!joystickRef.current) return

    const manager = nipplejs.create({
      zone: joystickRef.current,
      mode: 'static',
      position: { left: '80px', bottom: '80px' },
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

  return (
    <div
      ref={joystickRef}
      className="absolute bottom-0 left-0 w-48 h-48 z-40"
    />
  )
}