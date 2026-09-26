import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('../src/components/portfolio/spatialSound.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm',
})
const { listeningSignal, createSpatialSound } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)

for (const rate of [8000, 44100, 48000, 96000, 192000]) {
  const signal = listeningSignal(rate)
  let peak = 0, energy = 0
  for (const value of signal) { assert.ok(Number.isFinite(value)); peak = Math.max(peak, Math.abs(value)); energy += value * value }
  assert.ok(peak > .1 && peak < .6, 'The sample contains sound with amplitude headroom')
  assert.ok(Math.sqrt(energy / signal.length) < .12, 'The loop remains a quiet intermittent sample')
  assert.ok(signal.subarray(0, rate * .01).every(value => value === 0), 'Silent loop start')
  assert.ok(signal.subarray(-rate * .01).every(value => value === 0), 'Silent loop end')
  assert.ok(signal.subarray(rate * 1.78, rate * 2.93).some(value => value !== 0), 'Both chimes are present')
}
for (const rate of [0, NaN, Infinity, 1000000]) assert.throws(() => listeningSignal(rate), RangeError)

function audioContext(state = 'running') {
  const connections = [], fades = []
  const gain = { value: 0, cancelScheduledValues() {}, setValueAtTime(value) { this.value = value }, setTargetAtTime(value, time, duration) { fades.push({ value, time, duration }) } }
  const node = name => ({ connect(next) { connections.push([name, next.name]) }, disconnect() {}, name })
  const source = { ...node('source'), starts: 0, stops: [], onended: null, start() { this.starts++ }, stop(time) { this.stops.push(time) } }
  const panner = node('panner'), volume = { ...node('gain'), gain }
  const context = {
    sampleRate: 48000, currentTime: 3, state, closes: 0, destination: node('output'),
    createPanner: () => panner, createGain: () => volume, createBufferSource: () => source,
    createBuffer: (channels, length, rate) => ({ copyToChannel(data, channel) { assert.equal(channels, 1); assert.equal(channel, 0); assert.equal(data.length, length); assert.equal(rate, context.sampleRate) } }),
    close() { this.closes++; this.state = 'closed'; return Promise.resolve() },
  }
  return { context, source, gain, fades, connections }
}
const graph = audioContext()
const sound = createSpatialSound(graph.context)
assert.equal(graph.source.starts, 0, 'No sample starts before the camera supplies its listening pose')
assert.equal(graph.gain.value, 0, 'No sound leaks from the default origin')
assert.deepEqual(graph.connections, [['source', 'panner'], ['panner', 'gain'], ['gain', 'output']])
sound.start(); sound.start()
assert.equal(graph.source.starts, 1, 'Frame updates cannot start duplicate sources')
assert.ok(graph.fades.at(-1).duration > 0, 'Playback fades in')
sound.setVolume(0); assert.equal(graph.fades.at(-1).value, 0, 'The volume control can mute')
sound.setVolume(5); assert.ok(graph.fades.at(-1).value <= .15, 'Volume is bounded')
sound.stop()
assert.equal(graph.context.closes, 0, 'An explicit stop gives the gain time to fade')
assert.equal(graph.fades.at(-1).value, 0)
assert.ok(graph.source.stops[0] > graph.context.currentTime)
graph.source.onended()
sound.stop(true); sound.start()
assert.equal(graph.context.closes, 1, 'Cleanup is idempotent')
assert.equal(graph.source.starts, 1, 'A stopped source cannot restart')
for (const state of ['running', 'suspended']) {
  const pending = audioContext(state), player = createSpatialSound(pending.context)
  player.stop(); player.start()
  assert.equal(pending.context.closes, 1, 'Stopping before the camera is ready closes immediately')
  assert.equal(pending.source.starts, 0)
  const hidden = audioContext(state), playing = createSpatialSound(hidden.context)
  playing.start(); playing.stop(true)
  assert.equal(hidden.context.closes, 1, 'Hiding/leaving never waits for audio time')
}
const rapid = audioContext(), rapidSound = createSpatialSound(rapid.context)
rapidSound.start(); rapidSound.stop(); rapidSound.stop(true)
assert.equal(rapid.context.closes, 1, 'Hiding during the short stop fade still releases the context')
console.log('PASS: bounded chimes, silent loop boundaries, camera-synchronised start, volume, fades and rapid/hidden cleanup')
