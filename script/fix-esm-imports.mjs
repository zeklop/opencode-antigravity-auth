import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

function splitSuffix(specifier) {
  const match = specifier.match(/^([^?#]*)([?#].*)?$/);
  return {
    path: match?.[1] ?? specifier,
    suffix: match?.[2] ?? "",
  };
}

function resolveRelativeSpecifier(filePath, specifier) {
  const { path: specifierPath, suffix } = splitSuffix(specifier);
  const absolutePath = join(dirname(filePath), specifierPath);

  if (existsSync(absolutePath)) {
    const stat = statSync(absolutePath);
    if (stat.isFile()) {
      return specifier;
    }
  }

  if (existsSync(`${absolutePath}.js`)) {
    return `${specifierPath}.js${suffix}`;
  }

  if (existsSync(absolutePath) && statSync(absolutePath).isDirectory()) {
    const indexPath = join(absolutePath, "index.js");
    if (existsSync(indexPath)) {
      return `${specifierPath}/index.js${suffix}`;
    }
  }

  const indexPath = join(absolutePath, "index.js");
  if (existsSync(indexPath)) {
    return `${specifierPath}/index.js${suffix}`;
  }

  return undefined;
}

function getScriptKind(filePath) {
  return filePath.endsWith(".d.ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS;
}

function collectModuleSpecifierRewrites(filePath, source, unresolved) {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath),
  );
  const rewrites = [];

  function addSpecifier(literal) {
    const specifier = literal.text;
    if (!specifier.startsWith("./") && !specifier.startsWith("../")) {
      return;
    }

    const resolvedSpecifier = resolveRelativeSpecifier(filePath, specifier);
    if (!resolvedSpecifier) {
      unresolved.push({ filePath, specifier });
      return;
    }
    if (resolvedSpecifier === specifier) {
      return;
    }

    rewrites.push({
      start: literal.getStart(sourceFile) + 1,
      end: literal.getEnd() - 1,
      text: resolvedSpecifier,
    });
  }

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      addSpecifier(node.moduleSpecifier);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      addSpecifier(node.arguments[0]);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    ) {
      addSpecifier(node.argument.literal);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return rewrites;
}

function applyRewrites(source, rewrites) {
  let rewritten = source;
  for (const rewrite of [...rewrites].sort((a, b) => b.start - a.start)) {
    rewritten = `${rewritten.slice(0, rewrite.start)}${rewrite.text}${rewritten.slice(rewrite.end)}`;
  }
  return rewritten;
}

function rewriteSpecifiers(filePath, source, unresolved) {
  const rewrites = collectModuleSpecifierRewrites(filePath, source, unresolved);
  return {
    source: applyRewrites(source, rewrites),
    changed: rewrites.length,
  };
}

function walkFiles(dirPath, files = []) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".d.ts"))) {
      files.push(fullPath);
    }
  }
  return files;
}

export function fixEsmImports(rootDir = "dist") {
  if (!existsSync(rootDir)) {
    throw new Error(`Build output directory not found: ${rootDir}`);
  }

  const files = walkFiles(rootDir);
  const unresolved = [];
  let filesChanged = 0;
  let specifiersChanged = 0;

  for (const filePath of files) {
    const source = readFileSync(filePath, "utf8");
    const rewritten = rewriteSpecifiers(filePath, source, unresolved);
    if (rewritten.changed > 0) {
      writeFileSync(filePath, rewritten.source);
      filesChanged += 1;
      specifiersChanged += rewritten.changed;
    }
  }

  if (unresolved.length > 0) {
    const details = unresolved
      .map(({ filePath, specifier }) => `- ${filePath}: ${specifier}`)
      .join("\n");
    throw new Error(`Could not resolve relative ESM imports:\n${details}`);
  }

  return {
    filesScanned: files.length,
    filesChanged,
    specifiersChanged,
  };
}

const currentFilePath = fileURLToPath(import.meta.url);
const entryFilePath = process.argv[1] ? fileURLToPath(pathToFileURL(process.argv[1])) : "";

if (currentFilePath === entryFilePath) {
  const rootDir = process.argv[2] ?? "dist";
  const result = fixEsmImports(rootDir);
  console.log(
    `Fixed ESM imports in ${result.filesChanged}/${result.filesScanned} files (${result.specifiersChanged} specifiers).`,
  );
}
