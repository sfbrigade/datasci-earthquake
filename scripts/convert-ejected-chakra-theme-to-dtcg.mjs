import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import ts from "typescript";

const root = process.cwd();
const themeDirectory = resolve(root, "theme-merged");
const outputFile = resolve(themeDirectory, "theme.tokens.json");
const chakraExtension = "com.safehome.chakra-ui";

const primitiveSources = [
  ["colors", "color"],
  ["spacing", "dimension"],
  ["sizes", "dimension"],
  ["fonts", "fontFamily"],
  ["font-sizes", "dimension"],
  ["font-weights", "fontWeight"],
  ["line-heights", "number"],
  ["letter-spacings", "dimension"],
  ["radii", "dimension"],
  ["border-widths", "dimension"],
  ["border-styles", "strokeStyle"],
  ["durations", "duration"],
  ["easings", "cubicBezier"],
  ["blurs", "dimension"],
  ["z-index", "number"],
  // DTCG gradients contain stops only, while Chakra's CSS gradients also carry
  // geometry (shape, size, and position). Keep those losslessly in the Chakra
  // extension until the source model gains those fields.
  ["gradients", "chakraOnly"],
  ["aspect-ratios", "aspectRatio"],
  ["animations", "animation"],
  ["borders", "border"],
  ["cursor", "cursor"],
];

function propertyName(name) {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  ) {
    return name.text;
  }
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
        if (!ts.isPropertyAssignment(property)) {
          throw new Error(`Unsupported object member: ${property.getText()}`);
        }
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
  const declaration = source.statements.find(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (item) => ts.isVariableDeclaration(item) && item.initializer
      )
  );
  const variable = declaration?.declarationList.declarations.find(
    (item) => ts.isVariableDeclaration(item) && item.initializer
  );

  if (!variable?.initializer || !ts.isCallExpression(variable.initializer)) {
    throw new Error(
      `${relative(root, file)} does not export a supported Chakra token object.`
    );
  }

  const [argument] = variable.initializer.arguments;
  if (!argument || !ts.isObjectLiteralExpression(argument)) {
    throw new Error(
      `${relative(root, file)} has no object literal token argument.`
    );
  }
  return evaluate(argument);
}

function isLeaf(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "value" in value
  );
}

function setAtPath(target, path, value) {
  let current = target;
  for (const part of path.slice(0, -1)) current = current[part] ??= {};
  current[path.at(-1)] = value;
}

function walkLeaves(value, path, callback) {
  if (isLeaf(value)) {
    callback(value, path);
    return;
  }
  for (const [key, child] of Object.entries(value))
    walkLeaves(child, [...path, key], callback);
}

function normalizedPath(path) {
  return path.map((part) =>
    part === "DEFAULT" ? "$root" : part.replaceAll(".", "_")
  );
}

function dimension(value) {
  if (typeof value === "number") return { value, unit: "px" };
  if (typeof value !== "string") return undefined;
  const match = value.trim().match(/^(-?(?:\d+\.?\d*|\.\d+))(px|rem)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : undefined;
}

function duration(value) {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^(-?(?:\d+\.?\d*|\.\d+))(ms|s)$/);
  return match ? { value: Number(match[1]), unit: match[2] } : undefined;
}

function cubicBezier(value) {
  if (typeof value !== "string") return undefined;
  const match = value.match(/^cubic-bezier\(([^)]+)\)$/);
  if (!match) return undefined;
  const points = match[1].split(",").map((point) => Number(point.trim()));
  return points.length === 4 && points.every(Number.isFinite)
    ? points
    : undefined;
}

function color(value, references) {
  if (typeof value !== "string") return undefined;
  if (value.startsWith("{") && value.endsWith("}"))
    return reference(value, references);
  if (value === "white" || value === "black")
    return reference(`{colors.${value}}`, references);

  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex) {
    const expanded =
      hex.length <= 4
        ? [...hex].map((component) => component.repeat(2)).join("")
        : hex;
    const components = [0, 2, 4].map(
      (index) => Number.parseInt(expanded.slice(index, index + 2), 16) / 255
    );
    const alpha =
      expanded.length === 8
        ? Number.parseInt(expanded.slice(6, 8), 16) / 255
        : undefined;
    return {
      colorSpace: "srgb",
      components,
      ...(alpha === undefined ? {} : { alpha }),
      // DTCG's `hex` fallback is deliberately six digits; alpha is represented
      // separately by the standard `alpha` property.
      hex: `#${expanded.slice(0, 6).toLowerCase()}`,
    };
  }

  const rgba = value
    .match(/^rgba?\(([^)]+)\)$/i)?.[1]
    .split(",")
    .map((component) => component.trim());
  if (
    rgba &&
    (rgba.length === 3 || rgba.length === 4) &&
    rgba.slice(0, 3).every((component) => /^\d+$/.test(component))
  ) {
    const components = rgba
      .slice(0, 3)
      .map((component) => Number(component) / 255);
    const alpha = rgba[3] === undefined ? undefined : Number(rgba[3]);
    return Number.isFinite(alpha ?? 1)
      ? {
          colorSpace: "srgb",
          components,
          ...(alpha === undefined ? {} : { alpha }),
        }
      : undefined;
  }
  return undefined;
}

function reference(value, references) {
  const name = value.slice(1, -1);
  return references.get(name) ? `{${references.get(name)}}` : undefined;
}

function fontFamily(value) {
  if (typeof value !== "string") return undefined;
  return value
    .split(",")
    .map((family) => family.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function valueFor(type, value, references) {
  switch (type) {
    case "color":
      return color(value, references);
    case "dimension":
      return dimension(value);
    case "fontFamily":
      return fontFamily(value);
    case "fontWeight":
      return typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : undefined;
    case "number":
      return typeof value === "number" ? value : undefined;
    case "duration":
      return duration(value);
    case "cubicBezier":
      return cubicBezier(value);
    case "strokeStyle":
      return value === "solid" ? value : undefined;
    default:
      return undefined;
  }
}

function convertedTree(tree, type, references, unsupported) {
  const output = {};
  walkLeaves(tree, [], (leaf, rawPath) => {
    const tokenValue = valueFor(type, leaf.value, references);
    if (tokenValue === undefined) {
      setAtPath(unsupported, rawPath, leaf);
      return;
    }
    setAtPath(output, normalizedPath(rawPath), {
      ...(leaf.description ? { $description: leaf.description } : {}),
      $value: tokenValue,
    });
  });
  return output;
}

function colorModes(tree, references, unsupported) {
  const light = {};
  const dark = {};
  const shared = {};

  walkLeaves(tree, [], (leaf, rawPath) => {
    const path = normalizedPath(rawPath);
    const modes = leaf.value;
    if (
      modes &&
      typeof modes === "object" &&
      "_light" in modes &&
      "_dark" in modes
    ) {
      const lightValue = color(modes._light, references);
      const darkValue = color(modes._dark, references);
      if (lightValue === undefined || darkValue === undefined) {
        setAtPath(unsupported, rawPath, leaf);
        return;
      }
      setAtPath(light, path, {
        $value: lightValue,
      });
      setAtPath(dark, path, {
        $value: darkValue,
      });
      return;
    }
    const sharedValue = color(leaf.value, references);
    if (sharedValue === undefined) {
      setAtPath(unsupported, rawPath, leaf);
      return;
    }
    setAtPath(shared, path, {
      $value: sharedValue,
    });
  });

  return { light, dark, shared };
}

const primitive = {};
const chakraOnlyTokens = { primitive: {}, semantic: {} };
const references = new Map();
const rawPrimitive = new Map();

for (const [sourceName, type] of primitiveSources) {
  rawPrimitive.set(
    sourceName,
    await readChakraObject(
      resolve(themeDirectory, "tokens", `${sourceName}.ts`)
    )
  );
}

for (const [sourceName, type] of primitiveSources) {
  const outputName =
    {
      colors: "color",
      "font-sizes": "fontSize",
      "font-weights": "fontWeight",
      "line-heights": "lineHeight",
      "letter-spacings": "letterSpacing",
      radii: "borderRadius",
      "border-widths": "borderWidth",
      "border-styles": "strokeStyle",
      "z-index": "zIndex",
    }[sourceName] ?? sourceName;
  walkLeaves(rawPrimitive.get(sourceName), [sourceName], (_, rawPath) => {
    const target = [
      "primitive",
      outputName,
      ...normalizedPath(rawPath.slice(1)),
    ].join(".");
    references.set(rawPath.join("."), target);
    if (rawPath.at(-1) === "DEFAULT")
      references.set(rawPath.slice(0, -1).join("."), target);
  });
}

const semanticColors = await readChakraObject(
  resolve(themeDirectory, "semantic-tokens/colors.ts")
);
walkLeaves(semanticColors, ["colors"], (_, rawPath) => {
  const target = [
    "semantic",
    "color",
    "shared",
    ...normalizedPath(rawPath.slice(1)),
  ].join(".");
  if (!references.has(rawPath.join(".")))
    references.set(rawPath.join("."), target);
});

for (const [sourceName, type] of primitiveSources) {
  const outputName =
    {
      colors: "color",
      "font-sizes": "fontSize",
      "font-weights": "fontWeight",
      "line-heights": "lineHeight",
      "letter-spacings": "letterSpacing",
      radii: "borderRadius",
      "border-widths": "borderWidth",
      "border-styles": "strokeStyle",
      "z-index": "zIndex",
    }[sourceName] ?? sourceName;
  const categoryUnsupported = (chakraOnlyTokens.primitive[outputName] = {});
  const tree = convertedTree(
    rawPrimitive.get(sourceName),
    type,
    references,
    categoryUnsupported
  );
  if (Object.keys(tree).length)
    primitive[outputName] = { $type: type, ...tree };
  if (!Object.keys(categoryUnsupported).length)
    delete chakraOnlyTokens.primitive[outputName];
}

const semanticColorUnsupported = (chakraOnlyTokens.semantic.color = {});
const semanticColor = colorModes(
  semanticColors,
  references,
  semanticColorUnsupported
);
if (!Object.keys(semanticColorUnsupported).length)
  delete chakraOnlyTokens.semantic.color;

const semanticRadii = await readChakraObject(
  resolve(themeDirectory, "semantic-tokens/radii.ts")
);
const semanticRadiusUnsupported = (chakraOnlyTokens.semantic.borderRadius = {});
const semanticRadius = convertedTree(
  semanticRadii,
  "dimension",
  references,
  semanticRadiusUnsupported
);
if (!Object.keys(semanticRadiusUnsupported).length)
  delete chakraOnlyTokens.semantic.borderRadius;

const semanticSizes = await readChakraObject(
  resolve(themeDirectory, "semantic-tokens/sizes.ts")
);
const semanticSizeUnsupported = (chakraOnlyTokens.semantic.size = {});
const semanticSize = convertedTree(
  semanticSizes,
  "dimension",
  references,
  semanticSizeUnsupported
);
if (!Object.keys(semanticSizeUnsupported).length)
  delete chakraOnlyTokens.semantic.size;

const semanticShadows = await readChakraObject(
  resolve(themeDirectory, "semantic-tokens/shadows.ts")
);
const semanticAssets = await readChakraObject(
  resolve(themeDirectory, "semantic-tokens/assets.ts")
);
chakraOnlyTokens.semantic.shadow = semanticShadows;
chakraOnlyTokens.semantic.asset = semanticAssets;

const document = {
  $description:
    "DTCG export generated from the ejected Chakra UI theme. Light and dark semantic colors are separate mode groups because DTCG does not standardize modes.",
  primitive,
  semantic: {
    color: {
      light: { $type: "color", ...semanticColor.light },
      dark: { $type: "color", ...semanticColor.dark },
      shared: { $type: "color", ...semanticColor.shared },
    },
    ...(Object.keys(semanticRadius).length
      ? { borderRadius: { $type: "dimension", ...semanticRadius } }
      : {}),
    ...(Object.keys(semanticSize).length
      ? { size: { $type: "dimension", ...semanticSize } }
      : {}),
  },
  $extensions: {
    [chakraExtension]: {
      source: "theme-merged",
      chakraOnlyTokens,
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
    },
  },
};

await mkdir(dirname(outputFile), { recursive: true });
await writeFile(outputFile, `${JSON.stringify(document, null, 2)}\n`);
console.log(`Wrote ${relative(root, outputFile)}`);
