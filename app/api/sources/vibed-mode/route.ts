import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  const { enabled } = await request.json();
  const user = await prisma.user.findFirstOrThrow();
  const settings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: { highConfidenceOnly: Boolean(enabled) },
    create: {
      userId: user.id,
      niches: [],
      bannedTopics: [],
      preferredTone: "premium",
      targetAudienceCountry: "US",
      platformFocus: [],
      captionStyle: "punchy",
      minimumOriginalityScore: 70,
      preferredPostingTimes: [],
      brandVoiceExamples: [],
      highConfidenceOnly: Boolean(enabled)
    }
  });

  return NextResponse.json({ ok: true, settings });
}
