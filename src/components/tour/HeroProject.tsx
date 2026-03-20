import type { POI } from '@/types/poi'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

type Props = {
  poi: POI
  scrollStart: number
  scrollEnd: number
  scrollProgress: number
  reducedMotion: boolean
}

export function HeroProject({ poi, scrollStart, scrollEnd, scrollProgress, reducedMotion }: Props) {
  const local = clamp01((scrollProgress - scrollStart) / (scrollEnd - scrollStart))

  // Only render when near the active range
  if (scrollProgress < scrollStart - 0.03 || scrollProgress > scrollEnd + 0.03) return null

  // Entry: local 0→0.2 (fade in + slide up from below)
  const entryProgress = clamp01(local / 0.2)
  // Exit: local 0.8→1.0 (fade out + slide up and out)
  const exitProgress = local > 0.8 ? clamp01((local - 0.8) / 0.2) : 0

  const opacity = Math.min(entryProgress, 1 - exitProgress)

  let translateY = 0
  if (!reducedMotion) {
    if (local < 0.2) {
      translateY = (1 - entryProgress) * 60
    } else if (local > 0.8) {
      translateY = -exitProgress * 60
    }
  }

  // Stagger story blocks
  const challengeOpacity = clamp01((local - 0.25) / 0.12)
  const approachOpacity = clamp01((local - 0.4) / 0.12)
  const outcomeOpacity = clamp01((local - 0.55) / 0.12)

  const staggerY = (progress: number) =>
    reducedMotion ? 0 : (1 - progress) * 20

  const { content } = poi

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div className="max-w-2xl w-full bg-hall-bg/85 backdrop-blur-sm rounded-xl p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk',sans-serif] text-hall-accent mb-2">
          {content.title}
        </h2>

        {content.storyHook && (
          <p className="text-base md:text-lg italic text-hall-accent/80 mb-8">
            {content.storyHook}
          </p>
        )}

        {content.challenge && (
          <div
            className="mb-4"
            style={{
              opacity: challengeOpacity,
              transform: `translateY(${staggerY(challengeOpacity)}px)`,
            }}
          >
            <h3 className="text-xs font-semibold text-hall-muted uppercase tracking-wider mb-1">
              The Challenge
            </h3>
            <p className="text-hall-text story-text">{content.challenge}</p>
          </div>
        )}

        {content.approach && (
          <div
            className="mb-4"
            style={{
              opacity: approachOpacity,
              transform: `translateY(${staggerY(approachOpacity)}px)`,
            }}
          >
            <h3 className="text-xs font-semibold text-hall-muted uppercase tracking-wider mb-1">
              The Approach
            </h3>
            <p className="text-hall-text story-text">{content.approach}</p>
          </div>
        )}

        {content.outcome && (
          <div
            className="mb-4"
            style={{
              opacity: outcomeOpacity,
              transform: `translateY(${staggerY(outcomeOpacity)}px)`,
            }}
          >
            <h3 className="text-xs font-semibold text-hall-muted uppercase tracking-wider mb-1">
              The Outcome
            </h3>
            <p className="text-hall-text story-text">{content.outcome}</p>
          </div>
        )}

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {content.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-hall-frame text-hall-muted text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {content.links && content.links.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {content.links.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-hall-accent hover:text-hall-accent/80 transition-colors pointer-events-auto text-sm"
              >
                {link.label} &rarr;
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
