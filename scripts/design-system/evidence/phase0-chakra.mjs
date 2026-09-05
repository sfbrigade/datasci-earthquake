import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const root = process.cwd();
const jiti = createJiti(import.meta.url, { alias: { "@": path.join(root, "app") } });
const loaded = await jiti.import(path.join(root, "styles", "theme.ts"));
const system = loaded.default ?? loaded;

function safeCall(label, fn) {
  try { return {label, ok: true, value: fn()}; }
  catch (error) { return {label, ok: false, error: error instanceof Error ? `${error.name}: ${error.message}` : String(error)}; }
}

function utilitySummary(prop) {
  const utility = system.utility;
  const result = {prop, valid: system.isValidProperty?.(prop) ?? false};
  for (const method of ["getProperty", "getTransform", "getTypes", "getCompositions"]) {
    if (typeof utility?.[method] === "function") {
      try {
        const value = utility[method](prop);
        result[method] = typeof value === "function" ? "[function]" : value;
      } catch (error) {
        result[method] = `[error:${error instanceof Error ? error.message : String(error)}]`;
      }
    }
  }
  return result;
}

const recipeButton = safeCall("recipe-button", () => {
  const recipe = system.getRecipe?.("button");
  if (!recipe) return null;
  return {
    className: recipe.className,
    defaultVariants: recipe.defaultVariants,
    variantNames: recipe.variants ? Object.fromEntries(Object.entries(recipe.variants).map(([name, values]) => [name, Object.keys(values)])) : null,
  };
});

const probes = [
  safeCall("token-blue-text", () => system.token?.("colors.blue.text")),
  safeCall("token-grey-400", () => system.token?.("colors.grey.400")),
  safeCall("css-text-small", () => system.css?.({textStyle: "textSmall"})),
  safeCall("css-layer-text", () => system.css?.({layerStyle: "text"})),
  safeCall("css-text-small-layer-text", () => system.css?.({textStyle: "textSmall", layerStyle: "text"})),
  safeCall("css-color-blue-text", () => system.css?.({color: "blue.text"})),
  safeCall("css-display-flex", () => system.css?.({display: "flex"})),
  safeCall("css-position-absolute", () => system.css?.({position: "absolute"})),
  safeCall("css-responsive-spacing", () => system.css?.({p: {base: "4", md: "6"}})),
  safeCall("css-font-weight-bold", () => system.css?.({fontWeight: "bold"})),
  safeCall("css-z-index-docked", () => system.css?.({zIndex: "docked"})),
  safeCall("css-color-palette-blue", () => system.css?.({colorPalette: "blue"})),
  recipeButton,
];

const tokenSurface = safeCall("token-surface", () => ({
  hasDictionary: Boolean(system.tokens),
  tokenKeys: system.tokens && typeof system.tokens === "object" ? Object.keys(system.tokens).sort() : [],
  flatMapSize: system.tokens?.flatMap instanceof Map ? system.tokens.flatMap.size : null,
  categories: system.tokens?.categoryMap instanceof Map ? [...system.tokens.categoryMap.keys()].sort() : [],
}));

const utilitySurface = safeCall("utility-surface", () => ({
  keys: system.utility && typeof system.utility === "object" ? Object.keys(system.utility).sort() : [],
  samples: ["p", "padding", "color", "display", "position", "fontWeight", "zIndex", "textStyle", "layerStyle", "colorPalette"].map(utilitySummary),
}));

const result = {
  schema: "safehome.design-system-evidence.phase0-chakra.v1",
  systemKeys: Object.keys(system).sort(),
  tokenSurface,
  utilitySurface,
  probes,
};
const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "phase0-chakra.json");
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PHASE0_CHAKRA probes=${probes.filter((p) => p.ok).length}/${probes.length} systemKeys=${result.systemKeys.length}`);
for (const probe of probes) console.log(`CHAKRA ${probe.label}=${probe.ok ? "PASS" : "FAIL"}`);
console.log(`RECEIPT=${out}`);
