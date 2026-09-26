# Island interaction follow-up — 21 September 2026

## Scope and local state

Continued the shared hardware workshop and island controls for #38, with related
performance and navigation work for #32/#36. The owner requested one combined PR
after returning to the PC. No issue was opened, closed or edited. No commit,
push, PR, merge, deployment or hosting change was made.

- Branch: `codex/hall-display-polish`.
- Base HEAD: `44c38295939ab18e06559859b7bfb337d1276cf5`; earlier uncommitted work
  remains in place. Unrelated `evaluation/` and unfinished community scaffolding
  were not modified in this pass.
- Production build: `index-DWEWf81c.js`, `index-CFjZjEgo.css`, browse
  `HallScene-CgKPgOZp.js`, free roam `BabylonScene-DrLDjcmh.js`.
- Local preview: http://127.0.0.1:5186/ . Development checks used port 5187.
- Previous visual/copy and controls/scroll records remain historical evidence;
  their pending physical-device checks still apply to this newer build.

## Changes

The workshop uses a round fabricated platform with a defined rim and quieter
timber/deck colours. Static furniture, fittings, wheels and deck parts are
merged by material. Movable components and clickable exhibits remain separate.
No new textures, lights or shadow passes were introduced.

PetBot's opening motion now uses elapsed time, so the animation does not depend
on refresh rate. Clicking the selected drone toggles its illustrative hover;
clicking it from the PetBot station selects the drone first. Switching stations
resets the demonstration to Together or Landed.

Island controls occupy their own space below the canvas instead of covering
the drone. Orbit controls sit beside the project controls and wrap on phones,
where their targets are at least 44 px tall. A visible `← Hall` link at the top
of the scene joins the existing lower return link and Escape shortcut. The
shared layout also applies to the AVVR listening room.

Resetting, switching station, entering or leaving clears camera inertia. A
previous drag or zoom therefore cannot keep moving the newly reset camera.
Portal travel still uses the existing scene, cameras and coordinate transition.

The phone check found a separate navigation bug: switching stations jumped from
scrollY 227 to 0 and moved keyboard focus to the project heading. Routes inside
the same island now preserve page position and control focus. The phone footer
uses a consistent two-line layout so differing film/credit text does not cause
native scroll anchoring to move the controls. Entering and leaving retain the
ordinary page navigation behavior; the desktop notes panel resets for the new
project.

## Measured rendering work

Development Chromium using an RTX 3080 through ANGLE/D3D11. Both samples lasted
six seconds at the PetBot station, with the model closed, a 656 × 636 render
canvas and Keep renderer awake enabled. Water, shadows, logos and portal previews
were enabled. Neither settled view rendered additional render-target passes.
The viewport was 1280 × 720 before and 1280 × 932 after, to keep the canvas size
the same while moving the controls below it.

| Measurement | Before | After |
| --- | ---: | ---: |
| Frames | 1,021 | 1,021 |
| Median draws per frame | 64 | 39 |
| Scene meshes | 244 | 219 |
| Scene textures | 54 | 54 |
| Scene triangles | 89,352 | 89,864 |
| Frame interval p50 / p95 / p99 | 5.9 / 6.7 / 7.5 ms | 5.9 / 6.3 / 6.7 ms |
| Maximum frame interval | 11 ms | 7.2 ms |
| CPU p50 / p95 | 0.5 / 0.8 ms | 0.5 / 0.7 ms |
| GPU p50 / p95 | 0.13 / 3.15 ms | 0.11 / 0.18 ms |
| Long tasks | 0 | 0 |

Before scene ID: `6352c59a-1dc6-4c5b-a27b-4c5eb01a72fb`.
After scene ID: `552fd5b0-ee37-40b5-8b09-c825bfc28edd`.

This establishes 25 fewer draws at the matched view (about 39% less draw work),
not a 39% frame-rate increase or a Firefox/mobile performance result. The round
platform adds 512 scene triangles. In the same after scene, hovering the drone,
returning to PetBot and disabling Keep renderer awake produced zero rendered
frames and zero long tasks over a settled six-second sample.

## Local verification

- TypeScript, ESLint, production build, portal checks and scroll checks passed.
  Build validation reports initial JavaScript of 203,718 bytes, separately loaded
  3D, packaged project images and 11 valid project records. Existing Vite chunk
  size and stale Browserslist warnings remain.
- `git diff --check` passed; Git emitted the existing Windows line-ending notices.
- PetBot opens and its eyes follow the sliding front. The selected drone responds
  to a 3D click by entering Hover. Changing back to PetBot resets the demo and
  allows the renderer to sleep.
- Dragging the workshop camera visibly changed its view. Reset view returned
  a 656 × 636 canvas screenshot byte-for-byte to the resting screenshot.
- Top Hall link, lower return link and Escape each returned to the correct
  project route. Re-entry starts the drone Landed. Map fallback retained working
  return links, and Show 3D island restored the workshop.
- At 320 × 568, the retest of PetBot → FPV kept scrollY at 195, station controls
  at the same vertical position, and focus on `02 / FPV drone`.
- At 320 × 568, 390 × 844 and 740 × 390, the hardware layout had no horizontal
  overflow. The 44 px Hall button was reachable near the top, and project/orbit
  controls followed the canvas without overlapping it.
- AVVR sound-source selection, orbit, reset and return worked after the shared
  control changes. At 390 × 844, its controls had 44 px minimum heights and no
  horizontal overflow. Audio playback/perceptual quality was not retested.
- The production preview served `index-DWEWf81c.js`. Entry from the PetBot case
  study reached the rendered workshop with one canvas, separate controls and
  no captured console errors. Hall returned to PetBot; Home returned to the
  entrance. Temporary viewport overrides and the test tab were removed.

These are automated UI interactions and viewport checks in local Chromium.
They do not establish physical touch feel, Firefox smoothness, mobile GPU cost,
headset acceptance or deployed behavior.

## Owner review before the combined PR

Try the workshop with the usual mouse/trackpad and Firefox: enter through the
PetBot frame, open it, choose the drone, toggle Hover, drag/zoom, Reset view,
then return using Escape or Hall. On a phone, confirm that scrolling outside
the canvas is comfortable and that switching stations leaves the controls in
place. Judge the manufactured platform and reduced visual clutter in context.

The iframe workflow limits, visitor service/moderation work and domain migration
remain as described in the earlier local records. No issue acceptance or closure
is implied by this pass.
