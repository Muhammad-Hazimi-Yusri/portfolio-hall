import type { POI } from '@/types/poi'

const TYPE_ICON: Record<string, string> = {
  'painting': '🖼',
  'display-case': '🔮',
  'pedestal': '🏛',
}

export type StoryCardProps = {
  poi: POI
  variant: 'featured' | 'compact'
  isSelected: boolean
  onSelect: () => void
  delay: number
}

export function StoryCard({ poi, variant, isSelected, onSelect, delay }: StoryCardProps) {
  const { title, description, storyHook, tags } = poi.content
  const typeIcon = TYPE_ICON[poi.type] ?? '🖼'
  const hookText = storyHook ?? (description.length > 80 ? description.slice(0, 80) + '…' : description)
  const tagLimit = variant === 'compact' ? 2 : 3
  const thumbHeight = variant === 'featured' ? 'h-36 md:h-44' : 'h-24'

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      id={`poi-${poi.id}`}
      className={`fade-in-section bg-hall-surface rounded-lg card-lift transition-shadow duration-200 ${
        isSelected
          ? 'ring-1 ring-hall-accent shadow-[0_0_12px_rgba(201,168,76,0.2)]'
          : 'gold-trim'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="cursor-pointer"
        onClick={onSelect}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isSelected}
        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${title}`}
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
              {isSelected ? '▴ Close' : '▾ Details'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
