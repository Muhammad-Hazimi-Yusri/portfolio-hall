# Experience reading panel — 23 September 2026

The reading panel now leads with the work role instead of repeating a large
logo and company heading above a small job title. Dates, organisation and a
smaller brand mark sit together, followed by a display-type role heading,
description, tools and relevant actions. The chronological rail connects the
overview without adding card backgrounds or effects.

This continues the combined local work. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance remains pending.

## Review build

- Branch: `codex/hall-display-polish`, dirty working tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-Drw26KZn.js`; CSS: `assets/index-DHGJwmft.css`.
- Hall: `assets/HallScene-BFAd0Leb.js`.
- Walking: `assets/BabylonScene-CF7bb0-l.js`.
- Manifest SHA256: `94ADA786A043FB9A1B58E6F2DF756B3A579EA823F34A0D01D1AFA0DEB30437BF`.
- Preview: http://127.0.0.1:5186/?community=local#experience/tnei
- Build log: `_local/experience-reading-build.log`.

## Scope

All roles, dates, descriptions, tool lists and degree details use the existing
portfolio data. No professional claim or CV copy was changed. Logos are
decorative in the reading panel because the adjacent text identifies the
organisation; the 3D displays retain their existing geometry and motion.

The TNEI record links to Reporting workbench and Site-test analysis tools.
Those destinations retain their in-development status, illustration captions
and public/private boundaries. Other employers do not acquire speculative
project links. Overview display links have organisation-specific accessible
names. The experience selector now provides at least 44 × 44px targets.

The body description grew from 13px to 14px and uses the hall's existing ink
colour. The role uses the already-loaded Newsreader typeface. Dates and tools
are larger than before. The smaller logo no longer pushes the useful details
below a large block of duplicate branding.

Initial JavaScript is 249,791 bytes, 419 bytes above the preceding walk-idle
build, under the existing 250,000-byte check. The renderer remains separate.
No image asset, 3D geometry, light, render target, blur or animation was added.
There is no new performance benchmark claim for this layout change.

## Agent verification

- PASS: production build/type checking, content/asset checks, lint, existing
  hall-scroll checks and diff whitespace check. Existing Babylon chunk-size
  warnings remain.
- Development 1280 × 720: reviewed the experience overview and Audioscenic's
  focused view. The job role, description and tools fit together, with the
  source logo reduced to 100 × 46px. The role uses the same Newsreader family
  as the page's other display headings.
- Development 390 × 844: reviewed the Audioscenic layout and scrolling beneath
  the pinned hall. Its job title wrapped to two lines, with no horizontal page
  overflow.
- Development 320 × 740: Southampton's organisation wrapped beside its logo
  without overlap. The content width was 231px after the reading margins and
  timeline inset. All selector targets were at least 44 × 44px. The two TNEI
  work links were 106.5 × 52px and wrapped their labels normally.
- At 320px, Reporting workbench opened its correct notes and illustration;
  browser Back restored TNEI. Site-test analysis tools opened its own notes.
- Final compiled 320 × 740: verified `index-Drw26KZn.js`, all three role
  headings, and zero horizontal document overflow. “View Audioscenic in the
  hall” opened its focused display and Escape returned to the overview.
- Final compiled map mode: TNEI selected the matching map entry. Keyboard
  activation of Site-test analysis tools opened the correct project and
  updated the map's selected entry.
- No console errors were captured in the review tab. Its viewport override was
  reset and the temporary tab closed.

These are local Chromium checks, including resized desktop views. Firefox,
physical-phone feel and owner visual acceptance remain unverified. This pass
does not establish completion of the wider portfolio goal.

## Owner functional review — pending

No account is needed. Open the preview URL above. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional `?community=local` query uses the local visitor service on port
5190. Omit it to review without that service. Ctrl+C stops a manually started
preview.

- [ ] Open Experience, read all three entries, and choose Audioscenic's
  “View this display”. Expected: the role, employer and dates are clear, the
  3D display matches, and Escape returns to the overview.
- [ ] In TNEI, open each work-note link and use browser Back. Expected: each
  note opens the intended tool and Back restores the TNEI view. Repeat once
  with the hall map enabled and a keyboard.
- [ ] On a phone, switch between all three roles and scroll through the notes.
  Expected: logos and long names fit, the selectors are easy to tap, and the
  pinned hall does not cover the content being read. Check in Firefox too.

No owner check is marked passed or waived. This record does not recommend merge.
