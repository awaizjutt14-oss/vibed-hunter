type VibedCategory = "science" | "engineering" | "human skill";

export type TrendItem = {
  id: string;
  title: string;
  engagementScore: number;
  category: VibedCategory;
  source: "reddit";
  url: string;
  createdTime: string;
  upvotes: number;
  comments: number;
  description: string;
  sourceName: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __trendFetcherCache:
    | {
        fetchedAt: number;
        items: TrendItem[];
      }
    | undefined;
}

const CACHE_TTL_MS = 1000 * 60 * 10;
const MIN_UPVOTES = 1000;
const MAX_AGE_HOURS = 24;
const SUBREDDITS = ["interestingasfuck", "oddlysatisfying", "nextfuckinglevel", "technology"] as const;

export async function fetchTrendingContent(forceRefresh = false): Promise<TrendItem[]> {
  const cached = global.__trendFetcherCache;
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.items;
  }

  const resultSets = await Promise.all(SUBREDDITS.map((subreddit) => fetchSubredditHot(subreddit).catch(() => [])));
  const items = dedupe(resultSets.flat()).sort((a, b) => b.engagementScore - a.engagementScore);
  global.__trendFetcherCache = { fetchedAt: Date.now(), items };
  return items;
}

async function fetchSubredditHot(subreddit: (typeof SUBREDDITS)[number]): Promise<TrendItem[]> {
  const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=20`, {
    headers: {
      "User-Agent": "VibedHunter/1.0"
    },
    cache: "no-store"
  });

  if (!response.ok) return [];
  const json = await response.json();
  const posts = json?.data?.children ?? [];

  return posts
    .map((entry: { data?: Record<string, unknown> }) => normalizePost(subreddit, entry.data ?? {}))
    .filter((item: TrendItem | null): item is TrendItem => !!item)
    .filter((item: TrendItem) => isRecent(item.createdTime) && item.upvotes >= MIN_UPVOTES);
}

function normalizePost(subreddit: string, post: Record<string, unknown>): TrendItem | null {
  const title = String(post.title ?? "").trim();
  if (!title) return null;

  const upvotes = safeNumber(post.ups ?? post.score);
  const comments = safeNumber(post.num_comments);
  const createdUtc = safeNumber(post.created_utc);
  const createdTime = createdUtc ? new Date(createdUtc * 1000).toISOString() : new Date().toISOString();
  const permalink = String(post.permalink ?? "");
  const rawUrl = String(post.url_overridden_by_dest ?? post.url ?? "").trim();
  const url = rawUrl || (permalink ? `https://www.reddit.com${permalink}` : "");
  const description = String(post.selftext ?? "").trim();

  return {
    id: `reddit:${subreddit}:${String(post.id ?? title)}`,
    title,
    engagementScore: calculateEngagementScore(upvotes, comments),
    category: classifyCategory(subreddit, `${title} ${description}`),
    source: "reddit",
    url: url || `https://www.reddit.com/r/${subreddit}`,
    createdTime,
    upvotes,
    comments,
    description,
    sourceName: `r/${subreddit}`
  };
}

function calculateEngagementScore(upvotes: number, comments: number) {
  const weighted = upvotes + comments * 15;
  if (weighted <= 0) return 1;
  return Math.max(1, Math.min(100, Math.round(Math.log10(weighted + 1) * 20)));
}

function classifyCategory(subreddit: string, text: string): VibedCategory {
  const value = `${subreddit} ${text}`.toLowerCase();
  if (/oddlysatisfying|machine|cnc|precision|cut|automation|factory|assembly|laser|metal|mechanism/.test(value)) {
    return "engineering";
  }
  if (/nextfuckinglevel|skill|balance|parkour|control|timing|craft|stunt|precision hands|human/.test(value)) {
    return "human skill";
  }
  return "science";
}

function isRecent(createdTime: string) {
  const ageMs = Date.now() - new Date(createdTime).getTime();
  return ageMs <= MAX_AGE_HOURS * 60 * 60 * 1000;
}

function dedupe(items: TrendItem[]) {
  const map = new Map<string, TrendItem>();
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const existing = map.get(key);
    if (!existing || item.engagementScore > existing.engagementScore) {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function safeNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
