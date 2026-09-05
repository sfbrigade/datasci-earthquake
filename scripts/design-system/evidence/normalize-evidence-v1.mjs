import fs from "node:fs";
import path from "node:path";
import { createJiti } from "jiti";

const root = process.cwd();
const input = process.argv[2];
const output = process.argv[3];
const reportPath = process.argv[4];
if (!input || !output || !reportPath) {
  throw new Error("usage: node normalize-evidence-v1.mjs <input.json> <output.json> <report.json>");
}

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
  if ((fact.originFactIds ?? []).some((id) => removedSourceFactIds.has(id))) {
    removedSemanticFactIds.add(fact.semanticFactId);
  } else {
    keptSemanticFacts.push(fact);
  }
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

const unresolvedFacts = doc.sourceFacts.filter((fact) => fact.resolution === "unresolved");
const unresolvedByDomain = {};
for (const fact of unresolvedFacts) {
  for (const domain of fact.domains ?? ["unknown"]) unresolvedByDomain[domain] = (unresolvedByDomain[domain] ?? 0) + 1;
}
doc.coverage.unresolvedFacts = unresolvedFacts.length;
doc.coverage.unresolvedByDomain = unresolvedByDomain;

const report = {
  schema: "safehome.design-system-evidence.phase0-normalization.v1",
  inputSourceFacts: (doc.sourceFacts?.length ?? 0) + removedSourceFacts.length,
  outputSourceFacts: doc.sourceFacts.length,
  removedSourceFacts,
  removedSemanticFactIds: [...removedSemanticFactIds].sort(),
  removedClaimIds: removedClaimIds.sort(),
};

fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, `${JSON.stringify(doc, null, 2)}\n`);
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`EVIDENCE_V1_NORMALIZE=PASS removedSourceFacts=${removedSourceFacts.length} removedSemanticFacts=${removedSemanticFactIds.size} removedClaims=${removedClaimIds.length}`);
for (const removed of removedSourceFacts) {
  console.log(`REMOVED ${removed.factId} ${removed.propPath} recorded=${removed.recordedDomains.join(",") || "none"} chakra=${removed.authoritativeDomains.join(",") || "none"}`);
}
