# Map navigation — 23 September 2026

The floor plan now has a closer view, usable compact frame links, and direct
entry to the two 3D project spaces. This continues the combined local change;
there was no commit, push, PR, issue operation, merge, deployment or DNS change.

## Review build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-DP5z443f.js`; CSS: `assets/index-BocjanBU.css`.
- Hall: `assets/HallScene-DNYpKuOF.js`.
- Walking: `assets/BabylonScene-DpGqiuzX.js`.
- Manifest SHA256: `7BBF87CCBC7060228F27683DEF0DD22830EA06897E98099FBB8691E08BB7E883`.
- Open: http://127.0.0.1:5186/?community=local#project/fpv-drone
- Build log: `_local/map-navigation-build.log`.

## Behavior

Closer view centres the plan on the current project, role or hall section.
Keyboard focus pans to the focused exhibit without opening it or moving the
document. Hover previews do not move the plan, and keyboard focus takes
priority over a stationary mouse pointer. Whole hall restores the overview.
Room labels and visitor links are retained in the overview rather than left
as invisible keyboard stops outside the enlarged drawing.

The compact close view exposes individual project and role links. A native
selector provides named access to every exhibit, role and project space.
Desktop space links and the compact selector explicitly enable 3D when opening
the listening room or hardware workshop. Both preserve FPV or PetBot when that
project is already selected. A short tablet window uses the vertical plan and
selector; the horizontal plan remains in phone and shorter-window layouts.

The map uses SVG and a short CSS transform transition; there is no added
animation loop, 3D asset or rendering pass. The existing reduced-motion rule
disables the transition. Initial JavaScript is 249,256 bytes, within the
250,000-byte check, compared with 247,385 in the preceding build. 3D remains
separately loaded. These facts do not establish Firefox or mobile performance.

## Agent verification

- PASS: build/typecheck, lint, navigation, scroll checks and diff check.
  The existing large Babylon chunk warning remains.
- Desktop map: selected Reporting workbench directly from the close plan;
  Right opened Site-test analysis tools and changed the counter to 2 / 2.
- Keyboard: tabbed from PetBot to FPV in the enlarged plan, then Enter opened
  FPV. In the compiled preview, focus on AVVR centred and named AVVR while
  FPV stayed selected; document scrollY remained zero.
- Development preview at 390px: selected PetBot directly from the compact
  close plan, then Southampton through the selector. Selector and zoom
  button were 44px high with 10px clearance above the stage controls.
- Compiled preview at 320px: no horizontal document overflow; close view and
  selector were usable. Choosing Hardware workshop retained FPV and loaded
  its flight pad, Landed/Hover controls and component notes in 3D.
- Development preview: the listening-room selector loaded the archived model
  and reported “Listening room · ceiling removed”. No captured browser errors.
- The final compiled 820×740 layout was reloaded and visually checked after
  correcting an excessively empty horizontal-map arrangement. The vertical
  plan, selector and stage controls fit without overlap or horizontal overflow.
- At 1379×1278 the enlarged drawing initially clipped the left edge of exhibit
  numbers. The corrected gallery offset was checked in the final compiled
  build: the selected number starts 15px inside the plan. The overview-only
  visitor legend is also hidden in close view.
- Compiled preview identity confirmed, no captured warning/error logs in the
  review tab, viewport override reset, main preview refreshed.

These are local desktop Chromium checks, including resized viewports. They do
not establish Firefox, physical phone, headset, assistive-technology or owner
acceptance. Earlier walking, project arrows and return behavior are recorded
in `2026-09-23-navigation-and-visitor-review.md`; this pass did not change
their scene implementation. The overall visual-polish goal remains open.

## Owner review — pending, about 2 minutes

The preview is running. If a restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional local visitor data uses `npm.cmd run community:local` in another
terminal. Map navigation works without the local community service. Ctrl+C
stops a manually started service.

- [ ] Open the review URL, choose **Use hall map**, then **Closer view**.
  Expected: the FPV frame is easy to identify and Whole hall restores the
  complete plan.
- [ ] Tab through map frames and press Enter on one. Expected: focus brings
  that frame into view; Enter opens its notes. Left/Right move between
  projects and Escape returns to the corresponding gallery position.
- [ ] From FPV on the map, choose **The hardware workshop — Open in 3D**
  (or the Hardware workshop option in a small window). Expected: the drone
  flight pad opens. Return to hall preserves the FPV project.
- [ ] Try the map at phone width and on a physical phone. Expected: the
  selector, zoom control, reading panel and return controls remain usable
  without overlaps. Check the scrolling feel in Firefox as well.

No owner checks have been completed or waived. This record does not recommend
merge or claim completion of the wider visual and performance work.
