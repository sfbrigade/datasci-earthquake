import ts from "typescript";

export function emittedRuntimeSpecifiers(sourceText, fileName, compilerOptions) {
  if (/\.d\.[cm]?ts$/i.test(fileName)) return new Set();

  const output = ts.transpileModule(sourceText, {
    fileName,
    reportDiagnostics: false,
    compilerOptions: {
      ...compilerOptions,
      noEmit: false,
      sourceMap: false,
      inlineSourceMap: false,
      inlineSources: false,
      declaration: false,
      declarationMap: false,
      incremental: false,
      tsBuildInfoFile: undefined,
      jsx: ts.JsxEmit.Preserve,
    },
  }).outputText;

  const info = ts.preProcessFile(output, true, true);
  return new Set(info.importedFiles.map((entry) => entry.fileName));
}

export function sourceModuleSpecifiers(sourceFile) {
  const records = [];

  function push(kind, specifier) {
    records.push({kind, specifier});
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      push("static-import", node.moduleSpecifier.text);
      return;
    }
    if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      push("static-import", node.moduleSpecifier.text);
      return;
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      push("dynamic-import", node.arguments[0].text);
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return records;
}

export function classifySourceModuleSpecifiers(sourceText, sourceFile, compilerOptions) {
  const runtime = emittedRuntimeSpecifiers(sourceText, sourceFile.fileName, compilerOptions);
  return sourceModuleSpecifiers(sourceFile).map((record) => ({
    ...record,
    kind:
      record.kind === "dynamic-import" || runtime.has(record.specifier)
        ? record.kind
        : "type-import",
  }));
}
