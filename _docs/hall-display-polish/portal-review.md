# Project islands — local review, 20 September 2026

The hall now connects to two spatial exhibits through live picture frames.
AVVR has a listening room; physical builds share a hardware workshop, starting
with PetBot and the FPV drone. These are small, illustrative portfolio
environments. AVVR is not a reconstructed scan, and the hardware models are
not measured CAD or physical simulations.

## Build and scope

- Branch: `codex/hall-display-polish`, uncommitted working tree on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Local production build: 20 September 2026, about 23:19 BST, including FPV.
  Scene bundle: `HallScene-A3XclG_9.js`.
  Entry bundle: `index-BtJz22EX.js`; CSS: `index-BzBRVzdx.css`.
  `dist/index.html` SHA256:
  `F7A079661ABB0C5CD147E3CC9BEFA8BF152B2D467D01BA68D87C6ED7FBD0F9C6`.
- Preview: <http://127.0.0.1:5186/#project/avvr>.
- Workshop: <http://127.0.0.1:5186/#world/hardware>.
- Drone frame: <http://127.0.0.1:5186/#project/fpv-drone>.
- Initial JavaScript: 197,457 bytes; Babylon and the world geometry stay lazy.
- No commit, push, merge or deployment in this pass. The deployed baseline is
  unchanged. The pre-existing `evaluation/` directory was left untouched.

The browse scene prepares both islands and their small local assets in advance.
Crossing preserves the engine, canvas and scene. Physical frame-relative
projection gives the preview parallax; the camera crosses the frame plane,
changes coordinate systems, then eases into the orbit view. The return follows
the inverse path. The portal backs are culled and the travel near plane is
small enough to avoid exposing the wall behind the frame. Reduced motion skips
camera travel. This does not add portal travel to the separate free-roam/VR mode.

AVVR's user-started Web Audio tone uses HRTF panning from the viewing position.
Source controls, orbit buttons and Reset view have DOM equivalents. Audio closes
on leaving the island, map mode, tab hiding or component disposal. Its synthetic
tone illustrates position; it does not reproduce Steam Audio acoustics.

PetBot's coral enclosure, wheels and display are based on the existing team
photograph. Open up separates the front and lid. The laptop shows the real
project photograph, and the original team demo remains linked. The FPV drone
shares the deck with its own flight pad, archived photo and optional hover.
Its original 2023 diary and Southampton Common film underpin the new notes;
see `fpv-sources.md` for provenance. Selecting a station changes the notes and
camera within the same scene, with a return to that project's hall frame.
Both picture frames enter the shared island. The model's colours and components
follow the actual photo. The reused mount design is credited in the notes.

The reading panel now has narrow frosted edges, with proximity-based blur and
opacity on out-of-focus exhibit/experience entries. Hover or keyboard focus
restores clear content. Scroll with hall remains on by default and disabling it
removes the treatment. Reduced motion/transparency preferences disable the
reading effects. Small screens put the world controls below the main scene area.

Availability is now Liverpool / remote-first. Contact and CV mention hybrid work
around Liverpool and Manchester; the private London caveat is not repeated.

## Agent verification

Passed: lint, TypeScript/production build, portfolio content and asset checks,
`check:logos`, `check:scroll`, `check:hall`, new `check:portals`, and whitespace
validation. The portal checks cover inverse transforms, crossing direction,
off-axis texture corners, near/far depth and valid destination routes.
The local performance-audit UI is absent from production scripts.

Browser checks passed in Codex's in-app browser:

- Actual PetBot picture pick enters the workshop; AVVR enters from its link.
- Actual FPV picture pick enters the shared workshop. Clicking the physical
  drone from the PetBot view selects FPV notes; Escape returns to the FPV frame.
  Station controls switch between PetBot assembly and drone hover/landing.
- Both worlds render; source selection, orbit/reset and PetBot separation work.
- Actual 3D return-frame pick, Return to hall, Escape and Back/Forward work.
- Play/Stop state changes without a browser error. Perceived headphone panning
  and physical pointer/touch comfort still need the user check below.
- Map/3D switching preserves the project. A direct
  `?force2d=true#world/hardware` load has zero hall canvases and readable notes.
- Desktop 1360×900 and narrow 390/320×844 layouts reviewed. At the 320-wide
  viewport, document width and scroll width were both 305 CSS pixels (scrollbar
  excluded); controls were within bounds. The hardware canvas is 330 pixels
  high at 390/320; the objects remain above the controls. Switching the FPV
  island to map mode yielded zero hall canvases while keeping its notes.
- Focused AVVR content measured opacity 1 / no blur; adjacent entries softened.
  Disabling Scroll with hall yielded `filter: none` on all project entries.
- No new browser errors observed. The pre-existing free-roam avatar fallback
  warning is unrelated to the new browse islands.

### Short performance samples

RTX 3080, ANGLE D3D11, 1360×900 viewport, 697×816 canvas, six-second samples.
These are local browser measurements, not phone or headset acceptance.

| View / state | Scene renders | Median draw calls | CPU p95 | GPU p95 |
| --- | ---: | ---: | ---: | ---: |
| Workshop settled, default demand rendering | 0 in 6 s | — | — | — |
| Workshop with renderer forced awake | 1,021 / 170.1 fps | 47 | 1.3 ms | 3.15 ms |
| AVVR, spatial tone / pulse active | 1,021 / 170.1 fps | 34 | 0.9 ms | 2.92 ms |

The first workshop's scene ID remained
`124c2a9e-bb46-4a16-b65c-2a99c9a35bdf` across return and re-entry. The forced
workshop sample includes the entry tail; it is not a claim of steady performance
on every device. Scene geometry was approximately 82k triangles including the
hall, both islands and logos; camera layers keep other destinations out of the
main view. These first samples predate the FPV addition.

After adding FPV, on the same renderer and 697×816 canvas, a six-second active
hover sample returned 1,010 frames / 168.3 fps, median 62 draw calls, CPU p95
1.5 ms and frame interval p95 6.7 ms. GPU timings varied (median 0.06 ms, p95
11.3 ms), so they are not used as a stable GPU-cost claim. Total scene geometry
is 88,296 triangles, 244 meshes, 54 textures.

Switching to PetBot kept scene ID `065ca576-ed28-47e6-8da3-9524cf31c32a`.
A second foreground six-second sample then recorded **zero scene renders**,
with Keep renderer awake off. This confirms the hover stops when changing
stations and the settled workshop retains demand rendering.

## User review — pending

No account or setup needed while the local preview is running. Headphones are
useful for step 2. Allow about three minutes. If restarting locally:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

- [ ] **1. Portal:** Open the AVVR preview above and select the picture or Enter
  the island. The camera should cross the picture into the listening room,
  without a loading screen or white flash.
- [ ] **2. Interaction:** Select Left/Right, play the tone with headphones, drag
  to orbit and scroll to zoom. Stop tone must silence it. Reset view restores
  the initial composition.
- [ ] **3. Return/repeat:** Return to hall, re-enter, then press Escape. Try
  browser Back/Forward. The camera and project notes should agree each time.
- [ ] **4. Hardware:** Open the workshop link. Toggle Together/Open up and
  inspect PetBot. Select FPV drone, try Hover/Landed, then select PetBot again.
  Notes and controls should match each station without leaving the island.
  Confirm the drone photo, contribution wording and film are the right ones.
- [ ] **5. Reading:** In Projects, scroll with hall on, then turn it off. The
  nearby exhibit should remain clear; off-focus material should soften smoothly
  only with the effect on. Check Contact/CV location wording.
- [ ] **6. Small screen/fallback:** Narrow the browser or use a phone. The
  controls and project links should fit. Use hall map, then Show 3D island;
  project notes must remain reachable. Check motion/legibility preferences on
  an actual device if those settings are enabled.

User visual, physical input, audio and mobile performance acceptance: **pending**.
No merge authorization has been requested for this revision. A meaningful later
change requires retesting the affected items.
