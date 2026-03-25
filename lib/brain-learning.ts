import { loadBrainProfile, updateBrainProfile, type BrainProfileData } from "@/lib/brain-profile-store";
import { prisma } from "@/lib/db/prisma";

type CandidateIdea = {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceBucket: "science" | "engineering" | "video" | "community" | "trends" | "niche";
  sourceQuality: number; // 0-1
  publishedAt?: number;
  slotHint?: "12:30" | "6:30" | "9:15";
  firstFrameStrength?: number; // 0-1
  visualPower?: number; // 0-1
  curiosity?: number; // 0-1
  safety?: number; // 0-1
  usRelevance?: number; // 0-1
  originality?: number; // 0-1
  noiseRisk?: number; // 0-1
  freshnessDays?: number;
  freshnessLabel?: "fresh" | "rising" | "saturated" | "evergreen" | "noisy";
  saturationLabel?: "fresh" | "rising" | "saturated" | "evergreen" | "noisy";
  breadthMode?: "narrow" | "balanced" | "explorer";
  topicTags?: string[];
  summary?: string;
};

export type Recommendation = {
  slot: "12:30" | "6:30" | "9:15";
  idea: CandidateIdea & { vibedScore: number; signalsMatched: string[]; signalsConflicted: string[] };
  videoType: string;
  hookDirection: string;
  bestTopic: string;
  angle: string;
  avoid: string;
  backupTopics: string[];
  reason: string;
  learnedFrom: "preference" | "internet" | "blended";
  guardrailsApplied: string[];
  driftWarning?: string;
};

export type PatternDecision = "accepted" | "ignored" | "downgraded" | "pending";

const fallbackCandidates: CandidateIdea[] = [
  {
    id: "nasa-aurora",
    title: "NASA camera caught a double aurora spiral over Alaska",
    url: "https://www.nasa.gov/",
    source: "nasa.gov",
    sourceBucket: "science",
    sourceQuality: 0.92,
    slotHint: "12:30",
    firstFrameStrength: 0.86,
    visualPower: 0.88,
    curiosity: 0.82,
    safety: 0.9,
    topicTags: ["space", "visual", "science"]
  },
  {
    id: "factory-lathe",
    title: "Precision lathe slices metal like butter in one pass",
    url: "https://www.sciencedaily.com/",
    source: "sciencedaily.com",
    sourceBucket: "engineering",
    sourceQuality: 0.78,
    slotHint: "6:30",
    firstFrameStrength: 0.78,
    visualPower: 0.84,
    curiosity: 0.64,
    safety: 0.85,
    topicTags: ["engineering", "machines", "satisfying"]
  },
  {
    id: "human-balance",
    title: "Parkour athlete balances on a finger-wide rail 4 stories up",
    url: "https://www.reddit.com/r/nextfuckinglevel/",
    source: "reddit.com",
    sourceBucket: "community",
    sourceQuality: 0.7,
    slotHint: "9:15",
    firstFrameStrength: 0.9,
    visualPower: 0.9,
    curiosity: 0.7,
    safety: 0.62,
    topicTags: ["human skill", "wow", "balance"]
  }
];

function clamp01(n?: number) {
  if (n === undefined || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

async function fetchApprovedSources(profile: BrainProfileData): Promise<CandidateIdea[]> {
  const breadthMode: "narrow" | "balanced" | "explorer" =
    (process.env.VIBED_BREADTH_MODE as any) ?? "balanced";

  // Search pattern templates
  const patternTemplates = [
    "strange but real visual phenomenon",
    "impossible machine precision",
    "hidden process people never see",
    "crazy human control",
    "satisfying system in motion",
    "unreal science visual"
  ];

  // Source buckets with representative seeds
  const buckets: Record<
    "science" | "engineering" | "video" | "community" | "trends" | "niche",
    Array<{ domain: string; quality: number }>
  > = {
    science: [
      { domain: "sciencedaily.com", quality: 0.9 },
      { domain: "nasa.gov", quality: 0.92 },
      { domain: "technologyreview.com", quality: 0.88 },
      { domain: "nature.com", quality: 0.9 }
    ],
    engineering: [
      { domain: "engineering.com", quality: 0.75 },
      { domain: "interestingengineering.com", quality: 0.78 },
      { domain: "designboom.com", quality: 0.7 }
    ],
    video: [
      { domain: "youtube.com/trending", quality: 0.7 },
      { domain: "vimeo.com", quality: 0.65 }
    ],
    community: [
      { domain: "reddit.com/r/nextfuckinglevel", quality: 0.7 },
      { domain: "reddit.com/r/oddlysatisfying", quality: 0.68 },
      { domain: "reddit.com/r/interestingasfuck", quality: 0.7 }
    ],
    trends: [
      { domain: "trends.google.com", quality: 0.7 },
      { domain: "explodingtopics.com", quality: 0.72 }
    ],
    niche: [
      { domain: "colossalmag.com", quality: 0.75 },
      { domain: "thisiscolossal.com", quality: 0.75 }
    ]
  };

  // breadth filter
  const allowedBuckets =
    breadthMode === "narrow"
      ? ["science", "engineering"]
      : breadthMode === "balanced"
        ? ["science", "engineering", "community", "trends"]
        : ["science", "engineering", "community", "trends", "video", "niche"];

  const allowedSet = new Set(allowedBuckets);
  const approvedSet = new Set((profile.approvedSources ?? []).map((d) => d.toLowerCase()));

  const candidates: CandidateIdea[] = [];

  for (const bucketKey of Object.keys(buckets) as Array<keyof typeof buckets>) {
    if (!allowedSet.has(bucketKey)) continue;
    for (const seed of buckets[bucketKey]) {
      // skip if approved list exists and this source isn’t approved
      if (approvedSet.size > 0 && !approvedSet.has(seed.domain)) continue;
      for (const pattern of patternTemplates) {
        candidates.push({
          id: `${bucketKey}-${seed.domain}-${pattern}`.replace(/[^a-z0-9-]+/gi, ""),
          title: synthesizeTitle(bucketKey, pattern),
          url: `https://${seed.domain}`,
          source: seed.domain,
          sourceBucket: bucketKey,
          sourceQuality: seed.quality,
          slotHint: bucketKey === "community" ? "9:15" : bucketKey === "engineering" ? "6:30" : "12:30",
          firstFrameStrength: bucketKey === "engineering" ? 0.7 : 0.65,
          visualPower: bucketKey === "community" ? 0.8 : 0.7,
          curiosity: bucketKey === "science" ? 0.8 : 0.65,
          safety: bucketKey === "community" ? 0.6 : 0.78,
          usRelevance: 0.7,
          originality: bucketKey === "trends" ? 0.55 : 0.7,
          noiseRisk: bucketKey === "community" ? 0.35 : 0.2,
          freshnessDays: 1 + Math.floor(Math.random() * 5),
          topicTags: [pattern],
          breadthMode
        });
      }
    }
  }

  return candidates.length ? candidates : fallbackCandidates;
}

function synthesizeTitle(bucket: CandidateIdea["sourceBucket"], pattern: string) {
  const base = pattern.replace(/(^\w)/, (m) => m.toUpperCase());
  if (bucket === "engineering") return `${base} shown through a precision machine`;
  if (bucket === "community") return `${base} caught on camera`;
  if (bucket === "video") return `${base} trending in clips`;
  if (bucket === "trends") return `${base} that’s rising right now`;
  if (bucket === "niche") return `${base} from a niche creator`;
  return `${base} with proof`;
}

function applyGuardrails(candidates: CandidateIdea[], profile: BrainProfileData) {
  const rules = profile.rejectionRules.map((r) => r.toLowerCase());
  const approved = new Set((profile.approvedSources ?? []).map((s) => s.toLowerCase()));
  const keep: Array<{ idea: CandidateIdea; guardrails: string[] }> = [];

  for (const idea of candidates) {
    const guardrails: string[] = [];
    const sourceOk = approved.size === 0 || approved.has(idea.source.toLowerCase());
    if (!sourceOk) {
      guardrails.push("rejected: source not approved");
    }
    const text = `${idea.title} ${idea.summary ?? ""}`.toLowerCase();
    const violated = rules.find((rule) => text.includes(rule));
    if (violated) {
      guardrails.push(`rejected: ${violated}`);
    }
    if (guardrails.length === 0) {
      keep.push({ idea, guardrails: ["pass"] });
    }
  }
  return keep;
}

function scoreCandidate(idea: CandidateIdea, profile: BrainProfileData) {
  const w = profile.tieBreakWeights;
  const t = profile.tasteProfile;
  const first = clamp01(idea.firstFrameStrength ?? idea.visualPower ?? 0.5);
  const hook = clamp01((idea.curiosity ?? 0.6) * t.hookImportance);
  const replay = clamp01((idea.visualPower ?? 0.6) * t.replayPreference);
  const usFit = clamp01(t.usAudienceBias);
  const safety = clamp01(idea.safety ?? t.repostSafetyThreshold / 100);
  const premium = clamp01(t.premiumFeel);
  const totalW = w.firstFrame + w.hook + w.replay + w.usFit + w.safety + w.premium;
  const freshnessPenalty = idea.freshnessDays && idea.freshnessDays > 5 ? 0.1 : 0;
  const noisePenalty = clamp01(idea.noiseRisk ?? 0.2) * 0.15;
  const vibedScore = Math.round(
    100 *
      ((first * w.firstFrame +
        hook * w.hook +
        premium * w.premium +
        replay * w.replay +
        usFit * w.usFit +
        safety * w.safety) /
        (totalW || 1) -
        freshnessPenalty -
        noisePenalty)
  );
  const signalsMatched = [
    first > 0.7 ? "strong first frame" : "",
    hook > 0.6 ? "hookable" : "",
    replay > 0.6 ? "replayable" : "",
    safety > 0.65 ? "safe enough" : ""
  ].filter(Boolean);
  const signalsConflicted = [
    ...(safety < 0.55 ? ["safety needs review"] : []),
    ...(idea.noiseRisk && idea.noiseRisk > 0.4 ? ["possible noise/spam"] : [])
  ];

  return { vibedScore, signalsMatched, signalsConflicted };
}

function assignSlots(scored: Array<{ idea: CandidateIdea; vibedScore: number; signalsMatched: string[]; signalsConflicted: string[] }>): Recommendation[] {
  const slots: Array<"12:30" | "6:30" | "9:15"> = ["12:30", "6:30", "9:15"];
  const ordered = [...scored].sort((a, b) => b.vibedScore - a.vibedScore);
  const recs: Recommendation[] = [];
  for (const slot of slots) {
    const idx = ordered.findIndex((c) => (c.idea.slotHint ?? slot) === slot);
    const pick = idx >= 0 ? ordered.splice(idx, 1)[0] : ordered.shift();
    if (!pick) continue;
    const backups = ordered.filter((c) => (c.idea.slotHint ?? slot) === slot).slice(0, 2);
    recs.push({
      slot,
      reason: `Best for ${slot} pillar: strong first frame + clear hook.`,
      learnedFrom: "blended",
      guardrailsApplied: ["approved-source", "rejection-rules"],
      videoType: deriveVideoType(pick.idea, slot),
      hookDirection: deriveHookDirection(slot),
      bestTopic: deriveBestTopic(pick.idea, slot),
      angle: deriveAngle(slot),
      avoid: deriveAvoid(slot),
      backupTopics: backups.map((b) => deriveBestTopic(b.idea, slot)),
      idea: { ...pick.idea, vibedScore: pick.vibedScore, signalsMatched: pick.signalsMatched, signalsConflicted: pick.signalsConflicted }
    });
  }
  return recs;
}

function deriveVideoType(idea: CandidateIdea, slot: "12:30" | "6:30" | "9:15") {
  if (slot === "12:30") return "Curiosity / science visual";
  if (slot === "6:30") return "Satisfying engineering demo";
  return "Crazy human skill clip";
}

function deriveHookDirection(slot: "12:30" | "6:30" | "9:15") {
  if (slot === "12:30") return "Clean curiosity hook";
  if (slot === "6:30") return "Satisfying payoff hook";
  return "Impossible-skill hook";
}

function deriveBestTopic(idea: CandidateIdea, slot: "12:30" | "6:30" | "9:15") {
  const txt = idea.title.toLowerCase();
  if (slot === "12:30") {
    if (txt.includes("aurora") || txt.includes("space")) return "A real-looking sci/space visual that feels unreal";
    if (txt.includes("robot")) return "A tiny robot doing something that looks impossible";
    return "A phenomenon that looks fake but is real";
  }
  if (slot === "6:30") {
    if (txt.includes("lathe") || txt.includes("precision")) return "Machine process with impossible precision";
    return "Satisfying engineering process with visible payoff";
  }
  // 9:15
  if (txt.includes("balance") || txt.includes("parkour")) return "Human balance/skill that forces replays";
  return "Crazy human control clip that feels unbelievable";
}

function deriveAngle(slot: "12:30" | "6:30" | "9:15") {
  if (slot === "12:30") return "Looks fake at first glance";
  if (slot === "6:30") return "Impossible precision, visible payoff";
  return "Replay-worthy human control";
}

function deriveAvoid(slot: "12:30" | "6:30" | "9:15") {
  if (slot === "12:30") return "Avoid text-heavy or talking-head explanations";
  if (slot === "6:30") return "Avoid messy camera angles that hide the process";
  return "Avoid blurry clips or unclear subject";
}

function detectDrift(recs: Recommendation[], profile: BrainProfileData) {
  const driftMessages: string[] = [];
  const disliked = new Set(profile.dislikedTraits.map((t) => t.toLowerCase()));
  for (const rec of recs) {
    const text = `${rec.idea.title} ${(rec.idea.topicTags ?? []).join(" ")}`.toLowerCase();
    for (const bad of disliked) {
      if (text.includes(bad)) {
        driftMessages.push(`"${rec.idea.title}" leans into disliked trait "${bad}"`);
      }
    }
  }
  return driftMessages;
}

function whatNotToPost(
  candidates: CandidateIdea[],
  scored: Array<{ idea: CandidateIdea; vibedScore: number; signalsMatched: string[]; signalsConflicted: string[] }>,
  driftWarnings: string[]
) {
  const lowSafety = scored.filter((c) => (c.idea.safety ?? 0.7) < 0.55).map((c) => `${c.idea.title} (safety review)`);
  const weakFirstFrame = scored.filter((c) => (c.idea.firstFrameStrength ?? 0.5) < 0.45).map((c) => `${c.idea.title} (weak first frame)`);
  const repeatedTopics = candidates
    .map((c) => c.topicTags?.[0])
    .filter(Boolean)
    .map((t) => t!.toLowerCase())
    .filter((t, idx, arr) => t && arr.indexOf(t) !== idx)
    .slice(0, 3)
    .map((t) => `Avoid repeating: ${t}`);
  return [...driftWarnings, ...lowSafety, ...weakFirstFrame, ...repeatedTopics];
}

function proposePatterns(candidates: CandidateIdea[], profile: BrainProfileData) {
  const existing = new Set((profile.pendingPatterns ?? []).map((p) => p.pattern));
  const patterns: Array<{ pattern: string; source: string; decision: PatternDecision; addedAt: number }> = [];
  candidates.forEach((c) => {
    const key = (c.topicTags?.[0] ?? c.title.split(" ")[0]).toLowerCase();
    if (!existing.has(key)) {
      patterns.push({ pattern: key, source: c.source, decision: "pending", addedAt: Date.now() });
    }
  });
  return patterns;
}

export async function runLearningLoop() {
  const profile = await loadBrainProfile();
  const candidates = await fetchApprovedSources(profile);
  const guarded = applyGuardrails(candidates, profile);
  const scored = guarded.map(({ idea, guardrails }) => {
    const scoredIdea = scoreCandidate(idea, profile);
    return { idea, ...scoredIdea, guardrails };
  });
  const recs = assignSlots(scored);
  const driftWarnings = detectDrift(recs, profile);
  const patterns = proposePatterns(candidates, profile);
  const notToPost = whatNotToPost(candidates, scored, driftWarnings);

  if (patterns.length > 0) {
    await updateBrainProfile({ pendingPatterns: [...(profile.pendingPatterns ?? []), ...patterns] });
  }
  if (driftWarnings.length > 0) {
    await updateBrainProfile({ driftAlerts: driftWarnings });
  }

  return { recs, driftWarnings, pendingPatterns: patterns, notToPost };
}

export async function recordPatternDecision(pattern: string, decision: PatternDecision) {
  const profile = await loadBrainProfile();
  const updated = (profile.pendingPatterns ?? []).map((p) => (p.pattern === pattern ? { ...p, decision } : p));
  await updateBrainProfile({ pendingPatterns: updated });
  return updated;
}

export async function summarizeLearningState() {
  const profile = await loadBrainProfile();
  const feedback = await prisma.brainFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 100 }).catch(() => []);
  return {
    profileName: profile.name,
    approvedSources: profile.approvedSources,
    pendingPatterns: profile.pendingPatterns,
    driftAlerts: profile.driftAlerts,
    feedbackCount: feedback.length
  };
}
