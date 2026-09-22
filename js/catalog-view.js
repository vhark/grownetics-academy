import { icon, escapeHtml, moduleUrl, lessonUrl } from "./ui.js";
import {
  getPublishedModules,
  getListedModules,
  getAccessibleModules,
  isPublished,
} from "./publication.js";

const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
const number = (value) => String(value).padStart(2, "0");

function learningArt() {
  return `<svg class="academy-art" viewBox="0 0 420 350" role="img" aria-labelledby="learning-art-title"><title id="learning-art-title">Knowledge grows through observation, understanding, and practice</title><defs><pattern id="academy-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="currentColor" opacity=".2"/></pattern></defs><rect x="8" y="8" width="404" height="334" rx="12" fill="url(#academy-dots)"/><circle cx="211" cy="175" r="127" fill="none" stroke="currentColor" stroke-opacity=".15"/><circle cx="211" cy="175" r="91" fill="none" stroke="currentColor" stroke-opacity=".15" stroke-dasharray="3 8"/><g fill="var(--surface)" stroke="currentColor" stroke-width="1.6"><path d="M143 227V163q33-12 68 8v69q-37-22-68-13Z"/><path d="M211 171q35-20 68-8v64q-33-12-68 13Z"/></g><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M155 177q22-5 42 6m-42 7q22-5 42 6m-42 7q22-5 42 6m26-26q22-10 42-6m-42 19q22-10 42-6m-42 19q22-10 42-6" opacity=".4"/><path d="M211 169v-53"/><path d="M211 143c-33 0-33-33-33-33s37 0 33 33Z" fill="var(--sage)"/><path d="M211 123c-4-37 35-35 35-35s2 35-35 35Z" fill="var(--sage)"/></g><g fill="var(--surface)" stroke="currentColor" stroke-opacity=".3"><rect x="24" y="102" width="102" height="37" rx="5"/><rect x="272" y="132" width="126" height="37" rx="5"/><rect x="164" y="279" width="95" height="37" rx="5"/></g><g fill="currentColor" font-family="var(--mono)" font-size="10" text-anchor="middle" letter-spacing="1"><text x="75" y="125">OBSERVE</text><text x="335" y="155">UNDERSTAND</text><text x="212" y="302">APPLY</text></g><g fill="var(--accent)"><circle cx="123" cy="249" r="4"/><circle cx="297" cy="85" r="4"/><circle cx="210" cy="48" r="3"/></g><path d="m326 233 0 12m-6-6h12M104 56v10m-5-5h10" stroke="currentColor" stroke-opacity=".5"/></svg>`;
}

function moduleCard(module, { modules, progress, preview }) {
  const draft = !isPublished(module);
  const locked = draft && !preview;
  const saved = progress.snapshot(module.id);
  const minutes = module.lessons.reduce(
    (sum, lesson) => sum + (lesson.minutes || 0),
    0,
  );
  const title = escapeHtml(module.title);
  const action = locked
    ? `<button class="button button-outline" data-enable-preview="${escapeHtml(module.id)}">Preview this draft ${icon("arrow")}</button><span class="module-prerequisites">Opt in to work in progress</span>`
    : `<a class="button ${draft ? "button-outline" : "button-primary"}" href="${moduleUrl(module.id)}">${draft ? "Open draft module" : "Explore this module"} ${icon("arrow")}</a>${saved.lastLesson ? `<a class="text-link" href="${lessonUrl(module.id, saved.lastLesson)}">Resume ${draft ? "draft" : "lesson"} <span>↗</span></a>` : `<span class="module-prerequisites">${module.prerequisites?.length ? `Builds on ${module.prerequisites.map((id) => escapeHtml(modules.find((item) => item.id === id)?.title || id)).join(", ")}` : "No prior knowledge needed"}</span>`}`;
  return `<article class="module-card ${draft ? "module-card-draft" : ""} ${locked ? "is-locked" : ""}" data-module-id="${escapeHtml(module.id)}"><div class="module-card-main"><div class="module-card-kicker"><span class="eyebrow">MODULE ${escapeHtml(module.number)}</span>${draft ? '<span class="draft-badge">IN DEVELOPMENT</span>' : `<span class="module-level">${escapeHtml(module.level || "Self-paced")}</span>`}</div><h3>${locked ? title : `<a href="${moduleUrl(module.id)}">${title}</a>`}</h3><p class="module-summary">${escapeHtml(module.summary)}</p><div class="module-facts"><span>${icon("book")} ${plural(module.lessons.length, "lesson")}</span>${module.labs?.length ? `<span>${icon("flask")} ${plural(module.labs.length, "interactive lab")}</span>` : ""}<span>${icon("clock")} ${minutes} min reading</span></div>${draft ? '<p class="draft-card-note">A public working draft. Content may change; not yet part of the published learning path.</p>' : ""}<div class="module-card-actions">${action}</div>${!locked && (saved.lastLesson || saved.completed.length) ? `<div class="module-saved-progress">${saved.completed.length} of ${module.lessons.length} ${draft ? "draft " : ""}lessons completed · ${saved.storageAvailable ? "saved on this device" : "this visit only"}</div>` : ""}</div><div class="module-card-preview"><span class="eyebrow">${draft ? "IDEAS WE’RE DEVELOPING" : "YOUR PATH THROUGH THE IDEAS"}</span><ol>${module.lessons
    .slice(0, 4)
    .map(
      (lesson, index) =>
        `<li><span>${number(index + 1)}</span>${locked ? `<span class="draft-lesson-title">${escapeHtml(lesson.shortTitle || lesson.title)}</span>` : `<a href="${lessonUrl(module.id, lesson.id)}">${escapeHtml(lesson.shortTitle || lesson.title)}</a>`}</li>`,
    )
    .join(
      "",
    )}</ol>${module.lessons.length > 4 ? (locked ? `<span class="module-more">Plus ${module.lessons.length - 4} more lessons</span>` : `<a href="${moduleUrl(module.id)}" class="module-more">Plus ${module.lessons.length - 4} more lessons ${icon("arrow")}</a>`) : ""}${module.audience?.length ? `<p class="module-audience">Made for ${module.audience.map((audience) => escapeHtml(audience.toLocaleLowerCase())).join(", ")}.</p>` : ""}</div></article>`;
}

export function renderAcademy(container, { modules, progress, preview }) {
  const published = getPublishedModules(modules);
  const listed = getListedModules(modules, preview);
  const accessible = getAccessibleModules(modules, preview);
  const totals = progress.totals(published.map((module) => module.id));
  const labs = published.reduce(
    (count, module) => count + (module.labs?.length || 0),
    0,
  );
  const resume = progress.resume(accessible.map((module) => module.id));
  const resumeDraft =
    resume &&
    !isPublished(modules.find((module) => module.id === resume.moduleId));
  container.innerHTML = `<div class="academy-page page-enter"><div class="page-kicker"><span><span class="status-dot"></span> GROWNETICS ACADEMY</span><span class="edition">KNOWLEDGE, CULTIVATED.</span></div><section class="academy-hero" aria-labelledby="academy-title"><div class="academy-hero-copy"><span class="eyebrow">FOR THE GROWERS. AND THE CURIOUS.</span><h1 id="academy-title">Grow your<br><em>understanding.</em></h1><p class="hero-description">Practical learning for the people behind growing environments. Connect the science to the systems—and turn a little curiosity into better decisions.</p><div class="hero-actions">${resume ? `<a class="button button-primary" href="${lessonUrl(resume.moduleId, resume.lessonId)}">${resumeDraft ? "Continue draft" : "Continue learning"} ${icon("arrow")}</a><a class="text-link" href="#module-catalog" data-catalog-scroll>Explore the modules <span>↓</span></a>` : `<a class="button button-primary" href="#module-catalog" data-catalog-scroll>Explore the modules ${icon("arrow")}</a><span class="academy-self-paced">No rush. Just curiosity.</span>`}</div><div class="hero-meta"><span>${icon("book")} ${plural(published.length, "published module")} · ${plural(totals.total, "lesson")}</span>${labs ? `<span>${icon("flask")} ${plural(labs, "hands-on lab")}</span>` : ""}</div></div><div class="academy-hero-visual"><div class="figure-heading"><span>GOOD QUESTIONS</span><span class="figure-plus">+</span></div>${learningArt()}<p>Great growing starts with a different way of seeing.</p></div></section><section class="module-catalog" id="module-catalog" aria-labelledby="catalog-title"><div class="section-heading"><div><span class="eyebrow">FOLLOW YOUR CURIOSITY</span><h2 id="catalog-title">A place to start.<br>A perspective to build on.</h2></div><p>Focused modules. Connected ideas.<br>Go deep, at your own pace.</p></div><div class="module-cards">${listed.map((module) => moduleCard(module, { modules, progress, preview })).join("")}</div></section><section class="academy-approach" aria-label="How learning works">${[
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
  container.querySelectorAll("[data-catalog-scroll]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const catalog = container.querySelector("#module-catalog");
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
