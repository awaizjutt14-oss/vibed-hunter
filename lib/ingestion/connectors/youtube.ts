import { SourceType } from "@prisma/client";
import type { ConnectorResult } from "@/lib/ingestion/types";

export async function fetchYouTubeTopics(): Promise<ConnectorResult> {
  return {
    sourceName: "YouTube Trends",
    sourceType: SourceType.YOUTUBE,
    items: [],
    errors: ["TODO: integrate YouTube Data API using YOUTUBE_API_KEY"]
  };
}
