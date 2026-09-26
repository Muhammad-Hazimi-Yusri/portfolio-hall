import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { createEngine, createScene } from '../../src/3d/engine'
import { createEnvironment } from '../../src/3d/scene'
import { createSceneMaterials } from '../../src/3d/materials'
import { createLights } from '../../src/3d/lights'
import { createPOIMeshes } from '../../src/3d/pois'
import { createVisitorDisplay } from '../../src/3d/visitorDisplay'
import { readCommunity } from '../../src/data/community'
import { pois } from '../../src/data/pois'

const views = {
  Entrance: [[14.5, 8.5, -15], [0, 1.4, 12]],
  'Gallery water view': [[1.5, 1.8, 31], [48, 5, 41]],
  'Gallery wall view': [[.6, 2.0, 31], [-4.5, 1.75, 32.5]],
  'Guestbook terrace': [[2.8, 2.7, 79], [0, 1.8, 86]],
  'Terrace water view': [[1.5, 1.8, 87], [42, 3, 49]],
} as const

export default function LandscapeFixture() {
  const canvas = useRef<HTMLCanvasElement>(null), sceneControls = useRef<{ view: (key: keyof typeof views) => void; data: (pattern: string) => void; light: (enabled: boolean) => void } | null>(null)
  const [ready, setReady] = useState(false)
  const [wash, setWash] = useState(true)
  useEffect(() => {
    const engine = createEngine(canvas.current!), scene = createScene(engine)
    scene.metadata = { logosPaused: true }
    const camera = new UniversalCamera('landscape-review', new Vector3(14.5, 8.5, -15), scene)
    camera.minZ = .08; camera.maxZ = 3000
    const environment = createEnvironment(scene, createSceneMaterials(scene))
    const { meshMap } = createPOIMeshes(scene, pois)
    createLights(scene, environment, meshMap)
    const visitors = createVisitorDisplay(scene)
    const controls = {
      view(key: keyof typeof views) {
        camera.position.copyFrom(Vector3.FromArray([...views[key][0]])); camera.setTarget(Vector3.FromArray([...views[key][1]]))
        scene.metadata.needsRender = true
      },
      data(pattern: string) {
        visitors.update(readCommunity({ mode: 'local', days: Array.from({ length: 28 }, (_, i) => ({ day: new Date(Date.UTC(2026, 8, i + 1)).toISOString().slice(0, 10), visits: pattern === 'Empty' ? 0 : pattern === 'One day' ? (i === 27 ? 9 : 0) : [0, 1, 2, 4, 6, 3, 7, 5, 8, 12, 7, 3, 9, 4][i % 14] })), visits: [], notes: [] }))
        scene.metadata.needsRender = true
      },
      light(enabled: boolean) {
        const texture = scene.getTextureByName('gallery-wall-light')
        if (texture) texture.level = enabled ? 1 : 0
        scene.metadata.needsRender = true; scene.metadata.waterReflectionsDirty = true
      },
    }
    sceneControls.current = controls
    controls.view('Gallery water view'); controls.data('Full history')
    scene.executeWhenReady(() => { if (!scene.isDisposed) { setReady(true); scene.metadata.needsRender = true } })
    engine.runRenderLoop(() => {
      if (scene.isReady() && (scene.metadata.needsRender || scene.metadata.profileContinuous)) {
        scene.metadata.needsRender = false; scene.render()
      }
    })
    return () => { sceneControls.current = null; visitors.dispose(); scene.dispose(); engine.dispose() }
  }, [])
  return <main style={{ fontFamily: 'system-ui', color: '#203b38', background: '#f3eee4', padding: 16 }}>
    <h1>Landscape review</h1><p>Synthetic daily counts. Local fixture only; no visitor service requests. {ready ? 'Scene ready.' : 'Loading.'}</p>
    <p>{Object.keys(views).map(key => <button key={key} onClick={() => sceneControls.current?.view(key as keyof typeof views)}>{key}</button>)}</p>
    <p>{['Full history', 'One day', 'Empty'].map(pattern => <button key={pattern} onClick={() => sceneControls.current?.data(pattern)}>{pattern}</button>)}</p>
    <label><input type="checkbox" checked={wash} onChange={event => { setWash(event.target.checked); sceneControls.current?.light(event.target.checked) }} /> Gallery wall wash</label>
    <canvas ref={canvas} width="1100" height="680" style={{ width: 'min(1100px, 100%)', height: 680, display: 'block' }} />
  </main>
}
if (import.meta.env.DEV) {
  const root = createRoot(document.getElementById('root')!)
  root.render(<LandscapeFixture />)
  import.meta.hot?.dispose(() => root.unmount())
}
