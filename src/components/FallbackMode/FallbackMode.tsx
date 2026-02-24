import { usePOIs } from '@/hooks/usePOIs'
import { ModeToggle } from '@/components/ModeToggle'
import { HeroSection } from './HeroSection'
import { ProjectsGrid } from './ProjectsGrid'
import { ExperienceTimeline } from './ExperienceTimeline'
import { SkillsSection } from './SkillsSection'
import { ContactSection } from './ContactSection'
import type { POI } from '@/types/poi'

type Props = {
  onSwitchMode: () => void
}

const FEATURED_IDS = ['avvr', 'portfolio-hall', 'diy-stereo-camera', 'eee-roadmap']

export function FallbackMode({ onSwitchMode }: Props) {
  const { pois, isLoading } = usePOIs()

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

  const allProjects     = pois.filter((p) => p.section === 'projects')
  const featuredProjects = FEATURED_IDS
    .map((id) => allProjects.find((p) => p.id === id))
    .filter((p): p is POI => Boolean(p))
  const remainingProjects = allProjects.filter((p) => !FEATURED_IDS.includes(p.id))

  const experiencePOIs = pois.filter((p) => p.section === 'experience')
  const hackathonPOIs  = pois.filter((p) => p.section === 'hackathons')

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden bg-hall-bg fallback-scroll">
      {/* Fixed mode toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle currentMode="fallback" onToggle={onSwitchMode} />
      </div>

      {/* Desktop: reserved left sidebar for Slice 2 illustrated map nav */}
      <aside
        className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-hall-surface/30 border-r border-hall-frame"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="md:pl-64">
        <div className="max-w-[1200px] mx-auto">
          <HeroSection aboutPOI={aboutPOI} onSwitchMode={onSwitchMode} />
          <ProjectsGrid featured={featuredProjects} remaining={remainingProjects} />
          <ExperienceTimeline pois={experiencePOIs} />
          <SkillsSection skillsPOI={skillsPOI} hackathonPOIs={hackathonPOIs} />
          <ContactSection contactPOI={contactPOI} />

          <footer className="px-6 md:px-12 py-10 border-t border-hall-frame text-center">
            <button
              onClick={onSwitchMode}
              className="text-hall-muted hover:text-hall-accent transition-colors text-sm underline underline-offset-4 mb-4 block mx-auto"
            >
              Switch to 3D Experience
            </button>
            <p className="text-hall-muted/40 text-xs">v1.6.0 — 2D Portfolio</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
