# Inspecting AVVR predictions — 23 September 2026

Local work on `codex/hall-display-polish`. No commit, push, issue operation,
PR, merge, deployment or DNS change. Owner acceptance remains pending.

## What changed

Model labels in the listening-room exhibit are now interactive. Selecting
Floor, Wall, Window, Chair, Furniture or Objects keeps that prediction's
archived colour and renders the rest of the room in a neutral finish. Context
stays opaque and in place. All, selecting the same class again, or Escape
restores the full palette. Reset view also clears the highlight. Escape from
the full palette returns to the matching hall frame; clearing a highlight
retains keyboard focus on its class control.

The status names the highlighted prediction, and the exhibit still explains
that these are the archived pipeline's classifications, including mistakes.
The original data, model geometry, team attribution and research credits are
unchanged. This is an inspection feature, not a new reconstruction result.

The renderer updates its existing colour buffer only when the selected class
changes. It retains the source's 35,844-byte class array. There is no added mesh,
transparent pass, render target or animation loop.

Project-island controls now load in a separate JavaScript chunk when entering
a project space. The opening page does not download those controls. At 320px,
the three AVVR view selectors now fit on one row while retaining 44px height.

## Identifiable build and checks

- Entry: `assets/index-Cx7ca5AP.js`.
- CSS: `assets/index-D-gkuBQe.css`.
- Browse: `assets/HallScene-pwEkYdfS.js`.
- Walk: `assets/BabylonScene-NrNh9po6.js`.
- Controls: `assets/ProjectIslandControls-BPr0EwM5.js`.
- Manifest SHA256:
  `3182BBB56C08663C41EDFBCABBDAC985712907078512A6C74A01D49AE9101EC6`.
- Build log: `_local/avvr-predictions-build.log`.

Build/typecheck, lint, archive, portal, navigation, spatial-audio and diff checks
passed. Initial JavaScript is **246,358 bytes**, down 3,600 from the preceding
build, under the unchanged 250,000-byte gate. The existing large Babylon chunk
warning remains. No network-speed improvement is inferred from this size alone.

The archive check compares full colours against the separately exported source
materials, checks every class highlight, opaque context, reuse of the colour
buffer, unchanged source labels and complete restoration. Existing archive
hash, geometry bounds, normal integrity and malformed-file checks also passed.

Compiled Chromium checks covered:

- Model labels, Floor/Objects selection, reset, Escape clearing with focus
  retained, a second Escape returning to AVVR, and re-entry in the neutral view.
- At 390×844, direct clicks opening labels and selecting Floor retained
  scrollY 0. All seven class controls are at least 44×44px, with no horizontal
  overflow. The complete model remains visible above the controls.
- At 320×740, the final three view controls share the same row; the class
  controls wrap without clipping and retain 44px targets. Locator-driven clicks
  can scroll their target into view and are not used as scroll-stability proof.
- The original 360° photograph still opens. At zero volume, Play and source
  movement updated correctly; switching to Reconstruction and back to Sound
  demo left playback stopped. This is control-state verification, not listening
  quality acceptance.
- The shared controls still open drone camera-mount notes, clear them on Reset,
  enable Hover, switch to PetBot and open its shell. No captured console errors.

## Rendering evidence

Public development profiler on local Chromium / RTX 3080, 1280×720 viewport.
Both the previous all-label view and the final Wall-highlight view used **three
draw calls**, 179 scene meshes and 57 texture objects. No render targets were
added. The expanded touch controls reduce the desktop render area from 723×444
to 723×391, so GPU timings below are not a like-for-like speed comparison.

Final scene: `474d4ae4-4b7c-45aa-b556-b952d78322f2`.
Six-second forced-awake sample: 1,020 frames; frame p50/p95 5.9/6.1ms;
CPU p50/p95 0.3/0.4ms; GPU p50/p95 0.07/0.08ms; zero long tasks and zero
offscreen target passes. Baseline scene:
`d75ebc46-51c7-4fc4-984b-feb342a3ab4a`.

With the highlight left selected and forced rendering off, the final six-second
sample rendered **zero frames**, with zero long tasks and zero target passes.
This verifies idle behavior on this desktop, not Firefox or phone performance.

## Owner review — pending

Preview: <http://127.0.0.1:5186/?community=local#world/avvr/avvr>.
If a rebuild/restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

- [ ] Select Model labels, then Wall, Floor and Objects. Orbit the model.
  Expect only the selected prediction to keep its original colour, with the
  rest of the room still visible in grey. Select All or the active class again.
- [ ] Select a class and press Escape once, then again. Expect the first press
  to restore all labels without leaving; the next returns to AVVR in the hall.
  Re-enter and check Reset, 360° source and the sound demonstration.
- [ ] Repeat selection and navigation in Firefox and on a real phone. Confirm
  the model is easy to inspect, the controls feel immediate, and the explanation
  accurately represents the university work.

Firefox, physical phone/headset input, listening quality and owner visual
acceptance remain pending. Existing source-publication checks, iframe behavior,
hosting and domain work are not closed by this pass.
