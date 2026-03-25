import { z } from "zod";

export const sourceConnectorSchema = z.object({
  title: z.string().min(1),
  sourceName: z.string().min(1),
  sourceType: z.string().min(1),
  url: z.string().url(),
  publishTime: z.string().datetime().optional(),
  topicTags: z.array(z.string()).default([]),
  region: z.string().optional(),
  language: z.string().default("en"),
  engagementSignals: z.record(z.any()).optional(),
  rawSummary: z.string().optional()
});

export const scoringWeightsSchema = z.object({
  freshness: z.number().min(0).max(1),
  momentum: z.number().min(0).max(1),
  audienceFit: z.number().min(0).max(1),
  originalityPotential: z.number().min(0).max(1),
  visualPotential: z.number().min(0).max(1),
  postability: z.number().min(0).max(1),
  sourceDiversity: z.number().min(0).max(1),
  novelty: z.number().min(0).max(1)
});

export const packetGenerationSchema = z.object({
  conciseSummary: z.string(),
  originalityNote: z.string(),
  whyTrending: z.string(),
  bestPlatform: z.string(),
  publishTiming: z.string(),
  confidenceScore: z.number(),
  sourceCitations: z.array(z.object({ label: z.string(), url: z.string().url() })),
  guardrailNotes: z.object({
    avoidSaying: z.array(z.string()),
    uncertainty: z.array(z.string())
  }),
  packetJson: z.record(z.any()).optional(),
  assets: z.array(
    z.object({
      type: z.string(),
      platform: z.string(),
      title: z.string().optional(),
      content: z.string(),
      metadata: z.record(z.any()).optional()
    })
  )
});

export const settingsSchema = z.object({
  niches: z.array(z.string()),
  bannedTopics: z.array(z.string()),
  preferredTone: z.string(),
  targetAudienceCountry: z.string(),
  platformFocus: z.array(z.string()),
  captionStyle: z.string(),
  minimumOriginalityScore: z.number().min(0).max(100),
  preferredPostingTimes: z.array(z.string()),
  brandVoiceExamples: z.array(z.string()),
  highConfidenceOnly: z.boolean().optional()
});
