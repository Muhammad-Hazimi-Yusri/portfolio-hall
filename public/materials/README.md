# Hall surface textures

Original 1024 × 1024 JPEG maps by **Rob Tuytel**, downloaded from **Poly Haven**
on 23 September 2026. These assets are distributed under
[CC0](https://polyhaven.com/license), and are self-hosted with the portfolio.
There is no runtime connection to Poly Haven or its API.

| File | Source | Bytes | Source MD5 |
| --- | --- | ---: | --- |
| `fine_grained_wood_col_1k.jpg` | [Fine Grained Wood](https://polyhaven.com/a/fine_grained_wood) | 336,305 | `3db9decdde678e087e67ff99d30c0a73` |
| `floor_tiles_02_diff_1k.jpg` | [Floor Tiles 02](https://polyhaven.com/a/floor_tiles_02) | 354,550 | `32de1779b8ddba55ad62df8d014264cd` |

The two originals total **690,855 bytes**. MD5s were checked against the
source API metadata. Images have not been edited. Colour tint and UV scale
are material settings in `src/3d/materials.ts`. The stone scan is
marble, used here as warm paving; it does not establish a specific real-world
building material or a timber species.

Wood uses a 0.6 m repeat, following each member's long axis. The floor keeps
the hall's 0.6 m tile spacing (four tiles per 2.4 m repeat). Both use mipmaps
and bounded 4× anisotropic filtering. Material loads invalidate the still water
reflection once. Normal maps were trialled but left out: their subtle relief
added GPU time and texture memory in the local review.

These are loaded only with the 3D scene. A plain surface remains visible until
each map is ready, including if a download fails. There are no extra lights,
geometry or rendering passes for these surface details. The additional decoded
texture memory and fragment sampling still have a cost; file size is not GPU
memory usage.

The hardware workshop reuses the same wood image for its bench, lower shelf,
entry board, canopy lining and screened edge. It uses the same long-axis mapping,
with a separate material tint. Its platform also reuses the hall's floor image
at the same physical tile size. No additional source image is downloaded for
that setting. Its former generated wood-grain texture has been removed.

The AVVR listening room also reuses that original wood image for the speaker
cabinet, slatted wall, display surrounds and platform. Its generated grain map
has been removed. The room's fabric weave is shared by the acoustic panels and
carpet; the larger original-project display uses the existing AVVR screenshot.

The distant islands additionally share `rocky_terrain_diff_1k.jpg`, the original
1K **Rocky Terrain** colour map by **Amal Kumar**, from Poly Haven under CC0.
Its 905,179-byte file matches source MD5 `306ae62c38ab1942a63e831a534875ab`.
Source details, terrain data credits and rendering costs are recorded in
`../terrain/README.md`. No normal or displacement map is loaded for that surface.
