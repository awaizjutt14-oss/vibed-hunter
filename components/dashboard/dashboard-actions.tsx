"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_TRIAL_STATUS, fetchTrialStatus } from "@/lib/trial-client";
import type { TrialStatusPayload } from "@/lib/trial-types";

export function DashboardActions() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [trialStatus, setTrialStatus] = useState<TrialStatusPayload>(DEFAULT_TRIAL_STATUS);

  useEffect(() => {
    void fetchTrialStatus()
      .then((status) => setTrialStatus(status))
      .catch(() => undefined);
  }, []);

  const isTrialExhausted = !trialStatus.is_paid && trialStatus.free_posts_used >= trialStatus.free_posts_limit;

  function updateTrialStatus(payload: Partial<TrialStatusPayload>) {
    if (typeof payload.free_posts_used !== "number") return;
    setTrialStatus({
      allowed: typeof payload.allowed === "boolean" ? payload.allowed : true,
      paywall: payload.paywall,
      message: payload.message,
      free_posts_used: payload.free_posts_used,
      free_posts_limit: payload.free_posts_limit ?? DEFAULT_TRIAL_STATUS.free_posts_limit,
      is_paid: Boolean(payload.is_paid),
      subscription_status: payload.subscription_status ?? "free",
      remaining_free_generations:
        payload.remaining_free_generations ??
        Math.max((payload.free_posts_limit ?? DEFAULT_TRIAL_STATUS.free_posts_limit) - payload.free_posts_used, 0)
    });
  }

  async function runAction(url: string) {
    setMessage(null);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usageEventId: crypto.randomUUID() })
    });
    const payload = await response.json();
    updateTrialStatus(payload);
    if (!response.ok) {
      setMessage(payload.message ?? payload.error ?? "Action failed.");
      return;
    }
    setMessage(payload.message ?? "Done.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="text-right text-sm text-muted-foreground">
        {trialStatus.is_paid ? (
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
            Pro access active
          </span>
        ) : (
          <span>
            {trialStatus.remaining_free_generations > 0
              ? `Free generations left: ${trialStatus.remaining_free_generations} / ${trialStatus.free_posts_limit}`
              : `You’ve used ${trialStatus.free_posts_used} of ${trialStatus.free_posts_limit} free generations this month`}
          </span>
        )}
      </div>
      <div className="flex gap-3">
        <Button disabled={isPending} onClick={() => runAction("/api/ingest/run")}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Find viral content
        </Button>
        <Button variant="secondary" disabled={isPending || isTrialExhausted} onClick={() => runAction("/api/packets/generate")}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isTrialExhausted ? "Upgrade to continue" : "Create 5 post-ready ideas"}
        </Button>
      </div>
      {isTrialExhausted ? (
        <Link href="/settings" className="text-sm text-primary underline-offset-4 hover:underline">
          You’ve used your 3 free generations this month. Upgrade to continue.
        </Link>
      ) : null}
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
