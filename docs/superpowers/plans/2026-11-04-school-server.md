# School Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a working school server with PostgreSQL persistence, bootstrap identity, scoped capabilities, immutable course publication, class assignments, and transactional domain events.

**Architecture:** Extend the existing `grownetics-courseware` repository with a modular Go monolith. PostgreSQL stores identity, classes, course revisions, assignments, sessions, and the domain-event outbox. The existing activity/course packages remain the canonical validation and evaluation contracts; the loopback studio and its ephemeral preview remain intact.

**Tech Stack:** Go 1.27.1, PostgreSQL 18.1, pgx 5.12.0, goose 3.29.0, `golang.org/x/crypto` 0.58.0, Google UUID 1.6.0, Docker Compose for development only, Node.js 25.5.0, Playwright 1.64.1.

---

## Scope and boundaries

Implement the [approved school-server subsystem](../specs/2026-11-03-self-hosted-courseware-design.md#16-implementation-plan-sequence). This plan includes identity, capabilities, immutable course persistence, publication, class assignments, and domain events. Attempts, resumable learner state, submissions, rubrics, assessment, Wails synchronization, deployment operations, and gamification remain subsequent plans.

Execution starts from `9df9d531d4093b516aabe95f0bd70b75390bff21`. Create branch `feature/school-server` from that commit. Preserve all guided-studio tests and behavior. Development database credentials are explicitly local-only; no production deployment is authorized by this plan.

Target additions:

```text
cmd/server/main.go
compose.dev.yaml
internal/config/{config.go,config_test.go}
internal/database/{database.go,database_test.go}
internal/database/migrations/00001_school.sql
internal/testsupport/database.go
internal/identity/{password.go,session.go,bootstrap.go,identity_test.go}
internal/school/{courses.go,assignments.go,events.go,http.go,courses_test.go,assignments_test.go,http_test.go}
```

### Task 1: Add PostgreSQL development infrastructure and migrations

**Files:**
- Create: `compose.dev.yaml`, `internal/database/database.go`, `internal/database/database_test.go`, `internal/database/migrations/00001_school.sql`, `internal/testsupport/database.go`
- Modify: `go.mod`, `go.sum`, `Makefile`

- [ ] **Step 1: Write the failing migration test**

Create `internal/database/database_test.go`:

```go
package database_test

import (
    "context"
    "testing"

    "github.com/grownetics/courseware/internal/testsupport"
)

func TestMigrationCreatesSchoolTables(t *testing.T) {
    pool := testsupport.Database(t)
    for _, table := range []string{"schools", "users", "sessions", "capability_grants", "classes", "class_members", "courses", "course_revisions", "assignments", "domain_events"} {
        var exists bool
        if err := pool.QueryRow(context.Background(), "SELECT to_regclass($1) IS NOT NULL", table).Scan(&exists); err != nil { t.Fatal(err) }
        if !exists { t.Errorf("table %s does not exist", table) }
    }
}
```

Create `internal/testsupport/database.go`:

```go
package testsupport

import (
    "context"
    "net/url"
    "os"
    "strings"
    "testing"

    "github.com/google/uuid"
    "github.com/grownetics/courseware/internal/database"
    "github.com/jackc/pgx/v5/pgxpool"
)

func Database(t *testing.T) *pgxpool.Pool {
    t.Helper()
    ctx := context.Background()
    rawURL := os.Getenv("COURSEWARE_DATABASE_URL")
    parsed, err := url.Parse(rawURL)
    if err != nil { t.Fatal(err) }
    adminURL := *parsed
    adminURL.Path = "/postgres"
    admin, err := pgxpool.New(ctx, adminURL.String())
    if err != nil { t.Fatal(err) }
    name := "courseware_test_" + strings.ReplaceAll(uuid.NewString(), "-", "")
    if _, err := admin.Exec(ctx, "CREATE DATABASE "+name); err != nil { admin.Close(); t.Fatal(err) }
    testURL := *parsed
    testURL.Path = "/" + name
    pool, err := database.Open(ctx, testURL.String())
    if err != nil {
        _, _ = admin.Exec(context.Background(), "DROP DATABASE IF EXISTS "+name)
        admin.Close()
        t.Fatal(err)
    }
    t.Cleanup(func() {
        pool.Close()
        if _, err := admin.Exec(context.Background(), "DROP DATABASE IF EXISTS "+name); err != nil { t.Errorf("drop test database: %v", err) }
        admin.Close()
    })
    return pool
}
```

Each test creates and drops its own database and runs the full migration. Tests may run in parallel without touching the development school or one another's fixtures. Never truncate the development database or import this helper into production commands.

- [ ] **Step 2: Run the test and observe failure**

Run:

```bash
export COURSEWARE_DATABASE_URL='postgres://courseware:courseware-dev-only@127.0.0.1:55432/courseware?sslmode=disable'
docker compose -f compose.dev.yaml up -d --wait db
go test ./internal/database -run TestMigrationCreatesSchoolTables -count=1
```

Expected: FAIL because `compose.dev.yaml`, `database.Open`, and the migration do not exist. Do not create the migration before observing the missing implementation failure.

- [ ] **Step 3: Add development database and migration runtime**

Create `compose.dev.yaml`:

```yaml
services:
  db:
    image: postgres:18.1-alpine
    environment:
      POSTGRES_USER: courseware
      POSTGRES_PASSWORD: courseware-dev-only
      POSTGRES_DB: courseware
    ports:
      - "127.0.0.1:55432:5432"
    volumes:
      - courseware-dev-db:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U courseware -d courseware"]
      interval: 2s
      timeout: 2s
      retries: 30

volumes:
  courseware-dev-db:
```

Create `internal/database/database.go`:

```go
package database

import (
    "context"
    "database/sql"
    "embed"
    "errors"
    "fmt"

    "github.com/jackc/pgx/v5/pgxpool"
    _ "github.com/jackc/pgx/v5/stdlib"
    "github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var migrations embed.FS

func Open(ctx context.Context, url string) (*pgxpool.Pool, error) {
    if url == "" { return nil, errors.New("COURSEWARE_DATABASE_URL is required") }
    pool, err := pgxpool.New(ctx, url)
    if err != nil { return nil, fmt.Errorf("open database: %w", err) }
    if err := pool.Ping(ctx); err != nil { pool.Close(); return nil, fmt.Errorf("ping database: %w", err) }
    goose.SetBaseFS(migrations)
    if err := goose.SetDialect("postgres"); err != nil { pool.Close(); return nil, err }
    migrationDB, err := sql.Open("pgx", url)
    if err != nil { pool.Close(); return nil, fmt.Errorf("open migration connection: %w", err) }
    defer migrationDB.Close()
    if err := goose.Up(migrationDB, "migrations"); err != nil { pool.Close(); return nil, fmt.Errorf("migrate database: %w", err) }
    return pool, nil
}
```

Create `internal/database/migrations/00001_school.sql`:

```sql
-- +goose Up
CREATE TABLE schools (
    id text PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE users (
    id text PRIMARY KEY,
    school_id text NOT NULL REFERENCES schools(id),
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
    token_hash text PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL
);
CREATE INDEX sessions_user_expiry ON sessions(user_id, expires_at);
CREATE TABLE capability_grants (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action text NOT NULL,
    scope_type text NOT NULL,
    scope_id text NOT NULL,
    UNIQUE(user_id, action, scope_type, scope_id)
);
CREATE INDEX capability_lookup ON capability_grants(user_id, action, scope_type, scope_id);
CREATE TABLE classes (
    id text PRIMARY KEY,
    school_id text NOT NULL REFERENCES schools(id),
    name text NOT NULL
);
CREATE TABLE class_members (
    class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK(role IN ('teacher', 'student')),
    PRIMARY KEY(class_id, user_id)
);
CREATE TABLE courses (
    id text PRIMARY KEY,
    school_id text NOT NULL REFERENCES schools(id),
    title text NOT NULL,
    current_draft_id text,
    current_published_id text,
    created_by text NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE course_revisions (
    id text PRIMARY KEY,
    course_id text NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    revision integer NOT NULL,
    state text NOT NULL CHECK(state IN ('draft', 'published', 'retired')),
    content jsonb NOT NULL,
    created_by text NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    published_at timestamptz,
    UNIQUE(course_id, revision)
);
CREATE INDEX course_revision_state ON course_revisions(course_id, state);
CREATE TABLE assignments (
    id text PRIMARY KEY,
    class_id text NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    course_revision_id text NOT NULL REFERENCES course_revisions(id),
    assigned_by text NOT NULL REFERENCES users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(class_id, course_revision_id)
);
CREATE TABLE domain_events (
    id text PRIMARY KEY,
    event_key text NOT NULL UNIQUE,
    event_type text NOT NULL,
    school_id text NOT NULL REFERENCES schools(id),
    actor_id text REFERENCES users(id),
    subject_id text NOT NULL,
    payload jsonb NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX domain_events_school ON domain_events(school_id, occurred_at, id);

-- +goose Down
DROP TABLE domain_events;
DROP TABLE assignments;
DROP TABLE course_revisions;
DROP TABLE courses;
DROP TABLE class_members;
DROP TABLE classes;
DROP TABLE capability_grants;
DROP TABLE sessions;
DROP TABLE users;
DROP TABLE schools;
```

- [ ] **Step 4: Pin dependencies and make the development database testable**

Update `go.mod` requirements to include:

```go
require (
    github.com/google/uuid v1.6.0
    github.com/jackc/pgx/v5 v5.12.0
    github.com/pressly/goose/v3 v3.29.0
    github.com/santhosh-tekuri/jsonschema/v6 v6.0.3
    golang.org/x/crypto v0.58.0
)
```

Run `go mod tidy`. Replace `Makefile` with:

```make
DB_URL ?= postgres://courseware:courseware-dev-only@127.0.0.1:55432/courseware?sslmode=disable

.PHONY: db-up test build run

db-up:
	docker compose -f compose.dev.yaml up -d --wait db

build:
	npm --prefix web run build

run: build
	go run ./cmd/studio

test: db-up
	COURSEWARE_DATABASE_URL='$(DB_URL)' go test ./...
	npm --prefix web test
```

Run `go test ./internal/database -count=1`.
Expected: PASS; migration creates every required table.

- [ ] **Step 5: Commit**

```bash
git add compose.dev.yaml internal/database internal/testsupport go.mod go.sum Makefile
git commit -m "feat: add school database foundation"
```

### Task 2: Add bootstrap identity, sessions, and scoped capabilities

**Files:**
- Create: `internal/identity/password.go`, `internal/identity/session.go`, `internal/identity/bootstrap.go`, `internal/identity/identity_test.go`

- [ ] **Step 1: Write failing identity tests**

Create `internal/identity/identity_test.go`:

```go
package identity

import (
    "context"
    "testing"
    "time"

    "github.com/grownetics/courseware/internal/testsupport"
)

func TestPasswordAndSessionLifecycle(t *testing.T) {
    hash, err := HashPassword("correct-horse-password")
    if err != nil { t.Fatal(err) }
    if !VerifyPassword(hash, "correct-horse-password") { t.Fatal("correct password rejected") }
    if VerifyPassword(hash, "wrong-password") { t.Fatal("wrong password accepted") }
    pool := testsupport.Database(t)
    if _, err := Bootstrap(context.Background(), pool, BootstrapInput{SchoolName: "Test School", AdminEmail: "admin@test", AdminPassword: "admin-password-1", TeacherEmail: "teacher@test", TeacherPassword: "teacher-password-1", StudentEmail: "student@test", StudentPassword: "student-password-1", ClassName: "CEA 101"}); err != nil { t.Fatal(err) }
}

func TestCapabilitiesAreScoped(t *testing.T) {
    pool := testsupport.Database(t)
    result, err := Bootstrap(context.Background(), pool, BootstrapInput{SchoolName: "Test School", AdminEmail: "admin@test", AdminPassword: "admin-password-1", TeacherEmail: "teacher@test", TeacherPassword: "teacher-password-1", StudentEmail: "student@test", StudentPassword: "student-password-1", ClassName: "CEA 101"})
    if err != nil { t.Fatal(err) }
    if result.AdminID == "" || result.TeacherID == "" || result.StudentID == "" || result.ClassID == "" { t.Fatal("incomplete bootstrap result") }
    if !Require(context.Background(), pool, result.TeacherID, "course.edit", "school", result.SchoolID) { t.Fatal("teacher cannot edit at school scope") }
    if Require(context.Background(), pool, result.StudentID, "course.publish", "school", result.SchoolID) { t.Fatal("student gained publish capability") }
    if Require(context.Background(), pool, result.TeacherID, "course.edit", "school", "another-school") { t.Fatal("capability leaked across schools") }
    token, err := CreateSession(context.Background(), pool, result.StudentID, time.Hour)
    if err != nil { t.Fatal(err) }
    userID, err := Authenticate(context.Background(), pool, token)
    if err != nil || userID != result.StudentID { t.Fatalf("session authentication = %q, %v", userID, err) }
    if err := DeleteSession(context.Background(), pool, token); err != nil { t.Fatal(err) }
    if _, err := Authenticate(context.Background(), pool, token); err == nil { t.Fatal("deleted session remains valid") }
}
```

- [ ] **Step 2: Run the tests and observe failure**

Run `go test ./internal/identity -count=1`.
Expected: FAIL because the identity functions and types are undefined.

- [ ] **Step 3: Implement password hashing and opaque sessions**

Create `internal/identity/password.go`:

```go
package identity

import (
    "crypto/rand"
    "crypto/subtle"
    "encoding/base64"
    "fmt"
    "strings"

    "golang.org/x/crypto/argon2"
)

func HashPassword(password string) (string, error) {
    if len(password) < 12 { return "", fmt.Errorf("password must contain at least 12 characters") }
    salt := make([]byte, 16)
    if _, err := rand.Read(salt); err != nil { return "", err }
    key := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
    return fmt.Sprintf("$argon2id$v=19$m=65536,t=1,p=4$%s$%s", base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(key)), nil
}

func VerifyPassword(encoded, password string) bool {
    parts := strings.Split(encoded, "$")
    if len(parts) != 6 { return false }
    var memory, iterations uint32
    var parallelism uint8
    if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism); err != nil { return false }
    salt, err := base64.RawStdEncoding.DecodeString(parts[4])
    if err != nil { return false }
    expected, err := base64.RawStdEncoding.DecodeString(parts[5])
    if err != nil { return false }
    actual := argon2.IDKey([]byte(password), salt, iterations, memory, parallelism, uint32(len(expected)))
    return subtle.ConstantTimeCompare(actual, expected) == 1
}
```

Create `internal/identity/session.go`:

```go
package identity

import (
    "context"
    "crypto/rand"
    "crypto/sha256"
    "encoding/base64"
    "encoding/hex"
    "errors"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
)

var ErrInvalidSession = errors.New("invalid or expired session")

func CreateSession(ctx context.Context, pool *pgxpool.Pool, userID string, lifetime time.Duration) (string, error) {
    raw := make([]byte, 32)
    if _, err := rand.Read(raw); err != nil { return "", err }
    token := base64.RawURLEncoding.EncodeToString(raw)
    if _, err := pool.Exec(ctx, "INSERT INTO sessions(token_hash, user_id, expires_at) VALUES($1, $2, $3)", hashToken(token), userID, time.Now().Add(lifetime)); err != nil { return "", err }
    return token, nil
}

func Authenticate(ctx context.Context, pool *pgxpool.Pool, token string) (string, error) {
    var userID string
    err := pool.QueryRow(ctx, "SELECT user_id FROM sessions WHERE token_hash=$1 AND expires_at > now()", hashToken(token)).Scan(&userID)
    if err != nil { return "", ErrInvalidSession }
    return userID, nil
}

func DeleteSession(ctx context.Context, pool *pgxpool.Pool, token string) error {
    _, err := pool.Exec(ctx, "DELETE FROM sessions WHERE token_hash=$1", hashToken(token))
    return err
}

func hashToken(token string) string {
    digest := sha256.Sum256([]byte(token))
    return hex.EncodeToString(digest[:])
}
```

- [ ] **Step 4: Implement bootstrap and capabilities**

Create `internal/identity/bootstrap.go`:

```go
package identity

import (
    "context"
    "fmt"
    "strings"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

type BootstrapInput struct {
    SchoolName, AdminEmail, AdminPassword string
    TeacherEmail, TeacherPassword string
    StudentEmail, StudentPassword string
    ClassName string
}

type BootstrapResult struct { SchoolID, AdminID, TeacherID, StudentID, ClassID string }

func Bootstrap(ctx context.Context, pool *pgxpool.Pool, input BootstrapInput) (BootstrapResult, error) {
    if strings.TrimSpace(input.SchoolName) == "" || strings.TrimSpace(input.ClassName) == "" { return BootstrapResult{}, fmt.Errorf("school and class names are required") }
    for _, password := range []string{input.AdminPassword, input.TeacherPassword, input.StudentPassword} {
        if len(password) < 12 { return BootstrapResult{}, fmt.Errorf("bootstrap passwords must contain at least 12 characters") }
    }
    tx, err := pool.BeginTx(ctx, pgx.TxOptions{})
    if err != nil { return BootstrapResult{}, err }
    defer tx.Rollback(ctx)
    result := BootstrapResult{SchoolID: uuid.NewString(), AdminID: uuid.NewString(), TeacherID: uuid.NewString(), StudentID: uuid.NewString(), ClassID: uuid.NewString()}
    if _, err := tx.Exec(ctx, "INSERT INTO schools(id, name) VALUES($1, $2)", result.SchoolID, input.SchoolName); err != nil { return BootstrapResult{}, err }
    users := []struct{ id, email, password string }{{result.AdminID, input.AdminEmail, input.AdminPassword}, {result.TeacherID, input.TeacherEmail, input.TeacherPassword}, {result.StudentID, input.StudentEmail, input.StudentPassword}}
    for _, user := range users {
        hash, err := HashPassword(user.password)
        if err != nil { return BootstrapResult{}, err }
        email := strings.ToLower(strings.TrimSpace(user.email))
        if !strings.Contains(email, "@") { return BootstrapResult{}, fmt.Errorf("invalid bootstrap email %q", email) }
        if _, err := tx.Exec(ctx, "INSERT INTO users(id, school_id, email, display_name, password_hash) VALUES($1, $2, $3, $4, $5)", user.id, result.SchoolID, email, email, hash); err != nil { return BootstrapResult{}, err }
    }
    grants := []struct{ userID string; actions []string }{{result.AdminID, []string{"school.manage", "course.edit", "course.publish", "course.assign", "assessment.assess"}}, {result.TeacherID, []string{"course.edit", "course.publish", "course.assign", "assessment.assess"}}, {result.StudentID, []string{"course.learn"}}}
    for _, grant := range grants {
        for _, action := range grant.actions {
            if _, err := tx.Exec(ctx, "INSERT INTO capability_grants(user_id, action, scope_type, scope_id) VALUES($1, $2, 'school', $3)", grant.userID, action, result.SchoolID); err != nil { return BootstrapResult{}, err }
        }
    }
    if _, err := tx.Exec(ctx, "INSERT INTO classes(id, school_id, name) VALUES($1, $2, $3)", result.ClassID, result.SchoolID, input.ClassName); err != nil { return BootstrapResult{}, err }
    for _, member := range []struct{ userID, role string }{{result.TeacherID, "teacher"}, {result.StudentID, "student"}, {result.AdminID, "teacher"}} {
        if _, err := tx.Exec(ctx, "INSERT INTO class_members(class_id, user_id, role) VALUES($1, $2, $3)", result.ClassID, member.userID, member.role); err != nil { return BootstrapResult{}, err }
    }
    return result, tx.Commit(ctx)
}

func Require(ctx context.Context, pool *pgxpool.Pool, userID, action, scopeType, scopeID string) bool {
    var allowed bool
    if err := pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM capability_grants WHERE user_id=$1 AND action=$2 AND scope_type=$3 AND scope_id=$4)", userID, action, scopeType, scopeID).Scan(&allowed); err != nil { return false }
    return allowed
}
```

- [ ] **Step 5: Verify and commit**

Run `gofmt -w internal/identity`, `go test ./internal/identity -count=1`, and `go test ./...`.
Expected: all identity and existing tests pass.

```bash
git add internal/identity
git commit -m "feat: add school identity and capabilities"
```

### Task 3: Persist immutable course drafts and publication

Every save inserts a new immutable draft revision and advances `current_draft_id`; base revisions are optimistic-concurrency tokens, so a second editor cannot overwrite a newer draft or publish stale content. Published revisions remain unchanged when later drafts are created.

**Files:**
- Create: `internal/school/courses.go`, `internal/school/events.go`, `internal/school/courses_test.go`

- [ ] **Step 1: Write failing publication tests**

Create `internal/school/courses_test.go`:

```go
package school

import (
    "context"
    "errors"
    "testing"

    "github.com/grownetics/courseware/internal/course"
    "github.com/grownetics/courseware/internal/identity"
    "github.com/grownetics/courseware/internal/testsupport"
)

func setupSchool(t *testing.T) (*Store, identity.BootstrapResult) {
    t.Helper()
    pool := testsupport.Database(t)
    result, err := identity.Bootstrap(context.Background(), pool, identity.BootstrapInput{SchoolName: "Test School", AdminEmail: "admin@test", AdminPassword: "admin-password-1", TeacherEmail: "teacher@test", TeacherPassword: "teacher-password-1", StudentEmail: "student@test", StudentPassword: "student-password-1", ClassName: "CEA 101"})
    if err != nil { t.Fatal(err) }
    return &Store{Pool: pool}, result
}

func TestDraftPublishAndRevisionHistory(t *testing.T) {
    store, ids := setupSchool(t)
    ctx := context.Background()
    draft, err := store.CreateCourse(ctx, ids.SchoolID, ids.TeacherID, "Vent coupling")
    if err != nil { t.Fatal(err) }
    content := draft.Content
    content.Steps[0].Transitions["continue"] = "review"
    content.Steps = append(content.Steps, course.Step{ID: "review", Type: "explanation", Title: "Review", Body: "Review the result.", Activity: []byte("null"), Transitions: course.TransitionTargets{"continue": ""}})
    saved, err := store.SaveDraft(ctx, draft.CourseID, draft.Revision, content)
    if err != nil { t.Fatal(err) }
    if saved.Revision != 2 { t.Fatalf("saved revision = %d", saved.Revision) }
    if _, err := store.SaveDraft(ctx, draft.CourseID, draft.Revision, content); !errors.Is(err, ErrConflict) { t.Fatalf("second editor stale save = %v", err) }
    if _, err := store.Publish(ctx, draft.CourseID, draft.Revision, ids.TeacherID); !errors.Is(err, ErrConflict) { t.Fatalf("stale publish = %v", err) }
    published, err := store.Publish(ctx, draft.CourseID, saved.Revision, ids.TeacherID)
    if err != nil { t.Fatal(err) }
    if published.State != "published" { t.Fatalf("state = %s", published.State) }
    next, err := store.SaveDraft(ctx, draft.CourseID, published.Revision, content)
    if err != nil { t.Fatal(err) }
    if next.Revision != 3 || next.State != "draft" { t.Fatalf("next revision = %+v", next) }
    if _, err := store.SaveDraft(ctx, draft.CourseID, published.Revision, content); !errors.Is(err, ErrConflict) { t.Fatalf("stale save error = %v", err) }
    original, err := store.Published(ctx, draft.CourseID)
    if err != nil { t.Fatal(err) }
    if original.Revision != 2 { t.Fatalf("published revision changed to %d", original.Revision) }
    var events int
    if err := store.Pool.QueryRow(ctx, "SELECT count(*) FROM domain_events WHERE event_type='course.published' AND subject_id=$1", draft.CourseID).Scan(&events); err != nil { t.Fatal(err) }
    if events != 1 { t.Fatalf("publication events = %d", events) }
}
```

- [ ] **Step 2: Run the test and observe failure**

Run `go test ./internal/school -count=1`.
Expected: FAIL because `Store`, `CreateCourse`, `SaveDraft`, `Publish`, and `ErrConflict` are undefined.

- [ ] **Step 3: Implement domain events and course persistence**

Create `internal/school/events.go`:

```go
package school

import (
    "context"
    "encoding/json"

    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
)

func emit(ctx context.Context, tx pgx.Tx, schoolID, actorID, eventType, eventKey, subjectID string, payload any) error {
    encoded, err := json.Marshal(payload)
    if err != nil { return err }
    _, err = tx.Exec(ctx, "INSERT INTO domain_events(id, event_key, event_type, school_id, actor_id, subject_id, payload) VALUES($1, $2, $3, $4, $5, $6, $7)", uuid.NewString(), eventKey, eventType, schoolID, actorID, subjectID, encoded)
    return err
}
```

Create `internal/school/courses.go`:

```go
package school

import (
    "context"
    "encoding/json"
    "errors"
    "time"

    "github.com/google/uuid"
    "github.com/grownetics/courseware/internal/course"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

var ErrConflict = errors.New("course changed since the requested base revision")
var ErrNotFound = errors.New("course or revision not found")

type Store struct { Pool *pgxpool.Pool }

type Revision struct {
    ID string `json:"id"`
    CourseID string `json:"courseId"`
    State string `json:"state"`
    CreatedBy string `json:"createdBy"`
    Revision int `json:"revision"`
    Content course.Course `json:"content"`
    CreatedAt time.Time `json:"createdAt"`
    PublishedAt *time.Time `json:"publishedAt,omitempty"`
}

func (s *Store) CreateCourse(ctx context.Context, schoolID, authorID, title string) (Revision, error) {
    id := uuid.NewString()
    content := course.Course{SchemaVersion: 1, CourseID: id, Revision: 1, Title: title, FirstStep: "introduction", Steps: []course.Step{{ID: "introduction", Type: "explanation", Title: "Introduction", Body: "Introduce the lesson.", Activity: []byte("null"), Transitions: course.TransitionTargets{"continue": ""}}}}
    if _, err := course.Parse(mustJSON(content)); err != nil { return Revision{}, err }
    revision := Revision{ID: uuid.NewString(), CourseID: id, State: "draft", Revision: 1, Content: content, CreatedBy: authorID, CreatedAt: time.Now()}
    tx, err := s.Pool.BeginTx(ctx, pgx.TxOptions{})
    if err != nil { return Revision{}, err }
    defer tx.Rollback(ctx)
    if _, err := tx.Exec(ctx, "INSERT INTO courses(id, school_id, title, current_draft_id, created_by) VALUES($1, $2, $3, $4, $5)", id, schoolID, title, revision.ID, authorID); err != nil { return Revision{}, err }
    if _, err := tx.Exec(ctx, "INSERT INTO course_revisions(id, course_id, revision, state, content, created_by) VALUES($1, $2, $3, $4, $5, $6)", revision.ID, id, 1, "draft", mustJSON(content), authorID); err != nil { return Revision{}, err }
    return revision, tx.Commit(ctx)
}

func (s *Store) SaveDraft(ctx context.Context, courseID string, baseRevision int, content course.Course) (Revision, error) {
    tx, err := s.Pool.BeginTx(ctx, pgx.TxOptions{})
    if err != nil { return Revision{}, err }
    defer tx.Rollback(ctx)
    var draftID, publishedID, authorID string
    if err := tx.QueryRow(ctx, "SELECT coalesce(current_draft_id, ''), coalesce(current_published_id, ''), created_by FROM courses WHERE id=$1 FOR UPDATE", courseID).Scan(&draftID, &publishedID, &authorID); err != nil { return Revision{}, ErrNotFound }
    if draftID == "" && publishedID == "" { return Revision{}, ErrConflict }
    currentID := draftID
    if currentID == "" { currentID = publishedID }
    var currentRevision int
    if err := tx.QueryRow(ctx, "SELECT revision FROM course_revisions WHERE id=$1", currentID).Scan(&currentRevision); err != nil { return Revision{}, err }
    if currentRevision != baseRevision { return Revision{}, ErrConflict }
    nextRevision := currentRevision + 1
    content.CourseID = courseID
    content.Revision = nextRevision
    parsed, err := course.Parse(mustJSON(content))
    if err != nil { return Revision{}, err }
    content = parsed
    revisionID := uuid.NewString()
    if _, err := tx.Exec(ctx, "INSERT INTO course_revisions(id, course_id, revision, state, content, created_by) VALUES($1, $2, $3, 'draft', $4, $5)", revisionID, courseID, nextRevision, mustJSON(content), authorID); err != nil { return Revision{}, err }
    if _, err := tx.Exec(ctx, "UPDATE courses SET current_draft_id=$1 WHERE id=$2", revisionID, courseID); err != nil { return Revision{}, err }
    return Revision{ID: revisionID, CourseID: courseID, State: "draft", Revision: nextRevision, Content: content, CreatedBy: authorID, CreatedAt: time.Now()}, tx.Commit(ctx)
}

func (s *Store) Publish(ctx context.Context, courseID string, baseRevision int, actorID string) (Revision, error) {
    tx, err := s.Pool.BeginTx(ctx, pgx.TxOptions{})
    if err != nil { return Revision{}, err }
    defer tx.Rollback(ctx)
    var schoolID, draftID, publishedID string
    if err := tx.QueryRow(ctx, "SELECT school_id, coalesce(current_draft_id, ''), coalesce(current_published_id, '') FROM courses WHERE id=$1 FOR UPDATE", courseID).Scan(&schoolID, &draftID, &publishedID); err != nil { return Revision{}, ErrNotFound }
    if draftID == "" {
        var current int
        if publishedID != "" {
            if err := tx.QueryRow(ctx, "SELECT revision FROM course_revisions WHERE id=$1", publishedID).Scan(&current); err == nil && current != baseRevision { return Revision{}, ErrConflict }
        }
        return Revision{}, ErrNotFound
    }
    var revision Revision
    var raw []byte
    if err := tx.QueryRow(ctx, "SELECT id, revision, content, created_by, created_at FROM course_revisions WHERE id=$1 AND state='draft' FOR UPDATE", draftID).Scan(&revision.ID, &revision.Revision, &raw, &revision.CreatedBy, &revision.CreatedAt); err != nil { return Revision{}, err }
    if revision.Revision != baseRevision { return Revision{}, ErrConflict }
    parsed, err := course.Parse(raw)
    if err != nil { return Revision{}, err }
    if _, err := tx.Exec(ctx, "UPDATE course_revisions SET state='published', published_at=now() WHERE id=$1", draftID); err != nil { return Revision{}, err }
    if _, err := tx.Exec(ctx, "UPDATE courses SET current_draft_id=NULL, current_published_id=$1 WHERE id=$2", draftID, courseID); err != nil { return Revision{}, err }
    if err := emit(ctx, tx, schoolID, actorID, "course.published", "course.published:"+draftID, courseID, map[string]any{"revisionId": draftID, "revision": revision.Revision}); err != nil { return Revision{}, err }
    revision.CourseID, revision.State, revision.Content = courseID, "published", parsed
    now := time.Now()
    revision.PublishedAt = &now
    return revision, tx.Commit(ctx)
}

func (s *Store) Published(ctx context.Context, courseID string) (Revision, error) {
    var revision Revision
    var raw []byte
    err := s.Pool.QueryRow(ctx, "SELECT id, revision, content, created_by, created_at, published_at FROM course_revisions WHERE course_id=$1 AND state='published' ORDER BY revision DESC LIMIT 1", courseID).Scan(&revision.ID, &revision.Revision, &raw, &revision.CreatedBy, &revision.CreatedAt, &revision.PublishedAt)
    if errors.Is(err, pgx.ErrNoRows) { return Revision{}, ErrNotFound }
    if err != nil { return Revision{}, err }
    parsed, err := course.Parse(raw)
    if err != nil { return Revision{}, err }
    revision.CourseID, revision.State, revision.Content = courseID, "published", parsed
    return revision, nil
}

func (s *Store) Current(ctx context.Context, courseID string) (Revision, error) {
    var revision Revision
    var raw []byte
    err := s.Pool.QueryRow(ctx, "SELECT r.id, r.revision, r.state, r.content, r.created_by, r.created_at FROM courses c JOIN course_revisions r ON r.id=coalesce(c.current_draft_id, c.current_published_id) WHERE c.id=$1", courseID).Scan(&revision.ID, &revision.Revision, &revision.State, &raw, &revision.CreatedBy, &revision.CreatedAt)
    if errors.Is(err, pgx.ErrNoRows) { return s.Published(ctx, courseID) }
    if err != nil { return Revision{}, err }
    parsed, err := course.Parse(raw)
    if err != nil { return Revision{}, err }
    revision.CourseID, revision.Content = courseID, parsed
    return revision, nil
}

func mustJSON(value any) []byte {
    encoded, err := json.Marshal(value)
    if err != nil { panic(err) }
    return encoded
}
```

`mustJSON` is limited to already typed domain values and converts programmer errors into a panic before any HTTP response is written. Do not use it for untrusted map input.

- [ ] **Step 4: Verify and commit**

Run `gofmt -w internal/school`, `go test ./internal/school -count=1`, and `go test ./...`.
Expected: publication history, stale conflict, and single event tests pass.

```bash
git add internal/school
git commit -m "feat: persist immutable course revisions"
```

### Task 4: Assign published revisions and record domain events

**Files:**
- Create: `internal/school/assignments.go`, `internal/school/assignments_test.go`

- [ ] **Step 1: Write failing assignment tests**

Create `internal/school/assignments_test.go`:

```go
package school

import (
    "context"
    "testing"
)

func TestAssignmentRequiresPublishedRevisionAndRecordsEvent(t *testing.T) {
    store, ids := setupSchool(t)
    ctx := context.Background()
    draft, err := store.CreateCourse(ctx, ids.SchoolID, ids.TeacherID, "Vent coupling")
    if err != nil { t.Fatal(err) }
    if _, err := store.Assign(ctx, ids.ClassID, draft.ID, ids.TeacherID); err == nil { t.Fatal("assigned a draft") }
    published, err := store.Publish(ctx, draft.CourseID, draft.Revision, ids.TeacherID)
    if err != nil { t.Fatal(err) }
    if _, err := store.Assign(ctx, ids.ClassID, published.ID, ids.StudentID); err == nil { t.Fatal("student assigned a course without teacher membership") }
    assignment, err := store.Assign(ctx, ids.ClassID, published.ID, ids.TeacherID)
    if err != nil { t.Fatal(err) }
    if assignment.ClassID != ids.ClassID || assignment.CourseRevisionID != published.ID { t.Fatalf("assignment = %+v", assignment) }
    if _, err := store.Assign(ctx, ids.ClassID, published.ID, ids.TeacherID); err != nil { t.Fatalf("idempotent assignment retry: %v", err) }
    assignments, err := store.StudentAssignments(ctx, ids.StudentID)
    if err != nil { t.Fatal(err) }
    if len(assignments) != 1 || assignments[0].Content.CourseID != draft.CourseID { t.Fatalf("student assignments = %+v", assignments) }
    var events int
    if err := store.Pool.QueryRow(ctx, "SELECT count(*) FROM domain_events WHERE event_type='assignment.created' AND subject_id=$1", assignment.ID).Scan(&events); err != nil { t.Fatal(err) }
    if events != 1 { t.Fatalf("assignment events = %d", events) }
}
```

- [ ] **Step 2: Run the test and observe failure**

Run `go test ./internal/school -run TestAssignmentRequiresPublishedRevisionAndRecordsEvent -count=1`.
Expected: FAIL because `Assign` and `StudentAssignments` are undefined.

- [ ] **Step 3: Implement assignment persistence**

Create `internal/school/assignments.go`:

```go
package school

import (
    "context"
    "errors"
    "time"

    "github.com/google/uuid"
    "github.com/grownetics/courseware/internal/course"
    "github.com/jackc/pgx/v5"
)

var ErrAssignmentNotFound = errors.New("assignment not found")

type Assignment struct {
    ID string `json:"id"`
    ClassID string `json:"classId"`
    CourseRevisionID string `json:"courseRevisionId"`
    AssignedBy string `json:"assignedBy"`
    CreatedAt time.Time `json:"createdAt"`
}

type StudentAssignment struct {
    Assignment
    Content course.Course `json:"content"`
}

func (s *Store) Assign(ctx context.Context, classID, revisionID, actorID string) (Assignment, error) {
    tx, err := s.Pool.BeginTx(ctx, pgx.TxOptions{})
    if err != nil { return Assignment{}, err }
    defer tx.Rollback(ctx)
    var schoolID string
    if err := tx.QueryRow(ctx, "SELECT school_id FROM classes WHERE id=$1", classID).Scan(&schoolID); err != nil { return Assignment{}, ErrAssignmentNotFound }
    var teacher bool
    if err := tx.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM class_members WHERE class_id=$1 AND user_id=$2 AND role='teacher')", classID, actorID).Scan(&teacher); err != nil || !teacher { return Assignment{}, ErrAssignmentNotFound }
    var courseID string
    if err := tx.QueryRow(ctx, "SELECT r.course_id FROM course_revisions r JOIN courses c ON c.id=r.course_id WHERE r.id=$1 AND r.state='published' AND c.school_id=$2", revisionID, schoolID).Scan(&courseID); err != nil { return Assignment{}, ErrAssignmentNotFound }
    assignment := Assignment{ClassID: classID, CourseRevisionID: revisionID, AssignedBy: actorID, CreatedAt: time.Now()}
    err = tx.QueryRow(ctx, "INSERT INTO assignments(id, class_id, course_revision_id, assigned_by) VALUES($1, $2, $3, $4) ON CONFLICT(class_id, course_revision_id) DO NOTHING RETURNING id", uuid.NewString(), classID, revisionID, actorID).Scan(&assignment.ID)
    if errors.Is(err, pgx.ErrNoRows) {
        if err := tx.QueryRow(ctx, "SELECT id, assigned_by, created_at FROM assignments WHERE class_id=$1 AND course_revision_id=$2", classID, revisionID).Scan(&assignment.ID, &assignment.AssignedBy, &assignment.CreatedAt); err != nil { return Assignment{}, err }
        return assignment, tx.Commit(ctx)
    }
    if err != nil { return Assignment{}, err }
    if err := emit(ctx, tx, schoolID, actorID, "assignment.created", "assignment.created:"+assignment.ID, assignment.ID, map[string]any{"classId": classID, "courseId": courseID, "courseRevisionId": revisionID}); err != nil { return Assignment{}, err }
    return assignment, tx.Commit(ctx)
}

func (s *Store) StudentAssignments(ctx context.Context, studentID string) ([]StudentAssignment, error) {
    rows, err := s.Pool.Query(ctx, "SELECT a.id, a.class_id, a.course_revision_id, a.assigned_by, a.created_at, r.content FROM assignments a JOIN class_members m ON m.class_id=a.class_id AND m.user_id=$1 AND m.role='student' JOIN course_revisions r ON r.id=a.course_revision_id AND r.state='published' ORDER BY a.created_at", studentID)
    if err != nil { return nil, err }
    defer rows.Close()
    var result []StudentAssignment
    for rows.Next() {
        var item StudentAssignment
        var raw []byte
        if err := rows.Scan(&item.ID, &item.ClassID, &item.CourseRevisionID, &item.AssignedBy, &item.CreatedAt, &raw); err != nil { return nil, err }
        parsed, err := course.Parse(raw)
        if err != nil { return nil, err }
        item.Content = parsed
        result = append(result, item)
    }
    return result, rows.Err()
}
```

- [ ] **Step 4: Verify and commit**

Run `gofmt -w internal/school`, `go test ./internal/school -count=1`, and `go test ./...`.
Expected: draft rejection, published assignment, student membership filtering, and single event tests pass.

```bash
git add internal/school
git commit -m "feat: assign published courses to classes"
```

### Task 5: Expose authenticated school APIs

**Files:**
- Create: `internal/school/http.go`, `internal/school/http_test.go`, `cmd/server/main.go`, `internal/config/config.go`, `internal/config/config_test.go`

- [ ] **Step 1: Write failing authenticated API tests**

Create `internal/school/http_test.go`:

```go
package school

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/grownetics/courseware/internal/course"
)

func TestTeacherAndStudentAPIFlow(t *testing.T) {
    store, ids := setupSchool(t)
    handler := NewHTTPHandler(store)
    login := func(email, password string) *http.Cookie {
        body, _ := json.Marshal(map[string]string{"email": email, "password": password})
        request := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body))
        response := httptest.NewRecorder()
        handler.ServeHTTP(response, request)
        if response.Code != http.StatusOK { t.Fatalf("login status = %d: %s", response.Code, response.Body.String()) }
        cookies := response.Result().Cookies()
        if len(cookies) != 1 || !cookies[0].HttpOnly || !cookies[0].Secure { t.Fatalf("cookies = %+v", cookies) }
        return cookies[0]
    }
    teacherCookie := login("teacher@test", "teacher-password-1")
    create := httptest.NewRequest(http.MethodPost, "/api/teacher/courses", bytes.NewBufferString(`{"title":"Vent coupling"}`))
    create.AddCookie(teacherCookie)
    created := httptest.NewRecorder()
    handler.ServeHTTP(created, create)
    if created.Code != http.StatusCreated { t.Fatalf("create status = %d: %s", created.Code, created.Body.String()) }
    var revision Revision
    if err := json.Unmarshal(created.Body.Bytes(), &revision); err != nil { t.Fatal(err) }
    content := revision.Content
    content.Steps[0].Transitions["continue"] = "predict"
    content.Steps = append(content.Steps, course.Step{ID: "predict", Type: "numeric", Title: "Predict temperature", Body: "Predict the mixing result.", Activity: []byte(`{"prompt":"Temperature","answer":24.4,"tolerance":0.05,"unit":"°C","hints":["Use the balance"]}`), Transitions: course.TransitionTargets{"correct": "", "incorrect": "predict", "invalid": "predict"}})
    draftBody, _ := json.Marshal(map[string]any{"baseRevision": 1, "content": content})
    save := httptest.NewRequest(http.MethodPut, "/api/teacher/courses/"+revision.CourseID+"/draft", bytes.NewReader(draftBody))
    save.AddCookie(teacherCookie)
    savedResponse := httptest.NewRecorder()
    handler.ServeHTTP(savedResponse, save)
    if savedResponse.Code != http.StatusOK { t.Fatalf("draft save status = %d: %s", savedResponse.Code, savedResponse.Body.String()) }
    var savedRevision Revision
    if err := json.Unmarshal(savedResponse.Body.Bytes(), &savedRevision); err != nil { t.Fatal(err) }
    publish := httptest.NewRequest(http.MethodPost, "/api/teacher/courses/"+revision.CourseID+"/publish", bytes.NewBufferString(`{"baseRevision":2}`))
    publish.AddCookie(teacherCookie)
    published := httptest.NewRecorder()
    handler.ServeHTTP(published, publish)
    if published.Code != http.StatusOK { t.Fatalf("publish status = %d: %s", published.Code, published.Body.String()) }
    var publishedRevision Revision
    if err := json.Unmarshal(published.Body.Bytes(), &publishedRevision); err != nil { t.Fatal(err) }
    teacherView := httptest.NewRequest(http.MethodGet, "/api/teacher/courses/"+revision.CourseID, nil)
    teacherView.AddCookie(teacherCookie)
    teacherResponse := httptest.NewRecorder()
    handler.ServeHTTP(teacherResponse, teacherView)
    if !bytes.Contains(teacherResponse.Body.Bytes(), []byte(`"answer"`)) || !bytes.Contains(teacherResponse.Body.Bytes(), []byte(`"hints"`)) { t.Fatal("teacher revision lost authored answer or hints") }
    var currentRevision Revision
    if err := json.Unmarshal(teacherResponse.Body.Bytes(), &currentRevision); err != nil { t.Fatal(err) }
    if currentRevision.ID != publishedRevision.ID { t.Fatalf("teacher current revision = %s, want %s", currentRevision.ID, publishedRevision.ID) }
    stale := httptest.NewRequest(http.MethodPost, "/api/teacher/courses/"+revision.CourseID+"/publish", bytes.NewBufferString(`{"baseRevision":1}`))
    stale.AddCookie(teacherCookie)
    staleResponse := httptest.NewRecorder()
    handler.ServeHTTP(staleResponse, stale)
    if staleResponse.Code != http.StatusConflict { t.Fatalf("stale publish status = %d", staleResponse.Code) }
    invalidDraft := httptest.NewRequest(http.MethodPut, "/api/teacher/courses/"+revision.CourseID+"/draft", bytes.NewBufferString(`{"baseRevision":2,"content":{}}`))
    invalidDraft.AddCookie(teacherCookie)
    invalidResponse := httptest.NewRecorder()
    handler.ServeHTTP(invalidResponse, invalidDraft)
    if invalidResponse.Code != http.StatusBadRequest { t.Fatalf("invalid draft status = %d", invalidResponse.Code) }
    assign := httptest.NewRequest(http.MethodPost, "/api/teacher/courses/"+revision.CourseID+"/assign", bytes.NewBufferString(`{"classId":"`+ids.ClassID+`","revisionId":"`+publishedRevision.ID+`"}`))
    assign.AddCookie(teacherCookie)
    assigned := httptest.NewRecorder()
    handler.ServeHTTP(assigned, assign)
    if assigned.Code != http.StatusCreated { t.Fatalf("assign status = %d: %s", assigned.Code, assigned.Body.String()) }
    studentCookie := login("student@test", "student-password-1")
    list := httptest.NewRequest(http.MethodGet, "/api/student/assignments", nil)
    list.AddCookie(studentCookie)
    listed := httptest.NewRecorder()
    handler.ServeHTTP(listed, list)
    if listed.Code != http.StatusOK || !bytes.Contains(listed.Body.Bytes(), []byte(revision.CourseID)) { t.Fatalf("assignments = %d %s", listed.Code, listed.Body.String()) }
    for _, hidden := range []string{`"answer"`, `"tolerance"`, `"hints"`} {
        if bytes.Contains(listed.Body.Bytes(), []byte(hidden)) { t.Fatalf("student response exposes %s", hidden) }
    }
    crossSite := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(`{"email":"student@test","password":"student-password-1"}`))
    crossSite.Header.Set("Origin", "https://attacker.invalid")
    rejected := httptest.NewRecorder()
    handler.ServeHTTP(rejected, crossSite)
    if rejected.Code != http.StatusForbidden { t.Fatalf("cross-site login status = %d", rejected.Code) }
}
```

- [ ] **Step 2: Run the test and observe failure**

Run `go test ./internal/school -run TestTeacherAndStudentAPIFlow -count=1`.
Expected: FAIL because `NewHTTPHandler` is undefined.

- [ ] **Step 3: Add public course projection and authenticated handlers**

Add to `internal/course/course.go`:

```go
func (c Course) Public() Course {
    public := c
    public.Steps = make([]Step, len(c.Steps))
    for index, step := range c.Steps {
        public.Steps[index] = step
        if step.Type != "numeric" { continue }
        var fields map[string]any
        if err := json.Unmarshal(step.Activity, &fields); err != nil { panic(err) }
        delete(fields, "answer")
        delete(fields, "tolerance")
        delete(fields, "hints")
        public.Steps[index].Activity = mustPublicJSON(fields)
    }
    return public
}

func mustPublicJSON(value any) []byte {
    encoded, err := json.Marshal(value)
    if err != nil { panic(err) }
    return encoded
}
```

`Public` removes expected answers, tolerances, and unrevealed hints from every numeric activity. Evaluation continues using the stored full revision.

Create `internal/config/config.go`:

```go
package config

import (
    "errors"
    "os"
)

type Config struct { DatabaseURL, Listen, Origin string; SecureCookies bool }

func FromEnv() (Config, error) {
    url := os.Getenv("COURSEWARE_DATABASE_URL")
    if url == "" { return Config{}, errors.New("COURSEWARE_DATABASE_URL is required") }
    listen := os.Getenv("COURSEWARE_LISTEN")
    if listen == "" { listen = "127.0.0.1:8080" }
    origin := os.Getenv("COURSEWARE_ORIGIN")
    if origin == "" { origin = "http://" + listen }
    return Config{DatabaseURL: url, Listen: listen, Origin: origin, SecureCookies: os.Getenv("COURSEWARE_DEV_INSECURE_COOKIES") != "true"}, nil
}
```

Create `internal/config/config_test.go`:

```go
package config

import "testing"

func TestRequiresDatabaseURL(t *testing.T) {
    t.Setenv("COURSEWARE_DATABASE_URL", "")
    if _, err := FromEnv(); err == nil { t.Fatal("expected missing database URL error") }
}

func TestDefaultsToLoopbackAndSecureCookies(t *testing.T) {
    t.Setenv("COURSEWARE_DATABASE_URL", "postgres://test")
    t.Setenv("COURSEWARE_LISTEN", "")
    t.Setenv("COURSEWARE_DEV_INSECURE_COOKIES", "")
    cfg, err := FromEnv()
    if err != nil { t.Fatal(err) }
    if cfg.Listen != "127.0.0.1:8080" || cfg.Origin != "http://127.0.0.1:8080" || !cfg.SecureCookies { t.Fatalf("config = %+v", cfg) }
}
```

Create `internal/school/http.go`:

```go
package school

import (
    "context"
    "encoding/json"
    "errors"
    "io"
    "net/http"
    "strings"
    "time"

    "github.com/grownetics/courseware/internal/course"
    "github.com/grownetics/courseware/internal/identity"
)

type HTTP struct { store *Store; secureCookies bool; allowedOrigin string }

func NewHTTPHandler(store *Store) http.Handler { return NewHTTPHandlerWithCookies(store, true) }

func NewHTTPHandlerWithCookies(store *Store, secure bool) http.Handler {
    return NewHTTPHandlerWithOptions(store, secure, "http://127.0.0.1:8080")
}

func NewHTTPHandlerWithOptions(store *Store, secure bool, allowedOrigin string) http.Handler {
    h := &HTTP{store: store, secureCookies: secure, allowedOrigin: strings.TrimRight(allowedOrigin, "/")}
    mux := http.NewServeMux()
    mux.HandleFunc("GET /api/health", h.health)
    mux.HandleFunc("POST /api/login", h.login)
    mux.HandleFunc("POST /api/logout", h.logout)
    mux.HandleFunc("POST /api/teacher/courses", h.withCapability("course.edit", h.createCourse))
    mux.HandleFunc("GET /api/teacher/courses/{id}", h.withCapability("course.edit", h.course))
    mux.HandleFunc("PUT /api/teacher/courses/{id}/draft", h.withCapability("course.edit", h.saveDraft))
    mux.HandleFunc("POST /api/teacher/courses/{id}/publish", h.withCapability("course.publish", h.publish))
    mux.HandleFunc("POST /api/teacher/courses/{id}/assign", h.withCapability("course.assign", h.assign))
    mux.HandleFunc("GET /api/student/assignments", h.withCapability("course.learn", h.assignments))
    return mux
}

func (h *HTTP) health(w http.ResponseWriter, r *http.Request) {
    if err := h.store.Pool.Ping(r.Context()); err != nil { write(w, http.StatusServiceUnavailable, map[string]string{"status": "unavailable"}); return }
    write(w, http.StatusOK, map[string]string{"status": "ok"})
}

func write(w http.ResponseWriter, status int, value any) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(value)
}

func decode(w http.ResponseWriter, r *http.Request, destination any) error {
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

func (h *HTTP) rejectCrossSiteMutation(w http.ResponseWriter, r *http.Request) bool {
    if r.Method != http.MethodPost && r.Method != http.MethodPut && r.Method != http.MethodPatch && r.Method != http.MethodDelete { return false }
    origin := r.Header.Get("Origin")
    if origin == "" || origin == h.allowedOrigin { return false }
    write(w, http.StatusForbidden, map[string]string{"error": "origin not allowed"})
    return true
}

func (h *HTTP) login(w http.ResponseWriter, r *http.Request) {
    if h.rejectCrossSiteMutation(w, r) { return }
    var input struct{ Email, Password string }
    if err := decode(w, r, &input); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    var userID, hash string
    if err := h.store.Pool.QueryRow(r.Context(), "SELECT id, password_hash FROM users WHERE lower(email)=lower($1)", input.Email).Scan(&userID, &hash); err != nil || !identity.VerifyPassword(hash, input.Password) { write(w, http.StatusUnauthorized, map[string]string{"error": "invalid credentials"}); return }
    token, err := identity.CreateSession(r.Context(), h.store.Pool, userID, 24*time.Hour)
    if err != nil { write(w, http.StatusInternalServerError, map[string]string{"error": "session creation failed"}); return }
    http.SetCookie(w, &http.Cookie{Name: "courseware_session", Value: token, Path: "/", HttpOnly: true, Secure: h.secureCookies, SameSite: http.SameSiteLaxMode, MaxAge: 86400})
    write(w, http.StatusOK, map[string]string{"userId": userID})
}

func (h *HTTP) logout(w http.ResponseWriter, r *http.Request) {
    if h.rejectCrossSiteMutation(w, r) { return }
    if cookie, err := r.Cookie("courseware_session"); err == nil { _ = identity.DeleteSession(r.Context(), h.store.Pool, cookie.Value) }
    http.SetCookie(w, &http.Cookie{Name: "courseware_session", Value: "", Path: "/", HttpOnly: true, Secure: h.secureCookies, SameSite: http.SameSiteLaxMode, MaxAge: -1})
    write(w, http.StatusOK, map[string]bool{"loggedOut": true})
}

func (h *HTTP) withCapability(action string, next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        if h.rejectCrossSiteMutation(w, r) { return }
        cookie, err := r.Cookie("courseware_session")
        if err != nil { write(w, http.StatusUnauthorized, map[string]string{"error": "authentication required"}); return }
        userID, err := identity.Authenticate(r.Context(), h.store.Pool, cookie.Value)
        if err != nil { write(w, http.StatusUnauthorized, map[string]string{"error": "authentication required"}); return }
        var schoolID string
        if err := h.store.Pool.QueryRow(r.Context(), "SELECT school_id FROM users WHERE id=$1", userID).Scan(&schoolID); err != nil { write(w, http.StatusUnauthorized, map[string]string{"error": "authentication required"}); return }
        if !identity.Require(r.Context(), h.store.Pool, userID, action, "school", schoolID) { write(w, http.StatusForbidden, map[string]string{"error": "capability required"}); return }
        r = r.WithContext(context.WithValue(r.Context(), userContextKey{}, userID))
        next(w, r)
    }
}

type userContextKey struct{}

func userID(r *http.Request) string { return r.Context().Value(userContextKey{}).(string) }

func (h *HTTP) sameSchoolCourse(r *http.Request, courseID string) bool {
    var allowed bool
    if err := h.store.Pool.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM users u JOIN courses c ON c.school_id=u.school_id WHERE u.id=$1 AND c.id=$2)", userID(r), courseID).Scan(&allowed); err != nil { return false }
    return allowed
}

func (h *HTTP) sameSchoolClass(r *http.Request, classID string) bool {
    var allowed bool
    if err := h.store.Pool.QueryRow(r.Context(), "SELECT EXISTS(SELECT 1 FROM users u JOIN classes c ON c.school_id=u.school_id WHERE u.id=$1 AND c.id=$2)", userID(r), classID).Scan(&allowed); err != nil { return false }
    return allowed
}

func (h *HTTP) createCourse(w http.ResponseWriter, r *http.Request) {
    var input struct{ Title string }
    if err := decode(w, r, &input); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    var schoolID string
    if err := h.store.Pool.QueryRow(r.Context(), "SELECT school_id FROM users WHERE id=$1", userID(r)).Scan(&schoolID); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": "school not found"}); return }
    revision, err := h.store.CreateCourse(r.Context(), schoolID, userID(r), input.Title)
    if err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    write(w, http.StatusCreated, revision)
}

func (h *HTTP) course(w http.ResponseWriter, r *http.Request) {
    if !h.sameSchoolCourse(r, r.PathValue("id")) { write(w, http.StatusNotFound, map[string]string{"error": "course not found"}); return }
    revision, err := h.store.Current(r.Context(), r.PathValue("id"))
    if err != nil { write(w, http.StatusNotFound, map[string]string{"error": "course not found"}); return }
    write(w, http.StatusOK, revision)
}

func writeStoreError(w http.ResponseWriter, err error) {
    switch {
    case errors.Is(err, ErrConflict):
        write(w, http.StatusConflict, map[string]string{"error": err.Error()})
    case errors.Is(err, ErrNotFound), errors.Is(err, ErrAssignmentNotFound):
        write(w, http.StatusNotFound, map[string]string{"error": err.Error()})
    default:
        write(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
}

func (h *HTTP) saveDraft(w http.ResponseWriter, r *http.Request) {
    if !h.sameSchoolCourse(r, r.PathValue("id")) { write(w, http.StatusNotFound, map[string]string{"error": "course not found"}); return }
    var input struct {
        BaseRevision int `json:"baseRevision"`
        Content json.RawMessage `json:"content"`
    }
    if err := decode(w, r, &input); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    parsed, err := course.Parse(input.Content)
    if err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    revision, err := h.store.SaveDraft(r.Context(), r.PathValue("id"), input.BaseRevision, parsed)
    if err != nil { writeStoreError(w, err); return }
    write(w, http.StatusOK, revision)
}

func (h *HTTP) publish(w http.ResponseWriter, r *http.Request) {
    if !h.sameSchoolCourse(r, r.PathValue("id")) { write(w, http.StatusNotFound, map[string]string{"error": "course not found"}); return }
    var input struct{ BaseRevision int `json:"baseRevision"` }
    if err := decode(w, r, &input); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    revision, err := h.store.Publish(r.Context(), r.PathValue("id"), input.BaseRevision, userID(r))
    if err != nil { writeStoreError(w, err); return }
    write(w, http.StatusOK, revision)
}

func (h *HTTP) assign(w http.ResponseWriter, r *http.Request) {
    if !h.sameSchoolCourse(r, r.PathValue("id")) { write(w, http.StatusNotFound, map[string]string{"error": "course not found"}); return }
    var input struct{ ClassID, RevisionID string }
    if err := decode(w, r, &input); err != nil { write(w, http.StatusBadRequest, map[string]string{"error": err.Error()}); return }
    if !h.sameSchoolClass(r, input.ClassID) { write(w, http.StatusNotFound, map[string]string{"error": "class not found"}); return }
    var revisionCourseID string
    if err := h.store.Pool.QueryRow(r.Context(), "SELECT course_id FROM course_revisions WHERE id=$1 AND state='published'", input.RevisionID).Scan(&revisionCourseID); err != nil || revisionCourseID != r.PathValue("id") { write(w, http.StatusNotFound, map[string]string{"error": "published revision not found for course"}); return }
    assignment, err := h.store.Assign(r.Context(), input.ClassID, input.RevisionID, userID(r))
    if err != nil { write(w, http.StatusNotFound, map[string]string{"error": "published class or revision not found"}); return }
    write(w, http.StatusCreated, assignment)
}

func (h *HTTP) assignments(w http.ResponseWriter, r *http.Request) {
    assignments, err := h.store.StudentAssignments(r.Context(), userID(r))
    if err != nil { write(w, http.StatusInternalServerError, map[string]string{"error": "could not load assignments"}); return }
    for index := range assignments { assignments[index].Content = assignments[index].Content.Public() }
    write(w, http.StatusOK, assignments)
}
```

- [ ] **Step 4: Add the server command**

Create `cmd/server/main.go`:

```go
package main

import (
    "context"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/grownetics/courseware/internal/config"
    "github.com/grownetics/courseware/internal/database"
    "github.com/grownetics/courseware/internal/identity"
    "github.com/grownetics/courseware/internal/school"
)

func main() {
    cfg, err := config.FromEnv()
    if err != nil { log.Fatal(err) }
    pool, err := database.Open(context.Background(), cfg.DatabaseURL)
    if err != nil { log.Fatal(err) }
    defer pool.Close()
    if len(os.Args) > 1 && os.Args[1] == "bootstrap" {
        result, err := identity.Bootstrap(context.Background(), pool, identity.BootstrapInput{
            SchoolName: os.Getenv("COURSEWARE_SCHOOL_NAME"), AdminEmail: os.Getenv("COURSEWARE_ADMIN_EMAIL"), AdminPassword: os.Getenv("COURSEWARE_ADMIN_PASSWORD"), TeacherEmail: os.Getenv("COURSEWARE_TEACHER_EMAIL"), TeacherPassword: os.Getenv("COURSEWARE_TEACHER_PASSWORD"), StudentEmail: os.Getenv("COURSEWARE_STUDENT_EMAIL"), StudentPassword: os.Getenv("COURSEWARE_STUDENT_PASSWORD"), ClassName: os.Getenv("COURSEWARE_CLASS_NAME"),
        })
        if err != nil { log.Fatal(err) }
        log.Printf("school=%s admin=%s teacher=%s student=%s class=%s", result.SchoolID, result.AdminID, result.TeacherID, result.StudentID, result.ClassID)
        return
    }
    server := &http.Server{Addr: cfg.Listen, Handler: school.NewHTTPHandlerWithOptions(&school.Store{Pool: pool}, cfg.SecureCookies, cfg.Origin), ReadHeaderTimeout: 5 * time.Second, IdleTimeout: 60 * time.Second}
    log.Printf("school server: http://%s", cfg.Listen)
    log.Fatal(server.ListenAndServe())
}
```

- [ ] **Step 5: Verify and commit**

Run `gofmt -w cmd/server internal/config internal/school internal/course`, `go test ./internal/config ./internal/school -count=1`, and `go test ./...`.
Expected: authenticated create/publish/assign flow passes; student API does not expose expected answers; all existing tests pass.

```bash
git add cmd/server internal/config internal/school internal/course
git commit -m "feat: expose authenticated school APIs"
```

### Task 6: Verify the complete school server and document operation

**Files:**
- Modify: `.github/workflows/ci.yml`, `README.md`

- [ ] **Step 1: Run all tests with the development database**

Run `make test`.
Expected: all school and existing Go tests pass; all 14 existing browser scenarios remain green.

- [ ] **Step 2: Update CI for the database-backed suite**

The existing `make test` target starts the development database. Update `.github/workflows/ci.yml` only to add this job-level environment:

```yaml
    env:
      COURSEWARE_DEV_INSECURE_COOKIES: 'true'
```

Keep all existing Go/Node setup, npm install, Playwright install, and `make test` steps unchanged. CI must run the real PostgreSQL migration and integration tests rather than skip them.

- [ ] **Step 3: Document school-server operation**

Append to `README.md`:

```markdown
## School server development

The school server adds PostgreSQL-backed identity, scoped capabilities, immutable course publication, class assignments, and a transactional domain-event outbox. It remains a development service, not a production deployment. The API smoke workflow also requires `jq`.

Start the development database:

```sh
docker compose -f compose.dev.yaml up -d --wait db
export COURSEWARE_DATABASE_URL='postgres://courseware:courseware-dev-only@127.0.0.1:55432/courseware?sslmode=disable'
export COURSEWARE_DEV_INSECURE_COOKIES=true
```

The database credentials and insecure-cookie setting are development-only. Production deployment must use separate secrets and secure cookies; no production configuration is provided by this revision.

Bootstrap a school by setting `COURSEWARE_SCHOOL_NAME`, `COURSEWARE_CLASS_NAME`, `COURSEWARE_ADMIN_EMAIL`, `COURSEWARE_ADMIN_PASSWORD`, `COURSEWARE_TEACHER_EMAIL`, `COURSEWARE_TEACHER_PASSWORD`, `COURSEWARE_STUDENT_EMAIL`, and `COURSEWARE_STUDENT_PASSWORD`, then run:

```sh
go run ./cmd/server bootstrap
```

Passwords must contain at least 12 characters. Do not commit `.courseware.env` or real credentials. Start the API with `go run ./cmd/server`; it defaults to `127.0.0.1:8080`.

Current API capabilities include opaque-session login/logout, school-scoped capability checks, mutation Origin checks (`COURSEWARE_ORIGIN`, defaulting to `http://` plus `COURSEWARE_LISTEN`), draft creation/editing, immutable publication, published-class assignment, and student assignment projection with expected answers and unrevealed hints removed. Learner attempts, submissions, assessment, Wails sync, deployment, and gamification remain subsequent plans.
```

- [ ] **Step 4: Run an actual API smoke test**

Start `go run ./cmd/server` with the development environment. Use curl to:

1. Log in as teacher and retain the secure-cookie attributes for inspection.
2. Create a course, then use `jq -n --argjson content "$(cat internal/course/testdata/vent-course.json)" '{baseRevision:1,content:$content}'` as the body of `PUT /api/teacher/courses/<id>/draft` to add the numeric activity and save immutable revision 2. Verify the teacher response retains the answer, tolerance, and hints.
3. Publish revision 2, then query `docker compose -f compose.dev.yaml exec -T db psql -U courseware -d courseware -c "SELECT event_type, subject_id FROM domain_events ORDER BY occurred_at;"` and verify one `course.published` row.
4. Assign it to the bootstrap class and repeat the query to verify one `assignment.created` row.
5. Log in as student and verify the assignment appears without expected answers or hints.
6. Attempt an unauthenticated teacher request and verify HTTP 401, and a student publish request and verify HTTP 403.

Expected: every request exhibits its documented status and data behavior. Stop the server after verification.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/ci.yml README.md
git commit -m "test: verify school server workflows"
```

## Completion evidence

This plan is complete only when:

1. `make test` passes all migration, identity, persistence, assignment, API, activity, course, studio, and 14 browser tests.
2. The actual bootstrap/login/create/publish/assign/student API smoke flow succeeds with correct 401/403 behavior.
3. Published revisions remain unchanged when a later draft is created.
4. Student responses never expose expected answers, tolerances, or unrevealed hints.
5. Publication and assignment events are committed atomically with their domain changes and are not duplicated on retry.
6. No production deployment, learner attempt, submission, assessment, Wails sync, or gamification capability is claimed.
