import { scoringWeightsSchema } from "@/lib/validation/schemas";

export type ScoreInputs = {
  freshness: number;
  momentum: number;
  audienceFit: number;
  originalityPotential: number;
  visualPotential: number;
  postability: number;
  sourceDiversity: number;
  novelty: number;
  emotionalPull: number;
  vibedBreakdown?: {
    visualStrength: number;
    curiosityTrigger: number;
    shockFactor: number;
    shortFormFit: number;
    usAudienceFit: number;
    repostSafety: number;
    hookPotential: number;
    captionPotential: number;
    coverTextPotential: number;
  };
};

export const defaultWeights = scoringWeightsSchema.parse({
  freshness: 0.22,
  momentum: 0.18,
  audienceFit: 0.16,
  originalityPotential: 0.14,
  visualPotential: 0.12,
  postability: 0.1,
  sourceDiversity: 0.05,
  novelty: 0.03
});

export function calculateTrendScore(input: ScoreInputs, customWeights?: Partial<typeof defaultWeights>) {
  const weights = { ...defaultWeights, ...customWeights };
  const weightedScore =
    input.freshness * weights.freshness +
    input.momentum * weights.momentum +
    input.audienceFit * weights.audienceFit +
    input.originalityPotential * weights.originalityPotential +
    input.visualPotential * weights.visualPotential +
    input.postability * weights.postability +
    input.sourceDiversity * weights.sourceDiversity +
    input.novelty * weights.novelty;

  const vibedScore = input.vibedBreakdown
    ? Object.values(input.vibedBreakdown).reduce((sum, value) => sum + value, 0) / Object.values(input.vibedBreakdown).length
    : weightedScore;

  const finalScore = Number(((weightedScore * 0.35) + (vibedScore * 0.65)).toFixed(2));

  return {
    freshnessScore: input.freshness,
    momentumScore: input.momentum,
    audienceFitScore: input.audienceFit,
    originalityPotential: input.originalityPotential,
    visualContentScore: input.visualPotential,
    postabilityScore: input.postability,
    noveltyScore: input.novelty,
    sourceDiversityScore: input.sourceDiversity,
    emotionalPullScore: input.emotionalPull,
    finalScore,
    explanation: {
      weights,
      vibedBreakdown: input.vibedBreakdown,
      highlights: [
        input.visualPotential > 80 ? "High visual upside for short-form posts" : null,
        input.audienceFit > 80 ? "Strong match for Vibed Media's US audience" : null,
        input.momentum > 75 ? "Momentum is rising across approved sources" : null
      ].filter(Boolean)
    }
  };
}
