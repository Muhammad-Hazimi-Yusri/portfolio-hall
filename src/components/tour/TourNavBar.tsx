import { useScrollProgress } from '@/contexts/ScrollContext'
import { TOUR_SECTIONS } from '@/data/tourSections'

export function TourNavBar() {
  const { scrollProgress, activeSection, scrollToProgress } = useScrollProgress()

  return (
    <nav className="fixed top-0 left-0 w-full h-9 z-50 glass-panel flex items-center px-4 gap-1">
      {TOUR_SECTIONS.map(section => (
        <button
          key={section.id}
          onClick={() => scrollToProgress(section.scrollStart + 0.001)}
          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors pointer-events-auto ${
            activeSection?.id === section.id
              ? 'bg-hall-accent/20 text-hall-accent'
              : 'text-hall-muted hover:text-hall-text'
          }`}
        >
          {section.label}
        </button>
      ))}
      {/* Progress indicator line */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-hall-frame/30">
        <div
          className="h-full bg-hall-accent transition-[width] duration-150 ease-out shadow-[0_1px_4px_rgba(56,189,248,0.4)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </nav>
  )
}
