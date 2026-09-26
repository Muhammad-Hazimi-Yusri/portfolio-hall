# Walking wayfinding — 23 September 2026

Walk mode now has a labeled directory button, a list that opens at the current
part of the hall, and a clear nearby-exhibit card. The route strip names hovered
or keyboard-focused destinations. Its arrow keys preview adjacent destinations;
Enter travels there. This pass also fixes losing a gallery-return destination
when the viewport changes during the return animation.

Local combined work only: no commit, push, issue change, PR, merge, deployment
or DNS change. Owner acceptance is pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-CHizYhPT.js`; CSS: `assets/index-BVpyGeZ9.css`.
- Walking: `assets/BabylonScene-C0FYR2kA.js`.
- Hall: `assets/HallScene-CXSy2gTU.js`.
- Visitors: `assets/visitorDisplay-D5Enew4n.js`.
- Manifest SHA256: `58EA83081D1E68006B915F35B7D9522A3FAF7776AF5366B33D0034B71C2A2498`.
- Start: http://127.0.0.1:5186/?community=local#project/rubyvr-studio
- Build log: `_local/walking-wayfinding-build.log`.

## Changes and browser evidence

The directory replaces the narrow edge chevron with a named top-right control.
It opens the current section, highlights the nearby exhibit and reveals that
row within its own scroller. Closed content uses `hidden` and is absent from
the accessibility tree and tab order. Escape closes the list and returns focus
to the toggle. Selecting a destination closes the list; the existing travel
routine restores canvas focus when travel ends. Focus is not forced back to the
canvas if the visitor deliberately moves it elsewhere during travel.

The directory, return button, exhibit card and route strip share the portfolio's
paper/ink treatment. The exhibit card and control help stack naturally rather
than relying on separate fixed bottom offsets. Experience names are shorter in
both desktop and touch controls. The touch destination select uses 16px text.

Route stops follow physical order along the hall. Hover/focus names the target,
and Left/Right/Home/End move focus without teleporting. Enter activates the
focused destination. A small centre aiming cue appears only under mouse
capture and changes when an exhibit is available; it adds no 3D geometry.

Agent checks:

- PASS: build/typecheck, lint, navigation checks, movement checks, scroll checks
  and diff check. Initial JavaScript is 230,632 bytes, 60 bytes above the map
  pass. Walking still loads separately. Existing Babylon chunk warning remains.
- Production Walk here from RubyVR opened beside RubyVR, with the matching
  exhibit card and directory row. Opening the directory expanded Gallery and
  focused its close control. Escape closed it and focused the toggle.
- Right on the RubyVR route stop focused THE FINALS and named it in the strip,
  while the camera/nearby card remained at RubyVR. Enter traveled to THE FINALS,
  updated the nearby card/current stop, and restored canvas focus. The reverse
  direction was also checked in production.
- Selecting THE FINALS in the directory closed it and moved to that frame.
  Selecting TNEI in development moved to its pedestal; E opened the experience
  dialog and Escape closed it, retaining position and restoring canvas focus.
- Returning from RubyVR produced `#gallery/rubyvr-studio`. The 390×844 touch
  check selected TNEI and returned to `#experience/tnei`, with TNEI selected.
  Desktop controls were absent in touch mode, the select was 16px, and there
  was no horizontal document overflow.
- At 780×600, the directory, exhibit/help group and route strip had separate
  bounds with no overlap. The directory correctly opened Experience at TNEI.
- In the final compiled build at 1280×720, opening the directory at Balairung
  revealed its last Gallery row: list bounds y142–568, selected row y524–568,
  inner scroll 159px. The close control retained focus.
- The final main preview was explicitly reloaded, entry identity confirmed,
  and left walking beside RubyVR with the directory open at 1379×1278.

Mouse capture was rejected by the in-app browser. Its existing drag-to-look
fallback appeared correctly. The capture-only aiming cue and actual captured
mouse control remain unverified. Physical phone, Firefox, headset and owner
acceptance also remain unverified. No new frame-rate measurement is claimed.
The pass adds DOM/CSS controls, not render targets, lights, shadows or 3D assets;
the route retains its existing position sampling.

## Transition defect and repair

Intermediate local build `index-Bz8iqInL.js` reproduced a real failure:
start at Entrance, navigate to `#gallery/rubyvr-studio`, then change from
1280×720 to 390×844 before smooth scrolling finishes. The eventual route became
the entrance and the reading position was 0. An earlier rapid return/resize
landed near WattWhere, changing the stage action while it was being selected.

The breakpoint handler preserved the current intermediate camera stop rather
than the pending navigation destination. `useHallScroll` now retains that
destination alongside its pending offset and uses it when changing scroll
roots. Once the visitor cancels navigation with ordinary input, the existing
current-view preservation still applies.

The exact in-progress resize case passed in both directions in development
and the subsequent compiled `index-C0ppj56D.js` build, whose scroll-hook source
is unchanged in the final build. Desktop-to-phone settled on RubyVR at
document scroll 3401; phone-to-desktop settled on RubyVR at reading scroll 3289,
document scroll 0. Both retained `#gallery/rubyvr-studio`. Pure scroll checks
also pass, but the browser reproduction is the evidence for this timing fix.

## Owner functional review — pending, about 3 minutes

The preview is running. To restart if needed:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional visitor data uses `npm.cmd run community:local` in a second terminal.
Omit `?community=local` to review without it. Ctrl+C stops a manually started
service. These actions do not submit visitor notes.

- [ ] Open the start URL and choose Walk here. Expected: RubyVR is in front of
  you and named in the nearby-exhibit card.
- [ ] Open Hall directory. Expected: Gallery is expanded and RubyVR selected.
  Choose THE FINALS. The list should close and walking controls should work
  immediately after arrival.
- [ ] Focus a route stop and press Left/Right. Expected: names preview without
  moving the camera. Enter travels. Open the directory and press Escape;
  expected: it closes and its toggle receives focus.
- [ ] In a browser that allows mouse capture, click the view, aim at a frame,
  press E, then Escape. Check the aiming cue, readable notes, mouse release,
  and retained walking position. Firefox remains a required feel check.
- [ ] Return to browsing and change the window between desktop and phone width
  during a gallery return. Expected: it reaches the chosen exhibit, not the
  entrance or a passing neighbor.
- [ ] On a real phone, use the destination selector, inspect an exhibit, close
  the notes and return to the portfolio. Check legibility and input response.

User results are pending; no steps are waived or checked. No merge readiness
or completion of the broad visual goal is claimed.
