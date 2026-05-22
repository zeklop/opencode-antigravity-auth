import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflows = {
  ci: readWorkflow("ci.yml"),
  release: readWorkflow("release.yml"),
  releaseBeta: readWorkflow("release-beta.yml"),
  republishVersion: readWorkflow("republish-version.yml"),
  updateDistTag: readWorkflow("update-dist-tag.yml"),
};

function readWorkflow(name) {
  return readFileSync(new URL(`../.github/workflows/${name}`, import.meta.url), "utf8");
}

describe("GitHub workflows", () => {
  it("uses node24 GitHub action versions", () => {
    for (const workflow of Object.values(workflows)) {
      expect(workflow).not.toContain("actions/checkout@v4");
      expect(workflow).not.toContain("actions/setup-node@v4");
    }
  });

  it("creates releases without deprecated create-release action", () => {
    for (const workflow of [
      workflows.release,
      workflows.releaseBeta,
      workflows.republishVersion,
    ]) {
      expect(workflow).not.toContain("actions/create-release@v1");
      expect(workflow).toContain("gh release create");
    }
  });
});
