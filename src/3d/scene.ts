import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'

// Side-effect for collisions
import '@babylonjs/core/Collisions/collisionCoordinator'

// ── Constants ──

const WALL_HEIGHT = 4
const WALL_THICKNESS = 0.3
const DOOR_WIDTH = 3

// Zone coordinate boundaries
const RECEPTION = { x1: -5, x2: 5, z1: 8, z2: 18, w: 10, d: 10, h: 5 }
const COURTYARD = { x1: -8, x2: 8, z1: -8, z2: 8, w: 16, d: 16 }
const MAIN_HALL = { x1: -8, x2: 8, z1: -22, z2: -8, w: 16, d: 14, h: WALL_HEIGHT }
const GARDEN = { x1: -20, x2: -8, z1: -6, z2: 6, w: 12, d: 12, h: 5 }

// ── Shared Materials ──

function createFloorMaterial(scene: Scene): StandardMaterial {
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

function createWallMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('wallMat', scene)
  mat.diffuseColor = new Color3(0.24, 0.17, 0.12)
  mat.specularColor = new Color3(0.06, 0.04, 0.03)
  mat.specularPower = 16
  return mat
}

function createMoldingMaterials(scene: Scene) {
  const baseboard = new StandardMaterial('baseboardMat', scene)
  baseboard.diffuseColor = new Color3(0.36, 0.25, 0.20)
  baseboard.specularColor = new Color3(0.1, 0.08, 0.06)

  const crown = new StandardMaterial('crownMat', scene)
  crown.diffuseColor = new Color3(0.79, 0.66, 0.30)
  crown.specularColor = new Color3(0.4, 0.35, 0.15)
  crown.specularPower = 64
  crown.emissiveColor = new Color3(0.04, 0.03, 0.01)

  return { baseboard, crown }
}

function createStoneMaterial(scene: Scene): StandardMaterial {
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

function createGlassPanelMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('glassPanelMat', scene)
  mat.diffuseColor = new Color3(0.7, 0.85, 0.95)
  mat.specularColor = new Color3(1, 1, 1)
  mat.specularPower = 128
  mat.alpha = 0.3
  mat.backFaceCulling = false
  return mat
}

function createGrassFloorMaterial(scene: Scene): StandardMaterial {
  const mat = new StandardMaterial('grassFloorMat', scene)
  mat.diffuseColor = new Color3(0.15, 0.20, 0.12)
  mat.specularColor = new Color3(0.03, 0.04, 0.03)
  mat.specularPower = 8
  return mat
}

// ── Pillar Builder ──

function createPillar(name: string, x: number, z: number, scene: Scene, bodyMat: StandardMaterial, capMat: StandardMaterial, height: number = WALL_HEIGHT): Mesh {
  const parent = new Mesh(name, scene)
  parent.position = new Vector3(x, 0, z)

  const base = MeshBuilder.CreateCylinder(`${name}-base`, {
    diameterTop: 0.6, diameterBottom: 0.7, height: 0.25, tessellation: 10,
  }, scene)
  base.position.y = 0.125
  base.parent = parent
  base.material = bodyMat
  base.checkCollisions = true

  const shaftHeight = height - 0.65
  const shaft = MeshBuilder.CreateCylinder(`${name}-shaft`, {
    diameter: 0.4, height: shaftHeight, tessellation: 10,
  }, scene)
  shaft.position.y = 0.25 + shaftHeight / 2
  shaft.parent = parent
  shaft.material = bodyMat
  shaft.checkCollisions = true

  const capital = MeshBuilder.CreateCylinder(`${name}-cap`, {
    diameterTop: 0.55, diameterBottom: 0.6, height: 0.25, tessellation: 10,
  }, scene)
  capital.position.y = height - 0.25 / 2 - 0.15
  capital.parent = parent
  capital.material = capMat

  return parent
}

// ── Gold Doorway Frame ──

function createDoorwayFrame(name: string, x: number, z: number, width: number, height: number, axis: 'x' | 'z', scene: Scene, goldMat: StandardMaterial) {
  const t = 0.1
  const d = 0.15

  if (axis === 'z') {
    // Opening along Z axis (posts on X sides)
    const left = MeshBuilder.CreateBox(`${name}-left`, { width: t, height: height, depth: d }, scene)
    left.position = new Vector3(x - width / 2, height / 2, z)
    left.material = goldMat
    const right = MeshBuilder.CreateBox(`${name}-right`, { width: t, height: height, depth: d }, scene)
    right.position = new Vector3(x + width / 2, height / 2, z)
    right.material = goldMat
    const lintel = MeshBuilder.CreateBox(`${name}-top`, { width: width + 2 * t, height: t, depth: d }, scene)
    lintel.position = new Vector3(x, height, z)
    lintel.material = goldMat
  } else {
    // Opening along X axis (posts on Z sides)
    const left = MeshBuilder.CreateBox(`${name}-left`, { width: d, height: height, depth: t }, scene)
    left.position = new Vector3(x, height / 2, z - width / 2)
    left.material = goldMat
    const right = MeshBuilder.CreateBox(`${name}-right`, { width: d, height: height, depth: t }, scene)
    right.position = new Vector3(x, height / 2, z + width / 2)
    right.material = goldMat
    const lintel = MeshBuilder.CreateBox(`${name}-top`, { width: d, height: t, depth: width + 2 * t }, scene)
    lintel.position = new Vector3(x, height, z)
    lintel.material = goldMat
  }
}

// ── Zone Builders ──

function createReception(scene: Scene, wallMat: StandardMaterial, moldingMats: ReturnType<typeof createMoldingMaterials>, floorMat: StandardMaterial): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerZ = (RECEPTION.z1 + RECEPTION.z2) / 2

  // Ground
  const ground = MeshBuilder.CreateGround('reception-ground', { width: RECEPTION.w, height: RECEPTION.d }, scene)
  ground.position = new Vector3(0, 0, centerZ)
  ground.material = floorMat
  ground.checkCollisions = true

  // Ceiling
  const ceiling = MeshBuilder.CreateGround('reception-ceiling', { width: RECEPTION.w, height: RECEPTION.d }, scene)
  ceiling.position = new Vector3(0, RECEPTION.h, centerZ)
  ceiling.rotation.x = Math.PI
  const ceilingMat = new StandardMaterial('receptionCeilingMat', scene)
  ceilingMat.diffuseColor = new Color3(0.28, 0.22, 0.16)
  ceilingMat.specularColor = new Color3(0.03, 0.02, 0.02)
  ceiling.material = ceilingMat

  // South wall (entrance with door gap)
  const southSegW = (RECEPTION.w - DOOR_WIDTH) / 2
  const southLeft = MeshBuilder.CreateBox('rec-south-left', { width: southSegW, height: RECEPTION.h, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(-(RECEPTION.w + DOOR_WIDTH) / 4, RECEPTION.h / 2, RECEPTION.z2)
  southLeft.material = wallMat
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('rec-south-right', { width: southSegW, height: RECEPTION.h, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3((RECEPTION.w + DOOR_WIDTH) / 4, RECEPTION.h / 2, RECEPTION.z2)
  southRight.material = wallMat
  southRight.checkCollisions = true
  walls.push(southRight)

  // East wall
  const east = MeshBuilder.CreateBox('rec-east', { width: WALL_THICKNESS, height: RECEPTION.h, depth: RECEPTION.d }, scene)
  east.position = new Vector3(RECEPTION.x2, RECEPTION.h / 2, centerZ)
  east.material = wallMat
  east.checkCollisions = true
  walls.push(east)

  // West wall
  const west = MeshBuilder.CreateBox('rec-west', { width: WALL_THICKNESS, height: RECEPTION.h, depth: RECEPTION.d }, scene)
  west.position = new Vector3(RECEPTION.x1, RECEPTION.h / 2, centerZ)
  west.material = wallMat
  west.checkCollisions = true
  walls.push(west)

  // Pillars
  for (const px of [-4, 0, 4]) {
    createPillar(`rec-pillar-${px}-front`, px, 10, scene, moldingMats.baseboard, moldingMats.crown, RECEPTION.h)
    createPillar(`rec-pillar-${px}-back`, px, 15, scene, moldingMats.baseboard, moldingMats.crown, RECEPTION.h)
  }

  // Doorway frame at entrance
  createDoorwayFrame('rec-entrance', 0, RECEPTION.z2, DOOR_WIDTH, RECEPTION.h, 'z', scene, moldingMats.crown)

  return { ground, walls }
}

function createMainHall(scene: Scene, wallMat: StandardMaterial, moldingMats: ReturnType<typeof createMoldingMaterials>, floorMat: StandardMaterial): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerZ = (MAIN_HALL.z1 + MAIN_HALL.z2) / 2

  // Ground
  const ground = MeshBuilder.CreateGround('mainhall-ground', { width: MAIN_HALL.w, height: MAIN_HALL.d }, scene)
  ground.position = new Vector3(0, 0, centerZ)
  ground.material = floorMat
  ground.checkCollisions = true

  // Ceiling
  const ceiling = MeshBuilder.CreateGround('mainhall-ceiling', { width: MAIN_HALL.w, height: MAIN_HALL.d }, scene)
  ceiling.position = new Vector3(0, MAIN_HALL.h, centerZ)
  ceiling.rotation.x = Math.PI
  const ceilingMat = new StandardMaterial('mhCeilingMat', scene)
  ceilingMat.diffuseColor = new Color3(0.28, 0.22, 0.16)
  ceilingMat.specularColor = new Color3(0.03, 0.02, 0.02)
  ceiling.material = ceilingMat

  // North wall (back)
  const north = MeshBuilder.CreateBox('mh-north', { width: MAIN_HALL.w, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  north.position = new Vector3(0, MAIN_HALL.h / 2, MAIN_HALL.z1)
  north.material = wallMat
  north.checkCollisions = true
  walls.push(north)

  // South wall (door gap to courtyard)
  const southSegW = (MAIN_HALL.w - DOOR_WIDTH) / 2
  const southLeft = MeshBuilder.CreateBox('mh-south-left', { width: southSegW, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(-(MAIN_HALL.w + DOOR_WIDTH) / 4, MAIN_HALL.h / 2, MAIN_HALL.z2)
  southLeft.material = wallMat
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('mh-south-right', { width: southSegW, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3((MAIN_HALL.w + DOOR_WIDTH) / 4, MAIN_HALL.h / 2, MAIN_HALL.z2)
  southRight.material = wallMat
  southRight.checkCollisions = true
  walls.push(southRight)

  // East wall
  const east = MeshBuilder.CreateBox('mh-east', { width: WALL_THICKNESS, height: MAIN_HALL.h, depth: MAIN_HALL.d }, scene)
  east.position = new Vector3(MAIN_HALL.x2, MAIN_HALL.h / 2, centerZ)
  east.material = wallMat
  east.checkCollisions = true
  walls.push(east)

  // West wall
  const west = MeshBuilder.CreateBox('mh-west', { width: WALL_THICKNESS, height: MAIN_HALL.h, depth: MAIN_HALL.d }, scene)
  west.position = new Vector3(MAIN_HALL.x1, MAIN_HALL.h / 2, centerZ)
  west.material = wallMat
  west.checkCollisions = true
  walls.push(west)

  // Corner pillars
  createPillar('mh-pillar-NE', 7, MAIN_HALL.z1 + 1, scene, moldingMats.baseboard, moldingMats.crown, MAIN_HALL.h)
  createPillar('mh-pillar-NW', -7, MAIN_HALL.z1 + 1, scene, moldingMats.baseboard, moldingMats.crown, MAIN_HALL.h)
  createPillar('mh-pillar-SE', 7, MAIN_HALL.z2 - 1, scene, moldingMats.baseboard, moldingMats.crown, MAIN_HALL.h)
  createPillar('mh-pillar-SW', -7, MAIN_HALL.z2 - 1, scene, moldingMats.baseboard, moldingMats.crown, MAIN_HALL.h)

  // Crown molding
  const crownY = MAIN_HALL.h - 0.075
  const northCrown = MeshBuilder.CreateBox('mh-crown-north', { width: MAIN_HALL.w, height: 0.15, depth: 0.15 }, scene)
  northCrown.position = new Vector3(0, crownY, MAIN_HALL.z1 + WALL_THICKNESS / 2 + 0.075)
  northCrown.material = moldingMats.crown

  const eastCrown = MeshBuilder.CreateBox('mh-crown-east', { width: 0.15, height: 0.15, depth: MAIN_HALL.d }, scene)
  eastCrown.position = new Vector3(MAIN_HALL.x2 - WALL_THICKNESS / 2 - 0.075, crownY, centerZ)
  eastCrown.material = moldingMats.crown

  const westCrown = MeshBuilder.CreateBox('mh-crown-west', { width: 0.15, height: 0.15, depth: MAIN_HALL.d }, scene)
  westCrown.position = new Vector3(MAIN_HALL.x1 + WALL_THICKNESS / 2 + 0.075, crownY, centerZ)
  westCrown.material = moldingMats.crown

  // Baseboards
  const northBase = MeshBuilder.CreateBox('mh-base-north', { width: MAIN_HALL.w, height: 0.2, depth: 0.15 }, scene)
  northBase.position = new Vector3(0, 0.1, MAIN_HALL.z1 + WALL_THICKNESS / 2 + 0.075)
  northBase.material = moldingMats.baseboard

  const eastBase = MeshBuilder.CreateBox('mh-base-east', { width: 0.15, height: 0.2, depth: MAIN_HALL.d }, scene)
  eastBase.position = new Vector3(MAIN_HALL.x2 - WALL_THICKNESS / 2 - 0.075, 0.1, centerZ)
  eastBase.material = moldingMats.baseboard

  const westBase = MeshBuilder.CreateBox('mh-base-west', { width: 0.15, height: 0.2, depth: MAIN_HALL.d }, scene)
  westBase.position = new Vector3(MAIN_HALL.x1 + WALL_THICKNESS / 2 + 0.075, 0.1, centerZ)
  westBase.material = moldingMats.baseboard

  // Doorway frame
  createDoorwayFrame('mh-door-south', 0, MAIN_HALL.z2, DOOR_WIDTH, MAIN_HALL.h, 'z', scene, moldingMats.crown)

  return { ground, walls }
}

function createCourtyard(scene: Scene, moldingMats: ReturnType<typeof createMoldingMaterials>): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const stoneMat = createStoneMaterial(scene)
  const railingH = 2

  // Ground (stone)
  const ground = MeshBuilder.CreateGround('courtyard-ground', { width: COURTYARD.w, height: COURTYARD.d }, scene)
  ground.position = new Vector3(0, 0, 0)
  ground.material = stoneMat
  ground.checkCollisions = true

  // North railing (door gap to Main Hall)
  const northSegW = (COURTYARD.w - DOOR_WIDTH) / 2
  const northLeft = MeshBuilder.CreateBox('cy-north-left', { width: northSegW, height: railingH, depth: WALL_THICKNESS }, scene)
  northLeft.position = new Vector3(-(COURTYARD.w + DOOR_WIDTH) / 4, railingH / 2, COURTYARD.z1)
  northLeft.material = stoneMat
  northLeft.checkCollisions = true
  walls.push(northLeft)

  const northRight = MeshBuilder.CreateBox('cy-north-right', { width: northSegW, height: railingH, depth: WALL_THICKNESS }, scene)
  northRight.position = new Vector3((COURTYARD.w + DOOR_WIDTH) / 4, railingH / 2, COURTYARD.z1)
  northRight.material = stoneMat
  northRight.checkCollisions = true
  walls.push(northRight)

  // South railing (opening for Reception: x=-5 to +5, wall segments at sides)
  const sideW = COURTYARD.x2 - RECEPTION.x2 // 3
  const southLeft = MeshBuilder.CreateBox('cy-south-left', { width: sideW, height: railingH, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(COURTYARD.x1 + sideW / 2, railingH / 2, COURTYARD.z2)
  southLeft.material = stoneMat
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('cy-south-right', { width: sideW, height: railingH, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3(COURTYARD.x2 - sideW / 2, railingH / 2, COURTYARD.z2)
  southRight.material = stoneMat
  southRight.checkCollisions = true
  walls.push(southRight)

  // East railing (full)
  const east = MeshBuilder.CreateBox('cy-east', { width: WALL_THICKNESS, height: railingH, depth: COURTYARD.d }, scene)
  east.position = new Vector3(COURTYARD.x2, railingH / 2, 0)
  east.material = stoneMat
  east.checkCollisions = true
  walls.push(east)

  // West railing (door gap for Garden)
  const gardenDoorW = DOOR_WIDTH
  const westSegLen = (COURTYARD.d - gardenDoorW) / 2
  const westTop = MeshBuilder.CreateBox('cy-west-top', { width: WALL_THICKNESS, height: railingH, depth: westSegLen }, scene)
  westTop.position = new Vector3(COURTYARD.x1, railingH / 2, COURTYARD.z1 + westSegLen / 2)
  westTop.material = stoneMat
  westTop.checkCollisions = true
  walls.push(westTop)

  const westBottom = MeshBuilder.CreateBox('cy-west-bottom', { width: WALL_THICKNESS, height: railingH, depth: westSegLen }, scene)
  westBottom.position = new Vector3(COURTYARD.x1, railingH / 2, COURTYARD.z2 - westSegLen / 2)
  westBottom.material = stoneMat
  westBottom.checkCollisions = true
  walls.push(westBottom)

  // Fountain (3-tier)
  const fountainBase = MeshBuilder.CreateCylinder('fountain-base', {
    diameterTop: 2.5, diameterBottom: 3, height: 0.4, tessellation: 16,
  }, scene)
  fountainBase.position.y = 0.2
  fountainBase.material = stoneMat
  fountainBase.checkCollisions = true

  const fountainMid = MeshBuilder.CreateCylinder('fountain-mid', {
    diameterTop: 1.5, diameterBottom: 1.8, height: 0.8, tessellation: 16,
  }, scene)
  fountainMid.position.y = 0.8
  fountainMid.material = stoneMat

  const fountainTop = MeshBuilder.CreateCylinder('fountain-top', {
    diameterTop: 0.6, diameterBottom: 0.8, height: 0.5, tessellation: 16,
  }, scene)
  fountainTop.position.y = 1.45
  fountainTop.material = moldingMats.crown

  // Doorway frames
  createDoorwayFrame('cy-door-north', 0, COURTYARD.z1, DOOR_WIDTH, MAIN_HALL.h, 'z', scene, moldingMats.crown)
  createDoorwayFrame('cy-door-west', COURTYARD.x1, 0, gardenDoorW, GARDEN.h, 'x', scene, moldingMats.crown)

  return { ground, walls }
}

function createGarden(scene: Scene, wallMat: StandardMaterial, moldingMats: ReturnType<typeof createMoldingMaterials>): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerX = (GARDEN.x1 + GARDEN.x2) / 2
  const centerZ = (GARDEN.z1 + GARDEN.z2) / 2
  const glassMat = createGlassPanelMaterial(scene)

  // Ground (grass-tinted)
  const ground = MeshBuilder.CreateGround('garden-ground', { width: GARDEN.w, height: GARDEN.d }, scene)
  ground.position = new Vector3(centerX, 0, centerZ)
  ground.material = createGrassFloorMaterial(scene)
  ground.checkCollisions = true

  // Ceiling (translucent glass)
  const ceiling = MeshBuilder.CreateGround('garden-ceiling', { width: GARDEN.w, height: GARDEN.d }, scene)
  ceiling.position = new Vector3(centerX, GARDEN.h, centerZ)
  ceiling.rotation.x = Math.PI
  ceiling.material = glassMat

  // West wall (glass)
  const west = MeshBuilder.CreateBox('garden-west', { width: WALL_THICKNESS, height: GARDEN.h, depth: GARDEN.d }, scene)
  west.position = new Vector3(GARDEN.x1, GARDEN.h / 2, centerZ)
  west.material = glassMat
  west.checkCollisions = true
  walls.push(west)

  // North wall (half teak, half glass)
  const halfW = GARDEN.w / 2
  const northTeak = MeshBuilder.CreateBox('garden-north-teak', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  northTeak.position = new Vector3(GARDEN.x1 + halfW / 2, GARDEN.h / 2, GARDEN.z1)
  northTeak.material = wallMat
  northTeak.checkCollisions = true
  walls.push(northTeak)

  const northGlass = MeshBuilder.CreateBox('garden-north-glass', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  northGlass.position = new Vector3(GARDEN.x2 - halfW / 2, GARDEN.h / 2, GARDEN.z1)
  northGlass.material = glassMat
  northGlass.checkCollisions = true
  walls.push(northGlass)

  // South wall (half teak, half glass)
  const southTeak = MeshBuilder.CreateBox('garden-south-teak', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  southTeak.position = new Vector3(GARDEN.x1 + halfW / 2, GARDEN.h / 2, GARDEN.z2)
  southTeak.material = wallMat
  southTeak.checkCollisions = true
  walls.push(southTeak)

  const southGlass = MeshBuilder.CreateBox('garden-south-glass', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  southGlass.position = new Vector3(GARDEN.x2 - halfW / 2, GARDEN.h / 2, GARDEN.z2)
  southGlass.material = glassMat
  southGlass.checkCollisions = true
  walls.push(southGlass)

  // Pillars at garden corners
  createPillar('garden-pillar-NW', GARDEN.x1 + 1, GARDEN.z1 + 1, scene, moldingMats.baseboard, moldingMats.crown, GARDEN.h)
  createPillar('garden-pillar-SW', GARDEN.x1 + 1, GARDEN.z2 - 1, scene, moldingMats.baseboard, moldingMats.crown, GARDEN.h)

  return { ground, walls }
}

// ── Skybox ──

function createSkybox(scene: Scene) {
  const skybox = MeshBuilder.CreateBox('skybox', { size: 500 }, scene)
  const skyMat = new StandardMaterial('skyMat', scene)

  const tex = new DynamicTexture('skyTex', { width: 512, height: 512 }, scene)
  const ctx = tex.getContext()

  const gradient = ctx.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, '#0B1D3A')
  gradient.addColorStop(0.4, '#1A3A5C')
  gradient.addColorStop(0.7, '#4A6B8A')
  gradient.addColorStop(0.9, '#C9A84C')
  gradient.addColorStop(1, '#E5C97A')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 512)

  // Cloud wisps (using arc — ICanvasRenderingContext lacks ellipse)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
  for (let i = 0; i < 8; i++) {
    const cx = Math.random() * 512
    const cy = 100 + Math.random() * 200
    const r = 30 + Math.random() * 30
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  tex.update()

  skyMat.diffuseTexture = tex
  skyMat.backFaceCulling = false
  skyMat.disableLighting = true
  skyMat.emissiveTexture = tex
  skybox.material = skyMat
  skybox.position.y = 50
}

// ── Main Export ──

export type CastleGeometry = {
  grounds: Mesh[]
  allWalls: Mesh[]
}

export function createCastle(scene: Scene): CastleGeometry {
  scene.collisionsEnabled = true

  const wallMat = createWallMaterial(scene)
  const moldingMats = createMoldingMaterials(scene)
  const floorMat = createFloorMaterial(scene)

  const reception = createReception(scene, wallMat, moldingMats, floorMat)
  const mainHall = createMainHall(scene, wallMat, moldingMats, floorMat)
  const courtyard = createCourtyard(scene, moldingMats)
  const garden = createGarden(scene, wallMat, moldingMats)

  createSkybox(scene)

  return {
    grounds: [reception.ground, mainHall.ground, courtyard.ground, garden.ground],
    allWalls: [...reception.walls, ...mainHall.walls, ...courtyard.walls, ...garden.walls],
  }
}
