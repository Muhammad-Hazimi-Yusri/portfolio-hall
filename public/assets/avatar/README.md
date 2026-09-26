# Avatar Assets

## Current status — 23 September 2026

No portrait asset is currently configured. `avatar.glb` is absent, and a visual
review of the existing `avatar.splat` showed a LEGO object on a black display
surface, not a person. That original file is retained unchanged for provenance
review; it is not loaded by the hall or advertised as a portrait.

`src/3d/avatarConfig.ts` leaves both asset paths empty. The loader returns before
requesting assets and no longer substitutes a cylinder-and-sphere person after
a failed model request. Configure a genuine, reviewed portrait before enabling
the optional model/scan controls. The export notes below are historical setup
guidance; they do not describe the provenance of the bundled file.

Replace these files with your real LiDAR scan exports:

## avatar.glb
- Export from Polycam as GLB
- Reduce to ~50k faces in Polycam before export
- Target file size: 2-5MB

## avatar.splat
- Export from Polycam/Scaniverse as .ply, then convert:
  - Open in https://playcanvas.com/supersplat
  - Clean up stray points
  - Export as .splat (compressed)
- Or export directly as .splat from Scaniverse
- Target file size: 10-30MB

## Scanning tips
- Use Polycam LiDAR mode on iPhone 13 Pro+
- Bright, even lighting (outdoors overcast ideal)
- Non-reflective, non-black clothing
- 2-3 full loops: waist, chest, above head height
- ~1-1.5m scanning distance
