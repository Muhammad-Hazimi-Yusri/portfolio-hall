import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import type { Scene } from '@babylonjs/core/scene'
import type { SceneMaterials } from './materials'
import { hallPlantings } from '@/data/hallLayout'

/** Curved leaves with actual silhouettes: opaque, static and merged with the
 * architecture. No alpha cards, imported asset, physics or animation loop. */
export function createArchitecturalPlanting(scene: Scene, mats: SceneMaterials) {
  const pieces: Mesh[] = [], colliders: Mesh[] = []
  hallPlantings.forEach(({ x, z, scale }, plant) => {
    const place = (mesh: Mesh) => {
      mesh.position.set(x, .155, z); mesh.scaling.setAll(scale)
      mesh.isPickable = false; mesh.receiveShadows = true; pieces.push(mesh)
      return mesh
    }
    const shape = [[.34, .02], [.39, .04], [.45, .48], [.47, .52], [.47, .55], [.42, .55], [.405, .48], [.37, .16]]
    const pot = place(MeshBuilder.CreateLathe(`planter-${plant}`, { shape: shape.map(([r, y]) => new Vector3(r, y, 0)), tessellation: 32, sideOrientation: Mesh.DOUBLESIDE }, scene))
    pot.material = mats.clay
    const soil = place(MeshBuilder.CreateCylinder(`planter-soil-${plant}`, { diameter: .81, height: .02, tessellation: 32 }, scene))
    soil.position.y += .48 * scale; soil.material = mats.stone
    for (let leaf = 0; leaf < 18; leaf++) {
      const angle = leaf * 2.399963 + plant * 1.7
      const radius = .5 + (leaf * 13 % 17) / 17 * .8
      const rise = .58 + (leaf * 7 % 13) / 13 * .72
      const width = .075 + (leaf * 3 % 7) / 7 * .065
      const paths = [-1, 0, 1].map(side => {
        const path: Vector3[] = []
        for (let step = 0; step <= 12; step++) {
          const t = step / 12, sway = Math.sin(t * Math.PI) * .13 * Math.sin(leaf * 2)
          const reach = .035 + radius * t * t
          const halfWidth = Math.max(.001, width * Math.sin(Math.PI * Math.pow(t, .7)))
          const height = .485 + rise * Math.sin(t * Math.PI * .8) + (1 - Math.abs(side)) * .022 * Math.sin(t * Math.PI)
          path.push(new Vector3(Math.cos(angle) * reach - Math.sin(angle) * (side * halfWidth + sway), height, Math.sin(angle) * reach + Math.cos(angle) * (side * halfWidth + sway)))
        }
        return path
      })
      const blade = place(MeshBuilder.CreateRibbon(`plant-${plant}-leaf-${leaf}`, { pathArray: paths, sideOrientation: Mesh.DOUBLESIDE }, scene))
      blade.material = mats.grassFloor
      const positions = blade.getVerticesData(VertexBuffer.PositionKind)!, colours: number[] = []
      for (let i = 0; i < positions.length; i += 3) {
        const tint = .67 + Math.min(1, (positions[i + 1] - .48) / .8) * .23 + (leaf % 3) * .035
        colours.push(tint, tint, tint * .88, 1)
      }
      blade.setVerticesData(VertexBuffer.ColorKind, colours)
    }
    const collider = MeshBuilder.CreateCylinder(`planter-collision-${plant}`, { diameter: .94 * scale, height: .6 * scale, tessellation: 12 }, scene)
    collider.position.set(x, .155 + .3 * scale, z); collider.isVisible = false
    collider.isPickable = false; collider.checkCollisions = true; collider.freezeWorldMatrix(); colliders.push(collider)
  })
  return { pieces, colliders }
}
