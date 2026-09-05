import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { classifySourceModuleSpecifiers } from "./runtime-imports.mjs";

const root = process.cwd();
const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const options = parsed.options;
const normalize = (p) => path.relative(root, p).split(path.sep).join("/");
const sourceFiles = parsed.fileNames.filter((f) => /\.[jt]sx?$/.test(f)).map((f) => path.resolve(f));
const sourceSet = new Set(sourceFiles);
const graph = new Map(sourceFiles.map((f) => [f, new Set()]));
const unresolvedCode = [];
const assetDependencies = [];
const typeOnlyDependencies = [];

function sourceClass(rel) {
  if (rel === "styles/theme.ts") return "theme";
  if (rel.includes("/__tests__/") || rel.includes("/tests/") || /\.test\.[jt]sx?$/.test(rel)) return "test";
  if (rel.includes("/__mocks__/") || /\.mock\.[jt]sx?$/.test(rel)) return "test-support";
  if (rel.includes("/_archived/")) return "archived";
  if (rel.startsWith("stories/") || /\.stories\.[jt]sx?$/.test(rel) || rel.startsWith(".storybook/")) return "storybook";
  if (rel.startsWith("e2e-tests/")) return "e2e";
  if (rel.startsWith("scripts/") || /\.config\.[jt]s$/.test(rel)) return "tooling";
  if (rel.startsWith("app/") || rel === "instrumentation-client.ts") return "app-source";
  if (/\.d\.ts$/.test(rel)) return "type-support";
  return "other";
}

function resolveLocal(containing, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return null;
  if (/\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|ico)$/i.test(specifier)) {
    return {kind: "asset"};
  }
  const resolved = ts.resolveModuleName(specifier, containing, options, ts.sys).resolvedModule;
  if (!resolved) return {kind: "unresolved"};
  const target = path.resolve(resolved.resolvedFileName.replace(/\.d\.ts$/, ".ts"));
  return sourceSet.has(target) ? {kind: "code", target} : {kind: "external"};
}

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, /\.tsx$/.test(file) ? ts.ScriptKind.TSX : /\.jsx$/.test(file) ? ts.ScriptKind.JSX : /\.js$/.test(file) ? ts.ScriptKind.JS : ts.ScriptKind.TS);
  const records = classifySourceModuleSpecifiers(text, sf, options);
  const seen = new Set();
  for (const record of records) {
    const key = `${record.kind}\u0000${record.specifier}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const resolved = resolveLocal(file, record.specifier);
    if (!resolved) continue;
    if (resolved.kind === "asset") {
      assetDependencies.push({from: normalize(file), specifier: record.specifier});
      continue;
    }
    if (resolved.kind === "unresolved") {
      unresolvedCode.push({from: normalize(file), specifier: record.specifier});
      continue;
    }
    if (resolved.kind !== "code") continue;
    if (record.kind === "type-import") {
      typeOnlyDependencies.push({from: normalize(file), to: normalize(resolved.target), specifier: record.specifier});
      continue;
    }
    graph.get(file)?.add(resolved.target);
  }
}

const NEXT_ENTRY_BASENAMES = new Set([
  "page.tsx", "page.ts", "layout.tsx", "layout.ts", "route.ts", "route.tsx", "default.tsx", "default.ts",
  "template.tsx", "template.ts", "loading.tsx", "loading.ts", "error.tsx", "error.ts", "global-error.tsx",
  "global-error.ts", "not-found.tsx", "not-found.ts", "forbidden.tsx", "forbidden.ts", "unauthorized.tsx",
  "unauthorized.ts", "sitemap.ts", "robots.ts", "manifest.ts", "opengraph-image.tsx", "twitter-image.tsx",
]);
const appEntrypoints = sourceFiles.filter((file) => normalize(file).startsWith("app/") && NEXT_ENTRY_BASENAMES.has(path.basename(normalize(file))));
const instrumentation = sourceFiles.filter((file) => ["instrumentation.ts", "instrumentation-client.ts", "proxy.ts", "middleware.ts"].includes(normalize(file)));
const internalDemoEntrypoints = new Set(appEntrypoints.filter((file) => normalize(file).includes("/components-test-lib/")));
const productEntrypoints = new Set([...appEntrypoints, ...instrumentation].filter((file) => !internalDemoEntrypoints.has(file)));

function closure(entries) {
  const seen = new Set();
  const queue = [...entries];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const target of graph.get(file) ?? []) queue.push(target);
  }
  return seen;
}
const productReachable = closure(productEntrypoints);
const internalDemoReachable = closure(internalDemoEntrypoints);
const rows = sourceFiles.map((file) => {
  const rel = normalize(file);
  return {file: rel, sourceClass: sourceClass(rel), productReachable: productReachable.has(file), internalDemoReachable: internalDemoReachable.has(file), imports: [...(graph.get(file) ?? [])].map(normalize).sort()};
}).sort((a,b) => a.file.localeCompare(b.file));
const row = (rel) => rows.find((r) => r.file === rel);
const hasTypeEdge = (from, to) => typeOnlyDependencies.some((edge) => edge.from === from && edge.to === to);
const sentinels = {
  addressMapperProduct: row("app/components/address-mapper.tsx")?.productReachable === true,
  addressMapperNotInternalDemo: row("app/components/address-mapper.tsx")?.internalDemoReachable === false,
  cardHazardProduct: row("app/components/card-hazard.tsx")?.productReachable === true,
  cardHazardInternalDemo: row("app/components/card-hazard.tsx")?.internalDemoReachable === true,
  shareNotProduct: row("app/components/share.tsx")?.productReachable === false,
  shareInternalDemo: row("app/components/share.tsx")?.internalDemoReachable === true,
  mobileCardNotProduct: row("app/components/mobile-card-hazard.tsx")?.productReachable === false,
  mobileCardNotInternalDemo: row("app/components/mobile-card-hazard.tsx")?.internalDemoReachable === false,
  dataToMobileCardTypeOnly: hasTypeEdge("app/data/data.ts", "app/components/mobile-card-hazard.tsx"),
  cardHazardToAddressMapperTypeOnly: hasTypeEdge("app/components/card-hazard.tsx", "app/components/address-mapper.tsx"),
  componentsTestLibInternalDemo: row("app/(other)/components-test-lib/page.tsx")?.internalDemoReachable === true,
  componentsTestLibNotProduct: row("app/(other)/components-test-lib/page.tsx")?.productReachable === false,
};
const appRows = rows.filter((r) => r.sourceClass === "app-source");
const result = {
  schema: "safehome.design-system-evidence.phase0-reachability.v2",
  entrypointPolicy: "safehome-next16-app-router-runtime.v1",
  typescriptVersion: ts.version,
  counts: {
    sourceFiles: rows.length,
    appSourceFiles: appRows.length,
    appEntrypoints: appEntrypoints.length,
    productEntrypoints: productEntrypoints.size,
    internalDemoEntrypoints: internalDemoEntrypoints.size,
    productReachableAllSources: rows.filter((r) => r.productReachable).length,
    productReachableAppSources: appRows.filter((r) => r.productReachable).length,
    internalDemoReachableAllSources: rows.filter((r) => r.internalDemoReachable).length,
    unresolvedCodeImports: unresolvedCode.length,
    assetDependencies: assetDependencies.length,
    typeOnlyDependencies: typeOnlyDependencies.length,
  },
  sentinels,
  unresolvedCode,
  assetDependencies,
  typeOnlyDependencies: typeOnlyDependencies.sort((a,b) => `${a.from}\u0000${a.to}`.localeCompare(`${b.from}\u0000${b.to}`)),
  entrypoints: {product: [...productEntrypoints].map(normalize).sort(), internalDemo: [...internalDemoEntrypoints].map(normalize).sort()},
  files: rows,
};
const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "phase0-reachability.json");
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PHASE0_REACHABILITY productApp=${result.counts.productReachableAppSources}/${result.counts.appSourceFiles} demoAll=${result.counts.internalDemoReachableAllSources}/${rows.length} typeOnly=${typeOnlyDependencies.length} unresolvedCode=${unresolvedCode.length} assets=${assetDependencies.length}`);
for (const [name, pass] of Object.entries(sentinels)) console.log(`SENTINEL ${name}=${pass ? "PASS" : "FAIL"}`);
if (!Object.values(sentinels).every(Boolean)) process.exitCode = 1;
console.log(`RECEIPT=${out}`);
