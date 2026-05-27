import { describe, expect, it } from "vitest";
import { aggregateGeminiCliQuota } from "./quota";

describe("aggregateGeminiCliQuota", () => {
  it("keeps Gemini 3 and Gemini 2.5 quota buckets", () => {
    const quota = aggregateGeminiCliQuota({
      buckets: [
        {
          modelId: "gemini-3.5-flash",
          remainingFraction: 0.75,
        },
        {
          modelId: "gemini-2.5-flash",
          remainingFraction: 0.5,
        },
      ],
    });

    expect(quota.models.map((model) => model.modelId)).toEqual([
      "gemini-2.5-flash",
      "gemini-3.5-flash",
    ]);
  });
});
