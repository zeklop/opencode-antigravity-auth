import type { ProviderModel } from "../types";

export type ModelThinkingLevel = "minimal" | "low" | "medium" | "high";

export interface ModelThinkingConfig {
  thinkingBudget: number;
}

export interface ModelVariant {
  thinkingLevel?: ModelThinkingLevel;
  thinkingConfig?: ModelThinkingConfig;
}

export interface ModelLimit {
  context: number;
  output: number;
}

export type ModelModality = "text" | "image" | "pdf";

export interface ModelModalities {
  input: ModelModality[];
  output: ModelModality[];
}

export interface OpencodeModelDefinition extends ProviderModel {
  name: string;
  limit: ModelLimit;
  modalities: ModelModalities;
  variants?: Record<string, ModelVariant>;
}

export type OpencodeModelDefinitions = Record<string, OpencodeModelDefinition>;

export interface AntigravityRoute {
  backendModel?: string;
  backendModelsByThinkingLevel?: Partial<Record<ModelThinkingLevel, string>>;
  defaultThinkingLevel?: ModelThinkingLevel;
}

export interface GeminiCliRoute {
  backendModel: string;
}

export interface ModelRegistryEntry extends OpencodeModelDefinition {
  id: string;
  enabled?: boolean;
  antigravity?: AntigravityRoute;
  geminiCli?: GeminiCliRoute;
}

export const DEFAULT_MODALITIES: ModelModalities = {
  input: ["text", "image", "pdf"],
  output: ["text"],
};

export const MODEL_REGISTRY: readonly ModelRegistryEntry[] = [
  {
    id: "antigravity-gemini-3-pro",
    name: "Gemini 3 Pro (Antigravity)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      defaultThinkingLevel: "low",
      backendModelsByThinkingLevel: {
        low: "gemini-3-pro-low",
        high: "gemini-3-pro-high",
      },
    },
  },
  {
    id: "antigravity-gemini-3.1-pro",
    name: "Gemini 3.1 Pro (Antigravity)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      defaultThinkingLevel: "low",
      backendModelsByThinkingLevel: {
        low: "gemini-3.1-pro-low",
        high: "gemini-3.1-pro-high",
      },
    },
  },
  {
    id: "antigravity-gemini-3-flash",
    name: "Gemini 3 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      backendModel: "gemini-3-flash",
      defaultThinkingLevel: "low",
    },
  },
  {
    id: "antigravity-gemini-3.5-flash",
    name: "Gemini 3.5 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      defaultThinkingLevel: "minimal",
      backendModelsByThinkingLevel: {
        minimal: "gemini-3.5-flash-low",
        low: "gemini-3.5-flash-low",
        medium: "gemini-3.5-flash-low",
        high: "gemini-3.5-flash-low",
      },
    },
  },
  {
    id: "antigravity-claude-sonnet-4-6",
    name: "Claude Sonnet 4.6 (Antigravity)",
    limit: { context: 200000, output: 64000 },
    modalities: DEFAULT_MODALITIES,
  },
  {
    id: "antigravity-claude-opus-4-6-thinking",
    name: "Claude Opus 4.6 Thinking (Antigravity)",
    limit: { context: 200000, output: 64000 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingConfig: { thinkingBudget: 8192 } },
      max: { thinkingConfig: { thinkingBudget: 32768 } },
    },
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview (Gemini CLI)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3-flash-preview" },
  },
  {
    id: "gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview (Gemini CLI)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3-pro-preview" },
  },
  {
    id: "gemini-3.1-flash",
    name: "Gemini 3.1 Flash (Gemini CLI)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3.1-flash" },
  },
  {
    id: "gemini-3.1-pro",
    name: "Gemini 3.1 Pro (Gemini CLI)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3.1-pro" },
  },
  {
    id: "gemini-3.1-pro-preview-customtools",
    name: "Gemini 3.1 Pro Preview Custom Tools (Gemini CLI)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3.1-pro-preview-customtools" },
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash (Gemini CLI)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3.5-flash" },
  },
  {
    id: "gemini-3.5-pro",
    name: "Gemini 3.5 Pro (Gemini CLI)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    geminiCli: { backendModel: "gemini-3.5-pro" },
  },
  {
    id: "antigravity-gemini-3.1-flash",
    name: "Gemini 3.1 Flash (Antigravity)",
    limit: { context: 1048576, output: 65536 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      minimal: { thinkingLevel: "minimal" },
      low: { thinkingLevel: "low" },
      medium: { thinkingLevel: "medium" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      backendModel: "gemini-3.1-flash",
      defaultThinkingLevel: "low",
    },
  },
  {
    id: "antigravity-gemini-3.5-pro",
    name: "Gemini 3.5 Pro (Antigravity)",
    limit: { context: 1048576, output: 65535 },
    modalities: DEFAULT_MODALITIES,
    variants: {
      low: { thinkingLevel: "low" },
      high: { thinkingLevel: "high" },
    },
    antigravity: {
      defaultThinkingLevel: "low",
      backendModelsByThinkingLevel: {
        low: "gemini-3.5-pro-low",
        high: "gemini-3.5-pro-high",
      },
    },
  },
] as const;

export function getEnabledModelRegistryEntries(): readonly ModelRegistryEntry[] {
  return MODEL_REGISTRY.filter((entry) => entry.enabled !== false);
}

export function getModelRegistryEntry(id: string): ModelRegistryEntry | undefined {
  const lowerId = id.toLowerCase();
  return MODEL_REGISTRY.find((entry) => entry.enabled !== false && entry.id.toLowerCase() === lowerId);
}

export interface ResolvedAntigravityRoute {
  actualModel: string;
  defaultThinkingLevel?: ModelThinkingLevel;
}

export function resolveAntigravityRegistryRoute(
  modelWithoutQuota: string,
  thinkingLevel?: ModelThinkingLevel,
): ResolvedAntigravityRoute | undefined {
  const entry = getModelRegistryEntry(`antigravity-${modelWithoutQuota}`);
  if (!entry?.antigravity) {
    return undefined;
  }

  const level = thinkingLevel ?? entry.antigravity.defaultThinkingLevel;
  const actualModel =
    (level ? entry.antigravity.backendModelsByThinkingLevel?.[level] : undefined) ??
    entry.antigravity.backendModel;

  if (!actualModel) {
    return undefined;
  }

  return {
    actualModel,
    defaultThinkingLevel: entry.antigravity.defaultThinkingLevel,
  };
}

export function resolveGeminiCliRegistryModel(modelWithoutQuota: string): string | undefined {
  return getModelRegistryEntry(modelWithoutQuota)?.geminiCli?.backendModel;
}
