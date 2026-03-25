import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { sourceId, isActive } = await request.json();
  const source = await prisma.source.update({
    where: { id: sourceId },
    data: { isActive: Boolean(isActive) }
  });

  return NextResponse.json({ ok: true, source });
}
