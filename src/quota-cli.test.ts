import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { isQuotaCliEntry, runQuotaCli } from "./quota-cli";
import type { AccountQuotaResult } from "./plugin/quota";
import type { AccountStorageV4 } from "./plugin/storage";

describe("runQuotaCli", () => {
  it("prints quota data from plugin accounts", async () => {
    const now = Date.parse("2026-05-21T09:00:00.000Z");
    const storage: AccountStorageV4 = {
      version: 4,
      activeIndex: 0,
      accounts: [
        {
          email: "andre@example.com",
          refreshToken: "refresh-token",
          addedAt: now,
          lastUsed: now,
        },
      ],
    };
    const results: AccountQuotaResult[] = [
      {
        index: 0,
        status: "ok",
        quota: {
          groups: {},
          modelCount: 0,
        },
        geminiCliQuota: {
          models: [
            {
              modelId: "gemini-3.5-flash",
              remainingFraction: 0.5,
            },
          ],
        },
      },
    ];
    const output: string[] = [];

    const exitCode = await runQuotaCli({
      now: () => now,
      loadAccounts: async () => storage,
      checkQuota: async (accounts) => {
        expect(accounts).toBe(storage.accounts);
        return results;
      },
      write: (message) => output.push(message),
      writeError: () => {
        throw new Error("unexpected error output");
      },
    });

    expect(exitCode).toBe(0);
    expect(output.join("")).toContain("Account 1: a***@example.com");
    expect(output.join("")).toContain("gemini-3.5-flash");
  });
});

describe("isQuotaCliEntry", () => {
  it("recognizes the gquota npm bin symlink as the quota CLI entrypoint", () => {
    const directory = mkdtempSync(join(tmpdir(), "quota-cli-entry-"));
    const target = join(directory, "quota-cli.js");
    const entry = join(directory, "gquota");

    try {
      writeFileSync(target, "");
      symlinkSync(target, entry);

      expect(isQuotaCliEntry(entry, pathToFileURL(target).href)).toBe(true);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});
