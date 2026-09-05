import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createJiti } from "jiti";

const root = process.cwd();
const fixture = path.join(root, "scripts/design-system/evidence/fixtures/semantic-cases.tsx");
const jiti = createJiti(import.meta.url, {alias: {"@": path.join(root, "app")}});
const loaded = await jiti.import(path.join(root, "styles/theme.ts"));
const system = loaded.default ?? loaded;
const utilityTypes = system.utility.getTypes();
const reverseCssVar = new Map([...system.tokens.flatMap.entries()].map(([name, ref]) => [ref, name]));

const text = fs.readFileSync(fixture, "utf8");
const sf = ts.createSourceFile(fixture, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const imports = new Map();
for (const st of sf.statements) {
  if (!ts.isImportDeclaration(st) || st.moduleSpecifier.text !== "@chakra-ui/react") continue;
  const named = st.importClause?.namedBindings;
  if (!named || !ts.isNamedImports(named)) continue;
  for (const el of named.elements) imports.set(el.name.text, el.propertyName?.text ?? el.name.text);
}

function rootComponent(tag) {
  if (ts.isIdentifier(tag)) return imports.get(tag.text) ?? null;
  if (ts.isPropertyAccessExpression(tag)) {
    let cur = tag.expression;
    while (ts.isPropertyAccessExpression(cur)) cur = cur.expression;
    return ts.isIdentifier(cur) ? imports.get(cur.text) ?? null : null;
  }
  return null;
}
function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
  return null;
}
function propKey(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}
function domainsFor(prop) {
  const resolved = system.utility.resolveShorthand?.(prop) ?? prop;
  const types = utilityTypes.get(resolved) ?? utilityTypes.get(prop) ?? [];
  return [...new Set(types.flatMap((entry) => [...entry.matchAll(/Tokens\["([^"]+)"\]/g)].map((m) => m[1])))].sort();
}
function semanticRefs(styleObject) {
  const css = system.css(styleObject);
  const refs = new Set();
  function walk(value) {
    if (typeof value === "string") {
      const name = reverseCssVar.get(value);
      if (name) refs.add(name);
    } else if (value && typeof value === "object") {
      for (const child of Object.values(value)) walk(child);
    }
  }
  walk(css);
  return [...refs].sort();
}
function recipeFor(component) {
  const key = component.charAt(0).toLowerCase() + component.slice(1);
  for (const getter of ["getRecipe", "getSlotRecipe"]) {
    try {
      const recipe = system[getter]?.(key);
      if (recipe?.variants || recipe?.defaultVariants) return {key, recipe};
    } catch {}
  }
  return null;
}

const facts = [];
const nonTokenStyles = [];
let site = 0;

function addStyleFact(component, prop, value, sourcePath) {
  if (prop === "textStyle" || prop === "layerStyle") {
    facts.push({kind: prop === "textStyle" ? "explicit-text-style" : "explicit-layer-style", component, prop: sourcePath, value, entity: `${prop}.${value}`, semanticRefs: semanticRefs({[prop]: value})});
    return;
  }
  if (prop === "colorPalette") {
    const css = system.css({colorPalette: value});
    const bindings = semanticRefs({colorPalette: value});
    facts.push({kind: "color-palette-context", component, prop: sourcePath, value, concreteBindings: bindings, cssVariableCount: Object.keys(css).length});
    return;
  }
  const domains = domainsFor(prop);
  const tokenMatches = domains.map((domain) => `${domain}.${value}`).filter((name) => system.tokens.getByName(name));
  if (tokenMatches.length) {
    facts.push({kind: "explicit-token", component, prop: sourcePath, value, domains, tokenRefs: tokenMatches.sort(), semanticRefs: semanticRefs({[prop]: value})});
  } else {
    nonTokenStyles.push({component, prop: sourcePath, value, domains});
  }
}

function addUnresolved(component, prop, expression, sourcePath) {
  facts.push({kind: "unresolved-style", component, prop: sourcePath, expression, domains: domainsFor(prop)});
}

function classifyObject(component, conditionPath, object) {
  for (const p of object.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const key = propKey(p.name);
    if (!key) continue;
    if (key.startsWith("_")) {
      if (ts.isObjectLiteralExpression(p.initializer)) classifyObject(component, `${conditionPath}${key}.`, p.initializer);
      continue;
    }
    const value = literal(p.initializer);
    const sourcePath = `${conditionPath}${key}`;
    if (value !== null) addStyleFact(component, key, value, sourcePath);
    else if (ts.isObjectLiteralExpression(p.initializer)) classifyObject(component, `${sourcePath}.`, p.initializer);
    else addUnresolved(component, key, p.initializer.getText(sf), sourcePath);
  }
}

function visit(node) {
  if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
    const component = rootComponent(node.tagName);
    if (component) {
      site += 1;
      const recipeMeta = recipeFor(component);
      const explicitRecipeProps = new Set();
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const prop = attr.name.getText(sf);
        let expression = null;
        let value = null;
        if (!attr.initializer) value = "true";
        else if (ts.isStringLiteral(attr.initializer)) value = attr.initializer.text;
        else if (ts.isJsxExpression(attr.initializer) && attr.initializer.expression) {
          expression = attr.initializer.expression;
          value = literal(expression);
        }

        const variants = recipeMeta?.recipe?.variants ?? {};
        if (Object.prototype.hasOwnProperty.call(variants, prop) && value !== null) {
          explicitRecipeProps.add(prop);
          facts.push({kind: "explicit-recipe-variant", component, site, prop, value, recipe: recipeMeta.key});
          continue;
        }
        if (prop.startsWith("_") && expression && ts.isObjectLiteralExpression(expression)) {
          classifyObject(component, `${prop}.`, expression);
          continue;
        }
        if (!system.isValidProperty(prop)) continue;
        if (value !== null) addStyleFact(component, prop, value, prop);
        else if (expression && ts.isObjectLiteralExpression(expression)) classifyObject(component, `${prop}.`, expression);
        else addUnresolved(component, prop, expression?.getText(sf) ?? "", prop);
      }
      const defaults = recipeMeta?.recipe?.defaultVariants ?? {};
      for (const [prop, value] of Object.entries(defaults)) {
        if (!explicitRecipeProps.has(prop)) facts.push({kind: "implied-recipe-default", component, site, prop, value, recipe: recipeMeta.key});
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(sf);

function hasFact(match) {
  return facts.some((fact) => Object.entries(match).every(([key, value]) => {
    if (Array.isArray(value)) return JSON.stringify(fact[key]) === JSON.stringify(value);
    return fact[key] === value;
  }));
}
const sentinels = {
  spacingToken: hasFact({kind:"explicit-token", prop:"p", value:"4", tokenRefs:["spacing.4"]}),
  colorToken: hasFact({kind:"explicit-token", prop:"color", value:"blue.text", tokenRefs:["colors.blue.text"]}),
  weightToken: hasFact({kind:"explicit-token", prop:"fontWeight", value:"bold", tokenRefs:["fontWeights.bold"]}),
  zIndexToken: hasFact({kind:"explicit-token", prop:"zIndex", value:"docked", tokenRefs:["zIndex.docked"]}),
  displayLiteralNotToken: nonTokenStyles.some((f) => f.prop === "display" && f.value === "flex") && !facts.some((f) => f.prop === "display" && f.kind === "explicit-token"),
  positionLiteralNotToken: nonTokenStyles.some((f) => f.prop === "position" && f.value === "absolute") && !facts.some((f) => f.prop === "position" && f.kind === "explicit-token"),
  textStyleNamed: hasFact({kind:"explicit-text-style", value:"textSmall", entity:"textStyle.textSmall"}),
  layerStyleNamed: hasFact({kind:"explicit-layer-style", value:"text", entity:"layerStyle.text"}),
  textStyleExpansion: facts.some((f) => f.kind === "explicit-text-style" && f.value === "textSmall" && ["fonts.body","fontSizes.sm","fontWeights.normal"].every((x) => f.semanticRefs.includes(x))),
  buttonDefaultsImplied: facts.some((f) => f.kind === "implied-recipe-default" && f.component === "Button" && f.prop === "size" && f.value === "md") && facts.some((f) => f.kind === "implied-recipe-default" && f.component === "Button" && f.prop === "variant" && f.value === "solid"),
  buttonExplicitVariants: hasFact({kind:"explicit-recipe-variant", component:"Button", prop:"size", value:"sm"}) && hasFact({kind:"explicit-recipe-variant", component:"Button", prop:"variant", value:"ghost"}),
  explicitButtonSuppressesDefaults: !facts.some((f) => f.kind === "implied-recipe-default" && f.component === "Button" && (f.site === 4) && (f.prop === "size" || f.prop === "variant")),
  unresolvedColorDomain: facts.some((f) => f.kind === "unresolved-style" && f.prop === "color" && f.domains.includes("colors")),
  unresolvedSpacingDomain: facts.some((f) => f.kind === "unresolved-style" && f.prop === "p" && f.domains.includes("spacing")),
  hoverNestedColor: hasFact({kind:"explicit-token", prop:"_hover.color", value:"grey.400", tokenRefs:["colors.grey.400"]}),
  paletteContextSeparate: facts.some((f) => f.kind === "color-palette-context" && f.value === "blue") && !facts.some((f) => f.kind === "explicit-token" && f.prop === "colorPalette"),
};

const result = {
  schema: "safehome.design-system-evidence.phase0-classifier.v1",
  typescriptVersion: ts.version,
  sentinels,
  counts: {facts: facts.length, tokenFacts: facts.filter((f) => f.kind === "explicit-token").length, nonTokenStyles: nonTokenStyles.length, unresolved: facts.filter((f) => f.kind === "unresolved-style").length},
  facts,
  nonTokenStyles,
};
const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "phase0-classifier.json");
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
const passed = Object.values(sentinels).filter(Boolean).length;
console.log(`PHASE0_CLASSIFIER sentinels=${passed}/${Object.keys(sentinels).length} facts=${facts.length} nonTokenStyles=${nonTokenStyles.length}`);
for (const [name, pass] of Object.entries(sentinels)) console.log(`SENTINEL ${name}=${pass ? "PASS" : "FAIL"}`);
if (passed !== Object.keys(sentinels).length) process.exitCode = 1;
console.log(`RECEIPT=${out}`);
