import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'

export function createHall(scene: Scene) {
  scene.collisionsEnabled = true
  
  // Ground
  const ground = MeshBuilder.CreateGround('ground', { width: 16, height: 14 }, scene)
  const groundMat = new StandardMaterial('groundMat', scene)
  groundMat.diffuseColor = new Color3(0.15, 0.12, 0.1)
  ground.material = groundMat

  // Walls (4 sides)
  const wallMat = new StandardMaterial('wallMat', scene)
  wallMat.diffuseColor = new Color3(0.2, 0.18, 0.25)

  const wallHeight = 4
  const wallThickness = 0.3

  // North wall (back)
  const north = MeshBuilder.CreateBox('northWall', { width: 16, height: wallHeight, depth: wallThickness }, scene)
  north.position = new Vector3(0, wallHeight / 2, -7)
  north.material = wallMat

  // South wall (front, with door gap later)
  const south = MeshBuilder.CreateBox('southWall', { width: 16, height: wallHeight, depth: wallThickness }, scene)
  south.position = new Vector3(0, wallHeight / 2, 7)
  south.material = wallMat

  // East wall
  const east = MeshBuilder.CreateBox('eastWall', { width: wallThickness, height: wallHeight, depth: 14 }, scene)
  east.position = new Vector3(8, wallHeight / 2, 0)
  east.material = wallMat

  // West wall
  const west = MeshBuilder.CreateBox('westWall', { width: wallThickness, height: wallHeight, depth: 14 }, scene)
  west.position = new Vector3(-8, wallHeight / 2, 0)
  west.material = wallMat

  // Enable collisions
  ground.checkCollisions = true
  north.checkCollisions = true
  south.checkCollisions = true
  east.checkCollisions = true
  west.checkCollisions = true

  return { ground, walls: [north, south, east, west] }
}