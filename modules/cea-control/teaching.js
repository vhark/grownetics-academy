import { greenhouse } from './illustrations.js';

const activities = {
  'coupled-system': {
    prompt: 'Draw a greenhouse and an indoor room. Trace how ventilation, heating, lighting and CO₂ provision affect more than one measured quantity. Mark where the two facilities differ.',
    evidence: 'Two labeled system sketches, at least one conflicting pair of locally reasonable commands, and an explanation of the coordination needed.',
    expected: 'Opening a vent can reduce temperature while losing supplied CO₂ and changing moisture exchange. A supervisor can coordinate modes while reliable local feedback remains in place. Effects depend on outside conditions; arrows alone do not establish magnitudes.'
  },
  'control-evolution': {
    prompt: 'Use the lesson to compare local feedback, feedforward, predictive planning, robust MPC and stochastic MPC. Choose which capability addresses an anticipated lights-on disturbance and explain its assumptions.',
    evidence: 'A comparison table that separates feedback, prediction, bounded adverse cases and probability-based risk.',
    expected: 'Anticipation requires an input or disturbance model. Robust MPC protects against specified bounded cases; stochastic MPC makes distributions or scenarios explicit. Neither establishes safety beyond its models, constraints and implementation.'
  },
  'strategy-comparison': {
    prompt: 'Review the claim “our controller uses a facility graph”. List what follows from that claim and what evidence would still be needed to establish prediction, optimization, probability updates or stability.',
    evidence: 'A capability/evidence table and a justified recommendation for a stated facility need.',
    expected: 'A graph represents entities and relationships. Prediction, optimization, probabilistic inference and closed-loop stability require additional evidence. A technically appropriate combination can retain simpler local loops.'
  },
  'twelve-ways': {
    prompt: 'Compare the lesson’s responses to a lights-on humidity surge. Explain how a room-level action can affect daily light integral, shared dehumidification capacity and energy use.',
    evidence: 'A proposed coordinated response, an alternative, and the assumptions under which the choice should change.',
    expected: 'Local tuning alone cannot allocate a finite shared plant. The coordinator needs competing requests, available capacity and crop constraints. Uncertain sensor evidence is not proof that aggressive action is needed.'
  },
  'facility-graphs': {
    prompt: 'Sketch two growing rooms sharing an air-handling resource. Add a sensor and estimator. Type the physical-resource and information edges, then list their units, relevant delays, uncertainty and evidence sources. Mark unknown values as unknown.',
    evidence: 'A typed graph and an edge table separating measurement evidence from finite physical dependencies.',
    expected: 'A sensor-to-estimator edge represents evidence and its quality. A plant-to-room dependency represents a bounded resource relationship. A common unexplained edge weight loses engineering meaning; the graph is not proof of causality.'
  },
  'bayesian-control': {
    prompt: 'For a paper example only, assume prior sensor-fault probability 0.10, probability of a high reading given fault 0.80, and probability of a high reading given healthy operation 0.05. Calculate the updated fault probability after a high reading. Explain why this does not prove the plant needs more ventilation.',
    evidence: 'The calculation with prior, likelihood and posterior labeled, plus a limitation and a proposed independent check.',
    expected: 'The posterior is 0.10×0.80 / (0.10×0.80 + 0.90×0.05) = 0.64. These are invented teaching probabilities, not calibrated sensor statistics. Evidence of a possible fault does not establish the true crop condition. Any physical information-gathering action needs independent safety and operator authority.'
  },
  'control-architecture': {
    prompt: 'Trace a supervisory optimizer outage through the lesson’s six-layer architecture. Identify what remains authoritative, what continues locally, what the operator sees, and what evidence is needed before supervisory operation resumes.',
    evidence: 'An annotated authority diagram and an outage/recovery walkthrough grounded in the six source layers.',
    expected: 'Independent equipment protection and dependable local control remain effective. A failed optimizer cannot bypass them. Fallback behavior, visibility, operator authority and staged verification matter more than retaining the last command indefinitely.'
  },
  'real-world': {
    prompt: 'Compare the overnight greenhouse case with six rooms sharing one finite central plant. State a preferred action, an alternative, the evidence behind the tradeoff, and the conditions for changing or abandoning the plan.',
    evidence: 'A decision note with competing constraints, a reasoned allocation or night strategy, uncertainty, and a safe fallback.',
    expected: 'A coordinated night plan must remain credible when outside conditions or evidence change. Shared capacity allocation should account for risk and flexibility rather than equal curtailment alone. The decision, alternatives and route back to safe operation must remain visible.'
  }
};

export default {
  schema: 1,
  exampleEvidence: activities['bayesian-control'].expected,
  prerequisiteIds: [],
  figures: [{
    html: greenhouse(),
    caption: 'Conceptual greenhouse showing connected air, water and energy systems; not a scaled facility plan.',
    creator: 'Grownetics Academy contributors',
    source: 'https://vhark.github.io/grownetics-academy/#/modules/cea-control',
    rights: 'Original educational illustration, CC BY 4.0; see the bundled Academy license notice.',
    modifications: 'Unmodified source illustration; layout adapts to the printed resource.'
  }],
  misconceptions: [
    'A graph alone is not a controller or proof of causality.',
    'An updated probability is not proof of a crop condition.',
    'A successful teaching simulation is not equipment commissioning.',
    'Local feedback remains useful within a coordinated architecture.'
  ],
  audience: 'Independent learners and facilitated operator/technical study; school adaptation needs educator review.',
  prerequisites: 'Read the stated lesson prerequisites; clarify unfamiliar units and probability notation before using the relevant activity.',
  preparation: 'Read the source lesson and its quiz explanation. Prepare paper or an accessible document, a calculator for the probability activity, and a way to display the lesson. Open any optional Academy lab before the session.',
  materials: ['Paper or an accessible text/table editor', 'Calculator for the probability example', 'Optional browser for the Academy laboratory companions'],
  safety: 'These activities use paper reasoning and teaching simulations. Do not connect to or change real climate, dosing, lighting or irrigation equipment. A diagram or calculation is not commissioning evidence.',
  sequence: 'Use the published lesson reading estimate, then allow 15 minutes for the activity and 10 minutes for discussion and evidence review. Adapt pace to the learners; these are unpiloted estimates.',
  routes: [
    { id: 'design', label: 'Paper or accessible-document design', equipment: 'Paper or an accessible text/table editor; calculator for the probability example.', supervision: 'Facilitation is optional for independent technical study; no equipment operation is included.', outcome: 'Supports explanation and design reasoning, not installed-equipment competence.' },
    { id: 'simulation', label: 'Optional online Academy teaching lab', equipment: 'Browser and access to the stated online teaching lab.', supervision: 'Use only the teaching model; this route authorizes no real-system connection.', outcome: 'Supports reasoning about the stated teaching model, not real facility performance.' }
  ],
  rubric: [
    'Distinguishes observations, assumptions and causal claims.',
    'Uses the relevant units, relationships or probabilities correctly.',
    'Explains tradeoffs, uncertainty and limitations with evidence.',
    'Preserves safety and authority boundaries and explains alternatives.'
  ],
  rubricScale: 'For each criterion: 0 = absent or contradicted; 1 = partly explained; 2 = supported and bounded. This is a facilitator rubric, not automatic grading or a credential.',
  alternatives: 'Use text or a relationship table instead of drawing. Discuss the written worked example instead of watching video. Read the lesson’s explanation when an online lab is unavailable. These routes do not establish hands-on instrument or equipment competence.',
  videos: [{
    title: 'Lecture 1: Introduction and Basic Concepts',
    creator: 'James K. Roberge, MIT OpenCourseWare',
    url: 'https://www.youtube.com/watch?v=ToEFkUxFURg',
    source: 'https://ocw.mit.edu/courses/res-6-010-electronic-feedback-systems-spring-2013/resources/lecture-1-introduction-and-basic-concepts/',
    purpose: 'Optional undergraduate extension: compare a feedback block diagram with a CEA loop. The electronics lecture is not a greenhouse operating procedure.',
    alternative: 'Use the local-feedback and architecture explanations in the Academy lessons and the paper system-sketch activity.',
    rights: 'External link only. MIT OCW lists CC BY-NC-SA terms; do not bundle or relicense its video, slides or transcript under the Academy notice.'
  }],
  activities
};
