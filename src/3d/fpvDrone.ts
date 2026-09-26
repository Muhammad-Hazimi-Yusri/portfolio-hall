import type { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'
import { batchAssembly, profilePrism, roundedBox, roundedOutline, thinRing } from './exhibitGeometry'
import { droneBuildNotes } from '@/data/droneBuild'
import type { DroneBuildDetail } from '@/data/droneBuild'

/** Photo-based assembly: recognisable components, without CAD or flight claims. */
export function createFpvDrone(scene: Scene, position: Vector3, layer: number) {
  const root = new Mesh('fpv-assembly', scene)
  root.position.copyFrom(position); root.layerMask = layer; root.isPickable = false
  root.metadata = { portfolioRoute: '#world/hardware/fpv-drone', worldAction: 'source-next' }
  const pieces: Mesh[] = [], rotors: Mesh[] = []
  let partDetail: DroneBuildDetail | null = null
  const material = (name: string, hex: string, specular = .2) => {
    const value = new StandardMaterial(`fpv-${name}`, scene)
    value.diffuseColor = Color3.FromHexString(hex); value.specularColor = new Color3(specular, specular, specular)
    value.specularPower = 56; value.fogEnabled = false
    return value
  }
  const carbon = material('carbon', '#292d30', .32), orange = material('battery-wrap', '#c66614', .24)
  const mount = material('printed-mount', '#c5c7c4', .08), blue = material('anodised-motor', '#19768d', .6)
  const prop = material('clear-props', '#358c80', .65), metal = material('brushed-metal', '#a4adad', .55)
  const rubber = material('strap', '#151b20', .04), lens = material('lens', '#0c151e', .75)
  prop.alpha = .83; prop.backFaceCulling = false
  const red = material('power-lead', '#8a2723', .2), gold = material('fasteners', '#826b36', .65)
  const led = material('led', '#90d8e2', 0); led.disableLighting = true; led.emissiveColor = Color3.FromHexString('#8bdbdd')
  const warmLed = material('warm-led', '#f0aa4b', 0); warmLed.disableLighting = true; warmLed.emissiveColor = Color3.FromHexString('#f0aa4b')
  const weave = new DynamicTexture('fpv-carbon-weave', 128, scene, true)
  weave.wrapU = weave.wrapV = Texture.WRAP_ADDRESSMODE
  const weaveContext = weave.getContext() as unknown as CanvasRenderingContext2D
  weaveContext.fillStyle = '#7d8588'; weaveContext.fillRect(0, 0, 128, 128)
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    weaveContext.fillStyle = (x + y) % 2 ? '#646e72' : '#969da0'
    weaveContext.fillRect(x * 8 + 1, y * 8 + 1, (x + y) % 2 ? 6 : 3, 6)
  }
  weave.update(); weave.uScale = 3; weave.vScale = 5; carbon.diffuseTexture = weave

  const add = (mesh: Mesh, mat: StandardMaterial, x: number, y: number, z: number) => {
    mesh.position.set(x, y, z); mesh.parent = root; mesh.material = mat; mesh.layerMask = layer
    mesh.metadata = { ...root.metadata, droneDetail: partDetail }; pieces.push(mesh); return mesh
  }
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, mat = carbon, bevel = 0) => add(bevel
    ? roundedBox(`fpv-${name}`, w, h, d, bevel, scene)
    : MeshBuilder.CreateBox(`fpv-${name}`, { width: w, height: h, depth: d }, scene), mat, x, y, z)
  const cylinder = (name: string, diameter: number, h: number, x: number, y: number, z: number, mat: StandardMaterial, segments = 24) => add(MeshBuilder.CreateCylinder(`fpv-${name}`, { diameter, height: h, tessellation: segments }, scene), mat, x, y, z)
  const plate = (name: string, w: number, d: number, y: number, z: number) => {
    const mesh = add(profilePrism(name, roundedOutline(w, d, .07), .045, scene), carbon, 0, y, z)
    mesh.rotation.x = Math.PI / 2; return mesh
  }
  plate('fpv-lower-plate', .56, 1.22, .18, 0)
  plate('fpv-upper-plate', .53, 1.12, .38, .04)
  box('electronics', .37, .1, .33, 0, .27, -.02, rubber)
  box('air-unit', .4, .115, .35, 0, .28, .32, metal)
  for (let n = 0; n < 7; n++) box('cooling-fin', .013, .035, .28, -.155 + n * .052, .35, .32, metal)
  for (const x of [-.2, .2]) for (const z of [-.37, .38]) {
    cylinder('standoff', .045, .2, x, .29, z, blue, 12)
    cylinder('plate-screw', .07, .025, x, .418, z, gold, 10)
  }
  box('battery-pad', .49, .045, .77, 0, .437, .1, rubber, .017)
  box('battery', .48, .34, .77, 0, .625, .12, orange, .045)
  box('battery-label', .36, .22, .009, 0, .625, -.271, mount, .004)
  const belt = roundedOutline(.535, .387, .065)
  add(MeshBuilder.CreateRibbon('fpv-woven-strap', {
    pathArray: [-.056, .056].map(z => belt.map(([x, y]) => new Vector3(x, y, z))), closePath: true, sideOrientation: Mesh.DOUBLESIDE,
  }, scene), rubber, 0, .626, .1)
  box('strap-buckle', .105, .025, .14, .19, .826, .1, gold, .009)
  partDetail = 'camera'
  box('camera-cradle', .4, .28, .31, 0, .355, -.645, mount, .06)
  box('camera-body', .29, .25, .24, 0, .398, -.68, metal, .048)
  box('camera-front', .27, .225, .06, 0, .415, -.813, rubber, .045)
  const cameraLens = cylinder('camera-lens', .184, .025, 0, .416, -.851, lens, 32); cameraLens.rotation.x = Math.PI / 2
  const lensRing = add(thinRing('fpv-lens-ring', .192, .012, 24, scene), rubber, 0, .416, -.865); lensRing.rotation.x = Math.PI / 2
  for (const x of [-.2, .2]) { const bolt = cylinder('camera-pivot', .057, .021, x, .405, -.648, gold, 10); bolt.rotation.z = Math.PI / 2 }
  partDetail = 'wiring'
  box('rear-print', .19, .1, .2, 0, .425, .62, mount, .03)
  const antenna = cylinder('antenna-stem', .023, .31, .12, .56, .65, rubber, 10); antenna.rotation.x = .2
  cylinder('antenna-tip', .07, .09, .12, .755, .68, rubber, 16)
  const wire = (name: string, side: number, mat: StandardMaterial) => {
    const points = Array.from({ length: 17 }, (_, i) => {
      const t = i / 16, s = 1 - t
      return new Vector3(side * (.13 + .12 * Math.sin(t * Math.PI)), s * .78 + t * .28 + Math.sin(t * Math.PI) * .12, s * -.26 + t * .35)
    })
    add(MeshBuilder.CreateTube(`fpv-${name}`, { path: points, radius: .019, tessellation: 7 }, scene), mat, 0, 0, 0)
  }
  wire('positive-lead', -1, red); wire('negative-lead', -.63, rubber)
  for (const x of [-1.03, 1.03]) for (const z of [-.96, .96]) {
    partDetail = null
    const startX = Math.sign(x) * .13, startZ = Math.sign(z) * .22
    const arm = box('carbon-arm', .17, .065, Math.hypot(x - startX, z - startZ), (x + startX) / 2, .18, (z + startZ) / 2)
    arm.rotation.y = Math.atan2(x - startX, z - startZ)
    cylinder('motor-protector', .17, .14, x, .07, z, rubber)
    cylinder('motor-foot', .31, .054, x, .174, z, carbon)
    cylinder('motor-base', .27, .056, x, .223, z, metal)
    cylinder('motor-bell', .252, .13, x, .3, z, blue)
    cylinder('stator', .188, .11, x, .31, z, rubber)
    for (let j = 0; j < 8; j++) {
      const a = j * Math.PI / 4
      const rib = box('motor-vent', .026, .12, .034, x + Math.cos(a) * .1, .319, z + Math.sin(a) * .1, blue); rib.rotation.y = -a
    }
    cylinder('motor-top', .235, .023, x, .378, z, blue)
    const blades: Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const blade = profilePrism('fpv-swept-blade', [
        [-.024, .025], [-.055, .14], [-.083, .3], [-.085, .46], [-.047, .58],
        [.005, .615], [.041, .586], [.061, .48], [.068, .32], [.061, .16], [.028, .024],
      ], .014, scene)
      blade.rotation.x = Math.PI / 2; blade.rotation.y = i * Math.PI * 2 / 3; blade.material = prop; blades.push(blade)
    }
    const rotor = Mesh.MergeMeshes(blades, true, true)!
    add(rotor, prop, x, .415, z); rotors.push(rotor)
    cylinder('prop-hub', .09, .065, x, .433, z, blue, 20)
    cylinder('prop-nut', .071, .049, x, .484, z, gold, 6)
    partDetail = 'lights'
    const ledStrip = box('led-carrier', .063, .1, .72, x * .64, .14, z * .64, mount); ledStrip.rotation.y = arm.rotation.y
    for (let j = 0; j < 3; j++) {
      const t = .43 + j * .2
      const diode = cylinder('led-diode', .037, .025, x * t, .21, z * t, z < 0 ? warmLed : led, 8); diode.rotation.x = Math.PI / 2
    }
  }
  // Batch within each selectable component. Shared materials must not merge
  // the camera, wires and LEDs into a single hit target.
  // Capture membership before MergeMeshes disposes the original pieces.
  const groups = [null, ...droneBuildNotes.map(note => note.id)].map(detail => ({
    detail, pieces: pieces.filter(mesh => !rotors.includes(mesh) && mesh.metadata.droneDetail === detail),
  }))
  const meshes = groups.flatMap(({ detail, pieces: group }) => {
    const merged = batchAssembly(group, root)
    const note = droneBuildNotes.find(item => item.id === detail)
    if (note) merged.forEach(mesh => { mesh.metadata = { ...root.metadata, worldAction: `detail-${note.id}`, navigationLabel: note.label, droneDetail: note.id } })
    return merged
  }).concat(rotors)
  const surfaces = meshes.map(mesh => ({ mesh, original: mesh.material as StandardMaterial }))
  const highlighted = new Map<StandardMaterial, StandardMaterial>()
  let detail: DroneBuildDetail | null = null
  let flying = false, previous = 0
  return {
    meshes,
    setDetail(value: DroneBuildDetail | null) {
      if (detail === value) return
      detail = value
      for (const { mesh, original } of surfaces) {
        if (value && mesh.metadata.droneDetail === value && original !== lens) {
          let material = highlighted.get(original)
          if (!material) {
            material = original.clone(`${original.name}-inspection`)
            material.emissiveColor = original.emissiveColor.add(new Color3(.24, .16, .065))
            highlighted.set(original, material)
          }
          mesh.material = material
        } else mesh.material = original
      }
      scene.metadata.needsRender = true
    },
    setFlying(value: boolean) { flying = value; scene.metadata.needsRender = true },
    animate(now: number, reducedMotion: boolean) {
      const delta = Math.min(50, previous ? now - previous : 16); previous = now
      const height = position.y + (flying ? .85 + (reducedMotion ? 0 : Math.sin(now * .0017) * .035) : 0)
      const moving = Math.abs(root.position.y - height) > .001
      if (reducedMotion) root.position.y = height
      else if (moving) root.position.y += (height - root.position.y) * (1 - Math.exp(-delta / 170))
      if (flying && !reducedMotion) rotors.forEach((rotor, i) => { rotor.rotation.y += delta * .014 * (i % 2 ? 1 : -1) })
      if (moving || (flying && !reducedMotion)) scene.metadata.needsRender = true
    },
  }
}
