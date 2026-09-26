# AVVR display and room composition — 23 September 2026

The listening room previously devoted most of its back wall to three blank
acoustic panels and placed the original application on a small side display.
The original screenshot is now the main display, framed by two narrow acoustic
panels. A closer, lower viewpoint gives the speaker and its controls more space.

This remains part of the combined local change. No commit, push, PR, issue
change, merge, deployment, DNS change or external submission was made.

## Review build

- Branch: `codex/hall-display-polish`, dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-IwFL71oz.js`; CSS: `assets/index-BVpyGeZ9.css`.
- Hall: `assets/HallScene-CPhM6e_r.js`.
- Walking: `assets/BabylonScene-CYuDahQR.js`.
- Visitors: `assets/visitorDisplay-CCHEgqHo.js`.
- Manifest SHA256: `3C3F6DC91FD80C095690597E63436347742ED7E4C309F353A2B6295F77999C59`.
- Open: <http://127.0.0.1:5186/#world/avvr/avvr>.
- Build log: `_local/avvr-display-build.log`.

## What changed

The existing, unedited `avvr-2.webp` screenshot now occupies a 5.28 × 2.97
display, preserving its native 16:9 ratio. The former small display stretched
it to approximately 1.6:1. Its caption identifies the original Unity application
and the university team project. The physical screen and caption open the
existing accessible image viewer directly; the hover hint uses the same image
action as the pick. Escape closes the viewer and returns focus to Hall.

The speaker cabinet, platform, slatted wall and display surrounds reuse the
original self-hosted timber scan already used in the hall. Grain follows each
piece's long axis. The old generated grain texture is removed. The existing
fabric weave is shared by the panels and a matte carpet, with a timber border;
the former floor-joint strips are removed.

The three source pads now have an outline on all four edges. Each outline is
merged into one pickable mesh, retaining one draw per pad. The selected source
has a warm outline; the speaker and HTML controls continue to follow it.
One unshadowed warm light is placed beneath the existing wall diffuser and
filtered to the AVVR island. There are no new render targets, animated textures,
downloaded assets or continuous visual effects.

The room remains a portfolio illustration with a Web Audio example, not a
reconstruction exported from AVVR or a simulation of its acoustics. Existing
attribution and project links remain. The published project and resource index
were checked at [Itch.io](https://chronohaxx.itch.io/avvr) and
[the team's resource page](https://linktr.ee/gdp4); no original 3D scene asset was
obtained or claimed in this pass.

## Agent verification

- PASS: production build/typecheck, lint, navigation, portal and exhibit
  geometry checks, and Git whitespace check. Initial JavaScript remains
  230,632 bytes; 3D loads separately. The existing Babylon chunk warning remains.
- In development, clicking the physical right pad selected Right and moved
  the speaker onto its outlined pad. The central display opened the original
  screenshot in the image dialog with focus on Close.
- Escape kept `#world/avvr/avvr`, Right selected, document/reading scroll at 0,
  and restored focus to Return to hall. Explicit Play and Stop changed their
  pressed state correctly. This does not establish headphone output quality.
- Compiled build `index-IwFL71oz.js` at 390 × 844: Centre was selected, the
  physical screen opened the correct original screenshot, and Close retained
  Centre. The page and image viewer had no horizontal overflow. Orbit/Reset
  controls remained usable, and Hall returned to the AVVR notes at
  `#project/avvr`. No captured console errors were present.
- The temporary viewport was reset. The main preview was explicitly reloaded
  to the compiled build at 1379 × 1278 for the final visual check.

### Rendering cost

Six-second local Chromium samples on RTX 3080/ANGLE used a 723 × 511 render
canvas, source Left, sound off and all normal profiler toggles enabled. Keep
renderer awake was on for the comparison. These compare the old and new
default compositions, including the intentional camera change; they are not
identical-camera shader benchmarks. No build/lint ran during either sample.

| Metric | Before | After |
| --- | ---: | ---: |
| Rendered frames | 1,021 | 1,021 |
| Frame interval p95 | 6.1 ms | 6.1 ms |
| CPU p50 / p95 | 0.3 / 0.4 ms | 0.2 / 0.4 ms |
| GPU p50 / p95 | 0.30 / 0.31 ms | 0.31 / 0.34 ms |
| Median draws in default view | 34 | 31 |
| Total scene triangles | 166,662 | 165,138 |
| Scene meshes / texture objects | 219 / 67 | 219 / 67 |
| Long tasks / offscreen passes | 0 / 0 | 0 / 0 |

Before scene: `3f5ac6be-aa73-4e9f-ae3f-ae0f17572d72`.
After scene: `6bd6f737-8548-4b75-9ec1-266c3c8287f5`.
The small timing differences do not establish a speedup. The added light costs
fragment work; texture-object counts are not GPU-memory measurements.

After the image-viewer interaction was added, scene
`4cfa34a7-e33b-437b-be13-65c4ca3d7369` recorded zero rendered frames, offscreen
passes, long tasks and scroll-layout measurements across six settled seconds
with sound enabled and forced rendering off. The document was visible when
checked afterward. This is demand-rendering evidence, not zero audio/CPU work.

## Owner review — pending, about two minutes

The preview is running. If necessary, restart it from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

No community service or account is required. Ctrl+C stops a manually started
preview server.

- [ ] Open the review URL. Inspect the original screen, speaker, timber and
  carpet. Try Left/Centre/Right both in the toolbar and on the floor.
- [ ] Click the in-room screen, inspect the original at full size, then close.
  Expected: the same room, selected source and reading position remain.
- [ ] With headphones, choose Play, move the source, orbit and Reset. Judge
  whether sound direction and level feel clear. Stop and return to the hall.
- [ ] Repeat the room and image-viewer loop in Firefox and on a physical phone.
  Check visual composition, touch control and smoothness.

Owner visual acceptance, actual headphone output, Firefox, physical phone and
headset checks remain pending. This does not establish overall completion or
merge/deployment readiness.
