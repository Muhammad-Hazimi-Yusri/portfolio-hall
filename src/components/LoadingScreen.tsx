import { useEffect, useRef } from 'react'

type LoadingScreenProps = {
  stage?: string
  returnHref?: string
}

const stageLabels: Record<string, string> = {
  engine: 'Opening the walk view…',
  scene: 'Preparing the hall…',
  textures: 'Loading the exhibits…',
  ready: 'The hall is ready.',
}

export function LoadingScreen({ stage = 'engine', returnHref = '#projects' }: LoadingScreenProps) {
  const returnRef = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    returnRef.current?.focus({ preventScroll: true })
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      window.location.hash = returnHref
    }
    window.addEventListener('keydown', cancel)
    return () => window.removeEventListener('keydown', cancel)
  }, [returnHref])
  return (
    <main className="walk-loading" aria-labelledby="walk-loading-title">
      <div>
        <p className="walk-loading-kicker">Balairung</p>
        <h1 id="walk-loading-title">Walk around the hall</h1>
        <p className="walk-loading-status" role="status">{stageLabels[stage] ?? stageLabels.engine}</p>
        <a ref={returnRef} href={returnHref}>← Back to portfolio</a>
      </div>
    </main>
  )
}
