import { cities, regions } from "./regions.js";
import { escapeHtml, moduleUrl, lessonUrl } from "../../js/ui.js";
import {
  formatTemperature,
  temperatureMarkup,
  applyTemperatureDisplay,
} from "../../js/preferences.js";

let cachedData;
export async function loadAtlas() {
  if (!cachedData) {
    const response = await fetch(
      new URL("./data/climates.json", import.meta.url),
    );
    if (!response.ok)
      throw new Error(
        `Climate evidence could not be loaded (HTTP ${response.status}).`,
      );
    const data = await response.json();
    if (
      data.schemaVersion !== 1 ||
      !Array.isArray(data.cities) ||
      cities.some(
        (city) => !data.cities.some((record) => record.id === city.id),
      )
    ) {
      throw new Error(
        "Climate evidence has an unsupported or incomplete dataset.",
      );
    }
    cachedData = data;
  }
  return renderAtlas;
}

const number = (value, digits = 1) =>
  value === null || value === undefined
    ? "Missing"
    : value.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
const temperature = (value, options = {}) =>
  value === null ? "Missing" : temperatureMarkup(value, options);
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const evidenceUrl = (path) => new URL(`./data/${path}`, import.meta.url).href;
const option = (city) =>
  `<option value="${city.id}">${escapeHtml(city.name)} · ${escapeHtml(city.country)}</option>`;

function chart(first, second, firstCity, secondCity) {
  const values = [...first.months, ...second.months]
    .map((month) => month.temperatureC.mean)
    .filter((value) => value !== null);
  if (!values.length)
    return "<p>No valid monthly temperatures for a chart. Consult coverage below.</p>";
  const low = Math.floor(Math.min(...values) / 5) * 5;
  const high = Math.max(low + 5, Math.ceil(Math.max(...values) / 5) * 5);
  const x = (index) => 88 + index * 48;
  const y = (value) => 220 - ((value - low) / (high - low)) * 170;
  const grid = Array.from({ length: 5 }, (_, index) => {
    const value = low + ((high - low) * index) / 4;
    return `<line x1="78" y1="${y(value)}" x2="628" y2="${y(value)}" class="atlas-gridline"/><text x="72" y="${y(value) + 4}" text-anchor="end">${temperatureMarkup(value, { precision: 1, svg: true })}</text>`;
  }).join("");
  const series = (record, className, square) =>
    record.months
      .map((month, index) => {
        if (month.temperatureC.mean === null) return "";
        const cy = y(month.temperatureC.mean);
        return square
          ? `<rect class="${className}" x="${x(index) - 4}" y="${cy - 4}" width="8" height="8"/>`
          : `<circle class="${className}" cx="${x(index)}" cy="${cy}" r="4.5"/>`;
      })
      .join("");
  return `<figure class="atlas-chart"><figcaption><h3>Monthly mean air temperature</h3><p><span class="atlas-key atlas-key-first">Circle: ${escapeHtml(firstCity.name)}</span> <span class="atlas-key atlas-key-second">Square: ${escapeHtml(secondCity.name)}</span></p></figcaption><svg viewBox="0 0 660 262" role="img" aria-labelledby="atlas-chart-title atlas-chart-desc"><title id="atlas-chart-title">2024 monthly mean air temperature: ${escapeHtml(firstCity.name)} and ${escapeHtml(secondCity.name)}</title><desc id="atlas-chart-desc">Monthly markers share a temperature scale. The following table contains the same temperatures plus sampled extremes, humidity ratio and solar energy. These are UTC calendar months in one year, not climate normals.</desc>${grid}${series(first, "atlas-series-first", false)}${series(second, "atlas-series-second", true)}${monthNames.map((month, index) => `<text x="${x(index)}" y="245" text-anchor="middle">${month}</text>`).join("")}</svg></figure>`;
}

function summary(city, record) {
  const annual = record.annual;
  const region = regions.find((item) => item.id === city.region);
  return `<article class="atlas-city-summary"><p class="eyebrow">${escapeHtml(region.name)}</p><h3>${escapeHtml(city.name)}</h3><p>${escapeHtml(city.country)} · ${city.latitude}, ${city.longitude} WGS84<br>Local context: ${escapeHtml(city.timezone)}<br>API elevation: ${number(record.provenance.elevationM, 0)} m</p><dl class="atlas-stats"><div><dt>Mean air temperature</dt><dd>${temperature(annual.temperatureC.mean)}</dd></div><div><dt>Sampled hourly range</dt><dd>${temperature(annual.temperatureC.min)} to ${temperature(annual.temperatureC.max)}</dd></div><div><dt>Mean hourly humidity ratio</dt><dd>${number(annual.meanHumidityRatio === null ? null : annual.meanHumidityRatio * 1000, 2)} g/kg dry air</dd></div><div><dt>Mean daily solar energy</dt><dd>${number(annual.solarDailyMeanKwhM2, 2)} kWh/m²/day</dd></div></dl></article>`;
}

function monthlyTable(first, second, firstCity, secondCity) {
  const row = (month, city) =>
    `<tr><th scope="row">${monthNames[month.month - 1]} · ${escapeHtml(city.name)}</th><td>${temperature(month.temperatureC.mean)}</td><td>${temperature(month.temperatureC.min)} / ${temperature(month.temperatureC.max)}</td><td>${number(month.meanHumidityRatio === null ? null : month.meanHumidityRatio * 1000, 2)}</td><td>${number(month.solarDailyMeanKwhM2, 2)}</td><td>${month.coverage.humidityRatio.valid} / ${month.coverage.humidityRatio.expected}</td><td>${month.coverage.solarIntervals.valid} / ${month.coverage.solarIntervals.expected}</td></tr>`;
  return `<div class="atlas-table-scroll" tabindex="0" role="region" aria-label="Monthly weather comparison; scroll horizontally on narrow screens"><table class="atlas-table"><caption>2024 UTC monthly evidence. Humidity ratio is calculated for each valid hourly state before averaging. Solar daily means use all calendar days; missing intervals are not filled.</caption><thead><tr><th scope="col">Month · city</th><th scope="col">Mean temperature</th><th scope="col">Sampled min / max</th><th scope="col">Mean w<br>g/kg dry air</th><th scope="col">Solar<br>kWh/m²/day</th><th scope="col">Valid w<br>/ expected</th><th scope="col">Valid solar<br>/ expected</th></tr></thead><tbody>${first.months.map((month, index) => row(month, firstCity) + row(second.months[index], secondCity)).join("")}</tbody></table></div>`;
}

function workedHour(city, record, example) {
  const hour = record.examples[example];
  if (!hour)
    return `<article class="atlas-worked"><h3>${escapeHtml(city.name)}</h3><p>No complete coincident example hour is available.</p></article>`;
  const direction =
    hour.moistureDifference > 0
      ? "Outdoor air has less moisture per kg of dry air than the reference: replacing indoor air could remove moisture, if there is sufficient flow and other loads permit."
      : hour.moistureDifference < 0
        ? "Outdoor air has more moisture per kg of dry air than the reference: replacement air adds moisture at this state."
        : "Outdoor and reference humidity ratios are equal at the displayed precision; do not infer useful moisture-removal capacity.";
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: city.timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(hour.utc));
  return `<article class="atlas-worked"><h3>${escapeHtml(city.name)}</h3><p><time datetime="${hour.utc}">${hour.utc.replace("T", " ")}</time><br><small>${escapeHtml(local)} · ${escapeHtml(city.timezone)} (context only)</small></p><dl class="atlas-stats"><div><dt>Air temperature / RH</dt><dd>${temperature(hour.temperatureC)} / ${number(hour.rhPercent, 0)}%</dd></div><div><dt>Surface pressure</dt><dd>${number(hour.pressurePa, 0)} Pa</dd></div><div><dt>Preceding-hour solar mean</dt><dd>${number(hour.solarWm2, 0)} W/m²</dd></div><div><dt>Outdoor humidity ratio</dt><dd>${number(hour.humidityRatio * 1000, 2)} g/kg dry air</dd></div><div><dt>Reference humidity ratio</dt><dd>${number(hour.referenceHumidityRatio * 1000, 2)} g/kg dry air</dd></div><div><dt>w reference − w outdoor</dt><dd>${number(hour.moistureDifference * 1000, 2)} g/kg dry air</dd></div></dl><p>${direction}</p></article>`;
}

function questions(city) {
  const region = regions.find((item) => item.id === city.region);
  return `<article class="atlas-questions"><h3>${escapeHtml(city.name)} · ${escapeHtml(region.name)}</h3><p>${escapeHtml(region.context)}</p><dl><dt>Building question</dt><dd>${escapeHtml(region.building)}</dd><dt>Equipment question</dt><dd>${escapeHtml(region.equipment)}</dd><dt>Control question</dt><dd>${escapeHtml(region.controls)}</dd></dl></article>`;
}

function provenance(city, record) {
  const source = record.provenance;
  const labels = {
    timestamps: "Hourly timestamps",
    temperature: "Temperature",
    relativeHumidity: "Relative humidity",
    pressure: "Surface pressure",
    humidityRatio: "Computed humidity ratio",
    solarIntervals: "Calendar solar intervals",
    completeMeteorology: "Coincident meteorology + preceding solar",
  };
  return `<article class="atlas-provenance"><h3>${escapeHtml(city.name)} · source & coverage</h3><p><a href="${escapeHtml(source.sourceUrl)}" target="_blank" rel="noreferrer">Exact Open-Meteo request</a> · <a href="${evidenceUrl(source.rawFile)}" download>Download untouched response (.json.gz)</a> · <a href="${evidenceUrl(`weather/${city.id}.provenance.json`)}">Provenance JSON</a></p><p>Retrieved <time datetime="${source.retrievedAt}">${escapeHtml(source.retrievedAt)}</time>. ${number(source.rawRows, 0)} raw records from ${escapeHtml(source.rawFirstUtc)} through ${escapeHtml(source.rawLastUtc)}; the extra day is retained to supply the final 2024 solar interval.</p><p>Requested point: ${city.latitude}, ${city.longitude}. Returned grid coordinate: ${source.returnedLatitude}, ${source.returnedLongitude}; API elevation ${number(source.elevationM, 0)} m. Default land-cell selection and elevation downscaling are enabled.</p><ul class="atlas-coverage">${Object.entries(
    record.annual.coverage,
  )
    .map(
      ([key, value]) =>
        `<li>${labels[key]}: <strong>${number(value.valid, 0)} valid / ${number(value.expected, 0)} expected</strong>; ${number(value.missing, 0)} missing</li>`,
    )
    .join(
      "",
    )}</ul><details><summary>Integrity hash and source size</summary><p>SHA-256 of exact uncompressed response bytes:</p><code>${source.sha256}</code><p>${number(source.rawBytes, 0)} raw bytes; ${number(source.gzipBytes, 0)} gzip bytes.</p></details></article>`;
}

export function renderAtlas(container, { module }) {
  if (!cachedData)
    throw new Error("Call loadAtlas before rendering the climate atlas.");
  const data = cachedData;
  const controller = new AbortController();
  const state = {
    region: "all",
    city: "phoenix",
    compare: "singapore",
    example: "hot",
  };
  container.innerHTML = `<div class="atlas-page page-enter"><div class="page-kicker"><a href="${moduleUrl(module.id)}">← MODULE ${escapeHtml(module.number)} / ${escapeHtml(module.shortTitle)}</a><span>CLIMATE ATLAS · EVIDENCE, NOT A RANKING</span></div><header class="page-header"><span class="eyebrow">14 LOCATIONS · 7 STUDY SETTINGS · ONE REAL YEAR</span><h1>Same crop questions.<br><em>Different outdoor air.</em></h1><p>Compare a real year of hourly ERA5 reanalysis, then ask what the building, equipment and controls must do. Broad settings are teaching lenses, not exact biome or Köppen classifications.</p></header><aside class="atlas-caution"><strong>2024 is an illustrative weather year, not a climate normal.</strong> These sampled temperatures are not design extremes or return-period estimates. No annual energy simulation, crop outcome or product winner is implied. Read <a href="${lessonUrl(module.id, "global-climates")}">Global climates</a> for the design reasoning.</aside><div class="atlas-controls"><label for="atlas-region">Study setting<select id="atlas-region"><option value="all">All 14 locations</option>${regions.map((region) => `<option value="${region.id}">${escapeHtml(region.name)}</option>`).join("")}</select></label><label for="atlas-city">Primary location<select id="atlas-city">${cities.map(option).join("")}</select></label><label for="atlas-compare">Compare with (all locations)<select id="atlas-compare">${cities.map(option).join("")}</select></label></div><p class="atlas-selection" aria-live="polite" id="atlas-selection"></p><section aria-labelledby="atlas-overview-heading"><h2 id="atlas-overview-heading">Annual context, monthly evidence</h2><p>Both locations use the same model, variables and UTC calendar: 1 January 2024 00:00 inclusive to 1 January 2025 00:00 exclusive (366 days). Outdoor temperature is not a building load. Humidity ratio is mass of water per mass of dry air; the table’s solar energy is incident on a horizontal plane, not transmitted light or crop PAR.</p><div id="atlas-comparison"></div></section><section aria-labelledby="atlas-hour-heading"><h2 id="atlas-hour-heading">A real coincident hour</h2><p>Each example is a complete recorded meteorological state, never a mix of independent extremes. Solar is the mean over the preceding hour, not instantaneous irradiance. Ties use the first recorded hour.</p><label class="atlas-hour-select" for="atlas-example">Choose the example independently in each city<select id="atlas-example"><option value="hot">Highest temperature among complete hours</option><option value="cold">Lowest temperature among complete hours</option><option value="moist">Highest humidity ratio among complete hours</option></select></label><p>Fixed illustrative reference: ${temperatureMarkup(24)}, 70% RH, at each example’s surface pressure. This is not a recommended crop setpoint. Outdoor and reference moisture use the same liquid-water RH convention described below. Their difference is a moisture-removal direction, <strong>not ventilation capacity or proof that an indoor target is attainable</strong>. There is no assumed airflow, crop transpiration, infiltration, solar transmission or HVAC capacity.</p><div class="atlas-pair" id="atlas-hours"></div></section><section aria-labelledby="atlas-reasoning-heading"><h2 id="atlas-reasoning-heading">Turn a climate pattern into design questions</h2><p>These prompts apply the course’s sensible and latent balance reasoning; they are not site recommendations inferred from annual averages. Check local light, water, energy, pollutants, rain, biosecurity and crop requirements before choosing a system.</p><div class="atlas-pair" id="atlas-questions"></div><p>Continue with the <a href="https://vhark.github.io/cea-psychrometric-site-evaluator/app/lab/" target="_blank" rel="noreferrer">external air-state laboratory</a> for deeper psychrometric experimentation. Its separate site-evaluation scenarios are not validated global equipment selections, and this atlas does not claim to have run them.</p></section><section aria-labelledby="atlas-sources-heading"><h2 id="atlas-sources-heading">Trace the evidence</h2><p><strong>ERA5 reanalysis supplied by Open-Meteo, CC BY 4.0.</strong> Credit: Hersbach et al., <a href="https://doi.org/10.24381/cds.adbb2d47" target="_blank" rel="noreferrer">ERA5 hourly data on single levels</a>; Zippenfenig, <a href="https://doi.org/10.5281/zenodo.7970649" target="_blank" rel="noreferrer">Open-Meteo Weather API</a>. <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">License</a> · <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">API definitions & attribution</a>.</p><p>This is gridded, model-assisted reanalysis, <strong>not station observations</strong>. Nominal ERA5 resolution is 0.25 degrees (approximately 25 km). A returned grid coordinate can differ from the requested city point; API elevation and statistical downscaling cannot resolve every greenhouse elevation, urban effect, coastal gradient or terrain exposure. Near-equatorial, high-altitude and opposite-hemisphere locations need context beyond calendar-month labels.</p><p>Temperature and RH at 2 m and surface pressure are instantaneous hourly values. Source units are Celsius, percent, hPa and W/m². We retain Open-Meteo’s <a href="${escapeHtml(data.methods.humidityConventionSource)}" target="_blank" rel="noreferrer">liquid-water RH convention</a>, including below freezing: vapor pressure is estimated with the water Magnus relation, then <a href="https://github.com/psychrometrics/psychrolib" target="_blank" rel="noreferrer">PsychroLib</a> converts vapor pressure and total pressure in Pa to humidity ratio in kg/kg <em>before</em> averaging. Display uses g/kg. This is an approximation—especially in extreme cold—and source RH is rounded. Do not reinterpret weather RH as ice-referenced RH; the standalone laboratory explicitly declares its separate water/ice convention.</p><p>Shortwave is a preceding-hour mean: radiation × interval duration is integrated over exact UTC calendar boundaries, including the final interval ending 1 January 2025 00:00. Missing source values are counted, never replaced; a missing solar interval makes the corresponding daily mean unavailable.</p><p>Inspect the <a href="${evidenceUrl("climates.json")}">compact dataset and recorded equations (schema version 1)</a>, <a href="${new URL("../../scripts/build-climate-weather.mjs", import.meta.url).href}">acquisition/recompute script</a>, and <a href="${new URL("./vendor/provenance.json", import.meta.url).href}">psychrometric library provenance</a>. Run <code>node scripts/build-climate-weather.mjs</code> to recompute from the checked-in cache; <code>--refresh</code> explicitly refetches. Hashes identify the exact archived responses, since the upstream service can revise reanalysis.</p><div class="atlas-pair" id="atlas-provenance"></div></section></div>`;
  const regionSelect = container.querySelector("#atlas-region");
  const citySelect = container.querySelector("#atlas-city");
  const compareSelect = container.querySelector("#atlas-compare");
  const exampleSelect = container.querySelector("#atlas-example");
  citySelect.value = state.city;
  compareSelect.value = state.compare;
  function renderEvidence() {
    const city = cities.find((item) => item.id === state.city);
    const compareCity = cities.find((item) => item.id === state.compare);
    const first = data.cities.find((item) => item.id === state.city);
    const second = data.cities.find((item) => item.id === state.compare);
    container.querySelector("#atlas-selection").textContent =
      `${city.name} compared with ${compareCity.name}. 2024 hourly mean temperatures: ${first.annual.temperatureC.mean === null ? "missing" : formatTemperature(first.annual.temperatureC.mean)} and ${second.annual.temperatureC.mean === null ? "missing" : formatTemperature(second.annual.temperatureC.mean)}. ${state.region === "all" ? "All 14 primary locations available." : "Primary locations filtered; comparison keeps all 14 available."}`;
    container.querySelector("#atlas-comparison").innerHTML =
      `<div class="atlas-pair">${summary(city, first)}${summary(compareCity, second)}</div>${chart(first, second, city, compareCity)}${monthlyTable(first, second, city, compareCity)}`;
    container.querySelector("#atlas-hours").innerHTML =
      workedHour(city, first, state.example) +
      workedHour(compareCity, second, state.example);
    container.querySelector("#atlas-questions").innerHTML =
      questions(city) + questions(compareCity);
    container.querySelector("#atlas-provenance").innerHTML =
      provenance(city, first) + provenance(compareCity, second);
    applyTemperatureDisplay(container);
  }
  regionSelect.addEventListener(
    "change",
    () => {
      state.region = regionSelect.value;
      const available = cities.filter(
        (city) => state.region === "all" || city.region === state.region,
      );
      if (!available.some((city) => city.id === state.city))
        state.city = available[0].id;
      citySelect.innerHTML = available.map(option).join("");
      citySelect.value = state.city;
      renderEvidence();
    },
    { signal: controller.signal },
  );
  citySelect.addEventListener(
    "change",
    () => {
      state.city = citySelect.value;
      renderEvidence();
    },
    { signal: controller.signal },
  );
  compareSelect.addEventListener(
    "change",
    () => {
      state.compare = compareSelect.value;
      renderEvidence();
    },
    { signal: controller.signal },
  );
  exampleSelect.addEventListener(
    "change",
    () => {
      state.example = exampleSelect.value;
      renderEvidence();
    },
    { signal: controller.signal },
  );
  document.addEventListener("academy:unitschange", renderEvidence, {
    signal: controller.signal,
  });
  renderEvidence();
  return () => controller.abort();
}
