import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'

// Side-effect imports for camera inputs
import '@babylonjs/core/Cameras/Inputs/freeCameraKeyboardMoveInput'
import '@babylonjs/core/Cameras/Inputs/freeCameraMouseInput'

export function createFirstPersonCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
  joystickRef?: React.RefObject<{ x: number; y: number }>
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

  // Gravity & Jump
  camera.applyGravity = false // We'll handle it manually
  
  let velocityY = 0
  const gravity = -0.015
  const jumpForce = 0.2
  const groundY = 1.6
  let isGrounded = true

  scene.onBeforeRenderObservable.add(() => {
    // Joystick movement (using cameraDirection for collision support)
    if (joystickRef?.current) {
      const { x, y } = joystickRef.current
      if (x !== 0 || y !== 0) {
        const moveSpeed = 0.06
        camera.cameraDirection.addInPlace(
          camera.getDirection(Vector3.Forward()).scale(y * moveSpeed)
        )
        camera.cameraDirection.addInPlace(
          camera.getDirection(Vector3.Right()).scale(x * moveSpeed)
        )
      }
    }

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