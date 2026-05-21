import type { AccountQuotaResult, QuotaGroup, QuotaGroupSummary } from "./quota";
import type { AccountMetadataV3, AccountStorageV4 } from "./storage";

const QUOTA_LABELS: Array<[QuotaGroup, string]> = [
  ["claude", "Claude"],
  ["gemini-pro", "Gemini 3 Pro"],
  ["gemini-flash", "Gemini 3 Flash"],
];

function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) {
    return email || "unknown";
  }

  const [local, domain] = email.split("@");
  return `${local?.slice(0, 1) || "*"}***@${domain}`;
}

function formatPercent(value?: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "unknown";
  }

  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function formatAge(timestamp: number | undefined, now: number): string {
  if (!timestamp || !Number.isFinite(timestamp)) {
    return "unknown";
  }

  const elapsed = Math.max(0, now - timestamp);
  if (elapsed < 60_000) {
    return "just now";
  }

  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

function formatReset(resetTime?: string): string {
  if (!resetTime) {
    return "";
  }

  const timestamp = Date.parse(resetTime);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  return `; reset ${new Date(timestamp).toISOString()}`;
}

function formatQuotaLine(label: string, quota: QuotaGroupSummary): string {
  return `  ${label}: ${formatPercent(quota.remainingFraction)} remaining${formatReset(quota.resetTime)} (${quota.modelCount} models)`;
}

function formatCachedQuota(account: AccountMetadataV3, now: number): string[] {
  if (!account.cachedQuota || Object.keys(account.cachedQuota).length === 0) {
    return ["Cached Antigravity quota: unavailable"];
  }

  const lines = [
    `Cached Antigravity quota: updated ${formatAge(account.cachedQuotaUpdatedAt, now)}`,
  ];
  for (const [group, label] of QUOTA_LABELS) {
    const quota = account.cachedQuota[group];
    if (quota) {
      lines.push(formatQuotaLine(label, quota));
    }
  }

  return lines;
}

function formatRateLimitName(key: string): string {
  const separator = key.indexOf(":");
  if (separator === -1) {
    return key;
  }

  return `${key.slice(0, separator)}/${key.slice(separator + 1)}`;
}

function formatActiveRateLimits(account: AccountMetadataV3, now: number): string[] {
  const active = Object.entries(account.rateLimitResetTimes ?? {})
    .filter(([, resetTime]) => typeof resetTime === "number" && resetTime > now)
    .sort(([, left], [, right]) => (left ?? 0) - (right ?? 0));

  if (active.length === 0) {
    return ["Active rate limits: none"];
  }

  return [
    "Active rate limits:",
    ...active.map(([key, resetTime]) =>
      `  ${formatRateLimitName(key)}: reset ${new Date(resetTime as number).toISOString()}`),
  ];
}

function formatGeminiCliQuota(result: AccountQuotaResult | undefined): string[] {
  const quota = result?.geminiCliQuota;
  if (result?.status === "error") {
    return ["Gemini CLI live:", `  error: ${result.error}`];
  }
  if (!quota || quota.models.length === 0) {
    return ["Gemini CLI live:", `  ${quota?.error || "unavailable"}`];
  }

  return [
    "Gemini CLI live:",
    ...quota.models.map((model) =>
      `  ${model.modelId}: ${formatPercent(model.remainingFraction)} remaining${formatReset(model.resetTime)}`),
  ];
}

function formatAntigravityQuota(result: AccountQuotaResult | undefined): string[] {
  const quota = result?.quota;
  if (result?.status === "error") {
    return ["Antigravity live:", `  error: ${result.error}`];
  }
  if (!quota || Object.keys(quota.groups).length === 0) {
    return ["Antigravity live:", `  ${quota?.error || "unavailable"}`];
  }

  const lines = ["Antigravity live:"];
  for (const [group, label] of QUOTA_LABELS) {
    const groupQuota = quota.groups[group];
    if (groupQuota) {
      lines.push(formatQuotaLine(label, groupQuota));
    }
  }

  return lines;
}

export function renderQuotaReport(
  storage: AccountStorageV4,
  results: AccountQuotaResult[],
  now = Date.now(),
): string {
  const lines = [
    `Antigravity quota report (${new Date(now).toISOString()})`,
    "=".repeat(60),
  ];

  for (const [index, account] of storage.accounts.entries()) {
    const result = results.find((item) => item.index === index);

    lines.push("");
    lines.push(`Account ${index + 1}: ${maskEmail(account.email)}${account.enabled === false ? " (disabled)" : ""}`);
    if (account.managedProjectId || account.projectId) {
      lines.push(`Project: ${account.managedProjectId || account.projectId}`);
    }
    lines.push(...formatCachedQuota(account, now));
    lines.push(...formatActiveRateLimits(account, now));
    lines.push(...formatGeminiCliQuota(result));
    lines.push(...formatAntigravityQuota(result));
  }

  return lines.join("\n");
}
