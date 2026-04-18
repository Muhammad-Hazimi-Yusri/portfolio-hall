import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { GaussianSplattingMesh } from '@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh'
import { hasWebGL2 } from '@/utils/detection'
import { applyFallbackTexture } from './pois'
import type { POI } from '@/types/poi'

export type SplatMode = 'thumbnail' | 'loading' | 'splat' | 'failed'

export interface ProjectSplatInstance {
  readonly poiId: string
  readonly title: string
  getMode: () => SplatMode
  checkProximity: (cameraPos: Vector3) => void
  dispose: () => void
}

export type ProjectSplatCallbacks = {
  onLoadStart?: (title: string) => void
  onLoadEnd?: (success: boolean) => void
}

const LOAD_TRIGGER_DISTANCE = 6
const PLACEHOLDER_Y = 1.3
const DEFAULT_SPLAT_OFFSET = { x: 0, y: 1.0, z: 0 }
const DEFAULT_SPLAT_SCALE = 0.5

function createPlaceholderPlane(
  scene: Scene,
  poi: POI,
  parent: Mesh,
): Mesh {
  const plane = MeshBuilder.CreatePlane(
    `${poi.id}-placeholder`,
    { width: 0.8, height: 0.6, sideOrientation: Mesh.DOUBLESIDE },
    scene,
  )
  plane.position = new Vector3(0, PLACEHOLDER_Y, 0)
  plane.parent = parent

  const mat = new StandardMaterial(`${poi.id}-placeholder-mat`, scene)
  mat.specularColor = new Color3(0.05, 0.05, 0.05)
  mat.emissiveColor = new Color3(0.04, 0.04, 0.04)

  const thumbPath = poi.content.thumbnail
  if (thumbPath) {
    const tex = new Texture(thumbPath, scene, false, true)
    tex.uScale = -1
    mat.diffuseTexture = tex
    setTimeout(() => {
      if (!tex.isReady()) {
        applyFallbackTexture(mat, poi.content.title, scene)
      }
    }, 5000)
  } else {
    applyFallbackTexture(mat, poi.content.title, scene)
  }
  plane.material = mat
  return plane
}

export function loadProjectSplat(
  scene: Scene,
  poi: POI,
  pedestalGroup: Mesh,
  callbacks?: ProjectSplatCallbacks,
): ProjectSplatInstance {
  const splatPath = poi.custom?.splatPath
  const splatOffset = poi.custom?.splatOffset ?? DEFAULT_SPLAT_OFFSET
  const splatScale = poi.custom?.splatScale ?? DEFAULT_SPLAT_SCALE

  const placeholder = createPlaceholderPlane(scene, poi, pedestalGroup)

  let mode: SplatMode = 'thumbnail'
  let splatMesh: GaussianSplattingMesh | null = null
  let loadStarted = false
  let disposed = false

  const splatSupported = hasWebGL2() && !!splatPath

  async function triggerLoad() {
    if (disposed || loadStarted || !splatSupported || !splatPath) return
    loadStarted = true
    mode = 'loading'
    callbacks?.onLoadStart?.(poi.content.title)

    try {
      await import('@babylonjs/loaders/SPLAT')
      if (disposed) return

      const mesh = new GaussianSplattingMesh(`${poi.id}-splat`, undefined, scene)
      await mesh.loadFileAsync(splatPath)
      if (disposed) {
        mesh.dispose()
        return
      }

      mesh.parent = pedestalGroup
      mesh.position = new Vector3(splatOffset.x, splatOffset.y, splatOffset.z)
      mesh.scaling = new Vector3(splatScale, splatScale, splatScale)

      splatMesh = mesh
      placeholder.setEnabled(false)
      mode = 'splat'
      callbacks?.onLoadEnd?.(true)
    } catch {
      console.warn(`[ProjectSplat] Failed to load splat for ${poi.id}`)
      mode = 'failed'
      callbacks?.onLoadEnd?.(false)
    }
  }

  return {
    poiId: poi.id,
    title: poi.content.title,

    getMode: () => mode,

    checkProximity: (cameraPos: Vector3) => {
      if (disposed || loadStarted || !splatSupported) return
      const dx = cameraPos.x - pedestalGroup.absolutePosition.x
      const dz = cameraPos.z - pedestalGroup.absolutePosition.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < LOAD_TRIGGER_DISTANCE) {
        void triggerLoad()
      }
    },

    dispose: () => {
      disposed = true
      placeholder.material?.dispose()
      placeholder.dispose()
      splatMesh?.dispose()
      splatMesh = null
    },
  }
}
