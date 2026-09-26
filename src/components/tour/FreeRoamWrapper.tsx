import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import type { MouseEvent } from 'react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ReturnToTourButton } from './ReturnToTourButton'
import type { POI } from '@/types/poi'
import type { HallPose } from '@/components/portfolio/hallNavigation'
import { useCommunity } from '@/components/portfolio/useCommunity'
import type { VisitorZone } from '@/data/community'
import { projectWorlds, projectWorldRoute, worldForProject } from '@/data/projectWorlds'
import { pois } from '@/data/pois'
import ProjectMedia from '@/components/portfolio/ProjectMedia'

const BabylonScene = lazy(() =>
  import('@/3d/BabylonScene').then(m => ({ default: m.BabylonScene })),
)
const VisitorBook = lazy(() => import('@/components/portfolio/VisitorBook'))

type FreeRoamWrapperProps = {
  initialPosition?: { x: number; y: number; z: number }
  initialTarget?: { x: number; y: number; z: number }
  returnHref?: string
  onReturnToTour: () => void
  onReady: () => void
  onPose?: (pose: HallPose) => void
  onOpenExhibit?: (returnHash: string) => void
}

export function FreeRoamWrapper({
  initialPosition,
  initialTarget,
  returnHref,
  onReturnToTour,
  onReady,
  onPose,
  onOpenExhibit,
}: FreeRoamWrapperProps) {
  const [inspecting, setInspecting] = useState<POI | null>(null)
  const [loadStage, setLoadStage] = useState('engine')
  const [isLoaded, setIsLoaded] = useState(false)
  const [visitorZone, setVisitorZone] = useState<VisitorZone>('entrance')
  const [visitorIntent, setVisitorIntent] = useState<'visitors' | 'analytics' | null>(null)
  const visitorLog = useCommunity(visitorZone)
  const guestbookOpen = inspecting?.id === 'contact' && visitorLog.community.mode !== 'offline'
  const exhibitWorld = inspecting ? worldForProject(inspecting.id) : null
  const recordExhibitVisit = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
    const route = event.currentTarget.getAttribute('href') ?? ''
    if (!/^#(?:project|app|world|experience)\//.test(route)) return
    const notes = inspecting?.content.links?.find(link => /^#(?:project|experience)\//.test(link.url))?.url
    onOpenExhibit?.(notes ?? route)
  }
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null), worldRef = useRef<HTMLDivElement>(null)

  const handleLoadProgress = useCallback(
    (progress: number, stage: string) => {
      setLoadStage(stage)
      if (progress >= 100) {
        setIsLoaded(true)
        onReady()
      }
    },
    [onReady],
  )

  const handleInspect = useCallback((poi: POI) => {
    setVisitorIntent(null)
    setInspecting(poi)
    if (document.pointerLockElement) document.exitPointerLock()
  }, [])

  const closeModal = useCallback(() => {
    setInspecting(null)
  }, [])

  const handleVisitorLog = useCallback((intent: 'visitors' | 'analytics') => {
    setVisitorIntent(intent)
    setInspecting(pois.find(poi => poi.id === 'contact') ?? null)
    if (document.pointerLockElement) document.exitPointerLock()
  }, [])
  useEffect(() => { if (isLoaded) document.querySelector<HTMLCanvasElement>('.walk-canvas')?.focus({ preventScroll: true }) }, [isLoaded])
  useEffect(() => {
    if (!inspecting) return
    const previous = document.activeElement as HTMLElement | null
    const world = worldRef.current
    if (world) world.inert = true
    closeRef.current?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); closeModal() }
      if (event.key === 'Tab') {
        const buttons = [...(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])') ?? [])].filter(element => element.getClientRects().length > 0 && !element.closest('details:not([open]) > :not(summary)'))
        const first = buttons[0], last = buttons[buttons.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('keydown', key)
      // React runs effect cleanups before new effects. Restore interactivity
      // here so the previous control can actually receive focus on close.
      if (world) world.inert = false
      // A resize may have replaced the desktop inspector with touch controls.
      // Keep keyboard users in the scene when the original control is gone.
      const target = previous?.isConnected && previous.getClientRects().length ? previous : world?.querySelector<HTMLElement>('.walk-canvas')
      target?.focus({ preventScroll: true })
    }
  }, [inspecting, closeModal])

  return (
    <div className="w-full h-full relative">
      {!isLoaded && <LoadingScreen stage={loadStage} returnHref={returnHref} />}
      <div className="w-full h-full" style={{ visibility: isLoaded ? 'visible' : 'hidden' }}>
      <div ref={worldRef} className="w-full h-full">
      <Suspense fallback={null}>
        <BabylonScene
          community={visitorLog.community}
          onVisitorZoneChange={setVisitorZone}
          onInspect={handleInspect}
          onVisitorLog={handleVisitorLog}
          onLoadProgress={handleLoadProgress}
          onSwitchMode={onReturnToTour}
          inputPaused={Boolean(inspecting)}
          initialCameraPosition={initialPosition}
          initialCameraTarget={initialTarget}
          onPose={onPose}
        />
      </Suspense>
      <ReturnToTourButton onReturn={onReturnToTour} />
      </div>

      {inspecting && (
        <div
          className="walk-dialog-backdrop"
          onClick={closeModal}
        >
          <div
            ref={dialogRef}
            className={`portfolio walk-dialog${!guestbookOpen && inspecting.content.image ? ' has-media' : ''}`}
            role="dialog" aria-modal="true" aria-labelledby="walk-project-title" aria-describedby={guestbookOpen ? undefined : 'walk-project-summary'}
            onClick={e => e.stopPropagation()}
          >
            <div className="walk-dialog-heading">
              <div>{!guestbookOpen && inspecting.content.category && <p className="walk-dialog-category">{inspecting.content.category}</p>}<h2 id="walk-project-title">{guestbookOpen ? visitorIntent ? 'Visitor log' : 'The guestbook' : inspecting.experienceDisplay?.name ?? inspecting.content.title}</h2></div>
              <button ref={closeRef} onClick={closeModal} className="walk-dialog-close" aria-keyshortcuts="Escape">Back to walk <span aria-hidden="true">×</span></button>
            </div>
            <div className="walk-dialog-body">
              {guestbookOpen ? <Suspense fallback={<p>Opening the guestbook…</p>}><VisitorBook {...visitorLog} embedded focusRequest={visitorIntent ? { intent: visitorIntent, key: 0 } : undefined} /></Suspense> : <div className="walk-dialog-layout">
                {inspecting.content.image && <ProjectMedia key={inspecting.id} title={inspecting.content.title} image={inspecting.content.image} gallery={inspecting.content.gallery} />}
                <div className="walk-dialog-details">
                  <p id="walk-project-summary" className="walk-dialog-summary">{inspecting.content.storyHook ?? inspecting.content.description}</p>
                  {inspecting.content.role && <p className="walk-dialog-role"><strong>{inspecting.experienceDisplay ? 'Role' : 'My part'}</strong>{inspecting.content.role}</p>}
                  {inspecting.content.tags && (
                    <p className="walk-dialog-tools"><span className="sr-only">Tools: </span>{inspecting.content.tags.join(' · ')}</p>
                  )}
                  {inspecting.content.outcome && <details className="walk-dialog-status"><summary>{inspecting.content.status ?? 'Current status'}</summary><p>{inspecting.content.outcome}</p></details>}
                  {exhibitWorld && <aside className="walk-world-invitation">
                    <p>Interactive exhibit</p>
                    <a href={projectWorldRoute(exhibitWorld, inspecting.id)} onClick={recordExhibitVisit}>Enter {projectWorlds[exhibitWorld].title.replace(/^The /, 'the ')}<span aria-hidden="true">→</span></a>
                    <span>{projectWorlds[exhibitWorld].description}</span>
                  </aside>}
                </div>
              </div>}
            </div>
            {!guestbookOpen && inspecting.content.links && inspecting.content.links.length > 0 && (
              <nav className="walk-dialog-links" aria-label="Exhibit links">
                {inspecting.content.links.map((link, index) => (
                  <a
                    key={link.label}
                    href={link.url}
                    onClick={recordExhibitVisit}
                    target={link.url.startsWith('https:') ? '_blank' : undefined}
                    rel={link.url.startsWith('https:') ? 'noopener noreferrer' : undefined}
                    className={index === 0 ? 'walk-dialog-primary' : undefined}
                  >
                    {link.label} <span aria-hidden="true">{link.url.startsWith('#') ? '→' : '↗'}</span>
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
