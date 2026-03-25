import { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { applyFallbackTexture } from './pois'

export interface SlideshowConfig {
  poiId: string
  canvasMesh: Mesh
  images: string[]
  scene: Scene
  intervalMs?: number
  crossfadeDurationMs?: number
  delayMs?: number
  camera?: Camera
  pauseDistance?: number
}

export interface SlideshowInstance {
  dispose: () => void
}

const DEFAULT_INTERVAL = 4000
const DEFAULT_CROSSFADE = 800
const DEFAULT_PAUSE_DISTANCE = 30

type Phase = 'showing' | 'fading-out' | 'fading-in'

export function createSlideshow(config: SlideshowConfig): SlideshowInstance {
  const {
    poiId,
    canvasMesh,
    images,
    scene,
    intervalMs = DEFAULT_INTERVAL,
    crossfadeDurationMs = DEFAULT_CROSSFADE,
    delayMs = 0,
    camera,
    pauseDistance = DEFAULT_PAUSE_DISTANCE,
  } = config

  const mat = canvasMesh.material as StandardMaterial
  if (!mat) return { dispose: () => {} }

  let disposed = false
  let delayTimer: ReturnType<typeof setTimeout> | null = null
  let observer: Observer<Scene> | null = null
  const loadedTextures: Texture[] = []

  // State
  let currentIndex = 0
  let phase: Phase = 'showing'
  let elapsed = 0
  const halfFade = crossfadeDurationMs / 2

  function startCycle() {
    if (disposed || loadedTextures.length < 2) return

    // Set initial texture
    mat.diffuseTexture = loadedTextures[0]
    mat.alpha = 1

    observer = scene.onBeforeRenderObservable.add(() => {
      if (disposed) return

      // Distance-based pausing
      if (camera) {
        const meshPos = canvasMesh.parent
          ? (canvasMesh.parent as Mesh).absolutePosition
          : canvasMesh.absolutePosition
        const dist = camera.position.subtract(meshPos).length()
        if (dist > pauseDistance) return
      }

      const dt = scene.getEngine().getDeltaTime()
      elapsed += dt

      if (phase === 'showing') {
        if (elapsed >= intervalMs) {
          phase = 'fading-out'
          elapsed = 0
        }
      } else if (phase === 'fading-out') {
        const t = Math.min(elapsed / halfFade, 1)
        mat.alpha = 1 - t
        if (t >= 1) {
          // Swap texture
          currentIndex = (currentIndex + 1) % loadedTextures.length
          mat.diffuseTexture = loadedTextures[currentIndex]
          phase = 'fading-in'
          elapsed = 0
        }
      } else if (phase === 'fading-in') {
        const t = Math.min(elapsed / halfFade, 1)
        mat.alpha = t
        if (t >= 1) {
          mat.alpha = 1
          phase = 'showing'
          elapsed = 0
        }
      }
    })
  }

  // Preload all textures
  let loadedCount = 0
  const totalCount = images.length

  images.forEach((path) => {
    const tex = new Texture(path, scene, false, false)
    tex.onLoadObservable.addOnce(() => {
      if (disposed) { tex.dispose(); return }
      loadedTextures.push(tex)
      loadedCount++
      if (loadedCount === totalCount) onAllSettled()
    })
    // Handle load failure
    tex.onLoadObservable.addOnce(() => {}) // ensure observable exists
    setTimeout(() => {
      if (disposed) return
      if (!tex.isReady()) {
        loadedCount++
        tex.dispose()
        if (loadedCount === totalCount) onAllSettled()
      }
    }, 8000)
  })

  function onAllSettled() {
    if (disposed) return

    if (loadedTextures.length === 0) {
      // All failed — apply fallback title card
      applyFallbackTexture(mat, poiId, scene)
      return
    }

    if (loadedTextures.length === 1) {
      // Single image — static display
      mat.diffuseTexture = loadedTextures[0]
      mat.alpha = 1
      return
    }

    // 2+ textures — start slideshow with optional delay
    if (delayMs > 0) {
      delayTimer = setTimeout(() => {
        if (!disposed) startCycle()
      }, delayMs)
    } else {
      startCycle()
    }
  }

  return {
    dispose() {
      disposed = true
      if (delayTimer !== null) clearTimeout(delayTimer)
      if (observer) scene.onBeforeRenderObservable.remove(observer)
      loadedTextures.forEach(tex => tex.dispose())
      loadedTextures.length = 0
    },
  }
}
