# Controls and scroll follow-up — 21 September 2026

## Scope and revision

First implementation pass after the owner asked to continue the backlog:
scroll overhead, walk-around controls, project return and adjacent iframe
loading feedback. This is not acceptance of the overall art direction.

- Tracker: https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/42
- Issues: #32, #33, #36, #37. Related controls reports: #13–15, #19–21, #25, #30.
- Branch: `codex/hall-display-polish`.
- Base HEAD: `44c38295939ab18e06559859b7bfb337d1276cf5` plus the existing dirty
  working tree and this pass. No commit, merge or deployment in this pass.
- Production build: 21 September, 08:42 local; entry `index-BEk-64jT.js`,
  CSS `index-jhHMdea8.css`, free roam `BabylonScene-BMPQQkH5.js`.
- Preview: http://127.0.0.1:5186/ ; development profiling on port 5187.
- Historical findings remain in `2026-09-21-backlog-and-local-state.md`.

## Changes

Scroll anchors now cache geometry until layout invalidation, rather than
reading every card on each scroll update. Whole incoming sections still soften,
with opacity changing during scrolling and a fixed 2.5 px blur clearing once
over 180 ms. Offscreen/current sections, focused links and reduced preferences
remain clear. DEV profiling reports geometry measurements and scroll updates.

Project return uses the same reading inset as active-card selection. A pending
scroll callback cannot overwrite a new clicked/hash route. Focused projects
keep the scene on their exhibit; a wheel gesture over the hall can resume the
gallery even when Scroll with hall is off.

Keyboard and touch now use one movement path: time-based speed, normalized
diagonals, pitch-independent walking and analytic jump motion. Inputs clear on
blur/release, pause and disposal. Teleports use short eye-height travel and face
the exhibit; another destination cancels the first. The hall directory stays
open after choosing a destination, and the approach distance is within inspect
range. The canvas has a label and keyboard focus; inspection dialogs contain
focus, close with Escape and restore focus without recapturing the mouse.

Mobile controls follow actual orientation, with a direction pad, look area,
exhibit selector, Inspect and Portfolio return. The old forced-landscape page
rotation is removed. The desktop avatar control is hidden on mobile to prevent
overlap. Safe areas and narrow-screen control sizing are retained. Rendering
pauses for hidden tabs and inspection; water passes are capped at 30 Hz in
ordinary free roam, with XR behavior retained.

Live-app loading uses a small status bar, with a ten-second slow-load message,
direct-open link and Retry. This repairs indefinite loading feedback, but does
not establish that cross-origin embedded applications work.

## Agent verification

PASS: TypeScript, ESLint, production build, content/build checks for 11
projects, hall geometry, portal math/routes, scroll mapping, movement math and
`git diff --check`. Initial JavaScript remains 202,326 bytes. Existing optional
3D chunk-size and stale Browserslist-data warnings remain.

Movement checks cover 30/60/90/120/170 Hz walking, running and diagonal speed;
heading rotation; bounded tab-resume delta; jump apex/landing across frame rates;
deadzone and shortest yaw. Scroll checks include short-card return at three
viewport heights and the last section at maximum scroll.

Chromium in-app UI checks:

- Clicking THE FINALS opens its focused case study. Back to gallery restores
  its card focus, correct caption and matching active exhibit. Its card begins
  at the shared 150 px reading inset rather than advancing to PetBot.
- With Scroll with hall disabled, opening the case study then Escape returns
  to the same gallery card and caption. The toggle was restored afterward.
- Go to Food Wars faces its exhibit, preserves the directory and shows Inspect.
  The inspection dialog focuses Close; Escape dismisses and restores focus.
- Mobile UI at 390×844, 740×390 and 320×568 exposes navigation, movement, Jump,
  Run and Inspect without forced rotation. At 320 px, document width is 320 px
  and control bounds remain inside the viewport. These are desktop viewport
  checks, not physical-phone acceptance.
- The exhibit selector reaches Food Wars; Run toggles Running/aria-pressed.
- THE FINALS iframe's slow-load message and Retry were observed; Retry returns
  to Opening. The embedded document itself remains `about:blank` in this IAB
  session, so actual app interactions are not passed.
- The retained port-5186 preview was refreshed and its production entry
  `index-BEk-64jT.js`, rendered hall, entrance copy and absent audit panel were
  verified. Temporary viewport overrides and the test tab were removed.

## Runtime evidence

These are six-second **development Chromium** samples on an RTX 3080 through
ANGLE/D3D11, viewport 1360×900, canvas 697×816. They do not establish Firefox,
phone, production-site or VR performance, or a before/after speedup ratio.

| Interaction | Frames | p50 | p95 | p99 | Max | Long tasks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Work → Projects section sweep | 1,015 | 5.9 ms | 6.7 ms | 7.2 ms | 33 ms | 0 |
| AVVR return to hall | 928 | 5.9 ms | 6.7 ms | 7.2 ms | 10.7 ms | 0 |

The section sweep recorded **1 geometry measurement / 869 scroll updates**,
43 median draws and 88,296 scene triangles. Reflection/refraction refreshed
170 times each; AVVR/PetBot preview passes were 109/21. CPU p95 was 1.5 ms.
Scene ID: `d0d352dd-9b63-4473-a08a-613bfba5f287`.

AVVR return recorded 2 geometry measurements, 26 median draws and CPU p95
1.9 ms. Preview passes: return 299, AVVR 146; reflection/refraction 64 each.
Scene ID: `4e942ef5-7cb2-4004-bc1e-b1030fff7741`.
The earlier uneven return sample remains historical evidence; this single
smooth repeat does not establish that every device/return path is fixed.

## Guided user check — pending

Test the build identified above, about three minutes on desktop. The production
preview is already running. If it has stopped, from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Open http://127.0.0.1:5186/ in **Firefox**, using the same machine that had lag.
No account is required. Ctrl+C stops a preview started with the command above.

- [ ] **1. Scroll:** Leave Scroll with hall on. Scroll from the entrance through
  Work and Projects, once over the reading panel and once over the hall.
  Expected: responsive scrolling, camera follows, incoming text clears without
  a hitch or staying blurry.
- [ ] **2. Project return:** Open THE FINALS case study, choose Back to gallery,
  then repeat using Escape. Expected: its card/caption stay selected rather
  than PetBot. Turn Scroll with hall off and repeat; return still works.
- [ ] **3. Physical walk:** Open `http://127.0.0.1:5186/#explore`, click the
  scene, use WASD and mouse look, then Shift and Space. Release keys and press
  Escape. Expected: steady movement, immediate stop, one grounded jump and
  reliable cursor release without the page scrolling.
- [ ] **4. Inspect and re-enter:** Use Go to Food Wars. Expected: a short travel
  facing the frame, directory stays open, Inspect/E works. Dismiss with Escape,
  return to Portfolio and enter Walk around again. Expected: no stuck movement,
  duplicate key responses or surprise pointer capture.
- [ ] **5. Real phone, when an accessible preview is available:** Repeat move,
  look and Inspect with two fingers, release both, rotate portrait/landscape
  and return to Portfolio. Expected: controls stay reachable, movement stops,
  no forced page rotation or background scrolling. Desktop size emulation does
  not pass this item; the loopback URL is not a phone-accessible deployment.

User-reported results/time: **pending**. No checks waived. Issues remain open.
The workspace requires physical functional acceptance before merge; passing
these checks is separate from merge/publish authorization. No merge is proposed
here. A later patch requires retesting the affected checks.

## Remaining work

Firefox and physical inputs have not been tested by the agent. Gyro, collision
feel, real phone performance/thermals and headset use remain unaccepted. Whole
section blur still has a paint cost and should be reduced further if Firefox
remains slow. Cross-origin app behavior needs a regular-browser check.

The visual/copy direction, visitor service, boats/mountain/note wall and domain
migration are still tracked separately. No new community infrastructure or
production hosting changes were made. Pre-existing `evaluation/` is untouched.
