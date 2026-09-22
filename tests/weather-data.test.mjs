import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const data = JSON.parse(
  readFileSync(
    new URL("../modules/climate-design/data/climates.json", import.meta.url),
    "utf8",
  ),
);
const fairbanks = data.cities.find((city) => city.id === "fairbanks");

test("cold weather humidity retains the source liquid-water RH convention", () => {
  const cold = fairbanks.examples.cold;
  assert.ok(
    cold.temperatureC < -20,
    "The real weather example must exercise the ice/water distinction",
  );
  const vaporPa =
    (610.94 *
      Math.exp((17.625 * cold.temperatureC) / (243.04 + cold.temperatureC)) *
      cold.rhPercent) /
    100;
  const expectedRatio = (0.621945 * vaporPa) / (cold.pressurePa - vaporPa);
  assert.ok(
    Math.abs(cold.humidityRatio - expectedRatio) < 1e-8,
    `Weather source liquid-water RH was reinterpreted as ice RH: ${cold.humidityRatio} vs ${expectedRatio}`,
  );
});

test("annual solar energy integrates preceding-hour intervals across the year boundary", () => {
  const raw = JSON.parse(
    gunzipSync(
      readFileSync(
        new URL(
          "../modules/climate-design/data/weather/fairbanks.json.gz",
          import.meta.url,
        ),
      ),
    ),
  );
  const start = Date.UTC(2024, 0, 1),
    end = Date.UTC(2025, 0, 1);
  let energy = 0,
    count = 0;
  raw.hourly.time.forEach((time, index) => {
    const intervalEnd = Date.parse(`${time}:00Z`);
    if (intervalEnd > start && intervalEnd <= end) {
      energy += raw.hourly.shortwave_radiation[index] / 1000;
      count++;
    }
  });
  assert.equal(count, 8784);
  assert.ok(Math.abs(fairbanks.annual.solarEnergyKwhM2 - energy) < 0.001);
});
