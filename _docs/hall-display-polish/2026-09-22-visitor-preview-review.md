# Visitor preview — local integration and acceptance

Work remains on `codex/hall-display-polish`, with the accumulated earlier changes
preserved. No issue changes, commit, push, PR, merge, deployment, Cloudflare
resource creation or DNS changes are part of this pass.

## Model and scope

The user requested Opus 5.5 for this continuation and explicitly approved sending
the bounded brief and three named service files to Anthropic. Claude Code 2.1.280
was signed into Claude Pro; the returned model was `claude-opus-5-5`. The completed
pass used **xhigh**, safe/restricted mode, Read/Edit/Write only, with no shell,
network tool, credentials, Git actions or additional agents. File ownership and
requirements are in `2026-09-22-opus-community-brief.md`.

Opus implemented `community/worker.mjs`, `community/schema.sql`,
`community/README.md`, `tools/community-local.mjs` and `tools/check-community.mjs`.
It could not run checks. Codex reviewed those files, ran the checks and repaired
schema validation so malformed legacy tables or missing primary keys cannot
partially change a database before startup fails. Codex implemented the client,
scene integration and rendering fixture, and performed the browser checks.

The first max-effort attempt was stopped before it produced source edits; no
final usage was returned for it. Its brief and ignored log are preserved. After
the updated workspace policy, the xhigh restart was initially blocked by
automatic approval review over the unpublished source payload. The user's
explicit approval resolved that block. The completed CLI run took 890,583 ms and
reported 97,296 output tokens (73,312 thinking), 20 input tokens, 102,678 cache
creation tokens and 621,547 cache-read tokens. Reported USD 2.8917334 is CLI
pricing metadata, **not evidence of a cash charge**. Subscription cost/quota,
Codex usage, and total preparation/review time are not known. No paid API fallback
was configured. The ignored result log is
`_local/opus-community-2026-09-22.jsonl`.

## Client and scene

- The unconfigured site does not connect to a community service or collect
  visits. On a loopback host only, `?community=local` opts into port 5190.
- The guestbook code loads separately. An entrance link leads to Contact, where
  the 28-day chart, exact daily counts, country/section descriptions, notes and
  form are available without 3D.
- Visits count browser sessions once per UTC day, not distinct people. Boats
  sample up to 12 recent visits and show coarse last sections. Their flags use
  country codes, with a dash for unknown; these are not national flag artwork.
- The water-side skyline has 28 samples and a linear height scale relative to
  the daily peak. An empty log produces no mountain. No synthetic visits are
  mixed into the preview service.
- Boats, flags, skyline and note board are static and batched. They have no
  shadow-map/reflection entries or animation observers. Scene data changes
  trigger a redraw; identical poll responses preserve the scene objects.
- The guestbook occupies the existing Contact stop instead of hiding behind a
  second sign. Its physical board shows excerpts of the six most recent notes;
  the document shows up to 12 full approved notes. All note content is rendered
  as plain text.
- Both browse and free-roam renderers receive the same bounded data shape.
  Free-roam collection sends only changes between coarse sections, with a
  debounce, not camera coordinates. DNT/GPC skip visit POSTs.
- Drafts stay in session storage for this tab. Failed sends retain the draft,
  disconnected state is explicit, and a Retry connection control is provided.
- Local note persistence uses SQLite. Live writes default to disabled; live
  notes require moderation and never appear before approval. Counts use daily
  hashed session keys; the service keeps no IPs or camera coordinates.
- The entrance view now includes more of the first platform and water. Runtime
  testing caught free-roam Contact travel landing behind the new board. Plain
  sign approaches now land on their front side; this also fixes the entrance
  sign's approach. Clicking the physical board opens Contact; clicking it while
  already at Contact scrolls to and focuses the note field.

## Repeatable local checks

`tools/fixtures/visitors.html?profile` is a development-only rendering fixture
with explicitly synthetic data: 12 boats, 28 counts and 12 notes. It makes no
community requests. Remove/Restore controls exercise disposal and rebuilding;
Guestbook view inspects note wrapping. It is not part of the production entry.

`tools/check-community-data.mjs` checks malformed payloads, bounds, duplicate and
invalid dates, non-finite counts, literal note content, and the linear skyline.

## Agent results — 22 September 2026

- PASS: `npm.cmd run check:community`: 12 backend tests plus the client-data
  checks. Covers midnight dedupe, exact origins, streamed body limits,
  moderation, concurrent daily caps, retention, legacy migration, database
  mismatch refusal, aborted uploads, loopback binding and restart persistence.
- PASS: `npm.cmd run lint`, `npm.cmd run build`, `check:hall`, `check:movement`,
  `check:scroll`, `check:portals`. Build also checks project links/images and
  separate 3D loading. Initial JavaScript is **210,252 bytes**. The guestbook UI
  and 3D load in separate chunks. Existing large Babylon chunk warnings remain.
- PASS in local Chromium: draft retained across CV/back and a failed send;
  connection recovered; a local note saved and appeared on page and 3D board;
  another update appeared while the camera was idle. Notes survived service
  restart. No real service data or credentials were used.
- PASS: free-roam directory → Contact shows the front of the board, its click
  returns to Contact, and another board click focuses the form. No console
  errors during that corrected flow.
- PASS: 390 × 844 and 320 × 740 layouts had no horizontal overflow; note controls
  had 16px text and a 44px submit target. These are desktop viewport tests.
- PASS: final production preview loads at port 5186 without the community flag,
  with one canvas, no guestbook and no console errors. The default site does not
  enable the visitor service.

Final build: `assets/index-yyh3qCQ1.js`, CSS `assets/index-dIACz0BC.css`,
hall `assets/HallScene-BZ04nr9s.js`, guestbook `assets/VisitorBook-D79CPAvS.js`.
Entry SHA-256:
`5324177CBC314348B28A9D596E70C17D53DFBB0BE96717A0CDEB7D82AC31F1CB`.
This identifies an **uncommitted** build over HEAD
`44c38295939ab18e06559859b7bfb337d1276cf5`; it is not a deployed revision.

### Bounded rendering comparison

Same local Chromium scene, RTX 3080, 656 × 636 canvas, six-second samples after
warm-up. Both moving-render samples forced the renderer awake. These measurements
describe visitor overhead in this view, not whole-site or mobile performance.

| State | Meshes | Textures | Triangles | Draw calls | CPU median / p95 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Visitors removed | 219 | 54 | 89,864 | 121 | 0.8 / 1.1 ms |
| 12 boats, ridge, board | 225 | 56 | 93,622 | 121 | 0.8 / 1.0 ms |

Neither sample recorded a long task or extra render-target pass. With the awake
override cleared, the populated scene rendered **0 frames in 6 seconds** after
settling. Earlier remove/restore cycles returned to the same mesh and texture
counts. Country flags are one atlas, board text is one texture; updates dispose
the replaced resources. Visitor decorations do not add water/shadow passes or
appear in the cached hall image inside return portals.

## Owner review — pending

About five minutes on this build, using the existing local servers. No boxes
below are checked by agent results. This is the visitor pass; previous app,
island and control review notes still apply to the eventual combined PR.

Open `http://127.0.0.1:5186/?community=local#contact`. If the servers have stopped,
use two PowerShell terminals (skip these commands if they are already running):

```powershell
cd E:\Coding\portfolio-hall
npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort
```

```powershell
cd E:\Coding\portfolio-hall
$env:COMMUNITY_DB = '_local/visitor-review-2026-09-22.sqlite'
$env:COMMUNITY_PORT = '5190'
npm.cmd run community:local
```

This uses the ignored local QA database, never a public wall. Ctrl+C stops each
server; restarting with the same DB path keeps test notes. No build is needed
unless source changes, in which case the affected acceptance must be repeated.

- [ ] **1. Default entry:** open `http://127.0.0.1:5186/`. The wider entrance,
  work/projects/CV links and map should work, without a visitor or guestbook UI.
- [ ] **2. Visitor preview:** open the URL with `?community=local#contact` above.
  Expect a Local preview label, daily graph and the local notes. Select Entrance
  to see the boats/water view, then Contact to return to the board.
- [ ] **3. Draft recovery:** type a short test note without sending, open CV,
  then use browser Back. The draft should still be there. If you stop the
  community terminal and try a send, the error should keep the draft. Restart
  that terminal and use Retry connection when shown.
- [ ] **4. Save:** choose Add to local wall. Expect the note on both the page
  and board, an empty note field, and a local-only confirmation. Reload: the
  note remains and the same tab should not add a second visit for today.
- [ ] **5. Walk and return:** choose Walk around, then Go to Contact in the
  bottom map. Expect the front of the board. Click it to return to Contact;
  click the board again to focus the note field. Use hall map should still
  provide section navigation and the recent visitor markers.
- [ ] **6. Firefox:** open this same local preview in Firefox, scroll through
  the written sections, switch the hall/map and try a project. Report any
  sticking, sudden jumps, or continued rendering noise after settling.

User result: **PENDING**, no steps waived, no merge authorization for this pass.

## Remaining acceptance

Local browser checks do not establish physical Firefox, phone or headset
performance. The public service, abuse protection, owner moderation workflow and
domain migration remain separate deployment work. Keep the existing issues open
for owner review and the planned combined PR.
