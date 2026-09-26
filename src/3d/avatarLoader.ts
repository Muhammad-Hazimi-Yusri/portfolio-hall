import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { GaussianSplattingMesh } from '@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh'
import { hasWebGL2 } from '@/utils/detection'
import { AVATAR_CONFIG } from './avatarConfig'

// ── Types ──

export interface AvatarInstance {
  /** Show the configured portrait model, hide its optional scan. */
  showMesh: () => void
  /** Show gaussian splat, hide mesh. Lazy-loads on first call. */
  showSplat: () => Promise<void>
  /** Current display mode */
  getMode: () => 'mesh' | 'splat'
  /** Whether device supports splat (WebGL2 available) */
  isSplatAvailable: () => boolean
  /** Clean up everything */
  dispose: () => void
}

export type AvatarCallbacks = {
  onModeChange?: (mode: 'mesh' | 'splat') => void
  onSplatLoadStart?: () => void
  onSplatLoadEnd?: () => void
}

// ── Main Loader ──

export async function loadAvatar(
  scene: Scene,
  callbacks?: AvatarCallbacks,
): Promise<AvatarInstance | null> {
  const cfg = AVATAR_CONFIG
  if (!cfg.meshPath) return null

  // Parent node for positioning
  const root = new TransformNode('avatar-root', scene)
  root.position = new Vector3(cfg.position.x, cfg.position.y, cfg.position.z)
  root.rotation.y = cfg.rotation * Math.PI / 180

  let meshNode: TransformNode | null = null
  let splatMesh: GaussianSplattingMesh | null = null
  let splatLoaded = false
  let currentMode: 'mesh' | 'splat' = 'mesh'

  // ── Load low-poly mesh ──
  try {
    const lastSlash = cfg.meshPath.lastIndexOf('/')
    const rootUrl = cfg.meshPath.substring(0, lastSlash + 1)
    const filename = cfg.meshPath.substring(lastSlash + 1)

    const result = await SceneLoader.ImportMeshAsync('', rootUrl, filename, scene)
    if (result.meshes.length > 0) {
      meshNode = new TransformNode('avatar-mesh-root', scene)
      meshNode.parent = root
      meshNode.scaling = new Vector3(cfg.scale, cfg.scale, cfg.scale)
      result.meshes.forEach(m => {
        m.parent = meshNode
        m.checkCollisions = false
      })
    }
  } catch {
    console.warn('[Avatar] Configured portrait model could not load')
  }

  // A missing model leaves the entrance clear; never invent a stand-in person.
  if (!meshNode) {
    root.dispose()
    return null
  }

  const splatSupported = Boolean(cfg.splatPath) && hasWebGL2()

  return {
    showMesh: () => {
      if (meshNode) meshNode.setEnabled(true)
      if (splatMesh) splatMesh.setEnabled(false)
      currentMode = 'mesh'
      callbacks?.onModeChange?.('mesh')
    },

    showSplat: async () => {
      if (!splatSupported || !cfg.splatPath) return

      // Lazy-load splat on first toggle
      if (!splatLoaded) {
        callbacks?.onSplatLoadStart?.()
        try {
          // Dynamic import registers the SPLAT loader plugin
          await import('@babylonjs/loaders/SPLAT')
          const { GaussianSplattingMesh } = await import('@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh')

          splatMesh = new GaussianSplattingMesh('avatar-splat', undefined, scene)
          await splatMesh.loadFileAsync(cfg.splatPath)
          splatMesh.parent = root
          splatMesh.position = new Vector3(
            cfg.splatOffset.x, cfg.splatOffset.y, cfg.splatOffset.z,
          )
          splatMesh.scaling = new Vector3(
            cfg.splatScale, cfg.splatScale, cfg.splatScale,
          )
          splatLoaded = true
        } catch {
          console.warn('[Avatar] Splat load failed')
          splatMesh?.dispose()
          splatMesh = null
          splatLoaded = true // Don't retry
          callbacks?.onSplatLoadEnd?.()
          return
        }
        callbacks?.onSplatLoadEnd?.()
      }

      if (!splatMesh) return

      if (meshNode) meshNode.setEnabled(false)
      splatMesh.setEnabled(true)
      currentMode = 'splat'
      callbacks?.onModeChange?.('splat')
    },

    getMode: () => currentMode,

    isSplatAvailable: () => splatSupported,

    dispose: () => {
      meshNode?.dispose()
      splatMesh?.dispose()
      root.dispose()
    },
  }
}
