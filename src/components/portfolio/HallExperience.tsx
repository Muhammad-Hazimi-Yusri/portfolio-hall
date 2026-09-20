import { FreeRoamWrapper } from '@/components/tour/FreeRoamWrapper'
import { hasWebGL, hasWebGL2 } from '@/utils/detection'

const returnToPortfolio = () => {
  if (document.pointerLockElement) document.exitPointerLock()
  window.location.hash = '#projects'
}
const ready = () => undefined

export default function HallExperience() {
  const force2d = new URLSearchParams(window.location.search).get('force2d') === 'true'
  if (force2d || !hasWebGL() || !hasWebGL2()) {
    return <main className="portfolio-status"><h1>The 3D hall needs WebGL.</h1><p>The rest of the portfolio works without it.</p><a href="#project/balairung">Read about Balairung →</a><a href="#projects">Back to projects →</a></main>
  }
  return <div className="hall-experience"><FreeRoamWrapper onReturnToTour={returnToPortfolio} onReady={ready} /></div>
}
