// Run: node scripts/build-climate-weather.mjs [--refresh]
// Cached exact API response bytes are authoritative. --refresh explicitly replaces them.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gzipSync, gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { cities } from "../modules/climate-design/regions.js";
import psychrolib from "../modules/climate-design/vendor/psychrolib.js";

const refresh = process.argv.includes("--refresh");
if (process.argv.slice(2).some((arg) => arg !== "--refresh"))
  throw new Error("Usage: node scripts/build-climate-weather.mjs [--refresh]");
const base = new URL("../modules/climate-design/data/", import.meta.url);
const hour = 3600000;
const start = Date.UTC(2024, 0, 1);
const end = Date.UTC(2025, 0, 1);
const fields = {
  temperature_2m: "°C",
  relative_humidity_2m: "%",
  surface_pressure: "hPa",
  shortwave_radiation: "W/m²",
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const round = (value, digits = 6) =>
  value === null ? null : Number(value.toFixed(digits));
await mkdir(new URL("weather/", base), { recursive: true });

// Open-Meteo ERA5 RH uses liquid-water Magnus ratios even below freezing.
// Match beta/lambda in open-meteo fb7e8046633bafe1244e16abf1c1491bae48ecca,
// Sources/App/Helper/Meteorology.swift relativeHumidity(). Use the conventional
// 610.94 Pa Magnus normalization (Alduchov & Eskridge, 1996). This is an
// approximation, especially at extreme cold, not an ice-RH reinterpretation.
function weatherHumidityRatio(temperatureC, rhPercent, pressurePa) {
  const vaporPa =
    (610.94 *
      Math.exp((17.625 * temperatureC) / (243.04 + temperatureC)) *
      rhPercent) /
    100;
  if (!Number.isFinite(vaporPa) || vaporPa < 0 || vaporPa >= pressurePa)
    throw new RangeError("Nonphysical weather vapor pressure");
  return vaporPa === 0
    ? 0
    : psychrolib.GetHumRatioFromVapPres(vaporPa, pressurePa);
}

function sourceUrl(city) {
  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  // The extra UTC day supplies the 2025-01-01T00:00 preceding-hour solar
  // interval, needed to integrate the complete 2024 calendar without a shift.
  url.search = new URLSearchParams({
    latitude: city.latitude,
    longitude: city.longitude,
    start_date: "2024-01-01",
    end_date: "2025-01-01",
    hourly: Object.keys(fields).join(","),
    timezone: "UTC",
    models: "era5",
    temperature_unit: "celsius",
    timeformat: "iso8601",
    cell_selection: "land",
  });
  return url.href;
}

function parseResponse(bytes, city) {
  const raw = JSON.parse(bytes.toString("utf8"));
  if (raw.error) throw new Error(`${city.id}: API error: ${raw.reason}`);
  if (raw.utc_offset_seconds !== 0) throw new Error(`${city.id}: expected UTC`);
  for (const [key, unit] of Object.entries(fields)) {
    if (raw.hourly_units?.[key] !== unit)
      throw new Error(
        `${city.id}: unexpected ${key} unit ${raw.hourly_units?.[key]}`,
      );
    if (
      !Array.isArray(raw.hourly?.[key]) ||
      raw.hourly[key].length !== raw.hourly?.time?.length
    )
      throw new Error(`${city.id}: malformed ${key} array`);
  }
  if (raw.hourly_units.time !== "iso8601")
    throw new Error(`${city.id}: expected ISO timestamps`);
  let previous = -Infinity;
  const rows = raw.hourly.time.map((time, i) => {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:00$/.test(time))
      throw new Error(`${city.id}: malformed timestamp ${time}`);
    const ms = Date.parse(`${time}:00Z`);
    if (
      !Number.isFinite(ms) ||
      ms <= previous ||
      ms % hour !== 0 ||
      ms < start ||
      ms >= end + 24 * hour
    )
      throw new Error(
        `${city.id}: invalid/duplicate/out-of-order timestamp ${time}`,
      );
    previous = ms;
    const values = Object.keys(fields).map((key) => {
      const value = raw.hourly[key][i];
      if (
        value !== null &&
        (typeof value !== "number" || !Number.isFinite(value))
      )
        throw new Error(`${city.id}: non-finite ${key} at ${time}`);
      return value;
    });
    const [temperatureC, rhPercent, pressureHpa, solarWm2] = values;
    if (
      (rhPercent !== null && (rhPercent < 0 || rhPercent > 100)) ||
      (pressureHpa !== null && pressureHpa <= 0) ||
      (solarWm2 !== null && solarWm2 < 0)
    )
      throw new Error(`${city.id}: nonphysical source value at ${time}`);
    const pressurePa = pressureHpa === null ? null : pressureHpa * 100;
    const stateValid =
      temperatureC !== null && rhPercent !== null && pressurePa !== null;
    const humidityRatio = stateValid
      ? weatherHumidityRatio(temperatureC, rhPercent, pressurePa)
      : null;
    if (humidityRatio !== null && !Number.isFinite(humidityRatio))
      throw new Error(`${city.id}: invalid psychrometric result at ${time}`);
    return {
      ms,
      utc: `${time}:00Z`,
      temperatureC,
      rhPercent,
      pressurePa,
      solarWm2,
      humidityRatio,
    };
  });
  return { raw, rows };
}

function summarize(rows, from, to) {
  const expected = (to - from) / hour;
  const instant = rows.filter((row) => row.ms >= from && row.ms < to);
  const temperatures = instant
    .filter((row) => row.temperatureC !== null)
    .map((row) => row.temperatureC);
  const moisture = instant
    .filter((row) => row.humidityRatio !== null)
    .map((row) => row.humidityRatio);
  const solar = rows.filter(
    (row) => row.ms > from && row.ms <= to && row.solarWm2 !== null,
  );
  // Each source radiation value is a PRECEDING-hour mean, not an instant.
  // Intersect its actual documented interval with the calendar window.
  const solarEnergyKwhM2 = solar.reduce(
    (sum, row) =>
      sum +
      (row.solarWm2 * (Math.min(to, row.ms) - Math.max(from, row.ms - hour))) /
        3600000000,
    0,
  );
  const count = (valid) => ({ expected, valid, missing: expected - valid });
  const mean = (values) =>
    values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  return {
    days: (to - from) / (24 * hour),
    temperatureC: {
      mean: round(mean(temperatures), 3),
      min: temperatures.length ? Math.min(...temperatures) : null,
      max: temperatures.length ? Math.max(...temperatures) : null,
    },
    meanHumidityRatio: round(mean(moisture), 8),
    solarEnergyKwhM2: round(solarEnergyKwhM2, 3),
    solarDailyMeanKwhM2:
      solar.length === expected
        ? round(solarEnergyKwhM2 / ((to - from) / (24 * hour)), 3)
        : null,
    coverage: {
      timestamps: count(instant.length),
      temperature: count(temperatures.length),
      relativeHumidity: count(
        instant.filter((row) => row.rhPercent !== null).length,
      ),
      pressure: count(instant.filter((row) => row.pressurePa !== null).length),
      humidityRatio: count(moisture.length),
      solarIntervals: count(solar.length),
      completeMeteorology: count(
        instant.filter(
          (row) => row.humidityRatio !== null && row.solarWm2 !== null,
        ).length,
      ),
    },
  };
}

function examples(rows) {
  const complete = rows.filter(
    (row) =>
      row.ms >= start &&
      row.ms < end &&
      row.humidityRatio !== null &&
      row.solarWm2 !== null,
  );
  function select(key, direction) {
    const row = complete.reduce(
      (best, candidate) =>
        best === null || direction * candidate[key] > direction * best[key]
          ? candidate
          : best,
      null,
    );
    if (!row) return null;
    const { ms, ...state } = row;
    const referenceHumidityRatio = weatherHumidityRatio(24, 70, row.pressurePa);
    return {
      ...state,
      humidityRatio: round(row.humidityRatio, 8),
      referenceHumidityRatio: round(referenceHumidityRatio, 8),
      moistureDifference: round(referenceHumidityRatio - row.humidityRatio, 8),
    };
  }
  return {
    hot: select("temperatureC", 1),
    cold: select("temperatureC", -1),
    moist: select("humidityRatio", 1),
  };
}

const output = {
  schemaVersion: 1,
  year: 2024,
  calendar: "UTC",
  interval: {
    startInclusive: new Date(start).toISOString(),
    endExclusive: new Date(end).toISOString(),
    days: 366,
    expectedHourlyStates: 8784,
  },
  source: {
    provider: "Open-Meteo",
    model: "ERA5",
    kind: "Gridded reanalysis, not station observations",
    nominalResolution: "0.25 degrees (approximately 25 km)",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    docs: "https://open-meteo.com/en/docs/historical-weather-api",
    datasetDoi: "https://doi.org/10.24381/cds.adbb2d47",
    serviceDoi: "https://doi.org/10.5281/zenodo.7970649",
  },
  methods: {
    script: "scripts/build-climate-weather.mjs",
    vendor: "modules/climate-design/vendor/psychrolib.js",
    temperature:
      "Arithmetic mean/min/max of valid instantaneous hourly 2 m temperatures; min/max are sampled 2024 values, not design extremes.",
    humidityRatio:
      "Preserve Open-Meteo liquid-water-referenced RH at all temperatures. Approximate vapor pressure Pa = RH/100 * 610.94 * exp(17.625*T/(243.04+T)); PsychroLib SI GetHumRatioFromVapPres(vaporPa, surface_pressure_hPa*100) at each hourly state, then arithmetic mean. kg water/kg dry air; never calculated from mean T/RH. Magnus normalization is approximate, particularly at extreme cold; API RH is rounded. The fixed reference uses this same convention, not the standalone lab's ice branch.",
    humidityConventionSource:
      "https://github.com/open-meteo/open-meteo/blob/fb7e8046633bafe1244e16abf1c1491bae48ecca/Sources/App/Helper/Meteorology.swift",
    magnusReference:
      "https://doi.org/10.1175/1520-0450(1996)035%3C0601:IMFAOS%3E2.0.CO;2",
    solar:
      "Sum each preceding-hour mean shortwave W/m2 times its calendar-clipped interval hours / 1000. Divide by full UTC calendar days (366 annual). Include 2025-01-01T00:00 for last 2024 hour; exclude 2024-01-01T00:00. Null daily mean if any interval is missing; observed energy is not filled or scaled.",
    missing:
      "Null source values and absent timestamps are counted, never filled. Invalid units, duplicate/out-of-order timestamps, non-finite or nonphysical values fail generation.",
    reference: {
      temperatureC: 24,
      rhPercent: 70,
      pressure: "Each example hour's surface pressure",
      note: "w_reference - w_outdoor indicates moisture-removal direction per kg dry air only; not ventilation flow/capacity, indoor attainment, a crop target or an equipment recommendation.",
    },
    limits:
      "One illustrative year, not a climate normal, design return period, validated system simulation or equipment ranking. Monthly windows are UTC, not local calendar months.",
  },
  cities: [],
};
const failures = [];
for (const city of cities) {
  try {
    const rawPath = new URL(`weather/${city.id}.json.gz`, base);
    const provenancePath = new URL(`weather/${city.id}.provenance.json`, base);
    const url = sourceUrl(city);
    let bytes, provenance;
    let cached = false;
    if (!refresh) {
      try {
        bytes = gunzipSync(await readFile(rawPath));
        provenance = JSON.parse(await readFile(provenancePath, "utf8"));
        cached = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    if (!cached) {
      console.log(`Fetching ${city.id}: ${url}`);
      const response = await fetch(url, {
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok)
        throw new Error(
          `HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`,
        );
      bytes = Buffer.from(await response.arrayBuffer());
      parseResponse(bytes, city);
      const compressed = gzipSync(bytes, { level: 9 });
      provenance = {
        sourceUrl: url,
        retrievedAt: new Date().toISOString(),
        sha256: sha256(bytes),
        hashScope:
          "Exact uncompressed HTTP response body bytes, before JSON parsing",
        rawBytes: bytes.length,
        gzipBytes: compressed.length,
        rawFile: `weather/${city.id}.json.gz`,
        requestedStartDate: "2024-01-01",
        requestedEndDateInclusive: "2025-01-01",
        boundaryNote:
          "Extra day retained unchanged in raw response; only midnight on 2025-01-01 contributes the final 2024 preceding-hour solar interval.",
      };
      await writeFile(rawPath, compressed);
      await writeFile(
        provenancePath,
        `${JSON.stringify(provenance, null, 2)}\n`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    if (provenance.sourceUrl !== url || provenance.sha256 !== sha256(bytes))
      throw new Error(
        "Cached source URL/hash mismatch; inspect cache or explicitly --refresh",
      );
    const { raw, rows } = parseResponse(bytes, city);
    const annual = summarize(rows, start, end);
    output.cities.push({
      id: city.id,
      provenance: {
        ...provenance,
        returnedLatitude: raw.latitude,
        returnedLongitude: raw.longitude,
        elevationM: raw.elevation,
        rawRows: rows.length,
        rawFirstUtc: rows[0]?.utc,
        rawLastUtc: rows.at(-1)?.utc,
      },
      annual,
      months: Array.from({ length: 12 }, (_, month) => ({
        month: month + 1,
        ...summarize(
          rows,
          Date.UTC(2024, month, 1),
          Date.UTC(2024, month + 1, 1),
        ),
      })),
      examples: examples(rows),
    });
    console.log(
      `${city.id}: ${rows.length} raw rows; ${annual.coverage.completeMeteorology.valid}/${annual.coverage.completeMeteorology.expected} complete 2024 states; ${annual.coverage.solarIntervals.valid} solar intervals; ${provenance.gzipBytes} gzip bytes (${cached ? "cached" : "acquired"})`,
    );
  } catch (error) {
    failures.push(`${city.id}: ${error.message}`);
    console.error(`FAILED ${failures.at(-1)}`);
  }
}
if (failures.length)
  throw new Error(
    `No aggregate written: ${failures.length} acquisition/processing failures:\n${failures.join("\n")}`,
  );
const serialized = `${JSON.stringify(output)}\n`;
await writeFile(new URL("climates.json", base), serialized);
console.log(
  `Wrote ${output.cities.length} cities, ${Buffer.byteLength(serialized)} aggregate bytes. Raw compressed total: ${output.cities.reduce((sum, city) => sum + city.provenance.gzipBytes, 0)} bytes.`,
);
