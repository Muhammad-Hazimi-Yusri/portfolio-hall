# Map composition and entry behavior — 23 September 2026

The map's separate controls and project-space row were squeezing its drawing
and directory. At 1280×720, the current baseline measured only 208px for each.
They now measure 310px, with the same stage size and 44px directory targets.
The map's island action also now opens the actual 3D exhibit in one step.

This continues the unpublished combined change. No commit, push, issue update,
PR, merge, deployment or DNS change was made.

## Identifiable build

- Branch: `codex/hall-display-polish`, intentional dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-DhiiCi5t.js`; CSS: `assets/index-Hwu_TgGI.css`.
- Browse: `assets/HallScene-CDALs_aP.js`.
- Walking: `assets/BabylonScene-aKo3OBA9.js`.
- App viewer: `assets/LiveProjectBrowser-B7n9cdFe.js`, a dynamic entry.
- Manifest SHA256:
  `6359EFC8B86B2D59A52C9674EB04DEBF96B5974C59C239D584E3AB7C2F21D85E`.
- Build log: `_local/map-composition-build.log`.
- Map: <http://127.0.0.1:5186/?force2d=true&community=local#project/fpv-drone>.

## Changes

The zoom control shares a toolbar with the plan heading. Project spaces now
sit in the scrollable directory alongside the projects and roles. Phones and
short windows retain their native selector below the drawing. The legend sits
with the plan and only names visitor boats when that drawing actually shows
them. Existing selection, keyboard preview and directory scroll behavior remain.

An ordinary island-link activation from map mode enables the 3D view, whether
the link is in the stage, directory or project notes. Previously the stage
action changed the route but left the visitor looking at another map and a
second Show 3D button. Modified clicks retain normal browser behavior. Already
active 3D navigation does not reset the renderer's ready state.

The first build hit the 250,000-byte initial-JavaScript limit at 250,032 bytes.
The embedded-app viewer is now loaded when opened, with Gallery/Back to walk
and Open app available during loading or a module failure. A lost keyboard
focus returns to Gallery when the real viewer replaces its loading placeholder;
focus elsewhere is respected. Initial JavaScript is now 248,941 bytes, versus
249,791 before this pass. The limit was not raised. No 3D geometry, render
targets or animation loops were added, and no frame-rate speedup is claimed.

## Agent evidence

- PASS: build/TypeScript, content, asset and bundle checks; lint; existing
  navigation and scroll checks; diff whitespace check. Existing large Babylon
  chunk warnings remain.
- Compiled 1280×720: selected FPV stayed visible in the 310px directory.
  Closer view and keyboard focus named WattWhere without changing FPV's route
  or document scroll. The directory's hardware-space link opened FPV in 3D.
- Compiled 390×844: selector and zoom target were 44px high, with 10px clearance
  above stage actions and no horizontal overflow. Entering through the project
  notes opened the drone, one canvas and the workshop controls at document top.
- Compiled 820×740: vertical plan plus selector, 19px control clearance, no
  overflow. At 820×1180: horizontal plan above a 608px directory, selected FPV
  visible, no overflow. The final stylesheet shows only Your place in that
  compact drawing's legend. Temporary viewport overrides were reset.
- Direct app navigation loaded the deferred viewer with one iframe and no
  hall canvas. Expand, Escape to restore, Reload and Gallery worked. Gallery
  removed the iframe, loaded one hall canvas and focused EEE Roadmap's row.
- Four captured development errors came from the brief interval between
  renaming the boundary and updating its JSX references. Compiled navigation
  recovered and no production errors were captured. These historical dev
  messages are not evidence of a production runtime failure.

### Unresolved embedded-content check

EEE Roadmap stayed blank/about:blank inside both the portfolio and a separate
plain HTML iframe using the same URL, permissions and referrer policy:
`_local/embed-review.html` on the development server. Its separate browser page
loaded the actual learning-site content. A public HEAD request returned HTTP
200 with text/html and no X-Frame-Options or Content-Security-Policy header.
Those observations do not establish the cause or prove embedding is permitted
under every response path. The portfolio's Reload control did not resolve it.

The viewer controls passed; embedded content loading did not. No iframe
permissions or remote hosting settings were changed. The asynchronous module
failure UI was implemented but not deliberately fault-injected. Firefox,
physical phones and owner acceptance remain unverified.

## Owner functional review — pending, about three minutes

No account is needed. The local preview is running. To rebuild and restart:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops the preview. The optional local visitor service is not required;
omit `&community=local` if it is unavailable.

- [ ] Open the map link at laptop size. Expected: readable section names and
  directory, selected FPV visible. Try Closer view and Tab through the plan;
  focus names the preview while the selected project stays unchanged.
- [ ] Choose Enter the island from map mode, return, then try the link in the
  project notes. Expected: both open the drone directly, with no second Show 3D
  step. Switch to PetBot and return to confirm the matching notes.
- [ ] Try the map on a phone. Expected: selector, zoom and stage actions stay
  separate and usable; selecting another exhibit preserves its correct context.
- [ ] Open EEE Roadmap's live app in Firefox and the in-app browser. Report
  whether the embedded content appears. Try Expand, Escape outside the iframe,
  Reload, Open app and Gallery. Expected: controls stay usable and Gallery
  returns to EEE Roadmap, including if the remote page remains blank.

User checks are unreported and none are waived. The embedded-content failure
and wider portfolio acceptance remain open; this does not recommend merge.
