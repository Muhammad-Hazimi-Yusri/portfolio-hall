import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector4 } from '@babylonjs/core/Maths/math.vector'
import type { Community } from '@/data/community'
import { roundedBox } from './exhibitGeometry'

/** Three static batches: the cabinet, the pinned paper, and the writing action.
 * One mipmapped atlas holds all the text; no per-note materials or animation. */
export function createGuestbookBoard(scene: Scene, community: Community) {
  const solids: Mesh[] = [], paper: Mesh[] = [], writing: Mesh[] = []
  const paint = new StandardMaterial('guestbook-cabinet-matte', scene)
  paint.diffuseColor = Color3.White(); paint.specularColor.set(.08, .08, .08)
  const ink = new StandardMaterial('guestbook-paper-matte', scene)
  ink.diffuseColor = Color3.White(); ink.specularColor = Color3.Black()
  const atlas = new DynamicTexture('guestbook-text', { width: 1024, height: 1024 }, scene, true)
  atlas.anisotropicFilteringLevel = 4; ink.diffuseTexture = atlas
  const ctx = atlas.getContext() as unknown as CanvasRenderingContext2D
  ctx.textBaseline = 'top'

  const colored = (mesh: Mesh, color: string) => {
    const c = Color3.FromHexString(color), colors: number[] = []
    for (let i = 0; i < mesh.getTotalVertices(); i++) colors.push(c.r, c.g, c.b, 1)
    mesh.setVerticesData('color', colors); solids.push(mesh)
    return mesh
  }
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, color: string, radius = .012) => {
    const mesh = colored(roundedBox(name, w, h, d, radius, scene), color)
    mesh.position.set(x, y, z)
    return mesh
  }
  const uv = (x: number, y: number, w: number, h: number) => new Vector4(x / 1024, 1 - (y + h) / 1024, (x + w) / 1024, 1 - y / 1024)
  const plane = (name: string, w: number, h: number, x: number, y: number, z: number, tile: Vector4) => {
    const mesh = MeshBuilder.CreatePlane(name, { width: w, height: h, frontUVs: tile, sideOrientation: Mesh.DOUBLESIDE, backUVs: tile }, scene)
    mesh.position.set(x, y, z)
    return mesh
  }
  const fittedText = (text: string, width: number) => {
    const chars = Array.from(text)
    if (ctx.measureText(text).width <= width) return text
    while (chars.length && ctx.measureText(`${chars.join('')}…`).width > width) chars.pop()
    return `${chars.join('')}…`
  }
  const excerpt = (text: string, x: number, y: number, width: number) => {
    const chars = Array.from(text.trim())
    let cursor = 0
    for (let row = 0; row < 4 && cursor < chars.length; row++) {
      let end = cursor
      while (end < chars.length && ctx.measureText(chars.slice(cursor, end + 1).join('')).width <= width) end++
      // Break at a word where possible, but bound unbroken text and wide scripts.
      const lastSpace = chars.slice(cursor, end).lastIndexOf(' ')
      if (end < chars.length && lastSpace > 0) end = cursor + lastSpace
      const text = chars.slice(cursor, Math.max(end, cursor + 1)).join('')
      ctx.fillText(row === 3 && end < chars.length ? fittedText(`${text}…`, width) : text, x, y + row * 36)
      cursor = Math.max(end, cursor + 1)
      while (chars[cursor] === ' ') cursor++
    }
  }

  // A dark recessed surface makes the paper and brass pins legible at a glance.
  box('guestbook-case', 3.8, 2.8, .17, 0, 2.045, 87, '#5e4936', .025)
  box('guestbook-inset', 3.62, 2.62, .02, 0, 2.045, 86.907, '#424e45', .014)
  for (const x of [-1.38, 1.38]) {
    box('guestbook-leg', .085, .78, .11, x, .44, 87, '#3a4039')
    box('guestbook-foot', .34, .055, .48, x, .13, 86.96, '#3a4039')
  }
  box('guestbook-sill', 3.82, .055, .27, 0, .65, 86.9, '#876e50')

  ctx.fillStyle = '#e9e3cf'; ctx.fillRect(0, 0, 1024, 152)
  ctx.fillStyle = '#354b42'; ctx.font = '48px Georgia, serif'; ctx.fillText('The guestbook', 32, 22)
  ctx.font = '20px sans-serif'
  ctx.fillText(community.mode === 'local' ? 'LOCAL PREVIEW  /  NOTES ARE NOT PUBLIC' : 'NOTES FROM PEOPLE WHO STOPPED BY', 34, 100)
  paper.push(plane('guestbook-heading', 3.36, .5, 0, 3.04, 86.89, uv(4, 4, 1016, 144)))

  const notes = community.notes.slice(0, 5)
  const count = notes.length + 1
  for (let i = 0; i < count; i++) {
    const note = notes[i]
    const tx = (i % 3) * 340 + 8, ty = 216 + Math.floor(i / 3) * 392
    const color = ['#efe8cc', '#e4e9df', '#ece4d8'][i % 3]
    ctx.fillStyle = note ? color : '#f6efd9'; ctx.fillRect(tx, ty, 324, 264)
    ctx.fillStyle = '#374e44'; ctx.font = '26px Georgia, serif'
    if (note) {
      excerpt(note.message, tx + 22, ty + 40, 280)
      ctx.fillStyle = '#728071'; ctx.fillRect(tx + 22, ty + 214, 280, 1)
      ctx.fillStyle = '#42564a'; ctx.font = '21px sans-serif'; ctx.fillText(fittedText(note.name, 280), tx + 22, ty + 232)
    } else {
      ctx.font = '32px Georgia, serif'; ctx.fillText('Leave a note', tx + 22, ty + 52)
      ctx.font = '20px sans-serif'; ctx.fillText('A thought about a project,', tx + 22, ty + 110)
      ctx.fillText('or just a hello.', tx + 22, ty + 139)
      ctx.font = '42px sans-serif'; ctx.fillText('→', tx + 241, ty + 194)
    }
    const x = notes.length ? (i % 3 - 1) * 1.13 : 0, y = 2.28 - Math.floor(i / 3) * .96
    const angle = [-.018, .012, -.01, .014, -.021, .009][i]
    // A gently lifted lower edge gives the paper depth without transparency.
    const positions = [-.505, .415, 0, .505, .415, 0, -.505, -.31, 0, .505, -.31, -.006, -.505, -.415, -.012, .505, -.415, -.035]
    const indices = [0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5], normals: number[] = []
    VertexData.ComputeNormals(positions, indices, normals)
    const tile = uv(tx + 2, ty + 2, 320, 260)
    const data = new VertexData()
    data.positions = positions; data.indices = indices; data.normals = normals
    data.uvs = [tile.x, tile.w, tile.z, tile.w, tile.x, tile.y + (tile.w - tile.y) * .1265, tile.z, tile.y + (tile.w - tile.y) * .1265, tile.x, tile.y, tile.z, tile.y]
    const card = new Mesh('guestbook-note', scene)
    data.applyToMesh(card); card.rotation.z = angle; card.position.set(x, y, 86.864)
    ;(note ? paper : writing).push(card)
    const back = card.clone('guestbook-note-back')!
    back.makeGeometryUnique()
    colored(back, note ? color : '#f6efd9')
    back.position.z += .004; back.flipFaces(true)
    const pin = colored(MeshBuilder.CreateSphere('guestbook-pin', { diameter: .039, segments: 6 }, scene), '#b6a271')
    pin.position.set(x - Math.sin(angle) * .35, y + Math.cos(angle) * .35, 86.845)
  }
  // Full notes remain available even when the board only shows excerpts.
  ctx.fillStyle = '#e9e3cf'; ctx.fillRect(0, 160, 1024, 48)
  ctx.fillStyle = '#354b42'; ctx.font = '27px sans-serif'; ctx.fillText(notes.length ? `Read ${community.notes.length === 1 ? 'the note' : `all ${community.notes.length} notes`}` : 'Select the paper to write a note', 24, 168)
  ctx.font = '28px sans-serif'; ctx.fillText('→', 951, 165)
  paper.push(plane('guestbook-caption', 3.36, .13, 0, .815, 86.89, uv(4, 162, 1016, 44)))
  atlas.update()
  const finish = (mesh: Mesh, material: StandardMaterial, intent: 'read' | 'write') => {
    mesh.material = material; mesh.layerMask = 0x0fffffff; mesh.isPickable = true
    mesh.metadata = { portfolioRoute: intent === 'read' ? '#guestbook' : '#guestbook/write', guestbookIntent: intent }
    mesh.freezeWorldMatrix()
    return mesh
  }
  const cabinet = finish(Mesh.MergeMeshes(solids, true, true)!, paint, 'read')
  cabinet.name = 'guestbook-board'; cabinet.checkCollisions = true
  const pages = finish(Mesh.MergeMeshes(paper, true, true)!, ink, 'read')
  pages.name = 'guestbook-notes'
  const write = Mesh.MergeMeshes(writing, true, true)!
  write.name = 'guestbook-write'
  return { meshes: [cabinet, pages, finish(write, ink, 'write')], materials: [paint, ink], textures: [atlas] }
}
