type Props = {
  mode: 'mesh' | 'splat'
  splatAvailable: boolean
  splatLoading: boolean
  onToggle: () => void
}

export function AvatarToggle({ mode, splatAvailable, splatLoading, onToggle }: Props) {
  if (!splatAvailable) return null

  return (
    <button
      onClick={onToggle}
      disabled={splatLoading}
      className="fixed bottom-16 left-4 z-40 glass-panel px-3 py-1.5 rounded-full
        text-sm font-medium text-hall-accent-dark hover:opacity-90
        transition-opacity shadow-lg flex items-center gap-2
        disabled:opacity-60 disabled:cursor-wait"
    >
      {splatLoading ? (
        <>
          <span className="inline-block w-3.5 h-3.5 border-2 border-hall-accent border-t-transparent rounded-full animate-spin" />
          Loading…
        </>
      ) : (
        <>
          <span className="text-xs">
            {mode === 'mesh' ? '◆' : '◇'}
          </span>
          {mode === 'mesh' ? 'Splat View' : '3D Mesh'}
        </>
      )}
    </button>
  )
}
