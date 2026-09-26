# Terrain relief — local review, 23 September 2026

Implemented and checked locally. Owner visual approval, Firefox, physical-phone
and headset acceptance remain pending. Part of the combined local change;
no commit, push, PR, issue change, merge, deployment or DNS operation was made.

## Review this build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BZSC5aF3.js`; CSS: `assets/index-CqUzzxiD.css`.
- Hall: `assets/HallScene-hsbxHhfL.js`.
- Walking: `assets/BabylonScene-B_C5XdNN.js`.
- Visitors: `assets/visitorDisplay-hPDR7Td2.js`.
- Manifest SHA256: `BCECF657D432E70D6D983EF9DEC0857178A03181ED41AF01059B64CD118FDCCB`.
- Preview: http://127.0.0.1:5186/?community=local#
- Build log: `_local/terrain-relief-build.log`.

## What changed

Three repeating procedural hills are replaced with reduced elevation samples
around Rùm, Eigg and Canna. These are resized, rotated and rearranged as fictional
scenery. They are separate from the visitor ridge, whose recorded daily values
are unchanged. The samples give the shore actual inlets, shoulders and valleys.
The first placement overwhelmed the terrace; the final elevations are lower,
with more distant placement and less aggressive fog.

Sky occlusion is baked offline into one byte per terrain vertex. The browser
decodes that shading without tracing terrain rays on startup. A shared original
1K Rocky Terrain colour texture by Amal Kumar adds surface detail. The source,
licences, modifications, SHA256s of elevation inputs and texture MD5 are in
`public/terrain/README.md`. The footer links to a public Scene credits page,
which also credits the existing sky and paving/timber assets.

The terrain retains three static meshes, one material and 24,576 triangles.
It uses the existing cached water reflections; no new shadow pass, render target
or animation was introduced. The JSON adds 64,933 source bytes to lazy 3D code.
The texture adds a 905,179-byte first download, a 1024×1024 image with mipmaps
in memory and one texture sample on terrain fragments. This is a visual-quality
tradeoff, not a claimed performance improvement. Everything is self-hosted.

## Agent checks

- PASS: build/typecheck, lint, exhibit geometry, navigation, browse-look and
  `git diff --check`. Initial JavaScript is 233,111 bytes; 3D stays separately
  loaded. The existing large Babylon chunk warning remains.
- Geometry checks cover winding/unit normals, finite colour/UV data, submerged
  crop boundaries, clearance from the hall/boats/visitor ridge and the triangle
  budget. Existing checks still verify exact visitor values and interpolation.
- Viewed arrival, gallery water, guestbook terrace and the focused TNEI display.
  At 390×844, the compiled experience controls remain 44 px high with no
  horizontal overflow. Scene credits also fits that width.
- Compiled navigation smoke: RubyVR Right → THE FINALS (5 / 9), Left → RubyVR
  (4 / 9), Walk here → RubyVR inspection prompt, Return → RubyVR notes,
  Escape → `#gallery/rubyvr-studio` with its gallery link focused and in view.
- The compiled entry and ready scene were verified after reload. No captured
  production errors since the build. During development HMR briefly combined
  the new decoder with the previous JSON before the generator completed;
  regenerating and reloading resolved that development-only mismatch.

## Performance evidence

Development Chromium/ANGLE on RTX 3080, 723×644 rendering, six seconds,
scene `26cc0f3c-17b8-4a1f-b0b5-d86e4d50c09f`. Normal water/shadow/portal/logo
settings, forced-awake disabled. No build or test process ran during sampling.

- Work-to-projects scroll: 1,014 frames / 169 fps, p95 interval 6.4 ms,
  max 38.5 ms; zero long tasks. CPU p95 0.9 ms; GPU p95 3.7 ms.
- Two layout measurements, 877 scroll updates. Each water target refreshed
  173 times (about 29 Hz); median 35 draws.
- After moving to Contact and settling: zero rendered frames, zero target
  refreshes, zero layout measurements and zero long tasks for six seconds.

These are bounded desktop samples, not an isolated before/after comparison or
evidence of lag-free Firefox, phone, cold-start or headset use.

## Owner review — pending, about four minutes

The preview is running. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local visitor service uses `npm.cmd run community:local` in another
terminal. Ctrl+C stops a manually started service. No public backend is required.

- [ ] **Arrival:** open the preview above. Check the shoreline, rock detail and
  reflections. The hall and its controls should remain the main focus.
- [ ] **Project browse:** open RubyVR Studio. Press Right, then Left. Expected:
  THE FINALS at 5 / 9, then RubyVR at 4 / 9, with readable next/previous controls.
- [ ] **Walk and return:** click Walk here. Expected: start by RubyVR with its
  notes prompt. Return to portfolio, then Escape. Expected: RubyVR notes first,
  then the gallery at that same project, ready to continue scrolling.
- [ ] **Experience and credits:** open TNEI, then All experience. Expected: a
  readable plinth and a clear return. Scene credits should open its source page.
- [ ] **Firefox and phone:** scroll through the hall on Firefox and a real phone.
  Check for stalls, texture shimmer, clipped controls or touch conflicts. Include
  the device/browser and failing action in any report.

User results: pending; no checks waived. No merge or deployment recommendation.
