# Keep the reading position after visiting an exhibit — 23 September 2026

Returning from a project island or an embedded app now restores the project's
reading position and the link used to enter. Previously, returning from the
PetBot workshop reset the notes to the top. Escape also restores an expanded
app to its normal size before a further Escape leaves the app.

This continues the combined local changes on `codex/hall-display-polish`.
No commit, push, PR, issue operation, merge, deployment or DNS change was made.
The broader visual goal and owner acceptance remain open.

## Identifiable build

- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus the dirty tree.
- Entry: `assets/index-BbzbyGgu.js`; CSS: `assets/index-BJkUrPmL.css`.
- Hall: `assets/HallScene-en3qeWuh.js`.
- Walking: `assets/BabylonScene-DVA3tefz.js`.
- Manifest SHA256: `04B2771BF1347E506527366FC6E88271EDC9A828B61959798CDCBE4E839756EA`.
- Build log: `_local/notes-return-build.log`.
- Preview: <http://127.0.0.1:5186/#project/petbot>.

## Behavior and limits

The notes keep an in-memory bookmark when the visitor leaves for an app or
island. Returning to the same project, including through browser Back, restores
the reading offset and keyboard focus. Offsets use the existing measured note
position, so ordinary scrolling adds no bounding-box measurement. A return
without a bookmark starts at the heading. Normal previous/next project links
still start the selected project at its heading.

The expanded-app Restore button now has a matching accessible name and an
Escape hint. Escape in the portfolio's surrounding controls restores the app
view and keeps focus on Expand. Keys inside an external iframe belong to that
application. Expansion still uses the existing iframe; this change introduces
no replacement iframe or reload action.

Bookmarks do not survive a page refresh or a walk that unmounts the reading
view. The separate saved walking position and Back to walk behavior remain as
documented in `2026-09-23-walk-excursions-review.md`.

No assets, styles, 3D geometry, render targets or animated effects were added.
Initial JavaScript is 237,407 bytes, 1,791 bytes above the preceding entrance
build. No new frame-rate or loading-time claim is made.

## Agent checks

- PASS: TypeScript, lint, production build and content/asset validation for all
  11 project records. Existing navigation and scroll checks pass. Git whitespace
  check passes with the repository's normal line-ending configuration.
- Development at 1280×720: PetBot notes at scrollTop 1,084 → workshop → Escape
  returned to exactly 1,084 and focused Enter the project island. Right opened
  FPV at scrollTop 0 with 7 / 9; Left reopened PetBot at 0.
- Development: EEE notes at scrollTop 720 → live app → Expand → Escape left the
  same app route with one iframe and focused Expand. Project notes restored 720
  and focused the stage's Try live app link.
- Development at 390×844: PetBot → workshop → browser Back restored scrollY
  1,350 and the island link. The invitation retained its y=376.453 position.
- Final compiled build repeated the desktop PetBot return at 1,084 and EEE
  app return at 720. Escape restored the expanded app without leaving its route.
- Final build: Right from PetBot → FPV → Walk here opened beside the FPV frame,
  with Read notes FPV drone and keyboard focus on the walking canvas. Return
  reopened FPV notes; Right then opened EEE Roadmap.
- Final build at 390×844: workshop → browser Back restored scrollY 1,350, the
  invitation at y=376.453 and focus on its entry link. The project bar began at
  y=270.078, exactly below the pinned hall. No horizontal document overflow.
- No browser errors were captured in the fresh production review tab. A dev
  hot-reload hook-order error occurred while adding hook refs; a full reload
  cleared it before testing. The production tab did not reproduce it.

These are Chromium checks, including resized desktop layouts. Physical-phone,
Firefox, headset and owner acceptance remain pending. External-app availability
and full functionality are separate from testing its portfolio controls.

## Owner functional review — pending, about three minutes

No login or visitor service is required. Open the preview URL above. If needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops a manually started preview. The loopback URL reaches this PC only.

- [ ] Scroll down PetBot's notes to The hardware workshop. Enter the project
  island, then press Escape or Return to hall. Expect the same reading position
  and focus on the island link. Repeat using browser Back.
- [ ] Press Right to open FPV. Expect its heading, 7 / 9 and matching frame.
  Choose Walk here, inspect the frame and return. Expect to remain at FPV.
- [ ] Open EEE Roadmap, scroll partway down its notes and use Try live app in
  the hall pane. Expand, then press Escape while a portfolio toolbar control
  is focused. Expect the normal app size. Choose Project notes and expect the
  original reading position. Keys inside the app remain owned by the app.
- [ ] Repeat the PetBot return in Firefox and on a phone with a reachable
  preview. Expect a stable reading position, usable return controls and the
  project bar below the pinned hall. Check the actual input and motion feel.

User results are pending; no checks are marked passed or waived. This is not
a merge recommendation or evidence that the wider portfolio goal is finished.
