import { SourceType } from "@prisma/client";
import type { ConnectorResult } from "@/lib/ingestion/types";

export async function fetchRssFeed(sourceName: string, url: string): Promise<ConnectorResult> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ContentHunterAI/1.0" },
      next: { revalidate: 1800 }
    });

    if (!response.ok) {
      return { sourceName, sourceType: SourceType.RSS, items: [], errors: [`Failed with ${response.status}`] };
    }

    const xml = await response.text();
    const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 20).map((match) => {
      const block = match[1];
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() ?? "Untitled";
      const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() ?? "";
      const description = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1]?.trim() ?? "";
      const publishTime = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim();
      return {
        title,
        sourceName,
        sourceType: SourceType.RSS,
        url: link,
        publishTime,
        topicTags: [],
        rawSummary: description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      };
    });

    return { sourceName, sourceType: SourceType.RSS, items, errors: [] };
  } catch (error) {
    return {
      sourceName,
      sourceType: SourceType.RSS,
      items: [],
      errors: [error instanceof Error ? error.message : "Unknown RSS fetch error"]
    };
  }
}
