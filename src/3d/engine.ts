import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'

export function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: false,
    stencil: true,
  })

  const onResize = () => engine.resize()
  window.addEventListener('resize', onResize)
  engine.onDisposeObservable.addOnce(() => window.removeEventListener('resize', onResize))

  return engine
}

export function createScene(engine: Engine): Scene {
  const scene = new Scene(engine)
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('profile')) {
    void import('./performanceAudit').then(({ attachPerformanceAudit }) => {
      if (!scene.isDisposed) attachPerformanceAudit(scene, engine)
    })
  }
  return scene
}
