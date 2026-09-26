import type { Scene } from '@babylonjs/core/scene'
import type { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'

/** A baked, soft contact cue for static exhibits, with no extra shadow pass. */
export function contactShadow(scene: Scene, position: Vector3, width: number, depth: number, layer: number) {
  let material = scene.getMaterialByName('exhibit-contact-shadow') as StandardMaterial | null
  if (!material) {
    const texture = new DynamicTexture('exhibit-contact-shadow', 128, scene)
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
    const gradient = ctx.createRadialGradient(64, 64, 7, 64, 64, 64)
    gradient.addColorStop(0, '#0009'); gradient.addColorStop(.45, '#0005'); gradient.addColorStop(1, '#0000')
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128); texture.hasAlpha = true; texture.update()
    material = new StandardMaterial('exhibit-contact-shadow', scene)
    material.disableLighting = true; material.emissiveColor = Color3.Black(); material.diffuseTexture = texture
    material.useAlphaFromDiffuseTexture = true; material.fogEnabled = false; material.backFaceCulling = false
  }
  const shadow = MeshBuilder.CreatePlane('exhibit-contact-shadow', { width, height: depth }, scene)
  shadow.position.copyFrom(position); shadow.rotation.x = Math.PI / 2; shadow.material = material
  shadow.layerMask = layer; shadow.isPickable = false
  return shadow
}
