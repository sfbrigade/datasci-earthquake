import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const configPath = path.join(root, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
const program = ts.createProgram({rootNames: parsed.fileNames, options: parsed.options});
const checker = program.getTypeChecker();

function inspectProperty(fileName, propertyName) {
  const sf = program.getSourceFile(path.join(root, fileName)) ?? program.getSourceFiles().find((f) => path.relative(root, f.fileName).split(path.sep).join("/") === fileName);
  if (!sf) throw new Error(`source file not found: ${fileName}`);
  const rows = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && ((ts.isIdentifier(node.name) && node.name.text === propertyName) || (ts.isStringLiteral(node.name) && node.name.text === propertyName))) {
      const init = node.initializer;
      if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) {
        const contextual = checker.getContextualType(init);
        const actual = checker.getTypeAtLocation(init);
        rows.push({
          value: init.text,
          line: sf.getLineAndCharacterOfPosition(init.getStart(sf)).line + 1,
          contextualType: contextual ? checker.typeToString(contextual, init, ts.TypeFormatFlags.NoTruncation) : null,
          actualType: checker.typeToString(actual, init, ts.TypeFormatFlags.NoTruncation),
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return rows;
}

const dataIconColors = inspectProperty("app/data/data.ts", "iconColor");
const emergencyIconColors = inspectProperty("app/components/emergency-kit-steps.tsx", "iconColor");
const emergencyIconBackgrounds = inspectProperty("app/components/emergency-kit-steps.tsx", "iconBackground");

const expectedDataValues = ["grey.400", "orange", "tsunamiBlue"];
const sentinels = {
  dataIconColorsFound: expectedDataValues.every((value) => dataIconColors.some((row) => row.value === value)),
  dataIconColorsContextual: dataIconColors.filter((row) => expectedDataValues.includes(row.value)).every((row) => row.contextualType && row.contextualType !== "string" && row.contextualType !== "any" && row.contextualType !== "unknown"),
  emergencyIconColorsContextual: emergencyIconColors.length > 0 && emergencyIconColors.every((row) => row.contextualType && row.contextualType !== "string" && row.contextualType !== "any" && row.contextualType !== "unknown"),
  emergencyBackgroundsContextual: emergencyIconBackgrounds.length > 0 && emergencyIconBackgrounds.every((row) => row.contextualType && row.contextualType !== "string" && row.contextualType !== "any" && row.contextualType !== "unknown"),
};

const result = {
  schema: "safehome.design-system-evidence.phase0-typechecker.v1",
  typescriptVersion: ts.version,
  sentinels,
  samples: {dataIconColors, emergencyIconColors, emergencyIconBackgrounds},
};
const out = process.argv[2] ?? path.join(root, ".tmp", "design-system", "phase0-typechecker.json");
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PHASE0_TYPECHECKER sentinels=${Object.values(sentinels).filter(Boolean).length}/${Object.keys(sentinels).length} dataIconColors=${dataIconColors.length}`);
for (const [name, pass] of Object.entries(sentinels)) console.log(`SENTINEL ${name}=${pass ? "PASS" : "FAIL"}`);
console.log(`RECEIPT=${out}`);
