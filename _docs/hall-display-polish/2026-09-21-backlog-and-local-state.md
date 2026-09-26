# Recent requests and local state — 21 September 2026

[GitHub tracker #42](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/42)
is the current index for the owner's recent requests. The older evaluation
tracker [#31](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/31)
remains open; new issues link to its overlapping individual reports.

| Issue | Scope |
| --- | --- |
| [#32](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/32) | Fix Firefox scrolling and mobile runtime performance |
| [#33](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/33) | Make walk-around controls predictable on desktop and mobile |
| [#34](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/34) | Give the hall, maps and exhibits a coherent visual direction |
| [#35](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/35) | Make the portfolio copy specific to verified engineering, AI and immersive work |
| [#36](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/36) | Finish whole-section glass transitions and clear project exit navigation |
| [#37](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/37) | Make deployed web-app frames interactive and link them from project cards |
| [#38](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/38) | Refine seamless project portals and the shared hardware island |
| [#39](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/39) | Build lightweight visitor boats and a real analytics landscape |
| [#40](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/40) | Add a moderated post-it guestbook at the end of the hall |
| [#41](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/41) | Plan main-domain launch while preserving the old portfolio |

## Direction and Impeccable review

Keep the hall's personal mindspace identity and make the actual work easy to
browse. The owner has not accepted the current environment, flavour text or
walk-around quality. Address Firefox/mobile runtime cost and physical controls
first, then review a specific visual direction in a small representative slice.
Do not treat adding more low-poly scenery as a design solution.

The official [Impeccable repository](https://github.com/pbakaus/impeccable),
[critique reference](https://github.com/pbakaus/impeccable/blob/main/skill/reference/critique.md)
and [optimization reference](https://github.com/pbakaus/impeccable/blob/main/skill/reference/optimize.md)
were read as reference material. Useful points: critique hierarchy, specificity
and copy; verify in the browser; measure bottlenecks before optimizing. This is
guidance, not evidence that its detector score establishes good art direction.
No plugin, hooks, external workflow or automated restyle was installed or run.

## Local delivery state

Branch: `codex/hall-display-polish`, baseline
`44c38295939ab18e06559859b7bfb337d1276cf5`. Working changes remain
uncommitted, unmerged and undeployed. Preserve the existing `evaluation/`
directory. No hosting or DNS mutation has been made.

The local changes include revised career copy, whole-section defocus, portal
culling/update budgets, responsive preview-target resolution, a browse-only
30 Hz water-reflection ceiling, focused-project navigation and live-app routes.
These are work in progress, not accepted features.

Latest production build passed TypeScript, Vite and portfolio build checks:

- Entry: `index-DP19WEi3.js`; initial JavaScript including static imports:
  201,747 bytes. Babylon/world code remains separately loaded.
- Browse scene: `HallScene-DmvUht1h.js`.
- CSS: `index-Bxb3MnaK.css`.
- 11 project records and their routes/assets/public links passed the content check.
- Lint and typecheck passed earlier after these implementation changes.
- `git diff --check` passed. Existing large optional-chunk/Browserslist warnings
  remain; they do not establish runtime performance.
- Production preview at `http://127.0.0.1:5186/#` refreshed to this build.
  Temporary browser viewport override and diagnostic tab removed.

### Browser findings still open

In the in-app browser, THE FINALS iframe stayed on its loading view with the
expected source URL and no relevant reported console error. The cause is not
established. A bounded failure/loading state and real app workflows need testing
in a regular browser (#37).

Closing it returned to `#gallery/the-finals-outfit` and focused its card, but
the hall caption selected PetBot. The gallery alignment/active-project
calculation still needs repair (#36). Header reachability checks alone do not
prove embeds work. Current tests do not establish real Firefox, phone, physical
free-roam, headset or owner visual acceptance.

### Earlier performance evidence

Six-second automated project scroll on RTX 3080 / ANGLE D3D11, 1360×900
viewport, 697×816 canvas. These samples predate the latest water-resolution
and app-navigation changes; do not label them current-build measurements.

| Measurement | Before portal optimization | After |
| --- | ---: | ---: |
| Portal render-target passes | 2,597 | 279 |
| Median scene draw calls | 197 | 53 |
| Frame interval p95 | 6.8 ms | 6.7 ms |
| Main-thread long tasks | 0 | 0 |

The lower workload did not prove improved Firefox performance. One AVVR return
sample remained uneven (frame p95 21.5 ms, maximum 63.2 ms). A hardware-return
sample was smoother (p95 6.7 ms, maximum 17.7 ms). Investigate reproducibly
under #32; do not infer an across-browser result from this desktop.

## Visitor-service and hosting preparation

`community/`, `useCommunity.ts`, `VisitorBook.tsx` and
`src/data/community.ts` are unfinished scaffolding. They are not connected
to the public UI/scene, tested as a service, or deployed. The boats, graph
mountain, note wall and wider entrance are still to implement under #39/#40.
The Worker needs bounded request handling, abuse controls, validated
persistence/moderation and a real service configuration before deployment.
The local SQLite/D1 adapter is unverified. Keep local preview notes distinct
from shared public notes.

Read-only hosting inspection found the hall's `new` subdomain on GitHub Pages
and the old apex site on Cloudflare Pages (`personal-website`). Existing
Cloudflare access does not include all DNS/Worker/D1 permissions required by
the proposed setup. Preserve the old site at its new hostname first, prepare
a reviewable cutover and rollback, then resolve provider access and obtain
cutover approval under #41. No credentials belong in source or issue bodies.
