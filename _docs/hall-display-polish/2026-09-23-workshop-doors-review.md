# Separate entrances to the shared hardware workshop — 23 September 2026

PetBot and FPV previously looked through the same doorway into the workshop.
The drone frame was therefore dominated by the robot bench, with the drone
cropped at the side. Each frame now looks into its own station while retaining
one shared workshop. This remains part of the unpublished combined change.

## Identifiable build

- Branch: `codex/hall-display-polish`, intentional dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BQgUC4ez.js`; CSS: `assets/index-DHGJwmft.css`.
- Browse: `assets/HallScene-Hq7Jq8IB.js`.
- Walking: `assets/BabylonScene-KR37pUqM.js`.
- Manifest SHA256:
  `D54D5C56DC720BA8FF3F44AF6BD67F44E5888E8EB5DFB2FD7663F2697CAA2DB6`.
- Build log: `_local/workshop-doors-build.log`.
- Preview: <http://127.0.0.1:5186/?community=local#project/fpv-drone>.
- Initial JavaScript remains 249,791 bytes. The existing large Babylon chunk
  warning remains. No commit, push, issue change, PR or deployment was made.

## Changes

The workshop provides a doorway position for each project. Each frame keeps
its own immutable position for its preview; selecting the other station does
not repoint that window. The active crossing uses the same position, and the
single return frame moves with the selected station. The return camera,
clipping plane and timber frame now respect the doorway's world Z offset.
The world origin used to place workshop geometry remains unchanged.

The FPV doorway is slightly left of the drone's centre so the complete model
fits the hall's angled view. This adds no scenes, meshes, lights, textures or
render targets. It changes what is visible through existing previews; no new
performance measurement or speedup claim is made for this pass.

## Agent evidence

- PASS: production build, TypeScript, content/asset/bundle checks, lint,
  portal checks and diff whitespace check.
- Portal checks cover independent translated doors, a non-zero world Z,
  forward/backward round trips and the mapped crossing position. The existing
  return-path and deferred shared-station lifecycle checks also passed.
- Development 1280×720: compared PetBot and FPV frames; PetBot shows the robot
  and laptop, FPV shows the drone and original build photograph. Entered PetBot,
  selected FPV and returned to its frame. Adjusted the FPV position to include
  its full propeller span, then checked the compiled result.
- Compiled 1280×720: verified `index-BQgUC4ez.js`, entered FPV, enabled Hover
  and returned to the FPV frame. One canvas and no horizontal overflow.
- Compiled 390×844: entered FPV, switched to PetBot, opened its shell and used
  Escape. The PetBot frame and notes returned, with 6 / 9, one canvas and no
  horizontal overflow. A fresh reload at the direct FPV-island URL reached the
  flight pad and returned to FPV's frame and notes with 7 / 9.
- No browser errors were captured in the review tab. Temporary viewport
  overrides were reset after the checks.

These are local Chromium observations and selected screenshots. Continuous
motion acceptance, Firefox and real-phone behavior remain owner checks.

## Owner functional review — pending, about two minutes

No account is needed. The local preview is running; if needed, restart it:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops the preview. The optional `?community=local` service is not needed
for these checks and no visitor notes need to be submitted.

- [ ] Open the preview. Use Previous and Next between PetBot and FPV. Expected:
  each frame shows its own object, with both objects comfortably inside the
  selected frame.
- [ ] Enter FPV, enable Hover, then use Hall. Repeat with PetBot and Open shell.
  Expected: a comfortable crossing and a return to the corresponding frame,
  without an obstructing rear face or a final camera correction.
- [ ] Enter either station, switch to the other and press Escape. Expected:
  the selected station's project notes return. Repeat on a real phone and in
  Firefox to assess framing, touch controls and motion.

User results are unreported; no checks are waived. Merge and deployment remain
pending the user's later review and instructions.
