import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'

type Props = {
  featured: POI[]
  remaining: POI[]
}

function FeaturedCard({ poi, delay }: { poi: POI; delay: number }) {
  return (
    <div
      className="fade-in-section bg-hall-surface rounded-lg gold-trim overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="h-40 md:h-48 bg-hall-frame flex items-center justify-center">
        <span className="text-hall-muted/40 text-5xl font-bold font-['Cinzel',serif]">
          {poi.content.title.charAt(0)}
        </span>
      </div>
      <div className="p-4 md:p-5">
        <h3 className="text-hall-accent font-semibold text-lg mb-1">{poi.content.title}</h3>
        <p className="text-hall-muted text-sm mb-3 line-clamp-2">{poi.content.description}</p>
        {poi.content.tags && poi.content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {poi.content.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        {poi.content.links && poi.content.links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {poi.content.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-hall-accent text-hall-bg rounded hover:opacity-90 transition-opacity"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CompactCard({ poi, delay }: { poi: POI; delay: number }) {
  const typeLabel = poi.type === 'painting' ? 'Project' : poi.type === 'display-case' ? 'Display' : 'Pedestal'
  return (
    <div
      className="fade-in-section bg-hall-surface rounded-lg p-3 border border-hall-frame hover:border-hall-accent/50 transition-colors"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <span className="text-xs text-hall-muted/60 uppercase tracking-wide">{typeLabel}</span>
      <h3 className="text-hall-text text-sm font-semibold mt-1 mb-2 line-clamp-2">{poi.content.title}</h3>
      {poi.content.tags?.[0] && (
        <span className="px-1.5 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
          {poi.content.tags[0]}
        </span>
      )}
    </div>
  )
}

export function ProjectsGrid({ featured, remaining }: Props) {
  const featuredRef = useFadeIn()
  const remainingRef = useFadeIn()

  return (
    <section className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Projects</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-10" />

      <div
        ref={featuredRef}
        className="fade-in-section space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 mb-12"
      >
        {featured.map((poi, i) => (
          <FeaturedCard key={poi.id} poi={poi} delay={i * 80} />
        ))}
      </div>

      <h3 className="text-sm text-hall-muted uppercase tracking-widest mb-6">All Projects</h3>
      <div
        ref={remainingRef}
        className="fade-in-section grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4"
      >
        {remaining.map((poi, i) => (
          <CompactCard key={poi.id} poi={poi} delay={i * 60} />
        ))}
      </div>
    </section>
  )
}
