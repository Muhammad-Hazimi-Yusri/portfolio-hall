# 🏰 Balairung | 3D Portfolio Hall

> **Balairung** /bə-ˈlaɪ-ruŋ/ — *noun, Malay*
> 
> A grand royal hall or throne room; the ceremonial heart of a palace where audiences are received and important gatherings held.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Version](https://img.shields.io/badge/version-1.5.0--slice3-blue.svg)]()
[![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)]()

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
- 2D fallback mode — SVG floor plan, sidebar navigation, section filtering, inspect modal
- Responsive mobile-first layout

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

### Navigation & UX (v1.2)
- Minimap overlay (SVG synced with 3D camera position) — expanded by default on desktop (top-left)
- Real-time player position and direction indicator on minimap
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

---

## 🏗 Architecture

### Directory Structure

```
portfolio-hall/
├── public/
│   ├── models/
│   │   └── hall.glb              # Main hall 3D model
│   ├── thumbnails/               # POI preview images
│   └── custom-meshes/            # Custom project meshes (future)
│
├── src/
│   ├── data/
│   │   └── pois.json             # All POI content data
│   │
│   ├── 3d/
│   │   ├── engine.ts             # Babylon.js engine + scene factory
│   │   ├── scene.ts              # Hall geometry (ground, walls)
│   │   ├── camera.ts             # First-person camera (WASD, gyro, touch)
│   │   ├── cameraRef.ts          # Shared camera position ref (3D → React)
│   │   ├── flyTo.ts              # Fly-to teleport animation
│   │   ├── lights.ts             # Ambient + point lighting
│   │   ├── pois.ts               # POI mesh creation
│   │   ├── interaction.ts        # Proximity detection + E key handler
│   │   ├── pointerLock.ts        # Pointer lock management
│   │   ├── webxr.ts              # WebXR support check, XR experience factory, VR locomotion setup
│   │   ├── vrInteraction.ts      # Hand tracking, pinch detection, gaze teleport
│   │   └── BabylonScene.tsx      # Main 3D React component
│   │
│   ├── components/
│   │   ├── MobileControls.tsx    # Game Boy-style portrait + landscape controls
│   │   ├── FloorPlan.tsx         # 2D SVG floor plan (fallback mode)
│   │   ├── Minimap.tsx           # SVG minimap overlay (3D mode)
│   │   ├── ThreeDSidebar.tsx     # Collapsible POI sidebar (3D mode)
│   │   ├── FadeOverlay.tsx       # Fade transition for teleport
│   │   ├── ModeToggle.tsx        # 2D/3D mode switch button
│   │   └── LoadingScreen.tsx     # Loading spinner
│   │
│   ├── hooks/
│   │   ├── useDeviceCapability.ts
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
- **Blender .glb assets** (planned v1.7.0) layer decorative architectural elements on top — pillars, arches, crown molding, centrepiece — without replacing the procedural rooms
- **Gaussian splats** (planned v1.8.0) loaded via Babylon.js 8.0 native `GaussianSplattingMesh`, used for the self-portrait avatar and per-project physical displays; gracefully degrade to low-poly mesh on weak devices

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
| VR – Controllers (v1.5.0+) | Left stick: walk · Right fwd: teleport arc · Right L/R: 45° snap turn | Headset tracking | Controller trigger (coming) |
| VR – Hand Tracking (v1.5.0+) | Gaze + left pinch to teleport | Headset tracking | Right pinch |

### Gyro & Landscape Mode
When gyro is enabled, a **Landscape** toggle appears. This manually switches the control layout and gyro axis mapping — no auto-detection needed. Portrait uses beta/alpha; landscape uses gamma/alpha. Toggling recalibrates the gyro automatically.

### iOS Note
iOS Safari doesn't support fullscreen API. For best landscape experience, add the site to your home screen (PWA mode).

### VR Controls (Quest / WebXR)
- **Left thumbstick** — smooth walk (head-relative, collisions active)
- **Right thumbstick forward** — show parabolic arc; release to teleport (floor meshes only)
- **Right thumbstick left/right** — 45° snap turn with vignette flash

**Hand Tracking mode** (set controllers aside — detected automatically)
- **Both hands** — rendered with natural Babylon.js joint meshes
- **Right hand pinch** (thumb + index) — select / confirm action
- **Left hand pinch** — teleport to the gold gaze disc on the floor
- Switch back to controllers at any time; hand visuals hide gracefully

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
<summary>✅ Completed Versions (v0.1.0 – v1.4.0)</summary>

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
Multi-zone castle layout (Reception, Courtyard, Main Hall, Garden). 20 real POIs from CV data. Procedural skybox, sun lighting, gold doorway frames, glass-walled garden. Zone-based sidebar, expanded minimap/floorplan. SEO meta tags. Unique placeholder thumbnails. Hotfixed lighting, painting placement, and minimap bounds.

</details>

#### v1.5.0 Slice 1 — WebXR Session Entry
Immersive-VR session support via Babylon.js `WebXRDefaultExperience`. "Enter VR" button (teak & gold) appears only when `navigator.xr.isSessionSupported('immersive-vr')` resolves true (Quest Pro / Quest 2 browser). Head tracking with `local-floor` reference space. All DOM overlays hidden on VR enter; restored on exit. Keyboard, mouse, and touch controls disabled during VR session.

#### v1.5.0 Slice 2 — VR Locomotion
Controller-based movement via Babylon.js `WebXRFeatureName.MOVEMENT` and `TELEPORTATION`. Left thumbstick smooth walk (head-relative, 0.2 dead zone, wall/POI collisions active). Right thumbstick forward shows parabolic teleport arc with gold landing ring; release teleports to any floor mesh. Right thumbstick left/right fires 45° snap turn with a 300 ms black vignette flash for comfort. Teleportation restricted to castle ground planes — cannot land on walls, ceilings, or POI meshes.

#### v1.5.0 Slice 3 — Hand Tracking
Hand tracking via `WebXRFeatureName.HAND_TRACKING` in `src/3d/vrInteraction.ts`. Babylon.js default joint meshes render both hands with natural finger movement. Right-hand pinch (thumb ↔ index < 3.5 cm, 5 cm release hysteresis) dispatches `xr-pinch-select` CustomEvent on the canvas. Right index-finger direction EMA-smoothed each frame for slice-4 ray casting. Gaze teleport: XR camera forward ray casts onto floor; gold preview disc follows gaze; left-hand pinch confirms and moves the XR rig (X/Z only). Graceful controller ↔ hand switching via `onHandAdded/RemovedObservable` — hand visuals hide when controllers are picked up, no crash.

### 🔧 Upcoming

#### v1.5.0 — WebXR / VR Foundation (remaining)
- [x] WebXR immersive-VR session entry (Quest Pro / Quest 2 via browser) — Slice 1
- [x] Controller locomotion: left-stick walk, right-stick teleport arc, 45° snap turn + vignette — Slice 2
- [x] Hand tracking with pinch interaction — Slice 3
- [ ] VR POI interaction (ray pointer + floating 3D inspect panels)
- [ ] Performance profiling and comfort options (seated mode)

#### v1.5.1 — Minimap Dynamic Zoom
- [ ] Camera-centered view showing player + nearest POIs
- [ ] Dynamic zoom level based on POI proximity
- [ ] Manual zoom override (pinch/scroll)
- [ ] Full map toggle in corner

#### v1.6.0 — 2D Mode Revamp
- [ ] Redesign fallback mode as a spatial-themed but recruiter-optimized portfolio
- [ ] Sections: hero/intro, projects grid, experience timeline, skills, hackathons, contact
- [ ] Teak & gold aesthetic preserved
- [ ] All info scannable without excessive modals
- [ ] "Source of truth" layout for both visitors and self-reference
- [ ] Mobile-first responsive

#### v1.7.0 — Blender Asset Pipeline
- [ ] .glb import pipeline with material mapping and shadow support
- [ ] Config-driven asset placement system for swappable Blender models
- [ ] First assets: pillars, doorway arches, crown molding, reception centerpiece
- [ ] Fallback to procedural geometry when .glb not available
- [ ] Asset manifest with lazy loading

#### v1.8.0 — 3D Self-Portrait (Scan + Splat Avatar)
- [ ] iPhone LiDAR self-scan (via Scaniverse/Polycam)
- [ ] Low-poly mesh avatar (.glb) in reception area
- [ ] Gaussian splat toggle using Babylon.js native GaussianSplattingMesh (.ply/.splat)
- [ ] UI toggle between low-poly and splat with loading indicator
- [ ] Graceful degradation (low-poly only on weak devices)

#### v1.9.0 — Rich Project Displays
- [ ] 3D slideshow panels for website projects (screenshot carousel on 3D plane)
- [ ] Gaussian splat displays for physical projects on pedestals
- [ ] Enhanced inspect modal with richer content

#### v2.0.0 — Interactive Web Panels + Polish
- [ ] Iframe-on-3D-plane for live website project browsing (desktop only)
- [ ] DOM overlay positioned to match 3D plane projection
- [ ] VR fallback to slideshow mode
- [ ] Full content population, all placeholders replaced
- [ ] Performance optimization pass (LOD, occlusion culling)
- [ ] Launch-ready state

#### v3.0.0 — AI Integration (Backlog)
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
