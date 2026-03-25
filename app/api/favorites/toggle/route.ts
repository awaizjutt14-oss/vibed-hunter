import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { userId, clusterId } = await request.json();
  const existing = await prisma.savedIdea.findFirst({ where: { userId, clusterId } });
  if (existing) {
    await prisma.savedIdea.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, saved: false });
  }
  await prisma.savedIdea.create({ data: { userId, clusterId } });
  return NextResponse.json({ ok: true, saved: true });
}
export const runtime = "nodejs";
