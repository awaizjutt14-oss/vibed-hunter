import { NextRequest, NextResponse } from "next/server";
import { generatePacketForCluster, generatePacketsForTopClusters } from "@/lib/ai/generate-packet";
import { recordSuccessfulGeneration, requireGenerationAccess } from "@/lib/generation-access";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const access = await requireGenerationAccess("packets");
  if (!access.allowed) {
    return NextResponse.json(access.body, { status: access.status });
  }

  const body = await request.json().catch(() => ({}));
  const usageEventId = typeof body.usageEventId === "string" ? body.usageEventId.trim() : undefined;
  if (body.clusterId && body.userId) {
    const packet = await generatePacketForCluster(body.clusterId, body.userId);
    const trial = await recordSuccessfulGeneration({
      actor: access.actor,
      usage: access.usage,
      action: "packets",
      usageEventId
    });
    return NextResponse.json({ ok: true, message: "Packet generated.", packet, ...trial });
  }

  const packets = await generatePacketsForTopClusters(5);
  const trial = await recordSuccessfulGeneration({
    actor: access.actor,
    usage: access.usage,
    action: "packets",
    usageEventId
  });
  return NextResponse.json({ ok: true, message: `Generated ${packets.length} packet(s).`, packets, ...trial });
}
