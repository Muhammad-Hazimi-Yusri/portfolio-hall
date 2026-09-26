import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Color3 } from '@babylonjs/core/Maths/math.color'

/** Fixed picture lights, baked onto the wall once. No extra draw or light per
 * exhibit, and the artwork itself retains its original colours. */
export function bakeGalleryWallLight(scene: Scene, wall: Mesh, material: StandardMaterial, lightPositions: readonly number[]) {
  const width = 1024, height = 256
  const texture = new DynamicTexture('gallery-wall-light', { width, height }, scene, true)
  texture.wrapU = texture.wrapV = Texture.CLAMP_ADDRESSMODE
  texture.coordinatesIndex = 1
  texture.anisotropicFilteringLevel = 4
  const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
  const image = ctx.createImageData(width, height)
  const distance = Array.from({ length: width }, (_, x) => Math.max(0, Math.min(...lightPositions.map(z => Math.abs(z - (8 + (x + .5) / width * 50)))) - .45))
  for (let y = 0; y < height; y++) {
    const wallY = 4.34 - (y + .5) / height * 4.2
    const drop = 3.31 - wallY
    const spread = .39 + Math.max(0, drop) * .44
    const falloff = drop > 0 ? (1 - Math.exp(-drop * 9)) * Math.exp(-drop / 1.5) : 0
    for (let x = 0; x < width; x++) {
      const strength = falloff * Math.exp(-Math.pow(distance[x] / spread, 2) * 1.8)
      const i = (y * width + x) * 4
      image.data[i] = 76 * strength
      image.data[i + 1] = 61 * strength
      image.data[i + 2] = 42 * strength
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0); texture.update()
  const positions = wall.getVerticesData(VertexBuffer.PositionKind)!
  const normals = wall.getVerticesData(VertexBuffer.NormalKind)!
  const uv: number[] = []
  for (let i = 0; i < positions.length; i += 3) {
    if (normals[i] > .5) uv.push((positions[i + 2] + wall.position.z - 8) / 50, (positions[i + 1] + wall.position.y - .14) / 4.2)
    else uv.push(0, 1) // The exterior and wall ends receive no picture light.
  }
  wall.setVerticesData(VertexBuffer.UV2Kind, uv)
  material.lightmapTexture = texture
}

/** A narrow contact shadow where each mounted frame meets the wall. One
 * shared texture and one merged draw, independent of real-time light count. */
export function createFrameContactShadows(scene: Scene, framePositions: readonly number[]) {
  const texture = new DynamicTexture('gallery-frame-contact', { width: 256, height: 256 }, scene, true)
  const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
  const image = ctx.createImageData(256, 256)
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const across = Math.abs((x + .5) / 256 - .5) * 3.36
    const wallY = 3.12 - (y + .5) / 256 * 2.98
    const frameX = Math.max(0, across - 1.45), frameY = Math.max(0, Math.abs(wallY - 1.88) - .97)
    const labelX = Math.max(0, across - 1.15), labelY = Math.max(0, Math.abs(wallY - .59) - .18)
    const frame = 82 * Math.exp(-(frameX * frameX + frameY * frameY) / .007)
    const label = 58 * Math.exp(-(labelX * labelX + labelY * labelY) / .003)
    image.data[(y * 256 + x) * 4 + 3] = Math.max(frame, label)
  }
  ctx.putImageData(image, 0, 0); texture.hasAlpha = true; texture.update()
  const mat = new StandardMaterial('gallery-frame-contact', scene)
  mat.disableLighting = true; mat.diffuseTexture = texture
  mat.emissiveColor = Color3.Black(); mat.useAlphaFromDiffuseTexture = true
  const pieces = framePositions.map((z, index) => {
    const plane = MeshBuilder.CreatePlane(`gallery-frame-contact-${index}`, { width: 3.36, height: 2.98 }, scene)
    plane.position.set(-4.842, 1.63, z + .025); plane.rotation.y = -Math.PI / 2
    plane.material = mat
    return plane
  })
  const shadows = Mesh.MergeMeshes(pieces, true, true)!
  shadows.name = 'gallery-frame-contacts'; shadows.isPickable = false; shadows.freezeWorldMatrix()
  return shadows
}
