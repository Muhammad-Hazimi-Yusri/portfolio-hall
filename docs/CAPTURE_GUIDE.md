# Tour Capture Guide

The capture tool generates pre-rendered screenshots from the 3D scene for the 2D fallback layer (`TourFallback`). Non-WebGL devices see these images instead of the live Babylon.js scene.

## Running Capture Mode

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Visit `http://localhost:5173/?capture=true`
3. Wait for "Scene loading..." to finish (the full 3D scene is spun up)
4. Click **Capture All** — the tool iterates through 10 camera positions, capturing a 1920×1080 screenshot at each
5. Watch the progress indicator and preview grid on the right
6. When complete, click **Download All** (or click individual thumbnails)

## Placing Output Files

Move the downloaded PNGs into:

```
public/tour-captures/
├── tour-gate-approach.png
├── tour-gate-enter.png
├── tour-hall-entry.png
├── tour-hall-mid-left.png
├── tour-hall-mid-right.png
├── tour-hall-deep.png
├── tour-courtyard-entry.png
├── tour-courtyard-mid.png
├── tour-garden-entry.png
└── tour-garden-settle.png
```

Then commit the images.

## When to Re-capture

Re-run the capture tool whenever you change:
- Castle geometry (`src/3d/scene.ts`)
- Lighting setup (`src/3d/lights.ts`)
- Materials (`src/3d/materials.ts`)
- Camera path waypoints (`src/3d/tourPath.ts`)
- GLB assets (`public/assets/models/`)

## Testing the Fallback

Force the 2D fallback on a WebGL-capable device:

```
http://localhost:5173/?force2d=true
```

The fallback layer crossfades between capture images as you scroll, with subtle CSS parallax. Missing images degrade gracefully to a solid dark background.

## Capture Points

Defined in `src/3d/tourCaptures.ts`. Each point maps to a scroll progress value matching the tour camera path:

| ID | Progress | Section |
|----|----------|---------|
| gate-approach | 0.00 | Intro |
| gate-enter | 0.12 | Intro |
| hall-entry | 0.15 | Projects |
| hall-mid-left | 0.30 | Projects |
| hall-mid-right | 0.45 | Projects |
| hall-deep | 0.55 | Projects |
| courtyard-entry | 0.65 | Impact |
| courtyard-mid | 0.75 | Impact |
| garden-entry | 0.85 | Contact |
| garden-settle | 1.00 | Contact |
