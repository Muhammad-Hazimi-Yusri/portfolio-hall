import React, { useState } from 'react'
import type { POI, Zone } from '@/types/poi'
import { isMobile } from '@/utils/detection'

type ThreeDSidebarProps = {
  pois: POI[]
  isOpen: boolean
  onToggle: () => void
  onTeleportToPOI: (poi: POI) => void
  isPortrait: boolean
}

const ZONES: { key: Zone; label: string }[] = [
  { key: 'reception', label: 'Reception' },
  { key: 'courtyard', label: 'Courtyard' },
  { key: 'main-hall', label: 'Main Hall' },
  { key: 'garden', label: 'Garden' },
]

export function ThreeDSidebar({ pois, isOpen, onToggle, onTeleportToPOI, isPortrait }: ThreeDSidebarProps) {
  const [expandedZone, setExpandedZone] = useState<string | null>(null)
  const showMobile = isMobile()

  // Hide in portrait on mobile
  if (showMobile && isPortrait) return null

  return (
    <>
      {/* Toggle tab — right side */}
      <button
        onClick={onToggle}
        className={`absolute top-1/2 -translate-y-1/2 z-30 bg-hall-frame/80 backdrop-blur-sm py-3 px-1.5 rounded-l border border-r-0 border-hall-accent/30 text-hall-muted hover:text-hall-text transition-all duration-200 ${
          isOpen ? 'right-56' : 'right-0'
        }`}
      >
        {isOpen ? '\u25B6' : '\u25C0'}
      </button>

      {/* Sidebar panel — right side */}
      <div
        className={`absolute top-0 right-0 h-full w-56 z-30 wood-texture backdrop-blur-sm border-l border-hall-accent/30 transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ '--wood-base': '#2A1F18' } as React.CSSProperties}
      >
        <div className="p-4">
          <h3 className="text-sm font-bold text-hall-muted mb-3 uppercase tracking-wider">
            Navigate
          </h3>

          {ZONES.map(({ key, label }) => {
            const zonePois = pois.filter((p) => p.zone === key)
            if (zonePois.length === 0) return null
            const isExpanded = expandedZone === key

            return (
              <div key={key} className="mb-2">
                <button
                  onClick={() => setExpandedZone(isExpanded ? null : key)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm font-semibold text-hall-muted hover:text-hall-text hover:bg-hall-muted/10 transition-colors flex items-center justify-between"
                >
                  <span>{label}</span>
                  <span className="text-xs">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                </button>

                {isExpanded && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {zonePois.map((poi) => (
                      <button
                        key={poi.id}
                        onClick={() => {
                          onToggle()
                          onTeleportToPOI(poi)
                        }}
                        className="w-full text-left px-2 py-1 rounded text-sm text-hall-muted hover:text-hall-accent hover:bg-hall-muted/10 transition-colors"
                      >
                        {poi.content.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
