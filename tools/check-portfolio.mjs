import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const source = fs.readFileSync(path.join(root, 'src/data/portfolio.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { projects, professionalWork } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const entries = [...professionalWork, ...projects]
const ids = new Set(entries.map(project => project.id))
assert.equal(ids.size, entries.length, 'Project IDs must be unique so links open the right project')
const routes = new Set(['#', '#main', '#work', '#projects', '#about', '#contact', '#cv', '#explore', ...entries.map(project => `#project/${project.id}`)])
for (const project of entries) {
  assert.match(project.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid project slug: ${project.id}`)
  for (const field of ['title', 'summary', 'role', 'status', 'problem', 'currentState']) {
    assert.ok(project[field]?.trim(), `${project.id} needs ${field}`)
  }
  assert.ok(project.contribution.length, `${project.id} needs a contribution description`)
  for (const link of project.links) {
    assert.ok(link.label?.trim(), `${project.id} has an unnamed link`)
    if (link.url.startsWith('#')) assert.ok(routes.has(link.url), `Unknown internal route: ${link.url}`)
    else assert.equal(new URL(link.url).protocol, 'https:', `Use a public HTTPS project URL: ${link.url}`)
  }
  if (project.image) {
    const imagePath = path.resolve(root, 'public', project.image.src)
    assert.ok(imagePath.startsWith(path.join(root, 'public') + path.sep), 'Images must be local public assets')
    assert.ok(fs.existsSync(imagePath), `Missing project image: ${project.image.src}`)
    assert.ok(project.image.alt?.trim(), `Missing alternative text: ${project.id}`)
    assert.ok(project.image.caption?.trim(), `Missing image context: ${project.id}`)
  }
}

if (process.argv.includes('--build')) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'dist/.vite/manifest.json'), 'utf8'))
  const visited = new Set()
  const visit = key => {
    if (visited.has(key)) return
    visited.add(key)
    for (const child of manifest[key].imports ?? []) visit(child)
  }
  visit('index.html')
  const files = [...visited].map(key => manifest[key].file)
  const bytes = files.reduce((sum, file) => sum + fs.statSync(path.join(root, 'dist', file)).size, 0)
  assert.ok(bytes < 250_000, `The portfolio's initial JS grew to ${bytes} bytes; check for eager 3D imports`)
  assert.ok(!files.some(file => /Babylon|HallExperience|HallScene|pois-/i.test(file)), 'Readable content must not wait for the 3D bundle')
  for (const image of entries.flatMap(project => project.image ? [project.image] : [])) {
    assert.ok(fs.existsSync(path.join(root, 'dist', image.src)), `Image missing from build: ${image.src}`)
  }
  console.log(`PASS: initial JavaScript ${bytes} bytes; 3D loads separately; project images packaged`)
}
console.log(`PASS: ${entries.length} project entries, routes, public links and local image references`)
