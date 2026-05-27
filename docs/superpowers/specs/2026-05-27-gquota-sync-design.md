# Design Spec: Sync Active Rate Limits & Broaden Quota Surface in `/gquota`

## Goal
Make the `/gquota` (`gquota` CLI) command reflect the true resource state by linking active rate limit blocks to the cached quota fractions and expanding the Gemini CLI model report to include relevant shared-quota legacy models.

## Proposed Changes

### 1. `src/plugin/quota.ts`

- In `aggregateGeminiCliQuota`, modify the relevance check to include `gemini-2.5` as well as `gemini-3` and newer. Google maps quotas of legacy models to newer versions, so showing them exposes the actual limits.
- Expose a way to overlay active rate limits onto the reported quota object in `quota-cli.ts` or during report rendering.

### 2. `src/plugin/quota-report.ts`

- In `renderQuotaReport` (or `formatCachedQuota`), cross-reference the account's `cachedQuota` with `rateLimitResetTimes`.
- If there's an active rate limit for a group (e.g., `claude` or `gemini-flash` / `gemini-pro`), force `remainingFraction = 0` and update `resetTime` to the rate limit's expiration timestamp.

## Verification Plan

### Automated Tests
- Run `npm test` to verify existing tests pass.
- Add test coverage in `src/plugin/quota.test.ts` (if it exists or create it) to check override logic.

### Manual Verification
- Execute `npx tsx src/quota-cli.ts` locally to verify the visual report layout.
