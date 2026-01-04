import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'

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
  gyroRef?: React.MutableRefObject<boolean>
) {
  const camera = new UniversalCamera('fpCam', new Vector3(0, 1.6, 5), scene)
  
  camera.setTarget(new Vector3(0, 1.6, 0))
  camera.attachControl(canvas, true)

  // Clipping planes
  camera.minZ = 0.1
  camera.maxZ = 100

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
  const gravity = -0.015
  const jumpForce = 0.2
  const groundY = 1.6
  let isGrounded = true

  // Gyro state
  let initialAlpha: number | null = null
  let touchOffsetYaw = 0
  let touchOffsetPitch = 0
  let lastOrientation: boolean | null = null

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!gyroRef?.current) return
    if (e.alpha === null || e.beta === null || e.gamma === null) return

    const isLandscape = window.innerWidth > window.innerHeight

    // Detect orientation change - recalibrate to maintain current view
    if (lastOrientation !== null && lastOrientation !== isLandscape) {
      initialAlpha = e.alpha
      if (isLandscape) {
        const gyroPitch = (e.gamma * Math.PI) / 180
        touchOffsetPitch = camera.rotation.x - gyroPitch
      } else {
        const gyroPitch = ((e.beta - 90) * Math.PI) / 180
        touchOffsetPitch = camera.rotation.x + gyroPitch
      }
    }
    lastOrientation = isLandscape

    // Initialize on first read
    if (initialAlpha === null) {
      initialAlpha = e.alpha
      // Capture current camera rotation so it doesn't jump
      if (isLandscape) {
        const gyroPitch = (e.gamma * Math.PI) / 180
        touchOffsetYaw = camera.rotation.y
        touchOffsetPitch = camera.rotation.x - gyroPitch
      } else {
        const gyroPitch = ((e.beta - 90) * Math.PI) / 180
        touchOffsetYaw = camera.rotation.y
        touchOffsetPitch = camera.rotation.x + gyroPitch
      }
    }

    let yaw = ((e.alpha - initialAlpha) * Math.PI) / 180
    // Normalize to -PI to PI
    while (yaw > Math.PI) yaw -= 2 * Math.PI
    while (yaw < -Math.PI) yaw += 2 * Math.PI

    let pitch: number
    if (isLandscape) {
      // Landscape: gamma controls pitch
      pitch = (e.gamma * Math.PI) / 180
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch + touchOffsetPitch))
    } else {
      // Portrait: beta controls pitch
      pitch = ((e.beta - 90) * Math.PI) / 180
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, -pitch + touchOffsetPitch))
    }

    camera.rotation.y = -yaw + touchOffsetYaw
  }

  window.addEventListener('deviceorientation', handleOrientation)

  scene.onBeforeRenderObservable.add(() => {
    // Joystick movement
    if (joystickRef?.current) {
      const { x, y } = joystickRef.current
      if (x !== 0 || y !== 0) {
        const moveSpeed = sprintRef?.current ? 0.12 : 0.06
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
  })

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isGrounded) {
      velocityY = jumpForce
      isGrounded = false
    }
  })

  return camera
}