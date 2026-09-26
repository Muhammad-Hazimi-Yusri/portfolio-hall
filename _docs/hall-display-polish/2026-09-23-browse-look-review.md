# Browse camera controls — 23 September 2026

Visitors can look around from their current place in the guided gallery, then
continue scrolling or enter walking with that direction preserved. This pass
also reduces the island camera's coasting after a short drag.

## Local build

- Branch: `codex/hall-display-polish`, intentional uncommitted changes.
- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-B5W2oiGp.js`.
- Styles: `assets/index-CTqqT1eK.css`.
- Browse scene: `assets/HallScene-CamLd2aI.js`.
- Walking scene: `assets/BabylonScene-Div3FVre.js`.
- Visitor display: `assets/visitorDisplay-BOr4uhss.js`.
- Manifest SHA256:
  `3D9E3E2CADF1F6C6703FCCB02DEBAB189784BB9E9DDC81696BC5DC6A72CE2DE5`.
- Preview: <http://127.0.0.1:5186/?community=local#project/rubyvr-studio>.
- Build log: `_local/browse-look-build.log`.
- No commit, push, issue change, PR, merge, deployment or DNS change.

## Behavior

- A primary mouse or pen drag looks around without moving off the guided path.
  Sensitivity follows the field of view and render height. Pitch is limited to
  prevent an inverted camera. Hall dragging has no inertial spin.
- Reset view appears after turning. Ordinary scrolling or choosing another
  exhibit restores the guided direction. Escape resets an overview; in project
  focus it retains the existing return-to-gallery action.
- Walking inherits the actual position and direction visible in the hall.
  Returning to the portfolio retains the nearby project as before.
- Clicks with small hand jitter remain clicks. Drags suppress the engine's
  delayed release pick until the next pointer gesture. This prevents an 8px
  drag over a picture from opening its image; the following click works without
  a cooldown. Cancellation, blur and disposal release pointer capture.
- Touch retains native scrolling. Islands, image dialogs and embedded apps
  retain their own input. Island inertia is now 0.5, with mouse sensitivity
  1100; orbit limits and the existing reset control remain in place.
- The controller uses the existing render loop and reusable target vector.
  It adds no render target, asset, separate animation loop or continuous spin.
- Focus outlines in the portfolio use its copper accent.

## Agent checks

- PASS: final build/TypeScript, lint, browse-look input and geometry checks,
  navigation, scroll, portal checks and diff whitespace check.
- Initial JavaScript: 231,617 bytes, 672 bytes above the preceding index pass.
  3D loads separately. The existing large Babylon bundle warning remains.
- An early runtime trial exposed accidental image activation after an 8px
  drag. Clearing suppression in a microtask was too early for Babylon's pick.
  Retaining it until the next pointerdown fixed the actual reproduction and is
  covered by `tools/check-browse-look.mjs`.
- Final compiled runtime: 8px drag across RubyVR's frame kept its project
  route, showed Reset view and opened no dialog. The next click at the same
  point opened the image viewer. Escape closed the viewer; Right opened THE
  FINALS, focused its heading and cleared the prior look offset.
- Final compiled runtime: a 320px drag from RubyVR turned along the gallery.
  Walk here started beside RubyVR facing toward THE FINALS and PetBot. Return
  restored the RubyVR project route and focused heading.
- Development runtime: Reset and overview Escape restored the guided view and
  focused Scroll with hall. Scrolling over the turned hall advanced the reading
  pane, resumed guided travel and removed Reset view.
- Final compiled 390px and 320px viewport checks: Reset view stayed inside the
  stage, had a 44px target and did not overlap the exit or walking controls.
  No horizontal overflow. The 320px Next project link opened THE FINALS and
  focused its heading. These are desktop mouse/viewport checks, not touch tests.
- Both development and final compiled AVVR: a 124px drag gave a modest view
  change without the previous coast behind the railing. Clicking the physical
  right pad changed the source to Right. Compiled Reset and Escape returned to
  the AVVR project. No audio playback was required for these input checks.
- The main preview was explicitly reloaded at 1379×1278 and left on RubyVR.
  Its `index-B5W2oiGp.js` entry, ready scene and lack of horizontal overflow were
  verified; no console errors were captured there. Temporary test tabs were
  closed and the viewport override was reset.

## Local performance observations

Six-second development samples in desktop Chromium/ANGLE on RTX 3080, render
size 723×644. Water, shadows, logos, portals and flags enabled; Keep renderer
awake disabled. No builds or checks ran during timed samples.

All three completed samples used scene
`5a3c4d06-8438-4a91-8a8c-eef128b1175a`.

| Sample | Observed result |
| --- | --- |
| Settled after hall drag | 0 rendered frames, 0 offscreen passes, 0 long tasks |
| Settled after Reset view | 0 rendered frames, 0 offscreen passes, 0 long tasks |
| Continuous project scroll | 1,019 frames; frame p50 5.9ms, p95 6.3ms, max 9.1ms |
| Scroll CPU / GPU p95 | 0.7ms / 3.76ms |
| Scroll work | 0 long tasks, 0 layout measurements, 987 scroll updates |
| Scroll draw calls | Median 27 |

The scroll sample was run from the continuous gallery. An earlier attempt in
project focus correctly refused with its "Open Scroll with hall" message; it
produced no timing sample. Zero draws does not mean the entire app or scheduler
uses zero CPU. These measurements do not establish a Firefox or phone speedup.

Physical Firefox, touch, pen, mouse capture, phones, headset and owner visual
acceptance remain unverified. Public visitor-service deployment and domain
migration remain separate work. The broader portfolio goal is still open.

## Owner review — pending, about two minutes

The preview is running. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional local visitor data needs `npm.cmd run community:local` in a second
terminal. Omit `?community=local` to review without it. Ctrl+C stops a manually
started service. These steps do not submit a note or enable sound.

- [ ] Open RubyVR. Drag a little across the image and release. Expected: the
  camera turns and Reset view appears; the image viewer stays closed. Click the
  image normally, then press Escape. Expected: it opens and closes normally.
- [ ] Drag to look along the gallery, choose Walk here, then Return to portfolio.
  Expected: walking starts beside RubyVR with that facing direction; returning
  restores RubyVR. Check physical mouse capture separately if you enable it.
- [ ] Press Right, then Escape. Expected: THE FINALS opens, then its gallery
  row returns into view. At Entrance, drag and press Escape. Expected: only the
  camera direction resets. Scroll and check the guided camera resumes smoothly.
- [ ] Open AVVR and enter its island. Drag briefly, click the right source pad,
  use Reset view and press Escape. Expected: controlled motion, Right selected,
  a restored room view and a return to AVVR's project notes.
- [ ] Repeat normal browsing in Firefox and on a real phone with a reachable
  preview. Touch should scroll normally. Check legibility, motion comfort and
  any release, focus or stuck-input behavior.

User results and any waivers: pending. Local passes are not owner acceptance,
merge readiness or authorization to publish. Keep this build's record if a
later revision changes the affected controls.
