# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- v1.8.0: 3D self-portrait (iPhone LiDAR scan, low-poly mesh + gaussian splat toggle)
- v1.9.0: Rich project displays (3D slideshows, per-project gaussian splats)
- v2.0.0: Interactive web panels, full content polish, launch-ready
- v3.0.0: AI integration (backlog)

---

## [1.7.0] - 2026-03-01

### Added
- GLB asset import pipeline using Babylon.js `ImportMeshAsync` with `@babylonjs/loaders/glTF` plugin
- Asset manifest system (`src/3d/assetManifest.ts`) with typed `AssetEntry` and `AssetPlacement` configs for all decoration placements
- Procedural fallback geometry when `.glb` files unavailable (`fallbackType: 'box' | 'cylinder' | 'none'`)
- Shared material system extracted to `src/3d/materials.ts` (`SceneMaterials` type, `createSceneMaterials(scene)` factory)
- Material mapping modes on `AssetEntry`: `keep` (use Blender PBR), `remap` (replace with `SceneMaterials`), `hybrid` (adjust colour/PBR, preserve UVs)
- Shadow casting/receiving for loaded assets wired through placement config
- Invisible box/cylinder collision proxies for loaded assets (`collision`, `collisionSize` on `AssetEntry`)
- `AssetLoadStat` type + `assetLoadStats: Map<string, AssetLoadStat>` module-level export tracking per-asset status, triangle count, material count, and load time
- `reloadAllAssets(scene, options)` — dispose all managed roots and re-run `loadAssets` without page refresh
- `toggleAssetFallback(scene, assetId, options)` — in-place A/B switch between GLB and procedural fallback
- Asset hot-reload dev shortcut (`Ctrl+Shift+R`) in `BabylonScene.tsx`
- Dev-only `AssetDebugOverlay` React component (`src/3d/assetDebug.tsx`) with live FPS, triangle count, per-asset status table, and A/B toggle buttons; eliminated from production bundle via `import.meta.env.DEV` dead-code elimination
- `glbMimePlugin` in `vite.config.ts` — serves `.glb` files with `Content-Type: model/gltf-binary` in dev server
- Blender export guide (`docs/BLENDER_GUIDE.md`) — settings, scale, origin, budgets, palette, naming, testing workflow, dev iteration loop
- Asset specifications for first batch (`docs/ASSET_SPECS.md`) — pillar-ornate-01, doorway-arch-01, molding-crown-01, throne-reception-01
- `throne-reception-01` manifest entry with `fallbackType: 'box'` (1 × 1.5 × 1 m placeholder), `materialMode: 'remap'`, `collision: 'box'`, placed at Reception centre
- `public/assets/models/test-cube.glb` — KhronosGroup Box.glb proves end-to-end pipeline at reception pillar position

### Changed
- Materials refactored from inline `scene.ts` private functions (~90 lines removed) to shared `materials.ts` module
- `createCastle(scene, mats)` now accepts `SceneMaterials`; all zone builders propagate shared material instances
- `createFallback` in `assetLoader.ts` prefers shared `sceneMaterials.teak` over creating new `StandardMaterial` instances
- `.gitignore` — added comment section explaining GLB commit policy (committed directly, ≤ 5 MB, Git LFS fallback)
- `BabylonScene.tsx` — `loadAssetsOptionsRef` stores `LoadAssetsOptions` for stable keyboard handler access; `showDebugOverlay` state; dev-only keyboard effect for backtick and `Ctrl+Shift+R`

### Removed
- Inline material creation in `scene.ts` (moved to `materials.ts`)

---

## [1.6.0] - 2026-02-25

### Added
- Rebuilt 2D fallback mode as scroll-based spatial portfolio
- Hero section with animated teak & gold theme
- Illustrated SVG castle map with zone navigation and scroll sync
- Story-driven project cards with challenge/approach/outcome narrative
- Experience vertical timeline with teak & gold styling
- Skills categorized tag groups and hackathon cards
- Mobile map overlay (floating button → fullscreen)
- Scroll reveal animations (fade-in, slide-up)
- Card hover/expand micro-interactions
- Desktop sticky map panel with active zone highlighting
- Click POI dot on map scrolls to and highlights specific card
- POI type: added storyHook, challenge, approach, outcome optional fields

### Changed
- 2D mode completely redesigned from sidebar+floorplan to scroll portfolio
- Project cards prioritize story hooks over tech stack lists
- Mobile layout: single-column scroll replacing sidebar+grid
- Desktop layout: sticky illustrated map + scrollable content

### Removed
- Old sidebar section filter navigation
- Old SVG floor plan component
- Old flat card list layout

---

## [1.5.1] - 2026-02-24

### Added
- Dynamic player-centered minimap: viewBox always centered on player; zoom level calculated from the 3 nearest POIs so the map stays tight and useful rather than showing the entire castle at a fixed scale
- `computeDynamicVB` algorithm: finds 3 nearest POIs by Euclidean distance, expands bounding box to fit all 3 from player with 1.5-unit padding; halfW/halfH clamped to min 4 (8×8) and max 15 (30×30) to prevent over-zoom or under-zoom; viewBox edge-clamped to castle SVG extents
- `getZoneForPosition` helper: determines which named zone the player occupies from world coordinates; displayed as a subtle label in the top-left corner of the minimap
- Smooth viewBox transitions: RAF loop lerps `currentVB` toward `targetVB` at α = 0.10 per frame (~60fps); target updates at ~10fps with player position; snaps when delta < 0.01 to stop unnecessary re-renders
- Full map toggle button (`⊞`/`⊡`) inside the minimap (bottom-right corner, gold-trim style); switches between dynamic zoom and full castle view without resizing the minimap panel
- Viewport indicator: when in full map mode, a dashed gold rectangle marks the area the dynamic zoom would currently show
- POI visibility filtering: in dynamic zoom mode, only POI dots within the current viewBox bounds are rendered; full map mode shows all POIs as before
- Current zone label: player's current zone (`Main Hall`, `Courtyard`, `Reception`, `Garden`) displayed in the minimap top-left corner; hidden when transitional
- Direction arrow scaling: triangle size scaled by `vbW / 44` (clamped 0.25–1.0) so the arrow stays proportional at all zoom levels

### Changed
- Minimap container is now fixed at the "expanded" size (`w-80 h-80` desktop / `w-56 h-56` mobile) in all non-collapsed states — the dynamic zoom provides the previously size-based distinction
- Removed the external `[-]`/`[+]` expand toggle button; full map toggle is now the `⊞`/`⊡` button inside the minimap corner
- `useMemo`-based `smallViewBox` replaced by ref-based animated viewBox driven by the RAF loop
- `expanded` state replaced by `fullMap` (default `false` — dynamic zoom is the default)
- Version bumped to v1.5.1

---

## [1.5.0] - 2026-02-23

### Added
- WebXR immersive-VR session via Babylon.js `WebXRDefaultExperience`; "Enter VR"/"Exit VR" button (teak & gold, `bg-hall-accent`) rendered only when `navigator.xr.isSessionSupported('immersive-vr')` resolves true — invisible on non-XR devices
- `local-floor` XR reference space; XR rig spawns at player's current x,z; head height tracked by headset; all DOM overlays (sidebar, minimap, mobile controls, POI hint) hidden on VR enter and restored on exit; keyboard/mouse/touch input disabled during VR session
- VR locomotion: left thumbstick smooth walk via `WebXRFeatureName.MOVEMENT` (head-relative, 0.2 dead zone, wall/POI collisions active); right thumbstick forward parabolic teleport arc with gold landing ring (floor meshes only); right thumbstick L/R 45° snap turn with 300 ms vignette flash
- Hand tracking via `WebXRFeatureName.HAND_TRACKING`; default Babylon.js joint meshes render both hands; right pinch (thumb ↔ index < 3.5 cm, 5 cm hysteresis) fires `onVRSelectAttempt`; right index-finger direction EMA-smoothed (α = 0.3) for ray casting; gaze teleport via XR camera forward ray + gold disc preview (`#CA9933`, α = 0.75) + left-hand pinch confirm; graceful controller ↔ hand switching via `onHandAdded/RemovedObservable`
- VR POI hover: per-frame ray cast (controller aim first, hand index-finger fallback); `HighlightLayer` gold glow (`#CA9933`) on hovered mesh and all children; billboard `DynamicTexture` label 2.2 m above mesh; 10 m distance cap prevents accidental far picks
- VR inspect panel (`src/3d/vrUI.ts`): 1.4 × 0.9 m teak-and-gold floating plane 1.5 m in front of player at chest height; content via `DynamicTexture` (title in gold, word-wrapped description, tag pills with gold borders, link buttons); no DOM involved — fully parallel to the desktop modal
- Panel close: B button (right controller) / Y button (left controller); or trigger/pinch while pointing at the "✕" plane (0.09 m square, top-right corner of panel)
- Link queueing: `pendingLinks` array in `BabylonScene.tsx` collects URLs during VR session; `Array.splice(0).forEach(window.open)` drains and opens all queued URLs in new tabs on `WebXRState.NOT_IN_XR`
- VR FPS counter HUD (`createVRFpsCounter`): 0.22 × 0.07 m plane parented to XR camera (top-left FOV, 55 cm from eye); updates every 30 frames; green ≥ 72 fps / gold ≥ 60 fps / red < 60 fps; toggle with left-controller Y button
- Locomotion vignette: persistent `Layer` overlay fades to 0.4 alpha while smooth-walk thumbstick is active, fades out on release — softer than the 0.7 alpha snap-turn flash
- VR lighting optimisation on session entry (`applyVRLighting`): `blurScale` halved on both shadow generators (2 → 1); all painting `SpotLight`s disabled; ambient intensity raised to 0.55 to compensate; fully restored on session exit
- Seated mode (`setupSeatedMode`): left-controller X button toggles +0.7 m Y offset on XR camera rig so seated players (eye height ~0.9 m) see the scene at standing-equivalent scale; offset does not conflict with per-frame head tracking
- Controller button handler (`setupVRMenuButton`): polls left controller gamepad each frame with rising-edge detection (Quest Pro: Y = `button[4]`, X = `button[3]`); Y fires FPS toggle and panel-close simultaneously; X toggles seated mode
- `isInVR: boolean` field added to `CameraRefValue`; camera `onBeforeRenderObservable` skips all input when `isInVR` is active; unmount guard prevents state updates after component disposal

### Changed
- Painting canvas center lowered from Y = 2.0 m to Y = 1.65 m (bottom 1.15 m, top 2.15 m) — within 1.4–1.7 m VR eye-level target; spotlight at Y = 3.2 m still illuminates canvases correctly
- `_flashVignette` in `src/3d/webxr.ts` renamed to `flashVignette` and exported so `vrInteraction.ts` can reuse it for the hand-teleport vignette flash
- Version bumped to v1.5.0

### Verified (no geometry changes needed)
- Snap turn: 45° increments with vignette flash — working since slice 2
- Door clearances: 3 m wide, 4–5 m tall full-room openings — comfortable for standing VR
- VR inspect panel text: 52 px title / 26 px description at 1.5 m viewing distance — legible

---

## [1.4.0] - 2026-02-20

### Added
- Multi-zone castle layout: Reception (entrance foyer), Courtyard (open-air hub), Main Hall (project gallery), Garden (greenhouse for skills/hackathons)
- 20 real POIs populated from CV data (projects, experience, skills, hackathons, about, contact)
- `Zone` type system (`reception`, `main-hall`, `courtyard`, `garden`) with `zone` field on each POI
- `POISection` extended with `experience` and `hackathons` categories
- Castle zone geometry: stone courtyard with fountain, glass-walled garden, teak main hall with molding, pillared reception
- Gold doorway frames at all zone transitions
- Procedural skybox with gradient sky (deep blue → warm gold) and cloud wisps
- `DirectionalLight` sun (intensity 0.8, warm golden) with 2048px shadow generator
- Zone-aware indoor lighting for Reception and Main Hall
- Scene ambient color set to warm gold tint
- Unique placeholder thumbnails per painting: title-hashed background colors (gold, teak, batik red, forest green, slate blue, burgundy) with large serif initials
- Multi-zone minimap showing all 4 zones as colored rects with gold doorway connectors
- Multi-zone floor plan (2D fallback) with zone labels and expanded viewBox
- Sidebar navigation grouped by zone (Reception, Courtyard, Main Hall, Garden) instead of section
- SEO meta tags: description, author, theme-color, Open Graph (title, description, type, url, image), Twitter Card
- Fallback mode sidebar includes `experience` and `hackathons` section filters

### Changed
- `createHall()` replaced with `createCastle()` returning `{ grounds, allWalls }` for multi-zone geometry
- `createLights()` signature updated to accept `CastleGeometry` instead of single ground mesh; all zone grounds receive shadows
- Camera spawn moved from `(0, 1.6, 5)` to `(0, 1.6, 16)` inside Reception, facing north toward Courtyard
- Minimap viewBox expanded from `'-10 -9 20 18'` to `'-22 -24 44 44'`; teleport bounds expanded for full castle
- Minimap container height increased for square aspect ratio in expanded mode
- FloorPlan viewBox expanded to match new castle layout with zone labels
- Crown molding material now has subtle emissive glow
- Version bumped to v1.4.0

### Removed
- 5 placeholder POIs with dummy content (replaced with 20 real POIs)
- Single-room hall geometry (replaced with 4-zone castle)
- Section-based sidebar grouping (replaced with zone-based grouping)

### Fixed
- Lighting too dark — ambient intensity increased from 0.15 to 0.30, scene ambient color brightened, indoor light intensity increased from 0.5 to 0.7, ceiling materials brightened
- 4 Main Hall paintings floating near south entrance (z=-9.8) — moved to north wall (z=-21.8) and reorganized all 10 paintings across north/west/east walls
- Minimap teleport clamp bounds not covering full castle extent — expanded to match zone boundaries

---

## [1.3.1] - 2026-02-20

### Added
- Ceiling mesh closing the hall from above
- Doorway gap in south wall (2-unit opening)
- Baseboards along all walls using `hall-frame-light` color
- Gold crown molding along all walls using `hall-accent` color
- 4 decorative corner pillars (3-part: base, shaft, gold capital)
- Procedural wood grain bump texture on floor via `DynamicTexture`
- Gold painting frames (4-bar beveled geometry) around each painting POI
- Thumbnail textures loaded onto painting canvases from POI data
- Fallback `DynamicTexture` with title text when thumbnail is missing/fails
- Display case mesh: teak base platform + gold trim ring + transparent glass box (alpha 0.25)
- Pedestal mesh: 3-tier cylinder (wide base, column, gold top platform)
- Shared material system for POI meshes (frame, teak, teakLight, glass)
- `DirectionalLight` with `ShadowGenerator` (1024, blur exponential) replacing `PointLight`
- Per-painting `SpotLight` positioned above and angled down for gallery illumination
- Gold-tinted `PointLight` accents near display cases and pedestals (range-limited)
- Ground receives shadows from POI meshes
- Loading screen progress bar with `hall-accent` fill and stage labels
- Loading progress milestones reported from `BabylonScene` (engine → scene → textures → ready)
- Fade-out transition overlay when loading completes

### Changed
- Floor material updated from flat dark brown to `hall-surface` with specular sheen and bump map
- Wall material updated from purple-gray to `hall-frame` (dark teak) with subtle specular
- POI placeholder pink/red materials replaced with themed gold, teak, and glass materials
- Hemispheric ambient light intensity reduced from 0.4 to 0.3, warm diffuse, `hall-surface` ground color
- Main light changed from `PointLight` to `DirectionalLight` for shadow support
- `createLights` signature updated to accept ground mesh and POI mesh map
- `createHall` now returns `{ ground, walls, ceiling }` for shadow receiver setup
- Loading screen upgraded from simple spinner to spinner + progress bar + stage text
- Version bumped to v1.3.1

### Removed
- Single pink/red `StandardMaterial` applied to all POI types (replaced with per-type materials)
- Simple `PointLight` ceiling light (replaced with `DirectionalLight` + spotlights)

---

## [1.3.0] - 2026-02-19

### Added
- Javanese/Malay royal hall "Teak & Gold" color palette (8 semantic tokens in tailwind.config.js)
- Cinzel serif font for headings and titles via Google Fonts
- Inter font explicitly loaded via Google Fonts (weights 400–700)
- CSS `.wood-texture` class with layered gradient wood grain effect
- CSS `.gold-trim` class for reusable gold border styling
- Theme section in README documenting design system

### Changed
- Welcome screen: gold Cinzel title (larger), gold primary button with dark text, gold-outlined secondary button, decorative gold separator
- Game Boy portrait console frame: gray shell → carved teak wood (`wood-texture`) with gold trim border
- D-pad buttons: dark gray → dark wood tones, gold arrows on press, gold center dot
- A button: magenta (#9B2257) → batik red (`hall-accent-warm`), B button → lighter teak wood (`hall-frame-light`)
- Toggle switches: inactive gray → wood tones, active gold; label text uses parchment shadows
- TopScreen: gray background → wood-texture, green-tinted screen → warm dark, all SVG colors updated to gold/wood palette
- Fallback mode sidebar: solid background → wood-texture, gold "Balairung" heading
- Fallback POI cards: muted border → gold-trim class
- Fallback inspect modal: added gold-trim, tags use `hall-frame` background
- 3D sidebar: solid background → wood-texture panel with gold accent border
- Nipplejs joystick color: magenta → gold
- All `text-white` on gold buttons → `text-hall-bg` for consistent dark-on-gold contrast
- All hardcoded gray/blue values replaced with semantic `hall-*` tokens

### Removed
- Generic dark blue (#1a1a2e) and red (#e94560) placeholder theme colors
- Gray Game Boy shell colors (#8a8a8a, #9a9a9a, #7e7e7e)
- Hardcoded magenta button color (#9B2257)
- Green-tinted minimap colors (#3a5a3a, #6a8a6a, #5a7a5a, #8ab88a)

---

## [1.2.1] - 2026-02-18

### Added
- GTA-style cinematic fly-to animation: 3-phase rise → overhead pan → descend (`flyToCinematic`)
- Simple direct fly-to for short distances < 3 units (`flyToSimple`)
- Minimap POI click teleports to approach position (2.5 units in front), not directly onto POI
- POI labels on minimap (both TopScreen minimap and standalone Minimap)
- "Exit 3D" button in portrait TopScreen, desktop top-right, and landscape mobile top-right
- Game Boy 3DS-style portrait layout: gray console frame, top screen with minimap + nav, look zone with inset shadows, controller panel with D-pad + A/B buttons + toggle switches
- Scanline overlay and LCD green tint on portrait top screen
- Minimap tap-to-teleport in portrait TopScreen (SVG click → coordinate transform → world position)
- Sidebar auto-collapse on pointer lock (desktop) and auto-expand when pointer unlocked
- Sidebar defaults to open
- Minimap defaults to expanded on desktop, positioned top-left
- Minimap expand/collapse buttons moved below the map

### Changed
- Fly-to animation replaced fade overlay with cinematic 3-phase camera movement
- Removed `FadeOverlay` component (no longer needed with cinematic fly-to)
- Jump physics: gravity reduced from `-0.015` to `-0.006`, jump force adjusted to `0.18` for floaty feel
- Mobile joystick movement speed reduced from `0.06`/`0.12` to `0.02`/`0.04` (walk/sprint) for parity with desktop
- Gravity state (velocityY) reset during fly-to animation to prevent jitter on landing
- Desktop minimap moved from bottom-right to top-left
- Landscape mobile minimap moved from bottom-right to top-left
- Desktop mode toggle moved from top-left to top-right, renamed "Exit 3D"
- Portrait TopScreen uses 60/40 split (minimap gets more space) with larger POI labels
- Controller panel uses straight-line separator instead of rounded corners
- POI highlight mesh now uses `Mesh.BILLBOARDMODE_ALL` for visibility from all angles

### Fixed
- Camera jitter during minimap teleportation (velocityY not reset during fly-to)
- Mobile movement ~4x faster than desktop (joystick speed values too high)
- Top screen bezel had rounded bottom corners creating visual gap (now `rounded-t-md`)
- Fly-to rotation normalization for shortest angular path

---

## [1.2.0] - 2026-02-16

### Added
- Minimap overlay component (`src/components/Minimap.tsx`) — SVG synced with 3D camera position in real-time
- Player direction indicator (triangle) on minimap, updated at ~10fps via throttled rAF
- Click-to-teleport on minimap with SVG coordinate conversion and hall bounds clamping
- Fly-to camera animation system (`src/3d/flyTo.ts`) using Babylon.js native Animation with CubicEase
- Fade overlay (`src/components/FadeOverlay.tsx`) for smooth teleport transitions (fade out → fly → fade in)
- Collapsible 3D sidebar (`src/components/ThreeDSidebar.tsx`) with POIs grouped by section
- Sidebar POI click triggers teleport to approach position facing the POI
- Camera position bridge (`src/3d/cameraRef.ts`) — shared ref syncing Babylon.js camera to React
- Mode toggle button (`src/components/ModeToggle.tsx`) — switch between 2D/3D from either mode
- `getApproachPosition()` helper to calculate arrival position 2.5 units in front of a POI

### Changed
- `createFirstPersonCamera` now accepts `cameraRef` parameter and writes position/rotation each frame
- Player movement (WASD, joystick, touch look, gravity) disabled during fly-to animation via `isFlyingTo` guard
- Camera collisions temporarily disabled during fly-to to prevent wall clipping issues
- "Exit 3D" button replaced with `ModeToggle` component in ThreeDMode
- "Switch to 3D" link replaced with `ModeToggle` component in FallbackMode
- Minimap and sidebar hidden in portrait mode on mobile to avoid overlapping controls
- Version bumped to v1.2.0

---

## [1.1.6] - 2025-02-15

### Added
- Manual "Landscape Mode" toggle in mobile controls (only visible when gyro is enabled)
- Controls hint popup on first mobile load ("Drag screen to look around. Use D-pad to move.")
- Landscape mode hint popup when toggling landscape on ("Rotate device to landscape...")
- Hint popups auto-dismiss after 4 seconds or tap to dismiss
- `landscapeModeRef` passed to camera for gyro axis mapping

### Changed
- Gyro axis mapping now driven by manual landscape toggle instead of auto-detecting from window dimensions
- Mobile controls layout (portrait vs landscape) determined by landscape toggle prop, not window size
- Gyro recalibrates automatically when landscape mode is toggled (resets `initialAlpha`)

### Removed
- Automatic orientation change detection in gyro handler (`lastOrientation`, `orientationChangeTimeout`)
- Window resize listener for portrait/landscape detection in `MobileControls`

### Fixed
- Gyro camera wobble caused by device roll influencing yaw — yaw now derived from alpha only
- Camera flicker and instability when rotating device between portrait and landscape during gyro use
- Gyro axis mapping errors from unreliable auto-detection of device orientation

---

## [1.1.5] - 2025-01-02

### Added
- Game Boy-style control panel in portrait mode (gray shell, magenta buttons)
- Toggle switches for P.Lock, Gyro, Run with engraved label styling
- Multi-touch D-pad supporting diagonal movement (up+left, etc.)
- Slide-between-buttons on D-pad (no lift required)
- Configurable control panel height via CONTROL_PANEL_HEIGHT constant
- Visual feedback on active D-pad directions

### Changed
- Portrait controls now occupy 45% of screen (adjustable)
- D-pad uses touch event listeners for better responsiveness
- A/B buttons styled magenta like classic Game Boy

## [1.1.4] - 2025-01-02

### Added
- Controls info on welcome screen (desktop, landscape, portrait)
- iOS-specific PWA prompt when in landscape (dismissible overlay)
- Mobile tips on welcome screen (iOS: Add to Home Screen, Android: fullscreen)

### Fixed
- Touch camera rotation breaking after orientation change
- Hide fullscreen button on iOS (not supported by Safari)

## [1.1.3] - 2025-01-02

### Added
- Fullscreen button for landscape mobile (top-right)
- Fullscreen hint that slides in when entering landscape, fades after 3s
- Fullscreen state tracking

### Changed
- Exit 3D button moved to top-left
- Exit 3D button z-index increased (z-50)

## [1.1.2] - 2025-01-02

### Added
- Portrait mode with Game Boy-style controls
- D-pad for movement in portrait orientation
- A button for interact, B button for jump
- Touch-drag camera on upper screen area (portrait)
- Orientation detection (auto-switch landscape/portrait controls)
- Mobile-friendly interact button (replaces "Press E" prompt)

### Fixed
- Movement stuck bug when near POIs
- Joystick cleanup on orientation change
- Landscape prompt no longer shows in portrait mode

## [1.1.1] - 2025-01-02

### Added
- Dynamic joystick (spawns where you touch on left half)
- Touch camera rotation (drag on right half)
- Multitouch support (move and look simultaneously)

### Changed
- Joystick zone now covers left half of screen
- Touch zones use `touch-none` to prevent browser gestures

## [1.1.0] - 2025-01-02

### Added
- Mobile joystick controls using nipplejs
- Auto-detect mobile devices and show touch controls
- Joystick movement with collision support


## [1.0.1] - [1.0.3] - 2025-01-02

### Changed
- v1.0.1: Lazy load Babylon.js only when user enters 3D mode
- v1.0.2: Tree-shake Babylon.js with deep imports for smaller bundle
- v1.0.2a: Fix camera/collision side-effect imports for tree-shaking
- v1.0.3: Add loading screen with spinner while 3D loads

## [1.0.0] - 2025-01-02

### Added
- Babylon.js engine setup (`src/3d/engine.ts`)
- Procedural hall with ground and 4 walls (`src/3d/scene.ts`)
- Basic lighting with ambient and point light (`src/3d/lights.ts`)
- First-person camera with gravity and collisions (`src/3d/camera.ts`)
- WASD movement, sprint (Shift), jump (Space)
- Pointer lock for immersive controls (`src/3d/pointerLock.ts`)
- POI placeholder meshes (paintings, display cases, pedestals)
- Proximity-based interaction system (E key)
- Inspect modal in 3D mode
- BabylonScene React component


## [0.3.0] - 2025-01-01

### Added
- Fallback mode with full 2D experience
- SVG floor plan with clickable POI markers
- Sidebar navigation with section filtering
- Inspect modal for POI details (description, tags, links)
- `usePOIs` hook for data loading
- `FloorPlan` component
- Responsive layout (mobile-first)


## [0.2.0] - 2025-01-01

### Added
- Device capability detection (`src/utils/detection.ts`)
- `useDeviceCapability` React hook
- WebGL hard blocker (disables 3D if unsupported)
- Soft warnings for low RAM, slow connection, mobile, reduced motion
- Dynamic 3D button state on welcome screen

### Changed
- WelcomeScreen now shows device-appropriate messaging
- Updated project name to "Balairung" throughout


## [0.1.0] - 2025-12-30

### Added
- Initial project scaffold
- Vite + React + TypeScript setup
- Tailwind CSS configuration
- Babylon.js dependencies
- Basic welcome screen with mode selection
- POI type definitions
- Placeholder POI data structure
- GitHub Actions deployment workflow
- Project documentation (README)

---

<!-- 
## [X.X.X] - YYYY-MM-DD
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
-->
