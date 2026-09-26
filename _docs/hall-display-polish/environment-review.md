# Waterfront gallery polish — 20 September 2026

Follow-up: the user rejected the visual quality and reported poor performance.
The functional checks below remain historical evidence, not visual or performance
acceptance. See [the measured repair](performance-review.md) for the next local revision.

Scope: continue the accepted hall direction on `codex/hall-display-polish`,
preserving the existing local logo and linked-scroll work. All new polish is
local and uncommitted. The deployed baseline remains `44c3829`.

## Result

- A timber colonnade and open slatted canopy give the gallery repeated bays.
  Limestone decking, bronze rails, planted seating and a circular observatory
  structure carry the same palette along the waterfront.
- Directional daylight with filtered shadows, a quieter sky and tiled ripple
  normals replace the old flat white platforms and random texture noise.
- Actual bridges now connect entrance, gallery and experience platforms.
  Their height offset avoids coplanar surface flicker. Static detail is merged
  by material; floors retain collision and XR picking support.
- Larger bronze frames, recessed wall panels, physical catalogue labels and
  two-sided entrance/contact signs make the work easier to identify. The
  existing reviewed screenshots and workflow diagrams are retained.
- A horizontal floor plan shares layout data with the 3D scene. It includes
  clickable rooms, individual projects and roles, a numbered directory and a
  current-view marker. Mobile uses a larger, readable room plan.
- Five numbered stops, consistent labels and a keyboard-accessible free-roam
  directory connect the views. Closing that directory returns focus to its
  toggle; the position-strip destinations are now real labelled buttons.
- The browse camera keeps a minimum horizontal field of view and pulls back
  through experience transitions. The mobile loading placeholder retains the
  eventual 3D stage height to avoid a layout jump.

## Agent verification

- ESLint and TypeScript passed. Production build and portfolio content checks
  passed; initial JS remains about 190 KB, below the 250 KB check. The existing
  warning for the separately loaded Babylon bundle remains.
- Logo geometry/motion and linked-scroll checks passed.
- New layout check passed: body-width walking corridor is continuous through
  every bridge join, all five map stops have floors, and all ten framed exhibits
  fit the gallery with clear viewing positions.
- Browser: desktop entrance, gallery frames, experience terrace and 2D plan
  visually inspected. Map exhibit click opened WattWhere's correct notes;
  switching between map and 3D retained the selected route.
- Browser: mobile map at 390 × 844 has readable room links; Contact navigation
  settled below its sticky stage without horizontal overflow.
- Built preview: 320 × 740 forced-map view has no horizontal overflow and no
  canvas. Enter on the desktop SVG Reporting workbench link opened its notes;
  clicking the actual 3D Site-test analysis frame opened that project's notes.
- Browser: free-roam directory travelled to TNEI; the logo tracked the camera
  from the opposite side, and Return to portfolio restored the reading view.
  Focus returned to the directory toggle on close. The existing missing-avatar
  warning is still present; no new runtime error was observed.

## Human review, still pending

Preview: `http://127.0.0.1:5186/` (production build). Branch:
`codex/hall-display-polish`, working tree as described above.

- [ ] At Entrance, scroll into Work and Projects; judge the new architecture,
  daylight, framing and transition pace.
- [ ] Choose Use hall map, open a numbered exhibit, and switch back to 3D.
- [ ] Open Experience, inspect each logo, and try Walk around → Hall directory
  → Experience. Check ordinary movement with your own mouse and keyboard.
- [ ] On your phone, try the map links and scroll through the reading panel.

No headset test, physical-input acceptance, performance benchmark or production
deployment is claimed. No new external artwork or private project data was
introduced. The pre-existing `evaluation/` directory was left untouched.
