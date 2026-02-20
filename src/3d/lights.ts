import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { POI } from '@/types/poi'

// Side-effect for shadow rendering
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'

export function createLights(
  scene: Scene,
  ground: Mesh,
  poiMeshes: Map<string, { mesh: Mesh; poi: POI }>,
) {
  // --- Ambient ---
  const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.3
  ambient.diffuse = new Color3(0.9, 0.85, 0.75)
  ambient.groundColor = new Color3(0.16, 0.12, 0.09) // hall-surface
  ambient.specular = new Color3(0, 0, 0)

  // --- Main directional light (with shadows) ---
  const main = new DirectionalLight('main', new Vector3(0.2, -1, 0.3), scene)
  main.position = new Vector3(-2, 4, -2) // position for shadow origin
  main.intensity = 0.6
  main.diffuse = new Color3(1, 0.95, 0.85)
  main.specular = new Color3(0.8, 0.75, 0.7)

  const shadowGen = new ShadowGenerator(1024, main)
  shadowGen.useBlurExponentialShadowMap = true
  shadowGen.blurScale = 2
  shadowGen.setDarkness(0.4)

  ground.receiveShadows = true

  // Add POI meshes as shadow casters
  poiMeshes.forEach(({ mesh }) => {
    shadowGen.addShadowCaster(mesh, true)
  })

  // --- Painting spotlights ---
  poiMeshes.forEach(({ mesh, poi }) => {
    if (poi.type !== 'painting') return

    const rad = (poi.rotation * Math.PI) / 180
    // Offset light toward the viewer side of the painting
    const offsetZ = Math.cos(rad) * 0.5
    const offsetX = -Math.sin(rad) * 0.5

    const lightPos = new Vector3(
      poi.position.x + offsetX,
      3.2,
      poi.position.z + offsetZ,
    )

    // Direction: down toward painting
    const dir = new Vector3(-offsetX * 0.3, -1, -offsetZ * 0.3).normalize()

    const spot = new SpotLight(
      `${poi.id}-spot`,
      lightPos,
      dir,
      Math.PI / 4,
      2,
      scene,
    )
    spot.intensity = 0.8
    spot.diffuse = new Color3(1, 0.98, 0.9)
    spot.specular = new Color3(0.5, 0.5, 0.5)

    // Let painting shadows cast on nearby surfaces
    mesh.getChildMeshes().forEach((child) => {
      if (child instanceof Mesh) {
        shadowGen.addShadowCaster(child)
      }
    })
  })

  // --- Accent lights for display cases & pedestals ---
  poiMeshes.forEach(({ poi }) => {
    if (poi.type === 'painting') return

    const accent = new PointLight(
      `${poi.id}-accent`,
      new Vector3(poi.position.x, 1.5, poi.position.z),
      scene,
    )
    accent.intensity = 0.3
    accent.diffuse = new Color3(0.79, 0.66, 0.30) // gold glow
    accent.specular = new Color3(0.3, 0.25, 0.1)
    accent.range = 3
  })

  return { ambient, main, shadowGen }
}
