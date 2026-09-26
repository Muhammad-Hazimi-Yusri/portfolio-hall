// Local, opt-in instrumentation. This module is never imported in a production build.
import { SceneInstrumentation } from '@babylonjs/core/Instrumentation/sceneInstrumentation'
import { EngineInstrumentation } from '@babylonjs/core/Instrumentation/engineInstrumentation'
import '@babylonjs/core/Engines/Extensions/engine.query'
import type { Scene } from '@babylonjs/core/scene'
import type { Engine } from '@babylonjs/core/Engines/engine'
import type { WaterMaterial } from '@babylonjs/materials/water'
import type { RenderTargetTexture } from '@babylonjs/core/Materials/Textures/renderTargetTexture'

export function attachPerformanceAudit(scene: Scene, engine: Engine) {
  const sceneId = crypto.randomUUID()
  scene.metadata ??= {}
  const panel = document.createElement('aside')
  panel.setAttribute('aria-label', 'Local performance audit')
  panel.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:999;background:#fff;color:#172f3a;padding:14px;width:330px;box-shadow:0 2px 20px #0003;font:12px/1.5 monospace;max-height:80vh;overflow:auto'
  panel.innerHTML = '<strong>Local performance audit</strong><p>6-second samples after scene warm-up.</p><div class="audit-controls"></div><button type="button">Start 6-second sample</button><button type="button" class="audit-scroll">Sample project scroll</button><button type="button" class="audit-section">Sample section transition</button><pre style="white-space:pre-wrap;margin-top:8px">Ready</pre>'
  document.body.append(panel)
  const output = panel.querySelector('pre')!
  const controls = panel.querySelector('.audit-controls')!
  const button = panel.querySelector('button')!
  const scrollButton = panel.querySelector<HTMLButtonElement>('.audit-scroll')!
  const sectionButton = panel.querySelector<HTMLButtonElement>('.audit-section')!
  const sceneStats = new SceneInstrumentation(scene)
  const engineStats = new EngineInstrumentation(engine)
  engineStats.captureGPUFrameTime = true
  const flags: Record<string, boolean> = {}
  const toggle = (label: string, initial: boolean, apply: (value: boolean) => void) => {
    const row = document.createElement('label')
    row.style.display = 'block'
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = initial
    row.append(input, document.createTextNode(` ${label}`)); controls.append(row)
    flags[label] = initial
    input.onchange = () => { flags[label] = input.checked; apply(input.checked); scene.metadata.needsRender = true }
  }
  toggle('Water passes', true, value => {
    scene.metadata.profileWaterDisabled = !value
    const water = scene.getMaterialByName('waterMat') as WaterMaterial | null
    water?.enableRenderTargets(false)
    scene.metadata.needsRender = true
  })
  toggle('Shadows', true, value => { scene.shadowsEnabled = value })
  toggle('Logos', true, value => scene.meshes.filter(mesh => mesh.name.endsWith('-solid-logo')).forEach(mesh => mesh.setEnabled(value)))
  toggle('Keep renderer awake', false, value => { scene.metadata.profileContinuous = value })
  toggle('Portal previews', true, value => { scene.metadata.profilePortalsDisabled = !value; scene.metadata.portalPreviewsDirty = true })
  toggle('Country flags', true, value => { scene.getMeshByName('visitor-flags')?.setEnabled(value); scene.metadata.needsRender = true })
  let start = 0, last = 0, before = 0
  let timer = 0
  let scrollFrame = 0
  let sampleKind = 'manual'
  let layoutReadsAtStart = 0, scrollUpdatesAtStart = 0
  let targetPasses: Record<string, number> = {}
  let longTasks: number[] = []
  const longTaskObserver = new PerformanceObserver(list => { if (start) longTasks.push(...list.getEntries().map(entry => entry.duration)) })
  const longTasksSupported = PerformanceObserver.supportedEntryTypes.includes('longtask')
  if (longTasksSupported) longTaskObserver.observe({ type: 'longtask', buffered: false })
  const observedTargets = new Set<RenderTargetTexture>()
  const targetObservers: (() => void)[] = []
  const watchRenderTargets = () => {
    for (const texture of scene.textures) {
      if (!texture.isRenderTarget) continue
      const target = texture as RenderTargetTexture
      if (observedTargets.has(target)) continue
      observedTargets.add(target)
      const observer = target.onBeforeRenderObservable.add(() => {
        if (start) targetPasses[target.name] = (targetPasses[target.name] ?? 0) + 1
      })
      targetObservers.push(() => target.onBeforeRenderObservable.remove(observer))
    }
  }
  watchRenderTargets()
  let intervals: number[] = [], cpu: number[] = [], gpu: number[] = [], draws: number[] = []
  const percentile = (values: number[], ratio: number) => {
    if (!values.length) return null
    const sorted = [...values].sort((a, b) => a - b)
    return Number(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))].toFixed(2))
  }
  const finish = () => {
    const now = performance.now()
    const result = {
      sceneId,
      sampleKind,
      portalBuilds: scene.metadata.portalBuilds ?? [],
      portal: scene.metadata.portalPhase ?? 'hall',
      camera: scene.activeCamera?.name,
      renderer: engine.getGlInfo().renderer,
      resolution: [engine.getRenderWidth(), engine.getRenderHeight()],
      seconds: Number(((now - start) / 1000).toFixed(2)),
      renderedFrames: cpu.length,
      renderedFps: Number((cpu.length * 1000 / (now - start)).toFixed(1)),
      frameMs: { p50: percentile(intervals, .5), p95: percentile(intervals, .95), p99: percentile(intervals, .99), max: percentile(intervals, 1) },
      longTasks: { supported: longTasksSupported, count: longTasksSupported ? longTasks.length : null, maxMs: percentile(longTasks, 1) },
      scrollLayout: {
        measurements: Number(document.querySelector<HTMLElement>('.hall-reading')?.dataset.hallLayoutReads ?? 0) - layoutReadsAtStart,
        updates: Number(document.querySelector<HTMLElement>('.hall-reading')?.dataset.hallScrollUpdates ?? 0) - scrollUpdatesAtStart,
      },
      targetPasses,
      targetSizes: Object.fromEntries([...observedTargets].filter(target => scene.textures.includes(target)).map(target => [target.name, target.getSize()])),
      cpuMs: { p50: percentile(cpu, .5), p95: percentile(cpu, .95) },
      gpuMs: { p50: percentile(gpu, .5), p95: percentile(gpu, .95) },
      drawCalls: percentile(draws, .5),
      triangles: scene.meshes.reduce((sum, mesh) => sum + mesh.getTotalIndices() / 3, 0),
      meshes: scene.meshes.length, textures: scene.textures.length, flags: { ...flags },
    }
    output.textContent = JSON.stringify(result, null, 2)
    console.info('[Hall performance]', JSON.stringify(result))
    start = 0; button.disabled = false; scrollButton.disabled = false; sectionButton.disabled = false
  }
  const begin = (kind: string) => {
    start = performance.now(); last = 0; intervals = []; cpu = []; gpu = []; draws = []
    targetPasses = {}; longTasks = []; sampleKind = kind
    const reading = document.querySelector<HTMLElement>('.hall-reading')
    layoutReadsAtStart = Number(reading?.dataset.hallLayoutReads ?? 0)
    scrollUpdatesAtStart = Number(reading?.dataset.hallScrollUpdates ?? 0)
    button.disabled = true; scrollButton.disabled = true; sectionButton.disabled = true; output.textContent = 'Sampling…'
    timer = window.setTimeout(finish, 6000)
  }
  button.onclick = () => begin('manual')
  const sampleScroll = (from: string, to: string, kind: string) => {
    const reading = document.querySelector<HTMLElement>('.hall-reading')
    const first = reading?.querySelector<HTMLElement>(`[data-hall-view="${from}"]`)
    const end = reading?.querySelector<HTMLElement>(`[data-hall-view="${to}"]`)
    if (!reading || !first || !end || innerWidth <= 760) { output.textContent = 'Open Scroll with hall at desktop width first.'; return }
    const top = reading.scrollTop + first.getBoundingClientRect().top - reading.getBoundingClientRect().top - 130
    const bottom = reading.scrollTop + end.getBoundingClientRect().top - reading.getBoundingClientRect().top - 130
    begin(kind)
    const scroll = (now: number) => {
      const progress = Math.min(1, (now - start) / 5800)
      reading.scrollTop = top + (bottom - top) * progress
      if (start && progress < 1) scrollFrame = requestAnimationFrame(scroll)
    }
    scrollFrame = requestAnimationFrame(scroll)
  }
  scrollButton.onclick = () => sampleScroll('food-wars', 'balairung', 'project-scroll')
  sectionButton.onclick = () => sampleScroll('work', 'projects', 'section-scroll')
  const pre = scene.onBeforeRenderObservable.add(() => { watchRenderTargets(); before = performance.now() })
  const post = scene.onAfterRenderObservable.add(() => {
    if (!start || document.hidden) return
    const now = performance.now()
    if (last) intervals.push(now - last)
    last = now
    cpu.push(now - before)
    const gpuNs = engineStats.gpuFrameTimeCounter?.current
    if (gpuNs && gpuNs > 0) gpu.push(gpuNs / 1e6)
    draws.push(sceneStats.drawCallsCounter.current)
  })
  scene.onDisposeObservable.addOnce(() => {
    window.clearTimeout(timer)
    cancelAnimationFrame(scrollFrame)
    longTaskObserver.disconnect()
    targetObservers.forEach(remove => remove())
    scene.onBeforeRenderObservable.remove(pre); scene.onAfterRenderObservable.remove(post)
    sceneStats.dispose(); engineStats.dispose(); panel.remove()
  })
}
