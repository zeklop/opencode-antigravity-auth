import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
);

describe("fork package manifest", () => {
  it("publishes a scoped package with the quota CLI bin", () => {
    expect(packageJson.name).toBe("@zeklop/opencode-antigravity-auth");
    expect(packageJson.publishConfig).toEqual({ access: "public" });
    expect(packageJson.bin).toEqual({
      "opencode-antigravity-quota": "./dist/src/quota-cli.js",
    });
  });
});
