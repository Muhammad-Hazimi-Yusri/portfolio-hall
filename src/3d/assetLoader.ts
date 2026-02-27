import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import type { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

// Side-effect: registers the GLB/GLTF loader plugin with SceneLoader
import '@babylonjs/loaders/glTF'

import { assetLibrary, assetPlacements } from './assetManifest'
import type { AssetEntry, AssetPlacement } from './assetManifest'

// ── Types ──

export type LoadAssetsOptions = {
  sunShadowGen?: ShadowGenerator
  indoorShadowGen?: ShadowGenerator
}

// ── Public API ──

/**
 * Load all manifest placements into the scene. Non-blocking — returns
 * immediately. Missing .glb files log a warning and fall back to
 * procedural geometry (or do nothing for fallbackType:'none').
 * Scene renders with existing geometry during loading.
 */
export function loadAssets(scene: Scene, options: LoadAssetsOptions = {}): void {
  for (const placement of assetPlacements) {
    void loadSingleAsset(scene, placement, options)
  }
}

// ── Private ──

async function loadSingleAsset(
  scene: Scene,
  placement: AssetPlacement,
  options: LoadAssetsOptions,
): Promise<void> {
  const entry = assetLibrary.find(e => e.id === placement.assetId)
  if (!entry) {
    console.warn(`[assetLoader] No library entry for assetId "${placement.assetId}"`)
    return
  }

  // Split full path into rootUrl + filename for SceneLoader
  const lastSlash = entry.glbPath.lastIndexOf('/')
  const rootUrl = entry.glbPath.substring(0, lastSlash + 1)
  const filename = entry.glbPath.substring(lastSlash + 1)

  try {
    const result = await SceneLoader.ImportMeshAsync('', rootUrl, filename, scene)
    const root = result.meshes[0]

    // Apply placement transform
    root.position = new Vector3(placement.position.x, placement.position.y, placement.position.z)
    if (placement.rotation) {
      root.rotation = new Vector3(placement.rotation.x, placement.rotation.y, placement.rotation.z)
    }
    if (placement.scale) {
      root.scaling = new Vector3(placement.scale.x, placement.scale.y, placement.scale.z)
    }

    // Shadow casters
    if (placement.castShadows) {
      options.sunShadowGen?.addShadowCaster(root, true)
      options.indoorShadowGen?.addShadowCaster(root, true)
    }

    // Shadow receivers
    if (placement.receiveShadows) {
      for (const mesh of result.meshes) {
        mesh.receiveShadows = true
      }
    }

    // Swap out procedural counterpart if one is named
    if (placement.proceduralFallbackName) {
      const old = scene.getMeshByName(placement.proceduralFallbackName)
      if (old) {
        old.getChildMeshes(false).forEach(child => child.dispose())
        old.dispose()
      }
    }

    console.log(`[assetLoader] Loaded ${entry.id} → zone:${placement.zone}`)
  } catch {
    // Expected during development — GLB files don't exist yet
    console.warn(`[assetLoader] Missing ${entry.glbPath} — fallback active`)
    createFallback(scene, entry, placement, options)
  }
}

function createFallback(
  scene: Scene,
  entry: AssetEntry,
  placement: AssetPlacement,
  options: LoadAssetsOptions,
): void {
  if (entry.fallbackType === 'none') {
    // Existing procedural geometry in scene.ts is the visual fallback — nothing to do
    return
  }

  const dims = entry.fallbackDimensions ?? { width: 0.5, height: 1.0, depth: 0.5 }
  const { width, height, depth } = dims

  const mat = new StandardMaterial(`fallback-mat-${entry.id}-${placement.position.x}-${placement.position.z}`, scene)
  mat.diffuseColor = new Color3(0.36, 0.25, 0.20) // teak

  const meshName = `fallback-${entry.id}-${placement.position.x}-${placement.position.z}`

  const mesh =
    entry.fallbackType === 'cylinder'
      ? MeshBuilder.CreateCylinder(meshName, { diameter: width, height, tessellation: 12 }, scene)
      : MeshBuilder.CreateBox(meshName, { width, height, depth }, scene)

  // Anchor to floor: origin at y=0, mesh centre at y=height/2
  mesh.position = new Vector3(
    placement.position.x,
    placement.position.y + height / 2,
    placement.position.z,
  )
  mesh.material = mat

  if (placement.castShadows) {
    options.sunShadowGen?.addShadowCaster(mesh, true)
    options.indoorShadowGen?.addShadowCaster(mesh, true)
  }
  if (placement.receiveShadows) {
    mesh.receiveShadows = true
  }
}
