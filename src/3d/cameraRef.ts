import type { MutableRefObject } from 'react'

export type CameraRefValue = {
  position: { x: number; z: number }
  rotationY: number
  isFlyingTo: boolean
}

export type CameraRef = MutableRefObject<CameraRefValue>

export function createCameraRefDefault(): CameraRefValue {
  return {
    position: { x: 0, z: 5 },
    rotationY: 0,
    isFlyingTo: false,
  }
}
