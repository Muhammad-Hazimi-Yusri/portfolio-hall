import { avvrClasses } from '../data/avvrArchive'

/** Repaint only on selection. Unselected geometry stays opaque and in place so
 * a prediction can be read against the rest of the archived room. */
export function paintAvvrClasses(classes: Uint8Array, colors: Float32Array, selected = -1) {
  const contextColor = [.24, .29, .31]
  for (let i = 0; i < classes.length; i++) {
    const offset = i * 4
    const color = selected < 0 || classes[i] === selected ? avvrClasses[classes[i]].color : contextColor
    colors[offset] = color[0]; colors[offset + 1] = color[1]; colors[offset + 2] = color[2]; colors[offset + 3] = 1
  }
  return colors
}

/** A compact export of an archived AVVR mesh; geometry remains on its source
 * millimetre grid. The normal and class seams in the OBJ remain independent. */
export function decodeAvvrMesh(buffer: ArrayBuffer) {
  const view = new DataView(buffer)
  if (buffer.byteLength < 32 || view.getUint32(0) !== 0x41565652 || view.getUint32(4, true) !== 1) throw new Error('Invalid AVVR mesh header')
  const vertices = view.getUint32(8, true), count = view.getUint32(12, true)
  const normalCount = view.getUint32(16, true), classCount = view.getUint32(20, true), indexBytes = view.getUint32(24, true)
  const step = view.getFloat32(28, true), vertexStart = 32 + normalCount * 12, indexStart = vertexStart + vertices * 8
  if (!vertices || !count || count % 3 || !normalCount || !classCount || classCount > 255 || normalCount > 255 || ![2, 4].includes(indexBytes) || step <= 0 || !Number.isFinite(step) || indexStart + count * indexBytes !== buffer.byteLength) throw new Error('Invalid AVVR mesh layout')
  const positions = new Float32Array(vertices * 3), normals = new Float32Array(vertices * 3), classes = new Uint8Array(vertices)
  const indices = indexBytes === 2 ? new Uint16Array(count) : new Uint32Array(count)
  for (let i = 0; i < vertices; i++) {
    const offset = vertexStart + i * 8, normal = view.getUint8(offset + 6), label = view.getUint8(offset + 7)
    if (normal >= normalCount || label >= classCount) throw new Error('Invalid AVVR mesh vertex')
    for (let axis = 0; axis < 3; axis++) {
      positions[i * 3 + axis] = view.getInt16(offset + axis * 2, true) * step
      normals[i * 3 + axis] = view.getFloat32(32 + normal * 12 + axis * 4, true)
      if (!Number.isFinite(normals[i * 3 + axis])) throw new Error('Invalid AVVR mesh normal')
    }
    classes[i] = label
  }
  for (let i = 0; i < count; i += 3) {
    for (let corner = 0; corner < 3; corner++) {
      const source = i + (corner ? 3 - corner : 0)
      const index = indexBytes === 2 ? view.getUint16(indexStart + source * 2, true) : view.getUint32(indexStart + source * 4, true)
      if (index >= vertices) throw new Error('Invalid AVVR mesh index')
      // OBJ uses the opposite winding from the hall's left-handed scene.
      indices[i + corner] = index
    }
  }
  return { positions, normals, classes, indices, classCount }
}
