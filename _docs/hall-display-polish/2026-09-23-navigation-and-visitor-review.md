# Project navigation and visitor landscape — 23 September 2026

The project arrows now remain usable for repeated keyboard activation. The
visitor landscape opens its daily chart, and selecting a date highlights that
day in the terrain. This pass also fixes losing the chart's reading position
when changing between desktop and phone layouts.

Local combined work only. No commit, push, issue operation, PR, merge,
deployment or DNS change. The broader visual goal and owner acceptance remain
open.

## Review build

- Branch: `codex/hall-display-polish`, intentional dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-m4ATZxJg.js`; CSS: `assets/index-APR8Vv5c.css`.
- Browse: `assets/HallScene-BjJkSXZR.js`.
- Walking: `assets/BabylonScene-DZX7Uyjv.js`.
- Visitor book: `assets/VisitorBook-XCWJ7VS6.js`.
- Manifest SHA256:
  `C3CFEFE1C3F6F70EEDEC1CC27B63D6E47F3DDA0D95ACA02BB5BE7BFC0727C84C`.
- Preview: <http://127.0.0.1:5186/?community=local#project/rubyvr-studio>.
- Build log: `_local/navigation-visitor-build.log`.

## Changes and checks

Project navigation preserves focus on the chosen Previous/Next control. At
either end the control remains focusable but unavailable, so repeated Enter
does not reverse direction or wrap. A status announces the project name and
position. Normal card navigation still focuses the title. Arrow keys remain
owned by image viewers, form controls and embedded apps when appropriate.
The walk-return hint now describes the saved-walk destination.

The existing current-camera walking handoff and physical frame arrows were
checked as part of this pass. From settled RubyVR, walking opened beside its
frame and E opened RubyVR notes. Project notes followed by Escape returned to
the same walk. Entering during rapid camera travel retained the intermediate
position, rather than teleporting to the entrance. These walking checks ran
in development; physical captured-mouse behavior remains unverified.

In the final compiled build, clicking RubyVR's physical right arrow opened
THE FINALS and showed 5 / 9. Enter on the HTML Next control opened PetBot and
kept focus on the next control. Left twice returned to RubyVR. Earlier in the
pass, repeated activation reached the last project, where Enter and Right did
nothing; Left returned normally. Escape restored the gallery card. The phone
image viewer consumed Right to select image 2, and Escape restored its image
button without changing project.

The visitor terrain is selectable in browse and walking modes. Its existing
28-day data geometry is retained, with darker terrain and warmer contours.
The daily chart has a pointer selector, keyboard-accessible range input and
exact date/count readout. In browse mode it shows a fitted landscape overview;
one reusable tube highlights the selected cross-section. A zero-count day is
marked at water level, without creating a hill. Back to hall and Escape return
to the guestbook. The book also exposes a link to this landscape view.

Agent checks:

- PASS: TypeScript/build, lint, navigation, movement, scroll, exhibit geometry,
  community service/payload checks, and diff check. The 12 community service
  tests pass. Existing Node experimental-API and large Babylon chunk warnings
  remain. Initial JavaScript is 245,884 bytes; 3D still loads separately.
- Terrain checks cover all 28 dates across empty, sparse and alternating
  histories: finite geometry, data-aligned highlight positions, real crest
  picking, no resource-count growth while scrubbing, and no rendering or water
  invalidation for an unchanged selection.
- Chart fixtures: empty history stays zero; a single day has one marker and no
  slider or invented area; full history reports the corresponding exact count
  with Home/Right. No notes were submitted.
- Development: selecting the real terrain focused Visits by day. Home/End
  and Left selected the correct date/count. Escape from the range input
  returned to the guestbook heading.
- At 390 px, project navigation controls are at least 44 px high; arrows are
  44 by 44. At 320 px, the compiled chart has no horizontal document overflow,
  and its range input is 44 px high. The landscape controls now sit below the
  canvas rather than covering it.
- Final compiled responsive checks: chart top 259.875 px with sticky stage
  bottom 236.797 px at 320 by 740; switching to the map repositions the chart
  to 387.078 px below its 364 px stage. Returning to 3D and desktop retains the
  chart. No captured browser warnings or errors in the final review tabs.
- The main preview was explicitly reloaded, its entry verified, and left on
  RubyVR at 1379 by 1278. Temporary viewport overrides were reset and the
  temporary review tab was closed.

### Resize defect and repair

Intermediate compiled build `index-BAOK5dZL.js` reproduced the defect: open
analytics at desktop width, then resize to 320 by 740. The chart remained
focused but moved to y=2216.875, below the viewport. The breakpoint handler
preserved Contact instead of the explicitly revealed chart.

The scroll hook now retains that revealed element until deliberate scrolling
or navigation, and reanchors it without changing keyboard focus. Range and
text-field keys do not masquerade as page scrolling. Both resize directions
passed in development; the final compiled desktop-to-phone check retained
the range input's focus and placed the chart below the sticky stage. Changing
a date after the reverse resize still worked in development.

### Bounded performance evidence

On local Chromium / RTX 3080 at 723 by 644 render resolution, a six-second
development sample of the settled selected landscape produced zero rendered
frames, zero target passes and zero long tasks. A second six-second sample
with one day change produced one frame, one reflection and one refraction
pass, and zero long tasks. The renderer therefore wakes for selection and
returns to idle. The 3D selection code was unchanged in the final build.

This is an idle-work check, not a mobile or Firefox frame-rate claim. Actual
Firefox scrolling, physical touch/gyro, mouse capture, headset behavior and
owner visual acceptance remain pending. Public visitor hosting and the other
previously recorded release limitations are not resolved by this pass.

## Owner review — pending

Allow about five minutes. The preview and local visitor service are already
running. If needed, start the preview from PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

For the local visitor view, run `npm.cmd run community:local` in another
PowerShell window in the same directory. Ctrl+C stops either process. This
loopback preview is accessible on this PC; a real phone needs a separately
prepared reachable preview. Rebuilding after later source edits changes the
revision under review.

- [ ] Open RubyVR in the preview. Use Left/Right, the visible Next link and the
  physical arrow beside the frame. Expected: frame, title and position agree.
  Repeated Enter on Next should work and stop at the final project.
- [ ] Choose Walk here once the RubyVR frame is in view. Expected: start beside
  that frame. Press E, open Project notes, then Escape; expect the same walk.
- [ ] Return to browsing, enlarge a RubyVR image and press Right, then Escape.
  Expected: image 2, then the same project and focus returned to its image
  button. Escape again should return to the matching gallery card.
- [ ] Open `#guestbook/analytics`. Select dates using the chart or range input.
  Expected: exact date/count, a matching contour in the landscape, and a clear
  return to the guestbook with Escape or Back to hall.
- [ ] With the day selector focused, resize between desktop and phone widths
  and switch map/3D. Expected: the chart remains visible, controls stay clear
  of the picture, and keyboard focus is retained through resizing.
- [ ] Repeat the navigation and scrolling in Firefox and on a real phone once
  a reachable preview is prepared. Check motion, touch response and legibility.

User results: pending. No checks waived or marked passed on the user's behalf.
No merge readiness or publishing authorization is inferred.
