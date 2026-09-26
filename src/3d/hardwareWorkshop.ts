import type { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { SpotLight } from '@babylonjs/core/Lights/spotLight'
import { contactShadow } from './contactShadow'
import { createFpvDrone } from './fpvDrone'
import { createPetBot } from './petbot'
import { roundedBox, thinRing } from './exhibitGeometry'
import { mapSurfaceInMetres, mapTimberInMetres, surfaceMap } from './materials'
import { droneBuildDetail } from '@/data/droneBuild'
import type { DroneBuildDetail } from '@/data/droneBuild'

/** A shared workbench and flight station, built around the actual project objects. */
export function createHardwareWorkshop(scene: Scene) {
  const layer = 0x20000000, origin = new Vector3(-160, 1.92, 0)
  const meshes: Mesh[] = []
  const mat = (name: string, color: string, shine = .15) => {
    const material = new StandardMaterial(`workshop-${name}`, scene)
    material.diffuseColor = Color3.FromHexString(color); material.specularColor = new Color3(shine, shine, shine)
    material.specularPower = 48; material.fogEnabled = false; return material
  }
  const plywood = mat('ash', '#9f7b52', .12), steel = mat('steel', '#253039', .4)
  const floor = mat('deck', '#bcb4a2', .055), rubber = mat('rubber', '#111e25', .04)
  const metal = mat('machined-rim', '#899091', .65), copper = mat('brass', '#a58b61', .42)
  const white = mat('markings', '#c5c2b3', .02)
  const texture = (name: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const tex = new DynamicTexture(`workshop-${name}`, { width: w, height: h }, scene, true)
    draw(tex.getContext() as unknown as CanvasRenderingContext2D); tex.update(); return tex
  }
  // Reuse the hall's original wood scan and engine texture cache. The grain
  // follows each member instead of stretching one swatch over the whole bench.
  surfaceMap(scene, 'fine_grained_wood_col_1k.jpg', tex => {
    plywood.diffuseTexture = tex
    plywood.diffuseColor = Color3.FromHexString('#efdfc5')
  })
  surfaceMap(scene, 'floor_tiles_02_diff_1k.jpg', tex => {
    floor.diffuseTexture = tex
    floor.diffuseColor = Color3.FromHexString('#d9d5c6')
  })
  const board = mat('pegboard', '#25323a', .12)
  const pegTexture = texture('pegboard-pattern', 256, 256, ctx => {
    ctx.fillStyle = '#d0d5d5'; ctx.fillRect(0, 0, 256, 256); ctx.fillStyle = '#69777b'
    for (let x = 16; x < 256; x += 32) for (let y = 16; y < 256; y += 32) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill() }
  })
  pegTexture.wrapU = pegTexture.wrapV = Texture.WRAP_ADDRESSMODE
  pegTexture.uScale = 3; pegTexture.vScale = 1.5; board.diffuseTexture = pegTexture
  const register = (mesh: Mesh, material: StandardMaterial, x: number, y: number, z: number) => {
    mesh.position.set(origin.x + x, y, z); mesh.material = material; mesh.layerMask = layer; mesh.isPickable = false; meshes.push(mesh); return mesh
  }
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, material = steel, radius = 0) => {
    const mesh = register(radius
      ? roundedBox(`workshop-${name}`, w, h, d, radius, scene)
      : MeshBuilder.CreateBox(`workshop-${name}`, { width: w, height: h, depth: d }, scene), material, x, y, z)
    if (material === plywood) mapTimberInMetres(mesh, w, h, d)
    return mesh
  }
  const cylinder = (name: string, diameter: number, height: number, x: number, y: number, z: number, material: StandardMaterial, tessellation = 48) => register(MeshBuilder.CreateCylinder(`workshop-${name}`, { diameter, height, tessellation }, scene), material, x, y, z)
  const playBase = mat('play-button', '#000000', 0), playInk = mat('play-symbol', '#000000', 0)
  playBase.disableLighting = playInk.disableLighting = true
  playBase.emissiveColor = Color3.FromHexString('#294446'); playInk.emissiveColor = Color3.FromHexString('#f3efe5')
  const playButton = (project: string, x: number, y: number, z: number, angle = 0) => {
    const metadata = { portfolioRoute: `#project/${project}`, worldAction: 'video' }
    const disc = register(MeshBuilder.CreateDisc(`workshop-${project}-play`, { radius: .17, tessellation: 32 }, scene), playBase, x, y, z)
    disc.rotation.x = angle; disc.isPickable = true; disc.metadata = metadata
    const glyph = new Mesh(`workshop-${project}-play-symbol`, scene), vertices = new VertexData()
    vertices.positions = [-.052, -.078, -.006, -.052, .078, -.006, .083, 0, -.006]
    vertices.normals = [0, 0, -1, 0, 0, -1, 0, 0, -1]; vertices.indices = [0, 2, 1]; vertices.applyToMesh(glyph)
    glyph.parent = disc; glyph.material = playInk; glyph.layerMask = layer; glyph.isPickable = true; glyph.metadata = metadata; meshes.push(glyph)
  }
  cylinder('island', 15.5, .42, 0, -.32, 6.2, steel, 80)
  mapSurfaceInMetres(cylinder('deck', 15.45, .13, 0, -.06, 6.2, floor, 80), 2.4)
  cylinder('edge-inlay', 15.53, .025, 0, -.06, 6.2, copper, 80)
  for (let i = 0; i < 32; i++) {
    const a = i * Math.PI / 16
    cylinder('deck-fastener', .052, .008, Math.cos(a) * 7.55, .012, 6.2 + Math.sin(a) * 7.55, metal, 10)
  }
  box('entry-board', 3.25, .09, 2.6, 0, .035, .72, plywood, .035)
  for (const x of [-1.36, 1.36]) box('entry-trim', .027, .02, 2.45, x, .09, .72, copper)

  // The front feet splay outward to clear the flight pad, while their heads
  // meet the eave beams. Separate roof batches allow an overhead cutaway.
  const roof = mat('roof', '#39474a', .16)
  const pitch = Math.atan(1.3 / 6.2), roofLength = 6.2 / Math.cos(pitch)
  const roofParts = new Set<Mesh>()
  const canopy = (mesh: Mesh) => { roofParts.add(mesh); return mesh }
  for (const side of [-1, 1]) {
    const x = side * 5.8
    for (const z of [5.6, 10.5]) {
      const spread = z === 5.6 ? .8 : 0, footX = x + side * spread
      box('column-foot', .4, .065, .4, footX, .035, z, metal)
      box('column', .15, Math.hypot(4.16, spread), .15, x + side * spread / 2, 2.15, z).rotation.z = side * Math.atan(spread / 4.16)
      box('column-cap', .22, .08, .42, x, 4.19, z, metal)
      for (const dx of [-.13, .13]) for (const dz of [-.13, .13]) cylinder('column-bolt', .04, .023, x + side * spread + dx, .08, z + dz, steel, 8)
      meshes.push(contactShadow(scene, new Vector3(origin.x + footX, .008, z), .8, .8, layer))
    }
    box('eave-beam', .19, .22, 8.55, x, 4.23, 7.75, plywood)
    canopy(box('roof-panel', roofLength + .12, .09, 8.9, side * 3.1, 5.2, 7.75, roof)).rotation.z = -side * pitch
    canopy(box('roof-lining', roofLength, .035, 8.78, side * 3.1, 5.125, 7.75, plywood)).rotation.z = -side * pitch
    for (const z of [3.4, 5.6, 8, 10.5, 12.1]) {
      canopy(box('rafter', roofLength, .22, .14, side * 3.1, 5.02, z, plywood)).rotation.z = -side * pitch
    }
    for (let z = 3.4; z < 12.15; z += .64) {
      canopy(box('roof-seam', roofLength + .1, .03, .022, side * 3.1, 5.258, z, roof)).rotation.z = -side * pitch
    }
  }
  canopy(box('ridge-cap', .24, .08, 9.02, 0, 5.88, 7.75, roof))
  for (const y of [.43, 3.4]) box('screen-rail', .11, .1, 4.9, -5.8, y, 8.05)
  for (let z = 5.83; z < 10.4; z += .24) box('screen-slat', .07, 2.88, .12, -5.8, 1.93, z, plywood)
  // Soft contact beneath the sheltered working area, reusing the exhibit cue.
  meshes.push(contactShadow(scene, new Vector3(origin.x, .007, 8), 12, 9, layer))

  const bench = box('bench-top', 6.2, .16, 2.5, 0, 1.15, 7, plywood, .045)
  bench.isPickable = true; bench.metadata = { portfolioRoute: '#world/hardware/petbot' }
  for (const x of [-2.7, 2.7]) {
    for (const z of [6.05, 7.95]) { box('bench-leg', .1, 1.04, .1, x, .54, z); box('bench-foot', .23, .06, .27, x, .03, z, rubber, .025) }
    box('bench-end-brace', .095, .1, 2, x, .34, 7)
  }
  box('bench-front-rail', 5.5, .12, .09, 0, .89, 6.02)
  box('shelf', 5.65, .075, 1.9, 0, .37, 7.1, plywood)
  box('shelf-case', 1.55, .32, 1.05, 1.65, .58, 7.15, rubber, .06)
  box('case-handle', .39, .025, .05, 1.65, .76, 6.68, metal)
  box('pegboard-frame', 7.8, 3.55, .17, 0, 2.44, 10.22)
  box('pegboard', 7.5, 3.29, .04, 0, 2.44, 10.112, board)
  box('task-light-rail', 7.55, .08, .23, 0, 4.26, 10.02)
  const diffuser = mat('task-diffuser', '#000000', 0)
  diffuser.disableLighting = true; diffuser.emissiveColor = Color3.FromHexString('#f6e6c5')
  box('task-light-diffuser', 7.2, .016, .16, 0, 4.214, 10.02, diffuser)
  const taskLight = new SpotLight('workshop-task-light', new Vector3(origin.x - .65, 4.19, 9.91), new Vector3(0, -.72, -.69).normalize(), 1.9, 1.3, scene)
  taskLight.diffuse = Color3.FromHexString('#fff1d9'); taskLight.specular = new Color3(.22, .22, .2)
  taskLight.intensity = .7; taskLight.range = 10
  // One unshadowed local light. It cannot affect the hall or listening room,
  // and does not introduce an offscreen pass or an animation loop.
  taskLight.includeOnlyWithLayerMask = layer
  for (const x of [-3.7, 3.7]) box('backboard-foot', .12, .56, .75, x, .28, 10.22)
  meshes.push(contactShadow(scene, new Vector3(origin.x, .009, 7.3), 7.8, 4.7, layer))
  // The cutting mat's top is 1.244. Keep this cue above it, not hidden inside.
  meshes.push(contactShadow(scene, new Vector3(origin.x - 1.25, 1.247, 6.94), 2.35, 1.9, layer))

  const plaque = (name: string, title: string, detail: string, width: number, x: number, y: number, z: number, dark = false) => {
    const tex = texture(`label-${name}`, 1024, 192, ctx => {
      ctx.fillStyle = dark ? '#26343b' : '#d7ccb5'; ctx.fillRect(0, 0, 1024, 192)
      ctx.fillStyle = dark ? '#decbb0' : '#27383e'; ctx.font = '500 57px sans-serif'; ctx.fillText(title, 34, 78, 950)
      ctx.fillStyle = dark ? '#a4b1b5' : '#5f625a'; ctx.font = '29px sans-serif'; ctx.fillText(detail, 34, 140, 950)
    })
    const material = mat(`label-${name}`, '#ffffff', 0); material.disableLighting = true; material.emissiveColor = Color3.Black(); material.emissiveTexture = tex
    return register(MeshBuilder.CreatePlane(`workshop-${name}`, { width, height: width * 192 / 1024 }, scene), material, x, y, z)
  }
  plaque('station-one', '01   PetBot', 'University team robot / 2025', 3.1, -1.9, 3.71, 10.077, true)
  plaque('contribution', 'Server & AI integration', 'Flask · Socket.IO · local language models', 3.55, 1.66, 2.73, 10.077, true)
  const benchCaption = plaque('bench-caption', 'PetBot', 'Select the robot to open its assembly', 2.7, -1.24, .93, 5.716)
  benchCaption.isPickable = true; benchCaption.metadata = { portfolioRoute: '#world/hardware/petbot', worldAction: 'source-next' }
  const matMaterial = mat('cutting-mat', '#ffffff', .04)
  matMaterial.diffuseTexture = texture('mat-grid', 512, 256, ctx => {
    ctx.fillStyle = '#2c4343'; ctx.fillRect(0, 0, 512, 256)
    // Correct for the physical aspect ratio so the printed grid stays square.
    for (let index = 1; index < 27; index++) {
      const x = index * 512 / 27
      ctx.strokeStyle = index % 5 ? '#708c8066' : '#9ba992aa'; ctx.lineWidth = index % 5 ? .6 : 1.1
      ctx.beginPath(); ctx.moveTo(x, 8); ctx.lineTo(x, 248); ctx.stroke()
    }
    for (let index = 1; index < 20; index++) {
      const y = index * 256 / 19.4
      if (y > 248) continue
      ctx.strokeStyle = index % 5 ? '#708c8066' : '#9ba992aa'; ctx.lineWidth = index % 5 ? .6 : 1.1
      ctx.beginPath(); ctx.moveTo(8, y); ctx.lineTo(504, y); ctx.stroke()
    }
    ctx.strokeStyle = '#bac3a2aa'; ctx.lineWidth = 1; ctx.strokeRect(8, 8, 496, 240)
  })
  box('cutting-mat', 2.7, .012, 1.94, -1.25, 1.238, 7, matMaterial)
  const petbot = createPetBot(scene, new Vector3(origin.x - 1.25, 1.25, 6.94), layer)
  meshes.push(...petbot.meshes)

  const laptopBase = box('laptop-base', 1.45, .065, 1, 1.6, 1.29, 6.7, metal, .025)
  const laptopBack = box('laptop-lid', 1.45, 1, .065, 1.6, 1.82, 7.12, steel, .03); laptopBack.rotation.x = -.1
  for (let row = 0; row < 4; row++) for (let key = 0; key < 12; key++) box('laptop-key', .071, .008, .075, 1.105 + key * .09, 1.327, 6.7 + row * .098, rubber)
  box('trackpad', .36, .008, .2, 1.6, 1.327, 6.45, steel, .003)
  const photoMat = mat('project-photo', '#ffffff', 0); photoMat.disableLighting = true; photoMat.emissiveColor = Color3.Black()
  photoMat.emissiveTexture = new Texture(`${import.meta.env.BASE_URL}thumbnails/petbot-2.webp`, scene, false, true, undefined, () => { scene.metadata.needsRender = true; scene.metadata.portalPreviewsDirty = true })
  const photo = register(MeshBuilder.CreatePlane('workshop-project-photo', { width: 1.31, height: .76 }, scene), photoMat, 1.6, 1.85, 7.068); photo.rotation.x = -.1
  for (const mesh of [photo, laptopBase, laptopBack]) { mesh.metadata = { portfolioRoute: '#project/petbot', worldAction: 'video' }; mesh.isPickable = true }
  playButton('petbot', 1.6, 1.85, 7.051, -.1)
  meshes.push(contactShadow(scene, new Vector3(origin.x + 1.6, 1.238, 6.8), 1.9, 1.5, layer))
  for (let i = 0; i < 3; i++) {
    const x = -3.03 + i * .22
    register(MeshBuilder.CreateTube('workshop-hex-key', { path: [new Vector3(0, .35, 0), new Vector3(0, 0, 0), new Vector3(.1, 0, 0)], radius: .018, tessellation: 6 }, scene), metal, x, 2.37, 10.06)
  }
  box('parts-tray', .72, .035, .48, 2.34, 1.248, 7.71, metal, .015)
  for (let i = 0; i < 6; i++) cylinder('tray-screw', .036, .05, 2.1 + i * .085, 1.288, 7.65 + i % 2 * .1, steel, 10)

  cylinder('pad-base', 2.4, .09, 4.65, .06, 4.75, steel)
  cylinder('pad-stem', .48, .54, 4.65, .34, 4.75, steel)
  cylinder('flight-pad', 3.65, .13, 4.65, .675, 4.75, steel, 64)
  cylinder('flight-pad-top', 3.54, .028, 4.65, .75, 4.75, rubber, 64)
  const rim = register(thinRing('workshop-pad-ring', 3.38, .016, 64, scene), copper, 4.65, .77, 4.75)
  rim.isPickable = true; rim.metadata = { portfolioRoute: '#world/hardware/fpv-drone' }
  for (let i = 0; i < 4; i++) {
    const angle = i * Math.PI / 2
    const tick = box('pad-tick', .024, .007, .14, 4.65 + Math.sin(angle) * 1.6, .771, 4.75 + Math.cos(angle) * 1.6, white); tick.rotation.y = angle
  }
  meshes.push(contactShadow(scene, new Vector3(origin.x + 4.65, .779, 4.75), 3.2, 2.8, layer))
  meshes.push(contactShadow(scene, new Vector3(origin.x + 4.65, .012, 4.75), 4.4, 4.2, layer))
  const drone = createFpvDrone(scene, new Vector3(origin.x + 4.65, .78, 4.75), layer)
  meshes.push(...drone.meshes)
  const droneLabel = plaque('fpv-title', '02   FPV drone', 'AOS 5 / DJI O3 / Personal build', 2.45, 4.65, .55, 3.055, true)
  droneLabel.isPickable = true; droneLabel.metadata = { portfolioRoute: '#world/hardware/fpv-drone' }
  const dronePhotoX = 3.9
  box('fpv-photo-stand', .07, 1.7, .07, dronePhotoX, .85, 8.1)
  box('fpv-photo-foot', .7, .04, .52, dronePhotoX, .04, 8.1)
  box('fpv-photo-board', 1.54, 2.06, .075, dronePhotoX, 2.3, 8.1, steel, .025)
  const dronePhotoMat = mat('fpv-photo', '#ffffff', 0); dronePhotoMat.disableLighting = true; dronePhotoMat.emissiveColor = Color3.Black()
  dronePhotoMat.emissiveTexture = new Texture(`${import.meta.env.BASE_URL}thumbnails/fpv-drone.jpg`, scene, false, true, undefined, () => { scene.metadata.needsRender = true; scene.metadata.portalPreviewsDirty = true })
  const dronePhoto = register(MeshBuilder.CreatePlane('workshop-fpv-photo', { width: 1.4, height: 1.867 }, scene), dronePhotoMat, dronePhotoX, 2.33, 8.055)
  dronePhoto.isPickable = true; dronePhoto.metadata = { portfolioRoute: '#project/fpv-drone', worldAction: 'video' }
  playButton('fpv-drone', dronePhotoX, 2.33, 8.039)
  plaque('fpv-photo-caption', 'Original build photograph', 'Select to watch the flight film', 1.54, dronePhotoX, 1.23, 8.055, true)

  // The hall and workshop share one panorama and its loading fallback. This
  // smaller shell fits the portal camera's far plane; no second HDR is loaded.
  let sky = scene.getMaterialByName('skyMat') as StandardMaterial | null
  if (!sky) {
    sky = mat('sky', '#9caeaf', 0)
    sky.disableLighting = true; sky.emissiveColor = sky.diffuseColor; sky.backFaceCulling = false
  }
  register(MeshBuilder.CreateSphere('workshop-sky', { diameter: 210, segments: 16, sideOrientation: Mesh.BACKSIDE }, scene), sky, 0, 0, 6.2)
  const staticParts = meshes.filter(mesh => !mesh.isDisposed() && !mesh.isPickable && !mesh.parent)
  const roofBatches: Mesh[] = []
  for (const overhead of [false, true]) {
    const parts = staticParts.filter(mesh => roofParts.has(mesh) === overhead)
    for (const material of new Set(parts.map(mesh => mesh.material))) {
      const group = parts.filter(mesh => mesh.material === material)
      const merged = group.length > 1 ? Mesh.MergeMeshes(group, true, true) : group[0]
      if (!merged) continue
      merged.layerMask = layer; merged.isPickable = false; merged.freezeWorldMatrix()
      if (group.length > 1) { merged.name = `workshop-${overhead ? 'canopy' : 'static'}-${material?.name}`; meshes.push(merged) }
      if (overhead) roofBatches.push(merged)
    }
  }
  let roofVisibility = 1
  const updateCanopy = () => {
    const camera = scene.activeCamera
    // Reveal the exhibit before an orbit passes through the roof. At ordinary
    // eye level, including the hall's cached windows, the canopy stays intact.
    const roofHeight = 5.85 - Math.min(6.2, Math.abs((camera?.position.x ?? origin.x) - origin.x)) * 1.3 / 6.2
    const clearance = camera?.layerMask === layer ? (roofHeight - camera.position.y - .12) / .55 : 1
    const t = Math.max(0, Math.min(1, clearance)), visibility = t * t * (3 - 2 * t)
    if (visibility === roofVisibility || (visibility > 0 && visibility < 1 && Math.abs(visibility - roofVisibility) < .001)) return
    roofVisibility = visibility
    for (const mesh of roofBatches) { mesh.visibility = visibility; mesh.setEnabled(visibility > .001) }
    scene.metadata.needsRender = true
    scene.metadata.portalPreviewsDirty = true
  }
  let project = 'petbot'
  let detail: DroneBuildDetail | null = null
  const projectView = (id: string) => id === 'fpv-drone'
    ? { position: new Vector3(origin.x + 8.5, 3.5, 1.2), target: new Vector3(origin.x + 4.65, 1.25, 4.75) }
    : { position: new Vector3(origin.x + 3.8, 3.25, 2.8), target: new Vector3(origin.x - .7, 2.02, 6.85) }
  const detailView = () => {
    const view = projectView(project)
    if (project === 'fpv-drone' && detail) {
      const offset = detail === 'camera' ? new Vector3(0, .42, -.76) : detail === 'wiring' ? new Vector3(-.14, .58, .14) : new Vector3(.7, .2, -.7)
      view.target = new Vector3(origin.x + 4.65, .78, 4.75).add(offset)
      view.position = view.target.add(detail === 'wiring' ? new Vector3(-2, 1.15, -.65) : new Vector3(1.9, .95, -1.9))
    }
    return { ...view, key: `${project}/${detail ?? 'whole'}`, mode: 'default' as const, transition: 'smooth' as const, minRadius: detail ? 1.6 : 4 }
  }
  // This value is read by the render loop; allocate only when the selection changes.
  let inspectionView = detailView()
  return {
    meshes: meshes.filter(mesh => !mesh.isDisposed()), origin, layer, source: petbot.source,
    landing: new Vector3(origin.x + 3.8, 3.25, 2.8), target: new Vector3(origin.x - .7, 2.02, 6.85),
    viewForProject: projectView,
    entryForProject: (id: string) => new Vector3(origin.x + (id === 'fpv-drone' ? 4.2 : -1.25), 1.92, 1),
    setPresentation(mode: string) {
      detail = project === 'fpv-drone' ? droneBuildDetail(mode) : null
      drone.setDetail(detail)
      inspectionView = detailView()
    },
    presentationView: () => inspectionView,
    setProject(id: string) { project = id; detail = null; inspectionView = detailView(); drone.setDetail(null); petbot.setOpen(false); drone.setFlying(false) },
    setSource(index: number) { petbot.setOpen(project === 'petbot' && index === 1); drone.setFlying(project === 'fpv-drone' && index === 1) },
    animate(now: number, _playing: boolean, reducedMotion = false) {
      updateCanopy(); drone.animate(now, reducedMotion); petbot.animate(now, reducedMotion)
    },
  }
}
