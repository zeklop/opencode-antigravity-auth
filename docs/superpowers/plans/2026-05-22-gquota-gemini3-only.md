# GQuota Gemini 3 Only Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the packaged quota CLI output with the approved unified report and reject Gemini 2.x models across the fork's supported surface.

**Architecture:** Keep quota fetching in `src/plugin/quota.ts` and change only presentation in `src/plugin/quota-report.ts`. Use the existing model registry as the source for exposed OpenCode models, and reject unsupported manual Gemini 2.x requests at model resolution before request routing can fall into legacy paths.

**Tech Stack:** TypeScript, Vitest, Node.js CLI rendering, OpenCode JSON config

---

## File Structure

- `src/plugin/quota-report.ts`: render the unified `gquota` report from storage and live quota results.
- `src/plugin/quota-report.test.ts`: lock the new report layout and warning behavior.
- `src/plugin/quota.ts`: exclude Gemini 2.x quota buckets from packaged CLI live data.
- `src/plugin/models/registry.ts`: stop exposing enabled Gemini 2.x model entries.
- `src/plugin/config/models.test.ts`: assert OpenCode generated models stay Gemini 3 only.
- `src/plugin/transform/model-resolver.ts`: reject manual Gemini 2.x requests before routing.
- `src/plugin/transform/model-resolver.test.ts`: assert manual Gemini 2.x requests fail clearly.
- `README.md`: remove Gemini 2.x models from the documented supported model surface where the fork advertises available models.
- `~/.config/opencode/opencode.json`: remove stale local Gemini 2.x selectable entries after package behavior changes.

### Task 1: Unified quota report

**Files:**
- Modify: `src/plugin/quota-report.test.ts`
- Modify: `src/plugin/quota-report.ts`

- [ ] **Step 1: Write the failing report test**

Update the existing report fixture so the assertions require:

```ts
expect(output).toContain("Unified Quota Status (");
expect(output).toContain("MSK)");
expect(output).toContain("Antigravity Plugin Cache");
expect(output).toContain("██████████░░░░░░░░░░ 50%");
expect(output).toContain("Active Rate Limits");
expect(output).toContain("Gemini CLI");
expect(output).toContain("Overall Status: WARNING");
expect(output).not.toContain("Antigravity live");
```

- [ ] **Step 2: Run the focused report test**

Run:

```bash
npx vitest run src/plugin/quota-report.test.ts
```

Expected: FAIL because the current report uses the old terse headings and still prints `Antigravity live`.

- [ ] **Step 3: Implement the minimal report renderer**

Add report helpers for MSK date formatting, quota bars, status markers, reset timestamps, reset durations, and overall status. Preserve masked emails and the existing storage/result inputs. Render cache, rate limits, and Gemini CLI sections only; do not render the live Antigravity block.

- [ ] **Step 4: Re-run the focused report test**

Run:

```bash
npx vitest run src/plugin/quota-report.test.ts
```

Expected: PASS.

### Task 2: Gemini 3 only exposed surface

**Files:**
- Modify: `src/plugin/config/models.test.ts`
- Modify: `src/plugin/models/registry.ts`
- Modify: `src/plugin/quota.ts`

- [ ] **Step 1: Write the failing model exposure test**

Extend `src/plugin/config/models.test.ts` with:

```ts
expect(Object.keys(OPENCODE_MODEL_DEFINITIONS)).not.toEqual(
  expect.arrayContaining([expect.stringMatching(/^gemini-2\./)]),
);
```

- [ ] **Step 2: Run the focused model definition test**

Run:

```bash
npx vitest run src/plugin/config/models.test.ts
```

Expected: FAIL while enabled registry entries still include Gemini 2.x.

- [ ] **Step 3: Remove exposed Gemini 2.x entries**

Delete enabled Gemini 2.x registry entries and tighten `aggregateGeminiCliQuota` so it only keeps `modelId.startsWith("gemini-3")`.

- [ ] **Step 4: Re-run focused model and quota tests**

Run:

```bash
npx vitest run src/plugin/config/models.test.ts src/plugin/quota.test.ts
```

Expected: PASS.

### Task 3: Reject manual Gemini 2.x requests

**Files:**
- Modify: `src/plugin/transform/model-resolver.test.ts`
- Modify: `src/plugin/transform/model-resolver.ts`

- [ ] **Step 1: Write the failing resolver test**

Add:

```ts
expect(() => resolveModelWithTier("gemini-2.5-pro")).toThrow(
  "Gemini 2.x models are not supported by this fork; use Gemini 3.x",
);
```

- [ ] **Step 2: Run the focused resolver test**

Run:

```bash
npx vitest run src/plugin/transform/model-resolver.test.ts
```

Expected: FAIL because the resolver still accepts Gemini 2.5.

- [ ] **Step 3: Add the guard**

Fail fast in `resolveModelWithTier` when the requested model after quota-prefix handling starts with `gemini-2.`. Keep existing Gemini 2.x helper code untouched unless the focused tests prove it still affects the supported path.

- [ ] **Step 4: Re-run focused routing tests**

Run:

```bash
npx vitest run src/plugin/transform/model-resolver.test.ts src/plugin/quota-fallback.test.ts
```

Expected: PASS.

### Task 4: Documentation and local config

**Files:**
- Modify: `README.md`
- Modify: `~/.config/opencode/opencode.json`

- [ ] **Step 1: Update supported model docs**

Remove Gemini 2.x rows and config entries from the supported Gemini CLI model blocks in `README.md`. Keep explanations of Antigravity-first and Gemini CLI fallback.

- [ ] **Step 2: Update the local OpenCode model list**

Remove stale `gemini-2.*` entries from `provider.google.models` in `~/.config/opencode/opencode.json` or regenerate models from the updated plugin definitions if that keeps the local config narrower.

- [ ] **Step 3: Verify the local config**

Run:

```bash
jq empty ~/.config/opencode/opencode.json
opencode debug config | jq '.provider.google.models | keys'
```

Expected: JSON is valid and no selected Google model key starts with `gemini-2.`.

### Task 5: Full verification

**Files:**
- Verify changed project files and local OpenCode config

- [ ] **Step 1: Run project checks**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect real packaged quota rendering from the working tree**

Run:

```bash
node dist/src/quota-cli.js
```

Expected: unified MSK report, no duplicate `Antigravity live` section, rate limits visible, no Gemini 2.x quota rows.

- [ ] **Step 3: Review git state and commit**

Run:

```bash
git diff --check
git status --short
```

Expected: only scoped implementation, docs, and plan changes in the repository. Commit the implementation after the checks are green.
