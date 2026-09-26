# Professional-work illustrations — 23 September 2026

The reporting workbench and site-test analysis pages now use labelled public
illustrations, shared by the project index, notes and physical gallery frames.
This gives visitors a concrete explanation of the work without representing a
finished application or publishing work material. The existing development
status, authorship and limitations remain explicit.

Local combined work only. No commit, push, issue operation, PR, merge,
deployment or DNS change. The broader visual goal and owner acceptance remain
open. The preceding navigation and visitor pass is recorded in
`2026-09-23-navigation-and-visitor-review.md`.

## Review build

- Branch: `codex/hall-display-polish`, intentional dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-dBe2YyC1.js`; CSS: `assets/index-APR8Vv5c.css`.
- Browse: `assets/HallScene-CzNH2FJc.js`.
- Walking: `assets/BabylonScene-C99n4gPc.js`.
- Visitor book: `assets/VisitorBook-CDO2e_c-.js`.
- Manifest SHA256:
  `7FCD431B2FBF15FF7F642E009C5E4E92B742358FEA726D1310FF818AA912B649`.
- Preview: <http://127.0.0.1:5186/?community=local#project/reporting-workbench>.
- Build log: `_local/work-illustrations-build.log`.

## Changes and checks

`reporting-workbench-workflow.svg` shows inputs, figure matching and a Word
draft for engineering review. `site-test-analysis-sketch.svg` uses a synthetic
response, target, arbitrary band and chosen test window. Both SVGs carry their
qualifications within the image, and their captions repeat them. Neither is an
application screenshot. The trace contains no site data or compliance limits.

The two assets total 8,266 bytes. Both reuse the existing frame texture and
image viewer; no geometry, light, render target or animation was added. The
obsolete alternate canvas diagrams were removed so that the same artwork is
used in 2D and 3D. The generic text/workflow fallback remains available.

Agent checks:

- PASS: TypeScript/build, lint, portfolio packaging, navigation, scroll and
  diff checks. The build includes both illustrations and reports 246,553 bytes
  of initial JavaScript; 3D still loads separately. Existing Babylon chunk-size
  warnings remain.
- PASS: both SVG documents parse as XML and declare a 1200 by 720 viewBox.
- The workflow was visually reviewed at full size. A connector touching the
  template label and a figure-placement label were corrected before this build.
- In the final compiled desktop build, selecting the physical reporting frame
  opens its illustration. Escape closes it and restores focus to the stage's
  Back to gallery control. The matching image and factual caption appear in
  the notes. The main preview's new entry script was verified after reload.
- At 390 px the reporting image fits its page. At 320 px the site-test image
  viewer keeps Close reachable. Actual size displays the 1200 px source in a
  scrollable surface; a horizontal scroll moved 320 px. Escape restored the
  original image button. No project navigation occurred inside the viewer.
- Next from reporting opens site-test analysis and retains focus at the final
  navigation control. The two index rows fit at 320 px, with the current row
  reflected in the hall. Document width was 305 px inside the 320 px viewport.
- No captured browser warnings or errors in the compiled review tabs.

These are local Chromium and resized-viewport checks. They do not establish
Firefox scrolling, physical touch, captured-mouse behavior, headset performance
or owner visual acceptance. The public visitor backend and domain migration
remain outside this pass.

## Owner review — pending

The local preview is running. To start it again from PowerShell if necessary:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

Run `npm.cmd run community:local` in another PowerShell window only when also
reviewing the local visitor features. Ctrl+C stops either process. The loopback
URL is for this PC; testing a physical phone needs a reachable preview.
Rebuilding after further source edits changes the revision under review.

- [ ] Open the reporting preview. Read the diagram and its qualification;
  confirm that it accurately describes the work without implying completion.
- [ ] Select the physical frame, then close the enlarged image. Expect the
  same view and a usable Back to gallery control. Try the image in the notes too.
- [ ] Use Next or Right to reach site-test analysis. Enlarge it, choose Actual
  size, pan and close. Expect a readable synthetic chart and the same project.
- [ ] Open Work and scroll through both entries. Expect the illustrations,
  notes, current-row indicator and hall frames to agree. Review the same flow
  in Firefox and on a physical phone before treating those platforms as passed.

User acceptance has not been recorded.
