import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { PointLight } from '@babylonjs/core/Lights/pointLight'
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator'
import { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture'
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
  ambient.intensity = 0.62
  ambient.diffuse = new Color3(0.77, 0.85, 0.94)
  ambient.groundColor = new Color3(0.31, 0.26, 0.2)
  ambient.specular = new Color3(0.2, 0.2, 0.2)

  scene.ambientColor = new Color3(0.06, 0.07, 0.085)

  // --- Directional (sun, with shadows) ---
  const sun = new DirectionalLight('sun', new Vector3(-0.85, -0.58, 0.3), scene)
  sun.position = new Vector3(55, 38, 0)
  sun.intensity = 1.12
  sun.diffuse = new Color3(1.0, 0.94, 0.82)
  sun.specular = new Color3(0.5, 0.5, 0.5)
  sun.autoUpdateExtends = false
  sun.shadowMinZ = 0.1
  sun.shadowMaxZ = 180

  const sunShadowGen = new ShadowGenerator(2048, sun)
  sunShadowGen.usePercentageCloserFiltering = true
  sunShadowGen.filteringQuality = ShadowGenerator.QUALITY_MEDIUM
  sunShadowGen.blurKernel = 16
  sunShadowGen.bias = 0.0008
  sunShadowGen.normalBias = 0.025
  sunShadowGen.setDarkness(0.12)
  environment.shadowCasters.forEach(mesh => sunShadowGen.addShadowCaster(mesh))

  // All grounds receive shadows
  for (const ground of environment.grounds) {
    ground.receiveShadows = true
  }

  // Architecture and plinths are static. Floating logos and billboard labels
  // deliberately stay out of this cache, so they cannot leave frozen shadows.
  if (poiMeshes) {
    poiMeshes.forEach(({ mesh, poi }) => {
      if (poi.type === 'painting') {
        // Only the opaque frame backing casts onto the wall. Image and label
        // planes remain colour-faithful and cannot enter this static cache.
        mesh.getChildMeshes().filter(child => child.name === `${poi.id}-backing`)
          .forEach(child => sunShadowGen.addShadowCaster(child, false))
        return
      }
      mesh.getChildMeshes().filter(child => /-(base|col|top|stand|foot|leg-[^/]+)$/.test(child.name))
        .forEach(child => sunShadowGen.addShadowCaster(child, false))
    })
  }
  sunShadowGen.getShadowMap()!.refreshRate = RenderTargetTexture.REFRESHRATE_RENDER_ONCE

  // --- Point fill (center of gallery) ---
  const fill = new PointLight('fill', new Vector3(0, 3, 33), scene)
  fill.diffuse = new Color3(1.0, 0.83, 0.62)
  fill.intensity = 0.22
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
    lights.sunShadowGen.blurKernel = 16
    lights.ambient.intensity = 0.62
  }
}
