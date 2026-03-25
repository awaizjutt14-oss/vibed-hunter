import { AssetType, PacketStatus, Prisma } from "@prisma/client";
import OpenAI from "openai";
import { prisma } from "@/lib/db/prisma";
import { buildCreatorOpportunity } from "@/lib/creator-transform";
import { env, isDemoMode } from "@/lib/utils/env";
import { packetGenerationSchema } from "@/lib/validation/schemas";

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

type GeneratedPacket = {
  conciseSummary: string;
  originalityNote: string;
  whyTrending: string;
  bestPlatform: string;
  publishTiming: string;
  confidenceScore: number;
  sourceCitations: { label: string; url: string }[];
  guardrailNotes: { avoidSaying: string[]; uncertainty: string[] };
  packetJson?: Record<string, unknown>;
  assets: Array<{ type: string; platform: string; title?: string; content: string; metadata?: Prisma.JsonValue }>;
};

export async function generatePacketForCluster(clusterId: string, userId: string) {
  const cluster = await prisma.topicCluster.findUniqueOrThrow({
    where: { id: clusterId },
    include: {
      sourceItems: { take: 10, orderBy: { publishTime: "desc" } },
      trendScores: { orderBy: { createdAt: "desc" }, take: 1 }
    }
  });

  const score = cluster.trendScores[0];
  const vibed = ((score?.explanation as any)?.vibedBreakdown ?? {}) as Record<string, number>;
  const platformFit = (score?.explanation as any)?.platformFit ?? cluster.bestPlatform ?? "instagram reels";
  const bestSlot = (score?.explanation as any)?.bestSlot ?? "6:30 PM";
  const contentMode = (score?.explanation as any)?.contentMode ?? "trend-watch";
  const opportunity = buildCreatorOpportunity({
    title: cluster.canonicalTitle,
    summary: cluster.summary,
    bestPlatform: platformFit,
    visualStrength: Math.round(vibed.visualStrength ?? score?.visualContentScore ?? 0),
    repostSafety: Math.round(vibed.repostSafety ?? score?.originalityPotential ?? 0),
    bestSlot,
    contentMode,
    sourceCount: cluster.sourceCount
  });
  const sourceCitations = cluster.sourceItems.map((item) => ({ label: item.sourceName, url: item.url }));

  let generated = fallbackPacket(cluster, opportunity, sourceCitations);

  if (!isDemoMode && openai) {
    try {
      const completion = await openai.responses.create({
        model: env.OPENAI_MODEL,
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text:
                  "You are the editorial brain for Vibed Media, a US-focused short-form channel. Transform approved public metadata into post-ready assets for Instagram Reels, TikTok, and YouTube Shorts. Never copy source wording. Keep hooks compact, visual, curiosity-led, and creator-friendly. Do not present rumors as facts. Return only JSON matching the schema."
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify({
                  cluster: {
                    title: cluster.canonicalTitle,
                    summary: cluster.summary,
                    whyNow: cluster.whyNow,
                    bestPlatform: platformFit,
                    bestSlot,
                    contentMode,
                    sourceCount: cluster.sourceCount
                  },
                  opportunity,
                  sources: cluster.sourceItems.map((item) => ({
                    title: item.title,
                    url: item.url,
                    summary: item.rawSummary,
                    sourceName: item.sourceName
                  }))
                })
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "content_packet",
            schema: {
              type: "object",
              properties: {
                conciseSummary: { type: "string" },
                originalityNote: { type: "string" },
                whyTrending: { type: "string" },
                bestPlatform: { type: "string" },
                publishTiming: { type: "string" },
                confidenceScore: { type: "number" },
                sourceCitations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      url: { type: "string" }
                    },
                    required: ["label", "url"],
                    additionalProperties: false
                  }
                },
                guardrailNotes: {
                  type: "object",
                  properties: {
                    avoidSaying: { type: "array", items: { type: "string" } },
                    uncertainty: { type: "array", items: { type: "string" } }
                  },
                  required: ["avoidSaying", "uncertainty"],
                  additionalProperties: false
                },
                packetJson: {
                  type: "object",
                  additionalProperties: true
                },
                assets: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string" },
                      platform: { type: "string" },
                      title: { type: "string" },
                      content: { type: "string" }
                    },
                    required: ["type", "platform", "content"],
                    additionalProperties: false
                  }
                }
              },
              required: [
                "conciseSummary",
                "originalityNote",
                "whyTrending",
                "bestPlatform",
                "publishTiming",
                "confidenceScore",
                "sourceCitations",
                "guardrailNotes",
                "packetJson",
                "assets"
              ],
              additionalProperties: false
            }
          }
        }
      });

      const parsed = JSON.parse(completion.output_text);
      generated = {
        ...generated,
        ...packetGenerationSchema.parse(parsed)
      };
    } catch {
      generated = fallbackPacket(cluster, opportunity, sourceCitations);
    }
  }

  const packet = await prisma.contentPacket.create({
    data: {
      userId,
      clusterId,
      status: PacketStatus.READY,
      conciseSummary: generated.conciseSummary,
      originalityNote: generated.originalityNote,
      whyTrending: generated.whyTrending,
      bestPlatform: generated.bestPlatform,
      publishTiming: generated.publishTiming,
      confidenceScore: generated.confidenceScore,
      sourceCitations: generated.sourceCitations,
      guardrailNotes: generated.guardrailNotes,
      packetJson: (generated.packetJson ?? {}) as Prisma.InputJsonValue
    }
  });

  await prisma.generatedAsset.createMany({
    data: generated.assets.map((asset) => ({
      packetId: packet.id,
      type: (asset.type as AssetType) ?? AssetType.CAPTION,
      platform: asset.platform,
      title: asset.title,
      content: asset.content,
      metadata: ("metadata" in asset ? asset.metadata : undefined) as Prisma.InputJsonValue | undefined
    }))
  });

  return packet;
}

function fallbackPacket(
  cluster: {
    canonicalTitle: string;
    summary: string;
    whyNow: string;
  },
  opportunity: ReturnType<typeof buildCreatorOpportunity>,
  sourceCitations: { label: string; url: string }[]
): GeneratedPacket {
  const bestPlatform = inferPlatformFromOpportunity(opportunity);
  const hashtags = buildHashtags(cluster.canonicalTitle, cluster.summary);
  const coverText = buildCoverText(opportunity.hook, cluster.canonicalTitle);
  const pinnedComment = `Would you post this angle or save it for later?\n\nIf you want more ideas like this, follow @vibed.media.`;

  return {
    conciseSummary: opportunity.hook,
    originalityNote:
      "This packet is an originality-safe synthesis built from public metadata and source summaries. It transforms the angle into Vibed Media language instead of copying source phrasing.",
    whyTrending: `${opportunity.whyFits} ${opportunity.shortFormReason}`,
    bestPlatform,
    publishTiming: `${opportunity.slotReason} Recommended slot: ${inferSlotFromOpportunity(opportunity)}.`,
    confidenceScore: Number((Math.max(opportunity.editorialScore, 68) / 100).toFixed(2)),
    sourceCitations,
    guardrailNotes: {
      avoidSaying: [
        "Do not claim footage rights unless you verified ownership.",
        "Do not present uncertain technical claims as settled facts."
      ],
      uncertainty: ["Verify the linked sources before publishing any factual explanation or performance claim."]
    },
    packetJson: {
      finalHook: opportunity.hook,
      hookCandidates: opportunity.hookCandidates,
      angle: opportunity.angle,
      whyFits: opportunity.whyFits,
      shortFormReason: opportunity.shortFormReason,
      pinnedComment,
      coverText,
      hashtags,
      editorialScore: opportunity.editorialScore,
      safetyNote: opportunity.rejectionReasons[0] ?? "Keep the framing transformative and source-attributed."
    },
    assets: buildDeterministicAssets(cluster.canonicalTitle, cluster.summary, bestPlatform, opportunity, hashtags, coverText)
  };
}

function buildDeterministicAssets(
  title: string,
  summary: string,
  bestPlatform: string,
  opportunity: ReturnType<typeof buildCreatorOpportunity>,
  hashtags: string,
  coverText: string
) {
  const captionLines = [
    "Follow @vibed.media for ideas shaping the future.",
    "",
    opportunity.hook,
    opportunity.visualExplanation,
    opportunity.shortFormReason,
    "",
    hashtags,
    "",
    "Source note: verify the linked sources before posting."
  ];

  return [
    {
      type: AssetType.HOOK,
      platform: bestPlatform,
      title: "Best hook",
      content: [opportunity.hook, ...opportunity.hookCandidates.slice(1, 4)].join("\n")
    },
    {
      type: AssetType.CAPTION,
      platform: bestPlatform,
      title: "Caption",
      content: captionLines.join("\n")
    },
    {
      type: AssetType.SCRIPT,
      platform: bestPlatform,
      title: "Short-form script",
      content: [
        `Hook: ${opportunity.hook}`,
        `Visual setup: ${opportunity.visualExplanation}`,
        `Why people care: ${opportunity.whyFits}`,
        `End line: ${opportunity.shortFormReason}`
      ].join("\n")
    },
    {
      type: AssetType.CAROUSEL,
      platform: "instagram carousel",
      title: "Carousel idea",
      content: [
        `Slide 1: ${opportunity.hook}`,
        `Slide 2: What you are looking at`,
        `Slide 3: Why it feels unreal`,
        `Slide 4: What it means next`,
        `Slide 5: Save for later`
      ].join("\n")
    },
    {
      type: AssetType.THUMBNAIL,
      platform: "youtube shorts",
      title: "Cover text",
      content: coverText
    },
    {
      type: AssetType.CTA,
      platform: "multi-platform",
      title: "CTA",
      content: "Follow @vibed.media for ideas shaping the future."
    },
    {
      type: AssetType.KEYWORDS,
      platform: bestPlatform,
      title: "Hashtags",
      content: hashtags
    },
    {
      type: AssetType.RISK_NOTE,
      platform: "multi-platform",
      title: "Safety note",
      content: buildRiskNote(summary, opportunity)
    }
  ];
}

function buildHashtags(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  if (containsAny(text, ["robot", "ai", "machine"])) return "#science #technology #ai #future";
  if (containsAny(text, ["engineering", "build", "bridge", "design"])) return "#engineering #innovation #technology #future";
  if (containsAny(text, ["nature", "animal", "ocean", "space"])) return "#nature #science #earth #facts";
  return "#science #technology #future #viral";
}

function buildCoverText(hook: string, title: string) {
  const seed = hook || title;
  return seed
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}

function buildRiskNote(summary: string, opportunity: ReturnType<typeof buildCreatorOpportunity>) {
  const text = summary.toLowerCase();
  if (containsAny(text, ["study", "scientists", "research"])) {
    return "Keep claims tied to the cited sources and avoid overselling what the research proves.";
  }
  if (opportunity.rejectionReasons.some((reason) => reason.includes("repost safety"))) {
    return "Double-check footage ownership and keep the caption clearly transformative before publishing.";
  }
  return "Keep the framing transformative, source-linked, and avoid claiming anything the sources do not clearly support.";
}

function inferPlatformFromOpportunity(opportunity: ReturnType<typeof buildCreatorOpportunity>) {
  if (opportunity.shortFormReason.toLowerCase().includes("tiktok")) return "tiktok";
  if (opportunity.shortFormReason.toLowerCase().includes("youtube")) return "youtube shorts";
  return "instagram reels";
}

function inferSlotFromOpportunity(opportunity: ReturnType<typeof buildCreatorOpportunity>) {
  if (opportunity.slotReason.toLowerCase().includes("late at night")) return "9:15 PM";
  if (opportunity.slotReason.toLowerCase().includes("back on their phones")) return "6:30 PM";
  return "12:30 PM";
}

function containsAny(text: string, phrases: string[]) {
  return phrases.some((phrase) => text.includes(phrase));
}

export async function generatePacketsForTopClusters(limit = 5) {
  const user = await prisma.user.findFirstOrThrow();
  const clusters = await prisma.topicCluster.findMany({
    where: { status: "ACTIVE" },
    include: {
      trendScores: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    take: Math.max(limit * 4, 20),
    orderBy: { updatedAt: "desc" }
  });

  const ranked = [...clusters]
    .map((cluster) => {
      const score = cluster.trendScores[0];
      const vibed = ((score?.explanation as any)?.vibedBreakdown ?? {}) as Record<string, number>;
      const opportunity = buildCreatorOpportunity({
        title: cluster.canonicalTitle,
        summary: cluster.summary,
        bestPlatform: (score?.explanation as any)?.platformFit ?? cluster.bestPlatform ?? "instagram reels",
        visualStrength: Math.round(vibed.visualStrength ?? score?.visualContentScore ?? 0),
        repostSafety: Math.round(vibed.repostSafety ?? score?.originalityPotential ?? 0),
        bestSlot: (score?.explanation as any)?.bestSlot ?? "6:30 PM",
        contentMode: (score?.explanation as any)?.contentMode ?? "trend-watch",
        sourceCount: cluster.sourceCount
      });

      return {
        cluster,
        opportunity,
        rankScore: (score?.finalScore ?? 0) + opportunity.editorialScore
      };
    })
    .filter(({ opportunity }) => opportunity.editorialScore >= 70 && !opportunity.rejectionReasons.some((reason) => reason.includes("corporate")))
    .sort((a, b) => b.rankScore - a.rankScore);

  const generated = [];
  for (const { cluster } of ranked.slice(0, limit)) {
    generated.push(await generatePacketForCluster(cluster.id, user.id));
  }

  return generated;
}
