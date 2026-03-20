type Zone = 'arrival' | 'gallery' | 'observatory' | 'horizon'

export type POIMarker = {
  id: string
  svgX: number
  svgY: number
  label: string
  zone: Zone
}

type Props = {
  activeZone: Zone | null
  pois: POIMarker[]
  onZoneClick: (zone: Zone) => void
  onPOIClick: (poiId: string) => void
}

type ZoneDef = {
  id: Zone
  label: string
  subtitle: string
  labelX: number
  labelY: number
} & (
  | { shape: 'rect'; x: number; y: number; w: number; h: number }
  | { shape: 'circle'; cx: number; cy: number; r: number }
)

const ZONES: ZoneDef[] = [
  { id: 'arrival',     shape: 'circle', cx: 0,    cy: 0, r: 4,   label: 'Arrival',     subtitle: 'Welcome',    labelX: 0,    labelY: -5.5 },
  { id: 'gallery',     shape: 'rect',   x: 8,     y: -5, w: 50, h: 10, label: 'Gallery',     subtitle: 'Projects',   labelX: 33,   labelY: -6.5 },
  { id: 'observatory', shape: 'circle', cx: 68,   cy: 0, r: 7,   label: 'Observatory', subtitle: 'Experience', labelX: 68,   labelY: -8.5 },
  { id: 'horizon',     shape: 'rect',   x: 75,    y: -2, w: 15, h: 4,  label: 'Horizon',     subtitle: 'Contact',    labelX: 82.5, labelY: -3.5 },
]

const ACTIVE_FILL   = 'rgba(56,189,248,0.15)'
const INACTIVE_FILL = 'rgba(226,232,240,0.3)'
const STROKE        = '#64748B'
const ACCENT        = '#38BDF8'

export function PathwayMap({ activeZone, pois, onZoneClick, onPOIClick }: Props) {
  return (
    <svg
      viewBox="-6 -10 100 20"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Pathway map navigation"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <defs>
        {/* Glow filter for active zone */}
        <filter id="zone-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── Water backdrop ── */}
      <rect
        x="-6" y="-10" width="100" height="20" rx="1"
        fill="rgba(56,189,248,0.06)"
      />

      {/* ── Zone shapes ── */}
      {ZONES.map((zone) => {
        const isActive = activeZone === zone.id
        const fill = isActive ? ACTIVE_FILL : INACTIVE_FILL
        const filter = isActive ? 'url(#zone-glow)' : undefined

        return (
          <g
            key={zone.id}
            className="pathway-map-zone"
            onClick={() => onZoneClick(zone.id)}
            role="button"
            aria-label={`Navigate to ${zone.label}`}
          >
            {zone.shape === 'circle' ? (
              <circle
                cx={zone.cx} cy={zone.cy} r={zone.r}
                fill={fill}
                stroke={STROKE}
                strokeWidth="0.3"
                filter={filter}
                style={{ transition: 'fill 0.3s ease' }}
              />
            ) : (
              <rect
                x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                fill={fill}
                stroke={STROKE}
                strokeWidth="0.3"
                rx="0.5"
                filter={filter}
                style={{ transition: 'fill 0.3s ease' }}
              />
            )}
          </g>
        )
      })}

      {/* ── Decorative elements ── */}
      <g pointerEvents="none">
        {/* Gallery wall indicator (left side) */}
        <line x1="8" y1="-5" x2="58" y2="-5"
          stroke={ACCENT} strokeWidth="0.25" strokeOpacity="0.4" />

        {/* Path connectors between zones */}
        <line x1="4" y1="0" x2="8" y2="0"
          stroke={ACCENT} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />
        <line x1="58" y1="0" x2="61" y2="0"
          stroke={ACCENT} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />
        <line x1="75" y1="0" x2="75" y2="0"
          stroke={ACCENT} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Wave marks in water */}
        {[[-3, -7], [20, 7], [50, -8], [80, 7], [92, -5]].map(([wx, wy], i) => (
          <path key={i}
            d={`M ${wx - 1.5},${wy} Q ${wx - 0.75},${wy - 0.5} ${wx},${wy} Q ${wx + 0.75},${wy + 0.5} ${wx + 1.5},${wy}`}
            fill="none" stroke={ACCENT} strokeWidth="0.12" strokeOpacity="0.2" />
        ))}
      </g>

      {/* ── Zone labels ── */}
      <g pointerEvents="none">
        {ZONES.map(({ id, label, subtitle, labelX, labelY }) => {
          const isActive = activeZone === id
          return (
            <g key={id}>
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize="1.3"
                fill={ACCENT}
                fillOpacity={isActive ? 1 : 0.55}
                letterSpacing="0.05"
                style={{ transition: 'fill-opacity 0.3s ease', userSelect: 'none' }}
              >
                {label}
              </text>
              <text
                x={labelX}
                y={labelY + 1.6}
                textAnchor="middle"
                fontSize="0.85"
                fill={ACCENT}
                fillOpacity={isActive ? 0.7 : 0.35}
                letterSpacing="0.08"
                style={{ transition: 'fill-opacity 0.3s ease', userSelect: 'none' }}
              >
                {subtitle}
              </text>
            </g>
          )
        })}
      </g>

      {/* ── POI dots ── */}
      {pois.map((poi) => (
        <circle
          key={poi.id}
          cx={poi.svgX}
          cy={poi.svgY}
          r="0.55"
          fill={ACCENT}
          opacity="0.8"
          className="cursor-pointer"
          style={{ transition: 'opacity 0.2s ease' }}
          onClick={(e) => { e.stopPropagation(); onPOIClick(poi.id) }}
        >
          <title>{poi.label}</title>
        </circle>
      ))}
    </svg>
  )
}
