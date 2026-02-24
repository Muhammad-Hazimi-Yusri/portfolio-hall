import { useState } from 'react'
import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'
import { StoryCard } from './ProjectCard'

type Props = {
  featured: POI[]
  remaining: POI[]
}

export function ProjectsGrid({ featured, remaining }: Props) {
  const featuredRef = useFadeIn()
  const remainingRef = useFadeIn()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <section id="section-projects" data-section-id="projects" className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Projects</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-10" />

      <div
        ref={featuredRef}
        className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 mb-12"
      >
        {featured.map((poi, i) => (
          <StoryCard
            key={poi.id}
            poi={poi}
            variant="featured"
            isExpanded={expandedId === poi.id}
            onToggle={() => toggle(poi.id)}
            delay={i * 80}
          />
        ))}
      </div>

      <h3 className="text-sm text-hall-muted uppercase tracking-widest mb-6">All Projects</h3>
      <div
        ref={remainingRef}
        className="fade-in-section grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
      >
        {remaining.map((poi, i) => (
          <StoryCard
            key={poi.id}
            poi={poi}
            variant="compact"
            isExpanded={expandedId === poi.id}
            onToggle={() => toggle(poi.id)}
            delay={i * 60}
          />
        ))}
      </div>
    </section>
  )
}
