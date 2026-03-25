import { describe, expect, it } from "vitest";
import { getSourceIntelligence, vibedOnlyEligible } from "@/lib/source-intelligence";

describe("source intelligence", () => {
  it("scores visual science sources highly for Vibed Media", () => {
    const intel = getSourceIntelligence({
      name: "ScienceDaily Engineering",
      url: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
      sourceType: "RSS",
      tags: ["category:Visual Engineering", "priority:high", "engineering", "visual"],
      isActive: true
    });

    expect(intel.category).toBe("Visual Engineering");
    expect(intel.priority).toBe("high");
    expect(intel.channelFitScore).toBeGreaterThan(75);
    expect(vibedOnlyEligible({
      name: "ScienceDaily Engineering",
      url: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
      sourceType: "RSS",
      tags: ["category:Visual Engineering", "priority:high", "engineering", "visual"],
      isActive: true
    })).toBe(true);
  });

  it("downranks corporate and text-heavy sources", () => {
    const intel = getSourceIntelligence({
      name: "OpenAI News",
      url: "https://openai.com/news/rss.xml",
      sourceType: "RSS",
      tags: ["category:AI / Robotics", "priority:low", "corporate", "text-heavy"],
      isActive: true
    });

    expect(intel.priority).toBe("low");
    expect(intel.downranked).toBe(true);
  });
});
