// Educational scenarios are illustrative, not crop recipes or commissioned control settings.
export const chapters = [
  {
    id: "coupled-system",
    number: "01",
    title: "One facility. Many connected systems.",
    shortTitle: "The coupled system",
    subtitle: "Why a climate decision is never just a temperature decision.",
    minutes: 9,
    category: "Foundations",
    intro:
      "A greenhouse or indoor farm is a living system inside a physical system. Change a vent, a light, or an irrigation schedule and several conditions move together—sometimes in opposite directions. Good control starts by seeing those relationships.",
    objectives: [
      "Trace the multiple consequences of one actuator command.",
      "Recognize the different constraints of a greenhouse and an indoor farm.",
      "Separate facility structure, coordinated control, and uncertainty handling.",
    ],
    sections: [
      {
        id: "beyond-setpoints",
        title: "From a setpoint to a decision",
        html: `<p>A thermostat asks whether a measurement is above or below a target. A facility operator has a harder question: <strong>which combination of actions should we take now, given weather, crop state, equipment limits, energy cost, disease risk, and what we do not know?</strong></p><p>Heating, cooling, ventilation, dehumidification, air movement, lighting, irrigation, shading, and CO₂ enrichment affect one another. Controlling each one independently can make every local controller look correct while the whole facility performs poorly.</p><blockquote>The goal is not to make every machine work harder. It is to make the machines work together, in service of the crop.</blockquote><p>The crop is part of the dynamics, not merely something to protect from them. Its canopy changes with growth; it produces moisture through transpiration, modifies airflow, and responds to light and root-zone conditions. Yesterday's useful operating recipe may need adjustment as the crop develops.</p>`,
      },
      {
        id: "vent-consequences",
        title: "Follow one action: opening a roof vent",
        html: `<p>Opening a greenhouse roof vent may lower air temperature. That is only the first link in the chain.</p><ul><li><strong>Moisture:</strong> air exchange may help remove water when outside air is drier. Humid outside conditions and ongoing transpiration can make the result less helpful. Compare moisture conditions, not RH percentages alone.</li><li><strong>CO₂:</strong> ventilation carries enriched air outside, changing the value of continued injection.</li><li><strong>Leaves:</strong> air movement changes convective heat transfer and leaf temperature. The room temperature alone does not reveal leaf-surface condensation risk.</li><li><strong>Water:</strong> changed crop conditions may alter irrigation demand later in the day.</li><li><strong>Energy and exposure:</strong> ventilation may avoid compressor use, but can increase heating demand and change pest or spore movement.</li></ul><p>A controller that sees only temperature cannot weigh all these consequences without additional models or supervisory logic. Coupling is the reason coordination matters—not evidence that the local thermostat is defective.</p><div class="lesson-callout"><strong>Watch the relevant surface.</strong> Dewpoint margin is the difference between leaf or surface temperature and air dewpoint. A comfortable room-average temperature can coexist with a cold, condensation-prone canopy.</div>`,
      },
      {
        id: "reference-greenhouse",
        title: "Reference facility A: a four-bay greenhouse",
        html: `<p>Our greenhouse has four production bays with different crops or stages and a shared central heating loop. Bay equipment includes unit heaters, circulation fans, ridge and sidewall vents, energy and shade curtains, bay-level CO₂, and bench irrigation or fertigation. Cooling might use pad-and-fan equipment or mechanical cooling and dehumidification.</p><p>Its evidence comes from an outdoor weather station, PAR measurements, zone and substrate sensors, and selected leaf-temperature measurements. Each describes a different part of the environment; none alone is a complete picture.</p><ul><li>Ventilation can cool a bay while wasting its enriched CO₂.</li><li>Dehumidification consumes energy while protecting leaf-to-dewpoint margin.</li><li>A shared boiler or chiller forces bays to compete for finite capacity.</li><li>Wind, open doors, and imperfect barriers can make neighboring bays behave differently.</li><li>Crop stage changes which deviations are tolerable and which deserve priority.</li></ul><p>When one bay requests heat, the facility must also ask what that allocation means for the other three. The greenhouse boundary is larger than any one controller's sensor.</p>`,
      },
      {
        id: "reference-indoor",
        title: "Reference facility B: a six-room indoor farm",
        html: `<p>Our indoor farm has six sealed or semi-sealed rooms or stacked grow zones. Dimmable LEDs, fan coils or DX/chilled-water systems, dehumidification equipment, variable-speed recirculation fans, and CO₂ injection shape the climate. Reservoirs, pumps, dosing, UV treatment, and irrigation manifolds support the root zone.</p><p>Dense sensing includes air climate, solution conditions, equipment condition, and energy use. Shared refrigeration or dehumidification capacity links rooms that may otherwise appear independent.</p><ul><li><strong>Lighting is also a load decision:</strong> dimming reduces electricity and heat, but changes daily light integral (DLI) and crop development.</li><li><strong>Moisture follows biology:</strong> latent load changes with transpiration and irrigation events.</li><li><strong>Fans have tradeoffs:</strong> circulation can improve uniformity, but adds heat and electrical demand.</li><li><strong>Averages conceal variation:</strong> rack microclimates can diverge even when a room-average sensor appears acceptable.</li></ul><p>A synchronized lights-on schedule can create a plant-wide capacity problem before any room's local controller has done anything wrong.</p>`,
      },
      {
        id: "three-distinctions",
        title: "Three ideas that work together",
        html: `<table><caption>Three different jobs in advanced CEA control</caption><thead><tr><th scope="col">Idea</th><th scope="col">Question it answers</th><th scope="col">What it does not guarantee</th></tr></thead><tbody><tr><th scope="row">Graph structure</th><td>What is connected to what, by which kind of relationship?</td><td>A controller, a causal proof, or a probability model.</td></tr><tr><th scope="row">Multivariable control</th><td>How should several actuators influence several coupled outcomes together?</td><td>Foresight or uncertainty handling unless those are added.</td></tr><tr><th scope="row">Bayesian methods</th><td>What do we believe, how does evidence change it, and should that change our action?</td><td>Safe equipment control or a complete facility architecture on their own.</td></tr></tbody></table><p>A practical stack combines deterministic safety, fast local loops, estimation, supervisory planning, and governed learning. The graph organizes relationships; a controller selects actions; uncertainty methods help it act responsibly when the model or measurements are imperfect.</p><div class="lesson-callout"><strong>How to use the examples:</strong> all temperatures, RH thresholds, timings, capacities, percentages, and risk probabilities in this course are illustrative source scenarios. They are not universal crop guidance, safety certification, or measured performance claims.</div>`,
      },
    ],
    takeaway:
      "A good facility decision accounts for connected effects, shared limits, and crop state—not just the error on one sensor.",
    quiz: {
      question:
        "A greenhouse temperature loop opens a vent while a CO₂ loop increases injection. What does this most clearly reveal?",
      options: [
        "The CO₂ sensor must be faulty.",
        "Locally reasonable actions can conflict without facility-level coordination.",
        "PID control should be removed from the facility.",
        "A graph automatically resolves the conflict.",
      ],
      answer: 1,
      explanation:
        "Both loops may be responding correctly to their own targets. A supervisor needs to account for ventilation loss and coordinate operating modes; reliable local loops can remain in place.",
    },
    source: "Source outline §§1–2, 3.3, 3.10–3.11, 10, 15",
    lab: "coupling",
  },
  {
    id: "control-evolution",
    number: "02",
    title: "A wider field of awareness",
    shortTitle: "Control evolution",
    subtitle:
      "From simple thresholds to controllers that plan, coordinate, and learn.",
    minutes: 15,
    category: "Foundations",
    intro:
      "Control evolves by widening what a system can see and coordinate: from a schedule, to a local error, to coupled outcomes, future constraints, and uncertain beliefs. These are complementary capabilities—not twelve generations of equipment you must throw away.",
    objectives: [
      "Explain twelve complementary approaches to control.",
      "Distinguish local feedback, anticipation, and predictive planning.",
      "Explain why robust MPC and stochastic MPC handle uncertainty differently.",
    ],
    sections: [
      {
        id: "stages-one-two",
        title: "01–02 · Human judgment and dependable thresholds",
        html: `<details open><summary>01 · Manual and timer-based operation</summary><p>An operator combines observation, forecasts, crop knowledge, and schedules. Greenhouse vents and curtains follow a daily routine; indoor lights and irrigation run at fixed times. This is transparent, inexpensive, and can work well in stable operations.</p><p>The limitations are response speed, operator availability, and repeatability. The reasoning often stays in people's heads rather than becoming an observable model. Manual control is the original supervisory layer, not a mistake to be erased.</p></details><details open><summary>02 · On/off control with hysteresis</summary><p>A sensor crossing a threshold starts equipment; a different threshold stops it. The separation, called <strong>hysteresis</strong>, avoids rapid switching near one boundary. An illustrative humidity rule starts dehumidification above 80% RH and stops below 75% RH; these values are not a crop prescription.</p><p>Discrete staging is easy to commission and troubleshoot, and remains valuable for basic control and fallback. But separate humidistats and thermostats do not know when they are fighting: one can open vents while another adds heat, or cooling can oppose a humidity-driven reheat request.</p></details>`,
      },
      {
        id: "stages-three-four",
        title: "03–04 · Fast reflexes and anticipation",
        html: `<details open><summary>03 · PID control</summary><p>PID continuously adjusts an actuator from current error (<strong>proportional</strong>), accumulated error (<strong>integral</strong>), and change in error or measurement (<strong>derivative</strong>). A chilled-water valve can smoothly regulate coil discharge-air temperature; a fan or pump can maintain a local pressure target.</p><p>This is a fast, familiar tool for a well-defined process. It does not inherently plan for a future tariff, a crop-risk trajectory, or a shared chiller limit. Coupling also complicates tuning.</p><p><strong>Keep good PID loops.</strong> Higher layers should supply targets, limits, and modes to local valve, fan, flow, pressure, and dosing loops—not replace all of them with an optimizer.</p></details><details open><summary>04 · Feedforward and rule-based supervision</summary><p>Feedforward responds to a known disturbance before the controlled variable drifts. Forecast solar gain can trigger shade positioning and reduced heating before a greenhouse gets hot. A scheduled LED ramp can pre-stage dehumidification before transpiration rises.</p><p>Rules add operational policy: permit ventilation-assisted drying when outdoor dewpoint is favorable, increase mixing when a closed curtain coincides with shrinking condensation margin, or reduce lighting during expensive electricity only when DLI and crop constraints allow.</p><p>Rules capture expertise cheaply and explainably. Their weakness is growing interactions: nested exceptions and conflicting priorities become difficult to maintain as conditions multiply.</p></details>`,
      },
      {
        id: "stages-five-six",
        title: "05–06 · Coordinate, then look ahead",
        html: `<details open><summary>05 · Multivariable / MIMO control</summary><p><strong>Multiple-input, multiple-output</strong> control represents several actuators influencing several outcomes. Heat, cooling, ventilation, fans, and CO₂ jointly influence temperature, dewpoint, and CO₂ concentration, while weather and crop transpiration disturb them.</p><p>At sunrise, one coordinated decision can choose curtain retraction, heating, ventilation, circulation, CO₂ timing, and irrigation delay. Indoors, LED output, sensible cooling, latent removal, reheat, and fans belong in the same conversation.</p><p>MIMO reduces fighting loops, but needs identified or engineered dynamics. It is not necessarily predictive and does not automatically handle uncertainty.</p></details><details open><summary>06 · Model Predictive Control (MPC)</summary><p>MPC adds a prediction horizon and constraints. It evaluates future action sequences, chooses a plan, <strong>applies only the first action</strong>, then remeasures and replans.</p><ol class="step-list"><li>Estimate current conditions.</li><li>Forecast weather, crop load, and other disturbances.</li><li>Predict trajectories for candidate actions.</li><li>Optimize within equipment, resource, and crop limits.</li><li>Apply the first action and repeat with new evidence.</li></ol><p>A greenhouse MPC may plan a bounded heat-and-vent sequence rather than chase RH oscillations. An indoor MPC may shift allowable light delivery away from a tariff peak while preserving DLI and refrigeration capacity. It depends on model quality, valid data, a solver, and a safe fallback—not just an attractive dashboard.</p></details>`,
      },
      {
        id: "stages-seven-eight",
        title: "07–08 · Value and uncertainty",
        html: `<details open><summary>07 · Economic MPC</summary><p>Economic MPC optimizes an operating objective rather than treating all setpoint errors as equally costly. It can account for fuel, electricity, demand charges, CO₂ loss, compressor starts, crop quality, crop-cycle delay, and the different value of production bays.</p><p>A premium basil room, a more flexible lettuce room, and a trial cultivar need not receive identical capacity allocations. Yet economics must include crop loss, food safety, reliability, and operator burden. <strong>Cheap energy use is not the same as a low-cost operation.</strong></p></details><details open><summary>08 · Robust MPC and stochastic MPC</summary><p>These share a stage in the source because both address imperfect forecasts and models. They are distinct strategies.</p><table><caption>Two different treatments of uncertainty</caption><thead><tr><th scope="col">Approach</th><th scope="col">Representation</th><th scope="col">Decision principle</th></tr></thead><tbody><tr><th scope="row">Robust MPC</th><td>Defined bounds on disturbances or model errors.</td><td>Protect constraints across the worst credible conditions inside those bounds.</td></tr><tr><th scope="row">Stochastic MPC</th><td>Probability distributions or weighted scenarios.</td><td>Balance expected performance with explicitly modeled risk constraints.</td></tr></tbody></table><p>In the source's illustrative capacity example, a dehumidifier nominally removes 100 lb/h. A robust plan might allow for only 75 lb/h; a stochastic model might also represent a low-probability 60 lb/h outcome. These are teaching assumptions, not equipment ratings.</p><p>A chance constraint such as a 2°F leaf-to-dewpoint margin with 99% modeled probability is only as credible as its model and calibration. Robust protection costs flexibility; stochastic control needs credible probabilities and a defensible risk policy.</p></details>`,
      },
      {
        id: "stages-nine-ten",
        title: "09–10 · Coordinate the facility, expose its structure",
        html: `<details open><summary>09 · Distributed and hierarchical control</summary><p>Local controllers manage bays or rooms; a higher-level coordinator manages shared utilities. A bay reports heat needed for safe operation, predicted latent load, crop priority, risk, and available flexibility. The coordinator returns capacity allocations, resource price signals, operating envelopes, or curtailment requests.</p><p>For six rooms approaching lights-on together, it can sequence LED ramps and irrigation, reserve dehumidification, and request safe temporary relaxation in flexible rooms. Local PLC control remains available when supervisory optimization fails.</p></details><details open><summary>10 · Graph-structured control</summary><p>A typed graph explicitly represents zones, canopies, sensors, equipment, resources, and objectives, connected through airflow, heat, moisture, electrical supply, measurements, and control authority.</p><p>It exposes why irrigation in Bay 1 may affect humidity in Bay 2, or how a lighting command creates both an immediate electrical load and a delayed refrigeration load. It supports reusable room models, fault tracing, and sparse computation.</p><p><strong>A graph is a structure, not an algorithm.</strong> Rules, PID, MPC, robust optimization, or Bayesian decisions can use it. Drawing a connection does not prove causality, define its dynamics, or guarantee stability.</p></details>`,
      },
      {
        id: "stages-eleven-twelve",
        title: "11–12 · Update beliefs and improve the model",
        html: `<details open><summary>11 · Bayesian estimation and control</summary><p>Bayesian estimation represents uncertain states or parameters as distributions and updates them using evidence. A high RH reading could indicate real moisture, sensor wetting, bias, poor mixing, or degraded dehumidification. Neighboring sensors and equipment telemetry help distinguish these explanations.</p><p>It becomes <strong>Bayesian control</strong> when changed beliefs alter an action: reserve more latent-removal capacity, increase a safety margin, reduce command authority, or inspect a questionable sensor. A fixed graph weight is not enough.</p></details><details open><summary>12 · Learning-based and graph-neural control</summary><p>A learned model can estimate the residual—the difference between physics-based prediction and observed behavior. In a greenhouse it may capture wind effects, door use, curtain leakage, or crop geometry. In repeated indoor racks, graph-based learning can focus on local sensors, adjacent racks, airflow, fixture output, and shared supply conditions.</p><p>Useful applications include crop-load forecasting, soft sensors, fault detection, energy prediction, maintenance prediction, and improved graph parameters. Learned relationships must be evaluated and governed; an unverified model must never bypass independent hard safety.</p></details><div class="lesson-callout"><strong>Evolution means added awareness.</strong> The end state still contains manual authority, deterministic limits, staged equipment, and PID. New capabilities surround dependable foundations rather than making them obsolete.</div>`,
      },
    ],
    takeaway:
      "Advanced control widens awareness across variables, time, resources, and uncertainty while retaining reliable local control and independent protection.",
    quiz: {
      question:
        "Which statement correctly distinguishes robust and stochastic MPC?",
      options: [
        "Robust MPC always uses Bayesian posterior probabilities.",
        "Stochastic MPC ignores hard limits to minimize average cost.",
        "Robust MPC protects against defined bounded cases; stochastic MPC uses distributions or scenarios to quantify risk.",
        "Both are names for adding hysteresis to a PID loop.",
      ],
      answer: 2,
      explanation:
        "Robust MPC plans for credible adverse cases within specified bounds. Stochastic MPC makes probabilities or scenarios explicit and can enforce risk constraints. Neither provides protection beyond the credibility of its assumptions and implementation.",
    },
    source: "Source outline §§3.1–3.12, 15",
    lab: "planning",
  },
  {
    id: "strategy-comparison",
    number: "03",
    title: "Choose a capability, not a buzzword",
    shortTitle: "Compare strategies",
    subtitle:
      "Find the right tool for the question your facility needs to answer.",
    minutes: 10,
    category: "Foundations",
    intro:
      "“More advanced” is not a specification. A useful comparison asks which problem a strategy solves, how it handles coupling and time, what it assumes about uncertainty, and where it belongs in the control stack.",
    objectives: [
      "Compare strategies by scope rather than prestige.",
      "Identify which capabilities can be combined.",
      "Match a facility need to a suitable control layer.",
    ],
    sections: [
      {
        id: "comparison-axes",
        title: "Ask four questions before choosing",
        html: `<ol class="step-list"><li><strong>What is the decision scope?</strong> A valve needs fast regulation; six rooms need resource coordination. The same algorithm is not automatically right for both.</li><li><strong>Does the strategy represent coupling?</strong> Several independent loops are not equivalent to a joint model, even when they share a dashboard.</li><li><strong>Does it look ahead?</strong> A schedule anticipates a known event; MPC compares trajectories over a horizon under constraints. These are different levels of foresight.</li><li><strong>What does uncertainty mean?</strong> Human judgment, engineering margins, bounded error sets, probability distributions, and posterior updates are not interchangeable.</li></ol><p>The source compares thirteen rows because it separates robust and stochastic MPC. Its twelve-stage evolution groups them together, while its twelve-way example ends with a combined Bayesian graph-structured MPC. The counts describe different teaching views, not missing technologies.</p>`,
      },
      {
        id: "foundation-comparison",
        title: "Foundational strategies: reliable, but bounded in scope",
        html: `<table><caption>What basic control strategies contribute</caption><thead><tr><th scope="col">Strategy</th><th scope="col">Useful question</th><th scope="col">Boundary</th></tr></thead><tbody><tr><th scope="row">Manual / timer</th><td>What should normally happen now?</td><td>Context and foresight live with the operator; a timer alone does not adapt.</td></tr><tr><th scope="row">On/off + hysteresis</th><td>Has a threshold been crossed?</td><td>Dependable discrete action, minimal coordination, no inherent forecast.</td></tr><tr><th scope="row">PID</th><td>How should an actuator correct this process error?</td><td>Fast local response, but future tariffs and shared resources lie outside the loop.</td></tr><tr><th scope="row">Feedforward + rules</th><td>Should a known disturbance or policy change action now?</td><td>Partial anticipation and coordination; special cases and conflicts require management.</td></tr></tbody></table><p>These are widely used because they solve real tasks. A plant coordinator may be sophisticated while its compressor staging stays simple and its valve loops remain PID. The question is whether each layer has a clear responsibility and a tested operating envelope.</p>`,
      },
      {
        id: "predictive-comparison",
        title: "Coordinated and predictive strategies",
        html: `<table><caption>From joint actions to risk-aware plans</caption><thead><tr><th scope="col">Strategy</th><th scope="col">Distinct contribution</th><th scope="col">Important qualification</th></tr></thead><tbody><tr><th scope="row">MIMO</th><td>Jointly controls multiple coupled outputs with multiple inputs.</td><td>Not necessarily predictive or uncertainty-aware.</td></tr><tr><th scope="row">MPC</th><td>Plans future actions under constraints and replans with measurements.</td><td>Uncertainty treatment is optional, not implied by the name.</td></tr><tr><th scope="row">Economic MPC</th><td>Optimizes operating, resource, and production value.</td><td>A poor objective can reward crop damage or excessive intervention.</td></tr><tr><th scope="row">Robust MPC</th><td>Protects against bounded adverse disturbances and errors.</td><td>Conservatism can reduce economic flexibility.</td></tr><tr><th scope="row">Stochastic MPC</th><td>Balances expected performance and quantified risk.</td><td>Needs defensible probability estimates or scenarios.</td></tr><tr><th scope="row">Distributed MPC</th><td>Coordinates local predictive controllers and scarce shared resources.</td><td>Uncertainty is optional; allocation and local resilience must be engineered.</td></tr></tbody></table><p>MIMO describes the multiple-input, multiple-output problem. MPC describes a planning method. Economic describes the objective. Robust and stochastic describe uncertainty treatments. Distributed describes the division of decisions. Several of these labels can truthfully apply to one system.</p>`,
      },
      {
        id: "architecture-learning-comparison",
        title: "Structure, belief, and learning are different dimensions",
        html: `<table><caption>Three complementary modeling capabilities</caption><thead><tr><th scope="col">Strategy</th><th scope="col">Main contribution</th><th scope="col">Do not assume</th></tr></thead><tbody><tr><th scope="row">Graph-structured control</th><td>Explicit typed facility relationships, modularity, and traceable dependencies.</td><td>That it predicts, controls, or represents probabilities by itself.</td></tr><tr><th scope="row">Bayesian control</th><td>Updated beliefs influence actions under consequential uncertainty.</td><td>That it handles all coupled variables or looks ahead without a suitable controller.</td></tr><tr><th scope="row">Graph-neural MPC</th><td>Learned local graph dynamics improve the prediction used for planning.</td><td>That uncertainty is automatically calibrated or learned actions can bypass safety.</td></tr></tbody></table><p>The source describes graph-neural MPC as research through early adoption, and Bayesian control as selectively useful. That is not a promise of readiness for a particular facility. A reusable typed graph can be valuable long before a facility needs graph-neural learning.</p><div class="lesson-callout"><strong>One legitimate combination:</strong> local PID tracks equipment targets; distributed economic MPC allocates room capacity; a typed graph describes dependencies; a Bayesian estimator updates uncertain transpiration; independent interlocks limit every command.</div>`,
      },
      {
        id: "choose-next-capability",
        title: "Choose the next capability from the actual bottleneck",
        html: `<div class="example-pair"><div class="example-card"><strong>Problem: a valve hunts around its target.</strong><p>Investigate local instrumentation, actuator behavior, and loop tuning. A facility graph or Bayesian layer is not a substitute for a trustworthy local process.</p></div><div class="example-card"><strong>Problem: all rooms demand cooling together.</strong><p>Independent local loops cannot allocate finite refrigeration. Add plant-level resource coordination and, where justified, predictive scheduling.</p></div></div><div class="example-pair"><div class="example-card"><strong>Problem: a high RH reading may be sensor wetting.</strong><p>Improve evidence, redundancy, sensor health, and state estimation. More aggressive optimization on the same untrusted measurement can make the wrong action more confident.</p></div><div class="example-card"><strong>Problem: changing one bay breaks a monolithic model.</strong><p>Make physical and operational dependencies explicit with typed, reusable graph components. Do not assume a neural network is required.</p></div></div><p>A strategy earns its complexity when it resolves a demonstrated problem. Preserve what works, make unknowns visible, and commission a bounded next layer rather than buying an all-purpose label.</p>`,
      },
    ],
    takeaway:
      "The best combination is the one that covers your actual coordination, planning, uncertainty, and maintainability needs without discarding dependable foundations.",
    quiz: {
      question:
        "A supplier says its facility model is graph-structured. Which capability can you safely infer from that claim alone?",
      options: [
        "It updates Bayesian posteriors after each measurement.",
        "It optimizes future electricity cost.",
        "It guarantees closed-loop stability.",
        "It represents entities and their relationships explicitly.",
      ],
      answer: 3,
      explanation:
        "Graph structure organizes entities and relationships. Prediction, optimization, probabilistic inference, and stability each require additional models, algorithms, and evidence.",
    },
    source: "Source outline §§3.5–3.12, 4, 9–10",
  },
  {
    id: "twelve-ways",
    number: "04",
    title: "One humidity surge. Twelve responses.",
    shortTitle: "Twelve ways to control",
    subtitle:
      "Hold the problem constant and watch the scope of the decision change.",
    minutes: 13,
    category: "Systems thinking",
    intro:
      "The lights are about to rise, the canopy is dense, and dehumidification is nearly at capacity. By applying twelve approaches to the same room, we can see exactly what each one adds—and what remains outside its view.",
    objectives: [
      "Explain twelve distinct responses to a lights-on humidity surge.",
      "Follow the tradeoff between climate, DLI, capacity, and energy.",
      "Distinguish uncertain evidence from a confirmed need for aggressive action.",
    ],
    sections: [
      {
        id: "same-scenario",
        title: "The room before lights-on",
        html: `<p>In this illustrative leafy-greens room, LEDs will ramp from 20% to 100% over 30 minutes. Transpiration is expected to increase. The high-density canopy has uneven airflow, the room is near its latent-removal limit, and one RH sensor reads higher than nearby sensors.</p><p>Meanwhile, the farm must deliver its daily light target and faces a later utility-demand peak. Simply dimming until RH falls is not a complete solution: light deferred now still has to fit into the permitted photoperiod, without creating another cooling peak.</p><ul><li><strong>Physical question:</strong> can the equipment remove the coming heat and moisture?</li><li><strong>Crop question:</strong> can we preserve a safe leaf climate and the light program?</li><li><strong>Facility question:</strong> what capacity do other rooms need?</li><li><strong>Evidence question:</strong> is the high RH reading representative?</li></ul><div class="lesson-callout">The numbers below reproduce illustrative teaching conditions. They are not validated setpoints, universal risk thresholds, or promised outcomes.</div>`,
      },
      {
        id: "responses-one-three",
        title: "01–03 · Observe, switch, regulate",
        html: `<ol class="step-list"><li><strong>Manual control.</strong> The operator watches RH and temperature, starts extra dehumidification, increases fans, and may reduce lights. Human context is valuable, but timing and economic coordination depend on the person being available and consistent.</li><li><strong>On/off control.</strong> An example rule starts a second dehumidifier stage above 80% RH and reduces lights above 85%. It is understandable and dependable, but can produce abrupt cycling. It also cannot tell whether the triggering sensor is biased or reflects the whole room.</li><li><strong>PID control.</strong> A humidity loop smoothly raises dehumidification, a temperature loop adjusts cooling, and a fan loop holds pressure. Each device responds better locally, but the loops may still conflict through fan heat, reheat, lighting, and latent load.</li></ol><p>Notice the boundary: smoother actuator motion does not mean the room has a coordinated plan. Local feedback remains useful even when later strategies add supervision.</p>`,
      },
      {
        id: "responses-four-six",
        title: "04–06 · Anticipate, coordinate, plan",
        html: `<ol class="step-list" start="4"><li><strong>Rule-based supervisory control.</strong> A rule recognizes rising light output and RH trend, then stages dehumidification and fans early. Another caps lighting only if the remaining DLI can still be delivered. This anticipates a familiar event; crop changes and equipment differences create more special cases to manage.</li><li><strong>MIMO control.</strong> One model recognizes that LEDs, cooling, dehumidification, fans, and irrigation jointly influence temperature and humidity. It selects coordinated movements instead of allowing independent loops to fight. Without a forecast horizon, however, the decision may remain near-term.</li><li><strong>MPC.</strong> An illustrative 90-minute forecast predicts the surge. The plan pre-stages dehumidification, improves circulation, slows the final part of the LED ramp, delays an optional irrigation pulse, and retains reserve for the next transpiration increase. Only the first action is applied before new measurements trigger replanning.</li></ol><p>The jump from rules to planning is not “more if statements.” It is comparing candidate trajectories against future constraints. A useful prediction also needs to account for actuator delay, crop response, and actual available capacity.</p>`,
      },
      {
        id: "responses-seven-nine",
        title: "07–09 · Add value, bounds, and probabilities",
        html: `<ol class="step-list" start="7"><li><strong>Economic MPC.</strong> Add utility demand, DLI completion, crop priority, and equipment wear to the objective. A slower LED ramp now may avoid a later coincident refrigeration peak. The controller must still account for quality and production consequences, not optimize the electricity meter alone.</li><li><strong>Robust MPC.</strong> The source's example allows transpiration to be 20% above prediction and dehumidifier capacity 15% below nominal. Preventive action starts earlier to protect the defined adverse cases, at the cost of energy or flexibility. Those margins are scenario assumptions, not universal derating factors.</li><li><strong>Stochastic MPC.</strong> Evaluate normal transpiration, post-irrigation high load, sensor bias, and partial dehumidifier degradation as probabilistic scenarios. Choose a low-expected-cost action while imposing a modeled probability of avoiding dewpoint-risk conditions.</li></ol><p>Robust control asks whether a plan survives specified bad cases. Stochastic control asks how the distribution of outcomes meets a risk policy. Neither justifies treating an uncalibrated confidence score as a real probability.</p>`,
      },
      {
        id: "responses-ten-twelve",
        title: "10–12 · Share resources, trace causes, update belief",
        html: `<ol class="step-list" start="10"><li><strong>Distributed control.</strong> The room requests latent-removal capacity. A plant coordinator notices that another room is entering a sensitive propagation period and allocates capacity by risk and production priority. Each room stops acting as if the central plant were unlimited.</li><li><strong>Graph-structured control.</strong> The facility map traces LED ramp → leaf temperature and transpiration → latent load → room dewpoint → dehumidifier demand → shared refrigeration → electrical demand. A sensor-health node also gathers neighboring measurements and telemetry. This makes dependencies inspectable; the graph alone does not choose the command.</li><li><strong>Bayesian graph-structured MPC.</strong> Uncertain crop transpiration, mixing effectiveness, and sensor health have explicit probability models. New evidence updates posterior beliefs; the MPC then selects a risk-aware plan. Strong evidence of genuine moisture risk can justify decisive action. Evidence of a wet sensor can justify cross-checking and a conservative bounded response instead of disruptive overreaction.</li></ol><p>The final combination needs more than an algorithm: useful evidence, maintained models, governance, and reliable fallback are prerequisites. Additional sophistication is justified only when it improves a consequential decision.</p>`,
      },
      {
        id: "judge-the-plan",
        title: "Judge the response, not the label",
        html: `<p>Compare candidate plans through the same operational questions:</p><ul><li>Will local leaf conditions remain inside the commissioned safety envelope?</li><li>What happens if actual latent removal is lower than expected?</li><li>Can the remaining DLI still be delivered within the crop program?</li><li>Does this room's plan leave capacity for other rooms?</li><li>Are measurements representative, and what new evidence would change the plan?</li><li>What continues operating if the supervisor becomes unavailable?</li></ul><p>The strongest plan may use several of the twelve approaches simultaneously: a manual policy, on/off equipment protection, PID tracking, rule-based mode selection, and an uncertainty-aware predictive supervisor.</p><blockquote>The point is not to crown a winner. It is to understand which missing information changes the action.</blockquote>`,
      },
    ],
    takeaway:
      "The same humidity surge can be treated as a threshold event, a coupled planning problem, a shared-resource decision, or a question about uncertain evidence.",
    quiz: {
      question:
        "Which response specifically adds plant-wide awareness to a room approaching its dehumidification limit?",
      options: [
        "Tighten the room humidity PID tuning.",
        "Ask a coordinator to allocate shared capacity using all rooms’ risk and flexibility.",
        "Replace the RH threshold with a narrower deadband.",
        "Add a fixed weight to the room’s graph edge.",
      ],
      answer: 1,
      explanation:
        "A distributed or hierarchical coordinator sees competing room requests and the central plant limit. Better tuning or different thresholds can improve local response but cannot, by themselves, decide a fair and crop-safe allocation of shared capacity.",
    },
    source: "Source outline §5, with distinctions from §§3.8–3.11",
    lab: "planning",
  },
  {
    id: "facility-graphs",
    number: "05",
    title: "Make the invisible connections visible",
    shortTitle: "Facility graphs",
    subtitle:
      "A typed map of physical, operational, and informational dependencies.",
    minutes: 12,
    category: "Systems thinking",
    intro:
      "A facility graph turns “these things are somehow related” into explicit, inspectable relationships. That is useful for control, maintenance, reuse, and explanation—but only if the relationships say what they actually mean.",
    objectives: [
      "Identify useful node and edge types in a CEA facility.",
      "Read an edge schema with units, dynamics, uncertainty, and provenance.",
      "Explain why graph structure is neither a control algorithm nor proof of causality.",
    ],
    sections: [
      {
        id: "typed-graph",
        title: "Nodes, edges, types, and attributes",
        html: `<p>The source writes a facility as <strong>G = (V, E, τV, τE, A)</strong>: nodes, edges, node types, edge types, and attributes. The notation is compact; the engineering discipline behind it matters more.</p><p>A node can represent a climate zone, air volume, crop canopy, irrigation zone, reservoir, HVAC unit, dehumidifier, fan, curtain, vent, lighting group, CO₂ manifold, sensor, electrical panel, shared fluid resource, forecast source, or production objective.</p><p>These are different kinds of entities. A sensor supplies evidence. An actuator changes conditions. A crop program supplies goals. A resource supplies limited capacity. Giving each a type prevents the model from treating them as interchangeable dots.</p><table><caption>A small greenhouse bay graph</caption><thead><tr><th scope="col">Node</th><th scope="col">Type</th><th scope="col">State or responsibility</th></tr></thead><tbody><tr><th scope="row">Bay A air</th><td>Climate zone</td><td>Temperature, dewpoint, CO₂, pressure.</td></tr><tr><th scope="row">Bay A canopy</th><td>Crop state</td><td>Leaf temperature, transpiration and disease-risk proxies.</td></tr><tr><th scope="row">Ridge vent A</th><td>Actuator</td><td>Position, lag, fault status, and air exchange.</td></tr><tr><th scope="row">Boiler loop</th><td>Shared resource</td><td>Supply conditions and finite heat capacity.</td></tr><tr><th scope="row">RH sensor A1</th><td>Sensor</td><td>Measurement, calibration, and health evidence.</td></tr><tr><th scope="row">Crop program A</th><td>Objective</td><td>Targets, crop stage, and operating priorities.</td></tr></tbody></table>`,
      },
      {
        id: "meaningful-edges",
        title: "An edge must say what kind of connection it is",
        html: `<p>An airflow path is not a measurement, and neither is a command permission. Useful edge types include heat and moisture transfer, electrical or hydraulic dependency, communication dependency, causal influence, control authority, shared capacity, data provenance, and maintenance dependency.</p><table><caption>Relationships with distinct engineering meanings</caption><thead><tr><th scope="col">From → to</th><th scope="col">Type</th><th scope="col">Useful metadata</th></tr></thead><tbody><tr><th scope="row">Weather → bay air</th><td>Disturbance / infiltration</td><td>Wind-sensitive gain, delay, and confidence.</td></tr><tr><th scope="row">Canopy → bay air</th><td>Moisture generation</td><td>Transpiration model, crop stage, and uncertainty.</td></tr><tr><th scope="row">Bay air → canopy</th><td>Microclimate influence</td><td>Airflow-dependent boundary-layer behavior.</td></tr><tr><th scope="row">Boiler → unit heater</th><td>Shared capacity</td><td>Flow allocation, priority, and maximum output.</td></tr><tr><th scope="row">RH sensor → state estimate</th><td>Measurement</td><td>Calibration, variance, health, and spatial relevance.</td></tr><tr><th scope="row">Bay conditions → disease-risk objective</th><td>Risk relation</td><td>Leaf-to-dewpoint model and exposure duration.</td></tr></tbody></table><p>A physical relationship needs appropriate units and dynamics. A measurement relationship needs evidence quality. A control-authority relationship needs a clear boundary on who can command what. A single generic “strength” field cannot replace all of those meanings.</p>`,
      },
      {
        id: "edge-schema",
        title: "Read a relationship like an engineering record",
        html: `<p>This adapted source example describes moisture entering bay air from a canopy. Its numerical values are illustrative; they do not describe a commissioned greenhouse. The validation date is omitted rather than implying a real test took place.</p><pre><code>edge_id: bay_a_canopy_to_bay_a_air_moisture
edge_type: moisture_generation
source_node: bay_a_canopy
sink_node: bay_a_air
model_type: hybrid_physics_residual
sign: positive
nominal_gain: 0.42
unit: kg_water_per_hour
response_delay_seconds: 120
time_constant_seconds: 900
confidence: 0.73
uncertainty_model: lognormal_parameter_distribution
provenance:
  source: commissioning_test_and_operational_fit
safety_critical: true</code></pre><ul><li><strong>Sign and gain</strong> describe the nominal influence. The actual model still needs an unambiguous input definition and unit convention.</li><li><strong>Delay and time constant</strong> distinguish when a response begins from how quickly it develops.</li><li><strong>Capacity limits and safety classification</strong> identify where constraints and independent protection matter.</li><li><strong>Provenance and actual validation records</strong> let engineers decide whether a relationship still deserves trust.</li><li><strong>Uncertainty model</strong> names a distributional assumption. A confidence field alone is not a posterior, and this schema alone is not a full Bayesian model.</li></ul><p>In a real implementation, retain calibration dates, model versions, evidence, and operating conditions. An edge is maintainable only when another engineer can understand where it came from and when it stops being applicable.</p>`,
      },
      {
        id: "trace-two-facilities",
        title: "Trace a problem across a boundary",
        html: `<div class="example-pair"><div class="example-card"><strong>Greenhouse: humidity arriving from next door</strong><p>Bay 1 canopy produces moisture. Air crosses an open door or imperfect barrier into Bay 2. Bay 2's leaf-to-dewpoint margin shrinks, while its fan affects local mixing. The graph reveals a plausible upstream source: Bay 1's irrigation or transpiration, not necessarily a failure of Bay 2's equipment.</p><p>That path is a hypothesis supported by modeled relationships. Measurements and calibration are still needed to establish how much moisture actually moves.</p></div><div class="example-card"><strong>Indoor farm: a light is also a utility dependency</strong><p>Several rooms' LEDs, HVAC units, and dehumidifiers share an electrical panel. Their moisture loads also share a central dehumidification plant. An LED decision creates immediate electrical demand and a delayed cooling and latent-removal demand.</p><p>Represent both paths. A model containing only the electrical connection could miss the later refrigeration bottleneck.</p></div></div>`,
      },
      {
        id: "graph-boundaries",
        title: "What the graph provides—and what it cannot promise",
        html: `<p>Typed graphs support decomposition, repeated bay templates, fault tracing, new-equipment integration, and sparse computation based on relevant neighborhoods instead of all-to-all relationships. They can also give operators an understandable map of why a decision affects other areas.</p><p><strong>A graph by itself is not a dynamic model, controller, causal proof, probability model, stability guarantee, or substitute for calibration.</strong> A controller still needs mathematical behavior, valid measurements, objectives, constraints, and a method for selecting actions.</p><p>Start with a small set of consequential interactions. Add a relationship when there is a physical, operational, or evidential reason for it, and enough information to make its role useful. A dense diagram of every possible association is not necessarily a better model.</p><div class="lesson-callout"><strong>Graph ≠ Bayesian.</strong> A fixed airflow gain of 0.65 may be an engineering coefficient. Bayesian treatment requires explicit probability semantics, a prior, an evidence likelihood, and posterior updating. Control requires those beliefs to influence actions.</div>`,
      },
    ],
    takeaway:
      "A typed graph is an inspectable engineering map. Its value comes from meaningful relationships, dynamics, limits, and provenance—not from drawing more connections.",
    quiz: {
      question:
        "Why should a sensor-to-estimator edge have a different type from a boiler-to-heater edge?",
      options: [
        "Sensors cannot appear in a facility graph.",
        "Every edge should have the same probability weight.",
        "One carries measurement evidence; the other expresses a physical resource dependency with finite capacity.",
        "Typed edges remove the need to calibrate sensors.",
      ],
      answer: 2,
      explanation:
        "Edge types preserve engineering meaning. Measurement variance and health matter for evidence; allocation and maximum output matter for a resource dependency. Treating both as an unexplained weight loses information needed for reliable decisions.",
    },
    source: "Source outline §§3.9–3.11, 6, 9–10",
  },
  {
    id: "bayesian-control",
    number: "06",
    title: "Know what you do not know",
    shortTitle: "Bayesian control",
    subtitle: "Use evidence to update belief—and let that change the action.",
    minutes: 12,
    category: "Systems thinking",
    intro:
      "A high sensor reading is evidence, not a complete explanation. Bayesian methods help represent competing explanations and uncertain parameters, update them as information arrives, and choose an action whose caution matches the stakes.",
    objectives: [
      "Distinguish a fixed graph weight from a Bayesian probability model.",
      "Follow prior, likelihood, and posterior through a sensor-health example.",
      "Explain actionable uncertainty and safely bounded dual control.",
    ],
    sections: [
      {
        id: "weights-and-beliefs",
        title: "A number on an edge is not a belief model",
        html: `<p>“Fan speed → mixing: 0.65” could simply be a fixed engineering gain. It does not explain how uncertain that gain is, which operating conditions it applies to, or how new evidence changes it.</p><p>The source contrasts this with an illustrative posterior mean of 0.65 and credible interval from 0.48 to 0.79, with confidence changing across wind, curtain position, and crop density. Those values illustrate uncertainty semantics, not a calibrated fan model.</p><ul><li><strong>Prior:</strong> a probability model for what is unknown before the current evidence.</li><li><strong>Likelihood:</strong> how compatible the observed evidence is with each candidate state or parameter.</li><li><strong>Posterior:</strong> the updated probability model after combining prior and evidence.</li></ul><p>A weight plus a vague “confidence” score is not enough. A Bayesian model must define what its random quantities mean and how observations update them. A posterior also remains conditional on assumptions; confident output is not proof that those assumptions are correct.</p>`,
      },
      {
        id: "bayesian-cycle",
        title: "From evidence to action",
        html: `<ol class="step-list"><li><strong>Start with uncertain state or model.</strong> Transpiration depends on crop stage, canopy density, light, irrigation, root-zone conditions, and airflow.</li><li><strong>Collect evidence.</strong> Bring together climate sensors, equipment telemetry, crop information, and recent actions.</li><li><strong>Evaluate explanations.</strong> Compare how likely that evidence would be under different loads, equipment capacities, or sensor-health conditions.</li><li><strong>Update belief.</strong> Revise the distribution of plausible states or parameters.</li><li><strong>Choose an action using confidence and risk.</strong> Change the reserve, margin, scenario set, operating envelope, or fallback if the uncertainty is consequential.</li></ol><p>Estimation becomes <strong>control</strong> at the last step. A probability chart that never affects a decision is useful monitoring, but it is not yet uncertainty-aware control.</p><p>Bayesian estimation can support a graph-structured MPC without replacing it. The graph describes dependencies, the estimator updates beliefs, and the optimizer chooses a plan within independently enforced limits.</p>`,
      },
      {
        id: "sensor-drift",
        title: "A greenhouse sensor suddenly reads 92% RH",
        html: `<p>In the source's illustrative event, one sensor reports 92% RH. Possible explanations include a genuine moisture rise, recent irrigation, sensor wetting, gradual drift, reduced fan output, partial dehumidifier failure, or weather-driven infiltration.</p><table><caption>Evidence that helps distinguish explanations</caption><thead><tr><th scope="col">Evidence</th><th scope="col">What it can help investigate</th></tr></thead><tbody><tr><th scope="row">Neighboring RH and dewpoint</th><td>Is the event local, widespread, or inconsistent with other measurements?</td></tr><tr><th scope="row">Leaf temperature</th><td>Is condensation risk plausible at the crop surface?</td></tr><tr><th scope="row">Fan power and airflow confirmation</th><td>Has circulation actually changed, not just its command?</td></tr><tr><th scope="row">Irrigation history</th><td>Is a crop-load change plausible after a recent pulse?</td></tr><tr><th scope="row">Dehumidifier draw and condensate flow</th><td>Is the equipment producing expected latent removal?</td></tr><tr><th scope="row">Weather and vent position</th><td>Could external air or infiltration explain the event?</td></tr></tbody></table><p>If evidence strongly supports sensor wetting while adjacent conditions remain normal, the supervisor may flag sensor health rather than initiate disruptive emergency ventilation. If evidence supports a real humidity rise, it should protect the crop.</p><div class="lesson-callout"><strong>Uncertainty is not permission to ignore an alarm.</strong> Preserve independent safety limits, use conservative bounded operation when confidence is low, and make escalation and operator alerts explicit.</div>`,
      },
      {
        id: "where-bayes-helps",
        title: "Use probability where the unknown changes the decision",
        html: `<div class="example-pair"><div class="example-card"><strong>Greenhouse candidates</strong><ul><li>Transpiration by cultivar and stage.</li><li>Wind-driven infiltration and vent conductance.</li><li>Curtain leakage and thermal effects.</li><li>Sensor drift and condensation bias.</li><li>Cross-bay moisture movement.</li><li>Equipment capacity degradation.</li><li>Latent leaf-wetness or condensation-risk states.</li></ul></div><div class="example-card"><strong>Indoor-farm candidates</strong><ul><li>Transpiration response to DLI, VPD, EC, root-zone temperature, and airflow.</li><li>Rack-to-rack microclimate divergence.</li><li>Coil capacity and supply-air distribution.</li><li>Sensor health and representativeness.</li><li>Crop response to dimming, spectrum, and temperature trajectories.</li><li>Unobserved water-borne disease-risk variables.</li></ul></div></div><p>Not every variable needs Bayesian treatment. Prioritize relationships that are important, uncertain, changing, and hard to measure directly. A stable, well-instrumented local pressure loop may not benefit from the same machinery as a changing crop-load estimate.</p>`,
      },
      {
        id: "actionable-uncertainty",
        title: "Let confidence change the operating envelope",
        html: `<p>The source proposes a greenhouse bay with a modeled 40% chance of crossing a dewpoint-risk threshold overnight under its nominal plan. That number is an illustration of model output, not a universal disease probability.</p><p>Possible responses include intermittent circulation, slight ventilation with heat, mechanical dehumidification, less aggressive curtain closure, or no change. Choosing among them requires projected crop risk, energy, available equipment, and confidence in the underlying evidence.</p><p>With uncertain transpiration and sensor health, a conservative plan may cost more while protecting a wider set of plausible conditions. As evidence improves, the controller can operate closer to its economic optimum without treating improved confidence as permission to violate hard limits.</p><ul><li>Expand the leaf-to-dewpoint margin when load estimates are weak.</li><li>Reserve latent-removal capacity when coil performance is uncertain.</li><li>Limit optimizer authority when the state estimate is unreliable.</li><li>Fall back to a commissioned conservative mode when predictions and measurements diverge.</li></ul><p>Robust bounds, stochastic scenarios, and Bayesian updating can cooperate. The key is making their different assumptions visible rather than merging them into an unexplained “AI confidence” label.</p>`,
      },
      {
        id: "dual-control",
        title: "Sometimes a safe action also teaches",
        html: `<p><strong>Dual control</strong> selects an action partly for regulation and partly for the information it will provide. It is not unconstrained experimentation on a crop.</p><p>If mixing effectiveness is uncertain, the source describes a modest fan-speed increase for a bounded interval. Spatial temperature, RH, and CO₂ convergence provide evidence about the fan-to-uniformity relationship. The controller updates its model and can make later decisions with better information.</p><p>In the six-room case, a new cultivar's lights can be ramped to an illustrative 70% rather than immediately to full output. Observing transpiration proxies, coil load, RH response, and spatial variation helps determine whether full output is appropriate without creating a large capacity shock.</p><p>The test must be small, reversible, within crop and equipment limits, and subject to operator authority. Independent protection still applies. Learning is valuable only when the expected information justifies the bounded operational cost and risk.</p>`,
      },
    ],
    takeaway:
      "Bayesian control is not decorative confidence. It is explicit uncertainty, updated by evidence, that changes a bounded and accountable control decision.",
    quiz: {
      question:
        "A controller updates its transpiration estimate after a bounded fan test. What makes this dual control rather than ordinary feedback?",
      options: [
        "The action was chosen partly to learn a relationship that improves future decisions, as well as to regulate conditions.",
        "Any fan-speed change is automatically a Bayesian experiment.",
        "The test was allowed to override safety so the model could learn faster.",
        "The controller replaced all measurements with the prior.",
      ],
      answer: 0,
      explanation:
        "Dual control deliberately values information alongside immediate regulation. The example uses a bounded, reversible action and observes its effect to update a model; safety and operator authority remain independent.",
    },
    source: "Source outline §§3.8, 3.11, 7, 10, 12–13",
    lab: "bayes",
  },
  {
    id: "control-architecture",
    number: "07",
    title: "Build intelligence on dependable foundations",
    shortTitle: "Control architecture",
    subtitle: "Six layers, eight deployment stages, and a safe way to improve.",
    minutes: 15,
    category: "In practice",
    intro:
      "A credible advanced controller is not a single model with unrestricted command access. It is a layered system that can fail safely, remain useful during partial outages, explain itself, and improve without surrendering operator authority.",
    objectives: [
      "Name all six architecture layers and their authority boundaries.",
      "Follow the eight-stage deployment roadmap.",
      "Recognize design patterns that preserve safety, observability, and trust.",
    ],
    sections: [
      {
        id: "layers-zero-one",
        title: "Layers 0–1 · Protect first, regulate locally",
        html: `<p><strong>Layer 0: hard interlocks and equipment protection.</strong> Keep high/low temperature limits, freeze protection, pressure limits, pump dry-run protection, tank overflow prevention, compressor anti-short-cycle timers, fan and motor overloads, emergency ventilation or shutdown states, communications-loss defaults, and manual local control outside optimizer and machine-learning authority.</p><p>A planner should respect constraints in its calculations, but that is not a substitute for independent enforcement at the PLC, safety controller, or deterministic protection layer.</p><p><strong>Layer 1: fast local loops.</strong> VFD speed, valve control, coil discharge-air temperature, pump pressure, nutrient dosing, and local staging remain with equipment-level controllers. Typical source timescales are milliseconds to seconds; actual timing depends on the process and hardware.</p><div class="lesson-callout"><strong>Failure is part of the design.</strong> If a forecast service or supervisory optimizer disappears, the facility should not lose basic safe operation. Local controllers need commissioned default targets, explicit operating envelopes, communications-loss behavior, and manual control.</div>`,
      },
      {
        id: "layers-two-three",
        title: "Layers 2–3 · Select modes and coordinate plans",
        html: `<p><strong>Layer 2: supervisory mode logic and resource coordination.</strong> This layer decides heating versus cooling mode, economizer eligibility, dehumidification strategy, curtain modes, plant demand limiting, maintenance lockouts, equipment availability, and operator policy. The source gives typical update periods of seconds to minutes.</p><p><strong>Layer 3: graph-structured MPC.</strong> It predicts zone conditions, coordinates multiple zones, enforces modeled shared-resource limits, and optimizes climate trajectories and operating cost. It requests <strong>bounded setpoints or operating envelopes</strong> from local controllers rather than bypassing their protection.</p><p>The source's illustrative MPC update range is 1–15 minutes, depending on thermal and biological dynamics. This is not a requirement to run all processes at that interval. A room plan and a motor protection function operate on very different timescales.</p><p>Clear authority matters: a maintenance lockout should not be silently undone because the optimizer wants more capacity. Likewise, a plant-wide allocation must be reflected in the limits local planning actually uses.</p>`,
      },
      {
        id: "layers-four-five",
        title: "Layers 4–5 · Estimate, learn, and govern",
        html: `<p><strong>Layer 4: estimation and uncertainty.</strong> Combine sensor validation, redundancy checks, state estimation, parameter estimation, weather and solar forecasts, crop transpiration, equipment capacity, and forecast scenarios. This layer informs planning about conditions that are partly hidden or uncertain.</p><p><strong>Layer 5: learning and governance.</strong> Manage shadow-mode models, simulation and replay, versioning, drift monitoring, edge calibration and provenance, human approval for model changes, and root-cause or decision explanations.</p><p>Learning should first improve specific weak spots: residual dynamics, soft sensors, anomaly detection, or load forecasts. Physics remains useful where known. Learned updates require evaluation, rollback, and monitoring for conditions outside their experience.</p><p>These six layers describe responsibilities, not six isolated products. Information moves among them, but independent safety and bounded command authority must remain intelligible to both engineers and operators.</p>`,
      },
      {
        id: "roadmap-one-four",
        title: "Roadmap 1–4 · Earn trustworthy predictions",
        html: `<ol class="step-list"><li><strong>Instrument and make local control trustworthy.</strong> Inventory every sensor and actuator, names, units, ranges, calibration history, and failure modes. Establish manual fallback and PLC-safe states. Add commands and actual telemetry—speed, amps, valve position, compressor status, condensate, runtime, and faults. Use consistent timestamps and redundant sensing in high-risk areas. Deliver a bay dashboard linking climate, dewpoint, equipment, energy, irrigation, and risk.</li><li><strong>Standardize the facility graph.</strong> Define zone, equipment, sensor, resource, crop, and objective nodes; physical, command, measurement, and shared-capacity edges; units, delays, limits, and provenance. Keep the configuration version controlled. Deliver an explicit map of thermal, air, moisture, CO₂, electrical, and water dependencies.</li><li><strong>Add supervisory rules and feedforward.</strong> Use weather, irradiance, schedules, and tariffs. Encode proven modes with conflict detection and priority tiers. Log each activation and its consequence. Deliver lights-on pre-dehumidification that runs only when forecast load and available capacity justify it.</li><li><strong>Build and validate simple predictive models.</strong> Start with one representative zone and heat/moisture balances. Identify major gains, time constants, and delays from operational history and controlled tests. Measure forecast error by variable and mode. Deliver a shadow-mode forecast compared with actual conditions after every run, before granting command authority.</li></ol>`,
      },
      {
        id: "roadmap-five-eight",
        title: "Roadmap 5–8 · Introduce authority gradually",
        html: `<ol class="step-list" start="5"><li><strong>Deploy constrained MPC as advisory, then supervisory.</strong> Begin with recommendations and explanations; compare them with operator actions. Limit command authority to bounded setpoint adjustments and retain independent interlocks. Add objectives incrementally—dewpoint risk before energy and crop-value weighting. Deliver an overnight strategy with an explicit energy-versus-risk comparison.</li><li><strong>Add uncertainty selectively.</strong> Score sensor health, quantify transpiration uncertainty, generate forecast scenarios, and estimate actual equipment capacity from telemetry. Define conservative low-confidence operation. Deliver a controller that expands dewpoint margin when its load model is uncertain.</li><li><strong>Scale through graph structure and distribution.</strong> Use local zone controllers, shared-resource coordinators, neighborhood relationships, allocation or resource pricing, and reusable zone templates. Deliver a six-room refrigeration allocator without sacrificing room-level safety and autonomy.</li><li><strong>Introduce learning under governance.</strong> Start with residual forecasts, anomaly detection, and soft sensors. Use shadow evaluation, replay, and controlled operational comparisons. Require validation and rollback for model changes, monitor drift and out-of-distribution conditions, and preserve data and decision lineage. Deliver improved forecasts while physics constraints and safe bounds remain active.</li></ol><p>Do not skip observability because optimization seems more exciting. A complex planner fed stale points or incorrect units can make a highly confident wrong decision.</p>`,
      },
      {
        id: "patterns-and-antipatterns",
        title: "Design for the operator who inherits the system",
        html: `<table><caption>Durable patterns and the shortcuts they replace</caption><thead><tr><th scope="col">Prefer</th><th scope="col">Avoid</th></tr></thead><tbody><tr><th scope="row">Independent hard safety and reliable PID.</th><td>Replacing all controls with an unrestricted black-box model.</td></tr><tr><th scope="row">Physics plus evaluated learned residuals.</th><td>Assuming learning makes physical constraints unnecessary.</td></tr><tr><th scope="row">Uncertainty that changes margins, scenarios, authority, and fallback.</th><td>Confidence dashboards disconnected from actions, or bad sensors treated as truth.</td></tr><tr><th scope="row">Inspectable typed graphs with reusable local models.</th><td>A dense monolith or vague weighted graph labeled Bayesian.</td></tr><tr><th scope="row">Crop state, microclimate, quality, and cycle economics in the objective.</th><td>Perfect average setpoints or low energy use at the expense of crop outcomes.</td></tr><tr><th scope="row">Shadow deployment, versioning, rollback, and decision history.</th><td>Unverified model updates commanding production equipment.</td></tr><tr><th scope="row">Operator overrides, explanations, alarms, and clear modes.</th><td>Ambiguity about automatic, advisory, degraded, or fail-safe operation.</td></tr></tbody></table><p>When conditions leave expected bounds, show what changed, which fallback is active, what remains under local control, and what requires intervention. The operator should not need to infer command authority from whether an icon happens to be green.</p>`,
      },
    ],
    takeaway:
      "The route to advanced control is trustworthy instrumentation, explicit structure, validated predictions, bounded authority, and governed improvement—with independent safety throughout.",
    quiz: {
      question:
        "The supervisory optimizer becomes unavailable. Which architecture best preserves resilience?",
      options: [
        "All equipment waits for the optimizer to return.",
        "The learned model bypasses the PLC until service is restored.",
        "The last optimizer command stays active indefinitely without checks.",
        "Local controllers retain commissioned safe modes, independent interlocks, and manual authority.",
      ],
      answer: 3,
      explanation:
        "Hierarchical control preserves a working local layer. Communications-loss defaults and safe fallback must be designed and commissioned; indefinitely holding an arbitrary old command is not automatically safe.",
    },
    source: "Source outline §§8–10, 3.9, 15",
  },
  {
    id: "real-world",
    number: "08",
    title: "Put the whole system to work",
    shortTitle: "Real-world decisions",
    subtitle:
      "Two worked cases, one requirement: an operator can understand the decision.",
    minutes: 14,
    category: "In practice",
    intro:
      "The greenhouse must manage condensation risk without exhausting a shared boiler. The indoor farm must deliver light without overwhelming shared refrigeration. These worked scenarios bring structure, planning, uncertainty, and operator authority into the same decision.",
    objectives: [
      "Explain the overnight Botrytis-risk and six-room shared-capacity scenarios.",
      "Trace competing objectives and constrained resource allocations.",
      "Recognize a complete operator-facing explanation and fallback.",
    ],
    sections: [
      {
        id: "greenhouse-setup",
        title: "Case A · An overnight greenhouse decision",
        html: `<p>Four tomato greenhouse bays share limited boiler capacity. Bay C contains a cultivar especially sensitive to condensation-related disease, has recently been irrigated, and is closing its energy curtain after sunset. Another bay is in propagation and needs a higher temperature.</p><p>In the source's illustrative conditions, outside air is 38°F with a 28°F dewpoint, and wind is forecast to increase after midnight. The relevant disease-risk objective is not “hit one RH number.” It is to avoid leaf-surface condensation and sustained unfavorable leaf-to-dewpoint margin.</p><ol class="step-list"><li>Protect Bay C from condensation-related risk.</li><li>Maintain crop-safe temperature in every bay.</li><li>Reduce unnecessary gas use and ventilation heat loss.</li><li>Avoid short cycling mechanical dehumidification.</li><li>Preserve required boiler capacity for the propagation bay.</li></ol><div class="lesson-callout">This is a worked control scenario, not a validated Botrytis treatment protocol. Risk depends on crop, cultivar, surfaces, exposure duration, equipment, and local conditions. All numerical settings here are illustrative.</div>`,
      },
      {
        id: "greenhouse-planning",
        title: "From an RH reaction to a coordinated night plan",
        html: `<p><strong>Threshold control</strong> might open a vent and start heat above an illustrative 85% RH, then close and stop below 80%. It can produce repeated heating and venting, with no explicit awareness of future wind or the propagation bay's boiler priority.</p><p><strong>Supervisory rules</strong> improve the response: increase horizontal airflow when the curtain is closed and margin is shrinking, permit vent-assisted drying only when outside moisture conditions help, and prioritize propagation when boiler load is high. Rules still struggle to optimize timing and combinations across every bay.</p><p><strong>MIMO MPC</strong> predicts temperature and moisture trajectories using expected wind and irrigation-related transpiration. It jointly selects Bay C fan speed, vent aperture, boiler allocation, curtain opening, mechanical dehumidification, and irrigation hold or adjustment.</p><p>The source offers a possible 12-minute low-aperture vent pulse with targeted heat and high circulation instead of an hour of compressor dehumidification. That is a candidate plan to evaluate, not a demonstrated saving or a command to copy. Its value depends on the model, available resources, and independent crop-safety limits.</p>`,
      },
      {
        id: "greenhouse-uncertainty",
        title: "Keep the night plan credible when conditions change",
        html: `<p>Adverse cases include stronger wind-driven infiltration, higher transpiration after irrigation, lower boiler capacity, or a partially degraded fan. Robust or stochastic planning evaluates these possibilities rather than relying on one nominal forecast. A lower-priority bay may accept a small, safe deviation while Bay C and propagation remain protected.</p><p>The graph links Bay C canopy transpiration, inter-bay air transfer, curtain leakage, shared boiler capacity, sensor reliability, and disease-risk dependence on leaf-to-dewpoint margin and duration. It makes the basis of the coordinated decision inspectable.</p><p>If Bay C's RH sensor disagrees with nearby measurements, Bayesian estimation can compare wetting, sensor drift, and a real moisture event. The system may increase mixing, cross-check sensors, and operate conservatively until confidence improves, rather than blindly amplifying the high reading into aggressive ventilation.</p><p>The architecture still needs explicit escalation. If trusted RH or leaf-temperature evidence moves beyond expected bounds, switch to the commissioned conservative humidity mode and alert the operator. Belief-based reasoning does not override independent protection.</p>`,
      },
      {
        id: "indoor-setup",
        title: "Case B · Six rooms and one finite central plant",
        html: `<p>Six rooms share central dehumidification and refrigeration and face a demand-charge peak threshold. Each room has dimmable LEDs and recirculation fans. All are scheduled to ramp lights in the same 30-minute window.</p><ul><li><strong>Room 1:</strong> premium basil near harvest, with quality to protect.</li><li><strong>Room 2:</strong> lettuce with wider allowable flexibility.</li><li><strong>Room 3:</strong> a new cultivar whose transpiration response is uncertain.</li><li><strong>Rooms 4–6:</strong> additional loads that must be coordinated, not treated as absent.</li></ul><p>The objectives are simultaneous: preserve Room 1 quality, prevent humidity/dewpoint excursions in every room, complete daily light targets, avoid a coincident electrical peak, stay within central capacity, and learn safely about Room 3.</p><p><strong>Independent PIDs</strong> react as rooms drift, but fixed LED schedules synchronize their cooling and dehumidification requests. A rule that dims every room by the same illustrative 10% when demand is high can help, but ignores differences in crop needs and flexibility.</p>`,
      },
      {
        id: "indoor-plan",
        title: "Allocate flexibility, not just equal curtailment",
        html: `<p>With <strong>distributed economic MPC</strong>, each room forecasts crop load, remaining DLI, and climate trajectory, then submits resource requests and available flexibility. The coordinator chooses a feasible plant-wide plan.</p><ol class="step-list"><li>Start Room 1 lighting first and reserve its required latent-removal capacity.</li><li>Delay Room 2's ramp by an illustrative 20 minutes, then compensate later only if DLI and crop-program constraints permit.</li><li>Reduce Room 2 fan speed only when acceptable spatial uniformity remains achievable.</li><li>Spread the light ramps of Rooms 4–6 to avoid synchronizing demand.</li><li>Hold a conservative latent-load reserve for uncertain Room 3.</li></ol><p>A <strong>Bayesian dual-control extension</strong> may bring Room 3 to an illustrative 70% light output, observe transpiration proxies, RH, coil load, and spatial variation, then update the model before deciding on full output. The action is bounded and reversible, not open-ended exploration.</p><p>Fair allocation is not necessarily equal allocation. The plan considers crop priority and flexibility, but hard safety remains for all rooms; a lower-value crop is not permission to violate its safe envelope.</p>`,
      },
      {
        id: "operator-explanation",
        title: "Show the decision, the alternatives, and the way out",
        html: `<p>A bare command such as “vent at 18%” is not an adequate operator explanation. The source's illustrative decision record includes a 12-minute Bay C vent action, a forecast risk window, competing boiler needs, uncertainty after irrigation, and an explicit fallback.</p><blockquote><p><strong>Decision:</strong> Use a bounded ventilation pulse in Bay C with coordinated heat and circulation.</p><p><strong>Why:</strong> Reduce predicted leaf-to-dewpoint risk while outside air can assist drying and the propagation bay retains required boiler capacity. Suspend CO₂ enrichment during ventilation.</p><p><strong>Alternatives considered:</strong> Mechanical dehumidification adds projected energy and an unnecessary compressor cycle in this model. No action retains an unacceptable modeled risk.</p><p><strong>Confidence:</strong> Moderate; the transpiration estimate is more uncertain after irrigation.</p><p><strong>Fallback:</strong> If trusted RH or leaf-temperature evidence leaves the expected envelope, return to conservative humidity mode and alert the operator.</p></blockquote><p>A complete decision record should include:</p><ul><li>Current state and the forecast used.</li><li>Objective tradeoffs and active constraints.</li><li>Selected action and rejected alternatives.</li><li>Confidence, uncertainty, and expected outcome.</li><li>Fallback conditions and current authority or operating mode.</li><li>Model and configuration versions for traceability.</li></ul><p>These examples are plans under assumptions, not claims of measured energy savings or disease prevention. A trustworthy deployment lets operators inspect the assumptions, override appropriately, and compare predictions with what actually happened.</p>`,
      },
    ],
    takeaway:
      "Advanced control is a transparent chain from evidence to forecast, constraints, action, and fallback—so coordinated automation becomes more knowledgeable without becoming less accountable.",
    quiz: {
      question:
        "Why might a six-room coordinator delay the lettuce room’s light ramp instead of dimming every room equally?",
      options: [
        "Lower-value crops do not need hard safety limits.",
        "Delayed light never affects DLI.",
        "Rooms have different crop priorities and flexibility; a coordinated delay can protect shared capacity while preserving required DLI and safety.",
        "The central plant can supply unlimited capacity if each room has PID.",
      ],
      answer: 2,
      explanation:
        "Distributed economic control uses room-level forecasts, priorities, and flexibility to find a feasible shared plan. A delay is acceptable only if the crop program, final DLI, local safety, and later capacity remain feasible.",
    },
    source: "Source outline §§11–13, 15",
  },
];

export const strategies = [
  {
    id: "manual-timer",
    name: "Manual / timer",
    group: "Foundational",
    question: "What does the operator normally do now?",
    coupling:
      "A timer does not coordinate effects; a skilled operator may account for them.",
    foresight:
      "Schedules and human interpretation of forecasts, not automated trajectory planning.",
    uncertainty: "Human judgment rather than an explicit probability model.",
    example:
      "Open greenhouse vents by routine or run fixed indoor photoperiod and irrigation schedules.",
    lessonId: "control-evolution",
  },
  {
    id: "on-off",
    name: "On/off + hysteresis",
    group: "Foundational",
    question: "Is the measurement over or under a threshold?",
    coupling: "Minimal: separate threshold loops can oppose one another.",
    foresight: "Reacts to a crossing rather than forecasting a disturbance.",
    uncertainty:
      "No explicit uncertainty representation in the basic threshold rule.",
    example:
      "Start heat and ventilation at an RH threshold, or stage a compressor by room temperature.",
    lessonId: "control-evolution",
  },
  {
    id: "pid",
    name: "PID",
    group: "Foundational",
    question: "How should one actuator continuously correct a process error?",
    coupling:
      "Limited in a conventional local loop; interacting processes complicate tuning.",
    foresight:
      "Feedback on current and accumulated error, not a constrained future plan.",
    uncertainty: "No explicit probabilistic uncertainty model in basic PID.",
    example:
      "Modulate a greenhouse fan or an indoor chilled-water valve to a local target.",
    lessonId: "control-evolution",
  },
  {
    id: "feedforward-rules",
    name: "Feedforward + rules",
    group: "Foundational",
    question:
      "What known disturbance or operating policy should change action now?",
    coupling:
      "Partial coordination through explicitly authored modes and rules.",
    foresight:
      "Anticipates known events and forecasts, with limited joint planning.",
    uncertainty:
      "Usually implicit engineering judgment; probabilities are not inherent.",
    example:
      "Deploy shade before a solar rise or pre-stage dehumidification before lights-on.",
    lessonId: "twelve-ways",
  },
  {
    id: "mimo",
    name: "MIMO",
    group: "Foundational",
    question: "How should several actuators jointly control several variables?",
    coupling: "Explicit multiple-input, multiple-output interactions.",
    foresight:
      "Not necessarily; multivariable control can be near-term feedback.",
    uncertainty: "Requires an additional uncertainty treatment when needed.",
    example:
      "Coordinate heat, vents, curtains, fans, and CO₂, or LEDs with cooling and latent removal.",
    lessonId: "control-evolution",
  },
  {
    id: "mpc",
    name: "MPC",
    group: "Predictive",
    question: "What action plan best meets future targets under constraints?",
    coupling:
      "Coordinates the coupled inputs and outputs represented in its model.",
    foresight:
      "Predicts over a horizon, applies the first action, then replans.",
    uncertainty: "Optional; a nominal MPC can rely on a single forecast.",
    example:
      "Plan overnight humidity control or shift light delivery within cooling and DLI limits.",
    lessonId: "twelve-ways",
  },
  {
    id: "economic-mpc",
    name: "Economic MPC",
    group: "Predictive",
    question: "What plan minimizes total operational and production cost?",
    coupling:
      "Joint climate, crop, equipment, and resource tradeoffs in the objective and constraints.",
    foresight:
      "Plans trajectories using future costs, loads, and production needs.",
    uncertainty:
      "Optional; an economic objective does not itself define a risk model.",
    example:
      "Allocate greenhouse heat and CO₂ by crop value, or coordinate DLI, demand peaks, and quality.",
    lessonId: "real-world",
  },
  {
    id: "robust-mpc",
    name: "Robust MPC",
    group: "Predictive",
    question: "What action remains safe across bad-but-credible cases?",
    coupling:
      "Protects coupled modeled conditions within specified disturbance and error bounds.",
    foresight: "Plans ahead against bounded adverse conditions.",
    uncertainty:
      "Explicit bounded uncertainty; no scenario probabilities are required by the basic idea.",
    example:
      "Protect dewpoint margin under uncertain weather or plan for degraded dehumidifier capacity.",
    lessonId: "control-evolution",
  },
  {
    id: "stochastic-mpc",
    name: "Stochastic MPC",
    group: "Predictive",
    question: "What action balances expected performance and quantified risk?",
    coupling:
      "Models joint effects and risk across relevant uncertain trajectories.",
    foresight:
      "Evaluates probabilistic future scenarios over a planning horizon.",
    uncertainty:
      "Probability distributions or weighted scenarios, potentially with chance constraints.",
    example:
      "Use weather scenarios for venting or a probabilistic latent-load forecast indoors.",
    lessonId: "bayesian-control",
  },
  {
    id: "distributed-mpc",
    name: "Distributed MPC",
    group: "Architectural",
    question:
      "How should local predictive controllers coordinate shared resources?",
    coupling:
      "Coordinates local models through shared constraints and resource allocations.",
    foresight: "Local predictive plans inform facility-wide coordination.",
    uncertainty:
      "Optional; can incorporate robust, stochastic, or Bayesian methods.",
    example:
      "Allocate boiler capacity among bays or refrigeration and electrical capacity among six rooms.",
    lessonId: "real-world",
  },
  {
    id: "graph-structured",
    name: "Graph-structured control",
    group: "Architectural",
    question:
      "What is connected to what, and how does structure guide control?",
    coupling:
      "Makes physical and operational dependencies explicit so controllers can use them.",
    foresight:
      "Optional; a graph needs dynamic models and a planning algorithm to predict.",
    uncertainty: "Optional; fixed edge weights are not Bayesian beliefs.",
    example:
      "Map greenhouse air and moisture paths, or racks, rooms, utilities, and shared constraints.",
    lessonId: "facility-graphs",
  },
  {
    id: "bayesian",
    name: "Bayesian control",
    group: "Learning",
    question:
      "What do we believe under uncertainty, and how should belief alter action?",
    coupling:
      "Handles coupled decisions when combined with a suitable multivariable model and controller.",
    foresight:
      "Can inform future plans when combined with MPC or another predictive method.",
    uncertainty:
      "Explicit priors, likelihoods, and posterior updates that influence decisions.",
    example:
      "Distinguish sensor drift from a true RH rise or update uncertain crop transpiration.",
    lessonId: "bayesian-control",
  },
  {
    id: "graph-neural-mpc",
    name: "Graph-neural MPC",
    group: "Learning",
    question:
      "Can learned local graph dynamics improve scalable prediction and control?",
    coupling:
      "Learns interactions using relevant graph neighborhoods and shared conditions.",
    foresight: "Learned dynamics support prediction inside the MPC horizon.",
    uncertainty:
      "Often added through ensembles or other uncertainty quantification; not automatic.",
    example:
      "Learn cross-bay transport residuals or repeated rack-zone interactions, under governed safety constraints.",
    lessonId: "control-evolution",
  },
];

export const glossary = [
  {
    term: "Actuator",
    definition:
      "A device that changes the physical system, such as a fan, valve, pump, heater, compressor, light, curtain motor, vent motor, or CO₂ valve.",
  },
  {
    term: "Bayesian inference",
    definition:
      "Updating probability distributions about unknown states or model parameters after observing evidence, using a prior and an evidence likelihood to obtain a posterior.",
  },
  {
    term: "CEA",
    definition:
      "Controlled-environment agriculture: crop production in facilities such as greenhouses and indoor farms where equipment manages parts of the growing environment.",
  },
  {
    term: "Chance constraint",
    definition:
      "A requirement expressed as a probability under a model, such as maintaining a dewpoint margin with a specified modeled confidence. It is not an unconditional guarantee.",
  },
  {
    term: "CO₂",
    definition:
      "Carbon dioxide, used by plants in photosynthesis. Enrichment is a control input whose value depends on crop conditions, light, cost, and losses through air exchange.",
  },
  {
    term: "Control horizon",
    definition:
      "The future period over which an optimizer considers control actions. In this course, horizon also describes the planning window used to compare future trajectories.",
  },
  {
    term: "Dewpoint margin",
    definition:
      "Relevant leaf or surface temperature minus air dewpoint. A small or negative margin indicates condensation risk at that surface, even if room-average temperature looks acceptable.",
  },
  {
    term: "DLI",
    definition:
      "Daily light integral: the total photosynthetically active light received per unit area over a day, commonly expressed as mol/m²/day. Dimming or delaying light must be considered against the crop’s full daily light program.",
  },
  {
    term: "Dual control",
    definition:
      "Control that both regulates a system and deliberately gathers useful information for later decisions, using bounded actions consistent with safety and operator authority.",
  },
  {
    term: "Economic MPC",
    definition:
      "Model predictive control that optimizes operating, resource, production, and quality objectives rather than only minimizing setpoint error.",
  },
  {
    term: "Edge",
    definition:
      "A typed graph relationship, such as airflow, heat or moisture transfer, control authority, measurement, shared capacity, or causal influence.",
  },
  {
    term: "Feedforward",
    definition:
      "Acting on a known or forecast disturbance before the controlled variable drifts, such as pre-staging dehumidification before a scheduled light ramp.",
  },
  {
    term: "Graph-structured control",
    definition:
      "An architecture that uses explicit nodes and typed relationships to model and coordinate a facility. A graph is not, by itself, a controller or probability model.",
  },
  {
    term: "Hysteresis",
    definition:
      "Different turn-on and turn-off thresholds that prevent rapid switching near a single boundary, such as a dehumidifier starting at a higher RH and stopping at a lower RH.",
  },
  {
    term: "Latent load",
    definition:
      "The moisture-removal demand associated with water vapor in the air, including crop transpiration. It must be considered alongside sensible temperature-control load.",
  },
  {
    term: "Likelihood",
    definition:
      "How compatible observed evidence is with a particular candidate state or parameter value in a probability model; used with the prior in Bayesian updating.",
  },
  {
    term: "MIMO",
    definition:
      "Multiple-input, multiple-output control: several actuators are coordinated to influence several coupled outcomes. It does not necessarily include forecasting or uncertainty.",
  },
  {
    term: "Model Predictive Control (MPC)",
    definition:
      "A controller that predicts future behavior, solves a constrained planning problem, applies the first action, and repeats using fresh measurements.",
  },
  {
    term: "Node",
    definition:
      "An entity in a graph, such as a room, canopy, sensor, actuator, reservoir, HVAC unit, electrical panel, forecast, or objective.",
  },
  {
    term: "PID",
    definition:
      "Proportional–integral–derivative feedback control, which adjusts an actuator using present error, accumulated error, and rate of change. Commonly retained for fast local equipment regulation.",
  },
  {
    term: "Posterior",
    definition:
      "The updated probability distribution for an unknown state or parameter after combining a prior with the likelihood of observed evidence.",
  },
  {
    term: "Prior",
    definition:
      "A probability distribution representing knowledge about an unknown state or parameter before incorporating the current evidence.",
  },
  {
    term: "Residual model",
    definition:
      "A model of the difference between observed behavior and a baseline prediction, often learned from data to complement rather than discard known physics.",
  },
  {
    term: "Robust MPC",
    definition:
      "MPC designed to satisfy constraints despite disturbances or model mismatch within defined uncertainty bounds, considering credible adverse conditions.",
  },
  {
    term: "Shadow mode",
    definition:
      "Running a model or planner without equipment-command authority so predictions and recommendations can be compared with actual operation before deployment.",
  },
  {
    term: "Soft sensor",
    definition:
      "An estimated variable that is not directly measured, such as transpiration, leaf-wetness risk, coil capacity, or local microclimate state.",
  },
  {
    term: "State estimation",
    definition:
      "Combining sensor evidence and a model to infer internal system conditions, including variables that cannot be measured directly or reliably.",
  },
  {
    term: "Stochastic MPC",
    definition:
      "MPC that represents uncertainty through probability distributions or scenarios and can balance expected performance with explicit risk constraints.",
  },
  {
    term: "Supervisory control",
    definition:
      "A slower, higher-level layer that coordinates modes, setpoints, resource allocation, and objectives while local loops regulate equipment.",
  },
  {
    term: "VPD",
    definition:
      "Vapor pressure deficit: the difference between saturation vapor pressure at a relevant temperature and actual air vapor pressure. It describes evaporative demand; the temperature reference matters, especially when leaves and room air differ.",
  },
];
