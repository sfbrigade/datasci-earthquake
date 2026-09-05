import fs from "node:fs";
import path from "node:path";

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
const semanticFactIds = unique(doc.semanticFacts, "semanticFactId", "semanticFact");
unique(doc.claims, "claimId", "claim");

for (const file of doc.files ?? []) {
  if (path.isAbsolute(file.path) || /^[A-Za-z]:[\\/]/.test(file.path)) fail(`file path must be repo-relative: ${file.path}`);
  if (file.path.includes("\\")) fail(`file path must use forward slashes: ${file.path}`);
  if (file.analysisStatus === "excluded" && !file.reason) fail(`excluded file requires reason: ${file.path}`);
}

for (const fact of doc.sourceFacts ?? []) {
  if (!fileIds.has(fact.fileId)) fail(`sourceFact ${fact.factId} references unknown fileId ${fact.fileId}`);
  if (fact.resolution === "unresolved" && (!fact.domains || fact.domains.length === 0)) {
    fail(`unresolved sourceFact ${fact.factId} must declare at least one domain, including 'unknown' when necessary`);
  }
  if ((fact.resolution === "exact" || fact.resolution === "bounded") && (!fact.values || fact.values.length === 0)) {
    fail(`${fact.resolution} sourceFact ${fact.factId} must declare values`);
  }
  if (fact.resolution === "exact" && fact.values?.length !== 1) fail(`exact sourceFact ${fact.factId} must have exactly one value`);
  if (fact.resolution === "bounded" && (fact.values?.length ?? 0) < 2) fail(`bounded sourceFact ${fact.factId} must have at least two values`);
}

for (const fact of doc.moduleFacts ?? []) {
  if (!fileIds.has(fact.fromFileId)) fail(`moduleFact ${fact.moduleFactId} references unknown fromFileId ${fact.fromFileId}`);
  if (fact.toFileId && !fileIds.has(fact.toFileId)) fail(`moduleFact ${fact.moduleFactId} references unknown toFileId ${fact.toFileId}`);
  if ((fact.kind === "static-import" || fact.kind === "dynamic-import") && !fact.toFileId) fail(`resolved ${fact.kind} ${fact.moduleFactId} requires toFileId`);
  if ((fact.kind === "asset-import" || fact.kind === "unresolved-import") && fact.toFileId) fail(`${fact.kind} ${fact.moduleFactId} must not claim toFileId`);
}

for (const fact of doc.semanticFacts ?? []) {
  for (const id of fact.originFactIds ?? []) if (!sourceFactIds.has(id)) fail(`semanticFact ${fact.semanticFactId} references unknown sourceFact ${id}`);
  if (fact.kind === "explicit-token" && !fact.entity) fail(`explicit-token ${fact.semanticFactId} requires entity`);
  if (fact.kind === "semantic-implication" && (!fact.entities || fact.entities.length === 0)) fail(`semantic-implication ${fact.semanticFactId} requires entities`);
  if (fact.kind === "color-palette-context" && fact.virtual !== true) fail(`color-palette-context ${fact.semanticFactId} must be explicitly virtual`);
}

const forbiddenClaimWords = /(^|[-_ ])(mapped|unused)([-_ ]|$)/i;
for (const claim of doc.claims ?? []) {
  if (forbiddenClaimWords.test(claim.kind)) fail(`claim ${claim.claimId} uses forbidden ambiguous status word in kind: ${claim.kind}`);
  if (claim.policy !== doc.policies?.claim) fail(`claim ${claim.claimId} policy must equal document claim policy`);
  for (const id of claim.basis?.sourceFactIds ?? []) if (!sourceFactIds.has(id)) fail(`claim ${claim.claimId} references unknown sourceFact ${id}`);
  for (const id of claim.basis?.semanticFactIds ?? []) if (!semanticFactIds.has(id)) fail(`claim ${claim.claimId} references unknown semanticFact ${id}`);
  for (const id of claim.basis?.moduleFactIds ?? []) if (!moduleFactIds.has(id)) fail(`claim ${claim.claimId} references unknown moduleFact ${id}`);
  if (claim.kind === "strong-negative-blocked" && (!claim.blockers || claim.blockers.length === 0)) fail(`strong-negative-blocked claim ${claim.claimId} requires blockers`);
  if (claim.kind === "review-for-removal" && (claim.blockers?.length ?? 0) > 0) fail(`review-for-removal claim ${claim.claimId} cannot retain blockers`);
}

const coverage = doc.coverage ?? {};
const analyzed = (coverage.completeFiles ?? 0) + (coverage.partialFiles ?? 0) + (coverage.failedFiles ?? 0);
if (analyzed !== coverage.eligibleFiles) fail(`coverage eligibleFiles must equal complete + partial + failed (${coverage.eligibleFiles} != ${analyzed})`);
const unresolvedCount = (doc.sourceFacts ?? []).filter((fact) => fact.resolution === "unresolved").length;
if (coverage.unresolvedFacts !== unresolvedCount) fail(`coverage unresolvedFacts mismatch (${coverage.unresolvedFacts} != ${unresolvedCount})`);
const sourceClassCount = Object.values(coverage.bySourceClass ?? {}).reduce((sum, value) => sum + value, 0);
if (sourceClassCount !== (doc.files?.length ?? 0)) fail(`coverage bySourceClass total must equal files length (${sourceClassCount} != ${doc.files?.length ?? 0})`);

if (doc.sourceIdentity?.workspaceDirty === false && !doc.sourceIdentity?.tree) fail("clean evidence requires sourceIdentity.tree");
if (doc.sourceIdentity?.workspaceDirty === true && (doc.files ?? []).some((file) => file.contentIdentity?.kind !== "sha256")) {
  fail("dirty-workspace evidence requires sha256 contentIdentity for every analyzed file");
}

if (errors.length) {
  console.error(`EVIDENCE_V1_VALIDATE=FAIL count=${errors.length}`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`EVIDENCE_V1_VALIDATE=PASS files=${doc.files.length} sourceFacts=${doc.sourceFacts.length} semanticFacts=${doc.semanticFacts.length} claims=${doc.claims.length}`);
