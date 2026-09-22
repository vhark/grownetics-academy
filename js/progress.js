const storageKey = "grownetics-academy-progress-v2";
const legacyKey = "grownetics-academy-progress-v1";
const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function parseState(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function createProgressStore(
  modules,
  { storage, legacyModuleId = "cea-control" } = {},
) {
  const validLessons = new Map(
    modules.map((module) => [
      module.id,
      new Set(module.lessons.map((lesson) => lesson.id)),
    ]),
  );
  const progress = Object.create(null);
  for (const moduleId of validLessons.keys()) {
    progress[moduleId] = { completed: [], lastLesson: "" };
  }
  let lastVisited = null;
  let storageAvailable = true;
  let legacyPending = false;
  const validLesson = (moduleId, lessonId) =>
    typeof moduleId === "string" &&
    typeof lessonId === "string" &&
    Boolean(validLessons.get(moduleId)?.has(lessonId));

  function loadModule(moduleId, saved) {
    if (!isRecord(saved)) return;
    progress[moduleId] = {
      completed: Array.isArray(saved.completed)
        ? [
            ...new Set(
              saved.completed.filter((id) => validLesson(moduleId, id)),
            ),
          ]
        : [],
      lastLesson: validLesson(moduleId, saved.lastLesson)
        ? saved.lastLesson
        : "",
    };
  }

  function save() {
    if (!storage) {
      storageAvailable = false;
      return;
    }
    try {
      storage.setItem(
        storageKey,
        JSON.stringify({ version: 2, modules: progress, lastVisited }),
      );
      storageAvailable = true;
      // Keep v1 intact until its replacement is durably written. Failed writes
      // retain the in-memory migration so the next learner action can retry.
      if (legacyPending) {
        storage.removeItem(legacyKey);
        legacyPending = false;
      }
    } catch {
      storageAvailable = false;
    }
  }

  try {
    if (storage === undefined) storage = globalThis.localStorage;
    if (!storage) {
      storageAvailable = false;
    } else {
      const saved = parseState(storage.getItem(storageKey));
      if (isRecord(saved) && saved.version === 2 && isRecord(saved.modules)) {
        for (const moduleId of validLessons.keys()) {
          if (Object.hasOwn(saved.modules, moduleId))
            loadModule(moduleId, saved.modules[moduleId]);
        }
        if (
          isRecord(saved.lastVisited) &&
          validLesson(saved.lastVisited.moduleId, saved.lastVisited.lessonId)
        ) {
          lastVisited = {
            moduleId: saved.lastVisited.moduleId,
            lessonId: saved.lastVisited.lessonId,
          };
        }
      } else if (validLessons.has(legacyModuleId)) {
        const legacy = parseState(storage.getItem(legacyKey));
        if (
          isRecord(legacy) &&
          (Array.isArray(legacy.completed) ||
            typeof legacy.lastChapter === "string")
        ) {
          loadModule(legacyModuleId, {
            completed: legacy.completed,
            lastLesson: legacy.lastChapter,
          });
          const lessonId = progress[legacyModuleId].lastLesson;
          if (lessonId) lastVisited = { moduleId: legacyModuleId, lessonId };
          legacyPending = true;
          save();
        }
      }
    }
  } catch {
    storageAvailable = false;
  }

  return {
    snapshot(moduleId) {
      const saved = Object.hasOwn(progress, moduleId)
        ? progress[moduleId]
        : null;
      return {
        completed: saved ? [...saved.completed] : [],
        lastLesson: saved?.lastLesson || "",
        storageAvailable,
      };
    },
    visit(moduleId, lessonId) {
      if (!validLesson(moduleId, lessonId)) return;
      progress[moduleId].lastLesson = lessonId;
      lastVisited = { moduleId, lessonId };
      save();
    },
    toggleComplete(moduleId, lessonId) {
      if (!validLesson(moduleId, lessonId)) return false;
      const completed = progress[moduleId].completed;
      const index = completed.indexOf(lessonId);
      if (index === -1) completed.push(lessonId);
      else completed.splice(index, 1);
      save();
      return index === -1;
    },
    resume() {
      if (lastVisited) return { ...lastVisited };
      for (const moduleId of validLessons.keys()) {
        const lessonId = progress[moduleId].lastLesson;
        if (lessonId) return { moduleId, lessonId };
      }
      return null;
    },
    totals() {
      let completed = 0;
      let total = 0;
      let completedModules = 0;
      for (const [moduleId, lessonIds] of validLessons) {
        const count = progress[moduleId].completed.length;
        completed += count;
        total += lessonIds.size;
        if (lessonIds.size > 0 && count === lessonIds.size)
          completedModules += 1;
      }
      return {
        completed,
        total,
        completedModules,
        totalModules: validLessons.size,
      };
    },
  };
}
