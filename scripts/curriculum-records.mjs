import { isPublished, withPreview } from '../js/publication.js';
import { escapeHtml, moduleUrl } from '../js/ui.js';
import { formatTemperature } from '../js/preferences.js';

export { escapeHtml };
const academy = 'https://vhark.github.io/grownetics-academy/';
const present = value => typeof value === 'string' && !!value.trim();
function requiredText(object, keys, context) {
  for (const key of keys) if (!present(object?.[key])) throw new Error(`Missing ${context}: ${key}`);
}
function requiredList(object, key, context) {
  if (!Array.isArray(object?.[key]) || !object[key].length || object[key].some(value => !present(value)))
    throw new Error(`Missing ${context}: ${key}`);
}

// The Academy substitutes the visitor's display preference while evaluating lessons.
// Release readings have no unit-switching script, so derive the displayed Celsius text
// from the original semantic attributes, independently of the publisher's browser state.
function staticTemperatures(html) {
  return html.replace(/<span\b([^>]*\bdata-temperature-c="([^"]+)"[^>]*)>[^<]*<\/span>/g, (markup, attributes, raw) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) throw new Error('Invalid lesson temperature');
    const difference = /data-temperature-difference="true"/.test(attributes);
    const signed = /data-temperature-signed="true"/.test(attributes);
    const precision = Number(/data-temperature-precision="(\d+)"/.exec(attributes)?.[1] ?? 1);
    return `<span>${formatTemperature(value, { unit: 'C', difference, signed, precision })}</span>`;
  });
}

export function projectModule(module, teaching) {
  if (!isPublished(module)) throw new Error('Only published modules can be delivered');
  if (!teaching || teaching.schema !== 1) throw new Error(`Missing teaching resources: ${module.id}`);
  requiredText(teaching, ['audience', 'prerequisites', 'preparation', 'safety', 'sequence', 'rubricScale', 'alternatives', 'exampleEvidence'], 'teaching field');
  for (const key of ['materials', 'misconceptions', 'rubric']) requiredList(teaching, key, 'teaching list');
  if (!Array.isArray(teaching.prerequisiteIds) || teaching.prerequisiteIds.some(id => !present(id)))
    throw new Error('Incomplete teaching prerequisites');
  if (!Array.isArray(teaching.routes) || !teaching.routes.length) throw new Error('Incomplete activity route requirements');
  for (const route of teaching.routes) requiredText(route, ['id', 'label', 'equipment', 'supervision', 'outcome'], 'route requirement');
  if (new Set(teaching.routes.map(route => route.id)).size !== teaching.routes.length) throw new Error('Incomplete activity route IDs');
  if (!teaching.routes.some(route => route.id === 'design')) throw new Error('Incomplete local design route');
  if (!Array.isArray(teaching.figures) || !teaching.figures.length) throw new Error('Missing teaching figures');
  for (const figure of teaching.figures) requiredText(figure, ['html', 'caption', 'creator', 'source', 'rights', 'modifications'], 'figure source credit');
  if (!Array.isArray(teaching.videos) || !teaching.videos.length) throw new Error('Missing teaching videos');
  for (const video of teaching.videos) requiredText(video, ['title', 'creator', 'url', 'source', 'purpose', 'alternative', 'rights'], 'video source credit');
  for (const item of [...teaching.figures, ...teaching.videos])
    if (!/^https:\/\//.test(item.source) || (item.url && !/^https:\/\//.test(item.url))) throw new Error('Incomplete HTTPS source credit');
  if (!Array.isArray(module.lessons) || !module.lessons.length) throw new Error('Missing canonical lessons');
  if (!Array.isArray(module.glossary) || !module.glossary.length || module.glossary.some(item => !present(item.term) || !present(item.definition)))
    throw new Error('Missing canonical glossary');
  const lessonIds = new Set();
  for (const lesson of module.lessons) {
    requiredText(lesson, ['id', 'title', 'intro', 'takeaway', 'source'], 'canonical lesson');
    if (lessonIds.has(lesson.id)) throw new Error('Duplicate canonical lesson');
    lessonIds.add(lesson.id);
    if (!Array.isArray(lesson.objectives) || !lesson.objectives.length || !Array.isArray(lesson.sections) || !lesson.sections.length ||
        lesson.sections.some(section => !present(section.title) || !present(section.html)) ||
        !present(lesson.quiz?.question) || !Array.isArray(lesson.quiz?.options) || lesson.quiz.options.length < 2 ||
        !Number.isInteger(lesson.quiz.answer) || lesson.quiz.answer < 0 || lesson.quiz.answer >= lesson.quiz.options.length ||
        !present(lesson.quiz.explanation)) throw new Error(`Incomplete canonical lesson: ${lesson.id}`);
    requiredText(teaching.activities?.[lesson.id], ['prompt', 'evidence', 'expected'], `activity: ${module.id}/${lesson.id}`);
  }
  if (Object.keys(teaching.activities).some(id => !lessonIds.has(id))) throw new Error('Incomplete activity coverage: unknown lesson');
  const { id, title, summary, level, audience, objectives, prerequisites } = module;
  return {
    id, title, summary, level, audience, objectives, prerequisites,
    status: module.status, visibility: module.visibility, prerequisiteIds: [...teaching.prerequisiteIds],
    glossary: module.glossary.map(({ term, definition }) => ({ term, definition })),
    teaching: {
      schema: 1, audience: teaching.audience, prerequisites: teaching.prerequisites,
      preparation: teaching.preparation, materials: [...teaching.materials], safety: teaching.safety,
      sequence: teaching.sequence, routes: teaching.routes.map(({ id, label, equipment, supervision, outcome }) => ({ id, label, equipment, supervision, outcome })),
      rubric: [...teaching.rubric], rubricScale: teaching.rubricScale, alternatives: teaching.alternatives,
      exampleEvidence: teaching.exampleEvidence, misconceptions: [...teaching.misconceptions],
      prerequisiteIds: [...teaching.prerequisiteIds],
      figures: teaching.figures.map(({ html, caption, creator, source, rights, modifications }) => ({ html, caption, creator, source, rights, modifications })),
      videos: teaching.videos.map(({ title, creator, url, source, purpose, alternative, rights }) => ({ title, creator, url, source, purpose, alternative, rights })),
      activities: Object.fromEntries(module.lessons.map(lesson => {
        const { prompt, evidence, expected } = teaching.activities[lesson.id];
        return [lesson.id, { prompt, evidence, expected }];
      }))
    },
    academy: `${academy}${moduleUrl(id)}`,
    lessons: module.lessons.map(lesson => ({
      id: lesson.id, title: lesson.title, subtitle: lesson.subtitle, minutes: lesson.minutes,
      intro: lesson.intro, objectives: [...lesson.objectives],
      sections: lesson.sections.map(({ id, title, html }) => ({ id, title, html: staticTemperatures(html) })),
      takeaway: lesson.takeaway,
      quiz: { question: lesson.quiz.question, options: [...lesson.quiz.options], answer: lesson.quiz.answer, explanation: lesson.quiz.explanation },
      source: lesson.source, onlineLab: lesson.lab ?? null
    })),
    resources: Object.fromEntries(['teacher', 'student', 'slides'].map(kind => [kind, { html: `${id}/${kind}.html`, pdf: `${id}/${kind}.pdf` }]))
  };
}

export function draftReference(module) {
  if (module.status !== 'draft' || module.visibility !== 'listed') throw new Error('Only listed drafts have preview references');
  return { id: module.id, title: module.title, status: module.status, visibility: module.visibility,
    url: `${academy}${withPreview(moduleUrl(module.id))}` };
}
