# Grownetics Academy licensing

Effective for the covered original material: 2026-09-28.

This repository contains material with different licenses. **It is not blanket dual-licensed: CC BY 4.0 covers original curriculum content; MIT covers the academy's original teaching software and examples. Grownetics product software is excluded.**

The full license texts are [CC BY 4.0](LICENSES/CC-BY-4.0.txt) and [MIT](LICENSES/MIT.txt). The boundaries below identify the material licensed under each text; they do not add restrictions to either license.

## Original curriculum content — CC BY 4.0

Original Grownetics Academy educational content is licensed under the **Creative Commons Attribution 4.0 International license** (SPDX: `CC-BY-4.0`). Covered content includes:

- Original lesson prose, explanations, quizzes, glossary definitions, lab instructions, and educational illustrations in `modules/`, including `modules/cea-control/sources/outline.md`.
- Original educational prose and illustrations embedded in JavaScript or HTML. A programming-language file extension does not turn lesson content into MIT-licensed software.
- `README.md`, `docs/curriculum-outline.md`, and `docs/curriculum-decisions.md`.
- Future original curriculum materials explicitly designated as part of this academy curriculum, subject to any identified third-party material.

Copyright (c) 2026 Grownetics Academy contributors. Retain any more specific author or copyright notices supplied with the material.

CC BY 4.0 permits sharing and adaptation, including commercial reuse, subject to its terms. When sharing, provide appropriate credit, link to the license, and indicate changes. The [full legal text](LICENSES/CC-BY-4.0.txt) controls; the [license deed](https://creativecommons.org/licenses/by/4.0/) is a summary.

Suggested attribution for an adaptation:

> Adapted from Grownetics Academy, https://github.com/vhark/grownetics-academy, by Grownetics Academy contributors, licensed under CC BY 4.0, https://creativecommons.org/licenses/by/4.0/. Changes: describe the modifications made.

This is an example of attribution, not an additional required wording or a grant of endorsement.

## Original teaching software and examples — MIT

The academy's original teaching software and instructional code examples are licensed under the **MIT License** (SPDX: `MIT`). Covered implementation includes:

- The academy website delivery code in `index.html`, `js/`, and `css/`.
- Original executable code for the academy's interactive labs, simulations, calculations, visualizations, and module delivery in `modules/`, excluding vendored code and instructional content covered above.
- Original supporting educational-data preparation scripts in `scripts/` and academy tests in `tests/`. The scripts' license does not relicense their input or output datasets.
- Original instructional code examples explicitly presented as academy teaching examples, including code examples embedded in covered curriculum documents.

Copyright (c) 2026 Grownetics Academy contributors. Retain any more specific author or copyright notices supplied with the software. Include the [MIT copyright and permission notice](LICENSES/MIT.txt) as required by that license.

“Teaching software and examples” identifies the material covered by the grant. It is **not** an education-only restriction on recipients: MIT permits commercial and other reuse of the covered code under its standard terms.

### Files containing both lessons and code

Some academy files combine educational text and executable logic. Apply CC BY 4.0 to the original instructional content and MIT to the original covered software or code examples. When redistributing a combined file or bundle, retain both applicable notices and any third-party notices. This is not permission to choose either license for every part of the file.

## Grownetics product software — no license change

**These grants do not license or relicense Grownetics product software.** This includes product applications, backend services, controllers, firmware, production integrations, and other product implementation, whether mentioned, linked, demonstrated, or connected to by the academy.

Teaching about Grownetics, calling an API, documenting behavior, or including an integration example does not grant rights to the implementation of the product it interacts with. Existing separately licensed components retain their own permissions; this exclusion does not revoke an existing license.

No license change is made to other Grownetics repositories or to the separate CEA Psychrometric Site Evaluator merely because the academy links to them. Any product-code licensing decision requires separate authorization from its rights holders.

## Third-party material and other exclusions

These grants cover only original material that its contributors have authority to license. They do not replace third-party terms or confer rights through citation alone.

- **PsychroLib:** `modules/climate-design/vendor/` retains its existing [MIT license and copyright notice](modules/climate-design/vendor/LICENSE.txt) and [provenance](modules/climate-design/vendor/provenance.json). Do not replace its attribution with the academy's copyright notice.
- **Weather data:** `modules/climate-design/data/`, including raw weather archives and derived weather data, remains subject to the recorded source terms and attribution. See [dataset metadata](modules/climate-design/data/climates.json), the accompanying provenance files, and the [module's sources and methods register](modules/climate-design/sources.js). Licensing the software processing those records does not erase provider attribution or applicable source terms.
- **External references:** papers, handbooks, standards, photographs, figures, partner materials, and linked resources retain their respective rights. For example, the PsychroLib license does not license the ASHRAE handbook, and a link to the FAO guide does not grant rights to redistribute its illustrations.
- **Branding:** no trademark license or endorsement is granted for Grownetics, NASA, Creative Commons, or third-party names and marks. Rights to any original educational artwork do not authorize misleading branding or endorsement claims.
- **Hardware:** no grant for physical hardware design files, production firmware, or other product intellectual property is made by this notice. Hardware designs require a separate explicit licensing decision.
- **Other planning and review material:** unrelated product/engineering plans and review records, including `docs/greenhouse-recommendation-engine.md` and `Reviews/`, are not included in these grants merely because they are present in a working checkout.

Material outside the defined curriculum and teaching-software scope is not newly licensed by this notice. Preserve any separate license it already has.

Both license texts contain warranty and liability terms. Educational materials and simulations are not engineering approval, equipment certification, agronomic guarantees, or substitutes for classroom and site-specific safety review.
