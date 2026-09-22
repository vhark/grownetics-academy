import test from "node:test";
import assert from "node:assert/strict";
import { formatTemperature, temperatureMarkup } from "../js/preferences.js";

test("absolute temperatures convert at freezing, boiling, and negative boundaries", () => {
  assert.equal(formatTemperature(0, { unit: "F" }), "32.0°F");
  assert.equal(formatTemperature(100, { unit: "F", precision: 0 }), "212°F");
  assert.equal(formatTemperature(-40, { unit: "F" }), "-40.0°F");
  assert.equal(
    formatTemperature(-273.15, { unit: "F", precision: 2 }),
    "-459.67°F",
  );
});

test("temperature differences scale without the absolute offset", () => {
  assert.equal(formatTemperature(0, { unit: "F", difference: true }), "0.0°F");
  assert.equal(
    formatTemperature(10 / 9, { unit: "F", difference: true }),
    "2.0°F",
  );
  assert.equal(
    formatTemperature(-5, { unit: "F", difference: true }),
    "-9.0°F",
  );
  assert.equal(
    formatTemperature(5, { unit: "F", difference: true, signed: true }),
    "+9.0°F",
  );
});

test("source examples retain full precision before display rounding", () => {
  assert.equal(formatTemperature(10 / 3, { unit: "C" }), "3.3°C");
  assert.equal(formatTemperature(10 / 3, { unit: "F" }), "38.0°F");
  assert.equal(formatTemperature(-20 / 9, { unit: "F" }), "28.0°F");
});

test("precision is explicit and rounded zero never displays a negative sign", () => {
  assert.equal(
    formatTemperature(21.125, { unit: "C", precision: 2 }),
    "21.13°C",
  );
  assert.equal(
    formatTemperature(-0.001, { unit: "C", precision: 1, signed: true }),
    "0.0°C",
  );
  assert.equal(
    formatTemperature(0.001, { unit: "C", precision: 1, signed: true }),
    "0.0°C",
  );
});

test("markup rejects values that cannot form safe finite canonical attributes", () => {
  for (const value of [NaN, Infinity, -Infinity, '0" onmouseover="alert(1)']) {
    assert.throws(() => temperatureMarkup(value), TypeError);
  }
  assert.throws(() => formatTemperature(20, { precision: -1 }), RangeError);
});
