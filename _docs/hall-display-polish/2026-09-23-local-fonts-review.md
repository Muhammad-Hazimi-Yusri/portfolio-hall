# Local fonts — review, 23 September 2026

The existing typefaces now load with the site. The entrance retains its current
layout and typography, while the main font files are smaller and no longer
depend on a separate Google Fonts stylesheet request.

Part of the combined local change on `codex/hall-display-polish`, based on
`44c38295939ab18e06559859b7bfb337d1276cf5`. No commit, push, PR, issue update,
merge or deployment was made. Owner review remains pending.

## Build and scope

- Entry: `assets/index-D-yd0uk-.js`.
- CSS: `assets/index-BaLRqpjD.css`.
- Hall: `assets/HallScene-D06rIg14.js`.
- Walking: `assets/BabylonScene-DLKnVz7I.js`.
- Manifest SHA256:
  `c92e64d6eb8718c56038793aaec6e2d190aa8517f7b0e0c4ccfc29363cdbd0e1`.
- Preview: http://127.0.0.1:5186/?community=local#
- Build log: `_local/self-hosted-fonts-build.log`.

`index.html` preloads the Latin Inter, normal Newsreader and italic Newsreader
faces. `src/fonts.css` retains the provider's Unicode ranges and `swap` display
policy, and is imported into the main stylesheet. Space Grotesk remains
available on demand for the older tour UI. Original WOFF2 files, checksums,
licences and the import recipe are in `public/fonts/`; Scene credits includes
their authors and licence links. No new runtime dependency was added.

Every current Newsreader use is weight 400, so its downloaded normal font no
longer includes the unused 500 weight. Its optical-size axis is retained. The
three preloaded Latin originals total 168,816 bytes, compared with 243,548 bytes
for the equivalent previous request: 74,732 fewer bytes (about 31%). This is a
font-asset comparison, not a measured improvement in page-load time or frame rate.

## Agent checks

- PASS: production build/typecheck, lint and `git diff --check`.
- PASS: all 16 packaged fonts match their recorded source byte lengths and
  SHA256s. Production CSS font URLs resolve relative to its directory; all
  three preload paths match the corresponding CSS assets. Built HTML/CSS has
  no external Google Fonts URL.
- Initial JavaScript remains 233,111 bytes; 3D code loads separately. The
  existing large Babylon chunk warning remains.
- Refreshed the compiled preview and verified its new entry, ready scene and
  the actual normal/italic entrance rendering. At 1379×1278, the entrance
  heading and lead paragraph bounding boxes exactly match the baseline:
  heading `(827.296875, 177.296875, 494.828125, 170.8125)`; lead paragraph
  `(827.296875, 372.109375, 494.828125, 56)`.
- Narrow review requested 390×844; the document had 375 px usable width with
  its scrollbar. AVVR project notes and the CV remain readable with no horizontal
  overflow. Right arrow advanced AVVR (2 / 9) to WattWhere (3 / 9). CV navigation
  and font-family checks passed. No captured errors or warnings in that fresh
  production tab. Scene credits and its new font links also fit the width.
- Temporary viewport override reset and review tab closed. Main entrance
  preview kept available.

Chromium/responsive checks do not establish real Firefox, phone, print-dialog
or owner acceptance. No cold-cache network timing was measured. Font swap can
still produce layout movement before a font is available.

## Guided owner review — pending, about two minutes

The production preview is already running. To restart it if needed, use
PowerShell in a spare terminal:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The `community=local` query uses the existing optional local visitor preview;
these checks do not require posting a note or enabling the public service.
Ctrl+C stops a preview process started in that terminal.

- [ ] **Arrival:** open the preview above in Firefox. Reload once. The name,
  italic surname and selected-work links should retain their intended layout
  without missing or clipped text.
- [ ] **Project:** choose Audio-visual scenes in VR under Start here. Press Right
  then Left: WattWhere (3 / 9), then AVVR (2 / 9), with readable headings and
  unchanged navigation. Escape returns to the gallery near AVVR.
- [ ] **Small view and CV:** narrow the browser, open CV and scroll through it.
  The name, body text and role headings should remain readable without sideways
  scrolling. Back to portfolio returns to Experience.

User results: **not yet reported**. Readiness remains pending; this note does
not grant merge or publishing authorization. The broader scenery, walking and
physical-device acceptance items in the previous reviews remain separate.
