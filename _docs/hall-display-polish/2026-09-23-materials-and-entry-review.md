# Hall materials and walk entry — 23 September 2026

This local pass adds timber grain and stone paving detail, and fixes the
loading state that covered the phone's return control. The existing contextual
walk entry, project navigation, image viewer and portal actions are retained.

## Build

- Branch: `codex/hall-display-polish`, intentional dirty tree preserved.
- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-GuxcRpqD.js`; CSS: `assets/index-ENVbDKs5.css`.
- Browse: `assets/HallScene-DkW1xSZG.js`.
- Walk wrapper: `assets/HallExperience-CuiIgPD9.js`.
- Walk scene: `assets/BabylonScene-BDZLxamS.js`.
- Manifest SHA256: `72F8EB55651C620D056AFFFB88EFBDA20BFD8B103226296CFD1BAAC3099397F3`.
- Initial JavaScript: 227,146 bytes; 3D code remains separately loaded.
- Preview: <http://127.0.0.1:5186/#project/rubyvr-studio>.
- No commit, push, issue change, PR, merge, deployment or DNS change.

## Changes and cost

Timber and paving use original Poly Haven colour maps by Rob Tuytel, with
source links, CC0 attribution and checked MD5s in
[`public/materials/README.md`](../../public/materials/README.md).
The two 1024 × 1024 JPEGs total 690,855 bytes. Grain follows the long axis of
each timber piece at a consistent scale, before rotation and material batching.
Floor joints retain the earlier spacing. Four-times anisotropic filtering and
mipmaps limit oblique blur and distance shimmer.

These replace two generated textures. Mesh count, triangle count and material
batches are unchanged. File size is not decoded GPU memory: assuming RGBA8 and
full mipmaps, the replacement sizes add roughly 9 MiB. This is an estimate,
not measured driver memory. There are no new lights or rendering passes.

A trial with two additional normal maps made little useful difference at the
normal viewing distance and increased sampled GPU time; those maps are not
packaged or loaded. Plain materials remain usable until colour maps finish.
Map readiness wakes the view and invalidates the cached reflection without
making reflections continuously redraw.

The old blue spinner and staged percentage have been replaced by a loading
state using the portfolio's typography and paper palette. It shows the actual
scene stage and a 44 px return link. The module-loading fallback and scene-loading
screen both retain the entry route. Escape also cancels loading. Controls behind
the screen stay hidden until readiness; the canvas then receives keyboard focus.

## Local measurements

One six-second project-scroll sample per version in Chromium IAB on an RTX 3080
via ANGLE/D3D11, viewport 1280 × 720, render canvas 723 × 644. Water, shadows,
logos and portal previews enabled; Keep renderer awake disabled. These samples
used `?profile=1`, without the local visitor-service preview.

| Version | Frame p95 | GPU p50 / p95 | Median draws | Long tasks |
| --- | ---: | ---: | ---: | ---: |
| Previous generated surfaces | 6.4 ms | 0.33 / 3.57 ms | 33 | 0 |
| Colour + normal-map trial | 6.5 ms | 0.98 / 4.15 ms | 33 | 0 |
| Retained colour maps | 6.4 ms | 0.31 / 3.66 ms | 33 | 0 |

All samples rendered about 170 frames/sec. The small differences between the
previous and retained versions are within the limits of these single desktop
samples; no speedup is claimed. The retained scene has 257 meshes, 177,436
triangles and 65 textures. A settled six-second RubyVR sample recorded zero
scene renders, render-target passes, long tasks or scroll-layout measurements.

Scene IDs, in table order:
`7a7c4488-1dfb-45a8-b9a7-f9f89ef8b5f6`,
`80a986b0-c53e-41ea-b707-b0e4538910d6`,
`563557db-208e-43b9-9dbe-ec1c38f5275a`.
Measurements preceded the final loading-screen change; that change does not
alter the browse scene. They do not measure startup, Firefox, physical-phone
performance, touch latency or headset comfort.

## Verification

- PASS: lint, TypeScript/production build, all 11 project content/asset checks,
  contextual-navigation checks and normal Git whitespace check. Movement and
  hall-layout checks also passed in this pass. Existing large Babylon chunk
  warning remains.
- PASS on production material build: RubyVR → Walk here arrives facing RubyVR;
  Return reopens its project notes. Right opens THE FINALS, Left returns to
  RubyVR and Escape resumes `#gallery/rubyvr-studio`.
- PASS on final build `index-GuxcRpqD.js` at 390 × 844: the walk-loading state
  offers `#project/rubyvr-studio` as its return destination, then gives way to
  the walk view. Inspect RubyVR is visible; the canvas has focus; there is no
  horizontal overflow. Portfolio returns to RubyVR's notes.
- PASS in the isolated local loading-component fixture: Escape and the visible
  return link both navigate to the configured project hash. The return target
  is 44 px high and the component fits 390 × 844. This holds the loader visible
  for inspection; it is not a simulated slow-network end-to-end test.

## Owner checks — pending

Preview is running. If it stops, from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops it. A rebuild after further edits needs a new build identity.
No account or community service is required for these checks.

- [ ] Open RubyVR using the preview link. Inspect the timber and paving, then
  use Right, Left and Escape. Frame, title, counter and return position should agree.
- [ ] Choose Walk here from a project. Expect to arrive beside that frame,
  facing it. Return should reopen the same notes. Try ordinary movement and
  inspection; controls should stop when released or when focus is lost.
- [ ] If the loading screen lasts long enough, use Back to portfolio or Escape.
  Expect the entry page. Re-enter and let loading finish; expect working controls
  and no loading overlay. The isolated development fixture is available at
  <http://127.0.0.1:5187/_local/walk-loading-review.html> for the component itself.
- [ ] Repeat scrolling and walking in Firefox and on a real phone using a
  prepared reachable preview. Check texture shimmer, smoothness and control
  placement; this loopback address only reaches the current PC.

Owner visual acceptance, physical-device checks and the broader backlog remain
open. These checks do not establish deployment or permission to publish.
