# Landscape and visitor ridge — local review, 23 September 2026

Status: implemented and locally checked; owner, Firefox, physical-phone and VR
acceptance remain pending. This is part of the existing combined local change.
No commit, push, PR, issue change, merge, deployment or DNS operation was made.

## Build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-Dk-R234n.js`; CSS: `assets/index-CV99Syvm.css`.
- Hall: `assets/HallScene-Ct0rGrFV.js`.
- Walking: `assets/BabylonScene-CLG80lKc.js`.
- Visitors: `assets/visitorDisplay-BTy0wdCu.js`.
- Manifest SHA256: `393A7F9A39DBA8F9967E059D83D327BB2B1C65725BAB2607D1B950205788A7F1`.
- Preview: http://127.0.0.1:5186/?community=local#contact
- Build log: `_local/landscape-build.log`.

## Change and reason

The old three-row visitor ridge had downward normals and a zero-value datum
above the water. From walking viewpoints it read as a dark, floating slab.
It now has a smooth cross-section with upward normals and a submerged datum.
The dated crest spans the open side of the gallery, at x=48, z=93 to -9;
oldest is on the left when looking outward from the gallery. Values at all 28
days are unchanged. Between-day easing cannot overshoot. Extra physical skirt
outside both dated ends closes below water without adding data peaks.

A static contour at each nonempty day and the crest share one lines mesh.
The ridge has two draws, as before. Both meshes are owned/disposed with the
visitor display and use the existing cached water targets. Empty history
creates no visible ridge. The data remains a count of browser sessions, not
unique people or currently connected visitors.

Three single-sided shore meshes share a matte material, replacing three
double-sided ribbons. Broad shoulders, surface colour and depth create a
coastline on the water side as well as behind Contact. They use 24,576 surface
triangles versus the prior 36,864, and join the existing water reflection list.
This adds three shore draws to a water refresh, not a new target or animation.

The hall sky is the original 1K **Kloppenheim 06 (Pure Sky)** HDR by Greg Zaal
and Jarod Guest, downloaded from Poly Haven under CC0. The asset and license
are linked in `public/sky/README.md`; its 1,173,154-byte file matches the official
MD5. It loads only with the 3D hall and is self-hosted. No network request from
a visitor goes to Poly Haven. A 256-pixel cube replaces the gradient texture
on success. No harmonic generation, irradiance, prefiltering or new render
pass is enabled. Cube texture memory and one-time decoding are additional costs.

The gradient stays visible while loading or on failure. Tone mapping is per
sky material, so artwork and the rest of the lighting retain their colours.
Visual checking caught an initial washed-out sky: the new processing
configuration was attached after its settings changed, missing the dirty
notification on the already-rendered fallback shader. Attaching first fixes
the exposure on cold and cached scene loads. The cached water is invalidated
once after the texture/shader becomes ready.

## Agent checks

- PASS: build/typecheck, lint, exhibit geometry, navigation, scroll, diff check.
  Initial document JavaScript is 228,082 bytes; 3D remains separately loaded.
  The existing large Babylon chunk warning remains.
- Geometry checks cover upward unit normals and winding, finite geometry,
  zero history below the waterline, exact daily sample heights, interpolation
  bounds, closed end skirts, boat clearance and the shore triangle budget.
- Chromium screenshots checked gallery and terrace viewpoints, full synthetic
  history, one-day history and empty history. The real production preview was
  explicitly reloaded after the final build, including the corrected sky shader.
- Final-build navigation smoke: RubyVR Studio Right goes to THE FINALS (5 / 9),
  Left returns to RubyVR, Walk here enters beside RubyVR with its inspect prompt,
  Return restores the project, and Escape focuses the RubyVR gallery link with
  `data-in-view=true` and no page scroll. Contact remains reachable afterward.
- No public visitor notes were posted. Synthetic fixture buttons only update
  local renderer data; they do not call the visitor service.

## Performance evidence and limits

Development visitor fixture, Chromium/ANGLE on RTX 3080, 656×636 rendering,
12 boats + 28 days + 12 notes, logos paused. The final six-second forced-awake
sample, scene `8cf3c020-880c-4e47-9fac-de72ea05efb4`, reports:

- 1,021 frames / 170.1 fps (display-capped), p95 frame interval 6.2 ms, max 7.7 ms.
- CPU p50/p95 0.7/1.0 ms; GPU p50/p95 2.23/3.60 ms.
- 123 draws, 256 meshes, 67 textures; zero long tasks and no target refreshes
  while the viewpoint is fixed.

Draw, mesh and texture counts match the preceding guestbook fixture, but the
cube contains more texture memory than the replaced gradient. GPU timings
varied substantially between runs; these samples do not establish a speedup.
This is a steady-view desktop check, not Firefox scrolling, phone, VR or
cold-start acceptance. Cached reflections still refresh during camera motion,
and the newly reflected coastlines add work to those refreshes.

The visitor fixture's remove/restore cycle returned to 256 meshes and 67
textures. A final six-second Contact sample, with the same scene ID and the
document visible before and after, rendered **zero frames**, refreshed zero
targets and reported zero long tasks. Both the fixture and final production
preview had no captured browser errors. The production entry was verified as
`index-Dk-R234n.js` after the final explicit reload.

The actual development portfolio's section-scroll sample (local visitor data,
723×644 rendering, scene `9acd77f1-626a-4f96-a50f-0e56c8f92e61`) then measured
1,013 frames in six seconds / 168.8 fps, p95 interval 6.5 ms and max 26.6 ms.
It had zero long tasks, two reading-layout measurements and 877 scroll updates.
Each water target refreshed 173 times (about 29 Hz); AVVR/PetBot previews
refreshed 83/9 times during the route. CPU p50/p95 was 0.5/1.0 ms and GPU
0.31/4.04 ms. No build or lint process ran during that sample. This exercises
camera motion, the reading panel, portals and reflected coastlines together;
it still only establishes the tested Chromium desktop conditions.

## Owner review — pending (about 3 minutes)

The preview and local visitor service are running. To restart locally if needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

In another terminal, `npm.cmd run community:local` starts the optional local
visitor service. Do not enable it on a public host as part of this review.
Use Ctrl+C in the respective terminal to stop a manually started service.

- [ ] Open the preview at Contact. Check the clouds, distant shoreline and
  reflected scene; the guestbook should still be legible and selectable.
- [ ] Open RubyVR Studio, use Right/Left to browse projects, then Walk here.
  Expected: start at that frame with its inspect prompt, preserving context.
- [ ] While walking, turn toward the open water side. Check that the visitor
  ridge has depth and no floating dark base. A sparse local history may show
  only one peak; the guestbook has the actual daily counts.
- [ ] Return to the portfolio and press Escape. Expected: the same project is
  in view in the gallery, ready to continue scrolling.
- [ ] Try ordinary hall scrolling in Firefox and on a real phone. Report
  stalls, touch conflicts or readability issues with the browser/device used.

No boxes have been checked by the owner. No checks are waived. No merge or
deployment is being recommended by this record.
