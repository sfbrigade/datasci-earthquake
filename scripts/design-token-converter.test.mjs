import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  colorToCss,
  compileTheme,
  tokenValue,
} from "./convert-dtcg-tokens-to-chakra.mjs";

const [tokensDocument, resolverDocument, chakraDocument, chakraSchema, report] =
  await Promise.all(
    [
      "theme-merged/theme.tokens.json",
      "theme-merged/theme.resolver.json",
      "theme-merged/theme.chakra.json",
      "theme-merged/theme.chakra.schema.json",
      "theme-merged/theme.report.json",
    ].map((file) => readFile(file, "utf8").then(JSON.parse))
  );

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function tokenEntries(document) {
  const entries = new Map();
  function visit(value, path = [], inheritedType) {
    if (!isObject(value)) return;
    const type = value.$type ?? inheritedType;
    if (Object.hasOwn(value, "$value")) {
      entries.set(path.join("."), { token: value, inheritedType, type });
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

function chakraLeafCount(document) {
  let count = 0;
  function visit(value) {
    if (!isObject(value)) return;
    if (Object.hasOwn(value, "value")) {
      count += 1;
      return;
    }
    Object.values(value).forEach(visit);
  }
  visit(document);
  return count;
}

function referencePath(value) {
  if (typeof value === "string" && /^\{[^{}]+\}$/.test(value))
    return value.slice(1, -1);
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
    return parts.join(".");
  }
  return undefined;
}

function referencesIn(value, output = []) {
  const path = referencePath(value);
  if (path) output.push(path);
  else if (Array.isArray(value))
    value.forEach((item) => referencesIn(item, output));
  else if (isObject(value))
    Object.values(value).forEach((item) => referencesIn(item, output));
  return output;
}

const baseEntries = tokenEntries(tokensDocument);
const darkDocument = resolverDocument.modifiers.theme.contexts.dark[0];
const darkEntries = tokenEntries(darkDocument);
const compiled = compileTheme(tokensDocument, resolverDocument, chakraDocument);

test("portable document uses legal DTCG identities and explicit concrete types", () => {
  assert.equal(
    tokensDocument.$schema,
    "https://www.designtokens.org/schemas/2025.10/format.json"
  );
  function visit(value) {
    if (!isObject(value)) return;
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("$")) {
        assert.ok(
          ["$schema", "$description", "$type", "$root", "$value"].includes(key),
          `unexpected DTCG property ${key}`
        );
      } else {
        assert.match(key, /^[^${}.][^{}.]*$/, `illegal DTCG name ${key}`);
      }
      if (!key.startsWith("$") || key === "$root") visit(child);
    }
  }
  visit(tokensDocument);
  for (const [path, { token, type }] of baseEntries) {
    assert.equal(typeof token.$type, "string", `${path} lacks explicit $type`);
    assert.equal(token.$type, type);
  }

  const inherited = structuredClone(tokensDocument.primitive.spacing["0_5"]);
  delete inherited.$type;
  assert.equal(
    tokenValue(inherited, tokensDocument.primitive.spacing.$type),
    "0.125rem"
  );
});

test("all portable and contextual aliases resolve against the base set", () => {
  const missing = [
    ...referencesIn(tokensDocument),
    ...referencesIn(darkDocument),
  ].filter((path) => !baseEntries.has(path));
  assert.deepEqual(missing, []);
  assert.deepEqual(report.unresolvedReferences, []);
});

test("DEFAULT and fractional identities round trip without light/dark path segments", () => {
  assert.ok(baseEntries.has("semantic.color.bg.$root"));
  assert.ok(baseEntries.has("semantic.color.bg.subtle"));
  assert.equal(baseEntries.has("semantic.color.light.bg.$root"), false);
  assert.equal(baseEntries.has("semantic.color.dark.bg.$root"), false);
  assert.deepEqual(compiled.semanticTokens.colors.bg.DEFAULT.value, {
    _light: "{colors.white}",
    _dark: "{colors.black}",
  });
  assert.deepEqual(compiled.semanticTokens.colors.bg.subtle.value, {
    _light: "{colors.gray.50}",
    _dark: "{colors.gray.950}",
  });
  assert.equal(compiled.tokens.spacing["0.5"].value, "0.125rem");
  assert.ok(
    report.defaultRootMappings.some(
      (mapping) => mapping.source === "semanticTokens.colors.bg.DEFAULT"
    )
  );
  assert.ok(
    report.nameMappings.some(
      (mapping) => mapping.from === "0.5" && mapping.to === "0_5"
    )
  );
});

test("resolver applies dark values to the same paths and retains equal contextual values", () => {
  assert.equal(resolverDocument.version, "2025.10");
  assert.deepEqual(resolverDocument.modifiers.theme.contexts.light, []);
  assert.equal(resolverDocument.modifiers.theme.default, "light");
  assert.deepEqual(
    resolverDocument.resolutionOrder.map((item) => item.$ref),
    ["#/sets/base", "#/modifiers/theme"]
  );
  assert.equal(darkEntries.size, report.counts.themeContextualTokenCount);
  for (const path of darkEntries.keys())
    assert.ok(baseEntries.has(path), `${path} has no light/base identity`);

  const equalPath = "semantic.color.gray.focusRing";
  assert.deepEqual(
    darkEntries.get(equalPath).token.$value,
    baseEntries.get(equalPath).token.$value
  );
  assert.deepEqual(compiled.semanticTokens.colors.gray.focusRing.value, {
    _light: "{colors.gray.400}",
    _dark: "{colors.gray.400}",
  });
});

test("portable radii, dimensions, font intent, and web font bindings are lossless", () => {
  assert.equal(
    tokensDocument.semantic.borderRadius.l1.$value,
    "{primitive.borderRadius.xs}"
  );
  assert.equal(
    tokensDocument.semantic.borderRadius.l2.$value,
    "{primitive.borderRadius.sm}"
  );
  assert.equal(
    tokensDocument.semantic.borderRadius.l3.$value,
    "{primitive.borderRadius.md}"
  );
  assert.deepEqual(tokensDocument.primitive.borderRadius.none.$value, {
    value: 0,
    unit: "px",
  });

  for (const [path, { token }] of baseEntries) {
    if (
      token.$type === "dimension" &&
      isObject(token.$value) &&
      !referencePath(token.$value)
    ) {
      assert.ok(
        ["px", "rem"].includes(token.$value.unit),
        `${path} uses ${token.$value.unit}`
      );
    }
  }
  assert.equal(chakraDocument.tokens.sizes.full.value, "100%");
  assert.equal(chakraDocument.tokens.sizes.dvh.value, "100dvh");
  assert.equal(chakraDocument.tokens.sizes.max.value, "max-content");

  assert.deepEqual(tokensDocument.primitive.fonts.heading.$value, [
    "Manrope",
    "sans-serif",
  ]);
  assert.deepEqual(tokensDocument.primitive.fonts.body.$value, [
    "Inter",
    "sans-serif",
  ]);
  assert.equal(
    chakraDocument.bindings["tokens.fonts.heading"].source,
    "primitive.fonts.heading"
  );
  assert.equal(
    compiled.tokens.fonts.heading.value,
    "var(--font-manrope), sans-serif"
  );
  assert.equal(
    compiled.tokens.fonts.body.value,
    "var(--font-inter), sans-serif"
  );
});

test("structured alpha round trips to the original eight-digit CSS color", () => {
  const overlay = tokensDocument.semantic.color.cooperativeGesturesOverlay;
  assert.equal(overlay.$value.alpha, 128 / 255);
  assert.equal(colorToCss(overlay.$value), "#00000080");
  assert.equal(
    compiled.semanticTokens.colors.cooperativeGesturesOverlay.value,
    "#00000080"
  );
});

test("complete borders are portable while lossy CSS composites remain platform-specific", () => {
  assert.equal(tokensDocument.primitive.borders.search.$type, "border");
  assert.equal(
    compiled.tokens.borders.search.value,
    "{borderWidths.0.25} {borderStyles.solid} {colors.grey.600}"
  );
  assert.equal(chakraDocument.tokens.borders.xs.value, "0.5px solid");
  assert.equal(tokensDocument.primitive.borders.xs, undefined);
  assert.ok(
    chakraDocument.semanticTokens.shadows.search.value.includes("{spacing.0}")
  );
});

test("Chakra supplement collisions fail unless represented as explicit bindings", () => {
  const collision = structuredClone(chakraDocument);
  collision.tokens.colors ??= {};
  collision.tokens.colors.black = { value: "#ffffff" };
  assert.throws(
    () => compileTheme(tokensDocument, resolverDocument, collision),
    /supplement collision at tokens\.colors\.black/
  );

  const invalidBinding = structuredClone(chakraDocument);
  invalidBinding.bindings["tokens.fonts.mono"] = {
    source: "primitive.fonts.heading",
    value: "monospace",
    reason: "test",
  };
  assert.throws(
    () => compileTheme(tokensDocument, resolverDocument, invalidBinding),
    /does not match DTCG source/
  );
  assert.equal(
    compiled.tokens.fonts.heading.value,
    chakraDocument.bindings["tokens.fonts.heading"].value
  );
});

test("supplement follows its versioned schema contract", () => {
  assert.equal(chakraSchema.$schema, "http://json-schema.org/draft-07/schema#");
  assert.equal(chakraDocument.$schema, "./theme.chakra.schema.json");
  assert.equal(chakraDocument.schemaVersion, "1.0");
  assert.deepEqual(
    Object.keys(chakraDocument).sort(),
    chakraSchema.required.sort()
  );
  for (const binding of Object.values(chakraDocument.bindings)) {
    assert.equal(typeof binding.source, "string");
    assert.ok(Object.hasOwn(binding, "value"));
    assert.equal(typeof binding.reason, "string");
  }
});

test("migration report accounts for every source leaf exactly once", () => {
  assert.equal(report.counts.sourceLeafCount, 519);
  assert.equal(report.counts.portableDefaultTokenCount, baseEntries.size);
  assert.equal(report.counts.darkOverrideCount, darkEntries.size);
  assert.equal(
    report.counts.portableDefaultTokenCount + report.counts.chakraOnlyCount,
    report.counts.sourceLeafCount
  );
  const sources = report.mappings.map((mapping) => mapping.source);
  assert.equal(new Set(sources).size, sources.length);
  assert.ok(
    report.mappings.every((mapping) => mapping.disposition && mapping.canonical)
  );
  assert.ok(
    report.mappings
      .filter((mapping) => mapping.disposition === "chakra-platform")
      .every((mapping) => mapping.reason)
  );
  assert.deepEqual(report.collisions, []);
  assert.deepEqual(report.duplicateDispositions, []);
  assert.deepEqual(report.lossyConversionWarnings, []);
  assert.equal(
    chakraLeafCount(compiled.tokens) + chakraLeafCount(compiled.semanticTokens),
    report.counts.sourceLeafCount
  );
});
