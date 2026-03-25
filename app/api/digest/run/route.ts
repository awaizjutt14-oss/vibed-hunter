import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  const user = await prisma.user.findFirstOrThrow();
  const packets = await prisma.contentPacket.findMany({ take: 5, orderBy: { createdAt: "desc" } });
  const digest = await prisma.digestRun.create({
    data: {
      userId: user.id,
      sentTo: user.email,
      status: "SUCCEEDED",
      summary: "Daily digest generated in-app. Email transport integration is a Phase 2 TODO.",
      packetIds: packets.map((packet) => packet.id),
      sentAt: new Date()
    }
  });
  return NextResponse.json({ ok: true, digest });
}
export const runtime = "nodejs";
