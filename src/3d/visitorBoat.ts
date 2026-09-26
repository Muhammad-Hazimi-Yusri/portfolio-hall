import type { Scene } from '@babylonjs/core/scene'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexBuffer } from '@babylonjs/core/Buffers/buffer'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector'
import { countryLabel, zoneLabel } from '@/data/community'
import type { HallVisit } from '@/data/community'

type BoatPose = { x: number; z: number; heading: number }

/** A twelve-triangle pick volume keeps the detailed fleet in its shared batches.
 * Babylon still picks a visible mesh with zero visibility, but does not draw it. */
export function createVisitorBoatTarget(scene: Scene, index: number, pose: BoatPose, visit: HallVisit) {
  const target = MeshBuilder.CreateBox(`visitor-boat-target-${index}`, { width: 1.15, height: 1.3, depth: 2.3 }, scene)
  target.position.set(pose.x, .3, pose.z)
  target.rotation.y = pose.heading
  target.visibility = 0
  target.layerMask = 0x0fffffff
  target.metadata = {
    portfolioRoute: '#guestbook/visitors', guestbookIntent: 'visitors',
    navigationLabel: `${countryLabel(visit.country)} · ${zoneLabel[visit.zone]}`,
  }
  target.freezeWorldMatrix()
  return target
}

/** Small, still rowing boats. All opaque parts share one vertex-colour batch. */
export function createVisitorBoat(scene: Scene, index: number, pose: BoatPose, flagUV: Vector4) {
  const solid: Mesh[] = []
  const paint = Color3.FromHexString(['#496363', '#bdb7a5', '#775952'][(index + Math.floor(index / 3)) % 3])
  const timber = Color3.FromHexString('#a78a5f')
  const inside = Color3.FromHexString('#867353')
  const place = (mesh: Mesh) => {
    mesh.bakeCurrentTransformIntoVertices()
    mesh.position.set(pose.x, 0, pose.z); mesh.rotation.y = pose.heading
    return mesh
  }
  const tint = (mesh: Mesh, color: Color3) => {
    mesh.setVerticesData(VertexBuffer.ColorKind, Array.from({ length: mesh.getTotalVertices() }, () => [color.r, color.g, color.b, 1]).flat())
    solid.push(place(mesh))
  }
  // A broad transom and pointed bow, rather than a symmetric oval. The keel
  // is below the water at -0.26; the rim and seats stay above it.
  const profiles = [
    [.10, -.40, .58], [.29, -.27, .95], [.40, .025, 1.06],
    [.405, .07, 1.07], [.355, .07, 1.00], [.23, -.16, .78], [0, -.16, 0],
  ]
  const rings = profiles.map(([width, y, length]) => Array.from({ length: 33 }, (_, step) => {
    const angle = step / 32 * Math.PI * 2, bow = Math.cos(angle)
    return new Vector3(Math.sin(angle) * width * (1 - .18 * Math.max(0, bow)), y + .045 * Math.max(0, bow), Math.max(-.78, bow) * length)
  }))
  const hull = MeshBuilder.CreateRibbon(`visitor-hull-${index}`, { pathArray: rings }, scene)
  const colours = [paint.scale(.64), paint.scale(.84), paint, timber, timber, inside, inside.scale(.75)]
  hull.setVerticesData(VertexBuffer.ColorKind, colours.flatMap(color => rings[0].flatMap(() => [color.r, color.g, color.b, 1])))
  solid.push(place(hull))

  for (const [z, width] of [[-.48, .58], [.02, .68], [.49, .52]]) {
    const seat = MeshBuilder.CreateBox(`visitor-seat-${index}`, { width, height: .045, depth: .17 }, scene)
    seat.position.set(0, .005, z); tint(seat, timber)
  }
  // A few separate floorboards make the interior readable from the entrance.
  for (const x of [-.12, 0, .12]) {
    const plank = MeshBuilder.CreateBox(`visitor-floor-${index}`, { width: .10, height: .018, depth: 1.10 }, scene)
    plank.position.set(x, -.135, -.04); tint(plank, inside)
  }
  const mast = MeshBuilder.CreateCylinder(`visitor-mast-${index}`, { diameter: .022, height: .85, tessellation: 8 }, scene)
  mast.position.set(0, .405, -.57); tint(mast, inside.scale(.6))

  // The flag's shallow fold is geometry, with no cloth simulation or animation.
  // Start at the bottom edge so the atlas's V direction keeps flags upright.
  const flagPaths = [1, 0].map(row => Array.from({ length: 7 }, (_, step) => {
    const u = step / 6
    return new Vector3(.015 + u * .46, .79 - row * .345 - Math.sin(u * Math.PI) * .018, -.57 + Math.sin(u * Math.PI * 1.5) * .035)
  }))
  const flag = MeshBuilder.CreateRibbon(`visitor-flag-${index}`, { pathArray: flagPaths, sideOrientation: Mesh.DOUBLESIDE, frontUVs: flagUV, backUVs: flagUV }, scene)
  place(flag)
  return { solid, flag }
}
