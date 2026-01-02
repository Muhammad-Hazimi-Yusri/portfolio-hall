# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- 2D fallback mode (SVG floor plan)
- 3D grand hall exploration

---

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
