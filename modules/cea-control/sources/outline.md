# CEA Control Strategies: From Thermostats to Graph-Structured Bayesian MPC

> An educational static-site outline for greenhouse and indoor-farm operators, automation engineers, product teams, and technical founders.

---

## Site purpose

This site explains how controlled-environment agriculture (CEA) control systems have evolved from independent on/off loops into coordinated, model-based, graph-structured, uncertainty-aware control architectures.

The central teaching objective is to distinguish three ideas that are often blurred together:

1. **Graph structure** — how a facility’s zones, equipment, resources, sensors, and causal pathways are represented.
2. **Multivariable control** — how multiple actuators are coordinated against multiple, coupled outcomes.
3. **Bayesian uncertainty handling** — how the system represents what it does not know, updates its belief from evidence, and changes actions accordingly.

The site should make clear that these techniques are not mutually exclusive. A mature CEA system will generally layer them:

- Deterministic safety logic closest to physical equipment.
- Fast local feedback loops for stable equipment operation.
- Supervisory optimization for coordinated climate, crop-risk, and energy decisions.
- Graph structure for scalable facility modeling and explainability.
- Probabilistic or Bayesian estimation for uncertain biological and physical behavior.

---

# 1. Home

## Hero

**Title:**

# How CEA Controls Evolved: From Setpoints to Uncertainty-Aware Facility Intelligence

**Subtitle:**

A practical guide to the control strategies behind greenhouses, indoor farms, propagation rooms, vertical farms, and hybrid production facilities.

**Primary calls to action:**

- Start with the control evolution
- Compare strategies
- Explore a greenhouse example
- Explore an indoor-farm example
- View the reference architecture

## Core idea

A greenhouse or indoor farm is not controlled by a single thermostat. It is a dynamic, coupled system where heating, cooling, ventilation, dehumidification, air movement, lighting, irrigation, CO₂, shading, and crop transpiration affect one another.

The question is not merely:

> “What should the temperature setpoint be?”

It becomes:

> “Which combination of actions should the facility take now, given current conditions, forecasts, crop state, equipment limits, energy cost, disease risk, and uncertainty?”

## Visual concept

Illustrate a facility with a layered overlay:

- **Blue paths:** air and heat movement.
- **Teal paths:** water and humidity movement.
- **Yellow paths:** energy and lighting load.
- **Green paths:** crop physiological effects.
- **Orange paths:** actuator commands.
- **Red boundaries:** safety limits and hard constraints.

## The short answer

A modern CEA control stack is usually not one “AI controller.” It is a hierarchy:

```text
Hard safety rules
        ↓
Fast local control loops
        ↓
State estimation and sensor validation
        ↓
Supervisory optimization / MPC
        ↓
Forecasting, learning, and model improvement
```

A graph organizes the relationships. Multivariable control coordinates decisions. Bayesian methods represent and update uncertainty.

---

# 2. Why CEA Control Is Difficult

## The coupled-system problem

CEA environments are coupled: one control action changes several outcomes, often in competing directions.

### Example: A cooling decision in a greenhouse

Opening roof vents may:

- Lower air temperature.
- Lower relative humidity if outside air is dry.
- Raise relative humidity if outside air is humid and the crop remains transpiring.
- Reduce CO₂ concentration through air exchange.
- Change leaf temperature due to air speed and convective transfer.
- Increase irrigation demand later in the day.
- Change pest pressure or spore movement.
- Save compressor energy while potentially increasing heating demand overnight.

A single-loop controller cannot see the whole trade space unless its rules become increasingly complex and brittle.

## Two recurring facility examples

The rest of the site returns to two reference facilities.

### Reference Facility A: Multi-bay greenhouse

**Configuration:**

- Four production bays with different crops or crop stages.
- Shared central heating loop.
- Bay-level unit heaters and circulation fans.
- Ridge vents, sidewall vents, energy curtains, and shade curtains.
- Pad-and-fan cooling or mechanical cooling/dehumidification.
- CO₂ injection by bay.
- Bench irrigation and fertigation zones.
- Outdoor weather station, PAR sensors, zone sensors, substrate sensors, and selected leaf-temperature measurements.

**Typical conflicts:**

- Ventilation cools but loses CO₂.
- Dehumidification costs energy but protects dewpoint margin.
- Lighting and CO₂ improve crop productivity but add heat or operating cost.
- A shared boiler or chiller creates competition among bays.
- Wind makes one side of the facility behave differently from another.

### Reference Facility B: Indoor vertical farm

**Configuration:**

- Six grow rooms or stacked grow zones.
- Sealed or semi-sealed rooms.
- LED fixtures with dimming and spectral channels.
- Fan-coil units, DX systems, or chilled-water coils.
- Dedicated outdoor air system or desiccant/dehumidification plant.
- Variable-speed recirculation fans.
- CO₂ injection.
- Hydroponic reservoirs, pumps, dosing, UV treatment, and irrigation manifolds.
- Dense sensor network for air climate, solution conditions, equipment condition, and energy metering.

**Typical conflicts:**

- Dimming lights reduces heat and energy use, but changes DLI and plant development.
- Dehumidification load tracks crop transpiration and irrigation events.
- Recirculation improves uniformity but adds fan heat and energy use.
- Shared refrigeration capacity must be allocated among rooms.
- Local microclimates can diverge even when room-average sensors look acceptable.

---

# 3. The Evolution of CEA Control

## 3.1 Manual and timer-based operation

### What it is

Operators act from observations, weather forecasts, crop knowledge, and schedules. Timers trigger irrigation, lighting, ventilation, curtains, or CO₂.

### Greenhouse example

A grower opens vents at 9:00 AM, closes energy curtains at sunset, runs circulation fans during the day, and irrigates tomatoes at fixed times.

### Indoor-farm example

A leafy-greens farm runs LEDs from 6:00 AM to 10:00 PM, irrigates every 30 minutes, and uses fixed dehumidifier staging based on time of day.

### Strengths

- Transparent and easy to understand.
- Low initial cost.
- Uses valuable human contextual knowledge.
- Works acceptably in stable, simple operations.

### Limitations

- Slow reaction to changing weather or crop demand.
- Cannot reliably optimize coupled objectives.
- Depends heavily on operator availability and consistency.
- Does not generate a reusable model of why decisions worked.

### Teaching illustration

```text
Weather forecast + operator observation
                ↓
      Human decision / schedule
                ↓
     Vents, curtains, fans, irrigation
                ↓
       Crop and facility response
```

### Key lesson

Manual control is not “wrong.” It is the original supervisory controller—but its rules live in people rather than in tested, observable, repeatable software.

---

## 3.2 On/off control and hysteresis

### What it is

A sensor is compared to a threshold. Equipment turns on or off when the threshold is crossed. Hysteresis prevents rapid switching.

```text
If RH > 80%, start dehumidifier
If RH < 75%, stop dehumidifier
```

### Greenhouse example: Basic humidity control

A greenhouse controller starts a unit heater and opens a small vent when relative humidity rises above 85%, then stops when RH falls below 80%.

### Indoor-farm example: Room-temperature staging

An indoor farm starts compressor stage 1 above 75°F, stage 2 above 77°F, and turns stages off as temperature falls below lower thresholds.

### Strengths

- Robust and easy to commission.
- Easy to troubleshoot.
- Appropriate for discrete equipment.
- Useful as a fallback mode even in advanced systems.

### Failure mode: interacting loops

In a greenhouse, a temperature loop may call for heat while a humidity loop opens vents. The result can be:

- Simultaneous heating and ventilation.
- Excess fuel use.
- Poor CO₂ retention.
- Unnecessary equipment cycling.

In an indoor farm, the temperature loop may cool while the RH loop calls for reheat or dehumidification. The local loops may each be correct but jointly inefficient.

### Teaching illustration

```text
Temperature sensor ──→ thermostat ──→ cooling stage
Humidity sensor ─────→ humidistat ──→ dehumidifier
CO₂ sensor ──────────→ threshold ──→ injection valve

No loop knows what the other loops are doing.
```

### Key lesson

On/off logic is a foundation, not a complete facility strategy. It is excellent for safety limits and basic equipment control, but weak at coordination.

---

## 3.3 PID control

### What it is

PID control continuously adjusts an actuator based on:

- **P — proportional error:** how far the measured value is from target.
- **I — integral error:** how long the deviation has persisted.
- **D — derivative error:** how quickly the measurement is changing.

A simplified form is:

\[
u(t) = K_P e(t) + K_I \int e(t)dt + K_D \frac{de(t)}{dt}
\]

### Greenhouse example: Variable-speed circulation fan

A circulation fan is modulated to maintain a pressure differential or a target air-mixing proxy. Rather than switching fully on and off, the controller adjusts fan speed smoothly.

### Indoor-farm example: Chilled-water valve control

A PID loop modulates a chilled-water valve to hold supply-air temperature leaving a coil near target.

### Strengths

- Fast and reliable for a well-defined local process.
- Excellent for continuous actuators: VFDs, valves, dimmers, dampers.
- Familiar to PLC programmers, HVAC technicians, and industrial operators.
- Requires little computational infrastructure.

### Limitations

- A PID loop sees one controlled variable and one principal actuator.
- Coupling between loops complicates tuning.
- Feedforward and schedule logic must be added separately.
- It does not naturally reason about future weather, equipment constraints, energy tariffs, or crop risk.

### Design principle

In advanced CEA systems, PID should usually remain at the equipment level.

Examples:

- Fan-speed PID.
- Supply-air temperature PID.
- Pump pressure PID.
- Valve-position PID.
- CO₂ flow PID.
- Nutrient dosing PID.

The system above it should decide targets, limits, and operating modes.

### Key lesson

PID is not obsolete. It is the fast reflex layer. The issue is using it alone to solve a facility-scale coordination problem.

---

## 3.4 Feedforward and rule-based supervisory control

### What it is

Feedforward acts on a known disturbance before the controlled variable has drifted. Rule-based supervisory control coordinates multiple simple rules.

### Greenhouse example: Solar-gain anticipation

At 10:00 AM, forecast irradiance indicates a fast solar-load increase. Before indoor temperature rises too far, the controller:

- Pre-positions shade curtains.
- Increases ridge-vent opening.
- Stages circulation fans.
- Reduces heating demand.
- Delays CO₂ enrichment if ventilation is likely to increase.

### Indoor-farm example: Lights-on humidity forecast

Before LEDs ramp to full intensity, the controller predicts rising leaf temperature and transpiration. It starts dehumidification and increases air circulation in advance.

### Typical rules

```text
IF outside dewpoint is lower than indoor dewpoint
AND outside temperature is within acceptable range
THEN prefer ventilation-assisted dehumidification.

IF energy curtain is deployed
AND condensation margin is shrinking
THEN increase air circulation before opening vents.

IF electricity price is high
AND DLI is ahead of schedule
THEN reduce lighting intensity within crop constraints.
```

### Strengths

- Captures operator expertise.
- More explainable than opaque machine learning.
- Can create sensible mode selection.
- Low computational burden.

### Limitations

- Rule count grows rapidly with system complexity.
- Conflicts among rules are hard to manage.
- Tuning thresholds becomes a manual, ongoing burden.
- Rules generally optimize one condition at a time, not all tradeoffs jointly.

### Key lesson

Rule engines are valuable for mode selection, operational policy, and safety envelopes. They become fragile when asked to approximate continuous, coupled optimization entirely through nested if/then logic.

---

## 3.5 Multivariable control and MIMO control

### What it is

MIMO means **multiple-input, multiple-output** control. The controller treats interactions explicitly.

For a simplified zone:

\[
\begin{bmatrix}
T \\
D \\
C
\end{bmatrix}_{t+1}
=
A
\begin{bmatrix}
T \\
D \\
C
\end{bmatrix}_{t}
+
B
\begin{bmatrix}
q_{cool} \\
q_{heat} \\
f_{vent} \\
f_{fan} \\
q_{CO_2}
\end{bmatrix}_{t}
+E
\begin{bmatrix}
T_{out} \\
D_{out} \\
S \\
\tau_{crop}
\end{bmatrix}_{t}
\]

Where:

- \(T\) is air or canopy temperature.
- \(D\) is dewpoint or humidity state.
- \(C\) is CO₂ concentration.
- \(q_{cool}\), \(q_{heat}\), \(f_{vent}\), \(f_{fan}\), and \(q_{CO_2}\) are actions.
- \(S\) is solar load.
- \(\tau_{crop}\) is crop transpiration.

### Greenhouse example: Coordinated morning climate transition

At sunrise, the greenhouse must transition from cool, humid overnight conditions to productive daytime climate.

A multivariable controller jointly decides:

- How quickly to retract the energy curtain.
- Whether to use heating, ventilation, or mechanical dehumidification.
- How much circulation to apply to equalize crop microclimate.
- When CO₂ injection becomes economical relative to expected vent position.
- Whether to delay irrigation until condensation risk is lower.

### Indoor-farm example: Managing lights, latent load, and cooling

When LED power rises, an indoor farm faces simultaneous sensible heat and latent load changes. A MIMO controller coordinates:

- LED dimming or ramp rate.
- Cooling-coil capacity.
- Dehumidification capacity.
- Reheat strategy.
- Room recirculation fan speed.
- CO₂ injection.
- Irrigation pulse timing.

### Strengths

- Explicitly handles coupling.
- Reduces “fighting loops.”
- Supports tradeoffs among climate, crop conditions, energy, and equipment wear.
- Forms the technical basis for MPC.

### Limitations

- Requires system identification, engineering models, or reliable empirical models.
- Can become difficult to maintain if represented as one dense monolithic model.
- Does not automatically handle future constraints or uncertainty unless extended.

### Key lesson

MIMO is the point where the controller stops treating humidity, temperature, CO₂, and equipment as independent subsystems.

---

## 3.6 Model Predictive Control (MPC)

### What it is

MPC predicts future system behavior over a horizon, chooses an action sequence that minimizes a cost, applies the first action, measures again, and repeats.

```text
Measure current state
        ↓
Forecast disturbances and crop load
        ↓
Predict future states for candidate actions
        ↓
Optimize under constraints
        ↓
Apply only the first action
        ↓
Repeat after the next measurement
```

### A generic CEA objective

\[
\min_{u_{t:t+H}}
\sum_{\tau=t}^{t+H}
[
 w_T J_T +
 w_{VPD} J_{VPD} +
 w_{DP} J_{dewpoint} +
 w_{CO_2} J_{CO_2} +
 w_E J_{energy} +
 w_W J_{wear} +
 w_R J_{crop-risk}
]
\]

subject to equipment, comfort/crop, resource, and safety constraints.

### Greenhouse example: Night humidity without wasting heat

**Situation:**

- Outdoor air is cold and dry.
- The crop is transpiring slowly but RH is rising under energy curtains.
- A boiler has limited capacity shared by all four bays.
- One bay contains a disease-sensitive crop.

**A conventional approach:**

- Open vents on RH high.
- Add heat to recover temperature.
- Repeat as RH oscillates.

**An MPC approach:**

It forecasts the next two hours and chooses a coordinated plan:

- Increase horizontal airflow first to reduce localized condensation risk.
- Use a small, bounded vent opening only while outside air remains sufficiently dry.
- Allocate boiler capacity preferentially to the disease-sensitive bay.
- Keep curtains mostly deployed to conserve energy.
- Delay noncritical irrigation pulses.
- Avoid a compressor start if the predicted risk can be controlled through ventilation and mixing.

**Why this differs:**

MPC can decide that a modest short-term temperature deviation is preferable to a costly or equipment-intensive action, while still satisfying hard crop-safety limits.

### Indoor-farm example: DLI-aware energy optimization

**Situation:**

- The farm must deliver a daily light integral target.
- A utility peak-price window occurs from 4:00 PM to 8:00 PM.
- Cooling and dehumidification capacity are constrained.
- Some rooms are closer to harvest and have more valuable quality constraints.

**An MPC approach:**

- Shifts a portion of allowable light delivery outside the peak-price window.
- Reduces LED intensity before the high-price period without violating DLI completion.
- Pre-cools or pre-dehumidifies within crop-safe bounds.
- Schedules room-level lighting to avoid simultaneous refrigeration peaks.
- Protects high-value rooms from aggressive climate relaxation.

### Strengths

- Looks ahead using weather, tariff, and production forecasts.
- Handles hard and soft constraints explicitly.
- Coordinates many inputs and outputs.
- Can optimize cost, crop risk, quality, energy, and wear together.
- Supports explainable decision traces if designed well.

### Limitations

- Depends on model quality and sensor reliability.
- Requires a solver, data pipeline, fallback behavior, and careful commissioning.
- Badly specified objectives can optimize the wrong behavior very efficiently.

### Key lesson

MPC is not just “a smarter PID.” PID reacts to error. MPC plans under a model and constraints.

---

## 3.7 Economic MPC

### What it is

Economic MPC optimizes a real business or resource objective rather than only tracking fixed setpoints.

### Greenhouse example: Crop-risk-adjusted energy control

Instead of treating 72°F and 75°F as equally wrong on opposite sides of a target, the controller considers:

- Gas or electrical cost.
- Hourly utility demand charges.
- Disease risk from low leaf-to-dewpoint margin.
- CO₂ loss through ventilation.
- Crop growth value during a high-light period.
- Wear from compressor starts.
- Relative market value of each crop bay.

The controller can choose a climate trajectory—not just a static setpoint—that minimizes total expected operating cost while protecting crop quality.

### Indoor-farm example: Revenue-aware lighting and climate allocation

A vertical farm has three crop programs:

- Premium basil with tight aroma/quality requirements.
- Standard lettuce with broad climate tolerance.
- Trial genetics with uncertain response.

Economic MPC may allocate limited cooling and dehumidification capacity first to the basil room, permit a wider deadband in lettuce, and collect carefully bounded data from the trial room.

### Important warning

Economic MPC should not mean “maximize short-term energy savings.” The objective must include non-financial costs:

- Quality loss.
- Yield loss.
- Crop-cycle delay.
- Disease risk.
- Food safety risk.
- Equipment reliability.
- Operator intervention burden.

### Key lesson

The controller’s objective function is a codified operating philosophy. It determines what the system treats as expensive, valuable, or unacceptable.

---

## 3.8 Robust MPC and stochastic MPC

### What they are

Both strategies address imperfect forecasts and imperfect models.

- **Robust MPC:** assumes disturbances or model errors remain inside defined bounds and chooses actions that stay safe for the worst credible case.
- **Stochastic MPC:** represents uncertainty using scenarios or probability distributions and optimizes expected outcome while respecting risk constraints.

### Greenhouse example: Sudden weather change

**Forecast:** cool, dry night.

**Reality:** wind shifts, outside humidity rises, and cloud cover changes heat loss.

A naive MPC built around one forecast can under-ventilate or over-ventilate. A robust controller assumes a range of outside temperatures, dewpoints, and wind-driven infiltration levels.

A stochastic controller may consider many forecast scenarios, assigning probabilities to each.

### Indoor-farm example: Uncertain dehumidifier capacity

A dehumidification unit nominally removes 100 lb/h, but actual performance depends on coil condition, return-air state, defrost behavior, and maintenance condition.

- A deterministic controller assumes 100 lb/h.
- A robust controller plans as if available capacity may be as low as 75 lb/h.
- A stochastic controller uses a distribution, perhaps with a low-probability but consequential 60 lb/h scenario.

### Chance constraint illustration

A stochastic controller may enforce:

\[
P(
\text{dewpoint margin} \geq 2°F
) \geq 0.99
\]

Meaning: maintain at least a 2°F condensation-safety margin with at least 99% modeled confidence.

### Key lesson

Robustness buys protection against bad outcomes. Stochastic control can be less conservative when the system has credible probability estimates and accepts quantified risk.

---

## 3.9 Distributed and hierarchical control

### What it is

Large facilities are decomposed into local controllers coordinated by a supervisory layer.

### Greenhouse example: Bay agents with a shared boiler

Each greenhouse bay has local climate control. A higher-level coordinator allocates scarce boiler, chiller, CO₂, or electrical capacity.

```text
Bay A controller ─┐
Bay B controller ─┼─→ Shared-resource coordinator ─→ Boiler / chiller allocation
Bay C controller ─┤
Bay D controller ─┘
```

Each bay communicates requests such as:

- Required heat to remain within crop-safe limits.
- Predicted latent load.
- Value or priority of maintaining an ideal climate.
- Current risk level.
- Flexibility available for temporary relaxation.

The coordinator returns:

- Capacity allocation.
- Resource price signal.
- Updated operating envelope.
- Curtailment instruction if necessary.

### Indoor-farm example: Room-level climate with plant-wide refrigeration limit

Six rooms operate independently most of the time. During a simultaneous lights-on period, refrigeration demand threatens a plant peak or exceeds available capacity.

A plant coordinator may:

- Sequence LED ramp-up by room.
- Allocate dehumidification capacity according to crop risk.
- Request a small temperature deadband expansion in low-priority rooms.
- Schedule irrigation pulses to avoid simultaneous latent-load spikes.

### Why graphs matter here

The facility is naturally a network:

- Rooms connect to shared utilities.
- Zones connect through air paths.
- Equipment connects to electrical panels.
- Crop decisions connect to production priorities.

A graph formalism makes those relationships explicit rather than burying them in controller-specific code.

### Key lesson

Hierarchical control preserves local resilience. If the supervisory optimizer fails, local PLC loops can continue operating safely.

---

## 3.10 Graph-structured control

### What it is

Graph-structured control represents the facility as nodes and typed edges. It is an architectural and modeling approach—not one mandatory control algorithm.

### Node types

- Climate zone.
- Air volume.
- Crop canopy.
- Irrigation zone.
- Reservoir.
- HVAC unit.
- Dehumidifier.
- Fan.
- Curtain.
- Vent.
- Light fixture or lighting group.
- CO₂ manifold.
- Sensor.
- Electrical panel.
- Water, chilled-water, hot-water, or refrigerant resource.
- Forecast source.
- Production objective.

### Edge types

- Airflow path.
- Heat-transfer path.
- Moisture-transfer path.
- Electrical dependency.
- Hydraulic dependency.
- Communication dependency.
- Causal influence.
- Control authority.
- Shared-capacity constraint.
- Data provenance.
- Maintenance dependency.

### Edge metadata

An edge can carry:

- Sign of influence.
- Nominal gain.
- Delay.
- Time constant.
- Capacity limit.
- Confidence.
- Source of evidence.
- Last calibration date.
- Model form.
- Safety classification.

### Greenhouse example: Cross-bay humidity propagation

A greenhouse has two adjacent bays connected through open doors and an imperfect air barrier.

```text
Bay 1 canopy ── moisture generation ──→ Bay 1 air
Bay 1 air ── air exchange ──→ Bay 2 air
Bay 2 air ── dewpoint margin ──→ Bay 2 disease-risk state
Bay 2 fan ── mixing effect ──→ Bay 2 canopy microclimate
```

A graph representation makes it possible to trace why a humidity issue in Bay 2 may originate from irrigation or crop transpiration in Bay 1.

### Indoor-farm example: Shared electrical and refrigeration graph

```text
Room 1 LEDs ─┐
Room 2 LEDs ─┼─→ Electrical panel A ─→ Utility demand charge
Room 3 HVAC ─┤
Dehumidifier ─┘

Room 1 latent load ─┐
Room 2 latent load ─┼─→ Central dehumidification plant
Room 3 latent load ─┘
```

This graph allows the controller to see that a lighting decision has both an immediate electrical consequence and a delayed cooling/dehumidification consequence.

### What graph structure provides

- Better system decomposition.
- More maintainable models.
- Reuse across repeated bays or rooms.
- Better fault tracing.
- Easier addition of new equipment or sensors.
- Sparse computation instead of dense all-to-all relationships.
- An explainable system map for operators and engineers.

### What graph structure does not provide by itself

A graph is not automatically:

- A dynamic model.
- A controller.
- A causal proof.
- A probability model.
- A guarantee of stability.
- A substitute for calibration and validation.

### Key lesson

A graph is the structure of the control problem. The actual controller might still be PID, MPC, distributed MPC, rules, robust optimization, or Bayesian decision-making.

---

## 3.11 Bayesian estimation and Bayesian control

### What it is

Bayesian methods represent uncertain states and parameters as probability distributions, then update them as evidence arrives.

Instead of assuming:

\[
\text{transpiration coefficient} = 1.0
\]

the system represents:

\[
P(\text{transpiration coefficient} \mid \text{crop stage, sensor data, light, irrigation history})
\]

### Important distinction

A weighted graph is not necessarily Bayesian.

- A graph edge weight of `0.65` might mean a fixed engineering gain.
- A graph edge weight of `0.65 ± uncertainty` might be an estimated parameter.
- A Bayesian model defines a probability distribution, priors, likelihoods, and posterior updates.

Bayesian inference becomes part of **control** when those updated beliefs affect the selected action.

### Greenhouse example: Sensor drift versus real humidity event

A greenhouse RH sensor suddenly reads 92%.

Possible explanations include:

- Actual rise in humidity due to crop transpiration.
- Recent irrigation event.
- Local sensor wetting or condensation.
- Sensor drift.
- Reduced circulation fan output.
- A partially failed dehumidifier.
- Unexpected infiltration from weather conditions.

A deterministic threshold controller reacts directly to 92% RH.

A Bayesian estimator compares evidence:

- Neighboring RH sensors.
- Dewpoint values.
- Leaf-temperature sensors.
- Fan power and airflow confirmation.
- Irrigation history.
- Dehumidifier electrical draw and condensate flow.
- Weather and vent position.

It updates belief over possible causes. If confidence is high that the local sensor is wet while neighboring sensors and dewpoint indicators are normal, it may flag sensor health rather than trigger a disruptive emergency ventilation sequence.

### Indoor-farm example: Crop transpiration uncertainty

A vertical farm observes unusually high dehumidification demand after lights-on.

The controller considers uncertainty in:

- Actual canopy density.
- Root-zone water temperature.
- Irrigation timing.
- Airflow uniformity.
- Leaf temperature.
- Sensor bias.
- Crop-stage response.

It updates its transpiration estimate and conservatively allocates latent-removal capacity until evidence stabilizes.

### Bayesian dual-control example

A controller may take an action partly to learn safely.

For example, in an indoor grow room with uncertain airflow mixing effectiveness:

- It increases fan speed modestly for a bounded test interval.
- It observes spatial temperature, RH, and CO₂ convergence.
- It updates the estimated airflow-to-uniformity relationship.
- Future control actions become more confident and more efficient.

This is the “dual” nature of the decision: the action regulates the environment and produces useful information.

### Key lesson

Bayesian control is a specialized uncertainty-aware layer inside a broader graph-structured control system. It is most valuable where uncertainty is consequential and changing—not necessarily everywhere.

---

## 3.12 Learning-based and graph-neural control

### What it is

Machine learning can model hard-to-capture dynamics, often as a residual added to a physics model. Graph neural networks can use topology to learn local interactions across repeated zones or devices.

### Greenhouse example: Learning cross-zone climate residuals

A physics model predicts heat and humidity transfer among bays. Actual behavior differs due to wind, curtain leakage, door usage, crop geometry, and local equipment condition.

A learned residual model estimates the difference:

\[
f_{actual} = f_{physics} + f_{learned residual}
\]

The learning component improves prediction of cross-bay propagation without replacing conservation-based logic.

### Indoor-farm example: Repeated rack-zone model

A vertical farm has many similar rack sections. A graph model learns that each rack node depends mostly on:

- Its local sensors.
- Its fixture output.
- Nearby airflow nodes.
- Neighboring racks.
- Shared HVAC supply conditions.

This can generalize more efficiently than a dense model that treats every sensor as equally related to every other sensor.

### Appropriate use

Use learning for:

- Residual modeling.
- Forecasting crop load or transpiration.
- Sensor fault detection.
- Anomaly detection.
- Soft-sensor estimation.
- Energy prediction.
- Maintenance prediction.
- Improving graph edge parameters.

Do not let an unverified learned controller directly bypass hard safety logic.

### Key lesson

The leading practical pattern is not “replace physics with AI.” It is “use AI where the physics is incomplete, uncertain, nonlinear, changing, or expensive to model.”

---

# 4. Side-by-Side Strategy Comparison

## Comparison table

| Strategy | Main question it answers | Greenhouse example | Indoor-farm example | Handles coupling? | Looks ahead? | Represents uncertainty? | Typical maturity |
|---|---|---|---|---:|---:|---:|---|
| Manual / timer | What does the operator normally do now? | Open vents and irrigate by schedule | Fixed photoperiod and irrigation schedule | No | Human only | Human judgment only | Universal |
| On/off + hysteresis | Is the measurement over or under a threshold? | Start heat/vent humidity response at RH threshold | Stage compressor by room temperature | Minimal | No | No | Universal |
| PID | How should one actuator continuously correct one process error? | Modulate fan speed for air movement target | Modulate chilled-water valve for discharge-air target | Limited | No | No | Universal |
| Feedforward + rules | What known disturbance or operating policy should change action now? | Deploy shade from irradiance forecast | Pre-stage dehumidification before lights-on | Partial | Limited | Usually no | Very common |
| MIMO | How should several actuators jointly control several variables? | Coordinate heat, vent, fan, CO₂, curtain | Coordinate LEDs, cooling, dehumidification, fans, CO₂ | Yes | Not necessarily | No | Established |
| MPC | What action plan best meets future targets under constraints? | Plan overnight humidity strategy | Shift lighting while managing cooling capacity | Yes | Yes | Optional | Mature/advanced |
| Economic MPC | What plan minimizes total operational and production cost? | Allocate heat and CO₂ by crop value and energy price | Optimize DLI, utility peak, and crop quality | Yes | Yes | Optional | Mature/advanced |
| Robust MPC | What action remains safe across bad-but-credible cases? | Protect dewpoint margin under uncertain weather | Plan for degraded dehumidifier capacity | Yes | Yes | Bounded uncertainty | Advanced |
| Stochastic MPC | What action best balances expected performance and quantified risk? | Use weather scenarios for venting plan | Use probabilistic latent-load forecast | Yes | Yes | Probability/scenarios | Advanced |
| Distributed MPC | How should local controllers coordinate shared resources? | Bays share boiler/chiller capacity | Rooms share refrigeration and electrical capacity | Yes | Yes | Optional | Advanced |
| Graph-structured control | What is connected to what, and how does structure guide control? | Model air, moisture, equipment, and bay dependencies | Model racks, rooms, utilities, and shared resources | Enables it | Optional | Optional | Strong architecture |
| Bayesian control | What do we believe under uncertainty, and how should belief alter action? | Distinguish sensor drift from true RH rise | Update transpiration/load estimate | Yes if combined | Yes if combined | Yes | Selective frontier |
| Graph-neural MPC | Can learned local graph dynamics improve scalable prediction/control? | Learn cross-bay transport residuals | Learn repeated rack-zone interactions | Yes | Yes | Often via ensembles/UQ | Research to early adoption |

---

# 5. A Single Problem Solved Twelve Ways

## Scenario: lights-on humidity surge in an indoor leafy-greens room

**Initial conditions:**

- Lights will ramp from 20% to 100% over 30 minutes.
- Crop transpiration will increase.
- The room is near its dehumidification capacity.
- The room contains a high-density canopy with uneven airflow.
- The farm has a daily-light target and a utility demand peak approaching later in the afternoon.
- There is a concern that one RH sensor is reading high relative to nearby sensors.

## Manual control

Operator watches RH and room temperature, starts extra dehumidification, increases fans, and possibly reduces lights.

**Advantage:** uses human contextual awareness.

**Weakness:** response may be inconsistent and late; actions may not be economically coordinated.

## On/off control

When RH exceeds 80%, start dehumidifier stage 2; when it exceeds 85%, reduce lights.

**Advantage:** simple and dependable.

**Weakness:** can cause abrupt cycling and ignores whether the reading is local sensor bias or a facility-wide problem.

## PID control

A humidity PID loop increases dehumidifier capacity proportional to RH error. A separate temperature PID loop adjusts cooling. A fan PID maintains static pressure.

**Advantage:** smooth local equipment response.

**Weakness:** humidity, cooling, fan heat, and lighting may still be managed by separate loops that conflict.

## Rule-based supervisory control

```text
IF lights ramp above 70%
AND RH trend is positive
THEN increase fan speed and stage dehumidifier early.

IF RH > 83%
AND DLI remaining is sufficient
THEN cap lighting at 85%.
```

**Advantage:** anticipates known lights-on behavior.

**Weakness:** many special cases accumulate as crop, equipment, and operating conditions change.

## MIMO control

The controller knows that LEDs, cooling, dehumidification, circulation fans, and irrigation affect temperature and humidity jointly. It chooses coordinated actuator movements.

**Advantage:** reduces interaction problems.

**Weakness:** it may still respond only to near-term behavior unless paired with forecasting.

## MPC

The controller predicts the humidity surge over the next 90 minutes. It decides to:

- Pre-stage dehumidification before the surge.
- Increase circulation to improve local uniformity.
- Slow the last portion of LED ramp slightly.
- Delay an optional irrigation pulse.
- Preserve enough capacity for the next expected transpiration increase.

**Advantage:** plans across time and constraints.

## Economic MPC

It also considers utility demand charge, DLI completion, crop priority, and equipment wear. It may accept a slightly slower LED ramp now to prevent an expensive coincident refrigeration peak later.

**Advantage:** decisions reflect actual operations, not just setpoint error.

## Robust MPC

It assumes transpiration may be 20% higher than predicted and dehumidifier capacity may be 15% lower than nominal. It begins preventive action earlier.

**Advantage:** safe under model/forecast error.

**Tradeoff:** can consume more energy or limit production flexibility.

## Stochastic MPC

It evaluates likely scenarios:

- Normal transpiration.
- High transpiration after an irrigation event.
- Sensor bias but otherwise normal room conditions.
- Partial dehumidifier degradation.

It chooses an action with low expected cost while enforcing a probability of avoiding dewpoint-risk conditions.

**Advantage:** manages risk quantitatively rather than through blanket conservatism.

## Distributed control

The room controller requests dehumidification capacity. The plant coordinator sees another room is entering a sensitive propagation period and allocates capacity based on risk and production priority.

**Advantage:** avoids each room behaving as if shared capacity is unlimited.

## Graph-structured control

The system traces the problem through a graph:

```text
LED ramp
  ↓
leaf temperature / transpiration
  ↓
latent load
  ↓
room RH and dewpoint
  ↓
dehumidifier demand
  ↓
shared refrigeration plant
  ↓
electrical demand and capacity constraint
```

It also includes a sensor-health node that receives evidence from neighboring sensors and equipment telemetry.

**Advantage:** gives engineering visibility into why a control action is recommended.

## Bayesian graph-structured MPC

The controller has uncertain estimates of crop transpiration, fan mixing effectiveness, and RH sensor health. It fuses evidence, updates posterior beliefs, and selects an uncertainty-aware MPC action.

**Advantage:** it can distinguish “act aggressively because risk is real” from “verify cautiously because the reading may be unreliable.”

**Tradeoff:** requires more data engineering, validation, compute, and governance.

---

# 6. Graph Methodology in Detail

## The facility as a typed graph

Represent the facility as:

\[
G = (V, E, \tau_V, \tau_E, A)
\]

Where:

- \(V\): nodes.
- \(E\): edges.
- \(\tau_V\): node types.
- \(\tau_E\): edge types.
- \(A\): attributes, models, constraints, and metadata.

## Example nodes for a greenhouse bay

| Node | Type | Example state | Example action or role |
|---|---|---|---|
| Bay A air | Climate zone | Temperature, dewpoint, CO₂, pressure | Controlled state |
| Bay A canopy | Crop state | Leaf temperature, transpiration proxy, disease-risk proxy | Controlled/estimated state |
| Ridge vent A | Actuator | Position, fault state | Air exchange |
| Curtain A | Actuator | Position, thermal/shading mode | Heat and radiation control |
| HAF fan A | Actuator | Speed, power, airflow confirmation | Air mixing |
| Boiler loop | Shared resource | Supply temperature, capacity | Heat allocation |
| Outdoor weather | Exogenous source | Temperature, dewpoint, wind, solar | Forecast and disturbance |
| RH sensor A1 | Sensor | Measurement, diagnostic score | Evidence source |
| Crop program A | Objective | Target climate, crop-stage priorities | Objective configuration |

## Example edges

| From | To | Edge type | Example metadata |
|---|---|---|---|
| Outdoor weather | Bay A air | Disturbance / infiltration | Wind-sensitive gain, delay, confidence |
| Ridge vent A | Bay A air | Control influence | Air-exchange curve, capacity, actuator lag |
| Bay A canopy | Bay A air | Moisture generation | Transpiration model, crop stage, uncertainty |
| Bay A air | Bay A canopy | Microclimate influence | Boundary-layer model, airflow dependence |
| Boiler loop | Unit heater A | Shared capacity | Flow allocation, priority, maximum output |
| RH sensor A1 | Bay A air | Measurement | Calibration status, variance, health score |
| Bay A air | Disease-risk objective | Causal / risk | Dewpoint-margin model, duration exposure |

## Why types matter

An edge from a fan to a climate zone is not the same as an edge from a sensor to an estimator, or a shared chiller to a room-level actuator. Typed graphs prevent the facility model from becoming a generic collection of vague “relationships.”

## Suggested edge schema

```yaml
edge_id: bay_a_canopy_to_bay_a_air_moisture
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
  last_validated: 2026-09-01
safety_critical: true
```

---

# 7. Bayesian Methods in Detail

## Bayesian is not “weighted” by default

A static weighted graph might contain:

```text
Fan speed → air mixing: 0.65
```

A Bayesian graph might contain:

```text
Fan speed → air mixing:
posterior mean: 0.65
credible interval: 0.48 to 0.79
model confidence changes with wind, curtain position, and crop density
```

The Bayesian version has formal uncertainty semantics.

## The Bayesian update cycle

```text
Prior belief about state/model
        ↓
New sensor and equipment evidence
        ↓
Likelihood of evidence under each explanation
        ↓
Posterior belief
        ↓
Control decision adjusted for confidence and risk
```

## High-value Bayesian targets in CEA

Not every variable needs Bayesian treatment. Prioritize relationships that are important, uncertain, variable, and hard to directly measure.

### Greenhouse candidates

- Crop transpiration model by cultivar and crop stage.
- Wind-driven infiltration.
- Effective vent conductance.
- Curtain leakage and thermal effect.
- Sensor drift and condensation bias.
- Cross-bay moisture movement.
- Dehumidifier or heat-pump capacity degradation.
- Leaf-wetness or condensation-risk latent state.

### Indoor-farm candidates

- Transpiration response to DLI, VPD, nutrient EC, root-zone temperature, and airflow.
- Local microclimate divergence across racks.
- Coil performance and dehumidification capacity.
- Actual supply-air distribution.
- Sensor health and spatial representativeness.
- Crop response to dimming, spectrum, and temperature trajectory.
- Water-borne disease-risk latent variables.

## Bayesian control decision example

### Situation

A greenhouse bay has a modeled 40% chance of breaching a dewpoint-risk threshold overnight under the nominal plan.

### Possible actions

- Do nothing.
- Add intermittent circulation.
- Use slight ventilation plus heat.
- Run mechanical dehumidification.
- Close curtain less aggressively.

### Uncertainty-aware choice

If uncertainty around crop transpiration and sensor health is high, the controller may choose a conservative plan that costs more but reduces risk across plausible scenarios. As confidence improves, it can operate closer to the economic optimum.

---

# 8. Recommended Reference Architecture

## Design philosophy

Build a system that can fail safely, remain usable during partial outage, expose its reasoning, and improve over time without placing production at the mercy of an unverified model.

## Layered architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Learning, calibration, simulation, model governance │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Forecasting, Bayesian estimation, uncertainty       │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Graph-structured economic / robust MPC              │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Supervisory mode logic and resource coordination    │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Local PID, staged equipment control, PLC logic     │
├─────────────────────────────────────────────────────────────┤
│ Layer 0: Hard interlocks, limits, e-stops, fail-safe states │
└─────────────────────────────────────────────────────────────┘
```

## Layer 0: Safety and equipment protection

Keep outside optimization and machine-learning authority:

- High/low temperature limits.
- Freeze protection.
- Pressure limits.
- Pump dry-run protection.
- Tank overflow prevention.
- Compressor anti-short-cycle timers.
- Fan and motor overload protection.
- Emergency ventilation or shutdown state.
- Communications-loss defaults.
- Manual local control.

## Layer 1: Fast local loops

Typical update period: milliseconds to seconds.

- VFD speed PID.
- Valve PID.
- Coil discharge-air PID.
- Pump pressure PID.
- Nutrient dosing PID.
- Local staging loops.

## Layer 2: Supervisory mode logic

Typical update period: seconds to minutes.

- Heating mode versus cooling mode.
- Economizer eligibility.
- Dehumidification strategy selection.
- Curtain operating modes.
- Plant-wide demand limiting.
- Equipment availability and maintenance lockouts.
- Operator policy enforcement.

## Layer 3: Graph-structured MPC

Typical update period: 1–15 minutes depending on thermal and biological dynamics.

- Predict zone conditions.
- Coordinate multi-zone actions.
- Enforce shared-resource constraints.
- Optimize climate trajectory and operating cost.
- Request bounded setpoints or envelopes from local controllers.

## Layer 4: Estimation and uncertainty

- State estimation for unmeasured conditions.
- Sensor validation and redundancy checks.
- Parameter estimation.
- Weather and solar forecast integration.
- Crop-transpiration estimation.
- Equipment capacity estimation.
- Forecast confidence and scenario generation.

## Layer 5: Learning and governance

- Shadow-mode models.
- Simulation and replay testing.
- Model versioning.
- Drift monitoring.
- Edge calibration and provenance.
- Human approval workflow for model changes.
- Root-cause and decision explanation views.

---

# 9. CEA Implementation Roadmap

## Stage 1: Instrument and make local control trustworthy

**Goal:** Create accurate observability and safe baseline operation.

- Inventory every sensor, actuator, point name, unit, range, calibration history, and failure mode.
- Establish local manual fallback and PLC-safe states.
- Add equipment telemetry: VFD speed, amps, valve position, compressor status, condensate flow, runtime, and faults.
- Use redundant sensors in high-risk areas.
- Log timestamps consistently and retain data at useful resolution.
- Build dashboards for climate, dewpoint margin, equipment state, energy, and alarms.

**Example deliverable:** A greenhouse bay dashboard that overlays indoor/outdoor dewpoint, vent position, curtain position, heater command, fan speed, irrigation events, and disease-risk proxy.

## Stage 2: Standardize a facility graph

**Goal:** Make system structure explicit.

- Define zone, equipment, sensor, resource, crop, and objective nodes.
- Define physical, control, measurement, and shared-capacity edges.
- Include units, delays, limits, and provenance.
- Establish a version-controlled configuration model.

**Example deliverable:** A typed graph that shows every bay’s thermal, air, moisture, CO₂, electrical, and water dependencies.

## Stage 3: Add supervisory rules and feedforward

**Goal:** Gain immediate operational improvements before complex optimization.

- Use weather, irradiance, light schedule, irrigation schedule, and tariff forecasts.
- Encode operator-proven operating modes.
- Add rule conflict detection and priority tiers.
- Track every rule activation and measured consequence.

**Example deliverable:** A lights-on pre-dehumidification strategy that activates only when forecast latent load and available equipment capacity justify it.

## Stage 4: Build and validate simple predictive models

**Goal:** Learn enough dynamics for safe MPC.

- Start with one representative zone or bay.
- Use simple heat/moisture balance models.
- Identify major gains, time constants, and delays from historical operations and controlled tests.
- Create forecast error metrics by variable and operating mode.
- Run the model in shadow mode before using it to command equipment.

**Example deliverable:** A two-hour forecast for temperature, dewpoint, and CO₂ that is compared with actual measured conditions after every run.

## Stage 5: Deploy constrained MPC as advisory, then supervisory

**Goal:** Introduce coordinated planning without losing operator trust.

- Begin with recommendations and explanations.
- Compare operator action versus MPC recommendation.
- Limit MPC authority to bounded setpoint adjustments.
- Keep hard constraints and local interlocks outside the optimizer.
- Add one objective at a time: first dewpoint risk, then energy, then crop-value weighting.

**Example deliverable:** An overnight humidity optimizer that recommends vent/heat/fan strategy and gives an expected energy-versus-risk comparison.

## Stage 6: Add uncertainty selectively

**Goal:** Improve decisions where unknowns are expensive or risky.

- Add sensor-health scoring.
- Quantify crop transpiration uncertainty.
- Model forecast uncertainty using scenarios.
- Estimate actual equipment capacity from telemetry.
- Use conservative fallbacks for low-confidence conditions.

**Example deliverable:** A controller that expands dewpoint safety margin when transpiration-model confidence is low.

## Stage 7: Scale through graph structure and distribution

**Goal:** Extend the platform across repeated zones and shared resources.

- Assign local zone controllers.
- Create shared-resource coordinators.
- Use graph neighborhood relationships rather than an all-to-all dense model.
- Add resource pricing or allocation logic.
- Standardize reusable zone templates.

**Example deliverable:** A plant-wide refrigeration allocator that coordinates six indoor rooms while preserving local room safety and autonomy.

## Stage 8: Introduce learning under governance

**Goal:** Improve models without unsafe online experimentation.

- Start with residual prediction, anomaly detection, and soft sensors.
- Use shadow evaluation, replay tests, and A/B-like operational comparisons.
- Require explicit validation and rollback for model changes.
- Monitor drift and out-of-distribution conditions.
- Preserve complete decision and data lineage.

**Example deliverable:** A learned transpiration residual model that improves dehumidification forecast accuracy while the MPC still relies on physics constraints and safe bounds.

---

# 10. Design Patterns and Anti-Patterns

## Strong design patterns

### Keep safety outside the optimizer

Hard equipment and crop-protection constraints should remain enforced at the PLC, safety controller, or deterministic rules layer.

### Prefer hybrid models

Use physics where you know it; learn residuals where you do not.

### Make uncertainty actionable

Do not compute uncertainty merely for dashboards. Use it to adjust margins, scenarios, constraints, authority, and fallback behavior.

### Use graphs for explainability and reuse

A typed graph should be inspectable by engineering and operations teams, not just a hidden model artifact.

### Treat the crop as a dynamic subsystem

The crop is not just a disturbance. It is a changing biological state that generates latent load, modifies airflow, responds to light, and determines economic value.

### Deploy in shadow mode

Before command authority, compare predicted trajectories and recommended actions to what actually occurs.

### Preserve operator authority

Provide override, explanation, alarms, and an auditable decision history. An operator must be able to understand when the system is in automatic, advisory, degraded, or fail-safe mode.

## Anti-patterns

### Replacing all controls with a black-box model

Do not discard deterministic protection and well-performing local PID loops because a learned model appears more sophisticated.

### Calling every weighted graph “Bayesian”

Static engineering coefficients, importance scores, and graph adjacency weights are not Bayesian unless they have explicit probability semantics and posterior updating.

### Optimizing setpoint error only

A controller can maintain perfect average room temperature while creating poor leaf-level climate, high disease risk, excessive cycling, or unnecessary energy expense.

### Optimizing energy without crop economics

Saving energy by lowering DLI, widening temperature limits, or accepting latent-load risk can cost more in yield, quality, cycle time, or crop loss.

### Ignoring sensor uncertainty

A sophisticated optimizer driven by a bad sensor can make highly confident wrong decisions.

### Building a dense monolith too early

Start with a small graph and a limited set of high-value interactions. Expand only after each edge and model component earns its complexity.

---

# 11. Worked Greenhouse Example

## Scenario: Overnight Botrytis-risk management in a tomato greenhouse

### Facility context

- Four bays, with Bay C containing a cultivar especially sensitive to condensation-related disease.
- Energy curtains close after sunset.
- Outside temperature is 38°F.
- Outside dewpoint is 28°F.
- Forecast wind increases after midnight.
- Bay C has recently been irrigated.
- Boiler capacity is limited because another bay is in a propagation stage requiring higher temperature.

### Control objectives

1. Avoid leaf-surface condensation and sustained high-risk dewpoint margin in Bay C.
2. Maintain crop-safe temperature in all bays.
3. Minimize gas use and unnecessary ventilation heat loss.
4. Avoid short cycling mechanical dehumidification.
5. Protect shared boiler capacity for the propagation bay.

## How strategies behave

### On/off threshold control

```text
If Bay C RH > 85%:
  open vent 10%
  start heater
If Bay C RH < 80%:
  close vent
  stop heater
```

Likely outcome: repeated heating and venting, possible oscillation, no awareness of cross-bay boiler priority or wind forecast.

### Rule-based control

```text
If curtain closed and dewpoint margin < 2°F:
  increase HAF fans
If outside dewpoint < inside dewpoint by 5°F:
  allow vent-assisted dehumidification
If boiler load > 90%:
  prioritize propagation bay
```

Likely outcome: materially better, but difficult to optimize timing and combinations across all bays.

### MIMO MPC

The controller predicts each bay’s temperature and moisture trajectory, accounts for anticipated wind and irrigation-related transpiration, and jointly chooses:

- Bay C fan speed.
- Bay C ventilation aperture.
- Boiler allocation by bay.
- Curtain crack position.
- Mechanical dehumidifier use.
- Irrigation hold or adjustment.

It may determine that a 12-minute, low-aperture vent pulse with targeted Bay C heat and high circulation has lower cost and risk than a full hour of compressor dehumidification.

### Robust / stochastic MPC

The controller runs plausible scenarios for:

- Higher-than-predicted wind infiltration.
- Higher Bay C transpiration.
- Lower boiler capacity.
- A partially degraded fan.

It chooses a plan that preserves Bay C dewpoint margin even in difficult scenarios, while making lower-priority bays absorb small, safe temperature deviations if necessary.

### Bayesian graph-structured version

The graph encodes:

- Crop transpiration in Bay C.
- Air transfer among bays.
- Curtain leakage.
- Shared boiler constraints.
- Sensor reliability.
- Disease-risk relation to leaf-to-dewpoint margin and exposure duration.

If Bay C’s RH sensor suddenly disagrees with neighboring measurements, the system does not blindly force a costly ventilation response. It evaluates competing explanations and may increase mixing, cross-check nearby sensors, and act conservatively until confidence improves.

---

# 12. Worked Indoor-Farm Example

## Scenario: Shared latent-load and electrical-capacity management

### Facility context

- Six rooms growing leafy greens.
- Each room has independently dimmable LEDs and recirculation fans.
- Rooms share a central dehumidification and refrigeration plant.
- The facility has a demand-charge peak threshold.
- Room 1 is a premium basil crop near harvest.
- Room 2 is lettuce with wide tolerance.
- Room 3 is a new cultivar with uncertain transpiration response.
- All rooms are scheduled to ramp lights in the same 30-minute window.

### Control objectives

1. Preserve quality in Room 1.
2. Avoid RH/dewpoint excursions in every room.
3. Maintain daily-light targets by the end of the photoperiod.
4. Avoid coincident electrical peak.
5. Do not exceed central refrigeration/dehumidification capacity.
6. Learn safely about Room 3’s crop response.

## How strategies behave

### Independent PIDs

Every room’s temperature loop calls for cooling and every humidity loop calls for dehumidification as conditions drift. LED schedules remain fixed.

Likely outcome: synchronized peak, capacity contention, and rooms responding as if central equipment were unlimited.

### Rule-based plant coordinator

```text
If plant kW > threshold:
  dim all rooms 10%
If central dehumidifier > 90%:
  delay irrigation in non-priority rooms
If Room 1 RH > limit:
  reserve dehumidification capacity for Room 1
```

Likely outcome: useful but crude curtailment. It may over-dim rooms or create undesirable crop-side effects.

### Distributed economic MPC

Each room forecasts its own crop load, DLI remaining, and climate trajectory. It submits flexibility and resource requests to a coordinator.

The coordinator may:

- Start Room 1 lighting first and reserve latent-removal capacity.
- Delay Room 2’s light ramp by 20 minutes, then compensate later within DLI limits.
- Reduce Room 2 fan speed only if uniformity remains acceptable.
- Spread ramps for Rooms 4–6.
- Assign a conservative latent-load reserve to Room 3.

### Bayesian dual-control extension

Because Room 3’s crop response is uncertain, the controller may choose a small, reversible test:

- Ramp Room 3 lights to 70% rather than 100%.
- Observe transpiration proxies, RH response, coil load, and spatial variation.
- Update its crop-load model.
- Determine whether full output is safe and economically appropriate.

The system gains useful knowledge while avoiding a high-risk capacity shock.

---

# 13. Operator-Facing Explanations

## Why explainability matters

Operators should not see only a command such as:

```text
Set ventilation to 18%
```

They should see a decision record:

```text
Decision: Vent Bay C at 18% for 12 minutes.

Primary reason:
  Reduce predicted dewpoint-risk exposure between 01:10 and 02:40.

Constraints considered:
  - Bay C leaf-to-dewpoint margin must remain above 2°F.
  - Boiler capacity is constrained by propagation Bay A.
  - Outdoor air is sufficiently dry for assisted dehumidification.
  - CO₂ enrichment is suspended during ventilation.

Alternatives rejected:
  - Mechanical dehumidification: higher projected energy cost and unnecessary compressor cycle.
  - No action: 37% predicted probability of dewpoint-margin breach.

Model confidence:
  Moderate. Bay C transpiration estimate uncertainty is elevated after irrigation.

Fallback:
  If RH or leaf-temperature measurements deviate beyond expected bounds, revert to conservative humidity mode and alert operator.
```

## Explanation components

Every supervisory decision should ideally include:

- Current state summary.
- Forecast used.
- Objective tradeoff.
- Active constraints.
- Selected action.
- Rejected alternatives.
- Confidence or uncertainty status.
- Expected outcome.
- Fallback condition.
- Model and configuration version.

---

# 14. Glossary

## Actuator

A device that changes the physical system: fan, damper, valve, pump, heater, compressor, light fixture, curtain motor, vent motor, or CO₂ valve.

## Bayesian inference

A method for updating probabilities about unknown states or model parameters after observing evidence.

## Chance constraint

A constraint expressed probabilistically, such as maintaining a dewpoint safety margin with at least 99% confidence under the model.

## Control horizon

The period into the future considered by an optimizer.

## Dewpoint margin

The difference between a relevant surface or leaf temperature and air dewpoint. Small or negative margin indicates condensation risk.

## Dual control

Control that both regulates the system and deliberately gathers information to improve later decisions.

## Economic MPC

Model predictive control that optimizes economic, resource, quality, and operating objectives rather than simply minimizing setpoint error.

## Edge

A relationship in a graph. In CEA it may represent airflow, heat transfer, moisture transfer, control authority, measurement, shared capacity, or causal influence.

## Graph-structured control

A control architecture that uses an explicit network of nodes and typed relationships to model and coordinate a distributed system.

## MIMO

Multiple-input, multiple-output control: several actuators are coordinated to influence several coupled outcomes.

## Model Predictive Control (MPC)

A controller that predicts future system behavior, solves a constrained optimization problem, applies the first planned action, then repeats with fresh measurements.

## Node

An entity in a graph, such as a room, crop canopy, sensor, actuator, reservoir, HVAC unit, electrical panel, or objective.

## Robust MPC

MPC designed to satisfy constraints despite bounded uncertainty or model mismatch.

## Soft sensor

An estimated variable that is not directly measured, such as transpiration rate, leaf wetness risk, coil capacity, or local microclimate state.

## State estimation

Combining sensor data and a model to infer the true internal condition of a system, including conditions that are not directly measurable.

## Stochastic MPC

MPC that incorporates random or probabilistic uncertainty through scenarios or probability distributions.

## Supervisory control

A slower, higher-level layer that coordinates operating modes, setpoints, resource allocation, and objectives while local loops regulate individual devices.

---

# 15. Final Takeaway

The evolution of CEA control can be summarized as a widening scope of awareness:

```text
Manual control
  → reacts through human judgment

On/off and PID
  → regulates individual local variables

Rules and feedforward
  → captures known operating logic and disturbances

MIMO and MPC
  → coordinates coupled variables over time

Robust and stochastic MPC
  → plans despite uncertainty

Distributed control
  → coordinates modular zones and shared resources

Graph-structured control
  → makes the facility’s physical, operational, and informational structure explicit

Bayesian control
  → updates uncertain beliefs and changes action based on confidence

Learning-enhanced graph MPC
  → improves models from data while preserving physical constraints and safety layers
```

The most credible destination is not a magical autonomous controller. It is a transparent, layered, graph-structured control platform in which:

- Safety is deterministic.
- Local control is fast and dependable.
- Facility decisions are coordinated and predictive.
- Crop and equipment uncertainty are visible.
- Learning improves specific weak spots in the model.
- Operators can inspect, override, and trust the system.

For CEA, that is the practical meaning of advanced control: **better climate consistency, lower resource cost, fewer surprises, safer automation, and a system that becomes more knowledgeable without becoming less accountable.**
