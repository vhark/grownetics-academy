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
  `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.leaf}</svg>`;

export function greenhouse() {
  const plant = (x, y, scale = 1) =>
    `<g transform="translate(${x} ${y}) scale(${scale})"><path d="M0 0v-24" stroke="#648365" stroke-width="1.6"/><path d="M0-8C-18-8-16-22-16-22S0-23 0-8" fill="#91a67e"/><path d="M0-15C15-14 16-30 16-30S0-29 0-15" fill="#b0bf93"/><path d="M0-22C-10-26-5-36-5-36S4-32 0-22" fill="#79956e"/></g>`;
  let crops = "";
  for (let row = 0; row < 3; row++) {
    const sx = 130 + row * 57,
      sy = 310 + row * 29;
    crops += `<path d="m${sx - 15} ${sy + 3} 191-96 29 14-191 96Z" fill="#ccd5b6" stroke="#83967b" stroke-width=".7"/>`;
    for (let col = 6; col >= 0; col--)
      crops += plant(sx + col * 27, sy - col * 13.5, 0.65);
  }
  // Side posts end on the same floor plane; roof ridge rises above the gable.
  const ribs = Array.from(
    { length: 6 },
    (_, i) =>
      `<path d="M${95 + i * 46} ${310 - i * 23}V${210 - i * 23}L${190 + i * 46} ${182 - i * 23}L${285 + i * 46} ${305 - i * 23}V${405 - i * 23}" fill="none" stroke="#63816d" stroke-width="${i === 0 || i === 5 ? 1.8 : 1}" opacity=".8"/>`,
  ).join("");
  return `<svg class="greenhouse-svg" viewBox="0 0 610 475" role="img" aria-labelledby="greenhouse-title greenhouse-desc"><title id="greenhouse-title">One greenhouse. Many connected systems.</title><desc id="greenhouse-desc">An isometric greenhouse with crop beds, transparent roof panels, a ventilation fan, and paths showing how air, water, and energy connect.</desc><defs><pattern id="field-dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="#bbc6ae"/></pattern><pattern id="field-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0v5" stroke="#a5b391" stroke-width=".7"/></pattern><linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e8edde" stop-opacity=".7"/><stop offset="1" stop-color="#f8f9ef" stop-opacity=".15"/></linearGradient><marker id="flow-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="m1 1 5 3-5 3" fill="none" stroke="context-stroke" stroke-width="1.2"/></marker></defs><rect x="15" y="35" width="580" height="405" fill="url(#field-dots)"/><path d="m65 325 225 115 265-135-227-111Z" fill="url(#field-hatch)" opacity=".55"/><path d="m95 310 190 95 230-115-190-95Z" fill="#e1e6d5" stroke="#99aa8f"/><path d="m95 310 190 95v10L95 320Zm190 95 230-115v10L285 415Z" fill="#c1ceb2" stroke="#99aa8f" stroke-width=".6"/><path d="M95 310V210L325 95v100Z" fill="#dce6d4" opacity=".35"/><g>${crops}</g><path d="M95 210 190 182 420 67 325 95Z" fill="#e9edde" fill-opacity=".65" stroke="#6f8a72"/><path d="m190 182 230-115 95 123-230 115Z" fill="url(#glass)" stroke="#6f8a72"/><path d="M285 305 515 190v100L285 405Z" fill="#eef2e5" fill-opacity=".3"/><g>${ribs}</g><g stroke="#6f8a72" fill="none" stroke-width="1"><path d="m95 260 230-115M285 355l230-115M95 210l230-115M190 182 420 67M285 305 515 190M135 198 365 83M235 240 465 125"/><path d="m169 347 0-83 43 21v84"/><path d="m174 343 0-68 32 16v68"/><path d="m198 329 4 2" stroke-width="2"/></g><path d="m368 177 45-22 20 26-45 22Z" fill="#f8faf2" stroke="#718c76"/><path d="m368 177 4-24 45-22-4 24" fill="#e0e8d9" stroke="#718c76"/><g transform="translate(122 239) skewY(27)"><rect x="-15" y="-17" width="31" height="33" rx="2" fill="#eef2e7" stroke="#77917b"/><circle r="11" fill="none" stroke="#77917b"/><path d="M0 0C-13-11 5-15 0 0c15-7 12 12 0 0-2 16-16 4 0 0Z" fill="#9eaf93"/><circle r="2" fill="#5d7c64"/></g><g data-flow="air" stroke="#71979a" fill="none" stroke-width="1.7"><path d="M60 235C120 202 128 284 225 279S314 235 344 191" stroke-dasharray="5 5" marker-end="url(#flow-arrow)"/><path d="M421 139c27-37 49-23 62-56" marker-end="url(#flow-arrow)"/></g><g data-flow="water" stroke="#779594" fill="none" stroke-width="1.6"><path d="m128 324 170-86m-114 114 168-84m-111 114 170-85" stroke-dasharray="2 4"/><path d="M235 299q-18-24 1-47m54 26q-18-24 1-47m57 22q-18-24 1-47" stroke-dasharray="3 5" marker-end="url(#flow-arrow)"/></g><g data-flow="energy" stroke="#ba945b" fill="none" stroke-width="1.5"><circle cx="507" cy="58" r="19"/><path d="M507 30v-8m0 64v8m28-36h8m-64 0h-8m16-20-6-6m46 46 6 6m-46-6-6 6m46-46 6-6"/><path d="m477 90-30 38m16-49-54 54" stroke-dasharray="4 5" marker-end="url(#flow-arrow)"/></g><g class="diagram-label"><path d="M395 89V44h-55" stroke="#8b9c83" fill="none"/><circle cx="395" cy="89" r="3" fill="#738d70"/><text x="337" y="39" text-anchor="end">SENSE</text><path d="M102 252H38v51" stroke="#8b9c83" fill="none"/><circle cx="102" cy="252" r="3" fill="#738d70"/><text x="37" y="321" text-anchor="middle">RESPOND</text><path d="m437 330 39 23h58" stroke="#8b9c83" fill="none"/><circle cx="437" cy="330" r="3" fill="#738d70"/><text x="491" y="371">ADAPT</text></g><text x="307" y="458" text-anchor="middle" class="diagram-caption">A LIVING SYSTEM. NOT A SINGLE SETPOINT.</text></svg>`;
}

export function conceptArt(type) {
  const images = {
    graph:
      '<path d="m30 38 52-18 56 25-21 39-57 5-30-51m52-18-22 69m22-69 35 64M30 38l87 46M60 89l78-44"/><circle cx="30" cy="38" r="7"/><circle cx="82" cy="20" r="7"/><circle cx="138" cy="45" r="7"/><circle cx="117" cy="84" r="7"/><circle cx="60" cy="89" r="7"/>',
    sliders:
      '<path d="M20 27h130M20 55h130M20 83h130"/><rect x="46" y="18" width="13" height="18" rx="4"/><rect x="111" y="46" width="13" height="18" rx="4"/><rect x="73" y="74" width="13" height="18" rx="4"/><path d="m34 99 26-16 52-28 25-28" stroke-dasharray="3 5" opacity=".35"/>',
    uncertainty:
      '<path d="M15 91c37 0 27-69 66-69s29 69 74 69"/><path d="M15 91c42 0 36-48 66-48s30 48 74 48" opacity=".35"/><path d="M15 96h140M81 17v79" stroke-dasharray="3 4"/><path d="M15 91c37 0 27-69 66-69s29 69 74 69Z" fill="currentColor" opacity=".08"/>',
  };
  return `<svg viewBox="0 0 170 110" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${images[type]}</svg>`;
}
