import type { AccountQuotaResult, QuotaGroup, QuotaGroupSummary } from "./quota";
import type { AccountMetadataV3, AccountStorageV4 } from "./storage";

const QUOTA_LABELS: Array<[QuotaGroup, string]> = [
  ["gemini-flash", "gemini-flash"],
  ["gemini-pro", "gemini-pro"],
  ["claude", "claude"],
];

type Status = "healthy" | "warning" | "critical" | "unknown";

function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) {
    return email || "unknown";
  }

  const [local, domain] = email.split("@");
  return `${local?.slice(0, 1) || "*"}***@${domain}`;
}

function clampFraction(value?: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.min(1, value));
}

function formatPercent(value?: number): string {
  const fraction = clampFraction(value);
  return fraction === undefined ? "???" : `${Math.round(fraction * 100)}%`;
}

function formatBar(value?: number, width = 20): string {
  const fraction = clampFraction(value);
  if (fraction === undefined) {
    return `${"░".repeat(width)} ???`;
  }

  const filled = Math.round(fraction * width);
  return `${"█".repeat(filled)}${"░".repeat(width - filled)} ${formatPercent(fraction)}`;
}

function formatDate(timestamp: number | string | undefined): string {
  const value = typeof timestamp === "string" ? Date.parse(timestamp) : timestamp;
  if (!value || !Number.isFinite(value)) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: "Europe/Moscow",
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (!days && minutes) parts.push(`${minutes}m`);

  return parts.join(" ") || `${totalMinutes}m`;
}

function formatReset(resetTime: string | undefined, now: number): string {
  if (!resetTime) {
    return "";
  }

  const timestamp = Date.parse(resetTime);
  if (!Number.isFinite(timestamp)) {
    return "";
  }

  const remaining = timestamp - now;
  const duration = remaining > 0 ? ` (${formatDuration(remaining)})` : "";
  return ` reset: ${formatDate(timestamp)}${duration}`;
}

function getStatus(value?: number): Status {
  const fraction = clampFraction(value);
  if (fraction === undefined) {
    return "unknown";
  }
  if (fraction <= 0.1) {
    return "critical";
  }
  if (fraction <= 0.3) {
    return "warning";
  }
  return "healthy";
}

function getStatusMarker(status: Status): string {
  if (status === "healthy") return "🟢";
  if (status === "warning") return "🟡";
  if (status === "critical") return "🔴";
  return "⚪";
}

function formatQuotaLine(label: string, quota: QuotaGroupSummary, now: number): string[] {
  return [
    `  ${getStatusMarker(getStatus(quota.remainingFraction))} ${label.padEnd(15)}: ${formatBar(quota.remainingFraction)} (${quota.modelCount} models)`,
    quota.resetTime ? `      Reset: ${formatDate(quota.resetTime)}` : "",
  ].filter(Boolean);
}

function formatCachedQuota(account: AccountMetadataV3, now: number): string[] {
  const lines = ["🎯 Antigravity Plugin Cache:"];
  if (!account.cachedQuota || Object.keys(account.cachedQuota).length === 0) {
    return [...lines, "  unavailable"];
  }

  // Find active rate limits that apply to our quota groups
  const activeLimits = getActiveRateLimits(account, now);

  for (const [group, label] of QUOTA_LABELS) {
    const cached = account.cachedQuota[group];
    if (cached) {
      // Create a copy of the quota metadata to apply dynamic overrides
      const quota = { ...cached };
      
      // Determine if there are active rate limits that map to this group.
      // Rules:
      // - "claude" maps to any rate limit key containing "claude"
      // - "gemini-flash" maps to rate limits containing "gemini-3.5-flash", "gemini-3-flash", "gemini-3.1-flash"
      // - "gemini-pro" maps to rate limits containing "gemini-3.1-pro", "gemini-3-pro", "gemini-3.5-pro"
      let maxResetTime = 0;
      let hasLimit = false;

      for (const [key, resetTime] of activeLimits) {
        const lowerKey = key.toLowerCase();
        if (group === "claude" && lowerKey.includes("claude")) {
          hasLimit = true;
          maxResetTime = Math.max(maxResetTime, resetTime);
        } else if (group === "gemini-flash" && (lowerKey.includes("flash") || lowerKey.includes("flash-lite"))) {
          hasLimit = true;
          maxResetTime = Math.max(maxResetTime, resetTime);
        } else if (group === "gemini-pro" && lowerKey.includes("pro")) {
          hasLimit = true;
          maxResetTime = Math.max(maxResetTime, resetTime);
        }
      }

      if (hasLimit) {
        quota.remainingFraction = 0;
        quota.resetTime = new Date(maxResetTime).toISOString();
      }

      lines.push(...formatQuotaLine(label, quota, now));
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

function getActiveRateLimits(account: AccountMetadataV3, now: number): Array<[string, number]> {
  const active: Array<[string, number]> = [];
  for (const [key, resetTime] of Object.entries(account.rateLimitResetTimes ?? {})) {
    if (typeof resetTime === "number" && resetTime > now) {
      active.push([key, resetTime]);
    }
  }

  return active.sort(([, left], [, right]) => left - right);
}

function formatActiveRateLimits(account: AccountMetadataV3, now: number): string[] {
  const active = getActiveRateLimits(account, now);
  const lines = ["⚡ Active Rate Limits:"];
  if (active.length === 0) {
    return [...lines, "  none active"];
  }

  const names = active.map(([key]) => formatRateLimitName(key));
  const width = Math.max(...names.map((name) => name.length), 1);
  for (const [[, resetTime], name] of active.map((rate, index) => [rate, names[index]!] as const)) {
    lines.push(
      `  🟡 ${name.padEnd(width)} : ${formatDuration(resetTime - now)}, reset: ${formatDate(resetTime)}`,
    );
  }

  return lines;
}

function formatGeminiCliQuota(result: AccountQuotaResult | undefined, now: number): string[] {
  const quota = result?.geminiCliQuota;
  const lines = ["", "📊 Gemini CLI:"];
  if (result?.status === "error") {
    return [...lines, `    error: ${result.error}`];
  }
  if (!quota || quota.models.length === 0) {
    return [...lines, `    ${quota?.error || "unavailable"}`];
  }

  const width = Math.max(...quota.models.map((model) => model.modelId.length), 1);
  for (const model of quota.models) {
    lines.push(
      `    ${model.modelId.padEnd(width)} ${formatBar(model.remainingFraction)}${formatReset(model.resetTime, now)}`,
    );
  }

  return lines;
}

function getOverallStatus(account: AccountMetadataV3, now: number): Status {
  if (getActiveRateLimits(account, now).length > 0) {
    return "warning";
  }

  const quotas = Object.values(account.cachedQuota ?? {});
  if (quotas.length === 0) {
    return "unknown";
  }

  if (quotas.some((quota) => getStatus(quota.remainingFraction) === "critical")) {
    return "critical";
  }
  if (quotas.some((quota) => getStatus(quota.remainingFraction) === "warning")) {
    return "warning";
  }

  return "healthy";
}

export function renderQuotaReport(
  storage: AccountStorageV4,
  results: AccountQuotaResult[],
  now = Date.now(),
): string {
  const lines = [
    `Unified Quota Status (${formatDate(now)} MSK)`,
    "=".repeat(60),
  ];

  for (const [index, account] of storage.accounts.entries()) {
    const result = results.find((item) => item.index === index);
    const overallStatus = getOverallStatus(account, now);

    lines.push("");
    lines.push(`Account ${index + 1}: ${maskEmail(account.email)}${account.enabled === false ? " (disabled)" : ""}`);
    lines.push(...formatCachedQuota(account, now));
    lines.push(...formatActiveRateLimits(account, now));
    lines.push(...formatGeminiCliQuota(result, now));
    lines.push("");
    lines.push(`${getStatusMarker(overallStatus)} Overall Status: ${overallStatus.toUpperCase()}`);
  }

  lines.push("");
  lines.push("💡 Pro Tips:");
  lines.push("• Antigravity (🎯) shows quota data cached by opencode-antigravity-auth after plugin OAuth");
  lines.push("• Gemini CLI (📊) shows live API quota buckets using the same plugin refresh token");

  return lines.join("\n");
}
