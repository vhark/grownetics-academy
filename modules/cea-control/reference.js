import { strategies } from "./lessons.js";
import { icon, escapeHtml, moduleUrl, lessonUrl } from "../../js/ui.js";

export function renderReference(container, { module }) {
  const controller = new AbortController();
  container.innerHTML = `<div class="reference-page page-enter"><div class="page-kicker"><a href="${moduleUrl(module.id)}">← MODULE ${escapeHtml(module.number)} / ${escapeHtml(module.shortTitle)}</a><span>THE STRATEGY REFERENCE</span></div><header class="page-header"><span class="eyebrow">DIFFERENT TOOLS. DIFFERENT QUESTIONS.</span><h1>Find the right<br><em>kind of control.</em></h1><p>Not a leaderboard. A field reference to what each approach does, where it helps, and what it still needs.</p></header><div class="filter-bar" aria-label="Filter strategies">${["All strategies", "Foundational", "Predictive", "Architectural", "Learning"].map((group, i) => `<button class="filter-button ${i === 0 ? "active" : ""}" data-filter="${group}" aria-pressed="${i === 0}">${group}</button>`).join("")}</div><p class="results-count" id="strategy-count" aria-live="polite"></p><div class="comparison-scroll" tabindex="0" role="region" aria-label="Control strategy comparison, scroll horizontally for all columns"><table class="comparison-table"><caption class="sr-only">Compare control strategies by coordination, planning, and uncertainty handling</caption><thead><tr><th scope="col">The approach</th><th scope="col">The question it answers</th><th scope="col">Coupling</th><th scope="col">Looks ahead</th><th scope="col">Uncertainty</th></tr></thead><tbody id="strategy-rows"></tbody></table></div><div class="principle-note">${icon("layers")}<p><strong>Layer, don’t replace.</strong> A graph-structured facility can use PID, MPC, and Bayesian estimation together. Safety does not depend on any of them.</p></div><a class="button button-outline" href="${lessonUrl(module.id, "strategy-comparison")}">Read the comparison lesson ${icon("arrow")}</a></div>`;
  const show = (group) => {
    const filtered = strategies.filter(
      (strategy) => group === "All strategies" || strategy.group === group,
    );
    container.querySelector("#strategy-count").textContent =
      `${filtered.length} ${filtered.length === 1 ? "approach" : "approaches"} · Select a strategy to explore its context`;
    container.querySelector("#strategy-rows").innerHTML = filtered
      .map(
        (strategy) =>
          `<tr><th scope="row"><a href="${lessonUrl(module.id, strategy.lessonId)}">${escapeHtml(strategy.name)} <span>↗</span></a><small>${escapeHtml(strategy.group)}</small></th><td>${escapeHtml(strategy.question)}</td><td>${escapeHtml(strategy.coupling)}</td><td>${escapeHtml(strategy.foresight)}</td><td>${escapeHtml(strategy.uncertainty)}</td></tr>`,
      )
      .join("");
  };
  show("All strategies");
  container.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        container.querySelectorAll("[data-filter]").forEach((item) => {
          item.classList.toggle("active", item === button);
          item.setAttribute("aria-pressed", item === button);
        });
        show(button.dataset.filter);
      },
      { signal: controller.signal },
    ),
  );
  return () => controller.abort();
}
