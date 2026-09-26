import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import type { Scene } from '@babylonjs/core/scene'
import { pois } from '@/data/pois'
import { projectNeighbours } from '@/components/portfolio/hallNavigation'

/** Two reusable, wall-mounted signs. Their labels change only when the selected
 * project changes; DOM links provide the same actions without reading 3D text. */
export function createProjectNavigation(scene: Scene) {
  const metal = new StandardMaterial('frame-navigation-metal', scene)
  metal.diffuseColor = Color3.FromHexString('#695d49')
  metal.specularColor = new Color3(.18, .18, .18)
  const signs = [-1, 1].map(side => {
    const name = `project-${side < 0 ? 'previous' : 'next'}`
    const backing = MeshBuilder.CreateBox(`${name}-sign-mount`, { width: .055, height: .54, depth: .8 }, scene)
    backing.material = metal
    const face = MeshBuilder.CreatePlane(`${name}-sign`, { width: .76, height: .5 }, scene)
    face.rotation.y = -Math.PI / 2
    const texture = new DynamicTexture(`${name}-label`, { width: 512, height: 336 }, scene, true)
    texture.anisotropicFilteringLevel = 4
    const material = new StandardMaterial(`${name}-label-material`, scene)
    material.emissiveTexture = texture; material.disableLighting = true
    face.material = material
    backing.setEnabled(false); face.setEnabled(false)
    const ctx = texture.getContext() as unknown as CanvasRenderingContext2D
    const paint = (title: string, hovered: boolean) => {
      ctx.fillStyle = hovered ? '#826b4d' : '#293e37'; ctx.fillRect(0, 0, 512, 336)
      ctx.fillStyle = '#dccbad'; ctx.font = '500 27px sans-serif'
      ctx.fillText(side < 0 ? 'PREVIOUS' : 'NEXT', 30, 51)
      // Draw the arrow ourselves so it does not depend on a system symbol font.
      ctx.strokeStyle = '#f2eee4'; ctx.lineWidth = 5; ctx.lineCap = 'square'
      const end = side < 0 ? 408 : 475, start = side < 0 ? 475 : 408
      ctx.beginPath(); ctx.moveTo(start, 40); ctx.lineTo(end, 40)
      ctx.moveTo(end - side * 16, 24); ctx.lineTo(end, 40); ctx.lineTo(end - side * 16, 56); ctx.stroke()
      ctx.strokeStyle = '#8e917b'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(30, 81); ctx.lineTo(482, 81); ctx.stroke()
      ctx.fillStyle = '#f2eee4'; ctx.font = '500 56px sans-serif'
      const lines: string[] = []
      let line = ''
      for (const word of title.split(/\s+/)) {
        const next = `${line} ${word}`.trim()
        if (line && ctx.measureText(next).width > 452) { lines.push(line); line = word } else line = next
      }
      if (line) lines.push(line)
      const visible = lines.slice(0, 3)
      visible.forEach((value, index) => ctx.fillText(value, 30, 228 - (visible.length - 1) * 31 + index * 62))
      texture.update()
    }
    return { side, backing, face, paint, title: '', enabled: false, hovered: false }
  })
  let current: string | null = null, opacity = 0
  return {
    setHovered(route: string | null) {
      for (const sign of signs) {
        const hovered = Boolean(route && sign.enabled && sign.face.metadata?.portfolioRoute === route)
        if (hovered === sign.hovered) continue
        sign.hovered = hovered
        sign.paint(sign.title, hovered)
        scene.metadata.needsRender = true
      }
    },
    update(id: string | null, elapsed: number, reducedMotion: boolean) {
      if (id !== current) {
        current = id; opacity = 0
        const poi = id ? pois.find(poi => poi.content.links?.some(link => link.url === `#project/${id}`)) : undefined
        const neighbours = id ? projectNeighbours(id) : null
        for (const sign of signs) {
          const adjacent = sign.side < 0 ? neighbours?.previous : neighbours?.next
          sign.enabled = Boolean(poi && adjacent)
          sign.hovered = false
          if (adjacent) { sign.title = adjacent.title; sign.paint(adjacent.title, false) }
          for (const mesh of [sign.backing, sign.face]) {
            mesh.setEnabled(sign.enabled)
            if (!poi || !adjacent) continue
            mesh.position.set(mesh === sign.face ? -4.445 : -4.475, 1.8, poi.position.z + sign.side * 2.04)
            mesh.metadata = { portfolioRoute: `#project/${adjacent.id}`, navigationLabel: `${sign.side < 0 ? 'Previous' : 'Next'}: ${adjacent.title}` }
          }
        }
        scene.metadata.needsRender = true
      }
      if (!id || opacity >= 1) return
      opacity = reducedMotion ? 1 : Math.min(1, opacity + elapsed / 240)
      for (const { backing, face, enabled } of signs) if (enabled) backing.visibility = face.visibility = opacity
      scene.metadata.needsRender = true
    },
  }
}
