const paths = {
  overview:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  flask:
    '<path d="M9 3h6M10 3v7L4.5 19a1.3 1.3 0 0 0 1.1 2h12.8a1.3 1.3 0 0 0 1.1-2L14 10V3M7 15h10"/><path d="M10 18h.01M14 17h.01"/>',
  book: '<path d="M12 5v16M12 5C9 3 6 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/>',
  file: '<path d="M14 3H5v18h14V8l-5-5ZM14 3v5h5M8 12h8M8 16h6"/>',
  compare:
    '<path d="M8 3v18M16 3v18M3 8h10M11 16h10"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  graph:
    '<circle cx="5" cy="6" r="3"/><circle cx="19" cy="7" r="3"/><circle cx="11" cy="19" r="3"/><path d="m8 6 8 1M6 9l4 7m7-6-5 6"/>',
  sliders:
    '<path d="M4 7h16M4 17h16"/><rect x="7" y="4" width="4" height="6" rx="1"/><rect x="14" y="14" width="4" height="6" rx="1"/>',
  uncertainty:
    '<path d="M3 19c5 0 4-14 9-14s4 14 9 14M3 21h18"/><path d="M12 5v14" stroke-dasharray="2 3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  leaf: '<path d="M5 20c0-9 7-13 15-15 0 10-4 15-10 13M5 20l9-10"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9l10-6Zm-9 11 9 5 9-5M3 18l9 5 9-5"/>',
};
export const icon = (name, className = "") =>
  `<svg class="icon ${escapeHtml(className)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;

export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

const routePart = (value) =>
  encodeURIComponent(String(value)).replace(
    /[!'()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

export const moduleUrl = (moduleId) => `#/modules/${routePart(moduleId)}`;
export const lessonUrl = (moduleId, lessonId) =>
  `${moduleUrl(moduleId)}/lessons/${routePart(lessonId)}`;
export const labUrl = (moduleId, labId = "") =>
  `${moduleUrl(moduleId)}/labs${labId ? `/${routePart(labId)}` : ""}`;
export const referenceUrl = (moduleId, referenceId) =>
  `${moduleUrl(moduleId)}/reference/${routePart(referenceId)}`;
export const glossaryUrl = (moduleId, term = "") =>
  `${moduleUrl(moduleId)}/glossary${term ? `?term=${routePart(term)}` : ""}`;
