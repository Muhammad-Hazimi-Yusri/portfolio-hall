# Drone component inspection — 23 September 2026

The FPV exhibit now connects selectable camera, wiring and lighting components
to short notes from the user's original build diary. Selecting a component
lands the drone, brings it closer and adds a restrained material highlight.
The existing project photo remains beside it for comparison.

Local combined work only. No commit, push, issue operation, PR, merge,
deployment or DNS change. Owner visual acceptance and the broader goal remain
open.

## Review build

- Branch: `codex/hall-display-polish`, dirty combined work based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Preview: <http://127.0.0.1:5186/?community=local#world/hardware/fpv-drone>.
- Entry: `assets/index-BFL8qdOK.js`; CSS: `assets/index-BuGWfD8b.css`.
- Browse: `assets/HallScene-bwzGNy1V.js`.
- Walking: `assets/BabylonScene-BINbDU42.js`.
- Notes: `assets/DroneBuildNotes-oPKUlFY1.js`; data:
  `assets/droneBuild-BsMm6vBF.js`. Both load separately from the initial page.
- Manifest SHA256:
  `F29E2D631AABE9334739B9D75F890EECFBED7B630767D0B6AC13B6893F12DC59`.
- Build log: `_local/drone-build-notes-build.log`.

## Source and interaction

The [original public diary](https://muhammad-hazimi-yusri.github.io/quartz-jimi/projects/fpv-drone/)
was read during this pass. The notes retain the 2023 context and Tim O'Brien's
mount-design credit. They do not establish the cause of the camera failure,
claim a custom-designed mount, or add measurements or new flight results.
The model remains an illustration based on project photographs, not measured
CAD. The existing provenance text stays visible in the notes.

`src/data/droneBuild.ts` is the shared source for the component names and copy.
The note text sits in the reading panel on desktop; on narrow screens it sits
below the viewer. Only the appropriate copy is exposed in each layout. This
avoids shrinking the desktop model when a note opens. The three controls remain
available as a keyboard/touch alternative to selecting the physical parts.

Close and Escape restore the whole drone and keyboard focus to its selected
component control. A second Escape returns to the project in the hall. Reset
and Hover clear inspection; choosing a component while hovering selects Landed
and stops the animation. Switching stations clears the selection too.

The optional smooth presentation transition is confined to the hardware
workshop. AVVR retains its existing immediate transition to a photograph from
one fixed camera position. Inspection poses are cached on state changes, not
allocated on each render-loop iteration.

## Agent verification

- PASS: TypeScript/build, lint, portfolio packaging, navigation, portal and
  exhibit checks. Initial JavaScript is 247,385 bytes. Existing large Babylon
  chunk warnings remain.
- The exhibit check now constructs the actual drone under Babylon NullEngine.
  Real rays hit the camera, wiring and LED components after batching. The canvas
  stub is only for texture setup; this test does not claim to check appearance.
- Eight cycles through all three selections and the closed state preserve mesh,
  material and texture counts after the first cache fill. Unchanged selections
  request no rendering; closing restores all original materials. Unrelated
  components retain their own materials during selection.
- An intermediate development failure exposed destructive batch ordering:
  MergeMeshes disposed the source pieces before the next group was identified.
  Membership is now captured before merging. The real-constructor test and final
  compiled runtime both pass. The temporary tab retains the earlier error in
  its historical log; it is not a current compiled-build error.
- Development: selecting the actual camera opened its matching note. All three
  note controls update the close-up and text. Closing returns focus; Enter
  reopens; Escape closes inspection without leaving the island; the next Escape
  returns to `#project/fpv-drone`.
- At 390 and 320 px, exactly one note is exposed. At 320 px document width is
  305 px inside the 320 px viewport. The three component targets are 84 px wide
  and at least 44 px high. The note and source link can be reached by normal
  scrolling. Hover followed by Camera mount visibly changed back to Landed.
- Final compiled preview: entry script verified after explicit reload. Camera
  inspection and Escape/Enter work; switching to PetBot removes the note and
  Open shell remains available. Returning to FPV starts unselected. A compiled
  320 px check retains exactly one visible note and no horizontal overflow.
- Final compiled AVVR smoke check: Reconstruction opens, 360-degree source
  displays the actual photograph, and Reconstruction can be selected again.
  No compiled-build browser errors were captured. The main preview log is empty.

## Bounded performance evidence

Development Chromium / RTX 3080, canvas 723 by 404, all normal rendering flags
enabled and Keep renderer awake disabled. Scene ID:
`73e176d5-05b3-4fc2-808a-b51715997e23`.

| Six-second sample | Frames | Frame p95 | Long tasks | Median draws |
| --- | ---: | ---: | ---: | ---: |
| Camera inspection, settled | 0 | n/a | 0 | n/a |
| Hover, settled | 1,021 | 6.2 ms | 0 | 64 |

Hover was 170.1 fps, CPU p95 0.7 ms and GPU p95 4.36 ms. Neither sample performed
an offscreen target pass. Hardware construction was 42.6 ms in this development
sample. Component separation increases draw calls compared with the earlier
single-action model; it adds no new geometry, shadow pass or continuous effect.

These are desktop samples, not Firefox or physical-phone performance claims.
The public visitor service, DNS, actual touch/captured mouse/headset behavior and
owner visual acceptance are still pending. No new paid service or dependency
was introduced.

## Owner review — pending

The preview is running. If needed, start it from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

Ctrl+C stops it. The optional `?community=local` query expects the separate
`npm.cmd run community:local` service; omit that query to inspect the workshop
alone. A physical phone needs a reachable preview rather than this loopback URL.
Rebuilding later source changes creates a different revision to review.

- [ ] Open the FPV workshop. Select the camera itself, then Wiring and
  Visibility. Expect a useful close-up, the correct highlighted component and
  a factual note with its original source. Compare the model with the photo.
- [ ] Close the note. Press Enter on the restored component control to reopen
  it, then Escape twice. Expect whole-drone view first, then FPV notes in the hall.
- [ ] Re-enter, choose Hover, then inspect a part. Expect Landed and stopped
  rotors. Switch to PetBot, open its shell, then return to FPV; the previous
  inspection should be cleared.
- [ ] Repeat on Firefox and a physical phone. Judge camera motion, note
  readability, scrolling and touch targets, and whether this makes the exhibit
  more engaging and personal.

User acceptance has not been recorded.
