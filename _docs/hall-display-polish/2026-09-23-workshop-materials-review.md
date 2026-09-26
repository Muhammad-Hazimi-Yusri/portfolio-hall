# Workshop materials and grounding — 23 September 2026

The hardware island's bench previously read as a flat orange surface, and its
task-light fixture did not illuminate the workspace. PetBot's existing contact
shadow was hidden inside the cutting mat. This pass gives the bench scanned
grain, makes the task light work, and restores the robot's grounding cue.

The existing local combined change is preserved. No commit, push, PR, issue
change, merge, deployment, DNS operation or external submission was made.

## Review build

- Branch: `codex/hall-display-polish`, dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-Cn70vsRe.js`; CSS: `assets/index-BVpyGeZ9.css`.
- Hall: `assets/HallScene-CFX0sUe6.js`.
- Walking: `assets/BabylonScene-mfcDwWeX.js`.
- Visitors: `assets/visitorDisplay-BEGVDm18.js`.
- Manifest SHA256: `B9E1C407EDCBD73AF2551DC8A72A762DA25B07348260A7BD2D3FEC058B084281`.
- Open: http://127.0.0.1:5186/?community=local#world/hardware/petbot
- Build log: `_local/workshop-materials-build.log`.

## Changes

The bench, shelf and entrance board reuse the existing original Poly Haven wood
scan, with long-axis UV mapping and a workshop-specific tint. The original
image/provenance remains in `public/materials/README.md`. No external asset,
generated image or dependency was added. The small generated grain texture is
removed. The shared surface loader retains its plain-material fallback and
one-time render/cache invalidation on image readiness.

One warm spot light is placed below the task-light rail and aimed toward the
bench. Its layer filter includes only the hardware island. It has no shadow
generator or new render target. The diffuser gets a separate unlit material,
which adds one static batch/draw. The light adds fragment-shader work; it is not
free even though the local sample remains display-capped.

The PetBot contact-shadow plane moves from y1.233 to y1.247, above the cutting
mat's top at y1.244. Its existing shared soft-shadow texture is unchanged. The
mat's texture now has clear minor/major grid lines corrected for its physical
aspect ratio; it does not advertise a measured model scale. The models remain
illustrative assemblies, with the original photos and factual roles retained.

## Agent checks and performance

- PASS: build/typecheck, lint, portal checks, exhibit geometry checks and diff
  check. Initial JavaScript remains 230,632 bytes, with 3D loaded separately.
  The existing large Babylon chunk warning remains.
- Visually inspected the assembled/open PetBot and the drone station. The mat
  grid and contact cue are visible; the original model photographs remain.
- The compiled phone-size check at 390×844 opened PetBot, switched to FPV and
  enabled Hover without horizontal overflow. Station switching retained
  document scrollY115. This is desktop Chromium at a phone size, not a device
  performance result.
- Returning the drone to Landed and choosing Hall opened `#project/fpv-drone`
  with matching notes and project navigation. The final console check had no
  captured errors. The temporary phone viewport was reset and its tab closed.
- The main preview was explicitly reloaded to `index-Cn70vsRe.js` and left at
  PetBot's 3D workshop at 1379×1278, with the bench, mat and model visibly loaded.

Matched development samples used the default PetBot station, closed assembly,
723×488 canvas, RTX3080/ANGLE, all normal profiler toggles enabled, and Keep
renderer awake enabled for six seconds. No build/lint ran during either sample.

| Metric | Before | After |
| --- | ---: | ---: |
| Frames / second | 170.1 | 170.1 |
| Frame interval p95 | 6.1 ms | 6.1 ms |
| CPU p50 / p95 | 0.4 / 0.6 ms | 0.4 / 0.6 ms |
| Draws | 40 | 41 |
| Scene meshes | 225 | 226 |
| Scene texture objects | 69 | 69 |
| Long tasks | 0 | 0 |
| Offscreen passes in fixed view | 0 | 0 |

Before scene: `b70915cf-a197-440c-abe3-caac305234dd`.
After scene: `7b7f95a3-845c-4699-a059-73457301ea13`.
Both samples rendered 1,021 frames. GPU p50/p95 was 1.52/3.36 ms before and
1.50/2.94 ms after; this variation does not establish a GPU speedup. Equal
texture-object counts do not by themselves prove equal GPU memory usage.

With forced rendering off and the drone returned to Landed, the same after
scene recorded zero frames, zero target passes and zero long tasks across six
seconds. The review document was visible when checked afterward. This confirms
the tested settled idle behavior, not zero JavaScript work or power use.

Firefox, physical phone performance, headset presentation and owner visual
acceptance remain unverified. No overall completion claim is made.

## Owner functional review — pending, about 2 minutes

The preview is running. To restart if needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional visitors use `npm.cmd run community:local` in another terminal. The
workshop works without `?community=local`. Ctrl+C stops a manually started server.

- [ ] Open the review URL. If the map is shown, choose Show 3D island. Inspect
  the bench grain, mat grid and shadow under PetBot; check for flickering edges.
- [ ] Choose Open shell, then Assembled. Orbit the view and reset it. Expected:
  the parts stay together and the material treatment reads consistently.
- [ ] Choose 02 / FPV drone, try Hover, then Landed. Use Hall to return to its
  project notes. Expected: the station, controls and notes agree throughout.
- [ ] Repeat the station switch and orbit on Firefox and a real phone. Judge
  visual quality as well as smoothness; report the browser/device and any stall.

Owner checks are pending, with no explicit waivers. This remains part of the
combined local review and does not recommend merge or deployment.
