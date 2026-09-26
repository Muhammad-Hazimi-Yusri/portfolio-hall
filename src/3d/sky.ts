import type { Scene } from '@babylonjs/core/scene'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { HDRCubeTexture } from '@babylonjs/core/Materials/Textures/hdrCubeTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { ImageProcessingConfiguration } from '@babylonjs/core/Materials/imageProcessingConfiguration'
import { Color3 } from '@babylonjs/core/Maths/math.color'

/** One static sky draw. The small panorama is loaded only with the 3D hall. */
export function createSky(scene: Scene) {
  const dome = MeshBuilder.CreateSphere('skyDome', { diameter: 2400, segments: 16 }, scene)
  const mat = new StandardMaterial('skyMat', scene)
  mat.disableLighting = true; mat.backFaceCulling = false; mat.fogEnabled = false
  const fallback = new DynamicTexture('sky-gradient', { width: 256, height: 128 }, scene)
  const ctx = fallback.getContext() as unknown as CanvasRenderingContext2D
  const gradient = ctx.createLinearGradient(0, 0, 0, 128)
  gradient.addColorStop(0, '#637e8d'); gradient.addColorStop(.42, '#abb7b6')
  gradient.addColorStop(.52, '#e3d2b9'); gradient.addColorStop(1, '#7c9699')
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 128); fallback.update()
  mat.emissiveTexture = fallback
  dome.material = mat; dome.infiniteDistance = true; dome.isPickable = false

  // No irradiance, prefiltering, post-process or extra render target. Gamma
  // space is required by StandardMaterial; tone mapping affects this sky only.
  const panorama = new HDRCubeTexture('/sky/kloppenheim_06_puresky_1k.hdr', scene, 256, false, false, true, false)
  panorama.isBlocking = false
  panorama.coordinatesMode = Texture.SKYBOX_MODE
  panorama.rotationY = 1.2
  const showPanorama = () => {
    if (scene.isDisposed || mat.reflectionTexture === panorama) return
    const processing = new ImageProcessingConfiguration()
    // Attach before changing settings so the already-rendered fallback's
    // shader receives the image-processing dirty notifications.
    mat.imageProcessingConfiguration = processing
    processing.toneMappingEnabled = true
    processing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES
    processing.exposure = .45
    mat.diffuseColor = Color3.Black(); mat.specularColor = Color3.Black()
    mat.emissiveTexture = null; mat.reflectionTexture = panorama
    fallback.dispose()
    scene.metadata.needsRender = true; scene.metadata.waterReflectionsDirty = true; scene.metadata.portalPreviewsDirty = true
    scene.executeWhenReady(() => {
      if (!scene.isDisposed) { scene.metadata.needsRender = true; scene.metadata.waterReflectionsDirty = true; scene.metadata.portalPreviewsDirty = true }
    })
  }
  panorama.onLoadObservable.addOnce(showPanorama)
  if (panorama.isReady()) showPanorama()
  return dome
}
