import { useMemo, useState, useCallback } from 'react'
import { useScrollProgress } from '@/contexts/ScrollContext'
import { TOUR_SECTIONS } from '@/data/tourSections'
import { SECTION_IMAGES, captureImageUrl } from '@/3d/tourCaptures'

/**
 * 2D fallback visual layer for non-WebGL devices.
 * Crossfades pre-rendered screenshots with CSS parallax, matching the
 * same scroll-driven experience as TourCanvas.
 */
export function TourFallback() {
  const { scrollProgress, activeSection } = useScrollProgress()
  const [failedImages, setFailedImages] = useState<Set<string>>(() => new Set())

  const handleImageError = useCallback((filename: string) => {
    setFailedImages(prev => {
      const next = new Set(prev)
      next.add(filename)
      return next
    })
    if (import.meta.env.DEV) {
      console.warn(`Tour capture image not found: ${filename}`)
    }
  }, [])

  // Determine which sections to load images for (current + adjacent)
  const visibleSectionIds = useMemo(() => {
    const ids = new Set<string>()
    if (!activeSection) {
      // At the very start, load intro
      ids.add('intro')
      ids.add('projects')
      return ids
    }
    const idx = TOUR_SECTIONS.findIndex(s => s.id === activeSection.id)
    if (idx > 0) ids.add(TOUR_SECTIONS[idx - 1].id)
    ids.add(activeSection.id)
    if (idx < TOUR_SECTIONS.length - 1) ids.add(TOUR_SECTIONS[idx + 1].id)
    return ids
  }, [activeSection])

  // Calculate crossfade state: which images are visible and at what opacity
  const layers = useMemo(() => {
    const result: { filename: string; opacity: number; parallaxOffset: number }[] = []

    for (const section of TOUR_SECTIONS) {
      if (!visibleSectionIds.has(section.id)) continue

      const images = SECTION_IMAGES[section.id]
      if (!images || images.length === 0) continue

      const sectionRange = section.scrollEnd - section.scrollStart
      if (sectionRange <= 0) continue

      // Local progress within this section (0–1)
      const localProgress = Math.max(0, Math.min(1,
        (scrollProgress - section.scrollStart) / sectionRange
      ))

      // Parallax offset: subtle upward shift as you scroll through the section
      const parallaxOffset = -localProgress * 30

      if (images.length === 1) {
        // Single image for this section
        const sectionOpacity = section.id === activeSection?.id ? 1 : 0
        result.push({ filename: images[0], opacity: sectionOpacity, parallaxOffset })
        continue
      }

      // Multiple images: crossfade between them
      const imageProgress = localProgress * (images.length - 1)
      const lowerIdx = Math.floor(imageProgress)
      const upperIdx = Math.min(lowerIdx + 1, images.length - 1)
      const blend = imageProgress - lowerIdx

      // Only show images for the active section (or fading in/out at boundaries)
      const isActive = section.id === activeSection?.id
      const sectionOpacity = isActive ? 1 : 0

      for (let i = 0; i < images.length; i++) {
        let imgOpacity = 0
        if (i === lowerIdx && i === upperIdx) {
          imgOpacity = 1
        } else if (i === lowerIdx) {
          imgOpacity = 1 - blend
        } else if (i === upperIdx) {
          imgOpacity = blend
        }
        if (imgOpacity > 0) {
          result.push({
            filename: images[i],
            opacity: imgOpacity * sectionOpacity,
            parallaxOffset,
          })
        }
      }
    }

    return result
  }, [scrollProgress, activeSection, visibleSectionIds])

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-hall-bg">
      {/* Image layers */}
      {layers.map(({ filename, opacity, parallaxOffset }) =>
        failedImages.has(filename) ? null : (
          <img
            key={filename}
            src={captureImageUrl(filename)}
            alt=""
            onError={() => handleImageError(filename)}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity,
              transform: `translateY(${parallaxOffset}px)`,
              willChange: 'transform, opacity',
              transition: 'opacity 0.15s ease-out',
            }}
            loading="lazy"
            draggable={false}
          />
        )
      )}

      {/* Ambient overlays */}
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(28, 20, 16, 0.6) 100%)',
        }}
      />
      {/* Faint gold top gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(201, 168, 76, 0.08) 0%, transparent 30%)',
        }}
      />
    </div>
  )
}
