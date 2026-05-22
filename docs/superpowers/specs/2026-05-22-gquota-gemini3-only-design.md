# GQuota Gemini 3 Only Design

## Goal

Make the fork's packaged `gquota` output readable enough to replace the old local quota script, and make the fork reject Gemini 2.x models instead of merely hiding them.

## Current Behavior

The packaged quota CLI currently prints a terse report with ISO timestamps and both cached and live Antigravity quota blocks. In the active account state this is misleading: Antigravity quota endpoints report 100% remaining while stored Antigravity rate-limit entries keep the Gemini Antigravity route unavailable until their reset timestamps.

The plugin defaults to Antigravity-first routing because `cli_first` defaults to false. Gemini CLI becomes available as a fallback when Antigravity is rate-limited for the only usable account or all usable accounts.

The model registry and current OpenCode configuration still expose Gemini 2.5 models.

## Design

### Quota Report

The packaged `opencode-antigravity-quota` command will render a unified report in the style of the previous local script:

- MSK timestamp in the heading.
- Masked account labels.
- `Antigravity Plugin Cache` quota groups with bars, percent, model counts, and reset times.
- `Active Rate Limits` with model keys, time remaining, and reset times.
- `Gemini CLI` live quota buckets with bars and reset times.
- Overall status and short pro tips that explain the data sources.

The report will omit the duplicate `Antigravity live` block. The plugin cache plus active rate-limit block reflects the routing decision more clearly than two separate Antigravity quota percentages.

If an account has active rate-limit entries, overall status is warning even when cached Antigravity percentages are 100%.

### Gemini 3 Only Surface

The fork will expose Gemini 3.x models only:

- Remove Gemini 2.x entries from the enabled model registry and generated OpenCode definitions.
- Exclude Gemini 2.x quota buckets from the packaged quota report.
- Reject manually requested `gemini-2.*` models with a clear fork-specific error instead of routing them.
- Keep unrelated Gemini 2.x implementation helpers if they are unreachable from the supported public surface and removing them would widen the patch without improving behavior.

The local OpenCode model list will be updated after the package change so existing Gemini 2.x entries do not remain selectable.

## Error Handling

Quota report data sources keep their current fail-soft behavior: an unavailable Gemini CLI quota call is shown as unavailable in the report. Unsupported Gemini 2.x model requests fail fast with an explicit error because they are a configuration/request problem, not a quota outage.

## Verification

- Quota report tests assert the unified layout, masked emails, bars, warning status, and absence of the duplicate Antigravity live block.
- Registry/config tests assert enabled model definitions do not expose Gemini 2.x.
- Request/model resolution tests assert manual Gemini 2.x requests are rejected.
- Run project typecheck, test, and build.
- Run packaged `gquota` against the plugin OAuth storage and inspect the rendered output.
- Inspect `opencode debug config` after updating the local model list.
