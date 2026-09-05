import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const configFile = ts.readConfigFile(path.join(root, "tsconfig.json"), ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const options = parsed.options;

const normalize = (p) => path.relative(root, p).split(path.sep).join("/");
const sourceFiles = parsed.fileNames
  .filter((f) => /\.[jt]sx?$/.test(f))
  .map((f) => path.resolve(f));
const sourceSet = new Set(sourceFiles);
const graph = new Map(sourceFiles.map((f) => [f, new Set()]));
const unresolved = [];

function sourceClass(rel) {
  if (rel === "styles/theme.ts") return "theme";
  if (rel.includes("/__tests__/") || rel.includes("/tests/") || /\.test\.[jt]sx?$/.test(rel)) return "test";
  if (rel.includes("/_archived/")) return "archived";
  if (rel.startsWith("stories/") || /\.stories\.[jt]sx?$/.test(rel) || rel.startsWith(".storybook/")) return "storybook";
  if (rel.startsWith("scripts/") || /\.config\.[jt]s$/.test(rel)) return "tooling";
  if (rel.startsWith("app/") || rel === "instrumentation-client.ts") return "app-source";
  return "other";
}

function addResolved(containing, specifier) {
  if (!specifier.startsWith(".") && !specifier.startsWith("@/")) return;
  const resolved = ts.resolveModuleName(specifier, containing, options, ts.sys).resolvedModule;
  if (!resolved) {
    unresolved.push({from: normalize(containing), specifier});
    return;
  }
  const target = path.resolve(resolved.resolvedFileName.replace(/\.d\.ts$/, ".ts"));
  if (sourceSet.has(target)) graph.get(containing)?.add(target);
}

for (const file of sourceFiles) {
  const text = fs.readFileSync(file, "utf8");
  const info = ts.preProcessFile(text, true, true);
  for (const imported of info.importedFiles) addResolved(file, imported.fileName);
}

const NEXT_ENTRY_BASENAMES = new Set([
  "page.tsx", "page.ts", "layout.tsx", "layout.ts", "route.ts", "route.tsx",
  "default.tsx", "default.ts", "template.tsx", "template.ts", "loading.tsx", "loading.ts",
  "error.tsx", "error.ts", "global-error.tsx", "global-error.ts", "not-found.tsx", "not-found.ts",
  "forbidden.tsx", "forbidden.ts", "unauthorized.tsx", "unauthorized.ts",
  "sitemap.ts", "robots.ts", "manifest.ts", "opengraph-image.tsx", "twitter-image.tsx",
]);

const appEntrypoints = sourceFiles.filter((file) => {
  const rel = normalize(file);
  return rel.startsWith("app/") && NEXT_ENTRY_BASENAMES.has(path.basename(rel));
});
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
  return {
    file: rel,
    sourceClass: sourceClass(rel),
    productReachable: productReachable.has(file),
    internalDemoReachable: internalDemoReachable.has(file),
    imports: [...(graph.get(file) ?? [])].map(normalize).sort(),
  };
}).sort((a,b) => a.file.localeCompare(b.file));

function row(rel) { return rows.find((r) => r.file === rel); }
const sentinels = {
  addressMapperProduct: row("app/components/address-mapper.tsx")?.productReachable === true,
  cardHazardProduct: row("app/components/card-hazard.tsx")?.productReachable === true,
  shareNotProduct: row("app/components/share.tsx")?.productReachable === false,
  componentsTestLibInternalDemo: row("app/(other)/components-test-lib/page.tsx")?.internalDemoReachable === true,
  componentsTestLibNotProduct: row("app/(other)/components-test-lib/page.tsx")?.productReachable === false,
};

const result = {
  schema: "safehome.design-system-evidence.phase0-reachability.v1",
  entrypointPolicy: "safehome-next16-app-router-phase0.v1",
  typescriptVersion: ts.version,
  counts: {
    sourceFiles: rows.length,
    appEntrypoints: appEntrypoints.length,
    productEntrypoints: productEntrypoints.size,
    internalDemoEntrypoints: internalDemoEntrypoints.size,
    productReachable: rows.filter((r) => r.productReachable).length,
    internalDemoReachable: rows.filter((r) => r.internalDemoReachable).length,
    unresolvedLocalImports: unresolved.length,
  },
  sentinels,
  unresolved,
  entrypoints: {
    product: [...productEntrypoints].map(normalize).sort(),
    internalDemo: [...internalDemoEntrypoints].map(normalize).sort(),
  },
  files: rows,
};

const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "phase0-reachability.json");
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PHASE0_REACHABILITY product=${result.counts.productReachable}/${rows.length} demo=${result.counts.internalDemoReachable}/${rows.length} unresolved=${unresolved.length}`);
for (const [name, pass] of Object.entries(sentinels)) console.log(`SENTINEL ${name}=${pass ? "PASS" : "FAIL"}`);
console.log(`RECEIPT=${out}`);
