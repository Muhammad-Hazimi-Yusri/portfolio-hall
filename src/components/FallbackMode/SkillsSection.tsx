import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'

type Props = {
  skillsPOI: POI | undefined
  hackathonPOIs: POI[]
}

const SKILL_GROUPS = [
  {
    category: 'Languages',
    skills: ['Python', 'TypeScript', 'C#', 'C++', 'MATLAB', 'Java', 'Dart', 'GDScript', 'Embedded C'],
  },
  {
    category: 'Frameworks & Engines',
    skills: ['React', 'Next.js', 'Astro', 'Flask', 'Unity', 'Godot', 'Babylon.js', 'Flutter'],
  },
  {
    category: 'DevOps & Cloud',
    skills: ['Docker', 'GitHub Actions', 'Cloudflare', 'Supabase', 'Vercel'],
  },
  {
    category: 'Hardware',
    skills: ['Raspberry Pi 5', 'Arduino', 'ESP32'],
  },
]

const HACKATHON_ORDER = ['kibo-rpc', 'game-jam', 'robohack', 'ai-hackathon']

export function SkillsSection({ skillsPOI, hackathonPOIs }: Props) {
  const skillsRef = useFadeIn()
  const hackathonsRef = useFadeIn()

  const highlightTags = skillsPOI?.content.tags ?? []

  const orderedHackathons = HACKATHON_ORDER
    .map((id) => hackathonPOIs.find((p) => p.id === id))
    .filter((p): p is POI => Boolean(p))

  return (
    <section id="section-skills" data-section-id="skills" className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Skills & Tech</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-10" />

      <div ref={skillsRef} className="fade-in-section space-y-6">
        {SKILL_GROUPS.map((group) => (
          <div key={group.category}>
            <h3 className="text-hall-muted text-xs uppercase tracking-widest mb-3">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => {
                const isHighlight = highlightTags.includes(skill)
                return (
                  <span
                    key={skill}
                    className={`px-3 py-1 rounded text-sm ${
                      isHighlight
                        ? 'bg-hall-accent/20 text-hall-accent border border-hall-accent/40'
                        : 'bg-hall-frame text-hall-muted'
                    }`}
                  >
                    {skill}
                  </span>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl md:text-2xl text-hall-accent mt-16 mb-2">Hackathons & Competitions</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-8" />

      <div ref={hackathonsRef} className="fade-in-section grid grid-cols-1 md:grid-cols-2 gap-4">
        {orderedHackathons.map((poi, i) => (
          <div
            key={poi.id}
            id={`poi-${poi.id}`}
            className="bg-hall-surface rounded-lg p-4 border border-hall-frame hover:border-hall-accent/40 transition-colors card-lift"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <h3 className="text-hall-text font-semibold mb-1">{poi.content.title}</h3>
            {poi.content.storyHook && (
              <p className="text-hall-accent text-xs font-medium mb-2">{poi.content.storyHook}</p>
            )}
            <p className="text-hall-muted text-sm story-text mb-3">{poi.content.description}</p>
            {poi.content.tags && poi.content.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {poi.content.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {poi.content.links && poi.content.links.length > 0 && (
              <div className="flex flex-wrap gap-3">
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
        ))}
      </div>
    </section>
  )
}
