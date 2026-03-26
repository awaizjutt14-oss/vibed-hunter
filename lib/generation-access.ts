import { cookies } from "next/headers";
import { auth } from "@/auth";
import { createSupabaseServerClient } from "@/lib/supabase/client";
import { FREE_POSTS_LIMIT, type TrialStatusPayload } from "@/lib/trial-types";

const GUEST_COOKIE_NAME = "vibed_guest_id";
const TRIAL_USAGE_SETUP_SQL = `
create table if not exists public.generation_usage (
  user_id text primary key,
  user_email text,
  free_posts_used integer not null default 0,
  is_paid boolean not null default false,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists generation_usage_user_email_idx
  on public.generation_usage (user_email);
`;

const TRIAL_USAGE_EVENTS_SETUP_SQL = `
create table if not exists public.generation_usage_events (
  event_id text primary key,
  user_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);
`;

type GenerationUsageRow = {
  user_id: string;
  user_email: string | null;
  free_posts_used: number;
  is_paid: boolean;
  subscription_status: string;
  created_at: string;
  updated_at: string;
};

type ActorIdentity = {
  actorKey: string;
  userEmail: string | null;
  isAuthenticated: boolean;
  guestId: string | null;
};

type AccessResult =
  | {
      allowed: true;
      actor: ActorIdentity;
      usage: GenerationUsageRow;
      trial: TrialStatusPayload;
    }
  | {
      allowed: false;
      status: number;
      body: TrialStatusPayload & {
        error?: string;
        rate_limited?: boolean;
      };
    };

type TrialAction = "remix" | "viral" | "hunt" | "packets";

let trialUsageChecked = false;
let trialUsageEventsChecked = false;

const rateLimitStore = new Map<string, number[]>();

function toTrialStatus(usage: GenerationUsageRow, allowed: boolean): TrialStatusPayload {
  return {
    allowed,
    free_posts_used: usage.free_posts_used,
    free_posts_limit: FREE_POSTS_LIMIT,
    is_paid: usage.is_paid,
    subscription_status: usage.subscription_status,
    remaining_free_generations: Math.max(FREE_POSTS_LIMIT - usage.free_posts_used, 0),
    ...(allowed
      ? {}
      : {
          paywall: !usage.is_paid,
          message: "You’ve used your 3 free generations. Upgrade to continue."
        })
  };
}

async function ensureTrialUsageTableAvailable() {
  if (trialUsageChecked) return true;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase generation_usage check skipped: client is not configured.");
    return false;
  }

  const { error } = await supabase.from("generation_usage").select("user_id", { count: "exact", head: true });
  if (error) {
    console.error("Supabase generation_usage table is not ready.", {
      message: error.message,
      hint: "Create public.generation_usage before enforcing the free trial.",
      sql: TRIAL_USAGE_SETUP_SQL
    });
    return false;
  }

  trialUsageChecked = true;
  return true;
}

async function ensureTrialUsageEventsTableAvailable() {
  if (trialUsageEventsChecked) return true;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase generation_usage_events check skipped: client is not configured.");
    return false;
  }

  const { error } = await supabase.from("generation_usage_events").select("event_id", { count: "exact", head: true });
  if (error) {
    console.error("Supabase generation_usage_events table is not ready.", {
      message: error.message,
      hint: "Create public.generation_usage_events before enforcing deduped trial usage.",
      sql: TRIAL_USAGE_EVENTS_SETUP_SQL
    });
    return false;
  }

  trialUsageEventsChecked = true;
  return true;
}

async function getActorIdentity(): Promise<ActorIdentity> {
  const session = await auth().catch(() => null);
  const sessionEmail = session?.user?.email?.trim().toLowerCase() || null;
  const cookieStore = await cookies();
  let guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value ?? null;

  if (!sessionEmail && !guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set(GUEST_COOKIE_NAME, guestId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/"
    });
  }

  if (sessionEmail) {
    return {
      actorKey: `user:${sessionEmail}`,
      userEmail: sessionEmail,
      isAuthenticated: true,
      guestId
    };
  }

  return {
    actorKey: `guest:${guestId}`,
    userEmail: null,
    isAuthenticated: false,
    guestId
  };
}

async function countHistoricalUsage(userEmail: string | null) {
  if (!userEmail) return 0;

  const supabase = createSupabaseServerClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("generation_history")
    .select("id", { count: "exact", head: true })
    .eq("user_email", userEmail);

  if (error) {
    console.error("Historical usage backfill failed.", {
      userEmail,
      message: error.message
    });
    return 0;
  }

  return Number(count ?? 0);
}

async function fetchUsageByActor(actorKey: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("generation_usage")
    .select("*")
    .eq("user_id", actorKey)
    .maybeSingle();

  if (error) {
    console.error("Failed to load generation usage.", {
      actorKey,
      message: error.message
    });
    return null;
  }

  return (data ?? null) as GenerationUsageRow | null;
}

async function fetchUsageByEmail(userEmail: string) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("generation_usage")
    .select("*")
    .eq("user_email", userEmail)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load generation usage by email.", {
      userEmail,
      message: error.message
    });
    return null;
  }

  return (data ?? null) as GenerationUsageRow | null;
}

async function upsertUsageRow(row: {
  user_id: string;
  user_email: string | null;
  free_posts_used: number;
  is_paid: boolean;
  subscription_status: string;
}) {
  const supabase = createSupabaseServerClient();
  if (!supabase) return null;

  const payload = {
    ...row,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("generation_usage" as any)
    .upsert(payload as any, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) {
    console.error("Failed to upsert generation usage.", {
      userId: row.user_id,
      message: error.message
    });
    return null;
  }

  return data as GenerationUsageRow;
}

async function maybeMergeGuestUsage(actor: ActorIdentity) {
  if (!actor.isAuthenticated || !actor.guestId) {
    return null;
  }

  const guestActorKey = `guest:${actor.guestId}`;
  if (guestActorKey === actor.actorKey) {
    return null;
  }

  const [guestUsage, userUsage] = await Promise.all([
    fetchUsageByActor(guestActorKey),
    fetchUsageByActor(actor.actorKey)
  ]);

  if (!guestUsage) {
    return userUsage;
  }

  const merged = await upsertUsageRow({
    user_id: actor.actorKey,
    user_email: actor.userEmail,
    free_posts_used: Math.max(userUsage?.free_posts_used ?? 0, guestUsage.free_posts_used),
    is_paid: Boolean(userUsage?.is_paid || guestUsage.is_paid),
    subscription_status:
      userUsage?.subscription_status && userUsage.subscription_status !== "free"
        ? userUsage.subscription_status
        : guestUsage.subscription_status || "free"
  });

  const supabase = createSupabaseServerClient();
  if (supabase) {
    await supabase.from("generation_usage").delete().eq("user_id", guestActorKey);
  }

  return merged;
}

async function getOrCreateUsage(actor: ActorIdentity) {
  const tableReady = await ensureTrialUsageTableAvailable();
  if (!tableReady) return null;

  const merged = await maybeMergeGuestUsage(actor);
  if (merged) {
    return merged;
  }

  const existing = await fetchUsageByActor(actor.actorKey);
  if (existing) {
    return existing;
  }

  if (actor.userEmail) {
    const emailMatch = await fetchUsageByEmail(actor.userEmail);
    if (emailMatch) {
      return (
        (await upsertUsageRow({
          user_id: actor.actorKey,
          user_email: actor.userEmail,
          free_posts_used: emailMatch.free_posts_used,
          is_paid: emailMatch.is_paid,
          subscription_status: emailMatch.subscription_status
        })) ?? emailMatch
      );
    }
  }

  const historicalUsage = await countHistoricalUsage(actor.userEmail);
  return upsertUsageRow({
    user_id: actor.actorKey,
    user_email: actor.userEmail,
    free_posts_used: historicalUsage,
    is_paid: false,
    subscription_status: "free"
  });
}

function isRateLimited(actorKey: string, action: TrialAction) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = action === "packets" ? 3 : 8;
  const key = `${actorKey}:${action}`;
  const timestamps = (rateLimitStore.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (timestamps.length >= limit) {
    rateLimitStore.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
  return false;
}

export async function getCurrentTrialStatus() {
  const actor = await getActorIdentity();
  const usage =
    (await getOrCreateUsage(actor)) ??
    ({
      user_id: actor.actorKey,
      user_email: actor.userEmail,
      free_posts_used: actor.userEmail ? await countHistoricalUsage(actor.userEmail) : 0,
      is_paid: false,
      subscription_status: "free",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } satisfies GenerationUsageRow);

  return {
    actor,
    usage,
    trial: toTrialStatus(usage, usage.is_paid || usage.free_posts_used < FREE_POSTS_LIMIT)
  };
}

export async function requireGenerationAccess(action: TrialAction): Promise<AccessResult> {
  const { actor, usage, trial } = await getCurrentTrialStatus();

  if (isRateLimited(actor.actorKey, action)) {
    return {
      allowed: false,
      status: 429,
      body: {
        ...trial,
        allowed: false,
        error: "rate_limited",
        rate_limited: true,
        message: "Too many generation attempts. Please wait a minute and try again."
      }
    };
  }

  if (usage.is_paid || usage.free_posts_used < FREE_POSTS_LIMIT) {
    return {
      allowed: true,
      actor,
      usage,
      trial: toTrialStatus(usage, true)
    };
  }

  return {
    allowed: false,
    status: 402,
    body: {
      ...toTrialStatus(usage, false),
      paywall: true
    }
  };
}

export async function recordSuccessfulGeneration(args: {
  actor: ActorIdentity;
  usage: GenerationUsageRow;
  action: TrialAction;
  usageEventId?: string | null;
}) {
  if (args.usage.is_paid) {
    return toTrialStatus(args.usage, true);
  }

  if (args.usageEventId) {
    const eventsReady = await ensureTrialUsageEventsTableAvailable();
    if (eventsReady) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const { error } = await supabase.from("generation_usage_events" as any).insert({
          event_id: args.usageEventId,
          user_id: args.actor.actorKey,
          action: args.action
        } as any);

        if (error) {
          if ("code" in error && error.code === "23505") {
            const latest = await fetchUsageByActor(args.actor.actorKey);
            return toTrialStatus(
              latest && latest.free_posts_used >= args.usage.free_posts_used + 1
                ? latest
                : {
                ...args.usage,
                free_posts_used: args.usage.free_posts_used + 1
              },
              true
            );
          }

          console.error("Failed to persist generation usage event.", {
            eventId: args.usageEventId,
            message: error.message
          });
        }
      }
    }
  }

  const updated =
    (await upsertUsageRow({
      user_id: args.actor.actorKey,
      user_email: args.actor.userEmail,
      free_posts_used: args.usage.free_posts_used + 1,
      is_paid: args.usage.is_paid,
      subscription_status: args.usage.subscription_status
    })) ?? {
      ...args.usage,
      free_posts_used: args.usage.free_posts_used + 1
    };

  return toTrialStatus(updated, true);
}

export async function hasActiveSubscription() {
  const { usage } = await getCurrentTrialStatus();
  return usage.is_paid || usage.subscription_status === "active";
}
