import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { settingsSchema } from "@/lib/validation/schemas";

export async function PUT(request: NextRequest) {
  const body = settingsSchema.parse(await request.json());
  const user = await prisma.user.findFirstOrThrow();
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: body,
    create: { userId: user.id, ...body }
  });
  return NextResponse.json({ ok: true, settings });
}
export const runtime = "nodejs";
