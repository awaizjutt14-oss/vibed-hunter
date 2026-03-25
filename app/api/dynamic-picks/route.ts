import { NextResponse } from "next/server";
import { brainWeight, brainNotes } from "@/lib/vibed-brain-lite";

type Rec = {
  slot: "12:30 PM" | "6:30 PM" | "9:15 PM";
  hook: string;
  videoType: string;
  bestTopic: string;
  angle: string;
  hookDirection: string;
  backupTopics: string[];
  avoid: string;
  videoHint: string;
  category: string;
  hookStyle: string;
  viralScore: number;
  categoryLabel: string;
};

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
  // build a few options and pick the one boosted by brain weight
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
      hook,
      videoType,
      bestTopic,
      angle,
      hookDirection,
      backupTopics: [backup1, backup2],
      avoid: slot === "9:15 PM" ? "Avoid blurry or shaky clips" : slot === "6:30 PM" ? "Avoid messy camera angles" : "Avoid text-heavy overlays",
      videoHint,
      category: templates.category,
      hookStyle: hookDirection.toLowerCase(),
      viralScore: scoreViral(bestTopic, angle, hookDirection, slot, templates.category),
      categoryLabel: templates.categoryLabel
    };
  });

  candidates.sort((a, b) => {
    const wa = brainWeight(slot, a.category, a.hookStyle);
    const wb = brainWeight(slot, b.category, b.hookStyle);
    return wb - wa;
  });
  return candidates[0];
}

function makeHook(topic: string, angle: string): string {
  const topicBits = topic.split(" ").slice(0, 5).join(" ");
  const leadBits = topic.split(" ").slice(0, 4).join(" ");
  const hooks = [
    `${topicBits} feels fake until you see it`,
    `${topicBits} should not look this clean`,
    `${leadBits} is smaller than you think`,
    `${leadBits} makes no sense at first`,
    `You would not believe ${leadBits} is real`,
    `${leadBits} looks impossible in real life`
  ];
  const chosen = pick(hooks).trim().replace(/\s+/g, " ");
  return chosen.split(" ").slice(0, 10).join(" ");
}

function scoreViral(topic: string, angle: string, hookDirection: string, slot: Rec["slot"], category: string) {
  let score = 72;
  if (topic.toLowerCase().includes("microscope") || topic.toLowerCase().includes("laser")) score += 8;
  if (topic.toLowerCase().includes("cnc") || topic.toLowerCase().includes("precision")) score += 9;
  if (topic.toLowerCase().includes("parkour") || topic.toLowerCase().includes("balance")) score += 10;
  if (angle.toLowerCase().includes("fake") || angle.toLowerCase().includes("impossible")) score += 6;
  if (hookDirection.toLowerCase().includes("wait") || hookDirection.toLowerCase().includes("replay")) score += 4;
  if (slot === "9:15 PM" && category === "shock") score += 4;
  return Math.min(100, score);
}

export async function GET() {
  const recs: Rec[] = ["12:30 PM", "6:30 PM", "9:15 PM"].map((slot) => buildRec(slot as Rec["slot"]));
  lastTopics = recs.map((r) => r.bestTopic);
  const notToPost = ["No talking-head rants today", "Skip boring time-lapses", "Avoid shaky phone footage"];
  return NextResponse.json({ recs, notToPost, brainNotes: brainNotes() });
}
