type SourceLike = {
  name: string;
  url: string;
  sourceType: string;
  connectorKey?: string | null;
  tags?: unknown;
  isActive?: boolean;
  lastFetchedAt?: Date | string | null;
};

export type SourcePriority = "high" | "medium" | "low";

export type SourceCategory =
  | "AI / Robotics"
  | "Science Breakthroughs"
  | "Visual Engineering"
  | "Nature / Earth / Space"
  | "Human Skill / Craftsmanship"
  | "Weird But Real"
  | "Breaking Visual News";

export type SourceIntelligence = {
  category: SourceCategory;
  priority: SourcePriority;
  visualPotential: number;
  shortFormFit: number;
  repostSafetyConfidence: number;
  freshness: number;
  channelFitScore: number;
  status: "Live" | "Disabled";
  downranked: boolean;
};

const CATEGORY_ORDER: SourceCategory[] = [
  "AI / Robotics",
  "Science Breakthroughs",
  "Visual Engineering",
  "Nature / Earth / Space",
  "Human Skill / Craftsmanship",
  "Weird But Real",
  "Breaking Visual News"
];

export function getSourceIntelligence(source: SourceLike): SourceIntelligence {
  const tags = normalizeTags(source.tags);
  const text = `${source.name} ${source.url} ${tags.join(" ")}`.toLowerCase();
  const explicitCategory = readPrefixedTag(tags, "category");
  const explicitPriority = readPrefixedTag(tags, "priority") as SourcePriority | undefined;

  const category = (explicitCategory && CATEGORY_ORDER.includes(explicitCategory as SourceCategory)
    ? (explicitCategory as SourceCategory)
    : inferCategory(text));

  const visualPotential = scoreVisualPotential(text, category);
  const shortFormFit = scoreShortFormFit(text, category);
  const repostSafetyConfidence = scoreRepostSafety(text, source.sourceType);
  const freshness = scoreFreshness(source.lastFetchedAt);
  const channelFitScore = clamp(Math.round((visualPotential * 0.35) + (shortFormFit * 0.3) + (repostSafetyConfidence * 0.2) + (freshness * 0.15)), 0, 100);
  const downranked = isDownranked(text, source.sourceType);
  const priority = explicitPriority ?? defaultPriority(channelFitScore, downranked);

  return {
    category,
    priority,
    visualPotential,
    shortFormFit,
    repostSafetyConfidence,
    freshness,
    channelFitScore: downranked ? Math.max(channelFitScore - 18, 20) : channelFitScore,
    status: source.isActive === false ? "Disabled" : "Live",
    downranked
  };
}

export function normalizeTags(tags: unknown) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag));
  }
  return [];
}

export function updateSourceTags(tags: unknown, updates: { priority?: SourcePriority; category?: SourceCategory }) {
  const normalized = normalizeTags(tags).filter((tag) => !tag.startsWith("priority:") && !tag.startsWith("category:"));
  if (updates.priority) normalized.push(`priority:${updates.priority}`);
  if (updates.category) normalized.push(`category:${updates.category}`);
  return normalized;
}

export function vibedOnlyEligible(source: SourceLike) {
  const intel = getSourceIntelligence(source);
  return intel.status === "Live" && !intel.downranked && intel.priority !== "low" && intel.channelFitScore >= 74 && intel.visualPotential >= 72;
}

function inferCategory(text: string): SourceCategory {
  if (containsAny(text, ["robot", "robotics", "ai", "machine learning", "openai", "deepmind"])) return "AI / Robotics";
  if (containsAny(text, ["engineering", "build", "design", "bridge", "machine", "maker", "inventor"])) return "Visual Engineering";
  if (containsAny(text, ["space", "nasa", "earth", "nature", "ocean", "storm", "wildlife", "animal"])) return "Nature / Earth / Space";
  if (containsAny(text, ["craft", "skill", "woodworking", "precision", "artist", "craftsmanship"])) return "Human Skill / Craftsmanship";
  if (containsAny(text, ["weird", "interesting", "amazing", "unusual", "odd"])) return "Weird But Real";
  if (containsAny(text, ["breaking", "news", "latest", "watch"])) return "Breaking Visual News";
  return "Science Breakthroughs";
}

function scoreVisualPotential(text: string, category: SourceCategory) {
  let score = 62;
  if (category === "Visual Engineering" || category === "Nature / Earth / Space" || category === "Human Skill / Craftsmanship") score += 18;
  if (category === "AI / Robotics" || category === "Weird But Real") score += 12;
  if (containsAny(text, ["robot", "visual", "demo", "video", "build", "engineering", "nature", "space", "craft", "wildlife", "amazed", "satisfying"])) score += 12;
  if (containsAny(text, ["opinion", "analysis", "enterprise", "policy", "newsletter"])) score -= 18;
  return clamp(score, 20, 98);
}

function scoreShortFormFit(text: string, category: SourceCategory) {
  let score = 60;
  if (category !== "Breaking Visual News") score += 8;
  if (containsAny(text, ["robot", "science", "engineering", "nature", "craft", "weird", "discovery"])) score += 16;
  if (containsAny(text, ["opinion", "analysis", "enterprise", "b2b", "strategy", "earnings", "policy"])) score -= 22;
  return clamp(score, 20, 97);
}

function scoreRepostSafety(text: string, sourceType: string) {
  let score = sourceType === "REDDIT" ? 72 : 84;
  if (containsAny(text, ["youtube", "tiktok", "instagram"])) score -= 10;
  if (containsAny(text, ["politics", "breaking", "crime", "war"])) score -= 16;
  if (containsAny(text, ["research", "science", "nasa", "sciencedaily", "earth"])) score += 6;
  return clamp(score, 20, 96);
}

function scoreFreshness(lastFetchedAt?: Date | string | null) {
  if (!lastFetchedAt) return 62;
  const timestamp = new Date(lastFetchedAt).getTime();
  if (Number.isNaN(timestamp)) return 62;
  const hours = Math.max(0, (Date.now() - timestamp) / 36e5);
  return clamp(Math.round(96 - hours * 2.5), 30, 96);
}

function isDownranked(text: string, sourceType: string) {
  return containsAny(text, ["opinion", "enterprise", "b2b", "policy", "earnings", "strategy", "corporate", "press release", "analysis"]) ||
    containsAny(text, ["politics", "election", "war"]) ||
    (sourceType === "NEWS_API" && containsAny(text, ["general"]));
}

function defaultPriority(channelFitScore: number, downranked: boolean): SourcePriority {
  if (downranked) return "low";
  if (channelFitScore >= 84) return "high";
  if (channelFitScore >= 68) return "medium";
  return "low";
}

function readPrefixedTag(tags: string[], prefix: string) {
  return tags.find((tag) => tag.startsWith(`${prefix}:`))?.slice(prefix.length + 1);
}

function containsAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
