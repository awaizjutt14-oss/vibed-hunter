import { describe, expect, it, vi } from "vitest";
import { fetchRssFeed } from "@/lib/ingestion/connectors/rss";

describe("fetchRssFeed", () => {
  it("normalizes RSS items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          `<rss><channel><item><title>Test Topic</title><link>https://example.com/topic</link><description>Useful summary</description><pubDate>Tue, 25 Mar 2026 10:00:00 GMT</pubDate></item></channel></rss>`
      })
    );

    const result = await fetchRssFeed("Test Feed", "https://example.com/feed.xml");
    expect(result.errors).toEqual([]);
    expect(result.items[0]?.title).toBe("Test Topic");
    expect(result.items[0]?.url).toBe("https://example.com/topic");
  });
});
