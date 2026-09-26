# Workshop canopy and inspection — 23 September 2026

Local work on `codex/hall-display-polish`, preserving the accumulated changes.
No commit, push, issue operation, PR, merge, deployment or DNS change.

## What changed

The hardware workshop now has a timber-lined, pitched canopy, a slatted side
screen and a tiled platform. The timber and floor use the hall's existing source
textures. Its sky shares the hall's panorama and loading fallback instead of a
separate flat blue background and decorative moon. A loaded panorama invalidates
the cached portal previews so the hall's frames show the updated environment.

The front columns splay out to clear the drone's flight pad. The real drone
photograph and its video action sit beside the bench, clear of the support.
The models retain their existing illustrative-model disclosure and project roles.

An intermediate version let the roof hide the exhibit when the camera orbited
above it. The final version separates two canopy material batches and fades them
out as the camera approaches roof height. At eye level and through the hall
windows, the complete roof returns. The fade follows camera position in the
existing update; it introduces no separate animation loop or render target.
Fully hidden batches are disabled, and settled views can still stop rendering.

## Build and agent checks

Final entry: `assets/index-v_2mU5lA.js`; CSS: `assets/index-DAtFXVZl.css`.
Browse: `assets/HallScene-Cz1ORel-.js`.
Walk: `assets/BabylonScene-DD-mlqeu.js`.
Manifest SHA256:
`04C447ED7AAC6398914DE32952022ADE7B914789B36502E8F333FF715360E2F1`.
Build log: `_local/workshop-canopy-build.log`.

Build/typecheck, lint, exhibit geometry, portals and diff checks passed. The
build validated 11 project records, assets and routes. Initial JavaScript is
249,958 bytes under the unchanged 250,000-byte gate. The existing large Babylon
chunk warning remains.

Local Chromium review covered normal PetBot and FPV views, opening PetBot,
drone hover and close inspection, switching stations, and both hall windows.
At 390×844, the final compiled build kept PetBot visible after two upward-orbit
drags, including with its shell open. Reset restored the roof. Returning from
the overhead view restored the hall's normal PetBot preview. The drone, source
photograph and controls remained accessible, with no horizontal overflow.
One scene canvas and no captured console errors were observed.

The preceding navigation work remains documented separately in
`2026-09-23-interaction-continuity-review.md`: Walk here from the current view,
contextual project arrows/counts, focus retention and layered Escape behavior.

## Rendering comparison

Public development profiler, same default assembled PetBot view, 1280×720
viewport, 723×488 render resolution, local Chromium on an RTX 3080. Six-second
forced-awake samples after scene warm-up; no builds ran during sampling.

| Measurement | Original workshop | Final canopy with cutaway |
| --- | ---: | ---: |
| Draw calls | 43 | 44 |
| Reported triangles | 161,407 | 156,333 |
| Scene meshes | 212 | 213 |
| Texture objects | 64 | 65 |
| Frame time p50 / p95 | 5.9 / 6.0 ms | 5.9 / 6.1 ms |
| CPU p50 / p95 | 0.3 / 0.5 ms | 0.4 / 0.6 ms |
| GPU p50 / p95 | 0.19 / 0.34 ms | 0.14 / 0.17 ms |
| Long tasks | 0 | 0 |
| Offscreen target passes during sample | 0 | 0 |

Final scene ID: `bd7d6e9d-ec26-437e-b3af-e0204171295f`.
The final forced sample rendered 1,021 frames in 6.00 seconds. An intermediate
canopy sample had GPU p50/p95 of 0.23/0.40 ms; GPU variation is not evidence of a
speed improvement. Splitting the roof adds one draw call, while removing the
decorative sphere reduces geometry. Existing render-target sizes are unchanged.

With forced rendering off, the final 6.01-second settled sample rendered **zero
frames**, with zero target passes and zero long tasks. These are bounded desktop
samples, not Firefox or physical phone performance acceptance.

## Owner review — pending

Preview: <http://127.0.0.1:5186/?community=local#world/hardware/petbot>.
Services are already running. If a rebuild/restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

The optional visitor service uses `npm.cmd run community:local` in another
terminal. The loopback URL works on this PC; a phone needs a reachable preview.

- [ ] Enter PetBot, drag to look down from above, and open its shell. Expect
  the roof to fade away before it obscures the model. Reset the view and expect
  the canopy to return without hiding the robot.
- [ ] Switch to FPV with the station controls and reading arrows. Inspect its
  camera/wiring, use Hover and Reset, and expect the model to remain clear of
  the supports with the correct notes and exhibit count.
- [ ] Return to the hall from an overhead view, then enter the other hardware
  frame. Expect a complete preview and the correct station on each crossing.
- [ ] Repeat orbit, station switching and the current-view Walk here flow in
  Firefox and on a real phone. Report any input lag, clipping or lost position.

Owner visual acceptance, real pointer capture, Firefox, physical phone and
headset checks remain pending. The broader iframe, hosting and domain work is
not closed by this pass.
