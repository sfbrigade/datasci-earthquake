import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const repoRoot = process.cwd();
const here = path.dirname(new URL(import.meta.url).pathname);
const oraclePath = path.join(here, 'phase0-oracle.json');
const oracle = JSON.parse(fs.readFileSync(oraclePath, 'utf8'));

const BREAKPOINT_KEYS = new Set(['base','sm','md','lg','xl','2xl']);
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
  if (!node) return {kind:'exact', value:'true'};
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return {kind:'exact', value:node.text};
  if (ts.isNumericLiteral(node)) return {kind:'exact', value:node.text};
  if (node.kind === ts.SyntaxKind.TrueKeyword) return {kind:'exact', value:'true'};
  if (node.kind === ts.SyntaxKind.FalseKeyword) return {kind:'exact', value:'false'};
  if (node.kind === ts.SyntaxKind.NullKeyword) return {kind:'exact', value:'null'};
  return null;
}

function boundedMapProperty(expression, sourceFile) {
  if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.expression)) return null;
  const itemName = expression.expression.text;
  const propertyName = expression.name.text;
  let fn = expression.parent;
  while (fn && !ts.isArrowFunction(fn) && !ts.isFunctionExpression(fn)) fn = fn.parent;
  if (!fn || fn.parameters.length < 1 || !ts.isIdentifier(fn.parameters[0].name) || fn.parameters[0].name.text !== itemName) return null;
  let call = fn.parent;
  while (call && !ts.isCallExpression(call)) call = call.parent;
  if (!call || !call.arguments.includes(fn) || !ts.isPropertyAccessExpression(call.expression) || call.expression.name.text !== 'map') return null;
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
    const property = element.properties.find(p => ts.isPropertyAssignment(p) && keyName(p.name) === propertyName);
    if (!property || !ts.isPropertyAssignment(property)) return null;
    const literal = literalValue(property.initializer);
    if (!literal) return null;
    if (!values.includes(literal.value)) values.push(literal.value);
  }
  if (!values.length) return null;
  return `${itemName}.${propertyName} = ${values.join(' | ')}`;
}

function keyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  return null;
}

function formatResponsive(entries) {
  return entries.map(([k,v]) => `${k} → ${v}`).join(' · ');
}

function flattenObject(baseProp, obj, sourceFile) {
  const props = [];
  const simple = [];
  let allBreakpoint = true;
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) { allBreakpoint = false; continue; }
    const k = keyName(p.name);
    if (!k) { allBreakpoint = false; continue; }
    const lit = literalValue(p.initializer);
    if (!BREAKPOINT_KEYS.has(k)) allBreakpoint = false;
    if (lit) simple.push([k, lit.value]);
    else simple.push([k, p.initializer.getText(sourceFile)]);
  }
  if (allBreakpoint && simple.length === obj.properties.length) {
    props.push({prop:baseProp, value:formatResponsive(simple), resolution:'exact'});
    return props;
  }
  for (const p of obj.properties) {
    if (!ts.isPropertyAssignment(p)) continue;
    const k = keyName(p.name);
    if (!k) continue;
    const childProp = `${baseProp}.${k}`;
    const lit = literalValue(p.initializer);
    if (lit) props.push({prop:childProp, value:lit.value, resolution:'exact'});
    else if (ts.isObjectLiteralExpression(p.initializer)) props.push(...flattenObject(childProp, p.initializer, sourceFile));
    else props.push({prop:childProp, value:p.initializer.getText(sourceFile), resolution:'unresolved'});
  }
  return props;
}

function extractAttribute(attr, sourceFile) {
  if (!ts.isJsxAttribute(attr)) return [];
  const prop = attr.name.getText(sourceFile);
  if (!attr.initializer) return [{prop, value:'true', resolution:'exact'}];
  if (ts.isStringLiteral(attr.initializer)) return [{prop, value:attr.initializer.text, resolution:'exact'}];
  if (!ts.isJsxExpression(attr.initializer) || !attr.initializer.expression) return [{prop, value:'', resolution:'unresolved'}];
  const expr = attr.initializer.expression;
  const lit = literalValue(expr);
  if (lit) return [{prop, value:lit.value, resolution:'exact'}];
  if (ts.isObjectLiteralExpression(expr)) return flattenObject(prop, expr, sourceFile);
  const boundedProperty = boundedMapProperty(expr, sourceFile);
  if (boundedProperty) return [{prop, value:boundedProperty, resolution:'bounded'}];
  if (ts.isConditionalExpression(expr)) {
    const a = literalValue(expr.whenTrue);
    const b = literalValue(expr.whenFalse);
    if (a && b) return [{prop, value:`${expr.condition.getText(sourceFile)} ? ${a.value} : ${b.value}`, resolution:'bounded'}];
    const objectBranch = ts.isObjectLiteralExpression(expr.whenTrue)
      ? expr.whenTrue
      : ts.isObjectLiteralExpression(expr.whenFalse)
        ? expr.whenFalse
        : null;
    const otherBranch = objectBranch === expr.whenTrue ? expr.whenFalse : expr.whenTrue;
    if (objectBranch && otherBranch.getText(sourceFile) === 'undefined') {
      return flattenObject(prop, objectBranch, sourceFile).map(f => ({...f, condition: expr.condition.getText(sourceFile)}));
    }
    if (objectBranch) {
      const other = literalValue(otherBranch);
      if (other) {
        const responsive = flattenObject(prop, objectBranch, sourceFile);
        if (responsive.length === 1 && responsive[0].prop === prop) {
          const objectIsFalse = objectBranch === expr.whenFalse;
          return [{
            prop,
            value: objectIsFalse
              ? `${expr.condition.getText(sourceFile)} ? ${other.value} : ${responsive[0].value}`
              : `${expr.condition.getText(sourceFile)} ? ${responsive[0].value} : ${other.value}`,
            resolution:'bounded',
          }];
        }
      }
    }
  }
  return [{prop, value:expr.getText(sourceFile), resolution:'unresolved'}];
}

function analyzeFile(rel) {
  const full = path.join(repoRoot, rel);
  const text = fs.readFileSync(full, 'utf8');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, rel.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const imports = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || st.moduleSpecifier.text !== '@chakra-ui/react') continue;
    const clause = st.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;
    for (const el of clause.namedBindings.elements) imports.set(el.name.text, el.propertyName?.text ?? el.name.text);
  }
  let jsxSites = 0;
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const component = componentName(node.tagName, imports);
      if (component) {
        jsxSites++;
        for (const attr of node.attributes.properties) {
          for (const fact of extractAttribute(attr, sf)) {
            extracted.push({file:rel, component, ...fact, line:sf.getLineAndCharacterOfPosition(attr.getStart(sf)).line + 1});
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  fileResults.push({file:rel, bytes:Buffer.byteLength(text), chakraImports:[...imports.entries()], jsxSites});
}

for (const rel of oracle.sourceFiles) analyzeFile(rel);

function key(f) { return `${f.file}\u0000${f.component}\u0000${f.prop}\u0000${f.value}`; }
function scoreGroup(expected, resolution, {matchValue = true} = {}) {
  const candidates = extracted.filter(f => f.resolution === resolution);
  const candidateKeys = new Set(candidates.map(f => matchValue ? key(f) : `${f.file}\u0000${f.component}\u0000${f.prop}`));
  const expectedKey = f => matchValue ? key(f) : `${f.file}\u0000${f.component}\u0000${f.prop}`;
  const matched = expected.filter(f => candidateKeys.has(expectedKey(f)));
  return {
    expected: expected.length,
    matched: matched.length,
    missing: expected.filter(f => !candidateKeys.has(expectedKey(f))),
    recall: expected.length ? matched.length / expected.length : 1,
  };
}

const oracleExplicitExact = oracle.facts.filter(f => f.evidence === 'Exact' && f.origin === 'explicit');
const oraclePossible = oracle.facts.filter(f => f.evidence === 'Possible');
const oracleUnresolved = oracle.facts.filter(f => f.evidence === 'Unresolved');
const recipeDefaults = oracle.facts.filter(f => f.origin === 'recipe default');
const exactScore = scoreGroup(oracleExplicitExact, 'exact');
const possibleScore = scoreGroup(oraclePossible, 'bounded');
const unresolvedScore = scoreGroup(oracleUnresolved, 'unresolved', {matchValue:false});

const result = {
  schema:'safehome.design-system-evidence.phase0-benchmark.v1',
  authorityCommit:oracle.authorityCommit,
  parser:{name:'typescript', version:ts.version},
  oracle:{files:oracle.sourceFiles.length, facts:oracle.facts.length, explicitExact:oracleExplicitExact.length, possible:oraclePossible.length, unresolved:oracleUnresolved.length, recipeDefaults:recipeDefaults.length},
  extraction:{facts:extracted.length, exact:extracted.filter(f=>f.resolution==='exact').length, bounded:extracted.filter(f=>f.resolution==='bounded').length, unresolved:extracted.filter(f=>f.resolution==='unresolved').length},
  score:{exact:exactScore, possible:possibleScore, unresolved:unresolvedScore},
  missing:{exact:exactScore.missing, possible:possibleScore.missing, unresolved:unresolvedScore.missing},
  files:fileResults,
};

const out = process.argv[2] || path.join(repoRoot,'.tmp','design-system','phase0-typescript.json');
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, JSON.stringify(result,null,2)+'\n');
console.log(`PHASE0_TS exact=${exactScore.matched}/${exactScore.expected} (${(100*exactScore.recall).toFixed(1)}%) possible=${possibleScore.matched}/${possibleScore.expected} unresolved=${unresolvedScore.matched}/${unresolvedScore.expected} extracted=${extracted.length} exactFacts=${result.extraction.exact} boundedFacts=${result.extraction.bounded} unresolvedFacts=${result.extraction.unresolved}`);
for (const [kind, score] of Object.entries({exact:exactScore, possible:possibleScore, unresolved:unresolvedScore})) {
  if (!score.missing.length) continue;
  console.log(`MISSING_${kind.toUpperCase()}_BEGIN`);
  for (const f of score.missing) console.log(`${f.file} :: ${f.component}.${f.prop} = ${f.value}`);
  console.log(`MISSING_${kind.toUpperCase()}_END`);
}
console.log(`RECEIPT=${out}`);
