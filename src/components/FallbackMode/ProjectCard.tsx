import type { POI } from '@/types/poi'

const TYPE_ICON: Record<string, string> = {
  'painting': '🖼',
  'display-case': '🔮',
  'pedestal': '🏛',
}

export type StoryCardProps = {
  poi: POI
  variant: 'featured' | 'compact'
  isExpanded: boolean
  onToggle: () => void
  delay: number
}

export function StoryCard({ poi, variant, isExpanded, onToggle, delay }: StoryCardProps) {
  const { title, description, storyHook, challenge, approach, outcome, tags, links } = poi.content
  const typeIcon = TYPE_ICON[poi.type] ?? '🖼'
  const hookText = storyHook ?? (description.length > 80 ? description.slice(0, 80) + '…' : description)
  const tagLimit = variant === 'compact' ? 2 : 3
  const thumbHeight = variant === 'featured' ? 'h-36 md:h-44' : 'h-24'
  const hasStory = Boolean(challenge)

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <div
      id={`poi-${poi.id}`}
      className="fade-in-section bg-hall-surface rounded-lg gold-trim card-lift"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Collapsed header — always visible, click to toggle */}
      <div
        className="cursor-pointer"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        {/* Thumbnail area */}
        <div className={`${thumbHeight} bg-hall-frame flex items-center justify-center relative overflow-hidden`}>
          <span className="text-hall-muted/30 text-4xl font-bold font-['Cinzel',serif] select-none">
            {title.charAt(0)}
          </span>
          <span
            className="absolute top-2 right-2 text-base leading-none opacity-60 select-none"
            aria-hidden="true"
          >
            {typeIcon}
          </span>
        </div>

        {/* Card content */}
        <div className="p-4">
          <h3 className="text-hall-accent font-semibold font-['Cinzel',serif] leading-snug mb-1">
            {title}
          </h3>
          <p className="text-hall-muted text-sm leading-snug mb-3">{hookText}</p>

          <div className="flex items-center justify-between gap-2">
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, tagLimit).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <span className="shrink-0 text-xs text-hall-accent/50 ml-auto">
              {isExpanded ? '▴ Close' : '▾ Details'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded panel — CSS grid-rows trick for smooth height animation */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-hall-frame px-4 pb-4 pt-3 space-y-4">
            {/* Story section */}
            {hasStory ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-hall-accent/70 mb-1">The Challenge</p>
                  <p className="text-hall-muted text-sm leading-relaxed">{challenge}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-hall-accent/70 mb-1">The Approach</p>
                  <p className="text-hall-muted text-sm leading-relaxed">{approach}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-hall-accent/70 mb-1">The Outcome</p>
                  <p className="text-hall-muted text-sm leading-relaxed">{outcome}</p>
                </div>
              </div>
            ) : (
              <p className="text-hall-muted text-sm leading-relaxed">{description}</p>
            )}

            {/* Technical Details (native collapsible) */}
            <details className="group">
              <summary className="text-xs text-hall-muted/60 hover:text-hall-muted cursor-pointer select-none uppercase tracking-widest list-none flex items-center gap-1">
                <span className="group-open:hidden">▾</span>
                <span className="hidden group-open:inline">▴</span>
                Technical Details
              </summary>
              <div className="mt-3 space-y-3">
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-hall-frame text-hall-muted text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {links && links.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {links.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-hall-accent text-xs hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {link.label} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}
