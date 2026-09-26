# Map wayfinding — 23 September 2026

The map now distinguishes the visitor's place from the planting, identifies
exhibits on keyboard focus, and keeps the selected directory entry visible.
Phones and short browser windows have a project-and-role selector; narrower
tablets put the plan above a readable list instead of squeezing both beside
each other. The full plan moves visitor boats beyond the room labels and has
a small symbol legend.

This continues the combined local change. No commit, push, PR, issue change,
merge, deployment or DNS operation was made. Owner acceptance is pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BlH5sSNL.js`; CSS: `assets/index-3p9o_DlY.css`.
- Hall: `assets/HallScene-sUyuodeN.js`.
- Walking: `assets/BabylonScene-DzJb04YN.js`.
- Visitors: `assets/visitorDisplay-D7Na-Elc.js`.
- Manifest SHA256: `32A9D5C2B6A3993861F602B414205DB97DC4EEF39645AB000D5CD1B9288BC547`.
- Open: http://127.0.0.1:5186/?force2d=true&community=local#project/rubyvr-studio
- Build log: `_local/map-wayfinding-build.log`.

## Behavior

The plan has a copper route and outlined diamond for the current location.
Experience selections use the actual pedestal positions, including TNEI on
the left and Audioscenic on the right. Hover and keyboard focus highlight the
matching exhibit and directory entry without changing the route or selection.
The full plan names the previewed item above the drawing.

On selection or directory resize, only the directory's own scroll position
changes to expose the current link, accounting for its sticky group heading.
It never calls document `scrollIntoView`. The observer disconnects on cleanup.
Map previews use React state and static SVG; there is no new animation loop,
3D asset, render target, or network request. The existing reduced-motion rule
also disables the marker transition.

At widths up to 760px, and desktop heights up to 680px, a native select exposes
all 11 exhibits and three roles. It retains normal keyboard behavior, including
Escape, through the existing project-shortcut input guard. Narrower tablets
use a horizontal plan above a single-column index. Short wider desktops retain
a two-column index. Full-height wide layouts retain the vertical floor plan.

## Agent checks

- PASS: build/typecheck, lint, navigation checks, scroll checks and diff check.
  Initial JavaScript is 230,572 bytes, 2,490 bytes above the preceding gallery
  lighting build. 3D code still loads separately. The existing Babylon chunk
  size warning remains.
- Built preview explicitly reloaded and entry identity confirmed. At the
  normal 1379×1278 viewport, keyboard focus on AVVR highlighted its plan link
  while RubyVR remained selected and the URL stayed unchanged. `scrollY` was 0.
- Clicking the full plan's TNEI link opened `#experience/tnei`, selected the
  TNEI directory row and reading panel, and moved the marker to `(107.95, 199)`.
  The symbol legend was visible; boats no longer overlapped room labels.
- At 390×844 in the built preview, selecting FPV changed both its case study
  and selected option. Escape while the selector held focus retained FPV.
  There was no document horizontal overflow. In the development layout,
  the selector had 10px clearance above the stage controls.
- TNEI and Southampton selected their separate pedestal positions. Returning
  from phone size with Balairung selected revealed that late directory row at
  1280×720 while document `scrollY` stayed 0.
- At 820×1180, the original narrow two-column layout wrapped names excessively.
  The corrected horizontal-plan/one-column-list layout was visually checked.
  At 1000×600, the directory was replaced by the selector, with 19px clearance
  above the stage controls; selecting EEE Roadmap opened the expected project.
- On the built preview, Right from FPV opened EEE Roadmap with `8 / 9` in the
  project controls. Escape returned to `#gallery/eee-roadmap`; after the scroll
  settled, the map and stage still identified EEE Roadmap and `scrollY` was 0.
- No browser errors captured in the responsive production review tab. The
  temporary viewport override was reset. No notes or external content sent.

These are desktop Chromium layout and interaction checks. They do not establish
Firefox, physical-phone, headset, assistive-technology or owner acceptance.
The preceding 3D timing measurements were not rerun: this pass changes the map
and CSS, not scene rendering. No new frame-rate claim is made.

## Owner functional review — pending, about 2 minutes

The preview is running. If a restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional visitor preview uses `npm.cmd run community:local` in another
terminal. The map works without `?community=local`; only the sample visitors
are absent. Ctrl+C stops a manually started service.

- [ ] Open the review URL above. Tab through the exhibit list. Expected: the
  matching frame highlights; focusing a link alone does not open it.
- [ ] Select TNEI, then Audioscenic. Expected: the case-study panel and selected
  directory entry agree, and the diamond moves between the two pedestals.
- [ ] Open FPV drone, press Right, then Escape. Expected: EEE Roadmap opens;
  Escape returns to the gallery at EEE Roadmap rather than the entrance.
- [ ] Try the map in a narrow or short window and on a phone. Expected: all
  projects and roles remain reachable, with readable names and controls that
  do not overlap. Use the selector, then return to a larger window; the current
  item should be visible in the directory.
- [ ] Choose Show 3D hall, then Walk here from a project. Expected: navigation
  keeps the current exhibit context. Check the feel in Firefox as well.

No owner checks are completed or waived. This record does not recommend merge
or claim completion of the broader visual-polish goal.
