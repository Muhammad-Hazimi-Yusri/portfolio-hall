import { useState, useEffect } from 'react'
import { useScrollProgress } from '@/contexts/ScrollContext'
import { IntroSection } from './IntroSection'
import { HeroProject } from './HeroProject'
import { CompactCluster } from './CompactCluster'
import { ImpactSection } from './ImpactSection'
import { ContactSection } from './ContactSection'
import { ExploreHint } from './ExploreHint'
import { hasWebGL } from '@/utils/detection'
import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'

const webGLSupported = hasWebGL()

const HERO_RANGES = [
  { id: 'avvr', scrollStart: 0.15, scrollEnd: 0.22 },
  { id: 'diy-stereo-camera', scrollStart: 0.22, scrollEnd: 0.29 },
  { id: 'petbot', scrollStart: 0.29, scrollEnd: 0.36 },
  { id: 'eee-roadmap', scrollStart: 0.40, scrollEnd: 0.47 },
  { id: 'food-wars', scrollStart: 0.47, scrollEnd: 0.54 },
  { id: 'portfolio-hall', scrollStart: 0.54, scrollEnd: 0.65 },
] as const

const COMPACT_RANGE = { scrollStart: 0.36, scrollEnd: 0.40 }
const COMPACT_IDS = ['medical-emg', 'robohack', 'game-jam', 'ai-hackathon']

const pois = poisData.pois as POI[]

const heroPois = HERO_RANGES.map(range => ({
  ...range,
  poi: pois.find(p => p.id === range.id)!,
}))

const compactPois = pois.filter(p => COMPACT_IDS.includes(p.id))

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

type TourContentProps = {
  onExplore?: (scrollProgress: number) => void
}

export function TourContent({ onExplore }: TourContentProps) {
  const { scrollProgress } = useScrollProgress()
  const reducedMotion = useReducedMotion()

  const handleExplore = () => onExplore?.(scrollProgress)

  const showExploreHints = webGLSupported && !!onExplore

  return (
    <div className="absolute inset-0 z-10">
      <IntroSection scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

      {heroPois.map(({ poi, scrollStart, scrollEnd }) => (
        <HeroProject
          key={poi.id}
          poi={poi}
          scrollStart={scrollStart}
          scrollEnd={scrollEnd}
          scrollProgress={scrollProgress}
          reducedMotion={reducedMotion}
        />
      ))}

      <CompactCluster
        pois={compactPois}
        scrollStart={COMPACT_RANGE.scrollStart}
        scrollEnd={COMPACT_RANGE.scrollEnd}
        scrollProgress={scrollProgress}
        reducedMotion={reducedMotion}
      />

      {showExploreHints && (
        <div className="absolute inset-0 flex items-end justify-center pb-8 md:pb-12 pointer-events-none">
          <ExploreHint
            onExplore={handleExplore}
            variant="subtle"
            scrollProgress={scrollProgress}
            triggerAt={0.40}
          />
        </div>
      )}

      <ImpactSection scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
      <ContactSection scrollProgress={scrollProgress} reducedMotion={reducedMotion} />

      {showExploreHints && (
        <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-none">
          <ExploreHint
            onExplore={handleExplore}
            variant="prominent"
            scrollProgress={scrollProgress}
            triggerAt={0.90}
          />
        </div>
      )}
    </div>
  )
}
