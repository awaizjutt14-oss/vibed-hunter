import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const packet = await prisma.contentPacket.findUnique({
    where: { id },
    include: { assets: true, cluster: true }
  });
  return NextResponse.json({ ok: true, packet });
}
