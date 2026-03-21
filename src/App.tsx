import { useState, useCallback, useEffect, useRef } from 'react'
import { ScrollController } from '@/components/tour/ScrollController'
import { TourNavBar } from '@/components/tour/TourNavBar'
import { TourContent } from '@/components/tour/TourContent'
import { TourCanvas } from '@/components/tour/TourCanvas'
import { TourFallback } from '@/components/tour/TourFallback'
import { CaptureMode } from '@/components/tour/CaptureMode'
import { TransitionOverlay } from '@/components/tour/TransitionOverlay'
import { FreeRoamWrapper } from '@/components/tour/FreeRoamWrapper'
import { getCameraStateAtProgress } from '@/3d/tourPath'
import { hasWebGL } from '@/utils/detection'

const params = new URLSearchParams(window.location.search)
const isCapture = params.get('capture') === 'true'
const force2d = params.get('force2d') === 'true'

const webGLSupported = hasWebGL()

type AppView = 'tour' | 'explore'
const initialHash = window.location.hash.replace('#', '')

const TRANSITION_MS = 500

function App() {
  if (isCapture) {
    return <CaptureMode />
  }

  return <TourApp />
}

function TourApp() {
  const [appView, setAppView] = useState<AppView>(
    initialHash === 'explore' ? 'explore' : 'tour',
  )
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [exploreOrigin, setExploreOrigin] = useState<{
    position: { x: number; y: number; z: number }
    target: { x: number; y: number; z: number }
    scrollProgress: number
  } | null>(null)
  const transitioningRef = useRef(false)

  // Sync hash with appView
  useEffect(() => {
    if (appView === 'explore') {
      window.location.hash = '#explore'
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [appView])

  // Tour → Explore transition
  const handleExplore = useCallback((scrollProgress: number) => {
    if (transitioningRef.current) return
    transitioningRef.current = true

    const { position, target } = getCameraStateAtProgress(scrollProgress)
    setExploreOrigin({
      position: { x: position.x, y: position.y, z: position.z },
      target: { x: target.x, y: target.y, z: target.z },
      scrollProgress,
    })
    setOverlayVisible(true)
    setTimeout(() => setAppView('explore'), TRANSITION_MS)
  }, [])

  // Called by FreeRoamWrapper when BabylonScene signals ready
  const handleExploreReady = useCallback(() => {
    setOverlayVisible(false)
    transitioningRef.current = false
  }, [])

  // Explore → Tour transition
  const handleReturnToTour = useCallback(() => {
    if (transitioningRef.current) return
    transitioningRef.current = true

    setOverlayVisible(true)
    setTimeout(() => {
      setAppView('tour')
      setTimeout(() => {
        setOverlayVisible(false)
        transitioningRef.current = false
      }, 100)
    }, TRANSITION_MS)
  }, [])

  return (
    <>
      {appView === 'tour' && (
        <ScrollController initialScrollProgress={exploreOrigin?.scrollProgress}>
          {webGLSupported && !force2d ? <TourCanvas /> : <TourFallback />}
          <TourNavBar />
          <TourContent onExplore={handleExplore} />
        </ScrollController>
      )}
      {appView === 'explore' && (
        <FreeRoamWrapper
          initialPosition={exploreOrigin?.position ?? { x: 0, y: 1.6, z: 2 }}
          initialTarget={exploreOrigin?.target ?? { x: 0, y: 1.6, z: 15 }}
          onReturnToTour={handleReturnToTour}
          onReady={handleExploreReady}
        />
      )}
      <TransitionOverlay visible={overlayVisible} />
    </>
  )
}

export default App
