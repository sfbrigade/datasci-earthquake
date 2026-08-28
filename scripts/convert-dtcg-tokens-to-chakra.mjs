import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const primitiveNames = {
  color: "colors",
  spacing: "spacing",
  sizes: "sizes",
  fonts: "fonts",
  fontSize: "fontSizes",
  fontWeight: "fontWeights",
  lineHeight: "lineHeights",
  letterSpacing: "letterSpacings",
  borderRadius: "radii",
  borderWidth: "borderWidths",
  strokeStyle: "borderStyles",
  durations: "durations",
  easings: "easings",
  blurs: "blurs",
  zIndex: "zIndex",
  gradients: "gradients",
  aspectRatio: "aspectRatios",
  animations: "animations",
  borders: "borders",
  cursor: "cursor",
};

const semanticNames = {
  color: "colors",
  borderRadius: "radii",
  size: "sizes",
  shadow: "shadows",
  asset: "assets",
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return structuredClone(value);
}

function setAtPath(target, path, value) {
  let current = target;
  for (const part of path.slice(0, -1)) current = current[part] ??= {};
  current[path.at(-1)] = value;
}

function getAtPath(target, path) {
  return path.reduce((value, part) => value?.[part], target);
}

function chakraTokenName(name) {
  return /^-?\d+_\d+$/.test(name) ? name.replace("_", ".") : name;
}

function chakraGroupPath(canonicalPath) {
  const [scope, group, ...parts] = canonicalPath;
  const groupName =
    scope === "primitive"
      ? primitiveNames[group]
      : scope === "semantic"
        ? semanticNames[group]
        : undefined;
  if (!groupName) return undefined;
  return [
    scope === "primitive" ? "tokens" : "semanticTokens",
    groupName,
    ...parts.map((part) =>
      part === "$root" ? "DEFAULT" : chakraTokenName(part)
    ),
  ];
}

function canonicalReferencePath(value) {
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value))
    return value.slice(1, -1).split(".");
  if (
    isObject(value) &&
    typeof value.$ref === "string" &&
    value.$ref.startsWith("#/")
  ) {
    const parts = value.$ref
      .slice(2)
      .split("/")
      .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
    if (parts.at(-1) === "$value") parts.pop();
    return parts;
  }
  return undefined;
}

export function chakraReference(value) {
  const canonicalPath = canonicalReferencePath(value);
  if (!canonicalPath) return undefined;
  const chakraPath = chakraGroupPath(canonicalPath);
  if (!chakraPath) return undefined;
  const [, group, ...parts] = chakraPath;
  const referenceParts =
    parts.at(-1) === "DEFAULT" ? parts.slice(0, -1) : parts;
  return `{${[group, ...referenceParts].join(".")}}`;
}

export function colorToCss(value) {
  const alias = chakraReference(value);
  if (alias) return alias;
  if (
    !isObject(value) ||
    value.colorSpace !== "srgb" ||
    !Array.isArray(value.components)
  )
    return undefined;
  const rgb = value.components.map((component) =>
    Math.round(Number(component) * 255)
  );
  if (
    rgb.length !== 3 ||
    rgb.some(
      (component) =>
        !Number.isInteger(component) || component < 0 || component > 255
    )
  )
    return undefined;
  const hex = `#${rgb.map((component) => component.toString(16).padStart(2, "0")).join("")}`;
  if (value.alpha === undefined || value.alpha === 1) return hex;
  const alpha = Number(value.alpha);
  const alphaByte = Math.round(alpha * 255);
  if (
    Number.isFinite(alpha) &&
    alpha >= 0 &&
    alpha <= 1 &&
    Math.abs(alpha - alphaByte / 255) < 1e-12
  ) {
    return `${hex}${alphaByte.toString(16).padStart(2, "0")}`;
  }
  return Number.isFinite(alpha) && alpha >= 0 && alpha <= 1
    ? `rgb(${rgb.join(" ")} / ${alpha})`
    : undefined;
}

function dimensionToCss(value) {
  return isObject(value) &&
    typeof value.value === "number" &&
    ["px", "rem"].includes(value.unit)
    ? `${value.value}${value.unit}`
    : undefined;
}

function durationToCss(value) {
  return isObject(value) &&
    typeof value.value === "number" &&
    ["ms", "s"].includes(value.unit)
    ? `${value.value}${value.unit}`
    : undefined;
}

export function tokenValue(token, inheritedType) {
  const type = token.$type ?? inheritedType;
  const value = token.$value;
  const alias = chakraReference(value);
  if (alias) return alias;
  switch (type) {
    case "color":
      return colorToCss(value);
    case "dimension":
      return dimensionToCss(value);
    case "duration":
      return durationToCss(value);
    case "fontFamily":
      return Array.isArray(value) ? value.join(", ") : undefined;
    case "cubicBezier":
      return Array.isArray(value) && value.length === 4
        ? `cubic-bezier(${value.join(", ")})`
        : undefined;
    case "number":
    case "fontWeight":
    case "strokeStyle":
      return value;
    case "border": {
      if (!isObject(value)) return undefined;
      const width = chakraReference(value.width) ?? dimensionToCss(value.width);
      const style =
        chakraReference(value.style) ??
        (typeof value.style === "string" ? value.style : undefined);
      const color = chakraReference(value.color) ?? colorToCss(value.color);
      return width && style && color ? `${width} ${style} ${color}` : undefined;
    }
    default:
      return undefined;
  }
}

function tokenEntries(document) {
  const entries = new Map();
  function visit(value, path = [], inheritedType) {
    if (!isObject(value)) return;
    const type = value.$type ?? inheritedType;
    if (Object.hasOwn(value, "$value")) {
      entries.set(path.join("."), { token: value, inheritedType });
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (!key.startsWith("$") || key === "$root")
        visit(child, [...path, key], type);
    }
  }
  visit(document);
  return entries;
}

function darkOverridesFromResolver(resolver) {
  if (resolver.version !== "2025.10")
    throw new Error(`Unsupported resolver version: ${resolver.version}`);
  const baseSources = resolver.sets?.base?.sources;
  const theme = resolver.modifiers?.theme;
  if (
    baseSources?.length !== 1 ||
    baseSources[0].$ref !== "theme.tokens.json"
  ) {
    throw new Error(
      "Resolver base set must source theme.tokens.json exactly once."
    );
  }
  if (
    !Array.isArray(theme?.contexts?.light) ||
    theme.contexts.light.length !== 0 ||
    theme.default !== "light"
  ) {
    throw new Error(
      "Resolver theme modifier must use an empty light context and default to light."
    );
  }
  const darkSources = theme.contexts?.dark;
  if (
    !Array.isArray(darkSources) ||
    darkSources.length !== 1 ||
    !isObject(darkSources[0])
  ) {
    throw new Error(
      "Resolver theme.dark must contain exactly one inline override source."
    );
  }
  const expectedOrder = ["#/sets/base", "#/modifiers/theme"];
  if (
    JSON.stringify(resolver.resolutionOrder?.map((item) => item.$ref)) !==
    JSON.stringify(expectedOrder)
  ) {
    throw new Error(
      "Resolver must apply the base set before the theme modifier."
    );
  }
  return darkSources[0];
}

function convertCanonicalGroup(
  group,
  canonicalPrefix,
  contextual,
  darkEntries,
  inheritedType
) {
  const output = {};
  for (const [key, value] of Object.entries(group ?? {})) {
    if (key.startsWith("$") && key !== "$root") continue;
    const canonicalPath = [...canonicalPrefix, key];
    const chakraKey = key === "$root" ? "DEFAULT" : chakraTokenName(key);
    if (isObject(value) && Object.hasOwn(value, "$value")) {
      const lightValue = tokenValue(value, inheritedType ?? group.$type);
      if (lightValue === undefined)
        throw new Error(
          `Cannot convert DTCG token ${canonicalPath.join(".")} to Chakra.`
        );
      const canonicalName = canonicalPath.join(".");
      if (contextual.has(canonicalName)) {
        const dark = darkEntries.get(canonicalName);
        const darkValue = dark && tokenValue(dark.token, dark.inheritedType);
        if (darkValue === undefined)
          throw new Error(
            `Cannot convert dark override ${canonicalName} to Chakra.`
          );
        output[chakraKey] = {
          ...(value.$description ? { description: value.$description } : {}),
          value: { _light: lightValue, _dark: darkValue },
        };
      } else {
        output[chakraKey] = {
          ...(value.$description ? { description: value.$description } : {}),
          value: lightValue,
        };
      }
      continue;
    }
    output[chakraKey] = convertCanonicalGroup(
      value,
      canonicalPath,
      contextual,
      darkEntries,
      inheritedType ?? group.$type
    );
  }
  return output;
}

function mergePlatform(target, source, path = []) {
  for (const [key, sourceValue] of Object.entries(source ?? {})) {
    const nextPath = [...path, key];
    const targetValue = target[key];
    if (isLeaf(sourceValue)) {
      if (targetValue !== undefined) {
        throw new Error(
          `Chakra supplement collision at ${nextPath.join(".")}; use an explicit binding for a DTCG-derived token.`
        );
      }
      target[key] = clone(sourceValue);
    } else if (isObject(sourceValue)) {
      if (
        targetValue !== undefined &&
        (!isObject(targetValue) || isLeaf(targetValue))
      ) {
        throw new Error(
          `Chakra supplement collision at ${nextPath.join(".")}.`
        );
      }
      mergePlatform((target[key] ??= {}), sourceValue, nextPath);
    } else {
      throw new Error(
        `Invalid Chakra supplement node at ${nextPath.join(".")}.`
      );
    }
  }
}

function isLeaf(value) {
  return isObject(value) && Object.hasOwn(value, "value");
}

export function compileTheme(tokensDocument, resolverDocument, chakraDocument) {
  const baseEntries = tokenEntries(tokensDocument);
  const darkDocument = darkOverridesFromResolver(resolverDocument);
  const darkEntries = tokenEntries(darkDocument);
  for (const path of darkEntries.keys()) {
    if (!baseEntries.has(path))
      throw new Error(`Dark override has no base token at ${path}.`);
  }
  const contextual = new Set(darkEntries.keys());
  const tokens = {};
  for (const [canonicalName, group] of Object.entries(
    tokensDocument.primitive ?? {}
  )) {
    const chakraName = primitiveNames[canonicalName];
    if (chakraName)
      tokens[chakraName] = convertCanonicalGroup(
        group,
        ["primitive", canonicalName],
        contextual,
        darkEntries,
        group.$type
      );
  }
  const semanticTokens = {};
  for (const [canonicalName, group] of Object.entries(
    tokensDocument.semantic ?? {}
  )) {
    const chakraName = semanticNames[canonicalName];
    if (chakraName)
      semanticTokens[chakraName] = convertCanonicalGroup(
        group,
        ["semantic", canonicalName],
        contextual,
        darkEntries,
        group.$type
      );
  }

  mergePlatform(tokens, chakraDocument.tokens, ["tokens"]);
  mergePlatform(semanticTokens, chakraDocument.semanticTokens, [
    "semanticTokens",
  ]);

  for (const [target, binding] of Object.entries(
    chakraDocument.bindings ?? {}
  )) {
    const targetPath = target.split(".");
    const expectedTarget = chakraGroupPath(binding.source.split("."));
    if (!baseEntries.has(binding.source))
      throw new Error(
        `Binding ${target} references missing DTCG token ${binding.source}.`
      );
    if (JSON.stringify(targetPath) !== JSON.stringify(expectedTarget)) {
      throw new Error(
        `Binding target ${target} does not match DTCG source ${binding.source}.`
      );
    }
    const targetToken = getAtPath({ tokens, semanticTokens }, targetPath);
    if (!isLeaf(targetToken))
      throw new Error(`Binding target ${target} was not generated from DTCG.`);
    targetToken.value = clone(binding.value);
  }
  return { tokens, semanticTokens };
}

export async function generateTheme({ root = process.cwd() } = {}) {
  const inputDirectory = resolve(root, "theme-merged");
  const outputFile = resolve(root, "styles/generated-dtcg-theme.ts");
  const [tokensDocument, resolverDocument, chakraDocument] = await Promise.all([
    readFile(resolve(inputDirectory, "theme.tokens.json"), "utf8").then(
      JSON.parse
    ),
    readFile(resolve(inputDirectory, "theme.resolver.json"), "utf8").then(
      JSON.parse
    ),
    readFile(resolve(inputDirectory, "theme.chakra.json"), "utf8").then(
      JSON.parse
    ),
  ]);
  const { tokens, semanticTokens } = compileTheme(
    tokensDocument,
    resolverDocument,
    chakraDocument
  );
  const source = `// This file is generated by scripts/convert-dtcg-tokens-to-chakra.mjs.\n// Do not edit it directly; update theme-merged/theme.tokens.json, theme.resolver.json, or theme.chakra.json instead.\n\nimport { defineSemanticTokens, defineTokens } from "@chakra-ui/react";\n\nexport const tokens = defineTokens(${JSON.stringify(tokens, null, 2)});\n\nexport const semanticTokens = defineSemanticTokens(${JSON.stringify(semanticTokens, null, 2)});\n`;
  const output = await prettier.format(source, { filepath: outputFile });
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, output);
  console.log(`Wrote ${relative(root, outputFile)}`);
  return { tokens, semanticTokens, output };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await generateTheme();
