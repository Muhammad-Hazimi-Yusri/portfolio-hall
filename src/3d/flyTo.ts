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

export function flyTo(
  scene: Scene,
  camera: UniversalCamera,
  target: FlyToTarget,
  onStart: () => void,
  onComplete: () => void,
  durationFrames = 20
): void {
  onStart()

  const targetPos = new Vector3(target.x, 1.6, target.z)

  // Position animation
  const posAnim = new Animation(
    'flyToPos',
    'position',
    60,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  )
  posAnim.setKeys([
    { frame: 0, value: camera.position.clone() },
    { frame: durationFrames, value: targetPos },
  ])

  const ease = new CubicEase()
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
  posAnim.setEasingFunction(ease)

  const anims: Animation[] = [posAnim]

  // Optional rotation to face a look-at point
  if (target.lookAtX !== undefined && target.lookAtZ !== undefined) {
    const dx = target.lookAtX - target.x
    const dz = target.lookAtZ - target.z
    const targetRotY = Math.atan2(dx, dz)

    const rotAnim = new Animation(
      'flyToRot',
      'rotation.y',
      60,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    )
    rotAnim.setKeys([
      { frame: 0, value: camera.rotation.y },
      { frame: durationFrames, value: targetRotY },
    ])
    rotAnim.setEasingFunction(ease)
    anims.push(rotAnim)
  }

  scene.beginDirectAnimation(
    camera,
    anims,
    0,
    durationFrames,
    false,
    1,
    () => onComplete()
  )
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
