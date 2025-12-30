import { useState } from 'react'

type AppMode = 'welcome' | '3d' | 'fallback'

function App() {
  const [mode, setMode] = useState<AppMode>('welcome')

  return (
    <div className="w-full h-full flex items-center justify-center">
      {mode === 'welcome' && (
        <WelcomeScreen onSelectMode={setMode} />
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

function WelcomeScreen({ onSelectMode }: { onSelectMode: (mode: AppMode) => void }) {
  return (
    <div className="text-center p-8 max-w-md">
      <h1 className="text-4xl font-bold mb-2 text-hall-text">
        🏰 [PROJECT_NAME]
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
          className="w-full py-4 px-6 bg-hall-surface text-hall-text rounded-lg border border-hall-muted/30 hover:border-hall-accent transition-colors"
        >
          <span className="block font-semibold">Try Interactive 3D</span>
          <span className="block text-sm text-hall-muted mt-1">
            ⚠️ Requires WebGL • Best on desktop
          </span>
        </button>
      </div>

      <p className="text-hall-muted text-sm mt-8">
        v0.1.0 — Scaffold
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
