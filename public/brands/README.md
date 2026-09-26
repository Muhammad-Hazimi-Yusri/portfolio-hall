# Organisation marks

Downloaded on 20 September 2026 from the organisations' official websites.
These files are unchanged source assets, used to identify actual employment
and university research experience in the portfolio.

| File | Official source |
| --- | --- |
| `tnei.png` | [TNEI website logo](https://www.tneigroup.com/wp-content/uploads/2022/03/logo-x2.png), linked by the [TNEI homepage](https://www.tneigroup.com/) |
| `audioscenic.svg` | [Audioscenic wordmark](https://audioscenic.com/images/logos/audioscenic-white.svg), linked by the [Audioscenic homepage](https://audioscenic.com/) |
| `southampton.svg` | [University of Southampton mark](https://www.southampton.ac.uk/themes/custom/drupal_endeavour/images/logo/logo-uk.svg), linked by the [University homepage](https://www.southampton.ac.uk/) |

The marks remain the property of their respective organisations and are not
covered by the application's code license. No endorsement is implied. The
pedestals link to the relevant experience notes within this portfolio.

`src/3d/experienceDisplay.ts` derives a closed solid from the image's alpha mask,
with matching front/back caps and connecting side walls. Letter counters and the
space around the mark remain empty, with no rectangular backing. The back is
the physical reverse of the same shape, rather than another flat logo card.

TNEI retains the asset's colours. The white Audioscenic and Southampton variants
are tinted navy (`#14233f`) and teal (`#00536b`) on the 3D geometry for contrast
against the pale hall. Source files and reading-panel badges retain their original
colours. No generated artwork or approximate font replaces the marks. Names,
roles and dates stay on stationary labels.
