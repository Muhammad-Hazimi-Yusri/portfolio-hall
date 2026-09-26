import { Scene } from '@babylonjs/core/scene'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera'
import type { CameraRef } from './cameraRef'
import { EYE_HEIGHT, walkingStep, jumpStep } from './locomotion'

// Side-effect imports for camera inputs
import '@babylonjs/core/Cameras/Inputs/freeCameraKeyboardMoveInput'
import '@babylonjs/core/Cameras/Inputs/freeCameraMouseInput'

// Touch-look yaw: a full screen-width swipe turns 180 degrees.
// Viewport-relative so dense-DPI phones and tablets feel the same.
// Gyro-ON and gyro-OFF paths use the same value so drag feels identical
// regardless of whether gyro is active — touch offset accumulates on top
// of gyro rotation, the final camera.rotation pitch is clamped separately.
const TOUCH_LOOK_FULL_SCREEN_YAW = Math.PI
const TOUCH_LOOK_GYRO_OFFSET_YAW = TOUCH_LOOK_FULL_SCREEN_YAW

// Exponential smoothing for noisy device-orientation sensors.
// α closer to 1 = more responsive, less smoothing; 0.25 kills ~75% of frame noise
// while staying responsive to real motion. Tuned for typical 60 Hz orientation feed.
const GYRO_SMOOTH_ALPHA = 0.25

// Shortest-path angular lerp in degrees, handling the 360°→0° wrap seam.
function lerpAngleDeg(a: number, b: number, t: number): number {
  const diff = ((b - a + 540) % 360) - 180
  return a + diff * t
}

export function createFirstPersonCamera(
  scene: Scene,
  canvas: HTMLCanvasElement,
  joystickRef?: React.MutableRefObject<{ x: number; y: number }>,
  lookRef?: React.MutableRefObject<{ x: number; y: number }>,
  jumpRef?: React.MutableRefObject<boolean>,
  sprintRef?: React.MutableRefObject<boolean>,
  gyroRef?: React.MutableRefObject<boolean>,
  landscapeModeRef?: React.MutableRefObject<boolean>,
  cameraRef?: CameraRef,
  initialPosition?: { x: number; y: number; z: number },
  initialTarget?: { x: number; y: number; z: number },
  recenterGyroRef?: React.MutableRefObject<boolean>,
) {
  const start = initialPosition ?? { x: 0, y: EYE_HEIGHT, z: 2 }
  const target = initialTarget ?? { x: 0, y: EYE_HEIGHT, z: 15 }
  const camera = new UniversalCamera('fpCam', new Vector3(start.x, start.y, start.z), scene)
  camera.setTarget(new Vector3(target.x, target.y, target.z))
  // One movement path for keyboard and touch. Babylon's mouse look remains,
  // while duplicate touch/keyboard movement inputs are explicitly removed.
  camera.inputs.removeByType('FreeCameraKeyboardMoveInput')
  camera.inputs.removeByType('FreeCameraTouchInput')
  camera.attachControl(canvas, true)

  // Clipping planes
  camera.minZ = 0.1
  camera.maxZ = 1600

  // Adjust FOV based on orientation
  const updateFOV = () => {
    const isPortrait = window.innerHeight > window.innerWidth
    camera.fov = isPortrait ? 1.15 : 0.95
  }
  updateFOV()
  window.addEventListener('resize', updateFOV)

  // Camera sensitivity & inertia
  camera.angularSensibility = 1800
  camera.inertia = 0

  // Collision ellipsoid
  camera.ellipsoid = new Vector3(0.35, 0.75, 0.35)
  camera.ellipsoidOffset = Vector3.Zero()
  camera.checkCollisions = true

  camera.applyGravity = false
  
  let velocityY = 0
  const keys = new Set<string>()
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space'])
  const active = () => !document.hidden && !cameraRef?.current.isInVR && !cameraRef?.current.isFlyingTo && !scene.metadata?.inputPaused
  const onKeyDown = (event: KeyboardEvent) => {
    if (!active() || !movementKeys.has(event.code) || event.ctrlKey || event.altKey || event.metaKey) return
    if (document.pointerLockElement !== canvas && document.activeElement !== canvas) return
    event.preventDefault()
    if (event.code === 'Space' && !event.repeat && jumpRef) jumpRef.current = true
    keys.add(event.code)
  }
  const onKeyUp = (event: KeyboardEvent) => { keys.delete(event.code) }
  const clearInput = () => {
    keys.clear(); camera.cameraDirection.setAll(0); camera.cameraRotation.setAll(0)
    if (joystickRef) joystickRef.current = { x: 0, y: 0 }
    if (lookRef) lookRef.current = { x: 0, y: 0 }
    if (jumpRef) jumpRef.current = false
  }
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', clearInput)
  document.addEventListener('visibilitychange', clearInput)
  document.addEventListener('pointerlockchange', clearInput)
  canvas.addEventListener('blur', clearInput)

  // Gyro state
  let initialAlpha: number | null = null
  let touchOffsetYaw = 0
  let touchOffsetPitch = 0
  let lastLandscapeMode: boolean | null = null
  let lastAlpha: number | null = null
  const MAX_ALPHA_DELTA = 30 // degrees per event — reject sensor glitches

  // Low-pass smoothed sensor readings — survives jittery / drifting phone gyros.
  let smoothedAlpha: number | null = null
  let smoothedBeta: number | null = null
  let smoothedGamma: number | null = null

  const getGyroPitch = (beta: number, gamma: number, isLandscape: boolean): number => {
    if (isLandscape) {
      return (gamma * Math.PI) / 180 * 0.5
    } else {
      return ((beta - 90) * Math.PI) / 180 * -1
    }
  }

  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (!gyroRef?.current || !active()) return
    if (e.alpha === null || e.beta === null || e.gamma === null) return

    const isLandscape = landscapeModeRef?.current ?? false

    // Recalibrate when landscape mode changes
    if (lastLandscapeMode !== null && lastLandscapeMode !== isLandscape) {
      initialAlpha = null
      smoothedAlpha = null
      smoothedBeta = null
      smoothedGamma = null
    }
    lastLandscapeMode = isLandscape

    // Low-pass filter raw sensor readings to soak up jitter before they drive the camera
    smoothedAlpha = smoothedAlpha === null ? e.alpha : lerpAngleDeg(smoothedAlpha, e.alpha, GYRO_SMOOTH_ALPHA)
    smoothedBeta = smoothedBeta === null ? e.beta : smoothedBeta + (e.beta - smoothedBeta) * GYRO_SMOOTH_ALPHA
    smoothedGamma = smoothedGamma === null ? e.gamma : smoothedGamma + (e.gamma - smoothedGamma) * GYRO_SMOOTH_ALPHA

    const gyroPitch = getGyroPitch(smoothedBeta, smoothedGamma, isLandscape)

    // Initialize on first read or after recalibration
    if (initialAlpha === null) {
      initialAlpha = smoothedAlpha
      lastAlpha = smoothedAlpha
      touchOffsetYaw = camera.rotation.y
      touchOffsetPitch = camera.rotation.x - gyroPitch
      return
    }

    // Reject sudden alpha jumps (sensor glitch / gimbal lock)
    let alphaDelta = smoothedAlpha - (lastAlpha ?? smoothedAlpha)
    if (alphaDelta > 180) alphaDelta -= 360
    if (alphaDelta < -180) alphaDelta += 360
    lastAlpha = smoothedAlpha

    if (Math.abs(alphaDelta) > MAX_ALPHA_DELTA) {
      // Recalibrate instead of snapping camera
      initialAlpha = smoothedAlpha
      touchOffsetYaw = camera.rotation.y
      touchOffsetPitch = camera.rotation.x - gyroPitch
      return
    }

    // Yaw from alpha only — no roll influence
    let yaw = ((smoothedAlpha - initialAlpha) * Math.PI) / 180
    while (yaw > Math.PI) yaw -= 2 * Math.PI
    while (yaw < -Math.PI) yaw += 2 * Math.PI

    camera.rotation.y = -yaw + touchOffsetYaw
    camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, gyroPitch + touchOffsetPitch))
  }

  window.addEventListener('deviceorientation', handleOrientation)

  const inputObserver = scene.onBeforeAnimationsObservable.add(() => {
    // Skip all input while in VR — XR camera takes over
    if (!active()) { clearInput(); velocityY = 0; initialAlpha = null; return }
    if (!gyroRef?.current) initialAlpha = null

    // User-triggered recenter: re-zero the gyro baseline to the current phone pose
    if (recenterGyroRef?.current) {
      initialAlpha = null
      lastAlpha = null
      touchOffsetYaw = 0
      touchOffsetPitch = 0
      smoothedAlpha = null
      smoothedBeta = null
      smoothedGamma = null
      camera.rotation.y = 0
      camera.rotation.x = 0
      recenterGyroRef.current = false
    }

    // Apply the shared movement path before Babylon updates the camera.
    {
      const seconds = scene.getEngine().getDeltaTime() / 1000
      const x = (joystickRef?.current.x ?? 0) + Number(keys.has('KeyD') || keys.has('ArrowRight')) - Number(keys.has('KeyA') || keys.has('ArrowLeft'))
      const forward = (joystickRef?.current.y ?? 0) + Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown'))
      const step = walkingStep(x, forward, camera.rotation.y, seconds, Boolean(sprintRef?.current || keys.has('ShiftLeft') || keys.has('ShiftRight')))
      camera.cameraDirection.set(step.x, 0, step.z)

      // Touch look — sensitivity scales with viewport width so a full-screen
      // swipe always produces the same angular travel regardless of DPR/size.
      if (lookRef?.current) {
        const { x, y } = lookRef.current
        if (x !== 0 || y !== 0) {
          const viewportWidth = window.innerWidth || 1
          if (gyroRef?.current) {
            // Gyro ON: touch adds offset
            const sensitivity = TOUCH_LOOK_GYRO_OFFSET_YAW / viewportWidth
            touchOffsetYaw += x * sensitivity
            touchOffsetPitch += y * sensitivity
            touchOffsetPitch = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, touchOffsetPitch))
          } else {
            // Gyro OFF: touch controls camera directly
            const sensitivity = TOUCH_LOOK_FULL_SCREEN_YAW / viewportWidth
            camera.rotation.y += x * sensitivity
            camera.rotation.x += y * sensitivity
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x))
          }
          lookRef.current = { x: 0, y: 0 }
        }
      }

      const jump = jumpStep(camera.position.y, velocityY, seconds, Boolean(jumpRef?.current))
      camera.position.y = jump.height; velocityY = jump.velocity
      if (jumpRef) jumpRef.current = false
    }
  })
  const positionObserver = scene.onBeforeRenderObservable.add(() => {
    // Write camera position to shared ref
    if (cameraRef) {
      cameraRef.current.position.x = camera.position.x
      cameraRef.current.position.z = camera.position.z
      cameraRef.current.rotationY = camera.rotation.y
    }
  })

  camera.onDisposeObservable.addOnce(() => {
    clearInput()
    scene.onBeforeAnimationsObservable.remove(inputObserver)
    scene.onBeforeRenderObservable.remove(positionObserver)
    window.removeEventListener('resize', updateFOV)
    window.removeEventListener('deviceorientation', handleOrientation)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', clearInput)
    document.removeEventListener('visibilitychange', clearInput)
    document.removeEventListener('pointerlockchange', clearInput)
    canvas.removeEventListener('blur', clearInput)
  })

  // Read input before deciding whether to draw. Keeping this separate from
  // onBeforeAnimations lets the renderer sleep without starving the first
  // key, touch-look delta or the rest of an airborne jump.
  const hasPendingInput = () => active() && (
    keys.size > 0 || Math.hypot(joystickRef?.current.x ?? 0, joystickRef?.current.y ?? 0) >= .08 ||
    Boolean(lookRef?.current.x || lookRef?.current.y || jumpRef?.current || recenterGyroRef?.current) ||
    velocityY !== 0 || camera.position.y > EYE_HEIGHT + .001 || camera.cameraRotation.lengthSquared() > 0
  )
  return { camera, hasPendingInput }
}
