import { describe, expect, it } from "vitest";
import { calculateTrendScore } from "@/lib/scoring/formula";

describe("calculateTrendScore", () => {
  it("returns a stable weighted score with explanation", () => {
    const result = calculateTrendScore({
      freshness: 90,
      momentum: 80,
      audienceFit: 88,
      originalityPotential: 77,
      visualPotential: 94,
      postability: 85,
      sourceDiversity: 72,
      novelty: 66,
      emotionalPull: 83
    });

    expect(result.finalScore).toBeGreaterThan(80);
    expect(result.explanation.highlights.length).toBeGreaterThan(0);
  });
});
