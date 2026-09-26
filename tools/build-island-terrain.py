"""Reduce cached Terrarium elevation tiles to the hall's static scenery.

Requires Pillow. Source URLs, checksums, attribution and modifications are in
public/terrain/README.md. This is an offline authoring tool, not a build step.
"""
import hashlib
import json
import math
import base64
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "_local/terrain-source"
field = Image.new("F", (512, 512))
checksums = {}
for x, y in [(493, 313), (494, 313), (493, 314), (494, 314)]:
    path = SOURCE / f"rum-10-{x}-{y}.png"
    checksums[path.name] = hashlib.sha256(path.read_bytes()).hexdigest()
    tile = Image.open(path).convert("RGB")
    assert tile.size == (256, 256)
    heights = Image.new("F", tile.size)
    heights.putdata([r * 256 + g + b / 256 - 32768 for r, g, b in tile.getdata()])
    field.paste(heights, ((x - 493) * 256, (y - 313) * 256))

islands = []
for name, crop, columns, rows, width, depth, height_scale in [
    ("rum", (155, 75, 335, 290), 96, 96, 480, 320, .066),
    ("eigg", (330, 230, 435, 380), 32, 64, 210, 300, .075),
    ("canna", (25, 60, 175, 165), 64, 16, 280, 250, .1),
]:
    reduced = field.crop(crop).resize((columns + 1, rows + 1), Image.Resampling.BILINEAR)
    # Half-metre quantisation. Keep a small submerged skirt instead of wasting
    # precision on deep bathymetry that can never be seen from the hall.
    values = [round(max(-20, value) * 2) for value in reduced.getdata()]
    # Close only the crop margin; the island coast itself comes from the DEM.
    # This also prevents accidental pieces of neighbouring land at tile edges.
    shaped = []
    for row in range(rows + 1):
        for column in range(columns + 1):
            edge = min(1, min(column / columns, 1 - column / columns,
                              row / rows, 1 - row / rows) / .04)
            metres = values[row * (columns + 1) + column] / 2
            shaped.append(round((-20 + (metres + 20) * edge * edge * (3 - 2 * edge)) * 2))
    # Bake sky occlusion offline. Visitors decode one byte per vertex instead
    # of tracing hundreds of thousands of terrain samples during scene startup.
    shade = []
    for row in range(rows + 1):
        for column in range(columns + 1):
            height = shaped[row * (columns + 1) + column] / 2 * height_scale
            occlusion = 0
            for dx, dz in [(1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, 1), (1, -1), (-1, -1)]:
                horizon = 0
                for step in [1, 2, 4, 8]:
                    x, z = column + dx * step, row + dz * step
                    if not (0 <= x <= columns and 0 <= z <= rows):
                        continue
                    other_height = shaped[z * (columns + 1) + x] / 2 * height_scale
                    distance = math.hypot(dx * step * width / columns, dz * step * depth / rows)
                    horizon = max(horizon, math.atan2(other_height - height, distance))
                occlusion += math.sin(horizon)
            shade.append(round((1 - occlusion / 8 * .7) * 255))
    islands.append({"name": name, "columns": columns, "rows": rows,
                    "width": width, "depth": depth, "heightScale": height_scale,
                    "halfMetres": shaped, "skyLight": base64.b64encode(bytes(shade)).decode("ascii")})

output = ROOT / "src/data/distantIslands.json"
output.write_text(json.dumps(islands, separators=(",", ":")) + "\n", encoding="utf-8")
print(json.dumps({"sourceSha256": checksums, "outputBytes": output.stat().st_size}, indent=2))
