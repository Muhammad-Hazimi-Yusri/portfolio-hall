import { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import type { Observer } from '@babylonjs/core/Misc/observable'
import type { Camera } from '@babylonjs/core/Cameras/camera'
import { applyFallbackTexture, renderCaptionToTexture } from './pois'

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
  captionMesh?: Mesh
  captions?: string[]
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
    captionMesh,
    captions,
  } = config

  const mat = canvasMesh.material as StandardMaterial
  if (!mat) return { dispose: () => {} }

  // Caption material is optional — only present when the painting opted into
  // a caption strip and at least one caption is non-empty. We drive its alpha
  // in lockstep with the canvas fade below; the texture itself is rebuilt
  // (not crossfaded) at the swap moment when alpha hits 0.
  const captionMat = captionMesh?.material as StandardMaterial | undefined
  const captionTex = captionMat?.diffuseTexture as DynamicTexture | undefined
  const hasCaptions = !!(captionMesh && captionMat && captionTex && captions && captions.some(Boolean))

  let disposed = false
  let delayTimer: ReturnType<typeof setTimeout> | null = null
  let observer: Observer<Scene> | null = null
  const loadedTextures: Texture[] = []

  // State
  let currentIndex = 0
  let phase: Phase = 'showing'
  let elapsed = 0
  const halfFade = crossfadeDurationMs / 2

  function captionForIndex(i: number): string {
    if (!hasCaptions || !captions) return ''
    return captions[i] ?? ''
  }

  function startCycle() {
    if (disposed || loadedTextures.length < 2) return

    // Set initial texture
    mat.diffuseTexture = loadedTextures[0]
    mat.alpha = 1
    if (hasCaptions && captionMat && captionTex) {
      renderCaptionToTexture(captionTex, captionForIndex(0))
      captionMat.alpha = captionForIndex(0) ? 1 : 0
    }

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
        if (hasCaptions && captionMat) captionMat.alpha = (1 - t) * (captionForIndex(currentIndex) ? 1 : 0)
        if (t >= 1) {
          // Swap texture + caption text at the moment the canvas is fully
          // faded out — re-rendering the caption now means the fade-in
          // reveals the new caption in lockstep with the new image.
          currentIndex = (currentIndex + 1) % loadedTextures.length
          mat.diffuseTexture = loadedTextures[currentIndex]
          if (hasCaptions && captionMat && captionTex) {
            renderCaptionToTexture(captionTex, captionForIndex(currentIndex))
          }
          phase = 'fading-in'
          elapsed = 0
        }
      } else if (phase === 'fading-in') {
        const t = Math.min(elapsed / halfFade, 1)
        mat.alpha = t
        if (hasCaptions && captionMat) captionMat.alpha = t * (captionForIndex(currentIndex) ? 1 : 0)
        if (t >= 1) {
          mat.alpha = 1
          if (hasCaptions && captionMat) captionMat.alpha = captionForIndex(currentIndex) ? 1 : 0
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
    const tex = new Texture(path, scene, false, true)
    tex.uScale = -1
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
      if (hasCaptions && captionMat && captionTex) {
        renderCaptionToTexture(captionTex, captionForIndex(0))
        captionMat.alpha = captionForIndex(0) ? 1 : 0
      }
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
