import { SourceType } from "@prisma/client";
import type { ConnectorResult } from "@/lib/ingestion/types";

export async function fetchNewsApiSource(): Promise<ConnectorResult> {
  return {
    sourceName: "News API",
    sourceType: SourceType.NEWS_API,
    items: [],
    errors: ["TODO: integrate News API with NEWS_API_KEY"]
  };
}
