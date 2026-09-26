# Show the work in the opening panel — 23 September 2026

The entrance now shows AVVR's original application image, published status and
technical-lead role together. The shorter introduction and smaller name leave
room for that complete preview at 1280×720. On phones, the name fits on one
line and the featured work is within a short scroll below the introduction.

This continues the combined local change on `codex/hall-display-polish`, based
on `44c38295939ab18e06559859b7bfb337d1276cf5`. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance is pending.

## Identifiable build

- Entry: `assets/index-9bbgps8b.js`; CSS: `assets/index-BJkUrPmL.css`.
- Hall: `assets/HallScene-CHa5MQAq.js`.
- Walking: `assets/BabylonScene-B8abYioc.js`.
- Manifest SHA256: `37848D7A6074879366B1A5038CA675EE3D3250B1A68DFEA64F3613E44A25C53F`.
- Build log: `_local/entrance-work-build.log`.
- Preview: http://127.0.0.1:5186/?community=local#

## What changed

The opening name retains its display type and italic surname, with less space
above and below. The introduction still identifies the TNEI consultant role
and Python/web tooling alongside power system studies. The small project links
remain available with shorter labels.

Selected work now leads with AVVR's existing `avvr-2.webp`, uncropped at its
original proportions. Status, title and role come from the project record.
Balanced title and role wrapping avoids an isolated last word or date fragment.
Site-test analysis tools follow as a text entry; See my work still leads to
the professional-work section. Both that action and Read my CV have 44px
minimum target heights.

The image is the same 78,990-byte source already used in the entrance's smaller
preview, project index, notes and frame. It now loads with the opening panel
rather than using the old lazy-loading attribute. No asset, renderer, animation
or effect was added. Initial JavaScript is 235,616 bytes, 334 bytes above the
preceding walking-return build. No new performance improvement is claimed.

## Agent checks

- PASS: final production build/typecheck and content/asset checks; lint, existing
  hall-scroll checks and diff whitespace check. The existing large Babylon
  chunk warning remains.
- Final compiled 1280×720: the featured row spans y=535.625–688.313. The original
  image spans y=552.625–661.813 and measures 192.563×109.188px. The full image,
  published status, title and team role are visible without scrolling. No
  horizontal page overflow. The preceding opening view showed no project image
  in its initial screen.
- Development 320×740 (305px usable width): the name fits on one line, with a
  38.75px heading box. The full selected-work row was visually inspected after
  scrolling; title, image, attribution and the TNEI entry fit without overflow.
  Selecting it opened AVVR; browser Back returned to the entrance with the
  featured row still visible.
- Final compiled 390×844: one-line name, complete source image loaded, no
  horizontal overflow. The image starts at y=786.031, so a short scroll is still
  needed to see the whole featured row. Its keyboard action opened AVVR notes.
- Compiled map mode: the featured link also opened AVVR through keyboard input.
  See my work reached `#work`; after the smooth scroll settled, the Work map
  state and Professional work heading agreed, with that heading at y=213.766
  inside the reading viewport (y=76–720).
- No browser errors were captured in the temporary review tab. Its viewport
  override was reset and the tab closed.
- Final main preview at 1379×1278: the image loaded at its source width of
  1920px, the row fit at y=545.344–697.109 and the role's date stayed together.
  The page was left at the entrance on the build named above.

These are Chromium layout/input checks, including resized desktop layouts.
Physical-phone and Firefox behavior, and whether the visual direction feels
right to the owner, still require review. The 3D scene was inspected but its
geometry, materials, camera and lighting were not changed in this pass.

## Owner functional review — pending, about two minutes

No account is needed. Open the preview URL above. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local community service supplies preview visitors. Omit
`?community=local` to review without it. Ctrl+C stops a manually started preview.

- [ ] At laptop size, open the entrance without scrolling. Expected: the full
  AVVR image, project title, published status and technical-lead role are visible
  beside the hall. Confirm the introduction still describes your work accurately.
- [ ] Select the AVVR preview. Expected: it opens the original project's case
  notes. Use browser Back; the entrance should return. See my work should move
  to Professional work, and Read my CV should open the printable CV.
- [ ] Switch to Use hall map and open the featured work using the keyboard.
  Expected: it remains reachable and opens the same AVVR notes.
- [ ] On a phone, scroll from the entrance to Selected work. Expected: the
  picture remains complete, the title and team role are legible, and both the
  AVVR and site-test entries can be tapped. Repeat the opening in Firefox.

User results are pending; no checks are marked passed or waived. This record
does not recommend merge or establish completion of the wider visual goal.
