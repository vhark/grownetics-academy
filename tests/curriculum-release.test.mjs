import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import control from '../modules/cea-control/module.js';
import climate from '../modules/climate-design/module.js';
import teaching from '../modules/cea-control/teaching.js';
import { projectModule, draftReference } from '../scripts/curriculum-records.mjs';
import { planningMap } from '../scripts/curriculum-planning.mjs';
import { documentHtml } from '../scripts/curriculum-documents.mjs';

test('draft lessons cannot be delivered, but listed drafts retain a preview reference', () => {
  assert.throws(() => projectModule(climate, teaching), /published/);
  assert.match(draftReference(climate).url, /preview=1/);
  assert.equal(draftReference(climate).status, 'draft');
});

test('missing lesson activity, route requirements, local alternative, or source credit stops release', () => {
  for (const mutate of [
    value => { delete value.activities[control.lessons[0].id]; },
    value => { delete value.routes[0].supervision; },
    value => { value.alternatives = ' '; },
    value => { value.figures[0].modifications = ''; },
    value => { value.videos[0].rights = ''; }
  ]) {
    const incomplete = structuredClone(teaching);
    mutate(incomplete);
    assert.throws(() => projectModule(control, incomplete), /Missing|Incomplete/);
  }
});

test('projected content remains data-only with original source sections and a fixed Celsius display', () => {
  const record = projectModule(control, teaching);
  assert.equal(record.lessons.length, 8);
  assert.doesNotThrow(() => JSON.stringify(record));
  assert.ok(record.lessons.every(lesson => lesson.sections.length && lesson.source && lesson.quiz.explanation));
  assert.match(record.lessons.at(-1).sections[0].html, /°C/);
  assert.ok(record.lessons.every(lesson => !lesson.sections.some(section => /<script\b/i.test(section.html))));
});

test('pathway order never invents a prerequisite for FND-03', async () => {
  const map = planningMap(await readFile(new URL('../docs/curriculum-module-map.md', import.meta.url), 'utf8'));
  assert.equal(map.nodes.length, 27);
  assert.equal(map.pathways.length, 7);
  assert.deepEqual(map.nodes.find(node => node.id === 'FND-03').prerequisites, []);
  assert.deepEqual(map.nodes.find(node => node.id === 'FND-04').prerequisites, ['FND-02', 'FND-03']);
});

test('unexpected prerequisite grammar fails instead of silently losing an edge', () => {
  const line = '**FND-01 — Example** · Prerequisites: another module. **Question:** Example.';
  assert.throws(() => planningMap(`## Discover\n${line}`), /prerequisite/i);
});

test('teacher pack retains all lesson readings and answers; student pack excludes facilitator answers', () => {
  const record = projectModule(control, teaching);
  const teacher = documentHtml(record, 'teacher', 'review-2026-09-28-1');
  const student = documentHtml(record, 'student', 'review-2026-09-28-1');
  const slides = documentHtml(record, 'slides', 'review-2026-09-28-1');
  for (const lesson of record.lessons) {
    assert.ok(teacher.includes(lesson.sections[0].html));
    assert.ok(teacher.includes(lesson.quiz.explanation));
    assert.ok(student.includes(lesson.sections[0].html));
    assert.ok(slides.includes(lesson.title.replaceAll('&', '&amp;')) || slides.includes(lesson.title));
  }
  assert.match(teacher, /Facilitator answer notes/);
  assert.doesNotMatch(student, /Facilitator answer notes/);
  assert.match(student, /Observation and measurement worksheet/);
});
