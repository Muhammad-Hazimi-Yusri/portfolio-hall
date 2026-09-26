import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

const source = fs.readFileSync(new URL('../src/components/portfolio/hallScroll.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { hallAnchorTop, hallScrollFrame, sectionDefocus } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const anchors = [
  { view: '', section: '', top: 0 },
  { view: 'reporting-workbench', section: 'work', top: 100 },
  { view: 'food-wars', section: 'projects', top: 300 },
  { view: 'experience/tnei', section: 'about', top: 600 },
  { view: 'contact', section: 'contact', top: 900 },
]
assert.equal(hallScrollFrame([], 0, 0), null)
assert.equal(hallScrollFrame(anchors, -20, 1000).view, '')
assert.equal(hallScrollFrame(anchors, 300, 1000).view, 'food-wars')
assert.equal(hallScrollFrame(anchors, 900, 1000).view, 'contact')
assert.equal(hallScrollFrame(anchors, 1200, 1000).progress, 1)
assert.equal(hallScrollFrame(anchors, 0, 0).progress, 0)
for (let position = 0; position <= 1000; position += 5) {
  const frame = hallScrollFrame(anchors, position, 1000)
  assert.ok(Number.isFinite(frame.mix) && frame.mix >= 0 && frame.mix <= 1)
  assert.equal(anchors.find(item => item.view === frame.view).section, frame.section, 'Navigation must follow the visible display')
}
const before = hallScrollFrame(anchors, 299.99, 1000)
const after = hallScrollFrame(anchors, 300.01, 1000)
assert.ok(before.mix > 0.999 && after.mix < 0.001, 'Interpolation must meet at the same camera waypoint without a jump')
assert.ok(Number.isFinite(hallScrollFrame([anchors[0], { ...anchors[1], top: 0 }], 0, 0).mix), 'Collapsed offsets on a small viewport must not divide by zero')
assert.equal(hallScrollFrame([anchors[2]], 400, 800).view, 'food-wars', 'Scrolling project notes must stay at that project')
console.log('PASS: scroll endpoints, section alignment, waypoint continuity, small-viewport offsets and project-detail focus')
for (const height of [240, 600, 816]) {
  const cards = [0, 280, 390, 520, 680].map((top, index) => ({ view: `project-${index}`, section: 'projects', top: hallAnchorTop(top, height, 1000) }))
  for (const card of cards) assert.equal(hallScrollFrame(cards, card.top, 1000).view, card.view, 'Returning to a short card must not select its neighbour')
}
assert.equal(hallAnchorTop(1300, 600, 1000), 1000, 'The final section remains reachable at the scroll limit')
console.log('PASS: shared return-to-gallery alignment on short/tall viewports')
assert.equal(sectionDefocus(800, 800), 1, 'The full incoming section starts blurred')
assert.equal(sectionDefocus(190, 800), 0, 'Content must be clear by the reading position')
assert.equal(sectionDefocus(-100, 800), 0, 'Current and passed sections stay clear')
assert.ok(sectionDefocus(400, 800) > 0 && sectionDefocus(400, 800) < 1, 'Approaching content clears gradually')
for (let top = -50; top < 1000; top += 10) {
  assert.ok(sectionDefocus(top, 800) <= sectionDefocus(top + 10, 800), 'No blur flicker or reversal while approaching')
}
assert.ok(Number.isFinite(sectionDefocus(0, 0)), 'Collapsed viewports must not produce NaN styles')
console.log('PASS: whole-section blur, readable focus position and smooth reveal')
