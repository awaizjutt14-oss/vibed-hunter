type TrendCategory = "science" | "engineering" | "human skill";

export type TrendingContentItem = {
  id: string;
  title: string;
  description: string;
  sourceName: string;
  sourceUrl: string;
  likes: number;
  comments: number;
  upvotes: number;
  category: TrendCategory;
  publishedAt?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __trendingContentCache:
    | {
        fetchedAt: number;
        items: TrendingContentItem[];
      }
    | undefined;
}

const CACHE_TTL_MS = 1000 * 60 * 10;
const REDDIT_SOURCES = [
  { name: "r/interestingasfuck", url: "https://www.reddit.com/r/interestingasfuck/hot.json?limit=12" },
  { name: "r/oddlysatisfying", url: "https://www.reddit.com/r/oddlysatisfying/hot.json?limit=12" },
  { name: "r/technology", url: "https://www.reddit.com/r/technology/hot.json?limit=12" }
] as const;

const YOUTUBE_QUERIES = [
  { query: "microscope science shorts", category: "science" as const },
  { query: "precision engineering shorts", category: "engineering" as const },
  { query: "human skill shorts", category: "human skill" as const }
] as const;

export async function fetchTrendingContent(forceRefresh = false): Promise<TrendingContentItem[]> {
  const cached = global.__trendingContentCache;
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.items;
  }

  const [redditItems, youtubeItems] = await Promise.all([
    fetchRedditTrending().catch(() => []),
    fetchYouTubeTrending().catch(() => [])
  ]);

  const items = dedupeItems([...redditItems, ...youtubeItems]).sort((a, b) => scoreTrend(b) - scoreTrend(a));
  global.__trendingContentCache = { fetchedAt: Date.now(), items };
  return items;
}

async function fetchRedditTrending(): Promise<TrendingContentItem[]> {
  const results = await Promise.all(REDDIT_SOURCES.map(async (source) => {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "VibedHunter/1.0"
      },
      cache: "no-store"
    });
    if (!response.ok) return [];
    const json = await response.json();
    const posts = json?.data?.children ?? [];
    return posts
      .map((child: { data?: Record<string, unknown> }) => normalizeRedditPost(source.name, child.data ?? {}))
      .filter(Boolean) as TrendingContentItem[];
  }));

  return results.flat();
}

function normalizeRedditPost(sourceName: string, post: Record<string, unknown>): TrendingContentItem | null {
  const title = String(post.title ?? "").trim();
  if (!title) return null;

  const description = String(post.selftext ?? post.subreddit_name_prefixed ?? "").trim();
  const permalink = String(post.permalink ?? "");
  const sourceUrl = permalink ? `https://www.reddit.com${permalink}` : String(post.url ?? "https://www.reddit.com");
  const upvotes = Number(post.ups ?? post.score ?? 0);
  const comments = Number(post.num_comments ?? 0);
  const publishedAt =
    typeof post.created_utc === "number" ? new Date(post.created_utc * 1000).toISOString() : undefined;

  return {
    id: `reddit:${String(post.id ?? title)}`,
    title,
    description,
    sourceName: `Reddit ${sourceName}`,
    sourceUrl,
    likes: 0,
    comments: Number.isFinite(comments) ? comments : 0,
    upvotes: Number.isFinite(upvotes) ? upvotes : 0,
    category: classifyCategory(`${title} ${description}`, fallbackCategoryForSource(sourceName)),
    publishedAt
  };
}

async function fetchYouTubeTrending(): Promise<TrendingContentItem[]> {
  const resultSets = await Promise.all(
    YOUTUBE_QUERIES.map(async (entry) => {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(entry.query)}&sp=EgIYAQ%253D%253D`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0"
        },
        cache: "no-store"
      });
      if (!response.ok) return [];
      const html = await response.text();
      return extractYouTubeItems(html, entry.category);
    })
  );

  return resultSets.flat();
}

function extractYouTubeItems(html: string, forcedCategory: TrendCategory): TrendingContentItem[] {
  const items: TrendingContentItem[] = [];
  const seen = new Set<string>();
  const videoRegex =
    /"videoId":"([^"]+)".*?"title":\{"runs":\[\{"text":"([^"]+)"\}\]\}.*?"viewCountText":\{"simpleText":"([^"]+)"\}/g;

  for (const match of html.matchAll(videoRegex)) {
    const [, videoId, rawTitle, viewCountText] = match;
    if (!videoId || !rawTitle || seen.has(videoId)) continue;
    seen.add(videoId);
    const title = decodeHtml(rawTitle);
    items.push({
      id: `youtube:${videoId}`,
      title,
      description: "YouTube short-form trend result",
      sourceName: "YouTube Shorts",
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      likes: 0,
      comments: 0,
      upvotes: parseCompactNumber(viewCountText),
      category: classifyCategory(title, forcedCategory),
      publishedAt: undefined
    });
    if (items.length >= 4) break;
  }

  return items;
}

function classifyCategory(text: string, fallback: TrendCategory = "science"): TrendCategory {
  const value = text.toLowerCase();
  if (
    /cnc|machine|assembly|factory|automation|precision|manufactur|cut|laser|hydraulic|3d print|mechanism|metal/i.test(
      value
    )
  ) {
    return "engineering";
  }
  if (
    /skill|balance|parkour|control|precision hands|blindfold|timing|craft|artist|stunt|human/i.test(value)
  ) {
    return "human skill";
  }
  if (/science|robot|ai|microscope|physics|space|material|crystal|drone|tech|optical/i.test(value)) {
    return "science";
  }
  return fallback;
}

function fallbackCategoryForSource(sourceName: string): TrendCategory {
  const value = sourceName.toLowerCase();
  if (value.includes("oddlysatisfying")) return "engineering";
  if (value.includes("technology")) return "science";
  return "science";
}

function dedupeItems(items: TrendingContentItem[]) {
  const map = new Map<string, TrendingContentItem>();
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const existing = map.get(key);
    if (!existing || scoreTrend(item) > scoreTrend(existing)) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function scoreTrend(item: TrendingContentItem) {
  return item.upvotes + item.comments * 8 + item.likes * 3;
}

function parseCompactNumber(text: string) {
  const match = text.toLowerCase().match(/([\d.]+)\s*([kmb])?/);
  if (!match) return 0;
  const base = Number(match[1]);
  if (!Number.isFinite(base)) return 0;
  const suffix = match[2];
  if (suffix === "k") return Math.round(base * 1000);
  if (suffix === "m") return Math.round(base * 1000000);
  if (suffix === "b") return Math.round(base * 1000000000);
  return Math.round(base);
}

function decodeHtml(text: string) {
  return text
    .replace(/\\u0026/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&");
}
