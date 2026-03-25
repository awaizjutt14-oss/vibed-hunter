import { NextRequest, NextResponse } from "next/server";
import { generatePacketForCluster, generatePacketsForTopClusters } from "@/lib/ai/generate-packet";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body.clusterId && body.userId) {
    const packet = await generatePacketForCluster(body.clusterId, body.userId);
    return NextResponse.json({ ok: true, message: "Packet generated.", packet });
  }

  const packets = await generatePacketsForTopClusters(5);
  return NextResponse.json({ ok: true, message: `Generated ${packets.length} packet(s).`, packets });
}
