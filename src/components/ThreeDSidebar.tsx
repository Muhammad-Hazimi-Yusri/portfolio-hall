import { useEffect, useRef, useState } from 'react'
import type { POI, Zone } from '@/types/poi'

type ThreeDSidebarProps = {
  pois: POI[]
  isOpen: boolean
  onToggle: () => void
  onTeleportToPOI: (poi: POI) => void
  currentZone: Zone
  nearbyId?: string
}

const ZONES: { key: Zone; label: string }[] = [
  { key: 'arrival', label: 'Entrance' },
  { key: 'gallery', label: 'Gallery' },
  { key: 'observatory', label: 'Experience' },
  { key: 'horizon', label: 'Contact' },
]

export function ThreeDSidebar({ pois, isOpen, onToggle, onTeleportToPOI, currentZone, nearbyId }: ThreeDSidebarProps) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isOpen) return
    setExpandedZone(currentZone)
    closeRef.current?.focus({ preventScroll: true })
  }, [isOpen, currentZone])
  useEffect(() => {
    const list = listRef.current
    const current = list?.querySelector<HTMLButtonElement>('button[aria-current]')
    if (!isOpen || !list || !current?.getClientRects().length) return
    const bounds = list.getBoundingClientRect(), item = current.getBoundingClientRect()
    if (item.top < bounds.top) list.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom
  }, [isOpen, expandedZone, nearbyId])
  const close = () => {
    onToggle()
    toggleRef.current?.focus({ preventScroll: true })
  }

  return (
    <>
      <button
        ref={toggleRef}
        onClick={onToggle}
        aria-label={isOpen ? 'Close hall directory' : 'Open hall directory'}
        aria-expanded={isOpen}
        aria-controls="hall-directory"
        className="walk-directory-toggle"
      >
        <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true"><path d="m2 4 5-2 6 2 5-2v14l-5 2-6-2-5 2V4Z" /><path d="M7 2v14M13 4v14" /></svg>
        Hall directory
      </button>

      <nav
        id="hall-directory"
        aria-label="Hall directory"
        hidden={!isOpen}
        className="walk-directory-panel"
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
        }}
      >
        <div className="walk-directory-heading"><h2>Places in the hall</h2><button ref={closeRef} onClick={close} aria-label="Close hall directory">×</button></div>
        <div ref={listRef} className="walk-directory-groups">
          {ZONES.map(({ key, label }) => {
            const zonePois = pois.filter((p) => p.zone === key)
            if (zonePois.length === 0) return null
            const isExpanded = expandedZone === key

            return (
              <section key={key} className="walk-directory-group">
                <button
                  onClick={() => setExpandedZone(isExpanded ? null : key)}
                  aria-expanded={isExpanded}
                  aria-controls={`walk-zone-${key}`}
                  className="walk-directory-zone"
                >
                  <span>{label}</span>
                  <span aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                </button>
                  <div id={`walk-zone-${key}`} hidden={!isExpanded} className="walk-directory-items">
                    {zonePois.map((poi, index) => (
                      <button
                        key={poi.id}
                        aria-current={nearbyId === poi.id ? 'location' : undefined}
                        onClick={() => {
                          onTeleportToPOI(poi)
                          onToggle()
                        }}
                      >
                        <span className="walk-directory-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        <span>{poi.experienceDisplay?.name ?? poi.content.title}</span>
                        <span aria-hidden="true">{nearbyId === poi.id ? '◆' : '→'}</span>
                      </button>
                    ))}
                  </div>
              </section>
            )
          })}
        </div>
        <p className="walk-directory-footnote">Choose a destination to move there. <kbd>Esc</kbd> closes this list.</p>
      </nav>
    </>
  )
}
