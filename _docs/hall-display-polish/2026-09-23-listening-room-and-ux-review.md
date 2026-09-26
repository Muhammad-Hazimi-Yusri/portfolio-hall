# Listening room and navigation — local review

This continues the combined work on `codex/hall-display-polish`. No commit,
push, PR, issue change, merge or deployment was made in this pass. Owner visual
acceptance and the wider portfolio backlog remain open.

## Identifiable build

- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus working changes.
- Entry: `assets/index--F0ELU9v.js`; CSS: `assets/index-DrTClEKh.css`.
- Browse scene: `assets/HallScene-VoNfInO2.js`.
- Walk wrapper: `assets/HallExperience-BnOfcyoh.js`.
- Manifest SHA-256: `F873C58BA1BFD4D70B64EA844D409AC0EABBD25E57EC3D41D50C0D00DACC7AD9`.
- Preview: <http://127.0.0.1:5186/?community=local#project/avvr>.
- Initial JavaScript: 218,451 bytes. The 3D code remains separately loaded.
- Build log: `_local/listening-room-build.log`.

## Changes

The AVVR illustration now has a shallow layered platform, acoustic panels,
timber slats, a detailed speaker and a display of the original application.
The speaker has a curved cabinet, woofer, tweeter, stand, cable and status light.
The room is a portfolio illustration, not a scan, original AVVR asset or acoustic
simulation. The project notes retain the university team's attribution.

The L/C/R floor controls and toolbar select the same source position. The
speaker moves smoothly between them, and its audio position moves with it.
There is no separate fixed listener marker: the viewing camera is the listening
point. The original screenshot is clickable and leads to the project image in
the reading panel.

The audio example is a locally generated pair of soft chimes. It starts only
after Play and the first camera-position update, has a volume control and a
short gain fade on an explicit stop. Leaving the island, selecting the map,
hiding the page or unmounting releases the audio context. Rapid stop/start and
the short retiring fade are handled separately. No audio asset is downloaded.
With sound playing but no movement, the renderer can sleep.

Orbit buttons and Reset now ease to their destination in both islands. Direct
dragging interrupts that movement; reduced-motion mode uses the destination
immediately. Portal completion clears any unfinished view adjustment.

Walk entry during a portal return now uses the current hall camera, or the
selected project's safe fallback if still in island coordinates. It cannot
reuse a stale pre-island pose. Project arrow keys also read the current hash,
so several quick taps count even before React commits the previous navigation.

## Agent checks

- PASS: production build, TypeScript, lint and `git diff --check`. The existing
  large Babylon chunk warning remains.
- PASS: audio sample bounds and silent loop boundaries at 8–192 kHz; deferred
  start, gain fades, volume bounds, repeated start, early stop, suspended/hidden
  cleanup and interruption of an outgoing fade. These are signal/graph tests,
  not a listening test.
- PASS: existing navigation, portal and exhibit-geometry checks.
- PASS in Chromium: toolbar source selection and clicking the actual R floor
  control; the button and speaker position agree. Volume Right changes 35% to
  40% without changing the project route.
- PASS: Play/Stop/Play, map and 3D return with Play unpressed, and Hall return
  to the correct project. No production-origin console errors were observed.
- PASS: 390 × 844 and 320 × 740 layouts have no horizontal overflow. The final
  mobile controls have at least 44 × 44 targets; narrow layouts wrap controls.
- PASS: entering walk mode from WattWhere faces its frame and an immediate
  Return reopens its notes. Returning from the AVVR island, pressing Right and
  immediately choosing Walk here also lands beside WattWhere rather than at
  the entrance or a stale exhibit.
- PASS on the final build: four quick arrow presses (Left, Right, Right, Right)
  from THE FINALS reach FPV, with the 7 / 9 indicator and title in agreement.
- PASS on the final build: FPV Hover/Landed, orbit/reset, switching to PetBot,
  Open shell/Assembled and Escape back to PetBot notes. The open assembly was
  also inspected visually.

### Performance sample

The listening-room scene was measured in local Chromium on an RTX 3080 at
723 × 511 render pixels. Scene ID: `fe472f6b-515f-40aa-848d-84665fd18081`.
This sample preceded the final mobile-only styling, walk-pose handoff and quick
key correction; the room geometry and rendering policy did not change afterward.

- Six seconds with sound enabled and the room stationary: **0 rendered frames**,
  0 long tasks and no offscreen render passes. This is not a claim of zero CPU,
  audio-processing or power use.
- Six seconds with the diagnostic Keep renderer awake option enabled: 1,021
  frames, 170.1 fps; frame p95 6.1 ms, CPU p95 0.5 ms, GPU p95 0.33 ms;
  34 median draw calls, 0 long tasks and no offscreen passes.
- Complete scene: 163,958 triangles, 255 meshes, 64 textures, including inactive
  destinations. Compared with the preceding hardware pass, this adds 7,682
  triangles, three meshes and one texture.

These are desktop samples, not Firefox or physical-phone measurements. Actual
headphone output, subjective spatial direction, physical touch, VR and the
owner's assessment of appearance remain unverified.

## Owner check — pending

About three minutes, plus a repeat on Firefox/phone. The preview is running;
headphones help with step 2. No account or public visitor backend is required.
The optional `community=local` query uses separate local visitor test data.

If the preview needs restarting, run this from PowerShell:

```powershell
Set-Location 'E:\Coding\portfolio-hall'
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Stop the preview with Ctrl+C in that terminal.

- [ ] Open the AVVR project and enter the island. Inspect the room and speaker;
  select L/C/R on the floor or Left/Centre/Right in the controls. The selected
  position and moving speaker should agree.
- [ ] Choose Play sound, adjust Volume and move the source. With headphones,
  judge whether direction and level are clear and comfortable. Turn the view,
  then Reset. Choose Stop; use the map and return. Sound should stay off until
  Play is selected again.
- [ ] Return to the hall. Press Right for WattWhere, then choose Walk here.
  You should face WattWhere's frame. Return to portfolio should restore its
  notes. Try several quick Left/Right taps and Escape back to the gallery.
- [ ] Open the hardware workshop. Try orbit/reset, PetBot's Open shell and the
  drone's Hover/Landed controls, then return to the matching notes.
- [ ] Repeat the room and project/walk loop in Firefox and on a physical phone.
  Check scrolling, camera comfort, sound, readability and touch targets.

User results and visual acceptance are **pending**. This review does not mark
the overall visual goal complete, close issues or authorize a merge.
