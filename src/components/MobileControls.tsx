import { useEffect, useRef, useState } from 'react'
import nipplejs from 'nipplejs'

type MobileControlsProps = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
  onLook: (deltaX: number, deltaY: number) => void
  onJump: () => void
  onInteract: () => void
  canInteract: boolean  // show A button as active when near POI
}

export function MobileControls({ onMove, onMoveEnd, onLook, onJump, onInteract, canInteract }: MobileControlsProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const lookRef = useRef<HTMLDivElement>(null)
  const touchId = useRef<number | null>(null)
  const lastTouch = useRef<{ x: number; y: number } | null>(null)
  const [portrait, setPortrait] = useState(window.innerHeight > window.innerWidth)

  useEffect(() => {
    const handleResize = () => {
      setPortrait(window.innerHeight > window.innerWidth)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Reset movement when interaction state changes
  useEffect(() => {
    onMoveEnd()
  }, [canInteract, onMoveEnd])

  // Joystick setup - only in landscape
  useEffect(() => {
    if (portrait) return  // Skip in portrait mode
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
      onMoveEnd()  // Reset movement on cleanup
    }
  }, [onMove, onMoveEnd, portrait])

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

  const DPad = () => {
    const handleDirection = (x: number, y: number) => {
      onMove(x, y)
    }

    const handleRelease = () => {
      onMoveEnd()
    }

    const btnClass = "w-12 h-12 bg-hall-surface/80 rounded-lg flex items-center justify-center text-2xl active:bg-hall-accent select-none"

    return (
      <div className="grid grid-cols-3 gap-1">
        <div />
        <button
          className={btnClass}
          onTouchStart={() => handleDirection(0, 1)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
        >
          ▲
        </button>
        <div />
        <button
          className={btnClass}
          onTouchStart={() => handleDirection(-1, 0)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
        >
          ◀
        </button>
        <div />
        <button
          className={btnClass}
          onTouchStart={() => handleDirection(1, 0)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
        >
          ▶
        </button>
        <div />
        <button
          className={btnClass}
          onTouchStart={() => handleDirection(0, -1)}
          onTouchEnd={handleRelease}
          onTouchCancel={handleRelease}
        >
          ▼
        </button>
        <div />
      </div>
    )
  }

  const ActionButtons = () => {
    const btnClass = "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold select-none"

    return (
      <div className="relative w-32 h-24">
        {/* A button - top right */}
        <button
          className={`${btnClass} bg-hall-surface/80 active:bg-hall-accent ${canInteract ? 'ring-2 ring-hall-accent' : ''} absolute top-0 right-0`}
          onClick={() => {
            if (canInteract) {
              onMoveEnd()
              onInteract()
            }
          }}
        >
          A
        </button>
        {/* B button - bottom left */}
        <button
          className={`${btnClass} bg-hall-surface/80 active:bg-hall-accent absolute bottom-0 left-0`}
          onTouchStart={onJump}
        >
          B
        </button>
      </div>
    )
  }

  if (portrait) {
    return (
      <div className="absolute inset-0 z-40 flex flex-col">
        {/* Top area - touch drag for camera */}
        <div
          ref={lookRef}
          className="flex-1 touch-none"
        />
        {/* Bottom controls - GameBoy style */}
        <div className="h-48 bg-hall-bg/50 flex items-center justify-between px-8 touch-none">
          <DPad />
          <ActionButtons />
        </div>
      </div>
    )
  }

  // Landscape mode (existing)
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