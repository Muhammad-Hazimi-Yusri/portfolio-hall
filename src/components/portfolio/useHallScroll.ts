import { useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { hallAnchorTop, hallScrollFrame, sectionDefocus } from './hallScroll'
import type { HallScrollFrame } from './hallScroll'

type Options = {
  enabled: boolean
  continuous: boolean
  mapVisible: boolean
  view: string
  section: string
  navigationKey: number
  fromScroll: boolean
  preservePagePosition?: boolean
  notesId?: string
  restoreNotes?: boolean
  panelRef: RefObject<HTMLDivElement>
  stageRef: RefObject<HTMLElement>
  onSectionChange: (section: string) => void
  navigationTarget?: string
  onLeaveProject?: () => void
}

export function useHallScroll(options: Options) {
  const frameRef = useRef<HallScrollFrame | null>(null)
  const [activeView, setActiveView] = useState(options.view)
  const optionsRef = useRef(options)
  optionsRef.current = options
  const previousEnabled = useRef(options.enabled)
  const previousView = useRef(options.view)
  const previousMapVisible = useRef(options.mapVisible)
  const previousNavigationKey = useRef(options.navigationKey)
  const navigateRef = useRef<(target: string, smooth: boolean) => void>(() => {})
  const preserveViewRef = useRef<() => void>(() => {})
  const refreshRef = useRef<() => void>(() => {})
  const revealRef = useRef<(element: HTMLElement) => void>(() => {})
  const notesBookmarks = useRef(new Map<string, { offset: number; link?: { href: string; stage: boolean } }>())
  const restoreNotesRef = useRef<() => void>(() => {})

  useLayoutEffect(() => {
    const panel = options.panelRef.current, stage = options.stageRef.current
    if (!panel || !stage) return
    const mobile = window.matchMedia('(max-width: 760px)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)')
    let frame = 0
    let pendingTarget: { top: number; started: number; view?: string } | null = null
    let revealedElement: HTMLElement | null = null
    let lastSection: string | null = null
    let activeElement: HTMLElement | null = null
    let layoutDirty = true
    let layout: { element: HTMLElement; top: number; view: string; section: string; wholeSection: boolean }[] = []
    let height = 0, max = 0
    const profile = import.meta.env.DEV && new URLSearchParams(window.location.search).has('profile')
    let layoutReads = 0, scrollUpdates = 0
    const scrollRoot = () => mobile.matches ? window : panel
    const position = () => mobile.matches ? window.scrollY : panel.scrollTop
    const viewportHeight = () => mobile.matches ? window.innerHeight - (optionsRef.current.enabled ? stage.clientHeight : 0) : panel.clientHeight
    const origin = () => mobile.matches ? optionsRef.current.enabled ? stage.clientHeight : 0 : panel.getBoundingClientRect().top
    const maximum = () => mobile.matches ? document.documentElement.scrollHeight - innerHeight : panel.scrollHeight - panel.clientHeight
    const measure = () => {
      if (!layoutDirty) return
      layoutDirty = false
      if (profile) panel.dataset.hallLayoutReads = String(++layoutReads)
      const scrollTop = position(), start = origin()
      height = viewportHeight(); max = Math.max(0, maximum())
      layout = [...panel.querySelectorAll<HTMLElement>('[data-hall-view]')].map(element => ({
        element, top: scrollTop + element.getBoundingClientRect().top - start,
        view: element.dataset.hallView!, section: element.dataset.hallSection ?? optionsRef.current.section,
        wholeSection: element.matches('.hall-tour > section'),
      }))
    }

    const rememberNotes = (event?: Event) => {
      const id = optionsRef.current.notesId
      if (!id) return
      // Reuse measured document positions. Ordinary scroll events add no
      // bounding-box reads; offsets are relative to the notes, not the stage.
      const top = layout.find(item => item.view === id)?.top
      if (top === undefined) return
      const previous = notesBookmarks.current.get(id)
      const target = event?.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      const href = target?.getAttribute('href')
      const link = href?.startsWith('#app/') || href?.startsWith('#world/')
        ? { href, stage: stage.contains(target) } : previous?.link
      notesBookmarks.current.set(id, { offset: position() - top, link })
    }
    restoreNotesRef.current = () => {
      revealedElement = null
      const id = optionsRef.current.notesId
      const bookmark = id ? notesBookmarks.current.get(id) : undefined
      layoutDirty = true; measure()
      const item = layout.find(item => item.view === id)
      const top = bookmark && item ? Math.max(0, Math.min(max, bookmark.offset + item.top)) : 0
      pendingTarget = { top, started: performance.now() }
      scrollRoot().scrollTo({ top, behavior: 'instant' })
      const origin = bookmark?.link
      const link = origin ? [...(origin.stage ? stage : panel).querySelectorAll<HTMLAnchorElement>('a[href]')].find(element => element.getAttribute('href') === origin.href) : undefined
      ;(link ?? panel.querySelector<HTMLElement>('h1'))?.focus({ preventScroll: true })
      schedule()
    }

    const update = () => {
      frame = 0
      if (profile) panel.dataset.hallScrollUpdates = String(++scrollUpdates)
      const settings = optionsRef.current
      measure()
      const scrollTop = position()
      // Geometry is cached until content/viewport size changes. Scrolling only
      // reads its offset, so filter/style writes cannot force a layout each frame.
      const anchors = layout.map(({ view, section, top }) => ({
        view, section, top: hallAnchorTop(top, height, max),
      })).sort((a, b) => a.top - b.top)
      const current = hallScrollFrame(anchors, scrollTop, max)
      if (!current) return
      frameRef.current = settings.enabled ? current : null
      setActiveView(current.view)
      const nextElement = settings.enabled ? layout.find(item => item.view === current.view)?.element ?? null : null
      // The next complete section (heading, text, images and links) is frosted.
      // No fixed edge overlays or nested per-card blur layers.
      const soften = settings.enabled && settings.continuous && !reducedMotion.matches && !reducedTransparency.matches
      layout.filter(item => item.wholeSection).forEach(({ element, top: contentTop }) => {
        const top = contentTop - scrollTop
        const amount = soften ? sectionDefocus(top, height) : 0
        const opacity = amount ? (1 - amount * .24).toFixed(2) : ''
        if (element.style.opacity !== opacity) element.style.opacity = opacity
        // Keep the blur radius stable while scrolling so the browser can reuse
        // its filtered surface. Only opacity follows travel; focus clears once.
        const visibleBlur = amount > .08 && top < height * 1.2
        if (visibleBlur !== element.hasAttribute('data-defocused')) element.toggleAttribute('data-defocused', visibleBlur)
      })
      if (activeElement !== nextElement) {
        activeElement?.removeAttribute('data-in-view')
        nextElement?.setAttribute('data-in-view', 'true')
        activeElement = nextElement
      }
      const travelFade = (settings.enabled ? Math.sin(current.mix * Math.PI) * 0.1 : 0).toFixed(3)
      if (stage.style.getPropertyValue('--travel-fade') !== travelFade) stage.style.setProperty('--travel-fade', travelFade)
      if (pendingTarget && (Math.abs(position() - pendingTarget.top) < 2 || performance.now() - pendingTarget.started > 2000)) pendingTarget = null
      if (settings.continuous && !pendingTarget && lastSection !== current.section) {
        lastSection = current.section
        settings.onSectionChange(current.section)
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const invalidate = () => { layoutDirty = true; schedule() }
    refreshRef.current = invalidate
    navigateRef.current = (target, smooth) => {
      revealedElement = null
      const settings = optionsRef.current
      layoutDirty = true; measure()
      const item = layout.find(item => item.element.dataset.hallStop === target) ?? layout.find(item => item.view === target)
      const top = target === '' ? 0 : item ? hallAnchorTop(item.top, height, max) : 0
      pendingTarget = { top, started: performance.now(), view: target }
      lastSection = settings.section
      scrollRoot().scrollTo({ top, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' })
      schedule()
    }
    const revealElement = (element: HTMLElement, focus = true) => {
      // A direct guestbook action takes over an in-flight section scroll. The
      // phone's sticky hall and the desktop reading pane have different origins.
      const top = Math.max(0, Math.min(maximum(), position() + element.getBoundingClientRect().top - origin() - 24))
      revealedElement = element
      pendingTarget = { top, started: performance.now() }
      lastSection = optionsRef.current.section
      scrollRoot().scrollTo({ top, behavior: 'instant' })
      if (focus) element.focus({ preventScroll: true })
      schedule()
    }
    revealRef.current = element => revealElement(element)
    const cancelNavigation = (event?: Event) => {
      pendingTarget = null
      // A requested chart, boat list or form remains the reading destination
      // through a layout change, until the visitor deliberately scrolls away.
      if (event?.type !== 'touchstart' || !(event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]'))) revealedElement = null
    }
    const scroll = () => { rememberNotes(); schedule() }
    const wheel = (event: WheelEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-hall-scroll="native"]')) return
      cancelNavigation()
      if (mobile.matches || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      if (optionsRef.current.onLeaveProject && event.deltaY) {
        event.preventDefault()
        optionsRef.current.onLeaveProject()
        return
      }
      if (!optionsRef.current.enabled) return
      if (panel.scrollHeight <= panel.clientHeight) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? panel.clientHeight : 1
      panel.scrollBy({ top: event.deltaY * unit, behavior: 'instant' })
    }
    const key = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"]')) return
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) cancelNavigation()
    }
    panel.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    panel.addEventListener('focusin', rememberNotes)
    stage.addEventListener('focusin', rememberNotes)
    panel.addEventListener('wheel', cancelNavigation, { passive: true })
    stage.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('touchstart', cancelNavigation, { passive: true })
    window.addEventListener('keydown', key)
    window.addEventListener('resize', invalidate)
    reducedMotion.addEventListener('change', schedule)
    reducedTransparency.addEventListener('change', schedule)
    const resize = new ResizeObserver(invalidate)
    const observeContent = () => {
      resize.disconnect(); resize.observe(panel); resize.observe(stage)
      if (panel.firstElementChild) resize.observe(panel.firstElementChild)
      invalidate()
    }
    const content = new MutationObserver(observeContent)
    content.observe(panel, { childList: true, subtree: true })
    observeContent()
    // During a return/section scroll, preserve its destination rather than
    // whichever exhibit the camera is passing when the scroll root changes.
    const preserveView = () => {
      if (revealedElement?.isConnected) { revealElement(revealedElement, false); return }
      navigateRef.current(pendingTarget?.view ?? frameRef.current?.view ?? optionsRef.current.navigationTarget ?? optionsRef.current.section, false)
    }
    preserveViewRef.current = preserveView
    mobile.addEventListener('change', preserveView)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      content.disconnect()
      mobile.removeEventListener('change', preserveView)
      reducedMotion.removeEventListener('change', schedule)
      reducedTransparency.removeEventListener('change', schedule)
      activeElement?.removeAttribute('data-in-view')
      panel.removeEventListener('scroll', scroll)
      window.removeEventListener('scroll', scroll)
      panel.removeEventListener('focusin', rememberNotes)
      stage.removeEventListener('focusin', rememberNotes)
      panel.removeEventListener('wheel', cancelNavigation)
      stage.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', cancelNavigation)
      window.removeEventListener('keydown', key)
      window.removeEventListener('resize', invalidate)
    }
  }, [options.panelRef, options.stageRef])

  useLayoutEffect(() => {
    const toggled = previousEnabled.current !== options.enabled
    const target = options.navigationTarget ?? (toggled ? activeView : options.continuous ? options.section : options.view)
    const changedPage = previousView.current !== options.view
    if (toggled || !options.fromScroll) {
      frameRef.current = null
      // On phones the station selector and notes share the document scroller.
      // Keep the controls under the visitor's finger when changing stations.
      // Desktop notes still restart in their independent reading panel.
      if (options.restoreNotes && options.notesId && previousNavigationKey.current !== options.navigationKey) {
        restoreNotesRef.current()
      } else if (!options.preservePagePosition || !window.matchMedia('(max-width: 760px)').matches) {
        if (options.notesId) notesBookmarks.current.delete(options.notesId)
        navigateRef.current(target, !toggled && changedPage && options.continuous)
      }
    }
    previousEnabled.current = options.enabled
    previousView.current = options.view
    previousNavigationKey.current = options.navigationKey
    refreshRef.current()
    // activeView follows scrolling; only navigation or mode changes should seek.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.enabled, options.continuous, options.view, options.section, options.navigationTarget, options.navigationKey, options.fromScroll, options.preservePagePosition, options.notesId, options.restoreNotes])

  useLayoutEffect(() => {
    const changed = previousMapVisible.current !== options.mapVisible
    previousMapVisible.current = options.mapVisible
    // The phone map is taller than the scene. Re-anchor after its layout has
    // changed, keeping an in-flight destination instead of a passing exhibit.
    // Project notes and island controls keep their ordinary reading position.
    if (changed && options.enabled && options.continuous) preserveViewRef.current()
  }, [options.mapVisible, options.enabled, options.continuous])

  return { frameRef, activeView, revealRef }
}
