export interface TourSection {
  id: 'intro' | 'projects' | 'impact' | 'contact'
  label: string
  storyBeat: string
  scrollStart: number
  scrollEnd: number
  zone: string
}

export const TOUR_SECTIONS: TourSection[] = [
  {
    id: 'intro',
    label: 'Introduction',
    storyBeat: 'Who I am',
    scrollStart: 0.0,
    scrollEnd: 0.15,
    zone: 'gate',
  },
  {
    id: 'projects',
    label: 'Projects',
    storyBeat: 'What I build',
    scrollStart: 0.15,
    scrollEnd: 0.65,
    zone: 'main-hall',
  },
  {
    id: 'impact',
    label: 'Impact',
    storyBeat: 'Why it matters',
    scrollStart: 0.65,
    scrollEnd: 0.85,
    zone: 'courtyard',
  },
  {
    id: 'contact',
    label: 'Contact',
    storyBeat: "Let's talk",
    scrollStart: 0.85,
    scrollEnd: 1.0,
    zone: 'garden',
  },
]

export function getSectionAtProgress(progress: number): TourSection | null {
  for (const section of TOUR_SECTIONS) {
    if (
      progress >= section.scrollStart &&
      (progress < section.scrollEnd || (section.id === 'contact' && progress <= section.scrollEnd))
    ) {
      return section
    }
  }
  return null
}
