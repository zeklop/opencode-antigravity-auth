# gquota Inconsistency and Model Scope Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct `/gquota` representation by reflecting active rate limits as depleted cached quotas (0%) and expanding Gemini CLI quota reporting to include shared legacy models (gemini-2.5).

**Architecture:** 
1. Expand regex filtering in `aggregateGeminiCliQuota` to match `gemini-2.5` as well as `gemini-3`.
2. Modify `formatCachedQuota` in `src/plugin/quota-report.ts` to overlay `account.rateLimitResetTimes` onto the cached values dynamically. If a family has an active rate limit, show remainingFraction as `0` and use the rate limit reset timestamp.

**Tech Stack:** TypeScript, Vitest

---

### Task 1: Broaden Gemini CLI Quota to include 2.5 Models

**Files:**
- Modify: `src/plugin/quota.ts:265-272`
- Test: `src/plugin/quota.test.ts` (we will check if tests exist or add test cases)

- [ ] **Step 1: Write test case for Gemini CLI quota aggregation including 2.5**
  We will add/modify tests to verify that `gemini-2.5-pro` is parsed and not filtered out.
  
- [ ] **Step 2: Modify the relevance check in `aggregateGeminiCliQuota`**
  ```typescript
  // Change:
  // const isRelevantModel = modelId.startsWith("gemini-3");
  // To:
  const isRelevantModel = modelId.startsWith("gemini-3") || modelId.startsWith("gemini-2.5");
  ```

- [ ] **Step 3: Run vitest to verify it passes**
  Run: `npx vitest run src/plugin/quota.test.ts` (if test file exists) or run general tests.

- [ ] **Step 4: Commit**
  ```bash
  git add src/plugin/quota.ts
  git commit -m "feat: include gemini-2.5 models in Gemini CLI quota report"
  ```

---

### Task 2: Inject Active Rate Limits into Cached Quota Display

**Files:**
- Modify: `src/plugin/quota-report.ts:114-128`
- Test: `src/plugin/quota-report.test.ts`

- [ ] **Step 1: Write a test verifying cached quota gets overridden by active rate limits**
  We want to ensure that if `account.rateLimitResetTimes` contains an active timestamp for a model/family, the cached fraction is set to 0.

- [ ] **Step 2: Update `formatCachedQuota` in `src/plugin/quota-report.ts`**
  ```typescript
  // Inside formatCachedQuota:
  // For each QUOTA_LABEL (gemini-flash, gemini-pro, claude):
  // We need to resolve which keys map to this label.
  // Then check account.rateLimitResetTimes for any active reset time.
  // If active, override remainingFraction = 0 and resetTime = activeResetTime.
  ```

- [ ] **Step 3: Run Vitest to check output**
  Run: `npm test`

- [ ] **Step 4: Commit**
  ```bash
  git add src/plugin/quota-report.ts
  git commit -m "feat: override cached quota display with active rate limits"
  ```
