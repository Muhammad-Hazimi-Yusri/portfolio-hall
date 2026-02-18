import { Animation } from '@babylonjs/core/Animations/animation'
import { CubicEase, EasingFunction } from '@babylonjs/core/Animations/easing'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import { Scene } from '@babylonjs/core/scene'
import type { POI } from '@/types/poi'

// Required for scene.beginDirectAnimation
import '@babylonjs/core/Animations/animatable'

export type FlyToTarget = {
  x: number
  z: number
  lookAtX?: number
  lookAtZ?: number
}

const FPS = 60

function createEase(): CubicEase {
  const ease = new CubicEase()
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
  return ease
}

function floatAnim(name: string, prop: string, from: number, to: number, frames: number): Animation {
  const anim = new Animation(name, prop, FPS, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
  anim.setKeys([{ frame: 0, value: from }, { frame: frames, value: to }])
  anim.setEasingFunction(createEase())
  return anim
}

/** Simple direct fly-to (used for short distances) */
export function flyToSimple(
  scene: Scene,
  camera: UniversalCamera,
  target: FlyToTarget,
  onStart: () => void,
  onComplete: () => void,
  durationFrames = 20
): void {
  onStart()
  camera.detachControl()

  const targetPos = new Vector3(target.x, 1.6, target.z)

  const posAnim = new Animation('flyToPos', 'position', FPS, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT)
  posAnim.setKeys([
    { frame: 0, value: camera.position.clone() },
    { frame: durationFrames, value: targetPos },
  ])
  posAnim.setEasingFunction(createEase())

  const anims: Animation[] = [posAnim]

  if (target.lookAtX !== undefined && target.lookAtZ !== undefined) {
    const dx = target.lookAtX - target.x
    const dz = target.lookAtZ - target.z
    let targetRotY = Math.atan2(dx, dz)
    // Normalize to shortest path
    while (targetRotY - camera.rotation.y > Math.PI) targetRotY -= 2 * Math.PI
    while (targetRotY - camera.rotation.y < -Math.PI) targetRotY += 2 * Math.PI

    anims.push(floatAnim('flyToRot', 'rotation.y', camera.rotation.y, targetRotY, durationFrames))
  }

  scene.beginDirectAnimation(camera, anims, 0, durationFrames, false, 1, () => {
    camera.attachControl(scene.getEngine().getRenderingCanvas()!, true)
    onComplete()
  })
}

/** GTA-style cinematic transition: rise → pan overhead → descend */
export function flyToCinematic(
  scene: Scene,
  camera: UniversalCamera,
  target: FlyToTarget,
  onStart: () => void,
  onComplete: () => void,
): void {
  // For short distances, use simple fly-to
  const dist = Math.sqrt(
    (target.x - camera.position.x) ** 2 +
    (target.z - camera.position.z) ** 2
  )
  if (dist < 3) {
    flyToSimple(scene, camera, target, onStart, onComplete)
    return
  }

  onStart()
  camera.detachControl()

  const ceilHeight = 12
  const phase1Frames = 25
  const phase2Frames = 50
  const phase3Frames = 25

  const startPos = camera.position.clone()
  const startRotX = camera.rotation.x
  const startRotY = camera.rotation.y

  // Compute target rotation for Phase 3
  let targetRotY = startRotY
  if (target.lookAtX !== undefined && target.lookAtZ !== undefined) {
    const dx = target.lookAtX - target.x
    const dz = target.lookAtZ - target.z
    targetRotY = Math.atan2(dx, dz)
  }
  // Normalize to shortest path
  while (targetRotY - startRotY > Math.PI) targetRotY -= 2 * Math.PI
  while (targetRotY - startRotY < -Math.PI) targetRotY += 2 * Math.PI

  // Phase 1: Rise + tilt down to top-down view
  const p1Anims = [
    floatAnim('p1PosY', 'position.y', startPos.y, ceilHeight, phase1Frames),
    floatAnim('p1RotX', 'rotation.x', startRotX, Math.PI / 2, phase1Frames),
  ]

  scene.beginDirectAnimation(camera, p1Anims, 0, phase1Frames, false, 1, () => {
    // Phase 2: Pan overhead to destination
    const p2Anims = [
      floatAnim('p2PosX', 'position.x', startPos.x, target.x, phase2Frames),
      floatAnim('p2PosZ', 'position.z', startPos.z, target.z, phase2Frames),
    ]

    scene.beginDirectAnimation(camera, p2Anims, 0, phase2Frames, false, 1, () => {
      // Phase 3: Descend + restore first-person view
      const p3Anims = [
        floatAnim('p3PosY', 'position.y', ceilHeight, 1.6, phase3Frames),
        floatAnim('p3RotX', 'rotation.x', Math.PI / 2, 0, phase3Frames),
        floatAnim('p3RotY', 'rotation.y', camera.rotation.y, targetRotY, phase3Frames),
      ]

      scene.beginDirectAnimation(camera, p3Anims, 0, phase3Frames, false, 1, () => {
        camera.attachControl(scene.getEngine().getRenderingCanvas()!, true)
        onComplete()
      })
    })
  })
}

/** Calculate a position 2.5 units in front of a POI, facing it */
export function getApproachPosition(poi: POI): { x: number; z: number } {
  const offsetDist = 2.5
  const rad = (poi.rotation * Math.PI) / 180
  return {
    x: poi.position.x + Math.sin(rad) * offsetDist,
    z: poi.position.z + Math.cos(rad) * offsetDist,
  }
}
