import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  colorToCss,
  compileTheme,
  renderTheme,
  tokenValue,
} from "./convert-dtcg-tokens-to-chakra.mjs";
import { findChakraPathCollisions } from "./design-token-lib/chakra-token-paths.mjs";
import { compareTokenRoundTrip } from "./design-token-lib/design-token-roundtrip.mjs";
import { validateDesignTokenArtifact } from "./design-token-lib/validate-design-token-schema.mjs";

const readJson = (file) => readFile(file, "utf8").then(JSON.parse);
const [
  tokensDocument,
  resolverDocument,
  chakraDocument,
  chakraSchema,
  report,
  formatSchema,
  resolverSchema,
  committedGeneratedSource,
  forwardCompilerSource,
] = await Promise.all([
  readJson("theme-merged/theme.tokens.json"),
  readJson("theme-merged/theme.resolver.json"),
  readJson("theme-merged/theme.chakra.json"),
  readJson("theme-merged/theme.chakra.schema.json"),
  readJson("theme-merged/theme.report.json"),
  readJson("scripts/schemas/dtcg/2025.10/format.json"),
  readJson("scripts/schemas/dtcg/2025.10/resolver.json"),
  readFile("styles/generated-dtcg-theme.ts", "utf8"),
  readFile("scripts/convert-dtcg-tokens-to-chakra.mjs", "utf8"),
]);

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
const roundTrip = compareTokenRoundTrip({
  compiled,
  tokensDocument,
  chakraDocument,
  report,
});

test("all ejected source leaves round trip with exact paths and equivalent values", () => {
  assert.equal(roundTrip.sourceLeafCount, report.counts.sourceLeafCount);
  assert.equal(roundTrip.outputLeafCount, roundTrip.sourceLeafCount);
  assert.deepEqual(roundTrip.mismatches, [], roundTrip.mismatches.join("\n\n"));
});

test("forward rendering is deterministic and committed generated output is current", async () => {
  const first = await renderTheme(
    tokensDocument,
    resolverDocument,
    chakraDocument
  );
  const second = await renderTheme(
    tokensDocument,
    resolverDocument,
    chakraDocument
  );
  assert.equal(second, first, "two in-memory renders differ");
  assert.equal(
    committedGeneratedSource,
    first,
    "styles/generated-dtcg-theme.ts is stale; run npm run gen:chakra-theme"
  );
  assert.doesNotMatch(
    forwardCompilerSource,
    /theme\.report\.json/,
    "the diagnostic migration report must not become a forward compiler input"
  );
});

test("all three authority artifacts pass real pinned JSON Schema validation", () => {
  validateDesignTokenArtifact(
    "theme-merged/theme.tokens.json",
    formatSchema,
    tokensDocument
  );
  validateDesignTokenArtifact(
    "theme-merged/theme.resolver.json",
    resolverSchema,
    resolverDocument
  );
  validateDesignTokenArtifact(
    "theme-merged/theme.chakra.json",
    chakraSchema,
    chakraDocument
  );
});

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

test("literal semantic black and white stay literals rather than inferred aliases", () => {
  assert.deepEqual(compiled.semanticTokens.colors.orange.contrast.value, {
    _light: "#ffffff",
    _dark: "#000000",
  });
  assert.deepEqual(compiled.semanticTokens.colors.yellow.contrast.value, {
    _light: "#000000",
    _dark: "#000000",
  });
  assert.notEqual(
    compiled.semanticTokens.colors.yellow.contrast.value._light,
    "{colors.black}"
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

test("report collision analysis compares canonical and platform mappings in Chakra space", () => {
  const collisions = findChakraPathCollisions([
    {
      source: "tokens.colors.black-from-dtcg",
      disposition: "portable-dtcg",
      canonical: "primitive.color.black",
    },
    {
      source: "tokens.colors.black-from-platform",
      disposition: "chakra-platform",
      canonical: "tokens.colors.black",
    },
  ]);
  assert.deepEqual(collisions, [
    {
      target: "tokens.colors.black",
      portableSource: "tokens.colors.black-from-dtcg",
      platformSource: "tokens.colors.black-from-platform",
    },
  ]);
  assert.deepEqual(findChakraPathCollisions(report.mappings), []);
  assert.deepEqual(report.collisions, []);
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

test("schema-valid colors outside the Chakra adapter subset fail explicitly", () => {
  const unsupported = structuredClone(tokensDocument);
  unsupported.primitive.color.black.$value = {
    colorSpace: "display-p3",
    components: [0.1, 0.2, 0.3],
  };
  validateDesignTokenArtifact(
    "unsupported-valid-color.fixture.json",
    formatSchema,
    unsupported
  );
  assert.throws(
    () => compileTheme(unsupported, resolverDocument, chakraDocument),
    /Unsupported DTCG colorSpace "display-p3" at primitive\.color\.black/
  );
});

test("migration report accounts for every source leaf exactly once", () => {
  assert.equal(report.counts.sourceLeafCount, report.mappings.length);
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
