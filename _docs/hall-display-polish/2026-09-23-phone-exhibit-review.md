# Phone exhibit layout — 23 September 2026

Focused projects now have an unobstructed phone viewing area. Map and primary
exhibit controls sit in a 56px strip below the canvas. The project navigation
bar supplies the single Back control and clearly outlined 44px Previous/Next
targets. Repeated section links, the stage title and desktop shortcut hint are
removed from this compact view. The gradient formerly used behind the stage
title is also removed, so it no longer washes out the artwork.

The scene's artwork, geometry, camera and lighting are unchanged. This is part
of the combined local work on `codex/hall-display-polish`; no commit, push, PR,
issue operation, merge, deployment or DNS change was made. Owner acceptance
and the wider visual goal remain open.

## Identifiable build

- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus dirty working changes.
- Entry: `assets/index-CZ9aaVIG.js`; CSS: `assets/index-B0M956ny.css`.
- Hall: `assets/HallScene-DtvP_gpD.js`.
- Walking: `assets/BabylonScene-IdgAHUPI.js`.
- Manifest SHA256: `A4668C235472407CAF07F73FA2ED66BD201E8AA00F22AC0CA6BE8F016F5377E2`.
- Build log: `_local/phone-exhibit-build.log`.
- Preview: <http://127.0.0.1:5186/?community=local#project/rubyvr-studio>.

## Interaction detail

The layout applies at 760px and below to focused hall projects. The ordinary
browsing hall, map, experience displays and island layouts keep their own
controls. The pinned stage retains its existing height; the project bar uses
that same height when sticky. Keyboard shortcuts still work at this width;
only their visual instruction row is hidden.

Image inspection and Reset view now choose a visible return control. When
the stage's duplicate Back link is hidden on a phone, focus returns to Back
in the reading bar. Restoring focus to the hidden stage link would otherwise
leave keyboard users without a visible focus position.

There are no added assets, rendering effects or dependencies. Initial
JavaScript is 244,051 bytes, 168 bytes above the visitor-interaction build.
3D stays deferred; the existing large Babylon chunk warning remains.

## Agent checks

- PASS: final build/typecheck, 11-project content and asset checks, lint,
  navigation, hall-scroll checks and Git whitespace check.
- Development 390 × 844: canvas and utility strip have adjacent bounds,
  rather than overlapping; one Back to gallery link is visible. Selecting
  the actual RubyVR frame opens its image. Escape closes the viewer, retains
  the route/scroll position and focuses the visible reading-bar Back link.
- Development phone map: Use hall map retains the project and exposes its
  dropdown. Next opens THE FINALS. Show 3D hall restores the compact scene
  layout. No horizontal overflow was observed.
- Compiled 320 × 740, 305px usable width: canvas height 179.797px, utility
  strip 56px; Previous/Next are each 44 × 44px. The work and its plaque are
  visible above the utility strip, with no horizontal page overflow.
- Compiled narrow frame → image viewer → Escape: focus returns to the visible
  Back control. After scrolling the notes, stage bottom and project-bar top
  both equal 236.797px. The route remains RubyVR.
- Compiled narrow Next controls advance RubyVR → THE FINALS → PetBot, updating
  the counter and primary stage action. PetBot's island opens its separate
  workshop layout; all seven visible workshop buttons are 44px high, with no
  horizontal overflow. Return to hall restores the focused-project layout.
- Compiled 1280px after resetting the viewport: the desktop stage caption,
  Back control and section links remain visible. No warnings/errors were
  captured in this review tab.

These are resized Chromium checks, not physical-phone or Firefox acceptance.
No new phone frame-rate claim is made. The viewport override was reset after
testing. The earlier YouTube embed limitation is unchanged.

## Baseline scroll measurement

Before these layout changes, a six-second project-scroll sample in the current
development hall measured 1,016 rendered frames, frame p95 6.5ms, maximum
19.9ms and zero reported long tasks. Canvas: 723 × 644; RTX 3080 using ANGLE
Direct3D11; scene `c23c1f36-ecbb-49d2-bad1-68d858b7cab8`. Median draw calls: 29;
CPU p95 1.1ms, GPU p95 3.77ms. Water and portal previews were enabled.

This is a desktop baseline, not an improvement attributable to this patch,
not an input-latency measurement, and not proof about Firefox or mobile.

## Owner functional review — pending, about two minutes

Open the preview above at phone width. No account is required. If preview has
stopped, run:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Optional local visitor data uses `npm.cmd run community:local` in another
terminal. Ctrl+C stops a manually started process. Loopback reaches this PC
only; a real phone requires a reachable development preview.

- [ ] Open RubyVR at phone width. Expect its full framed work above the
  controls, one Back control, and clearly touchable Previous/Next buttons.
- [ ] Select the frame, close the image, then use Next. Expect a visible
  focus position and THE FINALS notes, with the matching frame and counter.
- [ ] Scroll the notes. Expect the navigation bar immediately below the hall,
  without buttons covering the frame or disappearing behind the stage.
- [ ] Switch to the map and back, then enter PetBot's workshop. Check the
  layout changes naturally and each return control remains easy to find.
- [ ] Repeat in Firefox and on a real phone; judge the actual readability,
  touch response and scrolling feel. Desktop resizing does not prove these.

User results and waivers are pending. This is not a merge recommendation.
