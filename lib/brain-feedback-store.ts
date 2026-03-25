import { prisma } from "@/lib/db/prisma";

export type FeedbackRating = "perfect" | "strong" | "maybe" | "weak" | "never show again" | "";
export type FeedbackReason =
  | "weak first frame"
  | "not premium enough"
  | "bad hook potential"
  | "too random"
  | "low US fit"
  | "too repetitive"
  | "weak replay value"
  | "bad caption potential"
  | "pairwise win"
  | "pairwise loss"
  | "better hook"
  | "better caption"
  | "better overall";

export type FeedbackRecord = {
  id: string;
  rating: FeedbackRating;
  reasons: FeedbackReason[];
  updatedAt: number;
};

let cache: Map<string, FeedbackRecord> | null = null;

export async function loadFeedbackCache() {
  if (cache) return cache;
  const client: any = prisma as any;
  if (!client.brainFeedback?.findMany) {
    // Prisma client was generated before BrainFeedback existed. Fail soft and keep runtime alive.
    cache = new Map();
    return cache;
  }
  const rows: Array<{
    opportunityId: string;
    rating: string;
    reasons: any;
    createdAt: Date;
    profileSnapshot: any;
  }> = await client.brainFeedback.findMany({ orderBy: { createdAt: "desc" } });
  cache = new Map(
    rows.map((row) => [
      row.opportunityId,
      {
        id: row.opportunityId,
        rating: row.rating as FeedbackRating,
        reasons: (row.reasons as FeedbackReason[]) ?? [],
        updatedAt: row.createdAt.getTime()
      }
    ])
  );
  return cache;
}

export function getFeedbackSync(id: string) {
  return cache?.get(id) ?? null;
}

export async function setFeedback(record: { id: string; rating: FeedbackRating; reasons: FeedbackReason[]; profileSnapshot: any }) {
  const client: any = prisma as any;
  if (!client.brainFeedback?.upsert) return;
  await client.brainFeedback.upsert({
    where: { opportunityId: record.id },
    update: { rating: record.rating, reasons: record.reasons, profileSnapshot: record.profileSnapshot },
    create: {
      opportunityId: record.id,
      rating: record.rating,
      reasons: record.reasons,
      profileSnapshot: record.profileSnapshot
    }
  });
  if (cache) {
    cache.set(record.id, { id: record.id, rating: record.rating, reasons: record.reasons, updatedAt: Date.now() });
  }
}

export async function getAllFeedback() {
  await loadFeedbackCache();
  return Array.from(cache?.values() ?? []);
}
