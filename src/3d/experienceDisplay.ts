import { Mesh } from '@babylonjs/core/Meshes/mesh'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData'
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture'
import { Color3 } from '@babylonjs/core/Maths/math.color'
import type { Scene } from '@babylonjs/core/scene'
import type { POI } from '@/types/poi'
import { extrudeLogoMask } from './logoGeometry'
import { approachAngle, facingYaw, idleLogoPose, logoTracksCamera } from './logoMotion'

export function createExperienceDisplay(poi: POI, parent: Mesh, scene: Scene) {
  const display = poi.experienceDisplay
  if (!display) return
  const route = `#experience/${poi.id}`
  const labelTexture = new DynamicTexture(`${poi.id}-label`, { width: 1024, height: 364 }, scene, true)
  labelTexture.anisotropicFilteringLevel = 4
  const ctx = labelTexture.getContext() as unknown as CanvasRenderingContext2D
  ctx.fillStyle = '#eee7d7'; ctx.fillRect(0, 0, 1024, 364)
  ctx.fillStyle = '#846342'; ctx.font = '28px sans-serif'
  ctx.fillText(display.name, 60, 65, 904)
  // Put the role first at reading distance. Organisation and dates remain
  // available even before the separate logo image has finished loading.
  const [role, ...department] = display.role.split(' · ')
  ctx.fillStyle = '#292c28'; ctx.font = '64px Georgia, serif'
  const lines: string[] = []
  for (const word of role.split(' ')) {
    const last = lines.length - 1, next = last < 0 ? word : `${lines[last]} ${word}`
    if (last >= 0 && ctx.measureText(next).width <= 904) lines[last] = next
    else lines.push(word)
  }
  lines.forEach((line, i) => ctx.fillText(line, 58, (lines.length === 1 ? 202 : 161) + i * 72, 904))
  ctx.fillStyle = '#b8ac94'; ctx.fillRect(60, 275, 904, 1.5)
  ctx.fillStyle = '#626457'; ctx.font = '28px sans-serif'
  ctx.fillText(display.dates, 60, 325)
  if (department.length) { ctx.textAlign = 'right'; ctx.fillText(department.join(' · '), 964, 325, 430) }
  labelTexture.update()
  const labelMaterial = new StandardMaterial(`${poi.id}-label-material`, scene)
  labelMaterial.emissiveTexture = labelTexture; labelMaterial.disableLighting = true
  const label = MeshBuilder.CreatePlane(`${poi.id}-label`, { width: 1.92, height: .6825 }, scene)
  label.parent = parent; label.position.set(0, .735, -.412)
  label.material = labelMaterial
  label.metadata = { portfolioRoute: route }

  const floating = new Mesh(`${poi.id}-floating-logo`, scene)
  floating.parent = parent; floating.position.y = 2.15
  let solid: Mesh | null = null
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const motionChanged = () => { scene.metadata ??= {}; scene.metadata.needsRender = true }
  reducedMotion.addEventListener('change', motionChanged)
  let elapsed = 0, lastFrame = performance.now(), wasNear = false
  const observer = scene.onBeforeRenderObservable.add(() => {
    const now = performance.now()
    const dt = Math.min((now - lastFrame) / 1000, 0.08)
    lastFrame = now
    const paused = scene.metadata?.logosPaused ?? reducedMotion.matches
    const camera = scene.activeCamera
    floating.computeWorldMatrix(true)
    const position = floating.getAbsolutePosition()
    const dx = (camera?.globalPosition.x ?? position.x) - position.x
    const dy = (camera?.globalPosition.y ?? position.y) - position.y
    const dz = (camera?.globalPosition.z ?? position.z - 20) - position.z
    const { near, tracking } = logoTracksCamera(
      scene.metadata?.selectedExperienceId === poi.id || scene.metadata?.experienceOverview === true,
      scene.metadata?.hoveredExperienceId === poi.id || scene.metadata?.highlightedExperienceId === poi.id,
      Math.hypot(dx, dy, dz), wasNear,
    )
    wasNear = near
    if (!paused && !tracking) elapsed += dt
    const idle = idleLogoPose(display.motion, elapsed)
    const yaw = tracking ? facingYaw(dx, dz) - parent.rotation.y : idle.yaw
    const pitch = tracking ? Math.atan2(dy, Math.hypot(dx, dz)) : 0
    const lift = tracking ? 0 : idle.lift
    const amount = reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 6)
    floating.rotation.y = approachAngle(floating.rotation.y, yaw, amount)
    floating.rotation.x += (pitch - floating.rotation.x) * amount
    floating.position.y += (2.15 + lift - floating.position.y) * amount
    // Only visible motion needs another frame. Nearby logos stop after they
    // finish facing the visitor; logos behind the camera cannot keep a walk awake.
    const settling = Math.abs(approachAngle(floating.rotation.y, yaw, 1) - floating.rotation.y) > .001 ||
      Math.abs(pitch - floating.rotation.x) > .001 || Math.abs(2.15 + lift - floating.position.y) > .001
    if (solid?.isEnabled() && solid.isVisible && Math.hypot(dx, dy, dz) < 18 && camera?.isInFrustum(solid)) {
      scene.metadata ??= {}
      if (settling && tracking) scene.metadata.needsRender = true
      // Gentle idle motion needs only 30 updates per second. Looking or walking
      // still renders at the display's rate, and distant logos do not wake it.
      if ((!paused && !tracking) || settling) {
        scene.metadata.logoFrameAt = Math.min(scene.metadata.logoFrameAt ?? Infinity, now + 1000 / 30)
      }
    }
  })

  const image = new Image()
  image.onload = () => {
    if (scene.isDisposed || parent.isDisposed()) return
    const width = display.width, height = width * image.naturalHeight / image.naturalWidth
    const columns = 768, rows = Math.max(1, Math.round(columns * image.naturalHeight / image.naturalWidth))
    const sample = document.createElement('canvas')
    sample.width = columns; sample.height = rows
    const sampleContext = sample.getContext('2d', { willReadFrequently: true })!
    sampleContext.drawImage(image, 0, 0, columns, rows)
    const pixels = sampleContext.getImageData(0, 0, columns, rows).data
    const geometry = new VertexData()
    Object.assign(geometry, extrudeLogoMask(pixels, columns, rows, width, height, 0.16))
    solid = new Mesh(`${poi.id}-solid-logo`, scene)
    geometry.applyToMesh(solid)
    solid.parent = floating; solid.metadata = { portfolioRoute: route }

    const texture = new DynamicTexture(`${poi.id}-logo-colour`, { width: 1024, height: Math.round(1024 * image.naturalHeight / image.naturalWidth) }, scene)
    const colour = texture.getContext() as unknown as CanvasRenderingContext2D
    colour.drawImage(image, 0, 0, 1024, texture.getSize().height)
    // White source variants use the brand's dark colour on the solid itself.
    // The source files and the logos in the reading panel stay untouched.
    if (display.ink) {
      colour.globalCompositeOperation = 'source-in'
      colour.fillStyle = display.ink; colour.fillRect(0, 0, 1024, texture.getSize().height)
      colour.globalCompositeOperation = 'source-over'
    }
    texture.update()
    const material = new StandardMaterial(`${poi.id}-logo-material`, scene)
    material.diffuseTexture = texture; material.emissiveTexture = texture
    material.emissiveColor = new Color3(0.18, 0.18, 0.18)
    material.specularColor = new Color3(0.15, 0.15, 0.15)
    material.specularPower = 48
    solid.material = material
    scene.metadata ??= {}
    scene.metadata.needsRender = true
  }
  image.src = display.src
  scene.onDisposeObservable.addOnce(() => {
    scene.onBeforeRenderObservable.remove(observer)
    reducedMotion.removeEventListener('change', motionChanged)
    image.onload = null; image.onerror = null
  })
}
