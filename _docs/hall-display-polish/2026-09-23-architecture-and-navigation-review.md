# Architecture and navigation — local review

This continues the accumulated work on `codex/hall-display-polish`. It is a local
preview, with no commit, push, PR, issue change, merge or deployment in this pass.
The user's visual acceptance remains pending.

## Identifiable build

- Base commit: `44c38295939ab18e06559859b7bfb337d1276cf5`, plus the working changes.
- Entry: `assets/index-3x9ZM80O.js`; CSS: `assets/index-CnTQkrMX.css`.
- Browse scene: `assets/HallScene-Y8GjsBVX.js`.
- Walk wrapper: `assets/HallExperience-snyoPqGI.js`.
- Walk scene: `assets/BabylonScene-BPu15tYP.js`.
- Manifest SHA-256: `95738AADE949A729BBF13E554823777F74EB2934984DCE32825B1678E2B6F652`.
- Preview: <http://127.0.0.1:5186/?community=local#project/fpv-drone>.
- Initial JavaScript: 216,207 bytes; the 3D code remains separately loaded.

## Changes

The hall now has a complete timber roof with three bays and open lightwells,
braces, column shoes, roof seams and wall divisions. Warm directional lighting,
darker timber, a visible sky and layered shorelines give the architecture more
depth. These use static geometry and existing material batches; there are no
additional lights, shadow passes or post-processing effects. The experience
overview sits beyond the roof end so the gable does not cover the displays.

The reading panel has a quieter paper/copper palette, Newsreader headings and a
shorter introduction. The floor plan shares the hall's layout and has an exhibit
index. Professional-work frames have purpose-specific illustrations rather than
generic placeholder text. The response plot explicitly identifies itself as an
illustration without site data. The entrance and section scroll alignment have
also been tightened.

Walk mode captures the current browse camera and its direction, lowers the
visitor to eye height and moves an aerial position to the nearest safe floor.
Map mode uses the selected exhibit as the fallback. An immediate return restores
the same project; after moving, Return opens the section or nearby exhibit the
visitor reached. The scene reports readiness instead of adding a fixed delay.
The entrance portrait loads only when the visitor approaches that platform.

Project notes support left/right arrow keys, previous/next links, a position
counter and Escape to return to the matching gallery frame. Navigation stops at
the ends of each collection. Small physical arrow controls fade in beside the
focused frame, with the same actions available in the reading panel. Input fields,
editable content, embedded apps and island controls keep their own key handling.
Links have at least 44-pixel-high targets, and the icon-only phone arrows have
44-by-44-pixel targets. The walking inspection button has a readable E key hint.

## Agent verification

- PASS: production build, TypeScript, lint and `git diff --check`.
- PASS: reloaded production preview serves `index-3x9ZM80O.js`; Right opens EEE
  from FPV and Left returns to FPV. The settled scene shows both frame arrows
  and the project photograph. No console errors were observed in that check.
- PASS: navigation, locomotion, hall layout, scroll and portal checks. Navigation
  checks cover safe aerial landings, valid and invalid poses, preserved facing,
  map fallbacks, return after moving, and collection boundaries.
- PASS in local Chromium: FPV → EEE → Balairung using Right; Right at the end does
  not wrap; Left goes back; Escape opens the matching gallery frame.
- PASS: clicking the actual next arrow beside the FPV frame opens EEE notes.
- PASS: entering walk mode from FPV and EEE notes faces the current exhibit.
  An immediate return restores that project's notes.
- PASS: map → PetBot notes → Walk here starts beside PetBot and returns there.
- PASS: moving to Contact using the walking destination strip, then Return,
  opens `#contact`.
- PASS: the EEE embedded app stays on its route when Right is pressed in the
  surrounding toolbar. The external app's delayed loading is still separate.
- PASS at a 390 × 844 browser viewport: no horizontal overflow, 44-pixel project
  navigation targets, PetBot → FPV navigation, hardware island entry and Hover
  control, return to the hall, contextual walking, destination selection,
  Contact inspection/close and return to `#contact`.
- No browser console errors were observed during the checked desktop walk loop.

### Performance boundary

The architecture pass was sampled in Chromium on an RTX 3080, before the final
navigation additions. Both six-second scroll samples ran at about 170 fps with
no long tasks. Section-scroll frame p95 was 6.4 ms and project-scroll p95 was
6.5 ms; median draw counts were 48 and 33 respectively. The scene contained
132,582 triangles, 228 meshes and 56 textures at that point. Reflections remained
bounded at roughly 28 updates per second while the camera moved.

These are local desktop samples, not measurements of the final build on Firefox
or a physical phone. No physical touch, headset, VR, public backend or deployment
acceptance is claimed. The four small navigation meshes are not shadow casters;
their reveal reuses the existing render loop. The walking progress indicator now
updates at 10 Hz independently of display refresh rate and skips hidden pages.

## Owner check — pending

About three minutes on the current preview. The local site and optional visitor
service are already running; no account is required. If restarting is necessary,
run these from `E:\Coding\portfolio-hall` in separate PowerShell terminals:

```powershell
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

```powershell
$env:COMMUNITY_DB = '_local/visitor-review-2026-09-22.sqlite'
npm.cmd run community:local
```

The visitor data is local QA data. The navigation review also works without
`?community=local` or the visitor service. Stop either terminal with Ctrl+C.

- [ ] Open the preview at FPV drone. The frame, project title and 7 / 9 indicator
  should agree, and the previous/next controls should be easy to find.
- [ ] Press Right twice to reach Balairung, then Right once more. It should stay
  there. Press Left to return to EEE, then Escape to leave its notes at that frame.
- [ ] Open any project's notes and choose Walk here. You should enter beside
  the current frame, facing it. Return immediately; the same notes should reopen.
- [ ] Enter walk mode again, move/look with your normal controls, release them,
  then choose Contact from the destination strip. Return should open Contact;
  movement should stop when controls are released or focus is lost.
- [ ] In Firefox, scroll from Entrance through Projects and Experience, then
  repeat a project/walk/return loop. Check for stutter and comfortable movement.
  On a physical phone, repeat the loop with touch controls and check that no
  control is hidden behind another panel.
- [ ] Judge the actual appearance: entrance composition, roof/light, frame
  contents, experience logos, reading-panel typography and the floor plan.
  Agent checks do not establish whether the result meets your taste.

User results, physical-device acceptance and merge authorization for this
combined batch are pending. Existing public-service, domain, external-iframe
and other backlog work remains separate; this document does not close issues.
