const STORAGE_KEY = "grownetics-academy-display-v1";
let preferences;

function readPreferences() {
  let stored;
  try {
    stored = JSON.parse(
      globalThis.localStorage?.getItem(STORAGE_KEY) ?? "null",
    );
  } catch {
    // Privacy settings and malformed storage must not block the academy.
  }
  return {
    unit: stored?.unit === "F" ? "F" : "C",
    theme: stored?.theme === "dark" ? "dark" : "light",
  };
}

export function getPreferences() {
  preferences ??= readPreferences();
  return { ...preferences };
}

function temperatureOptions(celsius, options) {
  if (typeof celsius !== "number" || !Number.isFinite(celsius)) {
    throw new TypeError("Temperature must be a finite Celsius number");
  }
  const precision = options.precision ?? 1;
  if (!Number.isInteger(precision) || precision < 0 || precision > 100) {
    throw new RangeError(
      "Temperature precision must be an integer from 0 to 100",
    );
  }
  const unit = options.unit ?? getPreferences().unit;
  if (unit !== "C" && unit !== "F") {
    throw new TypeError("Temperature unit must be C or F");
  }
  return {
    unit,
    precision,
    difference: options.difference === true,
    signed: options.signed === true,
  };
}

export function formatTemperature(celsius, options = {}) {
  const { unit, precision, difference, signed } = temperatureOptions(
    celsius,
    options,
  );
  const value = unit === "F" ? celsius * 1.8 + (difference ? 0 : 32) : celsius;
  let number = value.toFixed(precision);
  if (Number(number) === 0) number = number.replace("-", "");
  if (signed && Number(number) > 0) number = `+${number}`;
  return `${number}°${unit}`;
}

export function temperatureMarkup(celsius, options = {}) {
  const normalized = temperatureOptions(celsius, options);
  const tag = options.svg === true ? "tspan" : "span";
  return `<${tag} data-temperature-c="${celsius}" data-temperature-difference="${normalized.difference}" data-temperature-precision="${normalized.precision}" data-temperature-signed="${normalized.signed}">${formatTemperature(celsius, normalized)}</${tag}>`;
}

export function applyTemperatureDisplay(root = document) {
  const unit = getPreferences().unit;
  const project = (element) => {
    const raw = element.getAttribute("data-temperature-c");
    const celsius = Number(raw);
    if (raw === null || raw.trim() === "" || !Number.isFinite(celsius)) return;
    const rawPrecision = element.getAttribute("data-temperature-precision");
    const precision = rawPrecision === null ? 1 : Number(rawPrecision);
    if (!Number.isInteger(precision) || precision < 0 || precision > 100)
      return;
    element.textContent = formatTemperature(celsius, {
      unit,
      precision,
      difference:
        element.getAttribute("data-temperature-difference") === "true",
      signed: element.getAttribute("data-temperature-signed") === "true",
    });
  };
  if (root.matches?.("[data-temperature-c]")) project(root);
  root.querySelectorAll("[data-temperature-c]").forEach(project);
}

function applyPreferences() {
  const current = getPreferences();
  document.documentElement.dataset.theme = current.theme;
  document.documentElement.dataset.unit = current.unit;
  document.querySelectorAll("[data-unit-choice]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.unitChoice === current.unit),
    );
  });
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeChoice === current.theme),
    );
  });
}

export function initDisplayPreferences() {
  const controller = new AbortController();
  applyPreferences();
  applyTemperatureDisplay();
  document.addEventListener(
    "click",
    (event) => {
      const button = event.target.closest?.(
        "button[data-unit-choice], button[data-theme-choice]",
      );
      if (!button) return;
      const current = getPreferences();
      const unit = button.dataset.unitChoice;
      const theme = button.dataset.themeChoice;
      if (unit === "C" || unit === "F") current.unit = unit;
      else if (theme === "light" || theme === "dark") current.theme = theme;
      else return;
      const unitsChanged = current.unit !== preferences.unit;
      preferences = current;
      try {
        globalThis.localStorage?.setItem(
          STORAGE_KEY,
          JSON.stringify(preferences),
        );
      } catch {
        // Keep the user's choice for this session when device storage is blocked.
      }
      applyPreferences();
      if (unitsChanged) {
        applyTemperatureDisplay();
        document.dispatchEvent(
          new CustomEvent("academy:unitschange", {
            detail: { unit: current.unit },
          }),
        );
      }
    },
    { signal: controller.signal },
  );
  return () => controller.abort();
}
