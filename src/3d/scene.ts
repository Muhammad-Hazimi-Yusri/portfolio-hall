import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { WaterMaterial } from '@babylonjs/materials/water'
import type { SceneMaterials } from './materials'

// Side-effect for collisions
import '@babylonjs/core/Collisions/collisionCoordinator'

// ── Constants ──

const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.3
const PLATFORM_HEIGHT = 0.3

// ── Sky Dome ──

function createSkyDome(scene: Scene): Mesh {
  const skyDome = MeshBuilder.CreateSphere(
    'skyDome',
    { diameter: 300, segments: 32 },
    scene,
  )

  const skyMat = new StandardMaterial('skyMat', scene)
  skyMat.disableLighting = true
  skyMat.backFaceCulling = false

  const skyTex = new DynamicTexture('skyTex', { width: 512, height: 256 }, scene)
  const ctx = skyTex.getContext() as unknown as CanvasRenderingContext2D

  // Frutiger Aero sky gradient — vivid blue to warm horizon glow
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#2196F3')
  grad.addColorStop(0.3, '#64B5F6')
  grad.addColorStop(0.6, '#B3E5FC')
  grad.addColorStop(0.85, '#E1F5FE')
  grad.addColorStop(1, '#FFF8E1')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 256)

  // Procedural clouds — soft ellipses in the upper half
  const rng = (min: number, max: number) => min + Math.random() * (max - min)
  for (let i = 0; i < 15; i++) {
    const cx = rng(20, 492)
    const cy = rng(15, 110)
    const rx = rng(30, 80)
    const ry = rng(10, 25)
    const alpha = rng(0.12, 0.28)
    ctx.fillStyle = `rgba(255,255,255,${alpha})`
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  skyTex.update()

  skyMat.emissiveTexture = skyTex
  skyMat.emissiveColor = Color3.White()
  skyDome.material = skyMat
  skyDome.infiniteDistance = true
  skyDome.renderingGroupId = 0

  return skyDome
}

// ── Water Plane ──

function createWaterPlane(scene: Scene, reflectMeshes: Mesh[]): Mesh {
  const waterMesh = MeshBuilder.CreateGround(
    'water',
    { width: 200, height: 200, subdivisions: 64 },
    scene,
  )
  waterMesh.position.y = -0.05

  const waterMat = new WaterMaterial('waterMat', scene)

  // Procedural bump map — subtle normal perturbation for ripple effect
  const bumpTex = new DynamicTexture('waterBump', { width: 256, height: 256 }, scene)
  const bCtx = bumpTex.getContext()
  bCtx.fillStyle = 'rgb(128,128,255)'
  bCtx.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 800; i++) {
    const x = Math.random() * 256
    const y = Math.random() * 256
    const r = Math.random() * 3 + 1
    const shade = 120 + Math.random() * 16
    bCtx.fillStyle = `rgb(${shade},${shade},255)`
    bCtx.beginPath()
    bCtx.arc(x, y, r, 0, Math.PI * 2)
    bCtx.fill()
  }
  bumpTex.update()
  waterMat.bumpTexture = bumpTex

  waterMat.windForce = 2
  waterMat.waveHeight = 0.03
  waterMat.waterColor = new Color3(0.55, 0.78, 0.92)
  waterMat.waterColor2 = new Color3(0.65, 0.85, 0.95)
  waterMat.colorBlendFactor = 0.4
  waterMat.alpha = 0.92
  for (const mesh of reflectMeshes) {
    waterMat.addToRenderList(mesh)
  }
  waterMesh.material = waterMat

  waterMesh.receiveShadows = true
  return waterMesh
}

// ── Main Export ──

export type EnvironmentGeometry = {
  grounds: Mesh[]
  allWalls: Mesh[]
}

/** Backward-compat alias for lights.ts import */
export type CastleGeometry = EnvironmentGeometry

export function createEnvironment(scene: Scene, mats: SceneMaterials): EnvironmentGeometry {
  scene.collisionsEnabled = true

  // Scene atmosphere
  scene.clearColor = new Color4(0.53, 0.81, 0.92, 1)
  scene.fogMode = Scene.FOGMODE_LINEAR
  scene.fogColor = new Color3(0.7, 0.85, 0.95)
  scene.fogStart = 60
  scene.fogEnd = 100

  // ── Platforms (boardwalk) ──

  // Arrival platform (circular, Z ≈ 0)
  const arrivalPlatform = MeshBuilder.CreateCylinder(
    'arrivalPlatform',
    { height: PLATFORM_HEIGHT, diameter: 8, tessellation: 48 },
    scene,
  )
  arrivalPlatform.position = new Vector3(0, 0, 0)
  arrivalPlatform.material = mats.floor
  arrivalPlatform.checkCollisions = true

  // Gallery walkway (long rectangle, Z ≈ 8 to Z ≈ 58)
  const galleryFloor = MeshBuilder.CreateBox(
    'galleryFloor',
    { width: 10, height: PLATFORM_HEIGHT, depth: 50 },
    scene,
  )
  galleryFloor.position = new Vector3(0, 0, 33)
  galleryFloor.material = mats.floor
  galleryFloor.checkCollisions = true

  // Observatory platform (wider circle, Z ≈ 68)
  const observatoryPlatform = MeshBuilder.CreateCylinder(
    'observatoryPlatform',
    { height: PLATFORM_HEIGHT, diameter: 14, tessellation: 48 },
    scene,
  )
  observatoryPlatform.position = new Vector3(0, 0, 68)
  observatoryPlatform.material = mats.floor
  observatoryPlatform.checkCollisions = true

  // Horizon path (narrowing, Z ≈ 75 to Z ≈ 90)
  const horizonPath = MeshBuilder.CreateBox(
    'horizonPath',
    { width: 4, height: PLATFORM_HEIGHT, depth: 15 },
    scene,
  )
  horizonPath.position = new Vector3(0, 0, 82.5)
  horizonPath.material = mats.floor
  horizonPath.checkCollisions = true

  // ── Gallery Wall (left side) ──

  const galleryWall = MeshBuilder.CreateBox(
    'galleryWall',
    { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: 50 },
    scene,
  )
  galleryWall.position = new Vector3(-5, WALL_HEIGHT / 2, 33)
  galleryWall.material = mats.wall
  galleryWall.checkCollisions = true

  // ── Collision Railings (invisible) ──

  // Gallery right-side railing
  const galleryRailRight = MeshBuilder.CreateBox(
    'galleryRailRight',
    { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: 50 },
    scene,
  )
  galleryRailRight.position = new Vector3(5, WALL_HEIGHT / 2, 33)
  galleryRailRight.isVisible = false
  galleryRailRight.checkCollisions = true

  // Horizon left railing
  const horizonRailLeft = MeshBuilder.CreateBox(
    'horizonRailLeft',
    { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: 15 },
    scene,
  )
  horizonRailLeft.position = new Vector3(-2, WALL_HEIGHT / 2, 82.5)
  horizonRailLeft.isVisible = false
  horizonRailLeft.checkCollisions = true

  // Horizon right railing
  const horizonRailRight = MeshBuilder.CreateBox(
    'horizonRailRight',
    { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: 15 },
    scene,
  )
  horizonRailRight.position = new Vector3(2, WALL_HEIGHT / 2, 82.5)
  horizonRailRight.isVisible = false
  horizonRailRight.checkCollisions = true

  // Horizon end wall
  const horizonEnd = MeshBuilder.CreateBox(
    'horizonEnd',
    { width: 4, height: WALL_HEIGHT, depth: WALL_THICKNESS },
    scene,
  )
  horizonEnd.position = new Vector3(0, WALL_HEIGHT / 2, 90)
  horizonEnd.isVisible = false
  horizonEnd.checkCollisions = true

  // ── Sky Dome ──

  const skyDome = createSkyDome(scene)

  // ── Water Plane ──

  const allPlatformMeshes: Mesh[] = [
    arrivalPlatform, galleryFloor, observatoryPlatform, horizonPath,
    galleryWall, skyDome,
  ]
  createWaterPlane(scene, allPlatformMeshes)

  // ── Return ──

  const grounds = [arrivalPlatform, galleryFloor, observatoryPlatform, horizonPath]

  return {
    grounds,
    allWalls: [galleryWall, galleryRailRight, horizonRailLeft, horizonRailRight, horizonEnd],
  }
}
