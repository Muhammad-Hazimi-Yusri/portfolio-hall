import { Scene } from '@babylonjs/core/scene'
import { Matrix, Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { WaterMaterial } from '@babylonjs/materials/water'
import { hallDecks, galleryColumns } from '@/data/hallLayout'
import { pois } from '@/data/pois'
import type { SceneMaterials } from './materials'
import { mapSurfaceInMetres, mapTimberInMetres, surfaceMap } from './materials'
import { createArchitecturalPlanting } from './architecturalPlanting'
import { createSky } from './sky'
import { createDistantShore } from './landscape'
import { bakeGalleryWallLight, createFrameContactShadows } from './galleryLighting'
import '@babylonjs/core/Collisions/collisionCoordinator'

function createWater(scene: Scene, reflections: Mesh[]) {
  const water = MeshBuilder.CreateGround('water', { width: 1400, height: 1400, subdivisions: 1 }, scene)
  water.position.set(0, -0.26, 40); water.isPickable = false
  const mat = new WaterMaterial('waterMat', scene, new Vector2(512, 512))
  const bump = new DynamicTexture('water-ripples', { width: 256, height: 256 }, scene, true)
  bump.wrapU = bump.wrapV = Texture.WRAP_ADDRESSMODE
  const ctx = bump.getContext() as unknown as CanvasRenderingContext2D
  // Periodic normal field, so the ripple texture tiles without seams.
  const data = ctx.createImageData(256, 256)
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const i = (y * 256 + x) * 4
    data.data[i] = 128 + 9 * Math.sin(x * Math.PI / 32 + 2 * Math.sin(y * Math.PI / 128))
    data.data[i + 1] = 128 + 7 * Math.cos(y * Math.PI / 32 + 2 * Math.sin(x * Math.PI / 128))
    data.data[i + 2] = 254; data.data[i + 3] = 255
  }
  ctx.putImageData(data, 0, 0); bump.update()
  mat.bumpTexture = bump; mat.windForce = 0; mat.waveHeight = 0
  mat.waveLength = 0.01; mat.bumpHeight = 0.08
  mat.waterColor = Color3.FromHexString('#3b626a')
  mat.waterColor2 = Color3.FromHexString('#7b9292')
  mat.colorBlendFactor = 0.4; mat.colorBlendFactor2 = 0.5
  mat.specularColor = new Color3(0.45, 0.42, 0.35)
  mat.disableClipPlane = false
  reflections.forEach(mesh => mat.addToRenderList(mesh))
  // The water and reflected architecture are still. Refresh only when the view
  // changes, including resize and XR eye changes, rather than two extra passes
  // for every logo animation frame.
  mat.enableRenderTargets(false)
  const lastView = Matrix.Zero(), lastProjection = Matrix.Zero()
  let refreshed = -Infinity
  scene.onBeforeRenderObservable.add(() => {
    const camera = scene.activeCamera
    if (!camera || scene.metadata?.profileWaterDisabled) return
    if (camera.rigCameras.length) {
      mat.enableRenderTargets(true)
      return
    }
    if (mat.renderTargetsEnabled) mat.enableRenderTargets(false)
    const view = camera.getViewMatrix(), projection = camera.getProjectionMatrix()
    const materialsChanged = Boolean(scene.metadata?.waterReflectionsDirty)
    if (materialsChanged || !view.equals(lastView) || !projection.equals(lastProjection)) {
      const now = performance.now()
      // Browse scrolling leaves time for the document compositor. The water
      // is a secondary, still reflection; the main camera keeps full rate.
      if (!materialsChanged && projection.equals(lastProjection) && now - refreshed < (scene.metadata?.waterRefreshMs ?? 0)) return
      refreshed = now
      if (scene.metadata) scene.metadata.waterReflectionsDirty = false
      lastView.copyFrom(view); lastProjection.copyFrom(projection)
      mat.reflectionTexture?.resetRefreshCounter()
      mat.refractionTexture?.resetRefreshCounter()
    }
  })
  water.material = mat
}

export type EnvironmentGeometry = { grounds: Mesh[]; allWalls: Mesh[]; shadowCasters: Mesh[] }
export type CastleGeometry = EnvironmentGeometry

export function createEnvironment(scene: Scene, mats: SceneMaterials): EnvironmentGeometry {
  scene.collisionsEnabled = true
  scene.clearColor = new Color4(0.65, 0.71, 0.72, 1)
  scene.fogMode = Scene.FOGMODE_LINEAR
  scene.fogColor = Color3.FromHexString('#bec9c8'); scene.fogStart = 105; scene.fogEnd = 480
  const detail: Mesh[] = []
  const allWalls: Mesh[] = []
  const box = (name: string, x: number, y: number, z: number, width: number, height: number, depth: number, material: StandardMaterial) => {
    const mesh = MeshBuilder.CreateBox(name, { width, height, depth }, scene)
    mesh.position.set(x, y, z); mesh.material = material; mesh.isPickable = false
    if (material === mats.teak) mapTimberInMetres(mesh, width, height, depth)
    mesh.receiveShadows = true; detail.push(mesh)
    return mesh
  }
  const cylinder = (name: string, x: number, y: number, z: number, diameter: number, height: number, material: StandardMaterial) => {
    const mesh = MeshBuilder.CreateCylinder(name, { diameter, height, tessellation: 32 }, scene)
    mesh.position.set(x, y, z); mesh.material = material; mesh.isPickable = false
    mesh.receiveShadows = true; detail.push(mesh)
    return mesh
  }
  const tube = (name: string, path: Vector3[], radius: number, material: StandardMaterial) => {
    const mesh = MeshBuilder.CreateTube(name, { path, radius, tessellation: 8 }, scene)
    mesh.material = material; mesh.isPickable = false; detail.push(mesh)
    return mesh
  }

  const grounds = hallDecks.map(deck => {
    const mesh = deck.round
      ? MeshBuilder.CreateCylinder(deck.id, { diameter: deck.width, height: 0.3, tessellation: 64 }, scene)
      : MeshBuilder.CreateBox(deck.id, { width: deck.width, depth: deck.depth, height: 0.3 }, scene)
    // Timber sits just below stone so overlapping bridge joints never flicker.
    mesh.position.set(deck.x, deck.timber ? -0.035 : 0, deck.z); mesh.material = deck.timber ? mats.decking : mats.floor
    mapSurfaceInMetres(mesh, deck.timber ? 1.28 : 2.4, deck.timber ? 4 : 2.4)
    mesh.checkCollisions = true; mesh.receiveShadows = true
    // Recessed dark foundation gives the deck an actual edge over the water.
    if (deck.round) cylinder(`${deck.id}-footing`, deck.x, -0.19, deck.z, deck.width - 0.12, 0.2, mats.stone)
    else box(`${deck.id}-footing`, deck.x, -0.19, deck.z, deck.width - 0.12, 0.2, deck.depth - 0.12, mats.stone)
    return mesh
  })

  // A colonnade gives the gallery rhythm. Its water-facing side stays open.
  const wall = box('galleryWall', -5, 2.24, 33, 0.3, 4.2, 50, mats.wall)
  mapSurfaceInMetres(wall, 1.6)
  wall.checkCollisions = true; allWalls.push(wall)
  box('gallery-skirt', -4.81, 0.32, 33, 0.1, 0.3, 50, mats.stone)
  box('gallery-coping', -5, 4.39, 33, 0.46, 0.12, 50.3, mats.ceiling)
  box('water-side-beam', 4.65, 4.28, 33, 0.3, 0.36, 51.4, mats.teak)
  box('wall-side-beam', -4.65, 4.28, 33, 0.3, 0.36, 51.4, mats.teak)
  box('ridge-beam', 0, 5.8, 33, 0.28, 0.32, 53, mats.teak)
  const exhibits = pois.filter(poi => poi.type === 'painting')
  bakeGalleryWallLight(scene, wall, mats.wall, exhibits.map(poi => poi.position.z))
  createFrameContactShadows(scene, exhibits.map(poi => poi.position.z))
  for (const [i, z] of galleryColumns(exhibits.map(poi => poi.position.z)).entries()) {
    for (const x of [-4.65, 4.65]) {
      box(`column-${i}-${x}`, x, 2.23, z, 0.32, 4.16, 0.32, mats.teak)
      box(`column-shoe-${i}-${x}`, x, 0.32, z, 0.36, 0.34, 0.36, mats.gold)
      // Visible bearing blocks make the beam/column joint read as construction.
      box(`column-cap-${i}-${x}`, x, 4.12, z, 0.48, 0.17, 0.55, mats.teak)
      const brace = box(`column-brace-${i}-${x}`, x - Math.sign(x) * 0.38, 3.88, z, 1.1, 0.12, 0.16, mats.teak)
      brace.rotation.z = Math.sign(x) * 0.6
    }
    for (const side of [-1, 1]) {
      const rafter = box(`rafter-${i}-${side}`, side * 2.42, 5.05, z, 5.7, 0.2, 0.24, mats.teak)
      rafter.rotation.z = -side * 0.31
    }
  }
  // A complete pitched roof makes this a place one can enter, with a deep
  // overhang, standing seams and a timber-lined ceiling visible from inside.
  for (const [start, end] of [[6.5, 23], [25, 41], [43, 59.5]]) for (const side of [-1, 1]) {
    const middle = (start + end) / 2, length = end - start
    const roof = box(`gallery-roof-${start}-${side}`, side * 2.56, 5.2, middle, 5.95, 0.13, length, mats.ceiling)
    roof.rotation.z = -side * 0.31
    const soffit = box(`gallery-roof-lining-${start}-${side}`, side * 2.56, 5.105, middle, 5.91, 0.035, length - 0.1, mats.teak)
    soffit.rotation.z = -side * 0.31
    for (const z of [start - 0.02, end + 0.02]) {
      const fascia = box(`roof-fascia-${side}-${z}`, side * 2.56, 5.16, z, 6, 0.26, 0.11, mats.teak)
      fascia.rotation.z = -side * 0.31
    }
    for (let z = start + 0.3; z < end; z += 0.85) {
      const seam = box(`roof-seam-${side}-${z}`, side * 2.56, 5.29, z, 5.92, 0.035, 0.022, mats.ceiling)
      seam.rotation.z = -side * 0.31
    }
    for (let x = 0.5; x < 4.5; x += 0.75) {
      box(`ceiling-purlin-${start}-${side}-${x}`, side * x, 5.82 - x * 0.32, middle, 0.07, 0.1, length - 0.2, mats.teak)
    }
  }
  // End screens and exposed joinery give the entrance a recognisable profile.
  for (const z of [7.7, 58.3]) {
    box(`gable-tie-${z}`, 0, 4.3, z, 9.55, 0.22, 0.26, mats.teak)
    for (let x = -4.3; x <= 4.3; x += 0.3) {
      const height = 1.42 - Math.abs(x) * 0.31
      box(`gable-screen-${z}-${x}`, x, 4.44 + height / 2, z, 0.055, height, 0.08, mats.teak)
    }
  }
  // Narrow recessed pilasters separate the work without competing with it.
  for (let i = 1; i < exhibits.length; i++) {
    const z = (exhibits[i - 1].position.z + exhibits[i].position.z) / 2
    box(`wall-pilaster-${i}`, -4.79, 2.36, z, 0.1, 3.9, 0.06, mats.teak)
  }
  for (const poi of exhibits) {
    for (const offset of [-0.47, 0.47]) {
      box(`${poi.id}-light-arm-${offset}`, -4.65, 3.38, poi.position.z + offset, 0.4, 0.035, 0.035, mats.gold)
    }
    box(`${poi.id}-picture-light`, -4.43, 3.35, poi.position.z, 0.14, 0.08, 1.35, mats.gold)
    box(`${poi.id}-light-diffuser`, -4.43, 3.305, poi.position.z, 0.09, 0.012, 1.2, mats.lamp)
  }
  // A thin wall reveal and paving border establish a human scale without
  // adding a repeating field of props or extra lights.
  box('gallery-wall-reveal', -4.83, 0.65, 33, 0.025, 0.025, 50, mats.gold)
  for (const x of [-4.48, 4.48]) box(`floor-border-${x}`, x, 0.153, 33, 0.026, 0.004, 49.6, mats.gold)
  // Low kerbs, slim bronze rails and seated planting keep circulation legible.
  for (const x of [-2.45, 2.45]) {
    box(`arrival-bridge-edge-${x}`, x, 0.22, 6, 0.08, 0.13, 5, mats.gold)
  }
  box('gallery-water-kerb', 4.85, 0.25, 33, 0.15, 0.2, 50, mats.stone)
  tube('gallery-handrail', [new Vector3(4.86, 1.15, 8), new Vector3(4.86, 1.15, 58)], 0.025, mats.gold)
  for (let z = 8; z <= 58; z += 2.5) box(`rail-post-${z}`, 4.86, 0.65, z, 0.035, 1, 0.035, mats.gold)

  const bench = (x: number, z: number) => {
    for (const end of [-1, 1]) box(`bench-foot-${x}-${z}-${end}`, x, 0.38, z + end, 0.64, 0.46, 0.19, mats.stone)
    box(`bench-seat-${x}-${z}`, x, 0.65, z, 0.7, 0.12, 2.7, mats.teak)
  }
  for (const z of [24, 43]) bench(3.65, z)
  bench(-4.8, 70.5); bench(4.8, 70.5)

  for (const side of [-1, 1]) {
    const path: Vector3[] = []
    for (let i = 0; i <= 24; i++) {
      const angle = -1.05 + (i / 24) * 2.1
      path.push(new Vector3(side * Math.cos(angle) * 6.82, 1.05, 68 + Math.sin(angle) * 6.82))
    }
    tube(`terrace-rail-${side}`, path, 0.025, mats.gold)
    for (let i = 0; i < path.length; i += 4) box(`terrace-post-${side}-${i}`, path[i].x, 0.59, path[i].z, 0.04, 0.88, 0.04, mats.gold)
    box(`horizon-kerb-${side}`, side * 1.95, 0.24, 79.3, 0.09, 0.18, 9, mats.stone)
    tube(`horizon-rail-${side}`, [new Vector3(side * 1.95, 1.02, 75), new Vector3(side * 1.95, 1.02, 83.7)], 0.025, mats.gold)
    for (let z = 76; z <= 84; z += 2) box(`horizon-post-${side}-${z}`, side * 1.95, 0.59, z, 0.035, 0.88, 0.035, mats.gold)
  }

  // Collision proxies are separate from the visual detail, which can be batched.
  for (const [name, x, z, width, depth] of [
    ['galleryRailRight', 5, 33, 0.2, 50], ['horizonRailLeft', -2, 79, 0.2, 8],
    ['horizonRailRight', 2, 79, 0.2, 8], ['horizonEnd', 0, 90.3, 7, 0.2],
  ] as const) {
    const rail = MeshBuilder.CreateBox(name, { width, height: 4, depth }, scene)
    rail.position.set(x, 2, z); rail.isVisible = false; rail.checkCollisions = true; rail.isPickable = false
    allWalls.push(rail)
  }

  const planting = createArchitecturalPlanting(scene, mats)
  detail.push(...planting.pieces); allWalls.push(...planting.colliders)

  // Batch static decorative geometry by material; the richer hall stays cheap to draw.
  const shadowCasters: Mesh[] = [wall]
  for (const material of Object.values(mats)) {
    const pieces = detail.filter(mesh => mesh.material === material && !mesh.checkCollisions)
    if (!pieces.length) continue
    const merged = Mesh.MergeMeshes(pieces, true, true, undefined, false, false)
    if (merged) { merged.name = `architecture-${material.name}`; merged.isPickable = false; merged.receiveShadows = true; merged.freezeWorldMatrix(); shadowCasters.push(merged) }
  }
  grounds.forEach(mesh => mesh.freezeWorldMatrix())
  wall.freezeWorldMatrix()
  const shores = createDistantShore(scene)
  surfaceMap(scene, 'rocky_terrain_diff_1k.jpg', texture => {
    const material = shores[0].material as StandardMaterial
    material.diffuseTexture = texture
    material.diffuseColor.setAll(2.2)
  })
  const sky = createSky(scene)
  createWater(scene, [...grounds, ...shadowCasters, ...shores, sky])
  return { grounds, allWalls, shadowCasters }
}
