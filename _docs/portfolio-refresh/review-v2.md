# Balairung gallery revision — 20 September 2026

The user rejected the conventional portfolio in revision 1 as generic and chose:
“Keep the hall’s personality, but make it easier to browse and useful for applications.”
This revision restores the hall as the main experience and keeps the reviewed content.

## Review build

- Branch: `codex/portfolio-career-refresh`; base `87573b3`.
- Revision: `hall-browser-v2`, current working tree.
- Preview: `http://127.0.0.1:5186/`, production build served by Vite preview.
- No dependencies added, commits pushed, merges or deployment performed.
- Existing untracked `evaluation/` artifacts remain untouched.

## Behavior

- A live view of the existing hall sits beside readable content on desktop.
- Work, Projects, Experience and Contact links open their content immediately and
  move the camera. Visitors can also click a display to read that project.
- The gallery includes two professional projects and eight personal/team projects.
- Cases have stable `#project/<id>` links, contribution notes and current status.
- The CV is directly accessible and uses the same employment records.
- Mobile uses a compact hall above normal document scrolling.
- “Use hall map” disposes the 3D scene while keeping all notes and navigation.
  Reduced-motion preferences default to this map; the scene can be enabled explicitly.
- The old free-roam experience remains available through “Walk around”, with a
  visible return control leading to the project gallery.
- Project titles replace random initial/gradient textures where no screenshot exists.
  The old Balairung thumbnail showing missing textures is no longer featured.
- New records in `src/data/portfolio.ts` feed both the reading panels and hall displays.

## Verification

- PASS: TypeScript, ESLint, production build and normal repository `git diff --check`.
- PASS: content checks for 10 entries, unique slugs, internal routes, public URL syntax,
  screenshot files, alternative text, captions and production image packaging.
- PASS: initial synchronous JavaScript is 175,505 bytes. Babylon loads separately;
  the content is available while the scene loads. Existing large 3D chunk warning remains.
- PASS: desktop 1360×900 and mobile 390×844 / 320×740 checked through the browser;
  no horizontal overflow. Mobile content uses normal page scrolling.
- PASS: Work → reporting workbench, Projects → Food Wars, browser Back, Experience,
  Contact and CV. The panel resets to its top on route changes; CV disposes the scene.
- PASS: clicked the site-test display in the actual 3D view and opened its correct notes.
- PASS: title-card orientation visually checked in the actual reporting-workbench view.
- PASS: map toggle removes the canvas; notes remain navigable; Show 3D restores it.
- PASS: direct `?force2d=true#projects` loads eight project links with no canvas.
- PASS: Walk around → loaded free roam → Return to portfolio restores Projects.
- PASS: actual email link points to `mailto:muhammadhazimiyusri@gmail.com`.
- PASS: no warnings/errors observed in the browse-mode browser logs before free-roam testing.

## Remaining acceptance

Design/content acceptance belongs to the user. This build has not been published.
The CV is readable on screen; print/PDF pagination is still unverified. No headset
or complete backend/project-functionality acceptance is implied by these checks.
The older free-roam renderer still has the previously missing avatar asset fallback.
Actual WebGL context loss was not induced; the forced map route and manual toggle
were tested. The reduced-motion branch was inspected in code, not emulated in a browser.

For a quick review of this exact build:

- [ ] Open the entrance and judge whether the hall + notes layout feels like your site.
- [ ] Select Work, open a display, and check the descriptions of your contribution.
- [ ] Open Projects, inspect a project and use browser Back.
- [ ] Open CV and inspect the print preview before using a saved PDF in an application.

To rebuild/reopen, from this repository:

```powershell
npm.cmd run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5186 --strictPort
```

Use the existing preview if port 5186 is already running. Update instructions are in
`docs/PORTFOLIO_CONTENT.md`. Revision 1 is retained in `review.md` as superseded history.

## User decision — 20 September 2026

The user reviewed the preview, said 'yes this looks alright', and explicitly
requested committing this revision and merging it to main before the next polish
pass. This records visual acceptance and merge authorization. Individual manual
checks, including print/PDF pagination, are not claimed as completed.
