# Self-hosted typefaces

Original WOFF2 files served by Google Fonts, downloaded on 23 September 2026.
They have not been edited or subsetted locally. `sources.json` records every
source URL, byte length and SHA256. Each family's copyright notice and complete
SIL Open Font License 1.1 are included alongside its files:

- **Inter** — The Inter Project Authors, [project](https://github.com/rsms/inter),
  `Inter-OFL.txt`.
- **Newsreader** — The Newsreader Project Authors,
  [project](https://github.com/productiontype/Newsreader), `Newsreader-OFL.txt`.
- **Space Grotesk** — The Space Grotesk Project Authors,
  [project](https://github.com/floriankarsten/space-grotesk), `SpaceGrotesk-OFL.txt`.

## Loading

`src/fonts.css` preserves the official Unicode ranges and uses local URLs.
Inter and Space Grotesk cover weights 400–700. Newsreader covers normal and
italic 400, with its optical-size axis intact; the current design uses no
Newsreader 500. Space Grotesk remains available for the older tour UI.

The main HTML preloads only Latin Inter and normal/italic Newsreader. Other
subsets and Space Grotesk load when needed. `font-display: swap` keeps text
available while a font loads; this does not guarantee zero layout movement.
The stylesheet is part of the site's CSS bundle, with no runtime Google Fonts
stylesheet or font request. Vite rewrites its URLs for the configured base.

The three preloaded originals total **168,816 bytes**, compared with 243,548
bytes for the equivalent Latin faces returned for the previous Google Fonts
request. The 74,732-byte difference comes from requesting only the Newsreader
weight actually used. This is a file-size comparison, not a load-time benchmark.

## Reproducing the import

This is an optional authoring operation, not a build step. Normal builds use
the checked-in files and require no font-provider connection.

1. Save the CSS from the following exact request to
   `_local/font-source/current.css` using a modern Chromium user-agent:

   ```text
   https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=Space+Grotesk:wght@400..700&display=swap
   ```

   The import used:

   ```text
   Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36
   ```

2. Run `node tools/vendor-fonts.mjs`. It validates each source host and the
   WOFF2 signature, then writes the originals, stylesheet and checksum manifest.
3. Preserve the licences from Google's official repository:
   [Inter](https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt),
   [Newsreader](https://raw.githubusercontent.com/google/fonts/main/ofl/newsreader/OFL.txt),
   [Space Grotesk](https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/OFL.txt).
4. Review changes, build, and verify rendered typography before accepting a
   refreshed import. The provider can update its CSS and font versions.
