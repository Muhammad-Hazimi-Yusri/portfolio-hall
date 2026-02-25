type Zone = 'reception' | 'main-hall' | 'courtyard' | 'garden'

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
  x: number
  y: number
  w: number
  h: number
  label: string
  subtitle: string
  labelX: number
  labelY: number
}

const ZONES: ZoneDef[] = [
  { id: 'main-hall',  x: -8,  y: -22, w: 16, h: 14, label: 'Main Hall',  subtitle: 'Projects',   labelX: 0,   labelY: -16.5 },
  { id: 'courtyard',  x: -8,  y: -8,  w: 16, h: 16, label: 'Courtyard',  subtitle: 'Experience',  labelX: 0,   labelY: -1.5  },
  { id: 'reception',  x: -5,  y:  8,  w: 10, h: 10, label: 'Reception',  subtitle: 'Welcome',     labelX: 0,   labelY: 11    },
  { id: 'garden',     x: -20, y: -6,  w: 12, h: 12, label: 'Garden',     subtitle: 'Skills',      labelX: -14, labelY: -1.5  },
]

const ACTIVE_FILL   = 'rgba(201,168,76,0.15)'
const INACTIVE_FILL = 'rgba(60,43,30,0.2)'
const STROKE        = '#9C8B7A'
const GOLD          = '#C9A84C'

// Octagonal fountain polygon at Courtyard center (0, 0)
function fountainPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

export function CastleMap({ activeZone, pois, onZoneClick, onPOIClick }: Props) {
  return (
    <svg
      viewBox="-24 -26 38 48"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Castle map navigation"
      style={{ fontFamily: "'Cinzel', serif" }}
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

        {/* Parchment noise texture — subtle grain on map background */}
        <filter id="parchment" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
          <feBlend in="SourceGraphic" in2="grey" mode="multiply" result="blend" />
          <feComposite in="blend" in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* ── Parchment backdrop ── */}
      <rect
        x="-22" y="-25" width="32" height="46" rx="1"
        fill="rgba(36,26,18,0.75)"
        stroke={STROKE}
        strokeWidth="0.25"
      />

      {/* ── Outer decorative border (double-line) ── */}
      <rect
        x="-21.5" y="-24.5" width="31" height="45" rx="0.5"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.15"
        strokeOpacity="0.3"
      />

      {/* ── Zone rooms ── */}
      {ZONES.map(({ id, x, y, w, h }) => {
        const isActive = activeZone === id
        return (
          <g
            key={id}
            className="castle-map-zone"
            onClick={() => onZoneClick(id)}
            role="button"
            aria-label={`Navigate to ${id.replace('-', ' ')}`}
          >
            <rect
              x={x} y={y} width={w} height={h}
              fill={isActive ? ACTIVE_FILL : INACTIVE_FILL}
              stroke={STROKE}
              strokeWidth="0.3"
              strokeLinecap="round"
              filter={isActive ? 'url(#zone-glow)' : undefined}
              style={{ transition: 'fill 0.3s ease' }}
            />
          </g>
        )
      })}

      {/* ── Decorative elements (non-interactive) ── */}
      <g pointerEvents="none">

        {/* Main Hall — pillar pairs */}
        {[[-7, -21], [6, -21], [-7, -10], [6, -10]].map(([px, py], i) => (
          <rect key={i} x={px} y={py} width="0.8" height="1.5"
            fill="rgba(156,139,122,0.25)" stroke={STROKE} strokeWidth="0.15" />
        ))}
        {/* Main Hall — painting outlines on back wall */}
        {[[-5, -22], [-1, -22], [3, -22]].map(([px, py], i) => (
          <rect key={i} x={px} y={py} width="2" height="0.8"
            fill="none" stroke={GOLD} strokeWidth="0.2" strokeOpacity="0.5" />
        ))}
        {/* Main Hall — side paintings (both walls) */}
        {[[-8, -19], [-8, -15], [7.2, -19], [7.2, -15]].map(([px, py], i) => (
          <rect key={i} x={px} y={py} width="0.8" height="1.8"
            fill="none" stroke={GOLD} strokeWidth="0.2" strokeOpacity="0.4" />
        ))}

        {/* Courtyard — fountain */}
        <polygon
          points={fountainPoints(0, 0, 2.2)}
          fill="none"
          stroke={STROKE}
          strokeWidth="0.2"
          strokeOpacity="0.6"
        />
        <circle cx="0" cy="0" r="0.6"
          fill="rgba(156,139,122,0.2)"
          stroke={STROKE} strokeWidth="0.15" />
        {/* Courtyard — tree dots (corners) */}
        {[[-6, -6], [5, -6], [-6, 5], [5, 5]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.7"
            fill="rgba(70,100,55,0.3)" stroke="rgba(70,100,55,0.5)" strokeWidth="0.1" />
        ))}

        {/* Reception — pillars */}
        {[[-4, 9], [3, 9]].map(([px, py], i) => (
          <rect key={i} x={px} y={py} width="0.8" height="1.5"
            fill="rgba(156,139,122,0.25)" stroke={STROKE} strokeWidth="0.15" />
        ))}
        {/* Reception — entrance arch */}
        <path
          d="M -1.5,18 Q 0,16.5 1.5,18"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.25"
          strokeOpacity="0.6"
        />

        {/* Garden — plant markers (mirrored to left side) */}
        {[[-10, -4], [-10, 2], [-14, -4], [-14, 2], [-18, -1]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.55"
            fill="rgba(70,100,55,0.35)" stroke="rgba(70,100,55,0.55)" strokeWidth="0.12" />
        ))}
        {/* Garden — trellis lines */}
        <line x1="-9" y1="-5" x2="-19" y2="5" stroke={STROKE} strokeWidth="0.1" strokeOpacity="0.3" />
        <line x1="-9" y1="5"  x2="-19" y2="-5" stroke={STROKE} strokeWidth="0.1" strokeOpacity="0.3" />
      </g>

      {/* ── Doorway connectors ── */}
      <g pointerEvents="none">
        {/* Main Hall ↔ Courtyard */}
        <line x1="-1.5" y1="-8" x2="1.5" y2="-8"
          stroke={GOLD} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />
        {/* Courtyard ↔ Reception */}
        <line x1="-1.5" y1="8" x2="1.5" y2="8"
          stroke={GOLD} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />
        {/* Courtyard ↔ Garden (left side) */}
        <line x1="-8" y1="-1.5" x2="-8" y2="1.5"
          stroke={GOLD} strokeWidth="0.35" strokeLinecap="round" strokeOpacity="0.7" />
      </g>

      {/* ── Zone labels with section sublabels ── */}
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
                fill={GOLD}
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
                fill={GOLD}
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
          fill={GOLD}
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
