# Curriculum decision log

Started: 2026-09-28.

This log distinguishes explicit user decisions from assistant proposals and open choices. The [curriculum outline](curriculum-outline.md) is the current planning snapshot. [LICENSE.md](../LICENSE.md) is the operative licensing scope; this history does not replace the license texts.

## Status vocabulary

- **Approved:** explicitly directed or accepted by the user.
- **Proposed:** recommended for discussion; not an implementation or purchasing commitment.
- **Open:** a choice or prerequisite not yet resolved.
- **Superseded:** replaced by a later decision, with a link to the replacement. Preserve the historical record.

## Approved decisions

### CUR-001 — Document the work continuously

- Date: 2026-09-28.
- Status: Approved.
- Authority: user instruction, “Document everything as we go”.
- Decision: maintain a living curriculum outline and a dated decision history as the curriculum develops.
- Recording convention: capture stated requirements, alternatives, recommendations, approvals, unresolved choices, evidence, and changes in direction. Update the relevant documents in the same work as the decision or implementation they describe.
- Boundary: documentation is not approval of every proposal recorded in it. Do not substitute a chat-only summary for durable project records.

### CUR-002 — License original curriculum content under CC BY 4.0

- Date: 2026-09-28.
- Status: Approved.
- Authority: user acceptance of CC BY 4.0 after the curriculum proposal.
- Decision: apply Creative Commons Attribution 4.0 International to original curriculum content within the scope of [LICENSE.md](../LICENSE.md).
- Consequence: schools and other users may share and adapt covered content, including commercially, while complying with attribution and the other license terms. A kit purchase is not a license condition.
- Boundary: third-party works and data keep their own rights and notices. A citation does not grant redistribution rights to the cited work.

### CUR-003 — MIT applies to teaching software and examples, not Grownetics product software

- Date: 2026-09-28.
- Status: Approved.
- Authority: user instruction, “the MIT license on specifically the teaching software and examples (not grownetics sw for now)”.
- Decision: apply MIT to the academy's original teaching software and examples within the scope of [LICENSE.md](../LICENSE.md), including the academy delivery code supporting those teaching activities.
- Boundary: no change to Grownetics product software licensing, including product services, controllers, firmware, integrations, or other production implementation. No product code is licensed merely because a lesson mentions or connects to it.
- Interpretation: “teaching software” defines which material is covered, not a restriction on how recipients may use MIT-licensed material. The standard MIT permissions include commercial reuse; this is not an education-only license.
- Mixed files: original instructional prose remains CC BY 4.0 even when stored in a JavaScript source file; covered executable teaching code and examples are MIT. Vendored software retains its own license and copyright notice.

### CUR-004 — Continue curriculum development with shared foundations

- Date: 2026-09-28.
- Status: Approved to continue development; specific pilot choices remain open.
- Authority: the user's instruction, “proceed”, following publication of the outline and licensing records.
- Decision: continue developing and documenting the curriculum rather than wait for a hardware purchase or partner-specific protocol.
- Authoring choice: develop a [module-by-module map](curriculum-module-map.md) and a detailed [P-01: From Seed to Sensor guide](pathways/seed-to-sensor.md) first. This is the assistant's stated execution choice based on the previously recommended shared foundations, not a claim that the user explicitly selected an Arduino classroom pilot.
- Working assumptions: beginner/middle-school learners; eight 45–60 minute sessions across roughly two to three weeks; a manual route plus a separately bounded Arduino-assisted extension. Validate these with educators and the eventual reference hardware.
- Boundary: no new published app modules, classroom-validation claims, hardware purchase specifications, Grownetics product-code license changes, or NASA partner commitments. Module and pathway drafts remain subject to review.

### CUR-005 — Explore a separate, local-first Grow Journal

- Date: 2026-09-28.
- Status: Approved direction for architecture brainstorming; no implementation architecture approved.
- Authority: the user's request for a local-first learning journal alongside the existing Academy.
- Existing Academy: preserve the current repository and conventional presentation of learning modules. Keep its theme as the default for the new experience.
- Journal ownership: keep canonical journal entries in Markdown in a learner-authorized local folder, with images and other attachments in a media subfolder. Avoid an operator-maintained journal database.
- Hosting preference: investigate static hosting on GitHub Pages and use of `academy.grownetics.com`. Hosting platform and public domain are separate choices; no domain migration is authorized.
- Learning experience: explore a gamified skill tree, an original magical botanical theme with scientifically accurate illustrations and explanatory labels, restrained page-edge growth and text reveals, an academic theme, and appearance customization.
- Teaching resources: include lesson plans, presentations, relevant YouTube links, printables, and a complete teacher PDF for every module.
- Voice: develop a recognizable Grownetics learning-guide persona that is intelligent, scientific, casual, and approachable. Explain in plain language by default; teach technical vocabulary deliberately when needed.
- Editorial requirements: use Humanizer and complementary editorial guidance for reader-facing prose while preserving scientific claims, safety instructions, and source attribution.
- Guidance and resources: provide citations, source links, contextual explanations, onboarding, and navigation help. Investigate free educational resources without assuming that free access permits redistribution, adaptation, commercial use, or AI ingestion.
- Boundary: this records requested behavior, not a built application, classroom validation, a third-party partnership, an approved AI provider, or a license grant for Grownetics product software.

### CUR-006 — Use the Grownetics editorial persona now; defer the live tutor

- Date: 2026-09-28.
- Status: Approved.
- Authority: the user selected an editorial persona plus a future live tutor, then directed, “we can defer that for later, for now just use it to mean 1.”
- Current scope: “Grownetics AI” means the consistent editorial voice used in lessons, explanations, contextual help, and navigation. Content does not require a conversational model at runtime.
- Deferred scope: a live conversational tutor remains a future goal, not part of the current journal implementation.
- Consequence: no current AI provider integration, model runtime, API credentials, or transmission of journal material to a model. Revisit inference location, consent, and student privacy only when designing the live tutor.
- Boundary: deferring the tutor does not defer the requested scientific, approachable voice or editorial review.

### CUR-007 — Prioritize Chrome; consider a native wrapper later

- Date: 2026-09-28.
- Status: Approved.
- Authority: the user's instruction, “chrome is great, we can eventually wrap a web app if we need to”.
- Decision: target desktop Chrome for the initial direct-to-folder journal experience. Equal direct-folder support in Safari, Firefox, or on iPads is not a prerequisite.
- Later option: a native wrapper may be considered if actual deployment needs justify it. No wrapper framework, native implementation, or release commitment is selected now.
- Boundary: Chrome still requires an explicit folder selection and filesystem permission. Managed-device policies and revoked permissions remain relevant. This decision does not grant access to Documents automatically.

### CUR-008 — Separate Academy content, the journal application, and learner files

- Date: 2026-09-28.
- Status: Approved.
- Authority: the user's confirmation, “Yes, you got it”, of the proposed three-part architecture.
- Curriculum: retain the existing Academy repository as the conventional teaching site and authoritative source for modules and teacher resources.
- Application: develop the static Grow Journal in a separate repository, with independent deployment and the existing Academy theme as its default.
- Content exchange: consume versioned curriculum releases rather than maintain separately authored copies of lessons. The exact release format remains to be specified.
- Learner records: keep journal entries, attachments, progress, and preferences in the learner's chosen local folder. Saved work must remain readable without the application.
- Implementation boundary: keep browser-specific file access separate from learning logic. Do not build native adapters or runtime AI integrations in the current scope.
- Scope: this approval establishes component ownership and separation; it does not approve every remaining storage, progression, theme, or publishing detail.

### CUR-009 — Approve the local journal lifecycle

- Date: 2026-09-28.
- Status: Approved.
- Authority: the user's confirmation, “yup, that works”, following the local-save design.
- Decision: adopt the create/open-folder flow, Markdown and relative attachment layout, autosave with distinct pending/saving/saved states, permission reconnection, and visible save failures described in CUR-P06.
- Recovery: retain pending work in the open editor and offer reconnection or a recovery download. Detectable external edits pause saving and offer keeping both versions.
- Boundary: saved files, not browser storage, are the durable record. In-memory drafts are not guaranteed to survive a closed or crashed tab, and local storage is not a backup.

### CUR-010 — Include photo capture and teach useful evidence collection

- Date: 2026-09-28.
- Status: Approved requirement and guided capture flow.
- Authority: the user's request for photo capture and instruction on good evidence collection, followed by “Yes exactly” approving the capture → review → describe design.
- Decision: support taking a photo as well as attaching an existing image. Teach photography as part of recording a useful scientific observation, not merely uploading an attachment.
- Guidance must cover framing, lighting, focus, context, and useful scale. The user's roughly 85% framing example motivates a close-up guide, not a universal quality threshold for every shot.
- Accepted interaction: use purpose-specific context, whole-plant, and detail guidance; review and retake before adding a specimen-linked observation; teach scale and repeatable viewpoints. Keep images local, request the camera only on demand without microphone access, and preserve non-camera alternatives.
- Boundary: this does not authorize activating a camera during brainstorming or introduce the deferred live tutor, image diagnosis, or AI scoring.

### CUR-011 — Explore an RPG classroom, CEA builder, and greenhouse twin

- Date: 2026-09-28.
- Status: Approved exploration direction; no fork, deployment, or full implementation architecture approved.
- Authority: the user's request for popular-RPG inspiration, a WorkAdventure-based virtual classroom and collaboration environment, a CEA facility designer/builder, and a possible greenhouse digital twin.
- Requirement continuity: retain the Academy default, original magical-botanical treatment with accurate botanical illustrations, academic presentation, and customization. The local Markdown journal and approved photo-capture workflow remain in scope.
- Expansion: investigate a separately hosted Grownetics Academy game server for shared presence, classroom interactions, and facility projects. Shared collaboration requires server-side state; this does not imply moving private journals to that server.
- Boundaries: a designed greenhouse, a simulation, a live observational representation, and a validated predictive twin are different capabilities. No authority to control real greenhouse equipment is implied.
- Research record: [shared-world concept, findings, and alternatives](academy-game-world-concept.md). CUR-012 subsequently selects a free WorkAdventure extension as the design basis; component licensing, deployment, extension, and classroom-control checks remain necessary before release.

### CUR-012 — Extend WorkAdventure as a free Academy module

- Date: 2026-09-28.
- Status: Approved offering and platform direction; detailed implementation remains in design.
- Authority: the user's clarification, “we're offering it as a free add-on module as part of the academy. and we are extending it.”
- Decision: proceed with WorkAdventure as the basis for a free, extended Academy module rather than treating unrestricted commercial resale as a current requirement.
- License handling: preserve the applicable upstream terms and notices, identify modifications, and offer corresponding source where required for the modified networked application. The fork is not relicensed under the Academy's MIT teaching-code notice.
- Release checks: inspect the selected revision's component, dependency, and asset notices. Revisit the offering's license fit if its access conditions or monetization change; the user's free-offering clarification is not a blanket legal clearance for every future arrangement.
- Boundary: proprietary Grownetics product licensing is unchanged. No fork, deployment, or real-equipment connection has been created by this decision.

### CUR-013 — Serve learning and real facility planning with one model

- Date: 2026-09-28.
- Status: Approved scope direction.
- Authority: the user selected the third option: both audiences through two interfaces backed by one dimensioned facility model.
- Decision: support a guided learning mode and a detailed facility-design mode. The educational interface must not depend on a disposable toy model that cannot represent practical facility projects.
- Shared basis: physical dimensions, stable equipment identity, properties, and service relationships belong to the common model. Interface detail and teaching prompts may differ.
- Boundary: this selects the product scope, not a completed schema, a certified engineering tool, or authorization to operate real equipment. Detailed collaboration rules, calculations, exports, and delivery sequence remain to be designed.
- Details: [dual-mode facility design](academy-game-world-concept.md#two-interfaces-one-facility-model).

### CUR-014 — Shared class campus with separate collaborative team projects

- Date: 2026-09-28.
- Status: Approved collaboration structure.
- Authority: the user's confirmation, “Yes correct”, of the shared-campus/separate-team-project proposal.
- Decision: provide a class hub for instruction and discussion, separate live collaborative facility projects for teams, and a whole-class demonstration project when useful.
- Teaching workflow: start team projects from protected template copies; support teacher review, comments, and explicitly authorized intervention.
- Sharing boundary: teams intentionally share design snapshots and selected evidence for review. Personal journal folders are not automatically shared or mirrored to the game server.
- Other audiences: independent growers and professional teams use the same project system without a required classroom or teacher account.
- Boundary: detailed role permissions, concurrent-edit handling, moderation, and retention still require design and verification. This is not a claim that those controls already exist in the fork.

### CUR-015 — Start with a dimensioned 2D editor that preserves vertical geometry

- Date: 2026-09-28.
- Status: Approved editing scope.
- Authority: the user's instruction, “proceed”, following the recommendation to start with a 2D plan editor plus heights and levels rather than full 3D editing.
- Decision: provide precise plan editing with physical dimensions, equipment footprints and orientation, height, mounting elevation, and growing levels. Derive WorkAdventure's walkable view from that model.
- Vertical growing: stacked equipment and cultivation levels are first-class project information, not flattened into a floor-plan sprite.
- Boundary: full 3D editing is not required for this starting scope. It remains a separate possible visualization/editor extension; the shared model must not discard vertical information in the meantime.
- Details: [geometry and editing scope](academy-game-world-concept.md#geometry-and-editing-scope).

### CUR-016 — Approve the combined learner experience for the formal design

- Date: 2026-09-28.
- Status: Approved design direction; written-specification review remains required.
- Authority: the user's “yes” to carrying the combined learner experience into the formal specification.
- Decision: adopt the evidence-led learning loop and skill map, Academy/botanical/academic appearances, contextual authored guidance, private-journal/shared-project boundary, and versioned teaching resources described in the [learner experience record](academy-learning-experience.md).
- Requirement continuity: retain CUR-005's lesson plans, presentations, relevant YouTube links, printables, and complete teacher PDF for every delivered module. Keep accessibility settings independent of rewards and teacher assessment distinct from self-review.
- Formal record: [Academy journal and shared-world design specification](superpowers/specs/2026-09-28-academy-journal-and-shared-world-design.md).
- Boundary: this accepts the design direction, not a production implementation, completed teaching packs, a deployment, or permission to connect real equipment. The formal written contract awaits user review before implementation planning.

## Proposal history

### CUR-P01 — Modules, pathways, and kits are separate layers

- Recorded: 2026-09-28.
- Status: Proposed.
- Recommendation: reusable modules plus teacher-ready pathways, supported by optional reference kits.
- Alternatives: a fixed grade-by-grade course is less flexible for selective adoption; a topic encyclopedia requires teachers to construct their own sequence.
- Reason: support both schools adopting individual modules and students following a coherent progression.
- Details: [curriculum architecture](curriculum-outline.md#recommended-architecture).

### CUR-P02 — Five progression stages and intersecting interest pathways

- Recorded: 2026-09-28.
- Status: Proposed.
- Recommendation: Discover, Measure, Control, Integrate, and Investigate, with plant-science, electronics/mechatronics, data/software, controls/reliability, climate/resources, and space-agriculture pathways.
- Boundary: grade bands are suggestions. Module families are not approved new modules, and catalog numbers need not dictate learning order.
- Details: [progression](curriculum-outline.md#beginner-to-advanced-progression) and [interest pathways](curriculum-outline.md#interest-based-pathways).

### CUR-P03 — Shared foundations support tent and regolith projects

- Recorded: 2026-09-28.
- Status: Proposed.
- Recommendation: develop “The Living Laboratory: From Seed to Sensor” as a reusable beginner pathway; extend the same measurement and scientific-method foundations into the tent and lunar-regolith investigations.
- Boundary: the first pilot has not been chosen. The outreach opportunity may change sequencing once its requirements are known.
- Details: [first pathway and open decisions](curriculum-outline.md#proposed-first-pathway-and-unresolved-decisions).
- Authoring update (2026-09-28): [CUR-004](#cur-004--continue-curriculum-development-with-shared-foundations) records proceeding with the shared-foundation guide as the next writing priority, while keeping the external pilot decision open.

### CUR-P04 — School-ready modules include more than lessons and quizzes

- Recorded: 2026-09-28.
- Status: Proposed.
- Recommendation: include teacher guidance, student activities, scheduling, materials, safety, assessment, local standards mappings, and accessible alternative delivery.
- Boundary: NGSS alignment, classroom readiness, hardware certification, and partner endorsement are not established by the outline.
- Details: [school adoption package](curriculum-outline.md#school-adoption-package).

### CUR-P05 — Static journal application with portable files

- Recorded: 2026-09-28.
- Status: Architecture separation accepted in [CUR-008](#cur-008--separate-academy-content-the-journal-application-and-learner-files); remaining detailed proposals await review.
- Accepted approach: keep the Academy as the conventional curriculum surface and build the journal as a separate static application consuming versioned curriculum content. Keep original module content in one authoritative location rather than maintaining divergent copies.
- Repository decision: use a separate repository for the journal application while the existing Academy remains the curriculum source and conventional teaching site.
- Alternatives considered: an application subdirectory in the existing repository simplifies shared builds but couples journal releases to Academy changes; a separate journal repository needs a defined content-release contract but gives clearer ownership and independent deployment. Building a native wrapper now adds distribution and support work that [CUR-007](#cur-007--prioritize-chrome-consider-a-native-wrapper-later) defers.
- Accepted packaging direction: consume versioned curriculum releases without duplicating lesson authoring. Keep browser-specific folder access at a small file-I/O boundary; do not implement speculative native adapters. The content-release schema is still open.
- Local storage: let the learner choose a dedicated journal subfolder, not grant access to all of Documents. Store Markdown and relative attachment references there; treat any browser-side index as disposable rather than authoritative.
- Browser constraint: the [directory-picker API](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) requires HTTPS, user interaction, and explicit permission. A Documents starting-location hint does not grant access. Browser support is uneven; folder-backed editing cannot be promised across Firefox and Safari.
- Portability option: ZIP import/export remains a candidate for sharing, backup, and unsupported browsers. It is not equivalent to direct folder saving. [CUR-007](#cur-007--prioritize-chrome-consider-a-native-wrapper-later) prioritizes Chrome and leaves a native wrapper for later.
- Hosting distinction: [GitHub Pages supports custom domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages). Pages and `academy.grownetics.com` need not be mutually exclusive. Check hosting terms against the intended offering before selecting it.
- Privacy boundary: [CUR-006](#cur-006--use-the-grownetics-editorial-persona-now-defer-the-live-tutor) defers the live tutor. The current journal needs no runtime AI service or model access to journal files. Local versus remote inference and any explicit sharing permission remain questions for that future feature.
- Reuse boundary: link to external educational resources first. Before embedding, adapting, bundling, or using material with an AI service, review that particular work's license and terms. Attribution alone is insufficient.
- Next review: the formal written specification consolidates the accepted journal, capture, learner-experience, and resource requirements. Concrete content-release encoding, public origins, and deployment-specific school procedures belong to their scoped implementation decisions; live-tutor data boundaries remain deferred.

### CUR-P06 — Local journal lifecycle and honest save states

- Recorded: 2026-09-28.
- Status: Accepted in [CUR-009](#cur-009--approve-the-local-journal-lifecycle).
- First use: offer creating or opening a journal in a dedicated folder chosen by the learner. Suggest a Grow Journal subfolder under Documents without assuming access to the entire Documents directory.
- Files: use `entries/` for Markdown, `media/` for copied attachments, `progress.md` for learning records, and `preferences.md` for appearance and accessibility settings. Use relative attachment links and stable identifiers; final metadata fields are not yet selected.
- Saving: autosave after a short typing pause. Distinguish pending edits, saving, and a confirmed filesystem save. A failed or incomplete write must not display “Saved”; an entry with pending attachment writes is not fully saved.
- Reopening: reuse a remembered folder handle when permission allows; otherwise ask the learner to reconnect the folder. Clearing browser storage must not delete saved journal files.
- Failure handling: keep pending work in the open editor, explain the failure, and offer reconnecting or downloading a recovery bundle containing unsaved text and pending attachments. Do not claim that an unsaved in-memory draft survives closing or crashing the tab.
- External edits: if a file changed outside the application, pause autosaving that file and offer keeping both versions rather than silently replacing the detected change. Do not promise safe concurrent editing across arbitrary external programs.
- Portability: copying the entire folder preserves relative attachment links and transfers the journal to another computer. Local storage is not a backup; cloud-folder synchronization, if configured by the learner, is outside the application's control.
- Boundary: the browser sketch simulates save states. It neither requests folder permission nor writes journal files.

### CUR-P07 — Guided photo capture as an observation skill

- Recorded: 2026-09-28.
- Status: Accepted in [CUR-010](#cur-010--include-photo-capture-and-teach-useful-evidence-collection).
- Capture sources: offer “Take photo” and “Add existing photo”. Request camera access only after the learner chooses to take a photo; request video without microphone access. Stop camera tracks when leaving capture. If access is denied or no camera is available, keep image import and non-photo observations usable.
- Technical feasibility: Chrome exposes camera streams through [`getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), with a secure context and explicit permission. A built-in or connected camera must actually be available to the browser; no particular camera hardware is assumed.
- Shot purpose: offer context, whole-plant, and detail guidance. Context includes the growing setup; whole-plant shots keep relevant tips, stem, and base visible; detail shots emphasize the feature being observed. Do not require all three shots for every entry.
- Framing: use roughly 85% as a visual close-up target while leaving enough margin for relevant edges and any scale reference. This is an editorial heuristic suggested by the user, not an asserted scientific standard or a machine-scored acceptance threshold.
- Capture prompts: use even, diffuse light; avoid backlighting, glare, and obscuring shadows; keep the camera steady; check focus on the subject; use a simple contrasting background when practical. Do not recommend artistic filters that alter evidentiary color or appearance.
- Scale and repeatability: add a ruler in the subject's plane when size matters. For comparisons over time, aim for the same specimen, viewpoint, camera distance, lighting, and scale; record unavoidable changes rather than hide them.
- Review: inspect the image at a useful size, then keep or retake it. Ask a short purpose-led caption such as “What should someone notice?” and associate the photo with the specimen and observation. Keep observation distinct from interpretation.
- Timing: a new capture may record its capture time. Do not label an imported image's import time as its capture time; let the learner confirm when the observation occurred.
- Records: save the chosen photo in `media/` and its caption/context in the Markdown entry. No photo upload or remote analysis is needed. Do not require a photograph where an accessible written, measured, or drawn observation meets the lesson's purpose.
- Teaching: provide brief prompts in the capture flow, expandable explanations, and a reusable “Document an observation” skill. Progress should reflect useful evidence, not attractive photography or camera ownership.
- Sources: [University of Maryland Extension photo guidance](https://extension.umd.edu/resource/tips-submitting-photos-ask-extension) and [Iowa State University plant photography guidance](https://yardandgarden.extension.iastate.edu/pidc/photography) support focus, lighting, different views, context, and size references. Link to their guidance; do not redistribute their example photographs without a separate rights check.
- Preview boundary: any plant illustration in the browser sketch is an original schematic, not a photograph, a species-identification reference, or live camera video.

### CUR-P08 — Evidence-linked skill tree and learning loop

- Recorded: 2026-09-28.
- Status: Accepted as part of the combined learner experience in CUR-016. The formal written specification awaits review; draft modules are not thereby published.
- Curriculum continuity: use the modules and prerequisite relationships in the [existing module map](curriculum-module-map.md). Discover, Measure, Control, Integrate, and Investigate describe increasing scope, not five mandatory sequential courses. The sketch uses the four proposed FND modules as an example, not a new pilot selection or publication claim.
- Navigation: let learners explore the map and read lessons without earning access. Show recommended next steps, why prerequisites matter, and routes for demonstrating equivalent prior competence. Academic readiness does not authorize unsupervised equipment use.
- Learning loop: learn a concept, perform an appropriate activity, record observations or measurements, reflect on what the evidence supports, then review the module's criteria. Reading a page alone does not complete a practical skill.
- Evidence: link each local progress record to its module/version, relevant journal entries, and the activity route actually performed. Supplied-data interpretation and simulations must not be represented as hands-on instrument or camera competence.
- Learner-facing states: not started, exploring, practicing, and self-reviewed completion. Evidence checklists help the learner review their work; without a reviewer, neither an attachment's presence nor a checkbox proves mastery. Local learner-edited progress is not a verified credential.
- Classroom boundary: teachers can assess the same work against the teaching-pack rubric. The private journal does not require teacher accounts or a class dashboard. CUR-011 adds a separate shared-world investigation with its own identity, collaboration, and moderation requirements; it does not make a local self-review an authenticated assessment.
- Evidence examples: FND-01 needs a claim linked to two dated observations; FND-02 a comparison plan, prediction, and confounder; FND-03 a dated repeated-measurement table with units and justified uncertainty; FND-04 a graph or accessible table plus a claim–evidence–limitations explanation.
- Capture skill: embed “Document an observation” guidance where evidence is recorded. The learner chooses photography, drawing, text, or measurements as appropriate to the outcome; do not add a redundant photography prerequisite to every module.
- Motivation: recommend visible milestone growth and optional botanical flourishes rather than points for clicking, uploading many photos, or returning every day. No punitive streak loss or leaderboard is needed. Keep learning and accessibility settings available independently of rewards.
- Presentation: the same progress model supports the default Academy theme, botanical styling, and a restrained academic view. Animation is optional and must not obscure the evidence or progress labels.
- Revision: allow returning to lessons and improving evidence. Preserve which curriculum version a self-review refers to rather than silently treating old work as meeting changed requirements.

### CUR-P09 — WorkAdventure as a shared-world layer, not the facility engine

- Recorded: 2026-09-28.
- Status: WorkAdventure/free-extension direction accepted in CUR-012; the detailed component architecture and capability review remain proposed.
- Recommendation: prefer supported maps, scripts, and embedded application surfaces, with a thin fork where needed, over a deep rewrite. Keep the CEA facility domain model, private journal, and operational gateway distinct from the game engine.
- Finding: the inspected WorkAdventure v1.33.10 Play license includes AGPLv3 text plus a Commons Clause restriction. Do not assume MIT compatibility, unrestricted commercial hosting, or permission to relicense the fork under the Academy's teaching-code license.
- Architecture consequence: classroom presence, shared projects, media, identity, and durable map/model storage require a server deployment, unlike the static Academy and private journal.
- Browser consequence: open the filesystem-authorized journal at its own top-level origin; a cross-origin game iframe cannot be assumed to support the directory-picker permission flow.
- Facility consequence: build a dimensioned, typed facility model and project it into the game world. Native furniture/entity placement is not a CEA engineering designer or a greenhouse simulator.
- Details and sources: [shared-world concept](academy-game-world-concept.md), including RPG references, theme continuity, independent workstreams, licensing limits, classroom requirements, and twin capability levels.

### CUR-P10 — A combined fieldbook, guidance, and teaching-pack experience

- Recorded: 2026-09-28.
- Status: Accepted in CUR-016 for the formal design; implementation planning follows written-specification review.
- Learning direction: evidence-led quests and skill milestones use the existing module map and prerequisites. Keep lessons open for exploration, self-review distinct from teacher assessment, and supplied-data work distinct from hands-on competence.
- Theme direction: Academy remains the default; botanical and academic appearances use the same content and progress. Font size, spacing, contrast-safe customization, and reduced motion are independent of rewards and roles.
- Teaching direction: each delivered module has lesson plans, presentations, relevant curated video links, student activities and printables, evidence criteria, accessible alternatives, and a complete teacher PDF generated from the same versioned source as its Academy and journal presentations.
- Editorial direction: use task-specific authored Grownetics guidance, optional explainers, and visible source trails. Apply the requested Humanizer pass without losing scientific qualifications or citations. This does not introduce a live tutor.
- Rights boundary: link to external resources unless the particular work permits the intended redistribution. The prototype's attributed historical botanical plate is not learner evidence or a substitute for botanical teaching review.
- Details: [combined learner experience proposal](academy-learning-experience.md). Browser concept: `.superpowers/brainstorm/47230-1790625807/content/learner-fieldbook-v3.html`.

## Open decision register

| Question | Current state | Information needed before commitment |
| --- | --- | --- |
| Which pilot comes first? | Open: Arduino starter, high-school tent, or lunar-regolith outreach | User priority, prospective educator/partner needs, and timing |
| Who is the first classroom audience? | Open | Age/experience, class size, subject, teacher preparation, and lesson schedule |
| What are kit capabilities and prices? | Open; no hardware models or prices approved | Costed bill of materials, measurement requirements, calibration, safety, maintenance, and recurring supplies |
| Which Grownetics integration is supported? | Open; product licensing unchanged | Actual interfaces, deployment, compatibility, and permissions |
| What does the regolith partner require? | Open; outreach interest reported by the user | Exact simulant, crop, treatments, endpoints, protocol, sensor requirements, safety review, and timeline |
| Which standards will the pilot map to? | Open | Target jurisdiction and module-specific learning and assessment evidence |
| Will hardware design files be published and licensed? | Open; no hardware-design grant made | Ownership, intended design deliverables, and a separate licensing decision |
| Which journal delivery model is first? | Chrome-first web app and local-save lifecycle approved; native wrapper is a later option | Managed-school restrictions, offline expectations, and general import/export scope beyond approved recovery remain to be designed |
| Can journal material leave the device for AI assistance? | Deferred with the live tutor; no AI sharing in current scope | A future tutor design must resolve inference location, explicit consent, provider policy, and student privacy requirements |
| Who manages a journal in classrooms? | Open | Individual learner ownership, shared-device use, teacher access, and exchange of selected work |
| What is the journal's canonical public origin? | Open | Hosting-policy fit, custom-domain choice, and separation from the existing Academy |
| How will Academy content reach the journal? | Versioned curriculum releases approved; no duplicate lesson authoring | Exact content-release schema, updates, and offline distribution |
| Which third-party materials may be included in teacher packs? | Open; linking is the conservative proposal | Per-work rights, attribution, adaptation and commercial-use limits, and any AI restrictions |
| What is the CEA builder's first target? | Both guided learning and real facility planning, through two interfaces backed by one dimensioned model | Detailed model, collaboration rules, calculations, exports, and delivery sequence |
| What spatial editor comes first? | Approved in CUR-015: 2D plan editing with heights, elevations, and levels | Detailed model and editor interactions; full 3D editing is not required from the outset |
| How do progression, themes, guidance, and teaching packs fit together? | Combined learner experience approved in CUR-016 | User review of the formal written specification before implementation planning |
| Does WorkAdventure's license fit the offering? | Offering settled: free extended Academy module under applicable upstream terms | Complete selected-revision component/dependency/asset checks before release; reassess if access conditions or monetization change |
| Which self-hosted classroom controls are available? | Open; marketing does not prove deployment parity | Verified enrollment, roles, teacher moderation, media consent, retention, and shared-device behavior |
| What data can a greenhouse twin read? | Open; no equipment control authorized | Actual supported APIs, point semantics, permission scope, timestamps/quality, and separation from control credentials |

## Changes recorded

### 2026-09-28 — Local journal architecture study

- The user approved using a local browser companion for the design discussion.
- Created a preliminary diagram showing the existing Academy, a separate journal application, and a learner-authorized Markdown folder. It distinguishes requested behavior from proposed publishing and storage arrangements.
- Kept AI processing outside the core data flow until the user decides whether any selected journal material may leave the device.
- Preview source: `.superpowers/brainstorm/56868-1790617942/content/architecture-boundaries.html`. Local companion files are ignored by Git; this decision log remains the durable record.
- No application architecture approval or production implementation is implied by the preview.
- Subsequent clarification: [CUR-006](#cur-006--use-the-grownetics-editorial-persona-now-defer-the-live-tutor) limits the current scope to an editorial persona and defers the live tutor. Its unresolved data boundary does not block the current design.
- Subsequent approval: [CUR-008](#cur-008--separate-academy-content-the-journal-application-and-learner-files) accepts the Academy/application/local-file separation. Detailed local-save behavior is proposed in CUR-P06, not yet approved.

### 2026-09-28 — Detailed module map and beginner pathway

- Expanded the proposed progression into a [27-module curriculum map](curriculum-module-map.md) with prerequisites, activities, resource needs, assessment evidence, and seven pathway sequences.
- Developed [P-01: The Living Laboratory: From Seed to Sensor](pathways/seed-to-sensor.md) as an eight-session teaching draft with student templates, a rubric, manual and Arduino-assisted variants, and classroom-pilot review criteria.
- Kept authoring priority distinct from selecting a school or outreach pilot, selecting hardware, or certifying classroom readiness.
- Linked the new records from the main outline and repository entry point. Existing online modules and their publication states are unchanged.
- Reviewed outcome-to-assessment coverage: required the fair-comparison planning sketch for FND-02, allowed accessible tables for FND-04, and separated partial hardware demonstrations from full MSR evidence.
- Added advanced software reproducibility, experimental-unit/statistical reasoning, PID/look-ahead comparison, and constrained resource optimization to the relevant module briefs; added student privacy and educator source checks to P-01.

### 2026-09-28 — Initial documentation and licensing record

- Captured the stated mission, proposed progression, interest pathways, kit tiers, tent capstone, regolith investigation, adoption package, sources, and unresolved pilot requirements.
- Recorded the user's documentation and licensing approvals separately from curriculum recommendations.
- Added a scoped repository licensing notice and local CC BY 4.0 and MIT license texts.
- Added a repository entry point linking to the curriculum and decision records.
- Left lesson publication states, application behavior, Grownetics product software, vendored notices, weather data/provenance, and unrelated existing work unchanged.

Original prose: CC BY 4.0, subject to [the repository's scope and exceptions](../LICENSE.md).
