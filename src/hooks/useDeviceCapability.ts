import { useState, useEffect } from 'react'
import { checkDeviceCapability, CapabilityResult } from '@/utils/detection'

type DeviceCapabilityState = CapabilityResult & {
  isChecking: boolean
}

export const useDeviceCapability = (): DeviceCapabilityState => {
  const [state, setState] = useState<DeviceCapabilityState>({
    isChecking: true,
    canUse3D: true,
    warnings: [],
  })

  useEffect(() => {
    const result = checkDeviceCapability()
    setState({
      isChecking: false,
      ...result,
    })
  }, [])

  return state
}