import {
  applyTemperatureDisplay,
  formatTemperature,
  temperatureMarkup,
} from "../../js/preferences.js";
import {
  airState,
  ventilationComparison,
  evaporationOutcome,
  envelopeHeatTransfer,
} from "./physics.js";

let instance = 0;
const number = (value, precision = 1) => value.toFixed(precision);
const signed = (value, precision = 1) =>
  `${value > 0 ? "+" : ""}${number(value, precision)}`;
const metric = (label, value, detail) =>
  `<div class="climate-lab-metric"><dt>${label}</dt><dd>${value}<small>${detail}</small></dd></div>`;
const temperature = (key, label, value, min = -20, max = 50) => ({
  key,
  label,
  value,
  min,
  max,
  step: 0.5,
  temperature: true,
});
const range = (key, label, value, min, max, step, unit) => ({
  key,
  label,
  value,
  min,
  max,
  step,
  unit,
});
const pressure = () =>
  range("pressure", "Site air pressure", 101325, 60000, 110000, 25, "Pa");
const percent = (key, label, value) => range(key, label, value, 5, 100, 1, "%");
const sources = `<p class="climate-lab-source">Method source: <a href="https://github.com/psychrometrics/psychrolib" target="_blank" rel="noreferrer">PsychroLib 2.5.0 / ASHRAE equations</a>. <a href="${new URL("./vendor/provenance.json", import.meta.url).href}">Local vendor provenance</a>. These are transparent teaching balances, not calibrated facility predictions. For deeper exploration, use the <a href="https://vhark.github.io/cea-psychrometric-site-evaluator/app/lab/" target="_blank" rel="noreferrer">external air-state lab</a>.</p>`;

function shell(
  container,
  signal,
  { title, intro, controls, presets = [], methods, content },
) {
  const id = `climate-lab-${++instance}`;
  const root = document.createElement("section");
  root.className = "climate-lab";
  root.setAttribute("aria-labelledby", `${id}-heading`);
  const displayControl = (control, value) =>
    control.temperature
      ? formatTemperature(value)
      : `${number(value, control.step < 1 ? 2 : 0)} ${control.unit}`;
  root.innerHTML = `<header class="climate-lab-header"><span class="climate-lab-eyebrow">INTERACTIVE FIELD LAB</span><h2 id="${id}-heading">${title}</h2><p>${intro}</p></header>
    <div class="climate-lab-workspace"><div class="climate-lab-controls"><h3>Your assumptions</h3>
    ${controls.map((control) => `<div class="climate-lab-control"><label for="${id}-${control.key}">${control.label}</label><output for="${id}-${control.key}" data-output="${control.key}">${displayControl(control, control.value)}</output><input id="${id}-${control.key}" data-control="${control.key}" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${control.value}"><div class="climate-lab-range-ends"><span data-min="${control.key}">${displayControl(control, control.min)}</span><span data-max="${control.key}">${displayControl(control, control.max)}</span></div></div>`).join("")}
    ${presets.length ? `<div class="climate-lab-presets" role="group" aria-label="Load illustrative assumptions">${presets.map((preset, index) => `<button type="button" data-preset="${index}">${preset.label}</button>`).join("")}</div>` : ""}
    <button type="button" class="climate-lab-reset" data-reset>Reset all assumptions</button><p class="climate-lab-hint">Temperature units change the display only. Every slider keeps its physical value.</p></div>
    <div class="climate-lab-results">${content}<p class="climate-lab-summary" data-summary role="status" aria-live="polite" aria-atomic="true"></p></div></div>
    <section class="climate-lab-methods" aria-labelledby="${id}-methods"><h3 id="${id}-methods">Methods & limits — read the balance</h3>${methods}${sources}</section>`;
  container.replaceChildren(root);
  const inputs = Object.fromEntries(
    controls.map((control) => [
      control.key,
      root.querySelector(`[data-control="${control.key}"]`),
    ]),
  );
  const values = () =>
    Object.fromEntries(
      controls.map((control) => [
        control.key,
        Number(inputs[control.key].value),
      ]),
    );
  let draw;
  function render() {
    controls.forEach((control) => {
      const input = inputs[control.key];
      const text = displayControl(control, Number(input.value));
      root.querySelector(`[data-output="${control.key}"]`).value = text;
      input.setAttribute("aria-valuetext", text);
      root.querySelector(`[data-min="${control.key}"]`).textContent =
        displayControl(control, control.min);
      root.querySelector(`[data-max="${control.key}"]`).textContent =
        displayControl(control, control.max);
    });
    draw(values());
    applyTemperatureDisplay(root);
  }
  function setValues(next) {
    for (const [key, value] of Object.entries(next))
      inputs[key].value = String(value);
    render();
  }
  root.addEventListener(
    "input",
    (event) => {
      if (event.target.matches("[data-control]")) render();
    },
    { signal },
  );
  root
    .querySelector("[data-reset]")
    .addEventListener(
      "click",
      () =>
        setValues(
          Object.fromEntries(
            controls.map((control) => [control.key, control.value]),
          ),
        ),
      { signal },
    );
  root
    .querySelectorAll("[data-preset]")
    .forEach((button) =>
      button.addEventListener(
        "click",
        () => setValues(presets[Number(button.dataset.preset)].values),
        { signal },
      ),
    );
  document.addEventListener("academy:unitschange", render, { signal });
  return {
    root,
    values,
    setValues,
    start(renderer) {
      draw = renderer;
      render();
    },
  };
}

function psychrometricChart(
  state,
  maxW = Math.max(40, Math.ceil((state.humidityRatio * 1000) / 10) * 10),
) {
  const x = (tempC) => 62 + ((tempC + 20) / 70) * 480;
  const y = (w) => 292 - ((w * 1000) / maxW) * 248;
  const curve = (rh) => {
    const points = [];
    for (let t = -20; t <= 50; t += 0.5) {
      const w = airState(t, rh, state.pressurePa).humidityRatio;
      if (w * 1000 <= maxW)
        points.push(`${x(t).toFixed(1)},${y(w).toFixed(1)}`);
    }
    return points.join(" ");
  };
  return `<svg viewBox="0 0 580 360" role="img" aria-label="Psychrometric chart at ${number(state.pressurePa / 1000)} kilopascals. Horizontal axis dry-bulb temperature; vertical axis water grams per kilogram dry air. Selected point ${formatTemperature(state.tempC)}, ${number(state.rh * 100)} percent RH, ${number(state.humidityRatio * 1000, 2)} grams per kilogram. Use the labelled sliders for keyboard control." data-max-w="${maxW}">
    <rect x="62" y="44" width="480" height="248" class="climate-lab-chart-bg"/>
    ${[0, 1, 2, 3, 4].map((i) => `<path d="M62 ${292 - i * 62} H542" class="climate-lab-grid"/><text x="53" y="${297 - i * 62}" text-anchor="end">${number((maxW * i) / 4, 0)}</text>`).join("")}
    ${[-20, -10, 0, 10, 20, 30, 40, 50].map((t) => `<path d="M${x(t)} 44 V292" class="climate-lab-grid"/><text x="${x(t)}" y="315" text-anchor="middle">${formatTemperature(t, { precision: 0 })}</text>`).join("")}
    <polyline points="${curve(0.5)}" class="climate-lab-rh-line"/><polyline points="${curve(1)}" class="climate-lab-saturation"/>
    <path d="M${x(state.tempC)} 292 V${y(state.humidityRatio)} H62" class="climate-lab-guide"/>
    <circle cx="${x(state.tempC)}" cy="${y(state.humidityRatio)}" r="7" class="climate-lab-point"/>
    <text x="62" y="22">Water content w · g/kg dry air</text><text x="302" y="345" text-anchor="middle">Dry-bulb temperature</text>
  </svg>`;
}

function airStateLab(container, signal) {
  const lab = shell(container, signal, {
    title: "Same RH. Different water.",
    intro:
      "Separate temperature, relative humidity and water content. Move the point with the sliders, or tap and drag on the chart. Pressure changes the mass ratio, not the meaning of temperature.",
    controls: [
      temperature("temp", "Dry-bulb air temperature", 25),
      percent("rh", "Relative humidity", 80),
      pressure(),
    ],
    presets: [
      { label: "Cold / high RH", values: { temp: 5, rh: 90 } },
      { label: "Warm / lower RH", values: { temp: 30, rh: 60 } },
      { label: "Highland pressure", values: { pressure: 75000 } },
    ],
    content: `<div class="climate-lab-chart" data-chart></div><p class="climate-lab-legend"><span class="climate-lab-key-saturation">Solid: saturation, 100% RH</span><span class="climate-lab-key-rh">Dashed: 50% RH</span><span>Dot: your air state</span></p><dl class="climate-lab-metrics" data-metrics></dl>`,
    methods: `<p><strong>Three measured inputs, one state.</strong> Vapor pressure p<sub>v</sub> = RH × p<sub>ws</sub>(T). Humidity ratio w = 0.621945 p<sub>v</sub> / (P − p<sub>v</sub>). Enthalpy h = 1006T + w(2501000 + 1860T), with T in Celsius, P in Pa, w in kg/kg dry air and h in J/kg dry air. The library solves dew/frost point and thermodynamic wet bulb; the chart uses the same equations.</p><p><strong>Pressure experiment:</strong> hold T and RH fixed, then reduce pressure. Vapor pressure and dew point stay the same; water per kg of dry air rises because there is less dry air per volume. Wet bulb can also shift. This is not a claim that altitude alone changes crop water demand.</p><p><strong>Cold air needs care.</strong> Below ${temperatureMarkup(0.01, { precision: 2 })}, PsychroLib uses saturation over ice; its subfreezing condensation temperature is a frost point. Weather products may report RH relative to liquid water instead. Here the labelled RH follows this library convention. Dew/frost point is a surface condensation warning, not proof that a leaf is at that temperature.</p><p><strong>Air VPD is not leaf VPD.</strong> Air VPD = p<sub>ws</sub>(T<sub>air</sub>) − p<sub>v</sub>. A warmer or cooler leaf changes leaf-to-air vapor-pressure difference. Radiation, airflow, stomata and crop stage still matter. No universal crop-safe band is asserted. The lab excludes zero RH and extreme pressures rather than extrapolating.</p>`,
  });
  // Keep rendering and hit-testing on one scale throughout a pointer gesture.
  let gestureMaxW;
  lab.start((v) => {
    const state = airState(v.temp, v.rh / 100, v.pressure);
    lab.root.querySelector("[data-chart]").innerHTML = psychrometricChart(
      state,
      gestureMaxW,
    );
    lab.root.querySelector("[data-metrics]").innerHTML =
      metric(
        "Water content",
        `${number(state.humidityRatio * 1000, 2)} g/kg`,
        "per kg dry air, not RH",
      ) +
      metric(
        state.dewPointC < 0.01 ? "Frost point" : "Dew point",
        temperatureMarkup(state.dewPointC),
        "surface condensation threshold",
      ) +
      metric(
        "Wet bulb",
        temperatureMarkup(state.wetBulbC),
        "thermodynamic evaporation reference",
      ) +
      metric(
        "Enthalpy",
        `${number(state.enthalpy / 1000)} kJ/kg`,
        "per kg dry air; reference-dependent",
      ) +
      metric(
        "Air VPD",
        `${number(state.airVpdPa / 1000, 2)} kPa`,
        "not leaf-to-air VPD",
      ) +
      metric(
        "Vapor pressure",
        `${number(state.vaporPressurePa / 1000, 2)} kPa`,
        `site pressure ${number(v.pressure / 1000, 2)} kPa`,
      );
    lab.root.querySelector("[data-summary]").textContent =
      `${formatTemperature(v.temp)} air at ${v.rh}% RH contains ${number(state.humidityRatio * 1000, 2)} g water/kg dry air. Compare the cold/high-RH and warm/lower-RH examples: a larger RH percentage does not necessarily mean more water. The condensation threshold is ${formatTemperature(state.dewPointC)}; actual leaf and envelope surface temperatures are not modeled.`;
  });
  let dragging = false;
  function movePoint(event) {
    const svg = lab.root.querySelector("[data-chart] svg");
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      svg.getScreenCTM().inverse(),
    );
    const temp = Math.min(
      50,
      Math.max(-20, Math.round(((point.x - 62) / 480) * 140 - 40) / 2),
    );
    const water = Math.max(
      0,
      (((292 - point.y) / 248) * Number(svg.dataset.maxW)) / 1000,
    );
    const v = lab.values();
    const vapor = (v.pressure * water) / (0.621945 + water);
    const saturated = airState(temp, 1, v.pressure).vaporPressurePa;
    const rh = Math.min(
      100,
      Math.max(5, Math.round((vapor / saturated) * 100)),
    );
    lab.setValues({ temp, rh });
  }
  lab.root.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.target.closest("[data-chart] svg")) return;
      dragging = true;
      gestureMaxW = Number(
        lab.root.querySelector("[data-chart] svg").dataset.maxW,
      );
      lab.root.setPointerCapture(event.pointerId);
      movePoint(event);
    },
    { signal },
  );
  lab.root.addEventListener(
    "pointermove",
    (event) => {
      if (dragging) movePoint(event);
    },
    { signal },
  );
  lab.root.addEventListener(
    "pointerup",
    () => {
      dragging = false;
      gestureMaxW = undefined;
    },
    { signal },
  );
  lab.root.addEventListener(
    "pointercancel",
    () => {
      dragging = false;
      gestureMaxW = undefined;
    },
    { signal },
  );
}

function outdoorAirLab(container, signal) {
  const lab = shell(container, signal, {
    title: "Free drying has a heat bill.",
    intro:
      "Compare balanced outdoor-air exchange with a separate direct-evaporative pad. Both can change temperature, but one replaces moist air and the other adds water. All stream rates are normalized to 1 kg of dry air per second.",
    controls: [
      temperature("insideTemp", "Inside temperature", 25, 10, 40),
      percent("insideRh", "Inside relative humidity", 70),
      temperature("outsideTemp", "Outside temperature", 10),
      percent("outsideRh", "Outside relative humidity", 90),
      pressure(),
      range("effect", "Pad effectiveness", 80, 0, 90, 1, "%"),
    ],
    presets: [
      {
        label: "Cool / humid outside",
        values: { outsideTemp: 10, outsideRh: 90 },
      },
      {
        label: "Hot / dry outside",
        values: { outsideTemp: 38, outsideRh: 20 },
      },
      {
        label: "Hot / humid outside",
        values: { outsideTemp: 32, outsideRh: 80 },
      },
      { label: "Winter air", values: { outsideTemp: -10, outsideRh: 85 } },
    ],
    content: `<div class="climate-lab-table-wrap"><table><caption>Two air states at the same site pressure</caption><thead><tr><th scope="col">State</th><th scope="col">Temperature</th><th scope="col">RH</th><th scope="col">Water g/kg dry air</th></tr></thead><tbody data-states></tbody></table></div><h3>1. Direct outdoor-air exchange</h3><dl class="climate-lab-metrics" data-vent-metrics></dl><h3>2. A separate pad on outdoor air</h3><div data-pad></div>`,
    methods: `<p><strong>Balanced dry-air exchange:</strong> moisture removed per kg dry air = w<sub>inside</sub> − w<sub>outside</sub>. Positive means a drying opportunity; negative means moisture is imported. At 1 kg dry air/s, the same numerical kg/kg difference becomes kg water/s. Heating/cooling the outdoor stream at its unchanged w gives Q<sub>s</sub> = h(T<sub>inside</sub>, w<sub>outside</sub>) − h<sub>outside</sub>. Positive means heating, negative means sensible cooling. Net enthalpy conditioning is h<sub>inside</sub> − h<sub>outside</sub>; it includes moisture change and is not a separate load to add to Q<sub>s</sub>.</p><p><strong>Direct evaporative pad:</strong> T<sub>candidate</sub> = T<sub>outside</sub> − ε(T<sub>outside</sub> − T<sub>wet bulb</sub>). This teaching model then holds h constant to find outlet w. Real evaporation is only <em>nearly</em> isoenthalpic: liquid-water enthalpy, fan/pump heat, carryover and pad condition are omitted. A supersaturated candidate stops at the constant-h saturation boundary. The selected ε is an assumption, not a product rating. Pad inlet must be at least ${temperatureMarkup(5)} and modeled outlet above freezing; winter pad operation is deliberately not recommended.</p><p><strong>Availability is not control.</strong> The room does not instantly become the supply state. Canopy transpiration, air distribution, leakage, fan curves, actual dry-air flow, CO₂ loss, outside pollutants and disease precautions are missing. A positive drying opportunity cannot guarantee canopy RH. Warming cold air lowers its RH without removing its water; a pad adds water even when it cools. Evaluate whether the pad-treated supply can still dry the room.</p>`,
  });
  lab.start((v) => {
    const vent = ventilationComparison(
      { tempC: v.insideTemp, rh: v.insideRh / 100 },
      { tempC: v.outsideTemp, rh: v.outsideRh / 100 },
      v.pressure,
    );
    lab.root.querySelector("[data-states]").innerHTML = [
      ["Inside", vent.inside],
      ["Outside", vent.outside],
    ]
      .map(
        ([label, state]) =>
          `<tr><th scope="row">${label}</th><td>${temperatureMarkup(state.tempC)}</td><td>${number(state.rh * 100)}%</td><td>${number(state.humidityRatio * 1000, 2)}</td></tr>`,
      )
      .join("");
    lab.root.querySelector("[data-vent-metrics]").innerHTML =
      metric(
        "Water removal opportunity",
        `${signed(vent.moistureRemovalKgPerKg * 1000, 2)} g/kg`,
        "positive dries; negative imports water",
      ) +
      metric(
        "At the normalized flow",
        `${signed(vent.moistureRemovalKgPerKg * 3600, 1)} kg/h`,
        "at exactly 1 kg dry air/s",
      ) +
      metric(
        "Sensible conditioning",
        `${signed(vent.sensibleConditioningW / 1000)} kW`,
        "positive heating; negative cooling",
      ) +
      metric(
        "Net enthalpy conditioning",
        `${signed(vent.enthalpyConditioningW / 1000)} kW`,
        "includes moisture; do not add to sensible",
      );
    const padArea = lab.root.querySelector("[data-pad]");
    let padSummary =
      "The liquid-water pad model is unavailable in these cold conditions.";
    let pad;
    if (v.outsideTemp >= 5) {
      // A cold, very dry inlet can still imply a subfreezing pad outlet.
      const candidate =
        v.outsideTemp -
        (v.effect / 100) * (v.outsideTemp - vent.outside.wetBulbC);
      if (candidate >= 0)
        pad = evaporationOutcome(
          v.outsideTemp,
          v.outsideRh / 100,
          v.pressure,
          v.effect / 100,
        );
    }
    if (pad) {
      const afterPadRemoval =
        vent.inside.humidityRatio - pad.outlet.humidityRatio;
      padArea.innerHTML = `<dl class="climate-lab-metrics">${metric("Pad outlet", temperatureMarkup(pad.outlet.tempC), `${number(pad.outlet.rh * 100)}% RH · ${number(pad.outlet.humidityRatio * 1000, 2)} g/kg`)}${metric("Pad temperature drop", temperatureMarkup(pad.coolingC, { difference: true }), `${v.effect}% declared effectiveness`)}${metric("Water evaporated into supply", `${number(pad.waterAddedKgPerKg * 1000, 2)} g/kg`, "water addition, not dehumidification")}${metric("Drying after pad treatment", `${signed(afterPadRemoval * 1000, 2)} g/kg`, "inside w minus pad-outlet w")}</dl><p class="climate-lab-hint">${pad.saturationLimited ? "The constant-enthalpy saturation limit constrained this outcome." : "Nearly isoenthalpic approximation; no delivered equipment capacity asserted."}</p>`;
      padSummary = `The separate pad cools by ${formatTemperature(pad.coolingC, { difference: true })} and adds ${number(pad.waterAddedKgPerKg * 1000, 2)} g water/kg dry air; treated supply ${afterPadRemoval > 0 ? "retains a drying opportunity" : "does not retain a positive drying opportunity"}.`;
    } else {
      padArea.innerHTML = `<p class="climate-lab-callout">Pad result withheld: the inlet is below ${temperatureMarkup(5)} or the estimated liquid-water outlet would freeze. The ventilation comparison above remains valid within the stated air-state domain.</p>`;
    }
    lab.root.querySelector("[data-summary]").textContent =
      `${vent.moistureRemovalKgPerKg > 0 ? "Outdoor air can remove water" : vent.moistureRemovalKgPerKg < 0 ? "Outdoor air imports water" : "Outdoor air has no net drying potential"} at these assumptions, regardless of which RH percentage is larger. Its temperature conditioning requires ${number(Math.abs(vent.sensibleConditioningW) / 1000)} kW of ${vent.sensibleConditioningW >= 0 ? "heating" : "sensible cooling"} at the normalized flow. ${padSummary}`;
  });
}

function envelopeLab(container, signal) {
  const lab = shell(container, signal, {
    title: "Insulate the night. Plan for the sun.",
    intro:
      "Keep the envelope and solar receiving areas separate. Explore signed heat flow and the light cost of shading before mistaking a gross energy balance for a complete HVAC rating.",
    controls: [
      temperature("insideTemp", "Inside temperature", 24, 10, 40),
      temperature("outsideTemp", "Outside temperature", 5),
      range("u", "Whole-envelope U value", 4, 0.2, 8, 0.1, "W/m²/K"),
      range("area", "Envelope heat-transfer area", 1200, 100, 3000, 25, "m²"),
      range(
        "solarArea",
        "Effective solar receiving area",
        500,
        50,
        1500,
        25,
        "m²",
      ),
      range("solar", "Incident shortwave irradiance", 600, 0, 1100, 10, "W/m²"),
      range("transmission", "Unshaded solar transmission", 70, 0, 100, 1, "%"),
      range("shading", "Solar blocked by added shade", 0, 0, 90, 1, "%"),
    ],
    presets: [
      {
        label: "Winter night",
        values: { outsideTemp: -10, solar: 0, shading: 0 },
      },
      {
        label: "Cool sunny day",
        values: { outsideTemp: 12, solar: 700, shading: 0 },
      },
      {
        label: "Summer afternoon",
        values: { outsideTemp: 35, solar: 850, shading: 40 },
      },
      { label: "Lower U assumption", values: { u: 1 } },
    ],
    content: `<dl class="climate-lab-metrics" data-metrics></dl><div data-balance></div><div class="climate-lab-light"><h3>Light trade-off</h3><p data-light></p><div class="climate-lab-light-track" aria-hidden="true"><span data-light-bar></span></div></div>`,
    methods: `<p><strong>Signed conduction:</strong> Q<sub>envelope</sub> = U × A<sub>envelope</sub> × (T<sub>outside</sub> − T<sub>inside</sub>). U is W/m²/K, area m², temperature difference K and heat flow W. Positive enters the growing space; negative is heat loss. The U value is a declared assembly-average assumption, not a materials database. Thermal bridges, air leakage and changing film coefficients are omitted.</p><p><strong>Gross transmitted solar:</strong> Q<sub>solar</sub> = G × A<sub>solar</sub> × τ × (1 − shade). G is incident shortwave W/m² on the declared effective receiving area; τ is an assumed energy transmission fraction. Do not multiply horizontal irradiance by every roof and wall area as if they all see the same sun. Geometry, orientation, diffuse/direct split, longwave exchange and screen absorption are not resolved. A change to U does not automatically change τ: compare physically compatible constructions yourself.</p><p><strong>Not total sensible cooling, not HVAC sizing.</strong> The sum is gross conduction plus transmitted solar. Solar energy partitions among surfaces, storage, sensible heat and crop evaporation; this lab does not solve that partition. Do not add the crop’s transpiration latent energy again as an independent heat source on top of the same solar input. Moisture removal still requires a mass balance and an equipment process. Lighting electricity, people, pumps, infiltration, ventilation, condensation and heat recovery are absent.</p><p><strong>Shading removes useful photons too.</strong> The simple light proxy assumes the same transmission and shade fraction for crop-useful light as for total shortwave energy. Real spectral transmission differs: this is not PAR, PPFD, DLI or yield. Outside-integrated PAR and crop requirements are needed for a light budget. Lower U reduces winter heat loss but also reduces passive heat escape when inside is warmer than outside; solar overheating can coexist with cool weather. This steady snapshot has no thermal storage or hourly controls.</p>`,
  });
  lab.start((v) => {
    const result = envelopeHeatTransfer({
      insideTempC: v.insideTemp,
      outsideTempC: v.outsideTemp,
      uValue: v.u,
      envelopeAreaM2: v.area,
      solarWm2: v.solar,
      solarAreaM2: v.solarArea,
      transmission: v.transmission / 100,
      shading: v.shading / 100,
    });
    const tempDifference = v.outsideTemp - v.insideTemp;
    lab.root.querySelector("[data-metrics]").innerHTML =
      metric(
        "Envelope conduction",
        `${signed(result.conductionW / 1000)} kW`,
        "positive inward; negative outward",
      ) +
      metric(
        "Gross transmitted solar",
        `${number(result.solarW / 1000)} kW`,
        "not all immediate sensible air heat",
      ) +
      metric(
        "Gross combined input",
        `${signed(result.grossHeatInputW / 1000)} kW`,
        "conduction + solar; not HVAC rating",
      ) +
      metric(
        "Outside − inside",
        temperatureMarkup(tempDifference, { difference: true, signed: true }),
        `UA = ${number(v.u * v.area, 0)} W/K`,
      );
    lab.root.querySelector("[data-balance]").innerHTML =
      `<div class="climate-lab-table-wrap"><table><caption>Read the sign before choosing an action</caption><thead><tr><th scope="col">Path</th><th scope="col">Current direction</th><th scope="col">What the assumption can tell you</th></tr></thead><tbody><tr><th scope="row">Envelope</th><td>${result.conductionW > 0 ? "Heat enters" : result.conductionW < 0 ? "Heat leaves" : "No temperature-driven flow"}</td><td>Lower U reduces the magnitude of this path in either direction.</td></tr><tr><th scope="row">Solar</th><td>${result.solarW > 0 ? "Energy enters" : "No transmitted solar input"}</td><td>Shade reduces input, but reduces the simple useful-light proxy too.</td></tr></tbody></table></div>`;
    lab.root.querySelector("[data-light]").textContent =
      `${number(result.transmittedFraction * 100)}% of incident light remains in this shared-transmission proxy. The added shade removes ${v.shading}% of the otherwise transmitted light. This fraction is not a daily photon total or a crop recommendation.`;
    lab.root.querySelector("[data-light-bar]").style.width =
      `${result.transmittedFraction * 100}%`;
    lab.root.querySelector("[data-summary]").textContent =
      `${result.grossHeatInputW > 0 ? "The two modeled paths create a net energy input" : result.grossHeatInputW < 0 ? "The two modeled paths create a net energy loss" : "The two modeled paths balance"} of ${number(Math.abs(result.grossHeatInputW) / 1000)} kW. ${tempDifference < 0 && result.grossHeatInputW > 0 ? "Despite cooler outdoor air, transmitted sun exceeds envelope heat loss. Reducing U alone would retain more of that energy." : tempDifference < 0 ? "Lowering U reduces the outward heat loss; compare the winter-night assumption." : "Lowering U reduces inward conduction, but does not eliminate the solar input."} Keep this gross budget separate from the unmodeled moisture process and equipment sizing.`;
  });
}

/** Synchronous mount. Shared preferences only project canonical SI assumptions. */
export function mountLab(container, id = "air-state") {
  const mounts = {
    "air-state": airStateLab,
    "outdoor-air": outdoorAirLab,
    envelope: envelopeLab,
  };
  if (!mounts[id]) throw new RangeError(`Unknown climate learning lab: ${id}`);
  const controller = new AbortController();
  mounts[id](container, controller.signal);
  return () => controller.abort();
}
