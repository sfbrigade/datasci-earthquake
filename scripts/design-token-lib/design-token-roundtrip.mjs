import { chakraPathForCanonicalName } from "./chakra-token-paths.mjs";

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getAtPath(target, path) {
  return path.reduce((value, part) => value?.[part], target);
}

function flattenChakraLeaves(value, path = [], output = new Map()) {
  if (!isObject(value)) return output;
  if (Object.hasOwn(value, "value")) {
    output.set(path.join("."), value);
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    flattenChakraLeaves(child, [...path, key], output);
  }
  return output;
}

function canonicalColor(value) {
  if (typeof value !== "string") return undefined;
  if (/^\{[^{}]+\}$/.test(value)) return value;
  if (value === "transparent") return "#00000000";
  if (value === "black") return "#000000";
  if (value === "white") return "#ffffff";

  const hex = value.match(/^#([\da-f]{3,8})$/i)?.[1];
  if (hex && [3, 4, 6, 8].includes(hex.length)) {
    const expanded =
      hex.length <= 4 ? [...hex].map((part) => part.repeat(2)).join("") : hex;
    const rgb = expanded.slice(0, 6).toLowerCase();
    if (expanded.length === 6 || expanded.slice(6).toLowerCase() === "ff")
      return `#${rgb}`;
    return `#${rgb}${expanded.slice(6).toLowerCase()}`;
  }

  const rgba = value
    .match(/^rgba?\(([^)]+)\)$/i)?.[1]
    .split(",")
    .map((part) => part.trim());
  if (!rgba || ![3, 4].includes(rgba.length)) return undefined;
  const channels = rgba.slice(0, 3).map(Number);
  const alpha = rgba[3] === undefined ? 1 : Number(rgba[3]);
  if (
    channels.some(
      (channel) => !Number.isInteger(channel) || channel < 0 || channel > 255
    )
  )
    return undefined;
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) return undefined;
  const hexColor = `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
  if (alpha === 1) return hexColor;
  const alphaByte = Math.round(alpha * 255);
  if (Math.abs(alpha - alphaByte / 255) < 1e-12) {
    return `${hexColor}${alphaByte.toString(16).padStart(2, "0")}`;
  }
  return `rgb(${channels.join(" ")} / ${alpha})`;
}

function expectedPortableValue(type, value) {
  if (
    isObject(value) &&
    Object.hasOwn(value, "_light") &&
    Object.hasOwn(value, "_dark")
  ) {
    return {
      _light: expectedPortableValue(type, value._light),
      _dark: expectedPortableValue(type, value._dark),
    };
  }
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value)) return value;
  switch (type) {
    case "color":
      return canonicalColor(value);
    case "dimension":
      return typeof value === "number" || value === "0"
        ? `${Number(value)}px`
        : value;
    case "fontFamily":
      return typeof value === "string"
        ? value
            .split(",")
            .map((family) => family.trim().replace(/^['"]|['"]$/g, ""))
            .filter(Boolean)
            .join(", ")
        : value;
    case "fontWeight":
      return typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : value;
    default:
      return value;
  }
}

function formatMismatch(source, field, expected, actual) {
  return `${source} ${field}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`;
}

export function compareTokenRoundTrip({
  compiled,
  tokensDocument,
  chakraDocument,
  report,
}) {
  const actualLeaves = flattenChakraLeaves(compiled);
  const expectedPaths = new Set();
  const mismatches = [];

  for (const mapping of report.mappings) {
    const source = mapping.source;
    const sourceToken = mapping.sourceToken;
    expectedPaths.add(source);
    if (!sourceToken || !Object.hasOwn(sourceToken, "value")) {
      mismatches.push(
        `${source} has no exact sourceToken snapshot in theme.report.json`
      );
      continue;
    }

    const actual = actualLeaves.get(source);
    if (!actual) {
      mismatches.push(`${source} is missing from compiled Chakra output`);
      continue;
    }

    if (mapping.disposition !== "chakra-platform") {
      const generatedPath = chakraPathForCanonicalName(mapping.canonical);
      if (generatedPath !== source) {
        mismatches.push(
          `${source} maps to ${mapping.canonical}, which generates at ${generatedPath}`
        );
      }
    }

    const binding = chakraDocument.bindings[source];
    const canonicalToken =
      mapping.disposition === "chakra-platform"
        ? undefined
        : getAtPath(tokensDocument, mapping.canonical.split("."));
    const expectedValue = binding
      ? binding.value
      : mapping.disposition === "chakra-platform"
        ? sourceToken.value
        : expectedPortableValue(canonicalToken?.$type, sourceToken.value);

    if (!Object.is(sourceToken.description, actual.description)) {
      mismatches.push(
        formatMismatch(
          source,
          "description",
          sourceToken.description,
          actual.description
        )
      );
    }
    if (JSON.stringify(expectedValue) !== JSON.stringify(actual.value)) {
      mismatches.push(
        formatMismatch(source, "value", expectedValue, actual.value)
      );
    }
  }

  for (const path of actualLeaves.keys()) {
    if (!expectedPaths.has(path))
      mismatches.push(`${path} is an unexpected compiled Chakra token`);
  }

  return {
    sourceLeafCount: report.mappings.length,
    outputLeafCount: actualLeaves.size,
    mismatches,
  };
}
