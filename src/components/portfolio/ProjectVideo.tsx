import { useEffect, useId, useRef, useState } from 'react'
import type { Project } from '@/data/portfolio'

/** Only an explicit visitor action mounts the third-party player. Closing it
 * removes the iframe, stops playback and returns to the same exhibit. */
export default function ProjectVideo({ project, returnFocus, onClose }: { project: Project; returnFocus: HTMLElement | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [waiting, setWaiting] = useState(true)
  const [slow, setSlow] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const titleId = useId(), captionId = useId()
  const video = project.video!
  useEffect(() => {
    const dialog = dialogRef.current!
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = overflow }
  }, [])
  useEffect(() => {
    if (!waiting) return
    const timer = window.setTimeout(() => setSlow(true), 10000)
    return () => window.clearTimeout(timer)
  }, [waiting, attempt])
  const close = () => {
    dialogRef.current?.close()
    onClose()
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
  }
  return <dialog ref={dialogRef} className="project-video-dialog" aria-labelledby={titleId} aria-describedby={captionId}
    onCancel={event => { event.preventDefault(); close() }}
    onClick={event => { if (event.target === event.currentTarget) close() }}
    onKeyDown={event => {
      // Keys within YouTube remain owned by its player. Surrounding controls
      // must not advance the project's gallery underneath the dialog.
      event.stopPropagation()
      if (event.key !== 'Tab') return
      const controls = event.currentTarget.querySelectorAll<HTMLElement>('button, iframe, a[href]')
      const first = controls[0], last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }}>
    <div className="project-video-player">
      <header className="image-viewer-header"><div><p>{project.title} / Recorded project</p><h2 id={titleId}>{video.title}</h2></div><button ref={closeRef} className="image-viewer-close" onClick={close} autoFocus aria-label="Close video and return to exhibit">Back <span aria-hidden="true">×</span></button></header>
      <div className="project-video-screen">
        <iframe key={attempt} title={video.title} src={`https://www.youtube.com/embed/${video.youtubeId}?playsinline=1&rel=0`}
          allow="encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => { setWaiting(false); setSlow(false) }} />
        {waiting && <div className="project-video-loading">{project.image && <img src={`${import.meta.env.BASE_URL}${project.image.src}`} alt="" />}<div><p role="status">{slow ? 'The player is taking a while to open.' : 'Opening the film…'}</p>{slow && <button onClick={() => { setWaiting(true); setSlow(false); setAttempt(value => value + 1); closeRef.current?.focus({ preventScroll: true }) }}>Try again</button>}</div></div>}
      </div>
      <footer className="project-video-footer"><p id={captionId}>{video.caption}</p><div><span>Video hosted on YouTube</span><a href={`https://youtu.be/${video.youtubeId}`} target="_blank" rel="noopener noreferrer">Open on YouTube ↗</a></div></footer>
    </div>
  </dialog>
}
