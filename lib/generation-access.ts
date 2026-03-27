import { auth } from "@/auth";
import { FREE_POSTS_LIMIT, FREE_POSTS_WINDOW_DAYS, type TrialStatusPayload } from "@/lib/trial-types";
import { countGenerationHistoryForUser } from "@/lib/supabase/user-store";

type TrialAction = "remix" | "viral" | "hunt" | "packets";

type AccessAllowed = {
  allowed: true;
  userEmail: string;
  freePostsUsed: number;
  isPaid: boolean;
  trial: TrialStatusPayload;
};

type AccessBlocked = {
  allowed: false;
  status: number;
  body: TrialStatusPayload & {
    authRequired?: boolean;
    error?: string;
    rate_limited?: boolean;
  };
};

const rateLimitStore = new Map<string, number[]>();

function getUsageWindowStart() {
  return new Date(Date.now() - FREE_POSTS_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}

function buildTrialStatus(args: {
  freePostsUsed: number;
  isPaid: boolean;
  allowed: boolean;
  authRequired?: boolean;
  message?: string;
}) {
  return {
    allowed: args.allowed,
    authRequired: args.authRequired,
    paywall: !args.allowed && !args.authRequired && !args.isPaid,
    message:
      args.message ??
      (args.authRequired
        ? "Sign in to continue."
        : args.allowed
          ? undefined
          : "You’ve used your 3 free generations this month. Upgrade to continue."),
    free_posts_used: args.freePostsUsed,
    free_posts_limit: FREE_POSTS_LIMIT,
    is_paid: args.isPaid,
    subscription_status: args.isPaid ? "active" : "free",
    remaining_free_generations: args.isPaid ? FREE_POSTS_LIMIT : Math.max(FREE_POSTS_LIMIT - args.freePostsUsed, 0)
  } satisfies TrialStatusPayload & { authRequired?: boolean };
}

async function getAuthenticatedUserEmail() {
  const session = await auth().catch(() => null);
  const email = session?.user?.email?.trim().toLowerCase() || null;

  if (!email) {
    console.warn("Generation access denied: auth missing.");
    return null;
  }

  return email;
}

async function hasActiveSubscription(_userEmail: string) {
  return false;
}

function isRateLimited(userEmail: string, action: TrialAction) {
  const now = Date.now();
  const windowMs = 60_000;
  const limit = action === "packets" ? 3 : 10;
  const key = `${userEmail}:${action}`;
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
  const userEmail = await getAuthenticatedUserEmail();
  if (!userEmail) {
    return {
      authenticated: false as const,
      userEmail: null,
      isPaid: false,
      freePostsUsed: 0,
      trial: buildTrialStatus({
        freePostsUsed: 0,
        isPaid: false,
        allowed: false,
        authRequired: true
      })
    };
  }

  const [freePostsUsed, isPaid] = await Promise.all([
    countGenerationHistoryForUser(userEmail, { since: getUsageWindowStart() }),
    hasActiveSubscription(userEmail)
  ]);

  return {
    authenticated: true as const,
    userEmail,
    isPaid,
    freePostsUsed,
    trial: buildTrialStatus({
      freePostsUsed,
      isPaid,
      allowed: isPaid || freePostsUsed < FREE_POSTS_LIMIT
    })
  };
}

export async function requireGenerationAccess(action: TrialAction): Promise<AccessAllowed | AccessBlocked> {
  const status = await getCurrentTrialStatus();

  if (!status.authenticated || !status.userEmail) {
    return {
      allowed: false,
      status: 401,
      body: {
        ...status.trial,
        error: "auth_required"
      }
    };
  }

  if (isRateLimited(status.userEmail, action)) {
    return {
      allowed: false,
      status: 429,
      body: {
        ...buildTrialStatus({
          freePostsUsed: status.freePostsUsed,
          isPaid: status.isPaid,
          allowed: false,
          message: "Too many generation attempts. Please wait a minute and try again."
        }),
        error: "rate_limited",
        rate_limited: true
      }
    };
  }

  if (!status.isPaid && status.freePostsUsed >= FREE_POSTS_LIMIT) {
    console.warn("Generation blocked: free trial limit reached.", {
      userEmail: status.userEmail,
      freePostsUsed: status.freePostsUsed
    });
    return {
      allowed: false,
      status: 402,
      body: {
        ...buildTrialStatus({
          freePostsUsed: status.freePostsUsed,
          isPaid: status.isPaid,
          allowed: false,
          message: "You’ve used your 3 free generations this month. Upgrade to continue."
        }),
        error: "trial_exhausted"
      }
    };
  }

  return {
    allowed: true,
    userEmail: status.userEmail,
    freePostsUsed: status.freePostsUsed,
    isPaid: status.isPaid,
    trial: buildTrialStatus({
      freePostsUsed: status.freePostsUsed,
      isPaid: status.isPaid,
      allowed: true
    })
  };
}

export function buildSuccessfulGenerationTrial(args: {
  freePostsUsed: number;
  isPaid: boolean;
  generationSaved?: boolean;
}) {
  const used = args.isPaid
    ? args.freePostsUsed
    : args.freePostsUsed + (args.generationSaved === false ? 0 : 1);

  return buildTrialStatus({
    freePostsUsed: used,
    isPaid: args.isPaid,
    allowed: true
  });
}
