# 🏰 Balairung | 3D Portfolio Hall

> An immersive 3D portfolio experience — walk through a grand hall to explore my work.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Version](https://img.shields.io/badge/version-1.1.1-blue.svg)]()
[![Status](https://img.shields.io/badge/status-In%20Development-yellow.svg)]()

---

## 📖 Overview

Balairung | 3D Portfolio Hall is an interactive portfolio website designed as a virtual museum hall. Visitors can explore projects displayed as paintings on walls and artifacts in display cases — either through first-person 3D navigation or a simplified 2D floor plan interface.

**Author:** Muhammad Hazimi Yusri  
**Repository:** Public  
**Hosting:** GitHub Pages (with Cloudflare domain)

---

## 🎯 Project Goals

1. **Showcase work** in an engaging, memorable format
2. **Accessible by default** — fallback mode works everywhere
3. **Progressive enhancement** — 3D as opt-in experience
4. **Future-ready** — architecture supports VR and AI features

---

## 🎨 Theme

**Balairung** — Royal castle hall aesthetic

- Ornate architectural details
- Warm lighting with rich textures
- Deep jewel-tone color palette
- Classic, elegant typography

---

## ✨ Features

### Core (v1.x)
- [ ] Welcome gate with mode selection
- [ ] 2D fallback mode (SVG floor plan + sidebar navigation)
- [ ] 3D grand hall exploration
- [ ] First-person controls (desktop + mobile)
- [ ] Interactive POIs (paintings, display cases)
- [ ] Inspect modal for content viewing
- [ ] Synced minimap with click-to-teleport
- [ ] Fly-to camera animation with fade transition
- [ ] Section-based sidebar navigation

### Future (v2.x+)
- [ ] WebXR/VR support
- [ ] Custom meshes per project
- [ ] AI-tailored experience for recruiters
- [ ] Blog section (separate domain TBD)

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
│   │   ├── engine.ts             # Babylon.js setup
│   │   ├── scene.ts              # Hall scene loader
│   │   ├── controls.ts           # Input handling (desktop/mobile)
│   │   ├── fly-to.ts             # Teleport animation
│   │   └── poi-renderer.ts       # Dynamic POI placement
│   │
│   ├── ui/
│   │   ├── WelcomeScreen.tsx     # Mode selection gate
│   │   ├── Minimap.tsx           # SVG synced minimap
│   │   ├── Sidebar.tsx           # Section navigation
│   │   ├── InspectModal.tsx      # Content viewer
│   │   └── ModeToggle.tsx        # Switch modes anytime
│   │
│   ├── fallback/
│   │   └── SimpleMode.tsx        # Full 2D experience
│   │
│   ├── hooks/
│   │   ├── useDeviceCapability.ts
│   │   └── usePlayerPosition.ts
│   │
│   ├── types/
│   │   └── poi.ts                # POI type definitions
│   │
│   ├── utils/
│   │   └── detection.ts          # WebGL, RAM, motion pref checks
│   │
│   ├── App.tsx
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
| Mobile (landscape) | Left joystick | Right touch drag | Tap on POI |
| Mobile (portrait) | Bottom joystick | Gyro (optional) + touch | Tap on POI |
| VR (future) | Thumbstick / Teleport | Headset tracking | Controller trigger |

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

### Version 0.x — Foundation

#### v0.1.0 — Scaffold ✅
- [x] Initialize Vite + React + TypeScript
- [x] Configure Tailwind CSS
- [x] Setup Babylon.js dependencies
- [x] Project structure created
- [x] GitHub Pages deployment pipeline
- [x] Basic welcome screen placeholder

#### v0.2.0 — Welcome Gate ✅
- [x] Device capability detection
- [x] Mode selection logic with warnings
- [x] Mode state management

#### v0.3.0 — Fallback Mode ✅
- [x] SVG floor plan component
- [x] Sidebar navigation
- [x] POI data loading from JSON
- [x] Click-to-select POI
- [x] Inspect modal component
- [x] Section filtering
- [x] Fully functional without 3D
- [x] Responsive layout

---

### Version 1.x — 3D Experience

#### v1.0.0 — 3D Core ✅
- [x] Babylon.js engine setup
- [x] Hall model loading (procedural)
- [x] Basic lighting setup
- [x] First-person camera
- [x] Desktop controls (WASD + mouse + sprint + jump)
- [x] POI placeholder rendering
- [x] Collision detection (walls + POIs)
- [x] Basic interaction (approach + E key)

#### v1.0.1 - v1.0.3 — Performance ✅
- [x] Lazy load Babylon.js (only loads when entering 3D)
- [x] Tree-shake with deep imports for smaller bundle
- [x] Loading screen with spinner

#### v1.1.0 — 3D Polish
- [ ] Mobile controls (virtual joystick)
- [ ] Gyroscope camera (optional)
- [ ] Minimap component (SVG synced)
- [ ] Player position sync to minimap
- [ ] Click minimap to teleport
- [ ] Fly-to animation with fade
- [ ] Sidebar teleportation
- [ ] Mode toggle (switch anytime)

#### v1.2.0 — Visual Polish
- [ ] Final hall model with theme
- [ ] Painting frames rendered
- [ ] Display case meshes
- [ ] Pedestal meshes
- [ ] Proper lighting
- [ ] Loading screen with progress

#### v1.3.0 — Content Population
- [ ] Real project data
- [ ] Thumbnails created
- [ ] About/Skills/Contact content
- [ ] SEO metadata

---

### Version 2.x — Extended Reality

#### v2.0.0 — VR Support
- [ ] WebXR session handling
- [ ] VR controller input
- [ ] Teleport locomotion
- [ ] VR-specific UI panels

---

### Version 3.x — Intelligence (Backlog)

#### v3.0.0 — AI Integration
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
