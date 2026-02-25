import type { POI } from '@/types/poi'

type Props = {
  poi: POI | null
  onClose: () => void
}

export function ProjectDetail({ poi, onClose }: Props) {
  const isOpen = poi !== null

  return (
    <div
      className={`grid transition-all duration-300 ease-out ${
        isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
    >
      <div className="overflow-hidden">
        {poi && <DetailContent poi={poi} onClose={onClose} />}
      </div>
    </div>
  )
}

function DetailContent({ poi, onClose }: { poi: POI; onClose: () => void }) {
  const { title, description, challenge, approach, outcome, tags, links } = poi.content
  const hasStory = Boolean(challenge)

  return (
    <div className="mt-3 bg-hall-surface rounded-lg gold-trim p-5 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-hall-accent font-semibold font-['Cinzel',serif] text-lg">
          {title}
        </h3>
        <button
          onClick={onClose}
          className="shrink-0 text-hall-muted/50 hover:text-hall-accent text-xs uppercase tracking-widest transition-colors"
        >
          ▴ Close
        </button>
      </div>

      {/* Story or description */}
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

      {/* Tags + Links */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
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
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
