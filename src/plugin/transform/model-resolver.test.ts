import { describe, it, expect } from "vitest";
import { resolveModelWithTier, resolveModelWithVariant, resolveModelForHeaderStyle } from "./model-resolver";

describe("resolveModelWithTier", () => {
  describe("Gemini 3 flash models (Issue #109)", () => {
    it("antigravity-gemini-3-flash gets default thinkingLevel 'low'", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-flash");
      expect(result.actualModel).toBe("gemini-3-flash");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("gemini-3-flash gets default thinkingLevel 'low'", () => {
      const result = resolveModelWithTier("gemini-3-flash");
      expect(result.actualModel).toBe("gemini-3-flash");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("gemini-3-flash-preview gets default thinkingLevel 'low' with antigravity quota", () => {
      const result = resolveModelWithTier("gemini-3-flash-preview");
      expect(result.actualModel).toBe("gemini-3-flash-preview");
      expect(result.thinkingLevel).toBe("low");
      // All Gemini models now default to antigravity
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("Gemini 3 preview models (Issue #115)", () => {
    it("gemini-3-pro-preview gets default thinkingLevel 'low' with antigravity quota", () => {
      const result = resolveModelWithTier("gemini-3-pro-preview");
      expect(result.actualModel).toBe("gemini-3-pro-preview");
      expect(result.thinkingLevel).toBe("low");
      // All Gemini models now default to antigravity
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("gemini-3.1-pro-preview gets default thinkingLevel 'low' with antigravity quota", () => {
      const result = resolveModelWithTier("gemini-3.1-pro-preview");
      expect(result.actualModel).toBe("gemini-3.1-pro-preview");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("gemini-3.1-flash gets default thinkingLevel 'low' with antigravity quota", () => {
      const result = resolveModelWithTier("gemini-3.1-flash");
      expect(result.actualModel).toBe("gemini-3.1-flash");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("gemini-3.5-pro gets default thinkingLevel 'low' with antigravity quota", () => {
      const result = resolveModelWithTier("gemini-3.5-pro");
      expect(result.actualModel).toBe("gemini-3.5-pro");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("Gemini 2 models", () => {
    it("rejects unsupported Gemini 2.x requests", () => {
      expect(() => resolveModelWithTier("gemini-2.5-pro")).toThrow(
        "Gemini 2.x models are not supported by this fork; use Gemini 3.x",
      );
    });
  });

  describe("cli_first quota preference", () => {
    it("prefers gemini-cli when cli_first is true and no prefix is set", () => {
      const result = resolveModelWithTier("gemini-3-flash", { cli_first: true });
      expect(result.quotaPreference).toBe("gemini-cli");
      expect(result.explicitQuota).toBe(false);
    });

    it("keeps antigravity when antigravity prefix is explicit", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-flash", { cli_first: true });
      expect(result.quotaPreference).toBe("antigravity");
      expect(result.explicitQuota).toBe(true);
    });

    it("keeps antigravity for Claude models when cli_first is true", () => {
      const result = resolveModelWithTier("claude-opus-4-6-thinking", { cli_first: true });
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("keeps antigravity for image models when cli_first is true", () => {
      const result = resolveModelWithTier("gemini-3-pro-image", { cli_first: true });
      expect(result.quotaPreference).toBe("antigravity");
      expect(result.explicitQuota).toBe(true);
    });

    it("defaults to antigravity when cli_first is false", () => {
      const result = resolveModelWithTier("gemini-3-flash", { cli_first: false });
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("Antigravity Gemini 3 with tier suffix", () => {
    it("antigravity-gemini-3-pro-low gets thinkingLevel from tier", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-pro-low");
      expect(result.actualModel).toBe("gemini-3-pro-low");
      expect(result.thinkingLevel).toBe("low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("antigravity-gemini-3-pro-high gets thinkingLevel from tier", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-pro-high");
      expect(result.actualModel).toBe("gemini-3-pro-high");
      expect(result.thinkingLevel).toBe("high");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("antigravity-gemini-3-flash-medium gets thinkingLevel from tier", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-flash-medium");
      expect(result.actualModel).toBe("gemini-3-flash");
      expect(result.thinkingLevel).toBe("medium");
    });

    it("antigravity-gemini-3.1-pro gets default -low model", () => {
      const result = resolveModelWithTier("antigravity-gemini-3.1-pro");
      expect(result.actualModel).toBe("gemini-3.1-pro-low");
      expect(result.thinkingLevel).toBe("low");
    });

    it("antigravity-gemini-3.5-pro gets default -low model", () => {
      const result = resolveModelWithTier("antigravity-gemini-3.5-pro");
      expect(result.actualModel).toBe("gemini-3.5-pro-low");
      expect(result.thinkingLevel).toBe("low");
    });

    it("antigravity-gemini-3.1-flash keeps its bare Antigravity model id", () => {
      const result = resolveModelWithTier("antigravity-gemini-3.1-flash");
      expect(result.actualModel).toBe("gemini-3.1-flash");
      expect(result.thinkingLevel).toBe("low");
    });

    it("antigravity-gemini-3.5-flash gets the deployed backend id and minimal thinking by default", () => {
      const result = resolveModelWithTier("antigravity-gemini-3.5-flash");
      expect(result.actualModel).toBe("gemini-3.5-flash-low");
      expect(result.thinkingLevel).toBe("minimal");
      expect(result.quotaPreference).toBe("antigravity");
      expect(result.explicitQuota).toBe(true);
    });

    it("antigravity-gemini-3.5-flash-high keeps the stable backend id and uses high thinking", () => {
      const result = resolveModelWithTier("antigravity-gemini-3.5-flash-high");
      expect(result.actualModel).toBe("gemini-3.5-flash-low");
      expect(result.thinkingLevel).toBe("high");
      expect(result.tier).toBe("high");
    });
  });

  describe("Claude thinking models default budget", () => {
    it("antigravity-claude-opus-4-6-thinking gets default max budget (32768)", () => {
      const result = resolveModelWithTier("antigravity-claude-opus-4-6-thinking");
      expect(result.actualModel).toBe("claude-opus-4-6-thinking");
      expect(result.thinkingBudget).toBe(32768);
      expect(result.isThinkingModel).toBe(true);
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("Claude Sonnet 4.6 (non-thinking)", () => {
    it("claude-sonnet-4-6 resolves as non-thinking model", () => {
      const result = resolveModelWithTier("claude-sonnet-4-6");
      expect(result.actualModel).toBe("claude-sonnet-4-6");
      expect(result.isThinkingModel).toBe(false);
      expect(result.thinkingBudget).toBeUndefined();
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("antigravity-claude-sonnet-4-6 resolves as non-thinking model with explicit quota", () => {
      const result = resolveModelWithTier("antigravity-claude-sonnet-4-6");
      expect(result.actualModel).toBe("claude-sonnet-4-6");
      expect(result.isThinkingModel).toBe(false);
      expect(result.thinkingBudget).toBeUndefined();
      expect(result.quotaPreference).toBe("antigravity");
      expect(result.explicitQuota).toBe(true);
    });

    it("gemini-claude-sonnet-4-6 alias resolves to claude-sonnet-4-6", () => {
      const result = resolveModelWithTier("gemini-claude-sonnet-4-6");
      expect(result.actualModel).toBe("claude-sonnet-4-6");
      expect(result.isThinkingModel).toBe(false);
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("Image models", () => {
    it("marks antigravity-gemini-3-pro-image as explicit quota", () => {
      const result = resolveModelWithTier("antigravity-gemini-3-pro-image");
      expect(result.actualModel).toBe("gemini-3-pro-image");
      expect(result.isImageModel).toBe(true);
      expect(result.explicitQuota).toBe(true);
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("marks gemini-3-pro-image as explicit quota", () => {
      const result = resolveModelWithTier("gemini-3-pro-image");
      expect(result.actualModel).toBe("gemini-3-pro-image");
      expect(result.isImageModel).toBe(true);
      expect(result.explicitQuota).toBe(true);
      expect(result.quotaPreference).toBe("antigravity");
    });
  });
});

describe("resolveModelWithVariant", () => {
  describe("without variant config", () => {
    it("falls back to tier resolution for Claude thinking models", () => {
      const result = resolveModelWithVariant("claude-opus-4-6-thinking-low");
      expect(result.actualModel).toBe("claude-opus-4-6-thinking");
      expect(result.thinkingBudget).toBe(8192);
      expect(result.configSource).toBeUndefined();
    });

    it("falls back to tier resolution for Gemini 3 models", () => {
      const result = resolveModelWithVariant("gemini-3-pro-high");
      expect(result.actualModel).toBe("gemini-3-pro");
      expect(result.thinkingLevel).toBe("high");
      expect(result.configSource).toBeUndefined();
    });
  });

  describe("with variant config", () => {
    it("overrides tier budget for Claude models", () => {
      const result = resolveModelWithVariant("antigravity-claude-opus-4-6-thinking", {
        thinkingBudget: 24000,
      });
      expect(result.actualModel).toBe("claude-opus-4-6-thinking");
      expect(result.thinkingBudget).toBe(24000);
      expect(result.configSource).toBe("variant");
    });

    it("maps budget to thinkingLevel for Gemini 3 - low", () => {
      const result = resolveModelWithVariant("antigravity-gemini-3-pro", {
        thinkingBudget: 8000,
      });
      expect(result.actualModel).toBe("gemini-3-pro-low");
      expect(result.thinkingLevel).toBe("low");
      expect(result.thinkingBudget).toBeUndefined();
      expect(result.configSource).toBe("variant");
    });

    it("maps budget to thinkingLevel for Gemini 3 Flash - medium (no tier suffix)", () => {
      const result = resolveModelWithVariant("antigravity-gemini-3-flash", {
        thinkingBudget: 12000,
      });
      expect(result.actualModel).toBe("gemini-3-flash");
      expect(result.thinkingLevel).toBe("medium");
      expect(result.configSource).toBe("variant");
    });

    it("maps budget to thinkingLevel for Gemini 3 - high", () => {
      const result = resolveModelWithVariant("antigravity-gemini-3-pro", {
        thinkingBudget: 32000,
      });
      expect(result.thinkingLevel).toBe("high");
      expect(result.configSource).toBe("variant");
    });

    it("rejects Gemini 2.x models before applying variant config", () => {
      expect(() => resolveModelWithVariant("gemini-2.5-pro", {
        thinkingBudget: 20000,
      })).toThrow("Gemini 2.x models are not supported by this fork; use Gemini 3.x");
    });
  });

  describe("backward compatibility", () => {
    it("tier-suffixed models work without variant config", () => {
      const lowResult = resolveModelWithVariant("claude-opus-4-6-thinking-low");
      expect(lowResult.thinkingBudget).toBe(8192);

      const medResult = resolveModelWithVariant("claude-opus-4-6-thinking-medium");
      expect(medResult.thinkingBudget).toBe(16384);

      const highResult = resolveModelWithVariant("claude-opus-4-6-thinking-high");
      expect(highResult.thinkingBudget).toBe(32768);
    });

    it("variant config overrides tier suffix", () => {
      const result = resolveModelWithVariant("claude-opus-4-6-thinking-low", {
        thinkingBudget: 50000,
      });
      expect(result.thinkingBudget).toBe(50000);
      expect(result.configSource).toBe("variant");
    });
  });
});

describe("Issue #103: resolveModelForHeaderStyle", () => {
  describe("quota fallback from gemini-cli to antigravity", () => {
    it("transforms gemini-3-flash-preview to gemini-3-flash for antigravity", () => {
      const result = resolveModelForHeaderStyle("gemini-3-flash-preview", "antigravity");
      expect(result.actualModel).toBe("gemini-3-flash");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("transforms gemini-3-pro-preview to gemini-3-pro-low for antigravity", () => {
      const result = resolveModelForHeaderStyle("gemini-3-pro-preview", "antigravity");
      expect(result.actualModel).toBe("gemini-3-pro-low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("transforms gemini-3.1-pro-preview to gemini-3.1-pro-low for antigravity", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-pro-preview", "antigravity");
      expect(result.actualModel).toBe("gemini-3.1-pro-low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("transforms gemini-3.1-pro-preview-customtools to gemini-3.1-pro-low for antigravity", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-pro-preview-customtools", "antigravity");
      expect(result.actualModel).toBe("gemini-3.1-pro-low");
      expect(result.quotaPreference).toBe("antigravity");
    });

    it("transforms gemini-3.5-flash to deployed Antigravity backend id", () => {
      const result = resolveModelForHeaderStyle("gemini-3.5-flash", "antigravity");
      expect(result.actualModel).toBe("gemini-3.5-flash-low");
      expect(result.thinkingLevel).toBe("minimal");
      expect(result.quotaPreference).toBe("antigravity");
    });
  });

  describe("quota fallback from antigravity to gemini-cli", () => {
    it("transforms gemini-3-flash to gemini-3-flash-preview for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3-flash", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3-flash-preview");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("transforms gemini-3-pro-low to gemini-3-pro-preview for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3-pro-low", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3-pro-preview");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("transforms gemini-3.1-pro-low to bare gemini-3.1-pro for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-pro-low", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.1-pro");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("strips legacy preview suffix from gemini-3.1-pro for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-pro-preview", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.1-pro");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("keeps gemini-3.1-pro-preview-customtools unchanged for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-pro-preview-customtools", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.1-pro-preview-customtools");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("keeps dotted 3.0 models on the legacy preview suffix for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.0-pro-low", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.0-pro-preview");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("transforms gemini-3.5-pro-low to bare gemini-3.5-pro for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.5-pro-low", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.5-pro");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("keeps gemini-3.1-flash bare for gemini-cli", () => {
      const result = resolveModelForHeaderStyle("gemini-3.1-flash", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.1-flash");
      expect(result.quotaPreference).toBe("gemini-cli");
    });

    it("uses bare gemini-3.5-flash for Gemini CLI instead of adding preview", () => {
      const result = resolveModelForHeaderStyle("antigravity-gemini-3.5-flash", "gemini-cli");
      expect(result.actualModel).toBe("gemini-3.5-flash");
      expect(result.quotaPreference).toBe("gemini-cli");
    });
  });

  describe("no transformation needed", () => {
    it("rejects Gemini 2.x for both header styles", () => {
      expect(() => resolveModelForHeaderStyle("gemini-2.5-flash", "antigravity"))
        .toThrow("Gemini 2.x models are not supported by this fork; use Gemini 3.x");
      expect(() => resolveModelForHeaderStyle("gemini-2.5-flash", "gemini-cli"))
        .toThrow("Gemini 2.x models are not supported by this fork; use Gemini 3.x");
    });

    it("keeps claude models unchanged (antigravity only)", () => {
      const result = resolveModelForHeaderStyle("claude-opus-4-6-thinking", "antigravity");
      expect(result.actualModel).toBe("claude-opus-4-6-thinking");
    });
  });
});
