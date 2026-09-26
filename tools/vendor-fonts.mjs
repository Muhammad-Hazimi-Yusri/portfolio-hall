// Authoring-only: preserve the official webfont files, with local CSS URLs.
// Cache the Google Fonts CSS and licences as described in public/fonts/README.md.
import fs from 'node:fs/promises'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = await fs.readFile(path.join(root, '_local/font-source/current.css'), 'utf8')
await fs.mkdir(path.join(root, 'public/fonts'), { recursive: true })
const faces = [], manifest = []
for (const [, subset, block] of source.matchAll(/\/\* ([a-z-]+) \*\/\s*(@font-face\s*\{[\s\S]*?\})/g)) {
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1]
  const style = block.match(/font-style:\s*(\w+)/)?.[1]
  const url = block.match(/url\(([^)]+)\)/)?.[1]
  if (!['Inter', 'Newsreader', 'Space Grotesk'].includes(family) || !['normal', 'italic'].includes(style)) throw new Error('Unexpected font face')
  if (!url || new URL(url).hostname !== 'fonts.gstatic.com' || !url.startsWith('https://') || !url.endsWith('.woff2')) throw new Error('Unexpected font source')
  const filename = `${family.toLowerCase().replaceAll(' ', '-')}-${style}-${subset}.woff2`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Font download failed: ${response.status} ${url}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Expected an original WOFF2 font')
  await fs.writeFile(path.join(root, 'public/fonts', filename), bytes)
  faces.push(`/* ${family}, ${subset} */\n${block.replace(url, `/fonts/${filename}`)}`)
  manifest.push({ file: filename, url, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') })
}
if (faces.length < 3) throw new Error('No usable font faces in cached stylesheet')
await fs.writeFile(path.join(root, 'src/fonts.css'), `/* Self-hosted original webfonts. Sources and OFL licences: public/fonts/. */\n${faces.join('\n')}\n`)
await fs.writeFile(path.join(root, 'public/fonts/sources.json'), JSON.stringify(manifest, null, 2) + '\n')
console.log(JSON.stringify(manifest.map(({ file, bytes }) => ({ file, bytes })), null, 2))
