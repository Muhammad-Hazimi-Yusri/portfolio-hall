export interface CapturePoint {
  id: string       // filename stem: 'arrival-distant', 'gallery-entrance', etc.
  progress: number // scroll progress this represents (0–1)
  waitMs: number   // ms to wait after positioning before capture
}

export const CAPTURE_POINTS: CapturePoint[] = [
  { id: 'arrival-distant',      progress: 0.00, waitMs: 500 },
  { id: 'arrival-close',        progress: 0.10, waitMs: 500 },
  { id: 'gallery-entrance',     progress: 0.15, waitMs: 500 },
  { id: 'gallery-early',        progress: 0.25, waitMs: 500 },
  { id: 'gallery-mid',          progress: 0.40, waitMs: 500 },
  { id: 'gallery-deep',         progress: 0.55, waitMs: 500 },
  { id: 'observatory-approach', progress: 0.65, waitMs: 500 },
  { id: 'observatory-center',   progress: 0.75, waitMs: 500 },
  { id: 'horizon-start',        progress: 0.85, waitMs: 500 },
  { id: 'horizon-end',          progress: 1.00, waitMs: 500 },
]

/** Maps tour section IDs to their capture image filenames (in order). */
export const SECTION_IMAGES: Record<string, string[]> = {
  intro:    ['tour-arrival-distant.png', 'tour-arrival-close.png'],
  projects: ['tour-gallery-entrance.png', 'tour-gallery-early.png',
             'tour-gallery-mid.png', 'tour-gallery-deep.png'],
  impact:   ['tour-observatory-approach.png', 'tour-observatory-center.png'],
  contact:  ['tour-horizon-start.png', 'tour-horizon-end.png'],
}

/** Build the public URL for a capture image filename. */
export function captureImageUrl(filename: string): string {
  return `${import.meta.env.BASE_URL}tour-captures/${filename}`
}
