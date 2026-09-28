import { mkdir, mkdtemp, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { modules } from '../js/catalog.js';
import { isPublished } from '../js/publication.js';
import { projectModule, draftReference } from './curriculum-records.mjs';
import { documentHtml } from './curriculum-documents.mjs';
import { planningMap } from './curriculum-planning.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const release = process.argv[2];
if (process.argv.length !== 3 || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(release ?? '') || release === '.' || release === '..')
  throw new Error('Usage: node scripts/export-curriculum.mjs <immutable-release-name>');
const parent = join(root, 'dist', 'curriculum');
await mkdir(parent, { recursive: true });
const destination = join(parent, release);
const stage = await mkdtemp(join(parent, '.build-'));
const files = {};
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
async function put(path, bytes) {
  await mkdir(dirname(join(stage, path)), { recursive: true });
  await writeFile(join(stage, path), bytes);
  files[path] = digest(bytes);
}

let browser;
let reserved = false;
try {
  const records = [];
  const published = modules.filter(isPublished);
  if (!published.length) throw new Error('No published modules to release');
  browser = await chromium.launch({ timeout: 30000 });
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light', reducedMotion: 'reduce' });
  await page.route('**/*', route => route.abort());
  for (const module of published) {
    if (!/^[a-z0-9-]+$/.test(module.id)) throw new Error('Unsafe module ID');
    const { default: teaching } = await import(pathToFileURL(join(root, 'modules', module.id, 'teaching.js')).href);
    const record = projectModule(module, teaching);
    records.push(record);
    await put(`sources/${module.id}-outline.md`, await readFile(join(root, 'modules', module.id, 'sources', 'outline.md')));
    for (const kind of ['teacher', 'student', 'slides']) {
      const html = documentHtml(record, kind, release);
      await put(`${module.id}/${kind}.html`, html);
      await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
      await page.locator('details').evaluateAll(nodes => nodes.forEach(node => { node.open = true; }));
      // HTML links remain relative to bundled sources. PDF hyperlinks must be
      // absolute because its print context has no file-system base URL.
      await page.evaluate(({ id, origin }) => {
        for (const link of document.querySelectorAll('a[href^="../"]')) {
          const path = link.getAttribute('href');
          if (path === `../sources/${id}-outline.md`) link.href = `${origin}modules/${id}/sources/outline.md`;
          else link.href = new URL(path.slice(3), origin).href;
        }
      }, { id: module.id, origin: record.academy.split('#')[0] });
      const pdf = await page.pdf({ format: 'A4', landscape: kind === 'slides',
        printBackground: true, tagged: true, outline: true, timeout: 60000,
        margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' } });
      if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error(`Invalid ${kind} PDF`);
      await put(`${module.id}/${kind}.pdf`, pdf);
    }
  }
  await put('curriculum.json', JSON.stringify({ schema: 1, release, modules: records,
    drafts: modules.filter(module => module.status === 'draft' && module.visibility === 'listed').map(draftReference),
    planning: planningMap(await readFile(join(root, 'docs', 'curriculum-module-map.md'), 'utf8')) }, null, 2));
  await put('LICENSE.md', await readFile(join(root, 'LICENSE.md')));
  for (const name of ['CC-BY-4.0.txt', 'MIT.txt'])
    await put(`LICENSES/${name}`, await readFile(join(root, 'LICENSES', name)));
  // mkdir, unlike rename over an empty directory, never overwrites an existing
  // release, including one created by a concurrent exporter.
  await mkdir(destination);
  reserved = true;
  await cp(stage, destination, { recursive: true });
  await writeFile(join(destination, 'manifest.json'), JSON.stringify({ schema: 1, release, files }, null, 2));
  console.log(`Released ${records.length} published module(s) with complete resources: ${destination}`);
} catch (error) {
  if (reserved) await rm(destination, { recursive: true, force: true });
  throw error;
} finally {
  await browser?.close();
  await rm(stage, { recursive: true, force: true });
}
