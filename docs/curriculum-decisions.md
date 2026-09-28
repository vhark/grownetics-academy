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

## Proposals recorded, not approved

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

## Changes recorded

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
