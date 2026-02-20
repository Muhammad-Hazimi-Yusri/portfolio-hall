# 🏰 Balairung | 3D Portfolio Hall

> **Balairung** /bə-ˈlaɪ-ruŋ/ — *noun, Malay*
> 
> A grand royal hall or throne room; the ceremonial heart of a palace where audiences are received and important gatherings held.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Version](https://img.shields.io/badge/version-1.3.1-blue.svg)]()
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
| **Mobile Controls** | Nipple.js (planned) | Virtual joystick library |

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

## 🗺 Hall Layout — Balairung

```
                    NORTH WALL (back)
    ┌───────────────────────────────────────────┐
    │                                           │
    │     [P1]      [P2]      [P3]      [P4]    │   ← Projects(paintings)
    │                                           │
    │                                           │
WEST│                                           │EAST
WALL│  [Contact]                     [Skills]   │WALL
    │  (pedestal)                   (display)   │
    │                                           │
    │                 [About]                   │
    │               (pedestal)                  │
    │                                           │
    │                   ☻                      │   ← Spawn point
    │                                           │
    └─────────────────┤     ├───────────────────┘
                      │DOOR │
                    SOUTH (entrance)
```

---

## 🎮 Controls

| Platform | Movement | Camera | Interact |
|----------|----------|--------|----------|
| Desktop | WASD / Arrow keys | Mouse (pointer lock) | E key or Left click |
| Mobile (portrait) | D-pad | Touch drag or Gyro | A button |
| Mobile (landscape) | Virtual joystick | Touch drag or Gyro | Tap on POI |
| VR (future) | Thumbstick / Teleport | Headset tracking | Controller trigger |

### Gyro & Landscape Mode
When gyro is enabled, a **Landscape** toggle appears. This manually switches the control layout and gyro axis mapping — no auto-detection needed. Portrait uses beta/alpha; landscape uses gamma/alpha. Toggling recalibrates the gyro automatically.

### iOS Note
iOS Safari doesn't support fullscreen API. For best landscape experience, add the site to your home screen (PWA mode).

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
<summary>✅ Completed Versions (v0.1.0 – v1.3.1)</summary>

#### v0.1.0 — Scaffold
Vite + React + TypeScript project setup, Tailwind CSS, Babylon.js deps, GitHub Pages CI/CD.

#### v0.2.0 — Welcome Gate
Device capability detection, mode selection with warnings, state management.

#### v0.3.0 — Fallback Mode
SVG floor plan, sidebar navigation, POI data loading, inspect modal, section filtering, responsive layout.

#### v1.0.0 – v1.0.3 — 3D Core + Performance
Babylon.js procedural hall, first-person camera, WASD + sprint + jump, POI placeholders, collision detection, interaction system, lazy loading with tree-shaking.

#### v1.1.0 – v1.1.6 — Mobile Controls + Gyroscope
Virtual joystick, touch-drag camera, portrait D-pad + A/B buttons, landscape joystick layout, optional gyro camera, manual landscape toggle with axis remapping, fullscreen support, controls hints.

#### v1.2.0 – v1.2.1 — Navigation & UX
Minimap overlay with player tracking and POI labels, click-to-teleport (approach position for POIs), cinematic fly-to camera animation (rise → pan → descend), collapsible 3D sidebar with auto-collapse on pointer lock, "Exit 3D" button across all modes, Game Boy 3DS-style portrait controls, floaty jump physics, mobile speed parity.

#### v1.3.0 — Visual Polish (Theme)
Javanese/Malay royal hall "Teak & Gold" theme: color palette, Cinzel typography, CSS wood-grain textures, gold trim borders, themed welcome screen, themed Game Boy console frame, themed sidebar and fallback mode.

#### v1.3.1 — Visual Polish (3D)
Enhanced 3D hall with ceiling, doorway, baseboards, gold crown molding, corner pillars, procedural wood grain floor. Gold painting frames with thumbnail textures, glass display cases, 3-tier pedestals. Gallery lighting with directional shadows, per-painting spotlights, gold accent lights. Loading screen with progress bar.

</details>

### 🔧 In Progress

#### v1.4.0 — Content Population
- [ ] Real project data and thumbnails
- [ ] About / Skills / Contact content
- [ ] SEO metadata and Open Graph tags

#### v2.0.0 — VR Support
- [ ] WebXR session handling
- [ ] VR controller input
- [ ] Teleport locomotion
- [ ] VR-specific UI panels

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
