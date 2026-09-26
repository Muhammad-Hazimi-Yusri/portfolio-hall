export type AvvrPresentation = 'model' | 'labels' | `labels/${typeof avvrClasses[number]['name']}` | 'photo' | 'sound'
export type AvvrArchiveState = { model: 'loading' | 'ready' | 'error'; photo: 'idle' | 'loading' | 'ready' | 'error' }
// The S3A source data cannot be redistributed. Retain the local archive tools,
// but publish the original spatial-audio illustration without those assets.
export const avvrArchiveEnabled = false
// Kd values and class names from the archived Input_prediction.mtl.
export const avvrClasses = [
  { name: 'Floor', color: [.1, .847035, .1] },
  { name: 'Wall', color: [.06448, .646941, .774265] },
  { name: 'Window', color: [.131518, .273524, .548847] },
  { name: 'Chair', color: [1, .813553, .03922] },
  { name: 'Furniture', color: [.548847, .143381, .004557] },
  { name: 'Objects', color: [1, .241096, .718126] },
] as const
