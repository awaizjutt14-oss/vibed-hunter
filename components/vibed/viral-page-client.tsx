"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/vibed/copy-button";
import { DEFAULT_TRIAL_STATUS, fetchTrialStatus } from "@/lib/trial-client";
import type { TrialStatusPayload } from "@/lib/trial-types";

type Result = {
  hook: string;
  caption: string;
  pinned_comment: string;
  hashtags: string[];
  note?: string;
  allowed?: boolean;
  paywall?: boolean;
  message?: string;
  free_posts_used?: number;
  free_posts_limit?: number;
  is_paid?: boolean;
  subscription_status?: string;
  remaining_free_generations?: number;
};

const contentTypes = ["engineering", "machines", "satisfying processes", "precision work", "AI/tech", "manufacturing"];

export function ViralPageClient() {
  const [topic, setTopic] = useState("Machine slicing metal threads thinner than hair");
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("engineering");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
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
      authRequired: payload.authRequired,
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

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, contentType })
      });
      const json = (await res.json().catch(() => ({}))) as Result;
      updateTrialStatus(json);
      if (!res.ok) {
        throw new Error(json.message || "Failed to generate");
      }
      setResult(json);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:py-14">
      <Card className="p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Viral Caption Bot</p>
            <h1 className="text-3xl font-semibold">Create a Vibed-ready post in one tap.</h1>
            <p className="text-sm text-muted-foreground">Hook, caption, pinned comment, and hashtags, auto-formatted for {platform}.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {trialStatus.is_paid ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                  Pro access active
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-background/40 px-3 py-1">
                  {trialStatus.remaining_free_generations > 0
                    ? `Free generations left: ${trialStatus.remaining_free_generations} / ${trialStatus.free_posts_limit}`
                    : `You’ve used ${trialStatus.free_posts_used} of ${trialStatus.free_posts_limit} free generations`}
                </span>
              )}
              {isTrialExhausted ? (
                <Link href="/settings" className="text-primary underline-offset-4 hover:underline">
                  Upgrade to continue
                </Link>
              ) : null}
            </div>
          </div>
          <Button onClick={generate} disabled={loading || isTrialExhausted}>
            {loading ? "Generating..." : isTrialExhausted ? "Upgrade to continue" : "Generate"}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm font-medium">Topic / what the clip shows</p>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="Describe the clip in one or two lines"
              className="mt-2"
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Platform</p>
              <select
                className="mt-2 h-12 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 text-sm text-foreground"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-medium">Content type</p>
              <select
                className="mt-2 h-12 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 text-sm text-foreground"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                {contentTypes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {isTrialExhausted ? (
          <p className="mt-3 text-sm text-amber-300">You’ve used your free generations.</p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>

      {result && (
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Generated</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton label="Copy all" value={formatAll(result)} />
            </div>
          </div>
          {result.note ? <p className="text-xs text-muted-foreground">{result.note}</p> : null}
          <Section title="Hook" text={result.hook} />
          <Section title="Caption" text={result.caption} />
          <Section title="Pinned comment" text={result.pinned_comment} />
          <Section title="Hashtags" text={result.hashtags.join(" ")} />
        </Card>
      )}
    </main>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <CopyButton label="Copy" value={text} variant="ghost" />
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function formatAll(r: Result) {
  return [
    `Hook: ${r.hook}`,
    "Caption:",
    r.caption,
    `Pinned comment: ${r.pinned_comment}`,
    `Hashtags: ${r.hashtags.join(" ")}`
  ].join("\n");
}

