import { lessons, glossary } from "./lessons.js";

export default {
  id: "cea-control",
  number: "01",
  title: "The Evolution of CEA Control",
  shortTitle: "CEA control",
  summary:
    "From the first thermostat to coordinated, predictive systems. Explore how growing environments work, compare control strategies, and make better decisions about uncertainty, shared resources, and safety.",
  level: "Foundations to advanced",
  audience: [
    "Greenhouse operators",
    "Indoor growers",
    "Automation engineers",
    "Curious learners",
  ],
  objectives: [
    "Trace the multiple consequences of one actuator command.",
    "Distinguish local feedback, anticipation, and predictive planning.",
    "Compare strategies by scope rather than prestige.",
    "Explain why graph structure is neither a control algorithm nor proof of causality.",
    "Follow prior, likelihood, and posterior through a sensor-health example.",
    "Recognize design patterns that preserve safety, observability, and trust.",
  ],
  prerequisites: [],
  lessons,
  glossary,
  labs: [
    {
      id: "coupling",
      title: "One action. Many effects.",
      label: "The coupled greenhouse",
      description:
        "Open the vents. Watch temperature, moisture, and CO₂ change together.",
      icon: "leaf",
      lessonId: "coupled-system",
    },
    {
      id: "planning",
      title: "React now. Or plan ahead.",
      label: "The predictive controller",
      description:
        "Compare reactive control with a controller that sees the lights-on surge coming.",
      icon: "sliders",
      lessonId: "twelve-ways",
    },
    {
      id: "bayes",
      title: "New evidence. Better decisions.",
      label: "The uncertainty lab",
      description:
        "A humidity sensor reads high. Change the evidence and update your belief.",
      icon: "uncertainty",
      lessonId: "bayesian-control",
    },
  ],
  references: [
    {
      id: "strategies",
      title: "Strategy reference",
      icon: "compare",
      load: () =>
        import("./reference.js").then(({ renderReference }) => renderReference),
    },
  ],
  sources: [
    {
      label: "Original CEA control field guide",
      url: new URL("./sources/outline.md", import.meta.url).href,
    },
  ],
  loadOverview: () =>
    import("./overview.js").then(({ renderOverview }) => renderOverview),
  loadLab: () => import("./labs.js").then(({ mountLab }) => mountLab),
  labStyles: [new URL("./labs.css", import.meta.url).href],
};
