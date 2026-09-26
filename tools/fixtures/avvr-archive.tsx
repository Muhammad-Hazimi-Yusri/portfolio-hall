import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { createEngine, createScene } from '../../src/3d/engine'
import { decodeAvvrMesh } from '../../src/3d/avvrMesh'

const rootUrl = '/_local/avvr-source-review/'
export default function ArchiveFixture() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const controls = useRef<(mode: string) => void>(() => {})
  const [status, setStatus] = useState('Opening archived room…'), [mode, setMode] = useState('Shaded mesh')
  useEffect(() => {
    const engine = createEngine(canvas.current!), scene = createScene(engine)
    scene.clearColor = Color4.FromHexString('#17242cff')
    const camera = new ArcRotateCamera('archive-camera', -Math.PI / 2.7, .73, 8, new Vector3(0, -.3, 0), scene)
    camera.minZ = .02; camera.lowerRadiusLimit = 4; camera.upperRadiusLimit = 13; camera.wheelDeltaPercentage = .012
    camera.attachControl(canvas.current!, true)
    const sky = new HemisphericLight('archive-fill', new Vector3(0, 1, 0), scene); sky.intensity = .8
    const sun = new DirectionalLight('archive-key', new Vector3(-1, -2, .5), scene); sun.intensity = 1.3
    const mesh = new Mesh('archived-reconstruction', scene)
    const material = new StandardMaterial('archive-mesh', scene)
    material.diffuseColor = Color3.FromHexString('#dbd0b6'); material.specularColor.set(0, 0, 0); material.backFaceCulling = false
    mesh.material = material
    const sphere = MeshBuilder.CreateSphere('reference-photograph', { diameter: 60, segments: 32, sideOrientation: Mesh.BACKSIDE }, scene)
    const photo = new StandardMaterial('reference-photo', scene); photo.disableLighting = true; photo.emissiveColor = Color3.Black()
    sphere.material = photo; sphere.setEnabled(false)
    const abort = new AbortController()
    Promise.all([fetch(rootUrl + 'listening-reconstruction.bin', { signal: abort.signal }).then(response => response.arrayBuffer()), fetch(rootUrl + 'listening-reconstruction.json', { signal: abort.signal }).then(response => response.json())]).then(([buffer, metadata]) => {
      if (scene.isDisposed) return
      const data = decodeAvvrMesh(buffer), vertices = new VertexData()
      vertices.positions = data.positions; vertices.normals = data.normals; vertices.indices = data.indices
      vertices.colors = Float32Array.from([...data.classes].flatMap(index => [...metadata.materials[index].color, 1]))
      vertices.applyToMesh(mesh)
      mesh.useVertexColors = false
      setStatus(`${metadata.triangles.toLocaleString()} triangles · ${Math.round(metadata.bytes / 1024)} KiB · archived geometry, no generated replacement`)
      controls.current = mode => {
        const picture = mode === '360° reference'
        sphere.setEnabled(picture); mesh.setEnabled(!picture)
        mesh.useVertexColors = mode === 'Source classes'
        material.diffuseColor = mesh.useVertexColors ? Color3.White() : Color3.FromHexString('#dbd0b6')
        if (picture) {
          photo.emissiveTexture ??= new Texture(rootUrl + 'listening-reference.png', scene, false, false)
          camera.target.set(0, 0, 0); camera.lowerRadiusLimit = .001; camera.upperRadiusLimit = .001; camera.radius = .001; camera.beta = Math.PI / 2
        } else {
          camera.lowerRadiusLimit = 4; camera.upperRadiusLimit = 13; camera.radius = 8; camera.beta = .73; camera.target.set(0, -.3, 0)
        }
      }
    }).catch(error => { if (!abort.signal.aborted) setStatus(`Could not open archive: ${error.message}`) })
    engine.runRenderLoop(() => scene.render())
    return () => { abort.abort(); controls.current = () => {}; scene.dispose(); engine.dispose() }
  }, [])
  return <main style={{ background: '#17242c', color: '#e6dece', font: '14px/1.5 system-ui', minHeight: '100vh', padding: 20 }}>
    <h1 style={{ margin: 0, fontWeight: 450 }}>AVVR / archived listening room</h1><p>{status}</p>
    <nav style={{ display: 'flex', gap: 10 }}>{['Shaded mesh', 'Source classes', '360° reference'].map(label => <button key={label} aria-pressed={mode === label} onClick={() => { setMode(label); controls.current(label) }} style={{ minHeight: 44, padding: '8px 16px' }}>{label}</button>)}</nav>
    <canvas ref={canvas} style={{ display: 'block', width: '100%', height: 'calc(100vh - 180px)', touchAction: 'none' }} />
  </main>
}
if (import.meta.env.DEV) {
  const root = createRoot(document.getElementById('root')!)
  root.render(<ArchiveFixture />)
  import.meta.hot?.dispose(() => root.unmount())
}
