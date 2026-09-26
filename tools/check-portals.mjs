import assert from 'node:assert/strict'
import fs from 'node:fs'
import ts from 'typescript'

async function sourceModule(path) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } })
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
}
const { throughPortal, backThroughPortal, portalExitPose, portalFrustum, portalRefreshInterval, smoothStep } = await sourceModule('../src/3d/portalMath.ts')
const { worldFromHash, worldProjectFromHash, projectWorldRoute, worldForProject, projectWorlds } = await sourceModule('../src/data/projectWorlds.ts')
const { deferProjectPortal } = await sourceModule('../src/3d/deferredProjectPortal.ts')
const hall = { x: -4.44, y: 1.92, z: 26 }, world = { x: 160, y: 1.92, z: 0 }
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`)
for (const point of [hall, { x: 1, y: 2.4, z: 20 }, { x: -4.46, y: 1.92, z: 26 }]) {
  const mapped = throughPortal(point, hall, world)
  const roundtrip = backThroughPortal(mapped, hall, world)
  for (const axis of ['x', 'y', 'z']) close(roundtrip[axis], point[axis])
}
// Shared islands can have several translated doors, including a non-zero Z.
// A preview and the actual crossing must use the same independent transform.
const doors = [{ x: -161.25, y: 1.92, z: 1 }, { x: -155.8, y: 1.92, z: 1 }]
const viewer = { x: .75, y: 2.15, z: hall.z - 1.15 }
const previews = doors.map(door => throughPortal(viewer, hall, door))
assert.ok(previews[1].x - previews[0].x > 5, 'Each station must have its own window into the shared room')
doors.forEach((door, i) => {
  const restored = backThroughPortal(previews[i], hall, door)
  for (const axis of ['x', 'y', 'z']) close(restored[axis], viewer[axis])
  close(throughPortal(hall, hall, door).z, door.z)
})
// Crossing the hall's inward normal must emerge on the island's inhabited side.
assert.ok(throughPortal({ ...hall, x: hall.x + .1 }, hall, world).z < 0)
assert.ok(throughPortal({ ...hall, x: hall.x - .1 }, hall, world).z > 0)
close(throughPortal({ ...hall, z: hall.z + 1 }, hall, world).x, 161)
// Rays through all four corners must still land on those texture corners for
// offset viewers. A symmetric-camera shortcut would fail the off-axis cases.
for (const [right, up, distance] of [[0, 0, 4], [2.3, .28, 4.3], [-1.2, -.4, .04]]) {
  const m = portalFrustum(2.9, 1.94, right, up, distance)
  for (const x of [-1, 1]) for (const y of [-1, 1]) {
    const vx = x * 1.45 - right, vy = y * .97 - up
    close((vx * m[0] + distance * m[8]) / distance, x)
    close((vy * m[5] + distance * m[9]) / distance, y)
  }
}
assert.ok(portalFrustum(2.9, 1.94, 0, 0, 0).every(Number.isFinite))
for (const half of [false, true]) {
  const m = portalFrustum(2.9, 1.94, 0, 0, 4, .01, 250, half)
  close((.01 * m[10] + m[14]) / .01, half ? 0 : -1)
  close((250 * m[10] + m[14]) / 250, 1)
}
assert.equal(smoothStep(-1), 0); assert.equal(smoothStep(2), 1)
// A revised gallery camera must not cause a second correction after the island
// returns. Check complete poses, including the direction at the doorway.
for (const destination of [
  { position: { x: .75, y: 2.15, z: hall.z - 1.15 }, target: { x: -4.5, y: 1.8, z: hall.z } },
  { position: { x: 1.6, y: 2.6, z: hall.z + 1 }, target: { x: -4.5, y: 1.3, z: hall.z } },
]) {
  const doorway = portalExitPose(hall, destination, 0)
  assert.deepEqual(doorway.position, hall)
  assert.ok(doorway.target.x > hall.x, 'Crossing must begin facing out of the frame')
  close(doorway.target.y, hall.y); close(doorway.target.z, hall.z)
  const arrival = portalExitPose(hall, destination, 1)
  for (const point of ['position', 'target']) for (const axis of ['x', 'y', 'z']) close(arrival[point][axis], destination[point][axis])
  let previous = doorway.position
  for (let i = 1; i <= 100; i++) {
    const pose = portalExitPose(hall, destination, i / 100)
    assert.ok([...Object.values(pose.position), ...Object.values(pose.target)].every(Number.isFinite))
    assert.ok(pose.position.x >= previous.x - 1e-9 && pose.position.x <= destination.position.x + 1e-9, 'Return must move outwards without overshooting')
    assert.ok(Math.hypot(pose.target.x - pose.position.x, pose.target.y - pose.position.y, pose.target.z - pose.position.z) > 1, 'The viewing direction must remain defined through the turn')
    assert.ok(Math.hypot(pose.position.x - previous.x, pose.position.y - previous.y, pose.position.z - previous.z) < .1, 'Return positions must remain continuous')
    previous = pose.position
  }
}
assert.equal(portalRefreshInterval(100, true), 0, 'Crossing must not use a throttled thumbnail')
assert.ok(portalRefreshInterval(100, false) > portalRefreshInterval(16, false), 'Distant thumbnails should refresh less often')
assert.equal(worldFromHash('#world/avvr'), 'avvr')
assert.equal(worldFromHash('#world/hardware'), 'hardware')
for (const hash of ['#world/nope', '#world/__proto__', '#world/avvr/extra', '#world/hardware/avvr', '#world/hardware/fpv-drone/extra', '#world/hardware/', '#project/avvr']) assert.equal(worldFromHash(hash), null)
assert.equal(worldProjectFromHash('#world/hardware'), 'petbot', 'Existing shared workshop links keep working')
for (const id of ['petbot', 'fpv-drone']) {
  const route = projectWorldRoute('hardware', id)
  assert.equal(worldFromHash(route), 'hardware', 'Changing stations stays in the same world')
  assert.equal(worldProjectFromHash(route), id, 'A station link must preserve its own project notes')
}
assert.equal(worldForProject('petbot'), 'hardware')
assert.equal(worldForProject('fpv-drone'), 'hardware')
assert.equal(worldForProject('avvr'), 'avvr')
assert.equal(worldForProject('food-wars'), null, 'Do not promise a world that has not been built')
assert.equal(projectWorlds[worldForProject('petbot')].projects[0], 'petbot', 'The shared hardware room must return to a real project')
// An unopened island must allocate nothing, including during ordinary idle
// updates, source resets and viewport changes. Direct entry still works.
function deferredFixture() {
  let builds = 0, near = false, phase = 'hall'
  const calls = []
  const built = {
    get phase() { return phase }, source: { x: 1, y: 2, z: 3 }, listeningCamera: {},
    preview: (...args) => calls.push(['preview', ...args]),
    setProject: id => calls.push(['project', id]),
    setSource: index => calls.push(['source', index]),
    setPresentation: mode => calls.push(['presentation', mode]),
    resize: () => calls.push(['resize']),
    resetView: () => calls.push(['reset']),
    rotate: amount => calls.push(['rotate', amount]),
    update: (wantsWorld, ...args) => { phase = wantsWorld ? 'world' : 'hall'; calls.push(['update', wantsWorld, ...args]); return wantsWorld },
    dispose: () => calls.push(['dispose']),
  }
  const portal = deferProjectPortal(() => { builds++; return built }, () => near)
  return { portal, calls, built, get builds() { return builds }, approach() { near = true } }
}
const untouched = deferredFixture()
untouched.portal.resize(); untouched.portal.setSource(0)
untouched.portal.setPresentation('photo'); untouched.portal.setPresentation('model')
assert.equal(untouched.portal.phase, 'hall')
assert.equal(untouched.portal.update(false, 10, false, {}, false), false)
untouched.portal.preview(10, true)
untouched.portal.dispose()
assert.equal(untouched.builds, 0, 'A forced preview refresh or teardown must not build an unseen island')

const nearby = deferredFixture()
nearby.portal.setProject('fpv-drone'); nearby.portal.setSource(1); nearby.approach()
nearby.portal.preview(20)
assert.equal(nearby.builds, 1)
assert.deepEqual(nearby.calls.slice(0, 3), [['project', 'fpv-drone'], ['source', 1], ['preview', 20, false]], 'A prepared shared island keeps the selected station and source')
nearby.portal.preview(30, true); nearby.portal.update(true, 40, false, {}, false)
nearby.portal.resize(); nearby.portal.resetView(); nearby.portal.rotate(.25)
assert.equal(nearby.portal.phase, 'world')
assert.equal(nearby.portal.source, nearby.built.source)
assert.equal(nearby.portal.listeningCamera, nearby.built.listeningCamera)
nearby.portal.update(false, 50, false, {}, false)
nearby.portal.update(true, 60, false, {}, false)
assert.equal(nearby.builds, 1, 'Return and repeat entry reuse the prepared island')
nearby.portal.dispose()
assert.deepEqual(nearby.calls.at(-1), ['dispose'])

const direct = deferredFixture()
direct.portal.setProject('fpv-drone'); direct.portal.setSource(1); direct.portal.setPresentation('model')
assert.equal(direct.builds, 0, 'Choosing a presentation must not construct an unseen island')
assert.equal(direct.portal.update(true, 70, true, {}, true), true)
assert.equal(direct.builds, 1, 'A direct island route works without an approach or preview')
assert.deepEqual(direct.calls.slice(0, 2), [['project', 'fpv-drone'], ['source', 1]])
assert.deepEqual(direct.calls[2], ['presentation', 'model'], 'Direct entry must apply the selected exhibit presentation')
direct.portal.setPresentation('photo')
assert.equal(direct.builds, 1, 'Changing presentation reuses the existing scene')
assert.deepEqual(direct.calls.at(-1), ['presentation', 'photo'])
direct.portal.update(true, 70, true, {}, true)
assert.deepEqual(direct.calls.at(-1), ['update', true, 70, true, {}, true], 'Reduced motion, destination and audio arguments are preserved')
console.log('PASS: portal projection, continuous return to the browse pose and routes; deferred construction, shared-station state, direct entry, repeat entry and cleanup')
