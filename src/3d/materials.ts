import { Scene } from '@babylonjs/core/scene'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import type { Mesh } from '@babylonjs/core/Meshes/mesh'

function surface(scene: Scene, name: string, colour: string, specular = 0.08) {
  const mat = new StandardMaterial(name, scene)
  mat.diffuseColor = Color3.FromHexString(colour)
  mat.specularColor = new Color3(specular, specular, specular)
  mat.specularPower = 64
  return mat
}

/** Keep the plain material usable while images arrive, then wake the cached view. */
export function surfaceMap(scene: Scene, file: string, apply: (texture: Texture) => void) {
  const texture = new Texture(`${import.meta.env.BASE_URL}materials/${file}`, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE)
  texture.wrapU = texture.wrapV = Texture.WRAP_ADDRESSMODE
  texture.anisotropicFilteringLevel = 4
  const ready = () => {
    if (scene.isDisposed) return
    apply(texture)
    scene.metadata ??= {}
    scene.metadata.needsRender = true
    scene.metadata.waterReflectionsDirty = true
    scene.metadata.portalPreviewsDirty = true
  }
  if (texture.isReady()) ready()
  else texture.onLoadObservable.addOnce(ready)
}

export function createTeakMat(scene: Scene): StandardMaterial {
  const mat = surface(scene, 'teakMat', '#71543b', 0.09)
  surfaceMap(scene, 'fine_grained_wood_col_1k.jpg', texture => {
    mat.diffuseTexture = texture
    mat.diffuseColor = Color3.FromHexString('#fff2df')
  })
  return mat
}

export const createGoldMat = (scene: Scene) => surface(scene, 'bronzeMat', '#73604a', 0.28)
export function createWallMat(scene: Scene) {
  const mat = surface(scene, 'plasterMat', '#d8cbb5', 0.02)
  const texture = new DynamicTexture('limewash-grain', 256, scene, true)
  const normal = new DynamicTexture('limewash-normal', 256, scene, true)
  texture.wrapU = texture.wrapV = normal.wrapU = normal.wrapV = Texture.WRAP_ADDRESSMODE
  const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
  const normalContext = normal.getContext() as unknown as CanvasRenderingContext2D
  const colour = ctx.createImageData(256, 256), bump = normalContext.createImageData(256, 256)
  const height = new Float32Array(256 * 256)
  let random = 91237
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0
    height[y * 256 + x] = random / 0xffffffff * 4 + 2 * Math.sin(x * Math.PI / 32) * Math.cos(y * Math.PI / 64)
  }
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const i = (y * 256 + x) * 4, grain = height[y * 256 + x] - 2
    colour.data[i] = 244 + grain; colour.data[i + 1] = 241 + grain
    colour.data[i + 2] = 235 + grain; colour.data[i + 3] = 255
    bump.data[i] = 128 + (height[y * 256 + (x + 1) % 256] - height[y * 256 + x]) * 2
    bump.data[i + 1] = 128 + (height[((y + 1) % 256) * 256 + x] - height[y * 256 + x]) * 2
    bump.data[i + 2] = 254; bump.data[i + 3] = 255
  }
  ctx.putImageData(colour, 0, 0); normalContext.putImageData(bump, 0, 0)
  texture.update(); normal.update(); normal.level = .35
  mat.diffuseTexture = texture; mat.bumpTexture = normal
  return mat
}

/** Axis-aligned platforms and walls repeat in metres, regardless of their size. */
export function mapSurfaceInMetres(mesh: Mesh, repeatX: number, repeatZ = repeatX) {
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind)!, normals = mesh.getVerticesData(VertexBuffer.NormalKind)!
  const uv: number[] = []
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] + mesh.position.x, y = positions[i + 1] + mesh.position.y, z = positions[i + 2] + mesh.position.z
    if (Math.abs(normals[i + 1]) > .5) uv.push(x / repeatX, z / repeatZ)
    else if (Math.abs(normals[i]) > .5) uv.push(z / repeatX, y / repeatZ)
    else uv.push(x / repeatX, y / repeatZ)
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uv)
}

/** Follow each piece's long axis before rotation/merging; never stretch one
 * swatch across an entire beam. The source grain runs along texture V. */
export function mapTimberInMetres(mesh: Mesh, width: number, height: number, depth: number) {
  const sizes = [width, height, depth]
  const grainAxis = sizes.indexOf(Math.max(...sizes))
  const positions = mesh.getVerticesData(VertexBuffer.PositionKind)!, normals = mesh.getVerticesData(VertexBuffer.NormalKind)!
  const uv: number[] = []
  const offset = (mesh.position.x * .17 + mesh.position.y * .31 + mesh.position.z * .23) % 1
  for (let i = 0; i < positions.length; i += 3) {
    const faceAxis = Math.abs(normals[i]) > .5 ? 0 : Math.abs(normals[i + 1]) > .5 ? 1 : 2
    const along = faceAxis === grainAxis ? (grainAxis + 1) % 3 : grainAxis
    const across = 3 - faceAxis - along
    uv.push(positions[i + across] / .6 + offset, positions[i + along] / .6 + offset * .37)
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uv)
}

function createDeckingMat(scene: Scene) {
  const mat = surface(scene, 'deckingMat', '#b09a7c', .055)
  const texture = new DynamicTexture('deck-boards', 512, scene, true), ctx = texture.getContext()
  texture.wrapU = texture.wrapV = Texture.WRAP_ADDRESSMODE
  ctx.fillStyle = '#b69a79'; ctx.fillRect(0, 0, 512, 512)
  for (let board = 0; board < 8; board++) {
    const x = board * 64
    ctx.fillStyle = `rgba(57,39,24,${.018 + (board * 7 % 5) * .012})`; ctx.fillRect(x, 0, 64, 512)
    ctx.fillStyle = '#695943'; ctx.fillRect(x, 0, 1.4, 512)
    ctx.fillStyle = '#d2b798'; ctx.fillRect(x + 2, 0, 1, 512)
    const end = (board % 3) * 170
    ctx.fillStyle = '#79684f'; ctx.fillRect(x + 2, end, 60, 1)
    for (let grain = 5; grain < 62; grain += 2) {
      ctx.strokeStyle = grain % 3 ? '#49382013' : '#fff6e21c'; ctx.lineWidth = .65; ctx.beginPath()
      for (let y = 0; y <= 512; y += 8) {
        const px = x + grain + Math.sin(y / 43 + board * 7 + grain * .1) * 1.15
        if (!y) ctx.moveTo(px, y); else ctx.lineTo(px, y)
      }
      ctx.stroke()
    }
    ctx.fillStyle = '#574c40'
    for (const inset of [10, 54]) for (const y of [end + 5, (end + 507) % 512]) { ctx.beginPath(); ctx.arc(x + inset, y, .9, 0, Math.PI * 2); ctx.fill() }
  }
  texture.update(); mat.diffuseTexture = texture
  return mat
}

export function createFloorMat(scene: Scene): StandardMaterial {
  const mat = surface(scene, 'stoneTileMat', '#cec3ae', 0.055)
  surfaceMap(scene, 'floor_tiles_02_diff_1k.jpg', texture => {
    mat.diffuseTexture = texture
    mat.diffuseColor = Color3.FromHexString('#fff9ed')
  })
  return mat
}

export const createStoneMat = (scene: Scene) => surface(scene, 'stoneMat', '#716d62', 0.04)
export function createGlassMat(scene: Scene): StandardMaterial {
  const mat = surface(scene, 'glassMat', '#a6cccf', 0.35)
  mat.alpha = 0.16; mat.backFaceCulling = false; mat.specularPower = 128
  return mat
}
export const createGrassFloorMat = (scene: Scene) => surface(scene, 'plantMat', '#496b57')
export const createCeilingMat = (scene: Scene) => surface(scene, 'ceilingMat', '#303f40', 0.16)

function createLampMat(scene: Scene) {
  const mat = surface(scene, 'pictureLightDiffuser', '#000000', 0)
  mat.disableLighting = true
  mat.emissiveColor = Color3.FromHexString('#f1dcb1')
  return mat
}

export type SceneMaterials = {
  teak: StandardMaterial
  gold: StandardMaterial
  wall: StandardMaterial
  floor: StandardMaterial
  stone: StandardMaterial
  glass: StandardMaterial
  grassFloor: StandardMaterial
  ceiling: StandardMaterial
  decking: StandardMaterial
  clay: StandardMaterial
  lamp: StandardMaterial
}

export function createSceneMaterials(scene: Scene): SceneMaterials {
  const wall = createWallMat(scene)
  const clay = surface(scene, 'planterClay', '#a88369', .025)
  clay.diffuseTexture = wall.diffuseTexture
  return {
    teak: createTeakMat(scene), gold: createGoldMat(scene), wall,
    floor: createFloorMat(scene), stone: createStoneMat(scene), glass: createGlassMat(scene),
    grassFloor: createGrassFloorMat(scene), ceiling: createCeilingMat(scene),
    decking: createDeckingMat(scene), clay, lamp: createLampMat(scene),
  }
}
