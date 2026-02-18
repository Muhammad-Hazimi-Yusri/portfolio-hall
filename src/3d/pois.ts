import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import type { POI } from '@/types/poi'

export function createPOIMeshes(scene: Scene, pois: POI[]) {
  const meshes: Map<string, { mesh: Mesh; poi: POI }> = new Map()

  pois.forEach((poi) => {
    let mesh
    const rad = (poi.rotation * Math.PI) / 180

    if (poi.type === 'painting') {
      mesh = MeshBuilder.CreatePlane(poi.id, { width: 1.5, height: 1, sideOrientation: Mesh.DOUBLESIDE }, scene)
      mesh.position = new Vector3(poi.position.x, 2, poi.position.z)
      mesh.rotation.y = rad
    } else if (poi.type === 'display-case') {
      mesh = MeshBuilder.CreateBox(poi.id, { width: 1, height: 0.8, depth: 1 }, scene)
      mesh.position = new Vector3(poi.position.x, 0.4, poi.position.z)
      mesh.rotation.y = rad
    } else {
      // pedestal / custom
      mesh = MeshBuilder.CreateCylinder(poi.id, { diameter: 0.6, height: 1 }, scene)
      mesh.position = new Vector3(poi.position.x, 0.5, poi.position.z)
    }

    const mat = new StandardMaterial(`${poi.id}-mat`, scene)
    mat.diffuseColor = new Color3(0.9, 0.4, 0.5) // hall-accent-ish
    mat.emissiveColor = new Color3(0.2, 0.05, 0.1)
    mesh.material = mat
    mesh.checkCollisions = true

    meshes.set(poi.id, { mesh, poi })
  })

  return meshes
}