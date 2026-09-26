# Exhibit imagery and walk navigation — 23 September 2026

This pass replaces generic project panels with real captures and makes walking
to an exhibit, inspecting it and returning to movement less awkward. It builds
on the preserved environment and navigation work; it does not close the wider
visual, performance or device-acceptance backlog.

## Exact local build

- Branch: `codex/hall-display-polish`, with intentional uncommitted work.
- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-B47LYO9Q.js`.
- Styles: `assets/index-BBBV2n48.css`.
- Browse scene: `assets/HallScene-xicBdZ0r.js`.
- Free-roam scene: `assets/BabylonScene-BsdloAv7.js`.
- `dist/.vite/manifest.json` SHA256:
  `60F988E929E642CB531CED1D8DF8D28F90BB7F7F65DDC4EBCC55142A102235EF`.
- Production preview: <http://127.0.0.1:5186/#project/wattwhere>.
- No commit, push, issue update, PR, merge or deployment in this pass.

## What changed

- Gallery jumps now fit the complete frame and its plaque, including at narrow
  portrait widths. The approach depends on the actual field of view and aspect
  ratio, and stays inside the clear walking aisle.
- Completing a jump hands keyboard focus back to the canvas. Moving focus to
  another control during travel is respected; interrupted travel does not
  refocus the old destination.
- Inspect follows a nearby exhibit the visitor faces. Turning away clears the
  prompt. This is a distance/direction test, not an occlusion raycast, and uses
  precomputed target positions and reusable vectors.
- The Inspect dialog has a short summary, contribution, compact tools, optional
  status details and a primary link. Close stays in a separate header while the
  body scrolls. Experience headings use the organisation name, with dates and
  role presented separately. Touch option targets are at least 44 px high.
- WattWhere and Balairung now use real project images through the existing
  frame and accessible image-viewer path. Four public JPEGs add 102,548 bytes;
  no new preview render target, geometry or animation loop was introduced.

## Image provenance

Original full-viewport screenshots are preserved in
`2026-09-23-exhibit-ux/`. They were captured through the browser tools. The
public assets select image regions from those originals without redrawing UI,
charts or data. A local static image viewport was used for selection because
the browser's screenshot clip option reflowed the live responsive page.

| Public asset | Dimensions | Source and scope |
| --- | --- | --- |
| `wattwhere-fuel-mix.jpg` | 420 × 272 | Fuel-mix chart from the hosted dashboard on 23 September 2026; BMRS/Elexon attribution retained. |
| `wattwhere-carbon.jpg` | 360 × 252 | Actual and forecast carbon-intensity chart from the same dashboard; National Grid ESO CC BY 4.0 attribution retained. |
| `balairung-hall.jpg` | 723 × 580 | Hall pane from this development preview, September 2026. |
| `balairung-map.jpg` | 723 × 580 | Corresponding 2D floor-plan pane. |

WattWhere's root and `/explore` views visibly showed repeated **API KEY REQUIRED**
basemap watermarks. Its chart panels and grid overlay rendered, but the full
map was not working correctly. The original
[dashboard screenshot](2026-09-23-exhibit-ux/wattwhere-source.jpg) retains that
finding; the public project note also states it. No WattWhere code or deployment
was changed. The hall captures used no local-community query or visitor data.

Other originals:
[hall](2026-09-23-exhibit-ux/hall-source.jpg),
[map](2026-09-23-exhibit-ux/map-source.jpg).

## Agent verification

- PASS: lint, extended `check:navigation`, TypeScript and production build;
  portfolio validation covers all 11 records and their image assets. Initial
  JavaScript is 224,678 bytes, with 3D loaded separately. The existing large
  Babylon chunk warning remains.
- PASS: navigation checks use the actual approach function for every painting
  at 1280×720, 1379×1278, 768×1024, 390×844 and 320×740. They cover frame/plaque
  bounds, clear floor/plant avoidance and directional inspection, including
  looking away, a farther frame in front and out-of-range targets.
- PASS in local Chromium: RubyVR jump focuses the canvas and E opens its
  details without an extra click. Dragging toward WattWhere changes Inspect to
  WattWhere; dragging away removes it. Rapid destination changes finish at the
  last selection. These movement checks were run on the development build
  before the final dialog layout adjustment.
- PASS on the final production build at 320×740: expanded RubyVR details scroll
  in the body (597 px content in 423 px viewport), while Close stays at y=95 px.
  Tab wraps from the final link to Close. Escape restores the Inspect button.
  TNEI shows its short organisation heading, dates and role. No horizontal page
  overflow; Jump, Run and Tilt look are each 44 px high.
- PASS on the final production build at 390×844: complete RubyVR frame and
  plaque visible, touch controls clear, canvas focused after travel.
- PASS on the final production build at 1280×720: WattWhere and Balairung frame
  images render; Balairung's next image shows its labelled 2D map. No captured
  browser console errors in that review tab.
- Physical Firefox, touch/gyro, headset and owner visual acceptance remain
  **PENDING**. Viewport simulation is not a physical-device performance test.
  No new frame-rate claim is made by this pass.

Final captures:
[WattWhere gallery](2026-09-23-exhibit-ux/wattwhere-exhibit.jpg),
[Balairung gallery](2026-09-23-exhibit-ux/balairung-exhibit.jpg),
[phone frame](2026-09-23-exhibit-ux/phone-frame.jpg).

## Owner review — pending

Allow about five minutes, plus a phone/Firefox check. The preview is already
running. To recreate it in PowerShell if it has stopped:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
```

Rebuilding can produce a different build if source changes; record its manifest
alongside any result. Ctrl+C stops the preview. No login or community service is
needed for the steps below. This loopback address is for the current PC; a real
phone needs a separately prepared reachable preview.

- [ ] **1. Browse:** Open the preview's WattWhere project. Press Left/Right and
  use the visible arrows. The title, frame and project counter should agree;
  Escape should return to that place in the gallery.
- [ ] **2. Keep your place:** Open RubyVR and choose Walk here. You should arrive
  near that frame, with the picture and its label visible, rather than at the
  entrance. Walk and drag to look around.
- [ ] **3. Inspect what you face:** Choose RubyVR in the exhibit selector, then
  press E after arriving. Close it and turn toward another nearby frame. The
  Inspect label should follow the frame in front; it should disappear when
  looking away from nearby exhibits.
- [ ] **4. Read and exit:** Open the details, expand Early development and scroll.
  Close should stay visible. Tab/Shift+Tab should stay in the dialog; Escape
  should close it and let you continue walking. Open TNEI and check the role.
- [ ] **5. Review the evidence:** Open WattWhere and Balairung in the portfolio.
  Enlarge an image and switch to the second image. Captions should explain the
  capture and Escape should return without losing your reading position.
- [ ] **6. Check feel:** Repeat browsing and walking in Firefox and on a real
  phone once a phone-accessible preview is prepared. Report any judder, cropped
  frame, blocked control or uncomfortable motion. Agent viewport checks do not
  establish that these devices feel good.

User result: **not yet reported**. No checks waived. Visual acceptance, merge
readiness and publishing remain separate from the passing local checks.
