import type { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { contactShadow } from './contactShadow'
import { batchAssembly, roundedBox, thinRing } from './exhibitGeometry'
import { mapSurfaceInMetres, mapTimberInMetres, surfaceMap } from './materials'
import { createAvvrArchiveDisplay } from './avvrArchiveDisplay'
import { avvrArchiveEnabled } from '@/data/avvrArchive'
import type { AvvrArchiveState, AvvrPresentation } from '@/data/avvrArchive'

export const WORLD_LAYER = 0x10000000
export const HALL_LAYER = 0x0fffffff
export const ROOM_ORIGIN = new Vector3(160, 1.92, 0)
export const SOURCE_POSITIONS = [-2.5, 0, 2.5]

/** The original archived room and panorama, alongside a separate sound demo.
 * In the demo, sound is heard from the visitor's camera position. */
export function createListeningRoom(scene: Scene, onArchiveState: (state: AvvrArchiveState) => void = () => {}) {
  const parts: Mesh[] = []
  const material = (name: string, hex: string, shine = .1, unlit = false) => {
    const mat = new StandardMaterial(`room-${name}`, scene)
    mat.diffuseColor = Color3.FromHexString(hex); mat.specularColor.set(shine, shine, shine)
    mat.specularPower = 64; mat.fogEnabled = false
    if (unlit) { mat.disableLighting = true; mat.emissiveColor = mat.diffuseColor }
    return mat
  }
  const texture = (name: string, width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const tex = new DynamicTexture(`room-${name}`, { width, height }, scene, true)
    draw(tex.getContext() as unknown as CanvasRenderingContext2D); tex.update(); return tex
  }
  const register = (mesh: Mesh, mat: StandardMaterial, x: number, y: number, z: number) => {
    mesh.position.set(ROOM_ORIGIN.x + x, y, z)
    mesh.material = mat; mesh.layerMask = WORLD_LAYER; mesh.isPickable = false; parts.push(mesh); return mesh
  }
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, mat: StandardMaterial, radius = 0) => {
    const mesh = register(radius
      ? roundedBox(`room-${name}`, w, h, d, radius, scene)
      : MeshBuilder.CreateBox(`room-${name}`, { width: w, height: h, depth: d }, scene), mat, x, y, z)
    if (mat === ash) mapTimberInMetres(mesh, w, h, d)
    return mesh
  }
  const steel = material('powder-coat', '#253139', .28)
  const floor = material('carpet', '#3e5053', .015)
  const ash = material('timber', '#a58965', .09)
  const fabric = material('acoustic-fabric', '#657475', .015)
  const rubber = material('rubber', '#101b22', .04)
  const cone = material('cone', '#465157', .22)
  const metal = material('metal', '#919c9d', .7)
  const brass = material('brass', '#b49b75', .42)
  const warm = material('light-strip', '#e1c89e', 0, true)
  const ink = material('stars', '#bac9ca', 0, true)
  surfaceMap(scene, 'fine_grained_wood_col_1k.jpg', tex => {
    ash.diffuseTexture = tex
    ash.diffuseColor = Color3.FromHexString('#f7e5c7')
  })
  const weave = texture('fabric-weave', 128, 128, ctx => {
    ctx.fillStyle = '#c7cccc'; ctx.fillRect(0, 0, 128, 128)
    ctx.fillStyle = '#8d989840'
    for (let y = 0; y < 128; y += 4) for (let x = 0; x < 128; x += 4) ctx.fillRect(x + y % 8 / 4, y, 1, 2)
  })
  weave.wrapU = weave.wrapV = Texture.WRAP_ADDRESSMODE
  weave.uScale = 3; weave.vScale = 3; fabric.diffuseTexture = weave; floor.diffuseTexture = weave

  // Shallow, layered construction keeps the island legible through its portal.
  box('foundation', 10.6, .35, 12.3, 0, -.29, 5.65, steel, .16)
  box('edge-band', 10.62, .035, 12.32, 0, -.105, 5.65, brass, .016)
  box('deck', 10.5, .15, 12.2, 0, -.018, 5.65, ash, .06)
  const carpet = box('inset-floor', 9.10, .016, 7.8, 0, .066, 7.14, floor, .007)
  mapSurfaceInMetres(carpet, .7)
  box('threshold', 3.25, .025, 2.1, 0, .07, .55, ash, .01)
  for (const x of [-1.38, 1.38]) box('threshold-inlay', .025, .006, 1.9, x, .087, .55, brass)
  box('wall-base', 10.15, .2, .45, 0, .18, 11.08, steel, .04)
  box('rear-wall', 10.15, 3.56, .18, 0, 1.94, 11.21, steel, .035)
  box('wall-cap', 10.23, .11, .42, 0, 3.75, 11.1, ash, .03)
  box('light-housing', 9.64, .08, .23, 0, 3.55, 11.03, steel)
  box('light-diffuser', 9.44, .019, .05, 0, 3.507, 10.92, warm)
  // The original project is the centrepiece. Acoustic panels frame it rather
  // than occupying the entire wall with empty rectangles.
  for (const x of [-3.83, 3.83]) {
    box('absorber-border', 1.62, 2.87, .12, x, 2.06, 11.035, ash, .035)
    box('absorber-fabric', 1.50, 2.75, .07, x, 2.06, 10.94, fabric, .035)
  }
  const taskLight = new SpotLight('room-cove-light', new Vector3(ROOM_ORIGIN.x, 3.48, 10.80), new Vector3(0, -.86, -.51).normalize(), 2.25, 1.1, scene)
  taskLight.diffuse = Color3.FromHexString('#fff0d9')
  taskLight.specular.set(.16, .16, .16)
  taskLight.intensity = .55; taskLight.range = 11
  taskLight.includeOnlyWithLayerMask = WORLD_LAYER
  // A slatted return wall provides depth without enclosing the visitor's view.
  box('side-rail', .16, .13, 5.2, -5.02, 2.8, 8.62, ash)
  for (let i = 0; i < 21; i++) box('side-slat', .12, 2.62, .052, -5.02, 1.42, 6.12 + i * .244, ash)
  box('side-foot', .2, .15, 5.25, -5.02, .16, 8.62, steel, .035)

  const plaque = (name: string, title: string, subtitle: string, width: number, x: number, y: number, z: number) => {
    const tex = texture(name, 1024, 224, ctx => {
      ctx.fillStyle = '#27353b'; ctx.fillRect(0, 0, 1024, 224)
      ctx.fillStyle = '#e1d2b6'; ctx.font = '500 63px sans-serif'; ctx.fillText(title, 38, 94, 948)
      ctx.fillStyle = '#afbbba'; ctx.font = '33px sans-serif'; ctx.fillText(subtitle, 38, 167, 948)
    })
    const mat = material(name, '#ffffff', 0, true); mat.emissiveColor = Color3.Black(); mat.emissiveTexture = tex
    return register(MeshBuilder.CreatePlane(`room-${name}`, { width, height: width * 224 / 1024 }, scene), mat, x, y, z)
  }
  // The screen shows source material, not a fabricated reconstruction.
  box('archive-backing', 5.48, 3.54, .13, 0, 1.93, 11.02, rubber, .035)
  const archiveMat = material('archive', '#ffffff', 0, true); archiveMat.emissiveColor = Color3.Black()
  archiveMat.emissiveTexture = new Texture(`${import.meta.env.BASE_URL}thumbnails/avvr-2.webp`, scene, false, true, undefined, () => { scene.metadata.needsRender = true; scene.metadata.portalPreviewsDirty = true })
  // Preserve the original 1920 x 1080 screenshot's aspect ratio, without a crop.
  const archive = register(MeshBuilder.CreatePlane('room-original-project', { width: 5.28, height: 2.97 }, scene), archiveMat, 0, 2.125, 10.946)
  archive.metadata = { worldAction: 'image', navigationLabel: 'Original AVVR screenshot' }; archive.isPickable = true
  const archiveCaptionTexture = texture('archive-caption', 1024, 80, ctx => {
    ctx.fillStyle = '#101b22'; ctx.fillRect(0, 0, 1024, 80)
    ctx.fillStyle = '#ded4bf'; ctx.font = '500 30px sans-serif'
    ctx.fillText('AVVR / Original Unity application', 22, 49)
    ctx.fillStyle = '#a5b1b0'; ctx.font = '24px sans-serif'; ctx.textAlign = 'right'
    ctx.fillText('University team project', 1002, 48)
  })
  const archiveCaptionMat = material('archive-caption', '#ffffff', 0, true)
  archiveCaptionMat.emissiveColor = Color3.Black(); archiveCaptionMat.emissiveTexture = archiveCaptionTexture
  const archiveCaption = register(MeshBuilder.CreatePlane('room-archive-caption', { width: 5.28, height: .4125 }, scene), archiveCaptionMat, 0, .36, 10.944)
  archiveCaption.metadata = archive.metadata; archiveCaption.isPickable = true
  plaque('room-plaque', 'Spatial listening', 'Move the source. Turn your view.', 2.44, 0, .082, 6.68).rotation.x = Math.PI / 2

  const pads: Mesh[] = []
  const selected = material('selected-pad', '#d4bc90', .15, true)
  const idlePad = material('idle-pad', '#53696d', .15)
  const letters = texture('positions', 384, 128, ctx => {
    ctx.fillStyle = '#26363d'; ctx.fillRect(0, 0, 384, 128)
    ctx.fillStyle = '#d4c9af'; ctx.textAlign = 'center'; ctx.font = '500 65px sans-serif'
    ;['L', 'C', 'R'].forEach((letter, i) => ctx.fillText(letter, 64 + i * 128, 87))
  })
  const letterMat = material('position-lettering', '#ffffff', 0, true); letterMat.emissiveColor = Color3.Black(); letterMat.emissiveTexture = letters
  SOURCE_POSITIONS.forEach((x, index) => {
    const mat = box(`source-pad-${index}`, 1.2, .022, 1.05, x, .09, 8.48, rubber, .009)
    // Four edge strips remain one selectable draw, with a visible outline at
    // every viewing angle. Only the selected position receives the warm finish.
    const rimMat = index === 0 ? selected : idlePad
    const rimParts = [
      ...[-.515, .515].map(z => box(`source-rim-${index}`, 1.09, .012, .025, x, .105, 8.48 + z, rimMat)),
      ...[-.532, .532].map(dx => box(`source-rim-${index}`, .025, .012, 1.03, x + dx, .105, 8.48, rimMat)),
    ]
    const rim = Mesh.MergeMeshes(rimParts, true, true)!
    rim.name = `room-source-indicator-${index}`; rim.layerMask = WORLD_LAYER; parts.push(rim)
    pads.push(rim)
    const key = box(`position-key-${index}`, .58, .06, .58, x, .11, 7.54, steel, .025)
    const letter = register(MeshBuilder.CreatePlane(`room-position-label-${index}`, { size: .49 }, scene), letterMat, x, .142, 7.54)
    letter.rotation.x = Math.PI / 2
    letter.setVerticesData('uv', [index / 3, 0, (index + 1) / 3, 0, (index + 1) / 3, 1, index / 3, 1])
    for (const mesh of [mat, rim, key, letter]) {
      mesh.metadata = { worldAction: `source-${index}`, navigationLabel: `Move sound ${['left', 'to the centre', 'right'][index]}` }; mesh.isPickable = true
    }
  })

  const speaker = new Mesh('room-speaker-assembly', scene)
  speaker.position.set(ROOM_ORIGIN.x + SOURCE_POSITIONS[0], .08, 8.48); speaker.layerMask = WORLD_LAYER
  speaker.metadata = { worldAction: 'source-next', navigationLabel: 'Move the speaker to its next position' }
  const speakerParts: Mesh[] = []
  const attach = (mesh: Mesh, mat: StandardMaterial, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z); mesh.parent = speaker; mesh.material = mat; speakerParts.push(mesh); return mesh
  }
  const cabinet = (name: string, w: number, h: number, d: number, radius: number, x: number, y: number, z: number, mat: StandardMaterial) => {
    const mesh = attach(roundedBox(`room-speaker-${name}`, w, h, d, radius, scene), mat, x, y, z)
    if (mat === ash) mapTimberInMetres(mesh, w, h, d)
    return mesh
  }
  const frontDisc = (name: string, diameter: number, depth: number, x: number, y: number, z: number, mat: StandardMaterial) => {
    const disc = attach(MeshBuilder.CreateCylinder(`room-speaker-${name}`, { diameter, height: depth, tessellation: 40 }, scene), mat, x, y, z)
    disc.rotation.x = Math.PI / 2; return disc
  }
  cabinet('base', .82, .06, .72, .025, 0, .058, 0, steel)
  cabinet('stem', .12, 1.32, .16, .022, 0, .75, .04, steel)
  cabinet('mount', .53, .05, .41, .012, 0, 1.39, 0, metal)
  for (const x of [-.28, .28]) for (const z of [-.22, .22]) cabinet('foot', .11, .025, .11, .009, x, .018, z, rubber)
  cabinet('cabinet', .86, 1.25, .7, .065, 0, 2.045, 0, ash)
  cabinet('baffle', .80, 1.18, .065, .055, 0, 2.045, -.35, rubber)
  const woofer = attach(MeshBuilder.CreateLathe('room-woofer-cone', {
    shape: [new Vector3(0, -.085, 0), new Vector3(.07, -.085, 0), new Vector3(.20, -.045, 0), new Vector3(.245, 0, 0)],
    tessellation: 48, sideOrientation: Mesh.DOUBLESIDE,
  }, scene), cone, 0, 1.91, -.50)
  woofer.rotation.x = -Math.PI / 2
  for (const [name, diameter, thickness, y, mat] of [
    ['woofer-surround', .515, .04, 1.91, rubber], ['woofer-rim', .566, .014, 1.91, metal], ['tweeter-rim', .244, .014, 2.405, metal],
  ] as const) {
    const ring = attach(thinRing(`room-${name}`, diameter, thickness, 48, scene), mat, 0, y, name.startsWith('woofer') ? -.505 : -.401); ring.rotation.x = Math.PI / 2
  }
  frontDisc('tweeter', .215, .025, 0, 2.405, -.392, cone)
  const dome = attach(MeshBuilder.CreateSphere('room-tweeter-dome', { diameter: .12, segments: 12 }, scene), rubber, 0, 2.405, -.414); dome.scaling.z = .4
  cabinet('port', .37, .042, .015, .014, 0, 1.575, -.39, steel)
  for (const x of [-.315, .315]) for (const y of [1.58, 2.5]) frontDisc('fastener', .023, .012, x, y, -.389, metal)
  attach(MeshBuilder.CreateTube('room-speaker-cable', { path: [new Vector3(.16, 1.65, .36), new Vector3(.15, 1.12, .30), new Vector3(.15, .35, .29), new Vector3(.22, .08, .32), new Vector3(.38, .03, .30)], radius: .013, tessellation: 6 }, scene), rubber, 0, 0, 0)
  parts.push(...batchAssembly(speakerParts, speaker))
  const statusMat = material('speaker-status', '#b39b73', 0, true)
  const status = attach(roundedBox('room-speaker-status', .055, .018, .009, .004, scene), statusMat, .26, 1.576, -.392)
  status.layerMask = WORLD_LAYER; status.isPickable = true; status.metadata = speaker.metadata; parts.push(status)
  const shadow = contactShadow(scene, new Vector3(speaker.position.x, .113, 8.48), 1.4, 1.35, WORLD_LAYER); parts.push(shadow)

  const skyMat = material('sky', '#0c1b27', 0, true); skyMat.backFaceCulling = false
  register(MeshBuilder.CreateSphere('room-sky', { diameter: 210, segments: 12, sideOrientation: Mesh.BACKSIDE }, scene), skyMat, 0, 15, 15)
  for (let i = 0; i < 65; i++) {
    const a = i * 2.399963, elevation = .01 + ((i * 37 % 97) / 97) * 1.3
    register(MeshBuilder.CreateSphere(`room-star-${i}`, { diameter: i % 7 === 0 ? .12 : .065, segments: 3 }, scene), ink, Math.cos(a) * Math.cos(elevation) * 80, Math.sin(elevation) * 80, 6 + Math.sin(a) * Math.cos(elevation) * 80)
  }
  // Batch architecture by material; the speaker and selected pad stay independent.
  const stationary = parts.filter(mesh => !mesh.isDisposed() && !mesh.parent && !mesh.isPickable && mesh !== shadow)
  for (const mat of new Set(stationary.map(mesh => mesh.material))) {
    const group = stationary.filter(mesh => mesh.material === mat)
    const merged = group.length > 1 ? Mesh.MergeMeshes(group, true, true) : group[0]
    if (merged) { merged.layerMask = WORLD_LAYER; merged.isPickable = false; merged.freezeWorldMatrix(); if (group.length > 1) { merged.name = `room-static-${mat?.name}`; parts.push(merged) } }
  }
  const source = new Vector3(speaker.position.x, 2.125, 8.08)
  let targetX = speaker.position.x, lastTime = 0, lastPlaying: boolean | null = null
  const soundMeshes = parts.filter(mesh => !mesh.isDisposed())
  const archiveDisplay = avvrArchiveEnabled ? createAvvrArchiveDisplay(scene, ROOM_ORIGIN.x, WORLD_LAYER, onArchiveState) : null
  const soundView = { key: 'sound', position: new Vector3(ROOM_ORIGIN.x + 3, 3.05, 1.1), target: new Vector3(ROOM_ORIGIN.x, 1.65, 8.8), mode: 'default' as const }
  let showingSound = true
  const showSound = (enabled: boolean) => {
    if (enabled === showingSound) return
    showingSound = enabled; soundMeshes.forEach(mesh => mesh.setEnabled(enabled)); taskLight.setEnabled(enabled)
    scene.metadata.needsRender = true
  }
  showSound(!archiveDisplay)
  return {
    origin: ROOM_ORIGIN, layer: WORLD_LAYER,
    landing: archiveDisplay?.view.position ?? soundView.position, target: archiveDisplay?.view.target ?? soundView.target,
    meshes: [...soundMeshes, ...(archiveDisplay?.meshes ?? [])], source,
    previewReady: () => archiveDisplay?.ready ?? true,
    presentationView: () => !archiveDisplay || archiveDisplay.active === 'sound' ? soundView : archiveDisplay.view,
    setPresentation(mode: string) { archiveDisplay?.setPresentation(mode as AvvrPresentation); showSound(!archiveDisplay || archiveDisplay.active === 'sound') },
    setSource(index: number) {
      const position = Math.max(0, Math.min(2, Math.round(index)))
      targetX = ROOM_ORIGIN.x + SOURCE_POSITIONS[position]
      pads.forEach((pad, i) => { pad.material = i === position ? selected : idlePad })
      scene.metadata.needsRender = true
    },
    animate(now: number, playing: boolean, reducedMotion = false) {
      showSound(!archiveDisplay || archiveDisplay.active === 'sound')
      if (!showingSound) return
      const elapsed = lastTime ? Math.min(80, now - lastTime) : 16; lastTime = now
      if (Math.abs(speaker.position.x - targetX) > .0001) {
        const difference = targetX - speaker.position.x
        speaker.position.x = reducedMotion || Math.abs(difference) < .003 ? targetX : speaker.position.x + difference * (1 - Math.exp(-elapsed / 130))
        source.x = speaker.position.x; shadow.position.x = speaker.position.x; scene.metadata.needsRender = true
      }
      if (playing !== lastPlaying) {
        statusMat.emissiveColor.copyFromFloats(playing ? .85 : .14, playing ? .67 : .17, playing ? .38 : .18)
        scene.metadata.needsRender = true; lastPlaying = playing
      }
    },
  }
}
