type LoadingScreenProps = {
  progress?: number
  stage?: string
}

const stageLabels: Record<string, string> = {
  engine: 'Starting engine...',
  scene: 'Building royal hall...',
  textures: 'Loading artwork...',
  ready: 'Welcome!',
}

export function LoadingScreen({ progress = 0, stage = 'engine' }: LoadingScreenProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-hall-bg">
      <div className="mb-6">
        <div className="w-12 h-12 border-4 border-hall-muted/30 border-t-hall-accent rounded-full animate-spin" />
      </div>

      <div className="w-64 mb-3">
        <div className="h-2 bg-hall-frame rounded-full overflow-hidden">
          <div
            className="h-full bg-hall-accent transition-all duration-300 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>

      <p className="text-hall-text text-sm font-semibold">
        {stageLabels[stage] || stage}
      </p>
      <p className="text-hall-muted text-xs mt-1">
        {Math.round(progress)}%
      </p>
      <p className="text-hall-muted/50 text-xs mt-4">
        First load may take a moment
      </p>
    </div>
  )
}
