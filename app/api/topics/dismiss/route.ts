import { NextRequest, NextResponse } from "next/server";
import { TopicStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { clusterId } = await request.json();
  await prisma.topicCluster.update({
    where: { id: clusterId },
    data: { status: TopicStatus.DISMISSED }
  });
  return NextResponse.json({ ok: true });
}
export const runtime = "nodejs";
