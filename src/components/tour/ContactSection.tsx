import poisData from '@/data/pois.json'
import type { POI } from '@/types/poi'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

const pois = poisData.pois as POI[]
const contactPoi = pois.find(p => p.id === 'contact')!

type Props = {
  scrollProgress: number
  reducedMotion: boolean
}

export function ContactSection({ scrollProgress, reducedMotion }: Props) {
  const local = clamp01((scrollProgress - 0.85) / 0.15)

  if (scrollProgress < 0.82) return null

  // Gentle fade in: local 0→0.3
  const entryOpacity = clamp01(local / 0.3)
  const entryY = reducedMotion ? 0 : (1 - entryOpacity) * 24

  // Links stagger
  const linksOpacity = clamp01((local - 0.2) / 0.2)

  // Closing line
  const closingOpacity = clamp01((local - 0.4) / 0.2)

  const links = contactPoi.content.links ?? []
  // Show Email, LinkedIn, GitHub (skip GitLab and Website for a cleaner CTA)
  const primaryLinks = links.filter(l =>
    ['Email', 'LinkedIn', 'GitHub'].includes(l.label),
  )

  return (
    <div
      role="contentinfo"
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
      style={{ opacity: entryOpacity }}
    >
      <div
        className="max-w-lg w-full text-center glass-panel shadow-sm rounded-xl p-6 md:p-8"
        style={{ transform: `translateY(${entryY}px)` }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk',sans-serif] text-hall-accent mb-6">
          Let&apos;s build something
        </h2>

        <p
          className="text-hall-muted mb-8 text-base md:text-lg"
          style={{ opacity: closingOpacity }}
        >
          Currently seeking opportunities in embedded systems, XR, or full-stack
          development. Let&apos;s talk.
        </p>

        <div
          className="flex flex-wrap justify-center gap-6"
          style={{ opacity: linksOpacity }}
        >
          {primaryLinks.map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hall-accent hover:text-hall-accent/80 transition-colors pointer-events-auto text-lg font-semibold font-['Space_Grotesk',sans-serif]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
