import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import type { POI } from '@/types/poi'
import { createProjectArtwork } from './projectArtwork'
import { createExperienceDisplay } from './experienceDisplay'
import { roundedBox } from './exhibitGeometry'

// Shared materials (created once per scene)
function createSharedMaterials(scene: Scene) {
  // A slim, dark metal edge leaves the artwork dominant against the plaster.
  const frame = new StandardMaterial('frameMat', scene)
  frame.diffuseColor = Color3.FromHexString('#393b34')
  frame.specularColor = new Color3(0.18, 0.18, 0.18)
  frame.specularPower = 96

  // Backing panels and signs share the architectural palette.
  const teak = new StandardMaterial('teakMat', scene)
  teak.diffuseColor = Color3.FromHexString('#344b3f')
  teak.specularColor = new Color3(0.1, 0.1, 0.1)

  // Glass for display cases (frosted, cool tint)
  const glass = new StandardMaterial('glassMat', scene)
  glass.diffuseColor = new Color3(0.9, 0.95, 1.0)
  glass.specularColor = new Color3(0.6, 0.6, 0.6)
  glass.specularPower = 256
  glass.alpha = 0.2
  glass.backFaceCulling = false

  return { frame, teak, glass }
}

type PaintingResult = {
  group: Mesh
  slideshowTarget?: { mesh: Mesh; images: string[] }
}

function createPaintingMesh(poi: POI, scene: Scene, mats: ReturnType<typeof createSharedMaterials>): PaintingResult {
  const rad = (poi.rotation * Math.PI) / 180
  const group = new Mesh(`${poi.id}-group`, scene)
  group.position = new Vector3(poi.position.x, 1.92, poi.position.z)
  group.rotation.y = rad

  // Canvas plane
  const fw = 2.9
  const fh = 1.94
  const canvas = MeshBuilder.CreatePlane(poi.id, { width: fw, height: fh, sideOrientation: Mesh.DOUBLESIDE }, scene)
  canvas.position.z = -0.05
  canvas.parent = group

  // Load thumbnail texture
  const canvasMat = new StandardMaterial(`${poi.id}-canvas-mat`, scene)
  canvasMat.specularColor = new Color3(0.02, 0.02, 0.02)
  canvasMat.emissiveColor = new Color3(0.03, 0.03, 0.03)

  if (poi.content.category) {
    canvasMat.emissiveTexture = createProjectArtwork(poi.id, poi.content, scene)
    canvasMat.emissiveColor = Color3.Black()
    canvasMat.disableLighting = true
  } else if (poi.content.thumbnail) {
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
  const t = 0.045 // frame thickness
  const d = 0.075 // frame depth

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

  const bars = frameParts.map((fp, i) => {
    const bar = MeshBuilder.CreateBox(`${poi.id}-frame-${i}`, { width: fp.w, height: fp.h, depth: fp.dp }, scene)
    bar.position = new Vector3(fp.x, fp.y, -0.05)
    bar.material = mats.frame
    return bar
  })
  // The border remains one independently highlightable frame, rather than
  // four draw calls. Merge in local coordinates before attaching its parent.
  const border = Mesh.MergeMeshes(bars, true, true)!
  border.name = `${poi.id}-frame-border`; border.parent = group

  // A shallow shadow gap and a small physical catalogue label ground each exhibit.
  const backing = MeshBuilder.CreateBox(`${poi.id}-backing`, { width: fw + 0.12, height: fh + 0.12, depth: 0.08 }, scene)
  backing.position.z = -0.13; backing.material = mats.teak
  const labelMount = MeshBuilder.CreateBox(`${poi.id}-label-mount`, { width: 2.34, height: .4, depth: .035 }, scene)
  labelMount.position.set(0, -1.31, -.13); labelMount.material = mats.teak
  const mounting = Mesh.MergeMeshes([backing, labelMount], true, true)!
  mounting.name = `${poi.id}-backing`; mounting.parent = group
  const plaqueTexture = new DynamicTexture(`${poi.id}-plaque`, { width: 1024, height: 160 }, scene, true)
  plaqueTexture.anisotropicFilteringLevel = 4
  const ctx = plaqueTexture.getContext() as unknown as CanvasRenderingContext2D
  ctx.fillStyle = '#f2eee4'; ctx.fillRect(0, 0, 1024, 160)
  ctx.fillStyle = '#254b53'; ctx.font = '500 44px sans-serif'
  ctx.fillText(poi.content.title, 36, 64, 920)
  ctx.fillStyle = '#5e726f'; ctx.font = '25px sans-serif'
  ctx.fillText(poi.content.category ?? 'Project', 36, 119, 900)
  plaqueTexture.update(); plaqueTexture.uScale = -1; plaqueTexture.uOffset = 1
  const plaqueMaterial = new StandardMaterial(`${poi.id}-plaque-material`, scene)
  plaqueMaterial.emissiveTexture = plaqueTexture; plaqueMaterial.disableLighting = true
  const plaque = MeshBuilder.CreatePlane(`${poi.id}-plaque`, { width: 2.3, height: 0.36, sideOrientation: Mesh.DOUBLESIDE }, scene)
  plaque.parent = group; plaque.position.set(0, -1.31, -0.1); plaque.material = plaqueMaterial

  // Collision box for the whole painting
  group.checkCollisions = true

  // Return slideshow target if multiple thumbnails are available
  const thumbnails = poi.content.thumbnails
  const slideshowTarget = !poi.content.category && thumbnails && thumbnails.length >= 2
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

  if (!poi.experienceDisplay) {
    const contact = poi.id === 'contact'
    // At 2.23 m wide, the complete sign also fits a narrow phone view from
    // a safe point on the circular arrival platform.
    group.scaling.setAll(.85); group.position.y = .02
    const housing = roundedBox(`${poi.id}-housing`, 2.62, 1.72, .18, .04, scene)
    housing.position.y = 1.36
    const foot = roundedBox(`${poi.id}-foot`, 2.72, .12, .64, .035, scene)
    foot.position.y = .22
    const supports = [housing, foot]
    for (const x of [-.82, .82]) {
      const leg = MeshBuilder.CreateCylinder(`${poi.id}-leg-${x}`, { diameter: .075, height: .55, tessellation: 16 }, scene)
      leg.position.set(x, .5, 0); supports.push(leg)
    }
    // Merge in local space so the sign has one solid, collidable housing.
    supports.forEach(part => { part.material = mats.frame })
    const stand = Mesh.MergeMeshes(supports, true, true)!
    stand.name = `${poi.id}-stand`; stand.parent = group; stand.checkCollisions = true

    const texture = new DynamicTexture(`${poi.id}-welcome`, { width: 1024, height: 640 }, scene, true)
    texture.anisotropicFilteringLevel = 4
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
    ctx.fillStyle = '#eee7d7'; ctx.fillRect(0, 0, 1024, 640)
    ctx.fillStyle = '#846342'; ctx.font = '24px sans-serif'; ctx.fillText(contact ? 'BALAIRUNG / 05' : 'BALAIRUNG / 01', 64, 83)
    // The same pavilion mark as the website header, drawn as vector strokes.
    ctx.save(); ctx.translate(892, 37); ctx.scale(2, 2)
    ctx.strokeStyle = '#846342'; ctx.lineWidth = 1.5; ctx.beginPath()
    ctx.moveTo(4, 29); ctx.lineTo(4, 9); ctx.lineTo(17, 3); ctx.lineTo(30, 9); ctx.lineTo(30, 29)
    ctx.moveTo(4, 9); ctx.lineTo(17, 15); ctx.lineTo(30, 9)
    ctx.moveTo(17, 15); ctx.lineTo(17, 31); ctx.moveTo(9, 12); ctx.lineTo(9, 26); ctx.moveTo(25, 12); ctx.lineTo(25, 26)
    ctx.stroke(); ctx.restore()
    ctx.fillStyle = '#292c28'; ctx.font = '100px Georgia, serif'; ctx.fillText(contact ? 'Say hello.' : 'Balairung', 58, 244)
    ctx.fillStyle = '#626457'; ctx.font = '29px sans-serif'
    ctx.fillText(contact ? 'Muhammad Hazimi Yusri' : 'Work & ideas by Hazimi Yusri', 64, 302)
    ctx.fillStyle = '#b8ac94'; ctx.fillRect(64, 388, 896, 2)
    ctx.fillStyle = '#263e40'; ctx.font = '500 44px sans-serif'
    ctx.fillText(contact ? 'Contact details' : 'Enter the gallery', 64, 478)
    ctx.strokeStyle = '#846342'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(827, 463); ctx.lineTo(943, 463); ctx.lineTo(921, 441); ctx.moveTo(943, 463); ctx.lineTo(921, 485); ctx.stroke()
    ctx.fillStyle = '#626457'; ctx.font = '24px sans-serif'
    ctx.fillText(contact ? 'Email  ·  LinkedIn  ·  GitHub' : 'Professional work  /  Projects  /  Experience', 64, 568)
    texture.update()
    const material = new StandardMaterial(`${poi.id}-sign-material`, scene)
    material.emissiveTexture = texture; material.disableLighting = true
    const sign = MeshBuilder.CreatePlane(`${poi.id}-front`, { width: 2.48, height: 1.55 }, scene)
    sign.position.set(0, 1.36, -.091); sign.material = material
    const reverse = sign.clone(`${poi.id}-reverse`)
    reverse.position.z = .091; reverse.rotation.y = Math.PI
    const faces = Mesh.MergeMeshes([sign, reverse], true, true)!
    faces.name = `${poi.id}-sign`; faces.parent = group
    return group
  }

  // A quiet exhibition plinth: a recessed foot, solid cabinet and thin cap.
  // Its front carries the printed role plaque; only the brand mark floats.
  const base = roundedBox(`${poi.id}-base`, 1.94, .07, .72, .02, scene)
  base.position.y = .185
  base.parent = group
  base.material = mats.frame

  const column = roundedBox(`${poi.id}-col`, 2.08, .97, .82, .035, scene)
  column.position.y = .705
  column.parent = group
  column.material = mats.teak
  column.checkCollisions = true
  column.receiveShadows = true

  const top = roundedBox(`${poi.id}-top`, 2.14, .06, .88, .014, scene)
  top.position.y = 1.22
  top.parent = group
  top.material = mats.frame
  top.receiveShadows = true

  createExperienceDisplay(poi, group, scene)

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
