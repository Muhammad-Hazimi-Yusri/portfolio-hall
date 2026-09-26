# Visitor interaction and navigation review — 23 September 2026

Boats now open the visitor log from the hall, walking view and desktop floor
plan. The log gives each recent visit a country label and a link to its last
section. The entrance count links to this same list. Opening and closing the
log while walking retains the camera and restores control of the scene.

This remains combined, uncommitted work on `codex/hall-display-polish`.
No commit, push, issue operation, PR, merge, deployment or DNS change was made.
The wider visual goal and owner acceptance remain open.

## Identifiable build

- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus the dirty tree.
- Entry: `assets/index-DHU-YTLn.js`; CSS: `assets/index-BX3JLP7b.css`.
- Hall: `assets/HallScene-B3x1zM7t.js`.
- Walking: `assets/BabylonScene-CD-fHkRO.js`.
- Visitor log: `assets/VisitorBook-Bb0L7FJ-.js`.
- Manifest SHA256: `F410B44D08D47ABE5801904E826563A446E44E60923F025C163171543DCA235D`.
- Build log: `_local/visitor-interaction-build.log`.
- Preview: <http://127.0.0.1:5186/?community=local#>.

## Interaction and cost

Each of at most twelve boats gets a twelve-triangle, zero-visibility pick
volume. Hulls and flags retain their shared batches. Pick volumes have no
material and do not enter water render lists. The installed Babylon picker
accepts them while its renderer skips them; both the ordinary ray test and
browser clicks verified this behavior.

The transparent area between the stage toolbar's buttons intercepted canvas
clicks. Before the repair, `elementFromPoint(413, 585)` in a 1280 × 720 review
returned `stage-controls`, and the visible boat there did nothing. The toolbar
container now passes pointer input through while its actual controls remain
interactive. The same point then resolved to `hall-canvas` and opened the log.
The decorative stage caption also passes pointer input through.

Identical visitor snapshots preserve existing geometry and flag loads instead
of clearing and rebuilding them. Changed data still disposes old pick targets,
materials and textures. No animation, render pass, external flag request or
additional visitor data field was added. Initial JavaScript is 243,883 bytes,
361 bytes above the preceding hardware-recordings build; 3D remains deferred.
The existing large Babylon chunk warning remains.

## Agent evidence

- PASS: production build/typecheck and 11-project content/asset validation;
  lint; geometry/picking checks; navigation, movement, scroll and community
  checks; Git whitespace check. Geometry checks exercise the default ray
  picker at all twelve rotated boat positions.
- Compiled desktop: a boat, the entrance visitor count and an SVG map boat
  opened `#guestbook/visitors`, expanded the log and focused Recent boats.
  A Projects link in the final compiled log opened `#projects` and focused
  its heading. Unknown countries stayed unknown in local service data.
- Compiled walking view: selecting a boat opened the log while retaining
  `#explore`. The background became inert. Escape removed the dialog,
  restored canvas focus and retained the same visible waterfront view.
  The final dialog title identifies the action as Visitor log.
- Compiled 390 × 844 direct-load route: once local data arrived, focus moved
  to Recent boats below the pinned hall. At 390 × 844 and 320 × 740 there was
  no horizontal overflow; each section link was at least 44px high.
- Development synthetic fixture: GB, MY, JP and unknown flags rendered on
  twelve boats. Remove visitors cleared the fleet and its click targets;
  clicking the former boat position did nothing. Restore visitors restored
  flags and the same position opened the visitor action.
- Development idle sample, with three new objects containing identical
  visitor data: six seconds, zero scene renders, zero water/shadow target
  passes and zero reported long tasks. The sample reported 136 meshes/45 textures.
  This is a bounded idle check on an RTX 3080 at a 656 × 636 canvas; it is not
  a scrolling frame-rate result or evidence of Firefox/phone performance.
  Reproduce at <http://127.0.0.1:5187/tools/fixtures/visitors.html?profile=1>:
  let the scene settle, Start 6-second sample, then Refresh unchanged visits.
- Final compiled navigation loop: RubyVR at 4 / 9 → Right → THE FINALS at
  5 / 9 → Walk here. The camera arrived beside THE FINALS and its matching
  Read notes card. E opened its notes; Escape closed them and restored canvas
  focus. Return to portfolio restored THE FINALS notes. Escape then returned
  to `#gallery/the-finals-outfit`.
- No captured warnings/errors in the final compiled navigation review or
  synthetic fixture. No notes were submitted in this pass.

These are local Chromium checks. Actual Firefox, physical-phone input and
performance, captured mouse input, headset and owner visual acceptance remain
pending. The in-app browser rejected pointer capture in the walking check;
its existing drag-to-look fallback worked. Earlier embedded YouTube playback
remains unresolved as recorded in `2026-09-23-hardware-recordings-review.md`.

## Owner functional review — pending, about three minutes

The local preview and visitor service are running. If they have stopped,
start each command in its own PowerShell terminal:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run community:local
```

Ctrl+C stops a manually started service. Loopback reaches this PC only.

- [ ] Open the preview. Select a boat or the visitor count; expect Recent
  boats to appear. Select one of its section links and check the destination.
- [ ] Select Use hall map, then a boat. Expect the same log and an obvious
  route back through the main navigation.
- [ ] Open RubyVR notes. Use Left/Right and the visible Previous/Next controls;
  expect the title, image, frame and project counter to agree. Escape should
  leave project focus at that frame in the gallery.
- [ ] Select Walk here from a project. Expect to land beside that project.
  Press E, close its notes, then Return to portfolio. Check context and input
  remain usable throughout.
- [ ] Walk near the entrance fleet, select a boat and close the log. Expect
  the same walking position and controls. Check the feel in Firefox too.
- [ ] Repeat the main project and visitor controls on a reachable phone
  preview. Check scrolling, touch targets and the way the pinned hall fits.

User results and waivers are pending. This is not a merge recommendation.
