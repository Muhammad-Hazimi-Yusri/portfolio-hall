# Map layout and architectural detail — 23 September 2026

The laptop map keeps a vertical drawing beside a single, taller directory.
Previously, at 1280×720, a horizontal drawing left a shallow two-column list
that clipped headings and exposed only a few projects. The new directory is
337px tall in that viewport. The map also draws the gallery wall and columns
from the same positions used by the 3D hall.

This is part of the combined local change on `codex/hall-display-polish`.
No commit, push, PR, issue update, merge, deployment or DNS change was made.
Owner acceptance is pending.

## Review build

- Based on `44c38295939ab18e06559859b7bfb337d1276cf5`, with the existing dirty tree.
- Entry: `assets/index-MfMO2SyL.js`; CSS: `assets/index-Dc4TmjqX.css`.
- Hall: `assets/HallScene-L1qRLuxi.js`.
- Walking: `assets/BabylonScene-Bz3vQqBZ.js`.
- Manifest SHA256: `6647FA33A2E3B54B9B786B3BF2A7DE9E926926C45D138D3FD32F036B4251286E`.
- Build log: `_local/map-layout-build.log`.
- Review URL: http://127.0.0.1:5186/?force2d=true&community=local#project/rubyvr-studio

## Changes

- Laptop widths above 1000px and heights from 681–850px use the vertical plan
  beside one scrollable directory. Larger windows retain the full plan;
  narrower tablets retain the horizontal plan above the list.
- Phones and desktop windows up to 680px tall retain the native project-and-role
  selector. Short desktop layouts explicitly hide the legend to preserve space.
- Hovering or focusing a different exhibit names it in the common map header.
  This remains visible when its directory row is outside the scrolled area.
  Focus alone does not change the selected exhibit or route.
- Full-plan room numbers have more clearance above the room labels. The old
  duplicate caption inside the drawing was removed to give the plan more room.
- The 2D drawing now includes the gallery wall and column footprints.
  `galleryColumns` shares the existing column spacing between map and scene;
  the 3D positions, number of columns and geometry are unchanged.

These additions are static SVG and CSS, with the existing focus/hover state.
They introduce no animation loop, render target or asset request.

## Agent checks

- PASS: `check:hall`, `check:navigation`, `check:scroll`, lint, build/typecheck
  and diff whitespace check. The hall check now also rejects overlapping column
  positions and column caps that cover project frames.
- Build check reports 233,672 bytes of initial JavaScript, 553 bytes above the
  preceding deferred-island build. 3D remains separately loaded. The existing
  Babylon chunk-size warning remains.
- Compiled preview at 1280×720: correct entry identity, no document horizontal
  overflow, 337px directory, readable plan labels. Focusing Balairung updated
  the header while RubyVR remained selected and the URL stayed unchanged.
- Clicking the compiled plan's TNEI marker opened `#experience/tnei`.
- Development layout at 1379×1000: 575px directory, no horizontal overflow;
  wall/column drawing and room-label spacing visually inspected.
- Development layout at 820×1180: horizontal plan above a 591px single-column
  directory, no horizontal overflow. Existing directory scroll position was
  preserved, including when earlier items were above the viewport.
- Development layout at 1000×600: selector replaced the directory, legend was
  hidden, and the selector had 19px clearance above stage controls. FPV selection
  worked and Escape while the selector had focus did not leave the project.
- Compiled preview at 390×844 (375px usable width): FPV selection opened its
  notes, Escape retained it, no horizontal overflow. Selector and stage controls
  were 44px high, with 10px between them.
- No browser errors captured in the map review tab. Its viewport override was
  reset and the temporary tab closed. The main production preview was reloaded.

These are desktop Chromium layout and interaction checks. They do not establish
Firefox, physical-phone, headset, assistive-technology or owner acceptance.
3D timings were not rerun because this pass does not change rendering work.

## Owner functional review — pending, about 2 minutes

The local preview is running. If needed, run `npm.cmd run build` and then
`npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort` from the repo.
The optional `?community=local` query shows the local visitor sample when the
separate community service is running; the map works without it.

- [ ] Open the review URL at laptop size. Expected: a vertical plan alongside a
  readable directory, with the selected RubyVR row visible and no clipped labels.
- [ ] Tab through the plan markers. Expected: the header names the focused
  exhibit, but the page opens only when the link is activated.
- [ ] Open TNEI, then Audioscenic. Expected: the notes, selected directory row
  and location marker all agree.
- [ ] In a short or phone-sized window, choose FPV from the selector. Expected:
  controls remain separate and usable; Escape while using the selector keeps FPV.
- [ ] Try the same flow in Firefox and on a physical phone, then switch back to
  the 3D hall. Expected: the project context is retained and navigation feels clear.

No owner check is completed or waived. This record does not recommend merge or
claim completion of the broader visual-polish goal.
