import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import type { POI } from '@/types/poi'

// Shared materials (created once per scene)
function createSharedMaterials(scene: Scene) {
  // Frame for paintings (light gray)
  const frame = new StandardMaterial('frameMat', scene)
  frame.diffuseColor = new Color3(0.92, 0.93, 0.95)
  frame.specularColor = new Color3(0.3, 0.3, 0.3)
  frame.specularPower = 96

  // Structural gray for bases/platforms
  const teak = new StandardMaterial('teakMat', scene)
  teak.diffuseColor = new Color3(0.85, 0.87, 0.90)
  teak.specularColor = new Color3(0.2, 0.2, 0.2)

  // Panel white for pedestal bodies
  const teakLight = new StandardMaterial('teakLightMat', scene)
  teakLight.diffuseColor = new Color3(0.95, 0.96, 0.97)
  teakLight.specularColor = new Color3(0.15, 0.15, 0.15)

  // Glass for display cases (frosted, cool tint)
  const glass = new StandardMaterial('glassMat', scene)
  glass.diffuseColor = new Color3(0.9, 0.95, 1.0)
  glass.specularColor = new Color3(0.6, 0.6, 0.6)
  glass.specularPower = 256
  glass.alpha = 0.2
  glass.backFaceCulling = false

  return { frame, teak, teakLight, glass }
}

type PaintingResult = {
  group: Mesh
  slideshowTarget?: { mesh: Mesh; images: string[] }
}

function createPaintingMesh(poi: POI, scene: Scene, mats: ReturnType<typeof createSharedMaterials>): PaintingResult {
  const rad = (poi.rotation * Math.PI) / 180
  const group = new Mesh(`${poi.id}-group`, scene)
  group.position = new Vector3(poi.position.x, 1.65, poi.position.z)
  group.rotation.y = rad

  // Canvas plane
  const canvas = MeshBuilder.CreatePlane(poi.id, { width: 1.5, height: 1, sideOrientation: Mesh.DOUBLESIDE }, scene)
  canvas.position.z = -0.05
  canvas.parent = group

  // Load thumbnail texture
  const canvasMat = new StandardMaterial(`${poi.id}-canvas-mat`, scene)
  canvasMat.specularColor = new Color3(0.02, 0.02, 0.02)
  canvasMat.emissiveColor = new Color3(0.03, 0.03, 0.03)

  if (poi.content.thumbnail) {
    const tex = new Texture(poi.content.thumbnail, scene, false, true)
    tex.uScale = -1
    canvasMat.diffuseTexture = tex
    tex.onLoadObservable.addOnce(() => {
      // texture loaded successfully
    })
    // Fallback if texture fails — check after a delay
    setTimeout(() => {
      if (!scene.isDisposed && !tex.isReady()) {
        applyFallbackTexture(canvasMat, poi.content.title, scene)
      }
    }, 5000)
  } else {
    applyFallbackTexture(canvasMat, poi.content.title, scene)
  }
  canvas.material = canvasMat

  // Frame bars (4 pieces)
  const fw = 1.5 // canvas width
  const fh = 1 // canvas height
  const t = 0.08 // frame thickness
  const d = 0.1 // frame depth

  const frameParts = [
    // Top
    { w: fw + 2 * t, h: t, dp: d, x: 0, y: fh / 2 + t / 2 },
    // Bottom
    { w: fw + 2 * t, h: t, dp: d, x: 0, y: -(fh / 2 + t / 2) },
    // Left
    { w: t, h: fh, dp: d, x: -(fw / 2 + t / 2), y: 0 },
    // Right
    { w: t, h: fh, dp: d, x: fw / 2 + t / 2, y: 0 },
  ]

  frameParts.forEach((fp, i) => {
    const bar = MeshBuilder.CreateBox(`${poi.id}-frame-${i}`, { width: fp.w, height: fp.h, depth: fp.dp }, scene)
    bar.position = new Vector3(fp.x, fp.y, -0.05)
    bar.parent = group
    bar.material = mats.frame
  })

  // Collision box for the whole painting
  group.checkCollisions = true

  // Return slideshow target if multiple thumbnails are available
  const thumbnails = poi.content.thumbnails
  const slideshowTarget = thumbnails && thumbnails.length >= 2
    ? { mesh: canvas, images: thumbnails }
    : undefined

  return { group, slideshowTarget }
}

export function applyFallbackTexture(mat: StandardMaterial, title: string, scene: Scene) {
  const fallback = new DynamicTexture(`fallback-${title}`, { width: 512, height: 340 }, scene)
  const ctx = fallback.getContext() as unknown as CanvasRenderingContext2D
  ctx.fillStyle = '#eaf3f8'
  ctx.fillRect(0, 0, 512, 340)
  ctx.strokeStyle = '#98bacb'
  ctx.strokeRect(24, 24, 464, 292)
  ctx.textAlign = 'left'
  ctx.fillStyle = '#416e84'
  ctx.font = '16px sans-serif'
  ctx.fillText('PROJECT NOTES', 44, 66)
  ctx.fillStyle = '#193f52'
  ctx.font = '500 34px sans-serif'
  let line = ''
  let y = 142
  for (const word of title.split(' ')) {
    const next = `${line} ${word}`.trim()
    if (ctx.measureText(next).width > 424 && line) {
      ctx.fillText(line, 44, y)
      y += 44
      line = word
    } else line = next
  }
  ctx.fillText(line, 44, y)
  ctx.fillStyle = '#416e84'
  ctx.font = '16px sans-serif'
  ctx.fillText('BALAIRUNG', 44, 286)
  fallback.update()
  fallback.uScale = -1
  fallback.uOffset = 1
  mat.diffuseTexture = fallback
}
function createDisplayCaseMesh(poi: POI, scene: Scene, mats: ReturnType<typeof createSharedMaterials>): Mesh {
  const rad = (poi.rotation * Math.PI) / 180
  const group = new Mesh(`${poi.id}-group`, scene)
  group.position = new Vector3(poi.position.x, 0, poi.position.z)
  group.rotation.y = rad

  // Base platform
  const base = MeshBuilder.CreateBox(`${poi.id}-base`, { width: 1.2, height: 0.15, depth: 1.2 }, scene)
  base.position.y = 0.075
  base.parent = group
  base.material = mats.teak
  base.checkCollisions = true

  // Gold trim ring at top of base
  const trim = MeshBuilder.CreateBox(`${poi.id}-trim`, { width: 1.22, height: 0.03, depth: 1.22 }, scene)
  trim.position.y = 0.165
  trim.parent = group
  trim.material = mats.frame

  // Glass case
  const glassCase = MeshBuilder.CreateBox(`${poi.id}-glass`, { width: 1.0, height: 0.8, depth: 1.0 }, scene)
  glassCase.position.y = 0.15 + 0.4
  glassCase.parent = group
  glassCase.material = mats.glass

  return group
}

function createPedestalMesh(poi: POI, scene: Scene, mats: ReturnType<typeof createSharedMaterials>): Mesh {
  const rad = (poi.rotation * Math.PI) / 180
  const group = new Mesh(`${poi.id}-group`, scene)
  group.position = new Vector3(poi.position.x, 0, poi.position.z)
  group.rotation.y = rad

  // Base (wider)
  const base = MeshBuilder.CreateCylinder(`${poi.id}-base`, {
    diameterTop: 0.7, diameterBottom: 0.8, height: 0.2, tessellation: 12,
  }, scene)
  base.position.y = 0.1
  base.parent = group
  base.material = mats.teakLight
  base.checkCollisions = true

  // Column
  const column = MeshBuilder.CreateCylinder(`${poi.id}-col`, {
    diameter: 0.5, height: 0.6, tessellation: 12,
  }, scene)
  column.position.y = 0.5
  column.parent = group
  column.material = mats.teakLight

  // Top platform (gold)
  const top = MeshBuilder.CreateCylinder(`${poi.id}-top`, {
    diameterTop: 0.65, diameterBottom: 0.6, height: 0.15, tessellation: 12,
  }, scene)
  top.position.y = 0.875
  top.parent = group
  top.material = mats.frame

  return group
}

export type SlideshowTarget = { poi: POI; mesh: Mesh; images: string[] }

export type SplatTarget = { poi: POI; pedestalGroup: Mesh }

export type POIMeshesResult = {
  meshMap: Map<string, { mesh: Mesh; poi: POI }>
  slideshowTargets: SlideshowTarget[]
  splatTargets: SplatTarget[]
}

export function createPOIMeshes(scene: Scene, pois: POI[]): POIMeshesResult {
  const meshMap: Map<string, { mesh: Mesh; poi: POI }> = new Map()
  const slideshowTargets: SlideshowTarget[] = []
  const splatTargets: SplatTarget[] = []
  const mats = createSharedMaterials(scene)

  pois.forEach((poi) => {
    let mesh: Mesh

    if (poi.type === 'painting') {
      const result = createPaintingMesh(poi, scene, mats)
      mesh = result.group
      if (result.slideshowTarget) {
        slideshowTargets.push({ poi, ...result.slideshowTarget })
      }
    } else if (poi.type === 'display-case') {
      mesh = createDisplayCaseMesh(poi, scene, mats)
    } else if (poi.type === 'custom') {
      mesh = createPedestalMesh(poi, scene, mats)
      if (poi.custom?.splatPath) {
        splatTargets.push({ poi, pedestalGroup: mesh })
      }
    } else {
      mesh = createPedestalMesh(poi, scene, mats)
    }

    meshMap.set(poi.id, { mesh, poi })
  })

  return { meshMap, slideshowTargets, splatTargets }
}
