import { useEffect, useId, useImperativeHandle, useRef, useState } from 'react'
import type { Ref } from 'react'
import type { ProjectImage } from '@/data/portfolio'

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
export type ProjectMediaHandle = { openFrame: (returnFocus: HTMLElement | null) => void }

/** A still image stays a still image: only an explicit action opens the viewer. */
export default function ProjectMedia({ title, image, gallery = [], onOpenChange, viewerRef }: { title: string; image: ProjectImage; gallery?: ProjectImage[]; onOpenChange?: (open: boolean) => void; viewerRef?: Ref<ProjectMediaHandle> }) {
  const images = [image, ...gallery]
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [actualSize, setActualSize] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const captionId = useId()
  const current = images[index]
  const multiple = images.length > 1

  useImperativeHandle(viewerRef, () => ({ openFrame(returnFocus) {
    returnFocusRef.current = returnFocus
    // The physical frame always shows the primary image, even if the notes
    // were last showing another image from the same project.
    setIndex(0); setActualSize(false); setOpen(true)
  } }), [])

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current!
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    onOpenChange?.(true)
    // The document underneath must not scroll on a phone or steal focus when
    // the dialog closes. The reading panel retains its own scroll position.
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      onOpenChange?.(false)
    }
  }, [open, onOpenChange])

  useEffect(() => {
    viewportRef.current?.scrollTo(0, 0)
    if (actualSize) viewportRef.current?.focus({ preventScroll: true })
  }, [index, actualSize])

  const select = (next: number) => {
    if (next < 0 || next >= images.length || next === index) return
    setIndex(next)
    setActualSize(false)
  }
  const close = () => {
    dialogRef.current?.close()
    setOpen(false)
    setActualSize(false)
    const origin = returnFocusRef.current
    ;(origin?.isConnected ? origin : expandRef.current)?.focus({ preventScroll: true })
  }

  return <figure className="case-image">
    <button ref={expandRef} className="case-image-expand" onClick={() => { returnFocusRef.current = expandRef.current; setOpen(true) }} aria-label={`Enlarge image: ${title}`} aria-haspopup="dialog">
      <img src={assetUrl(current.src)} alt={current.alt} width={current.width ?? 1920} height={current.height ?? 1080} loading="lazy" decoding="async" />
      <span className="case-image-action"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M3 13v4h4M17 13v4h-4M3 3l5 5M17 3l-5 5M3 17l5-5M17 17l-5-5" /></svg>Enlarge image</span>
    </button>
    {multiple && <div className="case-image-controls" role="group" aria-label="Project images" onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      // While choosing a picture, arrows belong to the pictures, not projects.
      event.preventDefault(); event.stopPropagation()
      const next = Math.max(0, Math.min(images.length - 1, index + (event.key === 'ArrowLeft' ? -1 : 1)))
      select(next)
      event.currentTarget.querySelectorAll('button')[next]?.focus({ preventScroll: true })
    }}>
      <div className="case-image-thumbnails">{images.map((item, imageIndex) => <button key={item.src}
        aria-label={`Show image ${imageIndex + 1}: ${item.alt}`} title={item.caption}
        aria-pressed={index === imageIndex} onClick={() => select(imageIndex)}>
        <img src={assetUrl(item.src)} alt="" width="64" height="42" loading="lazy" decoding="async" />
      </button>)}</div>
      <span aria-live="polite">Image {index + 1} of {images.length}</span>
    </div>}
    <figcaption>{current.caption}</figcaption>
    <dialog ref={dialogRef} className="project-image-dialog" aria-labelledby={titleId} aria-describedby={captionId}
      onCancel={event => { event.preventDefault(); close() }}
      onClick={event => { if (event.target === event.currentTarget) close() }}
      onKeyDown={event => {
        // Image navigation has priority over the hall's project shortcuts.
        event.stopPropagation()
        if (event.key === 'Tab') {
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]')
          const first = controls[0], last = controls[controls.length - 1]
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
          return
        }
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || actualSize) return
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          select(index + (event.key === 'ArrowLeft' ? -1 : 1))
        }
      }}>
      {open && <div className="image-viewer">
        <header className="image-viewer-header"><div><p>Project images</p><h2 id={titleId}>{title}</h2></div><button className="image-viewer-close" onClick={close} autoFocus aria-label="Close image viewer">Close <span aria-hidden="true">×</span></button></header>
        <div ref={viewportRef} className={`image-viewer-stage${actualSize ? ' is-actual-size' : ''}`} tabIndex={actualSize ? 0 : undefined} aria-label={actualSize ? 'Full-size image. Scroll to inspect.' : undefined}>
          <img src={assetUrl(current.src)} alt={current.alt} width={current.width ?? 1920} height={current.height ?? 1080} decoding="async" />
        </div>
        <footer className="image-viewer-footer">
          <div className="image-viewer-controls">{multiple && <><button aria-disabled={index === 0} onClick={() => select(index - 1)} aria-label="Previous image">←</button><span aria-live="polite">{index + 1} / {images.length}</span><button aria-disabled={index === images.length - 1} onClick={() => select(index + 1)} aria-label="Next image">→</button></>}<button className="image-viewer-size" aria-pressed={actualSize} onClick={() => setActualSize(value => !value)}>{actualSize ? 'Fit image' : 'Actual size'}</button></div>
          <p id={captionId}>{current.caption}</p>
          <p className="image-viewer-hint">{actualSize ? 'Scroll to inspect · Esc Close' : multiple ? '← → Browse images · Esc Close' : 'Esc Close'}</p>
        </footer>
      </div>}
    </dialog>
  </figure>
}
