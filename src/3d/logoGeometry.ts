// A closed extrusion of the alpha mask: real front/back caps and walls around
// every outer edge and letter counter. Empty pixels create no geometry.
export function extrudeLogoMask(pixels: Uint8ClampedArray, columns: number, rows: number, width: number, height: number, depth: number) {
  const positions: number[] = [], indices: number[] = [], normals: number[] = [], uvs: number[] = [], colors: number[] = []
  const solid = (x: number, y: number) => x >= 0 && y >= 0 && x < columns && y < rows && pixels[(y * columns + x) * 4 + 3] >= 128
  const vertex = (x: number, y: number, z: number, normal: number[], u: number, v: number, shade = 1) => {
    positions.push((x / columns - 0.5) * width, (0.5 - y / rows) * height, z)
    normals.push(...normal); uvs.push(u, v); colors.push(shade, shade, shade, 1)
  }
  const cap = (start: number, end: number, y: number, back: boolean) => {
    const base = positions.length / 3, z = (back ? 1 : -1) * depth / 2
    const normal = [0, 0, back ? 1 : -1]
    for (const [x, row] of [[start, y + 1], [end, y + 1], [end, y], [start, y]]) {
      vertex(x, row, z, normal, x / columns, 1 - row / rows)
    }
    indices.push(...(back ? [base, base + 2, base + 1, base, base + 3, base + 2] : [base, base + 1, base + 2, base, base + 2, base + 3]))
  }
  const wall = (x1: number, y1: number, x2: number, y2: number, x: number, y: number, normal: number[]) => {
    const base = positions.length / 3
    const u = (x + 0.5) / columns, v = 1 - (y + 0.5) / rows
    vertex(x1, y1, -depth / 2, normal, u, v, 0.7)
    vertex(x2, y2, -depth / 2, normal, u, v, 0.7)
    vertex(x2, y2, depth / 2, normal, u, v, 0.7)
    vertex(x1, y1, depth / 2, normal, u, v, 0.7)
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  for (let y = 0; y < rows; y++) {
    // Merge cap pixels into horizontal runs instead of creating a box per pixel.
    let start = -1
    for (let x = 0; x <= columns; x++) {
      if (solid(x, y)) {
        if (start < 0) start = x
        if (!solid(x, y - 1)) wall(x, y, x + 1, y, x, y, [0, 1, 0])
        if (!solid(x + 1, y)) wall(x + 1, y, x + 1, y + 1, x, y, [1, 0, 0])
        if (!solid(x, y + 1)) wall(x + 1, y + 1, x, y + 1, x, y, [0, -1, 0])
        if (!solid(x - 1, y)) wall(x, y + 1, x, y, x, y, [-1, 0, 0])
      } else if (start >= 0) {
        cap(start, x, y, false); cap(start, x, y, true); start = -1
      }
    }
  }
  return { positions, indices, normals, uvs, colors }
}
