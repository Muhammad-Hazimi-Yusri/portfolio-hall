const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

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
      className="absolute inset-0 flex flex-col items-center justify-center px-6"
      style={{ opacity: sectionOpacity }}
    >
      <h1
        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold font-['Cinzel',serif] text-hall-accent text-center leading-tight"
        style={
          reducedMotion
            ? { opacity: revealProgress }
            : {
                clipPath: `inset(${clipTop}% 0 0 0)`,
                transform: `translateY(${(1 - revealProgress) * 20}px)`,
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
          className="absolute bottom-12 md:bottom-16 flex flex-col items-center text-hall-muted text-sm"
          style={{ opacity: indicatorOpacity }}
        >
          <span>Scroll to explore</span>
          <span className="mt-2 animate-bounce">&#9660;</span>
        </div>
      )}
    </div>
  )
}
