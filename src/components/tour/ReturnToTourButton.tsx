import { useState, useEffect } from 'react'

type ReturnToTourButtonProps = {
  onReturn: () => void
}

export function ReturnToTourButton({ onReturn }: ReturnToTourButtonProps) {
  const [visible, setVisible] = useState(false)

  // Slide in after 2s delay
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <button
      onClick={onReturn}
      className={`fixed top-4 left-4 z-50 px-4 py-2 rounded-lg
                  border border-hall-accent/40 bg-hall-surface/80 backdrop-blur-sm
                  text-hall-accent hover:bg-hall-accent/10
                  transition-all duration-500 font-['Space_Grotesk',sans-serif] text-sm font-semibold
                  ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
    >
      ← Return to tour
    </button>
  )
}
