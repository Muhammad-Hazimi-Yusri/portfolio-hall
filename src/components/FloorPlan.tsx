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
    <svg viewBox="-10 -9 20 18" className="w-full h-full max-h-[60vh]">
      {/* Hall outline */}
      <rect x="-8" y="-7" width="16" height="14" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-hall-muted" />

      {/* Door */}
      <rect x="-1" y="6.9" width="2" height="0.3" className="fill-hall-accent" />
      
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