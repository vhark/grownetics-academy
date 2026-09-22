import test from "node:test";
import assert from "node:assert/strict";
import { createProgressStore } from "../js/progress.js";
import {
  isPublished,
  getPublishedModules,
  getAccessibleModules,
  getListedModules,
  isPreviewLink,
  withPreview,
  withoutPreview,
} from "../js/publication.js";

const modules = [
  {
    id: "published",
    status: "published",
    lessons: [{ id: "first" }, { id: "next" }],
  },
  { id: "draft", status: "draft", lessons: [{ id: "first" }] },
];
const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

test("published totals exclude draft work without discarding its saved progress", () => {
  const storage = memoryStorage();
  const progress = createProgressStore(modules, { storage });
  progress.toggleComplete("published", "first");
  progress.toggleComplete("draft", "first");
  assert.deepEqual(progress.totals(["published"]), {
    completed: 1,
    total: 2,
    completedModules: 0,
    totalModules: 1,
  });
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.snapshot("draft").completed, ["first"]);
  assert.equal(reloaded.totals().completed, 2);
});

test("published resume ignores a newer draft visit and retains both module positions", () => {
  const progress = createProgressStore(modules, { storage: memoryStorage() });
  progress.visit("published", "next");
  progress.visit("draft", "first");
  assert.deepEqual(progress.resume(["published"]), {
    moduleId: "published",
    lessonId: "next",
  });
  assert.deepEqual(progress.resume(["draft"]), {
    moduleId: "draft",
    lessonId: "first",
  });
  assert.equal(progress.resume([]), null);
});

test("draft discovery and preview access are separate policies", () => {
  const published = { id: "live", status: "published", visibility: "hidden" };
  const listed = { id: "listed", status: "draft", visibility: "listed" };
  const hidden = { id: "hidden", status: "draft", visibility: "hidden" };
  const unspecified = { id: "unspecified", status: "draft" };
  const catalog = [published, listed, hidden, unspecified];
  assert.deepEqual(getPublishedModules(catalog), [published]);
  assert.deepEqual(getAccessibleModules(catalog), [published]);
  assert.deepEqual(getAccessibleModules(catalog, true), catalog);
  assert.deepEqual(getListedModules(catalog), [published, listed]);
  assert.deepEqual(getListedModules(catalog, true), catalog);
});

test("unknown and missing publication statuses fail closed even in preview", () => {
  const catalog = [
    { id: "missing" },
    { id: "typo", status: "pubished", visibility: "listed" },
    { id: "future", status: "archived" },
  ];
  assert.equal(isPublished({ status: "published" }), true);
  for (const module of catalog) assert.equal(isPublished(module), false);
  assert.deepEqual(getPublishedModules(catalog), []);
  assert.deepEqual(getAccessibleModules(catalog, true), []);
  assert.deepEqual(getListedModules(catalog, true), []);
});

test("preview links preserve encoded glossary terms and unrelated query values", () => {
  const hash =
    "#/modules/draft/glossary?term=Vapour%20pressure%20%26%20RH&mode=detail";
  const preview = withPreview(hash);
  assert.equal(preview, `${hash}&preview=1`);
  assert.equal(isPreviewLink(preview), true);
  assert.equal(withPreview(preview), preview);
  assert.equal(withoutPreview(preview), hash);
  assert.equal(withoutPreview("#/modules/draft?preview=1"), "#/modules/draft");
  assert.equal(
    withPreview("#/modules/draft?preview=0&term=a%2Bb&preview=10"),
    "#/modules/draft?term=a%2Bb&preview=1",
  );
});

test("preview is explicit and disabled or non-route links remain unchanged", () => {
  for (const hash of [
    "#/modules/draft",
    "#/modules/draft?preview=0",
    "#/modules/draft?preview=10",
    "#/modules/draft?preview=true",
    "#/modules/draft?notpreview=1",
    "#/modules/draft?term=preview%3D1",
    "#/modules/draft?preview=1&preview=0",
    "#/modules/preview=1",
  ])
    assert.equal(isPreviewLink(hash), false, hash);
  for (const hash of ["", "#", "#section", "https://example.com/?preview=1"]) {
    assert.equal(isPreviewLink(hash), false, hash);
    assert.equal(withPreview(hash), hash);
    assert.equal(withoutPreview(hash), hash);
  }
});

test("progress subsets ignore duplicates and unknown IDs without altering global resume", () => {
  const storage = memoryStorage();
  const progress = createProgressStore(modules, { storage });
  progress.toggleComplete("draft", "first");
  progress.visit("published", "next");
  progress.visit("draft", "first");
  const saved = storage.getItem("grownetics-academy-progress-v2");
  assert.deepEqual(progress.totals(["draft", "unknown", "draft"]), {
    completed: 1,
    total: 1,
    completedModules: 1,
    totalModules: 1,
  });
  assert.deepEqual(progress.totals([]), {
    completed: 0,
    total: 0,
    completedModules: 0,
    totalModules: 0,
  });
  assert.equal(progress.resume(["unknown"]), null);
  assert.deepEqual(progress.resume(["published", "published", "unknown"]), {
    moduleId: "published",
    lessonId: "next",
  });
  assert.equal(storage.getItem("grownetics-academy-progress-v2"), saved);
  const reloaded = createProgressStore(modules, { storage });
  assert.deepEqual(reloaded.resume(), { moduleId: "draft", lessonId: "first" });
  assert.deepEqual(reloaded.resume(["published"]), {
    moduleId: "published",
    lessonId: "next",
  });
});
