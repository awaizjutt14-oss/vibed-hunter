import { Prisma, PrismaClient, SourceType } from "@prisma/client";
import { demoClusters, demoPackets, demoSources, demoUser } from "../lib/demo-data.ts";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: demoUser.email },
    update: {},
    create: {
      email: demoUser.email,
      name: demoUser.name,
      role: "ADMIN",
      settings: {
        create: demoUser.settings
      }
    }
  });

  for (const source of demoSources) {
    await prisma.source.upsert({
      where: { sourceType_url: { sourceType: source.sourceType as SourceType, url: source.url } },
      update: source,
      create: { ...source, userId: user.id }
    });
  }

  for (const cluster of demoClusters) {
    const { score, ...clusterData } = cluster;
    const created = await prisma.topicCluster.upsert({
      where: { slug: cluster.slug },
      update: clusterData,
      create: clusterData
    });

    await prisma.trendScore.create({
      data: {
        clusterId: created.id,
        ...score
      }
    });
  }

  for (const packet of demoPackets) {
    const cluster = await prisma.topicCluster.findUniqueOrThrow({ where: { slug: packet.clusterSlug } });
    const createdPacket = await prisma.contentPacket.create({
      data: {
        userId: user.id,
        clusterId: cluster.id,
        status: packet.status,
        conciseSummary: packet.conciseSummary,
        originalityNote: packet.originalityNote,
        whyTrending: packet.whyTrending,
        bestPlatform: packet.bestPlatform,
        publishTiming: packet.publishTiming,
        confidenceScore: packet.confidenceScore,
        sourceCitations: packet.sourceCitations,
        guardrailNotes: packet.guardrailNotes,
        packetJson: packet.packetJson
      }
    });

    await prisma.generatedAsset.createMany({
      data: packet.assets.map((asset) => ({
        packetId: createdPacket.id,
        type: asset.type,
        platform: asset.platform,
        title: asset.title,
        content: asset.content,
        metadata: ("metadata" in asset ? asset.metadata : undefined) as Prisma.InputJsonValue | undefined
      }))
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
