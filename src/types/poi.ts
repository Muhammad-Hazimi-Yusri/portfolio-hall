export type POIType = 'painting' | 'display-case' | 'pedestal' | 'custom'

export type POISection = 'projects' | 'about' | 'skills' | 'contact'

export type POILink = {
  label: string
  url: string
}

export type POIContent = {
  title: string
  thumbnail: string
  description: string
  links?: POILink[]
  tags?: string[]
}

export type POICustomConfig = {
  meshUrl?: string
  interactionType?: 'default' | 'video' | 'iframe' | 'custom-script'
  interactionConfig?: Record<string, unknown>
}

export type POI = {
  id: string
  type: POIType
  section: POISection
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
