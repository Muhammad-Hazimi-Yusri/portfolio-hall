# Hardware recordings and return paths — 23 September 2026

The PetBot laptop and FPV photograph now have physical play controls. The same
recordings are available from the project notes and workshop controls. They
open an in-place dialog with a clear Back control, a retry state and a link to
the original YouTube page. Closing removes the iframe and restores focus to
the initiating control without changing the exhibit route.

This is part of the combined, uncommitted `codex/hall-display-polish` work.
No commit, push, issue operation, PR, merge, deployment or DNS change was made.
The wider visual goal and owner acceptance remain open.

## Identifiable build

- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus the dirty tree.
- Entry: `assets/index-bZssDYAP.js`; CSS: `assets/index-BQ9Mdio9.css`.
- Hall: `assets/HallScene-BH8jS7ta.js`.
- Walking: `assets/BabylonScene-DrY8vHlA.js`.
- Manifest SHA256: `F5059259263D455377BD235377A38CEF631670554E6C931BC9ED17EEAB39FF28`.
- Build log: `_local/hardware-film-build.log`.
- Preview: <http://127.0.0.1:5186/#project/petbot>.

## Implementation and loading

The video IDs already existed in the public project links. PetBot's caption
keeps the university team attribution and Hazimi's server/AI integration role;
FPV's caption identifies the 2023 build diary. No footage was downloaded or
repackaged. The iframe is created only after a visitor selects Watch or the
physical play control, and does not request autoplay. The hall's render loop
returns while the video dialog is open. This suspension is verified in code;
this pass does not include a new performance sample.

The implementation follows the ordinary iframe form in the
[YouTube player documentation](https://developers.google.com/youtube/player_parameters).
There is no player SDK or second renderer. Two shared materials and four small
meshes provide the physical play symbols. The loading poster uses the existing
local project image. Initial JavaScript is 243,522 bytes, up 3,843 bytes from the
preceding AVVR build; 3D remains deferred. The existing large Babylon-chunk
warning remains. These sizes do not establish phone loading speed.

## Agent checks and unresolved playback

- PASS: TypeScript/build, lint, project-content validation, navigation, portals,
  exhibit geometry and Git whitespace checks. Navigation checks cover both
  video targets and a project with no recording.
- Compiled desktop: both physical play controls opened their matching dialog.
  Closing removed the iframe, restored body scrolling and focused the Watch
  control. Arrow keys at the dialog's controls did not navigate underneath it.
- Compiled 390 × 844 and 320 × 740 layouts: no horizontal overflow; Back and
  the source link remained reachable with 44 px minimum control height. Retry
  recreated one iframe and kept focus on Back. Escape outside the cross-origin
  player closed the dialog and retained document position.
- The PetBot **Open on YouTube** link opened its actual public watch page in a
  new tab. Its title and player controls were visible. The original FPV watch
  page also opened with its matching title and player controls.
- **UNRESOLVED:** embedded playback did not start in the in-app browser.
  Both the ordinary and privacy-enhanced YouTube endpoints remained blank;
  the same ordinary embed also stalled in a bare local test page. This does
  not establish the cause or prove playback in another browser. The timeout
  poster, retry and source link remain available. An iframe load event is not
  treated as evidence of successful video playback.
- Compiled navigation round trip: Escape from PetBot workshop → PetBot notes;
  Right → FPV notes at 7 / 9; Walk here → FPV frame with canvas focused; E →
  inspection; Enter the hardware workshop → Watch the flight. The first Escape
  closed only the film dialog. The second restored walking beside the same
  FPV frame and the same visible viewing angle, with canvas focus restored.
- No captured browser errors or warnings in the compiled review tab before
  the final walking round trip.

These are local Chromium checks. Actual Firefox, physical-phone input and
performance, headphone playback, headset and owner visual acceptance remain
pending. The broader quality backlog is not closed by this pass.

## Owner functional review — pending, about three minutes

Open the preview above. No login or visitor service is needed. If the local
preview has stopped:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops a manually started preview. The loopback URL reaches this PC only.

- [ ] Open PetBot's workshop and select the play symbol on its laptop. Expect
  the team-recording dialog. Try playback; if it stalls, use Open on YouTube.
  Report whether the embed actually plays in your browser.
- [ ] Close the dialog. Expect the same workshop and focus on Watch the team
  demo. Switch to FPV and try the play symbol on its photograph.
- [ ] Escape to FPV notes, then use Left/Right. Expect the project and counter
  to change together. Choose Walk here; expect to land at the selected frame.
- [ ] While walking, press E and enter a workshop exhibit. Open its video,
  then press Escape twice outside the player. Expect video → exhibit → the
  saved walking position. Judge the transition and controls for yourself.
- [ ] Repeat the video and return controls in Firefox and on a reachable
  phone preview. Check actual playback, touch usability and scrolling.

User results and any waivers are pending. This is not a merge recommendation.
