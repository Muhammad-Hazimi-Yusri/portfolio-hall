# Balairung | 3D Portfolio Hall

> **Balairung** /bə-ˈlaɪ-ruŋ/ — *noun, Malay*
>
> A grand royal hall or throne room; the ceremonial heart of a palace where audiences are received and important gatherings held.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Version](https://img.shields.io/badge/version-3.2.5-blue.svg)]()
[![Status](https://img.shields.io/badge/status-In_Progress-yellow.svg)]()

<details>
<summary>Table of Contents</summary>

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Project Goals](#project-goals)
- [Theme](#theme)
- [Architecture](#architecture)
- [Hall Layout](#museum-layout)
- [Controls](#controls)
- [Development Roadmap](#development-roadmap)
- [Getting Started](#getting-started)
- [License](#license)
- [Changelog](#changelog)
- [Contact](#contact)

</details>

---

## Overview

Balairung is an interactive portfolio website built as a scroll-driven guided tour through a 3D open-air boardwalk museum. Visitors scroll to follow a camera path through the museum, reading about projects, experience, and skills as content panels overlay the 3D scene. At any point, they can unlock free-roam mode to explore the museum in first-person 3D with full WASD/VR controls.

**Author:** Muhammad Hazimi Yusri
**Repository:** Public
**Hosting:** GitHub Pages

## Live Demo

**[View Live → muhammad-hazimi-yusri.github.io/portfolio-hall](https://muhammad-hazimi-yusri.github.io/portfolio-hall/)**

---

## Project Goals

1. **Showcase work** in an engaging, memorable format
2. **Accessible by default** — content-first scroll experience works everywhere
3. **Progressive enhancement** — 3D as visual layer, free-roam as opt-in
4. **Future-ready** — architecture supports VR and AI features

---

## Theme

Balairung uses a **Frutiger Aero modern museum** aesthetic — clean, bright, and optimistic:

- **Color palette**: "Aero Glass" — cool whites (#F5F7FA), sky blue accents (#38BDF8), indigo-violet secondary (#818CF8), slate text on light backgrounds
- **Typography**: Space Grotesk (headings), Inter (body text)
- **UI texture**: Glass-morphism panels with backdrop blur, subtle borders, soft shadows
- **3D environment**: Open-air boardwalk museum over reflective water, bright sky dome, linear pathway with fog at the horizon

---

## Architecture

### How It Works

The site has three rendering layers that work together:

```
┌──────────────────────────────────────────────────────┐
│                     App.tsx                           │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │              ScrollController                    │ │
│  │                                                  │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │ │
│  │  │ TourCanvas │  │ Progress   │  │ TourContent│ │ │
│  │  │ (3D layer) │  │ Bar        │  │ (content)  │ │ │
│  │  └────────────┘  └────────────┘  └────────────┘ │ │
│  │       or                                         │ │
│  │  ┌──────────────┐                                │ │
│  │  │ TourFallback │ (2D screenshots, no WebGL)     │ │
│  │  └──────────────┘                                │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │           FreeRoamWrapper (explore mode)         │ │
│  │  ┌──────────────┐  ┌───────────────┐            │ │
│  │  │ BabylonScene │  │ ProgressStrip │            │ │
│  │  │ (full 3D)    │  │ (nav bar)     │            │ │
│  │  └──────────────┘  └───────────────┘            │ │
│  └─────────────────────────────────────────────────┘ │
│                                                      │
│          pois.json (single source of truth)           │
└──────────────────────────────────────────────────────┘
```

**Tour mode** (default): User scrolls through a 500vh container. Scroll progress (0→1) drives:
- Camera position along a 13-waypoint spline path through the museum
- Content panel visibility (intro → hero projects → compact cluster → impact → contact)

**Free-roam mode** (opt-in): User clicks "Explore the hall yourself" to unlock first-person 3D navigation with all v1.x features (WASD, joystick, minimap, sidebar, VR, POI interaction).

**Fallback**: Non-WebGL devices see pre-rendered screenshots instead of the 3D canvas. Same content, same scroll timing.

### Key Files

| Area | File | Purpose |
|------|------|---------|
| Entry | `src/App.tsx` | Route between tour/explore/capture modes |
| Data | `src/data/pois.json` | All POI content (16 entries) |
| Tour | `src/components/tour/TourContent.tsx` | Content overlay orchestrator |
| Tour | `src/components/tour/TourCanvas.tsx` | On-rail Babylon.js camera |
| Tour | `src/components/tour/ScrollController.tsx` | 500vh scroll container + context |
| Tour | `src/3d/tourPath.ts` | Camera spline waypoints + smoothstep interpolation |
| 3D | `src/3d/BabylonScene.tsx` | Full free-roam 3D component |
| 3D | `src/3d/scene.ts` | Environment geometry (boardwalk, water, sky) |
| 3D | `src/3d/materials.ts` | Shared material factory (8 materials) |
| 3D | `src/3d/assetManifest.ts` | GLB asset placements |
| Nav | `src/components/ProgressStrip.tsx` | Linear progress bar for free-roam |
| Utils | `src/utils/detection.ts` | WebGL, mobile, reduced-motion checks |

### Tech Stack

| Layer | Technology |
|-------|------------|
| 3D Engine | Babylon.js 7.x |
| UI | React 18, TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Mobile Controls | Nipple.js |
| VR | Babylon.js WebXR |
| Hosting | GitHub Pages |

---

## Museum Layout

```
Z=0          Z=8                              Z=58        Z=68           Z=83-90
  ╭───╮      ┌──────────────────────────────┐  ╭─────────╮  ┌──────────┐
  │   │──────│         GALLERY              │──│OBSERVA- │──│ HORIZON  │
  │ARR│      │  (10 project paintings on    │  │  TORY   │  │ (contact │
  │   │      │   left wall, facing right)   │  │(exp/    │  │  at end) │
  ╰───╯      │   width=10, wall at x=-5    │  │ skills/ │  │ width=4  │
  d=8        └──────────────────────────────┘  │hackath.)│  └──────────┘
  spawn                                        ╰─────────╯
  (about)                                       d=14
```

| Zone | Z range | Purpose | Tour scroll range |
|------|---------|---------|-------------------|
| Arrival | 0–4 | Intro, spawn point | 0.00–0.15 |
| Gallery | 8–58 | 6 hero + 4 compact projects | 0.15–0.65 |
| Observatory | 58–75 | Experience, skills, hackathons | 0.65–0.85 |
| Horizon | 75–90 | Contact, vanishing point | 0.85–1.00 |

---

## Controls

### Tour Mode (scroll)
| Action | Input |
|--------|-------|
| Navigate | Scroll (mouse wheel, trackpad, touch drag) |
| Unlock free-roam | Click "Explore the hall yourself" CTA |

### Free-Roam Mode
| Platform | Movement | Camera | Interact |
|----------|----------|--------|----------|
| Desktop | WASD / Arrow keys | Mouse (pointer lock) | E key |
| Mobile (portrait) | D-pad | Touch drag or Gyro | A button |
| Mobile (landscape) | Virtual joystick | Touch drag or Gyro | Tap POI |
| VR Controllers | Left stick: walk, Right fwd: teleport, Right L/R: snap turn | Headset | Trigger |
| VR Hands | Gaze + left pinch: teleport | Headset | Right pinch |

### URL Parameters
| Parameter | Effect |
|-----------|--------|
| `#explore` | Open directly in free-roam mode |
| `?capture=true` | Dev-only screenshot capture tool |
| `?force2d=true` | Force 2D fallback (testing) |

### Dev Shortcuts (dev builds only)
| Key | Action |
|-----|--------|
| `` ` `` (backtick) | Toggle asset debug overlay |
| `Ctrl+Shift+R` | Reload GLB assets without page refresh |

---

## Development Roadmap

<details>
<summary>Completed Versions (v0.1.0 – v3.2.0)</summary>

#### v0.1.0 – v0.3.0 — Foundation
Project scaffold, welcome gate, SVG floor plan fallback mode.

#### v1.0.0 – v1.1.6 — 3D Core + Mobile
Babylon.js procedural hall, first-person camera, WASD/sprint/jump, POI interaction, virtual joystick, portrait D-pad, gyroscope controls.

#### v1.2.0 – v1.5.1 — Navigation & VR
Minimap with dynamic zoom, cinematic fly-to teleport, collapsible sidebar, WebXR immersive-VR (Quest browser), hand tracking, VR inspect panels, locomotion comfort features.

#### v1.6.0 — 2D Mode Revamp
Complete rebuild of 2D fallback as scroll portfolio with story-driven project cards, SVG pathway map, and intersection observer animations.

#### v1.7.0 — Blender Asset Pipeline
GLB import pipeline with config-driven manifest, material mapping, collision proxies, dev hot-reload, and debug overlay.

#### v2.0.0 — Scroll Engine
Architecture pivot to scroll-driven guided tour. ScrollController with 500vh runway and 0→1 progress tracking.

#### v2.1.0 — Content Layer
IntroSection with clip-path name reveal, 6 hero projects with staggered story blocks, compact cluster grid, impact section, contact CTA.

#### v2.2.0 — 3D Visual Layer
Babylon.js canvas behind content with camera-on-rail following 13-waypoint spline path driven by scroll progress.

#### v2.3.0 — 2D Fallback Layer
Pre-rendered screenshot fallback for non-WebGL devices. Dev capture tool (`?capture=true`).

#### v2.4.0 — Free-Roam Unlock
"Explore the hall yourself" CTA, smooth tour→explore transitions, URL routing (`#explore`), return-to-tour button.

#### v2.5.0 — Aero Glass Theme + New 3D Environment
Frutiger Aero color system, open-air boardwalk museum over water, Space Grotesk typography, glass-morphism CSS, sky dome with fog, all POIs remapped to linear layout.

#### v2.6.0 — Launch Polish
Glass-panel contrast on all tour content panels, ProgressStrip replacing Minimap, Space Grotesk font locked in, TODO placeholders replaced with real content, focus-visible styles, ARIA landmarks, prefers-reduced-motion CSS, legacy mode removed, dead code cleanup.

#### v3.0.0 — Rich Gallery Wall
Animated slideshow system for gallery paintings — each painting cycles through 2-4 project screenshots with crossfade transitions. Preloaded texture pipeline with per-image error handling, staggered start for performance, distance-based pausing in free-roam mode. Graceful degradation: 0 images → title card fallback, 1 → static, 2+ → animated crossfade.

#### v3.1.0 — 3D Self-Portrait (Scan + Splat Avatar)
Avatar display system on arrival platform with three-tier degradation: gaussian splat (lazy-loaded on toggle) → low-poly GLB mesh (default) → procedural placeholder. AvatarToggle UI for switching between mesh and splat in free-roam mode. Lazy splat loading saves bandwidth for visitors who never toggle.

#### v3.2.0 — Gaussian Splat Project Displays
Observatory pedestals for physical project artifacts. New `custom` POI type with splat config, proximity-triggered lazy loader (`projectSplatLoader.ts`) that fires at 6 m range, SplatLoadIndicator toast while downloading, and floating thumbnail placeholder as weak-device / load-failure fallback. Two new POIs (`petbot-scan`, `stereo-camera-scan`) flank the skills display on the observatory platform. Real LiDAR scans land in a follow-up patch — infrastructure ships with a stand-in splat asset.

#### v3.2.1 — Mobile Polish
Hardens the tour layout against horizontal overflow on small viewports (`overflow-x-hidden` on the scroll runway, ImpactSection, and `html/body`; `overscroll-behavior: none` to stop rubber-band; `500dvh` scroll runway so iOS URL-bar chrome doesn't distort the scroll range). Raises free-roam touch-look sensitivity with a viewport-relative formula — a full-screen swipe now turns ~1.5 full views regardless of DPR/device.

#### v3.2.2 — Mobile Clip Fix
Stops tour content getting hidden under iOS Safari's URL bar and top nav on portrait phones. Content overlay switched from `fixed inset-0` (large-viewport height) to `fixed top-0 left-0 right-0 + height: 100dvh` (dynamic-viewport height). Every tour section anchors to the top on mobile (`items-start sm:items-center`), has internal `overflow-y-auto` so tall cards can be scrolled, carries `pt-12` to clear the 36 px `TourNavBar`, and honours `env(safe-area-inset-bottom)`. Viewport meta gains `viewport-fit=cover` so the safe-area envs actually resolve.

#### v3.2.3 — Mobile Density
Tightens typography, padding, and inter-block margins on `HeroProject` and `ImpactSection` at narrow breakpoints so each card fits the viewport without needing internal scroll (which doesn't capture touch anyway — the tour overlay is `pointer-events-none` so every gesture advances the tour). Title / body text drop one tier at `< sm`, panel padding goes `p-4 sm:p-6 md:p-8`, and inter-section margins collapse. Desktop (≥ 640 px) is visually unchanged.

#### v3.2.4 — Gyro Robustness
Makes the free-roam gyro tolerant of flaky phone sensors. Exponential low-pass smoothing on alpha/beta/gamma (`GYRO_SMOOTH_ALPHA = 0.25`) soaks up jitter while staying responsive to real motion; the seam-aware `lerpAngleDeg` helper handles the 360°→0° wrap so yaw smoothing doesn't snap. Adds a **Recenter** button (shown next to Gyro/Landscape only when gyro is on) that re-zeros the baseline to the current phone pose — escape hatch for slow drift without toggling Gyro off and on. Touch-drag sensitivity, VR, and desktop input paths unchanged.

#### v3.2.5 — Unified Touch-Drag Sensitivity
Gyro-ON touch-drag sensitivity now matches gyro-OFF (`TOUCH_LOOK_GYRO_OFFSET_YAW = TOUCH_LOOK_FULL_SCREEN_YAW`). The v3.2.1 "nudge on top of gyro" philosophy (1/3 the strength) felt sluggish in practice — users expect drag to feel the same regardless of whether gyro is active.

#### v3.3.0 — Painting Captions
Adds an optional caption strip beneath each gallery painting that fades in lockstep with the v3.0.0 slideshow. New `content.captions: string[]` field on POIs (parallel to `thumbnails`, optional and backwards-compatible) drives a `DynamicTexture`-backed plane parented to the painting group; the existing `'showing' → 'fading-out' → 'fading-in'` state machine in `paintingSlideshow.ts` now also drives the caption material's alpha and re-renders the caption text at the swap moment, so visitors read "Topic graph view → Progress dashboard → Cross-device sync" alongside the slides. Paintings without `captions` are visually unchanged. The iframe-on-3D-plane stretch from the v3.3.0 spec is deferred to a future release — see `docs/V3.3.0_PLAN.md` for the tradeoffs (cross-origin texture sampling, CSP `frame-ancestors`, pointer-event handoff, no-occlusion DOM overlay).

</details>

### Upcoming

#### v3.x — Gallery Content + Advanced Displays

##### v3.3.1 — Iframe Web Panels (Deferred Stretch)
- [ ] Iframe-on-3D-plane for live website browsing (desktop only, stretch goal)
- [ ] DOM overlay positioned to match 3D plane projection via `Vector3.Project` + `matrix3d`
- [ ] Browse / Stop-browsing toggle to coordinate pointer-lock vs. iframe focus
- [ ] VR fallback to slideshow mode (iframes don't render in WebXR)
- [ ] Per-site `Content-Security-Policy: frame-ancestors` config on the two author-owned Live URLs

##### v3.4.0 — VR Hardening
- [ ] End-to-end VR playtest on Quest Pro
- [ ] Bug triage and fix pass from playtest findings
- [ ] VR comfort tuning (vignette, snap turn, locomotion speed)
- [ ] Performance profiling on-device (shadow maps, draw calls)
- [ ] VR UX polish (panel placement, hover feedback, interaction range)

#### v4.x — Future (Deferred)
- [ ] AI visitor type detection
- [ ] LLM integration for dynamic tour narration
- [ ] Dynamic content prioritization based on visitor behavior

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall.git
cd portfolio-hall
npm install
npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build (tsc + vite) |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript check |

---

## License

**Proprietary — All Rights Reserved**

Copyright 2025-present Muhammad Hazimi Yusri. See [LICENSE](./LICENSE).

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## Contact

**Muhammad Hazimi Yusri**
- GitHub: [Muhammad-Hazimi-Yusri](https://github.com/Muhammad-Hazimi-Yusri)
- Email: [muhammadhazimiyusri@gmail.com](mailto:muhammadhazimiyusri@gmail.com)

---

<p align="center">
  <i>Built with Claude AI and water</i>
</p>
