// Public portfolio content. Update entries here; see docs/PORTFOLIO_CONTENT.md.
// Keep client names, internal URLs, source code and site-test data out of this file.
export type ProjectImage = {
  src: string
  alt: string
  caption: string
  width?: number
  height?: number
}

export type Project = {
  id: string
  title: string
  category: string
  status: string
  summary: string
  role: string
  tools: string[]
  problem: string
  contribution: string[]
  currentState: string
  links: { label: string; url: string }[]
  liveApp?: { url: string }
  video?: { youtubeId: string; label: string; title: string; caption: string }
  image?: ProjectImage
  gallery?: ProjectImage[]
  featured?: boolean
  exhibitSteps?: string[]
}

export const profile = {
  name: 'Muhammad Hazimi Yusri',
  shortName: 'Hazimi Yusri',
  location: 'Liverpool, UK',
  availability: 'Liverpool · Remote-first',
  workingPreference: 'I prefer fully remote work and am open to hybrid roles around Liverpool and Manchester. I’m happy to discuss other locations for the right opportunity.',
  email: 'muhammadhazimiyusri@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhammadhazimiyusri/',
  github: 'https://github.com/Muhammad-Hazimi-Yusri',
  experiments: 'https://github.com/ChronoHaxx',
  updated: 'September 2026',
}

export const professionalWork: Project[] = [
  {
    id: 'reporting-workbench',
    exhibitSteps: ['Project inputs', 'Figures & templates', 'Word draft'],
    title: 'Reporting workbench',
    category: 'TNEI · Engineering tools',
    status: 'Internal · In development',
    summary: 'Turning project inputs and study figures into a first draft of an engineering report.',
    role: 'Initiated and developing the application alongside my consulting work.',
    tools: ['Python / FastAPI', 'React', 'PostgreSQL', 'Docker', 'Microsoft SSO'],
    problem: 'Engineering reports repeat project information across approved templates and include many study figures. Preparing the draft involves a lot of document handling before the engineering review can begin.',
    contribution: [
      'Developing a browser workflow for selecting a template, entering project values and preparing a Word draft.',
      'Working on figure matching and insertion, with a preview for matches that need checking.',
      'Connecting the React interface, FastAPI application and PostgreSQL database. The application runs on a company Ubuntu VM with Docker and Microsoft SSO.',
    ],
    currentState: 'Deployed on the internal network and still under development. The workflow needs further work before I would describe it as a finished tool. Engineers remain responsible for the studies, the report and its review.',
    image: { src: 'thumbnails/reporting-workbench-workflow.svg', alt: 'Workflow illustration: project values, an approved template and study figures are assembled into a Word draft for engineering review.', caption: 'Public workflow illustration, not an application screenshot. The internal workbench is still in development.', width: 1200, height: 720 },
    links: [],
  },
  {
    id: 'site-test-analysis',
    exhibitSteps: ['Measured data', 'Targets & plots', 'Reviewable results'],
    title: 'Site-test analysis tools',
    category: 'TNEI · Data analysis',
    status: 'Internal · In development',
    summary: 'Plotting measured plant response against grid-code targets, with calculations a reviewer can trace.',
    role: 'Developing analysis and reporting tools informed by my site-test work.',
    tools: ['Python', 'pandas', 'Matplotlib', 'Excel', 'Word'],
    problem: 'Site-test recordings arrive in different formats. Repeating plots and calculations for each test can mean adapting scripts and copying results between files.',
    contribution: [
      'Developing a pipeline to normalise measured datalogs and configure plant parameters and test windows as data.',
      'Plotting measured response alongside the relevant target and tolerance bands.',
      'Working on traceable calculation workbooks and report figures so the results can be checked during engineering review.',
    ],
    currentState: 'Ongoing internal tooling work using site-test data. This is analysis of measurements; it does not replace engineering judgement or independently establish compliance.',
    image: { src: 'thumbnails/site-test-analysis-sketch.svg', alt: 'Illustrative response trace with a step target, a shaded band and a chosen test window. All values are synthetic.', caption: 'Illustrative trace with synthetic values and an arbitrary band. No site data, compliance limits or test results are shown.', width: 1200, height: 720 },
    links: [],
  },
]

export const projects: Project[] = [
  {
    id: 'food-wars',
    liveApp: { url: 'https://food-wars.muhammadhazimiyusri.uk' },
    title: 'Food Wars',
    category: 'Personal · Web application',
    status: 'In development',
    featured: true,
    summary: 'A kitchen inventory app connecting what’s in the cupboard to shopping, recipes and a local AI assistant.',
    role: 'Personal project, built with AI-assisted development.',
    tools: ['Next.js', 'TypeScript', 'Supabase', 'Ollama', 'MCP'],
    problem: 'A household inventory only helps if it stays connected to the everyday tasks of buying, using and cooking food. I’m exploring those workflows in a Grocy-inspired web app.',
    contribution: [
      'Building inventory, shopping and recipe workflows around a Supabase-backed application.',
      'Integrating Ollama for AI-assisted input and recipe workflows, plus an OAuth-protected MCP interface.',
      'Maintaining Vitest and Playwright checks through GitHub Actions as the application develops.',
    ],
    currentState: 'A personal learning project in development. The screenshot shows the newer pantry interface; the hosted version currently uses the earlier inventory layout. AI integrations need a configured backend or local model. Grocy’s schema and feature ideas are an important starting point.',
    image: { src: 'thumbnails/food-wars-pantry.png', alt: 'Food Wars guest pantry showing sample groceries, expiry reminders and recipe navigation.', caption: 'Development preview with fictional guest groceries, September 2026.', width: 1265, height: 1201 },
    links: [
      { label: 'Source code', url: 'https://github.com/Muhammad-Hazimi-Yusri/food-wars' },
      { label: 'Open app', url: 'https://food-wars.muhammadhazimiyusri.uk' },
    ],
  },
  {
    id: 'avvr',
    title: 'Audio-visual scenes in VR',
    category: 'University · Team project',
    status: 'Published university project',
    featured: true,
    summary: 'Bringing reconstructed rooms into Unity, with spatial audio and tools to inspect the reconstruction pipeline.',
    role: 'Technical lead on a university group project, 2024–25.',
    tools: ['Unity / C#', 'Steam Audio', 'Python', 'PyQt6'],
    problem: 'Reproducing a room in VR involves both its visual structure and the way sound behaves within it. Our group project connected scene reconstruction with an interactive audio-visual experience.',
    contribution: [
      'Led the technical integration of existing reconstruction models with a Unity VR application.',
      'Worked on spatial audio with Steam Audio and the tools used to inspect and debug the pipeline.',
      'Built a PyQt6 debugging interface and helped bring the application to an Itch.io release.',
    ],
    currentState: 'The university application is published on Itch.io. This was a team project integrating existing reconstruction research; the underlying models belong to their original authors.',
    image: { src: 'thumbnails/avvr-2.webp', alt: 'AVVR running in a reconstructed room with a reference photograph, floating menu and spatial sound source.', caption: 'The AVVR application: reconstructed scene, reference image and spatial audio controls.' },
    links: [
      { label: 'Project & download', url: 'https://chronohaxx.itch.io/avvr' },
      { label: 'Project resources', url: 'https://linktr.ee/gdp4' },
      { label: 'Research & scene data', url: 'https://cvssp.org/data/s3a/public/AV-Analysis2/' },
    ],
  },
  {
    id: 'wattwhere',
    liveApp: { url: 'https://muhammad-hazimi-yusri.github.io/wattwhere/' },
    exhibitSteps: ['Generation', 'Grid & markets', 'Electricity bills'],
    title: 'WattWhere',
    category: 'Personal · Energy & data',
    status: 'Early version',
    summary: 'An explainer and map-based dashboard for Great Britain’s electricity grid and market.',
    role: 'Personal project connecting my power-systems background with web development.',
    tools: ['Astro', 'React', 'MapLibre', 'deck.gl', 'TypeScript'],
    problem: 'Electricity generation, networks, carbon intensity and bills are connected, but often presented in separate places. I wanted to explore them through an interactive explanation and a map.',
    contribution: [
      'Building a scroll-based explanation and a separate dashboard with maps and time-series views.',
      'Combining infrastructure overlays with electricity-market and carbon-intensity data.',
      'Using a static Astro site with interactive React components and a data-refresh workflow.',
    ],
    currentState: 'An early public version. These dated captures show the dashboard’s chart panels. The hosted map currently displays a basemap-provider error, which still needs fixing.',
    image: { src: 'thumbnails/wattwhere-fuel-mix.jpg', alt: 'WattWhere’s fuel-mix chart showing stacked generation by fuel across a day, with BMRS attribution.', caption: 'Fuel-mix panel from the hosted dashboard, 23 September 2026. BMRS data © Elexon Limited (2026).', width: 420, height: 272 },
    gallery: [{ src: 'thumbnails/wattwhere-carbon.jpg', alt: 'WattWhere’s national carbon-intensity chart with solid actual and dashed forecast lines.', caption: 'Actual and forecast carbon-intensity panel, 23 September 2026. Data: National Grid ESO, CC BY 4.0.', width: 360, height: 252 }],
    links: [
      { label: 'Source code', url: 'https://github.com/Muhammad-Hazimi-Yusri/wattwhere' },
      { label: 'Open site', url: 'https://muhammad-hazimi-yusri.github.io/wattwhere/' },
    ],
  },
  {
    id: 'rubyvr-studio',
    exhibitSteps: ['Tile artwork', 'Voxel editing', 'Game integration'],
    title: 'RubyVR Studio',
    category: 'Personal · Graphics tools',
    status: 'Early development',
    summary: 'An editor for turning tile artwork into editable voxel scenery, alongside native game-integration research.',
    role: 'Building the editor and researching integration with existing game recompilation work.',
    tools: ['C++', 'Linux / WSL', '3D editing', 'OpenXR research'],
    problem: 'Reconstructing a tile-based world in 3D involves many small authoring decisions. I’m building tools to separate source objects, give them depth and reuse their models across maps.',
    contribution: [
      'Developing a segment, mask, model and scene workflow with source artwork visible during editing.',
      'Working on model reuse, terrain and a shared renderer for the editor and native integration.',
      'Documenting setup, contribution tasks and the limits of the current playable demo.',
    ],
    currentState: 'The editor and local desktop demo are in development. Public installation, world coverage, performance and VR work remain open. It is not a finished VR game. Original game assets and the underlying recompilation are the work of their respective authors.',
    image: { src: 'thumbnails/rubyvr-studio-scene.png', alt: 'RubyVR Studio showing the original tile map above an editable 3D scene, with a model library and scene controls.', caption: 'The development editor: source artwork above the voxel scene. Original game artwork belongs to its respective owners.', width: 1600, height: 950 },
    gallery: [{ src: 'thumbnails/rubyvr-studio-model.png', alt: 'A house roof selected in RubyVR Studio, with its source pixels, 3D transform handles and part dimensions visible.', caption: 'Editing a model part while keeping its source artwork in view. Development capture from the editor repository.', width: 1600, height: 950 }],
    links: [{ label: 'Source & progress', url: 'https://github.com/ChronoHaxx/rubyvr-studio' }],
  },
  {
    id: 'the-finals-outfit',
    liveApp: { url: 'https://chronohaxx.github.io/the-finals-outfit/' },
    exhibitSteps: ['Cosmetic items', 'Materials & preview', 'Shared outfits'],
    title: 'THE FINALS Outfit Studio',
    category: 'Personal · 3D web application',
    status: 'In development',
    summary: 'A fan-made outfit builder, with work on 3D materials, cosmetic combinations and shareable URLs.',
    role: 'Developing the application and asset-processing workflow using community research.',
    tools: ['React', 'TypeScript', '3D rendering', 'Asset pipelines'],
    problem: 'An outfit preview needs to combine cosmetic items and reproduce their materials consistently. This project explores both the selection interface and the rendering work behind it.',
    contribution: [
      'Building the outfit selection interface and validation for configurations shared by URL.',
      'Working on material reconstruction and the pipeline connecting source assets to the renderer.',
      'Keeping application code separate from game artwork and recording community-tooling attribution.',
    ],
    currentState: 'An unofficial fan project in development. Material fidelity and item coverage are ongoing work. THE FINALS and its artwork belong to Embark Studios; extraction and reconstruction also build on community discoveries.',
    image: { src: 'thumbnails/the-finals-outfit-builder.png', alt: 'THE FINALS Outfit Studio with a 3D character preview, equipped items and a searchable cosmetic catalogue.', caption: 'Development capture, 12 September 2026. Interface and material work are ongoing. Game artwork © Embark Studios.', width: 1390, height: 1000 },
    links: [
      { label: 'Open app', url: 'https://chronohaxx.github.io/the-finals-outfit/' },
      { label: 'Source & credits', url: 'https://github.com/ChronoHaxx/the-finals-outfit' },
    ],
  },
  {
    id: 'petbot',
    video: { youtubeId: '3umn0yt_FcE', label: 'Watch demo', title: 'PetBot team demonstration', caption: 'The university team prototype in action. My contribution was the server and AI integration.' },
    title: 'PetBot',
    category: 'University · Team project',
    status: 'University prototype',
    summary: 'A social-robot project connecting a web interface, local language-model processing and robot interaction.',
    role: 'Server and AI integration within a university team project, 2025.',
    tools: ['Python', 'Flask', 'Socket.IO', 'Local LLMs'],
    problem: 'A social robot needs an interface that connects conversation and control with the physical device. My part focused on the server and the language-model integration.',
    contribution: [
      'Developed the Flask and Socket.IO server connecting the web interfaces and robot.',
      'Integrated local LLM processing and sentiment analysis into the interaction workflow.',
      'Worked with the rest of the team on the overall robot demonstration.',
    ],
    currentState: 'A university team prototype with a recorded demonstration. My contribution was the server and integration work; the full robot was a shared effort.',
    image: { src: 'thumbnails/petbot-1.webp', alt: 'PetBot university social-robot project.', caption: 'PetBot team project demonstration.' },
    links: [
      { label: 'Source code', url: 'https://github.com/Muhammad-Hazimi-Yusri/RobotSimulatorUI' },
      { label: 'Watch demo', url: 'https://youtu.be/3umn0yt_FcE' },
    ],
  },
  {
    id: 'fpv-drone',
    video: { youtubeId: 'KLsvO-GVh0s', label: 'Watch flight', title: 'Southampton Common flight', caption: 'Flight footage from the 2023 AOS 5 build diary, recorded with the DJI O3 air unit.' },
    title: 'FPV drone',
    category: 'Personal · Hardware & flight',
    status: 'Build & flight diary · 2023',
    summary: 'An AOS 5 build with DJI O3 video, followed by flights, repairs and better component mounting.',
    role: 'Assembled, modified and flew a personal drone using off-the-shelf components.',
    tools: ['AOS 5 V3', 'DJI O3', 'ELRS', '3D printing / TPU', 'Soldering'],
    problem: 'Putting the parts together was only the beginning. Early flights exposed problems with camera mounting, antenna placement and protecting the electronics.',
    contribution: [
      'Assembled the drone, then rerouted wiring and printed a side cover after the first flight.',
      'Printed camera and GPS mounts in TPU using Tim O’Brien’s design.',
      'Added spare LED strips to help see the drone at dusk, and documented flights and repairs.',
    ],
    currentState: 'The linked diary records the build and early flights in 2023. The Southampton Common film shows the drone flying; the diary also records damage and repairs. This exhibit presents that chapter of the project.',
    image: { src: 'thumbnails/fpv-drone.jpg', alt: 'My FPV drone with an orange battery, blue-green propellers, a front camera and LED strips.', caption: 'The actual build, from my earlier portfolio.', width: 1440, height: 1920 },
    links: [
      { label: 'Watch flight', url: 'https://youtu.be/KLsvO-GVh0s' },
      { label: 'Original build diary', url: 'https://muhammad-hazimi-yusri.github.io/quartz-jimi/projects/fpv-drone/' },
    ],
  },
  {
    id: 'eee-roadmap',
    liveApp: { url: 'https://eee-roadmap.muhammadhazimiyusri.uk' },
    title: 'EEE Roadmap',
    category: 'Personal · Learning tools',
    status: 'In development',
    summary: 'An interactive map of electrical and electronic engineering topics, with progress tracking and content review.',
    role: 'Personal learning-platform project.',
    tools: ['Astro', 'TypeScript', 'Cytoscape.js', 'Supabase'],
    problem: 'A list of modules doesn’t always show how the ideas in an engineering degree connect. This project explores a navigable topic map alongside learning progress.',
    contribution: [
      'Building topic navigation, dependency visualisation and progress tracking.',
      'Adding account-backed sync and a review workflow for topic content and resources.',
    ],
    currentState: 'In development. Learning content is AI-generated and only some entries have been manually reviewed; the application marks that distinction. It is a study aid rather than an authoritative curriculum.',
    image: { src: 'thumbnails/eee-roadmap-1.webp', alt: 'EEE Roadmap learning topics and navigation.', caption: 'EEE Roadmap interface.' },
    links: [
      { label: 'Source code', url: 'https://github.com/Muhammad-Hazimi-Yusri/eee-roadmap' },
      { label: 'Open site', url: 'https://eee-roadmap.muhammadhazimiyusri.uk' },
    ],
  },
  {
    id: 'balairung',
    exhibitSteps: ['Project content', 'Gallery displays', 'Browse or explore'],
    title: 'Balairung',
    category: 'Personal · Browser 3D',
    status: 'Interactive experiment',
    summary: 'This portfolio: a browser-based hall with project displays and a place to walk around.',
    role: 'Personal experiment in browser-based 3D navigation.',
    tools: ['Babylon.js', 'React', 'TypeScript', 'WebXR'],
    problem: 'I wanted to try arranging projects in a space visitors could explore. The result was a browser museum with movement, project displays and several input methods.',
    contribution: [
      'Built the procedural hall and connected project content to displays in the scene.',
      'Added desktop and touch navigation, with experimental WebXR support.',
      'Connected the hall to direct project navigation, with readable notes, a CV and a map when 3D is unavailable.',
    ],
    currentState: 'An ongoing browser experiment. The gallery has direct navigation and a free-roam mode, with the same content available without 3D. Headset support still needs further testing.',
    image: { src: 'thumbnails/balairung-hall.jpg', alt: 'Balairung’s timber hall over water, with project frames, planted entrance platform and browsing controls.', caption: 'Development preview of the hall, September 2026.', width: 723, height: 580 },
    gallery: [{ src: 'thumbnails/balairung-map.jpg', alt: 'Balairung’s 2D floor plan, with links to professional work, projects and experience.', caption: 'The same project catalogue in the 2D floor-plan view. Development preview, September 2026.', width: 723, height: 580 }],
    links: [
      { label: 'Enter the 3D hall', url: '#explore' },
      { label: 'Source code', url: 'https://github.com/Muhammad-Hazimi-Yusri/portfolio-hall' },
    ],
  },
]

export const experience = [
  {
    id: 'tnei',
    logo: { src: 'brands/tnei.png', background: '#f4f8fb', width: 2.05, motion: 'left-right' as const },
    organisation: 'TNEI',
    title: 'Power Systems Consultant · Connections',
    dates: 'Apr 2026 – present',
    description: 'Grid-code compliance and load-flow studies, post-energisation site-test analysis, and engineering reports. Developing internal Python and web tools alongside those studies.',
    tools: 'PowerFactory, IPSA, Python, engineering analysis',
  },
  {
    id: 'audioscenic',
    logo: { src: 'brands/audioscenic.svg', background: '#14233f', width: 2.6, ink: '#14233f', motion: 'right-left' as const },
    organisation: 'Audioscenic',
    title: 'Software Audio Analysis Intern',
    dates: 'Jul – Sep 2025',
    description: 'Developed Python tools for multi-channel audio analysis, connected embedded devices through WebSockets, and handled concurrent audio streams. Wrote pytest tests and worked through GitLab code review.',
    tools: 'Python, WebSockets, multiprocessing, pytest, GitLab',
  },
  {
    id: 'southampton-research',
    logo: { src: 'brands/southampton.svg', background: '#00536b', width: 2.65, ink: '#00536b', motion: 'bob' as const },
    organisation: 'University of Southampton',
    title: 'Research Assistant',
    dates: 'Jun – Aug 2024',
    description: 'Adapted an existing EdgeNet360 reconstruction pipeline with Docker workflows, integrated Unity and spatial audio, and developed acoustic evaluation methods in MATLAB.',
    tools: 'Python, Docker, Unity / C#, MATLAB',
  },
]
