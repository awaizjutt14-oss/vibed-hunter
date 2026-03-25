import { prisma } from "@/lib/db/prisma";
import { buildCreatorOpportunity } from "@/lib/creator-transform";
import { demoClusters, demoPackets, demoSources, demoUser } from "@/lib/demo-data";
import { isDemoMode } from "@/lib/utils/env";

export async function getDashboardSnapshot() {
  const [clusters, packets, sources, user] = await Promise.all([
    prisma.topicCluster.findMany({ include: { trendScores: { orderBy: { createdAt: "desc" }, take: 1 }, sourceItems: true }, take: 20, orderBy: { updatedAt: "desc" } }),
    prisma.contentPacket.findMany({ include: { assets: true, cluster: true }, take: 10, orderBy: { createdAt: "desc" } }),
    prisma.source.findMany({ where: { isActive: true } }),
    prisma.user.findFirst({ include: { settings: true } })
  ]);

  if (isDemoMode && clusters.length === 0 && packets.length === 0 && sources.length === 0) {
    return {
      user: demoUser,
      sources: demoSources,
      clusters: demoClusters.map((cluster) => ({
        ...cluster,
        id: cluster.slug
      })),
      packets: demoPackets.map((packet, index) => ({
        ...packet,
        id: `demo-packet-${index + 1}`,
        assets: packet.assets
      })),
      stats: {
        opportunities: demoClusters.length,
        readyPackets: demoPackets.length,
        sourcesActive: demoSources.length,
        avgScore: Math.round(demoClusters.reduce((sum, cluster) => sum + cluster.score.finalScore, 0) / demoClusters.length)
      }
    };
  }

  return {
    user: user
      ? {
          ...user,
          settings: user.settings
            ? {
                ...user.settings,
                niches: Array.isArray(user.settings.niches) ? user.settings.niches : [],
                platformFocus: Array.isArray(user.settings.platformFocus) ? user.settings.platformFocus : [],
                preferredPostingTimes: Array.isArray(user.settings.preferredPostingTimes) ? user.settings.preferredPostingTimes : [],
                brandVoiceExamples: Array.isArray(user.settings.brandVoiceExamples) ? user.settings.brandVoiceExamples : []
              }
            : null
        }
      : null,
    sources,
    clusters: clusters
      .map((cluster) => {
        const score = cluster.trendScores[0];
        const vibed = (score?.explanation as any)?.vibedBreakdown ?? {};
        const platformFit = (score?.explanation as any)?.platformFit ?? cluster.bestPlatform ?? "instagram reels";
        const bestSlot = (score?.explanation as any)?.bestSlot ?? "6:30 PM";
        const contentMode = (score?.explanation as any)?.contentMode ?? "trend-watch";
        const transformed = buildCreatorOpportunity({
          title: cluster.canonicalTitle,
          summary: cluster.summary,
          bestPlatform: platformFit,
          visualStrength: Math.round(vibed.visualStrength ?? score?.visualContentScore ?? 0),
          repostSafety: Math.round(vibed.repostSafety ?? score?.originalityPotential ?? 0),
          bestSlot,
          contentMode,
          sourceCount: cluster.sourceCount
        });
        const latestPacket = packets.find((packet) => packet.clusterId === cluster.id);
        return {
          ...cluster,
          id: cluster.id,
          packetId: latestPacket?.id ?? null,
          score,
          vibedScore: Math.round(score?.finalScore ?? 0),
          hook: transformed.hook,
          angle: transformed.angle,
          hookCandidates: transformed.hookCandidates,
          whyFits: transformed.whyFits,
          visualExplanation: transformed.visualExplanation,
          shortFormReason: transformed.shortFormReason,
          slotReason: transformed.slotReason,
          editorialScore: transformed.editorialScore,
          rejectionReasons: transformed.rejectionReasons,
          visualStrength: Math.round(vibed.visualStrength ?? score?.visualContentScore ?? 0),
          repostSafety: Math.round(vibed.repostSafety ?? score?.originalityPotential ?? 0),
          bestSlot,
          contentMode,
          platformFit,
          usFit: Math.round(vibed.usAudienceFit ?? score?.audienceFitScore ?? 0),
          shortFormFit: Math.round(vibed.shortFormFit ?? score?.postabilityScore ?? 0),
          captionPotential: Math.round(vibed.captionPotential ?? score?.postabilityScore ?? 0)
        };
      })
      .filter((cluster) => cluster.score && cluster.editorialScore >= 70 && cluster.rejectionReasons.length < 2)
      .sort((a, b) => (b.vibedScore + b.editorialScore) - (a.vibedScore + a.editorialScore)),
    packets: packets.map((packet) => ({
      ...packet,
      clusterSlug: packet.cluster.slug
    })),
    stats: {
      opportunities: clusters.filter((cluster) => {
        const score = cluster.trendScores[0];
        const vibed = (score?.explanation as any)?.vibedBreakdown ?? {};
        const transformed = buildCreatorOpportunity({
          title: cluster.canonicalTitle,
          summary: cluster.summary,
          bestPlatform: (score?.explanation as any)?.platformFit ?? cluster.bestPlatform ?? "instagram reels",
          visualStrength: Math.round(vibed.visualStrength ?? score?.visualContentScore ?? 0),
          repostSafety: Math.round(vibed.repostSafety ?? score?.originalityPotential ?? 0),
          bestSlot: (score?.explanation as any)?.bestSlot ?? "6:30 PM",
          contentMode: (score?.explanation as any)?.contentMode ?? "trend-watch",
          sourceCount: cluster.sourceCount
        });
        return score && transformed.editorialScore >= 70 && transformed.rejectionReasons.length < 2;
      }).length,
      readyPackets: packets.length,
      sourcesActive: sources.length,
      avgScore: Math.round(
        clusters.reduce((sum, cluster) => sum + (cluster.trendScores[0]?.finalScore ?? 0), 0) / Math.max(clusters.length, 1)
      )
    }
  };
}

export function filterClusters(clusters: any[], filter: string | undefined) {
  switch (filter) {
    case "slot-1230":
      return clusters.filter((cluster) => cluster.bestSlot === "12:30 PM");
    case "slot-630":
      return clusters.filter((cluster) => cluster.bestSlot === "6:30 PM");
    case "slot-915":
      return clusters.filter((cluster) => cluster.bestSlot === "9:15 PM");
    case "visual":
      return [...clusters].sort((a, b) => b.visualStrength - a.visualStrength);
    case "reels":
      return clusters.filter((cluster) => String(cluster.platformFit).toLowerCase().includes("instagram"));
    case "tiktok":
      return clusters.filter((cluster) => String(cluster.platformFit).toLowerCase().includes("tiktok"));
    case "shorts":
      return clusters.filter((cluster) => String(cluster.platformFit).toLowerCase().includes("youtube"));
    case "safe":
      return [...clusters].sort((a, b) => b.repostSafety - a.repostSafety);
    case "us":
      return [...clusters].sort((a, b) => b.usFit - a.usFit);
    case "breaking":
      return clusters.filter((cluster) => cluster.contentMode === "breaking-now");
    case "evergreen":
      return clusters.filter((cluster) => cluster.contentMode === "evergreen-viral");
    default:
      return clusters;
  }
}

export function getPostingSlots(clusters: any[]) {
  const picks = {
    "12:30 PM": [...clusters].sort((a, b) => (b.usFit + b.captionPotential) - (a.usFit + a.captionPotential))[0],
    "6:30 PM": [...clusters].sort((a, b) => (b.vibedScore + b.shortFormFit) - (a.vibedScore + a.shortFormFit))[0],
    "9:15 PM": [...clusters].sort((a, b) => (b.visualStrength + b.repostSafety) - (a.visualStrength + a.repostSafety))[0]
  };

  return Object.entries(picks).map(([slot, cluster]) => ({ slot, cluster }));
}
