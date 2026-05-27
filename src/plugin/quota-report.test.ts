import { describe, expect, it } from "vitest";
import { renderQuotaReport } from "./quota-report";
import type { AccountQuotaResult } from "./quota";
import type { AccountStorageV4 } from "./storage";

describe("renderQuotaReport", () => {
  it("shows plugin quota data without exposing the full account email", () => {
    const now = Date.parse("2026-05-21T09:00:00.000Z");
    const storage: AccountStorageV4 = {
      version: 4,
      activeIndex: 0,
      accounts: [
        {
          email: "andre@example.com",
          refreshToken: "refresh-token",
          projectId: "plugin-project",
          addedAt: now - 10_000,
          lastUsed: now - 5_000,
          cachedQuotaUpdatedAt: now - 60_000,
          cachedQuota: {
            "gemini-flash": {
              remainingFraction: 0.5,
              resetTime: "2026-05-22T09:00:00.000Z",
              modelCount: 2,
            },
          },
          rateLimitResetTimes: {
            "gemini-antigravity:antigravity-gemini-3-flash": now + 3_600_000,
            "gemini-cli:gemini-3.5-flash": now - 1,
          },
        },
      ],
    };
    const results: AccountQuotaResult[] = [
      {
        index: 0,
        email: "andre@example.com",
        status: "ok",
        quota: {
          modelCount: 3,
          groups: {
            claude: {
              remainingFraction: 0.25,
              resetTime: "2026-05-22T10:00:00.000Z",
              modelCount: 1,
            },
          },
        },
        geminiCliQuota: {
          models: [
            {
              modelId: "gemini-3.5-flash",
              remainingFraction: 0.75,
              resetTime: "2026-05-21T10:00:00.000Z",
            },
          ],
        },
      },
    ];

    const output = renderQuotaReport(storage, results, now);

    expect(output).toContain("Unified Quota Status (");
    expect(output).toContain("MSK)");
    expect(output).toContain("Account 1: a***@example.com");
    expect(output).not.toContain("andre@example.com");
    expect(output).toContain("Antigravity Plugin Cache");
    // Since rateLimitResetTimes has "gemini-antigravity:antigravity-gemini-3-flash" active (reset now + 1h),
    // the cached quota "gemini-flash" (which maps to gemini-flash models) should be overridden to 0%
    expect(output).toContain("░░░░░░░░░░░░░░░░░░░░ 0%");
    expect(output).toContain("Reset: 21.05.2026, 13:00:00");
    expect(output).toContain("Active Rate Limits");
    expect(output).toContain("Gemini CLI");
    expect(output).toContain("gemini-3.5-flash");
    expect(output).toContain("Overall Status: WARNING");
    expect(output).toContain("Pro Tips");
    expect(output).toContain("gemini-antigravity/antigravity-gemini-3-flash");
    expect(output).not.toContain("gemini-cli/gemini-3.5-flash");
    expect(output).not.toContain("Antigravity live");
  });
});
