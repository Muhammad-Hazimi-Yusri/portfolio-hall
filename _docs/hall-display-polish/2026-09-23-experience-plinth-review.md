# Experience displays and approaches — 23 September 2026

The three employment displays now use physical plinths and attached role
plaques. The hovering brand marks retain their existing geometry and motion.
The wider visual goal and owner acceptance remain open.

## Local build

- Branch: `codex/hall-display-polish`, intentional uncommitted changes.
- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-Bb1u0PHT.js`; styles: `assets/index-CqUzzxiD.css`.
- Browse: `assets/HallScene-DFDMU2MK.js`.
- Walking: `assets/BabylonScene-BwZNS1XY.js`.
- Visitor display: `assets/visitorDisplay-DxW8-poJ.js`.
- Manifest SHA256:
  `BF7A5635E318611635402A25C917427D876CEC0D5370A225183E11CEB67D1348`.
- Preview: <http://127.0.0.1:5186/?community=local#experience/tnei>.
- Build log: `_local/experience-plinth-build.log`.
- No commit, push, issue change, PR, merge, deployment or DNS change.

## Changes

- Replaced the cylindrical bases with bevelled cabinets, recessed feet and
  thin caps. They use the existing dark metal and green materials. The static
  furniture casts the cached shadow and its body blocks walking through it.
- Attached the role plaque to the front. Its larger serif role, organisation,
  dates and department use the same reviewed content as the reading panel.
  The paper/copper palette replaces the old cool white floating label. It no
  longer billboards. The selected-role camera includes the logo and plaque.
- Added All experience and an Escape exit to focused role views. Pause/play
  sits with the other scene controls. A focused role's mobile view separates
  its header, canvas and toolbar, keeping controls off the exhibit.
- Walking-directory approaches now face the plaque side, fit the full logo
  and label, and stay on a body-width floor surface. Inspection range includes
  the farther phone approaches. Return recognises the experience being faced.

## Verification and repairs

- PASS: final build/TypeScript and portfolio checks; lint; logo geometry and
  motion, exhibit geometry, navigation, movement, browse-look and scroll checks.
  Final whitespace check passed. Existing large Babylon chunk warning remains.
- Initial JavaScript: 233,008 bytes, 1,391 above the previous browse-look build.
  Babylon remains separately loaded. No new image asset, light or render pass.
- Development: inspected all three close-ups and the overview. Roles and dates
  fit their plaques. TNEI's dates initially conflicted with the fixed controls;
  lowering the close-up target corrected that framing.
- Phone viewport inspection exposed the old overlay controls covering the
  display. The separate header and toolbar corrected that. A final 320px
  toolbar trial wrapped its labels; narrower padding and non-wrapping text
  fixed it while retaining 44px targets.
- Final compiled 320×740: All experience, Map, Pause and Walk each measured
  44px high. Toolbar labels stay on one line, controls sit outside the canvas,
  and there is no horizontal overflow. Escape returned to `#about` and focused
  the Experience heading. The 390px layout was also inspected in development.
- Development map → 3D retained TNEI; Escape restored the overview. Pause
  changed to Play logos and set its pressed state in compiled runtime.
- Final compiled desktop: selecting TNEI's physical plaque in the overview
  opened `#experience/tnei` and focused the Experience heading.
- Actual walking regression found during this pass: the new fitted TNEI
  approach was outside the old five-metre return threshold, so Return opened
  the general Experience section. Return now recognises the display being
  faced, including from the bridge. A navigation check covers every role and
  the tested desktop/phone aspect ratios.
- Compiled `index-B4Am_GB4.js`: Southampton → Walk → directory TNEI → Inspect
  opened TNEI's notes. Close → Portfolio returned to `#experience/tnei` with the
  heading focused. Its walking, return and inspection code is unchanged in the
  final build; the later change only adjusts the narrow toolbar spacing.
- Main preview explicitly reloaded to `index-Bb1u0PHT.js` at 1379×1278 and left
  on TNEI. Ready scene, no horizontal overflow and no captured console errors.
  Temporary test tab closed; viewport override reset.

## Local performance observation

Six-second development samples, Chromium/ANGLE on RTX 3080, render size 723×644.
Water, shadows, logos, portals and flags enabled; Keep renderer awake disabled.
No builds or checks ran during samples. Scene:
`13766772-8c49-4e43-8661-d198b94a8631`.

| Sample | Result |
| --- | --- |
| TNEI, motion enabled | 1,021 frames; frame p50 5.9ms / p95 6.2ms / max 7.8ms |
| CPU / GPU p95 | 0.5ms / 3.54ms |
| Median draws | 28 |
| Long tasks / layout measurements / offscreen passes | 0 / 0 / 0 |
| Settled after Pause logos | 0 rendered frames, 0 offscreen passes, 0 long tasks |

The scene reported 219 meshes, 166,104 triangles and 67 textures. These are
current-scene observations, not an isolated before/after speedup measurement.
Zero rendered frames does not mean zero application or scheduler CPU usage.

Firefox, physical touch/phone/pen, headset, listening and owner visual
acceptance remain unverified. Desktop viewport checks do not establish them.
Public visitor-service deployment and domain migration remain separate work.

## Owner review — pending, about three minutes

If the running preview needs restarting:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

Omit `?community=local` to review without the visitor service. That optional
service starts with `npm.cmd run community:local` in a second terminal. Ctrl+C
stops a manually started service. These steps do not post notes or play audio.

- [ ] Open TNEI and switch to Audioscenic and Southampton. Check that each
  full logo and attached role plaque is clear and the stand feels part of the
  hall. Pause/play should stop and restore idle motion; selected logos face you.
- [ ] Use All experience, select a physical plaque, then press Escape.
  Expected: the role opens, then the overview returns with heading focus.
- [ ] Choose Walk around. Use the directory to reach a different role, Inspect
  it, close its notes and return. Expected: a view of the front plaque, readable
  notes and a return to the role you reached.
- [ ] At phone width, switch map/3D in a focused role. Expected: the same role
  stays selected, controls remain usable, and the logo/plaque are not covered.
  Repeat ordinary scrolling and walking on a real phone and in Firefox.
- [ ] Open RubyVR, press Right and then Escape. Expected: THE FINALS opens,
  then its gallery row returns. Check the existing project path still feels
  comfortable alongside the experience changes.

User results and waivers are pending. This local pass does not establish owner
acceptance, merge readiness or authorization to publish.
