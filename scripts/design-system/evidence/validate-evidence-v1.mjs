import fs from "node:fs";
import path from "node:path";
import { nextRouteCompositionEdges } from "./next-route-structure.mjs";

const root = process.cwd();
const input = process.argv[2] ?? path.join(root, "scripts/design-system/evidence/fixtures/evidence-v1.valid.json");
const doc = JSON.parse(fs.readFileSync(input, "utf8"));
const errors = [];
const fail = (message) => errors.push(message);

if (doc.schema !== "safehome.design-system-evidence.v1") fail(`unexpected schema: ${doc.schema}`);

function unique(records, key, label) {
  const seen = new Set();
  for (const record of records ?? []) {
    const id = record[key];
    if (!id) fail(`${label} missing ${key}`);
    else if (seen.has(id)) fail(`duplicate ${label} id: ${id}`);
    else seen.add(id);
  }
  return seen;
}

const fileIds = unique(doc.files, "fileId", "file");
const sourceFactIds = unique(doc.sourceFacts, "factId", "sourceFact");
const moduleFactIds = unique(doc.moduleFacts, "moduleFactId", "moduleFact");
const reachabilityClaimIds = unique(doc.reachabilityClaims, "reachabilityClaimId", "reachabilityClaim");
const semanticFactIds = unique(doc.semanticFacts, "semanticFactId", "semanticFact");
unique(doc.claims, "claimId", "claim");
const fileById = new Map((doc.files ?? []).map((file) => [file.fileId, file]));
const sourceFactById = new Map((doc.sourceFacts ?? []).map((fact) => [fact.factId, fact]));
const semanticFactById = new Map((doc.semanticFacts ?? []).map((fact) => [fact.semanticFactId, fact]));
const reachabilityById = new Map((doc.reachabilityClaims ?? []).map((claim) => [claim.reachabilityClaimId, claim]));
const allowedFrameworkEdges = new Set(
  nextRouteCompositionEdges((doc.files ?? []).map((file) => file.path)).map((edge) => `${edge.from}\u0000${edge.to}`),
);

for (const file of doc.files ?? []) {
  if (path.isAbsolute(file.path) || /^[A-Za-z]:[\\/]/.test(file.path)) fail(`file path must be repo-relative: ${file.path}`);
  if (file.path.includes("\\")) fail(`file path must use forward slashes: ${file.path}`);
  if (file.analysisStatus === "excluded" && !file.reason) fail(`excluded file requires reason: ${file.path}`);
}

function conditionKey(conditions) {
  return JSON.stringify(conditions ?? []);
}
function sameSet(a, b) {
  return JSON.stringify([...new Set(a ?? [])].sort()) === JSON.stringify([...new Set(b ?? [])].sort());
}

for (const fact of doc.sourceFacts ?? []) {
  if (!fileIds.has(fact.fileId)) fail(`sourceFact ${fact.factId} references unknown fileId ${fact.fileId}`);
  if (fact.resolution === "unresolved" && (!fact.domains || fact.domains.length === 0)) {
    fail(`unresolved sourceFact ${fact.factId} must declare at least one domain, including 'unknown' when necessary`);
  }

  const valueBearing = fact.kind !== "component-callsite";
  const values = fact.values ?? [];
  const valueCases = fact.valueCases ?? [];

  if (valueBearing && (fact.resolution === "exact" || fact.resolution === "bounded") && values.length === 0) {
    fail(`${fact.resolution} sourceFact ${fact.factId} must declare values`);
  }
  if (valueBearing && fact.resolution === "exact" && values.length > 1 && valueCases.length === 0) {
    fail(`exact multi-value sourceFact ${fact.factId} requires condition-bound valueCases`);
  }
  if (valueBearing && fact.resolution === "bounded" && values.length < 2) {
    fail(`bounded sourceFact ${fact.factId} must have at least two values`);
  }
  if (fact.resolution === "unresolved" && valueCases.length > 0) {
    fail(`unresolved sourceFact ${fact.factId} cannot claim exact valueCases`);
  }

  if (valueCases.length > 0) {
    const valuesSet = new Set(values);
    const caseValues = new Set();
    const casesByCondition = new Map();
    for (const valueCase of valueCases) {
      if (!valuesSet.has(valueCase.value)) {
        fail(`sourceFact ${fact.factId} valueCase references undeclared value ${JSON.stringify(valueCase.value)}`);
      }
      caseValues.add(valueCase.value);
      const key = conditionKey(valueCase.conditions);
      if (casesByCondition.has(key)) fail(`sourceFact ${fact.factId} duplicates condition path ${key}`);
      else casesByCondition.set(key, valueCase.value);
    }
    for (const value of valuesSet) {
      if (!caseValues.has(value)) fail(`sourceFact ${fact.factId} value ${JSON.stringify(value)} has no valueCase provenance`);
    }
  }

  if (fact.kind === "component-callsite" && !fact.component) fail(`component-callsite ${fact.factId} requires component`);
}

for (const fact of doc.moduleFacts ?? []) {
  if (!fileIds.has(fact.fromFileId)) fail(`moduleFact ${fact.moduleFactId} references unknown fromFileId ${fact.fromFileId}`);
  if (fact.toFileId && !fileIds.has(fact.toFileId)) fail(`moduleFact ${fact.moduleFactId} references unknown toFileId ${fact.toFileId}`);
  if (["static-import", "dynamic-import", "type-import", "framework-route-composition"].includes(fact.kind) && !fact.toFileId) {
    fail(`resolved ${fact.kind} ${fact.moduleFactId} requires toFileId`);
  }
  if (["asset-import", "unresolved-import"].includes(fact.kind) && fact.toFileId) {
    fail(`${fact.kind} ${fact.moduleFactId} must not claim toFileId`);
  }
  if (fact.kind === "framework-route-composition") {
    const fromPath = fileById.get(fact.fromFileId)?.path;
    const toPath = fileById.get(fact.toFileId)?.path;
    if (!fromPath || !toPath || !allowedFrameworkEdges.has(`${fromPath}\u0000${toPath}`)) {
      fail(`framework-route-composition ${fact.moduleFactId} is not allowed by the Next route policy: ${fromPath} -> ${toPath}`);
    }
    if (fact.specifier !== toPath) {
      fail(`framework-route-composition ${fact.moduleFactId} specifier must equal target path`);
    }
  }
}

for (const claim of doc.reachabilityClaims ?? []) {
  if (!fileIds.has(claim.fileId)) fail(`reachabilityClaim ${claim.reachabilityClaimId} references unknown fileId ${claim.fileId}`);
  if (claim.policy !== doc.policies?.entrypoint) fail(`reachabilityClaim ${claim.reachabilityClaimId} policy must equal document entrypoint policy`);
  for (const id of claim.entrypointFileIds ?? []) if (!fileIds.has(id)) fail(`reachabilityClaim ${claim.reachabilityClaimId} references unknown entrypoint fileId ${id}`);
  if (claim.kind === "reachable" && (claim.realms?.length ?? 0) === 0) fail(`reachable claim ${claim.reachabilityClaimId} requires at least one realm`);
  if (claim.kind === "source-only" && (claim.realms?.length ?? 0) !== 0) fail(`source-only claim ${claim.reachabilityClaimId} must not claim a reachable realm`);
  if (claim.kind === "uncertain" && (!claim.blockers || claim.blockers.length === 0)) fail(`uncertain reachability claim ${claim.reachabilityClaimId} requires blockers`);
}

for (const fact of doc.semanticFacts ?? []) {
  for (const id of fact.originFactIds ?? []) if (!sourceFactIds.has(id)) fail(`semanticFact ${fact.semanticFactId} references unknown sourceFact ${id}`);
  if (fact.kind === "explicit-token" && !fact.entity) fail(`explicit-token ${fact.semanticFactId} requires entity`);
  if (fact.kind === "semantic-implication" && (!fact.entities || fact.entities.length === 0)) fail(`semantic-implication ${fact.semanticFactId} requires entities`);
  if (fact.kind === "color-palette-context" && fact.virtual !== true) fail(`color-palette-context ${fact.semanticFactId} must be explicitly virtual`);

  if ((fact.conditions?.length ?? 0) > 0) {
    const matchingOrigins = (fact.originFactIds ?? []).map((id) => sourceFactById.get(id)).filter(Boolean);
    const matchingCases = matchingOrigins.flatMap((origin) => origin.valueCases ?? []).filter((valueCase) => conditionKey(valueCase.conditions) === conditionKey(fact.conditions));
    if (matchingCases.length === 0) {
      fail(`semanticFact ${fact.semanticFactId} conditions have no matching source valueCase provenance`);
    } else if (fact.value != null && !matchingCases.some((valueCase) => valueCase.value === fact.value)) {
      fail(`semanticFact ${fact.semanticFactId} value does not match its source valueCase`);
    }
  }

  if (fact.kind === "recipe-default") {
    if (!fact.recipe || !fact.variant || fact.value == null) fail(`recipe-default ${fact.semanticFactId} requires recipe, variant, and value`);
    if (!(fact.originFactIds ?? []).some((id) => sourceFactById.get(id)?.kind === "component-callsite")) {
      fail(`recipe-default ${fact.semanticFactId} must originate from a component-callsite source fact`);
    }
  }
}

const forbiddenClaimWords = /(^|[-_ ])(mapped|unused)([-_ ]|$)/i;
for (const claim of doc.claims ?? []) {
  if (forbiddenClaimWords.test(claim.kind)) fail(`claim ${claim.claimId} uses forbidden ambiguous status word in kind: ${claim.kind}`);
  if (claim.policy !== doc.policies?.claim) fail(`claim ${claim.claimId} policy must equal document claim policy`);
  for (const id of claim.basis?.sourceFactIds ?? []) if (!sourceFactIds.has(id)) fail(`claim ${claim.claimId} references unknown sourceFact ${id}`);
  for (const id of claim.basis?.semanticFactIds ?? []) if (!semanticFactIds.has(id)) fail(`claim ${claim.claimId} references unknown semanticFact ${id}`);
  for (const id of claim.basis?.moduleFactIds ?? []) if (!moduleFactIds.has(id)) fail(`claim ${claim.claimId} references unknown moduleFact ${id}`);
  for (const id of claim.basis?.reachabilityClaimIds ?? []) if (!reachabilityClaimIds.has(id)) fail(`claim ${claim.claimId} references unknown reachabilityClaim ${id}`);

  const basisReachability = (claim.basis?.reachabilityClaimIds ?? []).map((id) => reachabilityById.get(id)).filter(Boolean);
  const basisRealms = [...new Set(basisReachability.flatMap((item) => item.realms ?? []))];
  if (!sameSet(claim.realms ?? [], basisRealms)) fail(`claim ${claim.claimId} realms must equal its reachability basis realms`);

  if (claim.kind === "strong-negative-blocked" && (!claim.blockers || claim.blockers.length === 0)) fail(`strong-negative-blocked claim ${claim.claimId} requires blockers`);
  if (claim.kind === "review-for-removal" && (claim.blockers?.length ?? 0) > 0) fail(`review-for-removal claim ${claim.claimId} cannot retain blockers`);
  if (["product-path-reference", "semantic-product-path-reference"].includes(claim.kind) && !basisRealms.includes("product")) {
    fail(`${claim.kind} claim ${claim.claimId} requires product reachability basis`);
  }
  if (claim.kind === "internal-demo-reference" && (!basisRealms.includes("internal-demo") || basisRealms.includes("product"))) {
    fail(`internal-demo-reference claim ${claim.claimId} requires internal-demo reachability without product reachability`);
  }
  if (claim.kind === "source-only-reference") {
    const sourceOnly = basisReachability.some((item) => item.kind === "source-only");
    if (!sourceOnly || basisRealms.length !== 0) fail(`source-only-reference claim ${claim.claimId} requires source-only reachability basis`);
  }
  if (claim.kind === "dependency-only") {
    const semanticKinds = (claim.basis?.semanticFactIds ?? []).map((id) => semanticFactById.get(id)?.kind).filter(Boolean);
    if (semanticKinds.length === 0 || !semanticKinds.every((kind) => kind === "semantic-implication")) {
      fail(`dependency-only claim ${claim.claimId} must be based only on semantic-implication facts`);
    }
  }
}

const coverage = doc.coverage ?? {};
const statusCounts = (doc.files ?? []).reduce((acc, file) => {
  acc[file.analysisStatus] = (acc[file.analysisStatus] ?? 0) + 1;
  return acc;
}, {});
const actualEligible = (statusCounts.complete ?? 0) + (statusCounts.partial ?? 0) + (statusCounts.failed ?? 0);
if (coverage.eligibleFiles !== actualEligible) fail(`coverage eligibleFiles mismatch (${coverage.eligibleFiles} != ${actualEligible})`);
if (coverage.completeFiles !== (statusCounts.complete ?? 0)) fail(`coverage completeFiles mismatch (${coverage.completeFiles} != ${statusCounts.complete ?? 0})`);
if (coverage.partialFiles !== (statusCounts.partial ?? 0)) fail(`coverage partialFiles mismatch (${coverage.partialFiles} != ${statusCounts.partial ?? 0})`);
if (coverage.failedFiles !== (statusCounts.failed ?? 0)) fail(`coverage failedFiles mismatch (${coverage.failedFiles} != ${statusCounts.failed ?? 0})`);
if (coverage.excludedFiles !== (statusCounts.excluded ?? 0)) fail(`coverage excludedFiles mismatch (${coverage.excludedFiles} != ${statusCounts.excluded ?? 0})`);
if ((coverage.eligibleFiles ?? 0) + (coverage.excludedFiles ?? 0) !== (doc.files?.length ?? 0)) {
  fail(`coverage eligible + excluded must equal files length`);
}
const unresolvedCount = (doc.sourceFacts ?? []).filter((fact) => fact.resolution === "unresolved").length;
if (coverage.unresolvedFacts !== unresolvedCount) fail(`coverage unresolvedFacts mismatch (${coverage.unresolvedFacts} != ${unresolvedCount})`);
const actualBySourceClass = (doc.files ?? []).reduce((acc, file) => {
  acc[file.sourceClass] = (acc[file.sourceClass] ?? 0) + 1;
  return acc;
}, {});
if (JSON.stringify(Object.fromEntries(Object.entries(coverage.bySourceClass ?? {}).sort())) !== JSON.stringify(Object.fromEntries(Object.entries(actualBySourceClass).sort()))) {
  fail(`coverage bySourceClass must exactly match file source classes`);
}

if (doc.sourceIdentity?.workspaceDirty === false) {
  if (!doc.sourceIdentity?.tree) fail("clean evidence requires sourceIdentity.tree");
  if ((doc.files ?? []).some((file) => file.contentIdentity?.kind !== "git-blob")) fail("clean evidence requires git-blob contentIdentity for every analyzed file");
}
if (doc.sourceIdentity?.workspaceDirty === true && (doc.files ?? []).some((file) => file.contentIdentity?.kind !== "sha256")) {
  fail("dirty-workspace evidence requires sha256 contentIdentity for every analyzed file");
}

if (errors.length) {
  console.error(`EVIDENCE_V1_VALIDATE=FAIL count=${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`EVIDENCE_V1_VALIDATE=PASS files=${doc.files.length} sourceFacts=${doc.sourceFacts.length} moduleFacts=${doc.moduleFacts.length} reachabilityClaims=${doc.reachabilityClaims.length} semanticFacts=${doc.semanticFacts.length} claims=${doc.claims.length}`);
