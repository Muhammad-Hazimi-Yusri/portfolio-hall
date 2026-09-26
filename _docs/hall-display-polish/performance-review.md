# Visual and performance repair — 20 September 2026

The user found the previous environment and project presentation generic and
reported poor performance. They specifically identified the architecture/props
and the layout/typography. This follows `environment-review.md`; that revision's
successful functional checks did not establish visual or performance acceptance.

Branch: `codex/hall-display-polish`, local working tree. Nothing committed,
pushed, merged or deployed in this repair. Production baseline remains `44c3829`.

## What changed

- Removed the browse renderer's 32 ms gate. It was producing about 28 fps on
  hardware with ample headroom, with uneven timing against the display refresh.
- Browse views now render at the display's cadence during travel and nearby
  logo animation, and stop scene renders after a stationary view settles.
  Navigation, resize, late artwork/logo loads and highlight changes wake it.
  Pausing the logos lets the experience view settle too. Background tabs pause.
- Cached static shadows, excluding animated logos and billboard labels. Water
  is still, with reflection/refraction targets refreshed when the camera or its
  projection changes. XR keeps the previous continuous water-target behavior.
- Disabled drawing-buffer preservation and made browse resolution explicitly
  one render pixel per CSS pixel, avoiding extra high-DPI rendering cost.
- Replaced the dense white slats with exposed pitched timber frames and broad
  eaves. Removed repeated potted plants, the circular crown and ornamental
  portal. Retained the connected walkable decks, seating, exhibits and logos.
- Simplified wayfinding and controls, removed the reading-pane mask and control
  backdrop blurs, and added a legible backdrop behind the stage heading.
- Shorter introduction, a clear name heading, larger actual project previews
  for Food Wars and AVVR, and numbered entries for the remaining work. Removed
  the placeholder technology tiles. Project authorship/status claims unchanged.
- Fixed overlapping TNEI/Audioscenic destinations in the free-roam strip by
  separating their vertical positions and enlarging their pointer targets.

## Measurements

Opt-in development instrumentation in `src/3d/performanceAudit.ts`, entered via
`http://127.0.0.1:5187/?profile=1`. Six-second samples after loading, 1360 × 900
browser viewport, 697 × 816 render canvas. In-app browser on Windows, ANGLE /
NVIDIA GeForce RTX 3080 / Direct3D 11. CPU time is the measured before/after-scene
render interval; fps counts actual scene renders, not engine RAF callbacks.

| Scene and setting | Rendered fps | Frame interval p95 | CPU interval median | Draw calls/frame |
| --- | ---: | ---: | ---: | ---: |
| Original entrance, 32 ms gate | 27.7 | 42.0 ms | 1.4 ms | 240 |
| Original entrance, only gate disabled | 169.5 | 7.8 ms | 2.8 ms | 240 |
| Revised entrance, forced continuous for comparison | 121.0 | 18.3 ms | 0.9 ms | 111 |
| Original TNEI view, gate disabled | 109.9 | 19.1 ms | 1.0 ms | 155 |
| Revised TNEI view, normal animated operation | 123.8 | 17.5 ms | 0.5 ms | 25 |
| Revised entrance, normal settled operation | 0 (0 frames) | — | — | — |
| Revised TNEI view, logos paused and settled | 0 (0 frames) | — | — | — |

Scene triangles: 121,142 → 61,114 (about 50% less). The original entrance with
water and shadows disabled drew 112 calls/frame, confirming their contribution
to repeated work; its 112.9 fps also illustrates the variability between these
short samples. Timing depends on display/browser scheduling and host load.
The gate-only A/B establishes the artificial cap. The other results establish
reduced per-frame work and idle scene rendering, not a universal speed multiplier.
The entrance camera framing also changed in the visual revision.

These are desktop measurements, not a low-end-phone or headset benchmark.
Zero scene frames does not mean zero total browser CPU use: DOM interactions
and the lightweight renderer wake-up check still run. No telemetry is sent.
The audit module and UI are excluded from the production build.

## Agent checks

- Lint, TypeScript, production build and content/asset validation passed.
- Initial JS about 190 KB; Babylon stays lazy. Existing large-chunk warning.
- Existing logo geometry/motion, scroll and connected-layout checks passed.
- Idle entrance sampled at zero scene frames, then resumed through navigation.
- Animated TNEI display sampled at native cadence; Pause logos settled to zero
  scene frames. Geometry still has real front/back surfaces and letter holes.
- Production preview: scrolling over the canvas moved the notes and focused
  AVVR; clicking its actual 3D frame opened `#project/avvr`.
- Switching to the map removed the canvas. Enter on its Audioscenic marker
  opened the correct experience; returning to 3D preserved the selection.
- Mobile 390 × 844: selected experience remained readable after resizing;
  map Contact navigation placed content at y=351 below the 320px sticky stage,
  with no horizontal overflow and no canvas while in map mode.
- Final build at 320 × 740: no horizontal overflow, map preference retained on
  reload, no canvas in map mode. Developer audit absent from production assets.
- Free roam started and travelled to TNEI. Its 24px destination target now has
  a 4px gap from Audioscenic instead of sharing exactly the same hit area.
  Clicking it focused TNEI and the viewport arrived at the TNEI logo/plaque.
  Only the pre-existing missing-avatar fallback warning appeared in the console.

## Human review pending

Preview: `http://127.0.0.1:5186/` (local production build). If restarting:
`npm.cmd run build`, then `npm.cmd run preview -- --host 127.0.0.1 --port 5186`.

- [ ] Entrance → scroll over the hall into Work and Projects. Check pacing and
  judge whether the timber structure and presentation feel more intentional.
- [ ] Click a 3D exhibit, read its notes, use the map and return to 3D. Check
  that the selected project remains correct and the content is easy to browse.
- [ ] Experience → try all three logos, Pause/Play logos, then Walk around.
  Check ordinary movement with your physical mouse and keyboard.
- [ ] On a phone, scroll the notes and use the map's Contact link. Check actual
  device smoothness, touch behavior and readability.

User aesthetic acceptance and device/headset acceptance remain unconfirmed.
The pre-existing `evaluation/` directory remains untouched.
