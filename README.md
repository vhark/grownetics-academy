# Grownetics Academy

An educational academy about controlled-environment agriculture, with a developing curriculum intended for school STEM programs, independent learners, and optional teaching kits.

[Open the academy](https://vhark.github.io/grownetics-academy/).

## Curriculum planning

- [Living curriculum outline](docs/curriculum-outline.md): mission, beginner-to-advanced progression, interest pathways, proposed kits, grow-tent and lunar-regolith projects, teacher adoption materials, and unresolved pilot requirements.
- [Module-by-module curriculum map](docs/curriculum-module-map.md): proposed modules, prerequisites, activities, assessment evidence, resource needs, and pathway sequences.
- [From Seed to Sensor teaching guide](docs/pathways/seed-to-sensor.md): the first detailed pathway draft, with eight proposed sessions, manual and Arduino-assisted variants, student templates, and assessment guidance.
- [Decision log](docs/curriculum-decisions.md): dated approvals, proposals, and open decisions. The first pilot has not been selected.

These are planning and teaching drafts, not claims that every proposed module, kit, integration, or school standards mapping is complete or classroom-tested. The shared beginner pathway is the first detailed authoring priority, not a selection of an external classroom pilot. Maintain these records as the curriculum develops.

## Existing modules

- [The Evolution of CEA Control](https://vhark.github.io/grownetics-academy/#/modules/cea-control): published.
- [Climate, Psychrometrics & CEA Design](https://vhark.github.io/grownetics-academy/#/modules/climate-design?preview=1): work-in-progress draft, available through preview mode.

## Versioned curriculum delivery

The publisher exports **published modules only**, with explicit prerequisite availability, teaching activities, evidence expectations, and independent/school-use boundaries. Draft and planning records are labeled separately; neither becomes an available lesson. `modules/cea-control/teaching.js` is the source-owned teaching supplement for the existing CEA Control lessons.

With Node 22.12 or newer:

```sh
npm ci
npx playwright install chromium
npm test
npm run curriculum:export -- review-YYYY-MM-DD-1
```

Choose a new release name for every export. An existing `dist/curriculum/<release>/` directory is never replaced. Each release contains curriculum JSON, the original source outline, teacher/student/presentation resources in HTML and PDF, licensing, and a SHA-256 manifest. Output directories are generated artifacts, not source files.

The separate Grow Journal application installs a complete local release with `npm run curriculum:install -- /absolute/path/to/dist/curriculum/<release>`. Its installer verifies the manifest, records the pinned release, and verifies installed bytes again before building. It does not maintain a second copy of the authored curriculum source.

Release `review-2026-09-28-2` was exported and independently hash-checked during implementation. The PDFs contain selectable text and structural tags; teacher/student samples and the complete 13-page presentation were visually inspected. These checks are not PDF/UA certification, classroom piloting, standards alignment, or a scientific/safety endorsement. Those reviews remain prerequisites for broader educational adoption.

## Reuse and licensing

- Original curriculum content: **CC BY 4.0**.
- Academy teaching software and instructional code examples: **MIT**.
- **Grownetics product software is not covered; its licensing is unchanged.**

See [LICENSE.md](LICENSE.md) for the exact material covered, mixed lesson/code files, attribution, and third-party exceptions. Local full texts: [CC BY 4.0](LICENSES/CC-BY-4.0.txt) and [MIT](LICENSES/MIT.txt).

These are licenses for specified material, not a requirement to buy a kit or a restriction to classroom use. Third-party software, datasets, references, and marks retain their respective terms.
