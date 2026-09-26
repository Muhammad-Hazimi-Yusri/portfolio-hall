import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import islands from '../data/distantIslands.json'

// A single-sided height field. In Babylon's left-handed coordinates this
// winding produces upward normals (the previous ribbons faced downward).
export function terrainData(columns: number, rows: number, point: (column: number, row: number) => readonly number[]) {
  const positions: number[] = [], indices: number[] = [], normals: number[] = []
  for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    positions.push(...point(column / columns, row / rows))
    if (row < rows && column < columns) {
      const a = row * (columns + 1) + column, b = a + columns + 1
      indices.push(a, a + 1, b, a + 1, b + 1, b)
    }
  }
  VertexData.ComputeNormals(positions, indices, normals)
  const data = new VertexData()
  data.positions = positions; data.indices = indices; data.normals = normals
  return data
}

export function createDistantShore(scene: Scene) {
  const meshes: Mesh[] = []
  const mat = new StandardMaterial('distant-shore-matte', scene)
  mat.diffuseColor = Color3.White(); mat.specularColor = Color3.Black()
  // Reduced real relief, arranged as fictional scenery around the hall. The
  // data is bundled only with 3D: no map service or height-map render pass.
  // Source and modifications: public/terrain/README.md.
  const coasts = [
    { x: -320, z: 165, turn: 0 },
    { x: 145, z: -150, turn: .24 },
    { x: 300, z: 120, turn: -.38 },
  ]
  for (const [index, coast] of coasts.entries()) {
    const island = islands[index]
    const { width, depth, heightScale } = island
    const skyLight = atob(island.skyLight)
    const cos = Math.cos(coast.turn), sin = Math.sin(coast.turn)
    const data = terrainData(island.columns, island.rows, (u, v) => {
      // View the southern shoulders across the water. Rotations preserve the
      // heightfield's upward winding and give each island a different bearing.
      const row = Math.round((1 - v) * island.rows), column = Math.round(u * island.columns)
      const metres = island.halfMetres[row * (island.columns + 1) + column] / 2
      const x = (u - .5) * width, z = (v - .5) * depth
      return [coast.x + width / 2 + x * cos + z * sin, -.35 + metres * heightScale,
        coast.z + depth / 2 + z * cos - x * sin]
    })
    const colors: number[] = [], uv: number[] = []
    const grass = Color3.FromHexString('#626d51'), rock = Color3.FromHexString('#787970'), wet = Color3.FromHexString('#475345')
    const positions = data.positions!, normals = data.normals!
    for (let i = 0; i < positions.length; i += 3) {
      const height = positions[i + 1], slope = 1 - Math.max(0, normals[i + 1])
      const scree = Math.min(.95, slope * 2.8 + Math.max(0, height - 13) * .028)
      const color = Color3.Lerp(grass, rock, scree)
      const shore = Math.max(0, 1 - Math.max(0, height) / 2.2)
      Color3.LerpToRef(color, wet, shore * .7, color)
      const column = i / 3 % (island.columns + 1), row = Math.floor(i / 3 / (island.columns + 1))
      // Match the vertically flipped height sample to its offline sky shading.
      const light = skyLight.charCodeAt((island.rows - row) * (island.columns + 1) + column) / 255
      colors.push(color.r * light, color.g * light, color.b * light, 1)
      // A broad aerial ground scan, aligned continuously across the slopes.
      uv.push((positions[i] * .94 + positions[i + 2] * .35) / 42,
        (positions[i + 2] * .94 - positions[i] * .35) / 42)
    }
    data.colors = colors; data.uvs = uv
    const mesh = new Mesh(`distant-shore-${index}`, scene)
    data.applyToMesh(mesh)
    mesh.material = mat; mesh.isPickable = false; mesh.freezeWorldMatrix()
    meshes.push(mesh)
  }
  return meshes
}
