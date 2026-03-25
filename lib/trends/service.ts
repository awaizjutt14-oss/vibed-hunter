import { prisma } from "@/lib/db/prisma";
import { buildCreatorOpportunity } from "@/lib/creator-transform";
import { calculateTrendScore } from "@/lib/scoring/formula";

export async function rebuildTrendClusters() {
  const items = await prisma.sourceItem.findMany({
    where: {
      url: { not: "" }
    },
    orderBy: { publishTime: "desc" },
    take: 250
  });

  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const key = clusterKeyFromItem(item.title, item.topicTags);
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  await prisma.trendScore.deleteMany({});
  const results = [];
  for (const [key, group] of grouped.entries()) {
    const canonical = group[0];
    const sourceNames = new Set(group.map((entry) => entry.sourceName));
    const titleText = canonical.title.toLowerCase();
    const summaryText = (canonical.rawSummary ?? "").toLowerCase();
    const combinedText = `${titleText} ${summaryText}`;
    const now = Date.now();
    const newestPublishTime = group
      .map((entry) => entry.publishTime?.getTime() ?? entry.createdAt.getTime())
      .sort((a, b) => b - a)[0];
    const ageHours = Math.max(1, (now - newestPublishTime) / 36e5);
    const freshness = Math.max(35, 100 - ageHours * 3.5);
    const momentum = Math.min(100, 40 + group.length * 11 + sourceNames.size * 7);
    const visualStrength = matchesAny(combinedText, ["robot", "space", "launch", "explosion", "tiny", "satisfying", "skill", "engineering", "nature", "animal", "drone", "insane", "shock", "visual", "crazy", "glass", "machine", "bridge", "build"]) ? 92 : 68;
    const curiosityTrigger = matchesAny(combinedText, ["why", "how", "weird", "unexpected", "secret", "real", "strange", "tiny", "crazy", "unusual", "mystery"]) ? 88 : 70;
    const shockFactor = matchesAny(combinedText, ["insane", "breakthrough", "explodes", "collapse", "first", "tiny", "wild", "record", "stunning", "impossible"]) ? 86 : 62;
    const shortFormFit = Math.round((visualStrength + curiosityTrigger) / 2);
    const usAudienceFit = matchesAny(combinedText, ["us", "america", "nasa", "tech", "ai", "engineering", "science"]) ? 86 : 72;
    const repostSafety = matchesAny(combinedText, ["opinion", "politics", "war", "election", "depressing", "celebrity"]) ? 38 : 82;
    const hookPotential = Math.round((curiosityTrigger + shockFactor) / 2);
    const captionPotential = matchesAny(combinedText, ["explained", "study", "scientists", "built", "found", "revealed", "watch"]) ? 84 : 70;
    const coverTextPotential = Math.round((visualStrength + hookPotential) / 2);
    const audienceFit = Math.round((shortFormFit + usAudienceFit) / 2);
    const originalityPotential = repostSafety > 75 ? 84 : 61;
    const visualPotential = visualStrength;
    const emotionalPull = Math.round((curiosityTrigger + shockFactor) / 2);
    const novelty = Math.min(92, 55 + sourceNames.size * 8 + (matchesAny(combinedText, ["weird", "first", "tiny", "strange"]) ? 8 : 0));
    const postability = Math.round((shortFormFit + repostSafety + hookPotential + captionPotential) / 4);
    const bestPlatform = visualStrength > 88 ? "instagram reels" : shortFormFit > 82 ? "tiktok" : "youtube shorts";
    const bestSlot = pickBestSlot({ visualStrength, curiosityTrigger, shockFactor, shortFormFit, usAudienceFit });
    const contentMode = freshness > 80 ? "breaking-now" : visualStrength > 80 ? "evergreen-viral" : "trend-watch";
    const isLowQuality = repostSafety < 45 || shortFormFit < 55 || visualStrength < 55 || matchesAny(combinedText, ["politics", "election", "shooting", "murder", "suicide", "depressing"]);
    if (isLowQuality) {
      continue;
    }

    const cluster = await prisma.topicCluster.upsert({
      where: { slug: key },
      update: {
        canonicalTitle: canonical.title,
        summary: canonical.rawSummary ?? "A multi-source trend cluster built from public metadata.",
        whyNow: buildWhyNow(group.length, sourceNames.size, freshness, visualStrength, repostSafety),
        sourceCount: group.length,
        publishUrgency: group.length > 3 ? "high" : "medium",
        dedupeFingerprint: key,
        bestPlatform,
        niche: inferNiche(canonical.title, canonical.topicTags)
      },
      create: {
        slug: key,
        canonicalTitle: canonical.title,
        summary: canonical.rawSummary ?? "A multi-source trend cluster built from public metadata.",
        whyNow: buildWhyNow(group.length, sourceNames.size, freshness, visualStrength, repostSafety),
        niche: inferNiche(canonical.title, canonical.topicTags),
        sourceCount: group.length,
        bestPlatform,
        publishUrgency: group.length > 3 ? "high" : "medium",
        dedupeFingerprint: key
      }
    });

    const score = calculateTrendScore({
      freshness,
      momentum,
      audienceFit,
      originalityPotential,
      visualPotential,
      postability,
      sourceDiversity: Math.min(sourceNames.size * 30, 100),
      novelty,
      emotionalPull,
      vibedBreakdown: {
        visualStrength,
        curiosityTrigger,
        shockFactor,
        shortFormFit,
        usAudienceFit,
        repostSafety,
        hookPotential,
        captionPotential,
        coverTextPotential
      }
    });

    const transformed = buildCreatorOpportunity({
      title: canonical.title,
      summary: canonical.rawSummary ?? "",
      bestPlatform,
      visualStrength,
      repostSafety,
      bestSlot,
      contentMode,
      sourceCount: group.length
    });

    if (transformed.editorialScore < 64 || transformed.rejectionReasons.length >= 3) {
      continue;
    }

    score.finalScore = Number(((score.finalScore * 0.72) + (transformed.editorialScore * 0.28)).toFixed(2));

    score.explanation = {
      ...(score.explanation as any),
      bestSlot,
      contentMode,
      hookPreview: transformed.hook,
      platformFit: bestPlatform,
      editorialScore: transformed.editorialScore,
      editorialReasons: transformed.rejectionReasons,
      creatorAngle: transformed.angle
    } as any;

    await prisma.trendScore.create({
      data: {
        clusterId: cluster.id,
        ...score
      }
    });

    await prisma.sourceItem.updateMany({
      where: { id: { in: group.map((entry) => entry.id) } },
      data: { clusterId: cluster.id }
    });

    results.push({ cluster: cluster.slug, score: score.finalScore });
  }

  return results;
}

function clusterKeyFromItem(title: string, tags: unknown) {
  const stopwords = new Set(["the", "a", "an", "and", "for", "with", "from", "this", "that", "into", "what", "when", "your"]);
  const titleTokens = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopwords.has(token))
    .slice(0, 5);
  const tagTokens = Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()).slice(0, 2) : [];
  const tokens = [...new Set([...titleTokens, ...tagTokens])];
  return tokens.join("-").slice(0, 80) || "cluster";
}

function inferNiche(title: string, tags: unknown) {
  const text = `${title} ${Array.isArray(tags) ? tags.join(" ") : ""}`.toLowerCase();
  if (text.match(/ai|model|openai|robot|machine learning/)) return "ai";
  if (text.match(/creator|youtube|instagram|tiktok|media/)) return "creator economy";
  if (text.match(/science|study|research|space|nasa/)) return "science";
  return "general";
}

function buildWhyNow(itemCount: number, sourceCount: number, freshness: number, visualStrength: number, repostSafety: number) {
  if (itemCount > 3 && sourceCount > 1) {
    return "Multiple approved sources are surfacing this at once, which usually means the angle is moving right now.";
  }
  if (freshness > 80) {
    return "This is still early enough to package before the hook feels overused.";
  }
  if (visualStrength > 80 && repostSafety > 75) {
    return "It is highly visual, easy to understand fast, and looks safe enough to adapt into a Vibed-style short-form post.";
  }
  return "The topic is timely, visual enough to stop the scroll, and flexible for short-form packaging.";
}

function matchesAny(text: string, tokens: string[]) {
  return tokens.some((token) => text.includes(token));
}

function pickBestSlot(input: { visualStrength: number; curiosityTrigger: number; shockFactor: number; shortFormFit: number; usAudienceFit: number }) {
  if (input.visualStrength > 88) return "9:15 PM";
  if (input.curiosityTrigger > 84 || input.shockFactor > 80) return "6:30 PM";
  if (input.usAudienceFit > 80) return "12:30 PM";
  return "6:30 PM";
}

function createHookPreview(title: string) {
  const words = title.replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);
  return words.slice(0, 8).join(" ");
}
