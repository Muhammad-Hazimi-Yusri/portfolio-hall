# Gallery lighting and frame batching — 23 September 2026

The gallery's lamp fixtures previously looked unlit, and framed images and
caption planes lacked mounting shadows. The new treatment adds a warm wall
wash, lit diffusers, shallow label housings and soft contact shadows. Frame
batching reduces the full-scene draw count at the same time.

This continues the combined local change. No commit, push, PR, issue change,
merge, deployment or DNS operation was made. Human acceptance remains pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-sr1W6xDA.js`; CSS: `assets/index-CV99Syvm.css`.
- Hall: `assets/HallScene-DHCrQLTi.js`.
- Walking: `assets/BabylonScene-TM3fnaMK.js`.
- Visitors: `assets/visitorDisplay-CS_-B9Ne.js`.
- Manifest SHA256: `70106A79137BDF65CA4A50D2E6F3069E03319FDFA7483AC57FFB95E5D68E259C`.
- Open: http://127.0.0.1:5186/?community=local#project/rubyvr-studio
- Build log: `_local/gallery-lighting-build.log`.

## Implementation

`galleryLighting.ts` creates a 1024×256 lightmap once. A second UV set maps it
over the inside gallery wall. Its pools follow the actual picture-light
positions and have a short line-source shape rather than a point hotspot.
It does not light the back of the wall or modify project-image colours.
Lamp diffusers share one emissive material and one architectural batch.

A 256×256 alpha texture describes the soft frame and caption contact shadows.
Eleven wall planes share it and are merged into one static, non-pickable mesh.
The planes are in front of the wall and behind the framed work, so ordinary
depth testing keeps the shadow off the image. No additional render target or
continuous animation is used. Frame backings cast into the existing static
sun-shadow cache; images and labels do not cast.

Each frame border's four bars are merged in local coordinates before parenting
to the exhibit. The `-frame-` name still allows a per-project hover highlight.
The caption gets a shallow housing merged with the existing backing. All
physical controls and project picking retain their existing routes.

Artwork and caption textures now have mipmaps and anisotropic filtering at 4.
This reduces aliasing at an angle but increases GPU texture memory. The baked
textures also add memory and one-time generation work; there are no new image
downloads in this pass. Physical phone memory/startup behavior is unverified.

## Agent checks

- PASS: build/typecheck, lint, hall layout, exhibit geometry, diff check.
  The initial JavaScript remains 228,082 bytes, with the 3D code separate.
  Vite's pre-existing large Babylon chunk warning remains.
- Inspected the complete gallery bay, including the label housings and shadow
  placement. The dev fixture's Gallery wall view and wall-wash checkbox allow
  direct comparison. Fixtures are excluded from the production entry.
- Explicitly reloaded the built preview. Clicking the physical RubyVR frame
  opened its image dialog. Escape closed it. Clicking the physical right-arrow
  control changed to THE FINALS Outfit Studio, with 5 / 9 in project navigation.
- The 390×844 viewport check showed the gallery stage, navigation and project
  content without horizontal overflow. The temporary override was reset.
  This checks responsive layout in desktop Chromium, not a physical phone.
- No visitor notes or other external content were submitted.

## Performance

Same development fixture as the preceding landscape pass: RTX 3080,
Chromium/ANGLE, 656×636, 12 boats + 28 daily samples + 12 notes, logos paused,
renderer explicitly held awake. Six-second sample
`992529e0-2f44-4f7e-b48a-f8f021487e79`:

| Metric | Previous landscape pass | This pass |
| --- | ---: | ---: |
| Draws per frame | 123 | 92 |
| Scene meshes | 256 | 225 |
| Scene textures | 67 | 69 |
| Frame interval, p95 | 6.2 ms | 6.1 ms |
| CPU, p50 / p95 | 0.7 / 1.0 ms | 0.6 / 0.7 ms |

The 31-draw reduction comes from merging 33 border draws and adding two shared
draws for diffusers/contact shadows. That is a 25.2% reduction in this view.
There were 1,021 frames (170 fps, display-capped), a maximum 7 ms interval, zero
long tasks and zero target refreshes during the fixed-view sample. GPU p50/p95
was 0.33/0.87 ms, but earlier samples varied with GPU conditions; do not infer
a GPU speedup from this comparison. Both versions already reach the frame cap.

The full portfolio section-scroll check, at 723×644, scene
`fb657abf-1abf-487f-be6e-09e6b81ec059`, recorded 1,013 frames / 168.8 fps,
p95 interval 6.5 ms, maximum 36.2 ms and zero long tasks. CPU p50/p95 was
0.5/0.9 ms, GPU 0.38/4.02 ms. Each water target refreshed 171 times in six
seconds; portal previews refreshed only during the relevant parts of travel.
There were two reading-layout measurements and 876 scroll updates.
No build/lint process ran during either timed sample.

After scrolling settled, the same scene completed a 6.01-second idle sample
with **zero rendered frames**, zero render-target passes and zero long tasks;
the document was visible before and after. No browser errors were captured.
The final production entry was confirmed as `index-sr1W6xDA.js`, and the main
preview returned to its normal 1379×1278 viewport after the phone-width check.

These results establish the tested desktop conditions. Firefox scrolling,
physical-phone behavior, headset presentation and owner visual acceptance
remain unverified.

## Owner functional review — pending, about 2 minutes

The preview is running. If a restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local visitor service starts with `npm.cmd run community:local`
in another terminal. Ctrl+C stops a manually started service. The gallery
changes can also be reviewed without `?community=local`.

- [ ] Open RubyVR Studio in the preview. Check the lamp, wall light and soft
  shadow around the frame and its caption. There should be no flickering edges.
- [ ] Click the 3D artwork, close its image viewer with Escape, then click the
  right arrow beside the frame. Expected: THE FINALS with a complete frame and
  the updated project counter; Left returns to RubyVR.
- [ ] Choose Walk here. Expected: the same exhibit and complete mounted label.
  Move/look along the gallery, then return to the portfolio.
- [ ] Try ordinary scrolling in Firefox and on a real phone. Check text
  clarity, input response and any visible stalls; report the browser/device.

No owner boxes are checked or waived. This record does not recommend merge or
claim that the broad visual-polish goal is complete.
