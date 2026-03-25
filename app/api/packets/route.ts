import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const packets = await prisma.contentPacket.findMany({
    include: { assets: true, cluster: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });
  return NextResponse.json({ ok: true, packets });
}
export const runtime = "nodejs";
