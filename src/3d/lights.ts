import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { POI } from '@/types/poi'
import type { CastleGeometry } from './scene'

export type LightsResult = ReturnType<typeof createLights>

// Side-effect for shadow rendering
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent'

export function createLights(
  scene: Scene,
  environment: CastleGeometry,
  poiMeshes?: Map<string, { mesh: Mesh; poi: POI }>,
) {
  // --- Ambient (sky) ---
  const ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene)
  ambient.intensity = 0.8
  ambient.diffuse = new Color3(0.95, 0.97, 1.0)
  ambient.groundColor = new Color3(0.65, 0.8, 0.9)
  ambient.specular = new Color3(0.2, 0.2, 0.2)

  scene.ambientColor = new Color3(0.85, 0.9, 0.95)

  // --- Directional (sun, with shadows) ---
  const sun = new DirectionalLight('sun', new Vector3(-0.3, -1, 0.5), scene)
  sun.position = new Vector3(10, 20, -10)
  sun.intensity = 0.6
  sun.diffuse = new Color3(1.0, 0.97, 0.92)
  sun.specular = new Color3(0.5, 0.5, 0.5)

  const sunShadowGen = new ShadowGenerator(2048, sun)
  sunShadowGen.useBlurExponentialShadowMap = true
  sunShadowGen.blurKernel = 32
  sunShadowGen.setDarkness(0.4)

  // All grounds receive shadows
  for (const ground of environment.grounds) {
    ground.receiveShadows = true
  }

  // Add POI meshes as shadow casters
  if (poiMeshes) {
    poiMeshes.forEach(({ mesh }) => {
      sunShadowGen.addShadowCaster(mesh, true)
    })
  }

  // --- Point fill (center of gallery) ---
  const fill = new PointLight('fill', new Vector3(0, 3, 33), scene)
  fill.diffuse = new Color3(0.9, 0.95, 1.0)
  fill.intensity = 0.3
  fill.range = 40

  // Backward-compat: alias indoorShadowGen to sunShadowGen
  const indoorShadowGen = sunShadowGen

  return {
    ambient,
    sun,
    indoor: sun,
    sunShadowGen,
    indoorShadowGen,
    spots: [] as PointLight[],
  }
}

/**
 * Apply or restore VR-optimised lighting settings.
 * In VR: shadow blur reduced, ambient boosted.
 */
export function applyVRLighting(lights: LightsResult, vrMode: boolean): void {
  if (vrMode) {
    lights.sunShadowGen.blurKernel = 16
    lights.ambient.intensity = 0.95
  } else {
    lights.sunShadowGen.blurKernel = 32
    lights.ambient.intensity = 0.8
  }
}
