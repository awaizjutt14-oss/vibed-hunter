type TransformInput = {
  title: string;
  summary: string;
  bestPlatform: string;
  visualStrength: number;
  repostSafety: number;
  bestSlot: string;
  contentMode: string;
  sourceCount: number;
};

type QualityBreakdown = {
  scrollStopper: number;
  instantClarity: number;
  visualReadiness: number;
  hookCompactness: number;
  repostConfidence: number;
  platformReadiness: number;
};

export type CreatorOpportunity = {
  cleanTitle: string;
  angle: string;
  hook: string;
  hookCandidates: string[];
  whyFits: string;
  visualExplanation: string;
  shortFormReason: string;
  slotReason: string;
  editorialScore: number;
  qualityBreakdown: QualityBreakdown;
  rejectionReasons: string[];
  ctaLabel: string;
};

export type QuickPostPreview = {
  hook: string;
  caption: string;
  pinnedComment: string;
  onScreenText: string;
  coverText: string;
  hashtags: string;
  safetyNote: string;
};

const subjectStopwords = new Set([
  "the",
  "a",
  "an",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "into",
  "what",
  "when",
  "your",
  "their",
  "about",
  "to",
  "after",
  "over",
  "under",
  "using",
  "how",
  "why",
  "ask",
  "inside",
  "google",
  "openai",
  "our",
  "does",
  "hub",
  "management",
  "company",
  "news",
  "residents",
  "training",
  "asset",
  "best",
  "more",
  "just",
  "latest",
  "new",
  "update"
]);

const corporateTerms = [
  "program",
  "initiative",
  "partnership",
  "asset management",
  "company news",
  "funding",
  "investment",
  "acquisition",
  "acquire",
  "launches",
  "announces",
  "earnings",
  "policy",
  "statement"
];

const awkwardTerms = ["works better as a short", "visual payoff", "turned into a real visual", "is worth posting today"];

export function buildCreatorOpportunity(input: TransformInput): CreatorOpportunity {
  const cleanTitle = cleanSourceTitle(input.title);
  const angle = buildAngle(cleanTitle, input.summary);
  const hookCandidates = makeHookCandidates(cleanTitle, input.summary, input.bestSlot);
  const hook = chooseBestHook({
    candidates: hookCandidates,
    title: cleanTitle,
    summary: input.summary,
    bestSlot: input.bestSlot
  });
  const whyFits = makeWhyFits(input.bestSlot, input.bestPlatform, input.visualStrength, input.repostSafety);
  const visualExplanation = makeVisualExplanation(cleanTitle, input.summary);
  const shortFormReason = makeShortFormReason(input.bestPlatform, input.bestSlot);
  const slotReason = makeSlotReason(input.bestSlot, input.visualStrength, input.repostSafety);
  const qualityBreakdown = scoreOpportunityQuality({
    hook,
    visualStrength: input.visualStrength,
    repostSafety: input.repostSafety,
    bestPlatform: input.bestPlatform,
    cleanTitle,
    summary: input.summary
  });
  const editorialScore = average(Object.values(qualityBreakdown));
  const rejectionReasons = collectRejectionReasons({
    hook,
    editorialScore,
    qualityBreakdown,
    visualStrength: input.visualStrength,
    repostSafety: input.repostSafety,
    title: cleanTitle,
    summary: input.summary
  });

  return {
    cleanTitle,
    angle,
    hook,
    hookCandidates,
    whyFits,
    visualExplanation,
    shortFormReason,
    slotReason,
    editorialScore,
    qualityBreakdown,
    rejectionReasons,
    ctaLabel: editorialScore > 84 ? "Use now" : "Generate caption"
  };
}

export function buildQuickPostPreview(input: {
  hook: string;
  title: string;
  summary: string;
  shortFormReason: string;
  visualExplanation: string;
  whyFits: string;
  repostSafety: number;
}) {
  const hashtags = buildHashtags(input.title, input.summary);
  const coverText = buildCoverText(input.hook, input.title);
  const safetyNote =
    input.repostSafety > 80
      ? "Low-risk to adapt if you keep the framing original and link the source."
      : "Double-check footage ownership and keep the framing clearly transformative.";

  return {
    hook: input.hook,
    caption: [
      "Follow @vibed.media for ideas shaping the future.",
      "",
      input.hook,
      input.visualExplanation,
      input.shortFormReason,
      "",
      hashtags,
      "",
      "Source note: verify details before posting."
    ].join("\n"),
    pinnedComment: "Would you post this angle now or save it for later?",
    onScreenText: [input.hook, input.whyFits, "Wait for the payoff."].join("\n"),
    coverText,
    hashtags,
    safetyNote
  } satisfies QuickPostPreview;
}

function cleanSourceTitle(title: string) {
  return title
    .replace(/^(ask\s+\w+\s*)/i, "")
    .replace(/^(inside\s+\w+\s*)/i, "")
    .replace(/\s*[-|]\s*(bbc|reuters|cnn|openai|google|reddit|techcrunch|the verge|ars technica).*$/i, "")
    .replace(/^[\"'“”]+|[\"'“”]+$/g, "")
    .replace(/\([^)]*\)$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildAngle(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (containsAny(text, ["robot", "ai", "machine", "microscopic", "scientists"])) {
    return "Frame it as a science visual that feels impossible at first glance.";
  }
  if (containsAny(text, ["bridge", "engineering", "design", "build", "tower", "tool"])) {
    return "Lead with the impossible-looking build, then explain why it works.";
  }
  if (containsAny(text, ["ocean", "space", "animal", "storm", "volcano", "nature"])) {
    return "Use the visual shock first and keep the explanation simple.";
  }
  if (containsAny(text, ["skill", "precision", "craft", "record", "artist"])) {
    return "Package it like human skill that does not look real.";
  }
  return "Use a curiosity-first hook that makes the visual carry the post.";
}

function makeHookCandidates(title: string, summary: string, bestSlot: string) {
  const text = `${title} ${summary}`.toLowerCase();
  const subject = compactSubject(title);
  const subjectLead = subject ? `This ${subject}` : "This";

  const scienceHooks = [
    containsAny(text, ["small", "tiny", "salt", "grain", "microscopic"]) ? "This robot is smaller than salt" : "",
    containsAny(text, ["robot", "scientists", "machine"]) ? "Scientists built a robot this small" : "",
    containsAny(text, ["space", "nasa", "planet", "moon"]) ? "Space just gave us another wild visual" : "",
    containsAny(text, ["animal", "nature", "ocean"]) ? "Nature made this look completely fake" : "",
    `${subjectLead} feels impossible at first`,
    `${subjectLead} is way smaller than expected`
  ];

  const engineeringHooks = [
    "This build looks impossible but works",
    "This design solves a huge problem",
    "This machine is weirdly satisfying to watch",
    `${subjectLead} should not work this smoothly`,
    `${subjectLead} is cleaner than it looks`
  ];

  const shockHooks = [
    "How is this even real",
    "This level of skill looks unreal",
    "This should not be possible",
    "No way this is real",
    `${subjectLead} does not look real`
  ];

  const base = bestSlot === "12:30 PM" ? scienceHooks : bestSlot === "6:30 PM" ? engineeringHooks : shockHooks;
  const category = detectCategory(text);

  const categoryHooks = {
    science: ["Scientists just built something impossible", "This science visual feels completely unreal"],
    engineering: ["This build looks impossible but works", "This engineering fix is weirdly satisfying"],
    skill: ["This level of skill looks unreal", "Human precision should not look this clean"],
    nature: ["Nature made this look completely fake", "This visual does not look real"],
    general: ["This visual makes no sense at first", "This should not look this unreal"]
  }[category];

  return [...new Set([...base, ...categoryHooks].map((hook) => normalizeHook(hook)).filter(Boolean))].slice(0, 8);
}

function chooseBestHook(input: { candidates: string[]; title: string; summary: string; bestSlot: string }) {
  const filtered = input.candidates.filter((candidate) => hookPasses(candidate, input.title, input.summary));
  const ranked = (filtered.length ? filtered : fallbackHooks(input.bestSlot)).map((candidate) => ({
    candidate,
    score: scoreHook(candidate, input.title)
  }));

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0]?.candidate ?? "This should not look this unreal";
}

function fallbackHooks(bestSlot: string) {
  if (bestSlot === "12:30 PM") return ["Scientists built something way too small", "This science visual feels unreal"];
  if (bestSlot === "6:30 PM") return ["This build looks impossible but works", "This machine is weirdly satisfying"];
  return ["How is this even real", "This level of skill looks unreal"];
}

function hookPasses(hook: string, title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  const normalizedHook = hook.toLowerCase();
  const words = hook.split(/\s+/).filter(Boolean);

  if (words.length > 10) return false;
  if (words.length < 4) return false;
  if (containsAny(normalizedHook, corporateTerms)) return false;
  if (containsAny(normalizedHook, awkwardTerms)) return false;
  if (/[!?]{2,}/.test(hook)) return false;
  if (normalizedHook.startsWith("how our") || normalizedHook.startsWith("to acquire") || normalizedHook.startsWith("more intelligent")) return false;
  if (sharedTokenRatio(normalizedHook, text) > 0.7 && normalizedHook.split(" ").length > 6) return false;
  if (!hasClearStructure(normalizedHook)) return false;
  return true;
}

function hasClearStructure(hook: string) {
  if (hook.startsWith("how is this even real")) return true;
  if (hook.startsWith("no way this is real")) return true;
  if (hook.includes(" looks ") || hook.includes(" feels ") || hook.includes(" is ") || hook.includes(" built ") || hook.includes(" made ")) {
    return true;
  }
  return false;
}

function scoreHook(candidate: string, title: string) {
  const normalized = candidate.toLowerCase();
  const words = candidate.split(/\s+/).filter(Boolean).length;
  const compactness = words <= 9 ? 28 : 18;
  const curiosity = containsAny(normalized, ["unreal", "impossible", "real", "small", "fake"]) ? 30 : 18;
  const cleanliness = containsAny(normalized, corporateTerms) ? -40 : 18;
  const distanceFromTitle = sharedTokenRatio(normalized, title.toLowerCase()) > 0.65 ? -20 : 16;
  return compactness + curiosity + cleanliness + distanceFromTitle;
}

function makeWhyFits(bestSlot: string, platform: string, visualStrength: number, repostSafety: number) {
  if (bestSlot === "12:30 PM") {
    return `Clear science curiosity, strong US appeal, and fast enough to work on ${platform}.`;
  }
  if (bestSlot === "6:30 PM") {
    return visualStrength > 82
      ? `The visual is clean, satisfying, and easy to explain in one pass on ${platform}.`
      : `It still has enough visual clarity to work as a fast ${platform} post.`;
  }
  return repostSafety > 75
    ? `It has late-night shock energy and still feels safe enough to adapt into a Vibed post.`
    : `It has the right “how is this real” energy if you keep the framing clean.`;
}

function makeVisualExplanation(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (containsAny(text, ["small", "salt", "grain", "microscopic", "tiny"])) {
    return "The size contrast is the visual. People get it instantly.";
  }
  if (containsAny(text, ["build", "engineering", "design", "machine", "tool"])) {
    return "The movement or build itself is the payoff.";
  }
  if (containsAny(text, ["skill", "precision", "craft", "record"])) {
    return "The precision is the scroll-stopper here.";
  }
  if (containsAny(text, ["nature", "animal", "ocean", "storm", "space"])) {
    return "The subject already looks unreal on its own.";
  }
  return "The concept reads fast and works as a visual fact.";
}

function makeShortFormReason(platform: string, bestSlot: string) {
  if (platform.toLowerCase().includes("instagram")) {
    return bestSlot === "6:30 PM"
      ? "Best as an Instagram Reel with a clean visual payoff."
      : "Best as an Instagram Reel with a fast hook and simple text.";
  }
  if (platform.toLowerCase().includes("tiktok")) {
    return "Best as a TikTok with a quick reveal and one strong line.";
  }
  return "Best as a YouTube Short with one sharp takeaway.";
}

function makeSlotReason(bestSlot: string, visualStrength: number, repostSafety: number) {
  if (bestSlot === "12:30 PM") {
    return "Midday works best for clear curiosity and light science facts.";
  }
  if (bestSlot === "6:30 PM") {
    return visualStrength > 84
      ? "Early evening is strong for clean visuals and satisfying builds."
      : "This slot rewards visual clarity and fast explanations.";
  }
  return repostSafety > 75
    ? "Night posting works when the hook feels impossible at first glance."
    : "This slot is best for shocky visuals with a simple explanation.";
}

function scoreOpportunityQuality(input: {
  hook: string;
  visualStrength: number;
  repostSafety: number;
  bestPlatform: string;
  cleanTitle: string;
  summary: string;
}): QualityBreakdown {
  const words = input.hook.split(/\s+/).filter(Boolean).length;
  const text = `${input.cleanTitle} ${input.summary}`.toLowerCase();

  return {
    scrollStopper: clamp(scoreHook(input.hook, input.cleanTitle), 0, 100),
    instantClarity: clamp(words <= 9 ? 92 : 74, 0, 100),
    visualReadiness: clamp(input.visualStrength - (containsAny(text, corporateTerms) ? 20 : 0), 0, 100),
    hookCompactness: clamp(words <= 9 ? 96 : 78, 0, 100),
    repostConfidence: clamp(input.repostSafety - (containsAny(text, ["exclusive", "leaked", "rumor", "lawsuit"]) ? 20 : 0), 0, 100),
    platformReadiness: clamp(input.bestPlatform ? 84 : 68, 0, 100)
  };
}

function collectRejectionReasons(input: {
  hook: string;
  editorialScore: number;
  qualityBreakdown: QualityBreakdown;
  visualStrength: number;
  repostSafety: number;
  title: string;
  summary: string;
}) {
  const text = `${input.title} ${input.summary}`.toLowerCase();
  const reasons: string[] = [];

  if (input.editorialScore < 68) reasons.push("overall creator fit is still too weak");
  if (input.qualityBreakdown.visualReadiness < 64 || input.visualStrength < 60) reasons.push("visual payoff is too weak for short-form");
  if (input.qualityBreakdown.instantClarity < 70) reasons.push("the idea is not readable in one glance");
  if (input.repostSafety < 55 || input.qualityBreakdown.repostConfidence < 60) reasons.push("repost safety is too shaky");
  if (!hookPasses(input.hook, input.title, input.summary)) reasons.push("hook quality is too weak");
  if (containsAny(text, ["politics", "election", "war", "shooting", "murder", "suicide", "depressing"])) reasons.push("topic is too heavy for the channel");
  if (containsAny(text, corporateTerms)) reasons.push("topic feels too corporate and not visual enough");

  return [...new Set(reasons)];
}

function compactSubject(title: string) {
  return title
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word && !subjectStopwords.has(word.toLowerCase()) && word.length > 2)
    .slice(0, 3)
    .join(" ")
    .trim()
    .toLowerCase();
}

function normalizeHook(hook: string) {
  const cleaned = hook.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const words = cleaned.split(/\s+/).filter(Boolean).slice(0, 10);
  const sentence = words.join(" ").trim();
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function detectCategory(text: string) {
  if (containsAny(text, ["skill", "precision", "craft", "record", "artist"])) return "skill";
  if (containsAny(text, ["build", "engineering", "design", "machine", "tool", "bridge"])) return "engineering";
  if (containsAny(text, ["nature", "animal", "ocean", "space", "storm", "volcano"])) return "nature";
  if (containsAny(text, ["robot", "scientists", "study", "microscopic", "tiny", "ai"])) return "science";
  return "general";
}

function buildHashtags(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (containsAny(text, ["robot", "ai", "machine", "science"])) return "#science #technology #future #facts";
  if (containsAny(text, ["engineering", "build", "design", "tool"])) return "#engineering #innovation #technology #satisfying";
  if (containsAny(text, ["nature", "animal", "ocean", "space"])) return "#nature #science #earth #weirdfacts";
  if (containsAny(text, ["skill", "precision", "craft"])) return "#skill #precision #satisfying #viral";
  return "#science #technology #future #viral";
}

function buildCoverText(hook: string, title: string) {
  const source = hook || title;
  return source
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

function sharedTokenRatio(a: string, b: string) {
  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);
  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  return overlap / Math.max(aTokens.size, 1);
}

function tokenSet(value: string) {
  return new Set(
    value
      .replace(/[^\w\s]/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token && !subjectStopwords.has(token))
  );
}

function containsAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(phrase));
}

function average(values: number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
