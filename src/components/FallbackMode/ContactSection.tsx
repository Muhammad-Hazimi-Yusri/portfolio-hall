import { useFadeIn } from '@/hooks/useFadeIn'
import type { POI } from '@/types/poi'

type Props = {
  contactPOI: POI | undefined
}

const LINK_ICONS: Record<string, string> = {
  Email:    '✉',
  GitHub:   'GH',
  LinkedIn: 'in',
  GitLab:   'GL',
  Website:  '↗',
}

export function ContactSection({ contactPOI }: Props) {
  const ref = useFadeIn()

  return (
    <section id="section-contact" data-section-id="contact" className="px-6 py-16 md:px-12">
      <h2 className="text-2xl md:text-3xl text-hall-accent mb-2">Contact</h2>
      <div className="w-12 h-px bg-hall-accent/40 mb-6" />
      {contactPOI?.content.description && (
        <p className="text-hall-muted mb-10 max-w-md leading-relaxed">
          {contactPOI.content.description}
        </p>
      )}

      <div ref={ref} className="fade-in-section flex flex-col sm:flex-row flex-wrap gap-4">
        {contactPOI?.content.links?.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-3 bg-hall-surface border border-hall-frame-light hover:border-hall-accent/60 rounded-lg transition-colors group"
          >
            <span className="text-hall-accent text-sm font-mono w-6 text-center">
              {LINK_ICONS[link.label] ?? '↗'}
            </span>
            <span className="text-hall-text group-hover:text-hall-accent transition-colors">
              {link.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
