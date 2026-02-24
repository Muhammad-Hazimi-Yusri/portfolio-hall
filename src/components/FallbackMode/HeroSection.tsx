import type { POI } from '@/types/poi'

type Props = {
  aboutPOI: POI | undefined
  onSwitchMode: () => void
}

const PARTICLES = [
  { left: '8%',  top: '18%', size: 5, delay: 0,   duration: 5.2 },
  { left: '18%', top: '72%', size: 7, delay: 0.7,  duration: 6.1 },
  { left: '30%', top: '35%', size: 4, delay: 1.4,  duration: 4.8 },
  { left: '42%', top: '80%', size: 6, delay: 2.1,  duration: 5.7 },
  { left: '55%', top: '22%', size: 4, delay: 0.3,  duration: 6.5 },
  { left: '65%', top: '60%', size: 8, delay: 1.0,  duration: 4.4 },
  { left: '74%', top: '40%', size: 5, delay: 1.8,  duration: 5.9 },
  { left: '82%', top: '78%', size: 4, delay: 2.5,  duration: 4.6 },
  { left: '90%', top: '28%', size: 6, delay: 0.5,  duration: 6.3 },
  { left: '12%', top: '50%', size: 4, delay: 3.0,  duration: 5.0 },
]

export function HeroSection({ aboutPOI, onSwitchMode }: Props) {
  return (
    <section id="section-hero" data-section-id="hero" className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 overflow-hidden">
      {/* CSS-only particle background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="particle-float absolute rounded-full bg-hall-accent/25"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              animationDelay: `${p.delay}s`,
              '--duration': `${p.duration}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-hall-accent mb-3 tracking-wide">
          Balairung
        </h1>
        <p className="text-hall-muted text-sm md:text-base tracking-[0.3em] uppercase mb-6">
          Muhammad Hazimi Yusri
        </p>
        <div className="w-24 h-px bg-hall-accent/40 mx-auto mb-8" />
        <p className="text-hall-text text-lg md:text-xl max-w-md mx-auto mb-10 leading-relaxed">
          {aboutPOI?.content.description ?? 'Engineer building at the intersection of VR, cybersecurity, and creative technology.'}
        </p>
        <button
          onClick={onSwitchMode}
          className="px-8 py-3 bg-hall-accent text-hall-bg font-semibold rounded-lg hover:bg-hall-accent/90 transition-colors font-['Cinzel',serif] text-sm md:text-base"
        >
          Explore in 3D
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-hall-muted/60">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-hall-accent/60 to-transparent animate-pulse" />
      </div>
    </section>
  )
}
