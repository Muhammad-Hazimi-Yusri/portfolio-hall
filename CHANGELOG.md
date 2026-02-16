# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Visual polish (final hall model, lighting, textures)
- Content population (real project data, thumbnails)

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
