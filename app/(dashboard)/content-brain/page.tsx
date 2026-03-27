"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/vibed/copy-button";
import { DEFAULT_TRIAL_STATUS, fetchTrialStatus } from "@/lib/trial-client";
import type { TrialStatusPayload } from "@/lib/trial-types";

type HuntPost = {
  time: string;
  category: string;
  idea: string;
  hook: string;
  caption: string;
  whyItCouldWork: string;
};

type HuntResponse = {
  posts?: HuntPost[];
  allowed?: boolean;
  paywall?: boolean;
  message?: string;
  free_posts_used?: number;
  free_posts_limit?: number;
  is_paid?: boolean;
  subscription_status?: string;
  remaining_free_generations?: number;
};

export default function ContentBrainPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<HuntPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function findContent() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hunt?usageEventId=${encodeURIComponent(crypto.randomUUID())}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as HuntResponse;
      updateTrialStatus(payload);
      if (!response.ok) {
        throw new Error(payload.message || "Failed to find content.");
      }
      setPosts(Array.isArray(payload.posts) ? payload.posts : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to find content.");
    } finally {
      setLoading(false);
    }
  }

  function usePost(post: HuntPost) {
    const prefill = [post.hook, post.idea, post.caption].join("\n\n");
    router.push(`/remix?prefill=${encodeURIComponent(prefill)}`);
  }

  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-card/70 px-6 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/90">Content Brain</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Find your next Vibed-ready post
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Three intentional daily ideas built for curiosity, visual payoff, and replay value.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
              {trialStatus.is_paid ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                  Pro access active
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-background/40 px-3 py-1">
                  {trialStatus.remaining_free_generations > 0
                    ? `Free generations left: ${trialStatus.remaining_free_generations} / ${trialStatus.free_posts_limit}`
                    : `You’ve used ${trialStatus.free_posts_used} of ${trialStatus.free_posts_limit} free generations this month`}
                </span>
              )}
              {isTrialExhausted ? (
                <Link href="/settings" className="text-primary underline-offset-4 hover:underline">
                  Upgrade to continue
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={findContent}
              disabled={loading || isTrialExhausted}
              className="h-12 rounded-2xl px-6 text-base shadow-[0_12px_32px_rgba(34,197,94,0.22)]"
            >
              {loading ? "Finding..." : isTrialExhausted ? "Upgrade to continue" : "Find Content"}
            </Button>
            <Button
              onClick={findContent}
              disabled={loading || isTrialExhausted}
              variant="secondary"
              className="h-12 rounded-2xl px-6 text-base"
            >
              {loading ? "Loading..." : "Regenerate"}
            </Button>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <Card className="rounded-[1.75rem] border border-white/10 bg-card/85 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur">
          <p className="text-lg font-semibold tracking-tight text-foreground">Nothing generated yet</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tap Find Content to generate three daily ideas for 12:30 PM, 6:30 PM, and 9:15 PM.
          </p>
          {isTrialExhausted ? (
            <p className="mt-3 text-sm text-amber-300">You’ve used your 3 free generations this month. Upgrade to continue.</p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={`${post.time}-${post.hook}`}
              className="rounded-[1.75rem] border border-white/10 bg-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur sm:p-6"
            >
              <div className="flex h-full flex-col gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/90">{post.time}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                      {post.category}
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{post.hook}</h2>
                </div>

                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <Block title="Idea" content={post.idea} />
                  <Block title="Caption" content={post.caption} />
                  <Block title="Why It Could Work" content={post.whyItCouldWork} />
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Button onClick={() => usePost(post)} className="h-11 rounded-2xl px-5 text-base">
                    Use this
                  </Button>
                  <CopyButton label="Copy hook" value={post.hook} variant="secondary" />
                  <CopyButton label="Copy caption" value={post.caption} variant="ghost" />
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}

function Block({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">{title}</p>
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
