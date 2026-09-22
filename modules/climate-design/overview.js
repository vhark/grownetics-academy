import { renderLessonCards } from "../../js/reader.js";
import {
  escapeHtml,
  icon,
  lessonUrl,
  labUrl,
  referenceUrl,
  moduleUrl,
} from "../../js/ui.js";

export function renderOverview(
  container,
  { module, completed = [], lastLesson, storageAvailable },
) {
  const resume =
    module.lessons.find((lesson) => lesson.id === lastLesson) ||
    module.lessons[0];
  const steps = [
    ["sun", "Outside climate", "What arrives at the site?"],
    ["leaf", "Crop band", "What must the crop receive?"],
    ["compare", "Heat & water", "What must move—and where?"],
    ["layers", "Building", "What can the enclosure change?"],
    ["sliders", "Equipment & controls", "What can we deliver, safely?"],
  ];
  container.innerHTML = `<div class="overview-page climate-overview page-enter">
    <div class="page-kicker"><a href="#/">← ALL MODULES</a><span>MODULE ${escapeHtml(module.number)} · REVIEW EDITION</span></div>
    <section class="climate-hero" aria-labelledby="climate-title">
      <div class="climate-hero-copy"><span class="eyebrow">CLIMATE, PSYCHROMETRICS & CEA DESIGN</span><h1 id="climate-title">Begin with the air.<br><em>Design for the crop.</em></h1><p class="climate-lead">Before choosing a machine, learn what the outside air can offer—and what it cannot carry away.</p><p>A warm, dry afternoon. A humid night. A roof that loses heat while a living canopy releases water. Follow these everyday conditions through the building, and climate design becomes a set of questions you can explain rather than a list of products to buy.</p><div class="hero-actions"><a class="button button-primary" href="${lessonUrl(module.id, resume.id)}">${lastLesson ? "Continue the journey" : "Start with the air"} ${icon("arrow")}</a><a class="text-link" href="${referenceUrl(module.id, "climate-atlas")}">Explore real weather ↗</a></div><div class="hero-meta"><span>${icon("book")} 7 lessons</span><span>${icon("flask")} 3 hands-on labs</span><span>${icon("sun")} 14 study locations</span></div></div>
      <figure class="climate-chain"><figcaption><span class="eyebrow">THE DESIGN CHAIN</span><h2>One question leads<br>to the next.</h2></figcaption><ol>${steps.map(([symbol, title, question], index) => `<li><span class="climate-chain-symbol">${icon(symbol)}</span><div><span class="climate-chain-number">0${index + 1}</span><h3>${title}</h3><p>${question}</p></div>${index < steps.length - 1 ? '<span class="climate-chain-arrow" aria-hidden="true">↓</span>' : ""}</li>`).join("")}</ol><p class="climate-chain-caption">Then return to the evidence.<br>A better measurement can change the decision.</p></figure>
    </section>
    <section class="climate-editorial" aria-labelledby="climate-editorial-title"><span class="eyebrow">A PRACTICAL WAY OF SEEING</span><h2 id="climate-editorial-title">Not every cool breeze<br>is a complete solution.</h2><div class="climate-editorial-columns"><p>Outside air can be cool enough to reduce temperature yet too wet to remove crop moisture. A pad can lower dry-bulb temperature while adding vapor. A tighter building can save heat while making its water-removal strategy more important. You will learn to trace both consequences before calling an intervention a success.</p><p>No prerequisites are required. <a href="${moduleUrl("cea-control")}">Module 01: The Evolution of CEA Control</a> is an optional companion if you would like more background on coupled systems and coordinated control. Here, the focus is the physical design brief: weather → crop → loads → building → equipment → operation.</p></div></section>
    <section class="climate-outcomes" aria-labelledby="climate-outcomes-title"><div><span class="eyebrow">WHAT YOU WILL LEAVE WITH</span><h2 id="climate-outcomes-title">A decision you can explain.</h2></div><ul>${module.objectives.map((objective) => `<li>${icon("check")}<span>${escapeHtml(objective)}</span></li>`).join("")}</ul></section>
    <section class="learning-section" aria-labelledby="climate-learning-title"><div class="section-heading"><div><span class="eyebrow">YOUR LEARNING PATH</span><h2 id="climate-learning-title">From an air state<br>to a design brief.</h2></div><p>Read, try a calculation, then challenge an assumption.<br>The suggested times include worked reasoning and short exercises.</p></div>${renderLessonCards(module, completed)}<p class="climate-small">${storageAvailable === false ? "Progress is available for this visit only." : "Set your own pace. Learning progress stays on this device."} This complete review edition remains unpublished while its content is reviewed.</p></section>
    <section class="climate-resource-grid" aria-label="Learning resources"><a class="climate-resource-card" href="${labUrl(module.id)}"><span class="eyebrow">CHANGE ONE ASSUMPTION</span>${icon("flask")}<h2>Make the physics visible.</h2><p>Read an air state, explore outside-air and pad opportunity, and connect envelope heat flow with crop light. These are bounded teaching calculations—not an annual simulator.</p><span class="text-link">Open the three labs ↗</span></a><a class="climate-resource-card" href="${referenceUrl(module.id, "climate-atlas")}"><span class="eyebrow">REAL WEATHER, HONEST LIMITS</span>${icon("sun")}<h2>See fourteen places differently.</h2><p>Compare seven broad climate settings using hourly 2024 ERA5 data through Open-Meteo. One illustrative year reveals patterns; it is not a climate normal or an equipment design extreme.</p><span class="text-link">Open the climate atlas ↗</span></a></section>
    <section class="climate-handoff" aria-labelledby="climate-handoff-title"><span class="eyebrow">WHEN YOU WANT TO GO DEEPER</span><h2 id="climate-handoff-title">Bring a question.<br>Keep the assumptions.</h2><p>In the <a href="https://vhark.github.io/cea-psychrometric-site-evaluator/app/lab/" target="_blank" rel="noopener">external air-state lab</a>, enter a state from your notes and compare sensible heating with evaporation. In the <a href="https://vhark.github.io/cea-psychrometric-site-evaluator/app/" target="_blank" rel="noopener">CEA Psychrometric Site Evaluator</a>, manually recreate a facility brief, duplicate it, and change one equipment assumption. Observe both temperature and moisture failures before reading cost.</p><p>There is no automatic scenario transfer. The evaluator is an assumption-based screen, not site-calibrated sizing or a manufacturer comparison. Its historical six-US-site results are not a global equipment ranking.</p><a class="text-link" href="${referenceUrl(module.id, "sources")}">Read the sources, methods, and evidence boundaries ↗</a></section>
  </div>`;
}
