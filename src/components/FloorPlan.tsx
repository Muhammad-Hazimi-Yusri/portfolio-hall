import type { POI } from '@/types/poi'

type FloorPlanProps = {
  pois: POI[]
  selectedSection: string | null
  onSelectPOI: (id: string) => void
}

export function FloorPlan({ pois, selectedSection, onSelectPOI }: FloorPlanProps) {
  const filteredPOIs = pois.filter(
    (p) => !selectedSection || p.section === selectedSection
  )

  return (
    <svg viewBox="-22 -24 44 44" className="w-full h-full max-h-[60vh]">
      {/* Zone outlines (negated X for SVG) */}
      {/* Courtyard (center, open air) */}
      <rect x="-8" y="-8" width="16" height="16"
        fill="rgba(60,80,50,0.1)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted" />
      {/* Reception (south wing) */}
      <rect x="-5" y="8" width="10" height="10"
        fill="rgba(90,65,45,0.1)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted" />
      {/* Main Hall (north wing) */}
      <rect x="-8" y="-22" width="16" height="14"
        fill="rgba(40,30,22,0.15)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted" />
      {/* Garden (west wing) */}
      <rect x="8" y="-6" width="12" height="12"
        fill="rgba(50,80,45,0.1)" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted" />

      {/* Zone labels */}
      <text x="0" y="-1" textAnchor="middle" className="fill-hall-muted/40 text-[1.2px] pointer-events-none">Courtyard</text>
      <text x="0" y="14" textAnchor="middle" className="fill-hall-muted/40 text-[1.2px] pointer-events-none">Reception</text>
      <text x="0" y="-16" textAnchor="middle" className="fill-hall-muted/40 text-[1.2px] pointer-events-none">Main Hall</text>
      <text x="14" y="1" textAnchor="middle" className="fill-hall-muted/40 text-[1.2px] pointer-events-none">Garden</text>

      {/* Doorway connectors */}
      <line x1="-1.5" y1="18" x2="1.5" y2="18" stroke="#C9A84C" strokeWidth="0.3" />
      <line x1="-1.5" y1="-8" x2="1.5" y2="-8" stroke="#C9A84C" strokeWidth="0.3" />
      <line x1="8" y1="-1.5" x2="8" y2="1.5" stroke="#C9A84C" strokeWidth="0.3" />

      {/* POI markers */}
      {filteredPOIs.map((poi) => (
        <g key={poi.id} onClick={() => onSelectPOI(poi.id)} className="cursor-pointer">
          <circle
            cx={-poi.position.x}
            cy={poi.position.z}
            r="0.6"
            className="fill-hall-accent hover:fill-white transition-colors"
          />
          <text
            x={-poi.position.x}
            y={poi.position.z + 1.3}
            textAnchor="middle"
            className="fill-hall-muted text-[0.5px] pointer-events-none"
          >
            {poi.content.title}
          </text>
        </g>
      ))}
    </svg>
  )
}
