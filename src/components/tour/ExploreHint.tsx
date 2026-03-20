type ExploreHintProps = {
  onExplore: () => void
  variant: 'subtle' | 'prominent'
  scrollProgress: number
  /** The scroll progress value at which this hint becomes visible */
  triggerAt: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

export function ExploreHint({ onExplore, variant, scrollProgress, triggerAt }: ExploreHintProps) {
  // Fade in over 0.02 scroll progress (about 1 viewport-height of scrolling)
  const opacity = clamp01((scrollProgress - triggerAt) / 0.02)

  if (opacity <= 0) return null

  if (variant === 'subtle') {
    return (
      <button
        onClick={onExplore}
        aria-label="Switch to free-roam 3D exploration mode"
        className="pointer-events-auto mt-4 text-hall-accent/80 hover:text-hall-accent
                   transition-colors text-sm font-['Space_Grotesk',sans-serif] flex items-center gap-1.5"
        style={{ opacity }}
      >
        <span className="text-base">↗</span>
        Explore the hall yourself
      </button>
    )
  }

  // prominent variant
  return (
    <button
      onClick={onExplore}
      aria-label="Switch to free-roam 3D exploration mode"
      className="pointer-events-auto mt-6 px-6 py-3 rounded-lg
                 border border-hall-accent/40 bg-hall-surface/60 backdrop-blur-sm
                 text-hall-accent hover:bg-hall-accent/10 hover:border-hall-accent/60
                 transition-all font-['Space_Grotesk',sans-serif] font-semibold text-base"
      style={{ opacity }}
    >
      ↗ Explore the hall in 3D
    </button>
  )
}
