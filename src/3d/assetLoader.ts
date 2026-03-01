import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'

// Side-effect: registers the GLB/GLTF loader plugin with SceneLoader
import '@babylonjs/loaders/glTF'

import { assetLibrary, assetPlacements } from './assetManifest'
import type { AssetEntry, AssetPlacement, MaterialOverrideProps } from './assetManifest'
import type { SceneMaterials } from './materials'

// ── Types ──

export type LoadAssetsOptions = {
  sunShadowGen?: ShadowGenerator
  indoorShadowGen?: ShadowGenerator
  /** Pass shared SceneMaterials for materialMode: 'remap' and 'hybrid' support. */
  sceneMaterials?: SceneMaterials
}

export type AssetLoadStat = {
  status: 'pending' | 'loaded' | 'fallback' | 'error'
  /** Accumulated triangle count across all placements of this assetId. */
  triangleCount: number
  /** Count of unique material uniqueIds across all loaded meshes for this assetId. */
  materialCount: number
  /** Load duration in ms for the last resolved placement; 0 while pending. */
  loadTimeMs: number
}

// ── Module-level state ──

/**
 * Per-asset load statistics. Populated during loadSingleAsset.
 * Exported so assetDebug.tsx can poll it without prop drilling.
 * Keyed by AssetEntry.id. Multiple placements of the same asset accumulate here.
 */
export const assetLoadStats: Map<string, AssetLoadStat> = new Map()

/**
 * Root meshes tracked per assetId (private — all callers go through
 * reloadAllAssets or toggleAssetFallback).
 * Multiple placements of the same asset push to the same array.
 */
const managedRoots: Map<string, AbstractMesh[]> = new Map()

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

/**
 * Dispose all meshes previously loaded by loadAssets, clear stats,
 * and re-run the full load cycle. Use this after dropping new .glb
 * files into /public/assets/models/ during development.
 *
 * dispose(false, false): recurse into children but do NOT dispose
 * materials — shared SceneMaterials instances must survive across reloads.
 */
export function reloadAllAssets(scene: Scene, options: LoadAssetsOptions = {}): void {
  for (const [, roots] of managedRoots) {
    for (const root of roots) {
      if (!root.isDisposed()) {
        root.dispose(false, false)
      }
    }
  }
  managedRoots.clear()
  assetLoadStats.clear()
  loadAssets(scene, options)
}

/**
 * Toggle a single asset between its loaded GLB and its procedural fallback.
 * Used by the dev overlay A/B comparison button.
 *
 * If status is 'loaded'  → dispose GLB meshes and create fallback geometry.
 * If status is 'fallback' → dispose fallbacks and re-trigger GLB load.
 * If status is 'pending' or unknown → no-op.
 */
export function toggleAssetFallback(
  scene: Scene,
  assetId: string,
  options: LoadAssetsOptions = {},
): void {
  const stat = assetLoadStats.get(assetId)
  if (!stat || stat.status === 'pending') return

  const entry = assetLibrary.find(e => e.id === assetId)
  if (!entry) return

  // Dispose all currently tracked meshes for this asset
  const roots = managedRoots.get(assetId) ?? []
  for (const root of roots) {
    if (!root.isDisposed()) root.dispose(false, false)
  }
  managedRoots.set(assetId, [])
  assetLoadStats.set(assetId, { status: 'pending', triangleCount: 0, materialCount: 0, loadTimeMs: 0 })

  const placements = assetPlacements.filter(p => p.assetId === assetId)

  if (stat.status === 'loaded') {
    // Switch to fallback — synchronous
    for (const placement of placements) {
      const mesh = createFallback(scene, entry, placement, options)
      if (mesh) {
        const r = managedRoots.get(assetId) ?? []
        r.push(mesh)
        managedRoots.set(assetId, r)
      }
    }
    assetLoadStats.set(assetId, { status: 'fallback', triangleCount: 0, materialCount: 0, loadTimeMs: 0 })
  } else {
    // Switch to GLB — async; stats update as placements resolve
    for (const placement of placements) {
      void loadSingleAsset(scene, placement, options)
    }
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

  // Initialise stats entry to 'pending' on first encounter for this assetId
  if (!assetLoadStats.has(entry.id)) {
    assetLoadStats.set(entry.id, { status: 'pending', triangleCount: 0, materialCount: 0, loadTimeMs: 0 })
  }

  const startTime = performance.now()

  // Split full path into rootUrl + filename for SceneLoader
  const lastSlash = entry.glbPath.lastIndexOf('/')
  const rootUrl = entry.glbPath.substring(0, lastSlash + 1)
  const filename = entry.glbPath.substring(lastSlash + 1)

  try {
    const result = await SceneLoader.ImportMeshAsync('', rootUrl, filename, scene)
    const root = result.meshes[0]
    const loadTimeMs = performance.now() - startTime

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

    // Material processing (keep / remap / hybrid)
    applyMaterialMode(result.meshes, entry, options.sceneMaterials)

    // Collision proxy setup
    setupCollision(scene, root, entry)

    // Track root mesh for later disposal
    const roots = managedRoots.get(entry.id) ?? []
    roots.push(root)
    managedRoots.set(entry.id, roots)

    // Accumulate stats — multiple placements of the same asset add triangles/materials
    const triCount = result.meshes.reduce(
      (sum, m) => sum + (m instanceof Mesh ? m.getTotalIndices() / 3 : 0),
      0,
    )
    const matIds = new Set(
      result.meshes.filter(m => m.material != null).map(m => m.material!.uniqueId),
    )
    const prev = assetLoadStats.get(entry.id)!
    assetLoadStats.set(entry.id, {
      status: 'loaded',
      triangleCount: prev.triangleCount + triCount,
      materialCount: prev.materialCount + matIds.size,
      loadTimeMs,
    })

    console.log(`[assetLoader] Loaded ${entry.id} → zone:${placement.zone}`)
  } catch {
    // Expected during development — GLB files don't exist yet
    const loadTimeMs = performance.now() - startTime
    console.warn(`[assetLoader] Missing ${entry.glbPath} — fallback active`)
    const fallbackMesh = createFallback(scene, entry, placement, options)

    if (fallbackMesh) {
      const roots = managedRoots.get(entry.id) ?? []
      roots.push(fallbackMesh)
      managedRoots.set(entry.id, roots)
    }

    // Only downgrade to 'fallback' if a previous placement hasn't already succeeded
    const prev = assetLoadStats.get(entry.id)
    if (!prev || prev.status !== 'loaded') {
      assetLoadStats.set(entry.id, {
        status: 'fallback',
        triangleCount: prev?.triangleCount ?? 0,
        materialCount: prev?.materialCount ?? 0,
        loadTimeMs,
      })
    }
  }
}

// ── Material Processing ──

/**
 * Convert a hex colour string to Color3.
 * Guards against missing '#' prefix and incorrect length since
 * Color3.FromHexString silently returns black on malformed input.
 */
function hexToColor3(hex: string): Color3 {
  const normalized = hex.startsWith('#') ? hex : `#${hex}`
  if (normalized.length !== 7) {
    console.warn(`[assetLoader] Invalid hex colour "${hex}" — using black`)
    return new Color3(0, 0, 0)
  }
  return Color3.FromHexString(normalized)
}

/**
 * Apply materialMode strategy to all loaded meshes.
 * - 'keep'   (default): no-op — trust the Blender export
 * - 'remap'  : replace materials with shared SceneMaterials instances
 * - 'hybrid' : adjust colour/PBR properties while preserving textures
 */
function applyMaterialMode(
  meshes: AbstractMesh[],
  entry: AssetEntry,
  sceneMaterials: SceneMaterials | undefined,
): void {
  const mode = entry.materialMode ?? 'keep'
  if (mode === 'keep') return

  const overrides = entry.materialOverrides ?? {}

  for (const mesh of meshes) {
    // GLB root node is typically a transform with no material — skip
    if (!mesh.material) continue

    const override: MaterialOverrideProps | undefined =
      overrides[mesh.name] ?? overrides['*']

    if (mode === 'remap') {
      if (!sceneMaterials) {
        console.warn('[assetLoader] remap mode requires sceneMaterials in LoadAssetsOptions')
        continue
      }
      const key = override?.sceneMat ?? 'teak'
      mesh.material = sceneMaterials[key] ?? sceneMaterials.teak
    }

    if (mode === 'hybrid' && override) {
      if (mesh.material instanceof PBRMaterial) {
        if (override.albedoColor)              mesh.material.albedoColor   = hexToColor3(override.albedoColor)
        if (override.emissiveColor)            mesh.material.emissiveColor = hexToColor3(override.emissiveColor)
        if (override.metallic   !== undefined) mesh.material.metallic      = override.metallic
        if (override.roughness  !== undefined) mesh.material.roughness     = override.roughness
      } else if (mesh.material instanceof StandardMaterial) {
        if (override.diffuseColor)  mesh.material.diffuseColor  = hexToColor3(override.diffuseColor)
        if (override.emissiveColor) mesh.material.emissiveColor = hexToColor3(override.emissiveColor)
      }
    }
  }
}

// ── Collision Setup ──

/**
 * Set up collision for a loaded GLB asset based on AssetEntry.collision.
 * - 'none'     (default): skip
 * - 'mesh'     : enable checkCollisions directly on GLB meshes
 * - 'box'      : create invisible box proxy parented to root
 * - 'cylinder' : create invisible cylinder proxy parented to root
 *
 * Proxy meshes are not added to shadow generators.
 */
function setupCollision(
  scene: Scene,
  rootMesh: AbstractMesh,
  entry: AssetEntry,
): void {
  const collisionType = entry.collision ?? 'none'
  if (collisionType === 'none') return

  if (collisionType === 'mesh') {
    rootMesh.checkCollisions = true
    rootMesh.getChildMeshes(false).forEach(child => {
      child.checkCollisions = true
    })
    return
  }

  // 'box' or 'cylinder': invisible proxy parented to the root
  const size = entry.collisionSize ?? { width: 0.5, height: 2.0, depth: 0.5 }
  const proxyName = `col-${entry.id}-${rootMesh.position.x}-${rootMesh.position.z}`

  const proxy =
    collisionType === 'cylinder'
      ? MeshBuilder.CreateCylinder(proxyName, {
          diameter: size.width,
          height: size.height,
          tessellation: 8,
        }, scene)
      : MeshBuilder.CreateBox(proxyName, {
          width: size.width,
          height: size.height,
          depth: size.depth,
        }, scene)

  proxy.isVisible = false
  proxy.isPickable = false
  proxy.checkCollisions = true

  // Parent to root so proxy follows if root is repositioned.
  // After setParent, position becomes relative to parent — offset by half height
  // so the proxy bottom aligns with y=0 (floor level).
  proxy.setParent(rootMesh)
  proxy.position.set(0, size.height / 2, 0)
}

// ── Fallback Geometry ──

function createFallback(
  scene: Scene,
  entry: AssetEntry,
  placement: AssetPlacement,
  options: LoadAssetsOptions,
): AbstractMesh | null {
  if (entry.fallbackType === 'none') {
    // Existing procedural geometry in scene.ts is the visual fallback — nothing to do
    return null
  }

  const dims = entry.fallbackDimensions ?? { width: 0.5, height: 1.0, depth: 0.5 }
  const { width, height, depth } = dims

  // Prefer the shared teak material to avoid creating duplicate material instances
  const mat: StandardMaterial = options.sceneMaterials?.teak ?? (() => {
    const m = new StandardMaterial(`fallback-mat-${entry.id}-${placement.position.x}-${placement.position.z}`, scene)
    m.diffuseColor = new Color3(0.36, 0.25, 0.20) // teak
    return m
  })()

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

  return mesh
}
