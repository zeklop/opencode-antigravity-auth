import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { fixEsmImports } from "./fix-esm-imports.mjs";

const tempDirs = [];

function createTempDist() {
  const dir = mkdtempSync(join(tmpdir(), "fix-esm-imports-"));
  tempDirs.push(dir);
  mkdirSync(join(dir, "dist", "nested"), { recursive: true });
  return join(dir, "dist");
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("fixEsmImports", () => {
  it("adds js extensions and index.js for relative runtime imports", () => {
    const distDir = createTempDist();
    writeFileSync(join(distDir, "dep.js"), "export const dep = true;\n");
    writeFileSync(join(distDir, "already.js"), "export const already = true;\n");
    writeFileSync(join(distDir, "file.config.js"), "export const config = true;\n");
    writeFileSync(join(distDir, "nested", "index.js"), "export const nested = true;\n");
    writeFileSync(
      join(distDir, "entry.js"),
      [
        'import { dep } from "./dep";',
        'import "./already.js";',
        'export { nested } from "./nested";',
        'const dynamic = () => import("./file.config");',
        'import fs from "node:fs";',
      ].join("\n"),
    );

    const result = fixEsmImports(distDir);
    const output = readFileSync(join(distDir, "entry.js"), "utf8");

    expect(result).toEqual({
      filesScanned: 5,
      filesChanged: 1,
      specifiersChanged: 3,
    });
    expect(output).toContain('from "./dep.js"');
    expect(output).toContain('import "./already.js"');
    expect(output).toContain('from "./nested/index.js"');
    expect(output).toContain('import("./file.config.js")');
    expect(output).toContain('from "node:fs"');
  });

  it("prefers emitted js files over same-named directories", () => {
    const distDir = createTempDist();
    mkdirSync(join(distDir, "cache"), { recursive: true });
    writeFileSync(join(distDir, "cache.js"), "export const file = true;\n");
    writeFileSync(join(distDir, "cache", "index.js"), "export const directory = true;\n");
    writeFileSync(join(distDir, "entry.js"), 'import { file } from "./cache";\n');

    const result = fixEsmImports(distDir);
    const output = readFileSync(join(distDir, "entry.js"), "utf8");

    expect(result.specifiersChanged).toBe(1);
    expect(output).toContain('from "./cache.js"');
  });

  it("updates declaration imports to match emitted runtime files", () => {
    const distDir = createTempDist();
    writeFileSync(join(distDir, "types.js"), "export {};\n");
    writeFileSync(join(distDir, "types.d.ts"), "export interface Value {}\n");
    writeFileSync(
      join(distDir, "entry.d.ts"),
      [
        'export type { Value } from "./types";',
        'export interface Wrapped { value: import("./types").Value }',
      ].join("\n"),
    );

    const result = fixEsmImports(distDir);
    const output = readFileSync(join(distDir, "entry.d.ts"), "utf8");

    expect(result.specifiersChanged).toBe(2);
    expect(output).toContain('export type { Value } from "./types.js";');
    expect(output).toContain('value: import("./types.js").Value');
  });

  it("ignores import-looking examples inside comments", () => {
    const distDir = createTempDist();
    writeFileSync(join(distDir, "entry.js"), [
      "/**",
      ' * import { value } from "./missing";',
      " */",
      "export const value = true;",
    ].join("\n"));

    const result = fixEsmImports(distDir);
    const output = readFileSync(join(distDir, "entry.js"), "utf8");

    expect(result.specifiersChanged).toBe(0);
    expect(output).toContain('import { value } from "./missing";');
  });

  it("throws when an extensionless relative import cannot be resolved", () => {
    const distDir = createTempDist();
    writeFileSync(join(distDir, "entry.js"), 'import { missing } from "./missing";\n');

    expect(() => fixEsmImports(distDir)).toThrow(
      /Could not resolve relative ESM imports/,
    );
  });
});
