import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { createJiti } from "jiti";

const root = process.cwd();
const normalize = (value) => path.relative(root, path.resolve(value)).split(path.sep).join("/");
const git = (...args) => execFileSync("git", args, {cwd: root, encoding: "utf8"}).trim();

const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram({rootNames: parsed.fileNames, options: parsed.options});
const checker = program.getTypeChecker();

const jiti = createJiti(import.meta.url, {alias: {"@": path.join(root, "app")}});
const loadedTheme = await jiti.import(path.join(root, "styles", "theme.ts"));
const system = loadedTheme.default ?? loadedTheme;
const utilityTypes = system.utility.getTypes();
const reverseCssVar = new Map([...system.tokens.flatMap.entries()].map(([name, ref]) => [ref, name]));

const lock = JSON.parse(fs.readFileSync(path.join(root, "package-lock.json"), "utf8"));
const packageVersion = (name) => lock.packages?.[`node_modules/${name}`]?.version ?? "unknown";
const baseHead = git("rev-parse", "HEAD");
const workspaceDirty = git("status", "--porcelain", "--untracked-files=no").length > 0;
const tree = workspaceDirty ? undefined : git("rev-parse", "HEAD^{tree}");

const sourceFiles = parsed.fileNames
  .map((file) => path.resolve(file))
  .filter((file) => /\.[jt]sx?$/.test(file))
  .filter((file) => !normalize(file).startsWith("scripts/design-system/evidence/"))
  .sort((a, b) => normalize(a).localeCompare(normalize(b)));
const sourceSet = new Set(sourceFiles);

function sourceClass(rel) {
  if (rel === "styles/theme.ts") return "theme";
  if (rel.includes("/__mocks__/") || rel.includes("/mocks/")) return "test-support";
  if (rel.includes("/__tests__/") || rel.includes("/tests/") || /\.(test|spec)\.[jt]sx?$/.test(rel)) return "test";
  if (rel.includes("/_archived/") || rel.includes("/archived/")) return "archived";
  if (rel.startsWith("stories/") || /\.stories\.[jt]sx?$/.test(rel) || rel.startsWith(".storybook/")) return "storybook";
  if (rel.startsWith("e2e-tests/") || rel.startsWith("e2e/")) return "e2e";
  if (rel.endsWith(".d.ts")) return "type-support";
  if (rel.startsWith("scripts/") || /\.config\.[jt]s$/.test(rel)) return "tooling";
  if (rel.startsWith("app/") || rel === "instrumentation-client.ts" || rel === "instrumentation.ts" || rel === "proxy.ts" || rel === "middleware.ts") return "app-source";
  return "other";
}

const excludedClasses = new Set(["tooling", "type-support"]);
function contentIdentity(file) {
  if (!workspaceDirty) return {kind: "git-blob", value: git("hash-object", "--", normalize(file))};
  return {kind: "sha256", value: crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")};
}

const files = sourceFiles.map((file, index) => {
  const rel = normalize(file);
  const klass = sourceClass(rel);
  const excluded = excludedClasses.has(klass);
  return {
    fileId: `f${String(index + 1).padStart(4, "0")}`,
    path: rel,
    sourceClass: klass,
    contentIdentity: contentIdentity(file),
    analysisStatus: excluded ? "excluded" : "partial",
    reason: excluded
      ? "Excluded from design-system usage extraction by safehome-source-classification.v1"
      : "Phase-0 preview: direct Chakra JSX and Chakra-contextual typed values are analyzed; local-wrapper propagation is not yet complete",
  };
});
const fileByPath = new Map(files.map((file) => [file.path, file]));
const absByFileId = new Map(files.map((file) => [file.fileId, path.join(root, file.path)]));

function span(sf, node) {
  const start = sf.getLineAndCharacterOfPosition(node.getStart(sf));
  const end = sf.getLineAndCharacterOfPosition(node.getEnd());
  return {
    startLine: start.line + 1,
    startColumn: start.character + 1,
    endLine: end.line + 1,
    endColumn: end.character + 1,
  };
}
function literal(node) {
  if (!node) return null;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return "true";
  if (node.kind === ts.SyntaxKind.FalseKeyword) return "false";
  return null;
}
function keyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}
function isConditionKey(key) {
  return key === "base" || Boolean(system.conditions?.has?.(key));
}
function domainsFor(prop) {
  const resolved = system.utility.resolveShorthand?.(prop) ?? prop;
  const types = utilityTypes.get(resolved) ?? utilityTypes.get(prop) ?? [];
  return [...new Set(types.flatMap((entry) => [...entry.matchAll(/Tokens\["([^"]+)"\]/g)].map((match) => match[1])))].sort();
}
function semanticRefs(styleObject) {
  let css;
  try {
    css = system.css(styleObject);
  } catch {
    return [];
  }
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
function tokenRefsFor(prop, value, explicitDomains = null) {
  const domains = explicitDomains ?? domainsFor(prop);
  return domains.map((domain) => `${domain}.${value}`).filter((name) => system.tokens.getByName(name)).sort();
}
function rootComponent(tag, imports) {
  if (ts.isIdentifier(tag)) {
    const rootName = imports.get(tag.text);
    return rootName ? {component: rootName, tag: tag.text, compoundPart: null} : null;
  }
  if (ts.isPropertyAccessExpression(tag)) {
    let rootNode = tag.expression;
    const parts = [tag.name.text];
    while (ts.isPropertyAccessExpression(rootNode)) {
      parts.unshift(rootNode.name.text);
      rootNode = rootNode.expression;
    }
    if (!ts.isIdentifier(rootNode)) return null;
    const rootName = imports.get(rootNode.text);
    if (!rootName) return null;
    return {component: rootName, tag: `${rootNode.text}.${parts.join(".")}`, compoundPart: parts.join(".")};
  }
  return null;
}
function recipeFor(componentInfo) {
  const key = componentInfo.component.charAt(0).toLowerCase() + componentInfo.component.slice(1);
  if (componentInfo.compoundPart) {
    if (componentInfo.compoundPart !== "Root") return null;
    try {
      const recipe = system.getSlotRecipe?.(key);
      return recipe?.variants || recipe?.defaultVariants ? {key, recipe} : null;
    } catch {
      return null;
    }
  }
  try {
    const recipe = system.getRecipe?.(key);
    return recipe?.variants || recipe?.defaultVariants ? {key, recipe} : null;
  } catch {
    return null;
  }
}
function extractExactValueCases(object, prefix = []) {
  const cases = [];
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) return null;
    const key = keyName(property.name);
    if (!key || !isConditionKey(key)) return null;
    const conditions = [...prefix, key];
    const value = literal(property.initializer);
    if (value !== null) {
      cases.push({conditions, value});
      continue;
    }
    if (!ts.isObjectLiteralExpression(property.initializer)) return null;
    const nested = extractExactValueCases(property.initializer, conditions);
    if (!nested) return null;
    cases.push(...nested);
  }
  return cases.length ? cases : null;
}
function boundedMapValues(expression, sourceFile) {
  if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.expression)) return null;
  const itemName = expression.expression.text;
  const propertyName = expression.name.text;
  let fn = expression.parent;
  while (fn && !ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) fn = fn.parent;
  if (!fn || fn.parameters.length < 1 || !ts.isIdentifier(fn.parameters[0].name) || fn.parameters[0].name.text !== itemName) return null;
  let call = fn.parent;
  while (call && !ts.isCallExpression(call)) call = call.parent;
  if (!call || !call.arguments.includes(fn) || !ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== "map") return null;
  const receiver = call.expression.expression;
  if (!ts.isIdentifier(receiver)) return null;
  let array = null;
  function find(node) {
    if (array) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === receiver.text && ts.isArrayLiteralExpression(node.initializer)) {
      array = node.initializer;
      return;
    }
    ts.forEachChild(node, find);
  }
  find(sourceFile);
  if (!array) return null;
  const values = [];
  for (const element of array.elements) {
    if (!ts.isObjectLiteralExpression(element)) return null;
    const property = element.properties.find((candidate) => ts.isPropertyAssignment(candidate) && keyName(candidate.name) === propertyName);
    if (!property || !ts.isPropertyAssignment(property)) return null;
    const value = literal(property.initializer);
    if (value === null) return null;
    if (!values.includes(value)) values.push(value);
  }
  return values.length >= 2 ? values : null;
}

let sourceFactCounter = 0;
let semanticFactCounter = 0;
const sourceFacts = [];
const semanticFacts = [];
const sourceFactFile = new Map();

function addSourceFact(fileId, sf, node, data) {
  const factId = `sf${String(++sourceFactCounter).padStart(6, "0")}`;
  const fact = {factId, fileId, span: span(sf, node), ...data};
  sourceFacts.push(fact);
  sourceFactFile.set(factId, fileId);
  return factId;
}
function addSemanticFact(data) {
  const semanticFactId = `sem${String(++semanticFactCounter).padStart(6, "0")}`;
  semanticFacts.push({semanticFactId, ...data});
  return semanticFactId;
}
function semanticForExactValue(originFactId, prop, value, conditions = [], domains = null) {
  const conditionData = conditions.length ? {conditions} : {};
  if (prop === "textStyle" || prop === "layerStyle") {
    addSemanticFact({
      kind: "named-style",
      originFactIds: [originFactId],
      entity: `${prop}.${value}`,
      value,
      ...conditionData,
    });
    const refs = semanticRefs({[prop]: value});
    if (refs.length) addSemanticFact({kind: "semantic-implication", originFactIds: [originFactId], entities: refs, value, ...conditionData});
    return;
  }
  if (prop === "colorPalette") {
    addSemanticFact({kind: "color-palette-context", originFactIds: [originFactId], value, virtual: true, ...conditionData});
    return;
  }
  const refs = tokenRefsFor(prop, value, domains);
  if (refs.length) {
    for (const entity of refs) addSemanticFact({kind: "explicit-token", originFactIds: [originFactId], entity, value, ...conditionData});
  } else {
    addSemanticFact({kind: "non-token-style", originFactIds: [originFactId], value, ...conditionData});
  }
}
function sourceKindFor(prop, values, domains) {
  if (prop === "textStyle") return "named-text-style";
  if (prop === "layerStyle") return "named-layer-style";
  return values.some((value) => tokenRefsFor(prop, value, domains).length > 0) ? "style-property" : "style-literal";
}
function emitExactStyle(fileId, sf, node, component, prop, raw, cases, propPath = prop, domains = null) {
  const resolvedDomains = domains ?? (prop === "textStyle" ? ["textStyles"] : prop === "layerStyle" ? ["layerStyles"] : domainsFor(prop));
  const values = [...new Set(cases.map((valueCase) => valueCase.value))];
  const valueCases = cases.some((valueCase) => valueCase.conditions.length)
    ? cases.map((valueCase) => ({conditions: valueCase.conditions, value: valueCase.value}))
    : undefined;
  const factId = addSourceFact(fileId, sf, node, {
    kind: sourceKindFor(prop, values, resolvedDomains),
    resolution: "exact",
    raw,
    propPath,
    component,
    ...(resolvedDomains.length ? {domains: resolvedDomains} : {}),
    values,
    ...(valueCases ? {valueCases} : {}),
  });
  for (const valueCase of cases) semanticForExactValue(factId, prop, valueCase.value, valueCase.conditions, resolvedDomains);
  return factId;
}
function emitUnresolved(fileId, sf, node, component, prop, raw, propPath = prop, domains = null) {
  const resolvedDomains = domains ?? domainsFor(prop);
  return addSourceFact(fileId, sf, node, {
    kind: "unresolved-style",
    resolution: "unresolved",
    raw,
    propPath,
    component,
    domains: resolvedDomains.length ? resolvedDomains : ["unknown"],
  });
}
function emitBounded(fileId, sf, node, component, prop, raw, values, propPath = prop, domains = null) {
  const resolvedDomains = domains ?? domainsFor(prop);
  return addSourceFact(fileId, sf, node, {
    kind: "style-property",
    resolution: "bounded",
    raw,
    propPath,
    component,
    domains: resolvedDomains.length ? resolvedDomains : ["unknown"],
    values: [...new Set(values)],
  });
}
function classifyNestedStyle(fileId, sf, component, object, conditions = []) {
  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = keyName(property.name);
    if (!key) continue;
    if (isConditionKey(key) && ts.isObjectLiteralExpression(property.initializer)) {
      classifyNestedStyle(fileId, sf, component, property.initializer, [...conditions, key]);
      continue;
    }
    if (!system.isValidProperty(key)) continue;
    const propPath = [...conditions, key].join(".");
    const value = literal(property.initializer);
    if (value !== null) {
      emitExactStyle(fileId, sf, property, component, key, property.getText(sf), [{conditions, value}], propPath);
      continue;
    }
    if (ts.isObjectLiteralExpression(property.initializer)) {
      const cases = extractExactValueCases(property.initializer, conditions);
      if (cases) emitExactStyle(fileId, sf, property, component, key, property.getText(sf), cases, propPath);
      else emitUnresolved(fileId, sf, property, component, key, property.getText(sf), propPath);
      continue;
    }
    emitUnresolved(fileId, sf, property, component, key, property.getText(sf), propPath);
  }
}

function chakraImports(sf) {
  const imports = new Map();
  for (const statement of sf.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== "@chakra-ui/react") continue;
    const named = statement.importClause?.namedBindings;
    if (!named || !ts.isNamedImports(named)) continue;
    for (const element of named.elements) imports.set(element.name.text, element.propertyName?.text ?? element.name.text);
  }
  return imports;
}

function analyzeJsx(file, sf) {
  if (file.sourceClass === "theme" || file.analysisStatus === "excluded") return;
  const imports = chakraImports(sf);
  if (!imports.size) return;

  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const info = rootComponent(node.tagName, imports);
      if (info) {
        const callsiteFactId = addSourceFact(file.fileId, sf, node.tagName, {
          kind: "component-callsite",
          resolution: "exact",
          raw: `<${node.tagName.getText(sf)}>`,
          component: info.component,
        });
        const recipeMeta = recipeFor(info);
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
          if (Object.prototype.hasOwnProperty.call(variants, prop)) {
            explicitRecipeProps.add(prop);
            const recipeDomain = [`recipe:${recipeMeta.key}:${prop}`];
            if (value !== null) {
              const factId = addSourceFact(file.fileId, sf, attr, {
                kind: "recipe-variant",
                resolution: "exact",
                raw: attr.getText(sf),
                propPath: prop,
                component: info.component,
                domains: recipeDomain,
                values: [value],
              });
              addSemanticFact({kind: "recipe-variant", originFactIds: [factId], recipe: recipeMeta.key, variant: prop, value});
            } else if (expression && ts.isObjectLiteralExpression(expression)) {
              const cases = extractExactValueCases(expression);
              if (cases) {
                const values = [...new Set(cases.map((valueCase) => valueCase.value))];
                const factId = addSourceFact(file.fileId, sf, attr, {
                  kind: "recipe-variant",
                  resolution: "exact",
                  raw: attr.getText(sf),
                  propPath: prop,
                  component: info.component,
                  domains: recipeDomain,
                  values,
                  valueCases: cases,
                });
                for (const valueCase of cases) addSemanticFact({kind: "recipe-variant", originFactIds: [factId], recipe: recipeMeta.key, variant: prop, value: valueCase.value, conditions: valueCase.conditions});
              } else emitUnresolved(file.fileId, sf, attr, info.component, prop, attr.getText(sf), prop, recipeDomain);
            } else {
              emitUnresolved(file.fileId, sf, attr, info.component, prop, attr.getText(sf), prop, recipeDomain);
            }
            continue;
          }

          if (prop.startsWith("_") && expression && ts.isObjectLiteralExpression(expression)) {
            classifyNestedStyle(file.fileId, sf, info.component, expression, [prop]);
            continue;
          }
          if (!system.isValidProperty(prop)) continue;
          if (value !== null) {
            emitExactStyle(file.fileId, sf, attr, info.component, prop, attr.getText(sf), [{conditions: [], value}]);
            continue;
          }
          if (expression && ts.isObjectLiteralExpression(expression)) {
            const cases = extractExactValueCases(expression);
            if (cases) emitExactStyle(file.fileId, sf, attr, info.component, prop, attr.getText(sf), cases);
            else emitUnresolved(file.fileId, sf, attr, info.component, prop, attr.getText(sf));
            continue;
          }
          if (expression && ts.isConditionalExpression(expression)) {
            const a = literal(expression.whenTrue);
            const b = literal(expression.whenFalse);
            if (a !== null && b !== null && a !== b) {
              emitBounded(file.fileId, sf, attr, info.component, prop, attr.getText(sf), [a, b]);
              continue;
            }
          }
          if (expression) {
            const bounded = boundedMapValues(expression, sf);
            if (bounded) {
              emitBounded(file.fileId, sf, attr, info.component, prop, attr.getText(sf), bounded);
              continue;
            }
          }
          emitUnresolved(file.fileId, sf, attr, info.component, prop, attr.getText(sf));
        }

        const defaults = recipeMeta?.recipe?.defaultVariants ?? {};
        for (const [variant, value] of Object.entries(defaults)) {
          if (!explicitRecipeProps.has(variant)) {
            addSemanticFact({kind: "recipe-default", originFactIds: [callsiteFactId], recipe: recipeMeta.key, variant, value: String(value)});
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

const categoryTokenType = new Map();
for (const category of system.tokens.categoryMap.keys()) {
  categoryTokenType.set(`${category.charAt(0).toUpperCase()}${category.slice(1)}Token`, category);
}
function contextualDomains(typeText, propertyName) {
  const direct = [...categoryTokenType.entries()].filter(([typeName]) => typeText.includes(typeName)).map(([, category]) => category);
  if (direct.length) return [...new Set(direct)].sort();
  if (!typeText.includes("@chakra-ui/react") && !typeText.includes("styled-system/generated")) return [];
  const name = propertyName.toLowerCase();
  if (/(color|background|fill|stroke)/.test(name)) return ["colors"];
  if (/(padding|margin|spacing|space|gap)/.test(name)) return ["spacing"];
  if (/fontweight/.test(name)) return ["fontWeights"];
  if (/fontsize/.test(name)) return ["fontSizes"];
  if (/zindex/.test(name)) return ["zIndex"];
  if (/radius/.test(name)) return ["radii"];
  if (/shadow/.test(name)) return ["shadows"];
  return [];
}
function insideJsxAttribute(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxAttribute(current)) return true;
    if (ts.isStatement(current)) return false;
    current = current.parent;
  }
  return false;
}
function analyzeTypedValues(file, sf) {
  if (file.sourceClass === "theme" || file.analysisStatus === "excluded") return;
  function visit(node) {
    if (ts.isPropertyAssignment(node) && !insideJsxAttribute(node)) {
      const propertyName = keyName(node.name);
      if (propertyName) {
        const contextual = checker.getContextualType(node.initializer);
        if (contextual) {
          const typeText = checker.typeToString(contextual, node.initializer, ts.TypeFormatFlags.NoTruncation);
          const domains = contextualDomains(typeText, propertyName);
          if (domains.length) {
            const value = literal(node.initializer);
            if (value !== null) {
              const factId = addSourceFact(file.fileId, sf, node, {
                kind: "typed-style-value",
                resolution: "exact",
                raw: node.getText(sf),
                propPath: propertyName,
                component: "typed-value",
                domains,
                values: [value],
              });
              semanticForExactValue(factId, propertyName, value, [], domains);
            } else {
              addSourceFact(file.fileId, sf, node, {
                kind: "unresolved-style",
                resolution: "unresolved",
                raw: node.getText(sf),
                propPath: propertyName,
                component: "typed-value",
                domains,
              });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

for (const file of files) {
  const abs = absByFileId.get(file.fileId);
  const sf = program.getSourceFile(abs) ?? program.getSourceFiles().find((candidate) => normalize(candidate.fileName) === file.path);
  if (!sf) continue;
  analyzeJsx(file, sf);
  analyzeTypedValues(file, sf);
}

let moduleFactCounter = 0;
const moduleFacts = [];
const moduleFactKeys = new Set();
const assetPattern = /\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|woff2?|ttf|otf)$/i;
function addModuleFact(fromFile, specifier, kind) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return;
  const fromAbs = absByFileId.get(fromFile.fileId);
  const resolved = ts.resolveModuleName(specifier, fromAbs, parsed.options, ts.sys).resolvedModule;
  let actualKind = kind;
  let toFileId;
  if (resolved) {
    const target = path.resolve(resolved.resolvedFileName.replace(/\.d\.ts$/, ".ts"));
    const rel = normalize(target);
    toFileId = fileByPath.get(rel)?.fileId;
    if (!toFileId && assetPattern.test(specifier)) actualKind = "asset-import";
    else if (!toFileId) return;
  } else if (assetPattern.test(specifier)) {
    actualKind = "asset-import";
  } else {
    actualKind = "unresolved-import";
  }
  if (actualKind === "asset-import" || actualKind === "unresolved-import") toFileId = undefined;
  const key = `${fromFile.fileId}\u0000${actualKind}\u0000${specifier}\u0000${toFileId ?? ""}`;
  if (moduleFactKeys.has(key)) return;
  moduleFactKeys.add(key);
  moduleFacts.push({
    moduleFactId: `mf${String(++moduleFactCounter).padStart(6, "0")}`,
    fromFileId: fromFile.fileId,
    ...(toFileId ? {toFileId} : {}),
    kind: actualKind,
    specifier,
  });
}
for (const file of files) {
  const sf = program.getSourceFile(absByFileId.get(file.fileId));
  if (!sf) continue;
  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) addModuleFact(file, node.moduleSpecifier.text, "static-import");
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) addModuleFact(file, node.moduleSpecifier.text, "static-import");
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) addModuleFact(file, node.arguments[0].text, "dynamic-import");
    ts.forEachChild(node, visit);
  }
  visit(sf);
}

const graph = new Map(files.map((file) => [file.fileId, new Set()]));
for (const fact of moduleFacts) if (fact.toFileId) graph.get(fact.fromFileId)?.add(fact.toFileId);
const NEXT_ENTRY_BASENAMES = new Set([
  "page.tsx", "page.ts", "layout.tsx", "layout.ts", "route.ts", "route.tsx",
  "default.tsx", "default.ts", "template.tsx", "template.ts", "loading.tsx", "loading.ts",
  "error.tsx", "error.ts", "global-error.tsx", "global-error.ts", "not-found.tsx", "not-found.ts",
  "forbidden.tsx", "forbidden.ts", "unauthorized.tsx", "unauthorized.ts",
  "sitemap.ts", "robots.ts", "manifest.ts", "opengraph-image.tsx", "twitter-image.tsx",
]);
const appEntrypoints = files.filter((file) => file.path.startsWith("app/") && NEXT_ENTRY_BASENAMES.has(path.basename(file.path)));
const instrumentation = files.filter((file) => ["instrumentation.ts", "instrumentation-client.ts", "proxy.ts", "middleware.ts"].includes(file.path));
const internalDemoEntrypoints = [...appEntrypoints].filter((file) => file.path.includes("/components-test-lib/"));
const productEntrypoints = [...appEntrypoints, ...instrumentation].filter((file) => !internalDemoEntrypoints.some((demo) => demo.fileId === file.fileId));
function closure(entryId) {
  const seen = new Set();
  const queue = [entryId];
  while (queue.length) {
    const id = queue.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of graph.get(id) ?? []) queue.push(next);
  }
  return seen;
}
const productClosures = new Map(productEntrypoints.map((entry) => [entry.fileId, closure(entry.fileId)]));
const demoClosures = new Map(internalDemoEntrypoints.map((entry) => [entry.fileId, closure(entry.fileId)]));
let reachabilityCounter = 0;
const reachabilityClaims = [];
const reachabilityByFile = new Map();
for (const file of files) {
  const productOrigins = [...productClosures.entries()].filter(([, seen]) => seen.has(file.fileId)).map(([id]) => id);
  const demoOrigins = [...demoClosures.entries()].filter(([, seen]) => seen.has(file.fileId)).map(([id]) => id);
  const realms = [];
  if (productOrigins.length) realms.push("product");
  if (demoOrigins.length) realms.push("internal-demo");
  const claim = {
    reachabilityClaimId: `r${String(++reachabilityCounter).padStart(5, "0")}`,
    fileId: file.fileId,
    kind: realms.length ? "reachable" : "source-only",
    policy: "safehome-next16-app-router.v1",
    realms,
    ...(productOrigins.length || demoOrigins.length ? {entrypointFileIds: [...new Set([...productOrigins, ...demoOrigins])].sort()} : {}),
  };
  reachabilityClaims.push(claim);
  reachabilityByFile.set(file.fileId, claim);
}

let claimCounter = 0;
const claims = [];
const claimKeys = new Set();
function semanticEntities(fact) {
  if (fact.entity) return [fact.entity];
  if (fact.entities) return fact.entities;
  if ((fact.kind === "recipe-default" || fact.kind === "recipe-variant") && fact.recipe && fact.variant && fact.value != null) return [`recipe.${fact.recipe}.${fact.variant}.${fact.value}`];
  return [];
}
for (const semanticFact of semanticFacts) {
  if (semanticFact.kind === "non-token-style" || semanticFact.kind === "color-palette-context") continue;
  const originIds = semanticFact.originFactIds ?? [];
  const originFileIds = [...new Set(originIds.map((id) => sourceFactFile.get(id)).filter(Boolean))];
  if (originFileIds.length !== 1) continue;
  const fileId = originFileIds[0];
  const reachability = reachabilityByFile.get(fileId);
  if (!reachability) continue;
  for (const entity of semanticEntities(semanticFact)) {
    const semanticOnly = semanticFact.kind === "semantic-implication";
    let kind;
    if (semanticOnly && reachability.realms.includes("product")) kind = "semantic-product-path-reference";
    else if (semanticOnly && !reachability.realms.includes("product")) kind = "dependency-only";
    else if (reachability.realms.includes("product")) kind = "product-path-reference";
    else if (reachability.realms.includes("internal-demo")) kind = "internal-demo-reference";
    else kind = "source-only-reference";
    const key = `${kind}\u0000${entity}\u0000${semanticFact.semanticFactId}`;
    if (claimKeys.has(key)) continue;
    claimKeys.add(key);
    claims.push({
      claimId: `c${String(++claimCounter).padStart(6, "0")}`,
      kind,
      entity,
      policy: "safehome-usage-evidence-claims.v1",
      basis: {
        sourceFactIds: originIds,
        semanticFactIds: [semanticFact.semanticFactId],
        moduleFactIds: [],
        reachabilityClaimIds: [reachability.reachabilityClaimId],
      },
      realms: reachability.realms,
    });
  }
}

const bySourceClass = {};
for (const file of files) bySourceClass[file.sourceClass] = (bySourceClass[file.sourceClass] ?? 0) + 1;
const unresolvedByDomain = {};
for (const fact of sourceFacts.filter((fact) => fact.resolution === "unresolved")) {
  for (const domain of fact.domains ?? ["unknown"]) unresolvedByDomain[domain] = (unresolvedByDomain[domain] ?? 0) + 1;
}
const eligible = files.filter((file) => file.analysisStatus !== "excluded");
const coverage = {
  eligibleFiles: eligible.length,
  completeFiles: eligible.filter((file) => file.analysisStatus === "complete").length,
  partialFiles: eligible.filter((file) => file.analysisStatus === "partial").length,
  failedFiles: eligible.filter((file) => file.analysisStatus === "failed").length,
  excludedFiles: files.filter((file) => file.analysisStatus === "excluded").length,
  unresolvedFacts: sourceFacts.filter((fact) => fact.resolution === "unresolved").length,
  bySourceClass,
  unresolvedByDomain,
};

const doc = {
  schema: "safehome.design-system-evidence.v1",
  sourceIdentity: {
    repository: "sfbrigade/datasci-earthquake",
    baseHead,
    ...(tree ? {tree} : {}),
    workspaceDirty,
  },
  toolchain: {
    node: process.version.replace(/^v/, ""),
    typescript: ts.version,
    chakra: packageVersion("@chakra-ui/react"),
    next: packageVersion("next"),
  },
  policies: {
    sourceClassification: "safehome-source-classification.v1",
    entrypoint: "safehome-next16-app-router.v1",
    semantic: "safehome-chakra3-semantic.v1",
    claim: "safehome-usage-evidence-claims.v1",
  },
  files,
  sourceFacts,
  moduleFacts,
  reachabilityClaims,
  semanticFacts,
  claims,
  coverage,
};

const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "evidence-v1-preview.json");
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`EVIDENCE_V1_GENERATE=PASS files=${files.length} eligible=${coverage.eligibleFiles} partial=${coverage.partialFiles} sourceFacts=${sourceFacts.length} semanticFacts=${semanticFacts.length} claims=${claims.length} unresolved=${coverage.unresolvedFacts}`);
console.log(`REACHABILITY product=${reachabilityClaims.filter((claim) => claim.realms.includes("product")).length} demo=${reachabilityClaims.filter((claim) => claim.realms.includes("internal-demo")).length} sourceOnly=${reachabilityClaims.filter((claim) => claim.kind === "source-only").length}`);
console.log(`OUTPUT=${out}`);
