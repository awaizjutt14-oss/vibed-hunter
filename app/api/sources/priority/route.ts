import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { updateSourceTags } from "@/lib/source-intelligence";

export async function POST(request: NextRequest) {
  const { sourceId, priority } = await request.json();
  const source = await prisma.source.findUniqueOrThrow({ where: { id: sourceId } });
  const updated = await prisma.source.update({
    where: { id: sourceId },
    data: {
      tags: updateSourceTags(source.tags, { priority })
    }
  });

  return NextResponse.json({ ok: true, source: updated });
}
