import { Psychrometrics } from "./vendor/psychrolib.js";

// A private SI instance cannot be switched by consumers of the vendor default.
const psychro = new Psychrometrics();
psychro.SetUnitSystem(psychro.SI);

function bounded(name, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(
      `${name} must be finite and between ${min} and ${max}`,
    );
  }
  return value;
}

/** Teaching domain: -40..60 C, RH 0.01..1, 60000..110000 Pa.
 * RH follows PsychroLib's water/ice saturation convention (ice below 0.01 C).
 * The returned dewPointC is a frost point when below that triple point.
 * Zero RH is excluded: its condensation point is not finite. All energies and
 * humidity ratios are per kg of DRY air, not per kg of moist air.
 */
export function airState(tempC, rh, pressurePa = 101325) {
  bounded("Dry-bulb temperature (C)", tempC, -40, 60);
  bounded("Relative humidity fraction", rh, 0.01, 1);
  bounded("Pressure (Pa)", pressurePa, 60000, 110000);
  const vaporPressurePa = psychro.GetVapPresFromRelHum(tempC, rh);
  const humidityRatio = psychro.GetHumRatioFromRelHum(tempC, rh, pressurePa);
  return {
    tempC,
    rh,
    pressurePa,
    vaporPressurePa,
    humidityRatio,
    dewPointC: psychro.GetTDewPointFromRelHum(tempC, rh),
    wetBulbC: psychro.GetTWetBulbFromRelHum(tempC, rh, pressurePa),
    enthalpy: psychro.GetMoistAirEnthalpy(tempC, humidityRatio),
    airVpdPa: psychro.GetSatVapPres(tempC) - vaporPressurePa,
  };
}

/** A common-pressure, balanced stream comparison at 1 kg dry air/s.
 * Positive moistureRemovalKgPerKg means exhaust removes more water than supply
 * adds. Positive sensibleConditioningW means heating outdoor air to inside T,
 * at unchanged outdoor w; negative means sensible cooling. The enthalpy budget
 * also includes the moisture change at inside T. It is not an HVAC coil rating:
 * crop sources, condensation, reheat, recovery and actual flow are not modeled.
 */
export function ventilationComparison(
  insideInput,
  outsideInput,
  pressurePa = 101325,
) {
  const inside = airState(insideInput.tempC, insideInput.rh, pressurePa);
  const outside = airState(outsideInput.tempC, outsideInput.rh, pressurePa);
  const temperatureConditionedEnthalpy = psychro.GetMoistAirEnthalpy(
    inside.tempC,
    outside.humidityRatio,
  );
  const sensibleConditioningW =
    temperatureConditionedEnthalpy - outside.enthalpy;
  const enthalpyConditioningW = inside.enthalpy - outside.enthalpy;
  return {
    inside,
    outside,
    moistureRemovalKgPerKg: inside.humidityRatio - outside.humidityRatio,
    sensibleConditioningW,
    enthalpyConditioningW,
    moistureConditioningW: enthalpyConditioningW - sensibleConditioningW,
  };
}

/** Direct pad teaching approximation, inlet 5..55 C, effectiveness 0..0.9.
 * Tcandidate = Tin - effectiveness * (Tin - Twb). Treat h as constant, omitting
 * liquid-water enthalpy, pump/fan heat and real pad behavior. Real evaporation
 * is only NEARLY isoenthalpic. If the candidate would be supersaturated, solve
 * the saturated constant-h limit using vendor equations and stop on its warm
 * side. No invented clipping of w (which would break the energy balance).
 * Outlet liquid-water/ice conditions below 0 C are outside this model.
 */
export function evaporationOutcome(
  tempC,
  rh,
  pressurePa = 101325,
  effectiveness = 0.8,
) {
  bounded("Pad inlet temperature (C)", tempC, 5, 55);
  bounded("Pad effectiveness", effectiveness, 0, 0.9);
  const inlet = airState(tempC, rh, pressurePa);
  let outletTempC = tempC - effectiveness * (tempC - inlet.wetBulbC);
  if (outletTempC < 0)
    throw new RangeError(
      "Pad outlet below freezing is outside this liquid-water model",
    );
  const ratioAt = (temperature) =>
    psychro.GetHumRatioFromEnthalpyAndTDryBulb(inlet.enthalpy, temperature);
  let saturationLimited = false;
  if (ratioAt(outletTempC) > psychro.GetSatHumRatio(outletTempC, pressurePa)) {
    saturationLimited = true;
    let low = outletTempC;
    let high = tempC;
    for (let index = 0; index < 48; index++) {
      const midpoint = (low + high) / 2;
      if (ratioAt(midpoint) > psychro.GetSatHumRatio(midpoint, pressurePa))
        low = midpoint;
      else high = midpoint;
    }
    outletTempC = high;
  }
  const outletRatio = ratioAt(outletTempC);
  const outletRh = Math.min(
    1,
    psychro.GetRelHumFromHumRatio(outletTempC, outletRatio, pressurePa),
  );
  const outlet = airState(outletTempC, outletRh, pressurePa);
  return {
    inlet,
    outlet,
    effectiveness,
    saturationLimited,
    coolingC: inlet.tempC - outlet.tempC,
    waterAddedKgPerKg: outlet.humidityRatio - inlet.humidityRatio,
  };
}

/** Gross steady envelope inputs; positive W enters the space.
 * U [W/m2/K] includes the declared whole-assembly heat-transfer assumption.
 * Solar irradiance must correspond to the declared effective receiving area;
 * this is not a sun-angle, roof-geometry or optical model. All transmitted
 * shortwave is counted as a gross energy input, NOT all immediate sensible air
 * heating. Its partition into storage, sensible and crop latent heat is omitted.
 * Do not add transpiration latent energy again to this solar-inclusive budget.
 */
export function envelopeHeatTransfer({
  insideTempC,
  outsideTempC,
  uValue,
  envelopeAreaM2,
  solarWm2,
  solarAreaM2,
  transmission,
  shading,
}) {
  bounded("Inside temperature (C)", insideTempC, -40, 60);
  bounded("Outside temperature (C)", outsideTempC, -40, 60);
  bounded("U value (W/m2/K)", uValue, 0, 20);
  bounded("Envelope area (m2)", envelopeAreaM2, 0, 1000000);
  bounded("Solar irradiance (W/m2)", solarWm2, 0, 1500);
  bounded("Solar receiving area (m2)", solarAreaM2, 0, 1000000);
  bounded("Transmission fraction", transmission, 0, 1);
  bounded("Blocked shading fraction", shading, 0, 1);
  const conductionW = uValue * envelopeAreaM2 * (outsideTempC - insideTempC);
  const transmittedFraction = transmission * (1 - shading);
  const solarW = solarWm2 * solarAreaM2 * transmittedFraction;
  return {
    conductionW,
    solarW,
    grossHeatInputW: conductionW + solarW,
    transmittedFraction,
  };
}
