import {
  icon,
  escapeHtml,
  moduleUrl,
  lessonUrl,
  labUrl,
} from "./ui.js";

const $ = (selector, root) => root.querySelector(selector);
const number = (index) => String(index + 1).padStart(2, "0");

export function renderLessonCards(module, completed = []) {
  const done = new Set(completed);
  return `<div class="course-grid">${module.lessons.map((lesson, index) => `<a class="course-card ${done.has(lesson.id) ? "is-complete" : ""}" href="${lessonUrl(module.id, lesson.id)}"><div class="course-card-top"><span class="chapter-badge">${icon(lesson.icon || "book")}</span><span class="mono">LESSON ${number(index)}</span>${done.has(lesson.id) ? icon("check") : ""}</div><span class="course-category">${escapeHtml(lesson.category || module.title)}</span><h3>${escapeHtml(lesson.shortTitle || lesson.title)}</h3><p>${escapeHtml(lesson.subtitle || "")}</p><div class="course-card-bottom"><span>${icon("clock")} ${lesson.minutes} min read</span>${icon("arrow")}</div></a>`).join("")}</div>`;
}

// Modules can use this overview as-is, or supply their own editorial introduction.
export function renderModuleOverview(
  container,
  { module, completed, lastLesson },
) {
  const start =
    module.lessons.find((lesson) => lesson.id === lastLesson) ||
    module.lessons[0];
  container.innerHTML = `<div class="overview-page page-enter"><div class="page-kicker"><a href="#/">← ALL MODULES</a><span>MODULE ${escapeHtml(module.number)}</span></div><header class="page-header"><span class="eyebrow">${escapeHtml(module.level || "SELF-PACED LEARNING")}</span><h1>${escapeHtml(module.title)}</h1><p>${escapeHtml(module.summary)}</p></header>${module.objectives?.length ? `<section class="learning-objectives"><span class="eyebrow">WHAT YOU’LL LEARN</span><ul>${module.objectives.map((objective) => `<li>${icon("check")}<span>${escapeHtml(objective)}</span></li>`).join("")}</ul></section>` : ""}${start ? `<div class="hero-actions"><a class="button button-primary" href="${lessonUrl(module.id, start.id)}">${lastLesson ? "Continue learning" : "Start the module"} ${icon("arrow")}</a>${module.labs?.length ? `<a class="text-link" href="${labUrl(module.id)}">Explore the labs ↗</a>` : ""}</div>` : ""}<section class="learning-section"><div class="section-heading"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2>One lesson at a time.</h2></div><p>${module.lessons.length} lessons · At your own pace</p></div>${renderLessonCards(module, completed)}</section></div>`;
}

export function renderLesson(
  container,
  { module, lesson, progress, onProgress },
) {
  const index = module.lessons.indexOf(lesson);
  const previous = module.lessons[index - 1],
    next = module.lessons[index + 1];
  const lessonNumber = number(index);
  const snapshot = progress.snapshot(module.id);
  const lab = module.labs?.find((item) => item.id === lesson.lab);
  const sources = module.sources || [];
  container.innerHTML = `<article class="chapter-page page-enter"><div class="page-kicker"><a href="${moduleUrl(module.id)}">← ${escapeHtml(module.shortTitle || module.title).toUpperCase()}</a><span>LESSON ${lessonNumber} OF ${String(module.lessons.length).padStart(2, "0")}</span></div><header class="lesson-header"><span class="eyebrow">${escapeHtml(lesson.category || module.title)} <span class="inline-divider">/</span> ${lesson.minutes} MIN READ</span><h1>${escapeHtml(lesson.title)}</h1><p class="lesson-intro">${escapeHtml(lesson.intro)}</p></header><div class="lesson-layout"><div class="lesson-content">${lesson.objectives?.length ? `<section class="learning-objectives"><span class="eyebrow">BY THE END, YOU’LL UNDERSTAND</span><ul>${lesson.objectives.map((objective) => `<li>${icon("check")}<span>${escapeHtml(objective)}</span></li>`).join("")}</ul></section>` : ""}${lesson.sections.map((section, i) => `<section class="lesson-section" id="${escapeHtml(section.id)}"><span class="section-number mono">${lessonNumber}.${number(i)}</span><h2>${escapeHtml(section.title)}</h2>${section.html}</section>`).join("")}${lesson.takeaway ? `<aside class="takeaway"><span class="eyebrow">THE IDEA TO TAKE WITH YOU</span><p>${escapeHtml(lesson.takeaway)}</p></aside>` : ""}${lab ? `<a class="lesson-lab-link" href="${labUrl(module.id, lab.id)}"><span class="chapter-badge">${icon("flask")}</span><div><span class="eyebrow">PUT THE IDEA TO WORK</span><h3>${escapeHtml(lab.label || lab.title)}</h3></div>${icon("arrow")}</a>` : ""}${lesson.quiz ? `<section class="knowledge-check" aria-labelledby="quiz-heading"><div class="quiz-heading"><span class="eyebrow">PAUSE & REFLECT</span><span>One quick knowledge check</span></div><h2 id="quiz-heading">${escapeHtml(lesson.quiz.question)}</h2><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}" aria-pressed="false"><span>${String.fromCharCode(65 + i)}</span>${escapeHtml(option)}</button>`).join("")}</div><p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p></section>` : ""}<div class="lesson-completion"><button class="button button-primary" id="complete-lesson" aria-pressed="${snapshot.completed.includes(lesson.id)}">${snapshot.completed.includes(lesson.id) ? "Lesson completed" : "Mark lesson complete"} ${icon("check")}</button><span id="lesson-storage">${snapshot.storageAvailable ? "You set the pace. Progress stays on this device." : "Progress is available for this visit only."}</span></div>${lesson.source || sources.length ? `<p class="source-note">${escapeHtml(lesson.source || "Source material")}${sources.map((source) => ` · <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener">${escapeHtml(source.label)} ↗</a>`).join("")}</p>` : ""}<nav class="lesson-pagination" aria-label="Lesson navigation">${previous ? `<a href="${lessonUrl(module.id, previous.id)}"><span>← PREVIOUS LESSON</span><strong>${escapeHtml(previous.shortTitle || previous.title)}</strong></a>` : `<a href="${moduleUrl(module.id)}"><span>← BACK TO THE MODULE</span><strong>Module overview</strong></a>`}${next ? `<a href="${lessonUrl(module.id, next.id)}"><span>NEXT LESSON →</span><strong>${escapeHtml(next.shortTitle || next.title)}</strong></a>` : `<a href="${module.labs?.length ? labUrl(module.id) : moduleUrl(module.id)}"><span>KEEP EXPLORING →</span><strong>${module.labs?.length ? "Put it into practice" : "Module overview"}</strong></a>`}</nav></div><aside class="lesson-toc"><span class="eyebrow">IN THIS LESSON</span><nav aria-label="On this page">${lesson.sections.map((section, i) => `<a href="#${escapeHtml(section.id)}" data-scroll="${escapeHtml(section.id)}"><span>${number(i)}</span>${escapeHtml(section.title)}</a>`).join("")}${lesson.quiz ? '<a href="#quiz-heading" data-scroll="quiz-heading"><span>?</span>Check your understanding</a>' : ""}</nav><div class="toc-note">${icon("leaf")}<p>Understanding the “why” makes the “what next” a little clearer.</p></div></aside></div></article>`;
  container.querySelectorAll("[data-scroll]").forEach((link) =>
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.getElementById(link.dataset.scroll);
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }),
  );
  container.querySelectorAll("[data-answer]").forEach((button) =>
    button.addEventListener("click", () => {
      const correct = Number(button.dataset.answer) === lesson.quiz.answer;
      container.querySelectorAll("[data-answer]").forEach((option) => {
        option.classList.remove("correct", "incorrect");
        option.setAttribute("aria-pressed", String(option === button));
      });
      button.classList.add(correct ? "correct" : "incorrect");
      const feedback = $("#quiz-feedback", container);
      feedback.className = `quiz-feedback visible ${correct ? "correct" : "incorrect"}`;
      feedback.textContent = correct
        ? `Exactly. ${lesson.quiz.explanation}`
        : "Not quite. Think about the distinction this lesson makes, then try another answer.";
    }),
  );
  $("#complete-lesson", container).addEventListener("click", (event) => {
    const done = progress.toggleComplete(module.id, lesson.id);
    event.currentTarget.setAttribute("aria-pressed", String(done));
    event.currentTarget.innerHTML = `${done ? "Lesson completed" : "Mark lesson complete"} ${icon("check")}`;
    $("#lesson-storage", container).textContent = progress.snapshot(module.id)
      .storageAvailable
      ? "You set the pace. Progress stays on this device."
      : "Progress is available for this visit only.";
    onProgress();
  });
}

export function renderLabPage(container, { module, lab }) {
  const index = module.labs.indexOf(lab);
  container.innerHTML = `<div class="labs-page page-enter"><div class="page-kicker"><a href="${moduleUrl(module.id)}">← ${escapeHtml(module.shortTitle || module.title).toUpperCase()}</a><span>INTERACTIVE LABS</span></div><header class="page-header"><span class="eyebrow">CURIOSITY MEETS CAUSE & EFFECT</span><h1>A little less abstract.<br> <em>A lot more hands-on.</em></h1><p>Change the conditions. Watch the trade-offs. These simplified models are here to build intuition, not to operate your facility.</p></header><nav class="lab-tabs" aria-label="Module labs">${module.labs.map((item, i) => `<a href="${labUrl(module.id, item.id)}" class="${item.id === lab.id ? "active" : ""}" ${item.id === lab.id ? 'aria-current="page"' : ""}><span class="lab-tab-number">${number(i)}</span>${icon(item.icon || "flask")}<span>${escapeHtml(item.label || item.title)}</span></a>`).join("")}</nav><div class="lab-intro"><span class="eyebrow">LAB ${number(index)} / EXPLORE THE MODEL. QUESTION THE ASSUMPTIONS.</span>${lab.lessonId ? `<a class="text-link" href="${lessonUrl(module.id, lab.lessonId)}">Read the lesson ↗</a>` : ""}</div><div id="lab-mount"></div><aside class="lab-safety-note">${icon("book")}<p><strong>A model is a way to think, not a promise.</strong> These are educational experiments, not operational recommendations. Real growing environments need validated models, independent safeguards, and human judgment.</p></aside></div>`;
  return $("#lab-mount", container);
}

export function renderGlossary(container, { module, term = "" }) {
  container.innerHTML = `<div class="glossary-page page-enter"><div class="page-kicker"><a href="${moduleUrl(module.id)}">← ${escapeHtml(module.shortTitle || module.title).toUpperCase()}</a><span>MODULE GLOSSARY</span></div><header class="page-header"><span class="eyebrow">LESS JARGON. MORE UNDERSTANDING.</span><h1>Get to know<br> <em>the language.</em></h1><p>A clear definition can change how you see a whole system. Terms from ${escapeHtml(module.title)}.</p></header><div class="glossary-search">${icon("search")}<label class="sr-only" for="glossary-query">Find a term in this module</label><input type="search" id="glossary-query" placeholder="Find a term, concept, or acronym…" autocomplete="off"><span id="glossary-count" aria-live="polite"></span></div><dl class="glossary-list" id="glossary-list"></dl><div class="empty-state" id="glossary-empty" hidden><h2>No terms found.</h2><p>Try a broader word, or clear your search to browse all definitions.</p></div></div>`;
  const entries = [...module.glossary].sort((a, b) =>
    a.term.localeCompare(b.term),
  );
  const show = (query) => {
    const words = query.toLocaleLowerCase().trim();
    const found = entries.filter((item) =>
      `${item.term} ${item.definition}`.toLocaleLowerCase().includes(words),
    );
    $("#glossary-count", container).textContent = `${found.length} terms`;
    $("#glossary-list", container).innerHTML = found
      .map(
        (item) =>
          `<div class="glossary-entry"><dt>${escapeHtml(item.term)}</dt><dd>${escapeHtml(item.definition)}</dd></div>`,
      )
      .join("");
    $("#glossary-empty", container).hidden = found.length > 0;
  };
  const input = $("#glossary-query", container);
  input.value = term;
  input.addEventListener("input", (event) => show(event.target.value));
  show(term);
}
