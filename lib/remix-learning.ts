export type LearningFeedback =
  | "strong"
  | "weak"
  | "liked"
  | "performed_well"
  | "performed_badly"
  | "high_engagement"
  | "low_engagement";

export type InteractionType =
  | "selected_hook"
  | "copied_hook"
  | "copied_caption"
  | "copied_cta"
  | "copied_hashtags"
  | "saved_result"
  | "regenerated"
  | "generated";

export type LearningResultSnapshot = {
  hook?: string;
  caption?: string;
  cta?: string;
  hashtags?: string;
  contentType?: string;
  internalScores?: {
    hookStrength: number;
    curiosity: number;
    clarity: number;
    virality: number;
    nicheMatch: number;
  };
};

type WeightedMap = Record<string, number>;

type BestExample = {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string;
  contentType: string;
  score: number;
};

export type PreferenceProfile = {
  enabled: boolean;
  weightedPreferences: {
    tones: WeightedMap;
    platforms: WeightedMap;
    outputFormats: WeightedMap;
    hookStyles: WeightedMap;
    ctaStyles: WeightedMap;
    captionLengths: WeightedMap;
    topicPatterns: WeightedMap;
  };
  interactionCounts: WeightedMap;
  feedbackCounts: WeightedMap;
  patternRanking: WeightedMap;
  bestExamples: BestExample[];
};

export function createEmptyLearningProfile(): PreferenceProfile {
  return {
    enabled: true,
    weightedPreferences: {
      tones: {},
      platforms: {},
      outputFormats: {},
      hookStyles: {},
      ctaStyles: {},
      captionLengths: {},
      topicPatterns: {}
    },
    interactionCounts: {},
    feedbackCounts: {},
    patternRanking: {},
    bestExamples: []
  };
}

export function normalizeLearningProfile(profile?: Partial<PreferenceProfile> | null): PreferenceProfile {
  const empty = createEmptyLearningProfile();
  return {
    ...empty,
    ...profile,
    weightedPreferences: {
      ...empty.weightedPreferences,
      ...(profile?.weightedPreferences ?? {})
    },
    interactionCounts: profile?.interactionCounts ?? {},
    feedbackCounts: profile?.feedbackCounts ?? {},
    patternRanking: profile?.patternRanking ?? {},
    bestExamples: Array.isArray(profile?.bestExamples) ? profile!.bestExamples : []
  };
}

function changeWeight(map: WeightedMap, key: string | undefined, amount: number) {
  if (!key) return;
  map[key] = (map[key] ?? 0) + amount;
}

function topEntries(map: WeightedMap, limit = 3) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function detectHookStyle(hook: string | undefined) {
  const value = hook?.toLowerCase() ?? "";
  if (!value) return "";
  if (/(illegal|fake|not real|impossible|what this does)/.test(value)) return "shock";
  if (/(hours|seconds|instantly|replace)/.test(value)) return "time-value";
  if (/(you|nobody|supposed to see|miss)/.test(value)) return "secretive";
  return "curiosity";
}

function detectCtaStyle(cta: string | undefined) {
  const value = cta?.toLowerCase() ?? "";
  if (value.includes("hidden")) return "insight";
  if (value.includes("satisfying")) return "satisfying";
  if (value.includes("discipline")) return "motivational";
  if (value.includes("tech")) return "tech";
  return "general";
}

function detectCaptionLength(caption: string | undefined) {
  const words = caption?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  if (words <= 45) return "short";
  if (words <= 90) return "medium";
  return "long";
}

function detectTopicPatterns(content: string | undefined) {
  const value = content?.toLowerCase() ?? "";
  const patterns = [];
  if (/(ai|tech|tool|robot|automation|future)/.test(value)) patterns.push("tech");
  if (/(fitness|workout|muscle|meal|fat loss)/.test(value)) patterns.push("fitness");
  if (/(luxury|car|fashion|design|premium)/.test(value)) patterns.push("luxury");
  if (/(machine|engineering|factory|cnc|process)/.test(value)) patterns.push("engineering");
  if (/(story|journey|before|after|transformation)/.test(value)) patterns.push("storytelling");
  return patterns.length ? patterns : ["general"];
}

function interactionWeight(type: InteractionType) {
  switch (type) {
    case "saved_result":
      return 3;
    case "copied_hook":
    case "copied_caption":
    case "copied_cta":
    case "copied_hashtags":
      return 2.5;
    case "selected_hook":
      return 2;
    case "generated":
      return 1;
    case "regenerated":
      return -1;
    default:
      return 1;
  }
}

function feedbackWeight(type: LearningFeedback) {
  switch (type) {
    case "strong":
      return 2;
    case "high_engagement":
    case "performed_well":
    case "liked":
      return 3;
    case "weak":
      return -1.5;
    case "low_engagement":
    case "performed_badly":
      return -2;
    default:
      return 0;
  }
}

function resultScore(result?: LearningResultSnapshot) {
  const scores = result?.internalScores;
  if (!scores) return 0;
  return Math.round(
    scores.hookStrength * 0.3 +
      scores.curiosity * 0.2 +
      scores.clarity * 0.15 +
      scores.virality * 0.25 +
      scores.nicheMatch * 0.1
  );
}

function updateBestExamples(profile: PreferenceProfile, result?: LearningResultSnapshot, boost = 0) {
  if (!result?.hook || !result.caption) return;

  const example: BestExample = {
    hook: result.hook,
    caption: result.caption,
    cta: result.cta ?? "",
    hashtags: result.hashtags ?? "",
    contentType: result.contentType ?? "",
    score: resultScore(result) + boost
  };

  profile.bestExamples = [...profile.bestExamples, example]
    .sort((a, b) => b.score - a.score)
    .filter(
      (item, index, array) =>
        array.findIndex((other) => other.hook === item.hook && other.caption === item.caption) === index
    )
    .slice(0, 5);
}

export function applyLearningInteraction(
  currentProfile: PreferenceProfile | undefined,
  args: {
    type: InteractionType;
    platform?: string;
    tone?: string;
    outputFormat?: string;
    content?: string;
    result?: LearningResultSnapshot;
  }
) {
  const profile = normalizeLearningProfile(currentProfile);
  if (!profile.enabled) return profile;

  const weight = interactionWeight(args.type);

  changeWeight(profile.interactionCounts, args.type, 1);
  changeWeight(profile.weightedPreferences.platforms, args.platform, weight);
  changeWeight(profile.weightedPreferences.tones, args.tone, weight);
  changeWeight(profile.weightedPreferences.outputFormats, args.outputFormat, weight);
  changeWeight(profile.weightedPreferences.hookStyles, detectHookStyle(args.result?.hook), weight);
  changeWeight(profile.weightedPreferences.ctaStyles, detectCtaStyle(args.result?.cta), weight);
  changeWeight(profile.weightedPreferences.captionLengths, detectCaptionLength(args.result?.caption), weight);

  for (const topic of detectTopicPatterns(args.content)) {
    changeWeight(profile.weightedPreferences.topicPatterns, topic, weight);
    changeWeight(profile.patternRanking, topic, weight + resultScore(args.result) / 100);
  }

  updateBestExamples(profile, args.result, weight > 0 ? weight * 5 : 0);
  return profile;
}

export function applyLearningFeedback(
  currentProfile: PreferenceProfile | undefined,
  feedback: LearningFeedback,
  result?: LearningResultSnapshot
) {
  const profile = normalizeLearningProfile(currentProfile);
  if (!profile.enabled) return profile;

  const weight = feedbackWeight(feedback);
  changeWeight(profile.feedbackCounts, feedback, 1);
  changeWeight(profile.patternRanking, detectHookStyle(result?.hook), weight);
  changeWeight(profile.weightedPreferences.hookStyles, detectHookStyle(result?.hook), weight);
  changeWeight(profile.weightedPreferences.ctaStyles, detectCtaStyle(result?.cta), weight);
  changeWeight(profile.weightedPreferences.captionLengths, detectCaptionLength(result?.caption), weight);
  updateBestExamples(profile, result, weight * 5);
  return profile;
}

function topKey(map: WeightedMap) {
  return topEntries(map, 1)[0]?.[0] ?? "none yet";
}

export function getLearningSummary(profile?: PreferenceProfile) {
  const normalized = normalizeLearningProfile(profile);
  return {
    enabled: normalized.enabled,
    favoriteTone: topKey(normalized.weightedPreferences.tones),
    favoriteHookStyle: topKey(normalized.weightedPreferences.hookStyles),
    preferredCaptionLength: topKey(normalized.weightedPreferences.captionLengths),
    preferredCtaStyle: topKey(normalized.weightedPreferences.ctaStyles),
    mostUsedPlatform: topKey(normalized.weightedPreferences.platforms),
    topTopicPattern: topKey(normalized.weightedPreferences.topicPatterns),
    topExamples: normalized.bestExamples.slice(0, 3)
  };
}

export function buildLearningPrompt(profile?: PreferenceProfile) {
  const normalized = normalizeLearningProfile(profile);
  if (!normalized.enabled) return "";

  const topTones = topEntries(normalized.weightedPreferences.tones).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const topHookStyles = topEntries(normalized.weightedPreferences.hookStyles).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const topLengths = topEntries(normalized.weightedPreferences.captionLengths).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const topCtas = topEntries(normalized.weightedPreferences.ctaStyles).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const topPlatforms = topEntries(normalized.weightedPreferences.platforms).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const topPatterns = topEntries(normalized.patternRanking).map(([key, value]) => `${key} (${value.toFixed(1)})`);
  const weakPatterns = Object.entries(normalized.patternRanking)
    .filter(([, value]) => value < 0)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([key, value]) => `${key} (${value.toFixed(1)})`);

  const examples = normalized.bestExamples
    .slice(0, 3)
    .map(
      (example, index) =>
        `Example ${index + 1}:\n- hook: ${example.hook}\n- caption: ${example.caption}\n- cta: ${example.cta}\n- content type: ${example.contentType}\n- score: ${example.score}`
    );

  return [
    "Weighted user preference profile:",
    `- tone preference weights: ${topTones.join(", ") || "none yet"}`,
    `- hook style weights: ${topHookStyles.join(", ") || "none yet"}`,
    `- caption length preference: ${topLengths.join(", ") || "none yet"}`,
    `- CTA style preference: ${topCtas.join(", ") || "none yet"}`,
    `- platform preference: ${topPlatforms.join(", ") || "none yet"}`,
    `- strongest patterns: ${topPatterns.join(", ") || "none yet"}`,
    `- avoid low-performing patterns: ${weakPatterns.join(", ") || "none yet"}`,
    examples.length ? "Generate similar style to previously high-performing outputs:\n" + examples.join("\n") : ""
  ]
    .filter(Boolean)
    .join("\n");
}

type LearningProfileResponse = {
  profile: PreferenceProfile;
};

async function requestLearningProfile(
  method: "GET" | "POST",
  body?: Record<string, unknown>
): Promise<PreferenceProfile> {
  const response = await fetch("/api/learning-profile", {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  if (!response.ok) {
    throw new Error("Failed to sync learning profile.");
  }

  const payload = (await response.json()) as LearningProfileResponse;
  return normalizeLearningProfile(payload.profile);
}

export async function fetchLearningProfile() {
  return requestLearningProfile("GET");
}

export async function persistLearningInteraction(args: {
  type: InteractionType;
  platform?: string;
  tone?: string;
  outputFormat?: string;
  content?: string;
  result?: LearningResultSnapshot;
}) {
  return requestLearningProfile("POST", {
    action: "interaction",
    interaction: args
  });
}

export async function persistLearningFeedback(feedback: LearningFeedback, result?: LearningResultSnapshot) {
  return requestLearningProfile("POST", {
    action: "feedback",
    feedback,
    result
  });
}

export async function persistLearningToggle(enabled: boolean) {
  return requestLearningProfile("POST", {
    action: "toggle",
    enabled
  });
}

export async function persistLearningReset() {
  return requestLearningProfile("POST", {
    action: "reset"
  });
}
