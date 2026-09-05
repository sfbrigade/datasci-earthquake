import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = process.cwd();
const here = path.dirname(new URL(import.meta.url).pathname);
const oraclePath = path.join(here, "phase0-oracle.json");
const oracle = JSON.parse(fs.readFileSync(oraclePath, "utf8"));

const BREAKPOINT_KEYS = new Set(["base", "sm", "md", "lg", "xl", "2xl"]);
const extracted = [];
const fileResults = [];

function componentName(tag, imports) {
  if (ts.isIdentifier(tag)) return imports.get(tag.text) ?? null;
  if (ts.isPropertyAccessExpression(tag)) {
    let root = tag.expression;
    while (ts.isPropertyAccessExpression(root)) root = root.expression;
    if (ts.isIdentifier(root)) return imports.get(root.text) ?? null;
  }
  return null;
}

function literalValue(node) {
  if (!node) return { kind: "exact", value: "true" };
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return { kind: "exact", value: node.text };
  }
  if (ts.isNumericLiteral(node)) return { kind: "exact", value: node.text };
  if (node.kind === ts.SyntaxKind.TrueKeyword) return { kind: "exact", value: "true" };
  if (node.kind === ts.SyntaxKind.FalseKeyword) return { kind: "exact", value: "false" };
  if (node.kind === ts.SyntaxKind.NullKeyword) return { kind: "exact", value: "null" };
  return null;
}

function keyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function formatResponsive(entries) {
  return entries.map(([key, value]) => `${key} → ${value}`).join(" · ");
}

function flattenObject(baseProp, object, sourceFile) {
  const facts = [];
  const entries = [];
  let allBreakpoint = true;

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) {
      allBreakpoint = false;
      continue;
    }
    const key = keyName(property.name);
    if (!key) {
      allBreakpoint = false;
      continue;
    }
    if (!BREAKPOINT_KEYS.has(key)) allBreakpoint = false;
    const literal = literalValue(property.initializer);
    entries.push([key, literal?.value ?? property.initializer.getText(sourceFile)]);
  }

  if (allBreakpoint && entries.length === object.properties.length) {
    return [{ prop: baseProp, value: formatResponsive(entries), resolution: "exact" }];
  }

  for (const property of object.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const key = keyName(property.name);
    if (!key) continue;
    const childProp = `${baseProp}.${key}`;
    const literal = literalValue(property.initializer);
    if (literal) {
      facts.push({ prop: childProp, value: literal.value, resolution: "exact" });
    } else if (ts.isObjectLiteralExpression(property.initializer)) {
      facts.push(...flattenObject(childProp, property.initializer, sourceFile));
    } else {
      facts.push({
        prop: childProp,
        value: property.initializer.getText(sourceFile),
        resolution: "unresolved",
      });
    }
  }
  return facts;
}

function extractAttribute(attribute, sourceFile) {
  if (!ts.isJsxAttribute(attribute)) return [];
  const prop = attribute.name.getText(sourceFile);
  if (!attribute.initializer) return [{ prop, value: "true", resolution: "exact" }];
  if (ts.isStringLiteral(attribute.initializer)) {
    return [{ prop, value: attribute.initializer.text, resolution: "exact" }];
  }
  if (!ts.isJsxExpression(attribute.initializer) || !attribute.initializer.expression) {
    return [{ prop, value: "", resolution: "unresolved" }];
  }

  const expression = attribute.initializer.expression;
  const literal = literalValue(expression);
  if (literal) return [{ prop, value: literal.value, resolution: "exact" }];
  if (ts.isObjectLiteralExpression(expression)) {
    return flattenObject(prop, expression, sourceFile);
  }
  if (ts.isConditionalExpression(expression)) {
    const whenTrue = literalValue(expression.whenTrue);
    const whenFalse = literalValue(expression.whenFalse);
    if (whenTrue && whenFalse) {
      return [{
        prop,
        value: `${expression.condition.getText(sourceFile)} ? ${whenTrue.value} : ${whenFalse.value}`,
        resolution: "bounded",
      }];
    }
  }
  return [{ prop, value: expression.getText(sourceFile), resolution: "unresolved" }];
}

function analyzeFile(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  const text = fs.readFileSync(fullPath, "utf8");
  const sourceFile = ts.createSourceFile(
    relativePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const imports = new Map();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      statement.moduleSpecifier.text !== "@chakra-ui/react"
    ) {
      continue;
    }
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      imports.set(element.name.text, element.propertyName?.text ?? element.name.text);
    }
  }

  let jsxSites = 0;
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const component = componentName(node.tagName, imports);
      if (component) {
        jsxSites += 1;
        for (const attribute of node.attributes.properties) {
          for (const fact of extractAttribute(attribute, sourceFile)) {
            extracted.push({
              file: relativePath,
              component,
              ...fact,
              line: sourceFile.getLineAndCharacterOfPosition(attribute.getStart(sourceFile)).line + 1,
            });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  fileResults.push({
    file: relativePath,
    bytes: Buffer.byteLength(text),
    chakraImports: [...imports.entries()],
    jsxSites,
  });
}

for (const relativePath of oracle.sourceFiles) analyzeFile(relativePath);

function factKey(fact) {
  return `${fact.file}\u0000${fact.component}\u0000${fact.prop}\u0000${fact.value}`;
}

const extractedExact = new Set(
  extracted.filter((fact) => fact.resolution === "exact").map(factKey),
);
const oracleExplicitExact = oracle.facts.filter(
  (fact) => fact.evidence === "Exact" && fact.origin === "explicit",
);
const matched = oracleExplicitExact.filter((fact) => extractedExact.has(factKey(fact)));
const missing = oracleExplicitExact.filter((fact) => !extractedExact.has(factKey(fact)));
const recipeDefaults = oracle.facts.filter((fact) => fact.origin === "recipe default");

const result = {
  schema: "safehome.design-system-evidence.phase0-benchmark.v1",
  authorityCommit: oracle.authorityCommit,
  parser: { name: "typescript", version: ts.version },
  oracle: {
    files: oracle.sourceFiles.length,
    facts: oracle.facts.length,
    explicitExact: oracleExplicitExact.length,
    recipeDefaults: recipeDefaults.length,
  },
  extraction: {
    facts: extracted.length,
    exact: extracted.filter((fact) => fact.resolution === "exact").length,
    bounded: extracted.filter((fact) => fact.resolution === "bounded").length,
    unresolved: extracted.filter((fact) => fact.resolution === "unresolved").length,
  },
  score: {
    matchedExplicitExact: matched.length,
    missingExplicitExact: missing.length,
    recallExplicitExact: matched.length / oracleExplicitExact.length,
  },
  missing,
  files: fileResults,
};

const outputPath =
  process.argv[2] ?? path.join(repoRoot, ".tmp", "design-system", "phase0-typescript.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

console.log(
  `PHASE0_TS=${matched.length}/${oracleExplicitExact.length} ` +
    `recall=${(100 * result.score.recallExplicitExact).toFixed(1)}% ` +
    `extracted=${extracted.length} exact=${result.extraction.exact} ` +
    `bounded=${result.extraction.bounded} unresolved=${result.extraction.unresolved}`,
);
if (missing.length) {
  console.log("MISSING_BEGIN");
  for (const fact of missing) {
    console.log(`${fact.file} :: ${fact.component}.${fact.prop} = ${fact.value}`);
  }
  console.log("MISSING_END");
}
console.log(`RECEIPT=${outputPath}`);
