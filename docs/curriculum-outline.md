# Grownetics Academy curriculum outline

Recorded: 2026-09-28.

**Status:** living planning record, not a completed curriculum or approved hardware specification. The mission below records the user's stated direction. Curriculum structure, module families, kits, and sequencing are proposals unless the [decision log](curriculum-decisions.md) explicitly records approval. The user has approved ongoing documentation and the licensing split described in [LICENSE.md](../LICENSE.md).

Companion records: [module-by-module map](curriculum-module-map.md), [From Seed to Sensor teaching guide](pathways/seed-to-sensor.md), and [decision history](curriculum-decisions.md). The user's subsequent instruction to proceed authorizes continued development; the first classroom pilot and hardware configuration remain open.

## Mission and audience

Use controlled-environment agriculture (CEA) as a living STEM laboratory: students learn science and engineering by observing plants, measuring their environment, building systems, and evaluating evidence.

The user's stated direction is to provide a free, openly reusable curriculum that schools can adopt module by module. The same curriculum should accompany progressively more capable STEM learning kits:

- Beginner activities and low-cost Arduino-class hardware.
- High-school hydroponics, better instrumentation, automation, and demonstration systems.
- An integrated grow-tent learning environment running Grownetics, teaching coordinated control of the environment and the conditions affecting plant growth.
- Advanced investigations spanning plant biology and nutrition, electronics, mechatronics, sensing, data interpretation and management, software development, automation, and reliability engineering.

The user also reports an approach from a NASA-funded educational outreach group interested in purchasing sensors for a lunar-regolith-simulant project. Its research aim is to improve the simulated lunar material's suitability for growing plants. No partner identity, protocol, purchase commitment, timeline, or specific sensor requirements have been supplied in this curriculum discussion. The curriculum must not imply NASA endorsement or an established NASA partnership.

## Recommended architecture

Separate three things:

1. **Modules:** focused objectives, explicit prerequisites, complete activities, and observable evidence of learning.
2. **Pathways:** teacher-ready sequences for particular audiences and interests, assembled from the same module library.
3. **Kit configurations:** optional, documented reference hardware with substitutions and minimum capabilities.

A fixed grade-by-grade course offers sequence but restricts selective adoption. A topic encyclopedia offers flexibility but leaves course assembly to teachers. The proposed hybrid provides both reusable modules and ready-to-teach pathways.

The repeated learning cycle is **observe → measure → explain → design → control → evaluate → improve**. Students revisit it at increasing depth rather than treating advanced equipment as a substitute for scientific understanding.

Recommended principles:

- The curriculum should remain usable without purchasing a Grownetics kit or subscription.
- Provide no-hardware, manual-measurement, recorded-data, and simulation alternatives where they can support the stated learning objectives. Do not claim a dataset activity proves hands-on wiring or commissioning competence.
- Grade bands are suggested entry points, not admission requirements. Use prerequisites and bridge lessons to support different ages and backgrounds.
- A biology class should not need to complete an electronics course before investigating plant nutrition. A computing class should be able to work with documented plant datasets.
- Keep platform-independent concepts separate from Grownetics-specific integration instructions. Referencing or integrating with Grownetics does not license the product software.
- Teach uncertainty, resource limits, maintenance, and safe failure alongside successful operation.

## Beginner-to-advanced progression

These are proposed module families, not new published academy modules or an approved production schedule.

| Stage | Suggested entry point | Module families | Evidence of learning |
| --- | --- | --- | --- |
| Discover: The Living Plant | Elementary or other beginners | Plant structures and life cycles; photosynthesis and respiration; water and nutrients; fair comparisons, measurements, and graphs | A growing journal and an explanation supported by observations, rather than only a tallest-plant contest. |
| Measure: The Instrumented Garden | Middle school or first-time makers | Circuits and Arduino; sensors and calibration; introductory coding and data logging; growing media and hydroponic basics | A monitoring station, comparison against a reference, and an explanation of measurement uncertainty. |
| Control: The Automated Growing System | High school | Root-zone chemistry, pH and electrical conductivity (EC); light and photoperiod; pumps, fans, and mechanisms; feedback, thresholds, hysteresis, and dashboards | Automation of one process with justified settings and demonstrated safe behavior under a simulated sensor fault. |
| Integrate: The Engineered Environment | Upper high school or career/technical education | Heat and moisture balances; psychrometrics; interacting control loops; Grownetics integration; reliability and maintenance | A commissioned grow tent with documented operating limits and evidence distinguishing crop, equipment, and measurement problems. |
| Investigate: Research and Optimization | Advanced high school or college | Experimental design and statistics; system identification and advanced control; software engineering and data infrastructure; resource optimization; specialized plant and space-agriculture research | A reproducible investigation or engineering design documenting evidence, uncertainty, failures, and tradeoffs. |

## Interest-based pathways

Shared projects should allow students to choose different disciplinary emphases:

- **Plant science:** physiology, nutrition, roots, microbiology, and plant stress.
- **Electronics and mechatronics:** instrumentation, circuits, pumps, mechanisms, and fabrication.
- **Data and software:** programming, visualization, databases, APIs, data quality, and reproducibility. Teach timestamps, units, missing data, provenance, and interpretation alongside collection.
- **Controls and reliability:** feedback, commissioning, fault detection, safe states, recovery, and maintenance.
- **Climate and resource engineering:** buildings, energy, water, regional design, and economics.
- **Space agriculture:** constrained resources, growing substrates, and habitat systems.

Mathematics, scientific reasoning, and communication run through every pathway. The [module map](curriculum-module-map.md) expands these families into proposed module specifications, prerequisite relationships, and assessment evidence. They still require educator review and classroom validation; a specification is not a completed or piloted lesson package.

## Existing academy foundation

As of this record:

- [Module 01: The Evolution of CEA Control](../modules/cea-control/module.js) is published. Its existing audience includes growers and automation engineers. It covers coupled effects, control strategies, uncertainty, and safety.
- [Module 02: Climate, Psychrometrics & CEA Design](../modules/climate-design/module.js) is a publicly listed draft accessed through preview mode. It covers moist air, weather evidence, crop-zone conditions, building loads, and design constraints.
- The academy already supports draft previews, Celsius/Fahrenheit display preferences, and light/dark themes. Physics uses canonical SI quantities rather than changing calculations with display preferences.

These modules can support control, integration, and advanced pathways. New beginner entry points should not require learners to start with professional-facing material. Catalog numbers need not define learning order. Existing public module URLs and publication states are unchanged by this planning document.

## Proposed hardware progression

| Configuration | Scope | Boundary |
| --- | --- | --- |
| No-kit classroom | Seeds, simple containers, manual observations, supplied datasets, and simulations | A legitimate learning pathway; hands-on objectives require corresponding physical activities. |
| Arduino starter kit | Low-voltage controller, basic environmental sensing, logging, and a small growing experiment | Introduce a protected low-voltage actuator after measurement fundamentals. |
| Hydroponics investigation kit | Small reservoir, water temperature and level, appropriate pH/EC instruments, environmental sensing, and supervised pump control | Select instrumentation for its required accuracy, calibration, maintenance, and classroom handling. |
| Grownetics teaching tent | Integrated sensing, lighting, irrigation, ventilation, environmental control, logging, alarms, and commissioning activities | Specific Grownetics interfaces and equipment compatibility must be verified before promising integration. |

Do not select sensors merely because they are inexpensive or offer many nominal measurements. Relative light measurements must not be represented as calibrated photosynthetic photon measurements. EC is bulk conductivity, not an individual-nutrient analyzer. A substrate-moisture calibration must not be assumed to transfer between different growing media.

Pricing requires a costed bill of materials that includes power supplies, enclosures, calibration supplies, consumables, replacement parts, and recurring costs. No kit price, sensor model, or purchase specification has been approved.

## High-school flagship proposal: the engineered growing environment

Students would:

1. Define crop requirements and measurable success criteria.
2. Map water, energy, air, nutrients, sensors, and actuators.
3. Install and check instruments.
4. Establish a manually operated baseline.
5. Add automation one subsystem at a time.
6. Coordinate subsystems through a documented Grownetics integration.
7. Exercise simulated faults and recovery procedures.
8. Evaluate plant outcomes, resource consumption, and reliability.

The learning claim should be **coordinated control within a defined operating envelope**, not independent control of every plant-growth variable. Lighting adds heat; ventilation changes moisture and CO₂; the surrounding room and installed equipment constrain achievable conditions.

Proposed safety boundaries:

- Student-built circuits remain protected low-voltage systems.
- Mains equipment uses approved enclosed interfaces and independent protective systems; do not teach breadboard mains switching.
- CO₂ enrichment and automatic chemical dosing are not default school-kit features.
- Define supervision, water/electrical separation, spill handling, shutdown, and recovery requirements before classroom use.
- Test faults through safe simulation or an approved supervised procedure, not uncontrolled hazardous equipment failures.

A teaching tent is not a certified commercial cultivation design or a substitute for site-specific safety review.

## Lunar-regolith research pathway proposal

Working title: **From Regolith Simulant to Growing Substrate**.

Driving question: **Which treatments improve plant establishment and growth in a specified lunar-regolith simulant, and what evidence supports that conclusion?**

This should reuse plant science, measurement, experimental design, and data modules rather than become an unrelated second curriculum.

### Investigation sequence

1. Explain regolith versus terrestrial soil and document what the selected simulant represents and omits.
2. Investigate water retention, drainage, aeration, chemistry, and nutrient availability.
3. Compare untreated simulant, candidate treatments, and an appropriate reference growing medium.
4. Use replicated experimental units, consistent procedures, and documented environmental conditions. Repeated readings from one pot are not independent treatment replicates.
5. Record germination, growth, water use, and measurements required by the research question.
6. Analyze improvement, uncertainty, and alternative explanations.

Instrumentation must follow the outreach group's actual protocol. Identify the exact simulant, species, treatments, endpoints, and required measurement quality before proposing a sensor package. Validate substrate measurements in that medium.

Distinguish three claims: improved plant growth, substrate conditioning, and remediation of a specified hazard. Improved growth alone does not prove detoxification. Simulant results do not automatically establish performance in actual lunar regolith or a lunar habitat.

NASA reports that researchers grew plants in Apollo regolith with added nutrient solution, but observed reduced growth and stress compared with controls. This is a useful research precedent, not proof that classroom simulant cultivation solves lunar agriculture. See the [NASA account](https://www.nasa.gov/humans-in-space/scientists-grow-plants-in-lunar-soil/) and [original study](https://www.nature.com/articles/s42003-022-03334-8).

Hands-on work requires the exact simulant's safety data and school-approved handling and disposal procedures. Experimental plants are not food. Do not imply NASA endorsement, use restricted branding, or promise partner deliverables without the relevant agreement.

## School adoption package

Each module should include:

- **Student materials:** accessible lesson, investigation sheet, data-recording template, and extension challenges.
- **Teacher guide:** prerequisites, preparation, common misconceptions, troubleshooting, and discussion prompts.
- **Scheduling:** instructional time separate from elapsed growing time, including weekends and holidays.
- **Materials:** minimum equipment, optional upgrades, substitutions, and recurring costs.
- **Safety:** supervision, handling procedures, shutdown, and cleanup.
- **Assessment:** observable outcomes, a rubric, and examples of reasoning; quizzes alone do not establish practical competence.
- **Standards mapping:** relevant local expectations and the actual activities and assessments supporting them.
- **Alternative delivery:** printable/offline materials and recorded data when equipment or live growing is unavailable, with honest limits on which objectives those alternatives satisfy.

For US adoption, the [NGSS three-dimensional framework](https://www.nextgenscience.org/three-dimensional-learning) provides disciplinary ideas, science/engineering practices, and crosscutting concepts. Map specific performance expectations before claiming alignment. Other school systems need their own mappings; no alignment or endorsement is claimed by this outline.

## Approved openness and licensing boundary

The user approved:

- **CC BY 4.0** for original curriculum content.
- **MIT** specifically for teaching software and examples.
- **No change to Grownetics product software licensing.**

[LICENSE.md](../LICENSE.md) defines the actual scope, mixed content/code handling, and third-party exceptions. Teaching about a product, calling its API, or including screenshots does not grant rights to its implementation or marks. Hardware design licensing is a separate decision and is not granted by this curriculum plan.

The proposed delivery model is freely reusable educational material with optional tested kits, integration, training, and support. Specific commercial offerings are not approved here.

## Proposed first pathway and unresolved decisions

Recommended first pathway: **The Living Laboratory: From Seed to Sensor**, covering observation, fair experiments, basic plant needs, Arduino measurement, and data interpretation. These foundations can support both tent and regolith projects.

Authoring update (2026-09-28): the [detailed pathway guide](pathways/seed-to-sensor.md) develops this shared foundation first, alongside the [curriculum module map](curriculum-module-map.md). Its working assumptions are beginner/middle-school learners and eight 45–60 minute sessions across roughly two to three weeks, with observation time and plant care tracked separately. These are design estimates, not user-selected enrollment or measured teaching times. The manual route does not require an Arduino; hardware-specific outcomes require a checked physical setup and are not credited for reading recorded data alone.

The user has not selected the first pilot. The options discussed are:

- Low-cost Arduino classroom kit.
- High-school Grownetics teaching tent.
- Lunar-regolith outreach partnership.

Before writing a pilot-specific implementation plan, establish:

- Pilot audience, teacher needs, class size, lesson schedule, and desired outcomes.
- Budget, available equipment, space, connectivity, and holiday care.
- Required assessment evidence and applicable school standards.
- Grownetics integration interfaces and deployment constraints where relevant.
- For the regolith project: partner protocol, simulant, species, treatments, measurements, safety approvals, and timing.

These are explicit open decisions, not implied commitments or incomplete implementation tasks. Shared curriculum authoring can proceed without selecting a partner-specific pilot. Choosing that pilot and validating the relevant hardware are required before making classroom delivery, purchasing, or integration commitments; the proposed module library is not automatically approved in full.

## Documentation practice

Maintain this outline as the current planning snapshot and [curriculum-decisions.md](curriculum-decisions.md) as the dated decision history. Update them as discussions establish requirements, change proposals, select hardware, or produce pilot evidence. Record assumptions and unresolved questions explicitly; do not turn recommendations into approvals.

Future detailed module and kit documents should link back here and include objectives, prerequisites, materials, safety, assessment, sources, and readiness status. Keep draft, classroom-piloted, and publication-ready claims distinct.

Original prose: CC BY 4.0, subject to [the repository's scope and exceptions](../LICENSE.md).
