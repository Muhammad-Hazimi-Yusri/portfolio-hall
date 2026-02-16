type ModeToggleProps = {
  currentMode: '3d' | 'fallback'
  onToggle: () => void
}

export function ModeToggle({ currentMode, onToggle }: ModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="px-3 py-1 bg-hall-surface/80 text-hall-accent rounded text-sm hover:bg-hall-surface transition-colors"
    >
      {currentMode === '3d' ? 'Switch to 2D' : 'Switch to 3D'}
    </button>
  )
}
