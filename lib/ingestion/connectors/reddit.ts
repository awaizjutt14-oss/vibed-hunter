import { SourceType } from "@prisma/client";
import type { ConnectorResult } from "@/lib/ingestion/types";
import { fetchRssFeed } from "@/lib/ingestion/connectors/rss";

export async function fetchRedditSource(sourceName: string, url: string): Promise<ConnectorResult> {
  const result = await fetchRssFeed(sourceName, url);
  return {
    ...result,
    sourceType: SourceType.REDDIT,
    items: result.items.map((item) => ({ ...item, sourceType: SourceType.REDDIT }))
  };
}
