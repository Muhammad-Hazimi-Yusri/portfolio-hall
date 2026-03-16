export interface CapturePoint {
  id: string       // filename stem: 'gate-approach', 'hall-entry', etc.
  progress: number // scroll progress this represents (0–1)
  waitMs: number   // ms to wait after positioning before capture
}

export const CAPTURE_POINTS: CapturePoint[] = [
  { id: 'gate-approach',   progress: 0.00, waitMs: 500 },
  { id: 'gate-enter',      progress: 0.12, waitMs: 500 },
  { id: 'hall-entry',      progress: 0.15, waitMs: 500 },
  { id: 'hall-mid-left',   progress: 0.30, waitMs: 500 },
  { id: 'hall-mid-right',  progress: 0.45, waitMs: 500 },
  { id: 'hall-deep',       progress: 0.55, waitMs: 500 },
  { id: 'courtyard-entry', progress: 0.65, waitMs: 500 },
  { id: 'courtyard-mid',   progress: 0.75, waitMs: 500 },
  { id: 'garden-entry',    progress: 0.88, waitMs: 500 },
  { id: 'garden-settle',   progress: 0.95, waitMs: 500 },
]

/** Maps tour section IDs to their capture image filenames (in order). */
export const SECTION_IMAGES: Record<string, string[]> = {
  intro:    ['tour-gate-approach.png', 'tour-gate-enter.png'],
  projects: ['tour-hall-entry.png', 'tour-hall-mid-left.png',
             'tour-hall-mid-right.png', 'tour-hall-deep.png'],
  impact:   ['tour-courtyard-entry.png', 'tour-courtyard-mid.png'],
  contact:  ['tour-garden-entry.png', 'tour-garden-settle.png'],
}

/** Build the public URL for a capture image filename. */
export function captureImageUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}tour-captures/${filename}`
}
