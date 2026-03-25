import { FeedbackRating, FeedbackReason, getFeedbackSync, loadFeedbackCache, getAllFeedback } from "@/lib/brain-feedback-store";
import { BrainProfileData, defaultBrainProfile, loadBrainProfile } from "@/lib/brain-profile-store";
import { listBrainExamples } from "@/lib/brain-examples-store";

export type VibedSlot = "12:30 PM" | "6:30 PM" | "9:15 PM";
export type VibedPillar = "Curiosity / Science" | "Visual Engineering" | "Human Skill";
export type OpportunityFormat = "video" | "image" | "clip" | "article" | "thread" | "trend";

export type Opportunity = {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string;
  category: string;
  pillar: VibedPillar;
  suggestedSlot: VibedSlot;
  bestPlatform: "Instagram Reels" | "TikTok" | "YouTube Shorts";
  formatType: OpportunityFormat;
  summary: string;
  whyItWorks: string;
  whyItWins?: string;
  whyItLoses?: string;
  previewLabel: string;
  transformabilityScore: number;
  duplicateWarning: string | null;
  scores: {
    visualPower: number;
    curiosityGap: number;
    replayValue: number;
    usRelevance: number;
    brandFit: number;
    repostSafety: number;
    captionPotential: number;
    firstFrame: number;
    commentBait: number;
    shareSavePotential: number;
    slotFit: number;
    viralPotential: number;
  };
  hooks: {
    impossible: string;
    curiosity: string;
    waitWhat: string;
    authority: string;
    softInformative: string;
  };
  bestHook: string;
  coverHeadline: string;
  imageHeadline: string;
  caption: string;
  pinnedComment: string;
  hashtags: string[];
  cta: string;
  safetyNotes: string;
  suggestedAudio: string;
  editingNotes: string;
  firstFrameIdea?: string;
  status: "new" | "saved" | "drafted" | "used" | "archived";
  confidence: "high" | "medium";
  reasonChosen: string;
  brain: BrainDecision;
};

export type DailySlotPlan = {
  slot: VibedSlot;
  pillar: VibedPillar;
  chosen: Opportunity;
  backups: Opportunity[];
};

export type BrandRules = {
  preferredTone: string;
  bannedPhrases: string[];
  ctaStyle: string;
  hashtagStyle: string;
  targetAudience: string;
  postingSchedule: VibedSlot[];
  contentPillars: { slot: VibedSlot; pillar: VibedPillar; focus: string }[];
  coverStyleRules: string[];
  safetyStrictness: string;
  rewriteForVibed: boolean;
};

type Seed = Omit<Opportunity,
  | "scores"
  | "hooks"
  | "bestHook"
  | "coverHeadline"
  | "imageHeadline"
  | "caption"
  | "pinnedComment"
  | "hashtags"
  | "cta"
  | "safetyNotes"
  | "suggestedAudio"
  | "editingNotes"
  | "brain"
>;

export type BrainDecision = {
  score: number;
  signalsMatched: string[];
  signalsConflicted: string[];
  rejected: string | null;
  confidence: number;
  explanation: string;
  trainingInfluence: "training" | "default";
};

export const vibedBrain: BrainProfileData = await loadBrainProfile().catch(() => defaultBrainProfile());
await loadFeedbackCache();

const brandRules: BrandRules = {
  preferredTone: "Premium viral media",
  bannedPhrases: ["stop scrolling", "you won't believe", "smash like", "insane!!!"],
  ctaStyle: "Short, confident, curiosity-first",
  hashtagStyle: "3 or 4 lowercase hashtags",
  targetAudience: "US-focused broad entertainment audience",
  postingSchedule: ["12:30 PM", "6:30 PM", "9:15 PM"],
  contentPillars: [
    { slot: "12:30 PM", pillar: "Curiosity / Science", focus: "Strange facts, future, science, surprising reality" },
    { slot: "6:30 PM", pillar: "Visual Engineering", focus: "Machines, processes, production, design, satisfying builds" },
    { slot: "9:15 PM", pillar: "Human Skill", focus: "Mastery, talent, impossible-looking control, replay moments" }
  ],
  coverStyleRules: ["4 to 6 words max", "clean statement", "high-contrast", "no spam caps"],
  safetyStrictness: "High repost safety only when media rights are unclear",
  rewriteForVibed: true
};

const seeds: Seed[] = [
  {
    id: "salt-robot",
    title: "Microscopic robot that thinks in swarms",
    sourceName: "ScienceDaily AI",
    sourceUrl: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
    category: "AI / Robotics",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "article",
    summary: "Lab-built micro robots can coordinate in ways that look impossible at first glance.",
    whyItWorks: "Tiny scale plus real science gives it instant curiosity and save-worthy shock.",
    previewLabel: "Microscopic demo",
    transformabilityScore: 90,
    duplicateWarning: null,
    status: "saved",
    confidence: "high",
    reasonChosen: "Best science curiosity post for midday because the visual scale sells itself fast."
  },
  {
    id: "soft-robot-fingers",
    title: "Soft robot fingers handling glass without breaking it",
    sourceName: "Reddit Robotics",
    sourceUrl: "https://www.reddit.com/r/robotics/.rss",
    category: "AI / Robotics",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "The movement looks delicate enough to feel fake until you realize it is real hardware.",
    whyItWorks: "Simple visual, easy explanation, and immediate “how is it this precise?” energy.",
    previewLabel: "Robotics precision",
    transformabilityScore: 87,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Fits science curiosity while still feeling visually satisfying."
  },
  {
    id: "underwater-volcano",
    title: "Underwater volcano creates a glowing shockwave",
    sourceName: "NASA Breaking News",
    sourceUrl: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    category: "Nature / Earth / Space",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "video",
    summary: "Nature footage with a science payoff that feels bigger than a normal news clip.",
    whyItWorks: "Huge visual contrast plus a real-world explanation makes it broadly shareable.",
    previewLabel: "Earth shock visual",
    transformabilityScore: 84,
    duplicateWarning: "Similar volcano clips appeared twice this week.",
    status: "drafted",
    confidence: "high",
    reasonChosen: "Midday science slot likes clean wonder with easy replay value."
  },
  {
    id: "fungus-electricity",
    title: "Scientists use living fungus like a soft circuit",
    sourceName: "ScienceDaily AI",
    sourceUrl: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
    category: "Science Breakthroughs",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "article",
    summary: "It sounds made up, but the visual metaphor is easy and the science angle is real.",
    whyItWorks: "Weird-but-real science with a clean one-line explanation is strong for saves.",
    previewLabel: "Weird science",
    transformabilityScore: 79,
    duplicateWarning: null,
    status: "new",
    confidence: "medium",
    reasonChosen: "High curiosity gap, medium visual strength, strong save potential."
  },
  {
    id: "bridge-folding",
    title: "A bridge that folds itself into place",
    sourceName: "ScienceDaily Engineering",
    sourceUrl: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "video",
    summary: "The mechanism is instantly readable and satisfying to watch even without sound.",
    whyItWorks: "Perfect 6:30 content because the process is the payoff and the hook is obvious.",
    previewLabel: "Self-folding build",
    transformabilityScore: 93,
    duplicateWarning: null,
    status: "saved",
    confidence: "high",
    reasonChosen: "Best engineering slot candidate with clean visual clarity and replay value."
  },
  {
    id: "glass-machine",
    title: "Machine cuts glass in one perfect motion",
    sourceName: "Reddit OddlySatisfying",
    sourceUrl: "https://www.reddit.com/r/oddlysatisfying/.rss",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "It is pure process content: clean movement, instant clarity, and a satisfying finish.",
    whyItWorks: "No setup needed, high replay value, and ideal for short overlay text.",
    previewLabel: "Process clip",
    transformabilityScore: 88,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Extremely easy to understand in one second."
  },
  {
    id: "factory-swirls",
    title: "Metal factory creates impossible-looking swirls",
    sourceName: "Reddit Damn Thats Interesting",
    sourceUrl: "https://www.reddit.com/r/Damnthatsinteresting/.rss",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "clip",
    summary: "The motion is smooth enough to feel unreal and the process payoff lands immediately.",
    whyItWorks: "Strong machine/process energy without needing much narration.",
    previewLabel: "Factory process",
    transformabilityScore: 85,
    duplicateWarning: null,
    status: "drafted",
    confidence: "high",
    reasonChosen: "Hits the satisfying engineering pillar hard."
  },
  {
    id: "paper-engine",
    title: "Student builds a paper engine that actually runs",
    sourceName: "ScienceDaily Engineering",
    sourceUrl: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "video",
    summary: "It has that impossible-but-real energy that performs well with a simple payoff edit.",
    whyItWorks: "A familiar material doing something impossible is very thumb-stopping.",
    previewLabel: "Impossible build",
    transformabilityScore: 82,
    duplicateWarning: null,
    status: "new",
    confidence: "medium",
    reasonChosen: "Great backup engineering slot item with clean intrigue."
  },
  {
    id: "sand-art",
    title: "Artist pours perfect sand portraits in seconds",
    sourceName: "Reddit BeAmazed",
    sourceUrl: "https://www.reddit.com/r/BeAmazed/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "The reveal is instant, replayable, and comment-friendly because the control looks impossible.",
    whyItWorks: "Great late-night replay hook because people want to watch the moment twice.",
    previewLabel: "Talent reveal",
    transformabilityScore: 91,
    duplicateWarning: null,
    status: "saved",
    confidence: "high",
    reasonChosen: "Best 9:15 skill play because the payoff lands fast and makes people comment."
  },
  {
    id: "knife-master",
    title: "Chef slices paper-thin layers with no guide",
    sourceName: "Reddit BeAmazed",
    sourceUrl: "https://www.reddit.com/r/BeAmazed/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "Instagram Reels",
    formatType: "clip",
    summary: "Human control is the whole hook and it looks too precise to be real.",
    whyItWorks: "Fast, understandable, and instantly comment-worthy.",
    previewLabel: "Precision skill",
    transformabilityScore: 86,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Night slot wants impossible-looking mastery and replay value."
  },
  {
    id: "wood-inlay",
    title: "Woodworker fits curved inlays without a gap",
    sourceName: "Reddit OddlySatisfying",
    sourceUrl: "https://www.reddit.com/r/oddlysatisfying/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "video",
    summary: "Slow precision pays off with a final moment that makes people replay for the clean fit.",
    whyItWorks: "Strong mastery energy and a very satisfying finish frame.",
    previewLabel: "Craft precision",
    transformabilityScore: 83,
    duplicateWarning: null,
    status: "new",
    confidence: "medium",
    reasonChosen: "Strong replay candidate with premium craft feel."
  },
  {
    id: "free-climber",
    title: "Climber hangs on one hand to reset position",
    sourceName: "Reddit BeAmazed",
    sourceUrl: "https://www.reddit.com/r/BeAmazed/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "One impossible moment carries the whole clip and makes the replay inevitable.",
    whyItWorks: "Late-night viewers respond hard to “how is this real?” clips with a single insane beat.",
    previewLabel: "Impossible moment",
    transformabilityScore: 80,
    duplicateWarning: "Similar climbing content already saved once.",
    status: "new",
    confidence: "medium",
    reasonChosen: "High comment potential if framed with the right hook."
  },
  {
    id: "blue-lava",
    title: "Blue lava makes the whole mountain glow",
    sourceName: "Reddit Nature Is Metal",
    sourceUrl: "https://www.reddit.com/r/NatureIsMetal/.rss",
    category: "Nature / Earth / Space",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "clip",
    summary: "Nature shock with a real scientific explanation gives it strong save/share behavior.",
    whyItWorks: "The visual looks fake, which opens a clean curiosity hook immediately.",
    previewLabel: "Nature shock",
    transformabilityScore: 89,
    duplicateWarning: null,
    status: "drafted",
    confidence: "high",
    reasonChosen: "Huge first-glance surprise with science payoff."
  },
  {
    id: "underwater-drone",
    title: "Robot fish slides through coral like it is alive",
    sourceName: "Reddit Robotics",
    sourceUrl: "https://www.reddit.com/r/robotics/.rss",
    category: "AI / Robotics",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "clip",
    summary: "This is a robotics demo with just enough strange realism to feel shareable.",
    whyItWorks: "Robot plus nature camouflage gives it two separate curiosity hooks.",
    previewLabel: "Robot nature fakeout",
    transformabilityScore: 81,
    duplicateWarning: null,
    status: "new",
    confidence: "medium",
    reasonChosen: "Good backup science slot item with a strong opening visual."
  },
  {
    id: "ice-cutting",
    title: "Factory slices ice blocks into mirrored columns",
    sourceName: "Reddit OddlySatisfying",
    sourceUrl: "https://www.reddit.com/r/oddlysatisfying/.rss",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "The process is hypnotic and easy to understand with no context.",
    whyItWorks: "Very low-friction watch with clean satisfying energy.",
    previewLabel: "Satisfying process",
    transformabilityScore: 84,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Strong evening process content with high completion odds."
  },
  {
    id: "space-solar-sail",
    title: "Solar sail opens like origami in orbit",
    sourceName: "NASA Breaking News",
    sourceUrl: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    category: "Nature / Earth / Space",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "video",
    summary: "Space engineering with a visual reveal gives it both science credibility and wow factor.",
    whyItWorks: "Feels futuristic without being too technical to explain quickly.",
    previewLabel: "Space reveal",
    transformabilityScore: 83,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Future-facing science with easy broad appeal."
  },
  {
    id: "micro-laser-print",
    title: "Laser printer writes on a grain of rice",
    sourceName: "ScienceDaily Engineering",
    sourceUrl: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
    category: "Science Breakthroughs",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "article",
    summary: "Small scale plus visual proof creates instant save/share behavior.",
    whyItWorks: "The concept is easy to understand and the size contrast does the heavy lifting.",
    previewLabel: "Tiny tech",
    transformabilityScore: 88,
    duplicateWarning: null,
    status: "saved",
    confidence: "high",
    reasonChosen: "Classic Vibed midday science post."
  },
  {
    id: "stone-polish-line",
    title: "Production line turns rough stone mirror smooth",
    sourceName: "Reddit Damn Thats Interesting",
    sourceUrl: "https://www.reddit.com/r/Damnthatsinteresting/.rss",
    category: "Visual Engineering",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "Instagram Reels",
    formatType: "clip",
    summary: "Transformation process content with a satisfying before-and-after finish.",
    whyItWorks: "Extremely easy to edit into a high-retention short with overlay text.",
    previewLabel: "Transformation process",
    transformabilityScore: 86,
    duplicateWarning: null,
    status: "drafted",
    confidence: "high",
    reasonChosen: "Process payoff reads instantly and supports replay."
  },
  {
    id: "calligraphy-spin",
    title: "Calligrapher draws perfect circles without lifting",
    sourceName: "Reddit BeAmazed",
    sourceUrl: "https://www.reddit.com/r/BeAmazed/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "Instagram Reels",
    formatType: "clip",
    summary: "The control looks unreal and the final reveal is extremely clean.",
    whyItWorks: "Human mastery clips perform well at night because they invite replay and comments.",
    previewLabel: "Precision art",
    transformabilityScore: 84,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Clear late-night mastery clip with premium aesthetic."
  },
  {
    id: "bird-murmuration",
    title: "Thousands of birds move like one shape",
    sourceName: "Reddit Nature Is Metal",
    sourceUrl: "https://www.reddit.com/r/NatureIsMetal/.rss",
    category: "Nature / Earth / Space",
    pillar: "Curiosity / Science",
    suggestedSlot: "12:30 PM",
    bestPlatform: "TikTok",
    formatType: "video",
    summary: "Mass movement visuals are instantly gripping and easy to explain with a science caption.",
    whyItWorks: "Looks unreal, feels broad, and works well for saves and shares.",
    previewLabel: "Nature pattern",
    transformabilityScore: 78,
    duplicateWarning: null,
    status: "new",
    confidence: "medium",
    reasonChosen: "Nature surprise with strong visual readability."
  },
  {
    id: "drone-wall-climb",
    title: "Drone climbs walls using gecko-inspired grip",
    sourceName: "ScienceDaily AI",
    sourceUrl: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
    category: "AI / Robotics",
    pillar: "Visual Engineering",
    suggestedSlot: "6:30 PM",
    bestPlatform: "YouTube Shorts",
    formatType: "video",
    summary: "It blends robotics and satisfying mechanism design into one visually strong demo.",
    whyItWorks: "Looks impossible, explains fast, and has strong replay potential.",
    previewLabel: "Robotics demo",
    transformabilityScore: 89,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Crosses engineering and future-tech with a very strong opening beat."
  },
  {
    id: "coin-stack",
    title: "Performer stacks spinning coins on a moving hand",
    sourceName: "Reddit BeAmazed",
    sourceUrl: "https://www.reddit.com/r/BeAmazed/.rss",
    category: "Human Skill / Craftsmanship",
    pillar: "Human Skill",
    suggestedSlot: "9:15 PM",
    bestPlatform: "TikTok",
    formatType: "clip",
    summary: "A tiny skill window with a huge replay punch.",
    whyItWorks: "People will replay just to confirm what they saw.",
    previewLabel: "Replay skill clip",
    transformabilityScore: 88,
    duplicateWarning: null,
    status: "new",
    confidence: "high",
    reasonChosen: "Pure replay bait for the late slot."
  }
];

const opportunities = applyBrain(seeds.map(buildOpportunity));

function buildOpportunity(seed: Seed): Opportunity {
  const scores = buildScores(seed);
  const hooks = buildHooks(seed);
  const bestHook = pickBestHook(seed, hooks);
  const hashtags = buildHashtags(seed);
  const whyItWins = seed.whyItWins ?? defaultWhyWins(seed);
  const whyItLoses = seed.whyItLoses ?? defaultWhyLoses(seed);

  return {
    ...seed,
    scores,
    hooks,
    bestHook,
    coverHeadline: coverFromHook(bestHook),
    imageHeadline: imageHeadline(bestHook),
    caption: buildCaption(seed, bestHook, hashtags),
    pinnedComment: buildPinnedComment(seed),
    hashtags,
    cta: buildCta(seed),
    safetyNotes: buildSafety(seed),
    suggestedAudio: buildAudio(seed),
    editingNotes: buildEditingNotes(seed),
    firstFrameIdea: buildFirstFrame(seed),
    whyItWins,
    whyItLoses,
    brain: {
      score: scores.viralPotential,
      signalsMatched: [],
      signalsConflicted: [],
      rejected: null,
      confidence: 0.5,
      explanation: "",
      trainingInfluence: "default"
    }
  };
}

function slotFitScore(seed: Seed) {
  if (seed.suggestedSlot === "12:30 PM" && seed.pillar === "Curiosity / Science") return 94;
  if (seed.suggestedSlot === "6:30 PM" && seed.pillar === "Visual Engineering") return 93;
  if (seed.suggestedSlot === "9:15 PM" && seed.pillar === "Human Skill") return 95;
  return 82;
}

function buildScores(seed: Seed) {
  const base = seed.pillar === "Curiosity / Science" ? 84 : seed.pillar === "Visual Engineering" ? 87 : 89;
  const visualPower = clamp(base + (seed.transformabilityScore - 82), 72, 99);
  const firstFrame = clamp(Math.round((seed.formatType === "clip" || seed.formatType === "video" ? 94 : seed.formatType === "image" ? 88 : 82) + (visualPower - 85) * 0.25), 72, 99);
  const curiosityGap = clamp(seed.pillar === "Curiosity / Science" ? 95 : seed.pillar === "Visual Engineering" ? 84 : 86, 72, 99);
  const replayValue = clamp(seed.pillar === "Human Skill" ? 94 : seed.pillar === "Visual Engineering" ? 91 : 84, 70, 99);
  const usRelevance = seed.category.includes("Nature") ? 82 : 90;
  const commentBait = clamp(seed.pillar === "Human Skill" ? 93 : seed.pillar === "Curiosity / Science" ? 84 : 86, 70, 99);
  const shareSavePotential = clamp(seed.pillar === "Curiosity / Science" ? 93 : seed.pillar === "Visual Engineering" ? 86 : 83, 70, 99);
  const slotFit = slotFitScore(seed);
  const captionPotential = clamp(seed.pillar === "Curiosity / Science" ? 91 : seed.pillar === "Visual Engineering" ? 86 : 84, 72, 99);
  const brandFit = clamp(Math.round((visualPower * 0.28) + (slotFit * 0.22) + (shareSavePotential * 0.18) + (captionPotential * 0.12) + (commentBait * 0.1) + 12), 75, 99);
  const repostSafety = seed.sourceName.includes("ScienceDaily") || seed.sourceName.includes("NASA") ? 90 : 78;
  const viralPotential = clamp(
    Math.round(
      firstFrame * 0.16 +
        visualPower * 0.15 +
        curiosityGap * 0.12 +
        replayValue * 0.1 +
        shareSavePotential * 0.1 +
        commentBait * 0.09 +
        captionPotential * 0.08 +
        slotFit * 0.07 +
        brandFit * 0.06 +
        usRelevance * 0.04 +
        repostSafety * 0.03
    ),
    72,
    99
  );

  return {
    visualPower,
    curiosityGap,
    replayValue,
    usRelevance,
    brandFit,
    repostSafety,
    captionPotential,
    firstFrame,
    commentBait,
    shareSavePotential,
    slotFit,
    viralPotential
  };
}

function defaultWhyWins(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "Strange-but-real science visual that opens a curiosity gap instantly.";
  if (seed.pillar === "Visual Engineering") return "Process clarity plus a crisp first frame makes viewers stay.";
  return "Human mastery with replay + comment energy that fits late-night perfectly.";
}

function defaultWhyLoses(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "If the visual proof is weak, curiosity drops and save behavior slips.";
  if (seed.pillar === "Visual Engineering") return "Needs a clean first beat—slow setups will hurt completion.";
  return "Skill clips can blur together; avoid similar framing twice in the same day.";
}

function buildHooks(seed: Seed) {
  const subject = conciseSubject(seed.title);

  if (seed.pillar === "Curiosity / Science") {
    return {
      impossible: tidyHook(`This looks fake: ${subject}`),
      curiosity: tidyHook(scienceCuriosity(subject)),
      waitWhat: tidyHook(`Wait—${subject}?`),
      authority: tidyHook(`Researchers just proved ${subject}`),
      softInformative: tidyHook(`${subject} in one clean visual`)
    };
  }

  if (seed.pillar === "Visual Engineering") {
    return {
      impossible: tidyHook(`${subject} should not work`),
      curiosity: tidyHook(`How does this ${subject} even move`),
      waitWhat: tidyHook(`This process is weirdly satisfying`),
      authority: tidyHook(`Engineers nailed ${subject}`),
      softInformative: tidyHook(`${subject} explained in one shot`)
    };
  }

  return {
    impossible: tidyHook(`${subject} should be impossible`),
    curiosity: tidyHook(`How is ${subject} this clean`),
    waitWhat: tidyHook(`Wait—look at this control`),
    authority: tidyHook(`This takes unreal precision`),
    softInformative: tidyHook(`Rare skill with a perfect payoff`)
  };
}

function pickBestHook(seed: Seed, hooks: Opportunity["hooks"]) {
  if (seed.suggestedSlot === "12:30 PM") return hooks.curiosity;
  if (seed.suggestedSlot === "6:30 PM") return hooks.impossible;
  return hooks.curiosity;
}

function scienceCuriosity(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("robot")) return "Scientists built a robot this small";
  if (lower.includes("volcano")) return "This volcano does not look real";
  if (lower.includes("rice") || lower.includes("grain")) return "This was printed on a grain";
  if (lower.includes("fungus")) return "They turned living fungus into circuits";
  if (lower.includes("lava")) return "Nature made electric-blue lava";
  return "This looks fake but it is real";
}

function coverFromHook(hook: string) {
  return hook.split(" ").slice(0, 5).join(" ");
}

function imageHeadline(hook: string) {
  const words = hook.split(" ");
  const midpoint = Math.ceil(words.length / 2);
  return `${words.slice(0, midpoint).join(" ")}\n${words.slice(midpoint).join(" ")}`;
}

function buildCaption(seed: Seed, hook: string, hashtags: string[]) {
  const headline = hook;
  const line1 = simpleLine(seed);
  const line2 = infoLine(seed);
  const line3 = payoffLine(seed);
  const payoff = payoffLine(seed, true);
  const question = engagementQuestion(seed);
  const cta = buildCta(seed);
  const pinned = buildPinnedComment(seed);
  const hash = hashtags.slice(0, 4).join(" ");
  return [headline, "", line1, line2, line3, payoff, question, cta, "", pinned, hash].join("\n");
}

function buildPinnedComment(seed: Seed) {
  if (seed.pillar === "Human Skill") return "Replay the exact beat where the control looks unreal.";
  if (seed.pillar === "Visual Engineering") return "Tag the friend who loves perfect process shots.";
  return "Drop a 🔬 if this made you double-take.";
}

function buildHashtags(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return ["#science", "#future", "#facts", "#viral"];
  if (seed.pillar === "Visual Engineering") return ["#engineering", "#design", "#satisfying", "#build"];
  return ["#skill", "#precision", "#replay", "#viral"];
}

function buildCta(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "Follow @vibed.media for sharp science you can post fast.";
  if (seed.pillar === "Visual Engineering") return "Follow @vibed.media for satisfying builds and clever mechanisms.";
  return "Follow @vibed.media for unreal skill and premium viral ideas.";
}

function buildSafety(seed: Seed) {
  return seed.sourceName.includes("ScienceDaily") || seed.sourceName.includes("NASA")
    ? "High repost safety if you transform the explanation and cite the source."
    : "Use a transformative edit and double-check the original uploader before posting footage.";
}

function buildAudio(seed: Seed) {
  if (seed.pillar === "Visual Engineering") return "Minimal mechanical pulse";
  if (seed.pillar === "Human Skill") return "Tense cinematic build";
  return "Clean future-tech ambient";
}

function buildEditingNotes(seed: Seed) {
  if (seed.pillar === "Visual Engineering") return "Open on the process instantly and save explanation for beat two.";
  if (seed.pillar === "Human Skill") return "Cut directly to the impossible moment, then slow the cleanest beat.";
  return "Show the wild visual first, then land one clear science sentence.";
}

function buildFirstFrame(seed: Seed) {
  if (seed.pillar === "Visual Engineering") return `Open on the mechanism in motion: ${seed.previewLabel}`;
  if (seed.pillar === "Human Skill") return `Freeze on the mastery moment: ${seed.previewLabel}`;
  return `Lead with the bizarre visual: ${seed.previewLabel}`;
}

function tidyHook(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  if (words.length <= 10) return capitalize(cleaned);
  return capitalize(words.slice(0, 10).join(" "));
}

function conciseSubject(title: string) {
  const cleaned = title.replace(/[:–—-]/g, " ").replace(/[^\\w\\s]/g, "");
  const words = cleaned.split(" ").filter(Boolean);
  const maxWords = words.length > 10 ? 10 : words.length;
  return words.slice(0, maxWords).join(" ");
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function topLine(seed: Seed) {
  return "Follow @vibed.media";
}

function shortStory(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "It feels made up until you see the real explanation.";
  if (seed.pillar === "Visual Engineering") return "The process is the whole payoff here.";
  return "The control is so clean it almost looks fake.";
}

function infoLine(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "Real science, clean visual, simple takeaway.";
  if (seed.pillar === "Visual Engineering") return "Simple mechanism, clear payoff, easy replay.";
  return "Precision that makes people replay to believe it.";
}

function simpleLine(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "Real visuals with a one-line explainer.";
  if (seed.pillar === "Visual Engineering") return "Show the mechanism moving, say one sharp line.";
  return "Open on the control moment, keep words light.";
}

function payoffLine(seed: Seed, surprising = false) {
  if (surprising) return "The surprise is that it’s real, not CGI.";
  if (seed.pillar === "Curiosity / Science") return "Surprising because it looks fake until you know why.";
  if (seed.pillar === "Visual Engineering") return "Mind-blowing because the process stays perfect start to finish.";
  return "Feels impossible yet it’s real, which drives comments.";
}

function engagementQuestion(seed: Seed) {
  if (seed.pillar === "Curiosity / Science") return "Which detail made you double-take?";
  if (seed.pillar === "Visual Engineering") return "Which frame would you freeze for the cover?";
  return "Would you try this even once?";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function applyBrain(list: Opportunity[]) {
  return list
    .map((item) => {
      const decision = evaluateWithBrain(item);
      const boosted = { ...item, brain: decision, scores: { ...item.scores, viralPotential: decision.score } };
      return boosted;
    })
    .filter((item) => true); // keep all; rejection handled in planner/best-now filters
}

function evaluateWithBrain(item: Opportunity): BrainDecision {
  const matched: string[] = [];
  const missed: string[] = [];
  let trainingInfluence: "training" | "default" = "default";
  let score = item.scores.viralPotential;
  const tp = vibedBrain.tasteProfile;
  const fb = getFeedbackSync(item.id);

  // Rejection rules
  for (const ruleKey of vibedBrain.rejectionRules) {
    if (ruleTest(ruleKey, item as unknown as Seed, item.scores)) {
      return {
        score: score - 18,
        signalsMatched: matched,
        signalsConflicted: missed,
        rejected: ruleKey,
        confidence: 0.35,
        explanation: `Rejected because ${ruleKey}.`,
        trainingInfluence
      };
    }
  }

  // First frame
  const firstFrameAdj = (item.scores.firstFrame - 82) * tp.firstFrameImportance * 0.35;
  score += firstFrameAdj;
  matched.push("strong first frame");

  // Hook alignment
  const hookWords = item.bestHook.split(" ").length;
  const withinIdeal = hookWords >= vibedBrain.hookPreferences.idealLength[0] && hookWords <= vibedBrain.hookPreferences.idealLength[1];
  if (withinIdeal) {
    score += 4 * tp.hookImportance;
    matched.push("ideal hook length");
  } else {
    missed.push("hook length off");
    score -= 2;
  }
  if (containsAvoidPhrase(item.bestHook)) {
    missed.push("banned hook phrasing");
    score -= 6;
  }

  // Example-based boosts (if example store available)
  if ((globalThis as any).__brainExampleWeights) {
    const weights = (globalThis as any).__brainExampleWeights as { hookBoost?: number; captionBoost?: number; postBoost?: number };
    score += (weights.hookBoost ?? 0);
    score += (weights.postBoost ?? 0);
  }

  // US bias
  score += (item.scores.usRelevance - 85) * tp.usAudienceBias * 0.12;

  // Replay & share/save
  score += (item.scores.replayValue - 85) * tp.replayPreference * 0.12;
  score += (item.scores.shareSavePotential - 85) * 0.1;

  // Caption potential
  score += (item.scores.captionPotential - 82) * tp.captionImportance * 0.08;

  // Premium feel heuristic
  if (!item.title.toLowerCase().includes("meme") && !item.title.toLowerCase().includes("promo")) {
    score += 3 * tp.premiumFeel;
    matched.push("premium-friendly");
  } else {
    missed.push("not premium enough");
  }

  // Educational vs shocking balance
  if (item.pillar === "Curiosity / Science" && tp.educationalVsShocking >= 0.5) score += 2;
  if (item.pillar === "Human Skill" && tp.educationalVsShocking < 0.5) score += 2;

  // Repost safety
  if (item.scores.repostSafety < tp.repostSafetyThreshold) {
    score -= 6;
    missed.push("repost safety risk");
  } else {
    matched.push("repost-safe enough");
  }

  // Training feedback influence
  if (fb) {
    const ratingBoost = ratingDelta(fb.rating);
    score += ratingBoost;
    trainingInfluence = "training";
    if (fb.rating === "never show again") {
      return {
        score: clamp(Math.round(score), 50, 70),
        signalsMatched: matched,
        signalsConflicted: [...missed, "user blocked"],
        rejected: "user blocked this topic",
        confidence: 0.95,
        explanation: "Manually blocked by Vibed Brain training.",
        trainingInfluence
      };
    }
    for (const reason of fb.reasons) {
      score += reasonDelta(reason);
      missed.push(reason);
    }
  }

  const confidence = clamp(0.5 + matched.length * 0.05 - missed.length * 0.03, 0.35, 0.92);
  const explanation = `Matched: ${matched.join(", ") || "none"}. Missed: ${missed.join(", ") || "none"}.`;

  return {
    score: clamp(Math.round(score), 70, 99),
    signalsMatched: matched,
    signalsConflicted: missed,
    rejected: null,
    confidence,
    explanation,
    trainingInfluence
  };
}

function ratingDelta(rating: FeedbackRating) {
  switch (rating) {
    case "perfect":
      return 8;
    case "strong":
      return 5;
    case "maybe":
      return 1;
    case "weak":
      return -5;
    case "never show again":
      return -20;
    default:
      return 0;
  }
}

function reasonDelta(reason: FeedbackReason) {
  switch (reason) {
    case "weak first frame":
      return -6;
    case "not premium enough":
      return -4;
    case "bad hook potential":
      return -5;
    case "too random":
      return -3;
    case "low US fit":
      return -4;
    case "too repetitive":
      return -3;
    case "weak replay value":
      return -4;
    case "bad caption potential":
      return -3;
    case "pairwise win":
      return 6;
    case "better hook":
      return 5;
    case "better caption":
      return 4;
    case "better overall":
      return 5;
    case "pairwise loss":
      return -6;
    default:
      return 0;
  }
}

function containsAvoidPhrase(hook: string) {
  const lower = hook.toLowerCase();
  return vibedBrain.hookPreferences.avoidPhrases.some((p) => lower.includes(p));
}

function tieBreakComposite(item: Opportunity) {
  const w = vibedBrain.tieBreakWeights;
  return (
    item.scores.firstFrame * w.firstFrame +
    item.scores.curiosityGap * w.hook +
    item.scores.brandFit * w.premium +
    item.scores.replayValue * w.replay +
    item.scores.usRelevance * w.usFit +
    item.scores.repostSafety * w.safety
  );
}

function buildDecisionNarrative(chosen: Opportunity, alt: Opportunity | undefined, slot: VibedSlot) {
  const slotReason =
    slot === "12:30 PM" ? "midday curiosity" : slot === "6:30 PM" ? "evening satisfying build" : "late-night mastery";
  const matched = chosen.brain.signalsMatched.join(", ") || "core Vibed prefs";
  const conflicted = chosen.brain.signalsConflicted.join(", ") || "no major conflicts";
  const styleCloseness =
    chosen.brain.confidence > 0.8
      ? "very close to your historical picks"
      : chosen.brain.confidence > 0.65
        ? "close to your usual style"
        : "somewhat aligned; keep an eye on framing";

  let beatWhy = "top of today’s list";
  if (alt) {
    const diffs: Array<[string, number]> = [
      ["first frame", chosen.scores.firstFrame - alt.scores.firstFrame],
      ["hook potential", chosen.scores.curiosityGap - alt.scores.curiosityGap],
      ["replay", chosen.scores.replayValue - alt.scores.replayValue],
      ["premium fit", chosen.scores.brandFit - alt.scores.brandFit],
      ["safety", chosen.scores.repostSafety - alt.scores.repostSafety]
    ];
    const bestDiff = diffs.sort((a, b) => b[1] - a[1])[0];
    beatWhy = `beat next best on ${bestDiff[0]} (+${bestDiff[1]} pts)`;
  }

  return `Chosen for ${slotReason}; ${beatWhy}. Matched: ${matched}. Conflicted: ${conflicted}. Influence: ${chosen.brain.trainingInfluence === "training" ? "your training data" : "default brain weights"}. Style match is ${styleCloseness}.`;
}

function ruleTest(key: string, o: Seed, score: ReturnType<typeof buildScores>) {
  switch (key) {
    case "boring talking head":
      return o.formatType === "thread" || (o.formatType === "article" && o.pillar !== "Curiosity / Science");
    case "weak first frame":
      return score.firstFrame < 70;
    case "low quality":
      return o.transformabilityScore < 75;
    case "too much text":
      return o.title.toLowerCase().includes("explained in");
    case "generic meme":
      return o.title.toLowerCase().includes("meme");
    case "weak us relevance":
      return score.usRelevance < 78;
    case "low replay":
      return score.replayValue < 75;
    case "bad safety":
      return score.repostSafety < vibedBrain.tasteProfile.repostSafetyThreshold;
    case "non vibed tone":
      return o.title.toLowerCase().includes("corporate");
    default:
      return false;
  }
}

export function getOpportunities() {
  return opportunities;
}

export function getOpportunity(id: string) {
  return opportunities.find((opportunity) => opportunity.id === id);
}

export function getBrandRules() {
  return brandRules;
}

export function getDailyPlanner(): DailySlotPlan[] {
  const usedHooks = new Set<string>();
  const usedTitles = new Set<string>();
  return (["12:30 PM", "6:30 PM", "9:15 PM"] as VibedSlot[]).map((slot) => {
    const slotItems = opportunities
      .filter((opportunity) => opportunity.suggestedSlot === slot && !opportunity.brain.rejected)
      .sort((a, b) => {
        const tbA = tieBreakComposite(a);
        const tbB = tieBreakComposite(b);
        if (tbB !== tbA) return tbB - tbA;
        return b.brain.score - a.brain.score;
      });

    const chosenBase =
      slotItems.find((item) => !item.duplicateWarning && !usedTitles.has(item.title)) ??
      slotItems.find((item) => !usedTitles.has(item.title)) ??
      slotItems[0];
    const alt = slotItems[1];
    const narrative = buildDecisionNarrative(chosenBase, alt, slot);
    const chosenWithBrain = { ...chosenBase, brain: { ...chosenBase.brain, explanation: narrative } };
    const chosenHook = pickUniqueHook(chosenBase, usedHooks);
    usedHooks.add(chosenHook);
    usedTitles.add(chosenBase.title);

    return {
      slot,
      pillar: chosenBase.pillar,
      chosen: { ...chosenWithBrain, bestHook: chosenHook },
      backups: slotItems.slice(1, 4)
    };
  });
}

function pickUniqueHook(opportunity: Opportunity, usedHooks: Set<string>) {
  const options = [
    opportunity.bestHook,
    opportunity.hooks.impossible,
    opportunity.hooks.curiosity,
    opportunity.hooks.waitWhat,
    opportunity.hooks.authority,
    opportunity.hooks.softInformative
  ].filter(Boolean);

  for (const hook of options) {
    if (!usedHooks.has(hook)) return hook;
  }
  return options[0];
}

export function getBestNow() {
  const ranked = [...opportunities]
    .filter((item) => !item.brain.rejected)
    .sort((a, b) => b.brain.score - a.brain.score);
  const best = ranked[0];
  return {
    best,
    backups: ranked.slice(1, 4)
  };
}

export async function getBrainStats() {
  await loadFeedbackCache();
  await hydrateExampleWeights();
  const all = await getAllFeedback();
  const total = all.length;
  const countReasons: Record<string, number> = {};
  for (const fb of all) {
    for (const r of fb.reasons) {
      countReasons[r] = (countReasons[r] ?? 0) + 1;
    }
  }
  const sortedReasons = Object.entries(countReasons).sort((a, b) => b[1] - a[1]);
  const topPrefs = sortedReasons.filter(([r]) => ["weak first frame", "bad hook potential", "weak replay value", "bad caption potential"].includes(r)).slice(0, 3).map(([r]) => r);
  const topDislikes = sortedReasons.filter(([r]) => ["not premium enough", "too random", "too repetitive", "weak us fit"].includes(r)).slice(0, 3).map(([r]) => r);
  const brainConfidence = clamp(0.4 + Math.min(0.4, total * 0.01), 0.4, 0.8);
  return { totalRated: total, topPrefs, topDislikes, brainConfidence, reasonCounts: sortedReasons.map(([reason, count]) => ({ reason, count })) };
}

// Load example weights once per server start
let examplesHydrated = false;
async function hydrateExampleWeights() {
  if (examplesHydrated) return;
  try {
    const examples = await listBrainExamples();
    const weights = {
      hookBoost:
        examples.filter((item) => item.type === "hook-good").length * 0.5 -
        examples.filter((item) => item.type === "hook-bad").length * 0.5,
      captionBoost:
        examples.filter((item) => item.type === "caption-good").length * 0.4 -
        examples.filter((item) => item.type === "caption-bad").length * 0.4,
      postBoost:
        examples.filter((item) => item.type === "great-post").length * 0.6 -
        examples.filter((item) => item.type === "bad-post").length * 0.6
    };
    (globalThis as any).__brainExampleWeights = weights;
    examplesHydrated = true;
  } catch {
    examplesHydrated = true;
  }
}

export function getSavedLibrary() {
  return opportunities.filter((opportunity) => ["saved", "drafted", "used"].includes(opportunity.status));
}

export function getPack(id: string) {
  const opportunity = getOpportunity(id);
  if (!opportunity) return null;

  return {
    id: opportunity.id,
    hookOptions: Object.values(opportunity.hooks),
    selectedHook: opportunity.bestHook,
    coverHeadline: opportunity.coverHeadline,
    imageHeadline: opportunity.imageHeadline,
    caption: opportunity.caption,
    pinnedComment: opportunity.pinnedComment,
    hashtags: opportunity.hashtags,
    bestPostingTime: opportunity.suggestedSlot,
    bestPlatform: opportunity.bestPlatform,
    audioVibe: opportunity.suggestedAudio,
    contentPillar: opportunity.pillar,
    safetyNotes: opportunity.safetyNotes,
    whyItShouldPerform: opportunity.whyItWorks,
    editingNotes: opportunity.editingNotes,
    cta: opportunity.cta,
    sourceLinks: [{ label: opportunity.sourceName, url: opportunity.sourceUrl }]
  };
}

export function getDashboardStats() {
  const total = opportunities.length;
  const highConfidence = opportunities.filter((item) => item.confidence === "high").length;
  const saved = opportunities.filter((item) => item.status === "saved" || item.status === "drafted").length;
  const feeds = new Set(opportunities.map((item) => item.sourceName)).size;
  const averageScore = Math.round(opportunities.reduce((sum, item) => sum + item.scores.viralPotential, 0) / opportunities.length);

  return { total, highConfidence, saved, feeds, averageScore };
}

export function getDailyDigestSummary() {
  const planner = getDailyPlanner();
  return {
    summary: "Today is balanced: one high-save science post, one high-replay engineering post, and one late-night mastery clip.",
    watchouts: "Avoid overusing the same “this looks fake” framing in both the 12:30 and 9:15 slots.",
    bestBet: planner[1].chosen.bestHook
  };
}

export function getStyleDriftAlert() {
  const conflicts = opportunities.filter((o) => (o.brain.signalsConflicted?.length ?? 0) > (o.brain.signalsMatched?.length ?? 0));
  if (conflicts.length === 0) return null;
  return {
    message: "Some picks conflict with your current taste profile. Consider retuning hooks/captions.",
    items: conflicts.slice(0, 3).map((o) => ({ id: o.id, hook: o.bestHook, conflicted: o.brain.signalsConflicted }))
  };
}

export function getAnalyticsData() {
  const memory = [
    { date: "2026-03-22", slot: "12:30 PM", hook: "This was printed on a grain", topic: "Micro laser print", platform: "Reel", result: "Posted", views: 412000, saves: 9100, shares: 5200, note: "Great save/share ratio; keep cover at 5 words." },
    { date: "2026-03-22", slot: "6:30 PM", hook: "This build should not work", topic: "Folding bridge", platform: "Reel", result: "Posted", views: 633000, saves: 10400, shares: 8800, note: "Best first-frame strength of the day." },
    { date: "2026-03-22", slot: "9:15 PM", hook: "Wait, look at that control", topic: "Sand portrait artist", platform: "TikTok", result: "Posted", views: 845000, saves: 12300, shares: 14100, note: "Replay + comments went crazy; keep at night." }
  ];

  return {
    topSlot: "9:15 PM",
    topHookType: "Curiosity / “Wait what?”",
    topTopicType: "Human skill with clean visual payoff",
    topPillar: "Human Skill",
    repeat: ["Precision skill clips", "Tiny science visuals", "Impossible-looking build demos"],
    avoid: ["Broad text-heavy tech explainers", "Corporate announcements", "Overexplained captions"],
    posts: [
      { date: "2026-03-19", slot: "12:30 PM", hook: "Scientists built a robot this small", topic: "Microscopic robots", format: "reel", views: 482000, likes: 38000, shares: 6100, comments: 2200, saves: 8200, watchTime: "88%", note: "Huge saves because the explanation was clear." },
      { date: "2026-03-20", slot: "6:30 PM", hook: "This build should not work", topic: "Self-folding bridge", format: "reel", views: 611000, likes: 51000, shares: 9200, comments: 3100, saves: 9300, watchTime: "91%", note: "Best replay pattern this week." },
      { date: "2026-03-21", slot: "9:15 PM", hook: "How is this even real", topic: "Sand portrait artist", format: "tiktok", views: 802000, likes: 76000, shares: 15000, comments: 5300, saves: 12100, watchTime: "95%", note: "Replay and comments were both elite." }
    ],
    memory,
    patterns: {
      bestSlot: "9:15 PM mastery",
      bestHookType: "Wait-what curiosity",
      bestTopicType: "High-visual skill or process reveal",
      bestPillar: "Human Skill",
      bestFormat: "Short clip with a hard first frame",
      bestCover: "4-6 word contrast headline"
    }
  };
}

export function getFilters() {
  return {
    rewriteForVibed: true,
    usFirst: true,
    highRepostSafetyOnly: false,
    topScoringOnly: false
  };
}
