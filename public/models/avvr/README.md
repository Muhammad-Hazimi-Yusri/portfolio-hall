# AVVR listening room archive

The raw archive assets are retained only in the ignored local folder
`_local/avvr-archive/`. They are not included in the public repository or build.
The deployed listening room uses the portfolio's original spatial-audio
illustration and an existing screenshot of the university application.

The locally retained files are existing university-project assets:

- `listening-reconstruction.bin` is exported from the archived AVVR repository:
  `Generated Meshes/LR (no ceiling)/Input_prediction.obj` and its MTL.
- `listening-reconstruction.json` records the source hash, original material
  colours, bounds, face counts and binary hash. Geometry is kept on the source
  millimetre grid; quads are triangulated, and normal/class seams are retained.
- `listening-reference.png` is an unmodified copy of
  `AVVR/Assets/Resources/Images/Listening Room.png`, 2690 × 1345 pixels.

The scene comes from the S3A Audio-Visual Scene Analysis dataset, DOI
10.15126/surreydata.00812228. The source page describes the Listening Room and
requests acknowledgement of the dataset and its papers. See the site's
`scene-credits.html` for those references:

https://cvssp.org/data/s3a/public/AV-Analysis2/
https://eprints.soton.ac.uk/451975

The archive's pipeline README describes integration with existing EdgeNet360
research. These scene assets are not claimed as Hazimi's original dataset or
reconstruction method. His contribution was software, pipeline and VR
integration within the university project. The portfolio's neutral display
finish and plinth are presentation choices; Model labels uses the original
archived class colours. The source labels can contain prediction errors.

Publication review on 26 September 2026 found that the dataset's access terms
allow academic use but prohibit redistribution:

https://cvssp.org/data/s3a/public/audio_visual_register.php

The pipeline repository's MIT notice does not relicense this source dataset.
The archive renderer is disabled in `src/data/avvrArchive.ts`. Do not enable or
redistribute the raw model or photograph without the necessary permission.

Reproduce from the local archive in PowerShell:

```powershell
node tools/export-avvr-room.mjs 'E:\Coding\_archive\repos\avvr-unity\Generated Meshes\LR (no ceiling)\Input_prediction.obj' '_local\avvr-archive\listening-reconstruction.bin'
```

The optional `npm run check:avvr` checks the locally held archive, including
the 536,648-byte mesh and 5,358,729-byte photograph. It requires those files;
it is not a clean-checkout or deployed-site test. Production checks reject
these files if they appear in `public/` or `dist/`.
