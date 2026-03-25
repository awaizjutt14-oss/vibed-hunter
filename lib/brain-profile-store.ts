import { prisma } from "@/lib/db/prisma";

export type BrainProfileData = {
  name: string;
  preferredTraits: string[];
  dislikedTraits: string[];
  approvedSources: string[];
  hookPreferences: {
    approvedStyles: string[];
    bannedStyles: string[];
    idealLength: [number, number];
    disbeliefStrength: number;
    curiosityVsAuthority: number;
    avoidPhrases: string[];
  };
  captionDNA: {
    ctaStyle: string;
    paragraphs: string;
    tone: string;
    premium: boolean;
    minimalHashtags: boolean;
    alwaysPinnedComment: boolean;
    avoidRobotic: boolean;
    avoidBloated: boolean;
    versions: number;
  };
  tasteProfile: {
    preferredTraits: string[];
    dislikedTraits: string[];
    firstFrameImportance: number;
    hookImportance: number;
    usAudienceBias: number;
    replayPreference: number;
    repostSafetyThreshold: number;
    captionImportance: number;
    premiumFeel: number;
    educationalVsShocking: number;
  };
  rejectionRules: string[];
  tieBreakWeights: {
    firstFrame: number;
    hook: number;
    premium: number;
    replay: number;
    usFit: number;
    safety: number;
  };
  topicHistory: Array<{ topic: string; slot?: "12:30" | "6:30" | "9:15"; outcome?: "used" | "skipped" | "saved"; ts: number }>;
  postOutcomes: Array<{ topic: string; views?: number; saves?: number; likes?: number; comments?: number; slot?: string; ts: number }>;
  pendingPatterns: Array<{ pattern: string; source: string; decision?: "accepted" | "ignored" | "downgraded" | "pending"; addedAt: number }>;
  driftAlerts: string[];
};

let cachedProfile: BrainProfileData | null = null;
let cachedVersionLabel: string | null = null;

export function defaultBrainProfile(): BrainProfileData {
  return {
    name: "Vibed Brain",
    preferredTraits: ["visual contrast", "clean process", "impossible-looking control", "science with proof", "replay punch"],
    dislikedTraits: ["talking head", "heavy text", "generic meme", "low-res clip", "corporate PR"],
    approvedSources: ["sciencealert.com", "sciencedaily.com", "nasa.gov", "technologyreview.com", "reddit.com/r/nextfuckinglevel", "reddit.com/r/interestingasfuck"],
    hookPreferences: {
      approvedStyles: ["curiosity", "impossible", "wait what", "authority-lite"],
      bannedStyles: ["shouty", "spammy", "stop scrolling", "all caps"],
      idealLength: [4, 10],
      disbeliefStrength: 0.7,
      curiosityVsAuthority: 0.6,
      avoidPhrases: ["stop scrolling", "you won't believe", "smash like"]
    },
    captionDNA: {
      ctaStyle: "top-line CTA, short and confident",
      paragraphs: "short punchy paragraphs",
      tone: "warm authority, informative",
      premium: true,
      minimalHashtags: true,
      alwaysPinnedComment: true,
      avoidRobotic: true,
      avoidBloated: true,
      versions: 2
    },
    tasteProfile: {
      preferredTraits: ["visual contrast", "clean process", "impossible-looking control", "science with proof", "replay punch"],
      dislikedTraits: ["talking head", "heavy text", "generic meme", "low-res clip", "corporate PR"],
      firstFrameImportance: 0.9,
      hookImportance: 0.85,
      usAudienceBias: 0.8,
      replayPreference: 0.8,
      repostSafetyThreshold: 78,
      captionImportance: 0.65,
      premiumFeel: 0.75,
      educationalVsShocking: 0.55
    },
    rejectionRules: [
      "boring talking head",
      "weak first frame",
      "low quality",
      "too much text",
      "generic meme",
      "weak us relevance",
      "low replay",
      "bad safety",
      "non vibed tone"
    ],
    tieBreakWeights: {
      firstFrame: 0.3,
      hook: 0.25,
      premium: 0.15,
      replay: 0.15,
      usFit: 0.1,
      safety: 0.05
    },
    topicHistory: [],
    postOutcomes: [],
    pendingPatterns: [],
    driftAlerts: []
  };
}

export async function loadBrainProfile(): Promise<BrainProfileData> {
  if (cachedProfile) return cachedProfile;
  const client: any = prisma as any;
  if (!client.brainProfile?.findFirst) {
    cachedProfile = defaultBrainProfile();
    cachedVersionLabel = "Default";
    return cachedProfile;
  }
  await ensureBaseProfiles(client);
  const existing = await client.brainProfile.findFirst({
    where: { isActive: true },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }]
  });
  if (existing) {
    cachedProfile = deserializeProfile(existing);
    cachedVersionLabel = existing.versionLabel ?? existing.name;
    return cachedProfile;
  }
  const created = await client.brainProfile.create({
    data: { ...serializeProfile(defaultBrainProfile()), versionLabel: "Default", isDefault: true }
  });
  cachedProfile = deserializeProfile(created);
  cachedVersionLabel = created.versionLabel ?? created.name;
  return cachedProfile;
}

export async function saveBrainProfile(profile: BrainProfileData) {
  const client: any = prisma as any;
  if (!client.brainProfile?.create) return;
  await client.brainProfile.create({ data: serializeProfile(profile) });
  cachedProfile = profile;
}

export async function updateBrainProfile(partial: Partial<BrainProfileData>) {
  const client: any = prisma as any;
  const current = await loadBrainProfile();
  const next: BrainProfileData = { ...current, ...partial };
  cachedProfile = next;
  if (client.brainProfile?.updateMany) {
    const active = await client.brainProfile.findFirst({ where: { isActive: true }, orderBy: [{ createdAt: "desc" }] });
    if (active) {
      await client.brainProfile.update({
        where: { id: active.id },
        data: serializeProfile(next)
      });
      return next;
    }
  }
  // fallback create new revision
  if (client.brainProfile?.create) {
    await client.brainProfile.create({ data: serializeProfile(next) });
  }
  return next;
}

export async function resetBrainProfile() {
  cachedProfile = defaultBrainProfile();
  const client: any = prisma as any;
  if (client.brainProfile?.create) {
    await client.brainProfile.create({ data: { ...serializeProfile(cachedProfile), versionLabel: "Default", isDefault: true } });
  }
  return cachedProfile;
}

export async function exportBrainProfile() {
  const profile = await loadBrainProfile();
  return profile;
}

export async function importBrainProfile(profile: BrainProfileData) {
  cachedProfile = profile;
  const client: any = prisma as any;
  if (client.brainProfile?.create) {
    await client.brainProfile.create({ data: serializeProfile(profile) });
  }
  return profile;
}

export async function listBrainProfiles() {
  const client: any = prisma as any;
  if (!client.brainProfile?.findMany) return [];
  return client.brainProfile.findMany({ orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
}

export async function activateBrainProfile(id: string) {
  const client: any = prisma as any;
  if (!client.brainProfile?.updateMany) return null;
  await client.brainProfile.updateMany({ data: { isActive: false }, where: {} });
  const active = await client.brainProfile.update({ where: { id }, data: { isActive: true } });
  cachedProfile = deserializeProfile(active);
  cachedVersionLabel = active.versionLabel ?? active.name;
  return cachedProfile;
}

async function ensureBaseProfiles(client: any) {
  const count = await client.brainProfile.count();
  if (count > 0) return;
  const base = defaultBrainProfile();
  const variants: Array<[string, Partial<BrainProfileData> & { markDefault?: boolean }]> = [
    ["Default Vibed", { markDefault: true }],
    ["More Premium", { tieBreakWeights: { ...base.tieBreakWeights, premium: 0.25, hook: 0.2, firstFrame: 0.2, replay: 0.15, usFit: 0.1, safety: 0.1 }, captionDNA: { ...base.captionDNA, tone: "premium authority", premium: true } }],
    ["More Educational", { tieBreakWeights: { ...base.tieBreakWeights, hook: 0.18, firstFrame: 0.18, replay: 0.12, premium: 0.12, usFit: 0.1, safety: 0.1 }, tasteProfile: { ...base.tasteProfile, educationalVsShocking: 0.7 } }],
    ["More Viral", { tieBreakWeights: { ...base.tieBreakWeights, firstFrame: 0.28, hook: 0.25, replay: 0.2, premium: 0.1, usFit: 0.1, safety: 0.07 }, tasteProfile: { ...base.tasteProfile, premiumFeel: 0.65 } }],
    ["More Cinematic", { tieBreakWeights: { ...base.tieBreakWeights, firstFrame: 0.3, hook: 0.2, replay: 0.18, premium: 0.18, usFit: 0.08, safety: 0.06 }, hookPreferences: { ...base.hookPreferences, idealLength: [4, 9] } }]
  ];
  for (const [label, overrides] of variants) {
    const profile: BrainProfileData = {
      ...base,
      ...overrides,
      tieBreakWeights: overrides.tieBreakWeights ?? base.tieBreakWeights,
      captionDNA: overrides.captionDNA ?? base.captionDNA,
      tasteProfile: overrides.tasteProfile ?? base.tasteProfile,
      hookPreferences: overrides.hookPreferences ?? base.hookPreferences
    };
    await client.brainProfile.create({
      data: { ...serializeProfile(profile), versionLabel: label, isDefault: !!overrides.markDefault, isActive: label === "Default Vibed" }
    });
  }
}

function serializeProfile(profile: BrainProfileData) {
  return {
    name: profile.name,
    preferredTraits: profile.preferredTraits,
    dislikedTraits: profile.dislikedTraits,
    approvedSources: profile.approvedSources,
    hookPreferences: profile.hookPreferences,
    captionDNA: profile.captionDNA,
    tasteProfile: profile.tasteProfile,
    rejectionRules: profile.rejectionRules,
    tieBreakWeights: profile.tieBreakWeights,
    topicHistory: profile.topicHistory,
    postOutcomes: profile.postOutcomes,
    pendingPatterns: profile.pendingPatterns,
    driftAlerts: profile.driftAlerts
  };
}

function deserializeProfile(record: {
  name: string;
  preferredTraits: any;
  dislikedTraits: any;
  approvedSources?: any;
  hookPreferences: any;
  captionDNA: any;
  tasteProfile: any;
  rejectionRules: any;
  tieBreakWeights: any;
  topicHistory?: any;
  postOutcomes?: any;
  pendingPatterns?: any;
  driftAlerts?: any;
}): BrainProfileData {
  const arr = (val: any): string[] => (Array.isArray(val) ? val.map((v) => String(v)) : []);
  return {
    name: record.name,
    preferredTraits: arr(record.preferredTraits),
    dislikedTraits: arr(record.dislikedTraits),
    approvedSources: arr(record.approvedSources ?? []),
    hookPreferences: record.hookPreferences,
    captionDNA: record.captionDNA,
    tasteProfile: record.tasteProfile,
    rejectionRules: arr(record.rejectionRules),
    tieBreakWeights: record.tieBreakWeights,
    topicHistory: Array.isArray(record.topicHistory) ? record.topicHistory : [],
    postOutcomes: Array.isArray(record.postOutcomes) ? record.postOutcomes : [],
    pendingPatterns: Array.isArray(record.pendingPatterns) ? record.pendingPatterns : [],
    driftAlerts: arr(record.driftAlerts ?? [])
  };
}
