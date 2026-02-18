import { useState, useCallback, lazy, Suspense, useEffect } from 'react'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { usePOIs } from '@/hooks/usePOIs'
import { FloorPlan } from '@/components/FloorPlan'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ModeToggle } from '@/components/ModeToggle'
import type { POI } from '@/types/poi'

const BabylonScene = lazy(() => import('@/3d/BabylonScene').then(m => ({ default: m.BabylonScene })))

type AppMode = 'welcome' | '3d' | 'fallback'

function App() {
  const [mode, setMode] = useState<AppMode>('welcome')
  const { canUse3D, warnings, isChecking } = useDeviceCapability()

  return (
    <div className="w-full h-full flex items-center justify-center">
      {mode === 'welcome' && (
        <WelcomeScreen 
          onSelectMode={setMode}
          canUse3D={canUse3D}
          warnings={warnings}
          isChecking={isChecking}
        />
      )}
      {mode === 'fallback' && (
        <FallbackMode onSwitchMode={() => setMode('3d')} />
      )}
      {mode === '3d' && (
        <ThreeDMode onSwitchMode={() => setMode('fallback')} />
      )}
    </div>
  )
}

// Placeholder components - will be moved to separate files

type WelcomeScreenProps = {
  onSelectMode: (mode: AppMode) => void
  canUse3D: boolean
  warnings: string[]
  isChecking: boolean
}

function WelcomeScreen({ onSelectMode, canUse3D, warnings, isChecking }: WelcomeScreenProps) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  return (
    <div className="text-center p-8 max-w-md md:max-w-lg">
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-hall-text">
        🏰 Balairung
      </h1>
      <p className="text-hall-muted mb-8 md:text-lg">
        An immersive portfolio experience
      </p>

      <div className="space-y-4">
        <button
          onClick={() => onSelectMode('fallback')}
          className="w-full py-4 md:py-5 px-6 bg-hall-accent text-white rounded-lg font-semibold md:text-lg hover:opacity-90 transition-opacity"
        >
          Enter Simple Mode
        </button>

        <button
          onClick={() => onSelectMode('3d')}
          disabled={!canUse3D || isChecking}
          className="w-full py-4 md:py-5 px-6 bg-hall-surface text-hall-text rounded-lg border border-hall-muted/30 hover:border-hall-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="block font-semibold">
            {isChecking ? 'Checking device...' : 'Try Interactive 3D'}
          </span>
          {!canUse3D && !isChecking && (
            <span className="block text-sm text-red-400 mt-1">
              ❌ WebGL not supported
            </span>
          )}
          {canUse3D && warnings.length > 0 && (
            <span className="block text-sm text-yellow-400 mt-1">
              ⚠️ {warnings[0]}
            </span>
          )}
        </button>
      </div>

      <div className="text-hall-muted text-xs md:text-sm mt-6 max-w-xs md:max-w-sm space-y-2 text-center mx-auto">
        <p className="text-hall-text text-sm md:text-base font-semibold">🎮 Controls</p>
        <p><strong>Desktop:</strong> WASD + mouse, sprint, jump</p>
        <p><strong>Mobile landscape:</strong> Virtual joystick + touch-drag camera</p>
        <p><strong>Mobile portrait:</strong> Game Boy-style D-pads control buttons</p>
        {isMobileDevice && isIOS && (
          <p className="text-yellow-400 mt-2">
            📱 iOS: Add to Home Screen for best landscape experience
          </p>
        )}
        {isMobileDevice && !isIOS && (
          <p className="text-yellow-400 mt-2">
            📱 Use fullscreen in landscape for immersive experience
          </p>
        )}
      </div>

      <p className="text-hall-muted text-sm mt-8">
        v1.2.1 — Navigation & UX
      </p>
    </div>
  )
}

function FallbackMode({ onSwitchMode }: { onSwitchMode: () => void }) {
  const { pois, isLoading } = usePOIs()
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [inspectingId, setInspectingId] = useState<string | null>(null)
  const inspectedPOI = pois.find((p) => p.id === inspectingId) ?? null
  
  if (isLoading) {
    return <div className="text-hall-muted">Loading...</div>
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative">
      {/* Mode toggle - fixed position matching 3D mode */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle currentMode="fallback" onToggle={onSwitchMode} />
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-hall-surface border-b md:border-b-0 md:border-r border-hall-muted/20 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Balairung</h2>
        <nav className="flex-1 flex flex-row md:flex-col gap-2 md:gap-0 md:space-y-4 overflow-x-auto md:overflow-visible">
          {(['projects', 'about', 'skills', 'contact'] as const).map((section) => {
            const count = pois.filter((p) => p.section === section).length
            return (
              <button
                key={section}
                onClick={() => setSelectedSection(selectedSection === section ? null : section)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedSection === section
                    ? 'bg-hall-accent text-white'
                    : 'hover:bg-hall-muted/10'
                }`}
              >
                <span className="capitalize">{section}</span>
                <span className="text-hall-muted text-sm ml-2">({count})</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 overflow-auto flex flex-col">
      {/* Floor plan */}
      <div className="flex-1 flex items-center justify-center">
        <FloorPlan
          pois={pois}
          selectedSection={selectedSection}
          onSelectPOI={setInspectingId}
        />
      </div>
      
      {/* POI list below */}
      <div className="space-y-2 mt-4">
        {pois
          .filter((p) => !selectedSection || p.section === selectedSection)
          .map((poi) => (
            <div
              key={poi.id}
              onClick={() => setInspectingId(poi.id)}
              className="p-3 bg-hall-surface rounded border border-hall-muted/20 cursor-pointer hover:border-hall-accent transition-colors"
            >
              <h3 className="font-semibold">{poi.content.title}</h3>
              <p className="text-sm text-hall-muted capitalize">{poi.type} · {poi.section}</p>
            </div>
          ))}
      </div>
    </main>
      {inspectedPOI && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setInspectingId(null)}
        >
          <div
            className="bg-hall-surface rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">{inspectedPOI.content.title}</h2>
            <p className="text-hall-muted text-sm capitalize mb-4">
              {inspectedPOI.type} · {inspectedPOI.section}
            </p>
            <p className="mb-4">{inspectedPOI.content.description}</p>
            
            {inspectedPOI.content.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {inspectedPOI.content.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-hall-muted/20 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {inspectedPOI.content.links && inspectedPOI.content.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {inspectedPOI.content.links.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-hall-accent text-white rounded text-sm hover:opacity-90">
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setInspectingId(null)}
              className="text-hall-accent underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ThreeDMode({ onSwitchMode }: { onSwitchMode: () => void }) {
  const [inspectedPOI, setInspectedPOI] = useState<POI | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement)
  const [showFullscreenHint, setShowFullscreenHint] = useState(false)
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth)
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
              (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  const [iosLandscapeDismissed, setIosLandscapeDismissed] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Show hint when entering landscape on mobile
  useEffect(() => {
    if (isMobileDevice && !isPortrait && !isFullscreen) {
      setShowFullscreenHint(true)
      const timer = setTimeout(() => setShowFullscreenHint(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isMobileDevice, isPortrait, isFullscreen])

  const requestFullscreen = () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    } else if ((elem as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen) {
      (elem as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen()
    }
  }

  const handleInspect = useCallback((poi: POI) => {
    setInspectedPOI(poi)
    document.exitPointerLock()
  }, [])

  const closeModal = () => {
    setInspectedPOI(null)
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.focus()
      canvas.requestPointerLock()
    }
  }

  return (
    <div className="w-full h-full relative">
      <Suspense fallback={<LoadingScreen />}>
        <BabylonScene onInspect={handleInspect} onSwitchMode={onSwitchMode} />
      </Suspense>
      <div className="absolute top-4 right-4 z-50 hidden md:block">
        <button
          onClick={onSwitchMode}
          className="px-4 py-2 bg-hall-accent text-white rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
        >
          Exit 3D
        </button>
      </div>

      {isMobileDevice && !isIOS && !isPortrait && !isFullscreen && (
      <button
        onClick={requestFullscreen}
        className="absolute top-4 right-4 flex items-center gap-2 z-50"
      >
        <span 
          className={`bg-hall-surface/90 px-3 py-1 rounded text-sm transition-all duration-300 ${
            showFullscreenHint ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
          }`}
        >
          Tap for fullscreen
        </span>
        <span className="bg-hall-surface/90 p-2 rounded">
          ⛶
        </span>
      </button>
    )}

    {isMobileDevice && isIOS && !isPortrait && !isPWA && !iosLandscapeDismissed && (
      <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-2xl mb-4">📱</p>
        <h2 className="text-xl font-bold mb-2">Add to Home Screen</h2>
        <p className="text-hall-muted mb-6 max-w-xs">
          For the best landscape experience on iOS, add this site to your home screen.
        </p>
        <ol className="text-left text-sm text-hall-muted space-y-2 mb-6">
          <li>1. Tap the <span className="text-hall-text">Share</span> button (⬆️)</li>
          <li>2. Scroll down, tap <span className="text-hall-text">Add to Home Screen</span></li>
          <li>3. Open from your home screen</li>
        </ol>
        <button
          onClick={() => setIosLandscapeDismissed(true)}
          className="text-hall-accent underline text-sm"
        >
          Continue anyway
        </button>
      </div>
    )}

      {inspectedPOI && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-hall-surface rounded-lg max-w-lg w-full p-6 max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">{inspectedPOI.content.title}</h2>
            <p className="text-hall-muted text-sm capitalize mb-4">
              {inspectedPOI.type} · {inspectedPOI.section}
            </p>
            <p className="mb-4">{inspectedPOI.content.description}</p>

            {inspectedPOI.content.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {inspectedPOI.content.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-hall-muted/20 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {inspectedPOI.content.links && inspectedPOI.content.links.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4">
                {inspectedPOI.content.links.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-hall-accent text-white rounded text-sm hover:opacity-90">
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            <button
              onClick={closeModal}
              className="text-hall-accent underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
