import { chapters, glossary, strategies } from "./curriculum.js";
import { mountLab } from "./labs.js";
import { icon, greenhouse, conceptArt } from "./illustrations.js";

const $ = (selector, root = document) => root.querySelector(selector);
const main = $("#main");
const mobileNavigation = matchMedia("(max-width: 800px)");
const storageKey = "grownetics-academy-progress-v1";
const validIds = new Set(chapters.map((chapter) => chapter.id));
let completed = new Set();
let lastChapter = "";
let storageAvailable = true;
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  completed = new Set(
    (Array.isArray(saved.completed) ? saved.completed : []).filter((id) =>
      validIds.has(id),
    ),
  );
  lastChapter = validIds.has(saved.lastChapter) ? saved.lastChapter : "";
} catch {
  storageAvailable = false;
}
let cleanupLab;
let currentRoute = "";
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
const textOnly = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent || "";
};
const chapterIcons = [
  "leaf",
  "sliders",
  "compare",
  "sun",
  "graph",
  "uncertainty",
  "layers",
  "book",
];
const chapterUrl = (id) => `#/chapter/${id}`;
const labInfo = [
  {
    id: "coupling",
    title: "One action. Many effects.",
    label: "The coupled greenhouse",
    text: "Open the vents. Watch temperature, moisture, and CO₂ change together.",
    icon: "leaf",
    chapter: "coupled-system",
  },
  {
    id: "planning",
    title: "React now. Or plan ahead.",
    label: "The predictive controller",
    text: "Compare reactive control with a controller that sees the lights-on surge coming.",
    icon: "sliders",
    chapter: "twelve-ways",
  },
  {
    id: "bayes",
    title: "New evidence. Better decisions.",
    label: "The uncertainty lab",
    text: "A humidity sensor reads high. Change the evidence and update your belief.",
    icon: "uncertainty",
    chapter: "bayesian-control",
  },
];

function saveProgress() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ completed: [...completed], lastChapter }),
    );
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  renderProgress();
}
function renderProgress() {
  const total = chapters.length,
    count = completed.size;
  $("#course-progress").innerHTML =
    `<div class="progress-heading"><span>Your learning journey</span><span>${count}<span class="progress-total"> / ${total}</span></span></div><div class="progress-track" role="progressbar" aria-label="Completed chapters" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${count}"><span style="width:${(count / total) * 100}%"></span></div><p>${count === total ? "A whole new way to see your facility." : count ? "Good things grow one chapter at a time." : "A little curiosity goes a long way."}</p><span class="progress-storage">${storageAvailable ? "Progress saved on this device" : "Progress available for this visit only"}</span>`;
  document.querySelectorAll(".chapter-nav a").forEach((link) => {
    const done = completed.has(link.dataset.chapter);
    link.classList.toggle("completed", done);
    $(".chapter-state", link).innerHTML = done ? icon("check") : "";
    $(".chapter-state", link).setAttribute(
      "aria-label",
      done ? "Completed" : "Not completed",
    );
  });
}
function renderChrome() {
  document.querySelectorAll("[data-icon]").forEach((el) => {
    el.innerHTML = icon(el.dataset.icon);
  });
  $("#chapter-nav").innerHTML = chapters
    .map(
      (chapter) =>
        `<a href="${chapterUrl(chapter.id)}" data-chapter="${chapter.id}"><span class="chapter-number">${chapter.number}</span><span>${escapeHtml(chapter.shortTitle)}</span><span class="chapter-state"></span></a>`,
    )
    .join("");
  renderProgress();
}
function home() {
  const resume = lastChapter || chapters[0].id;
  main.innerHTML = `<div class="overview-page page-enter">
    <div class="page-kicker"><span><span class="status-dot"></span> A FIELD GUIDE TO CEA AUTOMATION</span><span class="edition">KNOWLEDGE, CULTIVATED.</span></div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow">FOR THE GROWERS. AND THE CURIOUS.</div><h1 id="hero-title">A grower’s guide<br>to <em>smarter<br class="hero-break"> control.</em></h1><p class="hero-description">From the first thermostat to systems that think ahead. Explore how we control growing environments—and how to make better decisions inside them.</p><div class="hero-actions"><a class="button button-primary" href="${chapterUrl(resume)}">${lastChapter ? "Continue learning" : "Start learning"} ${icon("arrow")}</a><a class="text-link" href="#/labs">Try a hands-on lab <span>↗</span></a></div><div class="hero-meta"><span>${icon("book")} 8 chapters</span><span>${icon("flask")} 3 interactive labs</span><span>At your own pace</span></div></div>
      <div class="hero-visual"><div class="figure-heading"><span>FIG. 01</span><span>THE CONNECTED GREENHOUSE</span><span class="figure-plus">+</span></div>${greenhouse()}<div class="flow-controls" aria-label="Explore greenhouse systems"><button class="active" data-layer="air" aria-pressed="true"><span class="flow-dot air"></span>Air & heat</button><button data-layer="water" aria-pressed="false"><span class="flow-dot water"></span>Water & crop</button><button data-layer="energy" aria-pressed="false"><span class="flow-dot energy"></span>Light & energy</button></div><p class="flow-explanation" id="flow-explanation" aria-live="polite">Moving air changes more than temperature.</p></div>
    </section>
    <section class="core-section" aria-labelledby="core-title"><div class="section-intro"><span class="eyebrow">FIRST, THE BIG PICTURE</span><h2 id="core-title">Three ideas. One living system.</h2><p>They work together. They don’t mean the same thing.</p></div><div class="concept-grid">
      ${[
        [
          "graph",
          "01",
          "Structure",
          "What’s connected to what?",
          "Graphs map the relationships between your crop, climate, equipment, and resources.",
          "facility-graphs",
        ],
        [
          "sliders",
          "02",
          "Coordination",
          "What should act together?",
          "Multivariable control coordinates actions, so your equipment stops working at cross-purposes.",
          "control-evolution",
        ],
        [
          "uncertainty",
          "03",
          "Uncertainty",
          "What don’t we know yet?",
          "Bayesian methods turn new evidence into better beliefs—and more informed decisions.",
          "bayesian-control",
        ],
      ]
        .map(
          ([type, num, title, question, text, id]) =>
            `<a class="concept-card" href="${chapterUrl(id)}"><div class="concept-top"><span class="mono">${num} / ${title.toUpperCase()}</span>${icon("arrow")}</div><div class="concept-art">${conceptArt(type)}</div><h3>${question}</h3><p>${text}</p><span class="concept-link">Explore ${title.toLowerCase()} <span>↗</span></span></a>`,
        )
        .join("")}
    </div><div class="principle-note">${icon("layers")}<p><strong>Smarter doesn’t mean replacing everything.</strong> Good automation builds on reliable local control, with safety always underneath.</p><a href="${chapterUrl("control-architecture")}" aria-label="Explore the control architecture">↗</a></div></section>
    <section class="learning-section" aria-labelledby="learning-title"><div class="section-heading"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2 id="learning-title">From a single setpoint<br>to the whole picture.</h2></div><p>Start at the roots or follow your curiosity.<br>Every chapter adds a new way of seeing.</p></div><div class="course-grid">${chapters.map((chapter, index) => `<a class="course-card ${completed.has(chapter.id) ? "is-complete" : ""}" href="${chapterUrl(chapter.id)}"><div class="course-card-top"><span class="chapter-badge">${icon(chapterIcons[index])}</span><span class="mono">CHAPTER ${chapter.number}</span>${completed.has(chapter.id) ? icon("check") : ""}</div><span class="course-category">${escapeHtml(chapter.category)}</span><h3>${escapeHtml(chapter.shortTitle)}</h3><p>${escapeHtml(chapter.subtitle)}</p><div class="course-card-bottom"><span>${icon("clock")} ${chapter.minutes} min read</span>${icon("arrow")}</div></a>`).join("")}</div></section>
    <section class="lab-banner"><div class="lab-banner-art">${conceptArt("sliders")}<span class="mono">LESS THEORY. MORE “OH, I GET IT.”</span></div><div><span class="eyebrow">LEARN BY CHANGING SOMETHING</span><h2>Get your hands on the controls.</h2><p>Move a slider. Challenge an assumption. See why a good decision for one variable can be a bad decision for another.</p><a class="button button-primary" href="#/labs">Enter the learning lab ${icon("arrow")}</a></div></section>
    <section class="closing-note"><span class="eyebrow">A PRACTICAL PERSPECTIVE</span><h2>Not a magic controller.<br><em>A more thoughtful system.</em></h2><p>Built for greenhouse operators, indoor growers, automation engineers, and anyone who wants to understand what better control really means.</p><a href="docs/cea-control-strategies-educational-site-outline.md" target="_blank" rel="noopener" class="text-link">Explore the original field guide ↗</a></section>
  </div>`;
  const flowText = {
    air: "Moving air changes more than temperature.",
    water: "The crop is part of the system—not just its passenger.",
    energy: "Light feeds the crop. It also adds to the climate load.",
  };
  const setLayer = (name) => {
    document.querySelectorAll("[data-flow]").forEach((layer) => {
      layer.style.opacity = layer.dataset.flow === name ? "1" : ".12";
    });
    document.querySelectorAll("[data-layer]").forEach((button) => {
      const active = button.dataset.layer === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active);
    });
    $("#flow-explanation").textContent = flowText[name];
  };
  main
    .querySelectorAll("[data-layer]")
    .forEach((button) =>
      button.addEventListener("click", () => setLayer(button.dataset.layer)),
    );
  setLayer("air");
}

function renderChapter(id) {
  const chapter = chapters.find((item) => item.id === id);
  if (!chapter) return notFound();
  lastChapter = id;
  saveProgress();
  const index = chapters.indexOf(chapter),
    next = chapters[index + 1],
    previous = chapters[index - 1];
  main.innerHTML = `<article class="chapter-page page-enter"><div class="page-kicker"><a href="#/">THE LEARNING PATH</a><span>CHAPTER ${chapter.number} OF 08</span></div><header class="lesson-header"><span class="eyebrow">${escapeHtml(chapter.category)} <span class="inline-divider">/</span> ${chapter.minutes} MIN READ</span><h1>${escapeHtml(chapter.title)}</h1><p class="lesson-intro">${escapeHtml(chapter.intro)}</p></header><div class="lesson-layout"><div class="lesson-content"><section class="learning-objectives"><span class="eyebrow">BY THE END, YOU’LL UNDERSTAND</span><ul>${chapter.objectives.map((objective) => `<li>${icon("check")}<span>${escapeHtml(objective)}</span></li>`).join("")}</ul></section>${chapter.sections.map((section, i) => `<section class="lesson-section" id="${escapeHtml(section.id)}"><span class="section-number mono">${chapter.number}.${String(i + 1).padStart(2, "0")}</span><h2>${escapeHtml(section.title)}</h2>${section.html}</section>`).join("")}<aside class="takeaway"><span class="eyebrow">THE IDEA TO TAKE WITH YOU</span><p>${escapeHtml(chapter.takeaway)}</p></aside>${chapter.lab ? `<a class="lesson-lab-link" href="#/labs/${chapter.lab}"><span class="chapter-badge">${icon("flask")}</span><div><span class="eyebrow">PUT THE IDEA TO WORK</span><h3>Explore it in the interactive lab</h3></div>${icon("arrow")}</a>` : ""}<section class="knowledge-check" aria-labelledby="quiz-heading"><div class="quiz-heading"><span class="eyebrow">PAUSE & REFLECT</span><span>One quick knowledge check</span></div><h2 id="quiz-heading">${escapeHtml(chapter.quiz.question)}</h2><div class="quiz-options">${chapter.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}" aria-pressed="false"><span>${String.fromCharCode(65 + i)}</span>${escapeHtml(option)}</button>`).join("")}</div><p class="quiz-feedback" id="quiz-feedback" aria-live="polite"></p></section><div class="lesson-completion"><button class="button button-primary" id="complete-chapter" aria-pressed="${completed.has(id)}">${completed.has(id) ? "Chapter completed" : "Mark chapter complete"} ${icon("check")}</button><span>You set the pace. Progress stays on this device.</span></div><p class="source-note">${escapeHtml(chapter.source)} · <a href="docs/cea-control-strategies-educational-site-outline.md" target="_blank" rel="noopener">Read the source outline ↗</a></p><nav class="lesson-pagination" aria-label="Chapter navigation">${previous ? `<a href="${chapterUrl(previous.id)}"><span>← PREVIOUS CHAPTER</span><strong>${escapeHtml(previous.shortTitle)}</strong></a>` : '<a href="#/"><span>← BACK TO THE GUIDE</span><strong>Course overview</strong></a>'}${next ? `<a href="${chapterUrl(next.id)}"><span>NEXT CHAPTER →</span><strong>${escapeHtml(next.shortTitle)}</strong></a>` : '<a href="#/labs"><span>KEEP EXPLORING →</span><strong>Put it into practice</strong></a>'}</nav></div><aside class="lesson-toc"><span class="eyebrow">IN THIS CHAPTER</span><nav aria-label="On this page">${chapter.sections.map((section, i) => `<a href="#${escapeHtml(section.id)}" data-scroll="${escapeHtml(section.id)}"><span>${String(i + 1).padStart(2, "0")}</span>${escapeHtml(section.title)}</a>`).join("")}<a href="#quiz-heading" data-scroll="quiz-heading"><span>?</span>Check your understanding</a></nav><div class="toc-note">${icon("leaf")}<p>Understanding the “why” makes the “what next” a little clearer.</p></div></aside></div></article>`;
  main.querySelectorAll("[data-scroll]").forEach((link) =>
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
  main.querySelectorAll("[data-answer]").forEach((button) =>
    button.addEventListener("click", () => {
      const answer = Number(button.dataset.answer),
        correct = answer === chapter.quiz.answer;
      main.querySelectorAll("[data-answer]").forEach((option) => {
        option.classList.remove("correct", "incorrect");
        option.setAttribute("aria-pressed", option === button);
      });
      button.classList.add(correct ? "correct" : "incorrect");
      const feedback = $("#quiz-feedback");
      feedback.className = `quiz-feedback visible ${correct ? "correct" : "incorrect"}`;
      feedback.textContent = correct
        ? `Exactly. ${chapter.quiz.explanation}`
        : "Not quite. Think about the distinction this chapter makes, then try another answer.";
    }),
  );
  $("#complete-chapter").addEventListener("click", (event) => {
    if (completed.has(id)) completed.delete(id);
    else completed.add(id);
    saveProgress();
    const done = completed.has(id);
    event.currentTarget.setAttribute("aria-pressed", done);
    event.currentTarget.innerHTML = `${done ? "Chapter completed" : "Mark chapter complete"} ${icon("check")}`;
  });
}

function renderLabs(id = "coupling") {
  const selected = labInfo.find((lab) => lab.id === id);
  if (!selected) return notFound();
  main.innerHTML = `<div class="labs-page page-enter"><div class="page-kicker"><span>THE LEARNING LAB</span><span>ILLUSTRATIVE MODELS. REAL INSIGHT.</span></div><header class="page-header"><span class="eyebrow">CURIOSITY MEETS CAUSE & EFFECT</span><h1>A little less abstract.<br><em>A lot more hands-on.</em></h1><p>Change the conditions. Watch the trade-offs. These simplified models are here to build intuition, not to operate your facility.</p></header><nav class="lab-tabs" aria-label="Learning labs">${labInfo.map((lab, i) => `<a href="#/labs/${lab.id}" class="${id === lab.id ? "active" : ""}" ${id === lab.id ? 'aria-current="page"' : ""}><span class="lab-tab-number">0${i + 1}</span>${icon(lab.icon)}<span>${lab.label}</span></a>`).join("")}</nav><div class="lab-intro"><span class="eyebrow">EXPLORE THE MODEL. QUESTION THE ASSUMPTIONS.</span><a class="text-link" href="${chapterUrl(selected.chapter)}">Read the chapter ↗</a></div><div id="lab-mount"></div><aside class="lab-safety-note">${icon("book")}<p><strong>A model is a way to think, not a promise.</strong> These labs leave out real facility dynamics. Actual equipment needs commissioned models, independent safety limits, and operator oversight.</p></aside></div>`;
  cleanupLab = mountLab($("#lab-mount"), id);
}

function renderCompare() {
  main.innerHTML = `<div class="reference-page page-enter"><div class="page-kicker"><span>KEEP IT IN PERSPECTIVE</span><span>THE STRATEGY REFERENCE</span></div><header class="page-header"><span class="eyebrow">DIFFERENT TOOLS. DIFFERENT QUESTIONS.</span><h1>Find the right<br><em>kind of control.</em></h1><p>Not a leaderboard. A field reference to what each approach does, where it helps, and what it still needs.</p></header><div class="filter-bar" aria-label="Filter strategies">${["All strategies", "Foundational", "Predictive", "Architectural", "Learning"].map((group, i) => `<button class="filter-button ${i === 0 ? "active" : ""}" data-filter="${group}" aria-pressed="${i === 0}">${group}</button>`).join("")}</div><p class="results-count" id="strategy-count" aria-live="polite"></p><div class="comparison-scroll" tabindex="0" role="region" aria-label="Control strategy comparison, scroll horizontally for all columns"><table class="comparison-table"><caption class="sr-only">Compare control strategies by coordination, planning, and uncertainty handling</caption><thead><tr><th scope="col">The approach</th><th scope="col">The question it answers</th><th scope="col">Coupling</th><th scope="col">Looks ahead</th><th scope="col">Uncertainty</th></tr></thead><tbody id="strategy-rows"></tbody></table></div><div class="principle-note">${icon("layers")}<p><strong>Layer, don’t replace.</strong> A graph-structured facility can use PID, MPC, and Bayesian estimation together. Safety does not depend on any of them.</p></div><a class="button button-outline" href="${chapterUrl("strategy-comparison")}">Read the comparison chapter ${icon("arrow")}</a></div>`;
  const show = (group) => {
    const filtered = strategies.filter(
      (strategy) => group === "All strategies" || strategy.group === group,
    );
    $("#strategy-count").textContent =
      `${filtered.length} ${filtered.length === 1 ? "approach" : "approaches"} · Select a strategy to explore its context`;
    $("#strategy-rows").innerHTML = filtered
      .map(
        (strategy) =>
          `<tr><th scope="row"><a href="${chapterUrl(strategy.lessonId)}">${escapeHtml(strategy.name)} <span>↗</span></a><small>${escapeHtml(strategy.group)}</small></th><td>${escapeHtml(strategy.question)}</td><td>${escapeHtml(strategy.coupling)}</td><td>${escapeHtml(strategy.foresight)}</td><td>${escapeHtml(strategy.uncertainty)}</td></tr>`,
      )
      .join("");
  };
  show("All strategies");
  main.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      main.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", item === button);
      });
      show(button.dataset.filter);
    }),
  );
}

function renderGlossary() {
  main.innerHTML = `<div class="glossary-page page-enter"><div class="page-kicker"><span>WORDS WORTH KNOWING</span><span>THE FIELD GLOSSARY</span></div><header class="page-header"><span class="eyebrow">LESS JARGON. MORE UNDERSTANDING.</span><h1>Get to know<br><em>the language.</em></h1><p>A clear definition can change how you see a whole system. Keep these close as you explore.</p></header><div class="glossary-search">${icon("search")}<label class="sr-only" for="glossary-query">Find a term</label><input type="search" id="glossary-query" placeholder="Find a term, concept, or acronym…" autocomplete="off"><span id="glossary-count" aria-live="polite"></span></div><dl class="glossary-list" id="glossary-list"></dl><div class="empty-state" id="glossary-empty" hidden><h2>No terms found.</h2><p>Try a broader word, like “control,” “model,” or “sensor.”</p></div></div>`;
  const show = (query) => {
    const words = query.toLocaleLowerCase().trim();
    const found = [...glossary]
      .sort((a, b) => a.term.localeCompare(b.term))
      .filter((term) =>
        `${term.term} ${term.definition}`.toLocaleLowerCase().includes(words),
      );
    $("#glossary-count").textContent = `${found.length} terms`;
    $("#glossary-list").innerHTML = found
      .map(
        (term) =>
          `<div class="glossary-entry"><dt>${escapeHtml(term.term)}</dt><dd>${escapeHtml(term.definition)}</dd></div>`,
      )
      .join("");
    $("#glossary-empty").hidden = found.length > 0;
  };
  $("#glossary-query").addEventListener("input", (event) =>
    show(event.target.value),
  );
  show("");
}
function notFound() {
  main.innerHTML = `<div class="empty-state"><span class="eyebrow">A LITTLE OFF THE PATH</span><h1>Let’s get back<br>to growing.</h1><p>That page isn’t part of this guide.</p><a class="button button-primary" href="#/">Back to the overview ${icon("arrow")}</a></div>`;
}
function setMenu(open) {
  open = open && mobileNavigation.matches;
  document.body.classList.toggle("menu-open", open);
  $("#menu-toggle").setAttribute("aria-expanded", open);
  $("#menu-toggle").setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
  $("#menu-backdrop").hidden = !open;
  $("#sidebar").inert = mobileNavigation.matches && !open;
  $(".main-shell").inert = open;
  if (open) $("#search-trigger").focus();
}
function route() {
  if (typeof cleanupLab === "function") cleanupLab();
  cleanupLab = null;
  const parts = location.hash.replace(/^#\/?/, "").split("/");
  const [page, id] = parts;
  const navigation = currentRoute !== location.hash;
  currentRoute = location.hash;
  setMenu(false);
  let title = "Overview";
  if (!page) home();
  else if (page === "chapter") {
    renderChapter(id);
    title =
      chapters.find((chapter) => chapter.id === id)?.shortTitle || "Not found";
  } else if (page === "labs") {
    renderLabs(id);
    title = "Interactive labs";
  } else if (page === "compare") {
    renderCompare();
    title = "Strategy reference";
  } else if (page === "glossary") {
    renderGlossary();
    title = "Field glossary";
  } else {
    notFound();
    title = "Not found";
  }
  $("#breadcrumb-current").textContent = title;
  document.title = `${title} · Grownetics Academy`;
  document.querySelectorAll("[data-nav], [data-chapter]").forEach((link) => {
    const active = link.dataset.chapter
      ? page === "chapter" && id === link.dataset.chapter
      : link.dataset.nav === (page || "home");
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (navigation) {
    window.scrollTo({ top: 0, behavior: "instant" });
    main.focus({ preventScroll: true });
  }
}

const searchIndex = [
  ...chapters.map((chapter) => ({
    title: chapter.title,
    subtitle: `Chapter ${chapter.number} · ${chapter.shortTitle}`,
    text: [
      chapter.title,
      chapter.subtitle,
      chapter.intro,
      ...chapter.sections.map((section) => textOnly(section.html)),
    ].join(" "),
    url: chapterUrl(chapter.id),
    icon: "book",
  })),
  ...glossary.map((term) => ({
    title: term.term,
    subtitle: term.definition,
    text: `${term.term} ${term.definition}`,
    url: "#/glossary",
    icon: "file",
    term: term.term,
  })),
  ...labInfo.map((lab) => ({
    title: lab.label,
    subtitle: lab.text,
    text: `${lab.title} ${lab.label} ${lab.text}`,
    url: `#/labs/${lab.id}`,
    icon: "flask",
  })),
];
function showSearch(query = "") {
  const tokens = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = tokens.length
    ? searchIndex
        .filter((item) =>
          tokens.every((token) =>
            item.text.toLocaleLowerCase().includes(token),
          ),
        )
        .sort(
          (a, b) =>
            Number(
              b.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            ) -
            Number(
              a.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            ),
        )
        .slice(0, 12)
    : searchIndex.filter((item) => item.icon === "book").slice(0, 5);
  $("#search-results").innerHTML =
    `<p class="search-result-label">${tokens.length ? `${matches.length}${matches.length === 12 ? "+" : ""} MATCHING RESULTS` : "A FEW PLACES TO START"}</p>${matches.length ? matches.map((item) => `<a class="search-result" href="${item.url}" ${item.term ? `data-term="${escapeHtml(item.term)}"` : ""}>${icon(item.icon)}<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle)}</small></span><span>↗</span></a>`).join("") : '<div class="search-empty"><p>No results yet.</p><span>Try “humidity”, “PID”, “Bayesian”, or “safety”.</span></div>'}`;
  $("#search-results")
    .querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", (event) => {
        $("#search-dialog").close();
        const term = link.dataset.term;
        if (term) {
          event.preventDefault();
          if (location.hash === "#/glossary") {
            renderGlossary();
            applyGlossaryTerm(term);
          } else {
            window.addEventListener(
              "hashchange",
              () => applyGlossaryTerm(term),
              { once: true },
            );
            location.hash = "/glossary";
          }
        }
      }),
    );
}
function applyGlossaryTerm(term) {
  const input = $("#glossary-query");
  if (input) {
    input.value = term;
    input.dispatchEvent(new Event("input"));
    input.focus();
  }
}
function openSearch() {
  setMenu(false);
  $("#search-input").value = "";
  showSearch();
  $("#search-dialog").showModal();
  $("#search-input").focus();
}
renderChrome();
$(".skip-link").addEventListener("click", (event) => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView({ block: "start" });
});
mobileNavigation.addEventListener("change", () => setMenu(false));
$("#search-trigger").addEventListener("click", openSearch);
$("#search-close").addEventListener("click", () => $("#search-dialog").close());
$("#search-dialog").addEventListener("click", (event) => {
  if (event.target === $("#search-dialog")) {
    const rect = event.target.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      event.target.close();
  }
});
$("#search-input").addEventListener("input", (event) =>
  showSearch(event.target.value),
);
$("#search-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    $("#search-results a")?.click();
  }
});
$("#menu-toggle").addEventListener("click", () =>
  setMenu(!document.body.classList.contains("menu-open")),
);
$("#menu-backdrop").addEventListener("click", () => {
  setMenu(false);
  $("#menu-toggle").focus();
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    if ($("#search-dialog").open) $("#search-dialog").close();
    else openSearch();
  }
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
