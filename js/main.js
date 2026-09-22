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

const $ = (selector, root = document) => root.querySelector(selector);
const main = $("#main");
const mobileNavigation = matchMedia("(max-width: 800px)");
const progress = createProgressStore(modules, {
  legacyModuleId: legacyProgressModuleId,
});
const moduleById = new Map(modules.map((module) => [module.id, module]));
const styleLoads = new Map();
const number = (value) => String(value).padStart(2, "0");
const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
let current = { page: "academy" };
let routeVersion = 0;
let cleanupView;

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
    if (root !== "modules" || !module) return { page: "not-found" };
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
  const module = current.module;
  const snapshot = progress.snapshot(module?.id);
  const totals = progress.totals();
  const count = module ? snapshot.completed.length : totals.completed;
  const total = module ? module.lessons.length : totals.total;
  $("#course-progress").innerHTML =
    `<div class="progress-heading"><span>${module ? "Module progress" : "Your learning journey"}</span><span>${count}<span class="progress-total"> / ${total}</span></span></div><div class="progress-track" role="progressbar" aria-label="Completed lessons" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="width:${total ? (count / total) * 100 : 0}%"></span></div><p>${count === total && total ? "A whole new way to see your facility." : count ? "Good things grow one lesson at a time." : "A little curiosity goes a long way."}</p><span class="progress-storage">${snapshot.storageAvailable ? "Progress saved on this device" : "Progress available for this visit only"}</span>`;
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
  const allModules = `<nav class="primary-nav" aria-label="Academy">${navLink("#/", "All modules", "overview", page === "academy")}</nav>`;
  if (module) {
    $("#sidebar-content").innerHTML =
      `${allModules}<div class="nav-module-heading"><span class="eyebrow">MODULE ${escapeHtml(module.number)}</span><a href="${moduleUrl(module.id)}">${escapeHtml(module.title)}</a></div><nav class="primary-nav" aria-label="Module">${navLink(moduleUrl(module.id), "Module overview", "book", page === "overview")}${module.labs?.length && module.loadLab ? navLink(labUrl(module.id), "Interactive labs", "flask", page === "labs", `<span class="nav-count">${module.labs.length}</span>`) : ""}</nav><div class="nav-label">THE LEARNING PATH<span>${number(module.lessons.length)}</span></div><nav class="chapter-nav" aria-label="Module lessons">${module.lessons.map((item, index) => `<a href="${lessonUrl(module.id, item.id)}" data-lesson="${escapeHtml(item.id)}" ${lesson?.id === item.id ? 'class="active" aria-current="page"' : ""}><span class="chapter-number">${number(index + 1)}</span><span>${escapeHtml(item.shortTitle || item.title)}</span><span class="chapter-state"></span></a>`).join("")}</nav>${module.references?.length || module.glossary?.length || module.sources?.length ? `<div class="sidebar-divider"></div><nav class="primary-nav secondary-nav" aria-label="Module reference">${(module.references || []).map((item) => navLink(referenceUrl(module.id, item.id), item.title, item.icon || "file", reference?.id === item.id)).join("")}${module.glossary?.length ? navLink(glossaryUrl(module.id), "Field glossary", "book", page === "glossary") : ""}${(module.sources || []).map((source) => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${icon("file")}<span>Source material</span><span class="external-arrow">↗</span></a>`).join("")}</nav>` : ""}`;
  } else {
    $("#sidebar-content").innerHTML =
      `${allModules}<div class="nav-label">EXPLORE THE ACADEMY<span>${number(modules.length)}</span></div><nav class="academy-nav" aria-label="Learning modules">${modules.map((item) => `<a href="${moduleUrl(item.id)}"><span class="eyebrow">MODULE ${escapeHtml(item.number)}</span><strong>${escapeHtml(item.title)}</strong><span>${plural(item.lessons.length, "lesson")}${item.labs?.length ? ` · ${plural(item.labs.length, "lab")}` : ""}</span>${icon("arrow")}</a>`).join("")}</nav><p class="sidebar-intro">A little theory.<br>A little experimentation.<br>A new way of seeing.</p>`;
  }
  const label =
    lesson?.shortTitle ||
    lab?.label ||
    reference?.title ||
    (page === "glossary"
      ? "Field glossary"
      : page === "not-found"
        ? "Page not found"
        : module?.shortTitle || "All modules");
  $("#breadcrumb-current").innerHTML =
    module && page !== "overview"
      ? `<a href="${moduleUrl(module.id)}">${escapeHtml(module.shortTitle || module.title)}</a><span class="breadcrumb-slash"> / </span>${escapeHtml(label)}`
      : escapeHtml(label);
  $("#topbar-link").href = module ? moduleUrl(module.id) : "#/";
  $("#topbar-link").innerHTML = module
    ? "Module overview <span>↗</span>"
    : "Knowledge, cultivated. <span>↗</span>";
  const source = module?.sources?.[0];
  $("#footer-source").href =
    source?.url || "https://github.com/vhark/grownetics-academy";
  $("#footer-source").textContent = source
    ? "Built from the field guide ↗"
    : "Explore the source ↗";
  document.title = `${lesson?.title || lab?.label || reference?.title || (page === "glossary" ? "Field glossary" : module?.title) || (page === "academy" ? "Grow your understanding" : "Page not found")} · Grownetics Academy`;
  renderProgress();
}

function learningArt() {
  return `<svg class="academy-art" viewBox="0 0 420 350" role="img" aria-labelledby="learning-art-title"><title id="learning-art-title">Knowledge grows through observation, understanding, and practice</title><defs><pattern id="academy-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="currentColor" opacity=".2"/></pattern></defs><rect x="8" y="8" width="404" height="334" rx="12" fill="url(#academy-dots)"/><circle cx="211" cy="175" r="127" fill="none" stroke="currentColor" stroke-opacity=".15"/><circle cx="211" cy="175" r="91" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-dasharray="3 8"/><g fill="var(--surface)" stroke="currentColor" stroke-width="1.6"><path d="M143 227V163q33-12 68 8v69q-37-22-68-13Z"/><path d="M211 171q35-20 68-8v64q-33-12-68 13Z"/></g><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M155 177q22-5 42 6m-42 7q22-5 42 6m-42 7q22-5 42 6m26-26q22-10 42-6m-42 19q22-10 42-6m-42 19q22-10 42-6" opacity=".4"/><path d="M211 169v-53"/><path d="M211 143c-33 0-33-33-33-33s37 0 33 33Z" fill="var(--sage)"/><path d="M211 123c-4-37 35-35 35-35s2 35-35 35Z" fill="var(--sage)"/></g><g fill="var(--surface)" stroke="currentColor" stroke-opacity=".3"><rect x="24" y="102" width="102" height="37" rx="5"/><rect x="272" y="132" width="126" height="37" rx="5"/><rect x="164" y="279" width="95" height="37" rx="5"/></g><g fill="currentColor" font-family="var(--mono)" font-size="10" text-anchor="middle" letter-spacing="1"><text x="75" y="125">OBSERVE</text><text x="335" y="155">UNDERSTAND</text><text x="212" y="302">APPLY</text></g><g fill="var(--accent)"><circle cx="123" cy="249" r="4"/><circle cx="297" cy="85" r="4"/><circle cx="210" cy="48" r="3"/></g><path d="m326 233 0 12m-6-6h12M104 56v10m-5-5h10" stroke="currentColor" stroke-opacity=".5"/></svg>`;
}

function renderAcademy() {
  const totals = progress.totals();
  const labs = modules.reduce(
    (count, module) => count + (module.labs?.length || 0),
    0,
  );
  const resume = progress.resume();
  main.innerHTML = `<div class="academy-page page-enter"><div class="page-kicker"><span><span class="status-dot"></span> GROWNETICS ACADEMY</span><span class="edition">KNOWLEDGE, CULTIVATED.</span></div><section class="academy-hero" aria-labelledby="academy-title"><div class="academy-hero-copy"><span class="eyebrow">FOR THE GROWERS. AND THE CURIOUS.</span><h1 id="academy-title">Grow your<br><em>understanding.</em></h1><p class="hero-description">Practical learning for the people behind growing environments. Connect the science to the systems—and turn a little curiosity into better decisions.</p><div class="hero-actions">${resume ? `<a class="button button-primary" href="${lessonUrl(resume.moduleId, resume.lessonId)}">Continue learning ${icon("arrow")}</a><a class="text-link" href="#module-catalog" data-catalog-scroll>Explore the modules <span>↓</span></a>` : `<a class="button button-primary" href="#module-catalog" data-catalog-scroll>Explore the modules ${icon("arrow")}</a><span class="academy-self-paced">No rush. Just curiosity.</span>`}</div><div class="hero-meta"><span>${icon("book")} ${plural(modules.length, "module")} · ${plural(totals.total, "lesson")}</span>${labs ? `<span>${icon("flask")} ${plural(labs, "hands-on lab")}</span>` : ""}</div></div><div class="academy-hero-visual"><div class="figure-heading"><span>GOOD QUESTIONS</span><span class="figure-plus">+</span></div>${learningArt()}<p>Great growing starts with a different way of seeing.</p></div></section><section class="module-catalog" id="module-catalog" aria-labelledby="catalog-title"><div class="section-heading"><div><span class="eyebrow">FOLLOW YOUR CURIOSITY</span><h2 id="catalog-title">A place to start.<br>A perspective to build on.</h2></div><p>Focused modules. Connected ideas.<br>Go deep, at your own pace.</p></div><div class="module-cards">${modules
    .map((module) => {
      const saved = progress.snapshot(module.id);
      const minutes = module.lessons.reduce(
        (sum, lesson) => sum + (lesson.minutes || 0),
        0,
      );
      return `<article class="module-card"><div class="module-card-main"><div class="module-card-kicker"><span class="eyebrow">MODULE ${escapeHtml(module.number)}</span><span class="module-level">${escapeHtml(module.level || "Self-paced")}</span></div><h3><a href="${moduleUrl(module.id)}">${escapeHtml(module.title)}</a></h3><p class="module-summary">${escapeHtml(module.summary)}</p><div class="module-facts"><span>${icon("book")} ${plural(module.lessons.length, "lesson")}</span>${module.labs?.length ? `<span>${icon("flask")} ${plural(module.labs.length, "interactive lab")}</span>` : ""}<span>${icon("clock")} ${minutes} min reading</span></div><div class="module-card-actions"><a class="button button-primary" href="${moduleUrl(module.id)}">Explore this module ${icon("arrow")}</a>${saved.lastLesson ? `<a class="text-link" href="${lessonUrl(module.id, saved.lastLesson)}">Resume lesson <span>↗</span></a>` : `<span class="module-prerequisites">${module.prerequisites?.length ? `Builds on ${module.prerequisites.map((id) => escapeHtml(moduleById.get(id)?.title || id)).join(", ")}` : "No prior knowledge needed"}</span>`}</div>${saved.lastLesson || saved.completed.length ? `<div class="module-saved-progress">${saved.completed.length} of ${module.lessons.length} lessons completed · ${saved.storageAvailable ? "saved on this device" : "this visit only"}</div>` : ""}</div><div class="module-card-preview"><span class="eyebrow">YOUR PATH THROUGH THE IDEAS</span><ol>${module.lessons
        .slice(0, 4)
        .map(
          (lesson, index) =>
            `<li><span>${number(index + 1)}</span><a href="${lessonUrl(module.id, lesson.id)}">${escapeHtml(lesson.shortTitle || lesson.title)}</a></li>`,
        )
        .join(
          "",
        )}</ol>${module.lessons.length > 4 ? `<a href="${moduleUrl(module.id)}" class="module-more">Plus ${module.lessons.length - 4} more lessons ${icon("arrow")}</a>` : ""}${module.audience?.length ? `<p class="module-audience">Made for ${module.audience.map((audience) => escapeHtml(audience.toLocaleLowerCase())).join(", ")}.</p>` : ""}</div></article>`;
    })
    .join(
      "",
    )}</div></section><section class="academy-approach" aria-label="How learning works">${[
    [
      "book",
      "Make the ideas click.",
      "Clear explanations, real growing contexts, and just enough theory to see what matters.",
    ],
    [
      "flask",
      "Learn by changing something.",
      "Explore safe, illustrative labs. Challenge an assumption and see the trade-offs.",
    ],
    [
      "leaf",
      "Take a new perspective back.",
      "Build understanding you can use to ask better questions about your own environment.",
    ],
  ]
    .map(
      ([symbol, title, text], index) =>
        `<div><span class="academy-approach-icon">${icon(symbol)}<span class="mono">0${index + 1}</span></span><h3>${title}</h3><p>${text}</p></div>`,
    )
    .join(
      "",
    )}</section><section class="closing-note"><span class="eyebrow">ROOTED IN KNOWLEDGE. GROWN IN PRACTICE.</span><h2>Better understanding.<br><em>Better growing.</em></h2><p>You don’t have to know everything.<br>Just keep asking good questions.</p></section></div>`;
  main.querySelectorAll("[data-catalog-scroll]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const catalog = $("#module-catalog");
      catalog.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      catalog.setAttribute("tabindex", "-1");
      catalog.focus({ preventScroll: true });
    }),
  );
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
              reject(new Error("Lab styles could not be loaded."));
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

async function route() {
  const version = ++routeVersion;
  cleanupView?.();
  cleanupView = undefined;
  setMenu(false);
  current = parseRoute();
  if (current.lesson) progress.visit(current.module.id, current.lesson.id);
  renderChrome();
  const { module, page } = current;
  main.setAttribute("aria-busy", "true");
  main.innerHTML =
    '<div class="route-loading" role="status">Opening your next good question…</div>';
  try {
    if (page === "academy") renderAcademy();
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

// Settings live outside the changing view: toggles never navigate or reset labs.
initDisplayPreferences();
document.querySelectorAll("[data-icon]").forEach((element) => {
  element.innerHTML = icon(element.dataset.icon);
});
initSearch({ modules, beforeOpen: () => setMenu(false) });
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
    const focusable = [...$("#sidebar").querySelectorAll("a[href], button")];
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
