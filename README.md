# 🏰 Balairung | 3D Portfolio Hall

> **Balairung** /bə-ˈlaɪ-ruŋ/ — *noun, Malay*
> 
> A grand royal hall or throne room; the ceremonial heart of a palace where audiences are received and important gatherings held.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Version](https://img.shields.io/badge/version-1.7.0-blue.svg)]()
[![Status](https://img.shields.io/badge/status-In_Progress-yellow.svg)]()

<details>
<summary>📑 Table of Contents</summary>

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Project Goals](#-project-goals)
- [Theme](#-theme)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Data Structures](#-data-structures)
- [Hall Layout](#-hall-layout--balairung)
- [Controls](#-controls)
- [Mode Detection & Fallback](#-mode-detection--fallback)
- [Development Roadmap](#-development-roadmap)
- [Testing Strategy](#-testing-strategy)
- [Deployment](#-deployment)
- [Getting Started](#-getting-started)
- [License](#-license)
- [Changelog](#-changelog)
- [Contact](#-contact)

</details>

---

## 📖 Overview

Balairung | 3D Portfolio Hall is an interactive portfolio website designed as a virtual museum hall. Visitors can explore projects displayed as paintings on walls and artifacts in display cases — either through first-person 3D navigation or a simplified 2D floor plan interface.

**Author:** Muhammad Hazimi Yusri  
**Repository:** Public  
**Hosting:** GitHub Pages (with Cloudflare domain)

## 🌐 Live Demo

**[View Live → muhammad-hazimi-yusri.github.io/portfolio-hall](https://muhammad-hazimi-yusri.github.io/portfolio-hall/)**

---

## 🎯 Project Goals

1. **Showcase work** in an engaging, memorable format
2. **Accessible by default** — fallback mode works everywhere
3. **Progressive enhancement** — 3D as opt-in experience
4. **Future-ready** — architecture supports VR and AI features

---

## 🎨 Theme

Balairung uses a **Javanese/Malay royal hall** aesthetic inspired by traditional Southeast Asian palace architecture:

- **Color palette**: "Teak & Gold" — deep wood tones, royal gold accents, batik red highlights, parchment text
- **Typography**: Cinzel (serif) for headings and titles, Inter (sans-serif) for body text
- **UI texture**: CSS wood-grain patterns on console frames and panels, gold trim borders
- **Mobile controls**: Portrait Game Boy-style frame reimagined as a carved teak console with gold gilding

---

## ✨ Features

### Foundation (v0.x)
- Welcome gate with device capability detection and mode selection
- Responsive mobile-first layout

### 2D Portfolio Mode (v1.6.0)
- Scroll-based portfolio layout replacing the old SVG floor plan placeholder
- Hero section: full-viewport with Cinzel gold title, tagline, CSS-only floating gold particle animation, "Explore in 3D" CTA, scroll indicator
- **Story-driven project cards** (`StoryCard`): each card answers "why does this project exist?" rather than listing bullet points
  - Collapsed state: Cinzel gold title, 1-line story hook (or first 80 chars of description as fallback), up to 3 primary tech tags, type icon badge (🖼 painting / 🔮 display-case / 🏛 pedestal)
  - Expanded panel (click to toggle, one open at a time): 3-part narrative — *The Challenge*, *The Approach*, *The Outcome* — when story fields are populated; falls back to full description otherwise
  - Native `<details>/<summary>` Technical Details section: full tech stack tags + links
  - Accessible: `role="button"`, `aria-expanded`, keyboard (`Enter`/`Space`) toggle
  - Top 6 projects have full story content; all remaining POIs have graceful fallback
- Experience timeline: vertical teak & gold timeline with role, org, dates, and tech tags
- Skills: categorised tag groups (Languages, Frameworks, DevOps, Hardware) with highlight cross-reference
- Hackathons: compact cards with story hook achievement line (e.g. "🏆 7th place internationally…") shown in gold above description
- Contact: link cards for GitHub, LinkedIn, Email, GitLab, Website with gold accent styling
- Footer with secondary "Switch to 3D Experience" CTA
- Intersection Observer fade-in reveals per section; CSS-only particle animation in hero
- Self-scrolling container (3D mode `overflow: hidden` on `#root` preserved)
- **Illustrated castle map** in 256px left sidebar (desktop): fantasy RPG hand-drawn SVG plan with 4 interactive zones (Main Hall, Courtyard, Reception, Garden), decorative elements per zone, gold doorway connectors, Cinzel labels, and gold glow on the active zone
- **Scroll sync**: `IntersectionObserver` tracks which section occupies most of the viewport and highlights the corresponding map zone in real time
- **Zone click** smooth-scrolls to that section; **POI dot click** scrolls to the exact card and fires a gold ring pulse animation
- **Mobile map overlay**: floating "Map" button (bottom-right) opens the full map as a full-screen backdrop-blur overlay; tapping a zone navigates and closes the overlay
- POI world coordinates (`svgX = -poi.position.x`, `svgY = poi.position.z`) used to position map dots, matching the Minimap.tsx convention
- **Polish pass**: smooth micro-interactions and visual refinement throughout
  - Card expand: CSS `grid-rows-[0fr→1fr]` animated collapse (300ms ease-out); expand panel stays in DOM for accessibility/screen readers
  - Card hover lift (desktop only, `@media (hover: hover)`): `translateY(-2px)` + faint gold drop shadow — suppressed on touch devices to prevent sticky-hover
  - Timeline dots: scale-in with overshoot (`0 → 1.4 → 1`) triggered by parent scroll-reveal, staggered per entry
  - Hero background: drifting `wood-texture` layer behind particles (CSS-only 25s infinite pan, no JS)
  - Castle map zone hover: `scale(1.015)` via `transform-box: fill-box` — correct SVG bounding box transform, no TSX changes
  - Section dividers: 1px gold gradient rule between all major sections
  - Alternating section backgrounds: Projects and Skills sections use `bg-hall-surface/20` tint for visual rhythm
  - Fade-in easing upgraded from `ease-out` to `cubic-bezier(0.4, 0, 0.2, 1)` for smoother deceleration
  - Cinzel weight 600 loaded (was 400/700 only) — fixes `font-semibold` rendering across card titles and section headers

### 3D Experience (v1.0)
- Babylon.js 3D hall with procedural geometry
- First-person camera with WASD, sprint, jump, pointer lock
- POI placeholder meshes (paintings, display cases, pedestals)
- Collision detection (walls + POIs)
- Proximity-based interaction (E key) with inspect modal
- Lazy-loaded Babylon.js with tree-shaking and loading screen

### Mobile Controls (v1.1)
- Dynamic joystick (nipplejs) with multitouch support
- Touch-drag camera rotation
- Portrait mode with Game Boy-style D-pad and A/B buttons
- Landscape mode with joystick + touch look
- Optional gyroscope camera control
- Manual landscape mode toggle with gyro axis remapping
- Fullscreen support (Android) with iOS PWA prompt
- Controls hint popups (first load + landscape toggle)
- Controls info on welcome screen per device type

### Navigation & UX (v1.2 – v1.5.1)
- Minimap overlay (SVG synced with 3D camera position) — top-left on desktop, hidden in portrait mobile
- Dynamic zoom: minimap auto-centers on player and zooms to show the 3 nearest POIs; min 8×8 / max 30×30 viewBox; smooth lerp transitions at 60fps
- Full map toggle (`⊞`/`⊡`) inside minimap corner — switches between dynamic zoom and full castle view; full view shows a dashed gold rectangle marking the dynamic zoom area
- Current zone label (Main Hall, Courtyard, Reception, Garden) displayed in minimap corner
- Real-time player position and scaled direction arrow on minimap
- Click minimap to teleport anywhere in the hall; click POI dot to teleport to approach position
- GTA-style cinematic fly-to animation (rise → overhead pan → descend) with short-distance fallback
- Collapsible sidebar with POI navigation grouped by section (auto-collapses on pointer lock)
- Sidebar teleportation (click POI name → fly to approach position facing the POI)
- "Exit 3D" button consistently placed top-right across desktop, landscape, and portrait modes
- Game Boy 3DS-style portrait layout: teak & gold console frame, top screen (minimap + nav), look zone with inset shadows, D-pad + A/B controller panel
- Floaty jump physics with satisfying hang time
- Mobile movement speed tuned to match desktop parity

### Visual Polish (v1.3)
- Javanese/Malay royal hall "Teak & Gold" theme with 8 semantic color tokens
- Cinzel serif font for headings via Google Fonts, Inter for body text
- CSS `.wood-texture` class with layered gradient wood grain effect
- CSS `.gold-trim` class for reusable gold border styling
- Welcome screen: gold Cinzel title, gold primary/outline buttons, decorative separator
- Game Boy console frame: carved teak wood with gold trim, batik red A button, wood B button
- Fallback sidebar and POI cards: wood-textured background, gold-trimmed cards
- 3D sidebar: wood-textured panel with gold accent border
- Minimap SVG: warm wood/gold color palette replacing green/magenta
- 3D hall: ceiling, doorway, baseboards, gold crown molding, corner pillars
- Floor with procedural wood grain bump texture
- Painting frames with gold beveled geometry and thumbnail textures
- Display cases with glass transparency and teak base
- Pedestals with 3-tier structure and gold top platform
- Gallery lighting: directional light with shadows, per-painting spotlights, gold accent lights
- Loading screen with progress bar and stage labels

### Multi-Zone Castle (v1.4)
- 4 distinct zones: Reception (entrance foyer), Courtyard (open-air hub with fountain), Main Hall (project gallery), Garden (greenhouse, skills & hackathons)
- 20 real POIs populated from CV data across all zones
- Procedural skybox and sun-style directional lighting with shadow casters
- Gold doorway frames, glass-walled garden, zone-based sidebar grouping
- Expanded minimap and floor plan reflecting multi-zone layout

### WebXR / VR (v1.5)
- WebXR immersive-VR session entry via Babylon.js `WebXRDefaultExperience` (Quest browser)
- "Enter VR" / "Exit VR" button (teak & gold) — only visible on XR-capable devices
- `local-floor` reference space; head tracking; all DOM overlays hidden in VR
- **Left thumbstick**: smooth walk with head-relative orientation and wall/POI collision
- **Right thumbstick forward**: parabolic teleport arc with gold landing ring; floor-meshes-only targeting
- **Right thumbstick L/R**: 45° snap turn with 300 ms vignette flash for comfort
- **Hand tracking**: default Babylon.js hand meshes; right pinch = select; gaze disc + left pinch = teleport; graceful controller ↔ hand switching
- **POI hover highlight**: controller aim ray and hand index-finger ray cast against POI meshes each frame; `HighlightLayer` applies gold glow to hovered mesh; floating billboard label shows POI title above the mesh; 10 m distance limit prevents accidental far picks
- **VR inspect panel** (`src/3d/vrUI.ts`): trigger/pinch while pointing at a highlighted POI opens a 1.4 × 0.9 m floating teak-and-gold panel 1.5 m in front of the player at chest height; panel shows title, description, word-wrapped text, tag pills, and link buttons; no DOM involved — pure Babylon.js geometry + `DynamicTexture`
- **Panel interaction**: controller trigger or right-hand pinch selects close button ("✕") or link buttons; link URLs are queued and opened in new browser tabs when the VR session ends; B/Y controller button closes the panel instantly
- **Parallel systems**: VR panel and desktop DOM modal are fully independent — switching mode is seamless
- **Locomotion vignette**: persistent dark overlay (max 0.4 alpha) fades in while smooth-walking, fades out at rest — reduces peripheral-vision motion sickness without blocking the scene
- **FPS counter HUD**: 0.22 × 0.07 m plane parented to XR camera (top-left FOV); green ≥ 72 fps / gold ≥ 60 fps / red < 60 fps; toggle with Y button (left controller)
- **Seated mode**: X button (left controller) applies +0.7 m rig offset so seated players see the scene at standing scale
- **Painting height**: canvas center at 1.65 m (bottom 1.15 m, top 2.15 m) — within 1.4–1.7 m VR eye-level target

### Blender Asset Pipeline (v1.7)
- **Hybrid architecture**: procedural room geometry forms the permanent structure; Blender `.glb` files layer in architectural decorations (pillars, doorways, molding, throne)
- **Config-driven asset manifest** (`src/3d/assetManifest.ts`) — typed `AssetEntry` and `AssetPlacement` records define every decoration placement with exact position, scale, shadow flags, and fallback strategy
- **Automatic fallback**: when `.glb` files are absent, `fallbackType: 'none'` keeps existing procedural geometry in place (zero phantom meshes); `'box'` / `'cylinder'` generates a simple teak placeholder
- **Material mapping** (`materialMode: 'keep' | 'remap' | 'hybrid'`) — use Blender PBR materials as-is, remap to shared scene palette, or adjust color/PBR while preserving UV layout
- **Shadow and collision integration** — GLB assets wire into the scene's shadow generators; invisible box/cylinder collision proxies keep physics cheap without burdening the renderer
- **Dev hot-reload workflow** — asset-only reload (`Ctrl+Shift+R`) swaps `.glb` files without a page refresh; backtick debug overlay shows per-asset status (⏳/✅/⚠️/❌), triangle counts, load times, and A/B GLB ↔ fallback toggle; overlay is eliminated from production bundle via dead-code elimination
- **Reference docs**: [Blender export guide](docs/BLENDER_GUIDE.md) · [Asset specifications](docs/ASSET_SPECS.md)

### VR Performance Notes (Quest Pro browser)

**Target: 72 fps**

Lighting optimisations applied automatically on VR session entry (`applyVRLighting`):
- Shadow blur scale halved (2 → 1) on both directional shadow generators — reduces blur GPU cost without recreating shadow maps
- All painting `SpotLight`s disabled; ambient intensity raised from 0.30 to 0.55 to compensate
- Restored automatically on session exit

**If 72 fps is still not achieved** — next steps for future slices:
- Dispose and recreate `ShadowGenerator` with 1024/512 px maps on VR entry (vs 2048/1024 currently)
- Add exponential fog (`scene.fogMode = Scene.FOGMODE_EXP`, density ~0.015) to cull distant draw calls
- Disable `useBlurExponentialShadowMap` entirely in VR and use standard PCF shadows

**Quick control reference (Quest Pro):**

| Action | Input |
|---|---|
| Walk | Left thumbstick |
| Snap turn (45°) | Right thumbstick L/R |
| Teleport | Right thumbstick forward → release |
| Select / pinch POI | Right hand pinch or controller trigger |
| Gaze teleport | Left hand pinch |
| Close panel | B (right) / Y (left) controller button |
| Toggle FPS counter | Left controller Y button |
| Toggle seated mode | Left controller X button |

---

## 🛠 Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **3D Engine** | Babylon.js | Native WebXR, good mobile perf, built-in inspector |
| **UI Framework** | React 18+ | Component reuse, ecosystem |
| **Build Tool** | Vite | Fast HMR, good Babylon.js support |
| **Language** | TypeScript | Type safety for complex 3D logic |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Hosting** | GitHub Pages | Free, CI/CD via Actions |
| **Mobile Controls** | Nipple.js | Virtual joystick library |
| **3D Scanning** | Scaniverse / Polycam | iPhone LiDAR capture, gaussian splat + mesh export |
| **VR** | Babylon.js WebXR | Native Quest browser support |
| **Asset pipeline** | `@babylonjs/loaders` + manifest | Lazy non-blocking GLB loading; procedural fallbacks until Blender assets are ready |

---

## 🏗 Architecture

### Directory Structure

```
portfolio-hall/
├── public/
│   ├── assets/
│   │   └── models/               # Blender .glb exports (v1.7.0+)
│   │       ├── .gitkeep
│   │       └── test-cube.glb     # Pipeline verification mesh (temporary)
│   └── thumbnails/               # POI preview images
│       └── .gitkeep
│
├── src/
│   ├── data/
│   │   └── pois.json             # All POI content data
│   │
│   ├── 3d/
│   │   ├── engine.ts             # Babylon.js engine + scene factory
│   │   ├── scene.ts              # Castle geometry: walls, floors, ceilings, decorative meshes
│   │   ├── materials.ts          # Shared material factories + SceneMaterials type
│   │   ├── assetManifest.ts      # Typed catalogue of all .glb placements + positions
│   │   ├── assetLoader.ts        # Non-blocking GLB loader; stats tracking, hot-reload, A/B toggle
│   │   ├── assetDebug.tsx        # Dev-only overlay component (tree-shaken from production)
│   │   ├── camera.ts             # First-person camera (WASD, gyro, touch)
│   │   ├── cameraRef.ts          # Shared camera position ref (3D → React)
│   │   ├── flyTo.ts              # Fly-to teleport animation
│   │   ├── lights.ts             # Ambient + directional lighting + shadow generators
│   │   ├── pois.ts               # POI mesh creation (paintings, display cases, pedestals)
│   │   ├── interaction.ts        # Proximity detection + E key handler
│   │   ├── pointerLock.ts        # Pointer lock management
│   │   ├── webxr.ts              # WebXR support check, XR experience factory, VR locomotion + vignette, menu buttons, seated mode
│   │   ├── vrInteraction.ts      # Hand tracking, pinch/trigger, hover ray casting, POI select
│   │   ├── vrUI.ts               # VR hover label, floating inspect panel, FPS counter HUD
│   │   └── BabylonScene.tsx      # Main 3D React component
│   │
│   ├── components/
│   │   ├── FallbackMode/         # 2D scroll-based portfolio (v1.6.0+)
│   │   │   ├── index.ts
│   │   │   ├── FallbackMode.tsx  # Root layout + data orchestration + map wiring
│   │   │   ├── CastleMap.tsx     # Illustrated SVG castle map navigation
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProjectCard.tsx   # StoryCard — expandable story-driven project card
│   │   │   ├── ProjectsGrid.tsx
│   │   │   ├── ExperienceTimeline.tsx
│   │   │   ├── SkillsSection.tsx
│   │   │   └── ContactSection.tsx
│   │   ├── MobileControls.tsx    # Game Boy-style portrait + landscape controls
│   │   ├── FloorPlan.tsx         # 2D SVG floor plan (legacy, superseded by CastleMap)
│   │   ├── Minimap.tsx           # SVG minimap overlay (3D mode)
│   │   ├── ThreeDSidebar.tsx     # Collapsible POI sidebar (3D mode)
│   │   ├── FadeOverlay.tsx       # Fade transition for teleport
│   │   ├── ModeToggle.tsx        # 2D/3D mode switch button
│   │   └── LoadingScreen.tsx     # Loading spinner
│   │
│   ├── hooks/
│   │   ├── useDeviceCapability.ts
│   │   ├── useFadeIn.ts          # IntersectionObserver scroll-reveal hook (one-shot)
│   │   ├── useActiveSection.ts   # IntersectionObserver scroll-sync → active zone
│   │   └── usePOIs.ts
│   │
│   ├── types/
│   │   └── poi.ts                # POI type definitions
│   │
│   ├── utils/
│   │   └── detection.ts          # WebGL, RAM, motion pref checks
│   │
│   ├── App.tsx                   # Root (WelcomeScreen, FallbackMode, ThreeDMode)
│   └── main.tsx
│
├── docs/
│   ├── BLENDER_GUIDE.md          # Blender → Babylon.js export workflow
│   └── ASSET_SPECS.md            # First batch of 4 architectural asset specs
│
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
├── CHANGELOG.md
├── LICENSE
└── README.md
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌───────────┐    ┌────────────┐      ┌─────────────┐       │
│  │  Welcome  │──▶│  Fallback  │◀──▶│    3D       │       │
│  │  Screen   │    │  Mode      │      │   Mode      │       │
│  └───────────┘    └──────┬─────┘      └──────┬──────┘       │
│                          │                   │              │
│                          ▼                   ▼              │
│                     ┌─────────────────────────────┐         │
│                     │      pois.json              │         │
│                     │   (single source of truth)  │         │
│                     └─────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Asset Strategy

Balairung uses a **hybrid geometry approach**:

- **Procedural geometry** handles room structure (floors, walls, ceilings, zone boundaries) — fast, no file loading, easily tweakable
- **Shared materials** (`src/3d/materials.ts`, v1.7.0-slice2) — one `SceneMaterials` instance created at scene init and shared across all procedural geometry and loaded .glb assets; guarantees visual consistency; single Babylon.js material object per name in the scene
- **Blender .glb assets** (`assetLoader.ts`, v1.7.0-slice1+) layer decorative architectural elements on top — pillars, doorway frames, crown molding — without replacing the procedural rooms; each asset entry can specify `materialMode: 'keep' | 'remap' | 'hybrid'` and `collision: 'none' | 'mesh' | 'box' | 'cylinder'`; loader falls back to procedural geometry until real exports are ready
- **Gaussian splats** (planned v3.x) loaded via Babylon.js native `GaussianSplattingMesh`, used for the self-portrait avatar and per-project physical displays; gracefully degrade to low-poly mesh on weak devices

---

## 📐 Data Structures

### POI (Point of Interest)

```typescript
type POI = {
  id: string
  type: 'painting' | 'display-case' | 'pedestal' | 'custom'
  section: 'projects' | 'about' | 'skills' | 'contact'
  position: { x: number; z: number }
  rotation: number  // degrees, facing direction
  
  content: {
    title: string
    thumbnail: string       // path to image
    description: string
    storyHook?: string      // 1-line hook shown in collapsed card state
    challenge?: string      // "The Challenge" paragraph (expanded view)
    approach?: string       // "The Approach" paragraph (expanded view)
    outcome?: string        // "The Outcome" paragraph (expanded view)
    links?: Array<{
      label: string
      url: string
    }>
    tags?: string[]
  }
  
  // Future extensibility
  custom?: {
    meshUrl?: string                        // custom .glb
    interactionType?: 'default' | 'video' | 'iframe' | 'custom-script'
    interactionConfig?: Record<string, unknown>
  }
}
```

### App State

```typescript
type AppState = {
  mode: '3d' | 'fallback'
  inspecting: string | null       // POI id being viewed
  playerPosition: { x: number; z: number }
  playerRotation: number
  visitedPOIs: string[]           // tracking (optional)
  sidebarOpen: boolean
}
```

---

## 🗺 Castle Layout — Balairung

```
                    ┌──────────────────┐
                    │    MAIN HALL     │
                    │  (project gallery │
                    │   10 paintings)  │
                    │   z: -22 to -8  │
                    └───────┤  ├──────┘
                            │  │
    ┌────────────┐  ┌───────┘  └──────┐
    │   GARDEN   │──│   COURTYARD     │
    │ (greenhouse│  │   (open-air     │
    │  skills +  │  │   hub with      │
    │  hackathons│  │   fountain)     │
    │  x:-20→-8) │  │   x:-8→+8      │
    └────────────┘  └───────┤  ├──────┘
                            │  │
                    ┌───────┘  └──────┐
                    │   RECEPTION     │
                    │   (entrance     │
                    │   foyer with    │
                    │   about/contact)│
                    │   ☻ spawn      │
                    └───────┤  ├──────┘
                            DOOR
```

---

## 🎮 Controls

| Platform | Movement | Camera | Interact |
|----------|----------|--------|----------|
| Desktop | WASD / Arrow keys | Mouse (pointer lock) | E key or Left click |
| Mobile (portrait) | D-pad | Touch drag or Gyro | A button |
| Mobile (landscape) | Virtual joystick | Touch drag or Gyro | Tap on POI |
| VR – Controllers (v1.5.0+) | Left stick: walk · Right fwd: teleport arc · Right L/R: 45° snap turn | Headset tracking | Trigger: inspect/select · B (R) / Y (L): close panel · Y (L): FPS counter toggle · X (L): seated mode toggle |
| VR – Hand Tracking (v1.5.0+) | Gaze + left pinch to teleport | Headset tracking | Right pinch: inspect / confirm link / close panel |

### Gyro & Landscape Mode
When gyro is enabled, a **Landscape** toggle appears. This manually switches the control layout and gyro axis mapping — no auto-detection needed. Portrait uses beta/alpha; landscape uses gamma/alpha. Toggling recalibrates the gyro automatically.

### iOS Note
iOS Safari doesn't support fullscreen API. For best landscape experience, add the site to your home screen (PWA mode).

### VR Controls (Quest / WebXR)
- **Left thumbstick** — smooth walk (head-relative, collisions active); dark vignette fades in at screen edges while moving
- **Right thumbstick forward** — show parabolic arc; release to teleport (floor meshes only)
- **Right thumbstick left/right** — 45° snap turn with 300 ms vignette flash
- **Trigger** — inspect the highlighted POI; or click a link / close button while panel is open
- **B button** (right) / **Y button** (left) — close the open inspect panel
- **Y button** (left, `button[4]`) — toggle FPS counter HUD (top-left of view); green ≥ 72 fps, gold ≥ 60, red < 60. Also closes panel if one is open.
- **X button** (left, `button[3]`) — toggle seated mode (+0.7 m floor offset so seated players see scene at standing scale)
- **Aim controller at POI** — gold HighlightLayer glow + title label appear; point within 10 m to be eligible

**Hand Tracking mode** (set controllers aside — detected automatically)
- **Both hands** — rendered with natural Babylon.js joint meshes
- **Right hand pinch** (thumb + index) — inspect highlighted POI, click link button, or close panel
- **Left hand pinch** — teleport to the gold gaze disc on the floor
- **Point right index finger at POI** — same hover highlight + label as controllers
- Switch back to controllers at any time; hand visuals hide gracefully

**VR Inspect Panel**
- Opens 1.5 m in front of you at chest height, facing you
- Shows: title (gold), description, tag pills, link buttons
- Close: aim at "✕" and pinch/trigger, or press B/Y button
- Links: tapping a link button queues the URL; all queued links open in new browser tabs when you exit VR

### Dev Shortcuts (desktop · dev builds only)

| Key | Action |
|-----|--------|
| `` ` `` (backtick) | Toggle asset debug overlay (FPS, triangle counts, per-asset status + A/B toggle) |
| `Ctrl + Shift + R` | Reload all GLB assets without page refresh (camera and scene preserved) |

### Teleportation
- Click minimap location → fade out → fly to → fade in → face nearest POI
- Click sidebar section → same behavior, lands at section center

---

## 🚦 Mode Detection & Fallback

```typescript
const shouldDefaultToFallback = (): boolean => {
  return (
    !hasWebGL() ||
    !hasWebGL2() ||
    (isMobile() && getDeviceRAM() < 4) ||
    prefersReducedMotion() ||
    isSlowConnection()
  )
}
```

### Mode Selection UX

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              Welcome to Balairung                       │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │                                                 │   │
│   │          [ Enter Simple Mode ]                  │   │ ← Primary CTA
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  [ Try Interactive 3D ]                         │   │
│   │                                                 │   │
│   │  ⚠️  Requires modern browser                    │   │
│   │  📦 ~XX MB download                             │   │
│   │  💡 Best on desktop                             │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Development Roadmap

<details>
<summary>✅ Completed Versions (v0.1.0 – v1.7.0)</summary>

#### v0.1.0 — Scaffold
Vite + React + TypeScript project setup, Tailwind CSS, Babylon.js deps, GitHub Pages CI/CD.

#### v0.2.0 — Welcome Gate
Device capability detection, mode selection with warnings, state management.

#### v0.3.0 — Fallback Mode
SVG floor plan, sidebar navigation, POI data loading, inspect modal, section filtering, responsive layout.

#### v1.0.0 – v1.0.3 — 3D Core + Performance
Babylon.js procedural hall, first-person camera, WASD + sprint + jump, POI placeholders, collision detection, interaction system, lazy loading with tree-shaking.

#### v1.1.0 – v1.1.6 — Mobile Controls + Gyroscope
Virtual joystick (nipplejs), touch-drag camera, portrait D-pad + A/B buttons, landscape joystick layout, optional gyro camera, manual landscape toggle with axis remapping, fullscreen support, controls hints.

#### v1.2.0 – v1.2.1 — Navigation & UX
Minimap overlay with player tracking and POI labels, click-to-teleport (approach position for POIs), cinematic fly-to camera animation (rise → pan → descend), collapsible 3D sidebar with auto-collapse on pointer lock, "Exit 3D" button across all modes, Game Boy 3DS-style portrait controls, floaty jump physics, mobile speed parity.

#### v1.3.0 — Visual Polish (Theme)
Javanese/Malay royal hall "Teak & Gold" theme: color palette, Cinzel typography, CSS wood-grain textures, gold trim borders, themed welcome screen, themed Game Boy console frame, themed sidebar and fallback mode.

#### v1.3.1 — Visual Polish (3D)
Enhanced 3D hall with ceiling, doorway, baseboards, gold crown molding, corner pillars, procedural wood grain floor. Gold painting frames with thumbnail textures, glass display cases, 3-tier pedestals. Gallery lighting with directional shadows, per-painting spotlights, gold accent lights. Loading screen with progress bar.

#### v1.4.0 — Multi-Zone Castle & Content Population
Multi-zone castle layout (Reception, Courtyard, Main Hall, Garden). 19 real POIs from CV data. Procedural skybox, sun lighting, gold doorway frames, glass-walled garden. Zone-based sidebar, expanded minimap/floorplan. SEO meta tags. Unique placeholder thumbnails. Hotfixed lighting, painting placement, and minimap bounds.

#### v1.5.0 — WebXR / VR
Full WebXR immersive-VR support via Babylon.js `WebXRDefaultExperience`. "Enter VR"/"Exit VR" button (teak & gold) hidden on non-XR devices. Features: session entry with `local-floor` reference space; controller locomotion (left-stick walk, right-stick parabolic teleport, 45° snap turn + vignette); hand tracking (pinch select + gaze-disc teleport, graceful controller ↔ hand switch); VR POI hover highlight (HighlightLayer gold glow, billboard label, 10 m cap) + floating teak-and-gold inspect panel with link-queueing; performance/comfort pass (shadow blur halved, spotlights disabled in VR, locomotion vignette, FPS counter HUD, seated mode, painting canvas lowered to 1.65 m).

#### v1.5.1 — Minimap Dynamic Zoom
Player-centered minimap that auto-zooms to the 3 nearest POIs (8×8 min / 30×30 max viewBox). Smooth 60fps lerp transitions. Full map toggle (`⊞`/`⊡`) inside the minimap corner — full view shows a dashed gold viewport indicator. Current zone label (Main Hall, Courtyard, Reception, Garden) in minimap corner. POI dots filtered to viewBox bounds in dynamic mode. Direction arrow scales with zoom level.

#### v1.6.0 — 2D Mode Revamp (Spatial Portfolio)
Complete rebuild of the 2D fallback mode as a recruiter-optimized scroll portfolio. Illustrated SVG castle map navigation with scroll sync (IntersectionObserver links scroll position to active map zone). Story-driven project cards with challenge/approach/outcome narrative for 6 top projects, graceful description fallback for others. Hero section with CSS-only floating gold particles and drifting wood-texture background. Vertical experience timeline with teak & gold styling and staggered dot reveal animations. Categorized skill tag groups and hackathon cards with gold achievement lines. Mobile-first responsive design: single-column scroll with floating map button → fullscreen overlay on mobile, sticky illustrated map sidebar + scrollable content on desktop. Card hover lift, CSS grid-rows expand/collapse animation, section dividers, and alternating section backgrounds. Accessible (role=button, aria-expanded, keyboard support). Visual QA pass across mobile/tablet/desktop breakpoints.

#### v1.7.0 — Blender Asset Pipeline
GLB import pipeline using Babylon.js `ImportMeshAsync` with `@babylonjs/loaders/glTF` plugin. Config-driven asset manifest (`src/3d/assetManifest.ts`) — typed `AssetEntry` and `AssetPlacement` records for all decoration placements. Three-strategy fallback system: load GLB → procedural box/cylinder with shared teak material → silent exit (existing procedural mesh stays). Shared material module (`src/3d/materials.ts`) — 8 named factory functions, `SceneMaterials` type, `createSceneMaterials(scene)` called once and threaded through all zone builders and asset loader. Material mapping modes (`keep` / `remap` / `hybrid`) and invisible collision proxies (`box` / `cylinder`) for loaded GLB assets. Dev tooling: `glbMimePlugin` in `vite.config.ts`, `assetLoadStats` export, `reloadAllAssets` (Ctrl+Shift+R), `toggleAssetFallback` A/B toggle, `AssetDebugOverlay` React component (dev-only, confirmed absent in production). Blender workflow reference: `docs/BLENDER_GUIDE.md` and `docs/ASSET_SPECS.md`.

</details>

### 🔧 Upcoming

#### v2.x — Guided Balairung (Scroll-Driven Tour)

Architecture pivot: the site opens directly into a scroll-driven guided tour through the castle. No mode selection gate. Scroll position drives camera movement through the 3D scene (WebGL) or illustrated parallax scenes (fallback). Free-roam 3D unlocks as an opt-in from within the tour.

**Story arc:** "Who I am → What I build → Why it matters → Let's talk"

##### v2.0.0 — Scroll Engine + Section Registry
- [ ] ScrollController with normalized 0→1 progress tracking
- [ ] TourSection config (intro/projects/impact/contact with scroll ranges)
- [ ] Scroll progress bar (gold accent)
- [ ] Legacy mode preserved via `?legacy=true` query param
- [ ] Old Welcome Gate mode selection removed as default entry point

##### v2.1.0 — Content Layer: Story Sections
- [ ] "Who I am" intro with scroll-reveal text
- [ ] "What I build" project cards (reusing story data from pois.json)
- [ ] "Why it matters" experience timeline + philosophy
- [ ] "Let's talk" contact CTA
- [ ] Teak & gold theming, CSS scroll-triggered animations
- [ ] Mobile-first responsive layout

##### v2.2.0 — 3D Visual Layer: Camera-on-Rail
- [ ] Babylon.js canvas behind content layer (WebGL only)
- [ ] Camera spline path through castle zones driven by scroll progress
- [ ] Reuses existing castle geometry, materials, GLB assets from v1.7.0
- [ ] Per-zone lighting mood shifts
- [ ] Reduced resolution on mobile for performance

##### v2.3.0 — 2D Illustrated Fallback Layer
- [ ] Silent capability detection (no user choice)
- [ ] Pre-rendered screenshots from 3D scene as scroll backgrounds
- [ ] CSS parallax depth layers per section
- [ ] Same scroll timing and content as 3D layer

##### v2.4.0 — Free-Roam Unlock + Mode Transitions
- [ ] "Explore the hall yourself" CTA at multiple scroll points (WebGL only)
- [ ] Smooth camera handoff: scroll-driven → first-person free-roam
- [ ] All v1.x free-roam features preserved (WASD, joystick, minimap, sidebar, VR, POI interaction)
- [ ] "Return to tour" button in free-roam
- [ ] URL routing: `/` = tour, `/explore` = free-roam

##### v2.5.0 — Launch Polish
- [ ] All placeholder content replaced with real data
- [ ] Animation timing pass
- [ ] Performance budget (Lighthouse, bundle analysis)
- [ ] Accessibility pass (keyboard, screen reader, reduced-motion)
- [ ] Legacy mode routing removed
- [ ] Old v1.6.0 2D fallback components removed
- [ ] Full README rewrite

#### v3.x — Backlog (Deferred from v1.8–v1.9)

##### v3.0.0 — VR Hardening & Enhancement
- [ ] End-to-end VR playtest on Quest (first real session)
- [ ] Bug triage and fix pass from playtest findings
- [ ] VR comfort tuning (vignette, snap turn, locomotion speed)
- [ ] Performance profiling on-device (shadow maps, draw calls, frame budget)
- [ ] VR UX polish (panel placement, hover feedback, interaction range)

##### v3.1.0 — 3D Self-Portrait (Scan + Splat Avatar)
- [ ] iPhone LiDAR self-scan (via Scaniverse/Polycam)
- [ ] Low-poly mesh avatar (.glb) in reception area
- [ ] Gaussian splat toggle using Babylon.js native GaussianSplattingMesh
- [ ] Graceful degradation (low-poly only on weak devices)

##### v3.2.0 — Rich Project Displays
- [ ] 3D slideshow panels for website projects (screenshot carousel on 3D plane)
- [ ] Gaussian splat displays for physical projects on pedestals
- [ ] Enhanced inspect modal with richer content

##### v3.3.0 — Interactive Web Panels
- [ ] Iframe-on-3D-plane for live website project browsing (desktop only)
- [ ] DOM overlay positioned to match 3D plane projection
- [ ] VR fallback to slideshow mode

##### v3.4.0 — AI Integration
- [ ] Visitor type detection
- [ ] LLM integration
- [ ] Dynamic content prioritization

---

## 🧪 Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Vitest | Utils, hooks |
| Component | React Testing Library | UI components |
| E2E | Playwright | Critical flows |
| Performance | Lighthouse CI | Core Web Vitals |

---

## 📦 Deployment

### GitHub Pages Setup

Deployment is automated via GitHub Actions on push to `main`.

1. Go to repo **Settings → Pages**
2. Source: **GitHub Actions**
3. Custom domain (optional): Add your domain in settings

### Custom Domain (Cloudflare)

1. Add domain in GitHub Pages settings
2. In Cloudflare DNS, add:
   - `CNAME` record: `[subdomain]` → `[username].github.io`
3. Enable "Enforce HTTPS" in GitHub after DNS propagates

---

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall.git
cd portfolio-hall

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |

---

## 📄 License

**Proprietary — All Rights Reserved**

Copyright © 2025-present Muhammad Hazimi Yusri

See [LICENSE](./LICENSE) for details.

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## 🙏 Acknowledgments

- [Babylon.js](https://www.babylonjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

## 📬 Contact

**Muhammad Hazimi Yusri**
- GitHub: [Muhammad-Hazimi-Yusri](https://github.com/Muhammad-Hazimi-Yusri)
- Email: [muhammadhazimiyusri@gmail.com](mailto:muhammadhazimiyusri@gmail.com)

---

<p align="center">
  <i>Built with Claude AI 🤖 and water 🚰</i>
</p>
