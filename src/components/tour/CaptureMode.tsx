import { useEffect, useRef, useState, useCallback } from 'react'
import { createEngine, createScene } from '@/3d/engine'
import { createCastle } from '@/3d/scene'
import { createSceneMaterials } from '@/3d/materials'
import { createPOIMeshes } from '@/3d/pois'
import { createLights } from '@/3d/lights'
import { loadAssets } from '@/3d/assetLoader'
import type { LoadAssetsOptions } from '@/3d/assetLoader'
import { getCameraStateAtProgress } from '@/3d/tourPath'
import { CAPTURE_POINTS } from '@/3d/tourCaptures'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'

const CAPTURE_WIDTH = 1920
const CAPTURE_HEIGHT = 1080

interface CaptureResult {
  id: string
  dataUrl: string
}

/**
 * Dev-only capture UI. Spins up the full Babylon.js scene and captures
 * screenshots at each tour camera position for the 2D fallback layer.
 *
 * Access via ?capture=true
 */
export function CaptureMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null)
  const cameraRef = useRef<UniversalCamera | null>(null)
  const sceneRef = useRef<ReturnType<typeof createScene> | null>(null)

  const [sceneReady, setSceneReady] = useState(false)
  const [capturing, setCapturing] = useState(false)
  const [captureIndex, setCaptureIndex] = useState(-1)
  const [results, setResults] = useState<CaptureResult[]>([])

  // Set up the scene (same chain as TourCanvas)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = createEngine(canvas)
    const scene = createScene(engine)
    const mats = createSceneMaterials(scene)
    const castle = createCastle(scene, mats)
    const poiMeshes = createPOIMeshes(scene, poisData.pois as POI[])
    const lights = createLights(scene, castle, poiMeshes)

    const loadOpts: LoadAssetsOptions = {
      sunShadowGen: lights.sunShadowGen,
      indoorShadowGen: lights.indoorShadowGen,
      sceneMaterials: mats,
    }
    loadAssets(scene, loadOpts)

    // Camera — same setup as TourCanvas but static
    const initial = getCameraStateAtProgress(0)
    const camera = new UniversalCamera('captureCam', initial.position, scene)
    camera.setTarget(initial.target)
    camera.inputs.clear()
    camera.minZ = 0.1
    camera.maxZ = 100

    engineRef.current = engine
    cameraRef.current = camera
    sceneRef.current = scene

    // Start render loop so the scene is alive for captures
    engine.runRenderLoop(() => scene.render())

    // Wait for a few frames to render + settling delay for async asset loads.
    // Don't use scene.executeWhenReady — failed GLB loads can leave
    // pending data that prevents it from ever resolving.
    let frameCount = 0
    const readyObs = scene.onAfterRenderObservable.add(() => {
      frameCount++
      if (frameCount >= 10) {
        scene.onAfterRenderObservable.remove(readyObs)
        setTimeout(() => setSceneReady(true), 1500)
      }
    })

    return () => {
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    }
  }, [])

  const captureAll = useCallback(async () => {
    const engine = engineRef.current
    const camera = cameraRef.current
    const scene = sceneRef.current
    if (!engine || !camera || !scene) return

    setCapturing(true)
    setResults([])
    const captured: CaptureResult[] = []

    for (let i = 0; i < CAPTURE_POINTS.length; i++) {
      const point = CAPTURE_POINTS[i]
      setCaptureIndex(i)

      // Position camera
      const state = getCameraStateAtProgress(point.progress)
      camera.position.copyFrom(state.position)
      camera.setTarget(state.target)

      // Let the render loop run a few frames at the new position, then settle
      await new Promise(r => setTimeout(r, point.waitMs))

      // Force one more render so the canvas has the latest frame
      scene.render()

      // Read directly from the canvas (preserveDrawingBuffer is true)
      const dataUrl = canvasRef.current!.toDataURL('image/png')

      captured.push({ id: point.id, dataUrl })
      setResults([...captured])
    }

    setCaptureIndex(-1)
    setCapturing(false)
  }, [])

  const downloadOne = useCallback((result: CaptureResult) => {
    const a = document.createElement('a')
    a.href = result.dataUrl
    a.download = `tour-${result.id}.png`
    a.click()
  }, [])

  const downloadAll = useCallback(() => {
    // Sequential downloads with small delays so the browser doesn't block them
    results.forEach((result, i) => {
      setTimeout(() => downloadOne(result), i * 200)
    })
  }, [results, downloadOne])

  return (
    <div className="w-full h-full bg-hall-bg text-hall-text flex flex-col">
      {/* Control panel */}
      <div className="flex items-center gap-4 p-4 bg-hall-surface border-b border-hall-frame">
        <h1 className="text-lg font-bold text-hall-accent font-['Cinzel',serif]">
          Capture Mode
        </h1>

        <button
          onClick={captureAll}
          disabled={!sceneReady || capturing}
          className="px-4 py-2 bg-hall-accent text-hall-bg rounded font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hall-accent/90
                     transition-colors"
        >
          {!sceneReady
            ? 'Scene loading...'
            : capturing
              ? `Capturing ${captureIndex + 1}/${CAPTURE_POINTS.length}...`
              : 'Capture All'}
        </button>

        {results.length === CAPTURE_POINTS.length && (
          <button
            onClick={downloadAll}
            className="px-4 py-2 bg-hall-frame text-hall-text rounded font-semibold
                       hover:bg-hall-frame-light transition-colors"
          >
            Download All
          </button>
        )}

        <span className="text-hall-muted text-sm ml-auto">
          {CAPTURE_POINTS.length} capture points &middot; {CAPTURE_WIDTH}&times;{CAPTURE_HEIGHT}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas preview */}
        <div className="flex-1 flex items-center justify-center bg-black p-4">
          <canvas
            ref={canvasRef}
            width={CAPTURE_WIDTH}
            height={CAPTURE_HEIGHT}
            className="max-w-full max-h-full border border-hall-frame"
            style={{ aspectRatio: `${CAPTURE_WIDTH}/${CAPTURE_HEIGHT}` }}
          />
        </div>

        {/* Results panel */}
        {results.length > 0 && (
          <div className="w-80 overflow-y-auto border-l border-hall-frame bg-hall-surface p-3 space-y-3">
            <h2 className="text-sm font-semibold text-hall-muted uppercase tracking-wider">
              Captures ({results.length}/{CAPTURE_POINTS.length})
            </h2>
            {results.map(result => (
              <div key={result.id} className="space-y-1">
                <button
                  onClick={() => downloadOne(result)}
                  className="block w-full text-left group"
                >
                  <img
                    src={result.dataUrl}
                    alt={`tour-${result.id}`}
                    className="w-full rounded border border-hall-frame
                               group-hover:border-hall-accent transition-colors"
                  />
                  <span className="text-xs text-hall-muted group-hover:text-hall-accent transition-colors">
                    tour-{result.id}.png
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
