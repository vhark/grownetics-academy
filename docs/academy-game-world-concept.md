# Grownetics Academy shared-world concept

Recorded: 2026-09-28. This research record supports the approved platform, collaboration, and editing directions. The [formal architecture and experience specification](superpowers/specs/2026-09-28-academy-journal-and-shared-world-design.md) awaits written review; subsystem implementation and deployment checks remain separate.

The user requested RPG-inspired learning, a WorkAdventure-based virtual classroom and live collaboration environment, a collaborative CEA facility designer, and a possible greenhouse digital twin. This expands the previously approved local-first journal architecture. It does not replace the conventional Academy, authorize a deployment, or grant a new license to Grownetics product software.

The user subsequently confirmed that this is a **free add-on module within the Academy**, extending WorkAdventure. That settles the current offering and platform direction: proceed with WorkAdventure as the design basis while meeting its applicable terms. Detailed subsystem designs and deployment readiness remain unapproved.

The user also selected **both learning and real facility planning through two interfaces backed by one dimensioned model**. The following model and collaboration details develop that approved scope; they are proposals until reviewed.

## Recommendation

Use WorkAdventure as the shared-world and communications layer for the free Academy extension, not as the authoritative facility model or the private journal. Start with its supported map/script/embedded-application interfaces and keep the fork's changes narrow where practical. Verify selected-revision component/asset licensing and classroom-deployment requirements before release.

Three approaches:

1. **Extend upstream and keep a thin fork where needed — recommended.** Custom curriculum, maps, learning panels, and a separately designed facility editor preserve a manageable upgrade path. Confirm each required API against a pinned release.
2. **Deeply fork WorkAdventure into the whole Academy application.** Tighter integration, but its renderer, editor, authentication, and release cycle become our maintenance burden. Local-folder permissions and facility semantics still require separate design.
3. **Build a new multiplayer world on a permissively licensed engine.** More control over licensing and interaction design, but multiplayer presence, media, authoring, and moderation must be assembled rather than inherited. This is a fallback to investigate if WorkAdventure's terms or extension seams do not fit; no alternative engine has been selected or audited.

## RPG inspiration and the existing themes

These are design references, not a current popularity ranking, endorsements, or permission to copy proprietary art, music, characters, maps, names, or UI assets.

| Reference | Useful pattern | Academy interpretation |
| --- | --- | --- |
| World of Warcraft / Final Fantasy XIV | Shared hubs, parties, quest journals, cooperative objectives | A campus with teacher-led sessions, small research teams, and project quests with visible goals and evidence requirements |
| RuneScape | Distinct skill tracks advanced through practice | Plant science, observation, measurement, instrumentation, controls, and data skills supported by journal evidence rather than repetitive clicking |
| Pokémon | An explorable world and a gradually developed field guide | A learner's herbarium and equipment field guide, with accurate labels and personal observations; no copied creatures or assets |
| Stardew Valley | A readable 2D growing world, seasons, tending, and incremental improvements | Observe real changes, plan a growing cycle, and improve a shared greenhouse; do not punish a learner for missing a daily visit |
| Minecraft / Factorio — builder and automation references, not strictly RPGs | Constructible environments and visible system connections | Place facility elements, connect represented water/air/power/data systems, inspect constraints, and explain trade-offs |

Preserve the requested theme choices:

- **Academy default:** the existing light/dark field-guide styling, palette, and typography. The current site uses Lora, DM Sans, and IBM Plex Mono with restrained green, paper, and terracotta accents.
- **Magical botanical:** an original scholarly greenhouse/field-journal treatment, with scientifically reviewed botanical illustrations and labels, restrained page-edge growth, and optional gentle reveals. Fantasy changes atmosphere, not the scientific explanations or physical rules. Do not copy a named wizard franchise.
- **Academic:** a quiet, information-dense presentation, including direct list/table/diagram access rather than requiring avatar navigation for every task.
- **Customization and accessibility:** personal appearance settings, readable text and contrast, reduced motion, immediate text display, and consistent task/evidence access. Rewards must not gate accessibility controls.

Keep theme presentation separate from shared geometry, object IDs, permissions, and learning criteria. A room's structural map is shared; changing a personal palette must not change collisions or what equipment exists. Pixel art can establish the world, while close inspection opens accurate botanical illustrations, photographs, and diagrams. Species-identification accuracy cannot be inferred from a few world-map pixels.

## System boundaries

| Component | Owns | Does not own |
| --- | --- | --- |
| Existing Academy | Canonical curriculum, references, teacher resources, versioned content releases | Multiplayer runtime or private student files |
| Local Grow Journal | Learner-selected Markdown folder, photos, progress, preferences, capture guidance | Automatic class-server uploads or operational control credentials |
| Shared Academy world | Class identity/access, presence, collaboration sessions, maps, intentionally shared project artifacts | Unrestricted access to the learner's Documents folder |
| CEA designer/model service | Dimensioned facility models, typed equipment/connections, shared edits, revisions, exports | Scientific truth inferred from sprite positions alone |
| Read-only operational adapter | Authorized, scoped measurements and equipment readbacks with provenance and freshness | Game-origin actuator commands or production credentials exposed to students |

The private journal remains usable without an account or game server. Shared collaboration necessarily introduces hosted services, persistent shared data, backups, access controls, and operational maintenance. GitHub Pages may still host the Academy and journal, but cannot run WorkAdventure's documented server stack.

Keep the journal at a separate top-level browser origin. A cross-origin embedded journal cannot rely on Chrome's folder-picker permission workflow. Link to the journal and let learners explicitly share selected copies of evidence; never pass folder handles or silently mirror the whole journal. A CEA editor without private filesystem authority may be an embedded panel, subject to authentication and browser-origin design.

## WorkAdventure findings

Reviewed release license: `v1.33.10` Play component. Other source/docs inspection spans current upstream branches and must be repeated against the selected commit before implementation. No WorkAdventure instance was built or deployed during this investigation.

| Area | What is supported by the reviewed sources | Important limit |
| --- | --- | --- |
| Shared world | Browser-based 16-bit-style virtual spaces, avatars, proximity interactions, and communications integration | A virtual-office substrate, not a ready-made school LMS |
| Map authoring | Tiled maps plus an inline multiuser editor for entities and areas | Inline editing does not replace floor/wall construction, scripting, or engineering CAD |
| Extension surfaces | Map scripts, iframe/co-website panels, declared room variables | Browser scripts are not authoritative validation; room variables are intended for small metadata/configuration, not high-rate telemetry or whole facility histories |
| Self-hosting | Docker Compose or Kubernetes/Helm, server components, map storage, Redis, and media/identity integrations | Requires real server operations; desired collaboration features depend on configuration and possibly separate services |
| Classroom controls | Identity integrations and roles/access features exist in the product ecosystem | Self-hosted teacher moderation, closed class access, presentation control, recording, and retention need pinned-version verification; marketing is not proof of deployment readiness |

### License gate

The inspected [v1.33.10 Play license](https://github.com/workadventure/workadventure/blob/v1.33.10/play/LICENSE.txt) contains AGPLv3 text **plus a Commons Clause condition**. Section 13 of the AGPL text addresses providing corresponding source to users interacting with a modified program over a network. The added condition restricts the right to “Sell” a product or service consisting entirely or substantially of the software or its functionality, including for a fee or other consideration.

Forking itself is permitted under the inspected license's copying and modification provisions, subject to its conditions. The Commons Clause does not prohibit the act of creating a fork; it restricts “Sell” as defined in that condition. We can evaluate and develop a fork while retaining the applicable terms, notices, and source obligations. That is distinct from clearance to monetize, bundle, or relicense it, and does not replace checking the other component and asset licenses.

Do not describe this as MIT, unrestricted AGPL, or an unrestricted commercial-use grant. The user has now confirmed a free Academy add-on, extending WorkAdventure; proceed on that stated basis rather than treating paid access as an unresolved requirement. Preserve the applicable terms and complete component, dependency, and asset checks before release. If access conditions or monetization later change, reassess that arrangement. Being a company does not by itself establish a prohibited sale, and “education” is not an automatic exception. Repository separation alone is not a legal conclusion about derivative works. No fork has been created in this discussion.

The existing CC BY curriculum/MIT teaching-code decision does not relicense WorkAdventure or proprietary Grownetics product code. Keep the operational product outside this work unless separately authorized.

## CEA facility designer: more than placing furniture

The authoritative design should use physical units and stable object IDs, with the game map a projection of that model. Candidate scope for a separate designer specification:

- Site/room/zone geometry, dimensions, cultivation areas, and circulation.
- Benches, grow racks, beds, lights, fans, HVAC/dehumidification, irrigation reservoirs/lines, and sensors as typed equipment with dimensions and source/versioned characteristics.
- Explicit connections and service relationships: water, air, electrical provision, controls, and data. A line drawn on screen is not proof of a feasible or safe installation.
- Appropriate checks such as overlaps, specified clearances, missing connections, and assumptions behind capacity calculations. Do not claim building-code compliance or certified engineering from generic rules.
- Derivable equipment/material schedules, revisions, undo, project permissions, and synchronized editing with defined conflict behavior.
- A portable structured model, likely JSON with Markdown explanations and linked media; this is a proposal for facility documents, not a change to the journal's Markdown source of truth.

Use WorkAdventure's native editor for decoration and interaction hotspots. A purpose-built CEA panel edits the domain model; a projection adapter maps stable IDs into the shared world. Whether the chosen release offers sufficient supported map-update APIs or needs a small fork remains unverified. Do not put the facility database or telemetry stream into `WA.state`.

### Two interfaces, one facility model

Approved scope: the same facility project supports guided learning and detailed planning.

| Learning mode | Design mode |
| --- | --- |
| Guided project steps and explanations | Direct access to dimensions, properties, connections, and revisions |
| A curated starting equipment palette with progressive detail | More complete equipment specifications and project inspection |
| Feedback explaining why a relationship or constraint matters | Explicit assumptions, validation findings, and equipment/material schedules |
| Journal-linked observations and reflection prompts | Planning annotations and evidence behind design choices |

Proposed invariants:

- Switching mode changes the interface, not the project, its identity, units, or revision. It must not discard advanced fields or reinterpret equipment dimensions.
- Learning/design mode is separate from Academy/botanical/academic appearance. Either mode can use any supported theme.
- Mode selection is not an authorization mechanism. An advanced interface does not grant editing rights or permission to operate equipment.
- Assignment constraints and teaching hints remain distinguishable from physical properties and engineering assumptions. A lesson's budget or equipment challenge is not a law of greenhouse physics.
- The shared model and its explicit relationships drive both interfaces and the world-map projection. Neither interface keeps an independent copy of facility truth.
- Design feedback must distinguish malformed data, missing information, assignment criteria, and bounded engineering checks. Showing a detailed editor does not establish code compliance or validated performance.


Distinguish physical equipment, the settings a controller exposes, and actual equipment behavior. Align the model with GrowBIM/IFC concepts where useful, but do not claim an implemented GrowBIM integration or a validated importer. This classroom design does not make an independently useful operating coach depend on a digital-twin project.

### Geometry and editing scope

Approved starting scope: a dimensioned 2D plan editor with explicit height, elevation, and level data, plus WorkAdventure's top-down walkable projection. The user accepted this recommendation with “proceed”; full 3D editing is not required from the outset.

- Store physical geometry, units, and stable IDs independently of game tiles. Display snapping must not silently round the authoritative dimensions.
- Represent facility boundaries, rooms, growing zones, levels, and circulation. Equipment records include footprint, height, orientation, and mounting elevation where relevant; stacked growing cannot be represented by footprint alone.
- Support placement and rotation with precise property editing. Scaling a sprite must not manufacture a new equipment specification or increase its rated capacity.
- Represent water, air, power, and data relationships explicitly. Distinguish a planned connection from an actual installed or observed connection.
- Keep specification sources and assumptions visible. Missing equipment data is unknown, not an invented rating or a zero-cost item.
- Show applicable dimensional, connection, and capacity findings with their assumptions. A layout check is not certification, and a diagram alone is not a validated dynamic simulation.
- A full 3D editor is a separate UI/rendering choice, not a reason to omit vertical geometry from the shared model. It would add selection, navigation, rendering, and synchronization work alongside the existing WorkAdventure world.


## Model, simulation, and twin are different capabilities

1. **Designed model:** spatial layout and declared equipment. Useful for teaching and planning; no live-system claims.
2. **Scenario simulation:** explicit models, assumptions, inputs, and limitations. Show simulated values as simulated; WorkAdventure does not supply greenhouse physics by itself.
3. **Connected observational representation:** map actual sensors/equipment to stable model IDs, expose units, timestamps, quality/staleness, and distinguish commanded settings from measured states. Historical replay remains visibly historical. This is the first proposed live-twin direction.
4. **Validated predictive twin:** additional site-specific model calibration and validation. A live display or animated fan does not establish accurate predictions, yield forecasts, or optimization.

Read-only integration first. No classroom gesture, simulation action, or avatar interaction may operate real pumps, heaters, lights, valves, dosing, or climate setpoints. Any later control capability needs a separate authorization and safety design; none is requested or approved here.

## Classroom deployment requirements

For student use, propose closed class membership, teacher-controlled sessions, explicit opt-in audio/video, recording off by default, scoped sharing, and a workable moderation/reporting/removal process. Determine chat retention, consent, and shared-device behavior before a pilot. These are requirements to verify or implement, not claims that upstream defaults satisfy them or that the design is legally compliant.

### Classroom and project collaboration

Approved structure: shared class campus, separate collaborative team projects, protected template copies, teacher oversight, intentional review sharing, and independent professional-team projects. Exact permissions and concurrent-edit behavior remain to be specified.

- Give each class a shared campus for instruction and discussion, with separate facility projects for its teams. A whole-class demonstration project remains possible.
- Teammates collaborate live on the same project. Teachers can review and comment, with edit/pause powers defined explicitly by server-enforced roles rather than avatar position or UI mode.
- Start projects from copies of teaching templates so team changes do not overwrite the canonical template or another team's work.
- Let teams intentionally share a design snapshot for class review. Private journal entries and photos stay local unless the learner explicitly shares selected copies.
- Preserve revisions and surface conflicting edits; define undo so it cannot silently erase another participant's intervening work.
- Use the same project membership and permissions for independent real-facility teams outside a classroom. Do not make a teacher account mandatory for every practical design project.


## Decomposition and decisions still needed

Keep four independently scoped workstreams rather than one large implementation plan:

1. The approved local-first journal and curriculum experience.
2. A free WorkAdventure-based shared classroom/world, with its component-license and deployment requirements checked before release.
3. The CEA facility domain model and collaborative designer, usable apart from avatar navigation.
4. Read-only real-facility data integration and, separately, any validated simulation capability.

The user has selected a free WorkAdventure extension, both facility-design audiences through one shared model, the class-hub/team-project structure, a 2D plan editor that preserves height and level data, and the combined learner experience. The formal specification preserves all four workstreams and proposes starting implementation planning with the independent journal and curriculum-delivery workstream. Written-specification review and the first deployment audience remain open.

## Browser concept

An original local sketch provides three capability views—learning, facility design, and observation—and Academy, botanical, and academic palette studies. All six controls were exercised in the browser; the Academy and botanical views were also visually inspected. No actual multiplayer, editing, camera capture, or telemetry connection was tested or implemented.

Preview source: `.superpowers/brainstorm/95119-1790621490/content/academy-world-studio.html`. These ignored companion files are exploratory artifacts; this document records the durable design decisions and limits. Botanical palette exploration does not replace the remaining work on scientifically reviewed illustrations, labels, and accessible animation.

## Sources and evidence limits

- [WorkAdventure repository](https://github.com/workadventure/workadventure)
- [Reviewed release license](https://github.com/workadventure/workadventure/blob/v1.33.10/play/LICENSE.txt)
- [Self-hosting documentation](https://github.com/workadventure/workadventure/blob/master/docs/others/self-hosting/install.md)
- [Production Compose example](https://github.com/workadventure/workadventure/blob/master/contrib/docker/docker-compose.prod.yaml)
- [Security support policy](https://github.com/workadventure/workadventure/blob/master/SECURITY.md)
- [Map-building overview](https://docs.workadventu.re/map-building/)
- [Inline editor](https://docs.workadventu.re/map-building/inline-editor/)
- [Map scripting](https://docs.workadventu.re/developer/map-scripting/)
- [Shared-state API](https://docs.workadventu.re/developer/map-scripting/references/api-state)
- [Embedded links/panels](https://docs.workadventu.re/map-building/inline-editor/entity-editor/open-link)
- [File System Access permission specification](https://wicg.github.io/file-system-access/#requesting-file-system-permission)

Source review establishes a credible integration direction, not a tested end-to-end deployment, engineering validation, licensing clearance, or classroom readiness. Any local browser concept is original illustrative UI, not a running WorkAdventure fork or a real connected greenhouse.
