import { useEffect, useRef } from 'react'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { PointerEventTypes } from '@babylonjs/core/Events/pointerEvents'
import { createEngine, createScene } from '@/3d/engine'
import { createEnvironment } from '@/3d/scene'
import { createSceneMaterials } from '@/3d/materials'
import { createPOIMeshes } from '@/3d/pois'
import { createLights } from '@/3d/lights'
import { pois } from '@/data/pois'

function viewpoint(view: string) {
  const exhibit = pois.find(poi => poi.content.links?.some(link => link.url === `#project/${view}`))
  if (exhibit) return { position: new Vector3(-0.8, 2, exhibit.position.z - 2.8), target: new Vector3(-4.5, 1.6, exhibit.position.z) }
  switch (view) {
    case 'work': return { position: new Vector3(1, 2.2, 7), target: new Vector3(-4.5, 1.5, 14) }
    case 'projects': return { position: new Vector3(1, 2.4, 20), target: new Vector3(-4.5, 1.6, 30) }
    case 'about': return { position: new Vector3(7, 4, 60), target: new Vector3(0, 1, 68) }
    case 'contact': return { position: new Vector3(3, 2.5, 76), target: new Vector3(0, 1, 85) }
    default: return { position: new Vector3(10, 6, -8), target: new Vector3(-1, 1, 20) }
  }
}

export default function HallScene({ view, onReady, onUnavailable }: { view: string; onReady: () => void; onUnavailable: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewRef = useRef(view)
  useEffect(() => { viewRef.current = view }, [view])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let engine: ReturnType<typeof createEngine> | undefined
    let dispose = () => undefined as void
    try {
      engine = createEngine(canvas)
      const activeEngine = engine
      activeEngine.setHardwareScalingLevel(Math.max(1, window.devicePixelRatio / 1.5))
      const scene = createScene(activeEngine)
      const environment = createEnvironment(scene, createSceneMaterials(scene))
      const { meshMap } = createPOIMeshes(scene, pois)
      createLights(scene, environment, meshMap)
      for (const { mesh, poi } of meshMap.values()) {
        const route = poi.content.links?.find(link => link.url.startsWith('#'))?.url
          ?? (poi.section === 'experience' ? '#about' : poi.section === 'contact' ? '#contact' : undefined)
        if (!route) continue
        for (const child of mesh.getChildMeshes()) child.metadata = { portfolioRoute: route }
      }
      scene.pointerMovePredicate = mesh => Boolean(mesh.metadata?.portfolioRoute)
      scene.pointerDownPredicate = scene.pointerMovePredicate
      scene.pointerUpPredicate = scene.pointerMovePredicate
      scene.onPointerObservable.add(event => {
        const route = event.pickInfo?.pickedMesh?.metadata?.portfolioRoute
        if (event.type === PointerEventTypes.POINTERMOVE) canvas.style.cursor = route ? 'pointer' : 'default'
        if (event.type === PointerEventTypes.POINTERPICK && route) window.location.hash = route
      })
      const initial = viewpoint(viewRef.current)
      const camera = new UniversalCamera('browse-camera', initial.position, scene)
      camera.inputs.clear()
      camera.minZ = 0.1
      camera.maxZ = 250
      let target = initial.target
      camera.setTarget(target)
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let firstFrame = true
      let lastFrame = 0
      const render = () => {
        if (document.hidden || performance.now() - lastFrame < 32) return
        lastFrame = performance.now()
        const destination = viewpoint(viewRef.current)
        const amount = reduceMotion.matches ? 1 : 1 - Math.exp(-Math.min(activeEngine.getDeltaTime(), 60) / 130)
        camera.position = Vector3.Lerp(camera.position, destination.position, amount)
        target = Vector3.Lerp(target, destination.target, amount)
        camera.setTarget(target)
        scene.render()
        if (firstFrame) { firstFrame = false; onReady() }
      }
      const resize = new ResizeObserver(() => activeEngine.resize())
      resize.observe(canvas)
      canvas.addEventListener('webglcontextlost', onUnavailable)
      activeEngine.runRenderLoop(render)
      dispose = () => {
        resize.disconnect()
        canvas.removeEventListener('webglcontextlost', onUnavailable)
        activeEngine.stopRenderLoop(render)
        scene.dispose()
      }
    } catch {
      onUnavailable()
    }
    return () => { dispose(); engine?.dispose() }
  }, [onReady, onUnavailable])

  return <canvas ref={canvasRef} className="hall-canvas" aria-hidden="true" />
}
