/** Only advertise worlds with a finished exhibit. Project notes remain the source of truth. */
export const projectWorlds = {
  avvr: {
    projects: ['avvr'],
    title: 'The listening room',
    description: 'Move the sound source and turn your view to hear how its position changes. Original AVVR project material is displayed in the room.',
    provenance: 'A spatial-audio illustration built for this portfolio, alongside an original screenshot of the university project. It does not reproduce the research dataset or its acoustic simulation.',
  },
  hardware: {
    projects: ['petbot', 'fpv-drone'],
    title: 'The hardware workshop',
    description: 'One workshop for physical projects. Open up PetBot at the bench, or inspect the FPV drone on the flight pad.',
    provenance: 'Illustrative models based on project photographs. PetBot was a team build; the drone is my personal assembly. Original photographs, project roles and footage are in the notes.',
  },
} as const

export type ProjectWorldId = keyof typeof projectWorlds
export function worldForProject(projectId: string): ProjectWorldId | null {
  return (Object.keys(projectWorlds) as ProjectWorldId[]).find(id => (projectWorlds[id].projects as readonly string[]).includes(projectId)) ?? null
}
export function isProjectWorld(id: string): id is ProjectWorldId {
  return Object.prototype.hasOwnProperty.call(projectWorlds, id)
}

export function worldFromHash(hash: string): ProjectWorldId | null {
  const [prefix, id, project, ...extra] = hash.split('/')
  if (prefix !== '#world' || !isProjectWorld(id) || extra.length) return null
  return project === undefined || (projectWorlds[id].projects as readonly string[]).includes(project) ? id : null
}

export function worldProjectFromHash(hash: string): string | null {
  const world = worldFromHash(hash)
  return world ? hash.split('/')[2] ?? projectWorlds[world].projects[0] : null
}

export const projectWorldRoute = (world: ProjectWorldId, project: string) => `#world/${world}/${project}`
