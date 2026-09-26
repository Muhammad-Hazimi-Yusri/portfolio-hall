# Live app follow-up — 21 September 2026

## Scope and local state

Continued #37 and the related loading/navigation work while preserving the
owner's request for one combined PR after returning to the PC. No GitHub issue
was opened, closed or edited. No commit, push, PR, merge, deployment, service
configuration or domain change was made. Other project repositories and the
existing `evaluation/` directory were not modified.

- Branch: `codex/hall-display-polish`.
- Base HEAD: `44c38295939ab18e06559859b7bfb337d1276cf5`; all accumulated changes
  remain uncommitted.
- Build: `index-DeBB-uUB.js`, `index-I3NQ47FU.css`, browse
  `HallScene-CR0VRvX-.js`, free roam `BabylonScene-DTRMkLmu.js`.
- Production preview: http://127.0.0.1:5186/ . Development checks used 5187.
- Prior island, visual/copy and controls/scroll records remain historical
  evidence. Their pending physical-device checks still apply.

## Implementation

The app toolbar always has Gallery, Reload, Expand/Restore and Open app. The
address includes the app's path rather than showing only a shared hosting
domain. It is labelled as the app's home URL; it does not pretend to track
cross-origin navigation. The loading message sits beside it, without covering
the embedded application's interface. It changes to Still waiting after ten
seconds. Recovery controls remain after a frame load event.

Expand uses the full portfolio width and hides the notes; Restore brings the
notes back. The same iframe stays mounted so an active selection or page is
preserved. Reload deliberately recreates just that iframe at the app's original
URL. Route changes close the frame and reset expansion.

Direct entry to `#app/<id>` no longer initializes the hall's Babylon scene
behind the app. The hall starts on the first return to browsing. If already
visited, it remains mounted with its rendering suspended. Hidden floor-plan
links are removed while an app is open; keyboard focus starts at Gallery.
Mobile controls have 44 px minimum heights and retain the Gallery label.

The iframe sandbox/permissions, app destinations and deployed apps themselves
were not changed. Browser load events do not establish application health;
the [MDN iframe event guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#error_and_load_event_behavior)
explains why both visible recovery controls and real interactions are needed.
The parent's Escape handler still cannot receive keys consumed inside a
cross-origin app; the visible Gallery link remains the reliable exit.

## Verification

TypeScript, ESLint, production build, portfolio/content checks, scroll checks
and `git diff --check` passed. Initial JavaScript is 204,084 bytes; 3D remains
separately loaded and all 11 project records/images pass the build checks.
Existing large optional-chunk and stale Browserslist warnings remain.

Observed in the local Chromium in-app browser:

- Fresh direct-app entry: one iframe, zero parent canvases and no hidden map
  links. Gallery removes the iframe and initializes one hall canvas. Browser
  Back reopens one iframe with expansion reset and focus on Gallery.
- Closing THE FINALS at phone width returned to
  `#gallery/the-finals-outfit`, focused its card, and matched the hall caption.
- Widths 320 and 390: no horizontal overflow; Gallery, Reload, Expand and Open
  app have 44 px targets. Loading status stays in the visible toolbar.
- Widths 900, 1280 and 1833: split and expanded layouts fit. At 1833, the stage
  fills 1833 px and the frame fills 1799 px. Restore shows the notes again.
- The development fixture's counter survived Expand/Restore at two, and reset
  to zero only on Reload. Its internal link navigation worked. A deliberately
  blank loaded document retained Gallery, Reload, Expand and Open app.
- Production manifest excludes `tools/fixtures/`; these are local Vite checks,
  not published project content. Open `/tools/fixtures/live-browser.html` on
  the dev server to repeat them.

### Deployed applications inside the local portfolio

Read-only HTTP HEAD checks returned 200 for all four configured demo URLs and
did not expose CSP, X-Frame-Options or Cross-Origin-Embedder-Policy headers.
This alone did not count as a working iframe check.

The first THE FINALS and EEE attempts stayed blank with a waiting message.
Both later loaded following direct-open/retry checks; the exact reason for
the initial delay is not established. Do not attribute it conclusively to the
server, sandbox or browser tool, or claim that first-load reliability is solved.

- **EEE Roadmap:** its direct-open link reached the live home page. Inside the
  iframe, clicking roadmaps reached All Learning Tracks while the parent stayed
  at `#app/eee-roadmap`. Expansion preserved that page; Project notes returned
  to `#project/eee-roadmap`.
- **THE FINALS:** its live model and catalogue rendered inside the iframe.
  Searching Afro Fade Black reduced the list to one item. Selecting it changed
  Your build from four to five items; Restore retained the selection and the
  parent app route. Gallery removed the iframe and returned to the correct card.
  This does not establish cosmetic/material accuracy or mobile GPU performance.
- **Food Wars (production preview):** the embedded hosted version showed its
  earlier Stock Overview UI and guest prompt. Continue as Guest dismissed the
  prompt and showed an empty inventory. No stock, products or shared demo data
  were created or changed; no personal sign-in was used. The newer pantry view
  is still separate work in the Food Wars repository.
- **WattWhere (production preview):** its explainer loaded inside the frame.
  Open the live dashboard navigated within that frame while the parent stayed
  at `#app/wattwhere`. Expand and the dashboard's legend toggle worked. The
  basemap still visibly carries repeated **API KEY REQUIRED** watermarks,
  confirming the earlier direct-page finding. Do not present this as a fully
  healthy deployed app or use that map as new promotional artwork. No WattWhere
  source, API key or hosting configuration was changed, and no issue was created.

The production app view was verified to serve `index-DeBB-uUB.js` with one
iframe and zero parent canvases on direct entry. Moving from Food Wars to
WattWhere kept that count. The public guest inventory was only read. Closing
WattWhere removed its iframe and focused the correct gallery card. The retained
preview was refreshed to the final build at Entrance: one hall canvas, no iframe
and no captured console errors. Temporary tabs and viewport overrides were
removed.

## Remaining acceptance

Check all four demos in regular Firefox and on a physical phone, including a
fresh first load, internal scrolling, Expand/Restore and Gallery. Use the direct
link for sign-in or features a browser does not permit inside a frame. No
account/authenticated workflow, API integration, clipboard sharing, file upload
or download was exercised here. No account settings, DNS or app security policy
changed. Initial remote-load delays and WattWhere's basemap remain open findings.

Keep #37 open for owner acceptance. The separate visitor service, moderation,
domain migration and physical navigation/VR checks are still pending as recorded
in the earlier local notes.
