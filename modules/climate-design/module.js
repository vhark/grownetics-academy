import { lessons } from "./lessons.js";
import { glossary } from "./glossary.js";
import { referenceUrl } from "../../js/ui.js";

export default {
  id: "climate-design",
  number: "02",
  title: "Climate, Psychrometrics & CEA Design",
  shortTitle: "Climate & design",
  status: "draft",
  visibility: "listed",
  summary:
    "Read the outside air, define what the crop needs, and follow heat and water through the building before choosing equipment. Seven lessons, three air-side experiments, and fourteen real-weather study locations turn climate labels into better design questions.",
  level: "Foundations to applied design",
  audience: [
    "Greenhouse operators",
    "Indoor growers",
    "Facility designers",
    "Automation engineers",
    "Curious learners",
  ],
  objectives: [
    "Describe moist air using temperature, moisture content, and local pressure rather than RH alone.",
    "Read seasonal, coincident weather states without treating one year as a climate normal.",
    "Distinguish an outdoor-air opportunity from equipment capability and actual crop-zone attainment.",
    "Connect light, envelope, crop transpiration, and sensible and latent loads.",
    "Compare equipment and control sequences with explicit water, energy, maintenance, and safety constraints.",
    "Build an evidence-based design brief that keeps uncertainty and unresolved decisions visible.",
  ],
  prerequisites: [],
  lessons,
  glossary,
  labs: [
    {
      id: "air-state",
      title: "Read the invisible water.",
      label: "The air-state workbench",
      description:
        "Change temperature, relative humidity, and pressure. Compare dewpoint, humidity ratio, enthalpy, and wet-bulb temperature.",
      icon: "leaf",
      lessonId: "air-state",
    },
    {
      id: "outdoor-air",
      title: "An opportunity is not a guarantee.",
      label: "Outside air & evaporative cooling",
      description:
        "Compare outdoor and pad-leaving air against a target, then inspect the moisture-removal limit.",
      icon: "sun",
      lessonId: "free-opportunities",
    },
    {
      id: "envelope",
      title: "A building changes the problem.",
      label: "Envelope, light & load",
      description:
        "Explore heat transfer and the light-versus-solar-load tradeoff before selecting equipment.",
      icon: "layers",
      lessonId: "building-envelope",
    },
  ],
  references: [
    {
      id: "climate-atlas",
      title: "Global climate atlas",
      icon: "sun",
      load: () => import("./atlas.js").then((m) => m.loadAtlas()),
    },
    {
      id: "sources",
      title: "Sources & methods",
      icon: "file",
      load: () => import("./sources.js").then((m) => m.renderSources),
    },
  ],
  sources: [
    {
      label: "Evidence, methods & limits",
      url: referenceUrl("climate-design", "sources"),
    },
    {
      label: "2024 weather atlas & provenance",
      url: referenceUrl("climate-design", "climate-atlas"),
    },
  ],
  loadOverview: () => import("./overview.js").then((m) => m.renderOverview),
  loadLab: () => import("./labs.js").then((m) => m.mountLab),
  styles: [
    new URL("./module.css", import.meta.url).href,
    new URL("./atlas.css", import.meta.url).href,
  ],
  labStyles: [new URL("./labs.css", import.meta.url).href],
};
