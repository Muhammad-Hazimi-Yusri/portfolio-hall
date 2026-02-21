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
import type { CastleGeometry } from './scene'

// Side-effect for shadow rendering
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'

export function createLights(
  scene: Scene,
  castle: CastleGeometry,
  poiMeshes: Map<string, { mesh: Mesh; poi: POI }>,
) {
  // --- Ambient ---
  const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.30
  ambient.diffuse = new Color3(0.9, 0.85, 0.75)
  ambient.groundColor = new Color3(0.16, 0.12, 0.09)
  ambient.specular = new Color3(0, 0, 0)

  // Warm gold ambient color for the whole scene
  scene.ambientColor = new Color3(0.22, 0.18, 0.12)

  // --- Sun light (outdoor, affects all zones) ---
  const sun = new DirectionalLight('sun', new Vector3(0.3, -1, 0.2), scene)
  sun.position = new Vector3(-5, 20, -5)
  sun.intensity = 0.8
  sun.diffuse = new Color3(1, 0.95, 0.85)
  sun.specular = new Color3(0.8, 0.75, 0.7)

  const sunShadowGen = new ShadowGenerator(2048, sun)
  sunShadowGen.useBlurExponentialShadowMap = true
  sunShadowGen.blurScale = 2
  sunShadowGen.setDarkness(0.4)

  // All grounds receive shadows
  for (const ground of castle.grounds) {
    ground.receiveShadows = true
  }

  // --- Indoor directional light (Reception + Main Hall only) ---
  const indoor = new DirectionalLight('indoor', new Vector3(0.2, -1, 0.3), scene)
  indoor.position = new Vector3(-2, 4, -2)
  indoor.intensity = 0.7
  indoor.diffuse = new Color3(1, 0.95, 0.85)
  indoor.specular = new Color3(0.8, 0.75, 0.7)

  const indoorShadowGen = new ShadowGenerator(1024, indoor)
  indoorShadowGen.useBlurExponentialShadowMap = true
  indoorShadowGen.blurScale = 2
  indoorShadowGen.setDarkness(0.4)

  // Add POI meshes as shadow casters to both generators
  poiMeshes.forEach(({ mesh }) => {
    sunShadowGen.addShadowCaster(mesh, true)
    indoorShadowGen.addShadowCaster(mesh, true)
  })

  // --- Painting spotlights ---
  poiMeshes.forEach(({ mesh, poi }) => {
    if (poi.type !== 'painting') return

    const rad = (poi.rotation * Math.PI) / 180
    const offsetZ = Math.cos(rad) * 0.5
    const offsetX = -Math.sin(rad) * 0.5

    const lightPos = new Vector3(
      poi.position.x + offsetX,
      3.2,
      poi.position.z + offsetZ,
    )

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

    mesh.getChildMeshes().forEach((child) => {
      if (child instanceof Mesh) {
        sunShadowGen.addShadowCaster(child)
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
    accent.diffuse = new Color3(0.79, 0.66, 0.30)
    accent.specular = new Color3(0.3, 0.25, 0.1)
    accent.range = 3
  })

  return { ambient, sun, indoor, sunShadowGen, indoorShadowGen }
}
