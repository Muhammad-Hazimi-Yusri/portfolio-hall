import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/3d/browseLook.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { createBrowseLook, lookTarget } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)

for (const [position, target] of [
  [{ x: 14.5, y: 8.5, z: -15 }, { x: 0, y: 1.4, z: 12 }],
  [{ x: -.15, y: 2.2, z: 33.7 }, { x: -4.5, y: 1.85, z: 36 }],
]) {
  const result = { x: 0, y: 0, z: 0 }
  lookTarget(position, target, 0, 0, result)
  assert.ok(distance(result, target) < 1e-10, 'Reset must recover the guided target')
  for (const yaw of [-Math.PI, -1, 1, Math.PI * 6]) for (const pitch of [-20, -.3, .3, 20]) {
    lookTarget(position, target, yaw, pitch, result)
    assert.ok(Math.abs(distance(position, result) - distance(position, target)) < 1e-10, 'Looking changes direction, never the viewing distance')
    assert.ok(Math.hypot(result.x - position.x, result.z - position.z) > 0.1, 'Looking up/down must not invert or reach a vertical singularity')
    assert.ok(Object.values(result).every(Number.isFinite))
  }
}

class Canvas extends EventTarget {
  captured = new Set()
  classes = new Set()
  classList = { add: name => this.classes.add(name), remove: name => this.classes.delete(name) }
  hasPointerCapture(id) { return this.captured.has(id) }
  setPointerCapture(id) { this.captured.add(id) }
  releasePointerCapture(id) { this.captured.delete(id) }
}
globalThis.window = new EventTarget()
const canvas = new Canvas()
let enabled = true, dragCount = 0
const changes = []
const look = createBrowseLook(canvas, { enabled: () => enabled, wake: () => {}, onChange: value => changes.push(value), onDrag: () => dragCount++, radiansPerPixel: () => .0015 })
const pointer = (type, x = 0, y = 0, extra = {}) => {
  const event = new Event(type, { cancelable: true })
  Object.assign(event, { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1, clientX: x, clientY: y, ...extra })
  canvas.dispatchEvent(event)
}

pointer('pointerdown'); pointer('pointermove', 3, 2); pointer('pointerup', 3, 2)
assert.equal(look.blocksPick, false, 'A click with small hand jitter must remain a click')
assert.equal(dragCount, 0)
assert.equal(look.update(16, false), false)

pointer('pointerdown'); pointer('pointermove', 8)
assert.equal(look.dragging, true, 'A deliberate short drag must be recognised before the frame activates')
assert.equal(canvas.captured.has(1), true)
assert.equal(look.update(16, false), true)
assert.equal(changes.at(-1), true, 'Show the reset control after leaving the guided view')
pointer('pointerup', 8)
assert.equal(look.blocksPick, true, 'Do not activate a frame when the drag ends')
assert.equal(canvas.captured.size, 0)
await Promise.resolve()
assert.equal(look.blocksPick, true, 'The engine may finish the previous pick after DOM release')
pointer('pointerdown', 8); pointer('pointerup', 8)
assert.equal(look.blocksPick, false, 'The next deliberate click must not be delayed or consumed')
assert.equal(look.update(16, false), false, 'Releasing the pointer leaves no inertial spin or continuous render request')

look.reset()
for (let i = 0; i < 100; i++) look.update(16, false)
assert.equal(changes.at(-1), false, 'Hide Reset after the guided view is restored')
assert.equal(look.update(16, false), false, 'The reset must settle completely')

for (const extra of [{ pointerType: 'touch' }, { button: 2 }, { isPrimary: false }]) {
  pointer('pointerdown', 0, 0, extra); pointer('pointermove', 100, 100, extra); pointer('pointerup', 100, 100, extra)
  assert.equal(look.dragging, false)
  assert.equal(look.update(16, false), false, 'Touch scrolling, alternate buttons and secondary pointers stay with their existing controls')
}
pointer('pointerdown'); pointer('pointermove', 8)
pointer('pointermove', 8, 0, { buttons: 0 })
pointer('pointerup', 8)
assert.equal(look.dragging, false)
assert.equal(look.blocksPick, true, 'A final button-release move must not turn a short drag into a click')
look.reset(true)
const beforeDisabled = dragCount
enabled = false
pointer('pointerdown'); pointer('pointermove', 200); pointer('pointerup', 200)
assert.equal(dragCount, beforeDisabled, 'Island and embedded-app input must not start a hall look')
assert.equal(look.blocksPick, false, 'An island pointer gesture clears the previous hall drag')
enabled = true
pointer('pointerdown'); pointer('pointermove', 100)
window.dispatchEvent(new Event('blur'))
assert.equal(look.dragging, false, 'Losing window focus releases the gesture')
assert.equal(canvas.captured.size, 0)
assert.equal(look.blocksPick, true, 'A cancelled drag must not turn into a delayed frame activation')
look.reset(true)
assert.equal(look.update(16, true), false, 'Reduced-motion reset is immediate')
pointer('pointerdown'); pointer('pointermove', 100)
pointer('pointercancel', 100)
assert.equal(look.dragging, false, 'Cancelled pointers must not leave dragging stuck on')
look.dispose()
pointer('pointerdown'); pointer('pointermove', 100)
assert.equal(look.dragging, false, 'Disposal removes input handlers')
delete globalThis.window
console.log('PASS: view geometry, click/drag separation, capture release, touch/world isolation, reset settling and disposal')
