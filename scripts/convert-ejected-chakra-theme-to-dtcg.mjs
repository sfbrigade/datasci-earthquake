import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import prettier from "prettier";
import ts from "typescript";
import { findChakraPathCollisions } from "./design-token-lib/chakra-token-paths.mjs";

const root = process.cwd();
const themeDirectory = resolve(root, "theme-merged");
const outputFiles = {
  tokens: resolve(themeDirectory, "theme.tokens.json"),
  resolver: resolve(themeDirectory, "theme.resolver.json"),
  chakra: resolve(themeDirectory, "theme.chakra.json"),
  report: resolve(themeDirectory, "theme.report.json"),
};

const primitiveSources = [
  { source: "colors", canonical: "color", chakra: "colors", type: "color" },
  {
    source: "spacing",
    canonical: "spacing",
    chakra: "spacing",
    type: "dimension",
  },
  { source: "sizes", canonical: "sizes", chakra: "sizes", type: "dimension" },
  { source: "fonts", canonical: "fonts", chakra: "fonts", type: "fontFamily" },
  {
    source: "font-sizes",
    canonical: "fontSize",
    chakra: "fontSizes",
    type: "dimension",
  },
  {
    source: "font-weights",
    canonical: "fontWeight",
    chakra: "fontWeights",
    type: "fontWeight",
  },
  {
    source: "line-heights",
    canonical: "lineHeight",
    chakra: "lineHeights",
    type: "number",
  },
  {
    source: "letter-spacings",
    canonical: "letterSpacing",
    chakra: "letterSpacings",
    type: "dimension",
  },
  {
    source: "radii",
    canonical: "borderRadius",
    chakra: "radii",
    type: "dimension",
  },
  {
    source: "border-widths",
    canonical: "borderWidth",
    chakra: "borderWidths",
    type: "dimension",
  },
  {
    source: "border-styles",
    canonical: "strokeStyle",
    chakra: "borderStyles",
    type: "strokeStyle",
  },
  {
    source: "durations",
    canonical: "durations",
    chakra: "durations",
    type: "duration",
  },
  {
    source: "easings",
    canonical: "easings",
    chakra: "easings",
    type: "cubicBezier",
  },
  { source: "blurs", canonical: "blurs", chakra: "blurs", type: "dimension" },
  { source: "z-index", canonical: "zIndex", chakra: "zIndex", type: "number" },
  { source: "gradients", canonical: "gradients", chakra: "gradients" },
  { source: "aspect-ratios", canonical: "aspectRatio", chakra: "aspectRatios" },
  { source: "animations", canonical: "animations", chakra: "animations" },
  {
    source: "borders",
    canonical: "borders",
    chakra: "borders",
    type: "border",
  },
  { source: "cursor", canonical: "cursor", chakra: "cursor" },
];

const semanticSources = [
  {
    source: "colors",
    canonical: "color",
    chakra: "colors",
    type: "color",
    contextual: true,
  },
  {
    source: "radii",
    canonical: "borderRadius",
    chakra: "radii",
    type: "dimension",
  },
  { source: "sizes", canonical: "size", chakra: "sizes", type: "dimension" },
  { source: "shadows", canonical: "shadow", chakra: "shadows" },
  { source: "assets", canonical: "asset", chakra: "assets" },
];

function propertyName(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  )
    return name.text;
  throw new Error(`Unsupported property name: ${name.getText()}`);
}

function evaluate(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand)) {
    return node.operator === ts.SyntaxKind.MinusToken
      ? -Number(node.operand.text)
      : Number(node.operand.text);
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(evaluate);
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((property) => {
        if (!ts.isPropertyAssignment(property))
          throw new Error(`Unsupported object member: ${property.getText()}`);
        return [propertyName(property.name), evaluate(property.initializer)];
      })
    );
  }
  throw new Error(`Unsupported token expression: ${node.getText()}`);
}

async function readChakraObject(file) {
  const contents = await readFile(file, "utf8");
  const source = ts.createSourceFile(
    file,
    contents,
    ts.ScriptTarget.Latest,
    true
  );
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const initializer = declaration.initializer;
      if (!initializer || !ts.isCallExpression(initializer)) continue;
      const [argument] = initializer.arguments;
      if (argument && ts.isObjectLiteralExpression(argument))
        return evaluate(argument);
    }
  }
  throw new Error(
    `${relative(root, file)} does not export a supported Chakra token object.`
  );
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLeaf(value) {
  return isObject(value) && Object.hasOwn(value, "value");
}

function walkLeaves(value, path, callback) {
  if (isLeaf(value)) return callback(value, path);
  for (const [key, child] of Object.entries(value))
    walkLeaves(child, [...path, key], callback);
}

function setAtPath(target, path, value) {
  let current = target;
  for (const part of path.slice(0, -1)) current = current[part] ??= {};
  current[path.at(-1)] = value;
}

function normalizedPart(part) {
  return part === "DEFAULT" ? "$root" : part.replaceAll(".", "_");
}

function normalizedPath(path) {
  return path.map(normalizedPart);
}

function canonicalPath(scope, group, rawPath) {
  return [scope, group, ...normalizedPath(rawPath)];
}

function dimension(value) {
  if (typeof value === "number") return { value, unit: "px" };
  if (value === "0") return { value: 0, unit: "px" };
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(px|rem)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : undefined;
}

function duration(value) {
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : undefined;
}

function cubicBezier(value) {
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^cubic-bezier\(([^)]+)\)$/);
  if (!match) return undefined;
  const points = match[1].split(",").map((point) => Number(point.trim()));
  return points.length === 4 && points.every(Number.isFinite)
    ? points
    : undefined;
}

function reference(value, references) {
  if (typeof value !== "string" || !/^\{[^{}]+\}$/.test(value))
    return undefined;
  const target = references.get(value.slice(1, -1));
  if (!target) return undefined;
  return target.split(".").includes("$root")
    ? {
        $ref: `#/${target
          .split(".")
          .map((part) => part.replaceAll("~", "~0").replaceAll("/", "~1"))
          .join("/")}/$value`,
      }
    : `{${target}}`;
}

function color(value, references) {
  const alias = reference(value, references);
  if (alias) return alias;
  if (value === "white" || value === "black") {
    const channel = value === "white" ? 1 : 0;
    return {
      colorSpace: "srgb",
      components: [channel, channel, channel],
      hex: value === "white" ? "#ffffff" : "#000000",
    };
  }
  if (value === "transparent") {
    return {
      colorSpace: "srgb",
      components: [0, 0, 0],
      alpha: 0,
      hex: "#000000",
    };
  }
  if (typeof value !== "string") return undefined;

  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const expanded =
      hex.length <= 4 ? [...hex].map((part) => part.repeat(2)).join("") : hex;
    return {
      colorSpace: "srgb",
      components: [0, 2, 4].map(
        (index) => Number.parseInt(expanded.slice(index, index + 2), 16) / 255
      ),
      ...(expanded.length === 8
        ? { alpha: Number.parseInt(expanded.slice(6, 8), 16) / 255 }
        : {}),
      hex: `#${expanded.slice(0, 6).toLowerCase()}`,
    };
  }

  const rgba = value
    .match(/^rgba?\(([^)]+)\)$/i)?.[1]
    .split(",")
    .map((part) => part.trim());
  if (!rgba || ![3, 4].includes(rgba.length)) return undefined;
  const channels = rgba.slice(0, 3).map(Number);
  const alpha = rgba[3] === undefined ? undefined : Number(rgba[3]);
  if (
    channels.some(
      (channel) => !Number.isInteger(channel) || channel < 0 || channel > 255
    )
  )
    return undefined;
  if (
    alpha !== undefined &&
    (!Number.isFinite(alpha) || alpha < 0 || alpha > 1)
  )
    return undefined;
  return {
    colorSpace: "srgb",
    components: channels.map((channel) => channel / 255),
    ...(alpha === undefined ? {} : { alpha }),
  };
}

function fontFamily(value) {
  if (typeof value !== "string") return undefined;
  return value
    .split(",")
    .map((family) => family.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

function border(value, references) {
  if (typeof value !== "string") return undefined;
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return undefined;
  const width = reference(parts[0], references) ?? dimension(parts[0]);
  const style =
    reference(parts[1], references) ??
    (parts[1] === "solid" ? "solid" : undefined);
  const borderColor =
    reference(parts[2], references) ?? color(parts[2], references);
  return width && style && borderColor
    ? { color: borderColor, width, style }
    : undefined;
}

function portableValue(type, value, references, sourcePath) {
  if (sourcePath === "tokens.fonts.heading") return ["Manrope", "sans-serif"];
  if (sourcePath === "tokens.fonts.body") return ["Inter", "sans-serif"];
  const alias = reference(value, references);
  if (alias) return alias;
  switch (type) {
    case "color":
      return color(value, references);
    case "dimension":
      return dimension(value);
    case "fontFamily":
      return fontFamily(value);
    case "fontWeight":
      return typeof value === "number" ||
        (typeof value === "string" && /^\d+$/.test(value))
        ? Number(value)
        : undefined;
    case "number":
      return typeof value === "number" ? value : undefined;
    case "duration":
      return duration(value);
    case "cubicBezier":
      return cubicBezier(value);
    case "strokeStyle":
      return typeof value === "string" ? value : undefined;
    case "border":
      return border(value, references);
    default:
      return undefined;
  }
}

function platformReason(category, value) {
  if (category === "gradients")
    return "CSS gradient geometry is not represented by the DTCG stop-only gradient type.";
  if (category === "aspect-ratios")
    return "Chakra represents aspect ratios as CSS ratio strings rather than a portable DTCG token type.";
  if (category === "animations")
    return "CSS animation shorthand and keyframe names are web-platform values.";
  if (category === "cursor")
    return "CSS cursor keywords are web-platform values.";
  if (category === "shadows")
    return "The layered Chakra shadow syntax cannot be parsed and regenerated losslessly.";
  if (category === "assets")
    return "CSS url() values are web-platform bindings.";
  if (category === "borders")
    return "The CSS border fragment is incomplete or cannot be parsed and regenerated losslessly.";
  if (
    typeof value === "string" &&
    /(?:%|vw|vh|dvh|svh|lvh|auto|unset|content|currentColor)/.test(value)
  ) {
    return "The CSS unit or keyword is not a valid value for the token's intended portable DTCG type.";
  }
  return "The Chakra value has no deterministic, lossless representation in its intended portable DTCG type.";
}

function token(type, value, leaf) {
  return {
    $type: type,
    ...(leaf.description ? { $description: leaf.description } : {}),
    $value: value,
  };
}

function addGroupType(document, path, type) {
  let current = document;
  for (const part of path) current = current[part] ??= {};
  current.$type = type;
}

function allTokenPaths(document) {
  const paths = new Set();
  function visit(value, path = []) {
    if (!isObject(value)) return;
    if (Object.hasOwn(value, "$value")) {
      paths.add(path.join("."));
      return;
    }
    for (const [key, child] of Object.entries(value)) {
      if (!key.startsWith("$") || key === "$root") visit(child, [...path, key]);
    }
  }
  visit(document);
  return paths;
}

function allReferences(value, output = []) {
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value))
    output.push(value.slice(1, -1));
  else if (
    isObject(value) &&
    typeof value.$ref === "string" &&
    value.$ref.startsWith("#/")
  ) {
    const parts = value.$ref
      .slice(2)
      .split("/")
      .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"));
    if (parts.at(-1) === "$value") parts.pop();
    output.push(parts.join("."));
  } else if (Array.isArray(value))
    value.forEach((item) => allReferences(item, output));
  else if (isObject(value))
    Object.values(value).forEach((item) => allReferences(item, output));
  return output;
}

const rawPrimitive = new Map();
const rawSemantic = new Map();
for (const definition of primitiveSources) {
  rawPrimitive.set(
    definition.source,
    await readChakraObject(
      resolve(themeDirectory, "tokens", `${definition.source}.ts`)
    )
  );
}
for (const definition of semanticSources) {
  rawSemantic.set(
    definition.source,
    await readChakraObject(
      resolve(themeDirectory, "semantic-tokens", `${definition.source}.ts`)
    )
  );
}

const references = new Map();
for (const definition of primitiveSources) {
  walkLeaves(rawPrimitive.get(definition.source), [], (_leaf, path) => {
    const target = canonicalPath("primitive", definition.canonical, path).join(
      "."
    );
    references.set([definition.chakra, ...path].join("."), target);
    if (path.at(-1) === "DEFAULT")
      references.set(
        [definition.chakra, ...path.slice(0, -1)].join("."),
        target
      );
  });
}
for (const definition of semanticSources) {
  walkLeaves(rawSemantic.get(definition.source), [], (_leaf, path) => {
    const target = canonicalPath("semantic", definition.canonical, path).join(
      "."
    );
    const sourceReference = [definition.chakra, ...path].join(".");
    if (!references.has(sourceReference))
      references.set(sourceReference, target);
    if (path.at(-1) === "DEFAULT") {
      const shortReference = [definition.chakra, ...path.slice(0, -1)].join(
        "."
      );
      if (!references.has(shortReference))
        references.set(shortReference, target);
    }
  });
}

const tokensDocument = {
  $schema: "https://www.designtokens.org/schemas/2025.10/format.json",
  $description:
    "SafeHome portable design tokens. Theme-dependent tokens contain their default/light values; theme.resolver.json owns dark overrides.",
  primitive: {},
  semantic: {},
};
const darkOverrides = {};
const chakraDocument = {
  $schema: "./theme.chakra.schema.json",
  schemaVersion: "1.0",
  description:
    "SafeHome Chakra/Web values and explicit bindings that are not portable DTCG token semantics.",
  tokens: {},
  semanticTokens: {},
  bindings: {},
};
const mappings = [];
const defaultRootMappings = [];
const nameMappings = [];
const lossyConversionWarnings = [];

function recordNames(sourcePath, rawPath, normalized) {
  rawPath.forEach((part, index) => {
    if (part === "DEFAULT")
      defaultRootMappings.push({
        source: sourcePath,
        from: "DEFAULT",
        to: "$root",
      });
    else if (part !== normalized[index])
      nameMappings.push({
        source: sourcePath,
        from: part,
        to: normalized[index],
      });
  });
}

function addPortable({
  sourcePath,
  rawPath,
  canonical,
  type,
  value,
  leaf,
  contextual = false,
  darkValue,
}) {
  const normalized = normalizedPath(rawPath);
  const targetPath = [canonical.scope, canonical.group, ...normalized];
  setAtPath(tokensDocument, targetPath, token(type, value, leaf));
  addGroupType(tokensDocument, [canonical.scope, canonical.group], type);
  if (contextual) {
    setAtPath(darkOverrides, targetPath, token(type, darkValue, leaf));
    addGroupType(darkOverrides, [canonical.scope, canonical.group], type);
  }
  recordNames(sourcePath, rawPath, normalized);
  mappings.push({
    source: sourcePath,
    sourceToken: leaf,
    disposition: contextual ? "resolver-contextual" : "portable-dtcg",
    canonical: targetPath.join("."),
    ...(contextual ? { darkOverride: targetPath.join(".") } : {}),
  });
}

function addPlatform({ sourcePath, chakraPath, leaf, reason }) {
  setAtPath(chakraDocument, chakraPath, leaf);
  mappings.push({
    source: sourcePath,
    sourceToken: leaf,
    disposition: "chakra-platform",
    canonical: chakraPath.join("."),
    reason,
  });
}

for (const definition of primitiveSources) {
  walkLeaves(rawPrimitive.get(definition.source), [], (leaf, rawPath) => {
    const sourcePath = ["tokens", definition.chakra, ...rawPath].join(".");
    const value = portableValue(
      definition.type,
      leaf.value,
      references,
      sourcePath
    );
    if (value === undefined) {
      addPlatform({
        sourcePath,
        chakraPath: ["tokens", definition.chakra, ...rawPath],
        leaf,
        reason: platformReason(definition.source, leaf.value),
      });
      return;
    }
    addPortable({
      sourcePath,
      rawPath,
      canonical: { scope: "primitive", group: definition.canonical },
      type: definition.type,
      value,
      leaf,
    });
    if (
      sourcePath === "tokens.fonts.heading" ||
      sourcePath === "tokens.fonts.body"
    ) {
      chakraDocument.bindings[sourcePath] = {
        source: [
          "primitive",
          definition.canonical,
          ...normalizedPath(rawPath),
        ].join("."),
        value: leaf.value,
        reason:
          "SafeHome realizes this portable font family through an explicit next/font CSS variable.",
      };
    }
  });
}

for (const definition of semanticSources) {
  walkLeaves(rawSemantic.get(definition.source), [], (leaf, rawPath) => {
    const sourcePath = ["semanticTokens", definition.chakra, ...rawPath].join(
      "."
    );
    const modes =
      definition.contextual &&
      isObject(leaf.value) &&
      Object.hasOwn(leaf.value, "_light") &&
      Object.hasOwn(leaf.value, "_dark");
    if (modes) {
      const lightValue = portableValue(
        definition.type,
        leaf.value._light,
        references,
        sourcePath
      );
      const darkValue = portableValue(
        definition.type,
        leaf.value._dark,
        references,
        sourcePath
      );
      if (lightValue !== undefined && darkValue !== undefined) {
        addPortable({
          sourcePath,
          rawPath,
          canonical: { scope: "semantic", group: definition.canonical },
          type: definition.type,
          value: lightValue,
          darkValue,
          leaf,
          contextual: true,
        });
        return;
      }
    } else {
      const value = portableValue(
        definition.type,
        leaf.value,
        references,
        sourcePath
      );
      if (value !== undefined) {
        addPortable({
          sourcePath,
          rawPath,
          canonical: { scope: "semantic", group: definition.canonical },
          type: definition.type,
          value,
          leaf,
        });
        return;
      }
    }
    addPlatform({
      sourcePath,
      chakraPath: ["semanticTokens", definition.chakra, ...rawPath],
      leaf,
      reason: platformReason(definition.source, leaf.value),
    });
  });
}

const resolverDocument = {
  $schema: "https://www.designtokens.org/schemas/2025.10/resolver.json",
  version: "2025.10",
  sets: { base: { sources: [{ $ref: "theme.tokens.json" }] } },
  modifiers: {
    theme: {
      contexts: {
        light: [],
        dark: [darkOverrides],
      },
      default: "light",
    },
  },
  resolutionOrder: [{ $ref: "#/sets/base" }, { $ref: "#/modifiers/theme" }],
};

const tokenPaths = allTokenPaths(tokensDocument);
const overridePaths = allTokenPaths(darkOverrides);
const unresolvedReferences = [
  ...new Set(
    [...allReferences(tokensDocument), ...allReferences(darkOverrides)].filter(
      (path) => !tokenPaths.has(path)
    )
  ),
].sort();
const collisions = findChakraPathCollisions(mappings);
const sourceCounts = new Map();
for (const mapping of mappings)
  sourceCounts.set(mapping.source, (sourceCounts.get(mapping.source) ?? 0) + 1);
const duplicateDispositions = [...sourceCounts]
  .filter(([, count]) => count !== 1)
  .map(([source]) => source);

const reportDocument = {
  schemaVersion: "1.0",
  provenance: {
    source:
      "ejected Chakra UI v3 theme under theme-merged/tokens and theme-merged/semantic-tokens",
    formatSchema: tokensDocument.$schema,
    resolverSchema: resolverDocument.$schema,
    chakraSchema: chakraDocument.$schema,
    resolverVersion: resolverDocument.version,
    generator: "scripts/convert-ejected-chakra-theme-to-dtcg.mjs",
  },
  counts: {
    sourceLeafCount: mappings.length,
    portableDefaultTokenCount: tokenPaths.size,
    themeContextualTokenCount: mappings.filter(
      (mapping) => mapping.disposition === "resolver-contextual"
    ).length,
    darkOverrideCount: overridePaths.size,
    chakraOnlyCount: mappings.filter(
      (mapping) => mapping.disposition === "chakra-platform"
    ).length,
    rejectedCount: 0,
  },
  mappings,
  defaultRootMappings,
  nameMappings,
  unresolvedReferences,
  collisions,
  duplicateDispositions,
  lossyConversionWarnings,
  nonTokenThemeFiles: [
    "animation-styles.ts",
    "breakpoints.ts",
    "global-css.ts",
    "keyframes.ts",
    "layer-styles.ts",
    "recipes/",
    "slot-recipes/",
    "text-styles.ts",
  ],
};

if (
  unresolvedReferences.length ||
  collisions.length ||
  duplicateDispositions.length
) {
  throw new Error(
    `Token export invariants failed:\n${JSON.stringify({ unresolvedReferences, collisions, duplicateDispositions }, null, 2)}`
  );
}

for (const value of [chakraDocument.tokens, chakraDocument.semanticTokens]) {
  for (const key of Object.keys(value))
    if (!Object.keys(value[key]).length) delete value[key];
}

await mkdir(dirname(outputFiles.tokens), { recursive: true });
for (const [name, file] of Object.entries(outputFiles)) {
  const document = {
    tokens: tokensDocument,
    resolver: resolverDocument,
    chakra: chakraDocument,
    report: reportDocument,
  }[name];
  const output = await prettier.format(JSON.stringify(document), {
    filepath: file,
  });
  await writeFile(file, output);
  console.log(`Wrote ${relative(root, file)}`);
}
