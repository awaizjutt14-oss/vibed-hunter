import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import {
  applyLearningFeedback,
  applyLearningInteraction,
  createEmptyLearningProfile,
  normalizeLearningProfile,
  type InteractionType,
  type LearningFeedback,
  type LearningResultSnapshot,
  type PreferenceProfile
} from "@/lib/remix-learning";

export const runtime = "nodejs";

const COOKIE_NAME = "vibed_hunter_session";

type LearningRecord = {
  enabled: boolean;
  weightedPreferences: unknown;
  interactionCounts: unknown;
  feedbackCounts: unknown;
  patternRanking: unknown;
  bestExamples: unknown;
};

function serializeProfile(profile: PreferenceProfile) {
  return {
    enabled: profile.enabled,
    weightedPreferences: profile.weightedPreferences as Prisma.InputJsonValue,
    interactionCounts: profile.interactionCounts as Prisma.InputJsonValue,
    feedbackCounts: profile.feedbackCounts as Prisma.InputJsonValue,
    patternRanking: profile.patternRanking as Prisma.InputJsonValue,
    bestExamples: profile.bestExamples as Prisma.InputJsonValue
  };
}

function deserializeProfile(record: LearningRecord | null | undefined) {
  if (!record) return createEmptyLearningProfile();

  return normalizeLearningProfile({
    enabled: record.enabled,
    weightedPreferences: record.weightedPreferences as PreferenceProfile["weightedPreferences"],
    interactionCounts: record.interactionCounts as PreferenceProfile["interactionCounts"],
    feedbackCounts: record.feedbackCounts as PreferenceProfile["feedbackCounts"],
    patternRanking: record.patternRanking as PreferenceProfile["patternRanking"],
    bestExamples: record.bestExamples as PreferenceProfile["bestExamples"]
  });
}

async function resolveLearningUser(request: NextRequest) {
  const existingSessionId = request.cookies.get(COOKIE_NAME)?.value;
  const session = await auth().catch(() => null);
  if (session?.user?.email) {
    return {
      userKey: `user:${session.user.email}`,
      anonymousUserKey: existingSessionId ? `session:${existingSessionId}` : undefined
    };
  }

  if (existingSessionId) {
    return { userKey: `session:${existingSessionId}` };
  }

  const sessionId = crypto.randomUUID();
  return {
    userKey: `session:${sessionId}`,
    newSessionId: sessionId
  };
}

async function getStoredProfile(userKey: string) {
  const record = await prisma.learningProfile.findUnique({
    where: { userKey }
  });

  return deserializeProfile(record as LearningRecord | null);
}

function mergeWeightedMaps(...maps: Array<Record<string, number> | undefined>) {
  const merged: Record<string, number> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map ?? {})) {
      merged[key] = (merged[key] ?? 0) + value;
    }
  }
  return merged;
}

function mergeProfiles(base: PreferenceProfile, incoming: PreferenceProfile) {
  const merged = normalizeLearningProfile({
    enabled: base.enabled || incoming.enabled,
    weightedPreferences: {
      tones: mergeWeightedMaps(base.weightedPreferences.tones, incoming.weightedPreferences.tones),
      platforms: mergeWeightedMaps(base.weightedPreferences.platforms, incoming.weightedPreferences.platforms),
      outputFormats: mergeWeightedMaps(base.weightedPreferences.outputFormats, incoming.weightedPreferences.outputFormats),
      hookStyles: mergeWeightedMaps(base.weightedPreferences.hookStyles, incoming.weightedPreferences.hookStyles),
      ctaStyles: mergeWeightedMaps(base.weightedPreferences.ctaStyles, incoming.weightedPreferences.ctaStyles),
      captionLengths: mergeWeightedMaps(base.weightedPreferences.captionLengths, incoming.weightedPreferences.captionLengths),
      topicPatterns: mergeWeightedMaps(base.weightedPreferences.topicPatterns, incoming.weightedPreferences.topicPatterns)
    },
    interactionCounts: mergeWeightedMaps(base.interactionCounts, incoming.interactionCounts),
    feedbackCounts: mergeWeightedMaps(base.feedbackCounts, incoming.feedbackCounts),
    patternRanking: mergeWeightedMaps(base.patternRanking, incoming.patternRanking),
    bestExamples: [...base.bestExamples, ...incoming.bestExamples]
      .sort((a, b) => b.score - a.score)
      .filter(
        (item, index, array) =>
          array.findIndex((other) => other.hook === item.hook && other.caption === item.caption) === index
      )
      .slice(0, 5)
  });

  return merged;
}

async function upsertProfile(userKey: string, profile: PreferenceProfile) {
  const persisted = await prisma.learningProfile.upsert({
    where: { userKey },
    update: serializeProfile(profile),
    create: {
      userKey,
      ...serializeProfile(profile)
    }
  });

  return deserializeProfile(persisted as LearningRecord);
}

async function loadProfileForUser(userKey: string, anonymousUserKey?: string) {
  const primaryProfile = await getStoredProfile(userKey);

  if (!anonymousUserKey || anonymousUserKey === userKey) {
    return primaryProfile;
  }

  const anonymousRecord = await prisma.learningProfile.findUnique({
    where: { userKey: anonymousUserKey }
  });

  if (!anonymousRecord) {
    return primaryProfile;
  }

  const mergedProfile = mergeProfiles(
    primaryProfile,
    deserializeProfile(anonymousRecord as LearningRecord)
  );

  await upsertProfile(userKey, mergedProfile);
  await prisma.learningProfile.delete({ where: { userKey: anonymousUserKey } }).catch(() => null);

  return mergedProfile;
}

function withSessionCookie(response: NextResponse, sessionId?: string) {
  if (!sessionId) return response;

  response.cookies.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}

export async function GET(request: NextRequest) {
  const { userKey, newSessionId, anonymousUserKey } = await resolveLearningUser(request);
  const profile = await loadProfileForUser(userKey, anonymousUserKey);
  const response = NextResponse.json({ profile });
  return withSessionCookie(response, newSessionId);
}

export async function POST(request: NextRequest) {
  const { userKey, newSessionId, anonymousUserKey } = await resolveLearningUser(request);
  const body = (await request.json().catch(() => ({}))) as {
    action?: "interaction" | "feedback" | "toggle" | "reset";
    enabled?: boolean;
    feedback?: LearningFeedback;
    result?: LearningResultSnapshot;
    interaction?: {
      type: InteractionType;
      platform?: string;
      tone?: string;
      outputFormat?: string;
      content?: string;
      result?: LearningResultSnapshot;
    };
  };

  let profile = await loadProfileForUser(userKey, anonymousUserKey);

  switch (body.action) {
    case "toggle":
      profile = normalizeLearningProfile({ ...profile, enabled: Boolean(body.enabled) });
      break;
    case "reset":
      profile = createEmptyLearningProfile();
      break;
    case "feedback":
      if (body.feedback) {
        profile = applyLearningFeedback(profile, body.feedback, body.result);
      }
      break;
    case "interaction":
      if (body.interaction) {
        profile = applyLearningInteraction(profile, body.interaction);
      }
      break;
    default:
      break;
  }

  const savedProfile = await upsertProfile(userKey, profile);
  const response = NextResponse.json({ profile: savedProfile });
  return withSessionCookie(response, newSessionId);
}
