# P-01 — The Living Laboratory: From Seed to Sensor

**Status:** educator-facing draft for planning and review; not classroom-piloted, an approved kit specification, or a published module. **Original curriculum prose:** CC BY 4.0; see [licensing scope and third-party exceptions](../../LICENSE.md). This pathway assembles proposed modules from the [curriculum module map](../curriculum-module-map.md). See the [curriculum outline](../curriculum-outline.md) for the wider progression and the [decision log](../curriculum-decisions.md) for approved versus open decisions. This guide does not select the first external classroom pilot.

## Planning frame

- **Driving question:** What can careful records of a small growing system tell us about its plants and conditions—and what can they *not* tell us?
- **Default planning audience:** grades 6–8 or beginner makers, adaptable to older or younger learners after educator review. Assume teams of two to four, access to a supervised growing location, and a teacher able to arrange between-class care. These are planning assumptions, not an enrollment decision.
- **Time estimate:** eight 45–60 minute contact sessions (50-minute agendas below), spaced across roughly two to three weeks, plus brief dated observations and care between sessions. Plant development may not fit this estimate; observe rather than promise an emergence date. Shorten/extend each agenda's practice and discussion, not safety checks or recordkeeping.
- **Core task:** label and tend a small seed-growing system, keep a traceable log, visualize observations, and make one evidence-limited claim. One container is an observation unit, not a controlled experiment. Two or more containers without deliberately assigned conditions and independent replication are still not proof of causation.
- **Routes:** the **manual route** is complete and assesses FND-01 through FND-04 without coding or electronics. A separately bounded **Arduino-assisted extension** can add MSR-01 and MSR-02 only after the actual hardware and school procedures pass preflight. If it cannot run, stay manual; do not award hands-on MSR competence from a worksheet or prerecorded data.
- **Prerequisites:** FND-01 and FND-03 have no prior modules. FND-02 follows FND-01; FND-04 follows FND-02 and FND-03; MSR-01 follows FND-03; MSR-02 follows MSR-01 and FND-03. Equivalent prior competence can satisfy a prerequisite. Sessions interleave strands; a session is not an entire module. Biology-only learners do not need the electronics strand.
- **Teacher decisions before adoption:** check age and accessibility needs, local seed/plant allergies and school hygiene rules, growing space and light, container/water management, supervision and holiday care, available reference instruments, actual class schedule, assessment expectations, and whether any Arduino equipment has been validated. Select locally permitted, easy-to-handle seed material; do not promise its germination. The planting method follows the supplier's directions and local safety review, not a universal depth or irrigation prescription here.

### Outcomes and evidence

| Curriculum module (proposed) | By the end, a learner can… | Observable evidence | Sessions |
| --- | --- | --- | --- |
| FND-01 **Plants as Living Systems** | Identify seed emergence separately from subsequent growth, describe visible plant structures and plausible needs, and distinguish measured height from overall plant health. | Labeled sketches or accessible descriptions, condition/care record, qualified plant-state explanation. | 1, 2, 5, 8 |
| FND-02 **Asking Testable Questions** | Turn an observation into a measurable question and distinguish monitoring from a fair comparison; identify variables, possible confounders and what an experiment would require. | Investigation brief and a paper controlled-comparison plan; conducting the proposed experiment is not required and the monitoring series does not establish causation. | 2, 5, 7 |
| FND-03 **Measurements, Units & Uncertainty** | Record a quantity with unit, method, location and local date/time; repeat a measurement and describe spread, resolution and why repeatability does not guarantee accuracy. | Measurement protocol and two readings of the same object, annotated log and uncertainty note. | 2, 3, 6 |
| FND-04 **From Records to Evidence** | Retain missing-data flags, plot or tabulate an appropriate series, and make a claim citing specific records and at least one alternative explanation or limitation. | Traceable graph/table, final claim–evidence–reasoning statement and limits. | 4, 5, 7, 8 |
| MSR-01 **Safe Circuits & Microcontrollers** | On checked-out, protected low-voltage equipment, identify power, ground, input and output; compare the setup with a provided diagram before power-up and demonstrate an input response and safe shutdown. | Teacher-observed diagram check, input response and shutdown; not assessed on the manual route. | 6 (extension) |
| MSR-02 **Sensors & Data Logging** | On checked-out hardware, identify quantity/unit, time basis, placement and two likely error sources; preserve readings and missing/implausible flags, and compare spot readings with an appropriate reference method. | Placement sketch, timestamped device log and discrepancy/uncertainty note from an actual reference comparison; not assessed on the manual route. | 6–8 (extension) |

**Exit artifacts:** each team submits its labeled system/placement diagram, investigation brief including a paper fair-comparison plan, dated observation and care log (including gaps), one repeat-measurement record, a graph or clearly ordered table, and a short claim with cited records, limits and a next question. For the hardware route, add the supervised circuit/safety checkout, observed input response, placement diagram, raw timestamped device record and reference-comparison note. Assess the manual artifacts identically on both routes; do not penalize a team for lack of hardware.

## Materials and preparation by capability

Quantities depend on class size, school supplies and approved setup; no price, model, purchase or finished kit is implied.

| Allocation | Minimum capability | Substitution or caution |
| --- | --- | --- |
| Per team | One labeled, stable, drain-managed seed container; locally approved growing medium and seeds; access to water and a protected light location | Use an existing classroom growing setup. Prevent runoff; do not place water above electrics. A teacher-grown reference plant may support discussion but must retain its different provenance. |
| Per team | Paper observation sheets or offline equivalent; pencil; labels; a ruler marked in known length units | Large-print/tactile ruler or partner reader with student directing measurements; photograph/sketch can complement but not replace unit/time metadata. |
| Shared | Clean handwashing access; spill supplies; safe storage; a teacher care roster and a way to mark missed observations | Printed logs work with no network, account, phone or coding. |
| Shared if available | A room-condition measuring instrument with stated unit/resolution, a clock, and optionally a second independent instrument for comparison | Without one, record qualitative location/light and plant observations; do not invent environmental numbers or claim instrument accuracy. |
| Extension only, per participating team or shared station | A school-approved, protected low-voltage Arduino-class controller, compatible sensing/readout capability for a specified environmental quantity, safe power arrangement, and a means of recording timestamps with units | Selection and compatibility are **pending validated reference hardware**. No pinout, firmware, interface or sensor model is specified here. Manual measurements remain the authoritative common assessment route. |

Before session 1, trial the chosen container and place a sample log at the growing location. Prepare a clearly labeled comparison/reference plant only if available; record that it was not grown under the team's protocol. For the extension, complete the preflight below before offering any live electronics work.

### Safety and care boundaries

Teacher supervises sowing, watering, tools and any electrical station; follow school allergy, sanitation and spill rules. Wash hands after handling seeds, medium or plants; cover cuts, avoid tasting experimental plants, and do not treat them as food. Avoid airborne dust and products requiring hazardous handling. Keep containers stable, catch drainage, wipe spills promptly, and separate water work from powered equipment; switch off/disconnect under approved procedure before moving or cleaning electronics. Student-built circuits stay within checked, protected low-voltage equipment. No mains wiring/switching, chemical dosing, CO₂ enrichment or lunar simulant in P-01. Assign a named adult for weekends/holidays and document watering or inability to care; students should not be expected to enter a closed school. If care cannot be arranged, reschedule sowing or use a teacher-managed living specimen with its provenance documented. Local school risk assessment controls the actual activity.

## Eight-session teaching sequence

The minute marks are planning estimates, not measured class timings. A 45-minute class can trim the final sharing/practice by five minutes; a 60-minute class can add ten minutes of practice or discussion. The brief observation schedule below is *in addition* to these contact periods.

### 1. A living system and its record (50 minutes)

- **Objective:** describe what is being observed, distinguish a seed's emergence from later growth, and create a traceable growing unit (FND-01).
- **Teacher preparation:** check safe seed/medium choice and drainage, identify stable location and care owner, print brief and log; do not prelabel a teacher-grown plant as student-grown.
- **Agenda/student work:** 0–8 min observe a seed or plant and list what is directly visible versus inferred; 8–18 discuss plant structures/needs and observable stages; 18–35 label container, set up/sow using approved instructions and record date, material, placement and care; 35–45 draw/describe baseline and agree observation method; 45–50 exit explanation of what would count as emergence.
- **Checkpoint:** container ID matches a first dated record and baseline sketch/description; teacher checks water containment.
- **Misconception to address:** a seed not yet visible above the medium has not necessarily failed; no emergence and no later growth are different observations.

### 2. Questions and a reproducible measure (50 minutes)

- **Objective:** turn observations into questions, choose an operational definition for emergence and height, and log metadata (FND-01/02/03).
- **Teacher preparation:** bring rulers with units, sample blank logs and accessible recording alternatives; choose a consistent observation location/time window where feasible.
- **Agenda/student work:** 0–10 inspect and record system without assuming change; 10–22 sort answerable monitoring questions from causal ones; 22–35 agree a protocol (container ID, what counts as first visible emergence, height from medium surface to a defined visible plant tip, measuring position, unit, local date/time); 35–45 practice on a common object twice; 45–50 submit the investigation brief question and protocol.
- **Checkpoint:** learner states unit and measurement origin, plus why a question such as “did light cause growth?” needs a designed comparison rather than a single time series.
- **Misconception:** height is a complete measure of health. Ask what leaf color/condition and visible damage can add without diagnosing an unseen cause.

### 3. Repeatability, accuracy and care (50 minutes)

- **Objective:** repeat a measurement, report difference/resolution and identify an accuracy limitation (FND-03).
- **Teacher preparation:** supply the same measurable object or stable plant reference for paired repeat readings and, if available, a second checked instrument; review watering oversight.
- **Agenda/student work:** 0–10 record a dated plant observation and any care; 10–25 each team measures the same object twice without looking at the previous value, retaining both readings; 25–38 discuss spread, unit, instrument graduations and whether agreement proves truth; 38–45 annotate a location/placement or observer difference; 45–50 exit statement about one source of uncertainty.
- **Checkpoint:** two actual readings, not a copied value, with unit and method; teacher checks “repeatable” is not equated with “accurate.”
- **Misconception:** several matching readings guarantee correctness. A consistently offset ruler origin or changed measuring point can be repeatable and biased.

### 4. A trustworthy time series (50 minutes)

- **Objective:** maintain a traceable log and represent observations without converting missing records to zeros (FND-03/04).
- **Teacher preparation:** gather logs and prepare graph paper or offline spreadsheet if locally available; do not fill gaps with fabricated plant data.
- **Agenda/student work:** 0–10 plant check and care record; 10–23 audit container ID, date/time, units, care and missing-data flags; 23–38 make a time-ordered table or start a graph of actual height values only (day/date on horizontal axis, height and unit on vertical); 38–45 compare notes on changed protocols or observers; 45–50 explain what a gap means.
- **Checkpoint:** a missed reading is flagged “M,” reason if known, not plotted as zero; if no height yet, a dated “no emergence observed” remains a valid observation.
- **Misconception:** joining plotted points creates measurements on missed days. Lines may aid reading but must not be represented as observed intermediate values.

### 5. What would a fair test require? (50 minutes)

- **Objective:** distinguish association across time from an intervention's effect; plan a hypothetical controlled comparison without conducting it (FND-01/02/04).
- **Teacher preparation:** choose a harmless hypothetical question, such as comparing two teacher-approved light locations, without changing the class's ongoing observation protocol or promising a result.
- **Agenda/student work:** 0–10 observe/care; 10–22 identify simultaneous changes with plant age and possible confounders; 22–38 draft a paper comparison plan: one changed factor, a defined outcome, conditions held as similar as feasible, independently assigned growing units per condition, and a consistent measurement schedule; 38–45 critique alternatives and feasibility; 45–50 record one limitation of the actual monitoring study.
- **Checkpoint:** a design identifies comparison and independent units; repeated readings of one pot are not replicates. This is design practice, not an assertion that the experiment was conducted.
- **Misconception:** a rising temperature and rising height in the same period prove temperature caused growth. Plant age, care, light and other changes remain possible explanations.

### 6. Placement and instruments (50 minutes; optional hardware station)

- **Objective:** assess placement and uncertainty in a measurement; extension learners demonstrate safe circuits and timestamped sensing (FND-03; MSR-01/02 only if preflight passes).
- **Teacher preparation:** for all teams, arrange a manual plant check, ruler and (if available) a shared room-condition meter. For extension only, document checked power/compatibility, supervise a dry station, and prepare a verified way to display/log readings and stop safely. Do not attempt classroom wiring from this guide.
- **Agenda/student work:** 0–10 observe/care; 10–22 compare where a reading would represent leaf-zone versus room conditions and draw placement; 22–40 **manual route:** repeat a ruler/available-meter reading and log quantity, location, time and caveat; **extension:** identify power/ground/input/output and check the supplied circuit diagram before supervised power-up, then observe an input response and preserve timestamped readings; 40–47 **manual route:** compare repeated readings and discuss uncertainty; **extension:** compare with the prepared reference when available, otherwise record the limited outcome; 47–50 shutdown/exit note.
- **Checkpoint:** manual learners explain placement and record real readings if possible; extension learners demonstrate the diagram check, input response and safe shutdown, preserve raw readings, and describe two possible error sources. A reference comparison is required for full MSR-02 evidence; a limited logging demonstration does not establish that outcome.
- **Misconception:** a readout with many digits is necessarily accurate or measures the plant itself. Discuss resolution, placement and instrument limitations.

### 7. From records to a bounded claim (50 minutes)

- **Objective:** use recorded evidence and an explicit limitation to support a descriptive—not causal—claim (FND-02/04; optional MSR-02 comparison).
- **Teacher preparation:** return logs with feedback on units/gaps; have paper graph templates or offline graphing available, plus an anonymized practice example clearly labeled hypothetical *only if needed*.
- **Agenda/student work:** 0–10 observe/care; 10–25 finalize graph/table from actual records, mark gaps and any sensor data as a distinct series; 25–38 write claim–evidence–reasoning with two specific dated records where available; 38–45 peer review for overclaim and alternative explanations; 45–50 revise.
- **Checkpoint:** claim cites records and scope (“in our observed container during these dates”); if fewer than two comparable values exist, make a documented no-change/no-emergence/insufficient-evidence statement instead of inventing a trend.
- **Misconception:** “we logged it automatically” removes missing-data or placement problems. Check timestamps and compare what each device actually sampled.

### 8. Explain, critique, hand off (50 minutes)

- **Objective:** communicate a defensible conclusion, its uncertainty and a feasible next question (FND-01/04; extension MSR-02).
- **Teacher preparation:** ensure care/cleanup plan for living systems after the lesson; provide rubric and collection method for paper or offline artifacts.
- **Agenda/student work:** 0–10 final dated observation/care and safe cleanup or handoff; 10–27 team presentations using diagram, log and graph/table; 27–38 peer questions on missing data, measurement and competing explanations; 38–47 independent reflection and next-question proposal; 47–50 submit artifacts and record system disposition.
- **Checkpoint:** each learner can distinguish what was directly observed, what was inferred and what remains unknown; teacher collects actual artifacts, not an asserted successful crop.
- **Misconception:** failure to germinate means failure to investigate. A well-documented non-emergence and realistic limits are valid evidence, not proof of the cause.

### Elapsed care and observation schedule (outside contact time)

| When (relative to sowing) | Responsible action | Record to retain |
| --- | --- | --- |
| Day 0, session 1 | Label, sow, place, document initial state and care | Container ID, date/time, materials and setup/placement description. |
| Each accessible school day, preferably a consistent time window (brief check) | Assigned student with teacher oversight checks visible emergence/condition and teacher-approved moisture/care needs; water only under agreed procedure | Date/time and observer; “not emerged observed” versus “emerged”; care action or “none”; quantities with units only when actually measured. |
| Weekends, holidays and other closures | Named adult follows school-approved care plan; do not require student access | Actual care/time if known. Mark unobserved intervals **M** with reason when known, rather than inventing observations. |
| Sessions 2–8 | Team verifies labels, protocol and records, measures emerged plant height only if a defined point is visible | Actual readings, units, local times, observer/placement or method changes, quality notes. |
| After session 8 | Teacher assigns safe continued care, transplant/disposal according to school practice, or closes system | Handoff/disposition and any final observation; no consumption. |

If a plant emerges between checks, record the **first observed** emergence, not an exact germination time. No emergence by session 8 is not evidence that seeds were nonviable. If a container fails, preserve its records, check documented care/conditions without diagnosing from absence alone, and optionally observe a separately labeled teacher-managed plant; never merge its measurements into the original series. If readings are missed or an instrument fails, keep raw records, mark **M** and known reason, resume with actual timestamps, and narrow claims accordingly. Do not backfill, interpolate or treat zero as “missing.”

## Arduino-assisted extension: a bounded design, not a kit instruction

**Preflight gate, completed by an educator/technical reviewer on the actual hardware before students use it:**

1. Confirm school approval, protected low-voltage supply, safe enclosures/connectors, dry placement and an accessible power-off procedure; exclude mains-connected student wiring or actuators.
2. Verify controller, sensor/readout, power and any logging device are mutually compatible and operate in a supervised test; retain the applicable manufacturer instructions and an accurate diagram for the actual setup. Students trace the provided diagram before supervised power-up; this guide itself supplies neither pin assignments nor code.
3. State the measured quantity, output unit, expected operating range and resolution from the selected device's documentation; identify a suitable placement that does not confuse room air with the plant microenvironment or wet medium.
4. Demonstrate timestamp provenance (clock setting, local time zone or offset, whether timestamp is entered manually), how readings are preserved/exported offline, and what happens on power loss or unavailable readings.
5. Prepare an appropriate independent instrument or reference method for the same quantity under comparable conditions. Record discrepancies rather than calling a casual comparison calibration. If no suitable reference is available, record only the demonstrated MSR-01 and limited logging outcomes, not full MSR-02 competence. Assign a teacher to supervise setup, shutdown, spills and troubleshooting.

Only after all applicable checks pass may teams perform the extension in sessions 6–8: sketch placement, record raw timestamped measurements alongside but distinctly from plant observations, repeat a reading, annotate gaps or implausible values without deleting them, and discuss whether placement and sampling represent the intended condition. Sensor values cannot establish causation, plant health, measurement accuracy or control performance. An unvalidated sensor, missing clock or unsafe installation means skip the hardware activity and use the complete manual route; a provided historical dataset can support data interpretation but not MSR-01/02 hands-on checkout.

## Copyable student investigation brief

Use non-identifying team and observer codes on any shared copies. Keep the connection to student names within school-approved records; do not publish learner identities or identifiable photographs. The curriculum's CC BY license does not automatically license student submissions or override school consent, privacy and retention requirements.

> **Team / observer code(s):** ____________________   **Container ID:** ____________________
>
> **Sowing date and local time (with zone/offset if known):** ____________________
>
> **Seed/medium/container and starting state:** __________________________________________
>
> **Growing location, drainage and light description:** __________________________________
>
> **Our observation question (not a causal claim):** ______________________________________
>
> **What counts as first observed emergence?** __________________________________________
>
> **What will we measure, with unit and measurement origin/point?** _________________________
>
> **When and where will we check? Who covers closures?** __________________________________
>
> **What care actions will we record, and who approves them?** _____________________________
>
> **One thing our observations alone cannot establish:** __________________________________
>
> **Required fair-test *planning sketch* (not an experiment conducted in this pathway):** factor to change _______; comparison _______; outcome and unit _______; factors held similar _______; independently assigned growing units per condition _______; possible confounder _______. Do not claim an intervention occurred unless it actually did.

### Blank observation and care log — copy rows as needed

Write `M` for a missed observation and a reason if known; use “not observed” for a condition you checked and could not see. Do not write zero height when no plant has emerged. Record local time consistently; add zone/offset if collaborating across sites.

| Container ID | Local date/time (+ zone/offset if relevant) | Observer | Emergence/visible structures and condition | Height (unit; defined origin) or not measurable | Other actual measurement (quantity, value, unit, location) | Care action/time or none | Quality flag / reason / method change |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

### Blank repeat-measurement / sensor comparison record

Repeat the **same object, point and method** for the first two readings. If using a separate instrument, name it; disagreement does not by itself identify which is correct.

| Date/time | Object or quantity; unit | Method, origin and placement | Reading 1 | Reading 2 | Difference/spread and instrument resolution | Independent comparison (if any) | Possible bias / quality note |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

### Blank evidence summary

| Claim limited to this system and interval | Specific dated record(s), units and graph/table reference | Why these records support it | Missing data, uncertainty or alternative explanation | Next testable question |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Assessment and discussion

Score the **common manual-route evidence** on four criteria, each 0–2 (8 points total). `2` = complete and defensible; `1` = partly supported or missing a key qualification; `0` = absent or contradicts available evidence. A documented absence of emergence can receive full credit. Do not grade crop success, tallest plant, access to electronics or the number of sensor samples. Teacher may assess the optional MSR outcomes separately using the checkout and raw-log evidence specified above, not add them to this common score.

| Criterion | 2 — strong evidence | 1 — developing | 0 — not demonstrated |
| --- | --- | --- | --- |
| Living system and question (FND-01/02) | Distinguishes emergence/growth/health; poses an observable question, states its causal limit, and plans a measurable comparison with independent units and a confounder. | Some distinctions or planning elements are missing, or the claim overstates what monitoring tests. | No coherent observation question/comparison plan or treats a trend as proven cause. |
| Traceable method and care (FND-03) | Identified unit/system, consistent dates/times and measurement origin/units; care and protocol changes recorded. | Traceable in part but a key unit, timestamp, origin or care change missing. | Records cannot be attributed or compared. |
| Data quality and representation (FND-03/04) | Retains actual readings and flagged gaps; two separately taken repeat readings with uncertainty note; graph/table labels time and units where numerical data exist. | Some records represented, but gaps/units/repeats or uncertainty are unclear. | Invents/replaces data, treats missing as zero, or gives no usable representation. |
| Explanation and limits (FND-04) | Cites specific records, makes appropriately narrow claim and names an alternative or uncertainty plus a next question. | Cites some evidence but reasoning or limits are thin. | Unsupported causal conclusion or no traceable evidence. |

**Discussion prompts and answer principles:**

- “When did germination happen?” The record gives *first observed emergence* and an observation interval, not necessarily the biological instant germination began. Ask what the log can actually establish.
- “Which plant is healthiest?” Height alone cannot establish health; ask learners to cite visible structures, leaf condition, context and what remains unmeasured. Do not diagnose a disease from one symptom.
- “Are identical ruler readings accurate?” They show repeatability at the recorded resolution, not necessarily accuracy; compare the origin, method, instrument and independent reference, if one exists.
- “Did watering/light/temperature cause the change?” Care, environment and plant age may vary together; a monitoring series can motivate a fair-test design but cannot isolate a cause. Discuss controlled change, comparison and independent growing units.
- “What does an empty day or a zero mean?” `M` is unobserved; zero is an actual numeric reading only when the defined quantity could meaningfully equal zero and was measured. “No emergence observed” is a dated condition, not height zero.
- “Does the sensor measure what the plant experiences?” The answer depends on quantity, location, exposure, timestamp and device limitations. A room-air reading cannot automatically represent leaf-zone or root-zone conditions.

**Accessibility and offline delivery:** provide printable/large-print forms, high-contrast labels, verbal or tactile descriptions, and accessible digital tables where available. Let learners direct a partner's physical measurement and independently interpret the evidence; permit spoken, typed or handwritten final explanations with the same rubric. Schedule checks with predictable routines and allow a supervised alternative task for allergy or handling restrictions. Graph on paper, retain paper originals and transfer only real records later. A teacher-provided, explicitly labeled historical dataset can exercise FND-04 if a live system is unavailable, but cannot substitute for hands-on growing/measurement or MSR hardware outcomes; document which outcomes were actually observed.

## Pilot feedback to collect before claiming readiness

This is an **unpiloted draft**. An educator considering a classroom pilot should document, without treating this checklist as an approval:

- [ ] Learner age/experience, class size, session spacing and actual contact/elapsed times; where the 50-minute agendas did or did not fit.
- [ ] Local safety/allergy, handwashing, drainage, power and supervision review; incident or near-miss handling and weekend/holiday care outcome.
- [ ] Container/seed/medium provenance, light location, emergence variability and what happened when no plants emerged.
- [ ] Availability, readability and accessibility of blank forms and rulers; offline use and accommodations needed.
- [ ] Completeness of units/timestamps/care records, number and reasons for missing observations, and whether learners could distinguish repeatability, accuracy and causation.
- [ ] Which exit artifacts and rubric criteria produced useful learning evidence; confusing wording or unrealistic demands to revise.
- [ ] If hardware was attempted: actual models and documentation, protected-power checkout, quantity/unit/range/resolution, clock provenance, sensor placement, logging gaps, comparison method and shutdown; whether MSR evidence was genuinely demonstrated.
- [ ] Teacher/student feedback, resource consumption and recommended revisions before any claim of classroom-tested status or reference-kit readiness.

## Possible next modules or investigations

Choose a branch based on interests and prerequisites, not a required sequence for everyone: **plant science and hydroponics** can deepen roots, water and nutrient questions with appropriate chemistry and hygiene review; **tent control and reliability** can build from measured conditions toward safe, validated sensing, control and fault handling (the existing [CEA control module](../../modules/cea-control/module.js) is published and the [climate design module](../../modules/climate-design/module.js) remains a draft preview, not beginner prerequisites); **regolith-simulant investigations** require a defined partner protocol, exact material safety information, independently replicated comparisons and school approval before handling—none is part of this beginner pathway. Each branch reuses careful records and bounded inference; no branch or hardware purchase is assumed.


## Sources and educator reference checks

- [University of Minnesota Extension: Starting seeds indoors](https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/starting-seeds-indoors) supports the distinction between germination and subsequent seedling care, the importance of moisture and drainage, and following the selected seed's growing instructions. It is gardening guidance, not approval of a classroom setup. Read seed-packet warnings and school rules; select untreated, school-approved seed material and do not introduce fertilizers or heated equipment simply because an external guide discusses them.
- [NGSS three-dimensional learning](https://www.nextgenscience.org/three-dimensional-learning) supports combining disciplinary ideas, investigative practices and crosscutting concepts. This guide has not been mapped to specific performance expectations and does not claim standards alignment or endorsement.
- For the optional hardware route, retain the exact manufacturer's power, handling and measurement documentation during preflight. No board or sensor has been selected or validated by this guide; generic Arduino familiarity is not evidence of compatibility.

These references support the teaching design; neither source documents nor their images are redistributed here. Estimates, lesson sequence and rubric are original unpiloted curriculum proposals. Original prose is CC BY 4.0 under [the repository's scope and exceptions](../../LICENSE.md); Grownetics product software remains outside that grant.