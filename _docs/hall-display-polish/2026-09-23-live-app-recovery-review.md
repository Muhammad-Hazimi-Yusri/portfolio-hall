# Live-app recovery — 23 September 2026

Local work on `codex/hall-display-polish`, preserving the accumulated changes.
No commit, push, issue operation, PR, merge, deployment or DNS change.

## What changed

The embedded browser now uses its empty area for a loading notice and useful
recovery actions. After ten seconds it explains that the app has not finished
opening and offers Open separately, Try again and View app. The toolbar and
gallery return remain available. An App not showing? control can reopen help
even after an empty or error document fires a load event.

Help and View app retain the same iframe and its state. Only an explicit Reload
or Try again creates a new frame. Escape dismisses the notice before the outer
expanded-view action. Covered frames are removed from the accessibility tree
and tab order. Focus moves into the app if its loading notice disappears while
one of that notice's controls has focus; loading does not take focus from the
toolbar. Retry returns focus to Reload before removing its own button. Waiting
status is announced in one place rather than simultaneously in both notices.

The existing iframe permissions and project URLs are unchanged. The viewer is
still loaded only when opening an app; no scene work or animation loop was added.

## External loading remains intermittent

EEE Roadmap stayed at about:blank across several local attempts. A bare iframe
without the portfolio wrapper, sandbox or referrer attributes also stalled.
Food Wars stalled in the compiled viewer. A local interactive frame loaded.
EEE Roadmap opened directly in a top-level tab. A public GET returned HTTP 200;
the observed response had no CSP or X-Frame-Options header. These observations
do not establish the browser's cause or prove reliable embedding.

On a later final-build attempt, EEE Roadmap did load inside the iframe. Its
Tools link then navigated successfully. Opening and closing help, expanding and
restoring the viewer retained that Tools page. This successful attempt does
not erase the earlier failures or establish reliable first loading. Remote
Cytoscape warnings about unsupported shadow style properties were observed.

## Build and agent checks

Final entry: `assets/index-CzV95aep.js`; CSS: `assets/index-DwQLQo9n.css`.
Viewer: `assets/LiveProjectBrowser-D8ijB3rk.js` (3,977 bytes).
Manifest SHA256:
`48D5F9D7D9BC51133C4E58C239C16F452AE64D46AF67FC311F34D2196C399D59`.
Build log: `_local/live-app-recovery-build.log`.

Build/typecheck, lint, navigation and diff checks passed. The build validated
11 project records, assets and routes. Initial JavaScript remains 246,358 bytes
under the unchanged 250,000-byte gate. The existing Babylon chunk warning
remains; this UI change does not establish higher frame rates.

Local Chromium checks covered:

- The fixture counter retained Count: 2 through help, expansion and restoration;
  Reload reset it to zero.
- A real delayed loopback response cleared its notice after arrival. Focus
  followed a focused notice control into the iframe, while another run kept
  focus on the toolbar's Reload button.
- A blank document retained access to help. Escape dismissed help and focused
  its one iframe. Retry focused Reload, with one iframe still present.
- In the actual portfolio, Escape dismissed help before restoring an expanded
  app view. Slow loading exposed the recovery actions after ten seconds.
- At 320×568 and 390×844, recovery controls were 44px tall, wrapped at the
  narrower width, and introduced no horizontal overflow. The short viewport
  can scroll to the footer. This is responsive Chromium evidence, not a phone
  or Firefox acceptance result.
- The final compiled entry was confirmed in the main preview. Its loaded EEE
  Tools page survived help and expansion/restoration.

The optional delayed fixture is `tools/fixtures/iframe-delay-server.mjs`;
it binds only to 127.0.0.1:5192 and serves the existing test document after
14 seconds. It is not part of the production build. The review helper was
stopped after these checks. Temporary review tabs and viewport overrides were
cleaned up; the main preview remains available.

## Owner review — pending

Open <http://127.0.0.1:5186/?community=local#app/eee-roadmap> on this PC.
The compiled preview is already running. To rebuild/restart if needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

- [ ] Open a live app. Expect either the app itself or a clear waiting notice
  with direct access to Open separately; a stall should not be an unexplained
  blank area. Report whether it loads on the first attempt in Firefox.
- [ ] After the app loads, navigate within it, open App not showing?, then use
  Back to app, Expand and Restore. Expect the same internal page to remain.
- [ ] Expand the viewer and open help. Press Escape to dismiss help. Focus a
  portfolio toolbar control and press Escape again to restore the view. Use
  Gallery to leave the app; the matching project should remain selected.

Physical-device, Firefox and owner visual/interaction results remain pending.
No merge readiness or publishing approval is inferred.
