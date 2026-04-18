const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

type Props = {
  scrollProgress: number
  reducedMotion: boolean
}

const TIMELINE = [
  {
    period: '2021 – 2025',
    title: 'University of Southampton',
    subtitle: 'MEng ECS — First Class Honours',
  },
  {
    period: 'Summer 2024',
    title: 'Audioscenic — Intern',
    subtitle: 'Python audio analysis, PyTest TDD, WebSocket real-time systems',
  },
  {
    period: '2023 – 2024',
    title: 'Southampton — Research Assistant',
    subtitle: 'ML pipeline for VR scene reconstruction, Unity + Steam Audio',
  },
]

const SKILL_CALLOUTS = [
  { label: 'Built VR experiences', tech: 'Unity, Babylon.js, WebXR' },
  { label: 'Designed hardware', tech: 'Raspberry Pi, 3D Printing, OpenCV' },
  { label: 'Shipped web apps', tech: 'React, TypeScript, Next.js, Supabase' },
]

export function ImpactSection({ scrollProgress, reducedMotion }: Props) {
  const local = clamp01((scrollProgress - 0.65) / 0.2)

  if (scrollProgress < 0.62 || scrollProgress > 0.88) return null

  // Section entry/exit
  const sectionEntry = clamp01(local / 0.15)
  const sectionExit = local > 0.9 ? clamp01((local - 0.9) / 0.1) : 0
  const sectionOpacity = Math.min(sectionEntry, 1 - sectionExit)

  // Philosophy: local 0→0.3
  const philoOpacity = clamp01(local / 0.25)
  const philoY = reducedMotion ? 0 : (1 - philoOpacity) * 20

  // Timeline: stagger from local 0.2
  const timelineBase = 0.2

  // Skills: stagger from local 0.55
  const skillsBase = 0.55

  return (
    <div
      aria-label="Experience and skills"
      className="absolute inset-0 flex items-start sm:items-center justify-center overflow-y-auto overflow-x-hidden pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] px-6 md:p-12"
      style={{ opacity: sectionOpacity }}
    >
      <div className="max-w-2xl w-full py-5 sm:py-8 glass-panel shadow-sm rounded-xl px-4 sm:px-6 md:px-8">
        {/* Philosophy */}
        <div
          className="mb-6 sm:mb-10"
          style={{
            opacity: philoOpacity,
            transform: `translateY(${philoY}px)`,
          }}
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-['Space_Grotesk',sans-serif] text-hall-accent mb-2 sm:mb-4">
            Why It Matters
          </h2>
          <p className="text-hall-text story-text text-sm sm:text-base md:text-lg">
            I work at the intersection of hardware and software — building things people can
            walk through, hold, or interact with. Whether it&apos;s a robot that runs an LLM
            offline or a portfolio you&apos;re scrolling through right now, I care about making
            technology feel tangible.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-6 sm:mb-10 relative pl-6 border-l-2 border-hall-accent/30">
          {TIMELINE.map((item, i) => {
            const itemLocal = clamp01((local - (timelineBase + i * 0.12)) / 0.12)
            const itemY = reducedMotion ? 0 : (1 - itemLocal) * 16
            return (
              <div
                key={item.title}
                className="mb-4 sm:mb-6 last:mb-0 relative"
                style={{
                  opacity: itemLocal,
                  transform: `translateY(${itemY}px)`,
                }}
              >
                {/* Timeline dot */}
                <div className="absolute -left-[calc(0.75rem+1px)] top-1.5 w-3 h-3 rounded-full bg-hall-accent" />
                <span className="text-xs text-hall-muted uppercase tracking-wider">
                  {item.period}
                </span>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-hall-text">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-hall-muted">{item.subtitle}</p>
              </div>
            )
          })}
        </div>

        {/* Skills as contextual callouts */}
        <div>
          {SKILL_CALLOUTS.map((skill, i) => {
            const skillLocal = clamp01((local - (skillsBase + i * 0.1)) / 0.1)
            const skillY = reducedMotion ? 0 : (1 - skillLocal) * 16
            return (
              <div
                key={skill.label}
                className="mb-2 sm:mb-3 last:mb-0 text-sm sm:text-base"
                style={{
                  opacity: skillLocal,
                  transform: `translateY(${skillY}px)`,
                }}
              >
                <span className="text-hall-text">{skill.label}</span>
                <span className="text-hall-accent mx-2">&rarr;</span>
                <span className="text-hall-muted text-xs sm:text-sm">{skill.tech}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
