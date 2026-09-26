import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({
  stdin: { contents: `export * from './src/3d/exhibitGeometry.ts';
    export { createVisitorBoat, createVisitorBoatTarget } from './src/3d/visitorBoat.ts';
    export { createVisitorRidge } from './src/3d/visitorRidge.ts';
    export { createDistantShore } from './src/3d/landscape.ts';
    export { createFpvDrone } from './src/3d/fpvDrone.ts';
    export { visitPosition } from './src/data/community.ts';
    export { NullEngine } from '@babylonjs/core/Engines/nullEngine';
    export { Scene } from '@babylonjs/core/scene';
    export { Mesh } from '@babylonjs/core/Meshes/mesh';
    export { Vector3, Vector4 } from '@babylonjs/core/Maths/math.vector';
    export { Ray } from '@babylonjs/core/Culling/ray';
    export { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';`, resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
})
const { roundedBox, roundedOutline, profilePrism, thinRing, batchAssembly, createVisitorBoat, createVisitorBoatTarget, createVisitorRidge, createDistantShore, createFpvDrone, visitPosition, NullEngine, Scene, Mesh, Vector3, Vector4, Ray, StandardMaterial } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
const engine = new NullEngine(), scene = new Scene(engine)
const validate = mesh => {
  const vertices = mesh.getVerticesData('position'), normals = mesh.getVerticesData('normal'), indices = mesh.getIndices()
  assert.ok(vertices.every(Number.isFinite) && normals.every(Number.isFinite))
  assert.equal(normals.length, vertices.length)
  for (let i = 0; i < normals.length; i += 3) assert.ok(Math.abs(Math.hypot(...normals.slice(i, i + 3)) - 1) < 1e-5, 'Surface normals must remain unit length')
  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = indices.slice(i, i + 3)
    assert.ok([a, b, c].every(value => value >= 0 && value < vertices.length / 3))
    const pa = Vector3.FromArray(vertices, a * 3), pb = Vector3.FromArray(vertices, b * 3), pc = Vector3.FromArray(vertices, c * 3)
    const cross = Vector3.Cross(pb.subtract(pa), pc.subtract(pa))
    assert.ok(cross.length() > 1e-9, 'No collapsed triangles')
    assert.ok(Vector3.Dot(cross, Vector3.FromArray(normals, a * 3)) < 0, 'Front-face winding must agree with Babylon normals')
  }
}
for (const [w, h, d, radius] of [[1.3, .125, 1.12, .06], [.48, .34, .77, .045], [.36, .22, .009, .004], [6.2, .16, 2.5, .045]]) {
  const mesh = roundedBox('bevel-check', w, h, d, radius, scene)
  validate(mesh)
  const bounds = mesh.getBoundingInfo().boundingBox
  for (const [axis, size] of [['x', w], ['y', h], ['z', d]]) {
    assert.ok(Math.abs(bounds.minimum[axis] + size / 2) < 1e-5)
    assert.ok(Math.abs(bounds.maximum[axis] - size / 2) < 1e-5)
  }
}
for (const outline of [roundedOutline(1.09, 1.04, .14), [[-.24, -.21], [.23, -.21], [.218, -.12], [.08, .22], [.015, .29], [-.065, .26], [-.2, -.025]]]) {
  validate(profilePrism('profile-check', outline, .09, scene))
  validate(profilePrism('reverse-profile-check', [...outline].reverse(), .09, scene))
}
const ring = thinRing('pad-ring-check', 3.38, .016, 64, scene)
validate(ring)
assert.ok(ring.getTotalIndices() / 3 < 2048, 'A narrow rim must fit its small geometry budget')
assert.ok(Math.abs(ring.getBoundingInfo().boundingBox.maximum.y - .008) < 1e-5)
// Batching must keep every part in the right place when the assembly is translated
// far from the hall and has a rotated, animated parent.
const root = new Mesh('assembly-root', scene)
root.position.set(-160, 1.25, 6.9); root.rotation.y = .2; root.layerMask = 0x20000000
root.metadata = { worldAction: 'source-next' }
const material = new StandardMaterial('same-material', scene)
const parts = [roundedBox('left', .4, .5, .6, .04, scene), roundedBox('right', .2, .3, .4, .03, scene)]
parts.forEach((mesh, i) => { mesh.parent = root; mesh.position.set(i * .7, .3 + i * .2, .1); mesh.material = material })
const worldVertices = mesh => {
  const matrix = mesh.computeWorldMatrix(true), points = mesh.getVerticesData('position'), result = []
  for (let i = 0; i < points.length; i += 3) result.push(Vector3.TransformCoordinates(Vector3.FromArray(points, i), matrix))
  return result
}
const before = parts.flatMap(worldVertices)
const merged = batchAssembly(parts, root)
const after = merged.flatMap(worldVertices)
assert.equal(before.length, after.length)
for (let i = 0; i < before.length; i++) assert.ok(Vector3.Distance(before[i], after[i]) < 1e-4, 'Batching must preserve world placement')
assert.ok(merged.every(mesh => mesh.parent === root && mesh.layerMask === root.layerMask && mesh.metadata.worldAction === 'source-next'))
// Exercise the real drone constructor and Babylon hit geometry. The canvas
// stub supports its texture setup only; actual appearance is checked in-browser.
engine.createCanvas = (width, height) => ({ width, height, getContext: () => ({ fillRect() {}, drawImage() {} }), remove() {} })
scene.metadata = {}
const dronePosition = new Vector3(40, 3, 50)
const drone = createFpvDrone(scene, dronePosition, 0x20000000)
const droneOriginals = new Map(drone.meshes.map(mesh => [mesh, mesh.material]))
for (const [detail, from, direction] of [
  ['camera', new Vector3(0, .416, -3), new Vector3(0, 0, 1)],
  ['wiring', new Vector3(.12, 3, .68), new Vector3(0, -1, 0)],
  ['lights', new Vector3(1.03 * .43, 3, -.96 * .43), new Vector3(0, -1, 0)],
]) {
  const hit = scene.pickWithRay(new Ray(from.add(dronePosition), direction))
  assert.equal(hit.pickedMesh?.metadata.droneDetail, detail, `The actual ${detail} component must remain selectable after batching`)
  drone.setDetail(detail)
  assert.ok(drone.meshes.some(mesh => mesh.material !== droneOriginals.get(mesh)), 'An inspected component must have a visible material cue')
  for (const mesh of drone.meshes) if (mesh.metadata.droneDetail !== detail) assert.equal(mesh.material, droneOriginals.get(mesh), 'Inspection must leave unrelated components unchanged')
}
const inspectionResources = [scene.meshes.length, scene.materials.length, scene.textures.length]
for (let round = 0; round < 8; round++) for (const detail of ['camera', 'wiring', 'lights', null]) {
  drone.setDetail(detail)
  assert.deepEqual([scene.meshes.length, scene.materials.length, scene.textures.length], inspectionResources, 'Repeated inspection must reuse its geometry and materials')
  scene.metadata.needsRender = false
  drone.setDetail(detail)
  assert.equal(scene.metadata.needsRender, false, 'An unchanged inspection must let rendering sleep')
}
for (const mesh of drone.meshes) assert.equal(mesh.material, droneOriginals.get(mesh), 'Closing inspection must restore the original materials')
// Check the actual geometry after its local seat/mast transforms and world
// placement have been applied. In particular, no hull may float above water
// or intrude into the widest deck when all twelve visits share one section.
const fleet = []
for (let i = 0; i < 12; i++) {
  const visit = { country: i % 2 ? 'GB' : '??', zone: 'about' }
  const pose = visitPosition(visit, i)
  const boat = createVisitorBoat(scene, i, pose, new Vector4(.01, .51, .24, .74))
  const target = createVisitorBoatTarget(scene, i, pose, visit)
  const hit = scene.pickWithRay(new Ray(new Vector3(pose.x, 4, pose.z), new Vector3(0, -1, 0)))
  assert.equal(hit.pickedMesh, target, 'A tap at each rotated boat must reach its target with normal scene picking')
  assert.equal(hit.pickedMesh.metadata.portfolioRoute, '#guestbook/visitors')
  assert.match(hit.pickedMesh.metadata.navigationLabel, /Experience$/)
  assert.ok(target.visibility === 0 && !target.material && target.getTotalIndices() / 3 <= 12, 'Hit volumes add no rendered material and keep picking cheap')
  const hullPoints = boat.solid[0].getVerticesData('position'), hullNormals = boat.solid[0].getVerticesData('normal')
  assert.ok(hullNormals.every(Number.isFinite))
  for (let vertex = 33; vertex < 66; vertex++) {
    const offset = vertex * 3
    assert.ok(hullPoints[offset] * hullNormals[offset] + hullPoints[offset + 2] * hullNormals[offset + 2] > 0, 'Outer hull normals must face away from the cockpit')
  }
  const points = boat.solid.flatMap(worldVertices)
  const xs = points.map(point => point.x), ys = points.map(point => point.y), zs = points.map(point => point.z)
  assert.ok(points.every(point => [point.x, point.y, point.z].every(Number.isFinite)))
  assert.ok(Math.min(...ys) < -.26 && Math.max(...ys) > .6, 'Keel must be submerged and the flagstaff above water')
  assert.ok(Math.min(...xs) > 7.1, 'Boats must clear the full seven-metre experience deck radius')
  assert.ok(boat.solid.reduce((sum, mesh) => sum + mesh.getTotalIndices() / 3, 0) < 700, 'Opaque boat detail has a bounded triangle budget')
  for (const mesh of boat.solid) assert.equal(mesh.getVerticesData('color').length, mesh.getTotalVertices() * 4, 'Every solid part must retain its colour when merged')
  const bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs) }
  for (const other of fleet) assert.ok(bounds.maxX < other.minX || bounds.minX > other.maxX || bounds.maxZ < other.minZ || bounds.minZ > other.maxZ, 'Twelve hulls must not overlap')
  fleet.push(bounds)
  const flagPoints = boat.flag.getVerticesData('position'), flagUVs = boat.flag.getVerticesData('uv')
  const topUVs = [], bottomUVs = []
  for (let vertex = 0; vertex < boat.flag.getTotalVertices(); vertex++) {
    if (flagPoints[vertex * 3 + 1] > .7) topUVs.push(flagUVs[vertex * 2 + 1])
    if (flagPoints[vertex * 3 + 1] < .5) bottomUVs.push(flagUVs[vertex * 2 + 1])
  }
  assert.ok(Math.min(...topUVs) > Math.max(...bottomUVs), 'Country flags must be upright on both sides')
  const combined = Mesh.MergeMeshes(boat.solid, true, true)
  assert.ok(combined && combined.getVerticesData('color').length === combined.getTotalVertices() * 4)
  combined.dispose(); boat.flag.dispose(); target.dispose()
}
// The visitor landscape must remain a faithful graph, with no visible ridge
// for empty days and no overshoot invented between the recorded values.
for (const counts of [Array(28).fill(0), Array.from({ length: 28 }, (_, i) => i === 27 ? 12 : 0), Array.from({ length: 28 }, (_, i) => i % 2 ? 12 : 6)]) {
  const ridge = createVisitorRidge(scene, counts.map((visits, i) => ({ day: `day-${i}`, visits })))
  const mesh = ridge.meshes[0], positions = mesh.getVerticesData('position'), normals = mesh.getVerticesData('normal')
  validate(mesh)
  assert.ok(normals.filter((_, i) => i % 3 === 1).every(y => y > 0), 'Landscape normals must face up toward the light')
  assert.ok(mesh.getBoundingInfo().boundingBox.minimum.x > 14, 'Visitor terrain clears all visitor boats')
  const crestHeights = []
  for (let i = 0; i < positions.length; i += 3) if (Math.abs(positions[i] - 48) < 1e-5) crestHeights.push(positions[i + 1] + .35)
  assert.ok(crestHeights[0] < .09 && crestHeights.at(-1) < .09, 'Both physical ends must close below the waterline')
  for (let day = 0; day < 28; day++) assert.ok(Math.abs(crestHeights[day * 4 + 4] - counts[day]) < 1e-5, 'Each daily crest must keep its exact count-derived height')
  for (let day = 0; day < 27; day++) for (let step = 0; step <= 4; step++) {
    const height = crestHeights[day * 4 + step + 4]
    assert.ok(height >= Math.min(counts[day], counts[day + 1]) - 1e-5 && height <= Math.max(counts[day], counts[day + 1]) + 1e-5, 'Smoothing must not invent intermediate peaks')
  }
  if (!counts.some(Boolean)) assert.ok(positions.filter((_, i) => i % 3 === 1).every(y => y < -.26), 'Empty history must stay below the waterline')
  for (const [day, count] of counts.entries()) if (count > 0) {
    const hit = scene.pickWithRay(new Ray(new Vector3(48, 20, 93 - day * 102 / 27), new Vector3(0, -1, 0)))
    assert.equal(hit.pickedMesh, mesh, 'A visible daily crest must be selectable with ordinary scene picking')
    assert.equal(hit.pickedMesh.metadata.portfolioRoute, '#guestbook/analytics')
    assert.equal(hit.pickedMesh.metadata.guestbookIntent, 'analytics')
  }
  const selection = ridge.meshes[2], meshCount = scene.meshes.length, materialCount = scene.materials.length
  assert.equal(selection.isEnabled(), false, 'Day highlighting stays absent during ordinary browsing')
  for (let day = 0; day < 28; day++) {
    ridge.selectDay(`day-${day}`)
    assert.ok(selection.isEnabled() && !selection.isPickable, 'The day highlight must not intercept the landscape action')
    const bounds = selection.getBoundingInfo().boundingBox
    assert.ok(Math.abs((bounds.minimum.z + bounds.maximum.z) / 2 - (93 - day * 102 / 27)) < 1e-4, 'Selection must follow the actual date along the ridge')
    assert.ok(selection.getVerticesData('position').every(Number.isFinite))
    if (!counts[day]) assert.ok(bounds.maximum.y < 0, 'Selecting an empty day must not create a hill')
    assert.equal(scene.meshes.length, meshCount, 'Scrubbing must reuse the same geometry')
    assert.equal(scene.materials.length, materialCount, 'Scrubbing must reuse the same material')
    scene.metadata.needsRender = false
    scene.metadata.waterReflectionsDirty = false
    ridge.selectDay(`day-${day}`)
    assert.equal(scene.metadata.needsRender, false, 'An unchanged selection must let the renderer sleep')
    assert.equal(scene.metadata.waterReflectionsDirty, false, 'An unchanged selection must not refresh water passes')
  }
  ridge.selectDay(null)
  assert.equal(selection.isEnabled(), false, 'Leaving the chart must remove its highlight')
  ridge.meshes.forEach(part => part.dispose()); ridge.materials.forEach(material => material.dispose())
}
const shores = createDistantShore(scene)
shores.forEach(mesh => {
  validate(mesh)
  assert.ok(mesh.getVerticesData('normal').filter((_, i) => i % 3 === 1).every(y => y > 0))
  assert.ok(mesh.getVerticesData('color').every(value => Number.isFinite(value) && value >= 0 && value <= 1), 'Baked terrain shading must remain finite and bounded')
  assert.ok(mesh.getVerticesData('uv').every(Number.isFinite), 'Terrain texture coordinates must stay finite')
  const bounds = mesh.getBoundingInfo().boundingBox
  assert.ok(bounds.minimum.x > 100 || bounds.minimum.z > 110, 'Scenery must clear the hall, visitor boats and visitor graph')
  const positions = mesh.getVerticesData('position'), indices = mesh.getIndices(), edges = new Map()
  for (let i = 0; i < indices.length; i += 3) {
    for (const [a, b] of [[indices[i], indices[i + 1]], [indices[i + 1], indices[i + 2]], [indices[i + 2], indices[i]]]) {
      const key = [Math.min(a, b), Math.max(a, b)].join(',')
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
  }
  for (const [edge, count] of edges) if (count === 1) {
    assert.ok(edge.split(',').every(vertex => positions[Number(vertex) * 3 + 1] < -.26), 'Crop boundaries must close below the waterline')
  }
})
assert.ok(shores.reduce((sum, mesh) => sum + mesh.getTotalIndices() / 3, 0) <= 24576, 'Real relief must fit the previous procedural terrain budget')
scene.dispose(); engine.dispose()
console.log('PASS: bevels, assembly batching, drone component picking and reuse, boat clearance, merged colours, upward terrain normals and faithful visitor heights')
