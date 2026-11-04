# Guided Activity Studio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver a working, loopback-only course-authoring studio with schema-driven editing, validated course JSON, deterministic Go evaluation, and a learner-equivalent Svelte preview for explanation, numeric, and evidence activities.

**Architecture:** Create a separate `grownetics-courseware` repository. A Go module owns activity definitions, JSON Schema validation, response evaluation, and lesson-graph transitions; a SvelteKit static application provides teacher editing and the same preview runtime later mounted by school and desktop applications. This plan has no accounts, production server, database, Wails shell, journal sync, gamification, or deployment claim.

**Tech Stack:** Go 1.27.1, `github.com/santhosh-tekuri/jsonschema/v6` 6.0.3, Node.js 25.5.0, SvelteKit 3.1.1, Svelte 5.57.3, Vite 8.3.5, TypeScript 6.0.3, Playwright 1.64.1.

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
│   └── {package.json,vite.config.ts,tsconfig.json,playwright.config.ts}
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
- Create: `web/package.json`, `web/vite.config.ts`, `web/tsconfig.json`
- Create: `internal/course/testdata/vent-course.json`

- [x] **Step 1: Create the module and documented development boundary**

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

Self-hosted interactive CEA and precision-agriculture courseware. Task 1 is dependency/bootstrap-only: the application entry point, browser source, and automated tests are added by later implementation tasks. It is not a deployed school service.

## Bootstrap verification

Requires Go 1.27.1 and Node.js 25.5.0. Available in this bootstrap revision:

```sh
go mod download
go mod verify
npm --prefix web install
npm --prefix web ls typescript
```

## Run after implementation is complete

The following commands become usable only after later tasks add the application and tests:

```sh
npm --prefix web run build
go run ./cmd/studio
```

Then open `http://127.0.0.1:4173`. The example is a studio fixture, not published curriculum. The completed server accepts only loopback connections. `make test` likewise becomes meaningful after test packages exist.

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

- [x] **Step 2: Pin the web toolchain**

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

Create `web/vite.config.ts`:

```ts
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit({ adapter: adapter({ pages: 'build', assets: 'build' }) })]
});
```

Create `web/tsconfig.json`:

```json
{
  "extends": "$app/tsconfig",
  "include": ["src", "tests", "*"],
  "exclude": ["src/service-worker"],
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

- [x] **Step 3: Add the guided lesson fixture**

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

- [x] **Step 4: Install and verify the empty baseline**

Run:

```bash
go mod download
npm --prefix web install
go mod verify
npm --prefix web ls typescript
```

Expected: dependency installation succeeds, `go.sum` and `package-lock.json` exist, all downloaded modules verify, and TypeScript 6.0.3 is installed. No `go test` baseline is meaningful until Task 2 creates the first Go package.

- [x] **Step 5: Commit**

```bash
git add go.mod go.sum .gitignore LICENSE.md LICENSES Makefile README.md web internal/course/testdata/vent-course.json
git commit -m "chore: bootstrap guided activity studio"
```

### Task 2: Define and evaluate trusted activities

**Files:**
- Create: `internal/activity/activity.go`
- Test: `internal/activity/activity_test.go`
- Modify as required by the new import graph: `go.mod`, `go.sum`

- [x] **Step 1: Write failing activity tests**

Create `internal/activity/activity_test.go`:

```go
package activity

import (
    "encoding/json"
    "fmt"
    "strings"
    "testing"
)

func TestNumericOutcomeAndHint(t *testing.T) {
    config := []byte(`{"prompt":"Temperature","answer":24.4,"tolerance":0.05,"unit":"°C","hints":["Use the balance","Multiply"]}`)
    got, err := Evaluate("numeric", config, Response{Number: json.Number("20")}, 0)
    if err != nil { t.Fatal(err) }
    if got.Kind != "incorrect" || got.Hint != "Use the balance" { t.Fatalf("unexpected outcome: %+v", got) }
    got, err = Evaluate("numeric", config, Response{Number: json.Number("24.4")}, 1)
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

func TestExplanationRequiresSingleJSONNull(t *testing.T) {
    for _, config := range [][]byte{nil, {}, []byte("null null")} {
        if err := Validate("explanation", config); err == nil { t.Fatalf("expected invalid explanation config %q", config) }
    }
    for _, config := range [][]byte{[]byte("{}"), []byte(`{"value":null}`)} {
        if err := Validate("explanation", config); err == nil { t.Fatalf("expected non-null explanation config %q", config) }
    }
    if err := Validate("explanation", []byte(" null \n")); err != nil { t.Fatalf("valid JSON null rejected: %v", err) }
}

func TestRejectsUnrepresentableNumericConfiguration(t *testing.T) {
    config := []byte(`{"prompt":"Temperature","answer":1e400,"tolerance":0.05,"unit":"°C","hints":["Use the balance"]}`)
    if err := Validate("numeric", config); err == nil { t.Fatal("expected non-finite answer validation error") }
}

func TestEvidenceAcceptsIntegralDecimalAndExponentBounds(t *testing.T) {
    config := []byte(`{"prompt":"Explain","minLength":1.0,"maxLength":1e2}`)
    if err := Validate("evidence", config); err != nil { t.Fatal(err) }
    for _, test := range []struct{ text, kind string }{
        {"a", "continue"}, {strings.Repeat("x", 100), "continue"}, {strings.Repeat("x", 101), "invalid"},
    } {
        got, err := Evaluate("evidence", config, Response{Text: test.text}, 0)
        if err != nil { t.Fatal(err) }
        if got.Kind != test.kind { t.Errorf("length %d: kind = %q, want %q", len(test.text), got.Kind, test.kind) }
    }
    if err := Validate("evidence", []byte(`{"prompt":"Explain","minLength":1.5,"maxLength":100}`)); err == nil { t.Fatal("accepted fractional bound") }
}

func TestNumericToleranceBoundary(t *testing.T) {
    for _, test := range []struct {
        answer, tolerance, response float64
        kind string
    }{
        {0.3, 0.1, 0.4, "correct"},
        {0.3, 0.1, 0.401, "incorrect"},
        {0.3, 0.1, 0.199, "incorrect"},
        {24.4, 0.05, 24.45, "correct"},
        {24.4, 0.05, 24.451, "incorrect"},
        {24.4, 0.05, 24.349, "incorrect"},
        {0.3, 0, 0.3, "correct"},
        {0.3, 0, 0.4, "incorrect"},
        {1e16, 0.1, 1e16 + 2, "incorrect"},
        {1000000000, 0.1, 1000000000.1, "correct"},
        {1000000000, 0.1, 999999999.9, "correct"},
    } {
        config := []byte(fmt.Sprintf(`{"prompt":"Temperature","answer":%g,"tolerance":%g,"unit":"°C","hints":["Try again"]}`, test.answer, test.tolerance))
        got, err := Evaluate("numeric", config, Response{Number: json.Number(fmt.Sprintf("%g", test.response))}, 0)
        if err != nil { t.Fatal(err) }
        if got.Kind != test.kind { t.Errorf("answer %g, tolerance %g, response %g: kind = %q, want %q", test.answer, test.tolerance, test.response, got.Kind, test.kind) }
    }
}
```

- [x] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/activity`
Expected: FAIL because `activity.go` does not define `Response` or `Evaluate`.

- [x] **Step 3: Implement definitions, JSON Schema validation, and evaluation**

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
    "math/big"
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
    Number json.Number `json:"number,omitempty"`
    Text   string      `json:"text,omitempty"`
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
            var schemaDoc any
            if err := json.Unmarshal(definition.Schema, &schemaDoc); err != nil { schemaErr = err; return }
            if err := compiler.AddResource(name, schemaDoc); err != nil { schemaErr = err; return }
            schemas[definition.Type], schemaErr = compiler.Compile(name)
            if schemaErr != nil { return }
        }
    })
    return schemas, schemaErr
}

func Validate(kind string, config json.RawMessage) error {
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
    if kind == "numeric" {
        var cfg struct{ Answer, Tolerance float64 }
        if err := json.Unmarshal(config, &cfg); err != nil { return fmt.Errorf("validate numeric activity values: %w", err) }
        if math.IsNaN(cfg.Answer) || math.IsInf(cfg.Answer, 0) || math.IsNaN(cfg.Tolerance) || math.IsInf(cfg.Tolerance, 0) { return errors.New("numeric answer and tolerance must be finite") }
    }
    if kind == "evidence" {
        _, err := parseEvidenceConfig(config)
        return err
    }
    return nil
}

type evidenceConfig struct {
    MinLength int
    MaxLength int
}

func parseEvidenceConfig(config json.RawMessage) (evidenceConfig, error) {
    var raw struct{ MinLength, MaxLength json.Number }
    if err := json.Unmarshal(config, &raw); err != nil { return evidenceConfig{}, fmt.Errorf("decode evidence activity: %w", err) }
    minLength, err := raw.MinLength.Float64()
    if err != nil { return evidenceConfig{}, fmt.Errorf("decode evidence minLength: %w", err) }
    maxLength, err := raw.MaxLength.Float64()
    if err != nil { return evidenceConfig{}, fmt.Errorf("decode evidence maxLength: %w", err) }
    if math.IsNaN(minLength) || math.IsInf(minLength, 0) || math.IsNaN(maxLength) || math.IsInf(maxLength, 0) ||
        math.Trunc(minLength) != minLength || math.Trunc(maxLength) != maxLength ||
        minLength < 1 || minLength > 4000 || maxLength < 1 || maxLength > 10000 {
        return evidenceConfig{}, errors.New("evidence lengths must be integral and within schema bounds")
    }
    cfg := evidenceConfig{MinLength: int(minLength), MaxLength: int(maxLength)}
    if cfg.MaxLength < cfg.MinLength { return evidenceConfig{}, errors.New("maxLength must be at least minLength") }
    return cfg, nil
}

func Evaluate(kind string, config json.RawMessage, response Response, previousAttempts int) (Outcome, error) {
    if previousAttempts < 0 { return Outcome{}, errors.New("previousAttempts cannot be negative") }
    if err := Validate(kind, config); err != nil { return Outcome{}, err }
    switch kind {
    case "explanation":
        return Outcome{Kind: "continue"}, nil
    case "numeric":
        var cfg struct {
            Answer, Tolerance json.Number
            Hints             []string
        }
        if err := json.Unmarshal(config, &cfg); err != nil { return Outcome{}, err }
        number, err := response.Number.Float64()
        if response.Number == "" || !json.Valid([]byte(response.Number)) || err != nil || math.IsNaN(number) || math.IsInf(number, 0) {
            return Outcome{Kind: "invalid", Feedback: "Enter a finite number with the requested unit."}, nil
        }
        value, ok := new(big.Rat).SetString(response.Number.String())
        if !ok { return Outcome{Kind: "invalid", Feedback: "Enter a finite number with the requested unit."}, nil }
        answer, ok := new(big.Rat).SetString(cfg.Answer.String())
        if !ok { return Outcome{}, errors.New("invalid numeric answer") }
        tolerance, ok := new(big.Rat).SetString(cfg.Tolerance.String())
        if !ok { return Outcome{}, errors.New("invalid numeric tolerance") }
        difference := new(big.Rat).Sub(value, answer)
        if difference.Abs(difference).Cmp(tolerance) <= 0 {
            return Outcome{Kind: "correct", Feedback: "Correct. Continue to compare the result with the model's limits."}, nil
        }
        index := previousAttempts
        if index >= len(cfg.Hints) { index = len(cfg.Hints) - 1 }
        return Outcome{Kind: "incorrect", Feedback: "Not yet. Check your assumptions and try again.", Hint: cfg.Hints[index]}, nil
    case "evidence":
        cfg, err := parseEvidenceConfig(config)
        if err != nil { return Outcome{}, err }
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

- [x] **Step 4: Run activity tests**

Run: `go test ./internal/activity`
Expected: PASS, including invalid configurations and both response types.

- [x] **Step 5: Commit**

```bash
git add internal/activity go.mod go.sum
git commit -m "feat: add declarative guided activities"
```

### Task 3: Validate lesson graphs and apply transitions

**Files:**
- Create: `internal/course/course.go`
- Test: `internal/course/course_test.go`

- [x] **Step 1: Write failing graph tests**

Create `internal/course/course_test.go`:

```go
package course

import (
    _ "embed"
    "encoding/json"
    "strings"
    "testing"

    "github.com/grownetics/courseware/internal/activity"
)

//go:embed testdata/vent-course.json
var fixture []byte

func TestFixtureValidatesAndProgresses(t *testing.T) {
    c, err := Parse(fixture)
    if err != nil { t.Fatal(err) }
    outcome, err := c.Evaluate("predict", activity.Response{Number: json.Number("20")}, 0)
    if err != nil { t.Fatal(err) }
    if outcome.NextStep != "predict" || outcome.Completed { t.Fatalf("unexpected retry: %+v", outcome) }
    outcome, err = c.Evaluate("predict", activity.Response{Number: json.Number("24.4")}, 1)
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

func TestRejectsNullTransitionTarget(t *testing.T) {
    var broken map[string]any
    if err := json.Unmarshal(fixture, &broken); err != nil { t.Fatal(err) }
    steps := broken["steps"].([]any)
    steps[2].(map[string]any)["transitions"].(map[string]any)["continue"] = nil
    raw, err := json.Marshal(broken)
    if err != nil { t.Fatal(err) }
    if _, err := Parse(raw); err == nil { t.Fatal("expected null-transition error") }
}

func TestRejectsNoncanonicalCourseProperties(t *testing.T) {
    for _, tc := range []struct{
        name string
        change func(map[string]any)
        field string
    }{
        {name: "top-level Steps", change: func(course map[string]any) { course["Steps"] = course["steps"]; delete(course, "steps") }, field: "Steps"},
        {name: "step ID", change: func(course map[string]any) { step := course["steps"].([]any)[0].(map[string]any); step["ID"] = step["id"]; delete(step, "id") }, field: "ID"},
    } {
        t.Run(tc.name, func(t *testing.T) {
            var course map[string]any
            if err := json.Unmarshal(fixture, &course); err != nil { t.Fatal(err) }
            tc.change(course)
            raw, err := json.Marshal(course)
            if err != nil { t.Fatal(err) }
            if _, err := Parse(raw); err == nil || !strings.Contains(err.Error(), tc.field) { t.Fatalf("expected rejection of %s, got %v", tc.field, err) }
        })
    }
}

func TestRejectsTrailingJSON(t *testing.T) {
    raw := append(append([]byte{}, fixture...), []byte(`{}`)...)
    if _, err := Parse(raw); err == nil { t.Fatal("expected trailing-JSON error") }
}
```

- [x] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/course`
Expected: FAIL because `Parse` and `Evaluate` are undefined.

- [x] **Step 3: Implement course parsing and deterministic progression**

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

type TransitionTargets map[string]string

func (targets *TransitionTargets) UnmarshalJSON(raw []byte) error {
    var values map[string]json.RawMessage
    if err := json.Unmarshal(raw, &values); err != nil { return err }
    decoded := make(TransitionTargets, len(values))
    for outcome, value := range values {
        if bytes.Equal(bytes.TrimSpace(value), []byte("null")) { return fmt.Errorf("transition %q cannot be null", outcome) }
        var target string
        if err := json.Unmarshal(value, &target); err != nil { return fmt.Errorf("transition %q: %w", outcome, err) }
        decoded[outcome] = target
    }
    *targets = decoded
    return nil
}

type Step struct {
    ID          string            `json:"id"`
    Type        string            `json:"type"`
    Title       string            `json:"title"`
    Body        string            `json:"body"`
    Activity    json.RawMessage   `json:"activity"`
    Transitions TransitionTargets `json:"transitions"`
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

func checkCoursePropertyNames(raw []byte) error {
    var fields map[string]json.RawMessage
    if err := json.Unmarshal(raw, &fields); err != nil { return fmt.Errorf("decode course: %w", err) }
    for name := range fields {
        switch name {
        case "schemaVersion", "courseId", "revision", "title", "firstStep", "steps":
        default:
            return fmt.Errorf("unknown course property %q", name)
        }
    }
    rawSteps, ok := fields["steps"]
    if !ok { return nil }
    var steps []json.RawMessage
    if err := json.Unmarshal(rawSteps, &steps); err != nil { return fmt.Errorf("decode steps: %w", err) }
    for index, rawStep := range steps {
        var stepFields map[string]json.RawMessage
        if err := json.Unmarshal(rawStep, &stepFields); err != nil { return fmt.Errorf("decode step %d: %w", index+1, err) }
        for name := range stepFields {
            switch name {
            case "id", "type", "title", "body", "activity", "transitions":
            default:
                return fmt.Errorf("unknown step %d property %q", index+1, name)
            }
        }
    }
    return nil
}

func Parse(raw []byte) (Course, error) {
    if err := checkCoursePropertyNames(raw); err != nil { return Course{}, err }
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

- [x] **Step 4: Run graph tests**

Run: `go test ./internal/course`
Expected: PASS for the complete fixture path and missing-target rejection.

- [x] **Step 5: Commit**

```bash
git add internal/course
git commit -m "feat: validate and run guided lesson graphs"
```

### Task 4: Expose a loopback-only studio API

**Files:**
- Create: `internal/studio/api.go`
- Test: `internal/studio/api_test.go`
- Create: `cmd/studio/main.go`, `cmd/studio/main_test.go`

- [x] **Step 1: Write failing API tests**

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
    raw, err := os.ReadFile("../course/testdata/vent-course.json")
    if err != nil { t.Fatal(err) }
    api := NewAPI(raw)
    response := httptest.NewRecorder()
    api.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/validate", bytes.NewReader(raw)))
    if response.Code != http.StatusOK { t.Fatalf("valid course status = %d: %s", response.Code, response.Body.String()) }
    response = httptest.NewRecorder()
    api.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/validate", bytes.NewReader(append(append([]byte(nil), raw...), []byte(` {}`)...))))
    if response.Code != http.StatusBadRequest { t.Fatalf("trailing JSON status = %d: %s", response.Code, response.Body.String()) }
}

func TestRejectsOversizedRequest(t *testing.T) {
    raw, err := os.ReadFile("../course/testdata/vent-course.json")
    if err != nil { t.Fatal(err) }
    api := NewAPI(raw)
    body := append(append([]byte(nil), raw...), bytes.Repeat([]byte(" "), 2<<20)...)
    response := httptest.NewRecorder()
    api.ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/validate", bytes.NewReader(body)))
    if response.Code != http.StatusBadRequest || !bytes.Contains(response.Body.Bytes(), []byte("request body too large")) {
        t.Fatalf("status = %d, body = %s", response.Code, response.Body.String())
    }
}
```

- [x] **Step 2: Run the tests and observe failure**

Run: `go test ./internal/studio`
Expected: FAIL because `NewAPI` is undefined.

- [x] **Step 3: Implement the API and loopback entry point**

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
    if err := decoder.Decode(&struct{}{}); err != io.EOF {
        if err != nil { return err }
        return errors.New("request contains multiple JSON values")
    }
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
    "path/filepath"
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
    mux.Handle("/", newStaticHandler(*webDir))
    server := &http.Server{Addr: *address, Handler: mux, ReadHeaderTimeout: 5 * time.Second, IdleTimeout: 60 * time.Second}
    log.Printf("Guided Activity Studio: http://%s", *address)
    log.Fatal(server.ListenAndServe())
}

func newStaticHandler(webDir string) http.Handler {
    files := http.FileServer(http.Dir(webDir))
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        relative := strings.TrimPrefix(r.URL.Path, "/")
        if filepath.IsLocal(relative) {
            if _, err := os.Stat(filepath.Join(webDir, filepath.FromSlash(relative))); err == nil {
                files.ServeHTTP(w, r)
                return
            }
        }
        http.ServeFile(w, r, webDir+"/index.html")
    })
}
```

Create `cmd/studio/main_test.go`:

```go
package main

import (
    "net/http"
    "net/http/httptest"
    "os"
    "path/filepath"
    "strings"
    "testing"
)

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

func TestStaticHandlerServesAssetsWithParentComponentsInWebDir(t *testing.T) {
    root := t.TempDir()
    webDir := filepath.Join(root, "web") + "/../web/build"
    if err := os.MkdirAll(webDir, 0755); err != nil { t.Fatal(err) }
    if err := os.WriteFile(filepath.Join(webDir, "index.html"), []byte("index"), 0644); err != nil { t.Fatal(err) }
    if err := os.WriteFile(filepath.Join(webDir, "app.js"), []byte("asset"), 0644); err != nil { t.Fatal(err) }
    if err := os.WriteFile(filepath.Join(root, "secret.txt"), []byte("secret"), 0644); err != nil { t.Fatal(err) }
    handler := newStaticHandler(webDir)
    response := httptest.NewRecorder()
    handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/app.js", nil))
    if response.Code != http.StatusOK || response.Body.String() != "asset" { t.Fatalf("asset status = %d, body = %q", response.Code, response.Body.String()) }
    response = httptest.NewRecorder()
    handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/../secret.txt", nil))
    if strings.Contains(response.Body.String(), "secret") { t.Fatalf("request traversal exposed file: %s", response.Body.String()) }
}
```

- [x] **Step 4: Run API tests**

Run: `go test ./internal/studio ./cmd/studio`
Expected: PASS for definitions, evaluation, invalid-course rejection, and loopback-only listener validation.

- [x] **Step 5: Commit**

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

- [x] **Step 1: Define shared API types and static rendering**

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
export type Definition = { type: string; label: string; schema: Record<string, unknown>; fields: Field[] };
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

- [x] **Step 2: Generate activity fields from definitions**

Create `web/src/lib/ActivityFields.svelte`:

```svelte
<script lang="ts">
  import type { Field } from './types';
  let { fields, values }: { fields: Field[]; values: Record<string, any> } = $props();

  function update(field: Field, event: Event) {
    const input = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    if (field.kind === 'string_list') values[field.key] = input.value.split('\n').map((item) => item.trim()).filter(Boolean);
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
    {:else if field.kind === 'number'}
      <input type="number" step="any" bind:value={values[field.key]} />
    {:else}
      <input type="text" value={text(field)} oninput={(event) => update(field, event)} />
    {/if}
  </label>
{/each}
```

- [x] **Step 3: Implement the shared lesson player**

Create `web/src/lib/LessonPlayer.svelte`:

```svelte
<script lang="ts">
  import { evaluate } from './api';
  import type { Course, Outcome } from './types';

  let { course }: { course: Course } = $props();
  let currentId = $state('');
  let attempts = $state(0);
  let numberValue = $state<number | null>(null);
  let textValue = $state('');
  let outcome = $state<Outcome | null>(null);
  let error = $state('');
  let busy = $state(false);
  let stepId = $derived(currentId || course.firstStep);
  let step = $derived(course.steps.find((candidate) => candidate.id === stepId)!);

  async function submit() {
    busy = true;
    error = '';
    try {
      const response = step.type === 'numeric' ? { number: numberValue } : { text: textValue };
      outcome = await evaluate(course, stepId, response, attempts);
      if (outcome.kind === 'incorrect') attempts += 1;
      if (step.type === 'explanation' && outcome.kind === 'continue' && !outcome.completed) advance();
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
    currentId = '';
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
    <button type="button" disabled={busy} onclick={reset}>Reset preview</button>
  </div>
  {#if outcome?.completed}
    <h3>Lesson complete</h3>
    <p role="status">{outcome.feedback}</p>
  {:else}
    <article>
      <h3>{step.title}</h3>
      <p>{step.body}</p>
      {#if step.type === 'numeric'}
        <p>{step.activity?.prompt}</p>
        <label>Your answer ({step.activity?.unit})
          <input type="number" step="any" bind:value={numberValue} />
        </label>
      {:else if step.type === 'evidence'}
        <label>{step.activity?.prompt}
          <textarea rows="6" bind:value={textValue}></textarea>
        </label>
      {/if}
      {#if outcome}
        <p role="status">{outcome.feedback}</p>
        {#if outcome.hint}<p class="hint"><strong>Hint:</strong> {outcome.hint}</p>{/if}
        {#if outcome.kind === 'correct' || outcome.kind === 'continue' || (outcome.nextStep && outcome.nextStep !== stepId)}
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

- [x] **Step 4: Implement editing, validation, import, and export**

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
  let previewCourse = $state.raw<Course | null>(null);
  let status = $state('');
  let error = $state('');
  let operationGeneration = 0;

  onMount(async () => {
    try {
      const [loadedDefinitions, example] = await Promise.all([getDefinitions(), getExampleCourse()]);
      await validateCourse(example);
      definitions = loadedDefinitions;
      previewCourse = structuredClone(example);
      course = example;
    } catch (cause) { error = cause instanceof Error ? cause.message : String(cause); }
  });

  const transitionKinds = (type: string) => type === 'numeric' ? ['correct', 'incorrect', 'invalid'] : type === 'evidence' ? ['continue', 'invalid'] : ['continue'];

  function addStep(type: Step['type']) {
    if (!course) return;
    let sequence = course.steps.length + 1;
    while (course.steps.some((step) => step.id === `step-${sequence}`)) sequence += 1;
    const id = `step-${sequence}`;
    const activity = type === 'numeric'
      ? { prompt: 'New numeric prompt', answer: 0, tolerance: 0, unit: 'unit', hints: ['First hint'] }
      : type === 'evidence' ? { prompt: 'Explain your evidence', minLength: 40, maxLength: 1200 } : null;
    const transitions = type === 'numeric' ? { correct: '', incorrect: id, invalid: id } : type === 'evidence' ? { continue: '', invalid: id } : { continue: '' };
    course.steps.push({ id, type, title: 'New step', body: 'Author the step content.', activity, transitions });
  }

  async function validate() {
    if (!course) return;
    const generation = ++operationGeneration;
    status = ''; error = '';
    const candidate = JSON.parse(JSON.stringify(course)) as Course;
    try {
      await validateCourse(candidate);
      if (generation !== operationGeneration) return;
      previewCourse = candidate;
      status = 'Course JSON and lesson graph are valid.';
    } catch (cause) {
      if (generation === operationGeneration) error = cause instanceof Error ? cause.message : String(cause);
    }
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
    const generation = ++operationGeneration;
    status = ''; error = '';
    try {
      const imported = JSON.parse(await file.text()) as Course;
      await validateCourse(imported);
      if (generation !== operationGeneration) return;
      previewCourse = structuredClone(imported);
      course = imported;
      status = 'Imported and validated course JSON.';
    } catch (cause) {
      if (generation === operationGeneration) error = cause instanceof Error ? cause.message : String(cause);
    }
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
        <select bind:value={course.firstStep}>{#each course.steps as step, index (index)}<option value={step.id}>{step.id}</option>{/each}</select>
      </label>
      {#each course.steps as step, index (index)}
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
    {#if previewCourse}
      {#key previewCourse}<LessonPlayer course={previewCourse} />{/key}
    {/if}
  {:else if !error}<p>Loading studio…</p>{/if}
</main>
```

- [x] **Step 5: Add accessible, responsive styling**

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
main > [role='status'], main > [role='alert'] { grid-column: 1 / -1; }
@media (min-width: 900px) { main { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1rem; align-items: start; } header { grid-column: 1 / -1; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; } }
```

Import the stylesheet by adding this line to the top of the `<script>` block in `web/src/routes/+page.svelte`:

```ts
import '../app.css';
```

- [x] **Step 6: Build and smoke the actual studio**

Run:

```bash
npm --prefix web run build
go run ./cmd/studio
```

Open `http://127.0.0.1:4173`. Expected: the fixture editor and learner preview render. An incorrect numeric response shows a hint; 24.4 reaches the explanation; continuing reaches evidence; a reflection of at least 40 characters reaches “Lesson complete.” Stop the server after verification.

- [x] **Step 7: Commit**

```bash
git add web
git commit -m "feat: add schema-driven studio and learner preview"
```

### Task 6: Prove the browser workflow and CI

**Files:**
- Create: `web/playwright.config.ts`, `web/tests/studio.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `README.md`

- [x] **Step 1: Write the browser acceptance test**

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
import { readFile } from 'node:fs/promises';

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
  const expected = await (await page.request.get('/api/example-course')).json();
  expect(JSON.parse(await readFile(path, 'utf8'))).toEqual(expected);
  await page.getByLabel('Import JSON').setInputFiles(path);
  await expect(page.getByText('Imported and validated course JSON.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
});

test('noncanonical imported properties show an error without changing preview', async ({ page }) => {
  const errors: Error[] = [];
  page.on('pageerror', (cause) => errors.push(cause));
  await page.goto('/');
  const preview = page.getByRole('region', { name: 'Learner preview' });
  await expect(preview.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  const imported = await (await page.request.get('/api/example-course')).json();
  imported.Steps = imported.steps;
  delete imported.steps;
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'noncanonical-course.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported))
  });
  await expect(page.getByRole('alert')).toContainText('Steps');
  await expect(preview.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Course title' })).toHaveValue('Studio fixture: one vent, three consequences');
  expect(errors).toEqual([]);
});

test('narrow layout preserves editor and preview without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Course editor' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Learner preview' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('editor changes do not alter preview until validation succeeds', async ({ page }) => {
  await page.goto('/');
  const editor = page.getByRole('region', { name: 'Course editor' });
  const preview = page.getByRole('region', { name: 'Learner preview' });
  const numeric = editor.getByRole('group', { name: 'Step 1: numeric' });
  await expect(preview.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  await numeric.getByRole('textbox', { name: 'Title' }).fill('Revised prediction');
  await numeric.getByRole('textbox', { name: 'Step ID' }).fill('revised-predict');
  await expect(preview.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  await preview.getByLabel(/Your answer/).fill('24.4');
  await preview.getByRole('button', { name: 'Check response' }).click();
  await expect(preview.getByText(/Correct. Continue/)).toBeVisible();
  await editor.getByRole('button', { name: 'Validate and refresh preview' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(preview.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  await numeric.getByRole('textbox', { name: 'Step ID' }).fill('predict');
  await editor.getByRole('button', { name: 'Validate and refresh preview' }).click();
  await expect(preview.getByRole('heading', { name: 'Revised prediction' })).toBeVisible();
});

test('incorrect answer can follow an authored alternate transition', async ({ page }) => {
  await page.goto('/');
  const editor = page.getByRole('region', { name: 'Course editor' });
  await editor.getByRole('group', { name: 'Step 1: numeric' })
    .getByRole('textbox', { name: 'Next step on incorrect (blank completes)' }).fill('observe');
  await editor.getByRole('button', { name: 'Validate and refresh preview' }).click();
  await expect(page.getByText('Course JSON and lesson graph are valid.')).toBeVisible();
  await page.getByLabel(/Your answer/).fill('20');
  await page.getByRole('button', { name: 'Check response' }).click();
  await expect(page.getByText('Not yet. Check your assumptions and try again.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Read the balance, not just the dial' })).toBeVisible();
});

test('numeric prompt is visible above its labeled answer', async ({ page }) => {
  await page.goto('/');
  const preview = page.getByRole('region', { name: 'Learner preview' });
  await expect(preview.getByText('Predicted air temperature')).toBeVisible();
  await expect(preview.getByLabel(/Your answer/)).toBeVisible();
});

test('reset is disabled while evaluation is pending', async ({ page }) => {
  const { promise: hold, resolve: release } = Promise.withResolvers<void>();
  await page.route('**/api/evaluate', async (route) => {
    const response = await route.fetch();
    await hold;
    await route.fulfill({ response });
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  const request = page.waitForRequest('**/api/evaluate');
  await page.getByRole('button', { name: 'Check response' }).click();
  await request;
  await expect(page.getByRole('button', { name: 'Reset preview' })).toBeDisabled();
  release();
  await expect(page.getByRole('button', { name: 'Reset preview' })).toBeEnabled();
});

test('desktop status stays above side-by-side editor and preview', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Learner preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Validate and refresh preview' }).click();
  const status = page.getByText('Course JSON and lesson graph are valid.');
  await expect(status).toBeVisible();
  const editor = await page.getByRole('region', { name: 'Course editor' }).boundingBox();
  const preview = await page.getByRole('region', { name: 'Learner preview' }).boundingBox();
  const message = await status.boundingBox();
  expect(editor).not.toBeNull();
  expect(preview).not.toBeNull();
  expect(message).not.toBeNull();
  expect(preview!.x).toBeGreaterThan(editor!.x + editor!.width);
  expect(preview!.y).toBe(editor!.y);
  expect(message!.y + message!.height).toBeLessThan(editor!.y);
});

test('editing a step ID retains focus through sequential typing', async ({ page }) => {
  await page.goto('/');
  const stepId = page.getByRole('group', { name: 'Step 1: numeric' }).getByRole('textbox', { name: 'Step ID' });
  await stepId.click();
  await stepId.press('ControlOrMeta+A');
  await stepId.pressSequentially('revised-predict');
  await expect(stepId).toBeFocused();
  await expect(stepId).toHaveValue('revised-predict');
});

test('temporarily duplicated step IDs remain editable without rendering errors', async ({ page }) => {
  const pageErrors: Error[] = [];
  page.on('pageerror', (cause) => pageErrors.push(cause));
  await page.goto('/');
  const editor = page.getByRole('region', { name: 'Course editor' });
  await expect(editor.getByRole('group', { name: 'Step 2: explanation' })).toBeVisible();
  await editor.getByRole('group', { name: 'Step 2: explanation' }).getByRole('textbox', { name: 'Step ID' }).fill('predict');
  await expect(editor.getByRole('group', { name: 'Step 1: numeric' }).getByRole('textbox', { name: 'Step ID' })).toHaveValue('predict');
  await expect(editor.getByRole('group', { name: 'Step 2: explanation' }).getByRole('textbox', { name: 'Step ID' })).toHaveValue('predict');
  await expect(editor.getByRole('group', { name: 'Step 3: evidence' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('numeric author field accepts sequential negative decimal typing', async ({ page }) => {
  await page.goto('/');
  const answer = page.getByRole('group', { name: 'Step 1: numeric' }).getByRole('spinbutton', { name: 'Expected answer' });
  await answer.click();
  await answer.press('ControlOrMeta+A');
  await answer.pressSequentially('-12.5');
  await expect(answer).toHaveValue('-12.5');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const path = await (await downloadEvent).path();
  if (!path) throw new Error('browser did not provide the downloaded course');
  const exported = JSON.parse(await readFile(path, 'utf8'));
  expect(exported.steps[0].activity.answer).toBe(-12.5);
});

test('stale validation cannot replace an imported course', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Predict before you manipulate' })).toBeVisible();
  const imported = await (await page.request.get('/api/example-course')).json();
  imported.title = 'Imported course';
  imported.steps[0].title = 'Imported prediction';
  const { promise: hold, resolve: release } = Promise.withResolvers<void>();
  const { promise: firstStarted, resolve: started } = Promise.withResolvers<void>();
  let requests = 0;
  await page.route('**/api/validate', async (route) => {
    const response = await route.fetch();
    if (requests++ === 0) { started(); await hold; }
    await route.fulfill({ response });
  });
  await page.getByRole('textbox', { name: 'Course title' }).fill('Slow validation');
  await page.getByRole('button', { name: 'Validate and refresh preview' }).click();
  await firstStarted;
  await page.getByLabel('Import JSON').setInputFiles({
    name: 'alternate.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported))
  });
  await expect(page.getByText('Imported and validated course JSON.')).toBeVisible();
  const oldResponse = page.waitForResponse((response) =>
    response.url().endsWith('/api/validate') && JSON.parse(response.request().postData() ?? '{}').title === 'Slow validation'
  );
  release();
  await oldResponse;
  await expect(page.getByRole('heading', { name: 'Imported prediction' })).toBeVisible();
  await expect(page.getByText('Imported and validated course JSON.')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Course title' })).toHaveValue('Imported course');
});

test('evidence accepts a single supplementary Unicode character', async ({ page }) => {
  await page.goto('/');
  const evidence = page.getByRole('group', { name: 'Step 3: evidence' });
  await evidence.getByRole('spinbutton', { name: 'Minimum characters' }).fill('1');
  await evidence.getByRole('spinbutton', { name: 'Maximum characters' }).fill('1');
  await page.getByRole('button', { name: 'Validate and refresh preview' }).click();
  await expect(page.getByText('Course JSON and lesson graph are valid.')).toBeVisible();
  await page.getByLabel(/Your answer/).fill('24.4');
  await page.getByRole('button', { name: 'Check response' }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const reflection = page.getByLabel('Observation and limitation');
  await reflection.pressSequentially('🌱');
  await expect(reflection).toHaveValue('🌱');
  await page.getByRole('button', { name: 'Check response' }).click();
  await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
});
```

- [x] **Step 2: Run the browser test**

Run:

```bash
npm --prefix web exec -- playwright install chromium
npm --prefix web test
```

Expected: 14 Chromium tests pass with no failed assertions. If the fixture or selector fails, fix the implementation rather than weakening the assertion.

- [x] **Step 3: Add CI and final documentation**

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

- [x] **Step 4: Run the complete verification suite**

Run:

```bash
go test ./...
npm --prefix web test
git diff --check
```

Expected: all Go tests pass, 14 browser scenarios pass, and `git diff --check` produces no output.

- [x] **Step 5: Commit**

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

## Implementation record — 2026-11-04

Implemented in `/Users/vincehark/Code/grownetics-courseware` on branch `feature/guided-activity-studio`, final commit `9df9d531d4093b516aabe95f0bd70b75390bff21`. Every task received independent specification and code-quality review, followed by a whole-implementation review and final merge-readiness approval.

Final verification on the exact final commit:

- `go test ./...` passed for `cmd/studio`, `internal/activity`, `internal/course`, and `internal/studio`.
- `npm --prefix web test` built the production frontend and passed all 14 Chromium scenarios.
- Desktop and 390px browser surfaces were inspected directly.
- Numeric evaluation uses exact decimal/rational comparison, preserving large decimal boundaries without excessive tolerance.
- Canonical Course/Step property checks reject case-variant imports without changing the existing preview.
- TypeScript 6.0.3 resolves the SvelteKit 3.1.1 peer requirement using standard npm installation.
- `git diff --check` passed, and no unrelated Academy working files were changed.

This completes the guided activity studio subsystem only. School persistence/identity, teacher/student assessment, Wails journal synchronization, deployment operations, and later roadmap modules remain separate plans.
