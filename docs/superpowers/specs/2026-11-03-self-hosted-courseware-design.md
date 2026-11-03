# Grownetics Academy self-hosted interactive courseware design

Date: 2026-11-03.

Status: the user reviewed and approved this specification on 2026-11-03 and authorized implementation planning. The architecture, reference-derived courseware patterns, and deferred gamification/GrowAdventure roadmap are approved. This does not authorize deployment, domain migration, classroom-validation claims, or connection to real equipment.

Decision authority: CUR-017 in the [curriculum decision log](../../curriculum-decisions.md). This specification supersedes the static-only journal and deferred-native-wrapper portions of the [2026-09-28 design](2026-09-28-academy-journal-and-shared-world-design.md). Requirements from that design remain in force where this specification does not explicitly replace them.

## 1. Purpose and product boundary

Build a self-hosted interactive courseware platform for controlled-environment agriculture and precision agriculture. Its learning experience uses guided, Brilliant-style interactions: prediction, manipulation, observation, explanation, targeted hints, revision, and transfer to a new scenario. It is not a chat interface with independent calculators embedded in a conversation.

The same platform provides:

- A school-hosted backend for administrators and teachers to author, review, publish, assign, and assess courses.
- A shared Svelte interface for administrator, teacher, and student web access.
- A Wails 3 desktop application for offline-capable student work, native files and media, and later desktop integrations.
- A durable student journal that continues beyond a course for home plant tracking and later opt-in citizen science.
- Stable domain boundaries for the Plant Modeling Studio, GrowAdventure, and a required later gamification module.

The existing Academy repository remains the canonical source for public curriculum and the conventional teaching site. A school course may copy and customize a curriculum revision without changing the upstream source or silently receiving later edits.

The first implementation does not include public citizen science, GrowAdventure gameplay, gamification rules, a general plugin runtime, a comprehensive LMS gradebook, or real-equipment control. Their boundaries are established now so they do not require a later core-data migration.

## 2. Decision reconciliation

### Replaced decisions

The new direction replaces the following parts of CUR-007, CUR-008, CUR-009, and the 2026-09-28 specification:

- A native wrapper is no longer deferred without a selected framework. Wails 3 is the desktop direction.
- The journal is no longer a separate static-only application with no account or journal database.
- The school server is authoritative for school-hosted student records. A learner-selected folder is no longer the primary system of record.
- Authenticated administrators, teachers, and students now have server-enforced roles and capabilities.
- Offline desktop state is a synchronized cache and mutation outbox, not a second authoritative journal.

The 2026-09-28 Grow Journal implementation plan is superseded and must not be executed unchanged. The curriculum-delivery plan remains useful for canonical content validation and immutable release generation; its target consumer and delivery mechanism must be reconciled with this specification during implementation planning.

### Retained invariants

- One canonical public curriculum source feeds every presentation; lesson copies do not silently diverge.
- Published content, model, activity, rubric, and curriculum versions remain identifiable in every attempt and submission.
- Personal journal content is not automatically visible to teachers, GrowAdventure, AI providers, or citizen-science audiences.
- Coursework submission and public publication are explicit, separate actions.
- Portable journal export remains readable Markdown with relative attachments and explicit metadata.
- Self-review is not authenticated mastery, teacher assessment remains attributable, and community identification is not teacher verification.
- Appearance and gamification never change scientific claims, evidence requirements, permissions, or access to accessibility settings.
- Designed facilities, simulations, connected observations, and predictive twins remain distinct capabilities.
- No course, game, journal, model, or AI interaction may issue commands to real equipment.

## 3. Reference-derived patterns

The design adopts contracts and safeguards rather than forking large learning platforms.

| Reference | Adopted pattern | Deliberate non-adoption |
| --- | --- | --- |
| [Oppia](https://github.com/oppia/oppia/wiki/Creating-Interactions) | Guided lesson states, typed responses, rules, feedback, and transitions | Python/Angular platform architecture |
| [H5P semantics](https://h5p.org/semantics) | Declarative activity configuration that drives editor forms and validation | Arbitrary activity JavaScript as ordinary course content |
| [Open edX unit workflow](https://docs.openedx.org/en/latest/educators/references/course_development/unit_workflow_and_status.html) | Draft/preview/publish separation and last-published learner visibility | Multi-service operational architecture |
| [Moodle Access API](https://moodledev.io/docs/5.3/apis/subsystems/access) | Capability checks at a specific school, course, class, activity, or workspace scope | Generic role-name checks and a broad plugin/context framework |
| [Kolibri](https://kolibri-dev.readthedocs.io/en/latest/backend_architecture/facility_syncing/) | Offline content, visible synchronization, class/coach workflows | Assuming replication alone resolves journal conflicts |
| [Mahara](https://manual.mahara.org/en/26.04/portfolio/export.html) | Learner portfolio, selective sharing, reusable artefacts, portable export | Ambiguous copying that obscures original authorship |
| [LiaScript](https://liascript.github.io/) | Optional reviewable text authoring and live preview | Executable JavaScript in untrusted course source |
| [eXeLearning ELPX](https://github.com/exelearning/exelearning/blob/main/doc/elpx-format.md) | Portable packages with editable source, rendered output, assets, and validation | Its XML format, runtime, or implementation code |
| [iNaturalist geoprivacy](https://help.inaturalist.org/en/support/solutions/articles/151000169938-what-is-geoprivacy-what-does-it-mean-for-an-observation-to-be-obscured-) | Evidence, media rights, location controls, and separate identification status | Public-by-default student observations or location-anonymization claims |

OpenIntelligentUI remains an optional author-side prototyping reference. Its validation, provenance, preview-export, and sandbox ideas are useful; its hosted-model runtime is not a learner-delivery dependency.

## 4. Application architecture

Use a modular Go monolith with clear internal module boundaries, PostgreSQL, and asset storage behind a narrow interface. Begin with one school per self-hosted deployment while retaining school identifiers in authorization and data contracts. Do not build multi-tenant hosting control-plane features before a concrete hosted offering requires them.

```text
School-hosted Go service
├── Identity, organizations, memberships, capabilities
├── Course library, authoring, review, releases, assignments
├── Attempts, submissions, rubrics, assessment
├── Personal journals, observations, synchronization
├── Integration API and transactional domain-event outbox
└── Background jobs for media, exports, and delivery

PostgreSQL + filesystem-backed asset storage behind an interface
                         ↕
                  Shared Svelte UI
              ├── Admin/teacher web app
              ├── Student web app
              └── Wails 3 desktop application
                    ├── Encrypted credential handling through OS facilities
                    ├── Offline content cache and mutation outbox
                    ├── Native files, camera, and media staging
                    └── Later native Plant Modeling Studio integration
```

The Go service is authoritative for school-hosted records. The browser supports managed devices and home access without installation. Wails reuses the Svelte interface and suitable Go domain packages; it is not the school server.

Pin the reviewed Wails 3 stable core. Do not adopt experimental build backends or packaging features without separate verification. Test every supported operating-system WebView and retain the browser client as a compatibility path.

Initial self-hosted deployment is a small Docker Compose stack with the Go service, PostgreSQL, reverse proxy, and documented persistent volumes. Asset storage starts on managed filesystem storage; an S3-compatible implementation may be added behind the same interface. Backup and restore are release requirements, not deployment afterthoughts.

Do not introduce microservices, Kubernetes, a general event bus, or a general third-party plugin runtime for the first implementation.

## 5. Canonical records

| Record | Required semantics |
| --- | --- |
| `School` | Organization identity, policies, retention configuration, and membership scope |
| `Membership` | User-to-school relationship, status, and assigned role presets |
| `CapabilityGrant` | Action and scope; roles are presets rather than the authorization check |
| `CourseRevision` | Immutable course structure, outcomes, sources, activity versions, assets, teacher resources, and publication metadata |
| `LessonStep` | Content, activity reference/configuration, response rules, hints, feedback, and transitions within a lesson revision |
| `ActivityDefinition` | Trusted type/version, configuration schema, Svelte renderer, typed response contract, deterministic evaluator, required capabilities, accessibility alternative, and test fixtures |
| `Attempt` | Resumable learner state and responses tied to the exact course, lesson, activity, model, and rubric revisions used |
| `JournalRecord` | Student-owned text, measurements, media, plant context, reflections, revision history, and personal-workspace permissions |
| `Submission` | Intentional snapshot of selected evidence for an assignment, with content versions, rubric, submission time, reviewer, feedback, and assessment status |
| `ObservationRecord` | Structured plant/science evidence with observed/recorded times, units, method, specimen/site context, media rights, provenance, and location precision |
| `DomainEvent` | Stable event ID, actor, scope, subject, content version, evidence reference, occurrence time, and idempotency identity |

A published revision is never edited in place. Attempts and submissions retain the versions actually used even after a newer course is assigned.

## 6. Guided activity engine

### Lesson graph

A lesson is an ordered or branching graph of steps, not a sequence of unrelated widgets. A step may present content, request a typed prediction or response, invoke an activity, show feedback, offer a hint, or transition based on a deterministic rule.

A representative CEA sequence is:

1. Predict how vent opening changes temperature, absolute moisture, and carbon dioxide under stated outside conditions.
2. Receive a hint tied to the predicted misconception.
3. Manipulate the vent and observe the coupled model.
4. Record an explanation that distinguishes observation from interpretation.
5. Revise after feedback.
6. Apply the concept to different outside conditions or a resource-constrained facility.

### Activity definitions

Each trusted activity type declares:

- Stable type ID and semantic version.
- Configuration schema, defaults, labels, help, valid domains, units, and conditional fields.
- Svelte renderer and accessible response display.
- Typed learner-response format.
- Deterministic evaluator and progression outcomes.
- Required capabilities such as camera, files, simulation, or external tool launch.
- Accessibility alternative, reduced-motion behavior, and test fixtures.

The configuration schema generates teacher-facing form controls and validates content again in Go before draft storage and publication. Browser preview and student delivery use the same renderer, evaluator, and progression behavior.

Standard lesson data is declarative and cannot contain arbitrary executable JavaScript. Custom AI-generated code belongs only in the separate author-prototyping sandbox; accepted interactions must become reviewed, trusted activity definitions before publication.

Initial activity types cover authored explanation/media, choice responses, numeric responses with units, interactive scientific models, and evidence/reflection capture. Their detailed schemas are implementation-design work, but every type must satisfy the common contract above.

### AI-assisted authoring

AI may propose draft lesson graphs, configurations, feedback, and hints. An author must be able to inspect and edit the result. AI cannot publish, alter a published revision, access private journals by default, or silently change a scientific model. Provider unavailability leaves manual authoring and published learning fully operational.

## 7. Administration, authoring, and publication

### Administrator workflows

Administrators manage school configuration, memberships, role presets, classes, retention policies, integrations, exports, backups, and restore procedures. School administration does not implicitly grant personal-journal read access.

### Teacher and author workflows

Teachers and authors can, subject to scoped capabilities:

1. Create a draft or copy a course/activity template without learner records.
2. Edit the lesson graph through structured forms; technical authors may use a constrained text representation.
3. Configure activities, sources, model versions, media rights, outcomes, evidence criteria, and teacher resources.
4. Preview as a learner with reset/replay and draft-only attempts.
5. Run content, scientific, accessibility, and package validation.
6. Submit the draft for review and address recorded findings.
7. Publish an immutable revision using a distinct publish capability.
8. Assign a selected revision to a class.
9. Review submitted evidence, apply the rubric, and provide attributed feedback.

A small school may assign editing and publishing capabilities to one person. That is recorded as self-publication and does not establish independent scientific or pedagogical review.

Lifecycle:

```text
Draft → Preview → Review → Published immutable revision → Retired
```

Editing a published course creates a new draft. Shared-library updates become reviewable update offers; they never rewrite an assigned revision automatically.

### Course packages

A portable course package contains only curriculum material:

```text
manifest.json          Format/course/activity versions, hashes, rights, locales
course.json            Outcomes, prerequisites, lesson graphs, assessment references
content/               Reviewable text and validated activity configuration
assets/                Media, attribution, licenses, and modification records
teacher/               Guides, rubrics, presentations, printable resources
preview/               Optional rendered/static output
```

Course packages exclude identities, submissions, attempts, personal journals, comments, and assessment records. Learner export, course-content recovery, and full school backup are separate operations with separate authorization.

## 8. Journal, submission, and citizen-science boundaries

| Workspace | Default access | Contents |
| --- | --- | --- |
| Personal journal | Student only | Home plants, drafts, private photos, reflections, long-term observations |
| Coursework | Student and authorized educators/reviewers | Selected evidence snapshots, assignments, rubrics, feedback, assessment |
| Class/team project | Authorized class/team participants | Intentionally shared collaborative artefacts |
| Citizen-science publication | Explicitly selected public/community audience | Selected observations with rights, privacy, moderation, and provenance decisions |

A submission is an immutable snapshot or explicitly versioned reference, not ongoing access to the whole journal. A public observation is another intentional copy with its own publication lifecycle.

Portable journal export includes Markdown bodies, explicit metadata, relative media links, and attachments. It excludes private comments or reviewer notes unless the learner deliberately selects an export that includes them.

Citizen-science publication requires per-record media licensing, location review, and applicable student/guardian consent and school policy. Exact home and routine school locations are not public defaults. Obscuring is not described as anonymization because images, text, nearby observations, and metadata may reveal location. Community identification and data-quality status remain distinct from teacher assessment and scientific certainty.

## 9. Offline synchronization and failure handling

The server is authoritative. Wails maintains a local content cache, pending attachment staging, and a mutation outbox. The first implementation promises offline desktop workflows only after their actual behavior passes acceptance checks; browser offline editing is not implied.

Every mutation includes a client mutation ID, actor/device identity, entity ID, base revision, schema version, and payload. Server processing is idempotent. Attachment upload and record commit are separate visible states; a record is not fully synchronized while required media is pending.

User-visible states include:

- Local draft.
- Pending synchronization.
- Synchronized.
- Synchronization failed with retained local work.
- Conflict requiring resolution.
- Submitted snapshot.
- Citizen-science publication failed or withdrawn, where applicable.

A conflicting server revision never silently overwrites local work. Preserve both versions and provide a comparison/resolution path. Retry does not duplicate a submission, observation, achievement event, or media object.

Other failure requirements:

- AI outage does not block manual authoring or learning.
- Model/evaluator failure produces a visible recoverable error, not a fabricated result or mastery grant.
- Unsupported package dependencies fail import with actionable details; no silent substitution.
- Integration outage leaves local work pending and does not fabricate external success.
- Backup failure is visible to operators; a course export is not presented as a full school backup.
- Restore procedures are rehearsed against real persistent data before classroom release.

## 10. Assessment and learning records

Attempts store resumable state and responses. A small event vocabulary may record start, response, hint, transition, completion, and exit for aggregate improvement, subject to retention policy. Events are not the authoritative attempt or grade database.

First-release assessment uses submitted evidence, a rubric, teacher feedback, and reviewer attribution. Self-review remains distinct. Do not launch with peer grading, weighted gradebooks, rescoring pipelines, or achievement credentials.

Open Badges credentials may later represent genuinely reviewed achievements. XP, avatar state, file presence, local progress, and repeated clicks do not become verified competence through credential issuance.

## 11. Deferred gamification and GrowAdventure

Gamification is a required later module, not first-release scope. The first implementation must emit trustworthy, idempotent domain events with stable actors, content versions, and evidence references so the module can be added without reconstructing history.

```text
Authoritative Academy events → Gamification rules and grants → GrowAdventure projection
```

The gamification module owns versioned achievement definitions, level rules, idempotent grants, revocations, and cooperative quest state. GrowAdventure presents maps, NPCs, quests, optional unlocks, and CodeCombat-style scenarios. It is not authoritative for grades, evidence, course completion, roles, or equipment authority.

Student progression may recognize module completion, evidence revision, scenario completion, and useful collaboration. Teacher progression may recognize reviewed publications, accepted contributions, reusable scenarios, and teaching-resource improvements. Publishing volume or repeated uploads alone must not drive advancement.

Levels are motivational progression, not mastery claims or authorization. Core lessons and accessibility settings cannot require XP. Optional quests, cosmetics, world areas, and harder scenarios may use RPG prerequisites. Prefer cooperative goals; no punitive streaks, click grinding, or repeated-reward farming.

A future `ScenarioDefinition` includes narrative/world references, outcomes, prerequisites, initial domain state, allowed actions, deterministic objectives, hints, evidence outputs, accessibility alternatives, rewards, and replay rules. Scenario rewards are verified server-side and remain idempotent.

## 12. Integration boundaries

- **Plant Modeling Studio:** use a direct typed first-party API for model scenarios, inputs, runs, outputs, provenance, and evidence artefacts. Add LTI 1.3/Advantage when an external tool launch, deep linking, membership services, or grade return is required.
- **GrowAdventure:** consume verified scenario/achievement projections and return server-verifiable actions. Avatar position or a client message alone grants nothing.
- **School rostering:** add OneRoster when a school identifies its SIS and exchange direction. OneRoster is not SSO.
- **Assessment exchange:** add QTI for a defined portability requirement.
- **Course migration:** add Common Cartridge/Thin Common Cartridge with an explicit supported-feature profile.
- **Curriculum frameworks:** add CASE links without treating an identifier as verified alignment.
- **Credentials:** add Open Badges only after assessment and revocation policy exists.
- **Analytics:** add xAPI only for a defined external Learning Record Store integration; do not use it as the canonical event or result store.
- **SCORM:** optional compatibility export, never the internal activity model.

All integrations fail visibly and preserve the local authoritative record. No integration receives private journal content or production equipment credentials by default.

## 13. Security, privacy, accessibility, and operations

Authorize every operation in the Go service by capability and scope. UI hiding is not authorization. Separate school administration, content-library access, class membership, assessment, and personal-workspace ownership. Keep audit records for publication, permission changes, assessment changes, exports, and consequential administrative actions.

Validate and sanitize authored rich text and Markdown. Standard activities cannot execute course-supplied scripts. Media uploads require type/size validation, safe storage identity, malware handling appropriate to deployment, and authorized download paths. Secret sharing links, if later added, are revocable bearer credentials rather than a substitute for accounts.

Define school retention/deletion, shared-device, account-offboarding, consent, moderation, backup, and export procedures before classroom deployment. Personal home observations remain private after course completion unless the student intentionally submits or publishes them. School offboarding must distinguish institutional course records from the student's continuing personal workspace and export rights.

Accessibility is a content-release requirement, not an activity-type claim. Verify keyboard use, focus, contrast, text alternatives, data tables for visualizations, reduced motion, narrow layouts, meaningful status messages, and accessible printable resources. Optional avatar navigation cannot be the only route to essential learning.

Self-hosted release documentation must include pinned dependencies, migrations, persistent-volume ownership, HTTPS, secret configuration, update/rollback, backup/restore, media/storage capacity, and support responsibilities.

## 14. Delivery boundaries

### First implementation

- Go modular monolith, PostgreSQL, asset storage, and self-hosted deployment/backup foundation.
- Shared Svelte admin/teacher/student interface and pinned Wails desktop shell.
- Schools, users, memberships, classes, role presets, and scoped capabilities.
- Course library, structured editor, learner-equivalent preview, review, immutable publication, and class assignment.
- Initial trusted activity types and deterministic lesson progression.
- Attempts, evidence submissions, rubrics, and attributed teacher feedback.
- Personal journal, selective submission, portable export, and desktop synchronization states.
- Content-only course package import/export with explicit exclusions.
- Domain-event outbox sufficient for later integrations and gamification.
- Accessibility and operational acceptance checks.

### Required later roadmap

- Additional scientific activity types and shared activity/question collections.
- Plant Modeling Studio integration and richer facility/scenario evidence.
- Gamification module and GrowAdventure RPG scenarios.
- More extensive offline/content distribution and collaboration workflows.
- Citizen-science publication, moderation, and external observation adapters.
- School-specific SSO, OneRoster, LTI, QTI, Common Cartridge, CASE, xAPI, or Open Badges when justified.
- Advanced gradebook, peer assessment, scheduling, cohorts, and third-party extension surfaces only after real requirements exist.

Implementation planning must select concrete framework/library versions, database migrations, identity/session handling, activity serialization, deployment targets, and test tooling without changing these product boundaries.

## 15. Acceptance scenarios

These are required observable results, not claims of completed implementation.

| Area | Required observable result |
| --- | --- |
| Guided learning | A learner predicts, manipulates, observes, receives rule-appropriate feedback, revises, and reaches a transfer step through one deterministic lesson graph |
| Activity contract | Invalid units, domains, dependencies, or configurations fail editor and Go validation; standard content cannot execute arbitrary script |
| Preview parity | Teacher preview uses the same renderer, evaluator, transitions, accessibility behavior, and reset/replay path as student delivery |
| Publication | Editing a published course leaves the assigned revision unchanged; attempts and submissions retain their original versions |
| Authorization | School, course, class, library, assessment, and personal-workspace capabilities are enforced server-side; unauthorized access fails |
| Journal privacy | A teacher sees submitted coursework but cannot open unshared personal journal or home-plant records |
| Offline synchronization | Offline desktop edits and media synchronize once without duplication; pending/failed states never display as fully synchronized |
| Conflict | A newer server revision is preserved alongside local work and requires explicit resolution |
| Assessment | Teacher feedback identifies the submitted evidence, rubric version, reviewer, and subsequent revision history |
| Portable export | Course packages contain no learner records; journal export opens as readable Markdown with relative attachments |
| Citizen science | A selected public observation requires explicit rights/privacy review and preserves private source records |
| Accessibility | Keyboard, narrow layout, reduced motion, text alternatives, data tables, status messages, and printable resources pass actual surface/document checks |
| Operations | A clean self-hosted install, upgrade/rollback, backup, and restore are demonstrated against persistent course and learner data |
| Integration failure | AI, Studio, GrowAdventure, or external-service failure does not corrupt local work or fabricate success |
| Future gamification | Replayed domain events do not duplicate achievement grants; avatar/client claims alone cannot grant rewards or permissions |
| Equipment boundary | No course, game, model, journal, or integration path can issue real actuator commands |

## 16. Implementation plan sequence

The first implementation is decomposed into independently testable subsystem plans. Each plan must produce working software and observe its changed surface rather than only compiling scaffolding.

1. **Guided activity studio:** the [detailed implementation plan](../plans/2026-11-03-guided-activity-studio.md) delivers validated course JSON, trusted activity definitions, deterministic Go evaluation, schema-driven editing, learner-equivalent Svelte preview, and browser acceptance tests in a separate `grownetics-courseware` repository.
2. **School server:** adds PostgreSQL, bootstrap identity, scoped capabilities, immutable course persistence, publication, assignments, and the transactional domain-event outbox.
3. **Teacher/student web application:** adds authenticated authoring, class assignment, resumable attempts, evidence submissions, rubrics, and attributed feedback.
4. **Wails journal and desktop:** adds personal records, media, selective submission, portable export, offline cache/outbox, and conflict handling.
5. **Self-hosted release:** adds Docker deployment, migrations, backup/restore, upgrade/rollback, accessibility review, and operational documentation.

Plant Modeling Studio, gamification/GrowAdventure, citizen science, and institution-requested interoperability adapters require their own later specifications and plans. They are not silently included in the first implementation.

---

Original prose: CC BY 4.0, subject to the repository's [scope and exceptions](../../../LICENSE.md).
