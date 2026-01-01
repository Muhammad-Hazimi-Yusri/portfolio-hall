import { useState } from 'react'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'

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
  return (
    <div className="text-center p-8 max-w-md">
      <h1 className="text-4xl font-bold mb-2 text-hall-text">
        🏰 Balairung
      </h1>
      <p className="text-hall-muted mb-8">
        An immersive portfolio experience
      </p>
      
      <div className="space-y-4">
        <button
          onClick={() => onSelectMode('fallback')}
          className="w-full py-4 px-6 bg-hall-accent text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Enter Simple Mode
        </button>
        
        <button
          onClick={() => onSelectMode('3d')}
          disabled={!canUse3D || isChecking}
          className="w-full py-4 px-6 bg-hall-surface text-hall-text rounded-lg border border-hall-muted/30 hover:border-hall-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      <p className="text-hall-muted text-sm mt-8">
        v0.2.0 — Welcome Gate
      </p>
    </div>
  )
}

function FallbackMode({ onSwitchMode }: { onSwitchMode: () => void }) {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">Fallback Mode</h2>
      <p className="text-hall-muted mb-4">2D floor plan coming soon...</p>
      <button
        onClick={onSwitchMode}
        className="text-hall-accent underline"
      >
        Switch to 3D Mode
      </button>
    </div>
  )
}

function ThreeDMode({ onSwitchMode }: { onSwitchMode: () => void }) {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">3D Mode</h2>
      <p className="text-hall-muted mb-4">Babylon.js scene coming soon...</p>
      <button
        onClick={onSwitchMode}
        className="text-hall-accent underline"
      >
        Switch to Simple Mode
      </button>
    </div>
  )
}

export default App
