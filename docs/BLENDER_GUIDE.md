# Blender → Babylon.js Export Guide

Workflow for exporting architectural assets from Blender and dropping them into the portfolio-hall scene.

---

## Export Settings

**File → Export → glTF 2.0 (.glb/.gltf)**

| Setting | Value |
|---------|-------|
| Format | **GLB** (binary, single file) |
| Include | **Selected Objects** only — export one asset at a time |
| Transform → +Y Up | **ON** — Babylon.js uses Y-up convention |
| Geometry → Apply Modifiers | **ON** |
| Geometry → UVs | **ON** |
| Geometry → Normals | **ON** |
| Geometry → Tangents | **ON** |
| Materials → Export Materials | **ON** |
| Materials → Images | **JPEG** — keeps texture file size small |
| Animation | **OFF** — all assets are static architecture |

---

## Scale

**1 Blender unit = 1 metre in Babylon.js.**

Before starting a new asset, place a reference cube in Blender:
- Add a box, set dimensions to **1.8 × 1.8 × 1.8 m** (human height)
- Keep it in the scene while modelling to check proportions
- Delete the reference cube before exporting

Quick reference:
- Pillar shaft: 3.5 m tall → 3.5 Blender units
- Door opening: 3.0 m wide → 3.0 Blender units
- Wall height: 4.0 m (Main Hall), 5.0 m (Reception / Garden) — don't exceed this

---

## Origin Point Convention

**Set the origin to the base-centre of every asset before exporting.**

In Blender: `Object → Set Origin → Origin to Geometry`, then manually move origin to floor level if needed, or use a custom origin:
1. Tab into Edit Mode
2. Select the bottom face / bottom vertices
3. `Shift + S → Cursor to Selected`
4. Tab back to Object Mode
5. `Object → Set Origin → Origin to 3D Cursor`

Why this matters: in Babylon.js the position vector sets where the origin lands in world space. With the origin at the base centre, setting `position.y = 0` places the asset flush on the floor — no manual offset needed.

---

## Triangle Budget

Keep the scene performant on Quest browser (WebXR target).

| Asset type | Target | Max |
|-----------|--------|-----|
| Pillar | 500–2 000 tris | 3 000 |
| Doorway arch | 1 000–3 000 tris | 4 000 |
| Molding segment (1 m) | 200–500 tris | 800 |
| Furniture piece | 1 000–5 000 tris | 8 000 |

**Scene-level budgets:**
- Decorative assets (pillars, arches, molding): ~20 000–50 000 tris combined
- Total scene: **under 200 000 triangles** for comfortable Quest browser performance

Check triangle count in Blender: `Overlay menu (top-right viewport) → Statistics → Triangles`.

---

## Color Palette

Use these as your Blender material base colours. The asset loader will remap materials to scene theme materials on load, but matching these values means the fallback box/cylinder placeholder colours will already be close.

| Name | Hex | Used for | `SceneMaterials` key |
|------|-----|----------|----------------------|
| Teak dark | `#3D2B1E` | walls, frames | `wall` |
| Teak light | `#5C4033` | pillar shafts, furniture bodies | `teak` |
| Gold | `#C9A84C` | capitals, trim, molding | `gold` |
| Batik red | `#B8432F` | accent decorations | — (no scene mat yet) |
| Stone | `#4A4540` | courtyard surfaces | `stone` |
| Parchment | `#E8DFD0` | light surfaces, text panels | — |
| Dark base | `#1C1410` | floor, dark recesses | `floor` |
| Surface mid | `#2A1F18` | ceiling | `ceiling` |

**Tip:** For the Blender viewport, set each material's Base Color to the hex above. The pipeline will handle the engine-side material assignment automatically.

---

## Naming Convention

```
{category}-{variant}-{number}.glb
```

Examples:
```
pillar-ornate-01.glb
doorway-arch-pointed-01.glb
molding-crown-01.glb
throne-reception-01.glb
```

Rules:
- Lowercase only
- Hyphens between words, no underscores
- Two-digit number suffix (`01`, `02`, …) — allows variants later
- Keep it short; the filename becomes the asset ID in the manifest

---

## Testing Workflow

1. **Export** the `.glb` from Blender using the settings above
2. **Drop** it into `/public/assets/models/`
3. **Open** `src/3d/assetManifest.ts` and find the matching entry in `assetLibrary`
   - If an entry already exists: update `glbPath` if needed, it will load automatically
   - If no entry exists: add one (see `AssetEntry` type at the top of the file)
4. **Add or verify** a placement in `assetPlacements` with the correct `position` and `zone`
5. **Run** `npm run dev` and check in the browser — open the browser console for any load errors
6. **Test in VR** on Quest if available — check scale with the room geometry

**Common issues:**
- Asset appears tiny or giant → origin not set to base-centre, or scale not applied (`Ctrl + A → All Transforms` before export)
- Asset invisible → GLB path typo, or `fallbackType: 'none'` with a missing file (procedural mesh still shows)
- Materials look wrong → check `materialMode` on the entry (`'keep'` preserves Blender mats, `'remap'` uses scene theme)
- Shadows missing → set `castShadows: true` and/or `receiveShadows: true` on the placement

---

## Dev Iteration Workflow

These tools are only active in development (`npm run dev`). They are eliminated from the production build automatically.

### Debug overlay

Press **`` ` ``** (backtick) to toggle the asset debug overlay (fixed, top-right corner).

The overlay shows:

- **FPS** — live frame rate (target: ≥ 60 on desktop, ≥ 36 on Quest browser)
- **Tris** — total triangle count summed across all loaded assets
- **Active meshes** — number of meshes Babylon.js drew last frame
- A table row per entry in `assetLibrary`:

| Column | Meaning |
|--------|---------|
| Asset | Asset ID from the manifest |
| Status | ⏳ pending / ✅ loaded / ⚠️ fallback / ❌ error |
| Tris | Triangle count (accumulated across all placements) |
| Mats | Unique material count |
| ms | Load time in milliseconds |
| Button | Toggle between GLB and fallback geometry (see below) |

### Asset-only reload

After dropping a new or updated `.glb` into `/public/assets/models/`, press:

**`Ctrl + Shift + R`** — disposes all managed meshes and re-runs the full load cycle without restarting the dev server or losing camera position.

This is faster than a full page reload because the Babylon.js engine, scene, lighting, camera, and POI meshes are all preserved. Only the asset meshes are replaced.

> Note: a plain browser refresh also works and picks up new files — Vite serves `/public/` as static files so the updated `.glb` is available immediately on the next request.

### A/B comparison toggle

Each row in the debug overlay has a **→ fallback** / **→ GLB** button. Clicking it:

- **→ fallback**: disposes the loaded GLB mesh and shows the procedural box/cylinder placeholder
- **→ GLB**: disposes the placeholder and re-triggers the GLB import

Use this to compare a fresh Blender export against the placeholder without leaving the scene.

### Typical iteration loop

1. **Model** the asset in Blender and export to `/public/assets/models/`
2. In the browser: press `Ctrl+Shift+R` — the new file loads in place
3. Press `` ` `` to open the debug overlay and confirm ✅ loaded + triangle count
4. Check FPS — stay well under the scene budget (< 200 k total tris)
5. Click **→ fallback** to compare against the placeholder size/shape
6. Adjust in Blender, re-export, repeat from step 2

### File size guidance

Keep each `.glb` **under 5 MB** and commit it directly to the repo. GitHub Pages serves them as static files, so they must be present in the repository (not gitignored). If the repo grows large later, set up Git LFS with:

```sh
git lfs track "*.glb"
git add .gitattributes
```
