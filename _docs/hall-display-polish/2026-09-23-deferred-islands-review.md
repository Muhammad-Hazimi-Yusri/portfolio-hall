# Island preparation — local review, 23 September 2026

The hall no longer constructs both project islands at arrival. Each is prepared
when a nearby frame is visible and the camera has stopped moving. The original
project image stays available during scrolling, then blends into its live portal
over 260 ms. Clicking that image or opening an island URL prepares the destination
synchronously; entry does not wait for a timer or a separate page load.

This is local work for the combined change. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner visual and functional acceptance
remain pending.

## Review this build

- Branch: `codex/hall-display-polish`, dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-D9Y8wGKY.js`.
- CSS: `assets/index-BaLRqpjD.css`.
- Hall: `assets/HallScene-CFigyS3e.js`.
- Walking: `assets/BabylonScene-DP29aUl3.js`.
- Manifest SHA256:
  `98e1303d0a4d23b6cf56b01954a27dc10776e349d6abda775528eab71e8561aa`.
- Preview: http://127.0.0.1:5186/?community=local#
- Build log: `_local/deferred-islands-build.log`.

## Implementation

`deferredProjectPortal.ts` retains pending project/source selection without
building geometry. It prepares at most once, forwards the original controller's
operations, and disposes only an instance that exists. `HallScene.tsx` checks the
actual frame's frustum visibility, distance and camera motion before preparing
a preview. A forced preview refresh or resize cannot construct an unseen island.

The original artwork has the same island route as its eventual portal surface.
This preserves clicking and hover feedback before preparation. The existing
portal crossing, shared PetBot/FPV station selection, source interactions and
return route stay in use. Crossing and reduced-motion views bypass the new
preview dissolve. Both islands still use the same scene and engine; their code
is still in the lazy hall bundle, and geometry is retained for repeat visits.

Development-only construction timings and allocation counts were added to the
existing performance audit. Its render-target observers now also cover targets
created after the audit starts. Construction profiling is absent from the
compiled hall. Initial JavaScript is 233,119 bytes; the large Babylon chunk
warning remains.

## Evidence and iteration

Development Chromium/ANGLE on RTX 3080, 723×644 at the entrance and gallery,
six-second samples, normal water/shadow/logo settings and forced-awake disabled.
No build or test command ran during these samples.

| Sample | Island construction | Scene meshes / textures | Frame intervals |
| --- | --- | --- | --- |
| Eager baseline, `1338d62c-8fd3-49a7-a9d6-f08a261338ed` | AVVR 12.4 ms; hardware 25.8 ms, both before exploration | 226 / 70 | Already idle; zero frames |
| First deferred attempt, `f1d80625-5133-495e-86e7-6962687d6504`, entrance | None | 124 / 45 | Still settling; not an idle comparison |
| First deferred attempt, same scene, project scroll | AVVR 28.8 ms; hardware 40.5 ms during motion | 226 / 70 | p95 6.7 ms; maximum 59.4 ms |
| Corrected preparation, `53b9e2dd-c7dc-4823-87aa-f275f982582b`, first project scroll | None during motion | 124 / 45 | p95 6.3 ms; maximum 13.3 ms; no long tasks |

The first attempt was changed because it moved construction into scrolling.
The retained version waits for a settled view. The 102-mesh and 25-texture
entrance reduction is an allocation-count result, not a measured RAM saving.
The baseline's 38.2 ms is construction time in one desktop run, not a page-load
speedup. First-time construction still costs CPU time when paused or entering
directly; this is not evidence of lag-free use on all devices.

After stopping with AVVR's frame visible, only that island was built: 162 scene
meshes and 54 textures. Entry, zero-volume audio start, Escape and immediate
re-entry reused it. The audit recorded one AVVR build and no hardware build.
A fresh direct FPV link built only hardware; switching to PetBot and opening
its shell reused the same instance. Counts were 188 meshes and 62 textures.
Per-island texture deltas vary with shared texture creation order.

## Agent checks

- PASS: final build/typecheck, lint, portal and navigation checks, and
  `git diff --check`. Browse-look and exhibit geometry checks also passed;
  subsequent edits only corrected the artwork's route metadata.
- Tests cover unopened-island allocation, forced preview refresh, pending
  shared-station/source state, direct entry, reduced-motion argument forwarding,
  repeat entry and disposal, alongside the existing projection/route checks.
- Normal first traversal retained the original images while moving. A stopped
  nearby view prepared AVVR, and its live window appeared without navigation
  to another page.
- With the development Portal previews switch off, the audit showed zero island
  builds at the focused AVVR frame. Clicking the original image entered and
  rendered the listening room, rather than opening an image dialog. This used
  scene `1282c0a9-7508-4d5b-88df-fbd29e279a9e`; that diagnostic flag was confined
  to the temporary tab, which was closed.
- Compiled responsive check requested 390×844, with 375 px usable document width:
  direct FPV entry showed the drone station, all island controls were 44 px high,
  and there was no horizontal overflow. Hall returned to FPV notes; Right selected
  EEE Roadmap (8 / 9), and Escape returned to its focused gallery link.
- Compiled Walk here from AVVR started beside its frame with the AVVR inspection
  prompt. Return restored AVVR notes. This also exercised scene disposal and
  remount after a prepared island.
- After the final route-metadata correction and rebuild, the final entry was
  verified and the AVVR frame entered the listening room again. No captured
  development errors during the direct-entry and interaction checks.

Real Firefox, physical phone, headset and owner acceptance remain pending.
Audio was exercised at zero volume; this does not establish audible spatial
fidelity. The broader visual goal has not been declared complete.

## Guided owner review — pending, about three minutes

The preview is running. If it needs restarting, use PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local visitor service is separate; no note submission is required.
Ctrl+C stops a preview process started in that terminal.

- [ ] **First browse:** reload the entrance in Firefox, then scroll through
  Projects. Images should stay visible while moving; check for a pause when
  passing AVVR or the hardware frames.
- [ ] **Enter a frame:** open AVVR, pause at its frame, then select the image or
  live window. The listening room should open continuously. Hall or Escape
  returns to AVVR notes. Enter again and check that it remains responsive.
- [ ] **Direct island:** open
  http://127.0.0.1:5186/?community=local#world/hardware/fpv-drone
  in a fresh tab. The drone should be selected. Try Hover, then PetBot and Open
  shell. Hall should return to the notes for the station you last selected.
- [ ] **Continue:** from those notes, try the previous/next controls and Escape.
  Then choose Walk here from another project; walking should start by that
  exhibit, and Return should restore the relevant notes.

User results: **not yet reported**. This review does not authorize merge or
publishing, and does not replace the broader outstanding device/visual reviews.
