import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { CameraRef } from './cameraRef'

// Side-effect imports for camera inputs
import '@babylonjs/core/Cameras/Inputs/freeCameraKeyboardMoveInput'
import '@babylonjs/core/Cameras/Inputs/freeCameraMouseInput'

export function createFirstPersonCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
  joystickRef?: React.MutableRefObject<{ x: number; y: number }>,
  lookRef?: React.MutableRefObject<{ x: number; y: number }>,
  jumpRef?: React.MutableRefObject<boolean>,
  sprintRef?: React.MutableRefObject<boolean>,
  gyroRef?: React.MutableRefObject<boolean>,
  landscapeModeRef?: React.MutableRefObject<boolean>,
  cameraRef?: CameraRef
) {
  const camera = new UniversalCamera('fpCam', new Vector3(0, 1.6, 5), scene)
  
  camera.setTarget(new Vector3(0, 1.6, 0))
  camera.attachControl(canvas, true)

  // Clipping planes
  camera.minZ = 0.1
  camera.maxZ = 100

  // Adjust FOV based on orientation
  const updateFOV = () => {
    const isPortrait = window.innerHeight > window.innerWidth
    camera.fov = isPortrait ? 2.0 : 0.8  // radians: ~115° portrait, ~46° landscape
  }
  updateFOV()
  window.addEventListener('resize', updateFOV)

  // Camera sensitivity & inertia
  camera.angularSensibility = 1000
  camera.inertia = 0.2

  // Movement speeds
  const walkSpeed = 0.6
  const sprintSpeed = 1.2
  camera.speed = walkSpeed

  // Sprint (Shift key)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      camera.speed = sprintSpeed
    }
  })

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      camera.speed = walkSpeed
    }
  })

  // WASD keys
  camera.keysUp = [87, 38]
  camera.keysDown = [83, 40]
  camera.keysLeft = [65, 37]
  camera.keysRight = [68, 39]

  // Collision ellipsoid
  camera.ellipsoid = new Vector3(0.8, 0.9, 0.8)
  camera.ellipsoidOffset = new Vector3(0, 0.9, 0)
  camera.checkCollisions = true

  camera.applyGravity = false
  
  let velocityY = 0
  const gravity = -0.006
  const jumpForce = 0.18
  const groundY = 1.6
  let isGrounded = true

  // Gyro state
  let initialAlpha: number | null = null
  let touchOffsetYaw = 0
  let touchOffsetPitch = 0
  let lastLandscapeMode: boolean | null = null
  let lastAlpha: number | null = null
  const MAX_ALPHA_DELTA = 30 // degrees per event — reject sensor glitches

  const getGyroPitch = (beta: number, gamma: number, isLandscape: boolean): number => {
    if (isLandscape) {
      return (gamma * Math.PI) / 180 * 0.5
    } else {
      return ((beta - 90) * Math.PI) / 180 * -1
    }
  }

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!gyroRef?.current) return
    if (e.alpha === null || e.beta === null || e.gamma === null) return

    const isLandscape = landscapeModeRef?.current ?? false
    const gyroPitch = getGyroPitch(e.beta, e.gamma, isLandscape)

    // Recalibrate when landscape mode changes
    if (lastLandscapeMode !== null && lastLandscapeMode !== isLandscape) {
      initialAlpha = null
    }
    lastLandscapeMode = isLandscape

    // Initialize on first read or after recalibration
    if (initialAlpha === null) {
      initialAlpha = e.alpha
      lastAlpha = e.alpha
      touchOffsetYaw = camera.rotation.y
      touchOffsetPitch = camera.rotation.x - gyroPitch
      return
    }

    // Reject sudden alpha jumps (sensor glitch / gimbal lock)
    let alphaDelta = e.alpha - (lastAlpha ?? e.alpha)
    if (alphaDelta > 180) alphaDelta -= 360
    if (alphaDelta < -180) alphaDelta += 360
    lastAlpha = e.alpha

    if (Math.abs(alphaDelta) > MAX_ALPHA_DELTA) {
      // Recalibrate instead of snapping camera
      initialAlpha = e.alpha
      touchOffsetYaw = camera.rotation.y
      touchOffsetPitch = camera.rotation.x - gyroPitch
      return
    }

    // Yaw from alpha only — no roll influence
    let yaw = ((e.alpha - initialAlpha) * Math.PI) / 180
    while (yaw > Math.PI) yaw -= 2 * Math.PI
    while (yaw < -Math.PI) yaw += 2 * Math.PI

    camera.rotation.y = -yaw + touchOffsetYaw
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, gyroPitch + touchOffsetPitch))
  }

  window.addEventListener('deviceorientation', handleOrientation)

  scene.onBeforeRenderObservable.add(() => {
    // Skip movement during fly-to animation
    if (!cameraRef?.current.isFlyingTo) {
      // Joystick movement
      if (joystickRef?.current) {
        const { x, y } = joystickRef.current
        if (x !== 0 || y !== 0) {
          const moveSpeed = sprintRef?.current ? 0.04 : 0.02
          camera.cameraDirection.addInPlace(
            camera.getDirection(Vector3.Forward()).scale(y * moveSpeed)
          )
          camera.cameraDirection.addInPlace(
            camera.getDirection(Vector3.Right()).scale(x * moveSpeed)
          )
        }
      }

      // Touch look
      if (lookRef?.current) {
        const { x, y } = lookRef.current
        if (x !== 0 || y !== 0) {
          if (gyroRef?.current) {
            // Gyro ON: touch adds offset
            const sensitivity = 0.003
            touchOffsetYaw += x * sensitivity
            touchOffsetPitch += y * sensitivity
            touchOffsetPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, touchOffsetPitch))
          } else {
            // Gyro OFF: touch controls camera directly
            const sensitivity = 0.005
            camera.rotation.y += x * sensitivity
            camera.rotation.x += y * sensitivity
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
          }
          lookRef.current = { x: 0, y: 0 }
        }
      }

      // Mobile jump
      if (jumpRef?.current && isGrounded) {
        velocityY = jumpForce
        isGrounded = false
        jumpRef.current = false
      }

      // Gravity
      velocityY += gravity
      camera.position.y += velocityY

      if (camera.position.y <= groundY) {
        camera.position.y = groundY
        velocityY = 0
        isGrounded = true
      }
    } else {
      // Reset gravity state during fly-to so there's no jitter on landing
      velocityY = 0
      isGrounded = true
    }

    // Write camera position to shared ref
    if (cameraRef) {
      cameraRef.current.position.x = camera.position.x
      cameraRef.current.position.z = camera.position.z
      cameraRef.current.rotationY = camera.rotation.y
    }
  })

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isGrounded) {
      velocityY = jumpForce
      isGrounded = false
    }
  })

  return camera
}