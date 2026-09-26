import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import { build } from 'esbuild'

const { outputFiles } = await build({ entryPoints: ['src/3d/avvrMesh.ts'], bundle: true, write: false, platform: 'node', format: 'esm' })
const { decodeAvvrMesh, paintAvvrClasses } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
// Optional local archive check: restricted source data is never committed.
const root = new URL('../_local/avvr-archive/', import.meta.url)
const bytes = await fs.readFile(new URL('listening-reconstruction.bin', root))
const metadata = JSON.parse(await fs.readFile(new URL('listening-reconstruction.json', root), 'utf8'))
const buffer = Uint8Array.from(bytes).buffer, mesh = decodeAvvrMesh(buffer)
assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), metadata.sha256)
assert.equal(bytes.byteLength, metadata.bytes)
assert.ok(bytes.byteLength < 600_000, 'The reconstruction must remain a small, deferred asset')
assert.equal(mesh.positions.length / 3, metadata.vertices)
assert.equal(mesh.indices.length / 3, metadata.triangles)
for (let i = 0; i < mesh.positions.length; i++) {
  assert.ok(mesh.positions[i] >= metadata.bounds.min[i % 3] - .000001 && mesh.positions[i] <= metadata.bounds.max[i % 3] + .000001, 'Decoded positions must retain the archived bounds')
}
for (let i = 0; i < mesh.normals.length; i += 3) assert.ok(Math.abs(Math.hypot(...mesh.normals.slice(i, i + 3)) - 1) < .00001)
for (const index of mesh.indices) assert.ok(index < metadata.vertices)
assert.deepEqual([...new Set(mesh.classes)].sort(), [0, 1, 2, 3, 4, 5], 'All six source classes must survive')
// Highlighting must preserve the archived class colours, keep the context
// opaque, reuse its buffer and restore every original colour after clearing.
const colours = paintAvvrClasses(mesh.classes, new Float32Array(mesh.classes.length * 4))
const originalColours = colours.slice(), originalClasses = mesh.classes.slice()
for (let i = 0; i < mesh.classes.length; i++) {
  assert.deepEqual([...originalColours.slice(i * 4, i * 4 + 3)], metadata.materials[mesh.classes[i]].color.map(Math.fround), 'Full labels must match the separately exported source materials')
}
for (let selected = 0; selected < mesh.classCount; selected++) {
  assert.equal(paintAvvrClasses(mesh.classes, colours, selected), colours, 'Selection must reuse its existing colour buffer')
  let context
  for (let i = 0; i < mesh.classes.length; i++) {
    const rgb = [...colours.slice(i * 4, i * 4 + 3)]
    assert.equal(colours[i * 4 + 3], 1, 'Inspection must not introduce transparent geometry')
    if (mesh.classes[i] === selected) assert.deepEqual(rgb, [...originalColours.slice(i * 4, i * 4 + 3)], 'The highlighted class keeps its source colour')
    else {
      context ??= rgb
      assert.deepEqual(rgb, context, 'Other classes form a consistent neutral context')
      assert.notDeepEqual(rgb, [...originalColours.slice(i * 4, i * 4 + 3)])
    }
  }
}
paintAvvrClasses(mesh.classes, colours)
assert.deepEqual(colours, originalColours, 'Clearing a selection must restore all source colours')
assert.deepEqual(mesh.classes, originalClasses, 'Inspection cannot rewrite source predictions')
for (const invalid of [new ArrayBuffer(0), buffer.slice(0, -1), new ArrayBuffer(32)]) assert.throws(() => decodeAvvrMesh(invalid), /Invalid AVVR/)
const badIndex = buffer.slice(0); new DataView(badIndex).setUint16(badIndex.byteLength - 2, 65535, true)
assert.throws(() => decodeAvvrMesh(badIndex), /Invalid AVVR mesh index/)
const photo = await fs.readFile(new URL('listening-reference.png', root))
assert.equal(photo.readUInt32BE(16), 2690); assert.equal(photo.readUInt32BE(20), 1345)
assert.ok(photo.byteLength < 6_000_000)

// Optional archive verification compares every displayed triangle corner to
// its actual source position, independently of the export's vertex ordering.
if (process.argv[2]) {
  const obj = await fs.readFile(process.argv[2], 'utf8')
  assert.equal(crypto.createHash('sha256').update(obj).digest('hex'), metadata.sourceSHA256)
  const positions = [], expected = []
  for (const line of obj.split(/\r?\n/)) {
    if (line.startsWith('v ')) positions.push(line.trim().split(/\s+/).slice(1, 4).map(Number))
    else if (line.startsWith('f ')) {
      const face = line.trim().split(/\s+/).slice(1).map(token => Number(token.split('/')[0]) - 1)
      for (let i = 1; i < face.length - 1; i++) expected.push(face[0], face[i + 1], face[i])
    }
  }
  assert.equal(mesh.indices.length, expected.length)
  for (let i = 0; i < expected.length; i++) for (let axis = 0; axis < 3; axis++) assert.ok(Math.abs(mesh.positions[mesh.indices[i] * 3 + axis] - positions[expected[i]][axis]) < .000001, 'Display must preserve every source triangle')
  console.log(`PASS: all ${metadata.triangles} displayed triangles match the archived OBJ`)
}
console.log('PASS: archive hash, geometry bounds, normal/class integrity, reversible class highlighting, malformed-asset handling and size budget')
