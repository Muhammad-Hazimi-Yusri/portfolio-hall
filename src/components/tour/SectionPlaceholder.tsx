import { useScrollProgress } from '@/contexts/ScrollContext'
import { TOUR_SECTIONS } from '@/data/tourSections'

export function SectionPlaceholder() {
  const { activeSection } = useScrollProgress()

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {TOUR_SECTIONS.map((section) => {
        const isActive = activeSection?.id === section.id
        return (
          <div
            key={section.id}
            className={`absolute bg-hall-frame/90 border border-hall-accent/30 text-hall-text rounded-lg p-8 max-w-md w-full mx-4 text-center transition-opacity duration-500 ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <h2 className="text-3xl font-bold font-['Cinzel',serif] text-hall-accent mb-3">
              {section.label}
            </h2>
            <p className="text-lg mb-4">{section.storyBeat}</p>
            <p className="text-sm text-hall-muted">
              {Math.round(section.scrollStart * 100)}% – {Math.round(section.scrollEnd * 100)}%
            </p>
          </div>
        )
      })}
    </div>
  )
}
