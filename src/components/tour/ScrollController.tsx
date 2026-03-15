import { useState, useCallback, useRef, type ReactNode } from 'react'
import { ScrollProvider } from '@/contexts/ScrollContext'
import { getSectionAtProgress, type TourSection } from '@/data/tourSections'

export function ScrollController({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSection, setActiveSection] = useState<TourSection | null>(null)
  const rafPending = useRef(false)

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
