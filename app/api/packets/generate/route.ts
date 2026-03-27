import { NextRequest, NextResponse } from "next/server";
import { generatePacketForCluster, generatePacketsForTopClusters } from "@/lib/ai/generate-packet";
import { buildSuccessfulGenerationTrial, requireGenerationAccess } from "@/lib/generation-access";
import { saveGenerationToDatabase } from "@/lib/supabase/user-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const access = await requireGenerationAccess("packets");
  if (!access.allowed) {
    return NextResponse.json(access.body, { status: access.status });
  }

  const body = await request.json().catch(() => ({}));
  if (body.clusterId && body.userId) {
    const packet = await generatePacketForCluster(body.clusterId, body.userId);
    const saveResult = await saveGenerationToDatabase({
      userEmail: access.userEmail,
      input: `Full post pack for cluster ${body.clusterId}`,
      hook: packet.conciseSummary,
      caption: packet.whyTrending
    }).catch(() => null);
    const trial = buildSuccessfulGenerationTrial({
      freePostsUsed: access.freePostsUsed,
      isPaid: access.isPaid,
      generationSaved: saveResult?.ok
    });
    console.info("Packet generation success.", { userEmail: access.userEmail, mode: "single" });
    return NextResponse.json({ ...trial, ok: true, packet, message: "Packet generated." });
  }

  const packets = await generatePacketsForTopClusters(5);
  const leadPacket = packets[0];
  const saveResult = await saveGenerationToDatabase({
    userEmail: access.userEmail,
    input: "Generated 5 post-ready ideas",
    hook: leadPacket?.conciseSummary ?? "Generated post-ready ideas",
    caption: leadPacket?.whyTrending ?? "Batch content packet generation."
  }).catch(() => null);
  const trial = buildSuccessfulGenerationTrial({
    freePostsUsed: access.freePostsUsed,
    isPaid: access.isPaid,
    generationSaved: saveResult?.ok
  });
  console.info("Packet generation success.", { userEmail: access.userEmail, mode: "batch" });
  return NextResponse.json({ ...trial, ok: true, packets, message: `Generated ${packets.length} packet(s).` });
}
