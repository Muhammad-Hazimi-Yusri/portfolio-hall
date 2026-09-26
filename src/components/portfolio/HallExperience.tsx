import { FreeRoamWrapper } from '@/components/tour/FreeRoamWrapper'
import { hasWebGL, hasWebGL2 } from '@/utils/detection'
import { useCallback, useRef } from 'react'
import { returnFromWalk } from './hallNavigation'
import type { HallPose, WalkEntry } from './hallNavigation'

const ready = () => undefined

export default function HallExperience({ entry, onOpenExhibit }: { entry: WalkEntry; onOpenExhibit?: (entry: WalkEntry) => void }) {
  const pose = useRef<HallPose | null>(null)
  const rememberPose = useCallback((value: HallPose) => { pose.current = value }, [])
  const returnToPortfolio = () => {
    if (document.pointerLockElement) document.exitPointerLock()
    window.location.hash = returnFromWalk(entry, pose.current)
  }
  const force2d = new URLSearchParams(window.location.search).get('force2d') === 'true'
  if (force2d || !hasWebGL() || !hasWebGL2()) {
    return <main className="portfolio-status"><h1>The 3D hall needs WebGL.</h1><p>The rest of the portfolio works without it.</p><a href="#project/balairung">Read about Balairung →</a><a href="#projects">Back to projects →</a></main>
  }
  return <div className="hall-experience"><FreeRoamWrapper initialPosition={entry.position} initialTarget={entry.target} returnHref={entry.returnHash} onPose={rememberPose} onReturnToTour={returnToPortfolio} onReady={ready} onOpenExhibit={returnHash => onOpenExhibit?.({ ...(pose.current ?? entry), returnHash })} /></div>
}
