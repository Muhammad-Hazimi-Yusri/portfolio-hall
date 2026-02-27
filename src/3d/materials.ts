import { Scene } from '@babylonjs/core/scene'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'

// ── Individual Factories ──

export function createTeakMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('teakMat', scene)
  mat.diffuseColor = new Color3(0.36, 0.25, 0.20)
  mat.specularColor = new Color3(0.1, 0.08, 0.06)
  return mat
}

export function createGoldMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('goldMat', scene)
  mat.diffuseColor = new Color3(0.79, 0.66, 0.30)
  mat.specularColor = new Color3(0.4, 0.35, 0.15)
  mat.specularPower = 64
  mat.emissiveColor = new Color3(0.04, 0.03, 0.01)
  return mat
}

export function createWallMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('wallMat', scene)
  mat.diffuseColor = new Color3(0.24, 0.17, 0.12)
  mat.specularColor = new Color3(0.06, 0.04, 0.03)
  mat.specularPower = 16
  return mat
}

export function createFloorMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('floorMat', scene)
  mat.diffuseColor = new Color3(0.16, 0.12, 0.09)
  mat.specularColor = new Color3(0.08, 0.06, 0.04)
  mat.specularPower = 32

  const bump = new DynamicTexture('floorBump', { width: 512, height: 512 }, scene)
  const ctx = bump.getContext()
  ctx.fillStyle = '#2A1F18'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 512; i += 64) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, i, 512, 2)
    for (let j = 0; j < 512; j += 8) {
      ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,255,255' : '0,0,0'},0.03)`
      ctx.fillRect(j, i + 3, 8, 60)
    }
  }
  bump.update()
  bump.uScale = 4
  bump.vScale = 3.5
  bump.level = 0.3
  mat.bumpTexture = bump

  return mat
}

export function createStoneMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('stoneMat', scene)
  mat.diffuseColor = new Color3(0.35, 0.30, 0.25)
  mat.specularColor = new Color3(0.05, 0.04, 0.04)
  mat.specularPower = 8

  const bump = new DynamicTexture('stoneBump', { width: 512, height: 512 }, scene)
  const ctx = bump.getContext()
  ctx.fillStyle = '#4A3F35'
  ctx.fillRect(0, 0, 512, 512)
  for (let y = 0; y < 512; y += 64) {
    for (let x = 0; x < 512; x += 64) {
      ctx.fillStyle = 'rgba(0,0,0,0.08)'
      ctx.fillRect(x, y, 64, 2)
      ctx.fillRect(x, y, 2, 64)
    }
  }
  bump.update()
  bump.uScale = 4
  bump.vScale = 4
  bump.level = 0.2
  mat.bumpTexture = bump

  return mat
}

export function createGlassMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('glassMat', scene)
  mat.diffuseColor = new Color3(0.7, 0.85, 0.95)
  mat.specularColor = new Color3(1, 1, 1)
  mat.specularPower = 128
  mat.alpha = 0.3
  mat.backFaceCulling = false
  return mat
}

export function createGrassFloorMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('grassFloorMat', scene)
  mat.diffuseColor = new Color3(0.15, 0.20, 0.12)
  mat.specularColor = new Color3(0.03, 0.04, 0.03)
  mat.specularPower = 8
  return mat
}

export function createCeilingMat(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('ceilingMat', scene)
  mat.diffuseColor = new Color3(0.28, 0.22, 0.16)
  mat.specularColor = new Color3(0.03, 0.02, 0.02)
  return mat
}

// ── Aggregate Type ──

export type SceneMaterials = {
  teak: StandardMaterial
  gold: StandardMaterial
  wall: StandardMaterial
  floor: StandardMaterial
  stone: StandardMaterial
  glass: StandardMaterial
  grassFloor: StandardMaterial
  ceiling: StandardMaterial
}

// ── Convenience Factory ──

/**
 * Create one instance of every scene material. Call once from BabylonScene.tsx
 * and pass the result to both createCastle() and loadAssets() so all geometry
 * and loaded .glb assets share the same material objects.
 */
export function createSceneMaterials(scene: Scene): SceneMaterials {
  return {
    teak:       createTeakMat(scene),
    gold:       createGoldMat(scene),
    wall:       createWallMat(scene),
    floor:      createFloorMat(scene),
    stone:      createStoneMat(scene),
    glass:      createGlassMat(scene),
    grassFloor: createGrassFloorMat(scene),
    ceiling:    createCeilingMat(scene),
  }
}
