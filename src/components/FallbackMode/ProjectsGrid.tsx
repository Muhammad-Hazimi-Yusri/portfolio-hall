import { useState } from 'react'
import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'
import { StoryCard } from './ProjectCard'
import { ProjectDetail } from './ProjectDetail'

type Props = {
  featured: POI[]
  remaining: POI[]
}

export function ProjectsGrid({ featured, remaining }: Props) {
  const featuredRef = useFadeIn()
  const remainingRef = useFadeIn()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function select(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
  }

  const selectedFeatured = featured.find((p) => p.id === selectedId) ?? null
  const selectedRemaining = remaining.find((p) => p.id === selectedId) ?? null

  return (
    <section id="section-projects" data-section-id="projects" className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Projects</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-10" />

      <div
        ref={featuredRef}
        className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 md:items-start mb-0"
      >
        {featured.map((poi, i) => (
          <StoryCard
            key={poi.id}
            poi={poi}
            variant="featured"
            isSelected={selectedId === poi.id}
            onSelect={() => select(poi.id)}
            delay={i * 80}
          />
        ))}
      </div>
      <ProjectDetail poi={selectedFeatured} onClose={() => setSelectedId(null)} />

      <div className="mb-12" />

      <h3 className="text-sm text-hall-muted uppercase tracking-widest mb-6">All Projects</h3>
      <div
        ref={remainingRef}
        className="fade-in-section grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 items-start"
      >
        {remaining.map((poi, i) => (
          <StoryCard
            key={poi.id}
            poi={poi}
            variant="compact"
            isSelected={selectedId === poi.id}
            onSelect={() => select(poi.id)}
            delay={i * 60}
          />
        ))}
      </div>
      <ProjectDetail poi={selectedRemaining} onClose={() => setSelectedId(null)} />
    </section>
  )
}
