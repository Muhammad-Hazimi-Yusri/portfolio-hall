# Visual and copy follow-up — 21 September 2026

## Scope and local state

Continued the architecture, frames, map and writing work for #34/#35 while
the owner was away from the PC. The owner requested **one combined PR tonight**
and no opening or closing issues in the meantime. No GitHub issues were changed,
and no commit, PR, merge, deployment or hosting change was made in this pass.

- Branch: `codex/hall-display-polish`.
- Base HEAD: `44c38295939ab18e06559859b7bfb337d1276cf5`, with the existing dirty
  working tree preserved. The unrelated `evaluation/` directory is untouched.
- Final build: `index-CZF4pPRP.js`, `index-YTABALFz.css`,
  browse `HallScene-CBWoVSXY.js`, free roam `BabylonScene-De9HVAIi.js`.
- Local production preview: http://127.0.0.1:5186/ .
- Previous controls/scroll evidence stays in
  `2026-09-21-controls-and-scroll-review.md`; that document's older build IDs
  are historical. Apply its pending physical checks to this newer build.

## Changes

The hall keeps its timber pavilion over water. The wall-side roof now has a
complete slope and lining, while the water-facing side remains a cutaway.
Column shoes and bearing blocks make the joints visible. Small metal picture
fittings have wall arms and a pale underside, replacing floating timber blocks.
Wall reveals and paving borders add scale. These static details share the
existing material batches; no new lights, shadow maps or texture assets were
added. Timber, roof, backing panels and metalwork use the same warm/green palette.

Existing photos and screenshots now occupy most of their frames, with their
source captions beneath. The physical plaque supplies the title. Frames without
usable images have the real summary, status and a numbered workflow, rather than
repeated blue panels. No mock screenshots, private work material or new external
assets were added. `image.caption` flows through the shared project data.

The desktop floor plan now sits beside a native scrolling directory of the
11 exhibits and three roles. The directory has larger targets and a current
selection, with a separate location/read-notes line. Scrolling it does not move
the reading panel or hall. At narrower desktop widths the directory uses all
available width, avoiding a horizontal scrollbar. The compact phone map retains
room links, and its main map/walk controls have 44 px minimum heights.

The introduction describes power-system studies, Python/web tools and specific
AI/immersive projects. PetBot is explicitly a team project with conversation
software as the contribution. Work and contact sections are more direct; the
internal tools remain in development. No impact figures, production claims,
employment dates or project status were invented or upgraded.

## Agent checks

PASS: ESLint, TypeScript/production build, portfolio content/build checks,
existing hall-layout, scroll and portal checks. Initial JavaScript is 203,251
bytes including static imports, 925 bytes above the preceding controls build.
The 3D code still loads separately. Existing large optional-chunk and stale
Browserslist-data warnings remain.

Chromium in-app checks:

- At 1280×720, a wheel gesture in the directory moved its scroll position
  from 0 to 485 px; the reading panel stayed at 0 and the entrance route stayed
  unchanged. Audioscenic selection updated the route, selected row, map marker,
  location line and experience notes.
- At 900×600, fixed a fractional-grid sizing issue that left unused space and
  a horizontal scrollbar. Final directory client/scroll width both measured
  197 px. Reporting workbench opened from its row with matching notes/location.
- At 390×844 and 320×568, the compact map and all five room links remained
  visible, with no horizontal document overflow. This is viewport emulation,
  not touch-device or physical-phone performance acceptance.
- The EEE Roadmap screenshot fills the 3D frame with its caption, and the roof
  lining and attached picture fittings are visible from the gallery camera.
- The production preview was refreshed to the final entry above; its new copy,
  14 directory links and EEE project navigation were checked. The production
  page has no local performance panel. Temporary testing tabs/viewport changes
  are removed at handoff.

## Runtime evidence

Six-second development Chromium Work → Projects sweep, RTX 3080 through
ANGLE/D3D11, 1360×900 viewport, 697×816 canvas. Final scene ID:
`aea8cb33-ed3e-48a3-acad-e65c4a2bc831`.

| Measurement | Final sample |
| --- | ---: |
| Rendered frames | 1,018 |
| Frame interval p50 / p95 / p99 | 5.9 / 6.5 / 7.0 ms |
| Maximum frame interval | 12.3 ms |
| Main-thread long tasks | 0 |
| CPU p95 / GPU p95 | 1.1 / 3.27 ms |
| Median draws | 43 |
| Scene meshes / textures | 244 / 54 |
| Scene triangles | 89,352 |
| Geometry measurements / scroll updates | 1 / 849 |

Reflection/refraction refreshed 170 times each; AVVR/PetBot portal previews
109/22. Water, shadows, logos and portal previews were enabled. The renderer
was not forced awake. Compared with the prior recorded section sweep, the final
scene retains the same mesh/texture counts and median draws, with 1,056 extra
triangles. This short sample shows no evident desktop regression; it is not a
speedup claim or evidence of Firefox/phone performance.

An intermediate sample used a separate material batch for the light undersides:
44 draws, 245 meshes, p95 6.4 ms and no long tasks. The final version reuses the
existing pale material batch; do not confuse that intermediate result with the
final sample above.

## Live-app observations to retain for tonight

Read-only checks, with no changes to those other repositories:

- https://chronohaxx.github.io/the-finals-outfit/ loaded directly in the IAB;
  the clothed character and cosmetic catalogue rendered. This does not resolve
  the embedded `about:blank` result from the preceding pass. Keep #37 pending
  until an actual iframe workflow is checked in a regular browser.
- https://muhammad-hazimi-yusri.github.io/wattwhere/explore/ loaded its dashboard,
  but the basemap displayed repeated **API KEY REQUIRED** watermarks. Do not use
  that broken map as a new portfolio screenshot. Retain this observation locally
  for the later backlog discussion; no new issue was created.

## Owner review — pending tonight

Use the local production preview above. If it stops:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

- [ ] Open the entrance, then Work and Projects. Check the roof/materials and
  frame content at normal browser zoom; open EEE Roadmap to inspect the large
  screenshot. Expected: readable exhibits, no flashing or obstructed frame.
- [ ] Choose Use hall map, scroll inside its directory, then choose a project
  and Audioscenic. Expected: only the directory scrolls under the pointer;
  selection and the right-hand notes agree. Return to Show 3D hall.
- [ ] Read the entrance, work and contact copy. Confirm that the wording sounds
  like you and accurately describes your contribution and preferred work.

Also run the existing pending Firefox/physical-control checks from the previous
review on this build. Real-phone, headset and owner visual acceptance remain
pending. No user check has been ticked on the basis of agent measurements.

The visitor service, shared notes, analytics landscape, portal refinement and
domain migration remain separate unfinished work. This local visual pass is
not acceptance or closure of the entire backlog.
