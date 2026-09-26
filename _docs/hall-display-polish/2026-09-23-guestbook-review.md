# Guestbook and picking — 23 September 2026

The former flat sign required a Contact navigation and a second click to reach
the form. The board now has a recessed cabinet, brass pins and individual paper
cards with lifted lower edges. Five note excerpts and a blank writing card fit
in three static draw batches. Notes are real service data; no invented visitor
messages or countries are added.

## Revision

- Branch: `codex/hall-display-polish`; existing dirty tree retained.
- Base: `44c38295939ab18e06559859b7bfb337d1276cf5`.
- Entry: `assets/index-MkINiNmQ.js`; CSS: `assets/index-CV99Syvm.css`.
- Browse: `assets/HallScene-BSygokR8.js`.
- Visitors: `assets/visitorDisplay-BlWwCa7P.js`.
- Guestbook: `assets/VisitorBook-CJ0sbSNJ.js`.
- Walk: `assets/HallExperience-DwLX94bM.js` and `assets/BabylonScene-CzaYttrf.js`.
- Manifest SHA256: `DD90829FB38519E06E14A36BCCB637EA9FA32174DD4615D5CCF7F0AE78CC851B`.
- Initial JavaScript: 228,130 bytes; 3D and the guestbook remain separate chunks.
- Preview: <http://127.0.0.1:5186/?community=local#guestbook>.
- No commit, push, issue mutation, PR, merge, deployment or DNS change.

## Interaction changes

Picking a note opens `#guestbook`; selecting the blank paper opens
`#guestbook/write`. The reading pane seeks the requested content and focuses
its heading or textarea. This supersedes an in-flight Contact scroll, accounts
for the sticky phone scene, and also works when scroll linking is disabled.
The entrance Guestbook link opens the notes directly. Visitor statistics and
their exact daily/country values remain in an expandable log below the form.

Walking uses the same community connection for the scene and the modal. Read
guestbook / E opens the book in place. Closing restores the initiating control
or canvas; the background is inert while open, and ordinary desktop rendering
pauses. Keyboard trapping includes enabled form fields and skips descendants
of closed details. The wider board has a fitted approach and inspection reach
which cover portrait phone viewports without leaving the walkway.

One tab-scoped draft and pending-send state is shared by the lazily loaded
guestbook. Closing or changing modes during a send does not start a duplicate
request or lose its result. Successful sends clear the message even if the
form is closed; failures preserve it. Only the draft is stored in sessionStorage.
The state does not create background polling or submit anything on its own.

Browser checks exposed two picking defects. Babylon's default canvas focus
could scroll a partly visible scene between pointer-down and pointer-up, making
the first click miss. Browse mode now suppresses that focus behavior, removes
the hidden canvas from the tab sequence, and starts with vertical touch panning.
Island controls retain their existing touch-action switching. The browsing
observer now requests only move/pick events: registering every pointer event
had enabled unused double-tap detection and dropped a rapid second selection.

## Agent verification

- Build/typecheck, lint, exhibit geometry, navigation and scroll checks pass.
  The existing Babylon chunk-size warning remains.
- Local Chromium: direct read/write routes focus their intended targets;
  writing from the header jump button works; 390 × 844 writing route has no
  horizontal overflow.
- Walking: open the book, write an unsent draft, Escape and reopen; the draft
  survives. Shift-Tab from Close reaches the visible visitor-log summary;
  Tab returns to Close. Closing restores Read guestbook and removes inertness.
- Fitted desktop and 390 × 844 walking views show the full board above controls.
  Geometry/navigation checks also cover 320 × 740 and intermediate widths.
- Isolated send fixture: one pending request remains disabled after unmount /
  reopen; completion while closed clears its draft and retains the reply;
  failure while closed retains the draft and error. Reload recovers the failed
  draft from storage. Long unbroken and wide-script notes fit a 390-pixel page.
- Physical board picks return separate read/write actions. After the picking
  repair, rapid consecutive write/read picks both fire with document scroll at
  zero and canvas tabindex -1. No notes were posted to a public service.
- Final production entry was verified in the user preview. Real board picks
  focus the textarea / guestbook heading; the header writing action also works
  with scroll linking disabled. Scroll linking was restored afterward. Project
  Right/Left changed RubyVR Studio to THE FINALS and back; Escape restored the
  RubyVR gallery card. Walking E opened the guestbook and Escape restored the
  canvas. The prior tab initially retained its old entry across fragment-only
  navigation; it was explicitly reloaded and these checks repeated on the
  final entry above.

## Rendering cost

The cabinet, pinned text and writing card use three batches, compared with the
previous board's two. The 1024 × 1024 mipmapped atlas uses about 5.33 MiB versus
the former 1024 × 512 non-mipmapped texture's 2 MiB. There are no per-note
materials, alpha-blended paper shadows, new render targets or animation loop.

A six-second warm, forced-awake entrance sample in the twelve-boat fixture,
656 × 636 canvas, Chromium / RTX 3080, recorded 1,021 frames, frame p95 6.1 ms,
CPU p95 0.8 ms, GPU p50/p95 0.43/0.90 ms, 123 draw calls, 189,136 triangles,
256 meshes and 67 textures. No long tasks or cached-target redraws occurred.
Sample scene ID: `1539d57f-4575-4dce-99d1-6db9e41781e1`.

Against the previous waterfront geometry this is one extra draw call, one
extra mesh and 3,654 triangles; texture count stays the same. The GPU result
varies between runs and is not evidence of a general speedup. The measurement
preceded the final pointer-only repairs; those did not change scene geometry.

On the final pointer revision, a visibly idle six-second guestbook sample
rendered zero frames, with zero render-target passes and zero long tasks.
Document visibility was `visible` before and after the sample. Scene ID:
`2de55d0a-a576-423f-8878-5885c4076a65`.

## Owner checks — not yet accepted

Use the revision above with the existing preview and local visitor service.
For a fresh shell, run these in separate terminals from the repo:

```powershell
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 5186
npm.cmd run community:local
```

- [ ] Open the preview link. Read a paper on the board, then select the blank
      paper. Notes and writing should open directly, without a Contact detour.
- [ ] Type an unsent note, switch to Walk around, choose Contact if needed,
      and press E / Read guestbook. The draft should still be there. Close and
      continue walking from the same spot.
- [ ] In the walking book, use Tab and Shift-Tab, open/collapse Visitor log,
      then press Escape. Focus should stay inside until closing and return to
      the initiating control. No background movement should occur while typing.
- [ ] On a real phone, use Contact in the walking selector. The board and Read
      guestbook control should fit; text entry, close, scrolling and returning
      to the portfolio should remain comfortable with the on-screen keyboard.
- [ ] In Firefox, scroll the hall, pick a frame and use project arrows. Check
      for first-click misses, scroll jumps and lag, then review the board's
      appearance. Local Chromium checks do not establish Firefox/phone acceptance.

Public community configuration/moderation, physical-device and headset checks,
and owner visual acceptance remain separate. The visitor ridge also shows a
dark strip from some walking viewpoints; inspect and correct that in the next
environment pass. No claim that the overall visual brief is finished is made.
