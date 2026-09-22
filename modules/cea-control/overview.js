import { icon, escapeHtml, lessonUrl, labUrl } from "../../js/ui.js";
import { greenhouse, conceptArt } from "./illustrations.js";

const lessonIcons = [
  "leaf",
  "sliders",
  "compare",
  "sun",
  "graph",
  "uncertainty",
  "layers",
  "book",
];

export function renderOverview(
  container,
  { module, completed, lastLesson, storageAvailable },
) {
  const completedIds = new Set(completed);
  const resume = lastLesson || module.lessons[0].id;
  const controller = new AbortController();
  container.innerHTML = `<div class="overview-page page-enter">
    <div class="page-kicker"><a href="#/">← BACK TO ACADEMY</a><span><span class="status-dot"></span> MODULE ${escapeHtml(module.number)}</span></div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow">${escapeHtml(module.title)}</div><h1 id="hero-title">A grower’s guide<br>to <em>smarter<br class="hero-break"> control.</em></h1><p class="hero-description">From the first thermostat to systems that think ahead. Explore how we control growing environments—and how to make better decisions inside them.</p><div class="hero-actions"><a class="button button-primary" href="${lessonUrl(module.id, resume)}">${lastLesson ? "Continue learning" : "Start learning"} ${icon("arrow")}</a><a class="text-link" href="${labUrl(module.id)}">Try a hands-on lab <span>↗</span></a></div><div class="hero-meta"><span>${icon("book")} ${module.lessons.length} lessons</span><span>${icon("flask")} ${module.labs.length} interactive labs</span><span>At your own pace</span></div><p class="source-note">${completedIds.size} of ${module.lessons.length} lessons completed. ${storageAvailable ? "Progress stays on this device." : "Progress is available for this session only; browser storage is unavailable."}</p></div>
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
            `<a class="concept-card" href="${lessonUrl(module.id, id)}"><div class="concept-top"><span class="mono">${num} / ${title.toUpperCase()}</span>${icon("arrow")}</div><div class="concept-art">${conceptArt(type)}</div><h3>${question}</h3><p>${text}</p><span class="concept-link">Explore ${title.toLowerCase()} <span>↗</span></span></a>`,
        )
        .join("")}
    </div><div class="principle-note">${icon("layers")}<p><strong>Smarter doesn’t mean replacing everything.</strong> Good automation builds on reliable local control, with safety always underneath.</p><a href="${lessonUrl(module.id, "control-architecture")}" aria-label="Explore the control architecture">↗</a></div></section>
    <section class="learning-section" aria-labelledby="learning-title"><div class="section-heading"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2 id="learning-title">From a single setpoint<br>to the whole picture.</h2></div><p>Start at the roots or follow your curiosity.<br>Every lesson adds a new way of seeing.</p></div><div class="course-grid">${module.lessons.map((lesson, index) => `<a class="course-card ${completedIds.has(lesson.id) ? "is-complete" : ""}" href="${lessonUrl(module.id, lesson.id)}"><div class="course-card-top"><span class="chapter-badge">${icon(lessonIcons[index])}</span><span class="mono">LESSON ${escapeHtml(lesson.number)}</span>${completedIds.has(lesson.id) ? icon("check") : ""}</div><span class="course-category">${escapeHtml(lesson.category)}</span><h3>${escapeHtml(lesson.shortTitle)}</h3><p>${escapeHtml(lesson.subtitle)}</p><div class="course-card-bottom"><span>${icon("clock")} ${lesson.minutes} min read</span>${icon("arrow")}</div></a>`).join("")}</div></section>
    <section class="lab-banner"><div class="lab-banner-art">${conceptArt("sliders")}<span class="mono">LESS THEORY. MORE “OH, I GET IT.”</span></div><div><span class="eyebrow">LEARN BY CHANGING SOMETHING</span><h2>Get your hands on the controls.</h2><p>Move a slider. Challenge an assumption. See why a good decision for one variable can be a bad decision for another.</p><a class="button button-primary" href="${labUrl(module.id)}">Enter the learning lab ${icon("arrow")}</a></div></section>
    <section class="closing-note"><span class="eyebrow">A PRACTICAL PERSPECTIVE</span><h2>Not a magic controller.<br><em>A more thoughtful system.</em></h2><p>Built for greenhouse operators, indoor growers, automation engineers, and anyone who wants to understand what better control really means.</p><a href="${escapeHtml(module.sources[0].url)}" target="_blank" rel="noopener" class="text-link">Explore the original field guide ↗</a></section>
  </div>`;
  const flowText = {
    air: "Moving air changes more than temperature.",
    water: "The crop is part of the system—not just its passenger.",
    energy: "Light feeds the crop. It also adds to the climate load.",
  };
  const setLayer = (name) => {
    container.querySelectorAll("[data-flow]").forEach((layer) => {
      layer.style.opacity = layer.dataset.flow === name ? "1" : ".12";
    });
    container.querySelectorAll("[data-layer]").forEach((button) => {
      const active = button.dataset.layer === name;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active);
    });
    container.querySelector("#flow-explanation").textContent = flowText[name];
  };
  container.querySelectorAll("[data-layer]").forEach((button) =>
    button.addEventListener("click", () => setLayer(button.dataset.layer), {
      signal: controller.signal,
    }),
  );
  setLayer("air");
  return () => controller.abort();
}
