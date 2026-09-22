export type POIType = 'painting' | 'display-case' | 'pedestal' | 'custom'

export type POISection = 'projects' | 'about' | 'skills' | 'contact' | 'experience' | 'hackathons'

export type Zone = 'arrival' | 'gallery' | 'observatory' | 'horizon'

export type POILink = {
  label: string
  url: string
}

export type POIContent = {
  title: string
  thumbnail: string
  thumbnails?: string[]
  captions?: string[]
  description: string
  storyHook?: string
  challenge?: string
  approach?: string
  outcome?: string
  links?: POILink[]
  tags?: string[]
}

export type POICustomConfig = {
  meshUrl?: string
  interactionType?: 'default' | 'video' | 'iframe' | 'custom-script'
  interactionConfig?: Record<string, unknown>
  splatPath?: string
  splatOffset?: { x: number; y: number; z: number }
  splatScale?: number
}

export type POI = {
  id: string
  type: POIType
  section: POISection
  zone: Zone
  position: { x: number; z: number }
  rotation: number
  content: POIContent
  custom?: POICustomConfig
}

export type AppMode = 'welcome' | '3d' | 'fallback'

export type AppState = {
  mode: AppMode
  inspecting: string | null
  playerPosition: { x: number; z: number }
  playerRotation: number
  visitedPOIs: string[]
  sidebarOpen: boolean
}
