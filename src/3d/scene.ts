import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'

// Side-effect for collisions
import '@babylonjs/core/Collisions/collisionCoordinator'

const HALL_WIDTH = 16
const HALL_DEPTH = 14
const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.3
const DOOR_WIDTH = 2

function createFloorMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('floorMat', scene)
  mat.diffuseColor = new Color3(0.16, 0.12, 0.09) // hall-surface
  mat.specularColor = new Color3(0.08, 0.06, 0.04)
  mat.specularPower = 32

  // Procedural wood grain bump
  const bump = new DynamicTexture('floorBump', { width: 512, height: 512 }, scene)
  const ctx = bump.getContext()
  ctx.fillStyle = '#2A1F18'
  ctx.fillRect(0, 0, 512, 512)
  // Draw plank lines
  for (let i = 0; i < 512; i += 64) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, i, 512, 2)
    // Subtle grain within planks
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

function createWallMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('wallMat', scene)
  mat.diffuseColor = new Color3(0.24, 0.17, 0.12) // hall-frame (teak)
  mat.specularColor = new Color3(0.06, 0.04, 0.03)
  mat.specularPower = 16
  return mat
}

function createMoldingMaterials(scene: Scene) {
  const baseboard = new StandardMaterial('baseboardMat', scene)
  baseboard.diffuseColor = new Color3(0.36, 0.25, 0.20) // hall-frame-light
  baseboard.specularColor = new Color3(0.1, 0.08, 0.06)

  const crown = new StandardMaterial('crownMat', scene)
  crown.diffuseColor = new Color3(0.79, 0.66, 0.30) // hall-accent gold
  crown.specularColor = new Color3(0.4, 0.35, 0.15)
  crown.specularPower = 64

  return { baseboard, crown }
}

function createMolding(scene: Scene, moldingMats: { baseboard: StandardMaterial; crown: StandardMaterial }) {
  const meshes: Mesh[] = []

  // --- Baseboards (h=0.2, at y=0.1) ---
  // North
  const northBase = MeshBuilder.CreateBox('northBase', { width: HALL_WIDTH, height: 0.2, depth: 0.15 }, scene)
  northBase.position = new Vector3(0, 0.1, -7 + WALL_THICKNESS / 2 + 0.075)
  northBase.material = moldingMats.baseboard
  meshes.push(northBase)

  // South left
  const southBaseL = MeshBuilder.CreateBox('southBaseL', { width: (HALL_WIDTH - DOOR_WIDTH) / 2, height: 0.2, depth: 0.15 }, scene)
  southBaseL.position = new Vector3(-(HALL_WIDTH + DOOR_WIDTH) / 4, 0.1, 7 - WALL_THICKNESS / 2 - 0.075)
  southBaseL.material = moldingMats.baseboard
  meshes.push(southBaseL)

  const southBaseR = MeshBuilder.CreateBox('southBaseR', { width: (HALL_WIDTH - DOOR_WIDTH) / 2, height: 0.2, depth: 0.15 }, scene)
  southBaseR.position = new Vector3((HALL_WIDTH + DOOR_WIDTH) / 4, 0.1, 7 - WALL_THICKNESS / 2 - 0.075)
  southBaseR.material = moldingMats.baseboard
  meshes.push(southBaseR)

  // East
  const eastBase = MeshBuilder.CreateBox('eastBase', { width: 0.15, height: 0.2, depth: HALL_DEPTH }, scene)
  eastBase.position = new Vector3(8 - WALL_THICKNESS / 2 - 0.075, 0.1, 0)
  eastBase.material = moldingMats.baseboard
  meshes.push(eastBase)

  // West
  const westBase = MeshBuilder.CreateBox('westBase', { width: 0.15, height: 0.2, depth: HALL_DEPTH }, scene)
  westBase.position = new Vector3(-8 + WALL_THICKNESS / 2 + 0.075, 0.1, 0)
  westBase.material = moldingMats.baseboard
  meshes.push(westBase)

  // --- Crown Molding (h=0.15, at y=3.85) ---
  const crownY = WALL_HEIGHT - 0.15 / 2

  const northCrown = MeshBuilder.CreateBox('northCrown', { width: HALL_WIDTH, height: 0.15, depth: 0.15 }, scene)
  northCrown.position = new Vector3(0, crownY, -7 + WALL_THICKNESS / 2 + 0.075)
  northCrown.material = moldingMats.crown
  meshes.push(northCrown)

  const southCrownL = MeshBuilder.CreateBox('southCrownL', { width: (HALL_WIDTH - DOOR_WIDTH) / 2, height: 0.15, depth: 0.15 }, scene)
  southCrownL.position = new Vector3(-(HALL_WIDTH + DOOR_WIDTH) / 4, crownY, 7 - WALL_THICKNESS / 2 - 0.075)
  southCrownL.material = moldingMats.crown
  meshes.push(southCrownL)

  const southCrownR = MeshBuilder.CreateBox('southCrownR', { width: (HALL_WIDTH - DOOR_WIDTH) / 2, height: 0.15, depth: 0.15 }, scene)
  southCrownR.position = new Vector3((HALL_WIDTH + DOOR_WIDTH) / 4, crownY, 7 - WALL_THICKNESS / 2 - 0.075)
  southCrownR.material = moldingMats.crown
  meshes.push(southCrownR)

  const eastCrown = MeshBuilder.CreateBox('eastCrown', { width: 0.15, height: 0.15, depth: HALL_DEPTH }, scene)
  eastCrown.position = new Vector3(8 - WALL_THICKNESS / 2 - 0.075, crownY, 0)
  eastCrown.material = moldingMats.crown
  meshes.push(eastCrown)

  const westCrown = MeshBuilder.CreateBox('westCrown', { width: 0.15, height: 0.15, depth: HALL_DEPTH }, scene)
  westCrown.position = new Vector3(-8 + WALL_THICKNESS / 2 + 0.075, crownY, 0)
  westCrown.material = moldingMats.crown
  meshes.push(westCrown)

  return meshes
}

function createPillar(name: string, x: number, z: number, scene: Scene, bodyMat: StandardMaterial, capMat: StandardMaterial): Mesh {
  const parent = new Mesh(name, scene)
  parent.position = new Vector3(x, 0, z)

  // Base
  const base = MeshBuilder.CreateCylinder(`${name}-base`, {
    diameterTop: 0.6, diameterBottom: 0.7, height: 0.25, tessellation: 10,
  }, scene)
  base.position.y = 0.125
  base.parent = parent
  base.material = bodyMat
  base.checkCollisions = true

  // Shaft
  const shaft = MeshBuilder.CreateCylinder(`${name}-shaft`, {
    diameter: 0.4, height: 3.2, tessellation: 10,
  }, scene)
  shaft.position.y = 0.25 + 1.6
  shaft.parent = parent
  shaft.material = bodyMat
  shaft.checkCollisions = true

  // Capital
  const capital = MeshBuilder.CreateCylinder(`${name}-cap`, {
    diameterTop: 0.55, diameterBottom: 0.6, height: 0.25, tessellation: 10,
  }, scene)
  capital.position.y = WALL_HEIGHT - 0.25 / 2 - 0.15 // sit just below crown molding
  capital.parent = parent
  capital.material = capMat

  return parent
}

export function createHall(scene: Scene) {
  scene.collisionsEnabled = true

  // --- Floor ---
  const ground = MeshBuilder.CreateGround('ground', { width: HALL_WIDTH, height: HALL_DEPTH }, scene)
  ground.material = createFloorMaterial(scene)
  ground.checkCollisions = true

  // --- Ceiling ---
  const ceiling = MeshBuilder.CreateGround('ceiling', { width: HALL_WIDTH, height: HALL_DEPTH }, scene)
  ceiling.position.y = WALL_HEIGHT
  ceiling.rotation.x = Math.PI
  const ceilingMat = new StandardMaterial('ceilingMat', scene)
  ceilingMat.diffuseColor = new Color3(0.18, 0.13, 0.10)
  ceilingMat.specularColor = new Color3(0.03, 0.02, 0.02)
  ceiling.material = ceilingMat

  // --- Walls ---
  const wallMat = createWallMaterial(scene)

  // North wall (back)
  const north = MeshBuilder.CreateBox('northWall', { width: HALL_WIDTH, height: WALL_HEIGHT, depth: WALL_THICKNESS }, scene)
  north.position = new Vector3(0, WALL_HEIGHT / 2, -7)
  north.material = wallMat
  north.checkCollisions = true

  // South wall (two segments with door gap)
  const southSegmentWidth = (HALL_WIDTH - DOOR_WIDTH) / 2
  const southLeft = MeshBuilder.CreateBox('southWallLeft', { width: southSegmentWidth, height: WALL_HEIGHT, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(-(HALL_WIDTH + DOOR_WIDTH) / 4, WALL_HEIGHT / 2, 7)
  southLeft.material = wallMat
  southLeft.checkCollisions = true

  const southRight = MeshBuilder.CreateBox('southWallRight', { width: southSegmentWidth, height: WALL_HEIGHT, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3((HALL_WIDTH + DOOR_WIDTH) / 4, WALL_HEIGHT / 2, 7)
  southRight.material = wallMat
  southRight.checkCollisions = true

  // East wall
  const east = MeshBuilder.CreateBox('eastWall', { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: HALL_DEPTH }, scene)
  east.position = new Vector3(8, WALL_HEIGHT / 2, 0)
  east.material = wallMat
  east.checkCollisions = true

  // West wall
  const west = MeshBuilder.CreateBox('westWall', { width: WALL_THICKNESS, height: WALL_HEIGHT, depth: HALL_DEPTH }, scene)
  west.position = new Vector3(-8, WALL_HEIGHT / 2, 0)
  west.material = wallMat
  west.checkCollisions = true

  // --- Molding ---
  const moldingMats = createMoldingMaterials(scene)
  createMolding(scene, moldingMats)

  // --- Corner Pillars ---
  const pillarBodyMat = moldingMats.baseboard // hall-frame-light
  const pillarCapMat = moldingMats.crown // gold
  createPillar('pillar-NE', 7, -6, scene, pillarBodyMat, pillarCapMat)
  createPillar('pillar-NW', -7, -6, scene, pillarBodyMat, pillarCapMat)
  createPillar('pillar-SE', 7, 6, scene, pillarBodyMat, pillarCapMat)
  createPillar('pillar-SW', -7, 6, scene, pillarBodyMat, pillarCapMat)

  return { ground, walls: [north, southLeft, southRight, east, west], ceiling }
}
