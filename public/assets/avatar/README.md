# Avatar Assets

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
