import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { TourSection } from '@/data/tourSections'

export interface ScrollContextValue {
  scrollProgress: number
  activeSection: TourSection | null
}

const ScrollContext = createContext<ScrollContextValue | null>(null)

export function ScrollProvider({
  scrollProgress,
  activeSection,
  children,
}: ScrollContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ scrollProgress, activeSection }),
    [scrollProgress, activeSection],
  )
  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useScrollProgress(): ScrollContextValue {
  const ctx = useContext(ScrollContext)
  if (!ctx) {
    throw new Error('useScrollProgress must be used within a ScrollProvider')
  }
  return ctx
}
