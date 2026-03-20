import type { Zone } from '@/types/poi'
import type { SceneMaterials } from './materials'

// ── Types ──

/**
 * Per-mesh material override properties.
 * Keys in materialOverrides map to mesh names inside the .glb.
 * Use '*' as a wildcard to apply to all meshes that lack a named entry.
 */
export type MaterialOverrideProps = {
  /** For remap mode: which SceneMaterials key to assign. Defaults to 'teak'. */
  sceneMat?: keyof SceneMaterials
  /** Hex '#rrggbb' — applied to diffuseColor on StandardMaterial (hybrid mode) */
  diffuseColor?: string
  /** Hex '#rrggbb' — applied to albedoColor on PBRMaterial (hybrid mode) */
  albedoColor?: string
  /** Hex '#rrggbb' — applied to emissiveColor on either material type (hybrid mode) */
  emissiveColor?: string
  /** 0–1, PBR only (hybrid mode) */
  metallic?: number
  /** 0–1, PBR only (hybrid mode) */
  roughness?: number
}

export type AssetEntry = {
  id: string
  glbPath: string
  fallbackType: 'box' | 'cylinder' | 'none'
  fallbackDimensions?: { width: number; height: number; depth: number }
  category: 'pillar' | 'doorway' | 'molding' | 'furniture' | 'decoration'
  /**
   * How to handle .glb materials after loading. Default: 'keep'.
   * - 'keep'   — use Blender materials exactly as exported
   * - 'remap'  — replace all materials with scene theme materials (teakMat, goldMat, etc.)
   * - 'hybrid' — preserve textures but adjust color/PBR properties via materialOverrides
   */
  materialMode?: 'keep' | 'remap' | 'hybrid'
  /**
   * Per-mesh overrides. Keys are mesh names within the GLB; '*' is a wildcard.
   * Used by 'remap' (sceneMat key) and 'hybrid' (color/PBR properties).
   */
  materialOverrides?: Record<string, MaterialOverrideProps>
  /**
   * Collision strategy for the loaded mesh. Default: 'none'.
   * - 'none'     — no collision (decorative assets)
   * - 'mesh'     — checkCollisions on the GLB meshes directly (expensive)
   * - 'box'      — invisible box proxy (recommended for most architectural assets)
   * - 'cylinder' — invisible cylinder proxy (good for pillars)
   */
  collision?: 'none' | 'mesh' | 'box' | 'cylinder'
  /** Dimensions for the 'box' or 'cylinder' collision proxy. */
  collisionSize?: { width: number; height: number; depth: number }
}

export type AssetPlacement = {
  assetId: string
  position: { x: number; y: number; z: number }
  rotation?: { x: number; y: number; z: number }
  scale?: { x: number; y: number; z: number }
  zone: Zone
  receiveShadows?: boolean
  castShadows?: boolean
  /**
   * Name of an existing procedural scene mesh to dispose when this GLB loads
   * successfully. Enables clean swap-out of zone-function geometry once real
   * Blender assets are ready.
   */
  proceduralFallbackName?: string
}

// ── Asset Library ──
// Catalogue of all architectural models. glbPath is relative to /public/.
// fallbackType 'none' means the existing procedural geometry in scene.ts
// serves as the visual fallback — no duplicate mesh is created.

export const assetLibrary: AssetEntry[] = [
  {
    id: 'pillar-ornate-01',
    glbPath: '/assets/models/pillar-ornate-01.glb',
    fallbackType: 'none',
    category: 'pillar',
  },
  {
    id: 'doorway-frame-01',
    glbPath: '/assets/models/doorway-frame-01.glb',
    fallbackType: 'none',
    category: 'doorway',
  },
  {
    id: 'crown-molding-segment',
    glbPath: '/assets/models/crown-molding-segment.glb',
    fallbackType: 'none',
    category: 'molding',
  },
  {
    id: 'throne-reception-01',
    glbPath: '/assets/models/throne-reception-01.glb',
    fallbackType: 'box',
    fallbackDimensions: { width: 1, height: 1.5, depth: 1 },
    category: 'furniture',
    materialMode: 'remap',
    materialOverrides: { '*': { sceneMat: 'teak' } },
    collision: 'box',
    collisionSize: { width: 1.2, height: 1.5, depth: 1.2 },
  },
  {
    // Temporary test asset — proves the GLB pipeline works.
    // Replace with pillar-ornate-01 once Blender export is ready.
    id: 'test-cube',
    glbPath: '/assets/models/test-cube.glb',
    fallbackType: 'box',
    fallbackDimensions: { width: 0.5, height: 3.5, depth: 0.5 },
    category: 'decoration',
  },
]

// ── Asset Placements ──
// Where each asset lives in the environment. Positions mirror the hardcoded
// values in scene.ts so that real GLBs can replace procedural geometry.
//
// Zone boundaries for reference:
//   ARRIVAL      cylinder, center (0,0), d=8
//   GALLERY      x[-5,5] z[8,58], wall at x=-5
//   OBSERVATORY  cylinder, center (0,68), d=14
//   HORIZON      x[-2,2] z[75,90]

export const assetPlacements: AssetPlacement[] = [
  // Boardwalk placements — to be populated when Blender assets are ready.
]
