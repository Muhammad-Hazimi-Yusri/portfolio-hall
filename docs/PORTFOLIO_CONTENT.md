# Updating the portfolio

The default site pairs the Balairung hall with readable content. Section and
project links move the camera while opening the notes immediately. `#explore`
opens free-roam mode. A hall map replaces 3D when the visitor switches it off,
prefers reduced motion, or cannot load the renderer; the content stays available.

## Where to edit

Edit `src/data/portfolio.ts`:

- `profile`: contact details and the last content update.
- `experience`: employment history, dates and role descriptions; also used by the CV.
- `professionalWork`: high-level accounts of internal tools.
- `projects`: personal and university projects, in gallery order. The entrance
  selection is in `HallPortfolio.tsx`; `featured` is retained as optional metadata.

A project needs a stable `id`, a short description, your role, tools, the problem,
your contribution and the current state. Its page is `#project/<id>`. Keep IDs
stable so old links continue working. Link to evidence: a public repository,
working application or demonstration. Check external destinations before publishing.

The notes give the live app a primary action when `liveApp` is present; otherwise
the first entry in `links` is the primary action. Put the most useful original
project destination first. Other public links and contextual walking remain
available alongside it. Original imagery appears before the role/status/tools
table; optional portfolio-island invitations follow the case study.

`exhibitSteps` is an optional three-step overview for the gallery frame. For a
project without a screenshot, the frame shows this workflow, the real summary
and development status. It is a diagram, not an imitation of an application UI.
Frames with screenshots preserve the source image's proportions, give the
image most of the frame, and show `image.caption` underneath. The title stays
on its separate physical plaque. Keep captions specific to the pictured
version; use the numbered workflow for projects without a usable screenshot.

Put real screenshots in `public/thumbnails/`, then set `image.src` relative to
`public/`, with an accurate `alt` and `caption`. Add `width` and `height` if the
image is not 1920 by 1080. Images work under both a custom domain and a subpath.
Avoid making illustrative mockups look like completed applications.

The project index uses a consistent compact image-and-text row for each public
project with an image. It preserves the source proportions and lazy-loads the
same assets used by the project notes. The two internal-work entries use
labelled public SVG illustrations: a document workflow and a synthetic response
trace. These are portfolio diagrams, not screenshots, site data or compliance
results. Their captions and in-diagram labels must retain that distinction. An
"In view" marker identifies the row currently shown in the hall; app links
also name their project for assistive technology. The Projects overview starts
before the first public exhibit, derived from project order and its frame
position, so the first scroll continues forward through the gallery.

`gallery` holds optional additional images with the same fields. The primary
`image` stays on the hall frame; visitors choose the other images from thumbnail
buttons in the notes. Left/Right while those buttons have focus select images,
including at the ends, instead of switching projects. Thumbnails reuse the local
assets and load lazily; a project's secondary image can load when its thumbnail
comes into view. Inline photographs fit within a bounded height without cropping.
Every project image opens an accessible dialog, with arrows for additional
images, an actual-size view and Escape to close. Closing keeps the reading
position and restores keyboard focus to the image. The hall renderer pauses
while the dialog covers it. There is no automatic slideshow or added blur.

A selected still-image frame also opens that viewer directly, showing the
primary image pictured in the hall. Closing a viewer opened from the frame
returns focus to the nearby gallery-return control and preserves the reading
position. Frames for apps and islands retain their own destinations. Pointer
hints name each action and the next/previous project; a warm edge marks the
target without an outline-rendering or glow pass. `exhibitAction` in
`hallNavigation.ts` supplies both the hint and the action so they agree.

RubyVR's two PNGs are unchanged development captures from its public editor
repository (`docs/media/studio-oldale.png` and `studio-part-selection.png`).
THE FINALS image is the 12 September 2026 development capture from
`_docs/catalog-progress-ui-2026-09-12/builder-desktop.png`; it is labelled with
that date and credits Embark's artwork. These illustrate editor/application
work and do not establish completed game, VR or material-fidelity acceptance.

WattWhere's two JPEGs show the fuel-mix and carbon-intensity panels from its
hosted dashboard on 23 September 2026, with their data attribution retained.
The live map background displayed an API-key error during that review; the
project's current-state note records it. These are explicitly chart captures,
not evidence that the whole dashboard works. Balairung's two JPEGs show the
September development hall and its 2D floor plan. Original full screenshots
and capture provenance are in
`../_docs/hall-display-polish/2026-09-23-exhibit-ux-review.md`.

The hall takes its content from `src/data/pois.ts`, which derives it from these
same records. `pois.json` and the old scroll-tour components are legacy material;
they are not the current content source. The old `capture:update` command writes
that legacy JSON, so edit `portfolio.ts` for current screenshots.

The introduction, section copy and entrance selection are in
`src/components/portfolio/HallPortfolio.tsx`. The entrance features AVVR's
original application image with its published status and team-project role,
followed by the internal site-test tools. It reuses the project record rather
than a separate marketing description. The image is uncropped and loads with
the opening panel; no new asset is introduced. The name becomes a single line
when space permits on phones, leaving more room for the introduction and work.
`HallScene.tsx` reuses the existing
Babylon hall geometry with a controlled camera. Layout is in the adjacent
`portfolio.css`. `Portfolio.tsx` contains the case notes and printable CV at `#cv`;
the CV uses the same employment records, so
review its short project summaries when changing the selected projects.

Experience records have stable `id` and `logo` fields. They create the floating
logo displays and the `#experience/<id>` routes. Keep logos in `public/brands/`
and record their official source in that directory's README. Runtime geometry
extrudes each logo's alpha mask into front/back caps and side walls; the empty
space around and inside the letters has no surface or backing plate. `ink` is
an optional colour for the solid logo (used for the white source variants),
while `background` only controls the logo badge in the reading panel.

Set `motion` to `left-right`, `right-left` or `bob`. Selected or highlighted logos
face the camera; nearby logos do the same within six hall units, returning to
their idle motion beyond seven. Tracking settles the bobbing as well as the
rotation. Pause logos stops the idle animation; camera tracking still works.
Reduced motion defaults to the map, and also stops idle motion in free roam.
Run `npm.cmd run check:logos` after changing geometry or tracking behaviour.

The Experience overview faces all three logos toward the visitor. Once the
view and logos settle, the browse renderer sleeps; individual role views and
walking retain the existing proximity/highlight tracking and idle motion.

Each logo floats over a solid, bevelled plinth with an attached front plaque.
The plaque uses the hall's paper and copper palette, puts the actual role in
larger serif type, and retains the organisation, dates and department. It does
not rotate toward the camera. The fixed stand casts its cached shadow; the
moving logo remains outside that cache.

Focused role views have an All experience exit; Escape returns to the overview.
On narrow screens, a compact header and toolbar sit outside the rendered
exhibit. The 340px stage gives the canvas its own area, keeping the logo and
plaque clear of the controls. Motion remains available through a labelled 44px
pause/play button. The overview and project stages retain their own layouts.

Walking-directory approaches face the plaque side, fit the logo and role label
on narrow screens, and clamp the landing to the walkable deck. Inspect works
from those viewing positions. Returning recognises the experience being faced,
including a fitted phone approach on the bridge beyond the old proximity
cutoff. See `../_docs/hall-display-polish/2026-09-23-experience-plinth-review.md`
for the checked build and pending owner review.

`hallPlantings` in `hallLayout.ts` supplies the six outer-edge planters in the
3D scene and floor plan. Walk entry moves inward if an aerial camera would
otherwise land in a solid pot. Keep these placements outside the central aisle.

Hall stone, decking and plaster use UVs measured in metres. Repeating dynamic
textures must explicitly use `Texture.WRAP_ADDRESSMODE`: Babylon's default
for `DynamicTexture` clamps the edge instead. Surface textures use mipmaps to
reduce shimmer at a distance. Planting is opaque, static and merged by material;
it has no independent animation loop or new shadow pass.

Structural timber and stone paving use the two self-hosted 1K colour maps in
`public/materials/`; that directory's README records the CC0 sources and hashes.
Timber grain follows each member's long axis before rotation and batching.
The maps total 691 kB and replace the earlier generated grain/tile images.
Normal maps were trialled but omitted after comparing their GPU cost. A surface
stays usable while its map loads; readiness wakes the browse renderer and
invalidates its cached water reflection once.

Walk mode uses the same paper-coloured loading state while its module and scene
load. The actual scene stage supplies the status text; it does not present
staged progress values as a download percentage. Back to portfolio and Escape
return to the entry route throughout loading. Walk controls stay hidden until
the scene reports readiness, then focus goes to the walking canvas.
See `../_docs/hall-display-polish/2026-09-23-materials-and-entry-review.md`
for that pass's build, measured costs and pending owner checks.

The entrance and contact signs use the site's pavilion mark, paper palette and
serif headings. Each has one merged metal stand and one merged pair of faces.
The entrance sign opens Work; the walking directory calls it Gallery guide.
The contact sign focuses the email link when Contact is already selected.
Sign approaches fit the complete face on narrow screens while keeping the
visitor on the deck and within inspection range.

No portrait is configured: the GLB is missing and the bundled scan was visually
identified as a LEGO object, not a person. The original scan is preserved, but
the hall neither requests it nor substitutes a generic person. See
`../public/assets/avatar/README.md` before configuring a reviewed portrait.
The subsequent `../_docs/hall-display-polish/2026-09-23-wayfinding-review.md`
records these changes and their current local build and acceptance status.

The **Scroll with hall** switch is enabled for new visitors and remembers their
choice in local storage. It joins the overview sections into one reading flow.
Each `data-hall-view` anchor supplies a camera stop, measured from the actual
layout so different screen sizes and text lengths stay in sync. Scrolling the
desktop canvas forwards to the reading panel; mobile uses native page scrolling
with the hall held above the notes. The switch restores separate sections when
disabled. Direct project and experience links still open focused notes.

Camera interpolation is in `HallScene.tsx`; the scroll controller is in
`useHallScroll.ts`. Main navigation seeks the corresponding section. Scroll
updates replace the current section hash without adding history entries or
moving keyboard focus. Reduced-motion preferences remove easing and fades.
Anchor geometry is cached until content or viewport layout changes. Navigation
and active-card selection share the same reading inset, and an outstanding
scroll update cannot overwrite a newly clicked route.
Run `npm.cmd run check:scroll` after changing the scroll mapping.

## Content evidence reviewed on 20 September 2026

The work history and team-project contributions were checked against the
September 2026 CV and its source notes, rather than the old site's text.

- TNEI: Graduate Consultant, Connections, April 2026–present.
- Audioscenic: Software Audio Analysis Intern, July–September 2025.
- Southampton research: June–August 2024.
- MEng Electrical and Electronic Engineering: First Class, 2021–2025.
- Reporting workbench: user-confirmed internal VM/SSO deployment; substantial
  development remains. Deployment is not evidence of adoption or impact.
- Site-test tools: development of measured-data analysis and reporting. No
  client data, report excerpts or internal source is included here.
- PetBot: server and LLM/sentiment integration within a team project.
- AVVR: technical lead integrating existing research, Unity/spatial audio and
  a PyQt6 debugging interface. Do not claim authorship of the underlying models.

Personal-project descriptions were checked against their current local READMEs
and the previous source review. RubyVR and Outfit Studio remain in development;
neither is described as a finished game or a fully verified renderer.
The Food Wars pantry screenshot uses fictional guest data. AVVR's image is
existing project footage. No internal-work screenshots or game-asset exports
were copied into this repository.

Do not restore the old site's unsupported adoption, production-quality,
recruiter-response or performance claims. Do not infer authorship from access
to a company repository. PowerFactory automation is not featured as an authored
project because its source credits a different baseline author; attribution
needs resolving before making a more specific contribution claim.

No phone number, visa history or internal hostname is included in the public CV.
Tailor a separate application CV where a particular employer needs more detail.

## Local checks

### Project islands and shared destinations

`src/data/projectWorlds.ts` connects project IDs to destinations. AVVR opens the
listening room (`#world/avvr`); PetBot and the FPV drone share the hardware
workshop (`#world/hardware/petbot`, `#world/hardware/fpv-drone`). The older bare
`#world/hardware` route still opens PetBot. Each project has its own picture
entrance and return destination; station links change notes and ease the camera
within the same world. Add future hardware to this workshop after verifying its
photos, contribution and notes.

`projectPortal.ts` owns the window preview and camera crossing. Both islands
are small procedural exhibits prepared in the existing browse scene. Entering
does not create a new engine, canvas or page. Separate camera layers keep the
other world out of the main render. Each frame has a cached, perspective-correct
render target. A preview refreshes only when nearby, facing the viewer and in
the active camera's view. At distant or grazing angles the original project
picture remains visible; approaching reveals the live window. The window
keeps its entrance action throughout, and its first render-target pass is
deferred until it has a useful view. Distant windows refresh at most 20 times per second,
nearby windows at most 60; crossing the frame uses the full render rate. Each
window also culls destination meshes to its own perspective frustum: Babylon
does not do this automatically for an explicit render list. Return windows
exclude the intervening wall with a clip plane. Idle worlds stop rendering.

The listening room illustrates source position with an opt-in Web Audio HRTF
tone. It is not an AVVR scan or Steam Audio simulation. The workshop's PetBot
is a stylised assembly based on the project's photograph, not measured CAD.
The FPV build uses its archived photo and 2023 diary; source details are recorded
in `_docs/hall-display-polish/fpv-sources.md`. Hover is an optional animation,
not flight physics, and stops when switching stations or returning to the hall.
Reduced motion displays a stationary raised model. A physical model/photo click
selects its station, with equivalent HTML navigation and controls.
The drone's camera, wiring and light strips also open component inspections.
`src/data/droneBuild.ts` holds short, attributed notes from the original 2023
build diary. These are descriptions of that build, not new simulation results.
Selecting a note lands the drone, highlights the relevant component and moves
closer. Text sits beside the viewer on desktop and below it on phones. Closing
or Escape restores the whole drone; another Escape returns to the hall.
Hover and Reset also leave inspection. Component batches retain their picking
metadata, and cached highlight materials are reused rather than recreated.
Keep those distinctions in the public labels. Do not substitute the old avatar
splat for a project scan. A real scan/model needs its actual asset, provenance,
license and a preload budget before it becomes an exhibit.

The listening room's main wall displays the original AVVR screenshot at its
native 16:9 aspect ratio. Its screen and caption open the same image viewer as
the project notes, retaining the selected source, camera view and reading
position when closed. Two acoustic panels frame the display. The timber reuses
the hall's scan; one unshadowed cove light is restricted to this island. Floor
pad outlines identify the selected source without continuous visual animation.
See `_docs/hall-display-polish/2026-09-23-avvr-display-review.md` for evidence and
pending owner checks.

Browser Back/Forward and Escape work with world routes. Notes remain readable
in map mode and when WebGL is unavailable. Reduced motion skips portal travel;
audio starts only from the Play button and closes on exit, hiding the tab, map
mode or unmount. These portals currently belong to the browse renderer; the
separate free-roam/WebXR experience has not gained portal travel.

Run `npm.cmd run check:portals` for coordinate transforms, off-axis perspective,
near/far-plane behavior and project-to-destination routes. In `?profile=1`, the
audit's `sceneId` should remain unchanged when crossing and returning. Verify
the actual frame pick, both return controls, orbit, audio Stop, map fallback,
small viewport and browser history in the UI as well.

### Reading focus and location

Scroll with hall remains enabled by default. The whole incoming section softens
together, including its heading, text, images and links. `sectionDefocus` in
`hallScroll.ts` clears the blur as the section moves from the bottom of the
reading viewport into its upper quarter. Opacity follows distance; the blur
stays at 2.5 px until a short clearing transition, avoiding a changing filter
radius on every scroll frame. Current and earlier sections stay clear.
There are no edge strips or nested per-card filters; completely offscreen
sections have no active filter layer. Keyboard focus restores clear text.
The toggle, reduced-motion and reduced-transparency preferences disable the
effect. The same behavior follows native page scrolling on small screens.
World controls use a tinted background without filtering the animated canvas.

Mouse and pen visitors can drag the browse view to look around from the same
place. Sensitivity follows the camera's field of view and canvas height; the
gesture has no inertial spin. Reset view restores the guided direction, as does
ordinary gallery scrolling or choosing another exhibit. Escape resets a look
on an overview. On an exhibit opened from a walk, it resumes that walk;
otherwise it returns from project to gallery or island to hall. Walk around
inherits the actual direction being viewed.

`browseLook.ts` distinguishes a click from a drag, releases pointer capture on
cancel/blur/disposal, and keeps the engine's delayed release pick suppressed
until the next gesture. Touch keeps native scrolling. Island orbit controls,
embedded apps and image dialogs own their input independently. The controller
reuses the render loop and stops requesting draws when the view settles.
Island orbiting has lower inertia and gentler mouse sensitivity, so a short
drag stops before coasting behind the room's edge screens.
Run `npm.cmd run check:look` for geometry and input-lifecycle checks; runtime
release, portal, walking and responsive checks are in
`../_docs/hall-display-polish/2026-09-23-browse-look-review.md`.

The public availability line is Liverpool / remote-first. Contact and CV
mention Liverpool/Manchester for hybrid work. Keep the actual CV location
distinct from preferred working arrangements, and don't publish every private
exception as a location restriction.

### Environment and floor plan

`src/data/hallLayout.ts` defines the decks, connecting bridges, five visitor
stops and gallery spacing. Both the 3D environment and the 2D floor plan use
this data. Add project records in the usual content file; the framed exhibits
and numbered map directory update from those records.

The pavilion geometry lives in `src/3d/scene.ts`, with materials and lighting
in their adjacent modules. Static architectural details are batched by material.
The wall-side roof has a timber lining; the water side remains a cutaway for
the browse camera. Column shoes, bearing blocks, wall-mounted picture fittings
and paving borders reuse the existing material batches. Adding actual lights
or a new material also adds runtime cost; check it before extending the scene.
The walkable decks must remain pickable for WebXR teleportation. Timber bridge
tops sit 35 mm below stone to prevent overlapping surfaces from flickering.

`HallMap.tsx` supplies room links, individual exhibits, experience markers and a
current-view indicator. The desktop directory scrolls independently of the
reading panel; its `data-hall-scroll="native"` container is excluded from the
hall's wheel forwarding. Its compact mobile plan uses room navigation; the full
exhibit list remains in the reading panel. The map works without loading Babylon.
Run `npm.cmd run check:hall` after changing the layout or adding projects: it
checks walking continuity, stop positions and enough space between frames.

The browse renderer follows the display's animation frames during camera travel
and visible logo animation, then stops scene rendering when the view settles.
Texture/image completion must set `scene.metadata.needsRender = true` so content
arriving after the initial warm-up still appears. Static shadow casters exclude
the animated logos and printed label faces. The still-water render targets refresh
when the camera or projection changes, capped at 30 Hz in browse and free roam;
camera motion itself retains its normal rate. XR retains continuous water passes.

### Walk-around controls

`locomotion.ts` supplies shared, time-based movement and jump integration for
keyboard and touch. Keyboard movement requires canvas focus or pointer lock;
blur, release and disposal clear inputs. Mouse look uses Babylon's mouse input.
Teleport travel is short, interruptible and at eye height, facing the chosen
exhibit. Gallery viewing distance adapts to the camera's field of view and
aspect ratio, leaving room for the picture, its plaque and touch controls.
An exhibit jump returns focus to the canvas so movement and E work immediately,
unless the visitor has moved focus to another control during travel.

Inspect chooses a nearby exhibit in the direction the visitor faces, rather
than offering the nearest one behind them. `exhibitViewing.ts` keeps this to
vector comparisons; it does not raycast for occlusion. Run
`npm.cmd run check:navigation` after changing approaches, gaze selection or
walk-entry positioning.

Mobile controls follow the actual viewport orientation without rotating the
page. They provide a direction pad, drag-to-look area, native exhibit selector,
Inspect and a Portfolio return button. Tilt look remains opt-in. Inspecting
opens a focused dialog and pauses the scene; dismissing it restores focus
without automatically taking pointer lock. The dialog separates the summary,
contribution and links; status details expand on request. Its Close button
stays above the scrolling body, with the main project links below it, and
Tab/Shift+Tab remain inside the dialog. Project inspectors reuse the original
images, galleries, alternative text and captions from the project records.
Images can be enlarged and inspected at actual size without leaving the walk.
Escape closes the image viewer first, then the inspector; if a resize replaced
the original control, closing the inspector focuses the walking canvas.
Experience dialogs show the organisation, dates and role separately.

AVVR, PetBot and FPV inspectors also link directly to the listening room and
hardware workshop, with the same descriptions used by the project pages.
Opening notes, an island, a live app or an experience from an inspector saves
the current walking position and gaze. Back to walk, Escape in the portfolio,
and browser Back to the walking route restore that pose. The embedded app's
toolbar has the same return control; keyboard input inside an iframe remains
owned by that app. The physical island return portal still opens the project's
notes, where Back to walk remains available.

This bookmark lasts for the current in-page visit. Choosing the gallery,
overview or CV ends it, while Walk here deliberately starts from the displayed
exhibit. Refreshing does not persist a saved walk. Walking and browsing still
use separate scenes that are disposed and rebuilt on mode changes; this return
path does not keep a second renderer running or make scene loading seamless.

Run `npm.cmd run check:movement`
for frame-rate and heading math. Physical mouse/touch, collision feel and gyro
acceptance still require device testing.

For a short local measurement, start Vite and open `/?profile=1`. The optional
audit panel measures actual scene renders (not just requestAnimationFrame calls).
`Sample project scroll` repeats the gallery sweep and `Sample section transition`
measures the Work-to-Projects blur transition. Portal pass counts and the Portal
previews switch help isolate the additional camera work. Manual samples cover
entry, return and interaction; frame intervals that span idle time are not an
active-animation frame-rate measurement.
Leave "Keep renderer awake" off to check idle behavior; turn it on to compare
per-frame cost at a fixed camera. It is excluded from production builds. Record
renderer, canvas resolution, view and animation state with any reported numbers.

```powershell
npm run check:portfolio
npm run check:hall
npm run check:logos
npm run check:scroll
npm run check:movement
npm run lint
npm run build
npm run dev
```

The build checks links between portfolio pages, required project fields, local
image files and the initial JavaScript size. It does not establish live demo
availability or project acceptance. Check the rendered site on desktop and
mobile, open a project and use Back, read the CV, and try Print / save as PDF.

The current deployment's canonical URL was observed as
`https://new.muhammadhazimiyusri.uk/`. Update the metadata in `index.html` if the
domain changes. Pushes to `main` deploy automatically through GitHub Pages;
review the content and the site before merging there.

### Work in progress — 21 September 2026

The recent requests and current limitations are tracked in
[GitHub issue #42](https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall/issues/42).
See `../_docs/hall-display-polish/2026-09-21-backlog-and-local-state.md` for the
local build, browser findings and Impeccable reference assessment.
The follow-up `../_docs/hall-display-polish/2026-09-21-controls-and-scroll-review.md`
records the controls/scroll fixes, measurements and pending user checks.
The later `../_docs/hall-display-polish/2026-09-21-visual-and-copy-review.md`
records the frame, architecture, directory and copy changes.
`../_docs/hall-display-polish/2026-09-21-island-interaction-review.md` records the
workshop batching, island control layout, camera reset and phone station-switch
fix, including matched-canvas measurements and pending device checks. The owner
requested one combined PR after returning to the PC; these passes leave GitHub
issues, commits, PRs and deployment unchanged.

Public deployed apps can declare `liveApp: { url }` on their project record.
The draft `#app/<id>` route mounts one browser panel, with direct links on
the 2D card and case study. `#gallery/<id>` resumes browsing near the project.
Gallery return now shares the active-card alignment and has passed local
Chromium checks. Reload, Expand/Restore and direct-open controls remain available
whether the frame is loading, blank or interactive. Expansion keeps the same
iframe alive. A direct `#app/<id>` entry defers the hall renderer until the
visitor returns; an already visited hall stays mounted and suspended. Hidden
map links are removed while an app is open, and route focus goes to Gallery.
Cross-origin app content cannot reliably send Escape or disclose its loading
failures to the parent page, so visible close and direct-open links must remain
available. A frame load event is not proof of a working application.

`../_docs/hall-display-polish/2026-09-21-live-app-review.md` records the current
app workflow evidence and limitations. For a repeatable local check, start Vite
and open `/tools/fixtures/live-browser.html`. Its counter and blank document
exercise state preservation, Reload and recovery without third-party requests.
These fixtures are outside the production entry and public assets.

Visitor boats and the guestbook have an opt-in local preview. Start
`npm run community:local`, then use `?community=local` on the loopback hall URL.
The unconfigured public build makes no community requests. No real analytics,
shared note wall or domain migration is live.

The guestbook at Contact includes a 28-day chart and exact daily counts. Boats
show at most 12 recent browser sessions by country and last section; this is
neither an online-user count nor unique-person tracking. Their geometry and
the visitor ridge remain static between data changes. The two merged fleet
meshes use the water's existing cached reflection/refraction targets, without
new render targets or shadow passes. Updating or removing the fleet invalidates
that cache once. Zero visits produce no skyline. The 3D board shows excerpts
of five notes plus a blank writing card; the 2D guestbook shows up to 12 complete
approved notes. The board uses three static batches and one mipmapped text
atlas. `#guestbook` opens the notes directly; `#guestbook/write` opens the writing
field. Walking visitors can read and write in a modal without leaving their
position. Drafts are retained in tab storage, and a pending send/reply survives
switching between walking and browsing. Network failures do not erase drafts.

See `../_docs/hall-display-polish/2026-09-22-visitor-preview-review.md` for local
acceptance evidence and `../community/README.md` for service setup and deployment
limits. `npm run check:community` checks the service and bounded client data.
The development-only `/tools/fixtures/visitors.html?profile` uses explicitly
synthetic data to check the 12-boat maximum, geometry disposal and idle rendering.
Public deployment still needs configuration, owner moderation and abuse controls.

Visitor boats have submerged hulls, wooden seats and deterministic variations
in heading and placement. Their opaque parts remain one vertex-colour batch;
flags share a second batch and a 512-pixel atlas. Only the countries present
in the bounded visitor list load flag SVGs, from `public/flags/`. That folder
contains the original flag-icons 7.3.2 assets, license and source hashes. Unknown
countries keep a dash; asset failures keep the country code. Late flag callbacks
cannot update a disposed or replaced atlas. No flags load on the unconfigured
public site. See `../_docs/hall-display-polish/2026-09-23-waterfront-review.md`
for the current build, visual checks, performance tradeoff and pending owner review.

`../_docs/hall-display-polish/2026-09-23-guestbook-review.md` records the pinned
note board, direct reading/writing actions, modal focus and pending-send checks.
The development-only `/tools/fixtures/guestbook.html` lets a reviewer complete
or fail a simulated request after closing the book; it makes no service calls.
Browsing no longer focuses/scrolls its canvas when an exhibit is picked, and
its pointer observer does not consume a rapid second selection as a double tap.

The water-facing visitor ridge now follows the gallery's long side. Daily crest
heights remain linearly proportional to recorded visits; smooth interpolation
does not overshoot, and empty days stay below the water. A static transect marks
each nonempty day. The physical ends taper below water outside the dated graph.
Its upward surface normals, shared cached reflection and the layered distant
shore replace the dark ribbon previously visible behind Contact.

The decorative shore now uses reduced elevation samples around Rùm, Eigg
and Canna, rearranged and scaled into fictional scenery. Real coastal outlines
and relief replace the repeating sine-wave hills. Sky occlusion is baked into
the asset offline; the three static meshes retain the 24,576-triangle budget.
One shared self-hosted CC0 Rocky Terrain colour texture adds rock/ground detail
(905,179-byte download, plus decoded texture memory). No new shadow pass,
render target or continuous animation is added. The separate visitor ridge
still represents actual recorded daily counts. Source credits and modifications
are in `public/terrain/README.md` and the footer's Scene credits page.
The current build and local checks are recorded in
`../_docs/hall-display-polish/2026-09-23-terrain-relief-review.md`.

The 3D hall loads one original, self-hosted 1K Poly Haven CC0 sky panorama
(1,173,154 bytes). `public/sky/README.md` records its authors, source and checksum.
It uses a 256-pixel cube with mipmaps, no irradiance or prefiltering, and material
tone mapping limited to the sky. A gradient provides the immediate/failure
fallback. No new render target or continuous animation was added. This adds
texture memory and a one-time HDR decode; it is not a zero-cost visual change.
The initial document still loads independently of the 3D hall.

See `../_docs/hall-display-polish/2026-09-23-landscape-review.md` for the current
build and checks. The development-only `/tools/fixtures/landscape.html` exposes
gallery/terrace viewpoints and full/one-day/empty synthetic data for review.

Gallery picture lights use a single baked wall lightmap and a shared lit
diffuser material. Soft frame/label contact shadows share one small texture
and one mesh; they add no shadow pass. Opaque frame backings also participate
in the hall's existing cached sun shadow. Four border pieces are now merged
per frame, preserving each project's highlight and picking. Label backings
share the image backing's draw. Artwork and labels use mipmaps with anisotropic
filtering for oblique views; the 2D image viewer retains the original images.
This lowers draw submissions while adding texture memory, documented in
`../_docs/hall-display-polish/2026-09-23-gallery-lighting-review.md`.

The map now distinguishes the current place with a copper route and diamond,
and places the marker at the selected experience pedestal. Hover or keyboard
focus previews an exhibit without opening it. The directory reveals its own
selected row without scrolling the document. Phones and short browser windows
use a native project-and-role selector; narrower tablets use a horizontal plan
above a readable list. Visitor symbols have a legend and sit beyond the room
labels. These changes add no continuous rendering loop. See
`../_docs/hall-display-polish/2026-09-23-map-wayfinding-review.md` for the build,
responsive checks and pending owner review.

Walk mode has a labeled directory that opens at the current part of the hall,
highlights and reveals the nearby exhibit, and closes after selecting a place.
Escape restores focus to its toggle. The route strip previews named destinations
on hover or keyboard focus; Left/Right/Home/End change the preview and Enter
travels. A grouped exhibit/help panel avoids overlap in narrow desktop windows.
The phone controls retain their separate layout and use concise company names.
Changing between desktop and phone scrolling during a gallery return now
preserves the pending destination. See
`../_docs/hall-display-polish/2026-09-23-walking-wayfinding-review.md` for the
reproduction, repair, current build and pending browser/device checks.

The experience reading panel leads with each role, followed by the existing
description and tools. Dates and smaller organisation marks sit along a simple
chronological rail. TNEI links directly to both public work notes; the role,
dates, employer descriptions and CV content still come from the existing records.
The display selector has at least 44 × 44px targets, and each overview display
link names its organisation for assistive technology. See
`../_docs/hall-display-polish/2026-09-23-experience-reading-review.md` for the
compiled build, phone-width review and pending owner checks.

Switching between the map and scene during a gallery return also preserves
the pending exhibit. On phones the map changes the height of the sticky stage;
the reading anchor is recalculated after that layout change instead of letting
the previous row become selected. Project notes retain their reading position.
See `../_docs/hall-display-polish/2026-09-23-project-index-review.md` for this
pass's compiled build, responsive checks and portal measurements.

Idle company-logo motion wakes the browse renderer only when a logo is inside
the camera's view. Its mesh reference is cached after the image-based geometry
loads. Camera travel and interaction still wake the scene independently, so
returning to an experience display remains responsive. This removes continuous
drawing beside the last gallery frame when the nearby logos are offscreen.

Walking also stops drawing once the camera and visible exhibits settle. Input,
travel, resizing, asset/data updates and returning from an inspector wake it.
Nearby visible logos use a 30 Hz idle cadence; turning and walking retain the
display cadence, and XR remains continuous. Distant/offscreen logos do not keep
the walking renderer awake. Slideshow intervals can sleep between fades.
Phone Inspect actions respect the narrower field of view, and dragging the look
pad cannot select its guidance text. The measurements, compiled preview and
pending physical-input checks are in
`../_docs/hall-display-polish/2026-09-23-walk-idle-review.md`.

The hardware workshop shares the hall's original scanned wood texture, with
grain following the bench and shelf. A single local, unshadowed task light
illuminates the work area; its layer filter keeps it out of the hall and
listening room. PetBot's contact shadow now sits above its cutting mat rather
than inside it, and the mat has a visible square grid. The comparison, rendering
cost and pending visual/device review are recorded in
`../_docs/hall-display-polish/2026-09-23-workshop-materials-review.md`.

Focused project frames now use mounted Previous/Next signs with the neighbouring
project names. The project viewpoint leaves room for both signs, while HTML
arrows remain the main controls on phones and for keyboard users. The two sign
textures are reused and repainted only when their content or hover state changes.
See `../_docs/hall-display-polish/2026-09-23-exhibit-signs-review.md` for the build,
navigation checks, idle sample and pending owner review.

The browse renderer now uses the same per-logo update deadlines as walking:
gentle idle motion requests about 30 updates per second and tracked logos can
settle. Island returns use the hall's project-view function instead of a second
fixed camera pose, including the current workshop station. The return-path
checks, compiled interaction review and before/after rendering samples are in
`../_docs/hall-display-polish/2026-09-23-motion-return-review.md`.

PetBot and FPV now have separate doorway positions into the same hardware
workshop. Each hall frame previews its own station; entry and return use that
same position, including after switching stations inside the workshop. The
existing scene and render textures are reused. The compiled framing and
interaction checks are in
`../_docs/hall-display-polish/2026-09-23-workshop-doors-review.md`.

The map now consolidates its toolbar and includes project spaces in the
directory, giving the laptop drawing and directory 310px instead of 208px.
Island links in map mode open their 3D view directly, including links in the
project notes. The embedded-app viewer loads on demand with recovery controls
while loading or unavailable. Compiled checks and the unresolved EEE Roadmap
iframe-loading observation are recorded in
`../_docs/hall-display-polish/2026-09-23-map-composition-review.md`.

Workshop Previous/Next and keyboard arrows now stay inside the current project
space, with a matching exhibit count. Reading navigation preserves focus and
reveals the new notes on phones; station links keep the island in view. Walk here
uses the current view, and Escape closes the active walk layer before returning
to the portfolio. The interaction audit and pending physical-input checks are in
`../_docs/hall-display-polish/2026-09-23-interaction-continuity-review.md`.

The hardware workshop now has a timber-lined canopy, side screen and tiled
platform, using the hall's existing material sources and sky panorama. The
canopy fades into a cutaway when orbiting above the exhibits, then returns at
eye level. Its columns clear the flight pad, and the original drone photograph
sits beside the bench. The final build, inspection checks, rendering comparison
and pending owner review are recorded in
`../_docs/hall-display-polish/2026-09-23-workshop-canopy-review.md`.

AVVR's model-label key now lets visitors highlight individual predicted classes
against a neutral, opaque view of the remaining geometry. All, reset and Escape
restore the full palette, with a second Escape returning to the hall. The source
labels and colours are preserved; this does not change the archived prediction.
Project-island controls load separately from the opening page. Checks, rendering
evidence and pending owner review are recorded in
`../_docs/hall-display-polish/2026-09-23-avvr-prediction-review.md`.

Embedded apps now show loading and recovery actions in the viewer itself,
including help that remains available after an empty document reports loading.
Help and resizing preserve the live iframe; explicit retries reload it. Focus
and Escape follow the active layer. External loading remains intermittent:
EEE Roadmap eventually loaded and retained its internal Tools page, after
several blank-frame attempts. The build, responsive checks and pending owner
review are in
`../_docs/hall-display-polish/2026-09-23-live-app-recovery-review.md`.

For the 26 September public release, the AVVR room reconstruction and reference
panorama remain in the ignored `_local/avvr-archive/` folder. The S3A dataset's
access terms prohibit redistribution. The public island therefore opens the
original spatial-audio illustration and project screenshot, with no archive
controls or raw dataset requests. The local archive tools and dated research
reviews remain available; they do not describe the published presentation.
`check:portfolio` also prevents those restricted files entering the public build.
See `../_docs/hall-display-polish/2026-09-26-release.md` for the release checks and
remaining device and owner acceptance checks.
