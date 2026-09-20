# Updating the portfolio

The default site pairs the Balairung hall with readable content. Section and
project links move the camera while opening the notes immediately. `#explore`
opens free-roam mode. A hall map replaces 3D when the visitor switches it off,
prefers reduced motion, or cannot load the renderer; the content stays available.

## Where to edit

Edit `src/data/portfolio.ts`:

- `profile`: contact details and the last content update.
- `experience`: employment history, dates and role descriptions; also used by the CV.
- `professionalWork`: high-level accounts of internal tools.
- `projects`: personal and university projects, in gallery order. The entrance
  selection is in `HallPortfolio.tsx`; `featured` is retained as optional metadata.

A project needs a stable `id`, a short description, your role, tools, the problem,
your contribution and the current state. Its page is `#project/<id>`. Keep IDs
stable so old links continue working. Link to evidence: a public repository,
working application or demonstration. Check external destinations before publishing.

Put real screenshots in `public/thumbnails/`, then set `image.src` relative to
`public/`, with an accurate `alt` and `caption`. Add `width` and `height` if the
image is not 1920 by 1080. Images work under both a custom domain and a subpath.
Avoid making illustrative mockups look like completed applications.

The hall takes its content from `src/data/pois.ts`, which derives it from these
same records. `pois.json` and the old scroll-tour components are legacy material;
they are not the current content source. The old `capture:update` command writes
that legacy JSON, so edit `portfolio.ts` for current screenshots.

The introduction, section copy and entrance selection are in
`src/components/portfolio/HallPortfolio.tsx`. `HallScene.tsx` reuses the existing
Babylon hall geometry with a controlled camera. Layout is in the adjacent
`portfolio.css`. `Portfolio.tsx` contains the case notes and printable CV at `#cv`;
the CV uses the same employment records, so
review its short project summaries when changing the selected projects.

## Content evidence reviewed on 20 September 2026

The work history and team-project contributions were checked against the
September 2026 CV and its source notes, rather than the old site's text.

- TNEI: Graduate Consultant, Connections, April 2026–present.
- Audioscenic: Software Audio Analysis Intern, July–September 2025.
- Southampton research: June–August 2024.
- MEng Electrical and Electronic Engineering: First Class, 2021–2025.
- Reporting workbench: user-confirmed internal VM/SSO deployment; substantial
  development remains. Deployment is not evidence of adoption or impact.
- Site-test tools: development of measured-data analysis and reporting. No
  client data, report excerpts or internal source is included here.
- PetBot: server and LLM/sentiment integration within a team project.
- AVVR: technical lead integrating existing research, Unity/spatial audio and
  a PyQt6 debugging interface. Do not claim authorship of the underlying models.

Personal-project descriptions were checked against their current local READMEs
and the previous source review. RubyVR and Outfit Studio remain in development;
neither is described as a finished game or a fully verified renderer.
The Food Wars pantry screenshot uses fictional guest data. AVVR's image is
existing project footage. No internal-work screenshots or game-asset exports
were copied into this repository.

Do not restore the old site's unsupported adoption, production-quality,
recruiter-response or performance claims. Do not infer authorship from access
to a company repository. PowerFactory automation is not featured as an authored
project because its source credits a different baseline author; attribution
needs resolving before making a more specific contribution claim.

No phone number, visa history or internal hostname is included in the public CV.
Tailor a separate application CV where a particular employer needs more detail.

## Local checks

```powershell
npm run check:portfolio
npm run lint
npm run build
npm run dev
```

The build checks links between portfolio pages, required project fields, local
image files and the initial JavaScript size. It does not establish live demo
availability or project acceptance. Check the rendered site on desktop and
mobile, open a project and use Back, read the CV, and try Print / save as PDF.

The current deployment's canonical URL was observed as
`https://new.muhammadhazimiyusri.uk/`. Update the metadata in `index.html` if the
domain changes. Pushes to `main` deploy automatically through GitHub Pages;
review the content and the site before merging there.
