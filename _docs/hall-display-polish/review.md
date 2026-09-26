# Hall display polish — 20 September 2026

The previously accepted hall-first refresh is committed as `44c3829`, merged to
`main` and pushed to `Muhammad-Hazimi-Yusri/portfolio-hall`. GitHub Pages deployment
[35524294198](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/actions/runs/35524294198)
completed successfully. The saved owner credentials were used only for that push;
the global active GitHub account was not changed.

This next polish is on `codex/hall-display-polish`, in the working tree for visual
review. It has not been merged or deployed. Preview: <http://127.0.0.1:5186/#about>.

## Changes

- TNEI, Audioscenic and University of Southampton marks float above their
  experience pedestals. Each alpha mask becomes a solid extrusion with matching
  front/back caps and connected side walls. Spaces between letters and their
  counters stay open; there is no rectangular backing or separate reverse card.
  Sources are recorded in `public/brands/README.md`.
- TNEI sways left then right; Audioscenic sways right then left, now limited to
  20 degrees in each direction following the user's request. Southampton bobs
  vertically without idle rotation. Selected logos, hovered canvas displays and
  hovered/keyboard-focused experience links smoothly face the camera instead.
  Proximity tracking also works in free roam (enter within 6 units, leave beyond
  7). Tracking settles bobbing; Pause logos stops idle motion while preserving
  camera tracking. Employer, role and dates stay on a stationary label.
- TNEI retains its original colours. White source variants use navy and teal on
  the solid geometry for contrast against the pale hall. Original asset files and
  reading-panel badges are unchanged. The close-up cameras keep adjacent marks
  near the edges of the view.
- Larger project frames contain real screenshots at their original proportions,
  or a three-step workflow with the project summary and development status. No
  private work screenshots or invented application interfaces were added.
- Browse mode now explicitly loads Babylon's ray-picking support. A fresh dev
  page previously warned that Ray needed importing and ignored display clicks.
  Actual logo clicks work after the fix, including in the built preview.
- Updating fields and asset sources is documented in `docs/PORTFOLIO_CONTENT.md`.
- Scroll with hall defaults on and remembers the visitor's choice. Overview
  sections form one continuous reading flow; the camera interpolates between
  the visible project and experience entries. Scrolling over the desktop canvas
  also advances the notes. Mobile keeps a compact, sticky hall above native page
  scrolling. Turning the switch off restores separate sections.
- The camera eases into each view and pulls back between pedestals to keep the
  current mark in frame. A subtle haze and reading-panel edge fades soften the
  transitions. Normal navigation, focused notes and browser Back remain available.

## Verification

- PASS: ESLint, TypeScript, production build, content checks and `git diff --check`.
- PASS: ten project records and three experience records have valid local asset
  references; logos and project images are packaged in `dist`.
- PASS: initial synchronous JavaScript is 184,550 bytes, below the 250 KB budget;
  3D remains lazy-loaded.
  The existing large 3D chunk warning remains.
- PASS: desktop 1360×900 overview shows all three logos without edge cropping.
  TNEI, Audioscenic and Southampton close-ups were visually inspected.
- PASS: clicking the TNEI logo in the actual canvas opens `#experience/tnei` and
  filters the reading panel to its correct record, in both dev and production
  preview. Direct experience navigation and the All selector work.
- PASS: `npm.cmd run check:logos` checks the enclosed volume and both caps of a
  ring-shaped mask, empty letter counters and transparent backgrounds, opposite
  turn directions and reversal, vertical bobbing, selection/hover/proximity
  triggers, distance hysteresis, camera-facing yaw and smooth angle wrapping.
- PASS: selected TNEI and Audioscenic views face the camera with visible cutouts
  and extrusion depth. Free-roam navigation approaches TNEI from the opposite
  side of the hall; its logo turns to face that camera, independently of a
  selected portfolio route. No new browser warning/error was observed; the
  known missing-avatar fallback warning occurs on entering free roam.
- PASS: reporting-workbench workflow and Food Wars screenshot frames were
  visually inspected for orientation, proportions and real content.
- PASS: mobile 390×844 and 320×740 show wrapped selectors and accessible motion
  controls with no horizontal overflow. Selecting an experience shows its notes.
- PASS: switching to the hall map removes the canvas and motion control while
  retaining the selected experience; other experience links still work.
- PASS: production preview reloaded with the new asset bundle. Temporary viewport
  overrides were reset before handoff.
- PASS: `npm.cmd run check:scroll` covers section alignment, interpolation at
  waypoint boundaries, scroll clamping, duplicate offsets and focused-note pages.
- PASS: desktop scrolling in either the reading panel or over the actual 3D view
  advances the notes and camera together. Experience moved from TNEI to
  Audioscenic; Projects moved from Food Wars to WattWhere with matching artwork.
- PASS: the scroll switch defaults on, restores separate Experience content when
  disabled, remembers the setting across reload, and re-enables the full flow.
- PASS: Projects navigation, opening WattWhere and browser Back restore the
  continuous Projects section. Mobile 390×844 and 320×740 use native page scrolling,
  retain the hall at the top, and have no horizontal overflow.
- PASS: Contact navigation reaches its section on mobile. Switching to the map
  removes the canvas while retaining continuous reading; Show 3D restores the
  hall. Opening the CV shows the CV and disposes the canvas.

## Remaining review

The user has accepted the preceding refresh, not this new display treatment.
Review the logo rotation/scale and the project frame content in the preview.
CV print/PDF pagination and headset behaviour remain outside these checks. The
pre-existing free-roam missing-avatar fallback is unchanged. Reduced-motion
behaviour is implemented and inspected in code, but was not browser-emulated.

The pre-existing untracked `evaluation/` directory was left untouched.
