# Interaction continuity — 23 September 2026

Local work on `codex/hall-display-polish`, preserving the accumulated changes.
No commit, push, issue operation, PR, merge, deployment or DNS change.

## What changed

- Project navigation now respects its current space. In the hardware workshop,
  Previous/Next and Left/Right move between PetBot and the drone, with an
  Exhibit 1 / 2 indicator. They stop at either end. Previously the reading
  panel's Next link returned to the hall despite its destination also being
  in the workshop. The ordinary gallery retains all nine projects.
- Reading arrows retain keyboard focus, including when a link becomes an
  unavailable boundary button. On phones they reveal the new notes and keep
  the focused navigation visible. The workshop's station controls retain the
  island position instead. Model controls, input fields and image viewers do
  not trigger project navigation. The listening room omits redundant arrows.
- Walk actions consistently say Walk here. The existing live-camera landing
  and contextual map landing were verified; a failed browse renderer now also
  clears its saved camera to prevent reusing a stale position from the map.
- Escape from an unlocked walk returns to the portfolio. Inspectors and the
  directory close first; pointer capture owns the initial Escape. The capture
  release event has a guard against browsers delivering that key after unlock.
  Walk inspectors explicitly say Back to walk. The visible return control and
  walking instructions now expose the Escape shortcut.

No new scene geometry, render targets, per-frame work or animation loops.

## Build and agent checks

Final entry: `assets/index-BvY7nX40.js`; CSS: `assets/index-DAtFXVZl.css`.
Manifest SHA256:
`F5A066B0989A7C5E6BF3A8515B49E63DF21BCF40DB4820D1A64B17DE40BECD41`.
Build log: `_local/interaction-ux-build.log`.

Build/typecheck, lint, navigation, movement and diff checks passed. The build
validated 11 project records, assets and routes. Initial JavaScript is 249,958
bytes under the unchanged 250,000-byte gate. The existing large Babylon chunk
warning remains; this pass does not establish faster frame rates.

Local Chromium checks covered:

- RubyVR Walk here landing beside RubyVR; map selection changed to THE FINALS
  before walking, with THE FINALS available to inspect instead of the old frame.
- Escape from an inspector and directory closed only that layer, followed by
  Escape returning to RubyVR's portfolio notes.
- Workshop keyboard, reading links, station links and end-of-article Next;
  matching title/count/current station, no collection wrap, and focus retained.
- Orbit controls and an open image viewer did not change the workshop station.
  Closing the image viewer returned focus to its origin.
- At 390×844 and 320×740, no horizontal overflow and 44×44 arrow buttons.
  An intermediate build moved the phone navigation below the viewport; the
  final compiled 320px check kept both the focused control and new title visible.
- At 320×740, FPV inspection, full Project notes, Escape, and the resumed walk
  again offered Inspect FPV drone. The inspector's return button remained clear.
- The final compiled review tab had one canvas and no captured console errors.

Physical pointer capture, Firefox, actual touch/gyro, headset input and owner
visual acceptance are still pending. Resizing Chromium is not phone acceptance.
The broader visual, iframe-loading, hosting and domain work remains open.

## Owner review — pending

Preview: <http://127.0.0.1:5186/?community=local#project/rubyvr-studio>.
Services are already running. To rebuild/restart the preview if needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

The optional local visitor service uses `npm.cmd run community:local` in another
terminal. This loopback address is for this PC; a phone needs a reachable preview.

- [ ] Open a project, use Left/Right and the physical signs beside its frame,
  then Walk here. Expect to start beside the displayed project.
- [ ] In the hardware workshop, switch between PetBot and FPV with the reading
  arrows and station links. Expect to remain in the workshop, with matching notes
  and count. Repeat at a narrow width; the reading controls should stay visible.
- [ ] Walk, open notes with E, close with Escape, then press Escape again.
  Expect to resume walking first and then return to the matching portfolio view.
- [ ] With a real captured mouse, press Escape once. Expect only mouse release;
  press it again to leave the walk. Repeat the changed flow in Firefox and on
  a real phone when a reachable preview is available.

User results remain pending. No merge readiness or publishing approval inferred.
