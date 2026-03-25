import { NextResponse } from "next/server";
import { brainWeight, brainNotes } from "@/lib/vibed-brain-lite";
import { fetchTrendingContent, type TrendItem } from "@/lib/trendFetcher";

export const runtime = "nodejs";

type Rec = {
  slot: "12:30 PM" | "6:30 PM" | "9:15 PM";
  timeslot: string;
  category: string;
  hook: string;
  what_to_show: string;
  why_it_works: string;
  caption: string;
  pinned_comment: string;
  hashtags: string[];
  videoType: string;
  bestTopic: string;
  angle: string;
  hookDirection: string;
  backupTopics: string[];
  avoid: string;
  videoHint: string;
  hookStyle: string;
  viralScore: number;
  categoryLabel: string;
  scoreBreakdown?: {
    engagement: number;
    trendRelevance: number;
    categoryMatch: number;
  };
  sourceName?: string;
  sourceUrl?: string;
  description?: string;
  engagement?: {
    likes: number;
    comments: number;
    upvotes: number;
  };
};

type NicheContext = {
  niche: string;
  platform: string;
  tone: string;
  audience: string;
};

type NicheProfile = {
  subject: string;
  descriptor: string;
  topicPrefix: string;
  anglePrefix: string;
  videoHint: string;
  backupPrefix: string;
  nicheKeywords: string[];
  fallbackTopics: string[];
  hashtags: string[];
};

type HookPattern =
  | "hidden_truth"
  | "impossible_visual"
  | "process_payoff"
  | "fast_transformation"
  | "future_tech_shock";

const slotTemplates = {
  "12:30 PM": {
    videoType: ["Strange science visual", "AI that looks impossible", "Space/physics moment", "Weird-but-real phenomenon"],
    angles: ["Looks fake at first glance", "Science that feels like magic", "Proof the future is already here", "Reality bending moment"],
    hookDirections: ["Curiosity hook", "Mind-bend hook", "Wait-what hook"],
    hint: ["Look for microscope or tiny-scale science visuals", "Look for weird materials or unusual discoveries", "Look for robotics demos or surprising visual explanations"],
    category: "curiosity",
    categoryLabel: "curiosity/science"
  },
  "6:30 PM": {
    videoType: ["Satisfying machine process", "Precision manufacturing close-up", "CNC perfection clip", "Assembly line magic"],
    angles: ["Impossible precision", "One wobble ruins the part", "Watch the payoff click into place", "Hidden process revealed"],
    hookDirections: ["Satisfying payoff hook", "Precision hook", "Process reveal hook"],
    hint: ["Look for clean machine precision with obvious payoff", "Look for assembly lines or perfect automation", "Look for cutting/shaping/forming with smooth visuals"],
    category: "precision",
    categoryLabel: "satisfying/engineering"
  },
  "9:15 PM": {
    videoType: ["Crazy human control clip", "Skill that forces replays", "Balance/parkour precision", "Hands-only impossible task"],
    angles: ["One mistake = pain", "Replay-worthy control", "Human aimbot moment", "How is this even possible"],
    hookDirections: ["Impossible-skill hook", "Tension hook", "Replay hook"],
    hint: ["Look for replay-worthy human skill or impossible control", "Look for shock moments with perfect timing", "Look for strange natural or extreme visual moments"],
    category: "shock",
    categoryLabel: "crazy human skill"
  }
} as const;

const topicVariants = [
  "Machine slices metal threads thinner than hair",
  "Robot arm stacks glass without a single rattle",
  "Laser locks onto dust particles mid-air",
  "CNC carves channels thinner than paper",
  "AI-guided drone flies through a keyhole",
  "Hydraulic press stopping at 0.01mm",
  "Parkour on a rail the width of a finger",
  "Welder draws a perfect spiral bead blindfolded",
  "Jet of water cuts marble like foam",
  "Microscope shows crystals growing in seconds",
  "3D printer swaps tools mid-print flawlessly",
  "Assembler snaps 200 parts with zero misalignments",
  "Metrology arm catching a defect no eye can see",
  "Drone swarm flies a perfect helix indoors",
  "Optical illusion in real life—no CGI",
  "Chip pick-and-place moving at blur speed"
];

let lastTopics: string[] = [];
let lastHookPatterns: HookPattern[] = [];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uniqueTopic(used: Set<string>): string {
  let tries = 0;
  while (tries < 20) {
    const t = pick(topicVariants);
    if (!lastTopics.includes(t) && !used.has(t)) {
      return t;
    }
    tries++;
  }
  return pick(topicVariants);
}

function buildRec(slot: Rec["slot"]): Rec {
  const templates = slotTemplates[slot];
  const used = new Set<string>();
  const candidates: Rec[] = Array.from({ length: 4 }).map(() => {
    const bestTopic = uniqueTopic(used);
    used.add(bestTopic);
    const backup1 = uniqueTopic(used);
    used.add(backup1);
    const backup2 = uniqueTopic(used);
    used.add(backup2);
    const hookDirection = pick(templates.hookDirections as unknown as string[]);
    const angle = pick(templates.angles as unknown as string[]);
    const videoType = pick(templates.videoType as unknown as string[]);
    const hook = makeHook(bestTopic, angle);
    const videoHint = pick(templates.hint as unknown as string[]);
    return {
      slot,
      timeslot: slot,
      category: templates.categoryLabel,
      hook,
      what_to_show: videoHint,
      why_it_works: explainWhyItWorks(angle, slot, templates.categoryLabel, "viral"),
      caption: buildCaption(hook, bestTopic, slot, { niche: "", platform: "Instagram", tone: "viral", audience: "general audience" }, defaultNicheProfile("creator")),
      pinned_comment: buildPinnedComment(slot, templates.categoryLabel),
      hashtags: ["#viralideas", "#contentstrategy", "#creatortips"],
      videoType,
      bestTopic,
      angle,
      hookDirection,
      backupTopics: [backup1, backup2],
      avoid: slot === "9:15 PM" ? "Avoid blurry or shaky clips" : slot === "6:30 PM" ? "Avoid messy camera angles" : "Avoid text-heavy overlays",
      videoHint,
      hookStyle: hookDirection.toLowerCase(),
      viralScore: scoreViral(bestTopic, angle, hookDirection, slot, templates.category),
      categoryLabel: templates.categoryLabel
    };
  });

  candidates.sort((a, b) => {
    const wa = brainWeight(slot, templates.category, a.hookStyle);
    const wb = brainWeight(slot, templates.category, b.hookStyle);
    return wb - wa;
  });
  return candidates[0];
}

function buildRecFromTrends(slot: Rec["slot"], items: TrendItem[], nicheContext: NicheContext): Rec {
  const templates = slotTemplates[slot];
  const profile = defaultNicheProfile(nicheContext.niche || "creator");
  const slotPool = items.filter((item) => fitsSlot(slot, item.category) && !lastTopics.includes(item.title));
  const nichePool = nicheContext.niche.trim()
    ? slotPool.filter((item) => nicheTrendScore(item, profile) >= 1)
    : slotPool;
  const pool = nichePool.length ? nichePool : slotPool;
  if (!pool.length) {
    return personalizeRec(buildRec(slot), nicheContext);
  }

  const used = new Set<string>();
  const candidates: Rec[] = pool.slice(0, 8).map((item) => {
    used.add(item.title);
    const backupTopics = pool
      .filter((candidate) => candidate.id !== item.id && !used.has(candidate.title))
      .slice(0, 2)
      .map((candidate) => candidate.title);
    const hookDirection = pick(slotTemplates[slot].hookDirections as unknown as string[]);
    const angle = deriveAngle(item, slot);
    const videoType = deriveVideoType(item, slot);
    const videoHint = deriveVideoHint(item, slot);
    const scoreBreakdown = buildScoreBreakdown(item, slot);
    return personalizeRec({
      slot,
      timeslot: slot,
      category: templates.categoryLabel,
      hook: makeHook(item.title, angle),
      what_to_show: videoHint,
      why_it_works: explainWhyItWorks(angle, slot, templates.categoryLabel, nicheContext.tone),
      caption: "",
      pinned_comment: "",
      hashtags: [],
      videoType,
      bestTopic: item.title,
      angle,
      hookDirection,
      backupTopics,
      avoid: slot === "9:15 PM" ? "Avoid blurry or shaky clips" : slot === "6:30 PM" ? "Avoid messy camera angles" : "Avoid text-heavy overlays",
      videoHint,
      hookStyle: hookDirection.toLowerCase(),
      viralScore: scoreViral(item.title, angle, hookDirection, slot, templates.category, item, scoreBreakdown),
      categoryLabel: templates.categoryLabel,
      scoreBreakdown,
      sourceName: item.sourceName,
      sourceUrl: item.url,
      description: item.description,
      engagement: {
        likes: 0,
        comments: item.comments,
        upvotes: item.upvotes
      }
    }, nicheContext);
  });

  candidates.sort((a, b) => {
    const wa = brainWeight(slot, templates.category, a.hookStyle) + a.viralScore;
    const wb = brainWeight(slot, templates.category, b.hookStyle) + b.viralScore;
    return wb - wa;
  });

  return candidates[0] ?? buildRec(slot);
}

function makeHook(topic: string, _angle: string): string {
  const pattern = chooseHookPattern({
    niche: "",
    platform: "Instagram",
    tone: "viral",
    audience: "general audience"
  }, topic, "12:30 PM");
  return buildHookFromPattern(pattern, topic, "creator", "Instagram");
}

function scoreViral(
  topic: string,
  angle: string,
  hookDirection: string,
  slot: Rec["slot"],
  category: string,
  item?: TrendItem,
  breakdown?: { engagement: number; trendRelevance: number; categoryMatch: number }
) {
  let score = breakdown
    ? Math.round(breakdown.engagement * 0.45 + breakdown.trendRelevance * 0.25 + breakdown.categoryMatch * 0.3)
    : 72;
  if (topic.toLowerCase().includes("microscope") || topic.toLowerCase().includes("laser")) score += 8;
  if (topic.toLowerCase().includes("cnc") || topic.toLowerCase().includes("precision")) score += 9;
  if (topic.toLowerCase().includes("parkour") || topic.toLowerCase().includes("balance")) score += 10;
  if (angle.toLowerCase().includes("fake") || angle.toLowerCase().includes("impossible")) score += 6;
  if (hookDirection.toLowerCase().includes("wait") || hookDirection.toLowerCase().includes("replay")) score += 4;
  if (slot === "9:15 PM" && category === "shock") score += 4;
  if (item) {
    score += Math.min(8, Math.round(item.upvotes / 2500));
    score += Math.min(5, Math.round(item.comments / 150));
  }
  return Math.min(100, score);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nicheContext: NicheContext = {
    niche: searchParams.get("niche")?.trim() ?? "",
    platform: searchParams.get("platform")?.trim() ?? "Instagram",
    tone: searchParams.get("tone")?.trim() ?? "viral",
    audience: searchParams.get("audience")?.trim() ?? "general audience"
  };
  const trends = await fetchTrendingContent().catch(() => []);
  const recs: Rec[] = ["12:30 PM", "6:30 PM", "9:15 PM"].map((slot) =>
    trends.length
      ? buildRecFromTrends(slot as Rec["slot"], trends, nicheContext)
      : personalizeRec(buildRec(slot as Rec["slot"]), nicheContext)
  );
  lastTopics = recs.map((r) => r.bestTopic);
  lastHookPatterns = recs.map((r) => inferPatternFromHook(r.hook));
  const notToPost = ["No talking-head rants today", "Skip boring time-lapses", "Avoid shaky phone footage"];
  return NextResponse.json({ recs, notToPost, brainNotes: brainNotes() });
}

function fitsSlot(slot: Rec["slot"], category: TrendItem["category"]) {
  if (slot === "12:30 PM") return category === "science";
  if (slot === "6:30 PM") return category === "engineering";
  return category === "human skill";
}

function deriveAngle(item: TrendItem, slot: Rec["slot"]) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes("microscope") || text.includes("tiny")) return "Looks fake at first glance";
  if (text.includes("precision") || text.includes("cnc") || text.includes("machine")) return "Impossible precision";
  if (text.includes("balance") || text.includes("parkour") || text.includes("skill")) return "Replay-worthy control";
  if (slot === "9:15 PM") return "How is this even possible";
  if (slot === "6:30 PM") return "Hidden process revealed";
  return "Science that feels like magic";
}

function deriveVideoType(item: TrendItem, slot: Rec["slot"]) {
  if (item.category === "science") return "Strange science visual";
  if (item.category === "engineering") return "Satisfying machine process";
  if (item.category === "human skill") return "Crazy human control clip";
  return pick(slotTemplates[slot].videoType as unknown as string[]);
}

function deriveVideoHint(item: TrendItem, slot: Rec["slot"]) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (item.category === "science" && (text.includes("microscope") || text.includes("tiny"))) {
    return "Look for microscope or tiny-scale science visuals";
  }
  if (item.category === "engineering" && (text.includes("machine") || text.includes("precision") || text.includes("cnc"))) {
    return "Look for clean machine precision with obvious payoff";
  }
  if (item.category === "human skill" && (text.includes("balance") || text.includes("control") || text.includes("skill"))) {
    return "Look for replay-worthy human skill or impossible control";
  }
  return pick(slotTemplates[slot].hint as unknown as string[]);
}

function buildScoreBreakdown(item: TrendItem, slot: Rec["slot"]) {
  return {
    engagement: scoreEngagement(item),
    trendRelevance: scoreTrendRelevance(item),
    categoryMatch: scoreCategoryMatch(item, slot)
  };
}

function scoreEngagement(item: TrendItem) {
  return item.engagementScore;
}

function scoreTrendRelevance(item: TrendItem) {
  const ageHours = Math.max(0, (Date.now() - new Date(item.createdTime).getTime()) / (1000 * 60 * 60));
  if (ageHours <= 6) return 98;
  if (ageHours <= 24) return 92;
  if (ageHours <= 48) return 84;
  if (ageHours <= 96) return 74;
  return 62;
}

function scoreCategoryMatch(item: TrendItem, slot: Rec["slot"]) {
  if (fitsSlot(slot, item.category)) return 96;
  if (slot === "12:30 PM" && item.category === "engineering") return 68;
  if (slot === "6:30 PM" && item.category === "science") return 64;
  if (slot === "9:15 PM" && item.category === "science") return 58;
  return 52;
}

function personalizeRec(rec: Rec, nicheContext: NicheContext): Rec {
  const niche = nicheContext.niche.trim().toLowerCase();
  if (!niche) return rec;

  const profile = defaultNicheProfile(niche);
  const fallbackTopic = profile.fallbackTopics[slotIndex(rec.slot) % profile.fallbackTopics.length];
  const bestTopic = normalizeNicheTopic(rec.bestTopic, profile, fallbackTopic);
  const angle = `${profile.anglePrefix}${rec.angle.toLowerCase()} for ${nicheContext.audience.toLowerCase()}`;
  const whatToShow = buildWhatToShow(bestTopic, rec.slot, nicheContext, profile);
  const hook = makeNicheHook(bestTopic, nicheContext, profile, rec.slot);
  const whyItWorks = explainWhyItWorks(angle, rec.slot, rec.categoryLabel, nicheContext.tone);
  const caption = buildCaption(hook, bestTopic, rec.slot, nicheContext, profile);
  const backupTopics = profile.fallbackTopics.filter((topic) => topic !== fallbackTopic).slice(0, 2);
  const scoreBoost = nicheMatchBoost(niche, rec.categoryLabel);

  return {
    ...rec,
    timeslot: rec.slot,
    category: `${profile.subject} / ${rec.categoryLabel}`,
    hook,
    what_to_show: whatToShow,
    why_it_works: whyItWorks,
    caption,
    pinned_comment: buildPinnedComment(rec.slot, profile.subject.toLowerCase()),
    hashtags: buildHashtags(profile, nicheContext),
    bestTopic,
    angle,
    videoHint: whatToShow,
    backupTopics,
    viralScore: Math.min(100, rec.viralScore + scoreBoost)
  };
}

function defaultNicheProfile(niche: string): NicheProfile {
  if (/(ai|tech|software|tools|saas)/.test(niche)) {
    return {
      subject: "AI",
      descriptor: "AI tools and future tech",
      topicPrefix: "tool demo or future-use case around",
      anglePrefix: "Make it feel useful and surprising. ",
      videoHint: "Look for fast AI demos, before/after tools, or weird automation moments.",
      backupPrefix: "AI spin on ",
      nicheKeywords: ["ai", "tool", "automation", "website", "workflow", "agent", "software", "future"],
      fallbackTopics: [
        "an AI tool that finishes a real task in seconds",
        "a weird automation creators would instantly save",
        "a future-tech demo that looks unreal at first"
      ],
      hashtags: ["#aitools", "#futuretech", "#automation", "#creatorai"]
    };
  }
  if (/(fitness|gym|workout)/.test(niche)) {
    return {
      subject: "Fitness",
      descriptor: "fitness transformation and training",
      topicPrefix: "training or body-performance version of",
      anglePrefix: "Show progress, difficulty, or payoff. ",
      videoHint: "Look for striking form, transformation, or impossible training visuals.",
      backupPrefix: "Fitness angle on ",
      nicheKeywords: ["fitness", "gym", "workout", "muscle", "fat loss", "meal", "training", "form"],
      fallbackTopics: [
        "a workout mistake that changes results fast",
        "a fat-loss tip people usually miss",
        "a muscle-building habit with visible payoff"
      ],
      hashtags: ["#fitness", "#workouttips", "#fatloss", "#muscle"]
    };
  }
  if (/(cars|luxury cars|automotive)/.test(niche)) {
    return {
      subject: "Cars",
      descriptor: "cars and hidden engineering",
      topicPrefix: "performance or design angle of",
      anglePrefix: "Make it feel premium and replay-worthy. ",
      videoHint: "Look for engine detail, satisfying build quality, or insane driving control.",
      backupPrefix: "Car angle on ",
      nicheKeywords: ["car", "supercar", "engine", "speed", "luxury", "automotive", "spec", "design"],
      fallbackTopics: [
        "a supercar detail most people never notice",
        "hidden engineering inside an expensive car",
        "a rare car feature that feels unreal in person"
      ],
      hashtags: ["#luxurycars", "#supercars", "#carcontent", "#cartech"]
    };
  }
  if (/(fashion|style|luxury)/.test(niche)) {
    return {
      subject: "Fashion",
      descriptor: "fashion styling and luxury detail",
      topicPrefix: "style or craftsmanship angle of",
      anglePrefix: "Make it feel premium and visual first. ",
      videoHint: "Look for satisfying making process, luxury detail, or a visual wow moment.",
      backupPrefix: "Fashion angle on ",
      nicheKeywords: ["fashion", "style", "outfit", "luxury", "designer", "styling", "wardrobe", "fit"],
      fallbackTopics: [
        "a styling trick that changes the whole outfit",
        "a luxury detail people only notice up close",
        "an outfit transformation that feels instantly expensive"
      ],
      hashtags: ["#fashion", "#stylingtips", "#luxurystyle", "#outfitideas"]
    };
  }
  if (/(business|entrepreneur|startup|marketing)/.test(niche)) {
    return {
      subject: "Business",
      descriptor: "business growth and systems",
      topicPrefix: "strategy or money angle around",
      anglePrefix: "Make it feel practical and worth saving. ",
      videoHint: "Look for simple business lessons, high-value systems, or money-making proof points.",
      backupPrefix: "Business angle on ",
      nicheKeywords: ["business", "startup", "marketing", "sales", "growth", "entrepreneur", "offer", "client"],
      fallbackTopics: [
        "a business lesson most creators learn too late",
        "a simple growth system that saves hours",
        "a money-making idea with clear proof"
      ],
      hashtags: ["#business", "#marketingtips", "#entrepreneur", "#growth"]
    };
  }
  if (/(finance|money|investing)/.test(niche)) {
    return {
      subject: "Finance",
      descriptor: "money and investing",
      topicPrefix: "money or wealth lesson around",
      anglePrefix: "Make it feel clear, useful, and slightly shocking. ",
      videoHint: "Look for surprising money facts, wealth visuals, or fast explainers with payoff.",
      backupPrefix: "Finance angle on ",
      nicheKeywords: ["finance", "money", "investing", "wealth", "income", "saving", "stocks", "cash"],
      fallbackTopics: [
        "a money mistake people repeat for years",
        "a wealth rule that sounds wrong at first",
        "a finance habit that changes long-term results"
      ],
      hashtags: ["#finance", "#moneytips", "#investing", "#wealth"]
    };
  }
  if (/(travel)/.test(niche)) {
    return {
      subject: "Travel",
      descriptor: "travel and visual discovery",
      topicPrefix: "destination or hidden-spot angle of",
      anglePrefix: "Make it feel visual and hard to ignore. ",
      videoHint: "Look for unreal places, satisfying journeys, or surprising local moments.",
      backupPrefix: "Travel angle on ",
      nicheKeywords: ["travel", "destination", "hotel", "flight", "island", "city", "trip", "journey"],
      fallbackTopics: [
        "a place that looks fake in real life",
        "a travel detail most people miss completely",
        "a hidden spot that feels unreal on camera"
      ],
      hashtags: ["#travel", "#wanderlust", "#travelideas", "#hiddenplaces"]
    };
  }

  return {
    subject: capitalize(niche),
    descriptor: `${niche} niche`,
    topicPrefix: `${niche} version of`,
    anglePrefix: "Make it feel native to the niche. ",
    videoHint: `Look for visuals, stories, or demos that feel native to ${niche}.`,
    backupPrefix: `${capitalize(niche)} angle on `,
    nicheKeywords: niche.split(/\s+/).filter(Boolean),
    fallbackTopics: [
      `a ${niche} idea people would instantly save`,
      `a ${niche} detail that feels surprisingly useful`,
      `a ${niche} post angle people would replay twice`
    ],
    hashtags: [`#${niche.replace(/\s+/g, "")}`, "#contentideas", "#creator", "#viralpost"]
  };
}

function makeNicheHook(topic: string, nicheContext: NicheContext, profile: NicheProfile, slot: Rec["slot"]) {
  const pattern = chooseHookPattern(nicheContext, topic, slot);
  return buildHookFromPattern(pattern, topic, profile.subject.toLowerCase(), nicheContext.platform);
}

function nicheMatchBoost(niche: string, categoryLabel: string) {
  if (/(ai|tech|tools|software)/.test(niche) && categoryLabel.includes("science")) return 6;
  if (/(fitness|cars|fashion|travel)/.test(niche) && categoryLabel.includes("human skill")) return 5;
  if (/(business|finance)/.test(niche) && categoryLabel.includes("science")) return 4;
  return 2;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeNicheTopic(bestTopic: string, profile: NicheProfile, fallbackTopic: string) {
  const text = bestTopic.toLowerCase();
  const matches = profile.nicheKeywords.some((keyword) => text.includes(keyword));
  return matches ? bestTopic : fallbackTopic;
}

function nicheTrendScore(item: TrendItem, profile: NicheProfile) {
  const haystack = `${item.title} ${item.description}`.toLowerCase();
  return profile.nicheKeywords.reduce((total, keyword) => total + (haystack.includes(keyword) ? 1 : 0), 0);
}

function buildWhatToShow(topic: string, slot: Rec["slot"], nicheContext: NicheContext, profile: NicheProfile) {
  const platformLine =
    nicheContext.platform === "TikTok"
      ? "Keep the payoff in the first second."
      : nicheContext.platform === "YouTube Shorts"
        ? "Show the proof before the explanation."
        : "Lead with the strongest visual frame.";
  return `${profile.videoHint} Focus on ${topic.toLowerCase()}. ${platformLine}`;
}

function explainWhyItWorks(angle: string, slot: Rec["slot"], _category: string, tone: string) {
  const slotReason =
    slot === "12:30 PM"
      ? "It opens a curiosity gap right away."
      : slot === "6:30 PM"
        ? "It rewards replay with visible precision."
        : "It feels impossible enough to spark comments and replays.";
  const toneReason =
    tone === "educational"
      ? "The payoff is clear without feeling heavy."
      : tone === "storytelling"
        ? "It pulls people into the moment before the reveal."
        : tone === "authority"
          ? "It feels confident and specific at a glance."
          : tone === "luxury"
            ? "It feels premium and hard to ignore."
            : "The contrast makes people stop and look twice.";
  return `${slotReason} ${toneReason}`;
}

function buildCaption(hook: string, topic: string, _slot: Rec["slot"], nicheContext: NicheContext, profile: NicheProfile) {
  const line1 =
    nicheContext.tone === "storytelling"
      ? "At first this just feels unreal."
      : nicheContext.tone === "authority"
        ? "Most people miss why this matters so fast."
        : nicheContext.tone === "luxury"
          ? "This feels way more premium than it should."
          : `This is the kind of ${profile.subject.toLowerCase()} post people stop for instantly.`;
  const line2 =
    nicheContext.platform === "YouTube Shorts"
      ? `The real hook is how clearly ${topic.toLowerCase()} proves the point.`
      : nicheContext.platform === "TikTok"
        ? "Then the detail lands and you want another replay."
        : "Then the visual payoff hits and it feels worth sharing.";
  const line3 =
    nicheContext.audience === "beginners"
      ? "Would this still make sense if you were brand new?"
      : nicheContext.audience === "creators"
        ? "Would your audience watch this twice?"
        : "Would you stop scrolling for this?";
  return [line1, "", line2, "", line3].join("\n");
}

function buildPinnedComment(slot: Rec["slot"], subject: string) {
  if (slot === "9:15 PM") return `Real skill or pure luck in ${subject}?`;
  if (slot === "6:30 PM") return "Would you watch the full process on this?";
  return `Have you seen ${subject} content like this before?`;
}

function buildHashtags(profile: NicheProfile, nicheContext: NicheContext) {
  const tags = [...profile.hashtags];
  if (nicheContext.platform === "TikTok") tags.push("#fyp");
  return tags.slice(0, 4);
}

function chooseHookPattern(nicheContext: NicheContext, topic: string, slot: Rec["slot"]): HookPattern {
  const niche = nicheContext.niche.toLowerCase();
  const platform = nicheContext.platform.toLowerCase();
  const text = topic.toLowerCase();
  const preferred: HookPattern[] = [];

  if (/(ai|tech|software|tools|saas)/.test(niche) || /ai|robot|automation|future|tool/.test(text)) {
    preferred.push("future_tech_shock", "hidden_truth");
  }
  if (/(fitness|fashion|travel)/.test(niche) || /before|after|transform|fix/.test(text)) {
    preferred.push("fast_transformation");
  }
  if (/(cars|engineering|finance|business)/.test(niche) || /process|machine|precision|build|engine|clean/.test(text)) {
    preferred.push("process_payoff");
  }
  if (slot === "9:15 PM" || /fake|impossible|illegal|balance|control/.test(text)) {
    preferred.push("impossible_visual");
  }
  if (!preferred.length || nicheContext.tone === "authority" || platform.includes("youtube")) {
    preferred.push("hidden_truth");
  }

  const unique = preferred.filter((pattern, index) => preferred.indexOf(pattern) === index);
  const filtered = unique.filter((pattern) => !lastHookPatterns.slice(-2).includes(pattern));
  return pick((filtered.length ? filtered : unique) as HookPattern[]);
}

function buildHookFromPattern(pattern: HookPattern, topic: string, subject: string, platform: string) {
  const tail = extractTopicTail(topic);
  const platformTag = platform === "YouTube Shorts" ? "to be real" : platform === "TikTok" ? "on camera" : "at first";
  const templates: Record<HookPattern, string[]> = {
    hidden_truth: [
      `Nobody tells you this about ${tail}`,
      `This part changes everything in ${tail}`,
      `The detail most people miss in ${tail}`
    ],
    impossible_visual: [
      `This looks fake until ${tail}`,
      `${tail} should not move like this`,
      `${tail} feels illegal to watch ${platformTag}`
    ],
    process_payoff: [
      `Wait for the final result on ${tail}`,
      `The ending makes ${tail} worth it`,
      `${tail} gets cleaner every second`
    ],
    fast_transformation: [
      `10 seconds changed ${tail} completely`,
      `Before and after ${tail} feels unreal`,
      `${tail} fixed the whole problem instantly`
    ],
    future_tech_shock: [
      `This ${subject} tool feels illegal`,
      `The future is already here with ${tail}`,
      `${tail} looks too advanced to be real`
    ]
  };

  const chosen = pick(templates[pattern]).replace(/\s+/g, " ").trim();
  return chosen.split(/\s+/).slice(0, 10).join(" ");
}

function inferPatternFromHook(hook: string): HookPattern {
  const value = hook.toLowerCase();
  if (value.includes("nobody tells you") || value.includes("most people miss") || value.includes("changes everything")) {
    return "hidden_truth";
  }
  if (value.includes("looks fake") || value.includes("illegal to watch") || value.includes("move like this")) {
    return "impossible_visual";
  }
  if (value.includes("final result") || value.includes("worth it") || value.includes("cleaner every second")) {
    return "process_payoff";
  }
  if (value.includes("before and after") || value.includes("changed") || value.includes("fixed")) {
    return "fast_transformation";
  }
  return "future_tech_shock";
}

function extractTopicTail(topic: string) {
  return topic.split(/\s+/).slice(0, 6).join(" ");
}

function slotIndex(slot: Rec["slot"]) {
  if (slot === "12:30 PM") return 0;
  if (slot === "6:30 PM") return 1;
  return 2;
}
