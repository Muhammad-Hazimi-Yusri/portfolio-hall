/** Public build diary, 18 August 2023. These are build experiences, not CAD claims. */
export const droneBuildNotes = [
  {
    id: 'camera', label: 'Camera mount',
    title: 'A softer mount after the first repair',
    text: 'The O3 camera failed after the first flight. After its warranty repair, I printed Tim O’Brien’s TPU mount for the camera and GPS. The soft mounting reduced visible vibration in the footage.',
  },
  {
    id: 'wiring', label: 'Wiring',
    title: 'Making room inside the frame',
    text: 'Debris and untidy wiring made the frame harder to work with. I rerouted the wiring and printed a side cover. An early prop strike on an antenna was another lesson in component placement.',
  },
  {
    id: 'lights', label: 'Visibility',
    title: 'Leftover LEDs, useful at dusk',
    text: 'I reused LED strips left over from a monitor-lighting project. They made the drone easier to see, especially at dusk.',
  },
] as const

export type DroneBuildDetail = typeof droneBuildNotes[number]['id']
export const droneBuildSource = 'https://muhammad-hazimi-yusri.github.io/quartz-jimi/projects/fpv-drone/'

export function droneBuildDetail(value: string | undefined): DroneBuildDetail | null {
  return droneBuildNotes.find(note => note.id === value)?.id ?? null
}
