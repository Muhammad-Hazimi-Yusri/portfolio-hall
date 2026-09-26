# Exhibit destination signs — 23 September 2026

The selected frame now has two small mounted signs naming its neighbouring
projects. They replace the floating circular arrows. The focused camera sits
slightly farther back and nearer the centre of the frame, leaving space for
both destinations. Gallery scrolling uses the same revised project viewpoints.

This is part of the combined local change. No commit, push, issue operation,
PR, merge, deployment or DNS change was made. Owner acceptance remains pending.

## Identifiable build

- Branch: `codex/hall-display-polish`, existing dirty tree based on
  `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-e7cWqGc-.js`.
- CSS: `assets/index-DHGJwmft.css`.
- Browse scene: `assets/HallScene-MpFGDsC8.js`.
- Walking scene: `assets/BabylonScene-CZefqCMQ.js`.
- Manifest SHA256:
  `42655F40F8CA8FF67A52021D12028AFA1AB1B622B55BE8A3777DA60FF7D3AA3D`.
- Build log: `_local/exhibit-signs-build.log`.
- Preview: <http://127.0.0.1:5186/?community=local#project/rubyvr-studio>.

## Implementation and evidence

The signs reuse four meshes and two 512×336 label textures for the whole hall.
They show Previous/Next, a drawn arrow and the actual neighbouring project title.
Titles wrap instead of being squeezed. The finish changes on hover; signs fade
in without the old scale pulse. They disappear outside project focus and at the
relevant collection boundary. Existing HTML navigation, keyboard shortcuts and
map controls remain the accessible alternatives, especially on small screens.

Labels are repainted on a project or hover change, not every frame. There is no
new light, shadow caster, offscreen render pass, asset download or animation
loop. Four meshes are still used; the simpler boxes and planes total 28 triangles
when both signs are present. The initial JavaScript remains 249,791 bytes, and
the 3D code still loads separately. The existing large Babylon chunk warning
remains; this pass does not claim a general performance improvement.

- PASS: production build/TypeScript/content and asset checks, lint, existing
  contextual-navigation and scroll checks, and diff whitespace check.
- Development at 1280×720: the physical Next sign opened WattWhere from AVVR;
  the physical Previous sign returned to AVVR. Source images, signs and long
  destination labels were visually inspected after camera settling.
- Compiled at 1280×720: Food Wars showed only Next; Balairung showed only
  Previous. Right at Balairung did not wrap. Clicking its physical Previous
  sign opened EEE Roadmap.
- Compiled at 390×844: Food Wars → AVVR through the HTML Next control. Both
  HTML arrow targets were 44×44px; no document horizontal overflow.
- Compiled at 320×740: AVVR's frame and both signs were visible; no horizontal
  overflow. Escape returned to `#gallery/avvr` and focused its gallery entry.
  The 3D labels are small here; the full HTML project navigation remains visible.
- Compiled at 320×740: Walk here from AVVR opened beside that exhibit, with
  `Inspect Audio-visual scenes in VR`. Portfolio returned to its project notes.
  This checks the contextual handoff, not physical touch or mouse capture.
- No browser errors captured in the review tab. The viewport override was
  reset; the main preview was reloaded with the new entry and left on RubyVR.

One six-second development sample at settled RubyVR recorded zero rendered
frames, zero offscreen passes and zero long tasks. Chromium/ANGLE on RTX 3080,
723×644 render surface, scene `36cfd17f-b1be-4d18-8817-b8cdff80606e`. Water,
shadows, logos, portal previews and flags were enabled; Keep renderer awake was
off. No build ran during sampling. Zero drawn frames does not mean zero CPU
usage. This is an idle regression check, not Firefox or phone performance proof.

## Owner functional review — pending, about two minutes

The local preview is running. No account or note submission is needed. If the
preview needs restarting, run the following from PowerShell; Ctrl+C stops it:

```powershell
Set-Location E:\Coding\portfolio-hall
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

The optional local visitor service is unrelated to these signs. Omit
`?community=local` if it is unavailable.

- [ ] Open RubyVR at the preview link. Expected: the frame is fully visible,
  with WattWhere on the left sign and THE FINALS Outfit Studio on the right.
  Check whether the camera distance and sign size feel right.
- [ ] Click each physical sign, then use Left/Right and Escape. Expected:
  signs and notes agree, Escape returns to that exhibit, and navigation stops
  at the first/last project instead of wrapping.
- [ ] At phone width, use the HTML arrows and Walk here, then Portfolio.
  Expected: readable controls, a start beside the selected exhibit and a return
  to its notes. Repeat ordinary browsing in Firefox and on a real phone.

User results and visual acceptance are unreported. No checks are waived, and
this record does not recommend merge or close the wider portfolio goal.
