import { SourceType } from "@prisma/client";

export type NormalizedSourceItem = {
  title: string;
  sourceName: string;
  sourceType: SourceType;
  url: string;
  publishTime?: string;
  topicTags: string[];
  region?: string;
  language?: string;
  engagementSignals?: Record<string, number | string | boolean | null>;
  rawSummary?: string;
};

export type ConnectorResult = {
  sourceName: string;
  sourceType: SourceType;
  items: NormalizedSourceItem[];
  errors: string[];
};
