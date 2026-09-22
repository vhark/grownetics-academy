import test from "node:test";
import assert from "node:assert/strict";
import {
  airState,
  ventilationComparison,
  evaporationOutcome,
  envelopeHeatTransfer,
} from "../modules/climate-design/physics.js";

const close = (actual, expected, tolerance = 1e-7) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} differs from ${expected}`,
  );

test("reference dew point and saturated air ordering follow PsychroLib SI", () => {
  const state = airState(25, 0.8, 101325);
  close(state.dewPointC, 21.3094, 0.001);
  assert.ok(state.dewPointC < state.wetBulbC && state.wetBulbC < state.tempC);
  const saturated = airState(25, 1, 101325);
  close(saturated.dewPointC, 25, 0.001);
  close(saturated.wetBulbC, 25, 0.001);
  close(saturated.airVpdPa, 0, 1e-8);
});

test("cold high-RH air can remove moisture despite lower indoor RH", () => {
  const result = ventilationComparison(
    { tempC: 25, rh: 0.6 },
    { tempC: 5, rh: 0.9 },
    101325,
  );
  assert.ok(result.moistureRemovalKgPerKg > 0);
  assert.ok(result.sensibleConditioningW > 0);
  const reversed = ventilationComparison(
    { tempC: 5, rh: 0.9 },
    { tempC: 25, rh: 0.6 },
    101325,
  );
  close(result.moistureRemovalKgPerKg, -reversed.moistureRemovalKgPerKg);
  close(result.enthalpyConditioningW, -reversed.enthalpyConditioningW);
  assert.ok(reversed.sensibleConditioningW < 0);
});

test("lower pressure raises humidity ratio without changing vapor pressure or dew point", () => {
  const sea = airState(25, 0.8, 101325);
  const high = airState(25, 0.8, 75000);
  assert.ok(high.humidityRatio > sea.humidityRatio);
  close(high.vaporPressurePa, sea.vaporPressurePa);
  close(high.dewPointC, sea.dewPointC);
});

test("ventilation enthalpy budget includes temperature and moisture conditioning", () => {
  const result = ventilationComparison(
    { tempC: 24, rh: 0.7 },
    { tempC: 34, rh: 0.3 },
    90000,
  );
  const sensiblePath = airState(
    24,
    result.outside.vaporPressurePa / airState(24, 1, 90000).vaporPressurePa,
    90000,
  );
  close(
    result.sensibleConditioningW,
    sensiblePath.enthalpy - result.outside.enthalpy,
    1e-6,
  );
  close(
    result.enthalpyConditioningW,
    result.sensibleConditioningW + result.moistureConditioningW,
    1e-6,
  );
});

test("evaporation exchanges sensible temperature for moisture at constant modeled enthalpy", () => {
  const inlet = airState(38, 0.2, 101325);
  const result = evaporationOutcome(
    inlet.tempC,
    inlet.rh,
    inlet.pressurePa,
    0.85,
  );
  assert.ok(result.outlet.tempC < inlet.tempC);
  assert.ok(result.outlet.humidityRatio > inlet.humidityRatio);
  assert.ok(result.outlet.rh <= 1 && result.outlet.rh > inlet.rh);
  close(result.outlet.enthalpy, inlet.enthalpy, 1e-6);
  close(
    result.waterAddedKgPerKg,
    result.outlet.humidityRatio - inlet.humidityRatio,
  );
  assert.ok(result.outlet.tempC >= inlet.wetBulbC - 0.001);
});

test("zero-effect and saturated pads cannot produce cooling or water addition", () => {
  for (const [rh, effect] of [
    [0.2, 0],
    [1, 0.9],
  ]) {
    const result = evaporationOutcome(30, rh, 101325, effect);
    close(result.outlet.tempC, 30, 0.001);
    close(result.waterAddedKgPerKg, 0, 1e-9);
  }
  const humid = evaporationOutcome(30, 0.99999, 60000, 0.9);
  assert.ok(humid.outlet.rh <= 1);
  close(humid.outlet.enthalpy, humid.inlet.enthalpy, 1e-6);
});

test("envelope conduction reverses sign and shading reduces gross solar and light together", () => {
  const base = {
    insideTempC: 25,
    outsideTempC: 5,
    uValue: 4,
    envelopeAreaM2: 100,
    solarWm2: 600,
    solarAreaM2: 50,
    transmission: 0.7,
    shading: 0,
  };
  const winter = envelopeHeatTransfer(base);
  close(winter.conductionW, -8000);
  close(envelopeHeatTransfer({ ...base, outsideTempC: 45 }).conductionW, 8000);
  const shaded = envelopeHeatTransfer({ ...base, shading: 0.5 });
  close(shaded.solarW, winter.solarW / 2);
  close(shaded.transmittedFraction, winter.transmittedFraction / 2);
  close(shaded.grossHeatInputW, shaded.conductionW + shaded.solarW);
});

test("unsupported physical inputs fail explicitly rather than return misleading states", () => {
  assert.throws(() => airState(25, 0, 101325), RangeError);
  assert.throws(() => airState(25, 1.1, 101325), RangeError);
  assert.throws(() => airState(25, 0.5, 20000), RangeError);
  assert.throws(() => evaporationOutcome(-5, 0.8, 101325, 0.8), RangeError);
  assert.throws(() => evaporationOutcome(25, 0.5, 101325, 1), RangeError);
});
