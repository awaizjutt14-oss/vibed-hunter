import { SourceType } from "@prisma/client";
import type { ConnectorResult } from "@/lib/ingestion/types";

export async function fetchTrendSignals(): Promise<ConnectorResult> {
  return {
    sourceName: "Trend API",
    sourceType: SourceType.GOOGLE_TRENDS,
    items: [],
    errors: ["TODO: integrate Google Trends or approved trend provider"]
  };
}
