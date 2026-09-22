let labInstance = 0;

const saturationPressure = (temperature) =>
  0.61078 * Math.exp((17.2694 * temperature) / (temperature + 237.3));
const humidityRatio = (temperature, rh) => {
  const pressure = (saturationPressure(temperature) * rh) / 100;
  return (0.62198 * pressure) / (101.325 - pressure);
};
const pct = (value) => `${Math.round(value * 100)}%`;
const signed = (value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
const metric = (label, value, detail, tone = "") =>
  `<div class="lab-metric ${tone}"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`;

function shell(container, number, title, intro) {
  const root = document.createElement("section");
  const heading = `lab-heading-${++labInstance}`;
  root.className = "lab";
  root.setAttribute("aria-labelledby", heading);
  root.innerHTML = `<header class="lab-header"><span class="lab-eyebrow">INTERACTIVE LAB / ${number}</span><h2 id="${heading}">${title}</h2><p>${intro}</p></header><div class="lab-body"></div>`;
  container.replaceChildren(root);
  return root;
}

function coupling(container, signal) {
  const root = shell(
    container,
    "01",
    "One vent. Three consequences.",
    "Move a single actuator and watch the whole room respond. Does cooling the air always solve the humidity problem?",
  );
  let outside = "cool";
  root.querySelector(".lab-body").innerHTML =
    `<div class="lab-workspace"><div class="lab-controls"><span class="lab-eyebrow">YOUR CONTROL</span><label class="lab-slider-label">Roof vent opening <output data-opening>40%</output><input type="range" min="0" max="100" step="1" value="40" data-vent aria-label="Roof vent opening, percent"></label><div class="lab-range-ends"><span>Closed</span><span>Fully open</span></div><fieldset class="lab-choices"><legend>Outside air</legend><button type="button" data-weather="cool" aria-pressed="true"><strong>Cool & dry</strong><span>16°C · 55% RH</span></button><button type="button" data-weather="warm" aria-pressed="false"><strong>Warm & humid</strong><span>32°C · 78% RH</span></button></fieldset><p class="lab-control-note">Reference room: 28°C, 72% RH, 950 ppm CO₂. Outside CO₂: 420 ppm.</p><button type="button" class="lab-reset" data-reset>Reset experiment <span aria-hidden="true">↺</span></button></div><div class="lab-results"><div class="lab-plot lab-coupling-plot" data-diagram></div><div class="lab-metrics" data-metrics></div><p class="lab-insight" data-summary aria-live="polite" aria-atomic="true"></p></div></div><details class="lab-method"><summary>Inside the model <span>Assumptions & equations</span></summary><div><p>This is an illustrative, steady mixing proxy, not a transient facility simulation. Vent opening maps to an outside-air fraction <code>f = 0.75 × opening / 100</code>; that mapping is arbitrary, not a ventilation-rate prediction.</p><p>At a constant 101.325 kPa, saturation vapor pressure is <code>eₛ(T) = 0.61078 exp(17.2694T / (T + 237.3))</code> kPa. We convert RH to humidity ratio <code>w = 0.62198e / (101.325 − e)</code>, mix <code>w = (1−f)wᵢ + fwₒ</code>, then recover vapor pressure and RH at the mixed temperature. Temperature and CO₂ use the same linear mixing fraction.</p><p>Fixed reference states; no ongoing transpiration, heating, CO₂ injection, condensation, wind or ventilation dynamics. Moisture is mixed before calculating RH—outside RH alone does not tell you whether ventilation will remove water.</p></div></details>`;
  const input = root.querySelector("[data-vent]");
  function render() {
    const opening = Number(input.value);
    const fraction = (0.75 * opening) / 100;
    const air = outside === "cool" ? { t: 16, rh: 55 } : { t: 32, rh: 78 };
    const initialMoisture = humidityRatio(28, 72);
    const outsideMoisture = humidityRatio(air.t, air.rh);
    const moisture =
      initialMoisture * (1 - fraction) + outsideMoisture * fraction;
    const temperature = 28 * (1 - fraction) + air.t * fraction;
    const vapor = (101.325 * moisture) / (0.62198 + moisture);
    const rh = (100 * vapor) / saturationPressure(temperature);
    const co2 = 950 * (1 - fraction) + 420 * fraction;
    root.querySelector("[data-opening]").value = `${opening}%`;
    root
      .querySelectorAll("[data-weather]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.weather === outside),
        ),
      );
    root.querySelector("[data-metrics]").innerHTML =
      metric(
        "AIR TEMPERATURE",
        `${temperature.toFixed(1)}<em>°C</em>`,
        `${signed(temperature - 28)}°C from reference`,
      ) +
      metric(
        "RELATIVE HUMIDITY",
        `${rh.toFixed(1)}<em>%</em>`,
        `${signed(rh - 72)} percentage points`,
      ) +
      metric(
        "CO₂ CONCENTRATION",
        `${Math.round(co2)}<em>ppm</em>`,
        `${Math.round(co2 - 950)} ppm from reference`,
      );
    root.querySelector("[data-diagram]").innerHTML =
      `<svg viewBox="0 0 660 220" role="img" aria-label="A roof vent connects one opening setting to temperature, moisture and carbon dioxide. ${opening}% opening mixes in ${(fraction * 100).toFixed(0)}% outside air."><path class="lab-flow" d="M240 110 H320 M320 110 V43 H420 M320 110 H420 M320 110 V177 H420"/><circle cx="320" cy="110" r="5" class="lab-node-dot"/><rect class="lab-node-main" x="24" y="61" width="216" height="98" rx="14"/><path class="lab-vent-icon" d="M49 106 l18 -16 18 16 M54 106 v22 h26 v-22 M63 115 h9"/><text class="lab-svg-label" x="105" y="98">ROOF VENT</text><text class="lab-svg-value" x="105" y="130">${opening}% open</text><rect class="lab-node" x="420" y="17" width="216" height="52" rx="10"/><rect class="lab-node" x="420" y="84" width="216" height="52" rx="10"/><rect class="lab-node" x="420" y="151" width="216" height="52" rx="10"/><text class="lab-svg-copy" x="440" y="49">Temperature ${temperature.toFixed(1)}°C</text><text class="lab-svg-copy" x="440" y="116">Moisture ${(moisture * 1000).toFixed(1)} g/kg</text><text class="lab-svg-copy" x="440" y="183">CO₂ ${Math.round(co2)} ppm</text></svg><div class="lab-plot-caption"><span class="lab-dot"></span>One action, coupled outcomes <span>${(fraction * 100).toFixed(0)}% outside-air fraction</span></div>`;
    const observation =
      opening === 0
        ? "The vent is closed: all three values remain at the reference state."
        : outside === "cool"
          ? "This air cools the room and removes moisture, but it also dilutes the enriched CO₂."
          : "This air adds heat and moisture while still diluting CO₂. Opening the vent is not dehumidification in these conditions.";
    root.querySelector("[data-summary]").textContent =
      `${observation} Outside air carries ${(outsideMoisture * 1000).toFixed(1)} g of water per kg of dry air, compared with ${(initialMoisture * 1000).toFixed(1)} g/kg inside. Compare moisture content, not RH alone.`;
  }
  input.addEventListener("input", render, { signal });
  root.querySelectorAll("[data-weather]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        outside = button.dataset.weather;
        render();
      },
      { signal },
    ),
  );
  root.querySelector("[data-reset]").addEventListener(
    "click",
    () => {
      outside = "cool";
      input.value = "40";
      render();
    },
    { signal },
  );
  render();
}

const PLANNING_STEPS = 20;
const ACTIONS = [0, 0.5, 1];
function cropLoad(step, scale) {
  const profile =
    step < 4
      ? 0.3
      : step < 7
        ? [0.55, 0.9, 1.2][step - 4]
        : step < 14
          ? 1.35
          : 0.85;
  return scale * profile;
}
function advance(state, action, load) {
  const capacity = 0.5 * state.capacity + 0.5 * action;
  const rh = state.rh + load - 5 * capacity - 0.04 * (state.rh - 65);
  return { rh, capacity };
}
function choosePlan(state, step, scale, previousAction) {
  let bestCost = Infinity;
  let bestSequence = null;
  const horizon = Math.min(5, PLANNING_STEPS - step);
  function search(current, depth, lastAction, cost, sequence) {
    if (depth === horizon) {
      if (cost < bestCost) {
        bestCost = cost;
        bestSequence = sequence;
      }
      return;
    }
    for (const action of ACTIONS) {
      const next = advance(current, action, cropLoad(step + depth, scale));
      if (next.rh < 55 || next.rh > 85) continue;
      const nextCost =
        cost +
        (next.rh - 72) ** 2 +
        6 * action ** 2 +
        2 * (action - lastAction) ** 2;
      if (nextCost >= bestCost) continue;
      search(next, depth + 1, action, nextCost, [...sequence, action]);
    }
  }
  search(state, 0, previousAction, 0, []);
  return {
    sequence: bestSequence,
    action: bestSequence ? bestSequence[0] : state.rh < 55 ? 0 : 1,
    feasible: bestSequence !== null,
  };
}
function simulate(scale) {
  let reactive = { rh: 72, capacity: 0 };
  let predictive = { rh: 72, capacity: 0 };
  let reactiveAction = 0;
  let previousAction = 0;
  const rows = [
    {
      minute: 0,
      reactive: 72,
      predictive: 72,
      reactiveAction: 0,
      predictiveAction: 0,
      feasible: true,
      sequence: [],
    },
  ];
  for (let step = 0; step < PLANNING_STEPS; step++) {
    if (reactive.rh >= 80) reactiveAction = 1;
    else if (reactive.rh <= 74) reactiveAction = 0;
    const plan = choosePlan(predictive, step, scale, previousAction);
    const load = cropLoad(step, scale);
    reactive = advance(reactive, reactiveAction, load);
    predictive = advance(predictive, plan.action, load);
    previousAction = plan.action;
    rows.push({
      minute: (step + 1) * 5,
      reactive: reactive.rh,
      predictive: predictive.rh,
      reactiveAction,
      predictiveAction: plan.action,
      feasible: plan.feasible,
      sequence: plan.sequence || [],
    });
  }
  return rows;
}
function planningChart(rows) {
  const x = (minute) => 52 + (minute / 100) * 574;
  const maximum = Math.max(
    95,
    Math.ceil(
      Math.max(...rows.flatMap((row) => [row.reactive, row.predictive])) / 5,
    ) * 5,
  );
  const minimum = 50;
  const y = (rh) => 238 - ((rh - minimum) / (maximum - minimum)) * 204;
  const path = (key) =>
    rows
      .map(
        (row, index) =>
          `${index ? "L" : "M"}${x(row.minute).toFixed(1)},${y(row[key]).toFixed(1)}`,
      )
      .join(" ");
  const grid = [55, 65, 75, 85, maximum]
    .map(
      (tick) =>
        `<line class="lab-grid" x1="52" y1="${y(tick)}" x2="626" y2="${y(tick)}"/><text class="lab-axis" x="40" y="${y(tick) + 4}" text-anchor="end">${tick}</text>`,
    )
    .join("");
  const timeLabels = [0, 20, 40, 60, 80, 100]
    .map(
      (minute) =>
        `<text class="lab-axis" x="${x(minute)}" y="259" text-anchor="middle">${minute}</text>`,
    )
    .join("");
  const actions = rows
    .slice(1)
    .map(
      (row) =>
        `<rect class="lab-action-reactive" x="${x(row.minute - 5) + 1}" y="${301 - row.reactiveAction * 18}" width="26.7" height="${Math.max(1, row.reactiveAction * 18)}"/><rect class="lab-action-predictive" x="${x(row.minute - 5) + 1}" y="${331 - row.predictiveAction * 18}" width="26.7" height="${Math.max(1, row.predictiveAction * 18)}"/>`,
    )
    .join("");
  return `<svg viewBox="0 0 660 361" role="img" aria-label="Relative humidity trajectories through minute ${rows.at(-1).minute}. Orange dashed line: reactive control. Green solid line: receding-horizon MPC. Lower bars show commanded dehumidifier capacity. Exact values are in the scenario data table."><rect class="lab-risk-area" x="52" y="34" width="574" height="${y(85) - 34}"/><rect class="lab-lights-area" x="${x(20)}" y="34" width="${x(35) - x(20)}" height="204"/>${grid}<text class="lab-axis-title" x="52" y="18">RELATIVE HUMIDITY (%)</text><text class="lab-axis" x="626" y="18" text-anchor="end">ILLUSTRATIVE MODEL</text><line class="lab-threshold" x1="52" x2="626" y1="${y(80)}" y2="${y(80)}"/><text class="lab-threshold-label" x="618" y="${y(80) - 5}" text-anchor="end">80% reactive trigger</text><path class="lab-trace lab-trace-reactive" d="${path("reactive")}"/><path class="lab-trace lab-trace-predictive" d="${path("predictive")}"/>${timeLabels}<text class="lab-axis" x="52" y="279">COMMAND</text><text class="lab-axis" x="626" y="279" text-anchor="end">TIME (MINUTES)</text>${actions}<text class="lab-axis" x="40" y="299" text-anchor="end">R</text><text class="lab-axis" x="40" y="329" text-anchor="end">M</text><text class="lab-axis" x="52" y="352">Lights ramp: minute 20–35</text><text class="lab-axis" x="626" y="352" text-anchor="end">Shaded risk region: above 85% RH</text></svg>`;
}
function planning(container, signal) {
  const root = shell(
    container,
    "02",
    "React now. Or plan ahead.",
    "The same room, crop load and dehumidifier. Compare a threshold controller with a controller that calculates its next move.",
  );
  let visible = PLANNING_STEPS;
  let rows;
  root.querySelector(".lab-body").innerHTML =
    `<div class="lab-workspace"><div class="lab-controls"><span class="lab-eyebrow">YOUR SCENARIO</span><label class="lab-slider-label">Crop moisture load <output data-load-value>3.5 units</output><input data-load type="range" min="1" max="4.5" step="0.1" value="3.5" aria-label="Anticipated crop moisture load, illustrative units"></label><div class="lab-range-ends"><span>Light canopy</span><span>Heavy canopy</span></div><p class="lab-control-note">A known lights-on ramp increases the moisture load. Both controllers start at 72% RH with the same limited, slow-responding dehumidifier.</p><div class="lab-button-stack"><button class="lab-primary" type="button" data-run>Run full scenario <span aria-hidden="true">↗</span></button><button class="lab-secondary" type="button" data-step>Step through</button></div><p class="lab-control-note">Deterministic calculation, not live telemetry. Change the load to calculate a new scenario.</p><button type="button" class="lab-reset" data-reset>Reset experiment <span aria-hidden="true">↺</span></button></div><div class="lab-results"><div class="lab-legend"><span><i class="lab-key lab-key-reactive"></i>Reactive threshold</span><span><i class="lab-key lab-key-predictive"></i>Receding-horizon MPC</span></div><div class="lab-plot" data-chart></div><div class="lab-comparison" data-comparison></div><p class="lab-insight" data-summary aria-live="polite" aria-atomic="true"></p><p class="lab-plan-note" data-plan></p></div></div><details class="lab-method"><summary>Inside the model <span>Objective, constraints & assumptions</span></summary><div><p>One constant-temperature room, with a 5-minute time step. The RH state is a linear proxy for moisture at fixed temperature; this is not a calibrated crop or psychrometric model. A state <code>a</code> represents delivered dehumidification capacity, a command <code>u</code> can be 0, 0.5 or 1, and <code>L</code> is the selected load.</p><p><code>aₜ₊₁ = 0.5aₜ + 0.5uₜ</code><br><code>RHₜ₊₁ = RHₜ + Lsₜ − 5aₜ₊₁ − 0.04(RHₜ − 65)</code></p><p>The known load multiplier <code>s</code> is 0.3 before minute 20; 0.55, 0.9 and 1.2 during the next three intervals; 1.35 until minute 70; then 0.85. This isolates the forecast effect: the model and load are known perfectly to MPC. Real forecasts and models have errors.</p><p><strong>Reactive:</strong> command 100% at RH ≥ 80%; turn off at RH ≤ 74%; otherwise hold. <strong>MPC:</strong> enumerate up to 243 five-action sequences over a 25-minute horizon, reject predicted RH outside 55–85%, and minimize <code>Σ[(RH − 72)² + 6u² + 2(u − u_previous)²]</code>. Apply only the first command, measure the new state and solve again. The horizon shortens at the end of the run.</p><p>If no sequence meets the illustrative bounds, the model flags infeasibility and requests maximum dehumidification (or zero below the lower bound); it does not trade safety for energy savings. This fallback cannot guarantee recovery. Real installations require independent safety interlocks, validated bounds and operator escalation.</p><p>Energy proxy is <code>Σu²</code>, in arbitrary units—not kWh or a savings claim. Risk minutes count interval-end RH above the illustrative 85% upper bound; neither 72% nor 85% is a crop recommendation.</p></div></details><details class="lab-method"><summary>Scenario data <span>Accessible trajectory table</span></summary><div class="lab-table-scroll"><table class="lab-data-table"><caption>Computed interval-end RH and commanded capacity</caption><thead><tr><th scope="col">Minute</th><th scope="col">Reactive RH</th><th scope="col">MPC RH</th><th scope="col">Reactive command</th><th scope="col">MPC command</th><th scope="col">MPC plan</th></tr></thead><tbody data-table></tbody></table></div></details>`;
  const input = root.querySelector("[data-load]");
  function render() {
    const shown = rows.slice(0, visible + 1);
    const last = shown.at(-1);
    root.querySelector("[data-load-value]").value =
      `${Number(input.value).toFixed(1)} units`;
    root.querySelector("[data-chart]").innerHTML = planningChart(shown);
    const peak = (key) => Math.max(...shown.map((row) => row[key])).toFixed(1);
    const risk = (key) =>
      shown.slice(1).filter((row) => row[key] > 85).length * 5;
    const energy = (key) =>
      shown
        .slice(1)
        .reduce((sum, row) => sum + row[key] ** 2, 0)
        .toFixed(1);
    root.querySelector("[data-comparison]").innerHTML =
      `<div class="lab-comparison-head"><span>Through ${last.minute} minutes</span><strong>Reactive</strong><strong>MPC</strong></div><div><span>Peak RH</span><strong>${peak("reactive")}%</strong><strong>${peak("predictive")}%</strong></div><div><span>Above 85% RH</span><strong>${risk("reactive")} min</strong><strong>${risk("predictive")} min</strong></div><div><span>Energy proxy</span><strong>${energy("reactiveAction")}</strong><strong>${energy("predictiveAction")}</strong></div>`;
    const infeasible = shown.slice(1).filter((row) => !row.feasible).length;
    root.querySelector("[data-summary]").textContent = infeasible
      ? `At this load, MPC found no feasible plan at ${infeasible} of ${visible} decisions. Capacity and forecast constraints matter: an optimizer cannot create missing equipment capacity. Review the load and independent safety response.`
      : `Through minute ${last.minute}, the predictive controller has recalculated ${visible} times. It uses the coming moisture load, rather than waiting only for a threshold crossing. This scenario is a comparison of behavior—not a guarantee that MPC uses less energy.`;
    root.querySelector("[data-plan]").textContent = last.feasible
      ? `Latest MPC plan: ${last.sequence.map(pct).join(" → ")} capacity. Only the first command was applied; later commands are recalculated at the next step.`
      : "Latest decision: no feasible five-step plan. Maximum-removal fallback requested; safety review required.";
    root.querySelector("[data-step]").textContent =
      visible === PLANNING_STEPS ? "Step through" : "Next 5 minutes";
    root.querySelector("[data-table]").innerHTML = shown
      .map(
        (row) =>
          `<tr><th scope="row">${row.minute}</th><td>${row.reactive.toFixed(1)}%</td><td>${row.predictive.toFixed(1)}%</td><td>${pct(row.reactiveAction)}</td><td>${pct(row.predictiveAction)}</td><td>${row.minute === 0 ? "Initial state" : row.feasible ? "Feasible" : "Infeasible"}</td></tr>`,
      )
      .join("");
  }
  function calculate() {
    rows = simulate(Number(input.value));
    visible = PLANNING_STEPS;
    render();
  }
  input.addEventListener("input", calculate, { signal });
  root
    .querySelector("[data-run]")
    .addEventListener("click", calculate, { signal });
  root.querySelector("[data-step]").addEventListener(
    "click",
    () => {
      visible = visible === PLANNING_STEPS ? 1 : visible + 1;
      render();
    },
    { signal },
  );
  root.querySelector("[data-reset]").addEventListener(
    "click",
    () => {
      input.value = "3.5";
      calculate();
    },
    { signal },
  );
  calculate();
}

function bayes(container, signal) {
  const root = shell(
    container,
    "03",
    "A reading is not a certainty.",
    "A sensor reports 92% RH. Is the room really humid, or is that sensor drifting? Make your assumptions visible, then add evidence.",
  );
  const observations = {
    agrees: {
      real: 0.85,
      drift: 0.15,
      label: "Nearby sensor agrees",
      note: "The nearby independent sensor also reports high humidity.",
    },
    disagrees: {
      real: 0.15,
      drift: 0.85,
      label: "Nearby sensor disagrees",
      note: "The nearby independent sensor reports normal humidity.",
    },
    neutral: {
      real: 0.5,
      drift: 0.5,
      label: "No useful evidence",
      note: "The observation is equally likely under either hypothesis.",
    },
  };
  let selected = "agrees";
  root.querySelector(".lab-body").innerHTML =
    `<div class="lab-workspace"><div class="lab-controls"><span class="lab-eyebrow">YOUR BELIEF</span><label class="lab-slider-label">Prior: real humidity event <output data-prior-value>40%</output><input data-prior type="range" min="5" max="95" step="1" value="40" aria-label="Prior probability of a real humidity event, percent"></label><div class="lab-range-ends"><span>Drift more likely</span><span>Event more likely</span></div><fieldset class="lab-choices"><legend>Choose one fresh observation</legend><button type="button" data-evidence="agrees" aria-pressed="true"><strong>Nearby sensor agrees</strong><span>Another high RH reading</span></button><button type="button" data-evidence="disagrees" aria-pressed="false"><strong>Nearby sensor disagrees</strong><span>Other reading is normal</span></button><button type="button" data-evidence="neutral" aria-pressed="false"><strong>Neutral evidence</strong><span>No reason to favor either</span></button></fieldset><button type="button" class="lab-reset" data-reset>Reset experiment <span aria-hidden="true">↺</span></button></div><div class="lab-results"><div class="lab-legend"><span><i class="lab-key lab-key-predictive"></i>Real humidity event</span><span><i class="lab-key lab-key-drift"></i>Sensor drift</span></div><div class="lab-plot" data-chart></div><div class="lab-likelihoods" data-likelihoods></div><p class="lab-insight" data-summary aria-live="polite" aria-atomic="true"></p><p class="lab-control-note">Changing the evidence replaces the observation. Clicking it again does not count it twice.</p></div></div><details class="lab-method"><summary>Inside the model <span>Exact update, illustrative likelihoods</span></summary><div><p>This deliberately simplified model has two mutually exclusive, exhaustive hypotheses: a real room-level humidity event (H) or sensor drift (D). Real facilities also have local wetting, uneven mixing, equipment faults and combinations of causes.</p><p><code>P(H | E) = P(E | H)P(H) / [P(E | H)P(H) + P(E | D)(1 − P(H))]</code></p><p>Agreement has likelihoods 0.85 under an event and 0.15 under drift. Disagreement reverses them. Neutral evidence uses 0.50 for both, so the prior is unchanged. These likelihoods are invented teaching inputs, not measured sensor performance.</p><p>The prior already includes the original 92% reading; the selected observation is new evidence from a separate sensor. This example assumes an independent sensor without shared drift and a sufficiently well-mixed room. Real likelihoods must account for correlation, local gradients and calibration. A posterior is not proof of cause, and no sensor is absolutely trusted.</p><p>The investigation suggestions use illustrative 30% and 70% posterior boundaries, not safety setpoints. Preserve independent alarms and crop-protection interlocks regardless of the posterior.</p></div></details>`;
  const input = root.querySelector("[data-prior]");
  function render() {
    const prior = Number(input.value) / 100;
    const evidence = observations[selected];
    const numerator = evidence.real * prior;
    const denominator = numerator + evidence.drift * (1 - prior);
    const posterior = numerator / denominator;
    root.querySelector("[data-prior-value]").value = pct(prior);
    root
      .querySelectorAll("[data-evidence]")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.evidence === selected),
        ),
      );
    const priorWidth = prior * 236;
    const posteriorWidth = posterior * 236;
    root.querySelector("[data-chart]").innerHTML =
      `<svg viewBox="0 0 660 253" role="img" aria-label="Prior probability of a real humidity event ${pct(prior)}. Evidence: ${evidence.label}. Posterior probability ${pct(posterior)}."><text class="lab-svg-label" x="32" y="37">01 / PRIOR</text><text class="lab-svg-label" x="390" y="37">03 / POSTERIOR</text><text class="lab-probability" x="32" y="88">${pct(prior)}</text><text class="lab-probability" x="390" y="88">${pct(posterior)}</text><text class="lab-svg-copy" x="32" y="115">probability of a real event</text><text class="lab-svg-copy" x="390" y="115">probability of a real event</text><rect class="lab-belief-drift" x="32" y="134" width="236" height="18" rx="4"/><rect class="lab-belief-event" x="32" y="134" width="${priorWidth}" height="18" rx="4"/><rect class="lab-belief-drift" x="390" y="134" width="236" height="18" rx="4"/><rect class="lab-belief-event" x="390" y="134" width="${posteriorWidth}" height="18" rx="4"/><path class="lab-flow" d="M288 142 H368 M360 135 l8 7 -8 7"/><text class="lab-svg-label" x="330" y="190" text-anchor="middle">02 / NEW EVIDENCE</text><text class="lab-svg-copy" x="330" y="218" text-anchor="middle">${evidence.label}</text></svg>`;
    root.querySelector("[data-likelihoods]").innerHTML =
      `<div><span>P(evidence | event)</span><strong>${evidence.real.toFixed(2)}</strong></div><div><span>P(evidence | drift)</span><strong>${evidence.drift.toFixed(2)}</strong></div><p><code>${numerator.toFixed(3)} ÷ (${numerator.toFixed(3)} + ${(evidence.drift * (1 - prior)).toFixed(3)}) = ${(posterior * 100).toFixed(1)}%</code><span>Displayed factors rounded; calculation uses full precision.</span></p>`;
    const advice =
      posterior >= 0.7
        ? "Prioritize checking a real moisture event: inspect dewpoint, airflow and dehumidifier operation, and use the facility’s approved protective response while verifying."
        : posterior <= 0.3
          ? "Prioritize checking the suspect sensor against a calibrated reference. Investigate local wetting or drift without dismissing a possible moisture event or disabling alarms."
          : "Both explanations remain plausible. Gather independent dewpoint, airflow and sensor-health evidence before making a disruptive control change.";
    root.querySelector("[data-summary]").textContent =
      `${evidence.note} The probability of a real event moves from ${pct(prior)} to ${(posterior * 100).toFixed(1)}%. ${advice}`;
  }
  input.addEventListener("input", render, { signal });
  root.querySelectorAll("[data-evidence]").forEach((button) =>
    button.addEventListener(
      "click",
      () => {
        selected = button.dataset.evidence;
        render();
      },
      { signal },
    ),
  );
  root.querySelector("[data-reset]").addEventListener(
    "click",
    () => {
      input.value = "40";
      selected = "agrees";
      render();
    },
    { signal },
  );
  render();
}

/** Mount one self-contained teaching lab. Call the returned function before unmounting. */
export function mountLab(container, id = "coupling") {
  const mounts = { coupling, planning, bayes };
  if (!mounts[id]) throw new RangeError(`Unknown learning lab: ${id}`);
  const controller = new AbortController();
  mounts[id](container, controller.signal);
  return () => controller.abort();
}
