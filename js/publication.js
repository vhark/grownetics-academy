export const isPublished = (module) => module?.status === "published";

export const getPublishedModules = (modules) => modules.filter(isPublished);

export const getAccessibleModules = (modules, preview = false) =>
  modules.filter(
    (module) => isPublished(module) || (preview && module.status === "draft"),
  );

export const getListedModules = (modules, preview = false) =>
  modules.filter(
    (module) =>
      isPublished(module) ||
      (module.status === "draft" &&
        (preview || module.visibility === "listed")),
  );

function routeQuery(hash) {
  if (typeof hash !== "string" || !hash.startsWith("#/")) return null;
  const separator = hash.indexOf("?");
  return {
    path: separator === -1 ? hash : hash.slice(0, separator),
    query: separator === -1 ? "" : hash.slice(separator + 1),
  };
}

export function isPreviewLink(hash) {
  const route = routeQuery(hash);
  if (!route) return false;
  const values = new URLSearchParams(route.query).getAll("preview");
  return values.length === 1 && values[0] === "1";
}

function previewLink(hash, enabled) {
  const route = routeQuery(hash);
  if (!route) return hash;
  // Preserve other query fields byte-for-byte, including encoded glossary terms.
  const fields = route.query
    ? route.query
        .split("&")
        .filter((field) => !new URLSearchParams(field).has("preview"))
    : [];
  if (enabled) fields.push("preview=1");
  const query = fields.join("&");
  return `${route.path}${query ? `?${query}` : ""}`;
}

export const withPreview = (hash) => previewLink(hash, true);
export const withoutPreview = (hash) => previewLink(hash, false);
