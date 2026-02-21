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
  // Gold frame for paintings
  const frame = new StandardMaterial('frameMat', scene)
  frame.diffuseColor = new Color3(0.79, 0.66, 0.30) // hall-accent gold
  frame.specularColor = new Color3(0.9, 0.8, 0.5)
  frame.specularPower = 64
  frame.emissiveColor = new Color3(0.06, 0.05, 0.02)

  // Dark teak for bases/platforms
  const teak = new StandardMaterial('teakMat', scene)
  teak.diffuseColor = new Color3(0.24, 0.17, 0.12) // hall-frame
  teak.specularColor = new Color3(0.08, 0.06, 0.04)

  // Light teak for pedestal bodies
  const teakLight = new StandardMaterial('teakLightMat', scene)
  teakLight.diffuseColor = new Color3(0.36, 0.25, 0.20) // hall-frame-light
  teakLight.specularColor = new Color3(0.1, 0.08, 0.06)

  // Glass for display cases
  const glass = new StandardMaterial('glassMat', scene)
  glass.diffuseColor = new Color3(0.8, 0.9, 1.0)
  glass.specularColor = new Color3(1, 1, 1)
  glass.specularPower = 128
  glass.alpha = 0.25
  glass.backFaceCulling = false

  return { frame, teak, teakLight, glass }
}

function createPaintingMesh(poi: POI, scene: Scene, mats: ReturnType<typeof createSharedMaterials>): Mesh {
  const rad = (poi.rotation * Math.PI) / 180
  const group = new Mesh(`${poi.id}-group`, scene)
  group.position = new Vector3(poi.position.x, 2, poi.position.z)
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
    const tex = new Texture(poi.content.thumbnail, scene, false, false)
    canvasMat.diffuseTexture = tex
    tex.onLoadObservable.addOnce(() => {
      // texture loaded successfully
    })
    // Fallback if texture fails — check after a delay
    setTimeout(() => {
      if (!tex.isReady()) {
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

  return group
}

const FALLBACK_COLORS = [
  '#C9A84C', // gold
  '#3D2B1E', // teak
  '#8B2E2E', // batik red
  '#2E5E3E', // forest green
  '#3A4E6E', // slate blue
  '#5E2E3E', // burgundy
]

function hashTitle(title: string): number {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getInitials(title: string): string {
  const words = title.replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase()
}

function applyFallbackTexture(mat: StandardMaterial, title: string, scene: Scene) {
  const fallback = new DynamicTexture(`fallback-${title}`, { width: 512, height: 340 }, scene)
  const ctx = fallback.getContext() as unknown as CanvasRenderingContext2D

  const colorIdx = hashTitle(title) % FALLBACK_COLORS.length
  const bgColor = FALLBACK_COLORS[colorIdx]

  // Fill background
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, 512, 340)

  // Gradient overlay for depth
  const gradient = ctx.createLinearGradient(0, 0, 0, 340)
  gradient.addColorStop(0, 'rgba(255,255,255,0.08)')
  gradient.addColorStop(0.5, 'rgba(0,0,0,0)')
  gradient.addColorStop(1, 'rgba(0,0,0,0.15)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 512, 340)

  // Draw large initials
  const initials = getInitials(title)
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = 'bold 96px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, 256, 150)

  // Draw title below
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '24px serif'
  ctx.fillText(title, 256, 250)

  fallback.update()
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

export function createPOIMeshes(scene: Scene, pois: POI[]) {
  const meshes: Map<string, { mesh: Mesh; poi: POI }> = new Map()
  const mats = createSharedMaterials(scene)

  pois.forEach((poi) => {
    let mesh: Mesh

    if (poi.type === 'painting') {
      mesh = createPaintingMesh(poi, scene, mats)
    } else if (poi.type === 'display-case') {
      mesh = createDisplayCaseMesh(poi, scene, mats)
    } else {
      mesh = createPedestalMesh(poi, scene, mats)
    }

    meshes.set(poi.id, { mesh, poi })
  })

  return meshes
}
