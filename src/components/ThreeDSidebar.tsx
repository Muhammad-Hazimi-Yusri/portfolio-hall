import { useState } from 'react'
import type { POI } from '@/types/poi'
import { isMobile } from '@/utils/detection'

type ThreeDSidebarProps = {
  pois: POI[]
  isOpen: boolean
  onToggle: () => void
  onTeleportToPOI: (poi: POI) => void
  isPortrait: boolean
}

const SECTIONS = ['projects', 'about', 'skills', 'contact'] as const

export function ThreeDSidebar({ pois, isOpen, onToggle, onTeleportToPOI, isPortrait }: ThreeDSidebarProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const showMobile = isMobile()

  // Hide in portrait on mobile
  if (showMobile && isPortrait) return null

  return (
    <>
      {/* Toggle tab — right side */}
      <button
        onClick={onToggle}
        className={`absolute top-1/2 -translate-y-1/2 z-30 bg-hall-bg/80 backdrop-blur-sm py-3 px-1.5 rounded-l border border-r-0 border-hall-muted/30 text-hall-muted hover:text-hall-text transition-all duration-200 ${
          isOpen ? 'right-56' : 'right-0'
        }`}
      >
        {isOpen ? '\u25B6' : '\u25C0'}
      </button>

      {/* Sidebar panel — right side */}
      <div
        className={`absolute top-0 right-0 h-full w-56 z-30 bg-hall-bg/90 backdrop-blur-sm border-l border-hall-muted/30 transition-transform duration-200 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4">
          <h3 className="text-sm font-bold text-hall-text mb-3 uppercase tracking-wider">
            Navigate
          </h3>

          {SECTIONS.map((section) => {
            const sectionPois = pois.filter((p) => p.section === section)
            if (sectionPois.length === 0) return null
            const isExpanded = expandedSection === section

            return (
              <div key={section} className="mb-2">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section)}
                  className="w-full text-left px-2 py-1.5 rounded text-sm font-semibold capitalize text-hall-muted hover:text-hall-text hover:bg-hall-muted/10 transition-colors flex items-center justify-between"
                >
                  <span>{section}</span>
                  <span className="text-xs">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                </button>

                {isExpanded && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {sectionPois.map((poi) => (
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
