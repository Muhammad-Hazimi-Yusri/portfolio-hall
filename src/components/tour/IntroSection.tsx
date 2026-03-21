import { isMobile } from '@/utils/detection'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const mobile = isMobile()

function MouseScrollIcon() {
  return (
    <svg width="28" height="44" viewBox="0 0 28 44" fill="none" className="scroll-hint-mouse">
      <rect x="1" y="1" width="26" height="42" rx="13" stroke="currentColor" strokeWidth="2" />
      <circle className="scroll-hint-wheel" cx="14" cy="14" r="3" fill="currentColor" />
    </svg>
  )
}

function SwipeUpIcon() {
  return (
    <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
      <path d="M16 40V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 20L16 12L24 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="38" r="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

type Props = {
  scrollProgress: number
  reducedMotion: boolean
}

export function IntroSection({ scrollProgress, reducedMotion }: Props) {
  const local = clamp01(scrollProgress / 0.15)

  // Hide when well past this section
  if (scrollProgress > 0.20) return null

  // Name reveal: 0→0.5 local progress
  const revealProgress = clamp01(local / 0.5)
  const clipTop = (1 - revealProgress) * 100

  // Tagline fades in: 0.3→0.6 local
  const taglineOpacity = clamp01((local - 0.3) / 0.3)

  // Scroll indicator fades out by local 0.67
  const indicatorOpacity = clamp01(1 - local / 0.67)

  // Section fades out: local 0.75→1.0
  const sectionOpacity = local < 0.75 ? 1 : clamp01(1 - (local - 0.75) / 0.25)

  return (
    <div
      role="banner"
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      style={{ opacity: sectionOpacity }}
    >
      <h1
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-['Space_Grotesk',sans-serif] text-hall-accent text-center leading-tight"
        style={
          reducedMotion
            ? { opacity: revealProgress, textShadow: '0 1px 8px rgba(255,255,255,0.8)' }
            : {
                clipPath: `inset(${clipTop}% 0 0 0)`,
                transform: `translateY(${(1 - revealProgress) * 20}px)`,
                textShadow: '0 1px 8px rgba(255,255,255,0.8)',
              }
        }
      >
        Muhammad Hazimi Yusri
      </h1>

      <p
        className="text-base sm:text-lg md:text-xl text-hall-muted mt-4 md:mt-6 text-center"
        style={{
          opacity: taglineOpacity,
          transform: reducedMotion ? undefined : `translateY(${(1 - taglineOpacity) * 12}px)`,
        }}
      >
        I build things you can walk through
      </p>

      {indicatorOpacity > 0 && (
        <div
          className="absolute bottom-16 md:bottom-20 flex flex-col items-center gap-3 bg-black/20 backdrop-blur-sm rounded-2xl px-8 py-5"
          style={{ opacity: indicatorOpacity }}
        >
          <div className="text-hall-accent">
            {mobile ? <SwipeUpIcon /> : <MouseScrollIcon />}
          </div>
          <span className="text-base sm:text-lg text-hall-accent font-medium tracking-wide">
            {mobile ? 'Swipe up to explore' : 'Scroll to explore'}
          </span>
          <div className="flex flex-col items-center gap-0.5 scroll-hint-chevrons">
            <span className="text-hall-accent/80 text-lg leading-none">&#8964;</span>
            <span className="text-hall-accent/50 text-lg leading-none">&#8964;</span>
          </div>
        </div>
      )}
    </div>
  )
}
