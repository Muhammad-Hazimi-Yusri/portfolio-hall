# Return to a walk after exploring an exhibit — 23 September 2026

Walking inspectors now offer the AVVR and hardware island entrances. Opening
an island, project notes, live app or experience from an inspector saves the
walking position and viewing direction. Back to walk restores that pose.

This continues the combined local change on `codex/hall-display-polish`, based
on `44c38295939ab18e06559859b7bfb337d1276cf5`. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance is pending.

## Identifiable build

- Entry: `assets/index-ByIJlhAs.js`; CSS: `assets/index-BsWherys.css`.
- Hall: `assets/HallScene-Dy1QmDS9.js`.
- Walking: `assets/BabylonScene-Tux34Y9p.js`.
- Manifest SHA256: `0FF296B28566FDA52691BDC44DD1896464C6E43B68BE7AA7547B8750DD61E236`.
- Build log: `_local/walk-excursions-build.log`.
- Preview: http://127.0.0.1:5186/?community=local#project/fpv-drone

## Behavior and limits

Back to walk appears in the existing stage, project navigation and embedded-app
return controls while a saved walk exists. Escape in the portfolio and browser
Back to `#explore` restore the same position and gaze. Keyboard input inside an
external iframe remains owned by that application. The new island invitation
identifies the island as a portfolio illustration.

Browsing to another project's notes retains the original walking return. A
deliberate gallery, overview or CV exit ends it. Walk here starts a fresh walk
at the displayed exhibit, using the existing contextual entry behavior. The
bookmark is in memory only and does not survive refresh. The physical island
return portal still opens project notes, which retain Back to walk.

The two modes still dispose and rebuild their respective scenes; this does not
reuse a live walking renderer or establish an instant transition. No assets,
render targets, animated effects or blur layers were added. Initial JavaScript
is 235,282 bytes, 982 bytes above the preceding project-reading build.

## Agent checks

- PASS: production build/typecheck, lint, existing contextual-navigation checks,
  content/asset checks and diff whitespace check. The existing Babylon chunk
  size warning remains.
- Development 1280×720: FPV walking inspector → hardware workshop → Hover →
  Back to walk restored the same framed view and route marker (`50.2222%`).
  Project notes → Escape and project notes → browser Back also restored it.
  One canvas was present after return.
- Development: Continue through the gallery removed the saved return. Opening
  FPV normally afterwards showed Back to gallery. EEE inspector → live app →
  Expand → Back to walk restored its route marker (`55.1111%`).
- Development: TNEI inspector → View experience showed Back to walk and the
  "Esc to walk" hint. Escape restored TNEI at the same marker (`67.6667%`).
- Development 390×844: FPV inspector, Close, island invitation and project links
  fit without horizontal overflow. Close and links were at least 44px high.
  The stage return initially inherited a 36px height; a targeted CSS rule fixed
  this. Returning from the hardware island restored Inspect FPV drone.
- Compiled 390×844: AVVR notes → Walk here → Inspect → listening room → Back to
  walk restored Inspect Audio-visual scenes in VR. The finished island was
  visually inspected. The stage return measured 44px, with no page overflow.
- Compiled 1280×720: AVVR inspector → notes → Right opened WattWhere, showed
  3 / 9 and retained Back to walk. Escape returned to AVVR at the original
  marker (`23.2222%`), with one canvas and keyboard focus on that canvas.
- Compiled 320×740 (305px usable width): the EEE app toolbar wrapped without
  horizontal overflow; Back to walk, Reload, Expand and Open app were all
  44px high. Back to walk restored Inspect EEE Roadmap. The iframe was still
  waiting for the external site, so this verifies the portfolio's recovery UI,
  not the external application's availability or functionality.
- No browser errors were captured in the review tab. Its viewport override was
  reset and the temporary tab closed.

These are desktop Chromium checks, including resized layouts. Physical-phone
input, Firefox, headset input and owner visual acceptance remain unverified.
No new frame-rate or loading-time claim is made.

## Owner functional review — pending, about three minutes

No account is needed. Open the preview URL above. If the preview needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local community service supplies preview visitors. Omit
`?community=local` to review without it. Ctrl+C stops a manually started preview.

- [ ] From FPV notes, choose Walk here. Move or look slightly, then open its
  inspector and Enter the hardware workshop. Expected: FPV is selected. Use
  Hover, then Back to walk; your previous position and direction should return.
- [ ] Open Project notes from that inspector. Press Right to open EEE Roadmap,
  then Escape. Expected: you return to the original FPV walk. Open the notes
  again and use browser Back; it should return to that same walk.
- [ ] Go to EEE Roadmap in the walking directory, inspect it and choose Try live
  app. Expand the app, then Back to walk. Expected: EEE is still in front of
  you, even if the external app has not loaded. Repeat with TNEI → View
  experience → Escape.
- [ ] Open project notes from a walk and choose Continue through the gallery.
  Open another project normally. Expected: it shows Back to gallery, without
  an old Back to walk action. Walk here should start at the current project.
- [ ] On a phone, inspect AVVR, enter the listening room and return. Expected:
  Close, island entry, project links and Back to walk remain readable and
  tappable. Repeat the notes/Escape or browser Back flow in Firefox.

User results are pending; no checks are marked passed or waived. This record
does not recommend merge or establish completion of the wider visual goal.
