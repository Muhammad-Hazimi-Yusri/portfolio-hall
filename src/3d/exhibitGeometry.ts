import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'

/** A bevel with actual surface normals, rather than a stack of intersecting boxes.
 * More samples live on the corners; the large flat faces stay inexpensive. */
export function roundedBox(name: string, width: number, height: number, depth: number, radius: number, scene: Scene) {
  const half = [width / 2, height / 2, depth / 2]
  const r = Math.min(radius, ...half.map(value => value * .98))
  const inner = half.map(value => value - r)
  const samples = (axis: number) => [
    ...[0, 1, 2].map(step => -inner[axis] - r * Math.cos(step * Math.PI / 4)),
    ...[0, 1, 2].map(step => inner[axis] + r * Math.sin(step * Math.PI / 4)),
  ]
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = []
  for (let axis = 0; axis < 3; axis++) for (const sign of [-1, 1]) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3
    const us = samples(u), vs = samples(v), base = positions.length / 3
    for (const y of vs) for (const x of us) {
      const point = [0, 0, 0]; point[axis] = sign * half[axis]; point[u] = x; point[v] = y
      const nearest = point.map((value, i) => Math.max(-inner[i], Math.min(inner[i], value)))
      const normal = point.map((value, i) => value - nearest[i])
      const length = Math.hypot(...normal)
      for (let i = 0; i < 3; i++) { normals.push(normal[i] / length); positions.push(nearest[i] + r * normal[i] / length) }
      uvs.push((x / half[u] + 1) / 2, (y / half[v] + 1) / 2)
    }
    for (let y = 0; y < vs.length - 1; y++) for (let x = 0; x < us.length - 1; x++) {
      const a = base + y * us.length + x, b = a + 1, c = a + us.length, d = c + 1
      // Babylon's default left-handed front faces have clockwise winding.
      indices.push(...(sign < 0 ? [a, b, d, a, d, c] : [a, d, b, a, c, d]))
    }
  }
  const data = new VertexData(); data.positions = positions; data.normals = normals; data.uvs = uvs; data.indices = indices
  const mesh = new Mesh(name, scene); data.applyToMesh(mesh)
  return mesh
}

/** A convex profile, front along -Z, with crisp caps and separately shaded edges. */
export function profilePrism(name: string, outline: [number, number][], depth: number, scene: Scene) {
  const points = [...outline]
  const area = points.reduce((sum, p, i) => { const next = points[(i + 1) % points.length]; return sum + p[0] * next[1] - next[0] * p[1] }, 0)
  if (area < 0) points.reverse()
  const positions: number[] = [], indices: number[] = [], normals: number[] = [], uvs: number[] = []
  for (const sign of [-1, 1]) {
    const base = positions.length / 3
    points.forEach(([x, y]) => { positions.push(x, y, sign * depth / 2); normals.push(0, 0, sign); uvs.push(x, y) })
    for (let i = 1; i < points.length - 1; i++) indices.push(...(sign < 0 ? [base, base + i, base + i + 1] : [base, base + i + 1, base + i]))
  }
  points.forEach(([x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length], length = Math.hypot(nx - x, ny - y), base = positions.length / 3
    for (const [px, py, pz] of [[x, y, -depth / 2], [nx, ny, -depth / 2], [nx, ny, depth / 2], [x, y, depth / 2]]) {
      positions.push(px, py, pz); normals.push((ny - y) / length, (x - nx) / length, 0); uvs.push(px, py)
    }
    indices.push(base, base + 2, base + 1, base, base + 3, base + 2)
  })
  const data = new VertexData(); data.positions = positions; data.normals = normals; data.uvs = uvs; data.indices = indices
  const mesh = new Mesh(name, scene); data.applyToMesh(mesh)
  return mesh
}

export function roundedOutline(width: number, height: number, radius: number): [number, number][] {
  const points: [number, number][] = []
  for (let corner = 0; corner < 4; corner++) {
    const angle = corner * Math.PI / 2
    const cx = Math.cos(angle + Math.PI / 4) > 0 ? width / 2 - radius : -width / 2 + radius
    const cy = Math.sin(angle + Math.PI / 4) > 0 ? height / 2 - radius : -height / 2 + radius
    for (let i = 0; i <= 5; i++) points.push([cx + Math.cos(angle + i * Math.PI / 10) * radius, cy + Math.sin(angle + i * Math.PI / 10) * radius])
  }
  return points
}

/** Smooth circular outlines need many samples around the ring, but only a few
 * across its very thin tube. A uniform torus wastes thousands of triangles. */
export function thinRing(name: string, diameter: number, thickness: number, segments: number, scene: Scene) {
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = []
  const sides = 8, stride = segments + 1
  for (let j = 0; j <= sides; j++) for (let i = 0; i <= segments; i++) {
    const a = i * Math.PI * 2 / segments, b = j * Math.PI * 2 / sides
    const radius = diameter / 2 + Math.cos(b) * thickness / 2
    positions.push(Math.cos(a) * radius, Math.sin(b) * thickness / 2, Math.sin(a) * radius)
    normals.push(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)); uvs.push(i / segments, j / sides)
  }
  for (let j = 0; j < sides; j++) for (let i = 0; i < segments; i++) {
    const a = j * stride + i, b = a + 1, c = a + stride, d = c + 1
    indices.push(a, b, d, a, d, c)
  }
  const data = new VertexData(); data.positions = positions; data.normals = normals; data.uvs = uvs; data.indices = indices
  const mesh = new Mesh(name, scene); data.applyToMesh(mesh); return mesh
}

/** Merge in the assembly's local space so animated parents remain correct. */
export function batchAssembly(parts: Mesh[], root: Mesh) {
  const result: Mesh[] = []
  for (const material of new Set(parts.map(mesh => mesh.material))) {
    const group = parts.filter(mesh => mesh.material === material)
    group.forEach(mesh => { mesh.parent = null; mesh.computeWorldMatrix(true) })
    const merged = group.length > 1 ? Mesh.MergeMeshes(group, true, true)! : group[0]
    merged.parent = root; merged.layerMask = root.layerMask
    merged.metadata = root.metadata; merged.isPickable = true
    result.push(merged)
  }
  return result
}
