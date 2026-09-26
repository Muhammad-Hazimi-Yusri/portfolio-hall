// Shared by the walkable environment and the lightweight, accessible floor plan.
export type HallDeck = {
  id: string
  x: number
  z: number
  width: number
  depth: number
  round?: boolean
  timber?: boolean
}

export const hallDecks: HallDeck[] = [
  { id: 'arrivalPlatform', x: 0, z: 0, width: 10, depth: 10, round: true },
  { id: 'arrivalBridge', x: 0, z: 6, width: 5, depth: 8, timber: true },
  { id: 'galleryFloor', x: 0, z: 33, width: 10, depth: 50 },
  { id: 'observatoryBridge', x: 0, z: 60, width: 6, depth: 8, timber: true },
  { id: 'observatoryPlatform', x: 0, z: 68, width: 14, depth: 14, round: true },
  { id: 'horizonPath', x: 0, z: 82, width: 4, depth: 16, timber: true },
  { id: 'horizonTerrace', x: 0, z: 87, width: 7, depth: 7, round: true },
]

export const hallStops = [
  { id: '', label: 'Entrance', number: '01', z: 0, detail: 'Meet Hazimi' },
  { id: 'work', label: 'Work', number: '02', z: 12, detail: 'Engineering & internal tools' },
  { id: 'projects', label: 'Projects', number: '03', z: 36, detail: 'Web, graphics & experiments' },
  { id: 'about', label: 'Experience', number: '04', z: 68, detail: 'TNEI · Audioscenic · Southampton' },
  { id: 'contact', label: 'Contact', number: '05', z: 87, detail: 'Continue the conversation' },
]

export const galleryPosition = (index: number, count: number) => 10 + index * (44 / Math.max(9, count - 1))

// Columns sit between the framed exhibits. Keep the 2D guide and pavilion
// structure in agreement when the project collection changes.
export function galleryColumns(exhibitPositions: readonly number[]) {
  const bayLength = exhibitPositions.length > 1 ? exhibitPositions[1] - exhibitPositions[0] : 4.9
  return Array.from({ length: exhibitPositions.length + 1 }, (_, index) => Math.max(7.65, Math.min(58, 10 - bayLength / 2 + index * bayLength)))
}

// Keep the planting on the outside of circulation and away from project frames.
export const hallPlantings = [
  { x: -3.4, z: 1, scale: 1 }, { x: 3.4, z: 1, scale: 1 },
  { x: 3.6, z: 26.3, scale: .85 }, { x: 3.6, z: 45.3, scale: .85 },
  { x: -5.4, z: 68.1, scale: 1.05 }, { x: 5.4, z: 68.1, scale: 1.05 },
]
