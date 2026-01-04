import { useEffect, useRef, useState } from 'react'
import nipplejs from 'nipplejs'

type MobileControlsProps = {
  onMove: (x: number, y: number) => void
  onMoveEnd: () => void
  onLook: (deltaX: number, deltaY: number) => void
  onJump: () => void
  onInteract: () => void
  canInteract: boolean
  gyroEnabled: boolean
  onGyroToggle: () => void
  sprintEnabled: boolean
  onSprintToggle: () => void
}

export function MobileControls({ 
  onMove, 
  onMoveEnd, 
  onLook, 
  onJump, 
  onInteract, 
  canInteract,
  gyroEnabled,
  onGyroToggle,
  sprintEnabled,
  onSprintToggle
}: MobileControlsProps) {
  const CONTROL_PANEL_HEIGHT = 0.30

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
    if (portrait) return
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
      onMoveEnd()
    }
  }, [onMove, onMoveEnd, portrait])

  // Look touch setup
  useEffect(() => {
    const lookZone = lookRef.current
    if (!lookZone) return

    const onTouchStart = (e: TouchEvent) => {
      if (touchId.current !== null) return
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
  }, [onLook, portrait])

  const DPad = () => {
    const dpadRef = useRef<HTMLDivElement>(null)
    const [activeDir, setActiveDir] = useState({ x: 0, y: 0 })

    const calculateDirection = (touchX: number, touchY: number) => {
      if (!dpadRef.current) return { x: 0, y: 0 }
      
      const rect = dpadRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const dx = touchX - centerX
      const dy = touchY - centerY
      
      const threshold = 15
      let x = 0, y = 0
      
      if (Math.abs(dx) > threshold) x = dx > 0 ? 1 : -1
      if (Math.abs(dy) > threshold) y = dy > 0 ? -1 : 1
      
      return { x, y }
    }

    useEffect(() => {
      const updateFromTouches = (touches: TouchList) => {
        if (!dpadRef.current) return
        const rect = dpadRef.current.getBoundingClientRect()
        
        let totalX = 0, totalY = 0
        
        for (let i = 0; i < touches.length; i++) {
          const t = touches[i]
          // Only process touches within dpad bounds
          if (t.clientX >= rect.left && t.clientX <= rect.right &&
              t.clientY >= rect.top && t.clientY <= rect.bottom) {
            const dir = calculateDirection(t.clientX, t.clientY)
            totalX += dir.x
            totalY += dir.y
          }
        }
        
        // Clamp
        totalX = Math.max(-1, Math.min(1, totalX))
        totalY = Math.max(-1, Math.min(1, totalY))
        
        setActiveDir({ x: totalX, y: totalY })
        
        if (totalX !== 0 || totalY !== 0) {
          onMove(totalX, totalY)
        } else {
          onMoveEnd()
        }
      }

      const dpad = dpadRef.current
      if (!dpad) return

      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault()
        updateFromTouches(e.touches)
      }
      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        updateFromTouches(e.touches)
      }
      const onTouchEnd = (e: TouchEvent) => {
        e.preventDefault()
        if (e.touches.length === 0) {
          setActiveDir({ x: 0, y: 0 })
          onMoveEnd()
        } else {
          updateFromTouches(e.touches)
        }
      }

      dpad.addEventListener('touchstart', onTouchStart, { passive: false })
      dpad.addEventListener('touchmove', onTouchMove, { passive: false })
      dpad.addEventListener('touchend', onTouchEnd, { passive: false })
      dpad.addEventListener('touchcancel', onTouchEnd, { passive: false })

      return () => {
        dpad.removeEventListener('touchstart', onTouchStart)
        dpad.removeEventListener('touchmove', onTouchMove)
        dpad.removeEventListener('touchend', onTouchEnd)
        dpad.removeEventListener('touchcancel', onTouchEnd)
      }
    })

    const btnBase = "w-12 h-12 bg-[#2C2C2C] rounded-lg flex items-center justify-center text-2xl text-gray-300 select-none shadow-md transition-colors"
    const activeClass = "bg-[#1a1a1a] text-white"

    return (
      <div ref={dpadRef} className="grid grid-cols-3 gap-1 touch-none">
        <div />
        <div className={`${btnBase} ${activeDir.y > 0 ? activeClass : ''}`}>▲</div>
        <div />
        <div className={`${btnBase} ${activeDir.x < 0 ? activeClass : ''}`}>◀</div>
        <div />
        <div className={`${btnBase} ${activeDir.x > 0 ? activeClass : ''}`}>▶</div>
        <div />
        <div className={`${btnBase} ${activeDir.y < 0 ? activeClass : ''}`}>▼</div>
        <div />
      </div>
    )
  }

  const ToggleButtons = () => {
    const Toggle = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
      <button
        onClick={onToggle}
        className="flex flex-col items-center -rotate-[25deg]"
      >
        <div className={`w-12 h-6 rounded-full relative transition-colors shadow-inner ${active ? 'bg-hall-accent' : 'bg-gray-500'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-gray-200 shadow transition-transform ${active ? 'translate-x-7' : 'translate-x-1'}`} />
        </div>
        <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-wide font-medium"
          style={{ textShadow: '1px 1px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(0,0,0,0.2)' }}
        >
          {label}
        </span>
      </button>
    )

    return (
      <div className="flex gap-6">
        <Toggle label="Gyro" active={gyroEnabled} onToggle={onGyroToggle} />
        <Toggle label="Run" active={sprintEnabled} onToggle={onSprintToggle} />
      </div>
    )
  }

  const ActionButtons = () => {
    const btnClass = "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold select-none shadow-md"

    return (
      <div className="relative w-32 h-20">
        {/* A button - top right */}
        <button
          className={`${btnClass} bg-[#9B2257] text-white active:bg-[#7a1a45] ${canInteract ? 'ring-2 ring-white' : ''} absolute -top-4 right-0`}
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
          className={`${btnClass} bg-[#9B2257] text-white active:bg-[#7a1a45] absolute bottom-0 left-0`}
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
          className="touch-none"
          style={{ height: `${(1 - CONTROL_PANEL_HEIGHT) * 100}%` }}
        />
        {/* Bottom controls - GameBoy style */}
        <div 
          className="bg-[#8B8B8B] flex flex-col justify-center touch-none rounded-t-3xl"
          style={{ height: `${CONTROL_PANEL_HEIGHT * 100}%` }}
        >
          {/* Top row: D-pad + A/B buttons */}
          <div className="flex items-center justify-center gap-8">
            <DPad />
            <ActionButtons />
          </div>
          {/* Bottom row: Toggles */}
          <div className="flex justify-center mt-2">
            <ToggleButtons />
          </div>
        </div>
      </div>
    )
  }

  // Landscape mode
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
      {/* Landscape toggles */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-50">
        <button
          onClick={onGyroToggle}
          className={`px-3 py-2 rounded text-sm font-medium ${gyroEnabled ? 'bg-hall-accent text-white' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Gyro
        </button>
        <button
          onClick={onSprintToggle}
          className={`px-3 py-2 rounded text-sm font-medium ${sprintEnabled ? 'bg-hall-accent text-white' : 'bg-hall-surface/80 text-hall-text'}`}
        >
          Run
        </button>
      </div>
    </>
  )
}