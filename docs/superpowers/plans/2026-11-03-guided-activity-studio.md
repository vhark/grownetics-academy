# Guided Activity Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a working, loopback-only course-authoring studio with schema-driven editing, validated course JSON, deterministic Go evaluation, and a learner-equivalent Svelte preview for explanation, numeric, and evidence activities.

**Architecture:** Create a separate `grownetics-courseware` repository. A Go module owns activity definitions, JSON Schema validation, response evaluation, and lesson-graph transitions; a SvelteKit static application provides teacher editing and the same preview runtime later mounted by school and desktop applications. This plan has no accounts, production server, database, Wails shell, journal sync, gamification, or deployment claim.

**Tech Stack:** Go 1.27.1, `github.com/santhosh-tekuri/jsonschema/v6` 6.0.3, Node.js 25.5.0, SvelteKit 3.1.1, Svelte 5.57.3, Vite 8.3.5, TypeScript 7.0.2, Playwright 1.64.1.

---

## Subsystem sequence

This is the first independently testable plan for the [approved self-hosted courseware specification](../specs/2026-11-03-self-hosted-courseware-design.md). Subsequent plans must each deliver working software:

1. **School server:** PostgreSQL, bootstrap identity, scoped capabilities, immutable course persistence, publication, assignments, and transactional domain events.
2. **Teacher/student web application:** authenticated authoring, class assignment, resumable attempts, evidence submissions, rubrics, and attributed feedback.
3. **Wails journal and desktop:** personal records, media, selective submission, portable export, offline cache/outbox, and conflict handling.
4. **Self-hosted release:** Docker deployment, migrations, backup/restore, upgrade/rollback, accessibility review, and operational documentation.
5. **Later roadmap specifications:** Plant Modeling Studio, gamification/GrowAdventure, citizen science, and institution-requested interoperability adapters.

## Execution boundary

Create the new repository outside the Academy checkout. Do not overwrite an existing owner-provided repository or license; if `grownetics-courseware` already exists, inspect it and reconcile this plan before execution. The existing Academy remains the canonical public curriculum source. The example course below is an explicitly labeled studio fixture, not a new published curriculum module.

Target layout:

```text
grownetics-courseware/
├── cmd/studio/main.go
├── internal/activity/{activity.go,activity_test.go}
├── internal/course/{course.go,course_test.go}
├── internal/course/testdata/vent-course.json
├── internal/studio/{api.go,api_test.go}
├── web/
│   ├── src/lib/{api.ts,types.ts,ActivityFields.svelte,LessonPlayer.svelte}
│   ├── src/routes/{+layout.ts,+page.svelte}
│   ├── src/{app.html,app.css}
│   ├── tests/studio.spec.ts
│   └── {package.json,svelte.config.js,vite.config.ts,tsconfig.json,playwright.config.ts}
├── .github/workflows/ci.yml
├── .gitignore
├── LICENSE.md
├── LICENSES/{MIT.txt,CC-BY-4.0.txt}
├── Makefile
└── README.md
```

### Task 1: Bootstrap the standalone studio

**Files:**
- Create: `go.mod`, `.gitignore`, `Makefile`, `README.md`, `LICENSE.md`, `LICENSES/MIT.txt`, `LICENSES/CC-BY-4.0.txt`
- Create: `web/package.json`, `web/svelte.config.js`, `web/vite.config.ts`, `web/tsconfig.json`
- Create: `internal/course/testdata/vent-course.json`

- [ ] **Step 1: Create the module and documented development boundary**

Create `go.mod`:

```go
module github.com/grownetics/courseware

go 1.27.1

require github.com/santhosh-tekuri/jsonschema/v6 v6.0.3
```

Create `.gitignore`:

```gitignore
.courseware.env
node_modules/
web/node_modules/
web/build/
web/.svelte-kit/
playwright-report/
test-results/
```

Create `README.md`:

````markdown
# Grownetics Courseware

Self-hosted interactive CEA and precision-agriculture courseware. This revision contains the loopback-only guided activity studio; it is not a deployed school service.

## Run

Requires Go 1.27.1 and Node.js 25.5.0.

```sh
npm --prefix web install
npm --prefix web run build
go run ./cmd/studio
```

Open `http://127.0.0.1:4173`. The example is a studio fixture, not published curriculum. The server accepts only loopback connections.

## Verify

```sh
make test
```

Original instructional prose is CC BY 4.0. Original teaching software is MIT within the scope inherited from Grownetics Academy; Grownetics product software licensing is unchanged. Preserve the owner-provided license if this repository already has one.
````

Create `Makefile`:

```make
.PHONY: test build run

build:
	npm --prefix web run build

run: build
	go run ./cmd/studio

test:
	go test ./...
	npm --prefix web test
```

Copy the Academy's exact licensing scope and license texts into the new repository. From the new repository root, run:

```bash
export ACADEMY_REPO="/Users/vincehark/Nextcloud/Projects/Grownetics/Grownetics History of Automation in CEA"
cp "$ACADEMY_REPO/LICENSE.md" LICENSE.md
mkdir -p LICENSES
cp "$ACADEMY_REPO/LICENSES/MIT.txt" "$ACADEMY_REPO/LICENSES/CC-BY-4.0.txt" LICENSES/
```

Expected: `LICENSE.md` preserves the curriculum/teaching-software/product-software boundary and both referenced license texts exist. Do not replace an owner-provided license in an existing repository.

- [ ] **Step 2: Pin the web toolchain**

Create `web/package.json`:

```json
{
  "name": "@grownetics/activity-studio",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite dev --host 127.0.0.1",
    "build": "vite build",
    "test": "npm run build && playwright test"
  },
  "devDependencies": {
    "@playwright/test": "1.64.1",
    "@sveltejs/adapter-static": "4.0.1",
    "@sveltejs/kit": "3.1.1",
    "@sveltejs/vite-plugin-svelte": "7.3.1",
    "svelte": "5.57.3",
    "typescript": "7.0.2",
    "vite": "8.3.5"
  }
}
```

Create `web/svelte.config.js`:

```js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', fallback: 'index.html' })
  }
};
```

Create `web/vite.config.ts`:

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [sveltekit()] });
```

Create `web/tsconfig.json`:

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

- [ ] **Step 3: Add the guided lesson fixture**

Create `internal/course/testdata/vent-course.json`:

```json
{
  "schemaVersion": 1,
  "courseId": "studio-vent-coupling",
  "revision": 1,
  "title": "Studio fixture: one vent, three consequences",
  "firstStep": "predict",
  "steps": [
    {
      "id": "predict",
      "type": "numeric",
      "title": "Predict before you manipulate",
      "body": "Illustrative model only. Inside air starts at 28 °C. Cool outside air is 16 °C. At 40% opening, the simple mixing model replaces 30% of the room air. Predict the resulting temperature.",
      "activity": {
        "prompt": "Predicted air temperature",
        "answer": 24.4,
        "tolerance": 0.05,
        "unit": "°C",
        "hints": [
          "Thirty percent outside air means seventy percent of the original room air remains.",
          "Calculate 0.7 × 28 + 0.3 × 16. This is a teaching balance, not a facility prediction."
        ]
      },
      "transitions": { "correct": "observe", "incorrect": "predict", "invalid": "predict" }
    },
    {
      "id": "observe",
      "type": "explanation",
      "title": "Read the balance, not just the dial",
      "body": "The model gives 24.4 °C. The same vent action also changes moisture and CO₂. A lower temperature does not establish lower humidity in every weather condition, and this linear teaching balance does not establish real-room performance.",
      "activity": null,
      "transitions": { "continue": "reflect" }
    },
    {
      "id": "reflect",
      "type": "evidence",
      "title": "Separate observation from interpretation",
      "body": "Write one observation produced by the model and one limitation that prevents treating it as measured facility evidence.",
      "activity": {
        "prompt": "Observation and limitation",
        "minLength": 40,
        "maxLength": 1200
      },
      "transitions": { "continue": "", "invalid": "reflect" }
    }
  ]
}
```

- [ ] **Step 4: Install and verify the empty baseline**

Run:

```bash
go mod tidy
npm --prefix web install
go test ./...
```

Expected: `go test` reports no Go packages yet; `package-lock.json` exists and no install errors occur.

- [ ] **Step 5: Commit**

```bash
git add go.mod go.sum .gitignore LICENSE.md LICENSES Makefile README.md web internal/course/testdata/vent-course.json
git commit -m "chore: bootstrap guided activity studio"
```

### Task 2: Define and evaluate trusted activities

**Files:**
- Create: `internal/activity/activity.go`
- Test: `internal/activity/activity_test.go`

- [ ] **Step 1: Write failing activity tests**

Create `internal/activity/activity_test.go`:

```go
package activity

import (
    "strings"
    "testing"
)

func TestNumericOutcomeAndHint(t *testing.T) {
    config := []byte(`{"prompt":"Temperature","answer":24.4,"tolerance":0.05,"unit":"°C","hints":["Use the balance","Multiply"]}`)
    value := 20.0
    got, err := Evaluate("numeric", config, Response{Number: &value}, 0)
    if err != nil { t.Fatal(err) }
    if got.Kind != "incorrect" || got.Hint != "Use the balance" { t.Fatalf("unexpected outcome: %+v", got) }
    value = 24.4
    got, err = Evaluate("numeric", config, Response{Number: &value}, 1)
    if err != nil { t.Fatal(err) }
    if got.Kind != "correct" || got.Feedback == "" { t.Fatalf("unexpected outcome: %+v", got) }
}

func TestEvidenceRequiresMeasurableReflection(t *testing.T) {
    config := []byte(`{"prompt":"Explain","minLength":40,"maxLength":100}`)
    got, err := Evaluate("evidence", config, Response{Text: "Too short"}, 0)
    if err != nil { t.Fatal(err) }
    if got.Kind != "invalid" { t.Fatalf("kind = %q", got.Kind) }
    got, err = Evaluate("evidence", config, Response{Text: strings.Repeat("evidence ", 8)}, 1)
    if err != nil { t.Fatal(err) }
    if got.Kind != "continue" { t.Fatalf("kind = %q", got.Kind) }
}

func TestRejectsUnknownAndInvalidConfigurations(t *testing.T) {
    if _, err := Evaluate("javascript", []byte(`{}`), Response{}, 0); err == nil { t.Fatal("expected unknown activity error") }
    if _, err := Evaluate("numeric", []byte(`{"answer":1}`), Response{}, 0); err == nil { t.Fatal("expected schema error") }
    config := []byte(`{"prompt":"Temperature","answer":24.4,"tolerance":0.05,"unit":"°C","hints":["Use the balance"]}`)
    if _, err := Evaluate("numeric", append(config, []byte(`{}`)...), Response{}, 0); err == nil { t.Fatal("expected trailing-JSON error") }
}
```

- [ ] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/activity`
Expected: FAIL because `activity.go` does not define `Response` or `Evaluate`.

- [ ] **Step 3: Implement definitions, JSON Schema validation, and evaluation**

Create `internal/activity/activity.go`:

```go
package activity

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "math"
    "strings"
    "sync"
    "unicode/utf8"

    "github.com/santhosh-tekuri/jsonschema/v6"
)

type Field struct {
    Key   string `json:"key"`
    Label string `json:"label"`
    Kind  string `json:"kind"`
}

type Definition struct {
    Type   string          `json:"type"`
    Label  string          `json:"label"`
    Schema json.RawMessage `json:"schema"`
    Fields []Field         `json:"fields"`
}

type Response struct {
    Number *float64 `json:"number,omitempty"`
    Text   string   `json:"text,omitempty"`
}

type Outcome struct {
    Kind     string `json:"kind"`
    Feedback string `json:"feedback"`
    Hint     string `json:"hint,omitempty"`
}

var numericSchema = json.RawMessage(`{"type":"object","additionalProperties":false,"required":["prompt","answer","tolerance","unit","hints"],"properties":{"prompt":{"type":"string","minLength":1,"maxLength":500},"answer":{"type":"number"},"tolerance":{"type":"number","minimum":0},"unit":{"type":"string","minLength":1,"maxLength":30},"hints":{"type":"array","minItems":1,"maxItems":5,"items":{"type":"string","minLength":1,"maxLength":500}}}}`)
var evidenceSchema = json.RawMessage(`{"type":"object","additionalProperties":false,"required":["prompt","minLength","maxLength"],"properties":{"prompt":{"type":"string","minLength":1,"maxLength":500},"minLength":{"type":"integer","minimum":1,"maximum":4000},"maxLength":{"type":"integer","minimum":1,"maximum":10000}}}`)

func Definitions() []Definition {
    return []Definition{
        {Type: "explanation", Label: "Explanation", Schema: json.RawMessage(`{"type":"null"}`), Fields: []Field{}},
        {Type: "numeric", Label: "Numeric response", Schema: numericSchema, Fields: []Field{{"prompt", "Prompt", "text"}, {"answer", "Expected answer", "number"}, {"tolerance", "Tolerance", "number"}, {"unit", "Unit", "text"}, {"hints", "Hints (one per line)", "string_list"}}},
        {Type: "evidence", Label: "Evidence and reflection", Schema: evidenceSchema, Fields: []Field{{"prompt", "Prompt", "text"}, {"minLength", "Minimum characters", "number"}, {"maxLength", "Maximum characters", "number"}}},
    }
}

var (
    schemaOnce sync.Once
    schemas    map[string]*jsonschema.Schema
    schemaErr  error
)

func compiledSchemas() (map[string]*jsonschema.Schema, error) {
    schemaOnce.Do(func() {
        schemas = map[string]*jsonschema.Schema{}
        for _, definition := range Definitions() {
            compiler := jsonschema.NewCompiler()
            name := definition.Type + ".schema.json"
            if err := compiler.AddResource(name, bytes.NewReader(definition.Schema)); err != nil { schemaErr = err; return }
            schemas[definition.Type], schemaErr = compiler.Compile(name)
            if schemaErr != nil { return }
        }
    })
    return schemas, schemaErr
}

func Validate(kind string, config json.RawMessage) error {
    if kind == "explanation" {
        if len(config) == 0 || bytes.Equal(config, []byte("null")) { return nil }
        return errors.New("explanation activity must be null")
    }
    registry, err := compiledSchemas()
    if err != nil { return err }
    schema, ok := registry[kind]
    if !ok { return fmt.Errorf("unsupported activity type %q", kind) }
    decoder := json.NewDecoder(bytes.NewReader(config))
    decoder.UseNumber()
    var value any
    if err := decoder.Decode(&value); err != nil { return fmt.Errorf("decode activity: %w", err) }
    if err := decoder.Decode(&struct{}{}); err != io.EOF { return errors.New("activity contains multiple JSON values") }
    if err := schema.Validate(value); err != nil { return fmt.Errorf("validate %s activity: %w", kind, err) }
    if kind == "evidence" {
        var cfg struct{ MinLength, MaxLength int }
        if err := json.Unmarshal(config, &cfg); err != nil { return err }
        if cfg.MaxLength < cfg.MinLength { return errors.New("maxLength must be at least minLength") }
    }
    return nil
}

func Evaluate(kind string, config json.RawMessage, response Response, previousAttempts int) (Outcome, error) {
    if previousAttempts < 0 { return Outcome{}, errors.New("previousAttempts cannot be negative") }
    if err := Validate(kind, config); err != nil { return Outcome{}, err }
    switch kind {
    case "explanation":
        return Outcome{Kind: "continue"}, nil
    case "numeric":
        var cfg struct {
            Answer, Tolerance float64
            Hints []string
        }
        if err := json.Unmarshal(config, &cfg); err != nil { return Outcome{}, err }
        if response.Number == nil || math.IsNaN(*response.Number) || math.IsInf(*response.Number, 0) {
            return Outcome{Kind: "invalid", Feedback: "Enter a finite number with the requested unit."}, nil
        }
        if math.Abs(*response.Number-cfg.Answer) <= cfg.Tolerance {
            return Outcome{Kind: "correct", Feedback: "Correct. Continue to compare the result with the model's limits."}, nil
        }
        index := previousAttempts
        if index >= len(cfg.Hints) { index = len(cfg.Hints) - 1 }
        return Outcome{Kind: "incorrect", Feedback: "Not yet. Check your assumptions and try again.", Hint: cfg.Hints[index]}, nil
    case "evidence":
        var cfg struct{ MinLength, MaxLength int }
        if err := json.Unmarshal(config, &cfg); err != nil { return Outcome{}, err }
        length := utf8.RuneCountInString(strings.TrimSpace(response.Text))
        if length < cfg.MinLength || length > cfg.MaxLength {
            return Outcome{Kind: "invalid", Feedback: fmt.Sprintf("Write between %d and %d characters.", cfg.MinLength, cfg.MaxLength)}, nil
        }
        return Outcome{Kind: "continue", Feedback: "Reflection recorded in this preview. Publishing and submission are later subsystem work."}, nil
    default:
        return Outcome{}, fmt.Errorf("unsupported activity type %q", kind)
    }
}
```

- [ ] **Step 4: Run activity tests**

Run: `go test ./internal/activity`
Expected: PASS, including invalid configurations and both response types.

- [ ] **Step 5: Commit**

```bash
git add internal/activity
git commit -m "feat: add declarative guided activities"
```

### Task 3: Validate lesson graphs and apply transitions

**Files:**
- Create: `internal/course/course.go`
- Test: `internal/course/course_test.go`

- [ ] **Step 1: Write failing graph tests**

Create `internal/course/course_test.go`:

```go
package course

import (
    _ "embed"
    "encoding/json"
    "testing"

    "github.com/grownetics/courseware/internal/activity"
)

//go:embed testdata/vent-course.json
var fixture []byte

func TestFixtureValidatesAndProgresses(t *testing.T) {
    c, err := Parse(fixture)
    if err != nil { t.Fatal(err) }
    value := 20.0
    outcome, err := c.Evaluate("predict", activity.Response{Number: &value}, 0)
    if err != nil { t.Fatal(err) }
    if outcome.NextStep != "predict" || outcome.Completed { t.Fatalf("unexpected retry: %+v", outcome) }
    value = 24.4
    outcome, err = c.Evaluate("predict", activity.Response{Number: &value}, 1)
    if err != nil { t.Fatal(err) }
    if outcome.NextStep != "observe" { t.Fatalf("next = %q", outcome.NextStep) }
    outcome, err = c.Evaluate("observe", activity.Response{}, 0)
    if err != nil { t.Fatal(err) }
    if outcome.NextStep != "reflect" { t.Fatalf("next = %q", outcome.NextStep) }
    outcome, err = c.Evaluate("reflect", activity.Response{Text: "The model cools the air, but it is not a measured facility result."}, 0)
    if err != nil { t.Fatal(err) }
    if !outcome.Completed { t.Fatalf("expected completion: %+v", outcome) }
}

func TestRejectsMissingTransitionTarget(t *testing.T) {
    var broken map[string]any
    if err := json.Unmarshal(fixture, &broken); err != nil { t.Fatal(err) }
    steps := broken["steps"].([]any)
    steps[0].(map[string]any)["transitions"] = map[string]any{"correct": "missing", "incorrect": "predict", "invalid": "predict"}
    raw, _ := json.Marshal(broken)
    if _, err := Parse(raw); err == nil { t.Fatal("expected missing-target error") }
}

func TestRejectsUnexpectedTransition(t *testing.T) {
    var broken map[string]any
    if err := json.Unmarshal(fixture, &broken); err != nil { t.Fatal(err) }
    steps := broken["steps"].([]any)
    steps[0].(map[string]any)["transitions"] = map[string]any{"correct": "observe", "incorrect": "predict", "invalid": "predict", "extra": "observe"}
    raw, _ := json.Marshal(broken)
    if _, err := Parse(raw); err == nil { t.Fatal("expected unexpected-transition error") }
}

func TestRejectsTrailingJSON(t *testing.T) {
    raw := append(append([]byte{}, fixture...), []byte(`{}`)...)
    if _, err := Parse(raw); err == nil { t.Fatal("expected trailing-JSON error") }
}
```

- [ ] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/course`
Expected: FAIL because `Parse` and `Evaluate` are undefined.

- [ ] **Step 3: Implement course parsing and deterministic progression**

Create `internal/course/course.go`:

```go
package course

import (
    "bytes"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "regexp"
    "strings"

    "github.com/grownetics/courseware/internal/activity"
)

type Step struct {
    ID          string            `json:"id"`
    Type        string            `json:"type"`
    Title       string            `json:"title"`
    Body        string            `json:"body"`
    Activity    json.RawMessage   `json:"activity"`
    Transitions map[string]string `json:"transitions"`
}

type Course struct {
    SchemaVersion int    `json:"schemaVersion"`
    CourseID      string `json:"courseId"`
    Revision      int    `json:"revision"`
    Title         string `json:"title"`
    FirstStep     string `json:"firstStep"`
    Steps         []Step `json:"steps"`
}

type Result struct {
    activity.Outcome
    NextStep  string `json:"nextStep"`
    Completed bool   `json:"completed"`
}

var idPattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{0,79}$`)

func Parse(raw []byte) (Course, error) {
    decoder := json.NewDecoder(bytes.NewReader(raw))
    decoder.DisallowUnknownFields()
    var c Course
    if err := decoder.Decode(&c); err != nil { return Course{}, fmt.Errorf("decode course: %w", err) }
    if err := decoder.Decode(&struct{}{}); err != io.EOF { return Course{}, errors.New("course contains multiple JSON values") }
    if err := c.Validate(); err != nil { return Course{}, err }
    return c, nil
}

func (c Course) Validate() error {
    if c.SchemaVersion != 1 { return errors.New("schemaVersion must be 1") }
    if !idPattern.MatchString(c.CourseID) { return errors.New("invalid courseId") }
    if c.Revision < 1 { return errors.New("revision must be positive") }
    if strings.TrimSpace(c.Title) == "" { return errors.New("title is required") }
    if len(c.Steps) == 0 || len(c.Steps) > 50 { return errors.New("course must contain 1 to 50 steps") }
    steps := map[string]Step{}
    for _, step := range c.Steps {
        if !idPattern.MatchString(step.ID) { return fmt.Errorf("invalid step ID %q", step.ID) }
        if _, exists := steps[step.ID]; exists { return fmt.Errorf("duplicate step ID %q", step.ID) }
        if strings.TrimSpace(step.Title) == "" || strings.TrimSpace(step.Body) == "" { return fmt.Errorf("step %s requires title and body", step.ID) }
        if err := activity.Validate(step.Type, step.Activity); err != nil { return fmt.Errorf("step %s: %w", step.ID, err) }
        steps[step.ID] = step
    }
    if _, ok := steps[c.FirstStep]; !ok { return errors.New("firstStep does not exist") }
    for _, step := range c.Steps {
        required := []string{"continue"}
        if step.Type == "numeric" { required = []string{"correct", "incorrect", "invalid"} }
        if step.Type == "evidence" { required = []string{"continue", "invalid"} }
        if len(step.Transitions) != len(required) { return fmt.Errorf("step %s has missing or unexpected transitions", step.ID) }
        for _, outcome := range required {
            target, ok := step.Transitions[outcome]
            if !ok { return fmt.Errorf("step %s lacks %s transition", step.ID, outcome) }
            if target == "" && (outcome == "incorrect" || outcome == "invalid") { return fmt.Errorf("step %s cannot terminate on %s", step.ID, outcome) }
            if target != "" {
                if _, ok := steps[target]; !ok { return fmt.Errorf("step %s targets missing step %s", step.ID, target) }
            }
        }
    }
    reachable := map[string]bool{}
    var visit func(string)
    visit = func(id string) {
        if id == "" || reachable[id] { return }
        reachable[id] = true
        for _, target := range steps[id].Transitions { visit(target) }
    }
    visit(c.FirstStep)
    if len(reachable) != len(steps) { return errors.New("course contains unreachable steps") }
    return nil
}

func (c Course) Evaluate(stepID string, response activity.Response, previousAttempts int) (Result, error) {
    var selected *Step
    for index := range c.Steps {
        if c.Steps[index].ID == stepID { selected = &c.Steps[index]; break }
    }
    if selected == nil { return Result{}, fmt.Errorf("unknown step %q", stepID) }
    outcome, err := activity.Evaluate(selected.Type, selected.Activity, response, previousAttempts)
    if err != nil { return Result{}, err }
    next, ok := selected.Transitions[outcome.Kind]
    if !ok { return Result{}, fmt.Errorf("step %s lacks %s transition", stepID, outcome.Kind) }
    return Result{Outcome: outcome, NextStep: next, Completed: next == ""}, nil
}
```

- [ ] **Step 4: Run graph tests**

Run: `go test ./internal/course`
Expected: PASS for the complete fixture path and missing-target rejection.

- [ ] **Step 5: Commit**

```bash
git add internal/course
git commit -m "feat: validate and run guided lesson graphs"
```

### Task 4: Expose a loopback-only studio API

**Files:**
- Create: `internal/studio/api.go`
- Test: `internal/studio/api_test.go`
- Create: `cmd/studio/main.go`, `cmd/studio/main_test.go`

- [ ] **Step 1: Write failing API tests**

Create `internal/studio/api_test.go`:

```go
package studio

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "os"
    "testing"
)

func TestDefinitionsAndEvaluation(t *testing.T) {
    raw, err := os.ReadFile("../course/testdata/vent-course.json")
    if err != nil { t.Fatal(err) }
    api := NewAPI(raw)
    request := httptest.NewRequest(http.MethodGet, "/api/definitions", nil)
    response := httptest.NewRecorder()
    api.ServeHTTP(response, request)
    if response.Code != http.StatusOK { t.Fatalf("definitions status = %d", response.Code) }
    var payload map[string]any
    payload["course"] = json.RawMessage(raw)
    payload["stepId"] = "predict"
    payload["attempts"] = 0
    payload["response"] = map[string]any{"number": 24.4}
    body, _ := json.Marshal(payload)
    request = httptest.NewRequest(http.MethodPost, "/api/evaluate", bytes.NewReader(body))
    response = httptest.NewRecorder()
    api.ServeHTTP(response, request)
    if response.Code != http.StatusOK { t.Fatalf("evaluate status = %d: %s", response.Code, response.Body.String()) }
    if !bytes.Contains(response.Body.Bytes(), []byte(`"nextStep":"observe"`)) { t.Fatalf("unexpected result: %s", response.Body.String()) }
}

func TestRejectsInvalidCourse(t *testing.T) {
    api := NewAPI([]byte(`{}`))
    request := httptest.NewRequest(http.MethodPost, "/api/validate", bytes.NewBufferString(`{}`))
    response := httptest.NewRecorder()
    api.ServeHTTP(response, request)
    if response.Code != http.StatusBadRequest { t.Fatalf("status = %d", response.Code) }
}

func TestRejectsTrailingRequestJSON(t *testing.T) {
    api := NewAPI([]byte(`{}`))
    request := httptest.NewRequest(http.MethodPost, "/api/validate", bytes.NewBufferString(`{} {}`))
    response := httptest.NewRecorder()
    api.ServeHTTP(response, request)
    if response.Code != http.StatusBadRequest { t.Fatalf("status = %d", response.Code) }
}
```

- [ ] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/studio`
Expected: FAIL because `NewAPI` is undefined.

- [ ] **Step 3: Implement the API and loopback entry point**

Create `internal/studio/api.go`:

```go
package studio

import (
    "encoding/json"
    "errors"
    "io"
    "net/http"

    "github.com/grownetics/courseware/internal/activity"
    "github.com/grownetics/courseware/internal/course"
)

type API struct { example json.RawMessage }

func NewAPI(example json.RawMessage) http.Handler {
    api := &API{example: example}
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/definitions", api.definitions)
    mux.HandleFunc("GET /api/example-course", api.exampleCourse)
    mux.HandleFunc("POST /api/validate", api.validate)
    mux.HandleFunc("POST /api/evaluate", api.evaluate)
    return mux
}

func writeJSON(w http.ResponseWriter, status int, value any) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(value)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
    r.Body = http.MaxBytesReader(w, r.Body, 2<<20)
    decoder := json.NewDecoder(r.Body)
    decoder.DisallowUnknownFields()
    if err := decoder.Decode(destination); err != nil { return err }
    if err := decoder.Decode(&struct{}{}); err != io.EOF { return errors.New("request contains multiple JSON values") }
    return nil
}

func (a *API) definitions(w http.ResponseWriter, _ *http.Request) {
    writeJSON(w, http.StatusOK, activity.Definitions())
}

func (a *API) exampleCourse(w http.ResponseWriter, _ *http.Request) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    _, _ = w.Write(a.example)
}

func (a *API) validate(w http.ResponseWriter, r *http.Request) {
    var raw json.RawMessage
    if err := decodeJSON(w, r, &raw); err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    if _, err := course.Parse(raw); err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    writeJSON(w, http.StatusOK, map[string]bool{"valid": true})
}

func (a *API) evaluate(w http.ResponseWriter, r *http.Request) {
    var input struct {
        Course   json.RawMessage   `json:"course"`
        StepID   string            `json:"stepId"`
        Response activity.Response `json:"response"`
        Attempts int               `json:"attempts"`
    }
    if err := decodeJSON(w, r, &input); err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    if input.Attempts < 0 || input.Attempts > 10000 { writeJSON(w, http.StatusBadRequest, map[string]string{"error": "attempts out of range"}); return }
    parsed, err := course.Parse(input.Course)
    if err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    result, err := parsed.Evaluate(input.StepID, input.Response, input.Attempts)
    if err != nil { writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    writeJSON(w, http.StatusOK, result)
}
```

Create `cmd/studio/main.go`:

```go
package main

import (
    "flag"
    "log"
    "net"
    "net/http"
    "os"
    "strings"
    "time"

    "github.com/grownetics/courseware/internal/studio"
)

func isLoopbackAddress(address string) bool {
    host, _, err := net.SplitHostPort(address)
    if err != nil { return false }
    if host == "localhost" { return true }
    ip := net.ParseIP(host)
    return ip != nil && ip.IsLoopback()
}

func main() {
    address := flag.String("listen", "127.0.0.1:4173", "loopback listen address")
    example := flag.String("course", "internal/course/testdata/vent-course.json", "example course JSON")
    webDir := flag.String("web", "web/build", "built Svelte application")
    flag.Parse()
    if !isLoopbackAddress(*address) { log.Fatal("studio requires a loopback listen address") }
    raw, err := os.ReadFile(*example)
    if err != nil { log.Fatal(err) }
    mux := http.NewServeMux()
    mux.Handle("/api/", studio.NewAPI(raw))
    files := http.FileServer(http.Dir(*webDir))
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        path := *webDir + r.URL.Path
        if r.URL.Path != "/" && !strings.Contains(path, "..") {
            if _, err := os.Stat(path); err == nil { files.ServeHTTP(w, r); return }
        }
        http.ServeFile(w, r, *webDir+"/index.html")
    })
    server := &http.Server{Addr: *address, Handler: mux, ReadHeaderTimeout: 5 * time.Second, IdleTimeout: 60 * time.Second}
    log.Printf("Guided Activity Studio: http://%s", *address)
    log.Fatal(server.ListenAndServe())
}
```

Create `cmd/studio/main_test.go`:

```go
package main

import "testing"

func TestLoopbackAddressValidation(t *testing.T) {
    tests := map[string]bool{
        "127.0.0.1:4173": true,
        "localhost:4173": true,
        "[::1]:4173": true,
        "0.0.0.0:4173": false,
        "example.com:4173": false,
        ":4173": false,
    }
    for address, expected := range tests {
        if got := isLoopbackAddress(address); got != expected { t.Errorf("isLoopbackAddress(%q) = %v, want %v", address, got, expected) }
    }
}
```

- [ ] **Step 4: Run API tests**

Run: `go test ./internal/studio ./cmd/studio`
Expected: PASS for definitions, evaluation, invalid-course rejection, and loopback-only listener validation.

- [ ] **Step 5: Commit**

```bash
git add cmd internal/studio
git commit -m "feat: serve guided activity studio API"
```

### Task 5: Build the schema-driven author and learner preview

**Files:**
- Create: `web/src/app.html`, `web/src/app.css`, `web/src/routes/+layout.ts`
- Create: `web/src/lib/types.ts`, `web/src/lib/api.ts`
- Create: `web/src/lib/ActivityFields.svelte`, `web/src/lib/LessonPlayer.svelte`
- Create: `web/src/routes/+page.svelte`

- [ ] **Step 1: Define shared API types and static rendering**

Create `web/src/app.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Grownetics Guided Activity Studio</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

Create `web/src/routes/+layout.ts`:

```ts
export const ssr = false;
export const prerender = true;
```

Create `web/src/lib/types.ts`:

```ts
export type Field = { key: string; label: string; kind: 'text' | 'number' | 'string_list' };
export type Definition = { type: string; label: string; fields: Field[] };
export type Step = {
  id: string;
  type: 'explanation' | 'numeric' | 'evidence';
  title: string;
  body: string;
  activity: Record<string, any> | null;
  transitions: Record<string, string>;
};
export type Course = {
  schemaVersion: number;
  courseId: string;
  revision: number;
  title: string;
  firstStep: string;
  steps: Step[];
};
export type Outcome = {
  kind: string;
  feedback: string;
  hint?: string;
  nextStep: string;
  completed: boolean;
};
```

Create `web/src/lib/api.ts`:

```ts
import type { Course, Definition, Outcome } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body as T;
}

export const getDefinitions = () => request<Definition[]>('/api/definitions');
export const getExampleCourse = () => request<Course>('/api/example-course');
export const validateCourse = (course: Course) => request<{ valid: boolean }>('/api/validate', { method: 'POST', body: JSON.stringify(course) });
export const evaluate = (course: Course, stepId: string, response: unknown, attempts: number) => request<Outcome>('/api/evaluate', {
  method: 'POST',
  body: JSON.stringify({ course, stepId, response, attempts })
});
```

- [ ] **Step 2: Generate activity fields from definitions**

Create `web/src/lib/ActivityFields.svelte`:

```svelte
<script lang="ts">
  import type { Field } from './types';
  let { fields, values }: { fields: Field[]; values: Record<string, any> } = $props();

  function update(field: Field, event: Event) {
    const input = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    if (field.kind === 'number') values[field.key] = (input as HTMLInputElement).valueAsNumber;
    else if (field.kind === 'string_list') values[field.key] = input.value.split('\n').map((item) => item.trim()).filter(Boolean);
    else values[field.key] = input.value;
  }

  function text(field: Field): string {
    const value = values[field.key];
    return field.kind === 'string_list' && Array.isArray(value) ? value.join('\n') : String(value ?? '');
  }
</script>

{#each fields as field (field.key)}
  <label>
    <span>{field.label}</span>
    {#if field.kind === 'string_list'}
      <textarea rows="3" value={text(field)} oninput={(event) => update(field, event)}></textarea>
    {:else}
      <input type={field.kind === 'number' ? 'number' : 'text'} step="any" value={text(field)} oninput={(event) => update(field, event)} />
    {/if}
  </label>
{/each}
```

- [ ] **Step 3: Implement the shared lesson player**

Create `web/src/lib/LessonPlayer.svelte`:

```svelte
<script lang="ts">
  import { evaluate } from './api';
  import type { Course, Outcome } from './types';

  let { course }: { course: Course } = $props();
  let currentId = $state(course.firstStep);
  let attempts = $state(0);
  let numberValue = $state<number | null>(null);
  let textValue = $state('');
  let outcome = $state<Outcome | null>(null);
  let error = $state('');
  let busy = $state(false);
  let step = $derived(course.steps.find((candidate) => candidate.id === currentId)!);

  async function submit() {
    busy = true;
    error = '';
    try {
      const response = step.type === 'numeric' ? { number: numberValue } : { text: textValue };
      outcome = await evaluate(course, currentId, response, attempts);
      attempts += 1;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    } finally {
      busy = false;
    }
  }

  function advance() {
    if (!outcome) return;
    currentId = outcome.nextStep;
    outcome = null;
    attempts = 0;
    numberValue = null;
    textValue = '';
  }

  function reset() {
    currentId = course.firstStep;
    outcome = null;
    attempts = 0;
    numberValue = null;
    textValue = '';
    error = '';
  }
</script>

<section class="player" aria-labelledby="player-title">
  <div class="player-heading">
    <h2 id="player-title">Learner preview</h2>
    <button type="button" onclick={reset}>Reset preview</button>
  </div>
  {#if outcome?.completed}
    <h3>Lesson complete</h3>
    <p role="status">{outcome.feedback}</p>
  {:else}
    <article>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      {#if step.type === 'numeric'}
        <label>Your answer ({step.activity?.unit})
          <input type="number" step="any" bind:value={numberValue} />
        </label>
      {:else if step.type === 'evidence'}
        <label>{step.activity?.prompt}
          <textarea rows="6" maxlength={step.activity?.maxLength} bind:value={textValue}></textarea>
        </label>
      {/if}
      {#if outcome}
        <p role="status">{outcome.feedback}</p>
        {#if outcome.hint}<p class="hint"><strong>Hint:</strong> {outcome.hint}</p>{/if}
        {#if outcome.kind === 'correct' || outcome.kind === 'continue'}
          <button type="button" onclick={advance}>Continue</button>
        {:else}
          <button type="button" disabled={busy} onclick={submit}>Try again</button>
        {/if}
      {:else}
        <button type="button" disabled={busy} onclick={submit}>{step.type === 'explanation' ? 'Continue' : 'Check response'}</button>
      {/if}
      {#if error}<p role="alert">{error}</p>{/if}
    </article>
  {/if}
</section>
```

- [ ] **Step 4: Implement editing, validation, import, and export**

Create `web/src/routes/+page.svelte`:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import ActivityFields from '$lib/ActivityFields.svelte';
  import LessonPlayer from '$lib/LessonPlayer.svelte';
  import { getDefinitions, getExampleCourse, validateCourse } from '$lib/api';
  import type { Course, Definition, Step } from '$lib/types';

  let definitions = $state<Definition[]>([]);
  let course = $state<Course | null>(null);
  let previewKey = $state(0);
  let status = $state('');
  let error = $state('');

  onMount(async () => {
    try {
      [definitions, course] = await Promise.all([getDefinitions(), getExampleCourse()]);
    } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
  });

  const transitionKinds = (type: string) => type === 'numeric' ? ['correct', 'incorrect', 'invalid'] : type === 'evidence' ? ['continue', 'invalid'] : ['continue'];

  function addStep(type: Step['type']) {
    if (!course) return;
    const id = `step-${course.steps.length + 1}`;
    const activity = type === 'numeric'
      ? { prompt: 'New numeric prompt', answer: 0, tolerance: 0, unit: 'unit', hints: ['First hint'] }
      : type === 'evidence' ? { prompt: 'Explain your evidence', minLength: 40, maxLength: 1200 } : null;
    const transitions = type === 'numeric' ? { correct: '', incorrect: id, invalid: id } : type === 'evidence' ? { continue: '', invalid: id } : { continue: '' };
    course.steps.push({ id, type, title: 'New step', body: 'Author the step content.', activity, transitions });
  }

  async function validate() {
    if (!course) return;
    status = ''; error = '';
    try { await validateCourse(course); status = 'Course JSON and lesson graph are valid.'; previewKey += 1; }
    catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
  }

  function exportCourse() {
    if (!course) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(course, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${course.courseId}-r${course.revision}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importCourse(event: Event) {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text()) as Course;
      await validateCourse(imported);
      course = imported;
      previewKey += 1;
      status = 'Imported and validated course JSON.';
      error = '';
    } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
  }
</script>

<svelte:head><title>Grownetics Guided Activity Studio</title></svelte:head>
<main>
  <header><p class="eyebrow">LOOPBACK AUTHORING STUDIO</p><h1>Guided Activity Studio</h1><p>Declarative content. Deterministic evaluation. Learner-equivalent preview.</p></header>
  {#if error}<p role="alert">{error}</p>{/if}
  {#if status}<p role="status">{status}</p>{/if}
  {#if course}
    <section class="editor" aria-labelledby="editor-title">
      <h2 id="editor-title">Course editor</h2>
      <label>Course title <input bind:value={course.title} /></label>
      <label>First step
        <select bind:value={course.firstStep}>{#each course.steps as step (step.id)}<option value={step.id}>{step.id}</option>{/each}</select>
      </label>
      {#each course.steps as step, index (step.id)}
        <fieldset>
          <legend>Step {index + 1}: {step.type}</legend>
          <label>Step ID <input bind:value={step.id} /></label>
          <label>Title <input bind:value={step.title} /></label>
          <label>Body <textarea rows="4" bind:value={step.body}></textarea></label>
          {#if step.activity}
            <ActivityFields fields={definitions.find((definition) => definition.type === step.type)?.fields ?? []} values={step.activity} />
          {/if}
          {#each transitionKinds(step.type) as kind (kind)}
            <label>Next step on {kind} (blank completes)
              <input bind:value={step.transitions[kind]} />
            </label>
          {/each}
        </fieldset>
      {/each}
      <div class="actions">
        <button type="button" onclick={() => addStep('explanation')}>Add explanation</button>
        <button type="button" onclick={() => addStep('numeric')}>Add numeric</button>
        <button type="button" onclick={() => addStep('evidence')}>Add evidence</button>
        <button type="button" onclick={validate}>Validate and refresh preview</button>
        <button type="button" onclick={exportCourse}>Export JSON</button>
        <label class="import">Import JSON <input type="file" accept="application/json" onchange={importCourse} /></label>
      </div>
    </section>
    {#key previewKey}<LessonPlayer {course} />{/key}
  {:else if !error}<p>Loading studio…</p>{/if}
</main>
```

- [ ] **Step 5: Add accessible, responsive styling**

Create `web/src/app.css`:

```css
:root { font-family: 'DM Sans', system-ui, sans-serif; color: #243128; background: #f4f1e8; line-height: 1.5; }
* { box-sizing: border-box; }
body { margin: 0; }
main { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 4rem; }
header, section { background: #fffdf7; border: 1px solid #d7d2c2; border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem; }
h1, h2, h3 { font-family: Lora, Georgia, serif; line-height: 1.2; }
.eyebrow { color: #6a745f; font-size: 0.75rem; letter-spacing: 0.12em; }
.editor { display: grid; gap: 1rem; }
fieldset { display: grid; gap: 0.75rem; border: 1px solid #c9c2ae; border-radius: 12px; padding: 1rem; }
label { display: grid; gap: 0.3rem; font-weight: 600; }
input, textarea, select, button { font: inherit; }
input, textarea, select { width: 100%; padding: 0.6rem; border: 1px solid #8c9587; border-radius: 8px; background: white; }
button { padding: 0.65rem 0.9rem; border: 1px solid #365d43; border-radius: 8px; background: #365d43; color: white; cursor: pointer; }
button:disabled { opacity: 0.55; cursor: wait; }
button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid #b85c38; outline-offset: 2px; }
.actions, .player-heading { display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; justify-content: space-between; }
.hint { border-left: 4px solid #b85c38; padding-left: 0.75rem; }
[role='alert'] { background: #fff0ea; color: #8a2e16; padding: 0.75rem; }
[role='status'] { font-weight: 600; }
@media (min-width: 900px) { main { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; align-items: start; } header { grid-column: 1 / -1; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
```

Import the stylesheet by adding this line to the top of the `<script>` block in `web/src/routes/+page.svelte`:

```ts
import '../app.css';
```

- [ ] **Step 6: Build and smoke the actual studio**

Run:

```bash
npm --prefix web run build
go run ./cmd/studio
```

Open `http://127.0.0.1:4173`. Expected: the fixture editor and learner preview render. An incorrect numeric response shows a hint; 24.4 reaches the explanation; continuing reaches evidence; a reflection of at least 40 characters reaches “Lesson complete.” Stop the server after verification.

- [ ] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add schema-driven studio and learner preview"
```

### Task 6: Prove the browser workflow and CI

**Files:**
- Create: `web/playwright.config.ts`, `web/tests/studio.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

- [ ] **Step 1: Write the browser acceptance test**

Create `web/playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 800 } },
  webServer: {
    command: 'go run ./cmd/studio',
    cwd: '..',
    url: 'http://127.0.0.1:4173/api/definitions',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
```

Create `web/tests/studio.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('author preview enforces feedback, progression, and evidence', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Guided Activity Studio' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  await page.getByRole('button', { name: 'Check response' }).click();
  await expect(page.getByText('Enter a finite number with the requested unit.')).toBeVisible();
  await page.getByLabel(/Your answer/).fill('20');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Not yet. Check your assumptions and try again.')).toBeVisible();
  await expect(page.getByText(/Thirty percent outside air/)).toBeVisible();
  await page.getByLabel(/Your answer/).fill('24.4');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText(/Correct. Continue/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Read the balance, not just the dial' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Separate observation from interpretation' })).toBeVisible();
  await page.getByLabel('Observation and limitation').fill('The model cools the air, but this calculation is not a measured facility result.');
  await page.getByRole('button', { name: 'Check response' }).click();
  await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
});

test('course JSON exports and imports without losing the lesson', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Guided Activity Studio' })).toBeVisible();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadEvent;
  const path = await download.path();
  if (!path) throw new Error('browser did not provide the downloaded course');
  await page.getByLabel('Import JSON').setInputFiles(path);
  await expect(page.getByText('Imported and validated course JSON.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
});

test('narrow layout preserves editor and preview without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Course editor' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Learner preview' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
```

- [ ] **Step 2: Run the browser test**

Run:

```bash
npm --prefix web exec -- playwright install chromium
npm --prefix web test
```

Expected: three Chromium tests pass with no failed assertions. If the fixture or selector fails, fix the implementation rather than weakening the assertion.

- [ ] **Step 3: Add CI and final documentation**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.27.1'
      - uses: actions/setup-node@v4
        with:
          node-version: '25.5.0'
          cache: npm
          cache-dependency-path: web/package-lock.json
      - run: npm --prefix web ci
      - run: npm --prefix web exec -- playwright install --with-deps chromium
      - run: make test
```

Append to `README.md`:

```markdown
## Current contracts

- `Course` identifies schema, course, revision, first step, and lesson steps.
- `ActivityDefinition` supplies a trusted type, JSON Schema, and generated editor fields.
- Numeric and evidence responses are evaluated in Go; lesson transitions are content-defined and target-validated.
- The browser editor and preview call the same validation/evaluation API. Preview attempts are ephemeral and are not represented as submitted or assessed coursework.
- The loopback server is a development studio only. School identity, persistence, authorization, deployment, and offline synchronization belong to subsequent subsystem plans.
```

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
go test ./...
npm --prefix web test
git diff --check
```

Expected: all Go tests pass, the browser test passes, and `git diff --check` produces no output.

- [ ] **Step 5: Commit**

```bash
git add web/playwright.config.ts web/tests .github README.md
git commit -m "test: verify guided lesson authoring workflow"
```

## Completion evidence

The plan is complete only when the new repository contains the committed working studio and the engineer has observed:

1. `go test ./...` passing.
2. `npm --prefix web test` passing, including the full incorrect-response → hint → correct-response → explanation → evidence → completion path.
3. The actual studio at `http://127.0.0.1:4173` rendering both editor and preview at desktop and narrow widths.
4. Valid JSON exporting and importing without dropping steps, activities, or transitions.
5. Invalid transition targets and unsupported activity types failing visibly.
6. No listener on a non-loopback address and no claim of accounts, persistence, deployment, assessment, offline sync, or classroom validation.
