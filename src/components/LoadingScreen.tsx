export function LoadingScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-hall-bg">
      <div className="mb-4">
        <div className="w-12 h-12 border-4 border-hall-muted/30 border-t-hall-accent rounded-full animate-spin" />
      </div>
      <p className="text-hall-muted">Loading 3D experience...</p>
      <p className="text-hall-muted/50 text-sm mt-2">First load may take a moment</p>
    </div>
  )
}