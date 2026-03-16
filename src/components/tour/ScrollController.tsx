import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { ScrollProvider } from '@/contexts/ScrollContext'
import { getSectionAtProgress, type TourSection } from '@/data/tourSections'

type ScrollControllerProps = {
  children: ReactNode
  initialScrollProgress?: number
}

export function ScrollController({ children, initialScrollProgress }: ScrollControllerProps) {
  const [scrollProgress, setScrollProgress] = useState(initialScrollProgress ?? 0)
  const [activeSection, setActiveSection] = useState<TourSection | null>(
    initialScrollProgress !== undefined ? getSectionAtProgress(initialScrollProgress) : null,
  )
  const rafPending = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set initial scroll position on mount (for tour resume)
  useEffect(() => {
    if (initialScrollProgress !== undefined && scrollContainerRef.current) {
      const el = scrollContainerRef.current
      requestAnimationFrame(() => {
        el.scrollTop = initialScrollProgress * (el.scrollHeight - el.clientHeight)
      })
    }
  }, []) // only on mount

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (rafPending.current) return
    rafPending.current = true

    const target = e.currentTarget
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    requestAnimationFrame(() => {
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0
      setScrollProgress(progress)
      setActiveSection(getSectionAtProgress(progress))
      rafPending.current = false
    })
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="w-full h-full overflow-y-auto"
    >
      <div style={{ height: '500vh' }}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="w-full h-full">
            <ScrollProvider scrollProgress={scrollProgress} activeSection={activeSection}>
              {children}
            </ScrollProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
