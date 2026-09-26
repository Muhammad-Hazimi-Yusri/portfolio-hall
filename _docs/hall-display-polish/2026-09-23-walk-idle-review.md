# Walking idle cost and phone inspection — 23 September 2026

Walking now rests when the view settles, while movement, turning, travel and
visible animation still wake it. Phone inspection follows the narrower view,
and the drag surface no longer selects its guidance text.

This continues the combined local work. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance is pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BXX113mh.js`; CSS: `assets/index-D3ai0b_O.css`.
- Hall: `assets/HallScene-HNiVVgCx.js`.
- Walking: `assets/BabylonScene-CKQwrvpW.js`.
- Manifest SHA256: `0D355EA22F023A1719E4111A4C534981CE415F9A0C988D1D67CFBD57A4CE588B`.
- Preview: http://127.0.0.1:5186/?community=local#project/fpv-drone
- Build log: `_local/walk-idle-build.log`.
- Initial JavaScript: 249,372 bytes; 3D remains separately loaded.

## Changes and limits

The camera exposes pending keyboard/touch/mouse input and airborne motion
before the scene render decision. The render loop also observes changed camera
poses, destination travel, resizing, visibility, inspector dismissal and scene
data. It keeps a short settling period, then skips scene traversal and draws.
The lightweight animation-frame polling remains; this is not a claim of zero
CPU or whole-browser GPU use.

Visible logos within 18 metres can request another frame. Gentle idle motion
is scheduled at most 30 times per second, while camera-facing convergence and
visitor movement keep the normal display cadence. Reduced-motion preference
changes wake the scene. Slideshow display intervals use wall time and only
request frames when a visible fade is due. The current project paintings use
single images; the legacy multi-image slideshow path was code-checked, not
exercised with a live slideshow in this pass.

XR bypasses the idle gate. Headset input, sensor input and optional Gaussian
splat loading were not exercised. Late asset/data callbacks are guarded during
scene teardown; this also fixes a development reload error exposed during the
first implementation of the gate.

The inspection cone now accounts for horizontal field of view. In a portrait
view, turning a frame out of sight removes its Inspect action; looking back
restores it. The inactive phone prompt reads “Face a nearby exhibit”. The look
pad prevents text selection, including its “Drag to look” label.

## Local verification

Build/type checking, lint, movement checks, logo checks, navigation checks and
`git diff --check` passed. Navigation checks include a frame visible at an angle
in a wide view, that same frame outside a portrait view, and looking back at it.

Six-second samples used the visible development performance panel in Chromium,
an RTX 3080, and a 1280 × 720 drawing buffer. No builds ran during the samples.
These are draw counts at rest, not a benchmark of physical-phone performance.

| View and condition | Frames in six seconds | Offscreen passes | Long tasks |
| --- | ---: | ---: | ---: |
| RubyVR, original continuous walk loop | 1,021 | 0 | 0 |
| RubyVR, final render gate | 0 | 0 | 0 |
| Entrance, final render gate | 0 | 0 | 0 |
| TNEI, first gate before limiting idle logo cadence | 1,021 | 0 | 0 |
| TNEI, final logo cadence | 171 | 0 | 0 |

The final logo sample was 28.5 draws/second on this display. Camera movement is
not capped at that rate. The throttled sample's GPU timer returned zeros and is
not used for a GPU-time claim. The final renderer sample scene ID was
`48293f01-395c-480e-b95f-a57f5c557a6a`; the original RubyVR baseline was
`5643a813-19bc-4807-8cc8-23155697f51b`.

A Space-triggered jump after idle produced 148 frames, then stopped drawing
again within the six-second sample. Its 20 reflection and 20 refraction passes
were associated with the changing view. This checked jump wake-up and settling,
not physical held-key timing or mouse capture.

Compiled-browser checks:

- Project Right moved FPV → EEE Roadmap, changed the project count and labelled
  previous/next links, and Left returned to FPV.
- Walk here arrived facing FPV with one canvas and the FPV Inspect action.
- At 390 × 844, destination selection completed, look dragging woke the view,
  turning away removed Inspect, turning back restored it, and no text was
  selected. There was no horizontal document overflow.
- The phone inspector opened, and Escape restored its Inspect button. Resizing
  back to desktop retained the FPV position and a single canvas.
- Fresh development startup after the cleanup repair had no captured errors.

The final build changes only the inactive phone prompt after those compiled
interaction checks. A fresh 390 × 844 load confirmed the final entry bundle,
“Face a nearby exhibit” prompt, one canvas and no captured console errors.
Firefox, a physical phone, held-key timing, mouse
capture, sensors, VR and owner visual acceptance remain unverified.

## Owner functional review — pending

No account is required. Open the preview above. If the local services need to
be restarted:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional `?community=local` query uses the local visitor service on port
5190. Omit it to review without that service. Ctrl+C stops a manually started
preview.

- [ ] Open FPV notes, press Right then Left, and choose Walk here after the view
  settles. Expected: the counter and project change together, and the walk
  begins beside FPV rather than at the entrance.
- [ ] Stand still for a few seconds, then hold W/D, turn with the captured
  mouse, jump and release. Expected: immediate motion, a complete landing, no
  drift on release, and Escape releases the mouse. Repeat after an inspector.
- [ ] On a phone, select FPV, drag to look away and back, then Inspect and Close.
  Expected: the action follows the visible frame, dragging selects no text,
  and controls respond after standing still. Also check the motion sensor if
  you normally use it.
- [ ] Visit TNEI, Audioscenic and Southampton, turn away, then return to the
  gallery. Expected: nearby logos retain their gentle motion/tracking, with no
  frozen view when movement resumes. Repeat ordinary browsing in Firefox.

No owner checks are marked passed or waived. This record does not recommend
merge or establish completion of the wider visual goal.
