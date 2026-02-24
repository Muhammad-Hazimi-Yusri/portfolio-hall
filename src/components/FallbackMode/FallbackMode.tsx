import { useRef, useState, useMemo } from 'react'
import { usePOIs } from '@/hooks/usePOIs'
import { useActiveSection } from '@/hooks/useActiveSection'
import { ModeToggle } from '@/components/ModeToggle'
import { HeroSection } from './HeroSection'
import { ProjectsGrid } from './ProjectsGrid'
import { ExperienceTimeline } from './ExperienceTimeline'
import { SkillsSection } from './SkillsSection'
import { ContactSection } from './ContactSection'
import { CastleMap } from './CastleMap'
import type { POIMarker } from './CastleMap'
import type { POI } from '@/types/poi'

type Zone = 'reception' | 'main-hall' | 'courtyard' | 'garden'

type Props = {
  onSwitchMode: () => void
}

const FEATURED_IDS = ['avvr', 'portfolio-hall', 'diy-stereo-camera', 'eee-roadmap']

const ZONE_SECTION_ID: Record<Zone, string> = {
  reception:   'section-hero',
  'main-hall': 'section-projects',
  courtyard:   'section-experience',
  garden:      'section-skills',
}

// POI dots that should scroll to a specific section rather than their card
const POI_SCROLL_OVERRIDE: Record<string, string> = {
  contact: 'section-contact',
}

export function FallbackMode({ onSwitchMode }: Props) {
  const { pois, isLoading } = usePOIs()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mapOverlayOpen, setMapOverlayOpen] = useState(false)
  const activeZone = useActiveSection(scrollRef)

  const poiMarkers = useMemo<POIMarker[]>(() =>
    pois.map((p) => ({
      id: p.id,
      svgX: -p.position.x,
      svgY: p.position.z,
      label: p.content.title,
      zone: p.zone as Zone,
    })),
    [pois]
  )

  const handleZoneClick = (zone: Zone) => {
    const id = ZONE_SECTION_ID[zone]
    scrollRef.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMapOverlayOpen(false)
  }

  const handlePOIClick = (poiId: string) => {
    const overrideId = POI_SCROLL_OVERRIDE[poiId]
    let el: HTMLElement | null = overrideId
      ? (scrollRef.current?.querySelector<HTMLElement>(`#${overrideId}`) ?? null)
      : document.getElementById(`poi-${poiId}`)

    // Fallback: no rendered card → scroll to that zone's section
    if (!el) {
      const poi = pois.find((p) => p.id === poiId)
      if (poi) el = scrollRef.current?.querySelector<HTMLElement>(`#${ZONE_SECTION_ID[poi.zone as Zone]}`) ?? null
    }

    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Gold pulse only on actual card elements, not section headings
    if (el.id.startsWith('poi-')) {
      el.classList.remove('poi-highlight-pulse')
      void el.offsetWidth // force reflow to restart animation
      el.classList.add('poi-highlight-pulse')
      el.addEventListener('animationend', () => el!.classList.remove('poi-highlight-pulse'), { once: true })
    }
    setMapOverlayOpen(false)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-hall-bg">
        <div className="w-8 h-8 border-2 border-hall-muted/30 border-t-hall-accent rounded-full animate-spin" />
      </div>
    )
  }

  const aboutPOI   = pois.find((p) => p.id === 'about')
  const contactPOI = pois.find((p) => p.id === 'contact')
  const skillsPOI  = pois.find((p) => p.id === 'skills')

  const allProjects       = pois.filter((p) => p.section === 'projects')
  const featuredProjects  = FEATURED_IDS
    .map((id) => allProjects.find((p) => p.id === id))
    .filter((p): p is POI => Boolean(p))
  const remainingProjects = allProjects.filter((p) => !FEATURED_IDS.includes(p.id))

  const experiencePOIs = pois.filter((p) => p.section === 'experience')
  const hackathonPOIs  = pois.filter((p) => p.section === 'hackathons')

  return (
    <div ref={scrollRef} className="w-full h-full overflow-y-auto overflow-x-hidden bg-hall-bg fallback-scroll">
      {/* Fixed mode toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle currentMode="fallback" onToggle={onSwitchMode} />
      </div>

      {/* Desktop: illustrated castle map in left sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-hall-surface/30 border-r border-hall-frame">
        <div className="w-full h-full p-3 flex flex-col">
          <div className="text-hall-muted/50 text-[9px] uppercase tracking-widest text-center mb-2 pt-1">
            Castle Map
          </div>
          <div className="flex-1 min-h-0">
            <CastleMap
              activeZone={activeZone}
              pois={poiMarkers}
              onZoneClick={handleZoneClick}
              onPOIClick={handlePOIClick}
            />
          </div>
          <div className="text-hall-muted/30 text-[8px] text-center pb-1">
            Click a room to navigate
          </div>
        </div>
      </aside>

      {/* Mobile: floating map button */}
      <button
        className="md:hidden fixed bottom-4 right-4 z-50 px-4 py-2 bg-hall-surface border border-hall-accent/60 text-hall-accent text-sm rounded-lg shadow-lg"
        style={{ fontFamily: "'Cinzel', serif" }}
        onClick={() => setMapOverlayOpen(true)}
        aria-label="Open castle map"
      >
        Map
      </button>

      {/* Mobile: full-screen map overlay */}
      {mapOverlayOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-hall-bg/95 backdrop-blur-sm flex flex-col"
          onClick={() => setMapOverlayOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-hall-frame">
            <h2
              className="text-hall-accent text-lg"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Castle Map
            </h2>
            <button
              className="text-hall-muted hover:text-hall-text text-2xl leading-none"
              onClick={() => setMapOverlayOpen(false)}
              aria-label="Close map"
            >
              ×
            </button>
          </div>
          <div className="flex-1 p-4" onClick={(e) => e.stopPropagation()}>
            <CastleMap
              activeZone={activeZone}
              pois={poiMarkers}
              onZoneClick={handleZoneClick}
              onPOIClick={handlePOIClick}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64">
        <div className="max-w-[1200px] mx-auto">
          <HeroSection aboutPOI={aboutPOI} onSwitchMode={onSwitchMode} />
          <div className="section-divider" />
          <div className="bg-hall-surface/20">
            <ProjectsGrid featured={featuredProjects} remaining={remainingProjects} />
          </div>
          <div className="section-divider" />
          <ExperienceTimeline pois={experiencePOIs} />
          <div className="section-divider" />
          <div className="bg-hall-surface/20">
            <SkillsSection skillsPOI={skillsPOI} hackathonPOIs={hackathonPOIs} />
          </div>
          <div className="section-divider" />
          <ContactSection contactPOI={contactPOI} />

          <footer className="px-6 md:px-12 py-10 border-t border-hall-frame text-center">
            <button
              onClick={onSwitchMode}
              className="text-hall-muted hover:text-hall-accent transition-colors text-sm underline underline-offset-4 mb-4 block mx-auto"
            >
              Switch to 3D Experience
            </button>
            <p className="text-hall-muted/40 text-xs">v1.6.0-slice4 — 2D Portfolio</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
