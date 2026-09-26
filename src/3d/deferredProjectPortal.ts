import type { createProjectPortal } from './projectPortal'

type ProjectPortal = ReturnType<typeof createProjectPortal>

/** Keep the original frame artwork until its island is near enough to preview. */
export function deferProjectPortal(create: () => ProjectPortal, approaching: () => boolean): ProjectPortal {
  let portal: ProjectPortal | undefined
  let project: string | undefined
  let source = 0
  let presentation = ''
  const prepare = () => {
    if (!portal) {
      portal = create()
      if (project) portal.setProject(project)
      portal.setSource(source)
      if (presentation) portal.setPresentation(presentation)
    }
    return portal
  }
  return {
    get phase() { return portal?.phase ?? 'hall' },
    get source() { return prepare().source },
    get listeningCamera() { return prepare().listeningCamera },
    preview(now, force = false) {
      if (portal || approaching()) prepare().preview(now, force)
    },
    setProject(id) { project = id; portal?.setProject(id) },
    setSource(index) { source = index; portal?.setSource(index) },
    setPresentation(mode) { presentation = mode; portal?.setPresentation(mode) },
    resize() { portal?.resize() },
    resetView() { prepare().resetView() },
    rotate(amount) { prepare().rotate(amount) },
    update: (...args) => args[0] ? prepare().update(...args) : portal?.update(...args) ?? false,
    dispose() { portal?.dispose() },
  }
}
