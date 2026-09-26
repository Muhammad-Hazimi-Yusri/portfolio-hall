import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../src/data/community.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } })
const { readCommunity, emptyCommunity, ridgeHeights, visitPosition } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
for (const value of [null, [], {}, { mode: 'offline' }, { mode: 'other', days: [] }]) assert.deepEqual(readCommunity(value), emptyCommunity)
const result = readCommunity({ mode: 'local', days: [
  { day: '2026-02-30', visits: 50 }, { day: '2026-02-28', visits: 3 }, { day: '2026-02-27', visits: Infinity },
  { day: '2026-02-28', visits: 3 }, { day: '2026-02-26', visits: -2 },
], visits: [{ country: '<script>', zone: 'work' }, { country: 'GB', zone: 'private' }], notes: [{ id: {}, message: '<script>plain text</script>', name: { private: 1 } }] })
assert.equal(result.total, 3, 'Invalid dates/nonfinite counts/duplicate dates cannot inflate the graph')
assert.deepEqual(result.days.map(day => day.day), ['2026-02-26', '2026-02-28'])
assert.deepEqual(result.visits, [{ country: '??', zone: 'work' }])
assert.equal(result.notes[0].name, 'A visitor')
assert.equal(result.notes[0].message, '<script>plain text</script>', 'Untrusted notes remain plain text for React/canvas, never HTML')
const bounded = readCommunity({ mode: 'live', visits: Array(300).fill({ country: 'GB', zone: 'about' }), notes: Array(300).fill({ message: 'x'.repeat(300), name: 'n'.repeat(100) }) })
assert.equal(bounded.visits.length, 12); assert.equal(bounded.notes.length, 12)
assert.equal(bounded.notes[0].message.length, 180); assert.equal(bounded.notes[0].name.length, 32)
assert.equal(new Set(bounded.notes.map(note => note.id)).size, 12)
assert.ok(ridgeHeights([]).every(height => height === 0), 'No invented mountain with no visits')
assert.deepEqual(ridgeHeights([{ day: 'a', visits: 5 }, { day: 'b', visits: 10 }]).slice(0, 2), [6, 12], 'Skyline height is linear in the count')
assert.ok(visitPosition({ country: '??', zone: 'about' }, 0).x > 7, 'Boats stay outside the experience deck')
console.log('PASS: community payload bounds, honest counts, literal notes and linear skyline')
