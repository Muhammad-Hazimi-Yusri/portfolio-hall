import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const { outputFiles } = await build({
  stdin: { contents: "export * from './src/components/portfolio/hallNavigation.ts'; export * from './src/3d/exhibitViewing.ts'; export { getApproachPosition } from './src/3d/flyTo.ts'; export { pois } from './src/data/pois.ts'; export { hallDecks, hallPlantings } from './src/data/hallLayout.ts'; export { professionalWork, projects } from './src/data/portfolio.ts';", resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
  bundle: true, write: false, platform: 'node', format: 'esm', define: { 'import.meta.env.BASE_URL': "'/'" },
})
const { createWalkEntry, returnFromWalk, projectNeighbours, exhibitAction, getApproachPosition, galleryViewingDistance, inspectionTarget, pois, hallDecks, hallPlantings, professionalWork, projects } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`)
const safe = point => hallDecks.some(deck => deck.round
  ? Math.hypot(point.x - deck.x, point.z - deck.z) <= deck.width / 2 - .79
  : Math.abs(point.x - deck.x) <= deck.width / 2 - .79 && Math.abs(point.z - deck.z) <= deck.depth / 2 - .79)

for (const view of ['', 'work', 'projects', 'about', 'contact', 'visitor-landscape', 'experience/tnei', 'experience/audioscenic', 'experience/southampton-research', ...[...professionalWork, ...projects].map(project => project.id)]) {
  const entry = createWalkEntry(view, `#${view}`)
  assert.ok(safe(entry.position), `${view} must spawn on a body-width floor surface`)
  assert.equal(entry.position.y, 1.6, 'Walking begins at eye level')
  assert.ok(Math.hypot(entry.target.x - entry.position.x, entry.target.z - entry.position.z) > .1)
}
const pose = { position: { x: 1.1, y: 2.2, z: 33.7 }, target: { x: -4.5, y: 1.8, z: 35 } }
const entry = createWalkEntry('rubyvr-studio', '#project/rubyvr-studio', pose)
assert.equal(entry.position.x, pose.position.x, 'A camera already over the gallery stays in place')
assert.equal(entry.position.z, pose.position.z)
assert.deepEqual(entry.target, pose.target, 'Keep looking at the current exhibit')
assert.equal(returnFromWalk(entry, entry), '#project/rubyvr-studio', 'An immediate return restores the focused notes')
const landscapeEntry = createWalkEntry('visitor-landscape', '#guestbook/analytics', pose)
assert.equal(returnFromWalk(landscapeEntry, landscapeEntry), '#guestbook/analytics', 'Walking from the visitor landscape must retain its valid return route')
assert.ok(createWalkEntry('visitor-landscape', '#guestbook/analytics').position.z > 78, 'The visitor map without a 3D camera starts walking at its contact location')
assert.equal(returnFromWalk(entry, { ...pose, position: { x: 0, y: 1.6, z: 1 } }), '#', 'Walking to the entrance returns there')
assert.equal(returnFromWalk(entry, { ...pose, position: { x: 0, y: 1.6, z: 84 } }), '#contact', 'Walking to the end opens Contact')
assert.equal(returnFromWalk(entry, { ...pose, position: { x: -2.75, y: 1.6, z: 64 } }), '#experience/tnei')
assert.equal(returnFromWalk(entry, { ...pose, position: { x: 0, y: 1.6, z: 10 } }), '#gallery/reporting-workbench')
for (const position of [{ x: 13, y: 8, z: -10 }, { x: 12, y: 7, z: 69 }, { x: 0, y: 5, z: 95 }]) {
  assert.ok(safe(createWalkEntry('', '#', { ...pose, position }).position), 'Aerial cameras land on the closest safe platform')
}
for (const plant of hallPlantings) for (const offset of [-.35, 0, .35]) {
  const landing = createWalkEntry('', '#', { ...pose, position: { x: plant.x + offset, y: 7, z: plant.z } }).position
  assert.ok(safe(landing), 'Avoiding a planter must not push a landing off the platform')
  for (const obstacle of hallPlantings) assert.ok(Math.hypot(landing.x - obstacle.x, landing.z - obstacle.z) >= .47 * obstacle.scale + .35, 'Aerial walk entries must clear the solid pot and the camera body')
}
assert.ok(safe(createWalkEntry('contact', '#contact', { ...pose, position: { x: NaN, y: Infinity, z: 0 } }).position), 'Invalid poses use the contextual fallback')
for (const group of [professionalWork, projects]) {
  assert.equal(projectNeighbours(group[0].id).previous, undefined, 'Left at the first exhibit does not wrap')
  assert.equal(projectNeighbours(group.at(-1).id).next, undefined, 'Right at the last exhibit does not wrap')
  for (let i = 0; i < group.length - 1; i++) {
    assert.equal(projectNeighbours(group[i].id).next.id, group[i + 1].id)
    assert.equal(projectNeighbours(group[i + 1].id).previous.id, group[i].id)
  }
}

const firstStation = projectNeighbours('petbot', 'hardware')
assert.equal(firstStation.count, 2, 'Workshop navigation counts only the exhibits in that space')
assert.equal(firstStation.index, 0)
assert.equal(firstStation.previous, undefined, 'Previous at PetBot must not leave the workshop for THE FINALS')
assert.equal(firstStation.next.id, 'fpv-drone')
const lastStation = projectNeighbours('fpv-drone', 'hardware')
assert.equal(lastStation.previous.id, 'petbot')
assert.equal(lastStation.next, undefined, 'Next at the drone must not leave the workshop for EEE Roadmap')
assert.equal(projectNeighbours('avvr', 'avvr').count, 1, 'The listening room has no adjacent station')
assert.equal(projectNeighbours('fpv-drone').next.id, 'eee-roadmap', 'The ordinary gallery retains its complete project sequence')

// Reproduce the cropped frame/plaque at the old 2.5 m jump distance. Test the
// resulting visible area, including room for the walking controls, not an
// expected copy of the distance formula. Bounds include the frame and plaque.
for (const [width, height] of [[1280, 720], [1379, 1278], [768, 1024], [390, 844], [320, 740]]) {
  const fov = height > width ? 1.15 : .95, aspect = width / height
  const distance = galleryViewingDistance(fov, aspect), tanHalf = Math.tan(fov / 2)
  assert.ok(1.5 / (distance * tanHalf * aspect) <= .841, 'Both sides of the frame must fit with a margin')
  assert.ok((2.935 - 1.6) / (distance * tanHalf) <= .84, 'The top of the frame must remain visible')
  const plaqueBottom = height * (.5 + (1.6 - .43) / (2 * distance * tanHalf))
  assert.ok(plaqueBottom < height - 124, 'The caption must sit above the walk hints and location strip')
  for (const poi of pois.filter(item => item.type === 'painting')) {
    const approach = getApproachPosition(poi, fov, aspect)
    assert.ok(safe(approach), 'A fitted viewing position must stay on the body-width deck')
    for (const plant of hallPlantings) assert.ok(Math.hypot(approach.x - plant.x, approach.z - plant.z) > .47 * plant.scale + .35, 'A fitted viewing position must clear the planting')
  }
  for (const poi of pois.filter(item => item.type === 'pedestal' && !item.experienceDisplay)) {
    const approach = getApproachPosition(poi, fov, aspect)
    const distance = Math.hypot(approach.x - poi.position.x, approach.z - poi.position.z)
    assert.ok(safe(approach), 'Sign approaches must remain on the arrival platform or contact path')
    assert.ok(1.114 / (distance * tanHalf * aspect) < 1, 'Both edges of the physical sign must fit on screen')
    const signBottom = height * (.5 + (1.6 - .445) / (2 * distance * tanHalf))
    assert.ok(signBottom < height - 124, 'The sign action must sit above the walking hints')
    assert.equal(inspectionTarget({ ...approach, y: 1.6 }, { x: poi.position.x - approach.x, y: 0, z: poi.position.z - approach.z }, [
      { value: poi.id, position: { ...poi.position, y: 1.37 }, reach: 4.5 },
    ]), poi.id, 'Inspect must still reach the sign from its fitted approach')
  }
  for (const poi of pois.filter(item => item.experienceDisplay)) {
    const approach = getApproachPosition(poi, fov, aspect)
    const distance = Math.hypot(approach.x - poi.position.x, approach.z - poi.position.z)
    assert.ok(safe(approach), 'Experience navigation must land on a body-width floor surface')
    assert.ok(approach.z < poi.position.z, 'Experience navigation must show the fixed front plaque, not the blank back of the plinth')
    assert.ok(poi.experienceDisplay.width / (2 * distance * tanHalf * aspect) < .85, 'The complete company mark must fit on narrow screens')
    const plaqueBottom = height * (.5 + (1.6 - .39375) / (2 * (distance - .412) * tanHalf))
    assert.ok(plaqueBottom < height - 124, 'The attached role plaque must clear walking hints')
    assert.equal(inspectionTarget({ ...approach, y: 1.6 }, { x: poi.position.x - approach.x, y: 0, z: poi.position.z - approach.z }, [
      { value: poi.id, position: { ...poi.position, y: 1.9 }, reach: 7.4 },
    ]), poi.id, 'Inspect must remain available from the fitted experience approach')
    assert.equal(returnFromWalk(entry, { position: { ...approach, y: 1.6 }, target: { ...poi.position, y: 1.9 } }), `#experience/${poi.id}`, 'Returning from a fitted approach must keep the experience in view, including from the bridge')
  }
  const contact = pois.find(poi => poi.id === 'contact')
  const boardApproach = getApproachPosition(contact, fov, aspect, true)
  const boardDistance = contact.position.z - boardApproach.z
  assert.ok(safe(boardApproach), 'The wider guestbook approach must remain on the contact path')
  assert.ok(1.9 / (boardDistance * tanHalf * aspect) <= .841, 'The whole note board must fit with a margin on phones')
  assert.ok((3.445 - 1.6) / (boardDistance * tanHalf) < .84, 'The guestbook heading must fit above eye height')
  assert.ok(height * (.5 + (1.6 - .75) / (2 * boardDistance * tanHalf)) < height - 184, 'The guestbook action must clear the touch controls')
  assert.equal(inspectionTarget({ ...boardApproach, y: 1.6 }, { x: 0, y: 0, z: 1 }, [
    { value: contact.id, position: { ...contact.position, y: 2.045 }, reach: 9.4 },
  ]), contact.id, 'Reading the guestbook must work from its fitted approach')
}

const targets = pois.filter(poi => poi.type === 'painting').map(poi => ({ value: poi.id, position: { ...poi.position, y: 1.92 }, reach: 7.4 }))
const ruby = targets.find(target => target.value === 'rubyvr-studio')
const observer = { x: -.7, y: 1.6, z: ruby.position.z }
const facing = (from, to) => ({ x: to.x - from.x, y: to.y - from.y, z: to.z - from.z })
assert.equal(inspectionTarget(observer, facing(observer, ruby.position), targets), 'rubyvr-studio', 'Inspect must work from the new viewing distance')
assert.equal(inspectionTarget(observer, { x: 1, y: 0, z: 0 }, targets), null, 'A frame behind the visitor must not offer Inspect')
const betweenFrames = { ...observer, z: observer.z + 3.1 }
assert.equal(inspectionTarget(betweenFrames, facing(betweenFrames, ruby.position), targets), 'rubyvr-studio', 'Looking at a frame must win over a closer frame to the side')
const distant = { ...observer, x: 4 }
assert.equal(inspectionTarget(distant, facing(distant, ruby.position), targets), null, 'Facing an exhibit does not allow inspection from any distance')
assert.equal(inspectionTarget(observer, { x: 0, y: 0, z: 0 }, targets), null)
const partlyTurned = { x: -Math.cos(.5), y: 0, z: Math.sin(.5) }
assert.equal(inspectionTarget(observer, partlyTurned, [ruby], { fov: .95, aspect: 1280 / 720 }), 'rubyvr-studio', 'An angled frame still inside the wide view remains inspectable')
assert.equal(inspectionTarget(observer, partlyTurned, [ruby], { fov: 1.15, aspect: 390 / 844 }), null, 'Portrait Inspect must not point to a frame that has moved offscreen')
assert.equal(inspectionTarget(observer, facing(observer, ruby.position), [ruby], { fov: 1.15, aspect: 390 / 844 }), 'rubyvr-studio', 'Looking back at that frame restores its phone Inspect action')

assert.equal(exhibitAction('#project/rubyvr-studio', null).kind, 'route', 'An unselected still frame first opens its project notes')
assert.equal(exhibitAction('#project/rubyvr-studio', 'rubyvr-studio').kind, 'image', 'Selecting that frame again must open its image, not the same route')
assert.equal(exhibitAction('#project/reporting-workbench', 'reporting-workbench').kind, 'image', 'The selected engineering frame opens its public workflow illustration')
assert.equal(exhibitAction('#project/rubyvr-studio', 'rubyvr-studio', 'Next: RubyVR Studio').kind, 'route', 'A navigation arrow must never become an image control')
const app = exhibitAction('#app/wattwhere', 'wattwhere')
assert.equal(app.kind, 'route'); assert.equal(app.route, '#app/wattwhere', 'App frames retain their browser destination')
const island = exhibitAction('#world/hardware/fpv-drone', 'fpv-drone')
assert.equal(island.kind, 'route'); assert.equal(island.route, '#world/hardware/fpv-drone', 'Portal surfaces retain the selected hardware station')
assert.equal(exhibitAction('#project/fpv-drone', null).kind, 'route', 'A return window from an island opens the project, not an image')
for (const id of ['petbot', 'fpv-drone']) {
  const film = exhibitAction(`#project/${id}`, null, undefined, 'video')
  assert.equal(film.kind, 'video', 'The workshop screen opens its recording without navigating out of the island')
  assert.equal(film.projectId, id, 'A recording must match the screen selected, even when the other hardware station is active')
}
assert.notEqual(exhibitAction('#project/reporting-workbench', null, undefined, 'video').kind, 'video', 'A project without public footage must not open a video player')
const arrival = pois.find(poi => poi.zone === 'arrival')
const arrivalRoute = arrival.content.links.find(link => link.url.startsWith('#')).url
assert.equal(arrivalRoute, '#work', 'The entrance sign must lead into the gallery instead of reselecting the entrance')
assert.equal(exhibitAction(arrivalRoute, null).title, 'Work', 'The sign hover must name its real destination')
assert.equal(exhibitAction('#contact', null).title, 'Contact')
console.log('PASS: contextual walking, fitted exhibits, inspection direction, navigation boundaries, and frame/image/app/portal actions')
