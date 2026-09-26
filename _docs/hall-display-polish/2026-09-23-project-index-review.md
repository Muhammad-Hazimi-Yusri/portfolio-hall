# Project browsing and idle rendering — 23 September 2026

This pass makes the gallery easier to scan, gives portal frames a useful image
at shallow angles, and removes idle rendering caused by offscreen company
logos. The wider visual and physical-device review remains open.

## Local build

- Branch: `codex/hall-display-polish`, intentional uncommitted changes.
- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-D5nHD7d1.js`.
- Styles: `assets/index-DD1BcvJe.css`.
- Browse scene: `assets/HallScene-BvqNvDfR.js`.
- Walking scene: `assets/BabylonScene-arpKBTHq.js`.
- Visitor display: `assets/visitorDisplay-JlZ4IaTd.js`.
- Manifest SHA256:
  `75630D2A0BF981B728BDADD29F8A29AD426AD07EB620BACBDD970278DF4AB819`.
- Preview: <http://127.0.0.1:5186/?community=local#projects>.
- Build log: `_local/project-index-build.log`.
- No commit, push, issue change, PR, merge, deployment or DNS change.

## Changes

- All nine public projects use the same compact image-and-text row, using
  existing real screenshots or photographs. Source proportions are preserved.
  Internal work remains text-only. There are no new image assets.
- An unobtrusive `In view` label follows the current exhibit. App links name
  the project for assistive technology and have 44px targets on narrow screens.
- The Projects overview starts before Food Wars, using the first public
  project's frame position, rather than opening past it and moving backwards
  when the visitor reaches its row.
- Distant or oblique portal frames show their original project picture. The
  live view fades in as the approach becomes useful. Picking still opens the
  same world while the live plane is transparent. Its first offscreen pass is
  deferred until needed. This adds material blending, not a new texture or
  render target; no isolated before/after portal-cost improvement is claimed.
- Switching map/scene layouts in the continuous gallery preserves the pending
  destination, or the current exhibit when no navigation is pending. Project
  notes keep their own reading position.
- Idle logo animation only keeps the browse renderer awake if a logo mesh is
  in the camera frustum. Mesh references are cached after loading. Travel,
  interaction and normal visible-logo motion still wake the scene.

## Agent checks

- PASS: final build/TypeScript, lint, logo geometry/motion checks and diff
  whitespace check. Navigation, scroll and portal checks also passed earlier
  in this pass; their sources did not change after those checks.
- Initial JavaScript: 230,945 bytes. 3D still loads separately. The existing
  large Babylon bundle warning remains.
- Development: clicking the oblique AVVR poster entered `#world/avvr/avvr`.
  Clicking the room display opened the original-image viewer. Closing it and
  returning to the hall preserved the AVVR project.
- Compiled portal check: a direct click on PetBot's live window entered its
  workshop. Switching to FPV updated station controls and notes. Hall returned
  to `#project/fpv-drone`.
- Development: consecutive Right presses moved AVVR → WattWhere → RubyVR.
  Escape returned to `#gallery/rubyvr-studio`, focused its row and settled the
  `In view` marker there. Walk around started beside RubyVR; returning restored
  the same gallery route and row focus.
- Compiled 320px/390px checks: keyboard navigation from RubyVR to THE FINALS,
  Escape, selected-row focus, loaded thumbnails, no horizontal overflow and
  44px app links. Direct pointer clicks on map/3D controls retained THE FINALS
  in both directions. RubyVR notes retained their reading position: document
  offset 844 → 938 → 844 as the sticky stage grew and shrank.
- Those responsive interaction checks used `index-CEdjy4Bv.js`; the final build
  adds the logo-visibility render gate only. The index, CSS and scroll-hook
  source are unchanged from that checked build.
- Final main preview was explicitly reloaded and its `index-D5nHD7d1.js` entry
  verified at 1379×1278. Nine public preview images, no private-work images,
  no horizontal overflow and no captured console errors. It is left at Projects.

Test-method correction: locator clicks on sticky phone controls sometimes
scrolled the document before clicking, changing the current exhibit before the
handler ran. This is not evidence of an ordinary pointer-click regression.
Final toggle checks used coordinates from fresh screenshots of visible controls.
Temporary diagnostic logging and the trial scroll-anchoring CSS were removed.

## Local performance observations

Six-second development samples, desktop Chromium/ANGLE, RTX 3080, render size
723×644. Water, shadows, logos, portals and flags enabled; Keep renderer awake
disabled. No builds or tests ran during the timed samples.

| Sample | Before logo visibility gate | After |
| --- | --- | --- |
| Gallery scroll frames | 1,019 | 1,021 |
| Scroll frame p95 | 6.5ms | 6.5ms |
| Scroll CPU p50 / p95 | 0.4 / 0.9ms | 0.4 / 0.9ms |
| Scroll GPU p50 / p95 | 0.37 / 3.81ms | 0.88 / 3.71ms |
| Scroll long tasks / layout measurements | 0 / 0 | 0 / 0 |
| Settled final-gallery frames | 1,021 | 0 |
| Settled final-gallery offscreen passes | 0 | 0 |

Before scene: `cc9e8928-feba-4b98-b2a5-c14489ff42f4`.
After scene: `9539e650-edae-4e07-882c-4a095c267644`.
Both scroll samples used the built-in project-scroll path and ended at Balairung.
The improvement is removal of idle draws; these timings do not establish a
scrolling speedup. GPU variation is retained rather than interpreted as one.

In the after scene, visible TNEI still rendered 1,021 frames over six seconds
(p95 6.2ms). Pausing logos and allowing it to settle produced zero frames,
zero offscreen passes and zero long tasks in the next sample. Zero drawn frames
does not mean the JavaScript scheduler or entire application uses no CPU.

Physical Firefox, phones, mouse capture, headset, listening and owner visual
acceptance remain unverified. Desktop viewport checks do not establish those.
Public visitor-service deployment and domain migration remain separate work.

## Owner review — pending, about three minutes

The preview is running. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional visitor data needs `npm.cmd run community:local` in a second terminal.
Omit `?community=local` to review without it. Ctrl+C stops a manually started
service. These checks do not submit a visitor note.

- [ ] Open Projects. Scroll through the rows. Images, names and `In view`
  should match the exhibit; the initial approach should move forward.
- [ ] Open RubyVR, press Right and then Escape. Expected: THE FINALS opens,
  then its row is visible and focused in the gallery. Choose Walk around from
  RubyVR and check that you start beside it; Return keeps that place.
- [ ] At phone width, switch map/3D in both directions while browsing a
  project. Expected: the same exhibit remains selected. Repeat while partway
  through project notes; the text should not reset to the heading.
- [ ] Enter AVVR through its picture, enlarge the wall display, close it and
  return. Enter PetBot, switch to FPV and return. Check the transitions and exits.
- [ ] Visit Experience, check the logo behavior and Pause/Play controls, then
  repeat ordinary scrolling in Firefox and on a real phone with a reachable
  preview. Report motion discomfort, stutter or a control that loses your place.

User results are pending; no checks have been waived. Passing local checks is
not owner acceptance, merge readiness or authorization to publish.
