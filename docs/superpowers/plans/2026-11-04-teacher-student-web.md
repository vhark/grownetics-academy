# Teacher and Student Web Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver authenticated course authoring and assignment, resumable learner attempts, intentional evidence submissions, versioned rubrics, and attributed assessment in the browser.

**Architecture:** Extend the existing Go/PostgreSQL school server and static Svelte application. The server remains authoritative for identity, authorization, evaluation, progression, evidence, and assessment; the existing loopback studio remains available. Extract the existing editor and player presentation rather than creating a second renderer or evaluator.

**Tech Stack:** Existing pinned Go 1.27.1, pgx 5.12.0, goose 3.29.0, PostgreSQL 18.1, Svelte 5, SvelteKit 3.1.1, Vite 8.3.5, TypeScript 6.0.3, and Playwright 1.64.1. No new runtime framework.

## Baseline and boundaries

- Repository: `/Users/vincehark/Code/grownetics-courseware`.
- Start from `68e7ac5` on `feature/guided-activity-studio`; create `feature/teacher-student-web` at execution time. GitHub origin is private: `https://github.com/vhark/grownetics-courseware.git`.
- The school server already provides bootstrap, sessions, capabilities, immutable course revisions, publication, assignments, and an event outbox. Do not rebuild those systems.
- Existing trusted activities are explanation, numeric, and evidence. This plan delivers the next subsystem using those activities; adding scientific models, choice activities, media ingestion, or activity migrations is not part of this cutover.
- Evidence in this subsystem is explicitly selected text from coursework, with optional learner-authored revision of that text. Personal journals, files, camera, and private media remain the separate Wails/journal subsystem. There is no implicit journal access and no fabricated journal integration.
- No production deployment, account administration UI, public registration, offline synchronization, AI dependency, grading automation for reflective evidence, gamification, or event-delivery worker.
- A numeric correctness result is instructional feedback, not a rubric assessment. Only an authorized teacher explicitly records assessment.

## Decisions and invariants

1. One resumable attempt per assignment/student. Reload restores current step, feedback, disclosed hint, pending continuation, incorrect counts, and completion state. No browser-supplied course body, attempt count, next step, or completion flag is authoritative.
2. Every attempt pins its assignment's course revision and rubric revision. Assignments retain their published course revision. Rubrics are immutable revisions, not mutable JSON attached to a live assessment.
3. Student attempts and submissions are distinct. Completing an activity never submits evidence. Students choose evidence, see the exact snapshot, and explicitly submit.
4. Submissions are immutable numbered revisions. Revising after feedback produces a new submission; prior assessments remain attached to their original submission.
5. Assessments are append-only attributed records with reviewer, rubric revision, criterion scores, written feedback, and database time. A correction appends a new assessment version; old feedback is never overwritten.
6. All learner commands carry a UUID `commandId` and integer `baseVersion`. Exact retries return the original response without new rows/events. Reusing an ID with different input is 409. A new command with a stale base is 409. Authentication and membership checks occur before replay lookup.
7. HTTP input validation errors are 400, missing authentication 401, missing capability or rejected Origin 403, inaccessible resources 404, stale versions/conflicting replay 409, unexpected database failures sanitized 500. Never expose SQL diagnostics.
8. The server serves the built browser app and API from the same origin. No CORS workaround and no token in browser storage. Session cookies retain existing secure defaults.
9. Teacher preview remains ephemeral. Its renderer and evaluator are shared with student delivery, but preview cannot create attempts, submissions, or domain events.
10. A legacy assignment without a rubric is visibly unconfigured, not silently assigned a made-up rubric. Teachers can attach a rubric once before any attempt starts. Starting an unconfigured assignment returns 409 with an actionable message.

## File ownership

| Files | Responsibility |
| --- | --- |
| `internal/database/migrations/00002_learning.sql` | Rubrics, assignment rubric link, attempts, responses, command receipts, submissions, assessments |
| `internal/school/rubrics.go`, `rubrics_test.go` | Immutable rubric validation and persistence; same-school attachment |
| `internal/school/attempts.go`, `attempts_test.go` | Server-authoritative lesson state and transactional idempotency |
| `internal/school/submissions.go`, `submissions_test.go` | Intentional selected evidence snapshots and revisions |
| `internal/school/assessments.go`, `assessments_test.go` | Teacher review, rubric scoring, attributed history |
| `internal/school/http.go`, `http_learning.go`, `http_learning_test.go` | Existing session/capability middleware plus new resource routes |
| `internal/school/catalog.go`, `catalog_test.go` | Teacher courses, published revision history, class membership discovery, current user |
| `internal/webui/handler.go`, `handler_test.go` | Shared static asset serving and SPA fallback without API fallback |
| `cmd/server/main.go`, `cmd/studio/main.go`, `cmd/studio/main_test.go` | Mount shared web handler; preserve studio loopback restriction |
| `web/src/lib/api.ts`, `types.ts`, `school-api.ts` | Shared HTTP errors and explicit school contracts |
| `web/src/lib/CourseEditor.svelte`, `LessonPlayer.svelte`, `LessonView.svelte` | Shared authoring and activity presentation; existing studio uses these too |
| `web/src/lib/SchoolApp.svelte`, `TeacherWorkspace.svelte`, `StudentWorkspace.svelte`, `RubricEditor.svelte`, `EvidenceSubmission.svelte`, `AssessmentPanel.svelte` | Authenticated user workflows |
| `web/src/routes/+page.svelte`, `web/src/app.css` | Choose studio versus school surface, preserve fieldbook styling/accessibility |
| `web/tests/school.spec.ts`, `web/playwright.config.ts` | Real browser workflow against isolated school data |
| `README.md`, `.github/workflows/ci.yml`, `Makefile` | Runnable verification and operation instructions |

Do not split by adding a generic repository layer, generic workflow engine, or separate frontend application. Query methods remain on `school.Store`, using the existing pool and event helper.

## Task 1: Add learning persistence and immutable rubrics

**Files:** create migration, rubric implementation/tests; modify assignment implementation/tests and database migration tests.

- [ ] Add the migration below. Never alter migration 1, which has already run in development.

```sql
-- +goose Up
CREATE TABLE rubric_revisions (
    id text PRIMARY KEY,
    school_id text NOT NULL REFERENCES schools(id),
    rubric_id text NOT NULL,
    revision integer NOT NULL CHECK (revision > 0),
    content jsonb NOT NULL,
    created_by text NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (school_id, rubric_id, revision)
);
ALTER TABLE assignments ADD COLUMN rubric_revision_id text REFERENCES rubric_revisions(id);
CREATE TABLE attempts (
    id text PRIMARY KEY,
    assignment_id text NOT NULL REFERENCES assignments(id),
    student_id text NOT NULL REFERENCES users(id),
    course_revision_id text NOT NULL REFERENCES course_revisions(id),
    rubric_revision_id text NOT NULL REFERENCES rubric_revisions(id),
    version integer NOT NULL DEFAULT 1 CHECK (version > 0),
    state jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (assignment_id, student_id)
);
CREATE TABLE attempt_responses (
    id text PRIMARY KEY,
    attempt_id text NOT NULL REFERENCES attempts(id),
    sequence integer NOT NULL CHECK (sequence > 0),
    step_id text NOT NULL,
    response jsonb NOT NULL,
    outcome jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, sequence)
);
CREATE TABLE learning_commands (
    attempt_id text NOT NULL REFERENCES attempts(id),
    command_id text NOT NULL,
    request jsonb NOT NULL,
    result jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (attempt_id, command_id)
);
CREATE TABLE submissions (
    id text PRIMARY KEY,
    attempt_id text NOT NULL REFERENCES attempts(id),
    revision integer NOT NULL CHECK (revision > 0),
    course_revision_id text NOT NULL REFERENCES course_revisions(id),
    rubric_revision_id text NOT NULL REFERENCES rubric_revisions(id),
    evidence jsonb NOT NULL,
    submitted_by text NOT NULL REFERENCES users(id),
    submitted_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, revision)
);
CREATE TABLE assessments (
    id text PRIMARY KEY,
    submission_id text NOT NULL REFERENCES submissions(id),
    revision integer NOT NULL CHECK (revision > 0),
    rubric_revision_id text NOT NULL REFERENCES rubric_revisions(id),
    reviewer_id text NOT NULL REFERENCES users(id),
    command_id text NOT NULL,
    request jsonb NOT NULL,
    scores jsonb NOT NULL,
    feedback text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (submission_id, revision),
    UNIQUE (submission_id, reviewer_id, command_id)
);
CREATE INDEX submissions_attempt_time ON submissions(attempt_id, submitted_at, id);
CREATE INDEX assessments_submission_time ON assessments(submission_id, created_at, id);

-- +goose Down
DROP TABLE assessments;
DROP TABLE submissions;
DROP TABLE learning_commands;
DROP TABLE attempt_responses;
DROP TABLE attempts;
ALTER TABLE assignments DROP COLUMN rubric_revision_id;
DROP TABLE rubric_revisions;
```

- [ ] Define `Rubric` as `{title, criteria}`. Criteria are `{id, title, description, maxScore}`. Require a nonblank title of at most 200 Unicode characters, 1–20 criteria, unique safe IDs using the course ID convention, nonblank criterion title/description (200/2000 characters), and integer maximum scores 1–100. Reject unknown JSON fields, nulls in required fields, and duplicate criterion IDs. The total is computed, never accepted from the client.
- [ ] `CreateRubric(ctx, schoolID, actorID, content)` creates revision 1 with independent UUIDs for rubric and revision. `ReviseRubric(ctx, rubricID, baseRevision, actorID, content)` verifies actor school/capability in the handler, locks a school-scoped rubric series using a transaction advisory lock, reads highest revision, rejects stale base, and inserts the next revision. No update or delete rubric-content endpoint.
- [ ] Extend `Assign` to require `rubricRevisionID` for newly created assignments. Check the rubric belongs to the same school as class/course. Keep the existing class/course-revision uniqueness constraint: an exact retry returns the original assignment; a retry selecting another rubric is 409, not a silent change. Include `rubricRevisionId` in assignment responses and events. Migrate every caller and test.
- [ ] Add `ConfigureLegacyAssignmentRubric`: lock assignment, require teacher membership and same-school rubric, reject a conflicting existing rubric, assert no attempt exists, set the previously null reference. Exact repeats are successful; no content mutation is permitted afterward.
- [ ] Regression cases: invalid rubric bounds/IDs; immutable rubric revisions and stale base; foreign-school rubric rejection; assignment retry retaining original rubric; conflicting retry; legacy assignment configured once; migration upgrades an existing school without losing users/courses/assignments.
- [ ] Run database and school tests with the configured development URL. Verify rollback in a fresh disposable database. Commit `feat: add immutable assessment rubrics and learning storage`.

## Task 2: Implement durable server-authoritative attempts

**Files:** create attempts implementation/tests; reuse `course.Course.Evaluate`, `Course.Public`, `activity.Response`, and `emit`.

State contracts (JSON uses lowerCamel field names):

```go
type AttemptState struct {
    CurrentStep string `json:"currentStep"`
    Incorrect map[string]int `json:"incorrect"`
    Pending *course.Result `json:"pending,omitempty"`
    Completed bool `json:"completed"`
}
type AttemptCommand struct {
    CommandID string `json:"commandId"`
    BaseVersion int `json:"baseVersion"`
    Kind string `json:"kind"`
    StepID string `json:"stepId,omitempty"`
    Response activity.Response `json:"response,omitempty"`
}
```

`Kind` is exactly `respond` or `advance`. Reject response/step fields on advance, missing step on respond, malformed UUID command IDs, and baseVersion below 1. `AttemptView` returns ID, assignment ID, exact course/rubric revision IDs, version, state, and public course content. It never returns stored expected answers or undisclosed hints. Return only the evaluated hint in `state.pending`.

- [ ] `StartAttempt(ctx, assignmentID, studentID)` verifies current student membership, locks the assignment, requires a configured rubric, inserts state at `firstStep` with empty incorrect counts and version 1, or returns the existing attempt unchanged. It must not reset a completed attempt. Assignment locking serializes legacy rubric configuration with start.
- [ ] `GetAttempt(ctx, attemptID, studentID)` requires ownership and current student membership before returning state and the redacted pinned revision. No teacher route exposes unsubmitted response logs.
- [ ] `ApplyAttemptCommand` transaction ordering: lock attempt row; verify ownership/membership; look up command receipt; compare decoded request semantics if found; replay original stored result on exact match; reject changed payload; check baseVersion; read pinned full course; apply transition; increment version; insert response when appropriate; update state; insert receipt and any completion event; commit. A receipt stores the original returned view so later retries do not masquerade as newer state.
- [ ] `respond`: reject completed attempts and a response to a different step. If pending outcome can advance (correct, continue, or a non-self next step), require advance instead of allowing another response. Evaluate the stored full course using server-held incorrect count. Increment that count only for incorrect outcomes. Insert the typed response and evaluated result, including invalid responses. Save pending feedback. Terminal result sets completed immediately and emits one `attempt.completed:<attemptID>` event. A nonterminal explanation `continue` advances immediately, matching existing preview. Numeric/evidence/non-self retry transitions remain pending until explicit advance.
- [ ] `advance`: require nonterminal pending outcome that permits advancement; set currentStep to its nextStep, clear pending, and reset the destination step's retry count to match the existing player visit semantics. Do not reevaluate, insert an answer, or emit another completion event.
- [ ] A same-step incorrect/invalid pending result permits a subsequent respond, not advance. Invalid responses do not consume a hint attempt. Completion is never a client input.
- [ ] Bound command requests by the existing 2 MiB decoder; evidence field limits remain enforced by the trusted evaluator. Serialize numbers through existing `json.Number` rather than float conversion.
- [ ] Tests: interrupted incorrect answer reload retains feedback and hint count; invalid then correct; advance-before-response rejected; wrong step rejected; branch transition honored; terminal explanation/evidence; stale tabs; exact response retry creates one response; changed-payload retry conflicts; exact advance retry; simultaneous commands from same base yield one success; student B cannot read/replay student A; removal from class denies access; later course/rubric edits do not change attempt; completion event insertion failure rolls back state and receipt.
- [ ] Run school tests and targeted `-race` tests. Commit `feat: persist resumable learner attempts`.

## Task 3: Add intentional evidence submissions and attributed assessments

**Files:** submissions and assessments implementations/tests.

Evidence submission request:

```json
{
  "commandId": "f9fd5697-0ac2-4d80-8e41-47ebd8e9e9ca",
  "baseVersion": 7,
  "baseSubmissionRevision": 0,
  "evidence": [
    {"responseId":"stored-response-id","text":"The selected explanation and its limitations."}
  ]
}
```

- [ ] Expose the student's own eligible evidence choices: response ID, step ID/title, successful evidence response text, and recorded time. Only responses from their own attempt whose step type is evidence and whose evaluator outcome is continue qualify. Numeric guesses and invalid reflections are not eligible evidence. This is not a teacher response-history endpoint.
- [ ] Submission requires a completed attempt and at least one selected evidence item, at most 50, no duplicate response IDs. Each selected response must belong to this attempt. Validate selected text against the pinned evidence step's length bounds using Unicode rune counts and trimmed text. Learners may revise text in the submission editor; store both original response provenance and the intentionally submitted text, clearly marking it as a submission revision rather than rewriting the attempt response.
- [ ] Lock attempt, perform authorization/replay/base checks using `learning_commands`, check the latest submission number matches `baseSubmissionRevision`, create the next immutable snapshot, increment attempt version, store a command receipt, and emit `submission.created:<submissionID>` atomically. Snapshot includes step ID/title, response ID/time, selected text, submitted actor/time, exact course and rubric revision IDs. The event contains references, not evidence bodies.
- [ ] The receipt request includes operation `submit` so a command ID cannot be reused across respond/advance/submit. A failed validation writes neither receipt nor submission. Explicit resubmission after feedback requires a new command ID and base submission revision.
- [ ] Teacher submission list/detail requires `assessment.assess` and teacher membership in the assignment class, plus matching school. Student detail requires ownership/current class membership. Detail returns the submitted evidence only, never other attempt responses or private journal data. Teacher filtering may use class and assignment IDs but must authorize before querying records.
- [ ] Assessment request is `{commandId, baseAssessmentRevision, scores, feedback}`, where scores maps every pinned rubric criterion ID to an integer within `[0,maxScore]`. Reject missing/extra criteria, fractional/negative/over-limit scores, blank feedback, or feedback over 10000 Unicode characters. Compute total on the server for display; do not store a client-supplied total or pass/fail claim.
- [ ] Lock submission; require capability and current teacher membership; compare existing receipt represented by `(submission, reviewer, commandID)` before base check; reject ID reuse with different input. Check latest assessment revision across all reviewers equals base; append next assessment with the authenticated reviewer and pinned rubric; emit `assessment.recorded:<assessmentID>` atomically. Different teachers cannot overwrite one another's concurrent assessment. Student feedback view includes all versions, reviewer display name/ID, database time, criterion scores, rubric details, and explicit latest assessment.
- [ ] Tests: completion is not submission; teacher cannot see unselected evidence; foreign response ID rejected; revised submission leaves original evidence and assessment unchanged; wrong class/role denied; rubric version remains pinned; missing/extra/out-of-range scores rejected; fabricated reviewer ignored by strict decoder; assessment correction appends history; retry creates one record/event; stale reviewer conflicts; event failure rolls back domain change.
- [ ] Run school integration tests. Commit `feat: add evidence submissions and rubric assessment history`.

## Task 4: Expose discovery, learning, and review APIs

**Files:** catalog and HTTP learning files; update existing route registration and tests. Keep session middleware in `http.go`; do not duplicate authentication in new handlers.

Routes and required scope:

| Method/path | Input/result | Gate |
| --- | --- | --- |
| GET `/api/session` | user ID/display name, school ID, actual school capability actions | authenticated |
| GET `/api/teacher/courses` | current revision summaries, including published pointer | course.edit, own school |
| GET `/api/teacher/courses/{id}/revisions` | published revision IDs/titles/numbers/times | course.edit, same school |
| GET `/api/teacher/classes` | caller's teacher-member classes | course.assign, own school |
| GET `/api/teacher/assignments` | caller's teacher-member assignments, rubric/configured state | course.assign + class teacher |
| GET `/api/teacher/rubrics` | immutable rubric revision summaries | course.edit, own school |
| POST `/api/teacher/rubrics` | rubric content -> revision 1 | course.edit |
| POST `/api/teacher/rubrics/{id}/revisions` | baseRevision/content -> next revision | course.edit |
| PUT `/api/teacher/assignments/{id}/rubric` | rubricRevisionId -> configured legacy assignment | course.assign + class teacher |
| POST `/api/teacher/preview/validate` | course JSON -> validation | course.edit |
| POST `/api/teacher/preview/evaluate` | course/stepId/response/attempts -> course.Result | course.edit |
| GET `/api/teacher/definitions` | trusted activity definitions | course.edit |
| POST `/api/student/assignments/{id}/attempt` | no course supplied -> current/new AttemptView | course.learn + class student |
| GET `/api/student/attempts/{id}` | AttemptView | course.learn + ownership/member |
| POST `/api/student/attempts/{id}/commands` | AttemptCommand -> AttemptView | same |
| GET `/api/student/attempts/{id}/evidence` | eligible own text evidence choices | same |
| POST `/api/student/attempts/{id}/submissions` | intentional snapshot command -> SubmissionView + attemptVersion | same |
| GET `/api/student/attempts/{id}/submissions` | own submission/assessment history | same |
| GET `/api/teacher/submissions` | classId/assignmentId filter -> submitted snapshots summary | assessment.assess + class teacher |
| GET `/api/teacher/submissions/{id}` | selected evidence + rubric + attributed feedback history | same |
| POST `/api/teacher/submissions/{id}/assessments` | assessment request -> immutable AssessmentView | same |

- [ ] Add JSON tags to all exported wire fields and explicit request DTOs. All mutation handlers use existing Origin enforcement and bounded single-document decoding. All lists return `[]`, not `null`.
- [ ] Add `/api/session` using real grants, not role-name inference. The web UI may use grants to hide unavailable actions, but handlers still enforce them.
- [ ] Extend existing assignment request with required rubricRevisionId and reject mismatches in route/course/class/rubric. Existing legacy assignments remain visible with `configured:false` and a clear unavailable-start message.
- [ ] Extend the existing student assignment list with nullable attempt ID, completion status, configured flag, and pinned rubric identity. Join attempts only for the authenticated student; do not expose another student's progress. Teacher assignment discovery returns only the caller's teacher-member classes, including legacy unconfigured assignments.
- [ ] Teacher preview endpoints use the existing course parser/evaluator directly with no database mutation. Clamp previousAttempts to existing studio bounds. Never mount unauthenticated studio APIs on the school server.
- [ ] Return no-cache headers on authenticated JSON responses (`Cache-Control: no-store`). Unexpected errors are sanitized; do not mask database outages as successful empty lists.
- [ ] API regression exercises real teacher and student sessions through the complete flow, including refresh/resume, deliberate submission, teacher feedback, student viewing feedback, and resubmission. Assert status and content, not just a nonempty list. Include cross-school and same-school-other-class ID attacks on each new resource family.
- [ ] Run all Go tests. Commit `feat: expose authenticated learning and assessment workflows`.

## Task 5: Share the player/editor and serve the school web application

**Files:** shared static handler, command entrypoints, shared frontend transport/editor/player files, root route.

- [ ] Extract existing static-serving behavior from `cmd/studio` to `internal/webui` without weakening path handling. API prefix is handled separately; unknown `/api/...` returns JSON 404, not SPA HTML. Serve exact build assets, fallback index only for browser routes. Move existing traversal/parent-directory regression coverage to the shared handler and preserve loopback CLI coverage.
- [ ] Add `-web` to school server (default `web/build`), compose authenticated `/api/` handler and shared web handler. Startup must report missing index/build path clearly instead of serving a broken application. Bootstrap must not require web assets.
- [ ] `GET /api/app` returns `{mode:"studio"}` on studio and `{mode:"school"}` on school. This contains no identity or secrets. Root page selects the appropriate application; a failed mode request displays a retryable error, not a studio fallback.
- [ ] Extract course-edit form from the existing root page into `CourseEditor.svelte` with bound course, trusted definitions, and explicit validate/import/export callbacks. Preserve stable per-position keys, numeric editing behavior, import validation, operation sequencing, and separate validated preview snapshots. No editor mutation refreshes preview before validation.
- [ ] Extract activity presentation from `LessonPlayer.svelte` into `LessonView.svelte`. Props are public course/step, pending outcome, completed flag, busy/error, and respond/advance/reset callbacks. `LessonPlayer` remains the ephemeral preview adapter and existing tests keep their accessible labels. `StudentWorkspace` is the persistent adapter; it never calls `/api/evaluate` or transmits a course body. Both render exactly the same activity controls and feedback.
- [ ] Give `LessonPlayer` an explicit evaluator callback with the existing `(course, stepId, response, attempts) -> Promise<Outcome>` signature. The studio supplies its current API function; teacher preview supplies the authenticated preview endpoint. Do not infer server mode inside the renderer or allow a teacher preview to call an unavailable studio endpoint. Make reset optional in `LessonView`; persistent student delivery exposes no reset action.
- [ ] Shared transport exports `HTTPError` with numeric status and server message. Use same-origin credentials; never put credentials in localStorage/sessionStorage. Import/export handling must not turn a 401 or 409 into a successful UI state.
- [ ] Preserve the existing paper/green/terracotta fieldbook styling. No external font/network dependency is introduced by this work. Busy states disable duplicate submission/advance; focus and live status are accessible; reduced motion and narrow layout retain existing behavior.
- [ ] Run all 14 existing studio browser tests unchanged in intent. Add no source-text/copy tests for the extraction; exercise actual behavior. Commit `refactor: share course editor and lesson presentation`.

## Task 6: Build authenticated teacher workflows

**Files:** SchoolApp, TeacherWorkspace, RubricEditor, school transport/types, root styling.

- [ ] Login form sends existing `/api/login`; then load `/api/session`. On 401 clear account-specific view state and show login. Logout only clears state after confirmed server success; failures remain visible. Do not claim logout while session revocation failed.
- [ ] Teacher workspace shows authorized course list, opens current revisions, creates drafts, and edits using CourseEditor. Save sends current base revision and route-matched courseId; on success replace saved baseline/version without dropping edits made while request was pending. Either disable editing during save or compare operation generation; choose disabling to keep the first implementation simple.
- [ ] On 409 retain local unsaved content, show explicit conflict, offer Export local JSON and Reload latest (with discard confirmation). Do not auto-retry with a newer base or overwrite server state.
- [ ] Validate/preview uses teacher-only preview endpoints and shared LessonPlayer adapter. Reset affects preview only. Publish is a distinct button visible only with course.publish, disabled for unsaved/invalid content; result updates published pointer.
- [ ] Rubric editor provides title and criterion title/description/maxScore, add/remove criteria within declared bounds, save new or revised immutable rubric. Display revision identity. Existing assigned rubric content is read-only; edit creates a new rubric revision.
- [ ] Assignment form chooses one published course revision, one of caller's teacher-member classes, and one rubric revision. Show all three identities before explicit Assign. Never implicitly choose a draft. Legacy unconfigured assignments expose attach-rubric action only before attempt start.
- [ ] Teacher review workspace lists submitted snapshots, not attempts. Opening a submission shows only selected text, provenance, submission number/time, pinned rubric, previous reviewer history, score inputs per criterion, and written feedback. Save assessment sends current base assessment revision; stale conflict retains unsaved feedback and requires reload/reconciliation. Successful correction appends visible history.
- [ ] Browser scenarios: real login; author valid graph; invalid edit cannot publish; save conflict preserves local text; preview produces no attempt; publish/assign selection; rubric revision does not rewrite earlier assignment; teacher review attributes feedback to logged-in reviewer; student login cannot reveal teacher workspace or call teacher routes.
- [ ] Commit `feat: add authenticated teacher authoring and assessment UI`.

## Task 7: Build resumable student and evidence workflows

**Files:** StudentWorkspace, EvidenceSubmission, AssessmentPanel and shared school types/transport.

- [ ] Assignment list displays title, exact course/rubric versions, and start/resume/completed status. An unconfigured legacy assignment is visibly unavailable with a teacher action message; no fake fallback rubric.
- [ ] Start/resume reads server AttemptView and mounts LessonView. Respond/advance commands use `crypto.randomUUID()` and current version. Keep command ID/payload in memory while retrying a failed network request; do not allocate a new ID for the same retry. Reload recovers authoritative server state; a browser restart does not pretend to know an unconfirmed response succeeded.
- [ ] After response, show server feedback/hint; Continue sends advance when required. Display server-confirmed completion only. On stale version, load current server view and explicitly report another tab updated the attempt; do not reapply an answer automatically. Pending network errors remain distinct from an incorrect educational response.
- [ ] Completed attempt exposes Review evidence, not automatic submission. EvidenceSubmission loads eligible own evidence choices. Selection defaults empty. Each selected item shows source step/time and editable submitted text. Show a preview of exactly the selected snapshot and an explicit Submit selected evidence button. Unselected text is absent from the request and snapshot.
- [ ] If a completed course has no successful evidence activity, show “No evidence activity in this course” and do not offer submission. Completion remains valid; do not manufacture evidence from numeric answers. Teachers needing assessed submissions must author an evidence step before publication.
- [ ] After submission show immutable submission number/time and selected evidence. Feedback view displays rubric criteria, reviewer identity/time, scores, written feedback, and assessment history. Revise submission copies the last selected evidence into an editable draft and sends a new submission command/base revision; old submission/assessment remains visible and unchanged.
- [ ] Browser scenarios: reload after wrong numeric answer retains hint, reload before Continue preserves pending feedback, finish lesson without submission produces no teacher-visible work, select one of two evidence responses and submit only one, teacher feedback visible after student reload, revise submitted text and observe two immutable submissions, user-switch clears prior learner data, failed POST/retry produces one submission.
- [ ] Commit `feat: add resumable student learning and evidence submission UI`.

## Task 8: Verify the complete school browser surface and document operation

**Files:** browser school fixture/spec/config, Makefile, README, CI only as required to run both browser surfaces.

- [ ] Keep studio tests on their existing loopback command. Add a separate Playwright project for school UI so `/api/app` mode and authentication are exercised on the actual school server, not mocked routes.
- [ ] School test setup creates a uniquely named PostgreSQL database using the existing isolation conventions, bootstraps two schools with separate teacher/student accounts and two classes in the first school, then starts the real server on a distinct loopback port with development-only insecure cookies. Teardown closes servers/connections and drops only its generated database, including on failure. Never truncate the development database or store real passwords in source.
- [ ] Browser fixture must not assume production records. Use unique test emails and generated development passwords supplied to browser fixture through process environment or a temporary permission-restricted file removed during teardown. Never print passwords in test reports.
- [ ] Run these commands from the courseware repository:

```sh
make db-up
COURSEWARE_DATABASE_URL='postgres://courseware:courseware-dev-only@127.0.0.1:55433/courseware?sslmode=disable' go test ./... -count=1
COURSEWARE_DATABASE_URL='postgres://courseware:courseware-dev-only@127.0.0.1:55433/courseware?sslmode=disable' go test -race ./internal/database ./internal/school -count=1
make test
```

Expected: all database/domain/API tests pass; all existing 14 studio scenarios pass; new real-school browser scenarios pass. Record actual counts, never predict an unexecuted pass count.

- [ ] Manually exercise the actual browser at desktop and 390-pixel width: teacher login/create/save/preview/publish/rubric/assign; student wrong answer/reload/continue/evidence/complete/explicit submit; teacher score/feedback; student feedback/resubmission. Inspect screenshots, keyboard focus, live errors/status, overflow, and console errors. Confirm Reset preview does not reset student work.
- [ ] Inspect PostgreSQL after retried browser commands: one response per command, one completion event, one submission per submit command, one assessment per assessment command. Concurrent stale requests preserve the winning state. Confirm older course/rubric/submission/assessment records retain their previous content.
- [ ] README must replace the school API-only limitation with actual web entrypoint, bootstrap/login instructions, legacy rubric configuration, author/save/publish distinction, preview ephemerality, resume/submit distinction, conflict behavior, reviewer history, and the remaining deployment/journal scope. No claim of scientific review, private journal integration, production readiness, or automated evidence grading.
- [ ] CI runs real PostgreSQL and both browser projects with existing pinned toolchains. Do not skip school tests when database configuration is missing; fail with a clear prerequisite error.
- [ ] Commit `test: verify teacher and student browser workflows`. Perform final whole-implementation review, resolve actionable findings, rerun affected checks, then offer branch integration options.

## Completion matrix

| Acceptance requirement | Evidence |
| --- | --- |
| Authenticated authoring and publication | Teacher browser create/edit/save/preview/publish; distinct capabilities; API denial tests |
| Class assignment | Explicit published revision + same-school rubric + teacher-member class; retry/no-duplicate tests |
| Shared preview/player | Existing studio scenarios plus school browser using same LessonView and Go evaluator |
| Resumable attempts | Real reload at incorrect, pending continuation, and completed states |
| Server-authoritative progression | Forged step/count/course/next/completion inputs rejected; stale tab tests |
| Intentional selected evidence | Completion creates no submission; unselected evidence absent from teacher detail |
| Version preservation | Later course/rubric/submission changes do not rewrite pinned versions or prior assessments |
| Attributed assessment | Reviewer identity/time and every correction visible; no client-selected reviewer |
| Authorization/privacy | Other school/class/student cannot discover or mutate resources; no journal endpoint |
| Retry and atomicity | Same command replays original response; changed payload conflicts; domain event failure rolls back |
| Accessibility | Actual keyboard, narrow viewport, focus, status/error, and reduced-motion verification |
| Operational boundaries | Local reproducible setup; no production deployment/offline/media claims |

## Review checklist before execution

- No new activity type or journal/media subsystem has been silently added.
- Every resource lookup is scoped before returning replay receipts or object details.
- Every mutation's base version and idempotency semantics are specified.
- Existing migration is untouched; nullable legacy rubric migration has an explicit user-visible resolution.
- All changed exported APIs migrate their callers after LSP reference inspection (fallback search only when no language server is available).
- Tests assert consumer behavior, not source spelling, component wiring, or incidental layout strings.
- Scope covers every item in subsystem 3 of the approved implementation sequence.
