# Frame interaction follow-up — 23 September 2026

Selected still-image frames now open their pictured image instead of navigating
to the project route already on screen. A hover hint names the action and its
destination, with a warm material change on the frame or navigation button.

## Local revision

- Branch: `codex/hall-display-polish`, intentional dirty tree preserved.
- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-BrEOeATs.js`; CSS: `assets/index-6xiyy1Za.css`.
- Browse scene: `assets/HallScene-D6z5AQkT.js`.
- Free roam: `assets/BabylonScene-pZNcfrg2.js`.
- Manifest SHA256: `23DFCCFF199BDE34E9F430F99A32381E7682BDB0A324ECFB35882187C625F5F0`.
- Preview: <http://127.0.0.1:5186/#project/rubyvr-studio>.
- No commit, push, issue change, PR, merge or deployment.

## Behavior and cost

`exhibitAction` supplies both the pointer hint and the pick action. An unselected
still frame opens project notes; selecting its image again opens the existing
accessible viewer. It starts with the primary image pictured in the frame,
even if another gallery image was selected in the notes. Close returns focus
to Back to gallery and keeps the reading position. The notes' own image button
continues to restore focus to itself.

App surfaces keep their embedded-browser routes, and island surfaces keep their
portal routes. Navigation arrows always change project, with the adjacent
project's name in the hover hint. Private-work diagrams without a source image
focus the notes instead of offering an empty image viewer.

Feedback changes existing materials and redraws on target changes. There are no
new textures, geometry, render targets, glow/outline passes or animation loops.
Initial JavaScript is 226,345 bytes, 1,667 bytes above the preceding image/UX
build; the 3D code remains separate.

## Verification

- PASS: ESLint, TypeScript/production build, content/asset validation for all 11
  projects, extended `check:navigation`, and Git whitespace check using the
  repository's normal line-ending configuration. Existing large Babylon chunk
  warning remains.
- PASS in Chromium at 1280×720: hover changes the selected frame edge and shows
  “Enlarge image · RubyVR Studio”. The right arrow names THE FINALS Outfit Studio
  and opens that project's notes. The app frame opens `#app/the-finals-outfit`
  with the expected iframe source; this verifies navigation, not the external
  application's complete operation.
- PASS: selecting PetBot's portal enters `#world/hardware/petbot`, with the
  PetBot station selected; Return to hall opens its notes without an image modal.
- PASS on the final build: opening RubyVR through the notes, moving to image 2
  and closing restores its image button. Selecting the physical frame then opens
  image 1. Closing restores the stage return link, keeps `#project/rubyvr-studio`
  and preserves the reading panel at 374 px.
- PASS at 390×844: selecting the frame opens the image viewer, with a visible
  44 px Close button and no horizontal page overflow. Closing preserves the
  window's 80 px scroll position and returns focus to the stage return link.
  This is viewport simulation, not physical touch-device acceptance.
- No captured console errors in the production review tab.

### First-hover idle regression

A fresh local development scene was allowed to settle, then hovered over RubyVR
and moved to the audit's Start button. The six-second sample initially counted
237 scene renders: the unset experience-hover value changed from `undefined`
to `null` and unnecessarily started the gallery's settling period. Initialising
that value to `null` removed the burst.

The same sequence in a fresh scene after the fix counted **0 scene renders**,
0 render-target passes, 0 long tasks and 0 scroll-layout measurements during
the sample. Keep renderer awake was off; water, shadows, logos and portal
previews were enabled. This measures idle work after the visual response, not
animation FPS, input latency or the browser's overall energy use.

Environment: Chromium IAB, RTX 3080 via ANGLE/D3D11, 1280×720 viewport,
723×644 canvas. Before scene `3b9e1c8c-aa9c-4c26-8994-d398191b79dd`;
after scene `244e35cc-51c8-4552-8fdc-32d248e037ff`. Both contained 257 meshes,
65 textures and 177,436 triangles. No Firefox, physical-phone or headset claim.

Visual captures: [hover](2026-09-23-frame-actions/frame-hover.jpg),
[frame image](2026-09-23-frame-actions/frame-image.jpg),
[phone-sized viewer](2026-09-23-frame-actions/phone-image.jpg).
They were captured from the immediately preceding visual build
`index-BR0UOrPO.js`; the final patch only initialises hover metadata. The final
image/focus behavior was rechecked afterward. Captures are unaltered browser
screenshots, with no generated or repainted project content.

## Owner checks — pending

The local preview is running. If it stops, use PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

A rebuild after later edits needs its own build identity. Ctrl+C stops preview.
Allow about three minutes for these checks; no login is required.

- [ ] **1. Frame:** Open the RubyVR preview, hover its image, then click it.
  Expect a warm edge and named hint, followed by the full-size image. Press
  Right, then Escape; expect the same project and reading position.
- [ ] **2. Directions:** Hover each circular arrow beside the frame. Its hint
  should name the next/previous project. Click one; its project title, frame and
  counter should agree. Press Escape to return to the gallery.
- [ ] **3. Other exhibits:** Try a live-app frame and PetBot's portal. Expect
  the embedded app and hardware island respectively, with visible return controls.
- [ ] **4. Ordinary reading:** Open an image from the notes, close it, then open
  it through its physical frame. The right image should appear and focus should
  return to the control appropriate to where you opened it.
- [ ] **5. Device feel:** Repeat on Firefox and a real phone using a prepared
  reachable preview. Check picking, Close, scrolling and motion; the loopback
  URL above only reaches this PC.

User result: not yet reported; no checks waived. The broader visual goal and
physical-device acceptance remain open. This local pass does not establish
merge readiness or permission to publish.
