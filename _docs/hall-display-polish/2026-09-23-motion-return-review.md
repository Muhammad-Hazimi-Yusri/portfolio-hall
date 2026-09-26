# Island returns and experience rendering — 23 September 2026

Island returns now finish at the project's current browse pose, removing the
old fixed camera pose and subsequent correction. Settled experience views use
the logo's requested update cadence rather than continuously redrawing at the
monitor's refresh rate. This continues the local combined change; nothing was
committed, pushed, published or changed on GitHub.

## Identifiable build

- Branch: `codex/hall-display-polish`, intentional dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-AmXHQ03u.js`; CSS: `assets/index-DHGJwmft.css`.
- Browse: `assets/HallScene-DBz-2LUE.js`.
- Walking: `assets/BabylonScene-DnS4R7D4.js`.
- Manifest SHA256:
  `8222DADAF098F049A8B3CA55EEBB4D6A100B796D097808D06DC8D3BF930E0030`.
- Build log: `_local/motion-return-build.log`.
- Preview: <http://127.0.0.1:5186/?community=local#project/fpv-drone>.
- Initial JavaScript remains 249,791 bytes; the 3D code loads separately.
  The existing large Babylon chunk warning remains.

## Changes

The portal receives the same project-view function used by the hall. Changing
workshop stations updates its return pose too. Its final path emerges normal
to the frame and eases its lateral offset, pitch and heading to that pose.
Returning to the same frame also preserves the small camera offset associated
with restoring a reading position. A deliberate navigation to another hall
stop still finishes the crossing before moving to that different destination.

The browse loop now consumes the logo deadlines already used by the walking
renderer. Visible idle motion schedules approximately 30 updates per second;
camera motion and portal travel retain their normal cadence. A tracked logo
can stop requesting frames when aligned. Pausing, hovering, selection and
camera movement still wake the view through existing invalidation paths.
There are no new textures, meshes, lights or rendering passes in this change.

## Agent evidence

- PASS: production build/typecheck/content and asset checks, lint, existing
  navigation, scroll and logo checks, and diff whitespace check.
- PASS: portal checks now cover exact return position and viewing direction,
  continuous outward movement, no overshoot and a defined direction through
  the turn. The monotonic comparison uses a 1e-9 floating-point tolerance;
  an exact comparison initially rejected 1.6000000000000005 against 1.6.
- Compiled 1280×720: entered AVVR, returned via Hall, and visually checked the
  settled frame against its initial framing. One canvas remained and focus
  returned to Enter the island. Repeat entry, reversing a return, an orbit
  control and Escape all remained usable.
- Compiled 390×844: resized during an AVVR return; the frame, notes and project
  navigation returned without horizontal overflow. Entered PetBot, selected
  FPV, enabled Hover, then returned. The destination was FPV's frame and notes,
  with 7 / 9, one canvas and no horizontal overflow.
- No production errors were captured. The reused tab retained two development
  HMR errors from the brief interval between writing the new import and its
  export. An explicit development reload recovered; the later compiled checks
  did not repeat them. The temporary viewport was reset after testing.

Six-second local Chromium/ANGLE samples, RTX 3080, 723×644 render surface:

| Sample | Drawn frames | Offscreen passes | Long tasks |
| --- | ---: | ---: | ---: |
| Settled TNEI before | 1,021 | 0 | 0 |
| Settled TNEI after, logos playing | 170 | 0 | 0 |
| Settled TNEI after, logos paused | 0 | 0 | 0 |

Before scene: `eef4e158-fc85-45e0-b9b9-b9f4f35645fe`.
After scene: `81cabe04-244e-49b2-8ba5-2e1a1c247a5f`.
Water, shadows, logos, previews and flags were enabled; Keep renderer awake
was off. Playing measured 28.3 draws/s. The zero GPU timer values in that
low-rate sample are treated as unavailable, not zero GPU cost. No build or
test commands ran during the timed samples. Zero draws does not mean zero CPU.

An active project-scroll sample on final source recorded 1,017 frames over
six seconds (169.4 draws/s), frame interval p95 6.4ms, CPU p50/p95 0.5/0.9ms,
GPU p50/p95 0.32/3.85ms, zero long tasks and zero scroll-layout measurements.
Scene: `e8126684-106c-46b0-9818-744d6968c07d`. This checks that active scrolling
is not capped by the logo cadence; it does not establish a scrolling speedup.

These are desktop Chromium observations. Firefox, real phones, captured mouse,
headset and the owner's visual/motion acceptance remain unverified.

## Owner functional review — pending, about two minutes

No account is needed. The preview is running; if needed, restart in PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops that preview. Omit `?community=local` if the optional local visitor
service is unavailable; these checks do not need it or submit visitor notes.

- [ ] Enter the FPV island and return with Hall. Expected: one continuous
  arrival at the drone frame, without the extra repositioning at the end.
  Repeat after selecting PetBot, and with AVVR's island.
- [ ] Start a return, then immediately re-enter. Try an orbit control and
  Escape. Expected: controls remain responsive and the correct project returns.
- [ ] Visit TNEI, pause/play the logos, scroll through Experience and drag the
  view. Expected: gentle idle motion, prompt camera response and logos facing
  you when selected. Repeat ordinary use in Firefox and on a real phone.

User checks are unreported and none are waived. This does not recommend merge
or mark the wider portfolio goal complete.
