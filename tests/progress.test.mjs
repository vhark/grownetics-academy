import test from "node:test";
import assert from "node:assert/strict";
import { createProgressStore } from "../js/progress.js";

const currentKey = "grownetics-academy-progress-v2";
const legacyKey = "grownetics-academy-progress-v1";
const modules = [
  { id: "cea-control", lessons: [{ id: "shared" }, { id: "climate" }] },
  { id: "irrigation", lessons: [{ id: "shared" }, { id: "water" }] },
];

class MemoryStorage {
  constructor(values = {}) {
    this.values = new Map(Object.entries(values));
    this.failReads = false;
    this.failWrites = false;
    this.failRemovals = false;
  }
  getItem(key) {
    if (this.failReads) throw new Error("Storage blocked");
    return this.values.get(key) ?? null;
  }
  setItem(key, value) {
    if (this.failWrites) throw new Error("Storage quota exceeded");
    this.values.set(key, String(value));
  }
  removeItem(key) {
    if (this.failRemovals) throw new Error("Storage blocked");
    this.values.delete(key);
  }
}

const legacy = JSON.stringify({
  completed: ["shared", "shared", "removed", 42],
  lastChapter: "climate",
});

function storedV2(moduleProgress, lastVisited = null) {
  return JSON.stringify({ version: 2, modules: moduleProgress, lastVisited });
}

test("migration preserves completion and an uncompleted last lesson across reload", () => {
  const storage = new MemoryStorage({ [legacyKey]: legacy, unrelated: "keep" });
  const store = createProgressStore(modules, { storage });
  assert.deepEqual(store.snapshot("cea-control").completed, ["shared"]);
  assert.equal(store.snapshot("cea-control").lastLesson, "climate");
  assert.deepEqual(store.resume(), {
    moduleId: "cea-control",
    lessonId: "climate",
  });
  assert.deepEqual(store.snapshot("irrigation").completed, []);
  assert.equal(storage.getItem(legacyKey), null);
  assert.equal(storage.getItem("unrelated"), "keep");
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.snapshot("cea-control").completed, ["shared"]);
  assert.deepEqual(reloaded.resume(), store.resume());
});

test("v2 is authoritative even when legacy targets a module absent from v2", () => {
  const storage = new MemoryStorage({
    [legacyKey]: legacy,
    [currentKey]: storedV2(
      { irrigation: { completed: ["water"], lastLesson: "shared" } },
      { moduleId: "irrigation", lessonId: "shared" },
    ),
  });
  const store = createProgressStore(modules, { storage });
  assert.deepEqual(store.snapshot("cea-control").completed, []);
  assert.deepEqual(store.snapshot("irrigation").completed, ["water"]);
  assert.deepEqual(store.resume(), {
    moduleId: "irrigation",
    lessonId: "shared",
  });
  store.visit("cea-control", "climate");
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.snapshot("cea-control").completed, []);
  assert.deepEqual(reloaded.snapshot("irrigation").completed, ["water"]);
});

test("failed migration writes retain legacy and retry with session changes", () => {
  const storage = new MemoryStorage({ [legacyKey]: legacy });
  storage.failWrites = true;
  const store = createProgressStore(modules, { storage });
  assert.deepEqual(store.snapshot("cea-control").completed, ["shared"]);
  assert.equal(store.snapshot("cea-control").storageAvailable, false);
  assert.equal(storage.getItem(legacyKey), legacy);
  assert.equal(storage.getItem(currentKey), null);
  store.toggleComplete("irrigation", "water");
  store.visit("irrigation", "shared");
  storage.failWrites = false;
  store.toggleComplete("cea-control", "climate");
  assert.equal(storage.getItem(legacyKey), null);
  assert.equal(store.snapshot("cea-control").storageAvailable, true);
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.snapshot("cea-control").completed, [
    "shared",
    "climate",
  ]);
  assert.deepEqual(reloaded.snapshot("irrigation").completed, ["water"]);
  assert.deepEqual(reloaded.resume(), {
    moduleId: "irrigation",
    lessonId: "shared",
  });
});

test("failed legacy removal cannot cause a later startup to reimport stale completion", () => {
  const storage = new MemoryStorage({ [legacyKey]: legacy });
  storage.failRemovals = true;
  const store = createProgressStore(modules, { storage });
  store.toggleComplete("cea-control", "shared");
  assert.equal(storage.getItem(legacyKey), legacy);
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.snapshot("cea-control").completed, []);
  assert.deepEqual(reloaded.resume(), {
    moduleId: "cea-control",
    lessonId: "climate",
  });
});

test("malformed envelopes recover from legacy; malformed legacy remains safe", () => {
  for (const malformed of [
    "{",
    "null",
    "[]",
    '"text"',
    '{"version":2,"modules":null}',
  ]) {
    const storage = new MemoryStorage({
      [currentKey]: malformed,
      [legacyKey]: legacy,
    });
    const store = createProgressStore(modules, { storage });
    assert.deepEqual(store.snapshot("cea-control").completed, ["shared"]);
    const brokenLegacy = new MemoryStorage({ [legacyKey]: malformed });
    const fresh = createProgressStore(modules, { storage: brokenLegacy });
    assert.deepEqual(fresh.snapshot("cea-control").completed, []);
    assert.equal(fresh.resume(), null);
    assert.equal(fresh.toggleComplete("irrigation", "water"), true);
  }
});

test("v2 sanitizes invalid IDs and shapes without reviving legacy or inventing a resume", () => {
  const storage = new MemoryStorage({
    [legacyKey]: legacy,
    [currentKey]: storedV2(
      {
        "cea-control": {
          completed: ["shared", "shared", "water", null],
          lastLesson: "removed",
        },
        irrigation: { completed: "water", lastLesson: {} },
        removed: { completed: ["shared"], lastLesson: "shared" },
      },
      { moduleId: "removed", lessonId: "shared" },
    ),
  });
  const store = createProgressStore(modules, { storage });
  assert.deepEqual(store.snapshot("cea-control").completed, ["shared"]);
  assert.deepEqual(store.snapshot("irrigation").completed, []);
  assert.equal(store.resume(), null);
  assert.deepEqual(store.totals(), {
    completed: 1,
    total: 4,
    completedModules: 0,
    totalModules: 2,
  });
});

test("completion is module scoped and resume follows visits, not completion toggles", () => {
  const store = createProgressStore(modules, { storage: new MemoryStorage() });
  store.visit("irrigation", "shared");
  store.toggleComplete("cea-control", "shared");
  store.toggleComplete("cea-control", "climate");
  assert.deepEqual(store.snapshot("irrigation").completed, []);
  assert.deepEqual(store.resume(), {
    moduleId: "irrigation",
    lessonId: "shared",
  });
  store.visit("cea-control", "water");
  assert.equal(store.toggleComplete("unknown", "shared"), false);
  assert.equal(store.toggleComplete("irrigation", "climate"), false);
  assert.deepEqual(store.resume(), {
    moduleId: "irrigation",
    lessonId: "shared",
  });
  assert.deepEqual(store.totals(), {
    completed: 2,
    total: 4,
    completedModules: 1,
    totalModules: 2,
  });
  assert.equal(store.toggleComplete("cea-control", "shared"), false);
  assert.deepEqual(store.snapshot("cea-control").completed, ["climate"]);
});

test("resume can recover a saved last lesson when the global pointer is invalid", () => {
  const storage = new MemoryStorage({
    [currentKey]: storedV2(
      { irrigation: { completed: [], lastLesson: "water" } },
      { moduleId: "cea-control", lessonId: "water" },
    ),
  });
  const store = createProgressStore(modules, { storage });
  assert.deepEqual(store.resume(), {
    moduleId: "irrigation",
    lessonId: "water",
  });
  assert.equal(store.totals().completed, 0);
});

test("blocked or missing storage keeps learner actions in session", () => {
  const blocked = new MemoryStorage({ [legacyKey]: legacy });
  blocked.failReads = true;
  blocked.failWrites = true;
  for (const storage of [blocked, null]) {
    const store = createProgressStore(modules, { storage });
    store.visit("irrigation", "water");
    assert.equal(store.toggleComplete("irrigation", "water"), true);
    assert.deepEqual(store.snapshot("irrigation").completed, ["water"]);
    assert.equal(store.snapshot("irrigation").storageAvailable, false);
    assert.deepEqual(store.resume(), {
      moduleId: "irrigation",
      lessonId: "water",
    });
  }
  blocked.failReads = false;
  assert.equal(blocked.getItem(legacyKey), legacy);
});

test("migration honors the explicit legacy module and rejects foreign lesson IDs", () => {
  const storage = new MemoryStorage({
    [legacyKey]: JSON.stringify({
      completed: ["water", "climate"],
      lastChapter: "shared",
    }),
  });
  const store = createProgressStore(modules, {
    storage,
    legacyModuleId: "irrigation",
  });
  assert.deepEqual(store.snapshot("irrigation").completed, ["water"]);
  assert.deepEqual(store.snapshot("cea-control").completed, []);
  assert.deepEqual(store.resume(), {
    moduleId: "irrigation",
    lessonId: "shared",
  });
});
