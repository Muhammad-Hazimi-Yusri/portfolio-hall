# Hardware exhibits — local visual revision

Continues `codex/hall-display-polish` from base commit
`44c38295939ab18e06559859b7bfb337d1276cf5`, with the existing working changes
preserved. No commits, PRs, issue changes, deployment or external service changes.

## Build and sources

- Preview: <http://127.0.0.1:5186/?community=local#world/hardware/petbot>.
- Entry: `assets/index-C_YAQLb-.js`; CSS: `assets/index-CWGYK-wJ.css`.
- Browse scene: `assets/HallScene-DkSk0GI0.js`.
- Manifest SHA-256: `39C0CD2DAE34DA13D7785C1F03F1F7AE62325693EF75C28ACDCB909BD4316637`.
- Initial JavaScript: 216,378 bytes. Exhibit geometry still loads with the 3D scene.
- References inspected: `public/thumbnails/petbot-{1,2,3}.webp` and
  `public/thumbnails/fpv-drone.jpg`. Existing FPV provenance is in `fpv-sources.md`.
- New geometry is authored procedurally from those photographs. No external
  model, generated image, dependency or asset download was added.

These remain illustrative assemblies, not measured CAD or hardware simulations.
The public notes retain that distinction, the team attribution for PetBot, and
the user's specific server/integration contribution.

## What changed

PetBot now follows the photographed silhouette: a rounded coral shell, tablet
at an angle, triangular inset ears on servo blocks, small oval side arms and
spoked wheels. Its screen echoes the expression shown in the photo. Opening
the shell lifts the lid and ears together and moves the complete tablet assembly
forward, revealing a deliberately simplified internal board.

The drone has swept three-blade props, carbon plates, motor bells and fasteners,
a rounded battery with a strap, camera cradle/lens, antenna, paired power wires
and light-strip carriers. The landing feet meet the raised flight pad. Static
components are batched by material; only the four rotor assemblies and parent
transform animate during Hover.

The shared workshop uses a darker deck, a wood-grain bench, a cutting mat,
pegboard and smaller attached labels. Original project photos remain visible.
Each station has a closer camera composition. Inside an island, the repeated
invitation block is replaced with a short provenance note, and the controls
occupy less vertical space. Phone controls preserve 44-pixel targets; Reset has
an accessible name even when its compact icon is displayed.

## Checks

- PASS: TypeScript, lint, production build, packaging checks and diff whitespace.
- PASS: `check:exhibits` covers finite/unit normals, outward face winding, bevel
  bounds, reverse profile input, a thin-ring geometry budget and preservation
  of world placement/interaction metadata when batching a transformed assembly.
- PASS: existing `check:portals` and `check:navigation`.
- PASS in Chromium: PetBot station opens the matching notes; Open shell visibly
  raises the lid/ears and slides the tablet as a complete unit; Assembled closes
  it. Switching to FPV changes the camera and notes together.
- PASS: clicking the actual 3D drone enables Hover. Landed stops it. Orbit and
  Reset remain available. The original image is rendered beside each model.
- PASS at 390 × 844: no horizontal overflow, 44-pixel assembly button targets,
  station switching, opening the shell, Map → Show 3D island, and Escape back
  to the matching PetBot notes. The temporary viewport override was reset.
- PASS: the production preview was reloaded and serves `index-C_YAQLb-.js`.

### Rendering evidence

Final geometry was sampled in local Chromium on the RTX 3080, with the workshop
canvas at 723 × 488 and all normal rendering flags enabled. The opt-in profiler
was used through its visible controls. Sample scene ID:
`7f24b02b-50ba-4fcb-8783-256c1515e264`.

| State, six seconds | Rendered frames | Frame p95 | Long tasks | Median draws |
| --- | ---: | ---: | ---: | ---: |
| Landed and settled | 0 | n/a | 0 | n/a |
| Hover active | 1,021 | 6.4 ms | 0 | 52 |

Active hover was about 170 fps; CPU p95 was 0.7 ms and GPU p95 4.48 ms. No
reflection, refraction, shadow-map or portal-target passes occurred during
these stationary-view samples. The idle result means no additional frames
were rendered; it is not a claim of zero JavaScript work or zero power use.

The full scene contains 156,276 triangles, 252 meshes and 63 textures, including
inactive destinations. These are not all drawn every frame. The first detailed
version contained 186,336 triangles; concentrating bevel samples and using thin
ring geometry removed 30,060 without changing the outer silhouettes. Compared
with the previous architecture pass, the final scene still has more geometry.
Desktop results do not establish Firefox or physical-phone performance.

## Owner check — pending

The current preview server is running on port 5186. If it needs restarting,
run `npm.cmd run preview -- --host 127.0.0.1 --port 5186 --strictPort` from
`E:\Coding\portfolio-hall`. The exhibit also works without `?community=local`;
that query only adds the separate local visitor preview.

- [ ] Open PetBot and compare its silhouette with the adjacent original photo.
  Choose Open shell and Assembled; all attached parts should move together.
- [ ] Choose 02 / FPV drone. Inspect it from another angle, try Hover, then
  Landed and Reset. The photo and project notes should still be easy to reach.
- [ ] Use the hall map, return to the island, then press Escape. It should
  return to that project's notes. Left/right project navigation should work.
- [ ] Repeat on Firefox and a physical phone; check smoothness, touch control
  spacing and readability. Judge whether the new models and setting meet your
  visual expectations.

No owner result has been recorded. This revision is not a claim that the full
portfolio backlog, public visitor service or visual goal is complete.
