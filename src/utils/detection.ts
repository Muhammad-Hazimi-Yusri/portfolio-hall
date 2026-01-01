// src/utils/detection.ts

export const hasWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export const hasWebGL2 = (): boolean => {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

export const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Returns device RAM in GB.
 * 
 * Browser support:
 * - Chrome/Edge: ✅ 
 * - Firefox: ❌ (falls back to 4GB)
 * - Safari/iOS: ❌ (falls back to 4GB)
 */
export const getDeviceRAM = (): number => {
  return (navigator as { deviceMemory?: number }).deviceMemory ?? 4
}

export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Detects slow network (2G/slow-2G).
 * 
 * Browser support:
 * - Chrome/Edge: ✅
 * - Firefox: ❌ (always returns false)
 * - Safari/iOS: ❌ (always returns false)
 */
export const isSlowConnection = (): boolean => {
  const conn = (navigator as { connection?: { effectiveType?: string } }).connection
  if (!conn?.effectiveType) return false
  return ['slow-2g', '2g'].includes(conn.effectiveType)
}

export type CapabilityResult = {
  canUse3D: boolean        // false = blocked entirely
  warnings: string[]       // reasons to consider fallback
}

export const checkDeviceCapability = (): CapabilityResult => {
  const warnings: string[] = []
  
  // Hard blockers
  if (!hasWebGL() || !hasWebGL2()) {
    return { canUse3D: false, warnings: ['WebGL not supported'] }
  }
  
  // Soft warnings
  if (isMobile() && getDeviceRAM() < 4) {
    warnings.push('Limited device memory')
  }
  if (prefersReducedMotion()) {
    warnings.push('Reduced motion preferred')
  }
  if (isSlowConnection()) {
    warnings.push('Slow connection detected')
  }
  if (isMobile()) {
    warnings.push('Best experienced on desktop')
  }
  
  return { canUse3D: true, warnings }
}