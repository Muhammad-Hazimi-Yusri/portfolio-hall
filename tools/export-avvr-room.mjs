import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

// Convert an archived EdgeNet OBJ to an indexed, millimetre-precision mesh.
// No geometry is simplified or synthesised. Normal/material seams are kept.
const [source, destination] = process.argv.slice(2)
if (!source || !destination) throw new Error('Usage: node tools/export-avvr-room.mjs source.obj destination.bin')
const obj = await fs.readFile(source, 'utf8')
const materialFile = /^mtllib (.+)$/m.exec(obj)?.[1].trim()
if (!materialFile) throw new Error('The source has no material library')
const mtl = await fs.readFile(path.join(path.dirname(source), materialFile), 'utf8')
const materialNames = new Map(), materials = []
let currentMaterial
for (const line of mtl.split(/\r?\n/)) {
  if (line.startsWith('newmtl ')) currentMaterial = line.slice(7).trim()
  if (line.startsWith('Kd ')) {
    const name = currentMaterial.replace(/ \d+$/, '')
    let index = materials.findIndex(material => material.name === name)
    if (index < 0) { index = materials.length; materials.push({ name, color: line.trim().split(/\s+/).slice(1).map(Number) }) }
    materialNames.set(currentMaterial, index)
  }
}
const positions = [], normals = [], vertices = [], indices = [], vertexMap = new Map()
let material = 0, faceCount = 0
const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity]
for (const line of obj.split(/\r?\n/)) {
  if (line.startsWith('v ')) {
    const point = line.trim().split(/\s+/).slice(1, 4).map(Number)
    if (!point.every(Number.isFinite)) throw new Error('Non-finite position')
    positions.push(point)
  } else if (line.startsWith('vn ')) normals.push(line.trim().split(/\s+/).slice(1, 4).map(Number))
  else if (line.startsWith('usemtl ')) {
    material = materialNames.get(line.slice(7).trim())
    if (material === undefined) throw new Error(`Missing material: ${line}`)
  } else if (line.startsWith('f ')) {
    faceCount++
    const face = line.trim().split(/\s+/).slice(1).map(value => {
      const [positionIndex, , normalIndex] = value.split('/').map(Number)
      if (positionIndex <= 0 || !normals[normalIndex - 1]) throw new Error('Only positive, normal-indexed faces are supported')
      const key = `${positionIndex}/${normalIndex}/${material}`
      let index = vertexMap.get(key)
      if (index === undefined) {
        index = vertices.length; vertexMap.set(key, index)
        const point = positions[positionIndex - 1]
        const quantised = point.map((coordinate, axis) => {
          min[axis] = Math.min(min[axis], coordinate); max[axis] = Math.max(max[axis], coordinate)
          const value = Math.round(coordinate * 1000)
          if (Math.abs(value) > 32767 || Math.abs(value / 1000 - coordinate) > .00001) throw new Error('Source exceeds the lossless millimetre grid')
          return value
        })
        vertices.push({ position: quantised, normal: normalIndex - 1, material })
      }
      return index
    })
    for (let corner = 1; corner < face.length - 1; corner++) indices.push(face[0], face[corner], face[corner + 1])
  }
}
if (normals.length > 255 || materials.length > 255) throw new Error('Too many normal/material entries')
const indexBytes = vertices.length > 65535 ? 4 : 2
const vertexStart = 32 + normals.length * 12, indexStart = vertexStart + vertices.length * 8
const buffer = Buffer.alloc(indexStart + indices.length * indexBytes)
buffer.write('AVVR'); buffer.writeUInt32LE(1, 4); buffer.writeUInt32LE(vertices.length, 8)
buffer.writeUInt32LE(indices.length, 12); buffer.writeUInt32LE(normals.length, 16)
buffer.writeUInt32LE(materials.length, 20); buffer.writeUInt32LE(indexBytes, 24); buffer.writeFloatLE(.001, 28)
normals.forEach((normal, index) => normal.forEach((value, axis) => buffer.writeFloatLE(value, 32 + index * 12 + axis * 4)))
vertices.forEach((vertex, index) => {
  const offset = vertexStart + index * 8
  vertex.position.forEach((value, axis) => buffer.writeInt16LE(value, offset + axis * 2))
  buffer.writeUInt8(vertex.normal, offset + 6); buffer.writeUInt8(vertex.material, offset + 7)
})
indices.forEach((value, index) => indexBytes === 2 ? buffer.writeUInt16LE(value, indexStart + index * 2) : buffer.writeUInt32LE(value, indexStart + index * 4))
const metadata = {
  sourceFile: path.basename(source), sourceSHA256: crypto.createHash('sha256').update(obj).digest('hex'),
  materials, bounds: { min, max }, sourceVertices: positions.length, sourceFaces: faceCount,
  vertices: vertices.length, triangles: indices.length / 3, bytes: buffer.length,
  sha256: crypto.createHash('sha256').update(buffer).digest('hex'),
}
await fs.mkdir(path.dirname(destination), { recursive: true })
await fs.writeFile(destination, buffer)
await fs.writeFile(destination.replace(/\.bin$/, '.json'), JSON.stringify(metadata, null, 2) + '\n')
console.log(JSON.stringify(metadata, null, 2))
