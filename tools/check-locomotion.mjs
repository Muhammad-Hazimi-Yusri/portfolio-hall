import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/3d/locomotion.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { walkingStep, jumpStep, shortestYaw } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const close = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-8, `${message}: ${a} vs ${b}`)
for (const fps of [30, 60, 90, 120, 170]) {
  let distance = 0, diagonal = 0, height = 1.6, velocity = 0
  for (let frame = 0; frame < fps; frame++) {
    distance += walkingStep(0, 1, 0, 1 / fps, false).z
    const step = walkingStep(1, 1, 0, 1 / fps, false)
    diagonal += Math.hypot(step.x, step.z)
    const jump = jumpStep(height, velocity, 1 / fps, frame === 0)
    height = jump.height; velocity = jump.velocity
  }
  close(distance, 2.6, `Walking distance at ${fps} fps`)
  close(diagonal, distance, `Diagonal speed at ${fps} fps`)
  close(height, 1.6, `Jump has landed at ${fps} fps`)
  const running = walkingStep(0, 1, 0, 1 / fps, true)
  close(running.z * fps, 5.2, 'Running speed')
}
for (const fps of [30, 60, 120]) {
  let height = 1.6, velocity = 0
  for (let frame = 0; frame < fps / 3; frame++) ({ height, velocity } = jumpStep(height, velocity, 1 / fps, frame === 0))
  close(height, 1.6 + 2 / 3, 'Same jump apex regardless of refresh rate')
}
assert.deepEqual(walkingStep(0, 0, 0, .016, false), { x: 0, z: 0 })
assert.deepEqual(walkingStep(.01, .01, 0, .016, false), { x: 0, z: 0 })
close(walkingStep(0, 1, Math.PI / 2, .05, false).x, .13, 'Yaw turns forward movement')
assert.ok(walkingStep(0, 1, 0, 4, false).z <= .13, 'A suspended tab cannot produce a large movement jump')
close(shortestYaw(Math.PI - .01, -Math.PI + .01), Math.PI + .01, 'Travel takes the short rotation across the wrap seam')
console.log('PASS: frame-independent walking/running/jump, diagonal normalization, dead zone, resume clamp and shortest rotation')
