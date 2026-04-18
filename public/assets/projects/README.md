# Project Scans

Gaussian splat (`.splat`) files for physical project artifacts displayed on
observatory pedestals.

## Expected files

| File | POI ID | Source project |
|------|--------|----------------|
| `petbot.splat` | `petbot-scan` | PetBot — Raspberry Pi 5 companion robot |
| `stereo-camera.splat` | `stereo-camera-scan` | DIY Stereo Camera rig (COMP3200) |

## Current status (v3.2.0)

Real scans are not yet captured. Until they land, the two observatory scan
POIs in `src/data/pois.json` point `splatPath` at `./assets/avatar/avatar.splat`
as a stand-in so the loader, proximity trigger, and fallback paths can be
exercised end-to-end in development.

When a real scan is ready:

1. Drop the `.splat` file in this directory with the matching filename above.
2. Edit `src/data/pois.json`, update the POI's `custom.splatPath` to point here
   (e.g. `./assets/projects/petbot.splat`).
3. Tune `custom.splatOffset` and `custom.splatScale` in `pois.json` to seat the
   scan correctly on the pedestal top (pedestal top surface is at y ≈ 0.95
   in local group space).

## Scanning workflow

Physical-object scanning differs from the person-scanning workflow in
[docs/AVATAR_GUIDE.md](../../../docs/AVATAR_GUIDE.md):

- **Lighting**: diffuse, even — avoid harsh shadows on the object
- **Background**: plain matte surface (grey card, neutral cloth)
- **Distance**: 30–50 cm from the object, full orbit in 2–3 passes
- **Occluders**: remove cables, hands, dust covers before scanning
- **Export**: `.ply` from Polycam/Scaniverse → clean in SuperSplat → export `.splat`
- **Target size**: 5–15 MB per scan (smaller than avatar — objects are less complex)

## Fallback

If a `.splat` file is missing, network-failing, or the visitor's device lacks
WebGL2, the pedestal shows a floating thumbnail card using the POI's
`content.thumbnail` image — no console errors, no retries.
