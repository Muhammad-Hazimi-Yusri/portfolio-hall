import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { ridgeHeights } from '@/data/community'
import type { Community } from '@/data/community'
import { terrainData } from './landscape'

/** The 28-day graph, facing the open side of the gallery, oldest to newest. */
export function createVisitorRidge(scene: Scene, days: Community['days']) {
  const heights = ridgeHeights(days)
  const sampleHeight = (u: number) => {
    const within = Math.max(0, Math.min(1, u))
    const day = Math.min(26, Math.floor(within * 27)), t = within * 27 - day
    const height = heights[day] + (heights[day + 1] - heights[day]) * t * t * (3 - 2 * t)
    // A short physical skirt closes the two ends below water. It is outside
    // the dated graph; all 28 samples remain in place and unmodified.
    const end = Math.max(0, 1 - Math.abs(u - within) * 27)
    return height * end * end * (3 - 2 * end)
  }
  // Both the datum and skirt sit below the water (-.26), so a zero-visit day
  // never becomes a visible hill. Daily crests retain their exact data height.
  const surface = (u: number, v: number) => {
    const profile = Math.pow(Math.max(0, Math.cos((v - .5) * Math.PI)), 1.8)
    return [23 + 50 * v, -.65 + (sampleHeight(u) + .3) * profile, 93 - 102 * u]
  }
  const data = terrainData(116, 32, (u, v) => surface((u * 116 - 4) / 108, v))
  const colors: number[] = [], base = Color3.FromHexString('#496960')
  for (let i = 0; i < data.positions!.length; i += 3) {
    const height = data.positions![i + 1]
    const shore = Math.max(0, 1 - Math.abs(height) / .7)
    const lift = Math.max(0, height) * .009
    colors.push(base.r + lift + shore * .15, base.g + lift + shore * .12, base.b + lift + shore * .08, 1)
  }
  data.colors = colors
  const mesh = new Mesh('visitor-skyline', scene)
  data.applyToMesh(mesh)
  const material = new StandardMaterial('visitor-skyline-matte', scene)
  material.diffuseColor = Color3.White(); material.specularColor = Color3.Black()
  mesh.material = material
  const crest = Array.from({ length: 109 }, (_, index) => new Vector3(48, -.33 + sampleHeight(index / 108), 93 - index * 102 / 108))
  // One contour per actual day, plus the crest, in one draw. They describe the
  // graph's structure without fabricated peaks, animated glow or extra passes.
  const lines = [crest, ...heights.flatMap((height, day) => height ? [Array.from({ length: 33 }, (_, row) => {
    const [x, y, z] = surface(day / 27, row / 32)
    return new Vector3(x, y + .018, z)
  })] : [])]
  const contour = MeshBuilder.CreateLineSystem('visitor-skyline-contour', { lines }, scene)
  contour.color = Color3.FromHexString('#d6b47f')
  const dayPath = (day: number) => Array.from({ length: 33 }, (_, row) => {
    const [x, y, z] = surface(day / 27, row / 32)
    return new Vector3(x, Math.max(-.2, y + .06), z)
  })
  const selection = MeshBuilder.CreateTube('visitor-day-selection', { path: dayPath(0), radius: .085, tessellation: 6, cap: Mesh.CAP_ALL, updatable: true }, scene)
  const selectionMaterial = new StandardMaterial('visitor-day-ink', scene)
  selectionMaterial.disableLighting = true
  selectionMaterial.emissiveColor = Color3.FromHexString('#f1cf91')
  selection.material = selectionMaterial; selection.setEnabled(false)
  for (const part of [mesh, contour, selection]) {
    part.layerMask = 0x0fffffff; part.isPickable = false; part.freezeWorldMatrix()
  }
  mesh.isPickable = true
  mesh.metadata = {
    portfolioRoute: '#guestbook/analytics', guestbookIntent: 'analytics',
    navigationLabel: `${days.reduce((sum, day) => sum + day.visits, 0).toLocaleString()} visits · past 28 days`,
  }
  let selectedDate: string | null = null
  return {
    meshes: [mesh, contour, selection], materials: [material, selectionMaterial],
    selectDay(date: string | null) {
      if (date === selectedDate) return
      selectedDate = date
      const day = date ? days.findIndex(value => value.day === date) : -1
      selection.setEnabled(day >= 0)
      if (day >= 0) MeshBuilder.CreateTube('visitor-day-selection', { path: dayPath(day), instance: selection }, scene)
      scene.metadata ??= {}
      scene.metadata.needsRender = true
      scene.metadata.waterReflectionsDirty = true
    },
  }
}
