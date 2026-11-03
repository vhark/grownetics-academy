# Academy learner experience

Status: the combined learner experience remains approved through [CUR-016](curriculum-decisions.md#cur-016--approve-the-combined-learner-experience-for-the-formal-design). Application and storage architecture are superseded in part by [CUR-017](curriculum-decisions.md#cur-017--adopt-self-hosted-interactive-courseware-with-school-hosted-journals) and the [self-hosted courseware specification](superpowers/specs/2026-11-03-self-hosted-courseware-design.md), which is approved for implementation planning. This record remains authoritative for pedagogy, themes, accessibility, guidance, sources, and teacher resources. No production application or complete teaching pack is claimed.

The conventional Academy, personal journal, GrowAdventure shared world, and dimensioned facility model remain separate trust and authority boundaries even though the courseware now has a school-hosted backend. The shared-world editor starts with 2D plan editing and explicit height, elevation, and level data. See the [approved decisions](curriculum-decisions.md#approved-decisions) and [shared-world concept](academy-game-world-concept.md).

## One learning loop, several places to learn

Use an evidence-led RPG structure: explore a question, choose an appropriate activity, observe or build, record evidence, explain its limits, and review the work. The activity may happen at a desk, around a real plant, in a team facility-design project, or with clearly labeled supplied records. These routes do not automatically establish the same practical competence.

Use the [existing module map](curriculum-module-map.md), not a separate game curriculum. Discover, Measure, Control, Integrate, and Investigate describe increasing system scope; they are not five mandatory courses or experience-point gates. Interest pathways may intersect. A learner may read a lesson without earning access, and may demonstrate equivalent prior competence for its prerequisites. Safety requirements and equipment-use permissions still apply.

The four FND modules illustrate the flow, without selecting the external pilot or implying that these proposed modules have been published:

| Module | Evidence example |
| --- | --- |
| FND-01 — Plants as Living Systems | Two dated observations, with observation distinguished from a causal claim |
| FND-02 — Asking Testable Questions | A comparison plan, prediction, measurable outcome, and potential confounder |
| FND-03 — Measurements, Units & Uncertainty | Repeated readings with dates, units, instrument resolution, and justified uncertainty |
| FND-04 — From Records to Evidence | A graph or accessible ordered table and a claim–evidence–limitations explanation |

The suggested Seed to Sensor route is not the prerequisite graph: FND-03 has no prerequisite; FND-04 depends on FND-02 and FND-03. The interface must preserve that distinction rather than derive prerequisites from a displayed list order.

### Progress and motivation

- Use not started, exploring, practicing, and self-reviewed completion for private learner progress. Show the evidence checklist and the activity route actually performed.
- Link records to stable module IDs, the curriculum version reviewed, and relevant journal entries. A curriculum update must not silently reinterpret an old completion against changed criteria.
- Offer visible skill milestones and optional botanical flourishes. Do not reward repeated clicks, unnecessary uploads, daily streaks, or time spent logged in.
- Do not infer mastery from a file's presence. Self-edited local progress is not an authenticated credential, and a milestone animation is not a grade.
- Keep teacher assessment separate, attributed to the reviewer and the submitted evidence/version. Reviewing a shared copy does not grant access to the learner's private folder.
- Preserve revision and reflection: a learner can revisit a module, add contradictory evidence, and improve the explanation.

### Relationship to the shared world

The class campus gives people a place to meet, find activities, and discuss work. Team projects give them a shared facility to design. The journal remains a private workspace that is independently useful without an avatar or class account.

A learner opens the filesystem-authorized journal in a top-level browser context, not a cross-origin game iframe. Moving between surfaces may carry public curriculum references or authorized project identifiers; it must not pass folder handles, private file paths, or journal text through URLs. Sharing requires choosing the entries, attachments, or design snapshots to copy. Shared records are intentional copies, not live access to the journal folder.

The planned 2D facility editor uses the common dimensioned model; its learning prompts can link back to the same module and evidence criteria. A game challenge is not a physical law, and placing equipment does not demonstrate installation or safe commissioning.

## Three themes, unchanged science

| Theme | Visual direction | Invariant |
| --- | --- | --- |
| Academy — default | Retain the existing Academy's Lora, DM Sans, and IBM Plex Mono direction; green, sage, paper, and terracotta | Familiar entry point; the existing conventional site remains intact |
| Botanical fieldbook | Original book-like composition, warm paper, accurate attributed botanical illustrations, restrained margin ornament, optional gentle milestone reveals | No copied franchise artwork, invented anatomy, decorative obstruction, or magical explanation of real plant processes |
| Academic | Restrained typography, clear labels, compact reference treatment, high-contrast print-friendly structure | The same lessons, evidence criteria, progress, and source access |

Appearance is independent of learning/design mode and authorization. A theme change cannot alter a facility dimension, hide missing measurements, grant a role, or remove an activity requirement.

Allow font size, line spacing, reading width, contrast-safe accent choices, and motion preferences. Store preferences with the portable journal under the approved file lifecycle. Do not require a reward to unlock accessibility settings. Honor reduced-motion preferences; avoid mandatory animation, hover-only help, and color-only status. Keep native keyboard navigation and readable focus indicators. Mobile and zoomed layouts must preserve a linear reading order rather than require the entire fieldbook spread to fit onscreen.

Botanical images need per-work rights and scientific review appropriate to their teaching use. Historical illustrations may be useful references, but must not be presented as learner photographs or observations. If an illustration depicts a particular species or growth stage, label it accordingly; decorative ornament is not an identification key.

## Grownetics guide: an editorial voice

The current persona is authored guidance, not a live AI tutor. Put brief help at the relevant action: what to do next, why it matters, what to record, and what remains uncertain. Offer a deeper explanation when requested, without forcing the learner through repeated modal tutorials.

Example measurement prompt: “Write the unit beside the number. Record when and how you measured it. What could make a repeat reading different?”

Use plain language without weakening technical meaning. Define unfamiliar terms when first needed. Separate observation from interpretation; distinguish a plausible explanation from a diagnosis or established cause. Avoid a persona claiming to have seen the learner's plant, checked their wiring, or verified competence. No model access to local records is implied.

Editorial sequence: draft against the learning outcome and sources; check technical accuracy and safety; apply the requested Humanizer pass to remove formulaic prose; recheck facts, caveats, and citations; review readability and accessibility; publish a versioned release. Tone editing must not manufacture confidence or erase an important limitation.

## Teacher packs and printable materials

Each module delivered through the new experience must include a complete teacher PDF and these resources:

- Teacher notes: learning outcomes, prerequisites, preparation, materials, planning time, safety, facilitation, misconceptions, rubric, and example evidence or answers.
- Teaching presentation: figures, explanatory notes, and source credits.
- Relevant curated YouTube or other video links: explain their teaching purpose and provide an accessible text-based route to the required learning. External video availability must not determine whether the core activity can be completed.
- Student materials: lesson, activity steps, observation or measurement worksheets, reflection prompts, glossary, diagrams, and evidence checklist.
- Alternative routes: manual observation, supplied-data interpretation, and accessible recording methods where they meet the outcome. State which hands-on outcomes an alternative does not establish.
- Accessible HTML and low-ink printable PDFs, plus editable source material where rights permit. Use readable tables, explanatory figure captions, meaningful headings, and usable page breaks; do not rely on theme color or animation to convey information.
- Source and media credits, module/release identity, revision information, and any actual standards mappings. Do not present proposed mappings as verified alignment, accreditation, or partner endorsement.

Use one authoring source to generate the Academy presentation, the journal's curriculum package, and printable resources. Do not maintain separate, slowly diverging copies of each lesson. A teacher can use the pack without the game or a learner's local journal folder. Printable output must be checked as a document, not assumed correct because the HTML looks acceptable.

## Sources, explainers, and publication

Provide brief definitions near unfamiliar terms, expandable explanations, and a visible source trail. Preserve citations in exports and print; distinguish source-supported facts from teaching heuristics and design assumptions. Explain what a cited resource supports rather than attach an unexplained list of links.

The curriculum release needs explicit module identity and publication status, version, outcomes, prerequisites, activity routes, safety notes, lesson content, evidence criteria, guidance, teacher-resource references, sources, and media rights. The exact serialization is an implementation-design decision; these are the consumer-visible requirements. Keep a learner's records linked to the version they used. Show unavailable content honestly rather than substitute an unrelated cached lesson or silently change requirements.

Link to external readings first. Embed, adapt, or bundle only when the particular work's rights permit that use. A free Academy add-on is not a blanket right to redistribute third-party material. Retain title, creator, source, license, and modification notes for bundled media; licenses may differ between original prose, teaching code, images, and upstream software.

Existing photography guidance remains linked, not copied:

- [University of Maryland Extension: Tips for Submitting Photos to Ask Extension](https://extension.umd.edu/resource/tips-submitting-photos-ask-extension).
- [Iowa State University: plant photography guidance](https://yardandgarden.extension.iastate.edu/pidc/photography).

## Browser review artifact

The integrated fieldbook concept lives at `.superpowers/brainstorm/47230-1790625807/content/learner-fieldbook-v3.html`. It demonstrates three theme treatments, four illustrative FND activity views, ephemeral working notes, milestone treatment, a teaching-pack structure, and expandable guidance. These are design interactions, not production journal, authentication, assessment, collaboration, or filesystem features. The teacher view previews proposed pack contents; it does not contain a complete classroom-ready module pack.

The reference image is [Lactuca sativa — Krauss (1800), plate 365, via Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lactuca_sativa_-_001x.jpg). The file page attributes its source to volume 4 of *Afbeeldingen der Artseny-Gewassen* and marks it public domain under the stated copyright-term conditions. Its historical plate is reference material, not a learner's observation. Botanical teaching review and jurisdiction-appropriate rights review remain release checks.

This preview loads the image from Wikimedia and fonts from Google. Production must deliberately package permitted assets rather than inherit those prototype network dependencies. Prototype notes remain only in the open page and reset on reload; there is no folder save, camera capture, learner account, or server-backed progress record.

---

Original prose: CC BY 4.0, subject to [the repository's scope and exceptions](../LICENSE.md).
