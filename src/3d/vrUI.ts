import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh'
import type { POI } from '@/types/poi'

// ──────────────────────────────────────────────────────────────────────────────
// Hover label
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create a billboard text label above a POI mesh.
 * Returns a cleanup function — call it when hover ends or panel opens.
 */
export function createHoverLabel(
  scene: Scene,
  text: string,
  worldPos: Vector3,
): () => void {
  const labelMesh = MeshBuilder.CreatePlane(
    `hoverLabel-${text}`,
    { width: 0.7, height: 0.16 },
    scene,
  )
  labelMesh.position = worldPos.add(new Vector3(0, 2.2, 0))
  labelMesh.billboardMode = Mesh.BILLBOARDMODE_ALL
  labelMesh.isPickable = false

  const tex = new DynamicTexture(`hoverLabelTex-${text}`, { width: 512, height: 117 }, scene)
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D

  // Dark teak background with slight rounding-implied contrast
  ctx.fillStyle = 'rgba(18, 10, 5, 0.88)'
  ctx.fillRect(0, 0, 512, 117)

  // Gold border
  ctx.strokeStyle = '#CA9933'
  ctx.lineWidth = 4
  ctx.strokeRect(3, 3, 506, 111)

  // Title text
  ctx.fillStyle = '#CA9933'
  ctx.font = 'bold 36px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 58)
  tex.update()

  const mat = new StandardMaterial(`hoverLabelMat-${text}`, scene)
  mat.diffuseTexture = tex
  mat.emissiveTexture = tex
  mat.disableLighting = true
  mat.backFaceCulling = false
  labelMesh.material = mat

  return () => {
    tex.dispose()
    mat.dispose()
    labelMesh.dispose()
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// VR Panel
// ──────────────────────────────────────────────────────────────────────────────

export type PanelResult = {
  dispose: () => void
  isCloseButton: (mesh: AbstractMesh | null | undefined) => boolean
  getLinkUrl: (mesh: AbstractMesh | null | undefined) => string | null
}

const PANEL_W = 1.4     // metres
const PANEL_H = 0.9     // metres
const TEX_W   = 1024    // texture pixels
const TEX_H   = 640     // texture pixels

/**
 * Spawn a floating teak-and-gold info panel in front of the player.
 *
 * - Positioned 1.5 m in front of `cameraPosition` along `cameraForward`, at
 *   chest height (0.3 m below head).
 * - Close button: 0.09 m gold plane in top-right corner — pickable.
 * - Link buttons: one 0.36 × 0.07 m plane per link — pickable; pinch/trigger
 *   queues the URL via `onLinkQueued`; URLs open in new tabs on VR exit.
 * - Returns { dispose, isCloseButton, getLinkUrl } for the per-frame ray logic.
 */
export function showVRPanel(
  scene: Scene,
  poi: POI,
  cameraPosition: Vector3,
  cameraForward: Vector3,
  onClose: () => void,
): PanelResult {
  const disposables: (() => void)[] = []

  // ── Root transform node ────────────────────────────────────────────────────
  const root = new TransformNode('vrPanelRoot', scene)
  const fwd = cameraForward.normalize()
  root.position = cameraPosition.add(fwd.scale(1.5))
  root.position.y = cameraPosition.y - 0.3   // chest height
  root.lookAt(cameraPosition)                 // panel face toward player
  disposables.push(() => root.dispose())

  // ── Gold border (behind bg by 1 mm) ────────────────────────────────────────
  const borderMesh = MeshBuilder.CreatePlane(
    'vrPanelBorder',
    { width: PANEL_W + 0.04, height: PANEL_H + 0.04 },
    scene,
  )
  borderMesh.parent = root
  borderMesh.position.z = 0.001
  borderMesh.isPickable = false

  const borderMat = new StandardMaterial('vrPanelBorderMat', scene)
  borderMat.diffuseColor  = new Color3(0.79, 0.66, 0.30)  // gold
  borderMat.emissiveColor = new Color3(0.30, 0.25, 0.10)
  borderMat.backFaceCulling = false
  borderMesh.material = borderMat
  disposables.push(() => { borderMesh.dispose(); borderMat.dispose() })

  // ── Background plane with content texture ──────────────────────────────────
  const bgMesh = MeshBuilder.CreatePlane(
    'vrPanelBg',
    { width: PANEL_W, height: PANEL_H },
    scene,
  )
  bgMesh.parent = root
  bgMesh.isPickable = false

  const bgTex = new DynamicTexture('vrPanelTex', { width: TEX_W, height: TEX_H }, scene)
  _renderContent(bgTex, poi)

  const bgMat = new StandardMaterial('vrPanelBgMat', scene)
  bgMat.diffuseTexture  = bgTex
  bgMat.emissiveTexture = bgTex
  bgMat.disableLighting = true
  bgMat.backFaceCulling = false
  bgMesh.material = bgMat
  disposables.push(() => { bgMesh.dispose(); bgTex.dispose(); bgMat.dispose() })

  // ── Close button (top-right corner) ───────────────────────────────────────
  const closeMesh = _makeButton(scene, 'vrPanelClose', '✕', 0.09, 0.09)
  closeMesh.parent = root
  closeMesh.position.set(0.62, 0.38, -0.003)
  disposables.push(() => closeMesh.dispose())

  // ── Link buttons ───────────────────────────────────────────────────────────
  const linkMap = new Map<AbstractMesh, string>()
  const links = poi.content.links ?? []
  links.forEach((link, i) => {
    const btn = _makeButton(scene, `vrPanelLink-${i}`, link.label, 0.36, 0.07)
    btn.parent = root
    btn.position.set(-0.25, -0.24 - i * 0.082, -0.003)
    linkMap.set(btn, link.url)
    disposables.push(() => btn.dispose())
  })

  // ── Result ─────────────────────────────────────────────────────────────────
  const dispose = () => {
    for (const fn of disposables) fn()
    onClose()
  }

  return {
    dispose,
    isCloseButton: (mesh) => mesh === closeMesh,
    getLinkUrl: (mesh) => (mesh ? (linkMap.get(mesh) ?? null) : null),
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Private helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Render title, description, tags, and links-header onto the panel DynamicTexture. */
function _renderContent(tex: DynamicTexture, poi: POI): void {
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D
  const W = TEX_W
  const H = TEX_H

  // Background
  ctx.fillStyle = '#130C07'
  ctx.fillRect(0, 0, W, H)

  // Title
  ctx.fillStyle = '#CA9933'
  ctx.font = 'bold 52px serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  const titleMaxW = W - 140  // leave space for close button
  ctx.fillText(poi.content.title, 40, 30, titleMaxW)

  // Divider
  ctx.strokeStyle = 'rgba(202,153,51,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(40, 110)
  ctx.lineTo(W - 40, 110)
  ctx.stroke()

  // Description (word-wrapped)
  ctx.fillStyle = '#F0E0C8'
  ctx.font = '26px sans-serif'
  const descLines = _wrapText(ctx, poi.content.description, W - 80)
  let descY = 128
  for (const line of descLines) {
    if (descY > 390) break   // clamp to available space
    ctx.fillText(line, 40, descY)
    descY += 34
  }

  // Tags
  const tags = poi.content.tags ?? []
  if (tags.length > 0) {
    let tagX = 40
    const tagY = 428
    ctx.font = 'bold 20px sans-serif'
    for (const tag of tags) {
      const tw = ctx.measureText(tag).width + 24
      if (tagX + tw > W - 40) break  // single row only
      // Pill background
      ctx.fillStyle = 'rgba(60, 30, 10, 0.9)'
      _roundRect(ctx, tagX, tagY, tw, 30, 6)
      ctx.fill()
      // Pill border
      ctx.strokeStyle = '#CA9933'
      ctx.lineWidth = 1.5
      _roundRect(ctx, tagX, tagY, tw, 30, 6)
      ctx.stroke()
      // Tag text
      ctx.fillStyle = '#CA9933'
      ctx.textAlign = 'center'
      ctx.fillText(tag, tagX + tw / 2, tagY + 15)
      ctx.textAlign = 'left'
      tagX += tw + 10
    }
  }

  // "Links:" header (only when links exist)
  if (poi.content.links && poi.content.links.length > 0) {
    ctx.fillStyle = 'rgba(202,153,51,0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, 484)
    ctx.lineTo(W - 40, 484)
    ctx.stroke()

    ctx.fillStyle = '#CA9933'
    ctx.font = 'bold 22px sans-serif'
    ctx.fillText('Links  ▶', 40, 496)
  }

  tex.update()
}

/** Create a small pickable button plane with a DynamicTexture label. */
function _makeButton(
  scene: Scene,
  name: string,
  label: string,
  w: number,
  h: number,
): Mesh {
  const mesh = MeshBuilder.CreatePlane(name, { width: w, height: h }, scene)
  mesh.isPickable = true

  const tw = Math.round(w / h * 128)
  const th = 128
  const tex = new DynamicTexture(`${name}Tex`, { width: tw, height: th }, scene)
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D

  // Gold button background
  ctx.fillStyle = '#7A5C1A'
  ctx.fillRect(0, 0, tw, th)
  ctx.strokeStyle = '#CA9933'
  ctx.lineWidth = 4
  ctx.strokeRect(3, 3, tw - 6, th - 6)

  // Button label
  ctx.fillStyle = '#F5E6D0'
  ctx.font = `bold ${Math.round(th * 0.42)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, tw / 2, th / 2)
  tex.update()

  const mat = new StandardMaterial(`${name}Mat`, scene)
  mat.diffuseTexture  = tex
  mat.emissiveTexture = tex
  mat.disableLighting = true
  mat.backFaceCulling = false
  mesh.material = mat

  return mesh
}

/** Word-wrap text to fit within maxWidth pixels. */
function _wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

/** Draw a rounded rectangle path (no fill/stroke — caller does that). */
function _roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}
