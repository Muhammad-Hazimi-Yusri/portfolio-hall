# Distant island relief

The hall's decorative landscape uses reduced elevation samples around Rùm,
Eigg and Canna, Scotland. The islands have been resized, vertically exaggerated,
rotated and moved into a fictional arrangement. This is scenery, not a map,
visitor analytics or a claim about the portfolio owner's location.

Terrain Tiles was accessed on 23 September 2026 from
[the AWS open-data registry](https://registry.opendata.aws/terrain-tiles/).
The dataset is managed by Mapzen. [Format](https://github.com/tilezen/joerd/blob/master/docs/formats.md)
and [provider attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

Applicable source credits retained from the provider's attribution:

- Europe terrain data produced using Copernicus data and information funded
  by the European Union — EU-DEM layers.
- United Kingdom terrain data © Environment Agency copyright and/or database
  right 2015. All rights reserved.
- SRTM and GMTED2010 terrain data courtesy of the U.S. Geological Survey.
- Global ETOPO1 terrain data: U.S. National Oceanic and Atmospheric
  Administration, DOC/NOAA/NESDIS/NCEI.

EU-DEM permits adaptation with source attribution and a statement of changes;
see the [EEA metadata and use conditions](https://sdi.eea.europa.eu/catalogue/datahub/api/records/3473589f-0854-4601-919e-2e7dd172ff50/formatters/xsl-view?approved=true&language=eng&output=pdf).
The EA data is under [Open Government Licence 3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
USGS/NOAA source details are in the provider attribution above. No endorsement
by any source provider is implied. These tiles blend sources; no claim is made
that every provider contributes to every pixel.

## Reproduce

Cache the four original Terrarium PNG tiles below in `_local/terrain-source/`
using the filenames shown. Each URL starts with
`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/`.

| Tile | Local filename | SHA256 |
| --- | --- | --- |
| `10/493/313.png` | `rum-10-493-313.png` | `4f0f9416622a4ea570fd421e6bc99c2de63d3df4ae89491ae13e1d2023675a5b` |
| `10/494/313.png` | `rum-10-494-313.png` | `7da0751daa4e6db3823f74de2331c1826029bfbbfc8d8cbe8d94eac4c438d8d9` |
| `10/493/314.png` | `rum-10-493-314.png` | `e9305a9c8cb2735340bfeeb032117ca78934d0659ec630f05e3ed812082d4364` |
| `10/494/314.png` | `rum-10-494-314.png` | `11b231c6f49e0e8577bdd1c909e625107a8c9f1274ab3868e45965767a96b01f` |

Run `python tools/build-island-terrain.py` with Pillow installed. The tool
decodes metres, crops each island, downsamples bilinearly, quantises to half
metres and clamps unseen bathymetry at −20 m. Output:
`src/data/distantIslands.json` (64,933 bytes). It makes no network requests.

The authoring tool closes crop edges under the water and bakes sky occlusion
into one byte per vertex. The renderer applies the fictional placement/scale,
computes lighting normals and combines the baked shading with slope-based
grass/rock colours once. The three static meshes total 24,576 triangles,
matching the previous procedural terrain budget. Data is bundled only with
the lazy 3D code. There is no runtime map-service request, new shadow pass,
render target or animation.

One shared original 1K **Rocky Terrain** colour map by **Amal Kumar** adds
surface detail. Downloaded from [Poly Haven](https://polyhaven.com/a/rocky_terrain)
under [CC0](https://polyhaven.com/license). The 905,179-byte JPEG is self-hosted
at `public/materials/rocky_terrain_diff_1k.jpg`; its MD5
`306ae62c38ab1942a63e831a534875ab` matches the source API. The source image is
unchanged. Material tint and a 42-unit repeat adapt it to this scene.
Mipmap filtering and 4x bounded anisotropy follow the existing surface loader.
It adds one texture sample and decoded texture memory, not another draw.
A plain surface remains available if the image has not loaded.

The footer's **Scene credits** link provides attribution to visitors.
