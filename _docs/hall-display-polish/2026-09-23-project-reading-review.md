# Project reading and phone navigation — 23 September 2026

Project notes now show the original screenshot or photograph directly after
the introduction and actions. At 1280×720, THE FINALS image starts at y=479px,
about 200px earlier than before. The separate role, status, tools and case study
remain below it. Portfolio-island invitations follow the original project
account; the stage still provides its direct island entrance.

The phone check also found and fixed a navigation defect: the sticky project
bar sat behind the pinned hall. It now sits immediately below the hall, using
the same height value, and follows the taller 2D map when it is selected.

This continues the combined local change. No commit, push, PR, issue operation,
merge, deployment or DNS change was made. Owner acceptance is pending.

## Identifiable build

- Branch: `codex/hall-display-polish`, existing dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-DnYX7AQd.js`; CSS: `assets/index-8cLHRFNr.css`.
- Hall: `assets/HallScene-CcEiSz3H.js`.
- Walking: `assets/BabylonScene-BUV1PWn1.js`.
- Manifest SHA256: `D8C8E2EC976D22BA81DF3B626DB061512220032B3B8F10291D512CDB687EFCE6`.
- Build log: `_local/project-reading-build.log`.
- Preview: http://127.0.0.1:5186/?community=local#project/rubyvr-studio

## Behavior and limits

The action row gives the embedded live app a primary button when present;
otherwise it uses the project's first public link. Secondary links and Walk
here have 44px minimum heights and wrap normally. Balairung keeps one walking
link rather than duplicating its existing Enter the 3D hall action. Internal
work still has its contextual walking link without inventing a public app.

Multiple-image projects now show thumbnail buttons with a selected state and
image count. Left/Right within that group select pictures, retain focus and
stop at the ends; they do not trigger the hall's project shortcuts. The modal
viewer keeps its existing image arrows, actual-size mode and close behavior.

Inline images retain their source proportions and fit within the lesser of
460px and 60svh. They are not cropped. Full-size inspection is unchanged. The
thumbnails reuse the existing local images, so a secondary image can now be
fetched when its thumbnail comes into view rather than waiting for selection.
RubyVR's secondary image is 58,477 bytes. There are no new image files, 3D
assets, render targets, animated effects or blur layers in this pass.

The original claims, team attribution, project status and source captions are
unchanged. AVVR's illustration note now says its source material is "in these
notes" rather than "below", so it also makes sense after the case study.

## Agent checks

- PASS: lint, existing contextual-navigation checks, production build/typecheck,
  content/asset checks and diff whitespace check. Initial JavaScript is 234,300
  bytes, 628 bytes above the preceding map-layout build. 3D remains separately
  loaded; the existing Babylon chunk-size warning remains.
- Development 1280×720: THE FINALS action row fits on one line, every action is
  44px high, and the image starts at y=479. RubyVR and PetBot were visually
  inspected; the actual project imagery precedes the metadata and island text.
- Development RubyVR: clicking image 2, then Right/Left/Left stopped at image 1
  without changing the project route. The selected thumbnail, source image and
  keyboard focus agreed. The existing desktop project bar remained at y=76
  while the reading panel was scrolled.
- Development 390×844: the FPV portrait remained uncropped; all actions were
  44px high, with no horizontal overflow. The corrected project bar began at
  y=270.078, exactly at the pinned hall's bottom; hit testing reached Next.
  Next opened EEE Roadmap. With the map selected, both stage bottom and bar top
  were y=364, and Next opened Balairung.
- Compiled 320×740 (305px usable width): no document horizontal overflow;
  thumbnail buttons were 70×48px. Repeated picture-arrow boundary checks kept
  RubyVR selected. The project bar began at the hall's bottom, y=236.797.
- Compiled phone image viewer: opened through the image's keyboard action,
  moved to image 2, then Escape closed it. Document scrollY stayed 468, focus
  returned to Enlarge image, and the inline counter showed Image 2 of 2.
  The visible project Next control then opened THE FINALS.
- Compiled phone map: stage bottom and project bar top were both y=364;
  the four THE FINALS actions were 44px high, with no horizontal overflow.
- Compiled desktop: Walk here from Site-test analysis tools opened the walking
  scene beside that frame, with a matching Read notes prompt. Return reopened
  `#project/site-test-analysis` and its notes.
- Compiled EEE Roadmap primary action opened `#app/eee-roadmap` with the correct
  iframe URL and Gallery/Reload/Expand/Open app controls. Project notes returned
  to its case study. This checks the portfolio's route and recovery UI, not the
  full external application's functionality.
- No browser errors captured in the temporary review tab. Its viewport override
  was reset and the tab closed. The main production preview was reloaded and
  left on RubyVR for review.

These are desktop Chromium checks. Physical-phone input, Firefox, headset and
owner visual acceptance remain unverified. No new frame-rate claim is made;
this pass changes project markup and CSS rather than the 3D renderer.

## Owner functional review — pending, about three minutes

No account is needed. The local preview is running. If it needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local community service supplies preview visitors. Omit
`?community=local` to review without it. Ctrl+C stops a manually started preview.

- [ ] Open RubyVR at the URL above. Expected: its original editor screenshot
  appears immediately after the introduction and actions. Select each thumbnail;
  the large picture, caption and selected border should agree.
- [ ] With a thumbnail focused, press Left/Right past both ends. Expected: only
  the picture changes. Open Enlarge image, change picture and press Escape;
  the same reading position should return. Outside the image controls, Right
  should still open THE FINALS and show 5 / 9.
- [ ] On a phone, scroll down the notes. Expected: Back, count and project
  arrows remain below the pinned hall. Switch to the map and repeat; they
  should sit below the taller map and remain tappable.
- [ ] Open PetBot and FPV. Expected: the original project photo appears before
  the island invitation. The FPV portrait is complete; Enlarge image gives a
  larger inspection view. Role and team attribution remain readable below.
- [ ] Use Walk here from Site-test analysis tools, then Return. Expected: you
  start near that frame and return to its notes. Try EEE Roadmap's primary app
  action and its Project notes return. Repeat normal reading in Firefox.

User results are pending; no checks are marked passed or waived. This record
does not recommend merge or establish completion of the wider visual goal.
