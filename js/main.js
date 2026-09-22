import { modules, legacyProgressModuleId } from "./catalog.js";
import { createProgressStore } from "./progress.js";
import { initSearch } from "./search.js";
import {
  initDisplayPreferences,
  applyTemperatureDisplay,
} from "./preferences.js";
import {
  icon,
  escapeHtml,
  moduleUrl,
  lessonUrl,
  labUrl,
  referenceUrl,
  glossaryUrl,
} from "./ui.js";
import {
  renderModuleOverview,
  renderLesson,
  renderLabPage,
  renderGlossary,
} from "./reader.js";
import { renderAcademy } from "./catalog-view.js";
import {
  isPublished,
  getPublishedModules,
  getAccessibleModules,
  isPreviewLink,
  withPreview,
  withoutPreview,
} from "./publication.js";

const $ = (selector, root = document) => root.querySelector(selector);
const main = $("#main");
const mobileNavigation = matchMedia("(max-width: 800px)");
const progress = createProgressStore(modules, {
  legacyModuleId: legacyProgressModuleId,
});
const moduleById = new Map(modules.map((module) => [module.id, module]));
const publishedIds = getPublishedModules(modules).map((module) => module.id);
const previewStorageKey = "grownetics-academy-preview-v1";
const styleLoads = new Map();
const number = (value) => String(value).padStart(2, "0");
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
let current = { page: "academy" };
let routeVersion = 0;
let cleanupView;
let previewEnabled = false;
try {
  previewEnabled = sessionStorage.getItem(previewStorageKey) === "1";
} catch {
  // Preview still works for this visit when tab storage is unavailable.
}

function canAccessModule(id) {
  const module = moduleById.get(id);
  return isPublished(module) || (previewEnabled && module?.status === "draft");
}

function setPreviewValue(enabled) {
  previewEnabled = enabled;
  try {
    sessionStorage.setItem(previewStorageKey, enabled ? "1" : "0");
  } catch {}
  $("#show-drafts").checked = enabled;
}

function changePreview(enabled) {
  const restoreFocus = $("#draft-banner").contains(document.activeElement);
  setPreviewValue(enabled);
  if (!enabled) {
    const url = new URL(location.href);
    url.hash = withoutPreview(location.hash);
    history.replaceState(history.state, "", url);
  }
  search.refresh();
  if (current.page === "academy" || current.module?.status === "draft") {
    route();
  } else {
    // Changing discovery must not restart a published lab or clear an answer.
    renderChrome();
    if (restoreFocus) main.focus({ preventScroll: true });
  }
}

function renderDraftBanner() {
  const banner = $("#draft-banner");
  const draft = current.module?.status === "draft";
  $("#show-drafts").checked = previewEnabled;
  document.documentElement.dataset.preview = String(previewEnabled);
  banner.hidden = !previewEnabled;
  if (!previewEnabled) {
    banner.replaceChildren();
    return;
  }
  banner.innerHTML = `<div class="draft-banner-copy"><span class="draft-badge">${draft ? "DRAFT" : "PREVIEW MODE"}</span><div><strong>${draft ? "Content may change. Not yet published." : "Work in progress is visible."}</strong><p>${draft ? "For learning and review—not approved engineering guidance. Draft progress is tracked separately." : "Draft modules are excluded from your published learning totals."}</p></div></div><div class="draft-banner-actions">${draft ? '<button type="button" class="text-link" data-share-preview>Copy preview link ↗</button>' : ""}<button type="button" class="text-link" data-disable-preview>Exit preview</button></div><span id="preview-share-status" class="preview-share-status" role="status"></span><input id="preview-share-url" class="preview-share-url" aria-label="Shareable draft preview URL" readonly hidden>`;
}

async function copyPreviewLink() {
  const url = new URL(location.href);
  url.hash = withPreview(location.hash);
  const status = $("#preview-share-status");
  const field = $("#preview-share-url");
  try {
    await navigator.clipboard.writeText(url.href);
    status.textContent = "Preview link copied.";
  } catch {
    field.hidden = false;
    field.value = url.href;
    field.focus();
    field.select();
    status.textContent = "Copy this link to share the draft.";
  }
}

function setMenu(open) {
  open = open && mobileNavigation.matches;
  document.body.classList.toggle("menu-open", open);
  $("#sidebar").inert = mobileNavigation.matches && !open;
  $(".main-shell").inert = open;
  $("#menu-backdrop").hidden = !open;
  $("#menu-toggle").setAttribute("aria-expanded", String(open));
  $("#menu-toggle").setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  if (open) $("#search-trigger").focus();
}

function parseRoute() {
  try {
    const raw = location.hash.replace(/^#\/?/, "");
    const queryStart = raw.indexOf("?");
    const path = queryStart < 0 ? raw : raw.slice(0, queryStart);
    const query = new URLSearchParams(
      queryStart < 0 ? "" : raw.slice(queryStart + 1),
    );
    if (!path) return { page: "academy" };
    const parts = path.split("/").map(decodeURIComponent);
    const [root, moduleId, page, itemId] = parts;
    const module = moduleById.get(moduleId);
    if (
      root !== "modules" ||
      !module ||
      (!isPublished(module) && module.status !== "draft")
    )
      return { page: "not-found" };
    if (parts.length === 2) return { page: "overview", module };
    if (page === "lessons" && parts.length === 4) {
      const lesson = module.lessons.find((item) => item.id === itemId);
      if (lesson) return { page, module, lesson };
    }
    if (
      page === "labs" &&
      (parts.length === 3 || parts.length === 4) &&
      module.loadLab
    ) {
      const lab = itemId
        ? module.labs?.find((item) => item.id === itemId)
        : module.labs?.[0];
      if (lab) return { page, module, lab };
    }
    if (page === "reference" && parts.length === 4) {
      const reference = module.references?.find((item) => item.id === itemId);
      if (reference) return { page, module, reference };
    }
    if (page === "glossary" && parts.length === 3 && module.glossary?.length) {
      return { page, module, term: query.get("term") || "" };
    }
    return { page: "not-found", module };
  } catch {
    return { page: "not-found" };
  }
}

function navLink(url, label, symbol, active, extra = "") {
  return `<a href="${url}" ${active ? 'class="active" aria-current="page"' : ""}>${icon(symbol)}<span>${escapeHtml(label)}</span>${extra}</a>`;
}

function renderProgress() {
  const module = current.page === "draft-gate" ? null : current.module;
  const snapshot = progress.snapshot(module?.id);
  const totals = progress.totals(publishedIds);
  const count = module ? snapshot.completed.length : totals.completed;
  const total = module ? module.lessons.length : totals.total;
  $("#course-progress").innerHTML =
    `<div class="progress-heading"><span>${module ? (module.status === "draft" ? "Draft progress" : "Module progress") : "Published learning"}</span><span>${count}<span class="progress-total"> / ${total}</span></span></div><div class="progress-track" role="progressbar" aria-label="${module?.status === "draft" ? "Completed draft lessons" : "Completed published lessons"}" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="width:${total ? (count / total) * 100 : 0}%"></span></div><p>${module?.status === "draft" ? "Not included in published learning totals." : count === total && total ? "A whole new way to see your facility." : count ? "Good things grow one lesson at a time." : "A little curiosity goes a long way."}</p><span class="progress-storage">${snapshot.storageAvailable ? "Progress saved on this device" : "Progress available for this visit only"}</span>`;
  $("#sidebar-content")
    .querySelectorAll("[data-lesson]")
    .forEach((link) => {
      const done = snapshot.completed.includes(link.dataset.lesson);
      link.classList.toggle("completed", done);
      const state = $(".chapter-state", link);
      state.innerHTML = done ? icon("check") : "";
      state.setAttribute("aria-label", done ? "Completed" : "Not completed");
    });
}

function renderChrome() {
  const { module, page, lesson, lab, reference } = current;
  const accessible = getAccessibleModules(modules, previewEnabled);
  const allModules = `<nav class="primary-nav" aria-label="Academy">${navLink("#/", "All modules", "overview", page === "academy")}</nav>`;
  if (module && canAccessModule(module.id)) {
    $("#sidebar-content").innerHTML =
      `${allModules}<div class="nav-module-heading"><span class="eyebrow">MODULE ${escapeHtml(module.number)}${module.status === "draft" ? ' <span class="draft-badge">DRAFT</span>' : ""}</span><a href="${moduleUrl(module.id)}">${escapeHtml(module.title)}</a></div><nav class="primary-nav" aria-label="Module">${navLink(moduleUrl(module.id), "Module overview", "book", page === "overview")}${module.labs?.length && module.loadLab ? navLink(labUrl(module.id), "Interactive labs", "flask", page === "labs", `<span class="nav-count">${module.labs.length}</span>`) : ""}</nav><div class="nav-label">THE LEARNING PATH<span>${number(module.lessons.length)}</span></div><nav class="chapter-nav" aria-label="Module lessons">${module.lessons.map((item, index) => `<a href="${lessonUrl(module.id, item.id)}" data-lesson="${escapeHtml(item.id)}" ${lesson?.id === item.id ? 'class="active" aria-current="page"' : ""}><span class="chapter-number">${number(index + 1)}</span><span>${escapeHtml(item.shortTitle || item.title)}</span><span class="chapter-state"></span></a>`).join("")}</nav>${module.references?.length || module.glossary?.length || module.sources?.length ? `<div class="sidebar-divider"></div><nav class="primary-nav secondary-nav" aria-label="Module reference">${(module.references || []).map((item) => navLink(referenceUrl(module.id, item.id), item.title, item.icon || "file", reference?.id === item.id)).join("")}${module.glossary?.length ? navLink(glossaryUrl(module.id), "Field glossary", "book", page === "glossary") : ""}${(module.sources || []).map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${icon("file")}<span>${escapeHtml(source.label)}</span><span class="external-arrow">↗</span></a>`).join("")}</nav>` : ""}`;
  } else {
    $("#sidebar-content").innerHTML =
      `${allModules}<div class="nav-label">EXPLORE THE ACADEMY<span>${number(accessible.length)}</span></div><nav class="academy-nav" aria-label="Learning modules">${accessible.map((item) => `<a href="${moduleUrl(item.id)}"><span class="eyebrow">MODULE ${escapeHtml(item.number)}${item.status === "draft" ? " · DRAFT" : ""}</span><strong>${escapeHtml(item.title)}</strong><span>${plural(item.lessons.length, "lesson")}${item.labs?.length ? ` · ${plural(item.labs.length, "lab")}` : ""}</span>${icon("arrow")}</a>`).join("")}</nav><p class="sidebar-intro">A little theory.<br>A little experimentation.<br>A new way of seeing.</p>`;
  }
  const label =
    lesson?.shortTitle ||
    lab?.label ||
    reference?.title ||
    (page === "glossary"
      ? "Field glossary"
      : page === "not-found"
        ? "Page not found"
        : page === "draft-gate"
          ? "Draft preview"
          : module?.shortTitle || "All modules");
  $("#breadcrumb-current").innerHTML =
    module && canAccessModule(module.id) && page !== "overview"
      ? `<a href="${moduleUrl(module.id)}">${escapeHtml(module.shortTitle || module.title)}</a><span class="breadcrumb-slash"> / </span>${escapeHtml(label)}`
      : escapeHtml(label);
  $("#topbar-link").href =
    module && canAccessModule(module.id) ? moduleUrl(module.id) : "#/";
  $("#topbar-link").innerHTML =
    module && canAccessModule(module.id)
      ? "Module overview <span>↗</span>"
      : "Knowledge, cultivated. <span>↗</span>";
  const source = module?.sources?.[0];
  $("#footer-source").href =
    source?.url || "https://github.com/vhark/grownetics-academy";
  $("#footer-source").textContent = source
    ? "Source material ↗"
    : "Explore the source ↗";
  document.title = `${module?.status === "draft" ? "Draft · " : ""}${lesson?.title || lab?.label || reference?.title || (page === "glossary" ? "Field glossary" : module?.title) || (page === "academy" ? "Grow your understanding" : "Page not found")} · Grownetics Academy`;
  renderProgress();
  renderDraftBanner();
}

function loadStyles(urls = []) {
  return Promise.all(
    urls.map((url) => {
      if (!styleLoads.has(url)) {
        styleLoads.set(
          url,
          new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = url;
            link.onload = resolve;
            link.onerror = () => {
              link.remove();
              styleLoads.delete(url);
              reject(new Error("Module styles could not be loaded."));
            };
            document.head.append(link);
          }),
        );
      }
      return styleLoads.get(url);
    }),
  );
}

function renderNotFound() {
  main.innerHTML = `<div class="overview-page page-enter"><header class="page-header"><span class="eyebrow">A SMALL DETOUR</span><h1>This path hasn’t<br><em>been planted.</em></h1><p>That module, lesson, or lab could not be found. The academy catalog will get you back on track.</p></header><a class="button button-primary" href="#/">Back to all modules ${icon("arrow")}</a></div>`;
}

function renderDraftGate(module) {
  main.innerHTML = `<div class="overview-page draft-gate page-enter"><div class="page-kicker"><a href="#/">← ALL MODULES</a><span>MODULE ${escapeHtml(module.number)} · IN DEVELOPMENT</span></div><header class="page-header"><span class="eyebrow">A WORK IN PROGRESS</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.summary)}</p></header><div class="draft-gate-note"><h2>Step inside the working draft.</h2><p>This module is being developed in public. Its lessons and examples are available for review, but content may change and has not joined the published curriculum.</p><p>Previewing is an explicit opt-in. It is not a private area, and draft progress stays separate from published learning totals.</p><button type="button" class="button button-primary" data-enable-preview="${escapeHtml(module.id)}">Enable draft preview ${icon("arrow")}</button></div></div>`;
}

async function route() {
  const version = ++routeVersion;
  cleanupView?.();
  cleanupView = undefined;
  setMenu(false);
  if (isPreviewLink(location.hash)) {
    if (!previewEnabled) {
      setPreviewValue(true);
      search.refresh();
    }
    // Consume the opt-in once; Back must not undo a later explicit exit.
    const url = new URL(location.href);
    url.hash = withoutPreview(location.hash);
    history.replaceState(history.state, "", url);
  }
  current = parseRoute();
  if (
    current.module &&
    current.page !== "not-found" &&
    !canAccessModule(current.module.id)
  ) {
    current =
      current.module.status === "draft"
        ? { page: "draft-gate", module: current.module }
        : { page: "not-found" };
  }
  if (current.lesson) progress.visit(current.module.id, current.lesson.id);
  renderChrome();
  const { module, page } = current;
  main.setAttribute("aria-busy", "true");
  main.innerHTML =
    '<div class="route-loading" role="status">Opening your next good question…</div>';
  try {
    if (module && page !== "draft-gate" && page !== "not-found") {
      await loadStyles(module.styles);
      if (version !== routeVersion) return;
    }
    if (page === "academy")
      renderAcademy(main, { modules, progress, preview: previewEnabled });
    else if (page === "draft-gate") renderDraftGate(module);
    else if (page === "overview") {
      const render = module.loadOverview
        ? await module.loadOverview()
        : renderModuleOverview;
      if (version !== routeVersion) return;
      cleanupView = render(main, { module, ...progress.snapshot(module.id) });
    } else if (page === "lessons") {
      renderLesson(main, {
        module,
        lesson: current.lesson,
        progress,
        onProgress: renderProgress,
      });
    } else if (page === "labs") {
      const lab = current.lab;
      const [mountLab] = await Promise.all([
        module.loadLab(),
        loadStyles(module.labStyles),
      ]);
      if (version !== routeVersion) return;
      const container = renderLabPage(main, { module, lab });
      cleanupView = mountLab(container, lab.id);
    } else if (page === "reference") {
      const render = await current.reference.load();
      if (version !== routeVersion) return;
      cleanupView = render(main, { module });
    } else if (page === "glossary")
      renderGlossary(main, { module, term: current.term });
    else renderNotFound();
    applyTemperatureDisplay(main);
  } catch (error) {
    if (version !== routeVersion) return;
    console.error(error);
    main.innerHTML = `<div class="overview-page"><header class="page-header"><h1>This page couldn’t load.</h1><p>Check your connection and try again. Your saved progress has not been cleared.</p></header><button class="button button-primary" id="retry-route">Try again ${icon("arrow")}</button></div>`;
    $("#retry-route").addEventListener("click", route);
  } finally {
    if (version === routeVersion) {
      main.removeAttribute("aria-busy");
      window.scrollTo({ top: 0, behavior: "instant" });
      main.focus({ preventScroll: true });
    }
  }
}

// Display choices never navigate; preview only re-routes a draft or the catalog.
initDisplayPreferences();
document.querySelectorAll("[data-icon]").forEach((element) => {
  element.innerHTML = icon(element.dataset.icon);
});
const search = initSearch({
  modules,
  beforeOpen: () => setMenu(false),
  canSearchModule: canAccessModule,
});
$("#show-drafts").addEventListener("change", (event) =>
  changePreview(event.currentTarget.checked),
);
document.addEventListener("click", (event) => {
  const enable = event.target.closest("[data-enable-preview]");
  if (enable) {
    setPreviewValue(true);
    search.refresh();
    const id = enable.dataset.enablePreview;
    if (id && current.module?.id !== id) location.hash = moduleUrl(id);
    else route();
  } else if (event.target.closest("[data-disable-preview]"))
    changePreview(false);
  else if (event.target.closest("[data-share-preview]")) copyPreviewLink();
});
$(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView({ block: "start" });
});
mobileNavigation.addEventListener("change", () => setMenu(false));
$("#menu-toggle").addEventListener("click", () =>
  setMenu(!document.body.classList.contains("menu-open")),
);
$("#menu-backdrop").addEventListener("click", () => {
  setMenu(false);
  $("#menu-toggle").focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
    setMenu(false);
    $("#menu-toggle").focus();
  }
  if (event.key === "Tab" && document.body.classList.contains("menu-open")) {
    const focusable = [
      ...$("#sidebar").querySelectorAll("a[href], button, input"),
    ];
    const first = focusable[0],
      last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener("hashchange", route);
route();
