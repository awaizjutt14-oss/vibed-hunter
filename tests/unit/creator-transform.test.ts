import { describe, expect, it } from "vitest";
import { buildCreatorOpportunity, buildQuickPostPreview } from "@/lib/creator-transform";

describe("buildCreatorOpportunity", () => {
  it("turns a source-like headline into a creator-friendly opportunity", () => {
    const result = buildCreatorOpportunity({
      title: "Scientists build robot smaller than a grain of salt - Reuters",
      summary: "Researchers revealed a tiny robotics breakthrough that could change micro-engineering.",
      bestPlatform: "instagram reels",
      visualStrength: 92,
      repostSafety: 84,
      bestSlot: "9:15 PM",
      contentMode: "breaking-now",
      sourceCount: 3
    });

    expect(result.hook).not.toContain("Reuters");
    expect(result.hook.split(/\s+/).length).toBeLessThanOrEqual(10);
    expect(result.editorialScore).toBeGreaterThan(70);
    expect(result.shortFormReason.toLowerCase()).toContain("reel");
  });

  it("blocks awkward corporate phrasing and falls back to a cleaner hook", () => {
    const result = buildCreatorOpportunity({
      title: "OpenAI to acquire Promptfoo",
      summary: "OpenAI announced an acquisition and corporate update for developers.",
      bestPlatform: "youtube shorts",
      visualStrength: 72,
      repostSafety: 80,
      bestSlot: "12:30 PM",
      contentMode: "trend-watch",
      sourceCount: 1
    });

    expect(result.hook.toLowerCase()).not.toContain("acquire");
    expect(result.hook.toLowerCase()).not.toContain("promptfoo");
    expect(result.rejectionReasons).toContain("topic feels too corporate and not visual enough");
  });

  it("builds a quick creator preview for the topic page", () => {
    const preview = buildQuickPostPreview({
      hook: "This build looks impossible but works",
      title: "Impossible engineering design",
      summary: "A new structure folds into place with a visual payoff.",
      shortFormReason: "Best as an Instagram Reel with a clean visual payoff.",
      visualExplanation: "The movement or build itself is the payoff.",
      whyFits: "The visual is clean, satisfying, and easy to explain in one pass.",
      repostSafety: 86
    });

    expect(preview.caption).toContain("Follow @vibed.media");
    expect(preview.coverText.split(/\s+/).length).toBeLessThanOrEqual(4);
    expect(preview.safetyNote.toLowerCase()).toContain("low-risk");
  });
});
