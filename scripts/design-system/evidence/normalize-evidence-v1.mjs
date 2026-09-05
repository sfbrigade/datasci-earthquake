import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { createJiti } from "jiti";
import { classifySourceModuleSpecifiers } from "./runtime-imports.mjs";

const root = process.cwd();
const input = process.argv[2];
const output = process.argv[3];
const reportPath = process.argv[4];
if (!input || !output || !reportPath) {
  throw new Error("usage: node normalize-evidence-v1.mjs <input.json> <output.json> <report.json>");
}
const git = (...args) => execFileSync("git", args, {cwd: root, encoding: "utf8"}).trim();

const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);

const jiti = createJiti(import.meta.url, {alias: {"@": path.join(root, "app")}});
const loadedTheme = await jiti.import(path.join(root, "styles/theme.ts"));
const system = loadedTheme.default ?? loadedTheme;
const utilityTypes = system.utility.getTypes();

function domainsFor(prop) {
  const resolved = system.utility.resolveShorthand?.(prop) ?? prop;
  const types = utilityTypes.get(resolved) ?? utilityTypes.get(prop) ?? [];
  return [...new Set(types.flatMap((entry) => [...entry.matchAll(/Tokens\["([^"]+)"\]/g)].map((match) => match[1])))].sort();
}

const doc = JSON.parse(fs.readFileSync(input, "utf8"));
const fileById = new Map((doc.files ?? []).map((file) => [file.fileId, file]));
const sourceFactById = new Map((doc.sourceFacts ?? []).map((fact) => [fact.factId, fact]));
const semanticFactById = new Map((doc.semanticFacts ?? []).map((fact) => [fact.semanticFactId, fact]));

// 0. Source identity is scoped to inputs that can change this evidence document.
// Generated .tmp receipts and unrelated backend work do not make the design-system evidence dirty.
const authorityPaths = [...new Set([
  ...(doc.files ?? []).map((file) => file.path),
  "scripts/design-system/evidence",
  "tsconfig.json",
  "package.json",
  "package-lock.json",
])];
const authorityStatus = git("status", "--porcelain", "--untracked-files=all", "--", ...authorityPaths);
const authorityWorkspaceDirty = authorityStatus.length > 0;
const sourceIdentityAdjusted = doc.sourceIdentity.workspaceDirty !== authorityWorkspaceDirty;
doc.sourceIdentity.workspaceDirty = authorityWorkspaceDirty;
if (authorityWorkspaceDirty) delete doc.sourceIdentity.tree;
else doc.sourceIdentity.tree = git("rev-parse", "HEAD^{tree}");
for (const file of doc.files ?? []) {
  const absolute = path.join(root, file.path);
  file.contentIdentity = authorityWorkspaceDirty
    ? {kind: "sha256", value: crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex")}
    : {kind: "git-blob", value: git("hash-object", "--", file.path)};
}

// 1. Remove typed-value domain guesses that contradict Chakra's utility authority.
const removedSourceFacts = [];
const keptSourceFacts = [];
for (const fact of doc.sourceFacts ?? []) {
  if (fact.component !== "typed-value" || !fact.propPath || !system.isValidProperty(fact.propPath)) {
    keptSourceFacts.push(fact);
    continue;
  }
  const authoritativeDomains = domainsFor(fact.propPath);
  const recordedDomains = [...(fact.domains ?? [])].sort();
  if (JSON.stringify(authoritativeDomains) === JSON.stringify(recordedDomains)) {
    keptSourceFacts.push(fact);
    continue;
  }
  removedSourceFacts.push({
    factId: fact.factId,
    fileId: fact.fileId,
    propPath: fact.propPath,
    recordedDomains,
    authoritativeDomains,
    reason: authoritativeDomains.length === 0
      ? "Chakra recognizes the property but assigns no token domain"
      : "Recorded typed-value domains disagree with Chakra utility metadata",
  });
}

const removedSourceFactIds = new Set(removedSourceFacts.map((fact) => fact.factId));
const removedSemanticFactIds = new Set();
const keptSemanticFacts = [];
for (const fact of doc.semanticFacts ?? []) {
  if ((fact.originFactIds ?? []).some((id) => removedSourceFactIds.has(id))) removedSemanticFactIds.add(fact.semanticFactId);
  else keptSemanticFacts.push(fact);
}

const removedClaimIds = [];
const keptClaims = [];
for (const claim of doc.claims ?? []) {
  const badSource = (claim.basis?.sourceFactIds ?? []).some((id) => removedSourceFactIds.has(id));
  const badSemantic = (claim.basis?.semanticFactIds ?? []).some((id) => removedSemanticFactIds.has(id));
  if (badSource || badSemantic) removedClaimIds.push(claim.claimId);
  else keptClaims.push(claim);
}

doc.sourceFacts = keptSourceFacts;
doc.semanticFacts = keptSemanticFacts;
doc.claims = keptClaims;

// 2. Reclassify local static module references by the JavaScript TypeScript actually emits.
const importKindsByFileAndSpecifier = new Map();
for (const file of doc.files ?? []) {
  const absolute = path.join(root, file.path);
  if (!fs.existsSync(absolute) || !/\.[jt]sx?$/.test(file.path)) continue;
  const text = fs.readFileSync(absolute, "utf8");
  const scriptKind = /\.tsx$/.test(file.path)
    ? ts.ScriptKind.TSX
    : /\.jsx$/.test(file.path)
      ? ts.ScriptKind.JSX
      : /\.js$/.test(file.path)
        ? ts.ScriptKind.JS
        : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(absolute, text, ts.ScriptTarget.Latest, true, scriptKind);
  const records = classifySourceModuleSpecifiers(text, sf, parsed.options);
  const bySpecifier = new Map();
  for (const record of records) {
    const set = bySpecifier.get(record.specifier) ?? new Set();
    set.add(record.kind);
    bySpecifier.set(record.specifier, set);
  }
  for (const [specifier, kinds] of bySpecifier) {
    importKindsByFileAndSpecifier.set(`${file.fileId}\u0000${specifier}`, kinds);
  }
}

const reclassifiedTypeImports = [];
for (const fact of doc.moduleFacts ?? []) {
  if (fact.kind !== "static-import") continue;
  const kinds = importKindsByFileAndSpecifier.get(`${fact.fromFileId}\u0000${fact.specifier}`);
  if (!kinds || kinds.has("static-import") || kinds.has("dynamic-import")) continue;
  if (kinds.has("type-import")) {
    fact.kind = "type-import";
    reclassifiedTypeImports.push({
      moduleFactId: fact.moduleFactId,
      from: fileById.get(fact.fromFileId)?.path,
      to: fileById.get(fact.toFileId)?.path,
      specifier: fact.specifier,
    });
  }
}

// 3. Recompute product/internal-demo reachability using runtime edges only.
const NEXT_ENTRY_BASENAMES = new Set([
  "page.tsx", "page.ts", "layout.tsx", "layout.ts", "route.ts", "route.tsx",
  "default.tsx", "default.ts", "template.tsx", "template.ts", "loading.tsx", "loading.ts",
  "error.tsx", "error.ts", "global-error.tsx", "global-error.ts", "not-found.tsx", "not-found.ts",
  "forbidden.tsx", "forbidden.ts", "unauthorized.tsx", "unauthorized.ts",
  "sitemap.ts", "robots.ts", "manifest.ts", "opengraph-image.tsx", "twitter-image.tsx",
]);
const appEntrypoints = (doc.files ?? []).filter((file) => file.path.startsWith("app/") && NEXT_ENTRY_BASENAMES.has(path.basename(file.path)));
const instrumentation = (doc.files ?? []).filter((file) => ["instrumentation.ts", "instrumentation-client.ts", "proxy.ts", "middleware.ts"].includes(file.path));
const internalDemoEntrypoints = appEntrypoints.filter((file) => file.path.includes("/components-test-lib/"));
const internalDemoIds = new Set(internalDemoEntrypoints.map((file) => file.fileId));
const productEntrypoints = [...appEntrypoints, ...instrumentation].filter((file) => !internalDemoIds.has(file.fileId));

const graph = new Map((doc.files ?? []).map((file) => [file.fileId, new Set()]));
for (const fact of doc.moduleFacts ?? []) {
  if (!fact.toFileId || (fact.kind !== "static-import" && fact.kind !== "dynamic-import")) continue;
  graph.get(fact.fromFileId)?.add(fact.toFileId);
}
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
const reachabilityByFile = new Map();
const reachabilityChanges = [];
for (const claim of doc.reachabilityClaims ?? []) {
  const oldKind = claim.kind;
  const oldRealms = [...(claim.realms ?? [])];
  const productOrigins = [...productClosures.entries()].filter(([, seen]) => seen.has(claim.fileId)).map(([id]) => id);
  const demoOrigins = [...demoClosures.entries()].filter(([, seen]) => seen.has(claim.fileId)).map(([id]) => id);
  const realms = [];
  if (productOrigins.length) realms.push("product");
  if (demoOrigins.length) realms.push("internal-demo");
  claim.kind = realms.length ? "reachable" : "source-only";
  claim.policy = "safehome-next16-app-router-runtime.v1";
  claim.realms = realms;
  const entrypointFileIds = [...new Set([...productOrigins, ...demoOrigins])].sort();
  if (entrypointFileIds.length) claim.entrypointFileIds = entrypointFileIds;
  else delete claim.entrypointFileIds;
  delete claim.blockers;
  reachabilityByFile.set(claim.fileId, claim);
  if (oldKind !== claim.kind || JSON.stringify(oldRealms) !== JSON.stringify(realms)) {
    reachabilityChanges.push({
      reachabilityClaimId: claim.reachabilityClaimId,
      file: fileById.get(claim.fileId)?.path,
      from: {kind: oldKind, realms: oldRealms},
      to: {kind: claim.kind, realms},
    });
  }
}
doc.policies.entrypoint = "safehome-next16-app-router-runtime.v1";

// 4. Realm-dependent entity claims must follow the corrected reachability claim.
const claimChanges = [];
for (const claim of doc.claims ?? []) {
  const oldKind = claim.kind;
  const oldRealms = [...(claim.realms ?? [])];
  const sourceIds = claim.basis?.sourceFactIds ?? [];
  const originFileIds = [...new Set(sourceIds.map((id) => sourceFactById.get(id)?.fileId).filter(Boolean))];
  if (originFileIds.length !== 1) continue;
  const reachability = reachabilityByFile.get(originFileIds[0]);
  if (!reachability) continue;
  const semanticKinds = (claim.basis?.semanticFactIds ?? [])
    .map((id) => semanticFactById.get(id)?.kind)
    .filter(Boolean);
  const semanticOnly = semanticKinds.length > 0 && semanticKinds.every((kind) => kind === "semantic-implication");
  let kind;
  if (semanticOnly && reachability.realms.includes("product")) kind = "semantic-product-path-reference";
  else if (semanticOnly) kind = "dependency-only";
  else if (reachability.realms.includes("product")) kind = "product-path-reference";
  else if (reachability.realms.includes("internal-demo")) kind = "internal-demo-reference";
  else kind = "source-only-reference";
  claim.kind = kind;
  claim.realms = [...reachability.realms];
  claim.basis = {...claim.basis, reachabilityClaimIds: [reachability.reachabilityClaimId]};
  if (oldKind !== kind || JSON.stringify(oldRealms) !== JSON.stringify(claim.realms)) {
    claimChanges.push({claimId: claim.claimId, entity: claim.entity, from: {kind: oldKind, realms: oldRealms}, to: {kind, realms: claim.realms}});
  }
}

// 5. Recompute unresolved coverage after conservative source-fact removal.
const unresolvedFacts = doc.sourceFacts.filter((fact) => fact.resolution === "unresolved");
const unresolvedByDomain = {};
for (const fact of unresolvedFacts) {
  for (const domain of fact.domains ?? ["unknown"]) unresolvedByDomain[domain] = (unresolvedByDomain[domain] ?? 0) + 1;
}
doc.coverage.unresolvedFacts = unresolvedFacts.length;
doc.coverage.unresolvedByDomain = unresolvedByDomain;

const report = {
  schema: "safehome.design-system-evidence.phase0-normalization.v3",
  sourceIdentity: {
    authorityWorkspaceDirty,
    adjustedFromRawGenerator: sourceIdentityAdjusted,
    authorityStatusLines: authorityStatus ? authorityStatus.split(/\r?\n/).length : 0,
  },
  inputSourceFacts: (doc.sourceFacts?.length ?? 0) + removedSourceFacts.length,
  outputSourceFacts: doc.sourceFacts.length,
  removedSourceFacts,
  removedSemanticFactIds: [...removedSemanticFactIds].sort(),
  removedClaimIds: removedClaimIds.sort(),
  reclassifiedTypeImports: reclassifiedTypeImports.sort((a, b) => `${a.from}\u0000${a.to}`.localeCompare(`${b.from}\u0000${b.to}`)),
  reachabilityChanges: reachabilityChanges.sort((a, b) => a.file.localeCompare(b.file)),
  claimChanges: claimChanges.sort((a, b) => a.claimId.localeCompare(b.claimId)),
};

fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, `${JSON.stringify(doc, null, 2)}\n`);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`EVIDENCE_V1_NORMALIZE=PASS dirty=${authorityWorkspaceDirty} removedSourceFacts=${removedSourceFacts.length} typeImports=${reclassifiedTypeImports.length} reachabilityChanges=${reachabilityChanges.length} claimChanges=${claimChanges.length}`);
for (const removed of removedSourceFacts) {
  console.log(`REMOVED ${removed.factId} ${removed.propPath} recorded=${removed.recordedDomains.join(",") || "none"} chakra=${removed.authoritativeDomains.join(",") || "none"}`);
}
for (const edge of reclassifiedTypeImports) {
  console.log(`TYPE_IMPORT ${edge.from} -> ${edge.to} via=${edge.specifier}`);
}
