import { useScrollProgress } from '@/contexts/ScrollContext'

export function ScrollProgressBar() {
  const { scrollProgress, activeSection } = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 w-full z-50 h-[3px] bg-hall-frame/50">
      <div
        className="h-full bg-hall-accent transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      <span
        className="absolute right-3 top-1.5 text-xs font-['Space_Grotesk',sans-serif] text-hall-accent transition-opacity duration-300"
        style={{ opacity: activeSection ? 1 : 0 }}
      >
        {activeSection?.label}
      </span>
    </div>
  )
}
