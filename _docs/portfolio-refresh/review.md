> Superseded: the user rejected this visual direction as generic. See "review-v2.md" for the hall-first revision.

# Portfolio refresh — 20 September 2026

The existing repository now opens with a conventional professional portfolio.
The 3D hall is an optional project. This is a local review build, not a deployment.

## Revision and preview

- Branch: `codex/portfolio-career-refresh`
- Base: `87573b3` (matched freshly fetched `origin/main` before work).
- Review build: `portfolio-refresh-2026-09-20`, working tree on that branch.
- Preview: `http://127.0.0.1:5186/` (Vite production preview).
- Existing untracked `evaluation/` artifacts were preserved.
- No dependencies were added. No remote push, merge or deployment was performed.

To reopen the preview from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5186 --strictPort
```

If the preview is already running, use its URL. Ctrl+C stops a terminal preview.

## Changes

- Added TNEI and corrected Audioscenic/research dates using the September CV
  source review. Kept internal work at a high level.
- Added two professional write-ups and eight personal/team project write-ups.
  Each identifies role, contribution and current state.
- Added a printable CV view and direct contact links.
- Introduced one content source for the portfolio, CV employment history and
  hall project displays; documented how to add projects.
- Replaced the forced tour entrance with ordinary document scrolling and
  native links. Project routes support browser Back and direct reloads.
- Removed the old visa/adoption/production-quality claims from active views.
- Deferred Babylon to the optional hall; retained its return action and a
  fallback for the force-2D path or unavailable WebGL.
- Updated metadata, the favicon, and basic no-JavaScript contact/experience copy.

## Agent checks

- PASS: repository ESLint, TypeScript and production build.
- PASS: content checks for all 10 entries, IDs, internal routes, HTTPS link
  syntax, image existence, alternative text and packaged images.
- PASS: initial production JavaScript approximately 174 KB / 56 KB gzip,
  with 3D chunks excluded from the initial import graph.
- PASS: browser inspection at 1280×720, 390×844 and 320×740; no horizontal
  overflow. Real Food Wars and AVVR images loaded.
- PASS: all nine ordinary work/project pages reached through visible links;
  role, status and contribution sections present; headings start near the top.
- PASS: Balairung page, 3D hall load and Return to portfolio; canvas disposed
  when returning. Force-2D direct explore gives a readable fallback.
- PASS: project → browser Back restores the Projects section. CV and Contact
  navigation work; email targets the correct mailto address.
- PASS: public GitHub links for Food Wars, WattWhere, RubyVR and Outfit Studio
  resolve. EEE Roadmap and AVVR pages resolve. Food Wars and WattWhere demos
  were opened in the browser after the text fetch tool could not read them.

The old full-screen root overflow rule initially caused project navigation to
land near the bottom. It was fixed and the affected routes were retested.

## Limits

- User content/design acceptance and browser print/PDF output remain pending.
- No claim of comprehensive project functionality, backend acceptance, game
  material fidelity or headset support follows from these portfolio checks.
- The retained hall still falls back to its procedural avatar because the old
  GLB avatar asset is missing. No headset test was performed.
- The newer Food Wars screenshot is a development preview. The hosted site
  currently shows its earlier inventory layout; the case study says so.
- Link checks establish reachability, not complete functionality or uptime.

## Quick user review — pending

- [ ] Open the preview and read the headline and TNEI descriptions. Confirm the
  positioning and the descriptions of your contribution are accurate.
- [ ] Open Food Wars and one newer project, then use browser Back. Confirm the
  screenshots and project descriptions represent the work you want employers to see.
- [ ] Open CV, choose Print / save as PDF, and inspect the print preview. Confirm
  dates and role descriptions, and that the output is readable without clipping.
- [ ] Read the page on your phone or a narrow browser window and open Contact.
  Confirm the navigation and email address are easy to use.

User results: **pending**. Agent checks do not mark these complete.
Publication and merge authorization: **not requested or given**.
