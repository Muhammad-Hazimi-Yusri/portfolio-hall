import type { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { batchAssembly, profilePrism, roundedBox, roundedOutline, thinRing } from './exhibitGeometry'

/** The photographed team robot, presented as an illustrative assembly. */
export function createPetBot(scene: Scene, position: Vector3, layer: number) {
  const root = new Mesh('petbot-assembly', scene)
  root.position.copyFrom(position); root.layerMask = layer; root.isPickable = false
  root.metadata = { portfolioRoute: '#world/hardware/petbot', worldAction: 'source-next' }
  const lid = new Mesh('petbot-lid-assembly', scene), face = new Mesh('petbot-tablet-assembly', scene)
  for (const group of [lid, face]) { group.parent = root; group.layerMask = layer; group.metadata = root.metadata; group.isPickable = false }
  face.position.set(0, .88, -.56); face.rotation.x = .15
  const parts: Mesh[] = [], lidParts: Mesh[] = [], faceParts: Mesh[] = []
  const mat = (name: string, color: string, shine = .12) => {
    const value = new StandardMaterial(`petbot-${name}`, scene)
    value.diffuseColor = Color3.FromHexString(color); value.specularColor = new Color3(shine, shine, shine)
    value.specularPower = 44; value.fogEnabled = false; return value
  }
  const shell = mat('printed-coral', '#bf503d', .21), inner = mat('ear-inset', '#9b3029', .1)
  const dark = mat('rubber', '#151e23', .06), ivory = mat('wheel-plastic', '#d1cebd', .16)
  const steel = mat('fasteners', '#77848d', .52), servo = mat('servo', '#293754', .35)
  const boardMat = mat('board', '#286452', .16), chipMat = mat('chips', '#222b31', .12)
  const printTexture = new DynamicTexture('petbot-print-layers', { width: 32, height: 256 }, scene)
  const printCtx = printTexture.getContext() as unknown as CanvasRenderingContext2D
  printCtx.fillStyle = '#f6f0e8'; printCtx.fillRect(0, 0, 32, 256)
  for (let y = 0; y < 256; y += 4) { printCtx.fillStyle = '#e3d6cf'; printCtx.fillRect(0, y, 32, 1) }
  printTexture.update(); shell.diffuseTexture = printTexture
  const add = (mesh: Mesh, material: StandardMaterial, x: number, y: number, z: number, group = root) => {
    mesh.parent = group; mesh.position.set(x, y, z); mesh.material = material; mesh.layerMask = layer; mesh.metadata = root.metadata
    ;(group === lid ? lidParts : group === face ? faceParts : parts).push(mesh); return mesh
  }
  const box = (name: string, w: number, h: number, d: number, x: number, y: number, z: number, material: StandardMaterial, group = root, bevel = 0) => add(bevel
    ? roundedBox(`petbot-${name}`, w, h, d, bevel, scene)
    : MeshBuilder.CreateBox(`petbot-${name}`, { width: w, height: h, depth: d }, scene), material, x, y, z, group)
  const cylinder = (name: string, diameter: number, height: number, x: number, y: number, z: number, material: StandardMaterial, group = root, segments = 24) => add(MeshBuilder.CreateCylinder(`petbot-${name}`, { diameter, height, tessellation: segments }, scene), material, x, y, z, group)

  box('chassis', 1.28, .14, 1.14, 0, .24, 0, shell, root, .05)
  for (const side of [-1, 1]) {
    const panel = add(profilePrism('petbot-curved-side', roundedOutline(1.09, 1.04, .14), .09, scene), shell, side * .61, .85, .03)
    panel.rotation.y = Math.PI / 2
    const arm = add(MeshBuilder.CreateSphere('petbot-side-arm', { diameter: 1, segments: 16 }, scene), shell, side * .8, .83, -.48)
    arm.scaling.set(.18, .44, .13); arm.rotation.z = -side * .33
    const armPivot = cylinder('arm-pivot', .135, .08, side * .695, .98, -.43, servo); armPivot.rotation.z = Math.PI / 2
  }
  box('back', 1.13, 1.01, .09, 0, .845, .532, shell, root, .042)
  for (let i = 0; i < 7; i++) box('rear-vent', .055, .3, .012, -.33 + i * .11, .76, .585, dark)
  box('lid', 1.3, .125, 1.12, 0, 1.37, .02, shell, lid, .06)
  for (const side of [-1, 1]) {
    box('ear-servo', .16, .12, .19, side * .37, 1.48, -.27, servo, lid, .025)
    const ear = add(profilePrism('petbot-ear', [
      [-.24, -.21], [.23, -.21], [.218, -.12], [.08, .22], [.015, .29], [-.065, .26], [-.2, -.025],
    ], .105, scene), shell, side * .37, 1.76, -.28, lid)
    ear.rotation.z = -side * .08
    const inset = add(profilePrism('petbot-ear-recess', [[-.157, -.13], [.144, -.13], [.031, .148], [-.013, .19], [-.063, .13]], .008, scene), inner, side * .37, 1.76, -.338, lid)
    inset.rotation.z = ear.rotation.z
    cylinder('lid-screw', .045, .016, side * .46, 1.44, .36, steel, lid, 10)
  }
  box('tablet-support', 1.35, 1, .065, 0, 0, .045, shell, face, .03)
  box('tablet', 1.22, .91, .075, 0, .01, -.02, dark, face, .035)
  box('tablet-retainer', 1.36, .075, .12, 0, -.465, -.035, shell, face, .032)
  const display = mat('display', '#ffffff', 0)
  const tex = new DynamicTexture('petbot-screen', { width: 512, height: 384 }, scene)
  const ctx = tex.getContext() as unknown as CanvasRenderingContext2D
  ctx.fillStyle = '#1f2d37'; ctx.fillRect(0, 0, 512, 384)
  ctx.strokeStyle = '#527387'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(25, 70, 462, 242, 25); ctx.stroke()
  ctx.fillStyle = '#b7c4c9'; ctx.font = '20px sans-serif'; ctx.fillText('PetBot', 28, 41)
  ctx.fillStyle = '#e0ece9'
  for (const x of [190, 322]) { ctx.beginPath(); ctx.arc(x, 177, 8, 0, Math.PI * 2); ctx.fill() }
  ctx.strokeStyle = '#e0ece9'; ctx.lineWidth = 7; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(225, 182); ctx.bezierCurveTo(222, 218, 251, 220, 256, 191); ctx.bezierCurveTo(261, 220, 289, 218, 287, 182); ctx.stroke()
  ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(159, 186, 13, 39, 0, Math.PI / 2, Math.PI * 1.5); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(353, 186, 13, 39, 0, -Math.PI / 2, Math.PI / 2); ctx.stroke()
  tex.update(); display.disableLighting = true; display.emissiveColor = Color3.Black(); display.emissiveTexture = tex
  add(MeshBuilder.CreatePlane('petbot-display', { width: 1.095, height: .735 }, scene), display, 0, .005, -.061, face)

  for (const side of [-1, 1]) for (const z of [-.37, .37]) {
    const wheel = cylinder('tire', .41, .125, side * .7, .22, z, dark, root, 32); wheel.rotation.z = Math.PI / 2
    const hub = cylinder('hub', .095, .017, side * .774, .22, z, ivory, root, 20); hub.rotation.z = Math.PI / 2
    const rim = add(thinRing('petbot-wheel-rim', .338, .03, 32, scene), ivory, side * .774, .22, z); rim.rotation.z = Math.PI / 2
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3
      const spoke = box('spoke', .022, .128, .026, side * .774, .22 + Math.cos(angle) * .095, z + Math.sin(angle) * .095, ivory)
      spoke.rotation.x = angle
    }
  }
  box('interior-board', .83, .05, .66, 0, .78, .015, boardMat)
  for (const x of [-.24, .2]) box('processor', .24, .08, .28, x, .845, .015, chipMat)
  for (let i = 0; i < 8; i++) box('board-pin', .024, .075, .024, -.3 + i * .084, .842, -.29, steel)
  box('board-port', .17, .07, .13, .305, .837, .2, steel)
  const meshes = [...batchAssembly(parts, root), ...batchAssembly(lidParts, lid), ...batchAssembly(faceParts, face)]
  let opened = false, previous = 0
  return {
    meshes, source: position,
    setOpen(value: boolean) { opened = value; scene.metadata.needsRender = true },
    animate(now: number, reducedMotion: boolean) {
      const elapsed = Math.min(80, previous ? now - previous : 16); previous = now
      const amount = reducedMotion ? 1 : 1 - Math.exp(-elapsed / 150)
      const roof = opened ? .48 : 0, front = opened ? -1.02 : -.56
      if (Math.abs(lid.position.y - roof) > .001 || Math.abs(face.position.z - front) > .001) {
        lid.position.y += (roof - lid.position.y) * amount; face.position.z += (front - face.position.z) * amount
        scene.metadata.needsRender = true
      }
    },
  }
}
