type ExampleTag =
  | "love this"
  | "good fit"
  | "maybe"
  | "hate this"
  | "my style"
  | "not my style"
  | "high performer"
  | "low performer";

type Example = {
  id: string;
  title: string;
  type: "screenshot" | "cover" | "analytics" | "competitor" | "my post" | "other";
  tags: ExampleTag[];
  notes?: string;
};

const examples: Example[] = [
  { id: "ex1", title: "Robot hand zoom close-up", type: "screenshot", tags: ["love this", "my style", "high performer"], notes: "Tight macro, clean contrast" },
  { id: "ex2", title: "Talking head tech rant", type: "competitor", tags: ["hate this", "not my style", "low performer"], notes: "Static talking head" },
  { id: "ex3", title: "Process machine satisfying loop", type: "my post", tags: ["good fit", "high performer", "my style"], notes: "Looped motion, minimal text" },
  { id: "ex4", title: "Wordy infographic", type: "competitor", tags: ["hate this", "too generic" as ExampleTag, "low performer"], notes: "Heavy text, low first frame" },
  { id: "ex5", title: "Nature shock clip - blue lava", type: "other", tags: ["love this", "good fit", "my style"], notes: "Big visual contrast" }
];

export function getExamples() {
  return examples;
}

export function getExamplePatterns() {
  const likes = examples.filter((e) => e.tags.includes("love this") || e.tags.includes("good fit") || e.tags.includes("my style"));
  const dislikes = examples.filter((e) => e.tags.includes("hate this") || e.tags.includes("not my style"));

  const visualStyle = likes.some((e) => e.title.toLowerCase().includes("macro")) ? "tight macro with contrast" : "bold contrast visuals";
  const hookStyle = "short curiosity lines that point at a visual reveal";
  const topics = ["robotics demos", "satisfying processes", "nature shock visuals"];
  const premium = "clean, minimal overlays, no shouty text";
  const generic = "talking heads, heavy text slides, wordy infographics";

  return {
    visualStyle,
    hookStyle,
    topics,
    premium,
    generic,
    likedTypes: likes.map((e) => e.title).slice(0, 5),
    rejectedTypes: dislikes.map((e) => e.title).slice(0, 5)
  };
}

export function getDailyRecSlots() {
  const patterns = getExamplePatterns();
  return [
    {
      slot: "12:30 PM",
      videoType: "Curiosity science clip with instant visual reveal",
      topics: [
        "Micro robots working together",
        "Nature that looks fake (lava, storms)",
        "Tiny scale tech with macro close-ups",
        "Space hardware deploying",
        "Weird-but-real biology visuals"
      ],
      hookDirection: "Start with the reveal, then the one-line explainer",
      why: "Matches your love for high-contrast, curiosity visuals; avoids talking heads",
      avoid: ["wordy overlays", "slow intro", "too much narration"]
    },
    {
      slot: "6:30 PM",
      videoType: "Satisfying engineering / process loop",
      topics: [
        "Folding bridges or deployables",
        "Factory process with perfect loop",
        "Glass/metal cutting in one motion",
        "Gecko-grip robots on walls",
        "CNC or laser precision moments"
      ],
      hookDirection: "Lead with the mechanism moving; overlay 5-7 words max",
      why: "You liked process loops and high-performer machine posts",
      avoid: ["text-heavy explainers", "static diagrams", "noisy backgrounds"]
    },
    {
      slot: "9:15 PM",
      videoType: "Human skill or unbelievable control clip",
      topics: [
        "Sand art reveals",
        "Knife precision feats",
        "Calligraphy perfect circles",
        "One-hand climbing reset",
        "Coin stack balance tricks"
      ],
      hookDirection: "Impossible claim + instant proof frame",
      why: "Late slot rewards replay; aligns with your ‘love this’ skill clips",
      avoid: ["long setup", "commentary-first", "grainy footage"]
    }
  ];
}

export function getWarnings() {
  return {
    repetition: ["Avoid reusing 'looks fake but real' twice today", "Skip another blue-lava style visual today"],
    badFit: ["Talking head tech rants", "Heavy infographic slides"],
    weakFirstFrame: ["Wide shots with no focal point", "Text-only intros"],
    overusedHooks: ["Stop using 'Wait...' twice in a row", "Avoid 'You won’t believe' phrasing"],
    rejectedExamples: getExamplePatterns().rejectedTypes
  };
}

export function getTopicSuggestions() {
  const patterns = getExamplePatterns();
  return {
    hooks: [
      "This robot moves like liquid metal",
      "Nature shouldn’t glow this color",
      "One cut, zero mistakes",
      "Printed on a grain of rice",
      "Hands aren’t supposed to do this"
    ],
    topics: [
      ...patterns.topics,
      "Origami solar sails opening in orbit",
      "Soft grippers handling glass flawlessly",
      "Factory ice-cutting mirrors",
      "Biology used as circuitry",
      "Calligraphy tricks that look fake"
    ]
  };
}
