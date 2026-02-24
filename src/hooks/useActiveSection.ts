import { useEffect, useRef, useState } from 'react'

type Zone = 'reception' | 'main-hall' | 'courtyard' | 'garden'
type SectionId = 'hero' | 'projects' | 'experience' | 'skills' | 'contact'

const SECTION_TO_ZONE: Record<SectionId, Zone> = {
  hero:       'reception',
  projects:   'main-hall',
  experience: 'courtyard',
  skills:     'garden',
  contact:    'reception',
}

const SECTION_IDS: SectionId[] = ['hero', 'projects', 'experience', 'skills', 'contact']

const THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

export function useActiveSection(
  scrollContainerRef: React.RefObject<HTMLElement>
): Zone | null {
  const [activeZone, setActiveZone] = useState<Zone | null>('reception')
  const ratiosRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) return

    const updateActive = () => {
      let maxRatio = 0
      let dominantId: SectionId | null = null
      for (const [id, ratio] of ratiosRef.current) {
        if (ratio > maxRatio) {
          maxRatio = ratio
          dominantId = id as SectionId
        }
      }
      setActiveZone(dominantId ? SECTION_TO_ZONE[dominantId] : null)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.sectionId as SectionId
          if (id) ratiosRef.current.set(id, entry.intersectionRatio)
        }
        updateActive()
      },
      { root, threshold: THRESHOLDS }
    )

    for (const id of SECTION_IDS) {
      const el = root.querySelector(`#section-${id}`)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [scrollContainerRef])

  return activeZone
}
