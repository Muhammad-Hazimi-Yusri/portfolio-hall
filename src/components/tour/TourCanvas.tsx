import { useEffect, useRef, useState } from 'react'
import { createEngine, createScene } from '@/3d/engine'
import { createEnvironment } from '@/3d/scene'
import { createSceneMaterials } from '@/3d/materials'
import { createPOIMeshes } from '@/3d/pois'
import { createSlideshow } from '@/3d/paintingSlideshow'
import type { SlideshowInstance } from '@/3d/paintingSlideshow'
import { createLights } from '@/3d/lights'
import { loadAssets } from '@/3d/assetLoader'
import type { LoadAssetsOptions } from '@/3d/assetLoader'
import { loadAvatar } from '@/3d/avatarLoader'
import type { AvatarInstance } from '@/3d/avatarLoader'
import { getCameraStateAtProgress } from '@/3d/tourPath'
import { useScrollProgress } from '@/contexts/ScrollContext'
import { isMobile } from '@/utils/detection'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'

export function TourCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { scrollProgress } = useScrollProgress()
  const progressRef = useRef(0)
  const [isReady, setIsReady] = useState(false)

  // Keep ref in sync with context so the render loop reads fresh values
  useEffect(() => {
    progressRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = createEngine(canvas)
    engine.setHardwareScalingLevel(isMobile() ? 2 : 1)

    const scene = createScene(engine)
    const mats = createSceneMaterials(scene)
    const castle = createEnvironment(scene, mats)
    const { meshMap: poiMeshes, slideshowTargets } = createPOIMeshes(scene, poisData.pois as POI[])
    const lights = createLights(scene, castle, poiMeshes)

    const loadOpts: LoadAssetsOptions = {
      sunShadowGen: lights.sunShadowGen,
      indoorShadowGen: lights.indoorShadowGen,
      sceneMaterials: mats,
    }
    loadAssets(scene, loadOpts)

    // Load avatar on arrival platform (mesh-only, no splat toggle in tour)
    let avatarInstance: AvatarInstance | null = null
    loadAvatar(scene, mats).then(instance => {
      avatarInstance = instance
    })

    // Create painting slideshows (all active in tour mode — no distance pausing)
    const slideshows: SlideshowInstance[] = slideshowTargets.map((target, i) =>
      createSlideshow({
        poiId: target.poi.id,
        canvasMesh: target.mesh,
        images: target.images,
        scene,
        delayMs: i * 400,
      })
    )

    // On-rail camera — no user input
    const initial = getCameraStateAtProgress(0)
    const camera = new UniversalCamera('tourCam', initial.position, scene)
    camera.setTarget(initial.target)
    camera.inputs.clear()
    camera.minZ = 0.1
    camera.maxZ = 100

    // Update camera from scroll progress every frame
    scene.onBeforeRenderObservable.add(() => {
      const state = getCameraStateAtProgress(progressRef.current)
      camera.position.copyFrom(state.position)
      camera.setTarget(state.target)
    })

    // Fade in after the first frame renders
    let firstFrame = true
    engine.runRenderLoop(() => {
      scene.render()
      if (firstFrame) {
        firstFrame = false
        setIsReady(true)
      }
    })

    // Handle resize independently of the engine.ts listener
    const onResize = () => engine.resize()
    window.addEventListener('resize', onResize)

    return () => {
      slideshows.forEach(s => s.dispose())
      avatarInstance?.dispose()
      window.removeEventListener('resize', onResize)
      engine.stopRenderLoop()
      scene.dispose()
      engine.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full z-0 transition-opacity duration-500 ${
        isReady ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
