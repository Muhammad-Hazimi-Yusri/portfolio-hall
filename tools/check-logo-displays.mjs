import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function sourceModule(file) {
  const source = fs.readFileSync(new URL(file, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { extrudeLogoMask } = await sourceModule('../src/3d/logoGeometry.ts')
const { idleLogoPose, logoTracksCamera, facingYaw, approachAngle } = await sourceModule('../src/3d/logoMotion.ts')

// A letter counter must remain an actual hole through both caps, with closed
// interior walls. Its volume is the filled pixel area times the extrusion depth.
const mask = new Uint8ClampedArray(3 * 3 * 4).fill(255)
mask[4 * 4 + 3] = 0
const geometry = extrudeLogoMask(mask, 3, 3, 3, 3, 0.2)
const { positions, indices, normals, uvs } = geometry
assert.equal(normals.length, positions.length)
assert.equal(uvs.length, positions.length / 3 * 2)
let signedVolume = 0
const capAreas = new Map([[-0.1, 0], [0.1, 0]])
for (let i = 0; i < indices.length; i += 3) {
  const [a, b, c] = indices.slice(i, i + 3).map(index => positions.slice(index * 3, index * 3 + 3))
  const cross = [b[1] * c[2] - b[2] * c[1], b[2] * c[0] - b[0] * c[2], b[0] * c[1] - b[1] * c[0]]
  signedVolume += a.reduce((sum, value, axis) => sum + value * cross[axis], 0) / 6
  if (a[2] === b[2] && b[2] === c[2]) {
    const area = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])) / 2
    capAreas.set(a[2], capAreas.get(a[2]) + area)
    const center = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3]
    assert.ok(Math.abs(center[0]) >= 0.5 || Math.abs(center[1]) >= 0.5, 'A cap filled the letter counter')
  }
}
assert.ok(Math.abs(Math.abs(signedVolume) - 1.6) < 1e-9, 'Extrusion must enclose the full depth, including its back')
assert.deepEqual([...capAreas.values()], [8, 8], 'Both caps must match the same silhouette')
assert.equal(extrudeLogoMask(new Uint8ClampedArray(36), 3, 3, 3, 3, 0.2).indices.length, 0, 'Transparent background must create no surface')

assert.ok(idleLogoPose('left-right', 3).yaw > 0)
assert.ok(Math.abs(idleLogoPose('left-right', 3).yaw) <= Math.PI / 9, 'Idle sway must stay within twenty degrees')
assert.ok(idleLogoPose('left-right', 9).yaw < 0)
assert.ok(idleLogoPose('right-left', 3).yaw < 0)
assert.ok(idleLogoPose('right-left', 9).yaw > 0)
assert.equal(idleLogoPose('bob', 0.9).yaw, 0)
assert.ok(idleLogoPose('bob', 0.9).lift > 0 && idleLogoPose('bob', 2.7).lift < 0)
assert.equal(logoTracksCamera(true, false, 20, false).tracking, true)
assert.equal(logoTracksCamera(false, true, 20, false).tracking, true)
assert.equal(logoTracksCamera(false, false, 5.9, false).tracking, true)
assert.equal(logoTracksCamera(false, false, 6.5, true).tracking, true)
assert.equal(logoTracksCamera(false, false, 7.1, true).tracking, false)
for (const [x, z] of [[0, -4], [4, 0], [0, 4], [-4, 0]]) {
  const yaw = facingYaw(x, z)
  assert.ok(Math.abs(-Math.sin(yaw) - x / 4) < 1e-9)
  assert.ok(Math.abs(-Math.cos(yaw) - z / 4) < 1e-9)
}
assert.ok(Math.abs(approachAngle(Math.PI - 0.01, -Math.PI + 0.01, 0.5) - Math.PI) < 1e-9, 'Tracking must take the short turn across the angle boundary')
console.log('PASS: closed front/back extrusion, open letter counters, opposite idle turns, bobbing, proximity and camera-facing angles')
