# Avatar Guide

How to create and configure the self-portrait avatar for the arrival platform.

## Overview

The avatar system supports three tiers:
1. **Gaussian splat** (`.splat`) — photorealistic point cloud, lazy-loaded on toggle
2. **Low-poly mesh** (`.glb`) — lightweight 3D model, loaded by default
3. **Procedural placeholder** — auto-generated silhouette if no files present

## LiDAR Scanning

### Equipment
- iPhone 13 Pro or newer (LiDAR sensor required)
- Polycam app (recommended) or Scaniverse

### Scanning Tips
- Bright, even lighting — outdoors overcast is ideal
- Wear non-reflective, non-black clothing
- Stand still on a plain surface (grass or concrete)
- Have someone scan you, or use a timer/tripod
- 2-3 full orbits: waist height, chest height, above head
- Keep ~1-1.5m distance from the subject
- Move slowly and steadily — avoid jerky motions

## Exporting

### Low-poly mesh (.glb)
1. Open scan in Polycam
2. Use the mesh reduction tool — target ~50k faces
3. Export as **GLB** format
4. Rename to `avatar.glb`
5. Target file size: 2-5MB

### Gaussian splat (.splat)
**Option A — via SuperSplat:**
1. Export from Polycam/Scaniverse as `.ply`
2. Open in [SuperSplat](https://playcanvas.com/supersplat)
3. Clean up stray points around the edges
4. Export as `.splat` (compressed)

**Option B — direct export:**
1. Export directly as `.splat` from Scaniverse (if supported)

Rename to `avatar.splat`. Target file size: 10-30MB.

## File Placement

```
public/assets/avatar/
  avatar.glb     # Low-poly mesh
  avatar.splat   # Gaussian splat
```

The system auto-detects which files are present and falls back gracefully.

## Configuration

Edit `src/3d/avatarConfig.ts` to adjust:

```ts
export const AVATAR_CONFIG = {
  position: { x: -1.5, y: 0, z: 0 },  // On arrival platform
  rotation: 0,                          // Degrees, facing +Z
  scale: 1.0,                           // Uniform mesh scale
  splatOffset: { x: 0, y: 0, z: 0 },   // Fine-tune splat position
  splatScale: 1.0,                      // Splat-specific scale
}
```

After placing your real scan, you'll likely need to adjust:
- **scale** — real scans vary in size depending on scanning distance
- **splatOffset** — splat and mesh origins may not align perfectly
- **position.y** — adjust if the model floats or clips through the floor

## Testing

1. Run `npm run dev`
2. Navigate to the arrival platform (Z ≈ 0)
3. The avatar should be visible to the left of the spawn point
4. In free-roam mode, a toggle button appears (bottom-left) if the splat is available
5. Click to switch between "3D Mesh" and "Splat View"
6. The first splat toggle may take a moment to load (file is 10-30MB)

## Troubleshooting

- **No avatar visible**: Check browser console for `[Avatar]` warnings
- **Splat toggle missing**: Requires WebGL2 — check with `about:gpu` in Chrome
- **Model floating/underground**: Adjust `position.y` in avatarConfig.ts
- **Splat misaligned with mesh**: Adjust `splatOffset` values
- **Large splat file slow to load**: Consider running through SuperSplat with aggressive compression
