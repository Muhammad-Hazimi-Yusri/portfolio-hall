# Walking exhibit sheets — 23 September 2026

Walking inspectors now show the project's actual images and captions beside
its summary, contribution and status. Visitors can inspect those images at
full size without leaving the walk. The main project links remain visible
below the scrolling content, including on phones.

This continues the combined local work. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance remains pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-NmguLZzZ.js`; CSS: `assets/index-DzN52CYm.css`.
- Hall: `assets/HallScene-3EbNAXAI.js`.
- Walking: `assets/BabylonScene-BcIUw-Ba.js`.
- Manifest SHA256: `28528013621D4C3023A67E6BA16F81AE4ABDB18CBC7676C200B54A686C4171B4`.
- Open: http://127.0.0.1:5186/?community=local#project/rubyvr-studio
- Build log: `_local/walk-media-build.log`.

## Changes

The spatial POIs reference the same image and gallery records as the project
pages. The shared image viewer preserves their alternative text, captions,
attribution and actual-size inspection. No new project claims or generated
project imagery were added. AVVR's walking invitation now uses the current
listening-room description instead of describing only its earlier audio demo.

Wide inspectors use two columns. Narrow inspectors stack the image and notes,
with Close above the scroller and the project links below it. The image viewer
owns its own arrow keys and Escape. Closing it returns to the inspector;
closing the inspector returns to the existing walking control. If resizing
has removed that control, focus falls back to the walking canvas without
capturing the mouse.

The walking scene retains its existing pause while the inspector is open.
This pass adds no 3D geometry, shader, blur layer, animation loop or render
target. The additional gallery UI mounts only when its inspector opens. Initial JavaScript is
249,296 bytes, 40 bytes above the preceding map build; 3D still loads separately.
No new frame-rate or Firefox performance claim is made.

## Agent checks

- PASS: build/typecheck, lint, navigation checks, content/asset checks and
  whitespace diff check. The existing large Babylon chunk warning remains.
- Development FPV inspector: the original portrait image and caption were
  visible beside the contribution. Image viewer → Actual size → Escape
  returned to the inspector and focused Enlarge image. A second Escape
  closed the inspector. Its route marker stayed at `50.2222%`.
- Development RubyVR: thumbnail Right selected image 2 and its caption;
  enlarging opened that image. Left in the viewer returned to image 1.
- 390px inspector: image, thumbnails, caption, role and status fit above the
  fixed links. The Close control was 44px high. At 320px, FPV's three links
  wrapped below the body and remained visible while the details scrolled.
  No horizontal document overflow was observed.
- 320px image viewer: image controls, Actual size and Close fit the viewport.
  Escape returned to the inspector before returning to the walk.
- A real resize defect was reproduced: opening on desktop, resizing to phone,
  then closing left focus on `body` because its original desktop control had
  unmounted. The fallback repair was verified in the final compiled build;
  focus was on `.walk-canvas`, and the world was no longer inert.
- Final compiled RubyVR: both source images loaded at 1600px intrinsic width;
  image Right selected image 2. Desktop-to-320px resize, image Escape and
  inspector Escape behaved correctly. Document width was 320px.
- Final compiled inspector: Shift+Tab from Close wrapped to Source & progress;
  Tab returned to Close. Project notes → Escape restored RubyVR at the same
  `33%` route marker, with one canvas and canvas focus.
- Development FPV inspector → hardware workshop → Escape restored Inspect
  FPV drone. The 320px TNEI inspector retained its dates, role, summary, Close
  and View experience action.
- Final compiled guestbook: existing local notes and form remained in the
  scrolling body; Close stayed visible and returned to the walk. No note or
  external message was submitted. No captured browser warnings or errors.

These are local Chromium checks, including resized viewports. Physical phone,
Firefox, captured mouse, headset and owner acceptance are still unverified.
The broader visual-polish objective remains open.

## Owner review — pending, about 2 minutes

The preview is running. If a restart is needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local visitor preview uses `npm.cmd run community:local` in
another terminal. The exhibit sheets work without it. Ctrl+C stops a manually
started service.

- [ ] Open the review URL, select **Walk here**, then **Read notes** or press
  E. Expected: RubyVR's actual editor image appears beside its contribution,
  with a second image and its own caption.
- [ ] Select image 2, enlarge it, try Actual size, then press Escape twice.
  Expected: the first Escape returns to the card; the second returns to your
  walk at the same frame.
- [ ] Open the card again and choose **Project notes**, then press Escape.
  Expected: the full project page opens and returns to the same walking view.
- [ ] Try a narrow window or physical phone. Expected: Close and the main
  links remain reachable while the image and details scroll. Resize with the
  card open, close it, and check that walking controls still respond.

All owner checks are unchecked. This record does not recommend merge or
establish completion of the wider visual and performance work.
