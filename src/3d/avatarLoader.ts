import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import { GaussianSplattingMesh } from '@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh'
import { hasWebGL2 } from '@/utils/detection'
import { AVATAR_CONFIG } from './avatarConfig'
import type { SceneMaterials } from './materials'

// ── Types ──

export interface AvatarInstance {
  /** Show low-poly mesh (or procedural fallback), hide splat */
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

// ── Procedural Placeholder ──

function createProceduralAvatar(
  scene: Scene,
  mats: SceneMaterials,
): TransformNode {
  const root = new TransformNode('avatar-procedural', scene)

  // Torso — cylinder
  const torso = MeshBuilder.CreateCylinder('avatar-torso', {
    height: 1.2, diameterTop: 0.4, diameterBottom: 0.5, tessellation: 16,
  }, scene)
  torso.position.y = 0.9
  torso.material = mats.stone
  torso.parent = root

  // Head — sphere
  const head = MeshBuilder.CreateSphere('avatar-head', {
    diameter: 0.35, segments: 16,
  }, scene)
  head.position.y = 1.7
  head.material = mats.wall
  head.parent = root

  // Base — flat cylinder (feet)
  const base = MeshBuilder.CreateCylinder('avatar-base', {
    height: 0.05, diameter: 0.6, tessellation: 16,
  }, scene)
  base.position.y = 0.025
  base.material = mats.gold
  base.parent = root

  return root
}

// ── Main Loader ──

export async function loadAvatar(
  scene: Scene,
  mats: SceneMaterials,
  callbacks?: AvatarCallbacks,
): Promise<AvatarInstance | null> {
  const cfg = AVATAR_CONFIG

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
    console.warn('[Avatar] GLB load failed, using procedural placeholder')
    meshNode = createProceduralAvatar(scene, mats)
    meshNode.parent = root
  }

  // If mesh didn't load and procedural failed somehow, bail out
  if (!meshNode) {
    root.dispose()
    return null
  }

  const splatSupported = hasWebGL2()

  return {
    showMesh: () => {
      if (meshNode) meshNode.setEnabled(true)
      if (splatMesh) splatMesh.setEnabled(false)
      currentMode = 'mesh'
      callbacks?.onModeChange?.('mesh')
    },

    showSplat: async () => {
      if (!splatSupported) return

      // Lazy-load splat on first toggle
      if (!splatLoaded) {
        callbacks?.onSplatLoadStart?.()
        try {
          // Dynamic import registers the SPLAT loader plugin
          await import('@babylonjs/loaders/SPLAT')

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
