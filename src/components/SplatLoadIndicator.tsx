type Props = {
  loadingTitle: string | null
}

export function SplatLoadIndicator({ loadingTitle }: Props) {
  if (!loadingTitle) return null

  return (
    <div
      className="fixed top-14 left-1/2 -translate-x-1/2 z-40 glass-panel
        px-4 py-2 rounded-full text-sm font-medium text-hall-accent-dark
        shadow-lg flex items-center gap-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      <span className="inline-block w-3.5 h-3.5 border-2 border-hall-accent border-t-transparent rounded-full animate-spin" />
      Loading 3D scan: <span className="font-semibold">{loadingTitle}</span>
    </div>
  )
}
