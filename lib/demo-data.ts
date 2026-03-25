import { AssetType, PacketStatus, SourceType } from "@prisma/client";

export const demoUser = {
  email: "admin@contenthunter.local",
  name: "Content Hunter Demo",
  settings: {
    niches: ["ai", "creator economy", "emerging tech"],
    bannedTopics: ["celebrity gossip"],
    preferredTone: "premium",
    targetAudienceCountry: "US",
    platformFocus: ["instagram", "tiktok", "youtube"],
    captionStyle: "punchy",
    minimumOriginalityScore: 72,
    preferredPostingTimes: ["09:30", "13:00", "18:30"],
    brandVoiceExamples: ["clear", "smart", "curious", "confident"],
    contentLengthPreferences: {
      reels: "20-35s",
      shorts: "25-45s",
      youtube: "8-12m"
    },
    scoringWeights: {
      freshness: 0.22,
      momentum: 0.18,
      audienceFit: 0.16,
      originalityPotential: 0.14,
      visualPotential: 0.12,
      postability: 0.1,
      sourceDiversity: 0.05,
      novelty: 0.03
    }
  }
};

export const demoSources = [
  {
    name: "ScienceDaily AI",
    sourceType: SourceType.RSS,
    url: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml",
    connectorKey: "rss",
    tags: ["category:AI / Robotics", "priority:high", "science", "robots", "visual"]
  },
  {
    name: "ScienceDaily Engineering",
    sourceType: SourceType.RSS,
    url: "https://www.sciencedaily.com/rss/matter_energy/engineering.xml",
    connectorKey: "rss",
    tags: ["category:Visual Engineering", "priority:high", "engineering", "builds", "visual"]
  },
  {
    name: "NASA Breaking News",
    sourceType: SourceType.RSS,
    url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",
    connectorKey: "rss",
    tags: ["category:Nature / Earth / Space", "priority:high", "space", "visual", "breaking"]
  },
  {
    name: "Reddit Robotics",
    sourceType: SourceType.REDDIT,
    url: "https://www.reddit.com/r/robotics/.rss",
    connectorKey: "reddit",
    tags: ["category:AI / Robotics", "priority:high", "robotics", "demos", "community"]
  },
  {
    name: "Reddit BeAmazed",
    sourceType: SourceType.REDDIT,
    url: "https://www.reddit.com/r/BeAmazed/.rss",
    connectorKey: "reddit",
    tags: ["category:Weird But Real", "priority:high", "visual", "surprise", "unusual"]
  },
  {
    name: "Reddit Damn Thats Interesting",
    sourceType: SourceType.REDDIT,
    url: "https://www.reddit.com/r/Damnthatsinteresting/.rss",
    connectorKey: "reddit",
    tags: ["category:Weird But Real", "priority:high", "weird", "real", "visual"]
  },
  {
    name: "Reddit Nature Is Metal",
    sourceType: SourceType.REDDIT,
    url: "https://www.reddit.com/r/NatureIsMetal/.rss",
    connectorKey: "reddit",
    tags: ["category:Nature / Earth / Space", "priority:high", "nature", "shock", "wildlife"]
  },
  {
    name: "Reddit Skilled Trades",
    sourceType: SourceType.REDDIT,
    url: "https://www.reddit.com/r/oddlysatisfying/.rss",
    connectorKey: "reddit",
    tags: ["category:Human Skill / Craftsmanship", "priority:medium", "satisfying", "craft", "visual"]
  },
  {
    name: "MIT Technology Review",
    sourceType: SourceType.RSS,
    url: "https://www.technologyreview.com/feed/",
    connectorKey: "rss",
    tags: ["category:Science Breakthroughs", "priority:medium", "tech", "research"]
  },
  {
    name: "OpenAI News",
    sourceType: SourceType.RSS,
    url: "https://openai.com/news/rss.xml",
    connectorKey: "rss",
    tags: ["category:AI / Robotics", "priority:low", "corporate", "models", "text-heavy"]
  },
  {
    name: "BBC Technology",
    sourceType: SourceType.RSS,
    url: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    connectorKey: "rss",
    tags: ["category:Breaking Visual News", "priority:low", "news", "broad", "text-heavy"]
  }
];

export const demoClusters = [
  {
    slug: "tiny-thinking-robots",
    canonicalTitle: "Scientists built thinking robots smaller than salt grains",
    summary: "Micro-scale robots with simple decision-making behavior are getting attention across science and tech communities.",
    whyNow: "The topic combines visual surprise, science credibility, and strong short-form storytelling potential.",
    niche: "ai",
    region: "global",
    language: "en",
    sourceCount: 4,
    bestPlatform: "instagram reels",
    publishUrgency: "high",
    dedupeFingerprint: "tiny-thinking-robots",
    score: {
      freshnessScore: 88,
      momentumScore: 84,
      audienceFitScore: 82,
      originalityPotential: 79,
      visualContentScore: 95,
      postabilityScore: 90,
      noveltyScore: 81,
      sourceDiversityScore: 76,
      emotionalPullScore: 89,
      finalScore: 87,
      explanation: {
        why: ["multiple sources surfaced the same topic", "visual contrast is very strong", "high fit for short-form explainers"]
      }
    }
  },
  {
    slug: "open-model-rollout-week",
    canonicalTitle: "Open model rollouts are accelerating across labs",
    summary: "Major AI labs are releasing more accessible models and product tie-ins, creating a fresh angle for creator workflow explainers.",
    whyNow: "Cross-platform conversation is rising and the topic supports repeatable hooks and comparison content.",
    niche: "creator economy",
    region: "US",
    language: "en",
    sourceCount: 5,
    bestPlatform: "youtube shorts",
    publishUrgency: "medium",
    dedupeFingerprint: "open-model-rollout-week",
    score: {
      freshnessScore: 80,
      momentumScore: 79,
      audienceFitScore: 93,
      originalityPotential: 77,
      visualContentScore: 71,
      postabilityScore: 85,
      noveltyScore: 69,
      sourceDiversityScore: 82,
      emotionalPullScore: 74,
      finalScore: 81,
      explanation: {
        why: ["strong creator relevance", "multiple trusted sources", "high utility for explainers and roundups"]
      }
    }
  }
];

export const demoPackets = [
  {
    clusterSlug: "tiny-thinking-robots",
    status: PacketStatus.READY,
    conciseSummary: "A tiny robotics breakthrough with huge visual storytelling upside.",
    originalityNote: "This packet synthesizes public reporting and research coverage into fresh hooks and scripts. It does not copy source phrasing.",
    whyTrending: "It pairs a surprising visual scale with a credible science breakthrough and a clean curiosity hook.",
    bestPlatform: "instagram reels",
    publishTiming: "Post in the next 12 hours while curiosity is high.",
    confidenceScore: 0.89,
    sourceCitations: [
      { label: "MIT Technology Review", url: "https://www.technologyreview.com/feed/" },
      { label: "ScienceDaily", url: "https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml" }
    ],
    guardrailNotes: {
      avoidSaying: ["These robots are fully autonomous general intelligence"],
      uncertainty: ["Capabilities may still be limited to lab conditions"]
    },
    packetJson: {
      hooks: [
        "Scientists built thinking robots smaller than salt",
        "This robot is smaller than a grain of salt"
      ]
    },
    assets: [
      { type: AssetType.HOOK, platform: "instagram", title: "Hook Set", content: "Scientists built thinking robots smaller than salt" },
      { type: AssetType.CAPTION, platform: "instagram", title: "Punchy Caption", content: "Follow @vibed.media for ideas shaping the future.\n\nTiny robots.\nReal decisions.\nBig future implications." },
      { type: AssetType.SCRIPT, platform: "youtube-shorts", title: "Short Script", content: "Hook, explain the scale contrast, note the lab breakthrough, end with why it matters." },
      { type: AssetType.THUMBNAIL, platform: "youtube", title: "Thumbnail Text", content: "Smaller Than Salt" }
    ]
  }
];
