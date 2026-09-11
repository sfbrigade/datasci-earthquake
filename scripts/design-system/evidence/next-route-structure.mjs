import path from "node:path";

export const NEXT_RUNTIME_ENTRY_BASENAMES = new Set([
  "page.tsx", "page.ts", "page.jsx", "page.js",
  "route.ts", "route.js",
  "default.tsx", "default.ts", "default.jsx", "default.js",
  "loading.tsx", "loading.ts", "loading.jsx", "loading.js",
  "error.tsx", "error.ts", "error.jsx", "error.js",
  "global-error.tsx", "global-error.ts", "global-error.jsx", "global-error.js",
  "not-found.tsx", "not-found.ts", "not-found.jsx", "not-found.js",
  "forbidden.tsx", "forbidden.ts", "forbidden.jsx", "forbidden.js",
  "unauthorized.tsx", "unauthorized.ts", "unauthorized.jsx", "unauthorized.js",
  "sitemap.ts", "sitemap.js",
  "robots.ts", "robots.js",
  "manifest.ts", "manifest.js",
  "opengraph-image.tsx", "opengraph-image.ts", "opengraph-image.js",
  "twitter-image.tsx", "twitter-image.ts", "twitter-image.js",
]);

const LAYOUT_COMPOSED_PREFIXES = [
  "page.",
  "default.",
  "loading.",
  "error.",
  "not-found.",
  "forbidden.",
  "unauthorized.",
];

const STRUCTURAL_BASENAMES = [
  "layout.tsx", "layout.ts", "layout.jsx", "layout.js",
  "template.tsx", "template.ts", "template.jsx", "template.js",
];

export function isNextRuntimeEntryPath(rel) {
  return rel.startsWith("app/") && NEXT_RUNTIME_ENTRY_BASENAMES.has(path.posix.basename(rel));
}

export function isLayoutComposedEntryPath(rel) {
  const basename = path.posix.basename(rel);
  return LAYOUT_COMPOSED_PREFIXES.some((prefix) => basename.startsWith(prefix));
}

export function ancestorStructuralPaths(rel, availablePaths) {
  if (!isLayoutComposedEntryPath(rel)) return [];
  const result = [];
  let dir = path.posix.dirname(rel);
  while (dir === "app" || dir.startsWith("app/")) {
    for (const basename of STRUCTURAL_BASENAMES) {
      const candidate = `${dir}/${basename}`;
      if (candidate !== rel && availablePaths.has(candidate)) result.push(candidate);
    }
    if (dir === "app") break;
    dir = path.posix.dirname(dir);
  }
  return result;
}

export function nextRouteCompositionEdges(paths) {
  const available = new Set(paths);
  const edges = [];
  for (const rel of [...available].sort()) {
    if (!isNextRuntimeEntryPath(rel)) continue;
    for (const structural of ancestorStructuralPaths(rel, available)) {
      edges.push({from: rel, to: structural});
    }
  }
  return edges.sort((a, b) => `${a.from}\u0000${a.to}`.localeCompare(`${b.from}\u0000${b.to}`));
}
