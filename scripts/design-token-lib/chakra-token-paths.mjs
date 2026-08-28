export const primitiveNames = {
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

export const semanticNames = {
  color: "colors",
  borderRadius: "radii",
  size: "sizes",
  shadow: "shadows",
  asset: "assets",
};

export function chakraTokenName(name) {
  return /^-?\d+_\d+$/.test(name) ? name.replace("_", ".") : name;
}

export function chakraGroupPath(canonicalPath) {
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

export function chakraPathForCanonicalName(canonicalName) {
  return chakraGroupPath(canonicalName.split("."))?.join(".");
}

export function findChakraPathCollisions(mappings) {
  const portableTargets = new Map();
  const platformTargets = new Map();

  for (const mapping of mappings) {
    if (mapping.disposition === "chakra-platform") {
      platformTargets.set(mapping.canonical, mapping.source);
      continue;
    }
    const target = chakraPathForCanonicalName(mapping.canonical);
    if (target) portableTargets.set(target, mapping.source);
  }

  return [...platformTargets]
    .filter(([target]) => portableTargets.has(target))
    .map(([target, platformSource]) => ({
      target,
      portableSource: portableTargets.get(target),
      platformSource,
    }))
    .sort((left, right) => left.target.localeCompare(right.target));
}
