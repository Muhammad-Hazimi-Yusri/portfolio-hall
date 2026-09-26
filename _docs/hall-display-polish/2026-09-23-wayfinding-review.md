# Hall wayfinding and walking approaches — 23 September 2026

The entrance sign now enters the work section, and the contact sign brings its
email link into focus. Both signs have readable actions and fitted walking
approaches. Contextual walk entry, project arrows and gallery returns remain
available.

## Build and scope

- Branch: `codex/hall-display-polish`; intentional dirty tree preserved.
- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-cdt12VMp.js`; CSS: `assets/index-ENVbDKs5.css`.
- Browse scene: `assets/HallScene-OEWIoNYm.js`.
- Walk wrapper: `assets/HallExperience-C36uQzV_.js`.
- Walk scene: `assets/BabylonScene-D3lfwpie.js`.
- Manifest SHA256: `518BAD288AAF43418F7C399B48E6EC8C1AED04725DF6113DDC245C3F38482828`.
- Initial JavaScript: 227,313 bytes; 3D remains separately loaded.
- Preview: <http://127.0.0.1:5186/?community=local#>.
- No commit, push, issue change, PR, merge, deployment or DNS change.

## Changes

The two freestanding signs now share the website's pavilion mark, paper and
bronze palette and serif headings. Rounded dark-metal housings, posts and feet
are merged into one collision mesh per sign; the front and reverse share one
face mesh and texture. This replaces six render meshes per sign with two,
without adding lights or shadow passes.

The entrance sign previously linked back to the entrance. It now links to
`#work`, with an Enter the gallery hover hint. Its walking dialog is titled
Gallery guide and also links to Projects and Experience. Contact keeps its
route and focuses the email link on a repeated sign selection; it does not
open an email application. Both housings participate in the existing hover
highlight. Walking stops farther back, with sign size and reach adjusted to
fit narrow screens safely.

The former portrait is disabled. No `avatar.glb` exists, and visual inspection
of the bundled `avatar.splat` showed a LEGO skull/red-cap object on a black
display surface. Its creator and provenance have not been established. It is
not a portrait, project claim or replacement scene asset. The original file is
retained unchanged: 5,203,136 bytes, SHA256
`9E8454A952F09C35862B40243199D2389299790EA52FAD01670B586854418E53`.
Both configured paths are null; the loader exits without requests, portrait
controls or a cylinder-and-sphere stand-in. Optional scan code is loaded only
if a future reviewed model/scan is explicitly configured.

## Agent checks

- PASS: production build, TypeScript, lint, 11-project content and packaged
  asset checks, navigation/approach checks, bevel-geometry checks and Git
  whitespace check. The existing Babylon large-chunk warning remains.
- PASS in local Chromium at 1280 × 720: entrance hover reads Enter the gallery
  and clicking the sign changes to Work. Walk around enters beside the work
  displays; the first exhibit is inspectable.
- PASS: walking directory → Gallery guide shows the complete sign, with its
  action above the controls. Inspect opens its dialog and Enter the gallery
  returns to `#work`, disposing the walking view.
- PASS: selecting the contact sign on `#contact` focuses the mailto link,
  without following that link. No new production error/warning entries appeared
  during these checks; old pre-change development avatar warnings remain in
  the reused tab's log history.
- PASS at 320 × 740: RubyVR's Previous/Next controls are 44 × 44 px, Right opens
  THE FINALS and updates the counter to 5 / 9, Left returns to RubyVR. Walking
  from the settled RubyVR view offers Inspect RubyVR; Portfolio restores its
  notes. No horizontal overflow.
- PASS at 320 × 740: selecting Gallery guide fits the whole sign above the
  movement controls; Inspect and Enter the gallery return to Work. No portrait
  controls are present. This is viewport testing, not physical touch acceptance.

## Focused performance check

On the same source in development mode, local Chromium / RTX 3080, 1280 × 720
viewport and 723 × 644 render canvas, one six-second settled-entrance sample
recorded zero rendered frames, render-target passes, scroll updates or long
tasks. A six-second Work-to-Projects scroll sample recorded 1,019 frames
(169.8 rendered fps), frame-time p95 6.2 ms, GPU p50/p95 0.33/0.86 ms and zero
long tasks. Median draw calls were 48 for that transition. The scene contained
249 meshes, 178,796 triangles and 65 textures. Audit scene ID:
`60bbd725-2468-4806-8051-886dc1abdb65`.

This is a focused regression observation, not a matched before/after speedup
claim or a measurement of Firefox, mobile hardware, startup, touch latency or
VR. The prior materials review's project-scroll sample covers a different
camera path and must not be compared directly with this section transition.

## Owner checks — pending

The preview is running on this PC. No account is needed. Allow about five
minutes for desktop checks; Firefox and a physical phone need separate checks.
If the preview stops, run in PowerShell:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Ctrl+C stops that server. A rebuild after further edits needs a fresh build
identity. The optional local community service is not required for navigation.

- [ ] At the entrance, choose Show 3D hall if the map is active. Hover and click
  the physical guide: expect Enter the gallery, then the work section.
- [ ] Open RubyVR, use Right and Left, then Escape. Expect the frame, project
  name and counter to agree; Escape returns to the gallery near RubyVR.
- [ ] Open a project and choose Walk around or Walk here. Expect to arrive
  beside that exhibit. Walk/look, release input, inspect it, then Return to
  portfolio. Expect movement to stop and the original project notes to return.
- [ ] In walking mode, use the directory/map to go to Gallery guide. Read the
  sign, inspect it, and choose Enter the gallery. Expect Work and no leftover
  walking controls. From Contact, click its sign and expect the email focus.
- [ ] Repeat navigation and scrolling in Firefox and on a real phone with a
  reachable preview. Check smoothness, sign readability, touch controls and
  getting back out. Loopback addresses only reach this PC; no public or LAN
  deployment was made for this check.

Owner results, visual acceptance, physical-device and headset acceptance remain
pending. No boxes are checked by agent evidence, and this review does not
recommend merge or establish completion of the broader backlog.
