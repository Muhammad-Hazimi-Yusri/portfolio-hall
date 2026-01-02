import { Engine, Scene } from '@babylonjs/core'

export function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
  })

  window.addEventListener('resize', () => engine.resize())

  return engine
}

export function createScene(engine: Engine): Scene {
  const scene = new Scene(engine)
  return scene
}