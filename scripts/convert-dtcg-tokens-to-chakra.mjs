import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import prettier from "prettier";

const root = process.cwd();
const inputFile = resolve(root, "theme-merged/theme.tokens.json");
const outputFile = resolve(root, "styles/generated-dtcg-theme.ts");
const chakraExtension = "com.safehome.chakra-ui";

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
  "aspect-ratios": "aspectRatios",
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

const document = JSON.parse(await readFile(inputFile, "utf8"));

function chakraTokenName(name) {
  return /^\d+_\d+$/.test(name) ? name.replace("_", ".") : name;
}

function clone(value) {
  return structuredClone(value);
}

function merge(target, source) {
  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key];
    if (
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue) &&
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue)
    ) {
      merge(targetValue, sourceValue);
    } else {
      target[key] = clone(sourceValue);
    }
  }
  return target;
}

function chakraReference(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("{") ||
    !value.endsWith("}")
  ) {
    return undefined;
  }

  const path = value.slice(1, -1).split(".");
  const [scope, group, ...parts] = path;
  if (scope === "primitive") {
    const chakraGroup = primitiveNames[group];
    if (!chakraGroup) return undefined;
    const tokenPath =
      group === "color" && parts.at(-1) === "$root"
        ? parts.slice(0, -1)
        : parts;
    return `{${chakraGroup}.${tokenPath.map(chakraTokenName).join(".")}}`;
  }

  if (scope === "semantic") {
    const chakraGroup = semanticNames[group];
    if (!chakraGroup) return undefined;
    const [mode, ...tokenParts] = parts;
    const tokenPath = group === "color" ? tokenParts : [mode, ...tokenParts];
    return `{${chakraGroup}.${tokenPath.map(chakraTokenName).join(".")}}`;
  }
  return undefined;
}

function colorToCss(value) {
  const reference = chakraReference(value);
  if (reference) return reference;
  if (!value || typeof value !== "object" || !Array.isArray(value.components))
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
  ) {
    return undefined;
  }
  const hex = `#${rgb.map((component) => component.toString(16).padStart(2, "0")).join("")}`;
  if (value.alpha === undefined || value.alpha === 1) return hex;

  const alphaByte = Math.round(Number(value.alpha) * 255);
  if (
    Number.isFinite(alphaByte) &&
    Math.abs(value.alpha - alphaByte / 255) < Number.EPSILON
  ) {
    return `${hex}${alphaByte.toString(16).padStart(2, "0")}`;
  }
  return `rgb(${rgb.join(" ")} / ${value.alpha})`;
}

function tokenValue(token, inheritedType) {
  const type = token.$type ?? inheritedType;
  const value = token.$value;
  const reference = chakraReference(value);
  if (reference) return reference;

  switch (type) {
    case "color":
      return colorToCss(value);
    case "dimension":
    case "duration":
      return value && typeof value === "object"
        ? `${value.value}${value.unit}`
        : undefined;
    case "fontFamily":
      return Array.isArray(value) ? value.join(", ") : value;
    case "cubicBezier":
      return Array.isArray(value)
        ? `cubic-bezier(${value.join(", ")})`
        : undefined;
    case "number":
    case "fontWeight":
    case "strokeStyle":
      return value;
    default:
      return undefined;
  }
}

function chakraTree(group, inheritedType) {
  const output = {};
  for (const [key, value] of Object.entries(group ?? {})) {
    if (key === "$root") {
      const chakraValue = tokenValue(value, inheritedType ?? group.$type);
      if (chakraValue === undefined)
        throw new Error("Cannot convert DTCG root token to a Chakra value.");
      output.DEFAULT = {
        ...(value.$description ? { description: value.$description } : {}),
        value: chakraValue,
      };
      continue;
    }
    if (key.startsWith("$")) continue;
    if (value && typeof value === "object" && "$value" in value) {
      const chakraValue = tokenValue(value, inheritedType ?? group.$type);
      if (chakraValue === undefined) {
        throw new Error(`Cannot convert DTCG token ${key} to a Chakra value.`);
      }
      output[chakraTokenName(key)] = {
        ...(value.$description ? { description: value.$description } : {}),
        value: chakraValue,
      };
      continue;
    }
    output[chakraTokenName(key)] = chakraTree(
      value,
      inheritedType ?? group.$type
    );
  }
  return output;
}

function modeTree(light, dark, inheritedType) {
  const output = {};
  const keys = new Set([
    ...Object.keys(light ?? {}),
    ...Object.keys(dark ?? {}),
  ]);
  for (const key of keys) {
    if (key.startsWith("$")) continue;
    const lightValue = light?.[key];
    const darkValue = dark?.[key];
    if (
      lightValue &&
      typeof lightValue === "object" &&
      "$value" in lightValue
    ) {
      const lightChakraValue = tokenValue(
        lightValue,
        inheritedType ?? light.$type
      );
      const darkChakraValue = tokenValue(
        darkValue,
        inheritedType ?? dark?.$type
      );
      if (lightChakraValue === undefined || darkChakraValue === undefined) {
        throw new Error(
          `Cannot convert DTCG color modes for ${key} to Chakra values.`
        );
      }
      output[chakraTokenName(key)] = {
        value: { _light: lightChakraValue, _dark: darkChakraValue },
      };
      continue;
    }
    output[chakraTokenName(key)] = modeTree(
      lightValue,
      darkValue,
      inheritedType ?? light?.$type ?? dark?.$type
    );
  }
  return output;
}

const tokens = {};
for (const [dtcgName, group] of Object.entries(document.primitive ?? {})) {
  const chakraName = primitiveNames[dtcgName];
  if (chakraName) tokens[chakraName] = chakraTree(group, group.$type);
}

for (const [dtcgName, group] of Object.entries(
  document.$extensions?.[chakraExtension]?.chakraOnlyTokens?.primitive ?? {}
)) {
  const chakraName = primitiveNames[dtcgName];
  if (chakraName) merge((tokens[chakraName] ??= {}), group);
}

const semanticTokens = {};
const semanticColor = document.semantic?.color;
if (semanticColor) {
  const colors = chakraTree(semanticColor.shared, semanticColor.shared?.$type);
  merge(
    colors,
    modeTree(
      semanticColor.light,
      semanticColor.dark,
      semanticColor.light?.$type
    )
  );
  semanticTokens.colors = colors;
}

for (const [dtcgName, group] of Object.entries(document.semantic ?? {})) {
  if (dtcgName === "color") continue;
  const chakraName = semanticNames[dtcgName];
  if (chakraName) semanticTokens[chakraName] = chakraTree(group, group.$type);
}

for (const [dtcgName, group] of Object.entries(
  document.$extensions?.[chakraExtension]?.chakraOnlyTokens?.semantic ?? {}
)) {
  const chakraName = semanticNames[dtcgName];
  if (chakraName) merge((semanticTokens[chakraName] ??= {}), group);
}

const source = `// This file is generated by scripts/convert-dtcg-tokens-to-chakra.mjs.\n// Do not edit it directly; update theme-merged/theme.tokens.json instead.\n\nimport { defineSemanticTokens, defineTokens } from "@chakra-ui/react";\n\nexport const tokens = defineTokens(${JSON.stringify(tokens, null, 2)});\n\nexport const semanticTokens = defineSemanticTokens(${JSON.stringify(semanticTokens, null, 2)});\n`;
const output = await prettier.format(source, { filepath: outputFile });

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, output);
console.log(`Wrote ${relative(root, outputFile)}`);
