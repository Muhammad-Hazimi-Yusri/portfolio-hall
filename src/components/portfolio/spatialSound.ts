/** Two soft synthetic chimes, generated locally only when someone presses Play.
 * The short upper harmonics give more position cues than a continuous sine tone. */
export function listeningSignal(sampleRate: number) {
  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 192000) throw new RangeError('Unsupported sample rate')
  const samples = new Float32Array(Math.ceil(sampleRate * 3.2))
  let random = 127, noise = 0
  const smoothing = 1 - Math.exp(-2 * Math.PI * 2600 / sampleRate)
  for (let i = 0; i < samples.length; i++) {
    const time = i / sampleRate
    const start = time < 1.6 ? .18 : 1.78
    const t = time - start
    if (t < 0 || t > 1.15) continue
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0
    noise += ((random / 0xffffffff * 2 - 1) - noise) * smoothing
    const phase = 2 * Math.PI * (time < 1.6 ? 277.18 : 415.30) * t
    const attack = Math.min(1, t / .018), release = Math.min(1, (1.15 - t) / .22)
    samples[i] = .62 * attack * release * Math.exp(-t / .24) * (
      .48 * Math.sin(phase) + .20 * Math.sin(phase * 2.01) + .08 * Math.sin(phase * 4.03) + .06 * noise
    )
  }
  return samples
}

const boundedVolume = (level: number) => Number.isFinite(level) ? Math.max(0, Math.min(1, level)) : 0

/** Start is deferred until the 3D camera has supplied its initial listening pose. */
export function createSpatialSound(context: AudioContext, initialVolume = .35) {
  const panner = context.createPanner()
  panner.panningModel = 'HRTF'; panner.distanceModel = 'inverse'
  panner.refDistance = 3; panner.maxDistance = 25; panner.rolloffFactor = .7
  const gain = context.createGain(); gain.gain.value = 0
  const source = context.createBufferSource()
  const signal = listeningSignal(context.sampleRate)
  const buffer = context.createBuffer(1, signal.length, context.sampleRate)
  buffer.copyToChannel(signal, 0); source.buffer = buffer; source.loop = true
  source.connect(panner); panner.connect(gain); gain.connect(context.destination)
  let level = boundedVolume(initialVolume), started = false, stopped = false, closed = false
  const close = () => {
    if (closed) return
    closed = true; source.disconnect(); panner.disconnect(); gain.disconnect()
    if (context.state !== 'closed') void context.close().catch(() => undefined)
  }
  source.onended = close
  const fade = (target: number, seconds: number) => {
    const now = context.currentTime, current = gain.gain.value
    gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(current, now)
    gain.gain.setTargetAtTime(target, now, seconds)
  }
  return {
    context, panner,
    start() {
      if (started || stopped || context.state === 'closed') return
      source.start(); started = true; fade(level * .15, .03)
    },
    setVolume(value: number) {
      level = boundedVolume(value)
      if (started && !stopped) fade(level * .15, .025)
    },
    stop(immediate = false) {
      if (stopped) { if (immediate) close(); return }
      stopped = true
      // Hidden pages and failed/suspended starts must not wait for audio time.
      if (immediate || !started || context.state !== 'running') { close(); return }
      fade(0, .012); source.stop(context.currentTime + .075)
    },
  }
}

export type SpatialSound = ReturnType<typeof createSpatialSound>
