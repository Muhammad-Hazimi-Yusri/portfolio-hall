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
