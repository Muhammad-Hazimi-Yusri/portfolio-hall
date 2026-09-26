# AVVR archive exhibit — 23 September 2026

The AVVR island now opens on an actual archived room reconstruction. Visitors
can orbit the model, show its original predicted classes, compare it with the
original 360° photograph and switch to the separate spatial-audio illustration.
This gives the exhibit a concrete connection to the university project.

This continues the combined local changes on `codex/hall-display-polish`.
No commit, push, issue operation, PR, merge, deployment or DNS change was made.
The broader design goal and owner acceptance remain open.

## Identifiable build

- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus the dirty tree.
- Entry: `assets/index-Bz1qO-f6.js`; CSS: `assets/index-BOE63bl1.css`.
- Hall: `assets/HallScene-R8wM-jVO.js`.
- Walking: `assets/BabylonScene-1D1jUrFb.js`.
- Manifest SHA256: `9F1A1C74DFB6F573228DF10DE711AC4602E2AB52D8E9388E869D9C7E8E894118`.
- Build log: `_local/avvr-archive-build.log`.
- Preview: <http://127.0.0.1:5186/#project/avvr>.

## Source and presentation

`tools/export-avvr-room.mjs` exports the archived ceiling-removed
`Input_prediction.obj` and its matching materials. All source geometry is kept
on its millimetre grid; quads are triangulated and vertices are indexed with
normal/class seams intact. The browser converts winding for the hall's scene.
The neutral finish, lighting, plinth and caption are portfolio presentation.
The six class colours are the source material values, including prediction
errors. They are not a claim of correct classification.

- Mesh: 536,648 bytes, 35,844 indexed vertices, 41,632 triangles.
- Mesh SHA256: `F27B9E4E31189E648AF3C22FA4E17D418F813FB8B945C7E49A5A7C7B100396A7`.
- Panorama: unmodified 2690 × 1345 PNG, 5,358,729 bytes.
- Panorama SHA256: `BAA278F339BD9015CB208209728C6287CA7085A6D7719A83FA639EA819F2E75B`.

The source is the [S3A Audio-Visual Scene Analysis dataset](https://cvssp.org/data/s3a/public/AV-Analysis2/).
Credits and the asset README preserve the research attribution and distinguish
Hazimi's software/VR integration from the source dataset and reconstruction
research. The pipeline's MIT notice is not asserted to relicense the dataset;
the source terms still need checking for the combined publication review.

## Behaviour and loading

The compact model loads when the existing deferred AVVR portal is prepared.
The panorama loads only after selecting **360° source**. The preceding view
stays visible while the photograph loads; an unavailable asset has a readable
status and alternate exhibit controls. No second renderer is introduced.
Switching away from Sound demo stops its audio. Switching model labels keeps
the viewing angle. The photograph stays at its original camera position.

The physical return doorway remains part of travel and the sound room, but
does not intrude into the model or source-photograph views. Hall and Escape
remain available. Material compilation requests a fresh frame when a shader
variant is ready, fixing colours that previously appeared only after camera
movement. This does not enable continuous idle rendering.

The mobile world view opts out of browser scroll anchoring so changes in the
controls do not anchor the document to the notes below them. Direct click
checks retained scrollY 114 across Reconstruction, Model labels and 360° source
at 390 × 844. At 320 × 740, enabling labels retained scrollY 0. Locator-driven
clicks sometimes scroll their target into view; those scrolls are excluded from
the direct-click result.

Initial JavaScript is 239,679 bytes, up 2,272 bytes from the preceding notes-return
build. The 3D code remains deferred. The build retains its existing large
Babylon-chunk warning. These sizes do not establish loading speed on a phone.

## Agent checks

- PASS: TypeScript, lint, production build, content/asset validation for all
  11 project records, and Git whitespace check.
- PASS: archive hash, geometry bounds, normal/class integrity, malformed-asset
  handling and size budget. The source comparison matched every displayed
  triangle corner against the original OBJ; source/copy PNG hashes match.
- PASS: portal routes/projection/deferred state, contextual navigation,
  locomotion and existing spatial-audio checks.
- Compiled desktop: enter from AVVR notes, switch neutral model → labels →
  photograph, then Escape. Returned to AVVR notes with the entry link focused.
  Labels appeared immediately without extra camera interaction. The archived
  model view no longer shows a clipped portion of the return doorway.
- Compiled desktop: Right then opened WattWhere at 3 / 9. Walk here opened
  beside its frame with Read notes WattWhere and focus on the walking canvas.
  Return to portfolio reopened WattWhere notes.
- Compiled responsive checks at 390 × 844 and 320 × 740: no horizontal document
  overflow; all exhibit buttons at least 44 px high and orbit buttons 44 × 44.
  The narrow view wraps controls without clipping them.
- Audio controls: Play → Right → Reconstruction → Sound demo left playback
  stopped and retained the selected Right source. This checks UI/graph state,
  not headphone listening quality.
- No browser errors were captured during the compiled exhibit/navigation pass.
- Final development idle sample with Model labels enabled: scene
  `340a99ab-cefd-4581-9b2d-2adedeaee2db`, RTX 3080 / ANGLE D3D11,
  723 × 444 rendering area. Over six settled seconds: zero rendered frames,
  zero long tasks, zero scroll layout measurements/updates and no render-target
  passes. All normal rendering options were enabled; Keep renderer awake was
  off. This confirms sleeping when idle, not frame rate or phone performance.
  Portal construction was 28.6 ms before asynchronous assets finished; it is
  not a total loading-time measurement.

These are local Chromium checks, including resized desktop layouts. Actual
Firefox, physical phone, headset and owner visual acceptance remain pending.

## Owner functional review — pending, about three minutes

Open the preview above; no login or visitor service is required. If needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops a manually started preview. The loopback URL reaches this PC only.

- [ ] Enter the AVVR island. Drag to orbit and use Reset view. Expect the
  archived reconstruction on its plinth, with a clear way back to the hall.
- [ ] Enable Model labels. Expect the source class colours and matching legend
  immediately, with the same viewing angle. Switch to 360° source and look
  around; expect a photograph viewed from one position.
- [ ] Choose Sound demo, Play sound and a different source. Switch to
  Reconstruction and back. Expect playback to be stopped. Judge the audio
  with headphones if available.
- [ ] Press Escape to return to AVVR notes, then Right to reach WattWhere.
  Choose Walk here. Expect to start at WattWhere's frame; Return to portfolio
  should reopen its notes. Judge whether the navigation feels natural.
- [ ] On Firefox and a phone with a reachable preview, repeat the mode
  switches and return. Check actual scrolling, touch targets, input response
  and visual stability; the desktop resize checks cannot establish these.

User results are pending; no checks are marked passed or waived. This is not a
merge recommendation or evidence that the wider portfolio goal is finished.
