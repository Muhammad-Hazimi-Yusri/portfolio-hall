import type { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { decodeAvvrMesh, paintAvvrClasses } from './avvrMesh'
import { roundedBox } from './exhibitGeometry'
import { avvrClasses } from '@/data/avvrArchive'
import type { AvvrArchiveState, AvvrPresentation } from '@/data/avvrArchive'

/** The actual archived reconstruction is the object on display. The plinth,
 * lighting and neutral finish belong to this portfolio, not the source model. */
export function createAvvrArchiveDisplay(scene: Scene, x: number, layer: number, onState: (state: AvvrArchiveState) => void) {
  const center = new Vector3(x, 1.55, 7)
  const modelView = { key: 'model', position: new Vector3(x + 6.3, 8.3, .15), target: new Vector3(x, 1.05, 7), mode: 'model' as const }
  const photoView = { key: 'photo', position: center.add(new Vector3(0, .0002, -.002)), target: center, mode: 'panorama' as const }
  const mesh = new Mesh('avvr-archived-listening-room', scene)
  mesh.position.copyFrom(center); mesh.layerMask = layer; mesh.isPickable = false
  const finish = new StandardMaterial('avvr-archive-finish', scene)
  finish.diffuseColor = Color3.FromHexString('#bdb9a8'); finish.specularColor.set(0, 0, 0); finish.backFaceCulling = false; finish.fogEnabled = false
  mesh.material = finish
  const metal = new StandardMaterial('avvr-archive-plinth', scene)
  metal.diffuseColor = Color3.FromHexString('#26363d'); metal.specularColor.set(.15, .15, .15); metal.fogEnabled = false
  const plinth = roundedBox('avvr-archive-plinth', 5.5, .25, 6.6, .05, scene)
  plinth.position.set(x + .04, .29, 6.72); plinth.material = metal; plinth.layerMask = layer; plinth.isPickable = false
  const captionTexture = new DynamicTexture('avvr-archive-label', { width: 1024, height: 104 }, scene, false)
  const ctx = captionTexture.getContext() as unknown as CanvasRenderingContext2D
  ctx.fillStyle = '#26363d'; ctx.fillRect(0, 0, 1024, 104)
  ctx.fillStyle = '#e8e0cd'; ctx.font = '500 34px sans-serif'; ctx.fillText('LISTENING ROOM', 28, 44)
  ctx.fillStyle = '#a5b7b7'; ctx.font = '26px sans-serif'; ctx.fillText('Archived AVVR reconstruction / ceiling removed', 28, 83)
  captionTexture.update()
  const captionMat = new StandardMaterial('avvr-archive-label', scene)
  captionMat.disableLighting = true; captionMat.emissiveColor = Color3.Black(); captionMat.emissiveTexture = captionTexture; captionMat.fogEnabled = false
  const caption = MeshBuilder.CreatePlane('avvr-archive-caption', { width: 5.4, height: .5484 }, scene)
  caption.position.set(x + .04, .43, 3.72); caption.rotation.x = Math.PI / 2; caption.material = captionMat; caption.layerMask = layer; caption.isPickable = false
  const sphere = MeshBuilder.CreateSphere('avvr-source-panorama', { diameter: 100, segments: 32, sideOrientation: Mesh.BACKSIDE }, scene)
  sphere.position.copyFrom(center); sphere.layerMask = layer; sphere.isPickable = false; sphere.setEnabled(false)
  const photograph = new StandardMaterial('avvr-source-photo', scene)
  photograph.disableLighting = true; photograph.emissiveColor = Color3.Black(); photograph.fogEnabled = false; sphere.material = photograph
  // Shader variants can finish after an otherwise idle scene's last frame.
  // Show the new material immediately without leaving the renderer running.
  for (const material of [finish, photograph]) material.onEffectCreatedObservable.add(({ effect }) => effect.executeWhenCompiled(() => {
    if (scene.isDisposed) return
    scene.metadata.needsRender = true; scene.metadata.portalPreviewsDirty = true
  }))
  const meshes = [mesh, plinth, caption, sphere]
  const state: AvvrArchiveState = { model: 'loading', photo: 'idle' }
  let desired: AvvrPresentation = 'model', active: AvvrPresentation = 'model'
  let classes: Uint8Array | undefined, colors: Float32Array | undefined, highlighted = -1
  const notify = () => { if (!scene.isDisposed) onState({ ...state }) }
  const display = (mode: AvvrPresentation) => {
    active = mode
    const labels = mode === 'labels' || mode.startsWith('labels/')
    mesh.setEnabled(mode === 'model' || labels)
    plinth.setEnabled(mode === 'model' || labels); caption.setEnabled(plinth.isEnabled())
    sphere.setEnabled(mode === 'photo')
    mesh.useVertexColors = labels
    finish.diffuseColor = labels ? Color3.White() : Color3.FromHexString('#bdb9a8')
    const selected = avvrClasses.findIndex(item => mode === `labels/${item.name}`)
    if (labels && classes && colors && selected !== highlighted) {
      highlighted = selected
      mesh.updateVerticesData('color', paintAvvrClasses(classes, colors, selected))
    }
    scene.metadata.needsRender = true; scene.metadata.portalPreviewsDirty = true
  }
  const abort = new AbortController()
  scene.onDisposeObservable.addOnce(() => abort.abort())
  fetch(`${import.meta.env.BASE_URL}models/avvr/listening-reconstruction.bin`, { signal: abort.signal })
    .then(response => { if (!response.ok) throw new Error('Archive unavailable'); return response.arrayBuffer() })
    .then(buffer => {
      if (scene.isDisposed) return
      const data = decodeAvvrMesh(buffer)
      if (data.classCount !== avvrClasses.length) throw new Error('Archive class mismatch')
      classes = data.classes
      colors = paintAvvrClasses(classes, new Float32Array(classes.length * 4))
      const vertices = new VertexData()
      vertices.positions = data.positions; vertices.normals = data.normals; vertices.indices = data.indices
      vertices.applyToMesh(mesh)
      // Only the existing colour buffer is dynamic; geometry and draw count stay fixed.
      mesh.setVerticesData('color', colors, true)
      mesh.freezeWorldMatrix(); state.model = 'ready'; display(active); notify()
    }).catch(() => { if (!abort.signal.aborted) { state.model = 'error'; notify() } })
  notify()
  return {
    meshes,
    get active() { return active },
    get ready() { return state.model !== 'loading' },
    get view() { return active === 'photo' ? photoView : modelView },
    setPresentation(mode: AvvrPresentation) {
      desired = mode
      if (mode !== 'photo') { display(mode); return }
      if (state.photo === 'ready') { display(mode); return }
      if (state.photo === 'loading') return
      state.photo = 'loading'; notify()
      photograph.emissiveTexture?.dispose()
      photograph.emissiveTexture = new Texture(`${import.meta.env.BASE_URL}models/avvr/listening-reference.png`, scene, false, false, Texture.TRILINEAR_SAMPLINGMODE,
        () => { if (scene.isDisposed) return; state.photo = 'ready'; if (desired === 'photo') display('photo'); notify() },
        () => { if (!scene.isDisposed) { state.photo = 'error'; notify() } })
    },
  }
}
