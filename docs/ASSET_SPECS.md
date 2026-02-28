# Asset Specifications — First Batch

Dimensions, style notes, and manifest cross-references for the first four Blender assets.
See [BLENDER_GUIDE.md](./BLENDER_GUIDE.md) for export settings and testing workflow.

---

## 1. Ornate Pillar

**File:** `pillar-ornate-01.glb`
**Manifest ID:** `pillar-ornate-01`
**Category:** pillar
**Placements:** 12 total — 6 in Reception, 4 in Main Hall, 2 in Garden

### Dimensions
| Part | Dimension |
|------|-----------|
| Total height | **3.5 m** |
| Base diameter | ~0.4 m (wider base, can flare to ~0.6–0.7 m) |
| Shaft diameter | ~0.3–0.4 m (taper upward slightly) |
| Capital height | ~0.25 m |

### Style
Javanese / Malay inspired column. Reference: Rumah Melayu columns, wayang-stage pillars.

- **Base:** slightly flared or stepped plinth, octagonal or round
- **Shaft:** tapered, smooth or subtly faceted — no heavy fluting
- **Capital:** widened crown with carved motifs — lotus petals, cloud scrolls, or a stylised *bunga* (flower) pattern; gold-coloured
- **Feeling:** dignified, warm, not too ornate — this is repeated 12 times so keep it readable at a glance

### Materials
- Body (shaft + base): teak — `#5C4033`
- Capital: gold — `#C9A84C`

### Polycount target
500–2 000 triangles. Keep it efficient — 12 instances in the scene.

### Placement positions (from manifest)
```
Reception:   (-4, 0, 10)  (0, 0, 10)  (4, 0, 10)
             (-4, 0, 15)  (0, 0, 15)  (4, 0, 15)
Main Hall:   (-7, 0, -21) (7, 0, -21) (-7, 0, -9) (7, 0, -9)
Garden:      (-19, 0, -5) (-19, 0, 5)
```

---

## 2. Doorway Arch

**File:** `doorway-arch-01.glb`
**Manifest ID:** `doorway-frame-01` *(existing manifest entry — rename if desired when swapping in)*
**Category:** doorway
**Placements:** 3 — Reception entrance (z=18), Courtyard→Main Hall (z=−8), Courtyard→Garden (x=−8)

### Dimensions
| Dimension | Value |
|-----------|-------|
| Opening width | **3.0 m** *(matches `DOOR_WIDTH = 3` in scene.ts)* |
| Opening height | **3.0 m** |
| Frame depth | **0.3 m** *(matches `WALL_THICKNESS = 0.3`)* |
| Outer frame width | opening + ~0.15 m each side |

### Style
Pointed or horseshoe arch with Malay / Islamic influence. Reference: traditional Malay gateway arches (*gerbang*), Moorish horseshoe arches.

- **Arch shape:** pointed ogee or horseshoe — avoid pure semicircle
- **Frame:** carved relief along the inner edge of the arch opening
- **Gold trim:** thin gilded band runs along the innermost edge of the arch
- **Sides:** simple rectangular frame posts matching `WALL_THICKNESS` depth
- **No door leaf** — this is an open passage frame only

### Materials
- Frame body: teak — `#3D2B1E`
- Inner trim: gold — `#C9A84C`

### Polycount target
1 000–3 000 triangles.

### Placement positions (from manifest)
```
Reception entrance: (0, 0, 18)   — Z-facing
Courtyard south:    (0, 0, -8)   — Z-facing
Courtyard west:     (-8, 0, 0)   — X-facing (rotate Y 90°)
```

---

## 3. Crown Molding Segment

**File:** `molding-crown-01.glb`
**Manifest ID:** `crown-molding-segment` *(existing manifest entry)*
**Category:** molding
**Placements:** 3 segments currently in Main Hall (north, east, west walls at y=3.925)

### Dimensions
| Dimension | Value |
|-----------|-------|
| Length | **1.0 m** (tiled end-to-end along walls) |
| Height | ~0.15 m |
| Depth | ~0.1 m |

### Style
Carved teak molding with a repeating decorative pattern. Runs along the top of interior walls just below the ceiling.

- **Pattern:** repeating geometric motif — diamond lattice, stepped chevron, or *khat* (Arabic-influenced) bands
- **Profile:** classic crown molding cross-section (angled upper face, flat back)
- **Ends:** square-cut so segments butt cleanly against each other

### Materials
Gold coloured — `#C9A84C`.

### Polycount target
200–500 triangles per segment. **Note:** this segment is tiled many times along all walls. If the total scene triangle cost is too high when tiled, keep the procedural version instead — model it, but don't integrate until the count is verified.

### Placement positions (from manifest)
```
Main Hall north:  (0,     3.925, -21.85)
Main Hall east:   (7.85,  3.925, -15)
Main Hall west:   (-7.85, 3.925, -15)
```
Molding height `y=3.925` = `WALL_HEIGHT(4) − 0.075` (half-segment height offset from ceiling).

---

## 4. Reception Centerpiece

**File:** `throne-reception-01.glb`
**Manifest ID:** `throne-reception-01` *(new entry — added in this slice)*
**Category:** furniture
**Placements:** 1 — Reception centre `(0, 0, 13)`

### Dimensions
| Dimension | Value |
|-----------|-------|
| Height | ~1.5 m |
| Footprint | ~1.0 m × 1.0 m |
| Origin | base-centre (floor contact point) |

### Style
A welcoming focal piece for the Reception zone — the first thing a visitor sees when entering. Options:

- **Lectern / podium** — a standing reading stand with carved face panel, angled top surface, stepped base
- **Ceremonial throne** — a high-backed chair with carved armrests and a carved backrest panel; compact, not oversized
- **Decorative stand** — a three-tiered offering stand (*dulang*) with carved tiers, holding an ornamental element on top (e.g. a stylised flame or lotus)

The chosen piece should read as *"Welcome to Balairung"* — formal and inviting, not aggressive.

### Materials
- Base / body: teak — `#5C4033`
- Accent details (carved panels, trim): gold — `#C9A84C`

### Polycount target
1 000–5 000 triangles.

### Fallback
Until the `.glb` is ready, the manifest uses a `fallbackType: 'box'` (1 × 1.5 × 1 m box) at Reception centre as a placeholder. It will be visible in the scene as a reminder.

### Placement (from manifest)
```
Reception centre: (0, 0, 13)   zone: reception
  castShadows: true, receiveShadows: true
```
`z=13` is the midpoint of Reception `z[8, 18]`.
