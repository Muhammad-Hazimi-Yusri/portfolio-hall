import { useState, useCallback, lazy, Suspense } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ReturnToTourButton } from './ReturnToTourButton'
import type { POI } from '@/types/poi'

const BabylonScene = lazy(() =>
  import('@/3d/BabylonScene').then(m => ({ default: m.BabylonScene })),
)

type FreeRoamWrapperProps = {
  initialPosition?: { x: number; y: number; z: number }
  initialTarget?: { x: number; y: number; z: number }
  onReturnToTour: () => void
  onReady: () => void
}

export function FreeRoamWrapper({
  initialPosition,
  initialTarget,
  onReturnToTour,
  onReady,
}: FreeRoamWrapperProps) {
  const [inspecting, setInspecting] = useState<POI | null>(null)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoadProgress = useCallback(
    (progress: number, _stage: string) => {
      setLoadProgress(progress)
      if (progress >= 100) {
        setTimeout(() => {
          setIsLoaded(true)
          onReady()
        }, 400)
      }
    },
    [onReady],
  )

  const handleInspect = useCallback((poi: POI) => {
    setInspecting(poi)
    document.exitPointerLock()
  }, [])

  const closeModal = useCallback(() => {
    setInspecting(null)
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.focus()
      canvas.requestPointerLock()
    }
  }, [])

  return (
    <div className="w-full h-full relative">
      {!isLoaded && (
        <div
          className={`absolute inset-0 z-50 transition-opacity duration-300 ${
            loadProgress >= 100 ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <LoadingScreen progress={loadProgress} stage="engine" />
        </div>
      )}
      <Suspense fallback={<LoadingScreen />}>
        <BabylonScene
          onInspect={handleInspect}
          onLoadProgress={handleLoadProgress}
          initialCameraPosition={initialPosition}
          initialCameraTarget={initialTarget}
        />
      </Suspense>

      {inspecting && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-hall-surface rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">{inspecting.content.title}</h2>
            <p className="text-hall-muted text-sm capitalize mb-4">
              {inspecting.type} · {inspecting.section}
            </p>
            <p className="mb-4">{inspecting.content.description}</p>
            {inspecting.content.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {inspecting.content.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-hall-muted/20 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {inspecting.content.links && inspecting.content.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {inspecting.content.links.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-hall-accent text-white rounded text-sm hover:opacity-90"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <button onClick={closeModal} className="text-hall-accent underline">
              Close
            </button>
          </div>
        </div>
      )}

      <ReturnToTourButton onReturn={onReturnToTour} />
    </div>
  )
}
