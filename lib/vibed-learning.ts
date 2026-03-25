export type LearningPick = {
  slot: "12:30 PM" | "6:30 PM" | "9:15 PM";
  hook: string;
  categoryLabel: string;
  viralScore: number;
  scoreBreakdown?: {
    engagement: number;
    trendRelevance: number;
    categoryMatch: number;
  };
};

type InteractionType = "click" | "copy_hook" | "copy_caption" | "copy_full_post";

type LearningState = {
  totalInteractions: number;
  categories: Record<string, number>;
  hookStyles: Record<string, number>;
  lengths: Record<string, number>;
  lastUpdatedAt: number | null;
};

const STORAGE_KEY = "vibed-hunter-learning-v1";

const emptyState: LearningState = {
  totalInteractions: 0,
  categories: {},
  hookStyles: {},
  lengths: {},
  lastUpdatedAt: null
};

export function loadLearningState(): LearningState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    return { ...emptyState, ...(JSON.parse(raw) as Partial<LearningState>) };
  } catch {
    return emptyState;
  }
}

export function saveLearningState(state: LearningState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordLearningInteraction(pick: LearningPick, type: InteractionType) {
  const state = loadLearningState();
  const weight = interactionWeight(type) + (pick.scoreBreakdown?.engagement ?? pick.viralScore) / 100;
  const categoryKey = pick.categoryLabel.toLowerCase();
  const hookStyleKey = inferHookStyle(pick.hook);
  const lengthKey = inferLengthBucket(pick.hook);

  state.totalInteractions += 1;
  state.categories[categoryKey] = (state.categories[categoryKey] ?? 0) + weight;
  state.hookStyles[hookStyleKey] = (state.hookStyles[hookStyleKey] ?? 0) + weight;
  state.lengths[lengthKey] = (state.lengths[lengthKey] ?? 0) + weight * 0.8;
  state.lastUpdatedAt = Date.now();

  saveLearningState(state);
  return state;
}

export function applyLearningBoost<T extends LearningPick>(picks: T[]) {
  const state = loadLearningState();
  return [...picks].sort((a, b) => getLearnedScore(b, state) - getLearnedScore(a, state));
}

export function getLearningSummary() {
  const state = loadLearningState();
  return {
    totalInteractions: state.totalInteractions,
    topCategory: topKey(state.categories),
    topHookStyle: topKey(state.hookStyles),
    topLength: topKey(state.lengths),
    lastUpdatedAt: state.lastUpdatedAt
  };
}

function getLearnedScore(pick: LearningPick, state: LearningState) {
  const categoryBoost = state.categories[pick.categoryLabel.toLowerCase()] ?? 0;
  const hookBoost = state.hookStyles[inferHookStyle(pick.hook)] ?? 0;
  const lengthBoost = state.lengths[inferLengthBucket(pick.hook)] ?? 0;
  const engagementBoost = (pick.scoreBreakdown?.engagement ?? pick.viralScore) * 0.15;
  return pick.viralScore + categoryBoost * 3 + hookBoost * 2 + lengthBoost + engagementBoost;
}

function interactionWeight(type: InteractionType) {
  if (type === "copy_full_post") return 3.5;
  if (type === "copy_hook") return 2.5;
  if (type === "copy_caption") return 2;
  return 1.5;
}

function inferHookStyle(hook: string) {
  const value = hook.toLowerCase();
  if (/(fake|impossible|believe|unreal)/.test(value)) return "disbelief";
  if (/(smaller|first|until|see)/.test(value)) return "curiosity";
  if (/(clean|perfect|precision)/.test(value)) return "precision";
  return "simple";
}

function inferLengthBucket(hook: string) {
  const count = hook.trim().split(/\s+/).filter(Boolean).length;
  if (count <= 6) return "short";
  if (count <= 8) return "medium";
  return "long";
}

function topKey(record: Record<string, number>) {
  const entries = Object.entries(record).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}
