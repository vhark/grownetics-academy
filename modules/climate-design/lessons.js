import { temperatureMarkup as t } from "../../js/preferences.js";
import { labUrl, referenceUrl } from "../../js/ui.js";

const atlas = referenceUrl("climate-design", "climate-atlas");
const sources = referenceUrl("climate-design", "sources");
const psychro =
  "https://github.com/psychrometrics/psychrolib/tree/a42717d24ed08534642d6caf7dcbbf72b9510bea";
const evaluation =
  "https://github.com/vhark/cea-psychrometric-site-evaluator/blob/main/docs/EVALUATION.md";
const components =
  "https://github.com/vhark/cea-psychrometric-site-evaluator/blob/main/docs/COMPONENT-PARAMETERS.md";
const fao = "https://www.fao.org/4/i3284e/i3284e.pdf";
const weather = "https://open-meteo.com/en/docs/historical-weather-api";
const evaluator = "https://vhark.github.io/cea-psychrometric-site-evaluator/";
const externalLab =
  "https://vhark.github.io/cea-psychrometric-site-evaluator/app/lab/";

// Every numeric scenario below is an illustrative assumption, not a crop recipe.
export const lessons = [
  {
    id: "air-state",
    number: "01",
    title: "Air carries heat. And invisible water.",
    shortTitle: "Read the air",
    subtitle:
      "Temperature and RH are a beginning, not a complete design argument.",
    minutes: 10,
    category: "Air-state foundations",
    icon: "leaf",
    intro:
      "Two rooms can show the same relative humidity and contain very different amounts of water vapor. Before comparing climates or buying a dehumidifier, learn which air property answers which question—and where the crop fits into that description.",
    objectives: [
      "Distinguish dry-bulb temperature, RH, humidity ratio, dewpoint, wet-bulb temperature, and enthalpy.",
      "Explain why local pressure and a declared saturation convention matter.",
      "Translate a crop brief into compatible temperature, moisture, light, and condensation constraints.",
    ],
    sections: [
      {
        id: "air-first",
        title: "Start outside, then define the crop’s band",
        html: `<p>A climate is a source of opportunities and disturbances. It is not a crop specification. The first design comparison is between the air a site offers and the conditions a particular crop, growth stage, and production system require. A propagation room, a mature tomato canopy, and a stacked leafy-green room have different leaf areas, light programs, air distribution needs, and acceptable excursions.</p><p>Write a target <em>band</em>, a time schedule, and a consequence of leaving it before asking which machine is best. Distinguish preferred operation from an alarm limit or survival limit. Include root-zone conditions, crop light, and moisture management; a comfortable air temperature alone is not a successful growing environment. This module uses assumed numbers to expose physical relationships, never universal crop recipes. <a href="${fao}">FAO’s greenhouse guide, chapters 2–5</a>, places site, structure, climate control, and crop selection in the same design problem rather than prescribing one transferable technology.</p><p>Keep the facility definition alongside the crop. A sunlit single-layer greenhouse receives changing solar energy. An opaque multi-tier room receives a deliberately scheduled electrical-light load over a canopy area that may greatly exceed its floor area. The same outdoor weather can therefore produce very different heating, cooling, and water-removal demands.</p>`,
      },
      {
        id: "rh-is-relative",
        title: "Why a high RH can still mean dry supply air",
        html: `<p>Dry-bulb temperature describes air temperature. Relative humidity, RH, compares actual vapor pressure with saturation vapor pressure at that temperature. Warming air without adding water reduces RH; cooling it without removing water increases RH until saturation is reached. The phrase “warm air holds more water” is an intuition, not a mass-balance equation: the saturation vapor pressure changes with temperature.</p><p>Consider two deliberately chosen states at 101,325 Pa: outdoor air at ${t(5)} and 90% RH, and crop-room air at ${t(24)} and 65% RH. The cold air has a higher RH but less water vapor per kilogram of dry air. Bringing it inside and warming it can remove crop moisture through exchange. That drying comes with a heating bill and a need to avoid local cold drafts. Conversely, warm air with a lower RH can still import water into a cooler room.</p><p><strong>Humidity ratio, W</strong>, is kilograms of water vapor per kilogram of dry air. It makes the comparison explicit: W = 0.621945 pᵥ / (P − pᵥ), where pᵥ is vapor pressure and P is total absolute pressure, both in Pa. A display of 10 g/kg means 0.010 kg/kg, not 10% RH. The <a href="${psychro}">pinned PsychroLib implementation</a> supplies ASHRAE-based property equations; this formula is a property relationship, not evidence of ventilation capacity.</p>`,
      },
      {
        id: "properties-jobs",
        title: "Six properties, six useful questions",
        html: `<p><strong>Dewpoint</strong> answers when cooling a parcel at approximately constant pressure and moisture content reaches saturation. Compare it with the temperature of a leaf, pipe, frame, or glazing surface—not just the room thermostat. A cool surface can become wet while room RH looks moderate. Below freezing, distinguish saturation over liquid water from saturation over ice; dewpoint and frost point are not interchangeable labels.</p><p><strong>Wet-bulb temperature</strong> describes the evaporative-cooling limit of an idealized air process. The dry-bulb minus wet-bulb difference is a useful first indication of direct evaporative cooling potential. A real pad approaches that limit only partly and adds water to the air. <strong>Enthalpy</strong> describes sensible plus water-vapor energy on a dry-air mass basis. It is useful for energy accounting and mixing; it cannot replace separate checks that supply air is cool enough and dry enough.</p><p><strong>Air VPD</strong> is saturation vapor pressure at air temperature minus actual vapor pressure. <strong>Leaf VPD</strong> uses leaf temperature in the saturation term instead. Radiation, air movement, and transpiration can make leaf temperature differ from air temperature. A controller reporting air VPD has not measured leaf VPD, water stress, or disease risk. Stomatal behavior, root supply, cultivar, and boundary-layer resistance still matter. The <a href="${evaluation}">evaluator’s property and crop-method discussion</a> explicitly separates these quantities.</p>`,
      },
      {
        id: "pressure-phase",
        title: "Pressure is part of the state—not a decorative input",
        html: `<p>At the same temperature and RH, vapor pressure is approximately the same under the chosen saturation convention, but humidity ratio increases as total pressure falls. A highland calculation made at sea-level pressure therefore misstates water per kilogram of dry air. Air density also changes: one cubic meter per second is not the same dry-air mass flow at every elevation. Moisture transport and sensible capacity must use compatible mass and volume units.</p><p>Use measured or modeled <em>surface pressure</em>, not meteorological pressure reduced to mean sea level. A standard-atmosphere estimate from elevation is a labeled fallback, not a site observation. Open-Meteo provides both concepts; our atlas requests surface pressure and converts hPa to Pa. The <a href="${weather}">API variable definitions</a> identify that difference.</p><p>Cold weather adds a second subtlety: an RH value needs a water-versus-ice convention. Do not silently replace a provider’s RH with a dewpoint-derived value from a different convention. This course’s basic calculations use the vendored PsychroLib conventions; retain provider metadata and be especially cautious interpreting cold-state derived values near freezing. Precision in a displayed decimal does not remove convention or input uncertainty.</p>`,
      },
      {
        id: "compatible-band",
        title: "Build a band that can actually coexist",
        html: `<p>An illustrative brief might request air between ${t(22)} and ${t(26)}, with a VPD range and a minimum leaf-to-dewpoint margin. These are coupled constraints. At each candidate air temperature, a VPD band implies a vapor-pressure band; the coldest relevant surface imposes another upper moisture limit. If those intervals do not overlap, no controller can meet them simultaneously. Revisit the assumptions rather than asking an optimizer to solve an impossible target.</p><p>As a simple surface check, suppose a measured leaf is at ${t(19)} and the air dewpoint is ${t(20)}. The leaf-to-dewpoint margin is ${t(-1, { difference: true, signed: true })}; condensation is possible even if the room-air temperature is inside its band. A positive room-average margin cannot clear a colder edge leaf or frame. Allow for sensor error, lag, spatial variation, and the crop’s actual tolerance when developing commissioned margins.</p><p>Use the <a href="${labUrl("climate-design", "air-state")}">air-state workbench</a> to compare the two cold/warm states above. Then hold dry bulb and RH fixed while reducing pressure: predict which outputs will change before moving the control. In the external <a href="${externalLab}">air-state lab</a>, manually recreate the same state, compare sensible heating with evaporation, and write one sentence identifying what stays constant and what moves in each process. This is a handoff exercise, not an automatic data transfer.</p>`,
      },
    ],
    takeaway:
      "Choose the property that matches the job: humidity ratio for water balance, dewpoint for surface risk, wet bulb for evaporation, and separate temperature and moisture constraints for the crop.",
    quiz: {
      question:
        "Cold outside air has a higher RH than the crop room. What evidence is needed before rejecting it as a drying source?",
      options: [
        "A comparison of humidity ratios at the relevant pressures, followed by airflow and heating-load checks.",
        "Only the RH difference; a higher percentage always imports water.",
        "Only the outdoor dry-bulb temperature; colder air is always an adequate moisture sink.",
        "A comparison of enthalpy alone; lower enthalpy guarantees both temperature and moisture compliance.",
      ],
      answer: 0,
      explanation:
        "RH changes with temperature. Humidity ratio establishes the direction of water transfer, but useful capacity still depends on dry-air mass flow, crop water release, and whether the accompanying thermal load is manageable.",
    },
    source:
      "Property equations: pinned PsychroLib / ASHRAE. Crop and facility context: FAO chapters 2–5. Numeric states are teaching assumptions.",
    lab: "air-state",
  },
  {
    id: "weather-patterns",
    number: "02",
    title: "A year is a sequence, not an average.",
    shortTitle: "Read the weather",
    subtitle:
      "Distributions tell you how often. Coincident states tell you what happens together.",
    minutes: 10,
    category: "Climate evidence",
    icon: "sun",
    intro:
      "A mean temperature can conceal a cold winter, a hot summer, and a humid season when evaporative cooling stops helping. Design decisions need the shape and timing of weather, not a city label or one flattering annual number.",
    objectives: [
      "Read weather distributions, coincident states, duration, and seasonal timing together.",
      "Distinguish reanalysis, site measurements, a single year, and design-condition evidence.",
      "Explain the atlas’s UTC calendar, coverage, pressure, and radiation conventions.",
    ],
    sections: [
      {
        id: "means-hide-loads",
        title: "Do not size equipment from a pleasant average",
        html: `<p>Imagine two weather records with the same mean dry-bulb temperature. One stays close to that mean; the other alternates cold nights and hot afternoons. Their heating peaks, cooling peaks, opportunity for nighttime ventilation, and storage requirements need not resemble one another. Add moisture and the ambiguity grows: heat can coincide with dry air that accepts evaporation, or with high wet-bulb temperature that defeats it.</p><p>Begin with distributions of dry bulb, dewpoint or humidity ratio, wet bulb, and solar radiation. Look at monthly patterns as well as the annual distribution. A percentile says how a variable is ranked in this record; it is neither a load calculation nor a guarantee about future weather. An extreme maximum in one year is an observed maximum of that dataset, not the worst physically possible condition.</p><p>The <a href="${atlas}">climate atlas</a> makes fourteen locations comparable using the same requested year and provider model. Read it as a disciplined way to discover questions. Before an investment, extend the inquiry with several actual years, relevant engineering design data, local weather measurements, and known failure events. A longer record improves context; it does not make a gridded pixel identical to the crop site.</p>`,
      },
      {
        id: "coincident-not-combined",
        title: "Keep the weather together",
        html: `<p>A high temperature percentile and a high RH percentile taken independently usually occurred at different hours. Combining them creates a synthetic air state that may be far more severe—or simply different—than the event each statistic describes. Sometimes a deliberately conservative synthetic condition is useful, but label it as a stress assumption rather than an observed hour.</p><p>For a hot-hour investigation, select the timestamp and retain its temperature, RH, surface pressure, and correctly interpreted radiation interval. Then inspect nearby hours. For a moisture investigation, select a high dewpoint or wet-bulb event instead; it may occur at a different time. Cooling coil performance, pad opportunity, and envelope heat gain respond to different combinations, so there is no single universally worst hour.</p><p>A worked reasoning exercise: suppose your hottest hour is dry and your wettest period is milder. Pads may offer relief during the first, while moisture removal—not maximum sensible cooling—governs the second. A system sized only for the hottest hour can therefore miss its controlling latent condition. The <a href="${evaluation}">evaluator evidence framework</a> calls for coincident states and separate thermal and moisture failure reporting precisely because one headline statistic hides that distinction.</p>`,
      },
      {
        id: "timing-matters",
        title: "Hours are not interchangeable",
        html: `<p>Ten isolated difficult hours allow different recovery strategies from ten consecutive difficult hours. Inspect episode duration, nights that fail to cool down, and whether unfavorable humidity persists when lamps switch off. Buildings and water tanks store heat only within finite limits. A crop can accumulate stress during a long excursion even when an annual percentage looks acceptable.</p><p>Seasonal grouping also changes the economic question. A heater needed rarely but during a severe cold event cannot be removed just because annual heating energy is small. A dehumidifier may become important during dark, low-sensible-load periods, when cooling equipment has little temperature-driven runtime. Ventilation that is useful during a dry season may import water during a monsoon.</p><p>Align schedules to the actual facility’s local clock before simulating crop day and night. UTC noon is not local noon everywhere. Northern and Southern Hemisphere seasons are offset; compare Almeria and Cape Town by their weather and crop calendars, not by treating January as “winter” for both. Our atlas keeps UTC dates for reproducibility. Its monthly bins are UTC calendar months, not a claim about local crop shifts or exact sunrise boundaries.</p>`,
      },
      {
        id: "what-atlas-is",
        title: "What the atlas measures—and what it does not",
        html: `<p>The atlas uses real hourly <strong>2024 ERA5 reanalysis supplied by Open-Meteo</strong>. Reanalysis combines observations and a physical atmospheric model; it is not a station installed at each named facility. Requested locations, returned coordinates and elevation, source URLs, retrieval metadata, raw responses, and coverage belong with the data. Coastal gradients, urban effects, local shelter, and highland topography can differ within the source grid.</p><p>2024 is a leap year with 8,784 expected UTC hourly timestamps per complete location record. Expected, available, and valid hours are different quantities. A missing value must not silently become zero or a comfortable hour. Separate meteorological validity from radiation validity and state the denominator of every reported percentage. The <a href="${weather}">Open-Meteo documentation</a> describes temperature and RH as instantaneous values and shortwave radiation as the <em>preceding-hour mean</em>. The fields share labels, but not identical temporal meaning.</p><p>Shortwave radiation is outdoor global horizontal radiation in W/m². Integrating interval means gives radiant energy, not plant DLI directly. Do not interpret nighttime zero radiation as missing. Do not shift a preceding-hour solar value forward without a declared alignment rule. The <a href="${sources}">source and method register</a> records these conventions and points to the atlas’s raw-data provenance.</p>`,
      },
      {
        id: "weather-evidence-task",
        title: "Turn the record into a design question",
        html: `<p>Choose two atlas locations with contrasting moisture patterns. Keep one crop band fixed. Record the months in which the outdoor air seems most useful and the variables that constrain it in less favorable months. Do not declare an equipment winner: first write what the weather can support, what it cannot establish, and which additional measurement would change the conclusion.</p><p>For example, a low outdoor humidity ratio suggests a potential moisture sink. It does not reveal available air exchange through insect screens, acceptable CO₂ loss, or the heating needed to bring replacement air to the crop band. A large dry-bulb/wet-bulb separation suggests pad opportunity, not a specified indoor temperature. Ask for a joint supply-air check and a crop water balance next.</p><p>Before signing off a climate screen, retain the data source and model, year and time basis, coordinates and pressure basis, missing-data handling, and all threshold assumptions. Add multiple years and coincident design conditions for subsequent engineering. This record becomes the audit trail when someone asks why a system was selected after a different season exposes its weakness.</p>`,
      },
    ],
    takeaway:
      "Weather evidence becomes useful when its variables, timestamps, duration, and assumptions stay together. A single illustrative year can teach comparisons, but cannot certify design extremes or future reliability.",
    quiz: {
      question:
        "Why can a design based on separate high temperature and high RH percentiles be misleading?",
      options: [
        "Percentiles are unsuitable for any weather analysis.",
        "The two values may come from different times, creating a synthetic state rather than the coincident condition the equipment faces.",
        "RH always reaches its maximum during the hottest hour, so the two numbers duplicate information.",
        "Only annual mean enthalpy is required to select cooling equipment.",
      ],
      answer: 1,
      explanation:
        "Independent percentiles describe marginal distributions. Keep coincident states for event analysis, and label any deliberately combined stress condition as synthetic. Examine moisture-limited and temperature-limited events separately.",
    },
    source:
      "Weather methods: Open-Meteo historical API and ERA5. Evidence boundaries: evaluator EVALUATION.md. Atlas is 2024 only, not a climate normal.",
  },
  {
    id: "free-opportunities",
    number: "03",
    title: "Useful outside air is only the beginning.",
    shortTitle: "Find the free opportunities",
    subtitle:
      "Separate thermodynamic possibility, available airflow, and actual crop-zone performance.",
    minutes: 11,
    category: "Heat & moisture balances",
    icon: "compare",
    intro:
      "Cool air can import water. A pad can cool while making a moisture problem worse. A perfect-looking supply state can still fail when there is not enough airflow to carry the crop’s heat and water away.",
    objectives: [
      "Distinguish outdoor-air opportunity, installed capability, and indoor attainment.",
      "Apply a steady dry-air-based vapor mass balance and explain its limits.",
      "Trace the heat and moisture consequences of direct evaporation, heating, and dehumidification.",
    ],
    sections: [
      {
        id: "three-evidence-levels",
        title: "Three claims that must not be confused",
        html: `<p><strong>Opportunity:</strong> an air state can move conditions in a useful direction. <strong>Capability:</strong> the installed plant can supply enough of that air under actual resistance and equipment limits. <strong>Attainment:</strong> the crop zone actually stays within its joint temperature and moisture constraints over time. Each claim requires more evidence than the last.</p><p>For sensible cooling by outdoor air, a supply temperature below the zone temperature gives a favorable direction. Capacity is approximately dry-air mass flow × moist-air heat capacity × temperature difference. A small difference needs a larger flow for the same sensible removal. Fans must overcome screens, pads, filters, ducts, and openings; a theoretical opening area is not a certified flow. Air that bypasses the crop does not provide uniform canopy conditions.</p><p>“Free” cooling is not zero-cost cooling. Fans consume power, filters need maintenance, ventilation loses enriched CO₂, and the incoming air may require heating or moisture treatment. <a href="${evaluation}">The evaluator’s evidence ladder</a> permits weather-only operating-window claims, but explicitly prohibits translating them into tonnage, ROI, or actual indoor conditions without a declared facility model.</p>`,
      },
      {
        id: "moisture-balance",
        title: "Count the water that must leave",
        html: `<p>For a well-mixed steady zone, let G be crop and wet-surface vapor release in kg/s, ṁ the incoming dry-air mass flow in kg/s, Wₛ supply humidity ratio, W𝓏 zone humidity ratio, and D controlled condensate removal in kg/s. Ignoring other sources and sinks, <strong>G + ṁ(Wₛ − W𝓏) − D = 0</strong>. Without dehumidification, holding a chosen W𝓏 requires ṁ = G/(W𝓏 − Wₛ), and only makes drying sense when Wₛ is below W𝓏.</p><p>Use deliberately assumed values: G = 0.002 kg/s, W𝓏 = 0.012 kg/kg, and Wₛ = 0.008 kg/kg. The minimum balance flow is 0.5 kg dry air/s. If Wₛ rises to 0.011 kg/kg, the required flow becomes 2 kg/s. At equal supply and zone humidity ratios, no finite flow removes the ongoing vapor source; wetter supply adds to it. These results are arithmetic consequences of the assumptions, not measured crop transpiration or fan sizing.</p><p>That steady balance omits changing storage, crop feedback, spatial gradients, leakage paths, and condensation on surfaces. In a transient balance, dry-air inventory times the rate of change of W appears on the left. A zone can temporarily store vapor and later condense it; storage is not an unlimited sink. See the <a href="${evaluation}">conservation contract</a> for why crop evaporation, condensate, and dry-air basis must be kept explicit.</p>`,
      },
      {
        id: "pad-limit",
        title: "A pad exchanges sensible cooling for added vapor",
        html: `<p>For an illustrative direct evaporative pad, leaving temperature is estimated by Tₚ = Tₒ − ε(Tₒ − T𝓌ᵦ), where ε is effectiveness. If outside dry bulb is ${t(35)}, wet bulb is ${t(20)}, and effectiveness is 0.8, the estimated leaving temperature is ${t(23)}. The reduction is ${t(12, { difference: true })}. This is a calculated <em>pad outlet</em>, not a greenhouse prediction.</p><p>The process adds vapor. A simple estimate conserves moist-air enthalpy approximately while lowering dry bulb; it does not conserve humidity ratio at the same time. Liquid-water temperature, pump heat, pad condition, and detailed exchange affect the real result. A higher-effectiveness pad can improve supply temperature while pushing supply moisture above the crop limit. An adiabatic pad cannot cool below its inlet wet-bulb limit simply because a thermostat requests more.</p><p>After the pad, solar energy, lighting, envelope transfer, and the crop change the state again. Available fan flow and temperature rise across the house matter. Water quality, evaporation, bleed-off, scaling, hygiene, pump availability, and water restrictions belong in the assessment. The <a href="${evaluation}">pad-method description</a> identifies the constant-enthalpy approximation; <a href="${fao}">FAO chapter 4</a> provides greenhouse cooling context. Neither makes an assumed effectiveness a manufacturer guarantee.</p>`,
      },
      {
        id: "coupled-energy",
        title: "Follow sensible and latent energy together",
        html: `<p>Transpiration changes liquid water into vapor and consumes energy at the evaporating surface. That can cool leaves while adding a latent removal requirement to the facility. Do not count the same phase-change energy twice by mixing a total-enthalpy balance with an extra latent term that is already included. Conversely, a dry-bulb-only load estimate can overlook the water that still needs to leave.</p><p>A cooling coil can remove both sensible heat and water when its effective surface is cold enough to condense vapor. Its sensible and latent capacities depend on entering air, flow, coil conditions, and runtime. At lights-off, sensible demand may collapse while crop and substrate water release continue. A temperature-only call can then stop the compressor before sufficient moisture is removed.</p><p>An in-room condensing dehumidifier converts existing vapor energy into sensible heat and adds its electrical input. Its warm discharge can help during heating demand and increase cooling demand during warm conditions. At the whole-zone total-energy boundary, condensation is an internal conversion; electricity is the new external energy. A split system rejecting heat outdoors has a different boundary. <a href="${evaluation}">The energy-accounting examples</a> explain why equipment location and heat rejection are essential inputs, not cosmetic options.</p>`,
      },
      {
        id: "useful-not-enough",
        title: "Work from a favorable state to a defensible claim",
        html: `<p>In the <a href="${labUrl("climate-design", "outdoor-air")}">outside-air lab</a>, first find a condition where outside air is cooler but wetter than the target. State the sensible benefit and moisture penalty separately. Then find a dry state where a pad helps temperature. Compare its leaving humidity ratio with the crop limit before deciding that “pad on” is useful.</p><p>Next do a separate hand calculation using the preceding water balance: keep W𝓏 = 0.012 and Wₛ = 0.008 kg/kg, but double G from 0.002 to 0.004 kg/s. Required dry-air flow doubles from 0.5 to 1 kg/s. The lab does not model canopy transpiration; this calculation adds that assumption explicitly. The weather opportunity does not disappear, but the required removal capacity changes. Write the distinction: “The supply state is favorable; sufficient dry-air flow and heat capacity have not yet been established.” If no humidity-ratio difference is available, identify a real additional sink—such as mechanical condensate removal—rather than increasing recirculating fan speed and pretending water exits.</p><p>Finish by listing omitted constraints: biosecurity, filtration, smoke, noise, pressure balance, CO₂, local drafts, minimum ventilation, and water supply. Weather-side opportunity can be vetoed by one of them. A reasoned rejection is more useful than an optimistic operating-hours count that assumes the facility can always exploit favorable air.</p>`,
      },
    ],
    takeaway:
      "A favorable outdoor or pad-leaving state is a direction of travel. Airflow, crop vapor release, heat loads, and operating constraints determine whether the zone can arrive at its target.",
    quiz: {
      question:
        "A pad outlet meets the temperature limit but has the same humidity ratio as the zone’s maximum, while the crop continues transpiring. What follows?",
      options: [
        "Increasing outdoor-air flow alone can always hold the moisture limit.",
        "Meeting the pad outlet temperature proves joint crop-zone compliance.",
        "At that target, the incoming air provides no net vapor-removal gradient; another sink or a changed supply state is needed.",
        "Recirculation fans remove vapor because they increase leaf evaporation.",
      ],
      answer: 2,
      explanation:
        "At equal supply and target humidity ratios, ṁ(Wzone − Wsupply) is zero for any flow. Crop vapor must accumulate or leave through another explicit sink. Temperature relief does not establish moisture balance.",
    },
    source:
      "PsychroLib properties; evaluator EVALUATION.md conservation and pad assumptions; FAO greenhouse climate-control context. Worked loads and states are illustrative.",
    lab: "outdoor-air",
  },
  {
    id: "building-envelope",
    number: "04",
    title: "The building decides which loads reach the crop.",
    shortTitle: "Shape the building",
    subtitle:
      "Glazing, insulation, leakage, and screens change more than one balance.",
    minutes: 10,
    category: "Facility design",
    icon: "layers",
    intro:
      "Before increasing equipment capacity, ask what enters through the roof, walls, openings, and light program. A building can reduce a load, relocate it, or make a new one—and good insulation does not remove crop water.",
    objectives: [
      "Use geometry and assembly U-values without confusing them with infiltration.",
      "Separate solar energy, crop photons, shade, and energy-screen effects.",
      "Compare greenhouse and opaque-room loads while preserving crop and canopy assumptions.",
    ],
    sections: [
      {
        id: "envelope-arithmetic",
        title: "A useful first calculation—and its boundary",
        html: `<p>Steady conductive heat transfer can be screened with Q = U A ΔT. U is an overall assembly coefficient in W/(m²·K), A is the actual exterior area in m², and ΔT is the indoor–outdoor temperature difference. Use roof and wall area, not floor area by habit. Include framing and separate materials; for parallel assemblies, add UᵢAᵢ rather than averaging product names.</p><p>Assume 800 m² of exterior assembly, U = 4 W/(m²·K), and a temperature difference of ${t(15, { difference: true })}. The screening heat transfer is 48,000 W, or 48 kW. If an alternative whole-assembly U is 2 under comparable conditions, that term becomes 24 kW. It does <em>not</em> prove a 50% reduction in total heating cost: infiltration, ground losses, controls, solar gains, and humidity management remain.</p><p>A panel rating omits bridges, joints, doors, and installation defects unless its test boundary includes them. Ground coupling needs a separate treatment. Dynamic storage and outside surface solar absorption may matter, particularly on opaque roofs; the elementary UA model does not resolve them. The <a href="${components}">component evidence register</a> distinguishes product, assembly, and whole-building claims rather than allowing one to masquerade as another.</p>`,
      },
      {
        id: "leaks-not-vents",
        title: "Leakage is not a guaranteed ventilation system",
        html: `<p>Uncontrolled infiltration depends on wind, stack effect, pressure differences, opening condition, and building exposure. A material does not own an immutable ACH value. Loading doors, broken seals, and vent closure can dominate air exchange. A blower-door result at an imposed pressure characterizes leakage under that test; it is not the same as natural hourly infiltration.</p><p>Controlled ventilation has intentional paths, flow limits, and commands. Leakage bypasses some of that control. Reducing leakage can lower winter heating and hot-humid moisture import, but can also reveal a crop moisture load previously carried away accidentally. Replace the accidental exchange with a deliberate moisture strategy, not with a promise that a tighter house will always remain dry.</p><p>Wind affects both pressure-driven exchange and surface transfer. The atlas’s selected weather fields and a simple fixed-ACH teaching calculation do not model wind-driven building behavior. To make a project-specific claim, measure or model openings, pressure, exposure, and fan curves under relevant conditions. <a href="${components}">The envelope and infiltration evidence notes</a> specifically warn against treating pressurization ACH or transferred building-class estimates as annual operating guarantees.</p>`,
      },
      {
        id: "photons-and-watts",
        title: "Light is both a crop input and an energy pathway",
        html: `<p>Glazing and screens affect shortwave heat gain and photosynthetic photons. Those are related but not identical quantities. PAR transmission, total solar transmission, visible-light transmission, haze, and solar heat-gain coefficient have different definitions. Haze describes scattering; it does not create photons or directly state how much light reaches the crop.</p><p>For a worked photon calculation, a constant canopy PPFD of 250 μmol/(m²·s) for 16 hours delivers 14.4 mol/(m²·day): multiply by 57,600 seconds and divide by one million. This is an illustrative light program, not a crop recommendation. Outdoor W/m² cannot be substituted directly for PPFD without a declared spectrum and photon conversion. Roof geometry, frames, dirt, condensation, screens, and canopy location further change delivered light.</p><p>A screen that cuts solar load can also cut natural DLI, increasing supplemental-light demand or reducing production potential. Compare alternatives at a stated crop light requirement, not by rewarding one for making the house dark. The <a href="${evaluation}">light-accounting method</a> keeps daily DLI deficits separate from temperature and moisture compliance. <a href="${fao}">FAO chapters 3–4</a> provide covering-material and climate-control context without erasing the light tradeoff.</p>`,
      },
      {
        id: "screens-are-systems",
        title: "Shade, thermal screens, and insect mesh do different jobs",
        html: `<p>Shade controls incoming radiation; a thermal screen can reduce radiative and convective heat loss; insect mesh protects the crop while adding airflow resistance. A product can have several effects, but one favorable label does not quantify them all. Ask for measured optical and airflow properties at the installed configuration, plus cleaning and aging assumptions.</p><p>A reflective screen may absorb less incoming energy than a dark one, yet reflection alone is not proof of preferential near-infrared rejection while passing crop PAR. Nor is a vendor’s “energy saving” percentage automatically a multiplier on whole-building U. The <a href="${components}">screen evidence review</a> explicitly separates measured spectral behavior, vendor claims, longwave results, and whole-house savings.</p><p>Closing an internal screen can retain heat and reduce radiative leaf cooling while restricting the path carrying vapor to roof vents. Opening a gap connects crop and roof spaces, not necessarily the outdoors. Finer insect mesh can reduce available ventilation at the same driving pressure. A design must retain a real moisture sink and verify airflow, rather than assigning a universal RH increase or assuming a fixed gap percentage guarantees a particular ACH.</p>`,
      },
      {
        id: "facility-choice",
        title: "Compare a greenhouse with an opaque room fairly",
        html: `<p>An opaque grow room does not receive useful direct crop sunlight through its roof by definition, but solar heating of the exterior can still conduct inward. It exchanges a variable natural-light resource for controlled electrical lighting and an envelope that can be much more insulated. Electricity, fixture heat paths, stacked canopy area, and equipment rejection location become central.</p><p>Hold crop output assumptions and canopy area visible when comparing facilities. Doubling canopy layers without changing the crop moisture source or lighting load makes the opaque option look artificially easy. Conversely, assuming every watt of greenhouse sunlight is unwanted heat ignores its role in photosynthesis and lighting displacement. Neither building class is a climate-independent winner.</p><p>Use the <a href="${labUrl("climate-design", "envelope")}">envelope and light lab</a> to change one assumption at a time: U-value, exterior area, or transmission. Explain which balance changed and which did not. Then create a two-column brief for a greenhouse and opaque room: what is measured, what is assumed, and what load cannot be evaluated with this simplified model. Geometry, construction quality, crop schedule, and equipment evidence must follow before procurement.</p>`,
      },
    ],
    takeaway:
      "Improve the building with both heat and crop light in view. Insulation, airtightness, screens, and glazing act through different pathways; none eliminates the need to balance water vapor.",
    quiz: {
      question:
        "An energy screen’s vendor reports a whole-house heating saving. How should that evidence enter a design comparison?",
      options: [
        "Apply the saving directly to U-value and ignore any humidity effect.",
        "Treat it as a universal optical transmission measurement.",
        "Subtract it from the fan’s airflow rating because savings and airflow are complementary.",
        "Retain its tested boundary and conditions; obtain or calibrate assembly heat-transfer, optical, and airflow effects separately.",
      ],
      answer: 3,
      explanation:
        "Whole-house savings include interacting loads, weather, installation, and controls. They are not automatically a material coefficient, an optical property, or an airflow factor.",
    },
    source:
      "Envelope and screen distinctions: evaluator COMPONENT-PARAMETERS.md; covering and climate context: FAO chapters 3–4. Arithmetic examples are assumptions, not product ratings.",
    lab: "envelope",
  },
  {
    id: "equipment-controls",
    number: "05",
    title: "Choose equipment by the job. Coordinate the jobs.",
    shortTitle: "Equipment & causal controls",
    subtitle:
      "A nameplate does not describe part-load moisture removal or a safe operating sequence.",
    minutes: 12,
    category: "Equipment & operation",
    icon: "sliders",
    intro:
      "A facility needs ways to add and remove heat, remove or add water, exchange air, and deliver crop light. Choosing those capabilities is only half the design. The other half is deciding when they may act together—and how you will know they worked.",
    objectives: [
      "Compare heating, cooling, dehumidification, reheat, recovery, and desiccant roles without generic product rankings.",
      "Describe a causal sequence with separate thermal and moisture requests, constraints, and hysteresis.",
      "Specify commissioning evidence, economic boundaries, and fault responses.",
    ],
    sections: [
      {
        id: "equipment-jobs",
        title: "Write the required process before selecting the machine",
        html: `<p>A heater adds sensible energy but does not remove vapor merely because RH falls. Ventilation can remove vapor only if the incoming air state and flow support that direction. A cooling coil may remove vapor when condensation occurs, but a nominal cooling capacity does not guarantee a particular latent capacity at cool, relatively dry entering conditions. Ask for actual operating maps, airflow, pressure, and minimum modulation.</p><p>A standalone condensing dehumidifier removes liquid condensate and normally returns warm air to its room. Its heat may displace heating or increase cooling demand. A cooling system with heat rejected outdoors has a different energy boundary. Reheat after a dehumidifying coil can avoid overcooling; recovered condenser heat can help, but is not both rejected outside and fully delivered inside at the same instant.</p><p>For an illustrative dark-period problem, suppose dry-bulb temperature is satisfactory but crop vapor continues. A temperature-only cooling controller may shut off. Separate moisture demand can call a dehumidifier or a cooling-and-reheat process, subject to capacity and safety limits. <a href="${evaluation}">The evaluator’s equipment balance</a> explains this sensible/latent coupling; it does not turn a generic mini-split or dehumidifier label into a verified moisture-removal curve.</p>`,
      },
      {
        id: "recovery-doas",
        title:
          "Recovery saves a gradient; it can also return unwanted moisture",
        html: `<p>An HRV primarily exchanges sensible heat between exhaust and incoming air. An ERV also transfers moisture. In hot-humid weather, transferring some incoming vapor toward a drier exhaust stream can reduce ventilation load. In a drying purge, moisture recovery can instead return part of the water you intended to expel. Compare actual entering and leaving states and bypass modes, not only rated “efficiency.”</p><p>Recovery devices have fan pressure drops, leakage or carryover risks, condensate requirements, and frost-protection behavior. Balanced airflow and contamination requirements matter. A sensible-only teaching abstraction is not a guarantee that a real HRV has zero moisture transfer under every condensing condition. Ask suppliers for maps at relevant airflows and conditions, including frost and part-load operation.</p><p>A DOAS conditions the outdoor-air stream separately from recirculating zone systems. It can make ventilation more predictable, but it is not automatically a crop dehumidifier. The delivered water-removal capacity is dry-air flow times the difference between zone and supply humidity ratios. If required ventilation flow is small relative to crop moisture release, another sink may be necessary. The <a href="${components}">recovery/DOAS component notes</a> distinguish topology and assumed performance from measured equipment selection evidence.</p>`,
      },
      {
        id: "desiccants-resources",
        title: "Desiccants move the burden to regeneration",
        html: `<p>A desiccant captures water using a sorbent rather than relying only on a cold condensing surface. The sorbent must be regenerated, usually with a thermal input. Drying and regeneration can introduce sensible heat, fans and pumps need power, and a downstream cooling process may still be required. A claimed low compressor demand is not the same as low total purchased energy.</p><p>Solid and liquid systems have different maintenance and containment considerations. Liquid desiccants require attention to concentration control, materials compatibility, carryover prevention, and water handling. Waste heat can be useful only if its temperature, timing, quantity, delivery cost, and competing uses are appropriate. Declare those assumptions rather than assigning free regeneration heat by default.</p><p>Compare a desiccant option with condensing dehumidification and controlled ventilation on the same crop band, weather intervals, moisture demand, and heat-rejection boundary. Include regeneration fuel, fan/pump electricity, water treatment, service skill, cleaning, and replacement costs. <a href="${evaluation}">The equipment-screen evidence ladder</a> allows conditional comparisons; it does not establish a generic desiccant advantage in every humid or cold climate.</p>`,
      },
      {
        id: "causal-sequence",
        title: "A causal sequence uses what is known now",
        html: `<p>Begin each control cycle with valid sensor states, actuator availability, and hard constraints. Calculate separate requests for temperature, moisture, light, and permitted ventilation. Choose among feasible modes; then let reliable local loops track their assigned commands. Record why a mode was selected. A causal controller uses current and past measurements, plus explicitly available forecasts if configured—not tomorrow’s measured weather hidden in the simulation.</p><ol><li><strong>Protect:</strong> honor freeze, overtemperature, wind/rain closure, water, fire, pressure, and personnel safeguards. Preserve required ventilation and applicable safety systems independently of a teaching optimizer.</li><li><strong>Use favorable exchange:</strong> check supply temperature and humidity ratio, available airflow, CO₂ loss, and heating penalty before calling an outdoor-air or pad mode.</li><li><strong>Fill the remaining demand:</strong> stage heating, cooling, and moisture removal within real capacity. Coordinate reheat only when the declared drying process needs it; do not let unrelated loops heat and cool blindly.</li><li><strong>Return deliberately:</strong> use different entry and exit thresholds, minimum run/rest times, and rate limits so noise does not chatter compressors, valves, vents, or screens.</li></ol><p>An illustrative heating call below ${t(20)} and cooling call above ${t(24)} leaves a ${t(4, { difference: true })} thermal separation. It is an example of non-overlap, not a recommended band. Moisture control may legitimately require a cooling-and-reheat mode within that band. The <a href="${evaluation}">causal staged-control discussion</a> separates implementable sequencing from idealized hindsight or optimistic capability experiments.</p>`,
      },
      {
        id: "condensation-commissioning",
        title: "Commission the transitions, not just the steady state",
        html: `<p>A screen closes, lamps switch off, and leaves cool while water release continues. A room-average RH value can lag the local surface risk. Monitor dewpoint together with representative leaf and cold-surface temperatures, sensor uncertainty, and crop-zone air distribution. Gradual screen reopening may avoid a cold roof-space air dump, but its timing and gaps require site commissioning, not a universal internet recipe.</p><p>Prove each intended mode with measurements: outside/inside/supply air states, actual dry-air flow or compatible volumetric flow and density, condensate collection, electrical/fuel input, actuator feedback, and the achieved zone response. Test sensor failure, blocked filters, empty water supply, loss of communications, and equipment lockout. Use safe, authorized procedures and independent protective systems; do not disable safety interlocks to reproduce a classroom scenario.</p><p>Trend transitions around lights-on/off and weather changes, not just daily averages. Check spatial variation and calibrate sensors at relevant humidity and temperature. A command to run a fan is not evidence of airflow; a compressor command is not evidence of delivered latent capacity. The <a href="${evaluation}">site-calibrated evidence tier</a> requires held-out facility measurements before claiming predictive performance.</p>`,
      },
      {
        id: "economics-boundary",
        title: "Buy a defensible capability, not the best headline",
        html: `<p>Separate installed capital, observed-period energy and water cost, annual maintenance, and replacement life. Include demand charges, time-of-use tariffs, fuel conversion efficiency, water treatment and discharge, and backup requirements where applicable. A partial-year run does not become annual cost by changing its label. A cheaper alternative that misses the crop band more often is not directly comparable without an explicit value assigned to the lost service.</p><p>In the <a href="${evaluator}">external site evaluator</a>, manually define one facility and duplicate it before changing one equipment option. Compare separate temperature and moisture excursions, joint attainment, DLI deficits, and runtime—not only a cost total. Then vary a uncertain crop moisture or equipment-performance assumption and see whether the apparent preference changes. Record the tool’s model version and evidence tier with your result.</p><p>Do not import the evaluator’s historical regional ranking as a global purchase recommendation. Its <a href="https://github.com/vhark/cea-psychrometric-site-evaluator/blob/main/docs/REGIONS.md">regional study</a> covers six US sites and a stated greenhouse/model boundary, not all fourteen atlas locations, opaque rooms, local tariffs, or current manufacturer products. Professional mechanical, structural, electrical, fire, occupational, and food-safety review remains outside this learning module.</p>`,
      },
    ],
    takeaway:
      "Define the heat and water paths, verify equipment at the actual entering conditions, and commission a causal sequence that coordinates demands without bypassing protective limits.",
    quiz: {
      question:
        "A room meets its temperature band at lights-off but moisture rises. Which response best addresses the physical problem?",
      options: [
        "Lower the temperature setpoint until the thermostat runs continuously, without checking crop limits.",
        "Treat RH reduction from heating as proof that water has left the room.",
        "Enable a verified moisture-removal process, coordinate any required cooling/reheat, and check condensate and delivered conditions.",
        "Increase recirculation alone and assume that water has been exhausted.",
      ],
      answer: 2,
      explanation:
        "The room needs a real water sink. A separate moisture request can coordinate a process that removes vapor while respecting temperature constraints. Heating and recirculation alone do not export water.",
    },
    source:
      "Equipment, conservation, and causal-control boundaries: evaluator EVALUATION.md and COMPONENT-PARAMETERS.md. Control thresholds are teaching examples, not commissioned setpoints.",
  },
  {
    id: "global-climates",
    number: "06",
    title: "Fourteen places. Seven starting questions.",
    shortTitle: "Read climates without stereotypes",
    subtitle:
      "Regional labels orient you. Weather, crop, building, and local resources decide.",
    minutes: 12,
    category: "Global comparisons",
    icon: "sun",
    intro:
      "Use these pairs as hypotheses to investigate, not biome classifications or equipment prescriptions. Each location represents a study coordinate, not an entire city or country. Start with the same crop and facility assumptions, then ask why the counterparts might diverge.",
    objectives: [
      "Compare all fourteen atlas locations without transferring one local solution to its partner.",
      "Account for hemisphere, highland pressure, seasonal moisture, and crop/facility differences.",
      "State which weather and local resource evidence would confirm or overturn each hypothesis.",
    ],
    sections: [
      {
        id: "hot-dry",
        title: "Hot-dry: Phoenix and Marrakech",
        html: `<p>The starting hypothesis is that periods with a large dry-bulb/wet-bulb separation may offer direct evaporative cooling, while strong solar gain can still overwhelm a limited supply-air flow. Neither “dry” nor a low annual RH proves that pads can maintain the crop’s moisture and temperature band throughout a season. Water availability and water quality may constrain a thermodynamically attractive option.</p><p><strong>Phoenix:</strong> examine whether summer moisture episodes interrupt otherwise favorable pad conditions and whether hot nights reduce recovery time. <strong>Marrakech:</strong> separately inspect the day/night and seasonal pattern at its coordinate; do not copy Phoenix’s seasonal calendar, pressure, or heat extremes. A sheltered peri-urban greenhouse and the atlas grid can differ in wind and temperature exposure.</p><p>For each site, select the hot coincident example in the <a href="${atlas}">real 2024 atlas</a>, then manually enter its temperature, RH, and pressure in the <a href="${labUrl("climate-design", "outdoor-air")}">outside-air lab</a> to compare outdoor and pad-leaving states. The lab does not simulate crop transpiration or whole-facility attainment. Hold those additional load assumptions fixed in your design brief. Ask for local water allocation, salinity, bleed-off disposal, pump reliability, electricity tariffs, and a measured airflow path before favoring a pad system. A cool-season greenhouse crop and a year-round opaque leafy-green room may reach opposite conclusions at the same site. These are design hypotheses, not computed annual rankings.</p>`,
      },
      {
        id: "hot-humid",
        title: "Hot-humid: Miami and Singapore",
        html: `<p>The starting hypothesis is that high outdoor vapor content can limit ventilation drying and narrow evaporative-cooling relief. Sensible shade can reduce heat gain without creating a water sink. A relatively cool humid night may be more challenging for latent control than a hotter afternoon with strong temperature-driven cooling runtime.</p><p><strong>Miami:</strong> investigate seasonal changes and cooler-air episodes instead of declaring every hour unusable for outdoor-air relief. Storm exposure, wind-driven rain, and recovery after outages need local engineering evidence beyond the selected atlas variables. <strong>Singapore:</strong> examine how consistently warm and moisture-rich states occur across the record, rather than importing Miami’s winter assumptions. Near-equatorial daylight patterns also differ from Miami’s seasonal light schedule.</p><p>Use the <a href="${atlas}">atlas</a> to compare temperature and humidity-ratio summaries. Manually transfer a warm coincident example’s temperature, RH, and pressure to the <a href="${labUrl("climate-design", "air-state")}">air-state lab</a> to calculate its dewpoint and wet bulb; these derived properties are not atlas seasonal displays. Then apply a separate crop water balance. Evaluate water removal and heat rejection together; do not assume “more ventilation” or a dehumidifier with warm discharge resolves both. Local cooling-water access, condensate reuse quality, electricity charges, biosecurity, and maintenance support require independent evidence. The <a href="${evaluation}">evaluator’s validation limits</a> warn that an assumption-based hot-humid simulation is not empirical greenhouse validation.</p>`,
      },
      {
        id: "mediterranean",
        title: "Mediterranean context: Almeria and Cape Town",
        html: `<p>The starting hypothesis is a changing balance between bright, dry-season cooling demands and cooler-season heat and moisture management. A crop calendar can be as influential as an equipment upgrade: seasonal production and year-round delivery are different briefs. The <a href="${fao}">FAO Mediterranean guide</a> is useful context for integrated site, greenhouse, crop, and water decisions—not proof that every Mediterranean-labelled site needs the same covering or control system.</p><p><strong>Almeria:</strong> inspect the coastal study point’s humidity and nighttime conditions rather than substituting an inland “dry Spain” assumption. Check whether shading that relieves summer heat sacrifices valuable light during the intended production period. <strong>Cape Town:</strong> reverse the seasonal calendar relative to Almeria and examine its own coastal exposure and local terrain. January cannot be assigned the same crop-night heating expectation at both sites.</p><p>Compare monthly states in the <a href="${atlas}">atlas</a>, then ask what water restrictions, water treatment, local electricity reliability, wind design, and labor availability apply to the actual property. A broad regional resemblance does not establish equal resource costs. A screen or pad decision should survive both the crop-light budget and the water budget, with the counterpart analyzed independently.</p>`,
      },
      {
        id: "maritime",
        title: "Cool-maritime: Westland and Seattle",
        html: `<p>The starting hypothesis is that cool outside air can often offer a drying direction after warming even when its RH is high. That does not make unlimited winter ventilation economical. A dense crop under a closed energy screen may still need an intentional moisture sink, while winter light availability can govern lamp energy and canopy productivity.</p><p><strong>Westland, Netherlands:</strong> examine the chosen coordinate rather than treating the region’s sophisticated greenhouse infrastructure as a property of the weather. Availability of heat networks, CO₂ sources, and specialist service is a site/business question. <strong>Seattle:</strong> separately inspect seasonal dry and warm periods and occasional heat events; do not copy a Dutch crop schedule or assume identical summer moisture and light conditions.</p><p>In the <a href="${atlas}">atlas</a>, compare monthly humidity ratio, temperature, and solar energy; inspect RH in the coincident example hours rather than inferring it from monthly means. For a warm example, manually transfer temperature, RH, and pressure to the <a href="${labUrl("climate-design", "air-state")}">air-state lab</a> to examine wet bulb. The atlas does not provide seasonal wet-bulb summaries. Then reason through whether sensible recovery could reduce purge heating, or moisture recovery could return unwanted vapor; these are process questions, not a recovery simulation in the lab. A greenhouse with supplemental lights and an opaque multi-tier room can have very different sensible-to-latent ratios. The <a href="${components}">recovery and envelope evidence register</a> is a guide to questions, not a generic equipment recommendation for either place.</p>`,
      },
      {
        id: "cold-winters",
        title: "Cold winters: Montreal and Fairbanks",
        html: `<p>This pair groups a design concern, not one climate type. The starting hypothesis is that cold replacement air can remove moisture but impose substantial heating and frost-management demands. Strong enclosure performance, reliable heat, condensate handling, and recovery-device frost strategies become important questions. Summer and shoulder-season cooling must still be checked.</p><p><strong>Montreal:</strong> treat continental winter and warmer-season moisture as separate operating regimes. A heat-only annual narrative can miss summer latent demands. <strong>Fairbanks:</strong> examine subarctic cold and very different seasonal daylight duration; transplanting Montreal’s heating plant assumptions or light schedule is not justified. Available low-temperature equipment capacity and backup fuel/utility arrangements need real product and site evidence.</p><p>Use the <a href="${atlas}">atlas</a> for an initial comparison, but do not size freeze protection from one year’s lowest modeled hour. Check cold-state moisture conventions, multiple-year extremes, defrost, snow and structural criteria, outages, and local operating skill. The <a href="${components}">heat-pump evidence discussion</a> distinguishes rating points from unverified extrapolations. A published cold-weather COP point is neither a complete curve nor proof of delivered capacity during defrost.</p>`,
      },
      {
        id: "highlands",
        title: "Tropical highlands: Nairobi and Bogota",
        html: `<p>The starting hypothesis is that elevation can moderate dry-bulb temperature without eliminating solar, nighttime, or moisture challenges. “Near the equator” does not imply hot lowland air. Pressure must remain part of every psychrometric and airflow comparison: equal temperature and RH at lower pressure give a different humidity ratio, and equal volumetric flow carries a different dry-air mass.</p><p><strong>Nairobi:</strong> investigate its own seasonal moisture and day/night pattern, including the actual elevation represented by the returned weather location. <strong>Bogota:</strong> repeat that process rather than copying Nairobi’s pressure, rainfall calendar, or light assumptions. Both are highland contexts, but they are not equal-altitude, equal-cloud, or equal-moisture controls for an experiment.</p><p>Compare the <a href="${atlas}">atlas</a> pressure and weather metadata first, then recreate a representative air state in the <a href="${labUrl("climate-design", "air-state")}">air-state lab</a>. Change only pressure to isolate the calculation effect; afterward restore the actual states for site comparison. Request local station evidence in complex terrain, crop light measurements, reliable water supply, and installed fan performance. A sea-level fan or moisture assumption can distort an otherwise careful comparison.</p>`,
      },
      {
        id: "monsoonal",
        title: "Monsoonal: Mumbai and Chiang Mai",
        html: `<p>The starting hypothesis is that the preferred air-side process can reverse with seasonal moisture. A hot dry-period condition may accept evaporation, while a humid period offers little pad depression and limited ventilation drying. A single annual average can hide that reversal and encourage a system that performs well only during the easy part of the year.</p><p><strong>Mumbai:</strong> examine the coastal record’s persistent moisture and monsoon transition rather than assuming a dry interior climate. <strong>Chiang Mai:</strong> investigate its inland seasonal pattern independently, including pressure and hot-period differences. Air quality and smoke may restrict outside-air use even when the thermodynamics look favorable; the atlas does not supply an air-quality clearance for either location.</p><p>Compare month-by-month temperature and moisture states in the <a href="${atlas}">atlas</a>, then define seasonal operating modes and what capacity must remain during the humid constraint period. Request local water quality, storm resilience, filtration pressure drop, electrical tariffs, and maintenance evidence. For all seven pairs, conclude with a conditional sentence: “Given this crop, building, and measured constraint, this process deserves further evaluation.” Regional labels open the inquiry; they do not close it.</p>`,
      },
    ],
    takeaway:
      "A location pair is a prompt for comparison, not a transferable equipment recipe. Preserve pressure, calendar, crop, facility, and local-resource differences, then let traceable weather and measurements challenge the hypothesis.",
    quiz: {
      question:
        "Nairobi and Bogota have similar dry-bulb and RH values in two selected hours. What can you safely conclude?",
      options: [
        "They have identical humidity ratios and identical capacity per cubic meter of supply air.",
        "Those two properties alone do not establish equal mass-balance performance; use each location’s pressure and airflow basis, then examine the rest of the record.",
        "A shared highland label establishes identical equipment requirements.",
        "Their annual light and water costs must be similar because both are near the equator.",
      ],
      answer: 1,
      explanation:
        "Pressure changes humidity ratio and air density. Two selected hours also do not establish annual patterns, crop loads, local utility costs, or equipment capability.",
    },
    source:
      "Regional sections are qualitative design hypotheses, to be tested against the 2024 ERA5/Open-Meteo atlas and local evidence. FAO supplies Mediterranean context, not a global ranking.",
  },
  {
    id: "design-capstone",
    number: "07",
    title: "Make a decision you can explain—and revise.",
    shortTitle: "Build a climate design brief",
    subtitle:
      "Fix the brief, compare alternatives, and identify the evidence that would change your choice.",
    minutes: 12,
    category: "Applied capstone",
    icon: "book",
    intro:
      "Your deliverable is not a shopping list. It is a traceable design brief: what the crop needs, what the site offers, what each alternative can plausibly do, and which measurements are still required before committing to equipment.",
    objectives: [
      "Complete a worked screening decision with explicit crop, geometry, light, and moisture assumptions.",
      "Compare alternatives on joint physical service and a consistent economic boundary.",
      "Use an acceptance rubric and evidence checklist to preserve uncertainty and unresolved engineering decisions.",
    ],
    sections: [
      {
        id: "freeze-the-brief",
        title: "Step 1: freeze the assumptions before comparing options",
        html: `<p>Our <strong>illustrative teaching brief</strong> is a 500 m² single-layer greenhouse with 400 m² of productive leafy-green canopy, 800 m² of exterior assembly, and 2,000 m³ of crop-zone volume. Assume a whole-assembly U of 4 W/(m²·K), a 16-hour permitted light window, and a canopy DLI objective of 14.4 mol/(m²·day). Geometry, U, crop choice, and light objective are invented for the exercise—not a specification for a real cultivar or building.</p><p>For this screen, hold an air band of ${t(22)}–${t(26)} and a maximum humidity ratio of 0.012 kg/kg. Require a positive leaf-to-dewpoint margin and make its commissioned allowance an explicit unresolved agronomic/measurement decision. A complete project also needs a lower moisture or leaf-VPD bound, root-zone requirements, CO₂ policy, crop-stage schedules, and allowable excursion duration; this exercise does not pretend those have been engineered.</p><p>Assume vapor release G = 0.002 kg/s for a base-case snapshot, with lower and higher sensitivity cases to be justified by measurements. That is 7.2 kg/h across the assumed canopy. Freeze the same assumptions for every equipment alternative. Choose Seattle as an initial atlas study location, with Miami as a relocation sensitivity—not because either is a preferred project site. <a href="${evaluation}">The evidence ladder</a> calls this an assumption-based screen, not a calibrated prediction.</p>`,
      },
      {
        id: "screen-weather",
        title: "Step 2: use weather evidence without manufacturing a result",
        html: `<p>Open the <a href="${atlas}">climate atlas</a>, select Seattle, and record the 2024 source and coverage. Identify cool-season drying questions, warm-season cooling questions, and periods of unfavorable moisture. Then repeat for Miami without changing the crop band. Report what the actual displays say; do not infer an annual equipment-compliance percentage from the regional lesson’s prose.</p><p>For transparent arithmetic, use a <em>separate synthetic snapshot</em> at 101,325 Pa: outside air at ${t(20)}, indoor air at ${t(25)}, and supply humidity ratio 0.008 kg/kg. The envelope heat-loss term is 4 × 800 × 5 = 16 kW. With target W = 0.012 kg/kg and G = 0.002 kg/s, ventilation alone needs at least 0.5 kg dry air/s for the steady moisture balance. Heating that flow through ${t(5, { difference: true })} adds roughly 2.5 kW using a rounded dry-air heat capacity of 1,000 J/(kg·K).</p><p>The combined 18.5 kW is only those two simplified heat-loss terms. It excludes solar and internal gains, moist-air heat-capacity refinement, ground transfer, transient storage, actual flow distribution, and other losses. It is not heater sizing and is not a measured Seattle hour. The worked result shows why a drying opportunity can carry a thermal penalty. Repeat the water balance with supply W = 0.011 kg/kg: required flow rises to 2 kg/s, increasing the corresponding sensible exchange fourfold to approximately 10 kW under the same temperature assumption. Both supply moisture values are below saturation at the stated outside temperature and pressure.</p>`,
      },
      {
        id: "alternatives",
        title: "Step 3: compare processes, not prestige",
        html: `<table><caption>Three alternatives for the same frozen brief</caption><thead><tr><th scope="col">Alternative</th><th scope="col">What it can address</th><th scope="col">What remains to prove</th></tr></thead><tbody><tr><th scope="row">A · Improved envelope, controlled ventilation, heat, optional pad</th><td>Reduce heat transfer; exploit favorable dry/cool air and dry-weather evaporation.</td><td>Airflow through screens, wet-season moisture sink, heating during purge, water supply, and joint target failures.</td></tr><tr><th scope="row">B · Same envelope plus condensing dehumidification and cooling</th><td>Provide an explicit vapor sink when exchange is insufficient.</td><td>Removal at actual entering conditions, returned heat, cooling/reheat coordination, turndown, and maintenance.</td></tr><tr><th scope="row">C · Conditioned outdoor air with recovery plus zone conditioning</th><td>Manage required outside air and recover useful energy while separate zone equipment serves remaining loads.</td><td>Supply moisture capacity, HRV/ERV transfer direction, frost/bypass, pressure drop, leakage, and remaining crop latent demand.</td></tr></tbody></table><p>These are process alternatives, not product bundles or an exhaustive search. A desiccant branch deserves an additional comparison if regeneration heat and service support are documented. Keep envelope and crop assumptions fixed initially; evaluate a better-U or changed-screen branch separately so you can tell whether gains came from the building or the machine.</p><p>At the synthetic dry snapshot, A has a possible ventilation drying path but pays a heat penalty. At a state with supply W at or above the zone ceiling, A lacks that path unless another real sink is added. B introduces a condensate sink but may add sensible heat indoors. C can reduce some ventilation conditioning but still needs enough water-removal capacity. That is a complete conditional comparison—not evidence of an annual winner. Consult <a href="${components}">component evidence and boundaries</a> for inputs that require measured rather than nominal values.</p>`,
      },
      {
        id: "handoff-experiment",
        title: "Step 4: take the brief into a deeper tool",
        html: `<p>Use the three academy labs to audit one property calculation, one supply-state comparison, and one envelope/light tradeoff. Then open the <a href="${evaluator}">external site evaluator</a>. Manually enter the matching assumptions where its interface supports them; record any mismatch rather than pretending the academy scenario was automatically imported. Save the chosen weather period, model version, target schedule, and equipment assumptions with the result.</p><p>Duplicate the scenario for alternatives, changing one process at a time. Compare joint temperature-and-moisture attainment with separate excursions, longest difficult episodes, daily DLI shortfall, water use, and energy components. Use identical eligible periods and missing-data rules. Check whether the modeled controller is causal, where dehumidifier heat goes, and what limits each mode. A favorable total must not hide numerical failure or missing intervals.</p><p>Run a declared low/base/high sensitivity for crop vapor release, envelope U/leakage, and equipment capacity at entering conditions. These are scenarios, not statistical confidence intervals. If the preferred option changes, name the measurement that would resolve the decision. The evaluator’s <a href="${evaluation}">published evaluation status</a> and historical <a href="https://github.com/vhark/cea-psychrometric-site-evaluator/blob/main/docs/REGIONS.md">six-US-site regional study</a> must not be relabeled as validation of this greenhouse or the global atlas.</p>`,
      },
      {
        id: "evidence-checklist",
        title: "Step 5: collect the evidence that can overturn the screen",
        html: `<p>Prioritize measurements by decision impact. A precise tariff calculation cannot rescue an unknown latent capacity. If two alternatives change order when transpiration changes, measure irrigation, drainage, crop growth/storage where relevant, condensate, and air exchange over representative day/night periods to constrain a water balance. Irrigation minus drainage alone is not instantaneous transpiration when substrate storage is changing.</p><ul><li><strong>Site:</strong> multiple weather years, coincident design conditions, local pressure and station comparison, outage history, smoke/storm/wind constraints, water rights and quality.</li><li><strong>Crop and light:</strong> cultivar/stage targets agreed with agronomy, canopy area and leaf area, measured PPFD/DLI, leaf/surface temperatures, and vapor release through light transitions.</li><li><strong>Building:</strong> as-built areas, assembly U and bridges, pressure/leakage evidence, screen and glazing optical data, fan flow under installed resistance, and spatial climate measurements.</li><li><strong>Equipment:</strong> matched capacity/input maps, actual condensate rates, turndown and cycling, low-temperature/frost behavior, maintenance access, redundancy, and heat-rejection topology.</li><li><strong>Economics and compliance:</strong> installed quotes, local energy/water tariffs and demand charges, maintenance labor, replacement lives, permits, worker safety, fire/electrical/refrigerant requirements, and responsible professional review.</li></ul><p>Retain provenance beside each number: measured, manufacturer-tested, extension guidance, model-derived, or explicit assumption. <a href="${sources}">The source register</a> explains why a literature citation is not the same as validation under your boundary conditions.</p>`,
      },
      {
        id: "rubric-decision",
        title: "Step 6: accept the brief, not an unjustified purchase",
        html: `<table><caption>Capstone acceptance rubric: every row must be satisfied or explicitly unresolved</caption><thead><tr><th scope="col">Criterion</th><th scope="col">Acceptable evidence</th><th scope="col">Reject this shortcut</th></tr></thead><tbody><tr><th scope="row">Fixed service</th><td>Same crop, canopy, bands, light schedule, and excursion definition across alternatives.</td><td>Rewarding lower energy because one option grows a different crop or delivers less light.</td></tr><tr><th scope="row">Traceable weather</th><td>Provider/model/year, UTC/interval conventions, pressure and coverage, plus next-stage multi-year/design evidence.</td><td>Calling one year a climate normal or combining independent percentiles as an observed event.</td></tr><tr><th scope="row">Conserved heat and water</th><td>Explicit vapor sources/sinks, dry-air flow basis, and equipment heat destination.</td><td>Free dehumidification, unlimited airflow, or double-counted recovered heat.</td></tr><tr><th scope="row">Implementable operation</th><td>Causal sequence, real capacities, deadbands, fault behavior, and commissioning plan.</td><td>Hindsight optimization presented as installed control performance.</td></tr><tr><th scope="row">Honest comparison</th><td>Joint service and separate failures, consistent costs, sensitivity, and unresolved decisions.</td><td>A single cost total or generic regional product winner.</td></tr></tbody></table><p>Our worked conclusion is deliberately conditional: retain A as a baseline, investigate B’s measured moisture capacity, and evaluate C only with a defined outdoor-air requirement and recovery behavior. No alternative has earned procurement approval. The synthetic calculations expose ventilation heat cost and the shrinking moisture gradient; the atlas supplies real weather context, not indoor performance. This is a useful finished screen precisely because it identifies what it cannot decide.</p><p>Submit a short decision brief containing the frozen assumptions, two coincident weather examples from actual data, the worked heat/water balance, alternatives, evidence checklist, proposed control sequence, and the unresolved purchase decision. State who must resolve crop tolerance, safety, structural and mechanical sizing, tariff uncertainty, and backup operation. A defensible next step is a measurement or professional design task—not a more confident claim than the evidence permits.</p>`,
      },
    ],
    takeaway:
      "A good design brief makes assumptions reproducible, alternatives comparable, and unresolved decisions actionable. The result is a justified next step—not a simulated promise of crop performance or equipment savings.",
    quiz: {
      question:
        "Alternative B looks cheapest in one model run, but the preference reverses under a plausible crop moisture assumption. What is the defensible capstone conclusion?",
      options: [
        "Buy B because the base case is the official result.",
        "Average the prices and report the ranking as certain.",
        "Discard the moisture sensitivity because all models are approximate.",
        "Keep the decision unresolved, report the reversal, and prioritize crop water-balance and equipment-capacity evidence before selection.",
      ],
      answer: 3,
      explanation:
        "A ranking that depends on an uncertain, decision-relevant assumption is conditional. Measuring that assumption and checking actual equipment capacity is more valuable than presenting a fragile base case as a purchase recommendation.",
    },
    source:
      "Worked capstone numbers are illustrative assumptions. Workflow and evidence boundaries follow evaluator EVALUATION.md; weather provenance is in the atlas and source register.",
  },
];
