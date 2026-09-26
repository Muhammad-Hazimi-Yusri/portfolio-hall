# Visitor boats and waterfront — 23 September 2026

The old fleet used identical oval hulls above the water and country-code cards.
This pass adds a submerged keel, distinct bow and stern, wooden seats and
floorboards, restrained paint colours and small variations in heading and
placement. Country flags replace the letter cards where data is available.

## Revision

- Branch: `codex/hall-display-polish`, intentional dirty tree retained.
- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BhXee-eG.js`; CSS: `assets/index-ENVbDKs5.css`.
- Browse: `assets/HallScene-e1cgm_i-.js`.
- Visitors: `assets/visitorDisplay-CD8VWOUI.js`.
- Walk: `assets/HallExperience-BDuieAmN.js` and `assets/BabylonScene-CCYwj-eP.js`.
- Manifest SHA256: `DA66FE63CFBC14C0BD21AD2FCDE0D0DC6051B7806EEB5F08F527CE02F8BCC25B`.
- Initial JavaScript: 227,415 bytes; 3D remains separately loaded.
- Preview: <http://127.0.0.1:5186/?community=local#>.
- No commit, push, issue mutation, PR, merge, deployment or DNS change.

## Implementation and provenance

At most twelve boats are generated. Opaque hulls, seats, floorboards and poles
share one mesh/material through vertex colours. Folded flags use a second mesh
and one mipmapped 512 × 512 atlas. They are static, with no boat animation,
cloth simulation or additional shadow pass. All twelve hulls clear each other
and the widest deck in the geometry check.
The entrance fleet sits three metres farther along the approach, making more
of it visible in a short desktop pane. Flags already have geometry for both
sides; material face culling prevents redundant reverse-face overdraw.

Original SVGs are from [flag-icons 7.3.2](https://github.com/lipis/flag-icons),
under its MIT license. The package integrity and 257 unchanged asset hashes
were verified. `public/flags/README.md`, `LICENSE` and `manifest.json` record
the source. SVGs total 1,700,059 bytes on disk; only countries actually present
are requested, at most twelve distinct assets per display update. No package
scripts or runtime dependency were installed. No external image/CDN requests
are added to the site. Unknown countries retain a dash; missing assets retain
their country code. Local data is not given invented country values.

The boats join the existing water reflection/refraction lists. These cached
targets refresh when the view changes, the fleet changes or its flag atlas
finishes loading. Clearing the fleet removes its meshes from both lists before
disposal. Generation checks prevent a late flag load from reviving a replaced
display. No separate reflection target or update loop is added.

## Performance decision

A trial soft contact layer looked acceptable but increased measured GPU time.
It was removed. The final build uses submerged hulls and the existing cached
water reflection, and retains the original fleet's two draw batches. Mipmaps
add approximately 0.33 MiB to the flag atlas over the old non-mipmapped 512 atlas.

Six-second development samples on local Chromium / RTX 3080, fixed 656 × 636
canvas, same twelve-boat entrance fixture, renderer forced awake after settling:

| Variant | Draw calls | Scene triangles | GPU p50 / p95 | Frame p95 | Long tasks |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original hulls / code cards | 122 | 182,554 | 0.87 / 4.63 ms | 6.4 ms | 0 |
| Trial with blended contact layer | 123 | 185,506 | 2.24 / 4.73 ms | 6.2 ms | 0 |
| Restored trial, warm flags | 123 | 185,506 | 2.49 / 4.66 ms | 6.4 ms | 0 |
| Same trial, contact layer hidden | 122 | 185,506 | 0.88 / 4.53 ms | 6.2 ms | 0 |
| Cached reflections, before final placement | 122 | 185,482 | 0.42 / 0.88 ms | 6.1 ms | 0 |
| Final placement, before flag face-culling correction | 122 | 185,482 | 1.88 / 4.75 ms | 6.2 ms | 0 |
| Final placement and flag face culling | 122 | 185,482 | 0.89 / 4.62 ms | 6.2 ms | 0 |

All forced-awake samples were approximately 170 rendered fps. The retained
version adds 2,928 scene triangles, with the same 255 meshes and 67 textures as
the original fixture. Timing is a local observation, not a general speedup or
proof of Firefox, mobile, startup or VR performance. The steady-camera samples
do not measure the extra geometry in a moving water-reflection pass.

Audit scene IDs: original `d5690bbf-b9da-4cb4-8d06-31b5fce71253`; initial trial
`86583fc0-e248-4e41-9aaf-ce170a246bcb`; layer-isolation
`0af4b5dd-8414-49a1-b318-c13bf356173a`; retained
`f951357f-6b48-4c72-813c-2d0e49f90b06`; moved fleet
`9e65f255-bc2c-4e14-b578-d4c97e823f71`; final face culling
`a61ba04f-d729-4f2b-a5e4-4d9cbc6c9d3c`.

The GPU timer varied between samples, so no general speedup is claimed. A
camera journey from entrance to guestbook in the cached-reflection variant
rendered 673 frames over 6.01 seconds, then settled: frame p95 6.2 ms, maximum
14.7 ms, GPU p95 1.86 ms, zero long tasks, and 71 refreshes of each water target.
That journey preceded the final three-metre entrance-placement adjustment and
flag face-culling correction. It is evidence of the reflection path running,
not a matched navigation benchmark.

On the final source, a further six-second idle sample after turning off forced
rendering recorded zero frames, render-target passes and long tasks. Mesh and
texture counts stayed at 255 / 67. This verifies idle sleep on the tested desktop;
it does not measure a physical phone's energy use.

## Agent checks

- PASS: TypeScript, lint, production build, all eleven project/content asset
  checks and community payload checks. Existing large Babylon chunk warning
  remains.
- PASS: actual generated boat geometry has finite outward hull normals, a
  submerged keel, deck clearance, non-overlapping hull bounds for twelve visits,
  bounded detail and retained colours after merging. Flag UV orientation is
  checked on both sides.
- PASS: close-up orbit review of the hull, benches, floor and flags. This found
  and corrected the initially inverted atlas V direction; the Malaysia flag is
  upright in the corrected runtime. The review uses synthetic data.
- PASS: the twelve-boat fixture displays GB, MY and JP flags plus neutral
  unknown-country pennants. Removing the fleet also clears its reflections;
  restoring the fleet restores both. No visitor service is contacted by it.
- PASS on final production entry `index-BhXee-eG.js` at 390 × 844: the entrance
  renders with the local community data and no horizontal overflow. Controls
  and the ordinary portfolio remain visible. This is a desktop viewport check,
  not a physical-phone performance result.
- The existing visitor fixture was repaired for newer required HallScene props
  and gets an HMR cleanup. Its pre-repair errors are retained in browser history;
  they are not evidence of production failures.

## Owner checks — pending

The local preview is running; allow about four minutes for these desktop steps.
The main preview uses this PC's local visitor data, so its flags can legitimately
all be unknown. The deterministic fixture has clearly labelled sample data.

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

For the sample fleet, Vite is already on 5187. If it has stopped, start a second
PowerShell terminal with `npm.cmd run dev -- --host 127.0.0.1 --port 5187 --strictPort`.
Ctrl+C stops each server. Neither command starts public analytics or publishes
the site. Later source edits require a new build identity.

- [ ] Open the main preview's entrance with 3D enabled. Review the boats' scale,
  shape and relationship to the water and hall. Unknown countries should keep
  neutral pennants, not fabricated national flags.
- [ ] Open <http://127.0.0.1:5187/tools/fixtures/visitors.html>. Expect twelve
  boats with sample GB/MY/JP flags and unknowns. Use Remove visitors and Restore
  visitors: boats and their reflections should disappear and return together.
- [ ] In the main preview, scroll through the hall, open a project and return
  to the entrance. Expect smooth camera movement and consistent boat positions,
  without a new continuous bobbing or flag-animation loop.
- [ ] Repeat scrolling on Firefox and a real phone with a reachable preview.
  Check responsiveness and water/flag shimmer. Loopback URLs only reach this PC;
  physical-device acceptance remains separate from desktop viewport checks.

Owner visual acceptance and the broader goal remain open. Agent checks do not
check these boxes or establish merge/deployment readiness.
