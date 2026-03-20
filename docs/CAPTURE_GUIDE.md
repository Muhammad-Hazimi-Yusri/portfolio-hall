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
├── tour-arrival-distant.png
├── tour-arrival-close.png
├── tour-gallery-entrance.png
├── tour-gallery-early.png
├── tour-gallery-mid.png
├── tour-gallery-deep.png
├── tour-observatory-approach.png
├── tour-observatory-center.png
├── tour-horizon-start.png
└── tour-horizon-end.png
```

Then commit the images.

## When to Re-capture

Re-run the capture tool whenever you change:
- Environment geometry (`src/3d/scene.ts`)
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
| arrival-distant | 0.00 | Intro |
| arrival-close | 0.10 | Intro |
| gallery-entrance | 0.15 | Projects |
| gallery-early | 0.25 | Projects |
| gallery-mid | 0.40 | Projects |
| gallery-deep | 0.55 | Projects |
| observatory-approach | 0.65 | Impact |
| observatory-center | 0.75 | Impact |
| horizon-start | 0.85 | Contact |
| horizon-end | 1.00 | Contact |
