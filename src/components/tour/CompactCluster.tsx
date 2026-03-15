import type { POI } from '@/types/poi'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

type Props = {
  pois: POI[]
  scrollStart: number
  scrollEnd: number
  scrollProgress: number
  reducedMotion: boolean
}

export function CompactCluster({ pois, scrollStart, scrollEnd, scrollProgress, reducedMotion }: Props) {
  const local = clamp01((scrollProgress - scrollStart) / (scrollEnd - scrollStart))

  if (scrollProgress < scrollStart - 0.03 || scrollProgress > scrollEnd + 0.03) return null

  // Entry: 0→0.25, Exit: 0.75→1.0
  const entryProgress = clamp01(local / 0.25)
  const exitProgress = local > 0.75 ? clamp01((local - 0.75) / 0.25) : 0
  const opacity = Math.min(entryProgress, 1 - exitProgress)

  const translateY = reducedMotion
    ? 0
    : local < 0.25
      ? (1 - entryProgress) * 40
      : local > 0.75
        ? -exitProgress * 40
        : 0

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-6 md:p-12"
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div className="max-w-2xl w-full bg-hall-bg/80 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl md:text-2xl font-bold font-['Cinzel',serif] text-hall-accent mb-6 text-center">
          More Projects
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pois.map(poi => (
            <div
              key={poi.id}
              className="bg-hall-surface/80 backdrop-blur-sm border border-hall-accent/20 rounded-lg p-4"
            >
              <h3 className="text-base font-semibold text-hall-accent font-['Cinzel',serif] mb-1">
                {poi.content.title}
              </h3>
              <p className="text-sm text-hall-text/80 mb-3 line-clamp-3">
                {poi.content.description}
              </p>
              {poi.content.tags && poi.content.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {poi.content.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 bg-hall-frame text-hall-muted text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
