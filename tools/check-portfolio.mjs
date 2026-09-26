import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const asset of ['listening-reconstruction.bin', 'listening-reconstruction.json', 'listening-reference.png']) {
  for (const folder of process.argv.includes('--build') ? ['public', 'dist'] : ['public']) {
    assert.ok(!fs.existsSync(path.join(root, folder, 'models/avvr', asset)), `Restricted S3A source data must remain in _local/avvr-archive: ${asset}`)
  }
}
const source = fs.readFileSync(path.join(root, 'src/data/portfolio.ts'), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
const { projects, professionalWork, experience } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const entries = [...professionalWork, ...projects]
const ids = new Set(entries.map(project => project.id))
assert.equal(ids.size, entries.length, 'Project IDs must be unique so links open the right project')
const routes = new Set(['#', '#main', '#work', '#projects', '#about', '#contact', '#cv', '#explore', ...entries.map(project => `#project/${project.id}`), ...experience.map(item => `#experience/${item.id}`)])
assert.equal(new Set(experience.map(item => item.id)).size, experience.length, 'Experience links must resolve to distinct displays')
for (const item of experience) {
  assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.ok(item.logo.width > 0 && item.logo.width <= 3, `Logo must fit its pedestal: ${item.id}`)
  assert.match(item.logo.background, /^#[0-9a-f]{6}$/i)
  if (item.logo.ink) assert.match(item.logo.ink, /^#[0-9a-f]{6}$/i)
  assert.ok(['left-right', 'right-left', 'bob'].includes(item.logo.motion), `Unknown logo motion: ${item.id}`)
  assert.ok(fs.existsSync(path.join(root, 'public', item.logo.src)), `Missing organisation logo: ${item.id}`)
}
for (const project of entries) {
  assert.match(project.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid project slug: ${project.id}`)
  for (const field of ['title', 'summary', 'role', 'status', 'problem', 'currentState']) {
    assert.ok(project[field]?.trim(), `${project.id} needs ${field}`)
  }
  assert.ok(project.contribution.length, `${project.id} needs a contribution description`)
  if (project.liveApp) {
    const destination = new URL(project.liveApp.url)
    assert.equal(destination.protocol, 'https:', 'Live exhibits must use public HTTPS apps')
    assert.ok(project.links.some(link => link.url === project.liveApp.url), 'Live exhibits need an equivalent direct link')
    assert.ok(!professionalWork.includes(project), 'Never embed a private company tool')
    assert.ok(!['github.com', 'www.github.com'].includes(destination.hostname), 'A repository is not a live app')
  }
  if (project.video) {
    assert.match(project.video.youtubeId, /^[\w-]{11}$/, `Invalid recorded-video ID: ${project.id}`)
    assert.ok(project.video.title.trim() && project.video.caption.trim() && project.video.label.trim(), `Recorded videos need context: ${project.id}`)
    assert.ok(project.links.some(link => link.url === `https://youtu.be/${project.video.youtubeId}`), `The recorded exhibit must match an existing public source link: ${project.id}`)
    assert.ok(!professionalWork.includes(project), 'Never embed private company footage')
  }
  for (const link of project.links) {
    assert.ok(link.label?.trim(), `${project.id} has an unnamed link`)
    if (link.url.startsWith('#')) assert.ok(routes.has(link.url), `Unknown internal route: ${link.url}`)
    else assert.equal(new URL(link.url).protocol, 'https:', `Use a public HTTPS project URL: ${link.url}`)
  }
  assert.ok(!project.gallery?.length || project.image, `Image galleries need a primary image: ${project.id}`)
  for (const image of [project.image, ...project.gallery ?? []].filter(Boolean)) {
    const imagePath = path.resolve(root, 'public', image.src)
    assert.ok(imagePath.startsWith(path.join(root, 'public') + path.sep), 'Images must be local public assets')
    assert.ok(fs.existsSync(imagePath), `Missing project image: ${image.src}`)
    assert.ok(image.alt?.trim(), `Missing alternative text: ${project.id}`)
    assert.ok(image.caption?.trim(), `Missing image context: ${project.id}`)
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
  for (const image of [...entries.flatMap(project => [project.image, ...project.gallery ?? []].filter(Boolean)), ...experience.map(item => item.logo)]) {
    assert.ok(fs.existsSync(path.join(root, 'dist', image.src)), `Image missing from build: ${image.src}`)
  }
  console.log(`PASS: initial JavaScript ${bytes} bytes; 3D loads separately; project images packaged`)
}
console.log(`PASS: ${entries.length} project entries, routes, public links and local image references`)
