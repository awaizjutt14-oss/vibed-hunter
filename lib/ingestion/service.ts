import { SourceType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fetchNewsApiSource } from "@/lib/ingestion/connectors/news-api";
import { fetchRedditSource } from "@/lib/ingestion/connectors/reddit";
import { fetchRssFeed } from "@/lib/ingestion/connectors/rss";
import { fetchTrendSignals } from "@/lib/ingestion/connectors/trends";
import { fetchYouTubeTopics } from "@/lib/ingestion/connectors/youtube";
import { getSourceIntelligence, vibedOnlyEligible } from "@/lib/source-intelligence";

export async function runIngestion() {
  const user = await prisma.user.findFirst({ include: { settings: true } });
  const vibedOnlyMode = user?.settings?.highConfidenceOnly ?? false;
  const sources = await prisma.source.findMany({ where: { isActive: true }, orderBy: { createdAt: "asc" } });
  const eligibleSources = vibedOnlyMode ? sources.filter((source) => vibedOnlyEligible(source)) : sources;
  const results = [];

  for (const source of eligibleSources) {
    const intelligence = getSourceIntelligence(source);
    let result;
    if (source.sourceType === SourceType.RSS) {
      result = await fetchRssFeed(source.name, source.url);
    } else if (source.sourceType === SourceType.REDDIT) {
      result = await fetchRedditSource(source.name, source.url);
    } else if (source.sourceType === SourceType.NEWS_API) {
      result = await fetchNewsApiSource();
    } else if (source.sourceType === SourceType.YOUTUBE) {
      result = await fetchYouTubeTopics();
    } else if (source.sourceType === SourceType.GOOGLE_TRENDS) {
      result = await fetchTrendSignals();
    } else {
      result = await fetchRssFeed(source.name, source.url);
    }

    for (const item of result.items) {
      const dedupeKey = `${source.id}:${normalizeUrl(item.url)}`;
      const publishTime = parsePublishTime(item.publishTime);
      await prisma.sourceItem.upsert({
        where: { dedupeKey },
        update: {
          title: item.title,
          rawSummary: item.rawSummary,
          publishTime,
          topicTags: item.topicTags,
          engagementSignals: item.engagementSignals,
          url: item.url
        },
        create: {
          sourceId: source.id,
          dedupeKey,
          title: item.title,
          sourceName: item.sourceName,
          sourceType: item.sourceType,
          url: item.url,
          publishTime,
          topicTags: item.topicTags,
          region: item.region,
          language: item.language,
          engagementSignals: item.engagementSignals,
          rawSummary: item.rawSummary
        }
      });
    }

    await prisma.source.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() }
    });

    results.push({
      source: source.name,
      category: intelligence.category,
      priority: intelligence.priority,
      imported: result.items.length,
      errors: result.errors
    });
  }

  if (vibedOnlyMode) {
    const skipped = sources.length - eligibleSources.length;
    results.push({
      source: "Vibed-only mode",
      category: "system",
      priority: "high",
      imported: 0,
      errors: skipped > 0 ? [`Skipped ${skipped} lower-fit sources.`] : []
    });
  }

  return results;
}

function parsePublishTime(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function normalizeUrl(url: string) {
  return url.trim().toLowerCase().replace(/\/$/, "");
}
