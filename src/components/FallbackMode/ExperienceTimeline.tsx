import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'

type Props = {
  pois: POI[]
}

const EXPERIENCE_META: Record<string, { dateRange: string; location: string; role: string; org: string }> = {
  'audioscenic': {
    dateRange: 'Summer 2024',
    location: 'Remote / London, UK',
    role: 'Software Engineering Intern',
    org: 'Audioscenic',
  },
  'southampton-research': {
    dateRange: '2023–2024',
    location: 'Southampton, UK',
    role: 'Research Assistant',
    org: 'University of Southampton',
  },
}

const ORDER = ['audioscenic', 'southampton-research']

export function ExperienceTimeline({ pois }: Props) {
  const ref = useFadeIn(0.1)

  const ordered = ORDER
    .map((id) => pois.find((p) => p.id === id))
    .filter((p): p is POI => Boolean(p))

  return (
    <section id="section-experience" data-section-id="experience" className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Experience</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-10" />

      <div ref={ref} className="fade-in-section relative">
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-hall-frame-light" />

        <div className="space-y-10">
          {ordered.map((poi, i) => {
            const meta = EXPERIENCE_META[poi.id]
            return (
              <div
                key={poi.id}
                className="relative pl-12 md:pl-20"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="absolute left-2 md:left-6 top-1.5 w-4 h-4 rounded-full bg-hall-accent border-2 border-hall-bg" />

                <div id={`poi-${poi.id}`} className="bg-hall-surface rounded-lg p-4 md:p-5 gold-trim">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-3">
                    <div>
                      <h3 className="text-hall-text font-semibold">{meta?.role ?? poi.content.title}</h3>
                      <p className="text-hall-accent text-sm">{meta?.org}</p>
                    </div>
                    <div className="md:text-right shrink-0">
                      <p className="text-hall-muted text-sm">{meta?.dateRange}</p>
                      <p className="text-hall-muted/60 text-xs">{meta?.location}</p>
                    </div>
                  </div>
                  <p className="text-hall-muted text-sm leading-relaxed mb-3">
                    {poi.content.description}
                  </p>
                  {poi.content.tags && poi.content.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {poi.content.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {poi.content.links && poi.content.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {poi.content.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hall-accent text-xs hover:underline"
                        >
                          {link.label} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
