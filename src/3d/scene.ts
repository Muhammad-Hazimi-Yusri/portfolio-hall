import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { SceneMaterials } from './materials'

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

function createReception(scene: Scene, mats: SceneMaterials): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerZ = (RECEPTION.z1 + RECEPTION.z2) / 2

  // Ground
  const ground = MeshBuilder.CreateGround('reception-ground', { width: RECEPTION.w, height: RECEPTION.d }, scene)
  ground.position = new Vector3(0, 0, centerZ)
  ground.material = mats.floor
  ground.checkCollisions = true

  // Ceiling
  const ceiling = MeshBuilder.CreateGround('reception-ceiling', { width: RECEPTION.w, height: RECEPTION.d }, scene)
  ceiling.position = new Vector3(0, RECEPTION.h, centerZ)
  ceiling.rotation.x = Math.PI
  ceiling.material = mats.ceiling

  // South wall (entrance with door gap)
  const southSegW = (RECEPTION.w - DOOR_WIDTH) / 2
  const southLeft = MeshBuilder.CreateBox('rec-south-left', { width: southSegW, height: RECEPTION.h, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(-(RECEPTION.w + DOOR_WIDTH) / 4, RECEPTION.h / 2, RECEPTION.z2)
  southLeft.material = mats.wall
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('rec-south-right', { width: southSegW, height: RECEPTION.h, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3((RECEPTION.w + DOOR_WIDTH) / 4, RECEPTION.h / 2, RECEPTION.z2)
  southRight.material = mats.wall
  southRight.checkCollisions = true
  walls.push(southRight)

  // East wall
  const east = MeshBuilder.CreateBox('rec-east', { width: WALL_THICKNESS, height: RECEPTION.h, depth: RECEPTION.d }, scene)
  east.position = new Vector3(RECEPTION.x2, RECEPTION.h / 2, centerZ)
  east.material = mats.wall
  east.checkCollisions = true
  walls.push(east)

  // West wall
  const west = MeshBuilder.CreateBox('rec-west', { width: WALL_THICKNESS, height: RECEPTION.h, depth: RECEPTION.d }, scene)
  west.position = new Vector3(RECEPTION.x1, RECEPTION.h / 2, centerZ)
  west.material = mats.wall
  west.checkCollisions = true
  walls.push(west)

  // Pillars
  for (const px of [-4, 0, 4]) {
    createPillar(`rec-pillar-${px}-front`, px, 10, scene, mats.teak, mats.gold, RECEPTION.h)
    createPillar(`rec-pillar-${px}-back`, px, 15, scene, mats.teak, mats.gold, RECEPTION.h)
  }

  // Doorway frame at entrance
  createDoorwayFrame('rec-entrance', 0, RECEPTION.z2, DOOR_WIDTH, RECEPTION.h, 'z', scene, mats.gold)

  return { ground, walls }
}

function createMainHall(scene: Scene, mats: SceneMaterials): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerZ = (MAIN_HALL.z1 + MAIN_HALL.z2) / 2

  // Ground
  const ground = MeshBuilder.CreateGround('mainhall-ground', { width: MAIN_HALL.w, height: MAIN_HALL.d }, scene)
  ground.position = new Vector3(0, 0, centerZ)
  ground.material = mats.floor
  ground.checkCollisions = true

  // Ceiling
  const ceiling = MeshBuilder.CreateGround('mainhall-ceiling', { width: MAIN_HALL.w, height: MAIN_HALL.d }, scene)
  ceiling.position = new Vector3(0, MAIN_HALL.h, centerZ)
  ceiling.rotation.x = Math.PI
  ceiling.material = mats.ceiling

  // North wall (back)
  const north = MeshBuilder.CreateBox('mh-north', { width: MAIN_HALL.w, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  north.position = new Vector3(0, MAIN_HALL.h / 2, MAIN_HALL.z1)
  north.material = mats.wall
  north.checkCollisions = true
  walls.push(north)

  // South wall (door gap to courtyard)
  const southSegW = (MAIN_HALL.w - DOOR_WIDTH) / 2
  const southLeft = MeshBuilder.CreateBox('mh-south-left', { width: southSegW, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(-(MAIN_HALL.w + DOOR_WIDTH) / 4, MAIN_HALL.h / 2, MAIN_HALL.z2)
  southLeft.material = mats.wall
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('mh-south-right', { width: southSegW, height: MAIN_HALL.h, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3((MAIN_HALL.w + DOOR_WIDTH) / 4, MAIN_HALL.h / 2, MAIN_HALL.z2)
  southRight.material = mats.wall
  southRight.checkCollisions = true
  walls.push(southRight)

  // East wall
  const east = MeshBuilder.CreateBox('mh-east', { width: WALL_THICKNESS, height: MAIN_HALL.h, depth: MAIN_HALL.d }, scene)
  east.position = new Vector3(MAIN_HALL.x2, MAIN_HALL.h / 2, centerZ)
  east.material = mats.wall
  east.checkCollisions = true
  walls.push(east)

  // West wall
  const west = MeshBuilder.CreateBox('mh-west', { width: WALL_THICKNESS, height: MAIN_HALL.h, depth: MAIN_HALL.d }, scene)
  west.position = new Vector3(MAIN_HALL.x1, MAIN_HALL.h / 2, centerZ)
  west.material = mats.wall
  west.checkCollisions = true
  walls.push(west)

  // Corner pillars
  createPillar('mh-pillar-NE', 7, MAIN_HALL.z1 + 1, scene, mats.teak, mats.gold, MAIN_HALL.h)
  createPillar('mh-pillar-NW', -7, MAIN_HALL.z1 + 1, scene, mats.teak, mats.gold, MAIN_HALL.h)
  createPillar('mh-pillar-SE', 7, MAIN_HALL.z2 - 1, scene, mats.teak, mats.gold, MAIN_HALL.h)
  createPillar('mh-pillar-SW', -7, MAIN_HALL.z2 - 1, scene, mats.teak, mats.gold, MAIN_HALL.h)

  // Crown molding
  const crownY = MAIN_HALL.h - 0.075
  const northCrown = MeshBuilder.CreateBox('mh-crown-north', { width: MAIN_HALL.w, height: 0.15, depth: 0.15 }, scene)
  northCrown.position = new Vector3(0, crownY, MAIN_HALL.z1 + WALL_THICKNESS / 2 + 0.075)
  northCrown.material = mats.gold

  const eastCrown = MeshBuilder.CreateBox('mh-crown-east', { width: 0.15, height: 0.15, depth: MAIN_HALL.d }, scene)
  eastCrown.position = new Vector3(MAIN_HALL.x2 - WALL_THICKNESS / 2 - 0.075, crownY, centerZ)
  eastCrown.material = mats.gold

  const westCrown = MeshBuilder.CreateBox('mh-crown-west', { width: 0.15, height: 0.15, depth: MAIN_HALL.d }, scene)
  westCrown.position = new Vector3(MAIN_HALL.x1 + WALL_THICKNESS / 2 + 0.075, crownY, centerZ)
  westCrown.material = mats.gold

  // Baseboards
  const northBase = MeshBuilder.CreateBox('mh-base-north', { width: MAIN_HALL.w, height: 0.2, depth: 0.15 }, scene)
  northBase.position = new Vector3(0, 0.1, MAIN_HALL.z1 + WALL_THICKNESS / 2 + 0.075)
  northBase.material = mats.teak

  const eastBase = MeshBuilder.CreateBox('mh-base-east', { width: 0.15, height: 0.2, depth: MAIN_HALL.d }, scene)
  eastBase.position = new Vector3(MAIN_HALL.x2 - WALL_THICKNESS / 2 - 0.075, 0.1, centerZ)
  eastBase.material = mats.teak

  const westBase = MeshBuilder.CreateBox('mh-base-west', { width: 0.15, height: 0.2, depth: MAIN_HALL.d }, scene)
  westBase.position = new Vector3(MAIN_HALL.x1 + WALL_THICKNESS / 2 + 0.075, 0.1, centerZ)
  westBase.material = mats.teak

  // Doorway frame
  createDoorwayFrame('mh-door-south', 0, MAIN_HALL.z2, DOOR_WIDTH, MAIN_HALL.h, 'z', scene, mats.gold)

  return { ground, walls }
}

function createCourtyard(scene: Scene, mats: SceneMaterials): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const railingH = 2

  // Ground (stone)
  const ground = MeshBuilder.CreateGround('courtyard-ground', { width: COURTYARD.w, height: COURTYARD.d }, scene)
  ground.position = new Vector3(0, 0, 0)
  ground.material = mats.stone
  ground.checkCollisions = true

  // North railing (door gap to Main Hall)
  const northSegW = (COURTYARD.w - DOOR_WIDTH) / 2
  const northLeft = MeshBuilder.CreateBox('cy-north-left', { width: northSegW, height: railingH, depth: WALL_THICKNESS }, scene)
  northLeft.position = new Vector3(-(COURTYARD.w + DOOR_WIDTH) / 4, railingH / 2, COURTYARD.z1)
  northLeft.material = mats.stone
  northLeft.checkCollisions = true
  walls.push(northLeft)

  const northRight = MeshBuilder.CreateBox('cy-north-right', { width: northSegW, height: railingH, depth: WALL_THICKNESS }, scene)
  northRight.position = new Vector3((COURTYARD.w + DOOR_WIDTH) / 4, railingH / 2, COURTYARD.z1)
  northRight.material = mats.stone
  northRight.checkCollisions = true
  walls.push(northRight)

  // South railing (opening for Reception: x=-5 to +5, wall segments at sides)
  const sideW = COURTYARD.x2 - RECEPTION.x2 // 3
  const southLeft = MeshBuilder.CreateBox('cy-south-left', { width: sideW, height: railingH, depth: WALL_THICKNESS }, scene)
  southLeft.position = new Vector3(COURTYARD.x1 + sideW / 2, railingH / 2, COURTYARD.z2)
  southLeft.material = mats.stone
  southLeft.checkCollisions = true
  walls.push(southLeft)

  const southRight = MeshBuilder.CreateBox('cy-south-right', { width: sideW, height: railingH, depth: WALL_THICKNESS }, scene)
  southRight.position = new Vector3(COURTYARD.x2 - sideW / 2, railingH / 2, COURTYARD.z2)
  southRight.material = mats.stone
  southRight.checkCollisions = true
  walls.push(southRight)

  // East railing (full)
  const east = MeshBuilder.CreateBox('cy-east', { width: WALL_THICKNESS, height: railingH, depth: COURTYARD.d }, scene)
  east.position = new Vector3(COURTYARD.x2, railingH / 2, 0)
  east.material = mats.stone
  east.checkCollisions = true
  walls.push(east)

  // West railing (door gap for Garden)
  const gardenDoorW = DOOR_WIDTH
  const westSegLen = (COURTYARD.d - gardenDoorW) / 2
  const westTop = MeshBuilder.CreateBox('cy-west-top', { width: WALL_THICKNESS, height: railingH, depth: westSegLen }, scene)
  westTop.position = new Vector3(COURTYARD.x1, railingH / 2, COURTYARD.z1 + westSegLen / 2)
  westTop.material = mats.stone
  westTop.checkCollisions = true
  walls.push(westTop)

  const westBottom = MeshBuilder.CreateBox('cy-west-bottom', { width: WALL_THICKNESS, height: railingH, depth: westSegLen }, scene)
  westBottom.position = new Vector3(COURTYARD.x1, railingH / 2, COURTYARD.z2 - westSegLen / 2)
  westBottom.material = mats.stone
  westBottom.checkCollisions = true
  walls.push(westBottom)

  // Fountain (3-tier)
  const fountainBase = MeshBuilder.CreateCylinder('fountain-base', {
    diameterTop: 2.5, diameterBottom: 3, height: 0.4, tessellation: 16,
  }, scene)
  fountainBase.position.y = 0.2
  fountainBase.material = mats.stone
  fountainBase.checkCollisions = true

  const fountainMid = MeshBuilder.CreateCylinder('fountain-mid', {
    diameterTop: 1.5, diameterBottom: 1.8, height: 0.8, tessellation: 16,
  }, scene)
  fountainMid.position.y = 0.8
  fountainMid.material = mats.stone

  const fountainTop = MeshBuilder.CreateCylinder('fountain-top', {
    diameterTop: 0.6, diameterBottom: 0.8, height: 0.5, tessellation: 16,
  }, scene)
  fountainTop.position.y = 1.45
  fountainTop.material = mats.gold

  // Doorway frames
  createDoorwayFrame('cy-door-north', 0, COURTYARD.z1, DOOR_WIDTH, MAIN_HALL.h, 'z', scene, mats.gold)
  createDoorwayFrame('cy-door-west', COURTYARD.x1, 0, gardenDoorW, GARDEN.h, 'x', scene, mats.gold)

  return { ground, walls }
}

function createGarden(scene: Scene, mats: SceneMaterials): { ground: Mesh; walls: Mesh[] } {
  const walls: Mesh[] = []
  const centerX = (GARDEN.x1 + GARDEN.x2) / 2
  const centerZ = (GARDEN.z1 + GARDEN.z2) / 2

  // Ground (grass-tinted)
  const ground = MeshBuilder.CreateGround('garden-ground', { width: GARDEN.w, height: GARDEN.d }, scene)
  ground.position = new Vector3(centerX, 0, centerZ)
  ground.material = mats.grassFloor
  ground.checkCollisions = true

  // Ceiling (translucent glass)
  const ceiling = MeshBuilder.CreateGround('garden-ceiling', { width: GARDEN.w, height: GARDEN.d }, scene)
  ceiling.position = new Vector3(centerX, GARDEN.h, centerZ)
  ceiling.rotation.x = Math.PI
  ceiling.material = mats.glass

  // West wall (glass)
  const west = MeshBuilder.CreateBox('garden-west', { width: WALL_THICKNESS, height: GARDEN.h, depth: GARDEN.d }, scene)
  west.position = new Vector3(GARDEN.x1, GARDEN.h / 2, centerZ)
  west.material = mats.glass
  west.checkCollisions = true
  walls.push(west)

  // North wall (half teak, half glass)
  const halfW = GARDEN.w / 2
  const northTeak = MeshBuilder.CreateBox('garden-north-teak', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  northTeak.position = new Vector3(GARDEN.x1 + halfW / 2, GARDEN.h / 2, GARDEN.z1)
  northTeak.material = mats.wall
  northTeak.checkCollisions = true
  walls.push(northTeak)

  const northGlass = MeshBuilder.CreateBox('garden-north-glass', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  northGlass.position = new Vector3(GARDEN.x2 - halfW / 2, GARDEN.h / 2, GARDEN.z1)
  northGlass.material = mats.glass
  northGlass.checkCollisions = true
  walls.push(northGlass)

  // South wall (half teak, half glass)
  const southTeak = MeshBuilder.CreateBox('garden-south-teak', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  southTeak.position = new Vector3(GARDEN.x1 + halfW / 2, GARDEN.h / 2, GARDEN.z2)
  southTeak.material = mats.wall
  southTeak.checkCollisions = true
  walls.push(southTeak)

  const southGlass = MeshBuilder.CreateBox('garden-south-glass', { width: halfW, height: GARDEN.h, depth: WALL_THICKNESS }, scene)
  southGlass.position = new Vector3(GARDEN.x2 - halfW / 2, GARDEN.h / 2, GARDEN.z2)
  southGlass.material = mats.glass
  southGlass.checkCollisions = true
  walls.push(southGlass)

  // Pillars at garden corners
  createPillar('garden-pillar-NW', GARDEN.x1 + 1, GARDEN.z1 + 1, scene, mats.teak, mats.gold, GARDEN.h)
  createPillar('garden-pillar-SW', GARDEN.x1 + 1, GARDEN.z2 - 1, scene, mats.teak, mats.gold, GARDEN.h)

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

export function createCastle(scene: Scene, mats: SceneMaterials): CastleGeometry {
  scene.collisionsEnabled = true

  const reception = createReception(scene, mats)
  const mainHall = createMainHall(scene, mats)
  const courtyard = createCourtyard(scene, mats)
  const garden = createGarden(scene, mats)

  createSkybox(scene)

  return {
    grounds: [reception.ground, mainHall.ground, courtyard.ground, garden.ground],
    allWalls: [...reception.walls, ...mainHall.walls, ...courtyard.walls, ...garden.walls],
  }
}
