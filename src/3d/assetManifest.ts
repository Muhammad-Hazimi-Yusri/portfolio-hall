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
// Where each asset lives in the castle. Positions mirror the hardcoded values
// in scene.ts so that real GLBs can replace procedural geometry incrementally.
//
// Zone boundaries for reference:
//   RECEPTION  x[-5,5]  z[8,18]   h=5
//   MAIN_HALL  x[-8,8]  z[-22,-8] h=4
//   COURTYARD  x[-8,8]  z[-8,8]
//   GARDEN     x[-20,-8] z[-6,6]  h=5

export const assetPlacements: AssetPlacement[] = [

  // ── Reception pillars (6) ─────────────────────────────────────────────────
  // Two rows at z=10 (front) and z=15 (back), x columns at -4, 0, 4
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x: -4, y: 0, z: 10 } },
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x:  0, y: 0, z: 10 } },
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x:  4, y: 0, z: 10 } },
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x: -4, y: 0, z: 15 } },
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x:  0, y: 0, z: 15 } },
  { assetId: 'pillar-ornate-01', zone: 'reception', castShadows: true, position: { x:  4, y: 0, z: 15 } },

  // ── Main Hall corner pillars (4) ──────────────────────────────────────────
  // MAIN_HALL.z1=-22 → z1+1=-21 (north row); MAIN_HALL.z2=-8 → z2-1=-9 (south row)
  { assetId: 'pillar-ornate-01', zone: 'main-hall', castShadows: true, position: { x: -7, y: 0, z: -21 } },
  { assetId: 'pillar-ornate-01', zone: 'main-hall', castShadows: true, position: { x:  7, y: 0, z: -21 } },
  { assetId: 'pillar-ornate-01', zone: 'main-hall', castShadows: true, position: { x: -7, y: 0, z:  -9 } },
  { assetId: 'pillar-ornate-01', zone: 'main-hall', castShadows: true, position: { x:  7, y: 0, z:  -9 } },

  // ── Garden pillars (2) ────────────────────────────────────────────────────
  // GARDEN.x1=-20 → x1+1=-19; z[-6,6] → z1+1=-5, z2-1=5
  { assetId: 'pillar-ornate-01', zone: 'garden', castShadows: true, position: { x: -19, y: 0, z: -5 } },
  { assetId: 'pillar-ornate-01', zone: 'garden', castShadows: true, position: { x: -19, y: 0, z:  5 } },

  // ── Doorway frames ────────────────────────────────────────────────────────
  // Positions are at zone boundaries; actual mesh framing is in scene.ts (createDoorwayFrame)
  { assetId: 'doorway-frame-01', zone: 'reception', position: { x:  0, y: 0, z: 18 } },
  { assetId: 'doorway-frame-01', zone: 'courtyard', position: { x:  0, y: 0, z: -8 } },
  { assetId: 'doorway-frame-01', zone: 'courtyard', position: { x: -8, y: 0, z:  0 } },

  // ── Main Hall crown molding (3 segments) ──────────────────────────────────
  // MAIN_HALL h=4 → crownY=3.925; WALL_THICKNESS=0.3 → offset=0.075+0.075=0.15
  { assetId: 'crown-molding-segment', zone: 'main-hall', position: { x:  0,     y: 3.925, z: -21.85 } },
  { assetId: 'crown-molding-segment', zone: 'main-hall', position: { x:  7.85,  y: 3.925, z: -15    } },
  { assetId: 'crown-molding-segment', zone: 'main-hall', position: { x: -7.85,  y: 3.925, z: -15    } },

  // ── Test placement ────────────────────────────────────────────────────────
  // Loads test-cube.glb at the north-west reception pillar to prove the pipeline.
  // proceduralFallbackName causes the existing procedural pillar to be disposed
  // when the GLB loads successfully — a clean swap instead of an overlay.
  // Remove once pillar-ornate-01.glb is ready.
  {
    assetId: 'test-cube',
    zone: 'reception',
    position: { x: -4, y: 0, z: 10 },
    castShadows: true,
    receiveShadows: true,
    proceduralFallbackName: 'rec-pillar--4-front',
  },
]
