import {
  icon,
  escapeHtml,
  moduleUrl,
  lessonUrl,
  labUrl,
  referenceUrl,
  glossaryUrl,
} from "./ui.js";

export function initSearch({ modules, beforeOpen }) {
  const trigger = document.querySelector("#search-trigger");
  const dialog = document.querySelector("#search-dialog");
  const input = document.querySelector("#search-input");
  const results = document.querySelector("#search-results");
  const closeButton = document.querySelector("#search-close");
  const listeners = new AbortController();
  const options = { signal: listeners.signal };
  const template = document.createElement("template");
  const textOnly = (html) => {
    template.innerHTML = html || "";
    return template.content.textContent || "";
  };
  const index = [];
  const add = (module, entry, text) => {
    index.push({
      ...entry,
      moduleTitle: module.title,
      titleLower: entry.title.toLocaleLowerCase(),
      text: `${module.title} ${module.shortTitle || ""} ${entry.kind} ${text}`.toLocaleLowerCase(),
    });
  };

  for (const module of modules) {
    add(
      module,
      {
        title: module.title,
        kind: "Module",
        description: module.summary,
        url: moduleUrl(module.id),
        icon: "book",
      },
      `${module.title} ${module.summary} ${(module.objectives || []).join(" ")}`,
    );
    for (const lesson of module.lessons) {
      add(
        module,
        {
          title: lesson.title,
          kind: lesson.number ? `Lesson ${lesson.number}` : "Lesson",
          description: lesson.subtitle || lesson.shortTitle || "",
          url: lessonUrl(module.id, lesson.id),
          icon: "book",
          lesson: true,
        },
        [
          lesson.title,
          lesson.shortTitle,
          lesson.subtitle,
          lesson.intro,
          ...(lesson.objectives || []),
          ...(lesson.sections || []).map(
            (section) => `${section.title} ${textOnly(section.html)}`,
          ),
        ].join(" "),
      );
    }
    for (const term of module.glossary || []) {
      add(
        module,
        {
          title: term.term,
          kind: "Glossary",
          description: term.definition,
          url: glossaryUrl(module.id, term.term),
          icon: "file",
        },
        `${term.term} ${term.definition}`,
      );
    }
    for (const lab of module.labs || []) {
      add(
        module,
        {
          title: lab.title,
          kind: "Lab",
          description: lab.description || lab.label || "",
          url: labUrl(module.id, lab.id),
          icon: lab.icon || "flask",
        },
        `${lab.title} ${lab.label || ""} ${lab.description || ""}`,
      );
    }
    for (const reference of module.references || []) {
      add(
        module,
        {
          title: reference.title,
          kind: "Reference",
          description: reference.description || "",
          url: referenceUrl(module.id, reference.id),
          icon: reference.icon || "file",
        },
        `${reference.title} ${reference.description || ""}`,
      );
    }
  }

  function show(query = "") {
    const normalized = query.toLocaleLowerCase().trim();
    const tokens = normalized.split(/\s+/).filter(Boolean);
    const matches = tokens.length
      ? index
          .filter((item) => tokens.every((token) => item.text.includes(token)))
          .sort(
            (a, b) =>
              Number(b.titleLower.includes(normalized)) -
              Number(a.titleLower.includes(normalized)),
          )
      : [
          ...index.filter((item) => item.kind === "Module"),
          ...index.filter((item) => item.lesson).slice(0, 5),
        ];
    const shown = matches.slice(0, 12);
    results.innerHTML = `<p class="search-result-label">${tokens.length ? `${matches.length} MATCHING RESULTS` : "A FEW PLACES TO START"}</p>${
      shown.length
        ? shown
            .map(
              (item) =>
                `<a class="search-result" href="${escapeHtml(item.url)}">${icon(item.icon)}<span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(`${item.kind} · ${item.moduleTitle}`)}</small>${item.description ? `<small>${escapeHtml(item.description)}</small>` : ""}</span><span aria-hidden="true">↗</span></a>`,
            )
            .join("")
        : '<div class="search-empty"><p>No results yet.</p><span>Try a module name, lesson topic, or glossary term.</span></div>'
    }`;
  }

  function restoreFocus() {
    const isAvailable = (element) =>
      element &&
      !element.closest("[inert]") &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== "hidden";
    const target = isAvailable(trigger)
      ? trigger
      : document.querySelector("#menu-toggle");
    if (isAvailable(target)) target.focus();
  }

  function close() {
    dialog.close();
    restoreFocus();
  }

  function open() {
    if (listeners.signal.aborted || dialog.open) return;
    beforeOpen?.();
    input.value = "";
    show();
    dialog.showModal();
    input.focus();
  }

  trigger.addEventListener("click", open, options);
  closeButton.addEventListener("click", close, options);
  input.addEventListener("input", () => show(input.value), options);
  input.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        results.querySelector("a")?.click();
      }
    },
    options,
  );
  results.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("a[href]")) dialog.close();
    },
    options,
  );
  dialog.addEventListener(
    "cancel",
    (event) => {
      event.preventDefault();
      close();
    },
    options,
  );
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        close();
    },
    options,
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.open) close();
        else open();
      }
    },
    options,
  );

  return {
    open,
    destroy() {
      listeners.abort();
      if (dialog.open) close();
    },
  };
}
