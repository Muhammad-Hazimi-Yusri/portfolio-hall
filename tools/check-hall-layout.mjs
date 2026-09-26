import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function readData(relativePath) {
  const source = fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { hallDecks, hallStops, galleryPosition, galleryColumns } = await readData('../src/data/hallLayout.ts')
const { projects, professionalWork } = await readData('../src/data/portfolio.ts')
const onDeck = (x, z) => hallDecks.some(deck => deck.round
  ? Math.hypot(x - deck.x, z - deck.z) <= deck.width / 2
  : Math.abs(x - deck.x) <= deck.width / 2 && Math.abs(z - deck.z) <= deck.depth / 2)

// The route must be a walkable surface all the way through both bridge joins.
// Check a body-width corridor, not just a single centre line.
for (let z = -3; z <= 89; z += 0.1) {
  for (const x of [-0.8, 0, 0.8]) assert.ok(onDeck(x, z), `Gap in visitor route at ${x}, ${z.toFixed(1)}`)
}
for (const stop of hallStops) assert.ok(onDeck(0, stop.z), `Map stop ${stop.label} must land on a deck`)
const count = projects.length + professionalWork.length
const exhibitPositions = Array.from({ length: count }, (_, index) => galleryPosition(index, count))
const columns = galleryColumns(exhibitPositions)
assert.equal(new Set(columns).size, columns.length, 'Columns must not stack at the end of the gallery')
for (const z of columns) {
  assert.ok(Number.isFinite(z) && z >= 7.65 && z <= 58, 'Column must remain within the pavilion')
  for (const exhibitZ of exhibitPositions) assert.ok(Math.abs(z - exhibitZ) > 1.55 + .24, 'A column cap must not cover a project frame')
}
for (let i = 0; i < count; i++) {
  const z = galleryPosition(i, count)
  assert.ok(z - 1.55 >= 8 && z + 1.55 <= 58, 'The complete frame must fit on the gallery wall')
  assert.ok(onDeck(-0.15, z - 2.3), 'Exhibit viewing position must have a floor')
  if (i > 0) assert.ok(z - galleryPosition(i - 1, count) > 3.1, 'Exhibit frames must not overlap; extend the gallery when adding more work')
}
assert.equal(new Set(hallDecks.map(deck => deck.id)).size, hallDecks.length)
assert.equal(new Set(hallStops.map(stop => stop.id)).size, hallStops.length)
console.log(`PASS: continuous visitor route, ${hallStops.length} reachable map stops, ${count} framed exhibits with clear viewing positions`)
