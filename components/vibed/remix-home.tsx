"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/vibed/copy-button";
import {
  applyLearningFeedback,
  applyLearningInteraction,
  buildLearningPrompt,
  createEmptyLearningProfile,
  fetchLearningProfile,
  persistLearningFeedback,
  persistLearningInteraction,
  type InteractionType,
  type LearningFeedback,
  type LearningResultSnapshot,
  type PreferenceProfile
} from "@/lib/remix-learning";
import { fetchTrialStatus, DEFAULT_TRIAL_STATUS } from "@/lib/trial-client";
import type { TrialStatusPayload } from "@/lib/trial-types";

type RemixResult = {
  hook?: string;
  caption?: string;
  pinned_comment?: string;
  pinnedComment?: string;
  cta?: string;
  hashtags?: string | string[];
  story_text?: string;
  story?: string;
  bestPostTime?: string;
  timeReason?: string;
  suggestedAudio?: string;
  contentType?: string;
  internalScores?: {
    hookStrength: number;
    curiosity: number;
    clarity: number;
    virality: number;
    nicheMatch: number;
  };
  error?: string;
  allowed?: boolean;
  paywall?: boolean;
  message?: string;
  free_posts_used?: number;
  free_posts_limit?: number;
  is_paid?: boolean;
  subscription_status?: string;
  remaining_free_generations?: number;
};

const platforms = ["Instagram", "TikTok", "YouTube Shorts", "Facebook"];
const tones = ["viral", "storytelling", "authority", "warm", "luxury", "educational", "funny"];
const outputFormats = ["Caption", "Hook", "Full post", "Script", "Carousel text", "Story text"];
const presets = [
  { label: "Viral", tone: "viral", extraInstructions: "stronger curiosity, sharper hook, faster payoff" },
  { label: "Informative", tone: "educational", extraInstructions: "clearer explanation, useful details, clean authority" },
  { label: "Calm", tone: "warm", extraInstructions: "softer tone, cleaner pacing, more natural flow" },
  { label: "Mind-blowing", tone: "storytelling", extraInstructions: "more disbelief, stronger reveal, more replay value" }
] as const;
const sectionKeys = ["hook", "caption", "pinnedComment", "cta", "hashtags", "story"] as const;

type SectionKey = (typeof sectionKeys)[number];
type SectionLoading = Partial<Record<SectionKey, boolean>>;

function toLearningSnapshot(result?: RemixResult) {
  if (!result) return undefined;
  return {
    hook: result.hook,
    caption: result.caption,
    cta: result.cta,
    hashtags: Array.isArray(result.hashtags) ? result.hashtags.join(" ") : result.hashtags,
    contentType: result.contentType,
    internalScores: result.internalScores
  };
}

export function RemixHome() {
  const searchParams = useSearchParams();
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState(platforms[0]);
  const [tone, setTone] = useState(tones[0]);
  const [outputFormat, setOutputFormat] = useState(outputFormats[0]);
  const [extraInstructions, setExtraInstructions] = useState("");
  const [vibedMode, setVibedMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hooksLoading, setHooksLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState<SectionLoading>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RemixResult | null>(null);
  const [hookOptions, setHookOptions] = useState<string[]>([]);
  const [learningProfile, setLearningProfile] = useState<PreferenceProfile>(createEmptyLearningProfile());
  const [trialStatus, setTrialStatus] = useState<TrialStatusPayload>(DEFAULT_TRIAL_STATUS);

  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) {
      setContent(prefill);
      setOutputFormat("Full post");
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    fetchLearningProfile()
      .then((profile) => {
        if (active) setLearningProfile(profile);
      })
      .catch(() => {
        if (active) setLearningProfile(createEmptyLearningProfile());
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetchTrialStatus()
      .then((status) => {
        if (active) setTrialStatus(status);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const isTrialExhausted = !trialStatus.is_paid && trialStatus.free_posts_used >= trialStatus.free_posts_limit;

  function updateTrialStatusFromPayload(payload: Partial<TrialStatusPayload>) {
    if (typeof payload.free_posts_used !== "number") return;

    setTrialStatus({
      allowed: typeof payload.allowed === "boolean" ? payload.allowed : true,
      paywall: payload.paywall,
      message: payload.message,
      free_posts_used: payload.free_posts_used,
      free_posts_limit:
        typeof payload.free_posts_limit === "number" ? payload.free_posts_limit : DEFAULT_TRIAL_STATUS.free_posts_limit,
      is_paid: Boolean(payload.is_paid),
      subscription_status: payload.subscription_status ?? "free",
      remaining_free_generations:
        typeof payload.remaining_free_generations === "number"
          ? payload.remaining_free_generations
          : Math.max((payload.free_posts_limit ?? DEFAULT_TRIAL_STATUS.free_posts_limit) - payload.free_posts_used, 0)
    });
  }

  function updateSectionLoading(section: SectionKey, value: boolean) {
    setSectionLoading((current) => ({
      ...current,
      [section]: value
    }));
  }

  function withFallbacks(payload: RemixResult): RemixResult {
    return {
      ...payload,
      hook: payload.hook?.trim() || "This is the detail people replay",
      caption:
        payload.caption?.trim() ||
        "This version keeps the idea clear and easy to feel.\n\nThe payoff lands faster, and that is what makes people stay.\n\nWould you post this version?",
      pinnedComment:
        payload.pinnedComment?.trim() ||
        payload.pinned_comment?.trim() ||
        "Would this stop you mid-scroll?",
      cta: payload.cta?.trim() || "Follow @vibed.media for more ideas like this",
      hashtags:
        (Array.isArray(payload.hashtags) ? payload.hashtags.join(" ") : payload.hashtags)?.trim() ||
        "#content #creator #viral",
      story:
        payload.story?.trim() ||
        payload.story_text?.trim() ||
        "Open strong.\nShow the visual payoff.\nLeave them wanting the next clip.",
      bestPostTime: payload.bestPostTime?.trim() || "12:30 PM",
      timeReason:
        payload.timeReason?.trim() ||
        "This fits a curiosity-first slot because it has clear visual pull and strong save potential.",
      suggestedAudio:
        payload.suggestedAudio?.trim() || "cinematic suspense | futuristic ambient | replay tension beat",
      contentType: payload.contentType?.trim() || "Curiosity"
    };
  }

  function syncInteraction(args: {
    type: InteractionType;
    platform?: string;
    tone?: string;
    outputFormat?: string;
    content?: string;
    result?: LearningResultSnapshot;
  }) {
    setLearningProfile((current) => applyLearningInteraction(current, args));
    void persistLearningInteraction(args)
      .then((profile) => setLearningProfile(profile))
      .catch(() => undefined);
  }

  function syncFeedback(feedback: LearningFeedback, snapshot?: ReturnType<typeof toLearningSnapshot>) {
    setLearningProfile((current) => applyLearningFeedback(current, feedback, snapshot));
    void persistLearningFeedback(feedback, snapshot)
      .then((profile) => setLearningProfile(profile))
      .catch(() => undefined);
  }

  async function requestRemix(overrides?: Partial<{
    input: string;
    tone: string;
    outputFormat: string;
    extraInstructions: string;
    vibedMode: boolean;
    usageEventId: string;
  }>) {
    const input = (overrides?.input ?? content).trim();

    const response = await fetch("/api/remix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        action: "Turn into Vibed style",
        platform,
        tone: overrides?.tone ?? tone,
        outputFormat: overrides?.outputFormat ?? outputFormat,
        extraInstructions: overrides?.extraInstructions ?? extraInstructions,
        vibedMode: overrides?.vibedMode ?? vibedMode,
        learningProfile: buildLearningPrompt(learningProfile),
        usageEventId: overrides?.usageEventId ?? crypto.randomUUID()
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as RemixResult;
      updateTrialStatusFromPayload(payload);
      throw new Error(payload.message || payload.error || "Failed to transform content.");
    }

    const payload = (await response.json()) as RemixResult;
    updateTrialStatusFromPayload(payload);
    if (payload.error) {
      throw new Error(payload.error);
    }

    return withFallbacks(payload);
  }

  function applyPreset(preset: (typeof presets)[number]) {
    setTone(preset.tone);
    setExtraInstructions(preset.extraInstructions);
    setVibedMode(true);
  }

  async function generateHooks() {
    const input = content.trim();
    if (!input) {
      setError("Paste your content first.");
      return;
    }

    setHooksLoading(true);
    setError(null);
    try {
      const variants = await Promise.all(
        (() => {
          const usageEventId = crypto.randomUUID();
          return [
            "Give the strongest curiosity-first hook.",
            "Give the cleanest replay-worthy hook.",
            "Give the most scroll-stopping Vibed hook."
          ].map((instruction) =>
            requestRemix({
              outputFormat: "Hook",
              extraInstructions: [extraInstructions, instruction].filter(Boolean).join(". "),
              usageEventId
            })
          );
        })()
      );

      setHookOptions(
        variants
          .map((item) => item.hook?.trim() ?? "")
          .filter(Boolean)
          .filter((value, index, array) => array.indexOf(value) === index)
          .slice(0, 3)
      );
      syncInteraction({
        type: "generated",
        platform,
        tone,
        outputFormat: "Hook",
        content,
        result: toLearningSnapshot(variants[0])
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to generate hooks.");
    } finally {
      setHooksLoading(false);
    }
  }

  async function regenerateSection(section: SectionKey) {
    const input = content.trim();
    if (!input || !result) {
      return;
    }

    updateSectionLoading(section, true);
    setError(null);
    try {
      const refreshed = await requestRemix({
        extraInstructions: [
          extraInstructions,
          `Only make the ${section} stronger while keeping the rest aligned with the same idea.`
        ]
          .filter(Boolean)
          .join(". ")
      });

      setResult((current) =>
        current
          ? {
              ...current,
              hook: section === "hook" ? refreshed.hook : current.hook,
              caption: section === "caption" ? refreshed.caption : current.caption,
              pinnedComment:
                section === "pinnedComment"
                  ? refreshed.pinnedComment ?? refreshed.pinned_comment
                  : current.pinnedComment ?? current.pinned_comment,
              cta: section === "cta" ? refreshed.cta : current.cta,
              hashtags: section === "hashtags" ? refreshed.hashtags : current.hashtags,
              story: section === "story" ? refreshed.story ?? refreshed.story_text : current.story ?? current.story_text
            }
          : current
      );
      syncInteraction({
        type: "regenerated",
        platform,
        tone,
        outputFormat,
        content,
        result: toLearningSnapshot(refreshed)
      });
    } catch (err: any) {
      setError(err?.message ?? "Failed to regenerate section.");
    } finally {
      updateSectionLoading(section, false);
    }
  }

  async function transform() {
    const input = content.trim();

    if (!input) {
      setError("Paste your content first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = await requestRemix({ input });
      setResult(payload);
      setHookOptions((current) =>
        payload.hook
          ? [payload.hook, ...current].filter((value, index, array) => array.indexOf(value) === index).slice(0, 3)
          : current
      );
      syncInteraction({
        type: "generated",
        platform,
        tone,
        outputFormat,
        content,
        result: toLearningSnapshot(payload)
      });
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-card/70 px-6 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/90">Vibed Hunter</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Design your next post in seconds
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Turn rough ideas into hooks, captions, and creator-ready content.
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
          <Button
            onClick={transform}
            disabled={loading || isTrialExhausted}
            className="h-12 rounded-2xl px-6 text-base shadow-[0_12px_32px_rgba(34,197,94,0.22)]"
          >
            {loading ? "Crafting your viral post..." : isTrialExhausted ? "Upgrade to continue" : "Start designing"}
          </Button>
        </div>
      </section>

      <Card className="rounded-[1.75rem] border border-white/10 bg-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/90">Design your next post</p>
            <h2 className="text-2xl font-semibold tracking-tight">Design your next post</h2>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">What is your post about?</label>
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Paste a caption, hook, rough draft, notes, or post idea..."
              className="min-h-[180px] rounded-[1.25rem] border-white/10 bg-background/80"
            />
          </div>

          <Field label="Platform">
            <Select value={platform} onChange={setPlatform} options={platforms} />
          </Field>

          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full border px-4 py-2 text-sm transition-all ${
                  tone === preset.tone && extraInstructions === preset.extraInstructions
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-white/10 bg-background/60 text-muted-foreground hover:border-white/20 hover:text-foreground"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <details className="rounded-[1.25rem] border border-white/10 bg-background/50 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              Advanced options
            </summary>
            <div className="mt-4 grid gap-5">
              <Field label="Style">
                <Select value={tone} onChange={setTone} options={tones} />
              </Field>

              <Field label="Output format">
                <Select value={outputFormat} onChange={setOutputFormat} options={outputFormats} />
              </Field>

              <div className="space-y-3">
                <label className="text-sm font-medium">Vibed mode</label>
                <button
                  type="button"
                  onClick={() => setVibedMode((current) => !current)}
                  className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-sm transition ${
                    vibedMode
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-white/10 bg-background text-muted-foreground"
                  }`}
                >
                  <span>{vibedMode ? "On" : "Off"}</span>
                  <span className="text-xs uppercase tracking-[0.16em]">
                    {vibedMode ? "Premium Vibed style" : "Standard remix"}
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Extra instructions</label>
                <Textarea
                  value={extraInstructions}
                  onChange={(event) => setExtraInstructions(event.target.value)}
                  placeholder="e.g. stronger hook, more curiosity, shorter"
                  className="min-h-[120px] rounded-[1.25rem] border-white/10 bg-background/80"
                />
              </div>
            </div>
          </details>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={transform}
              disabled={loading || isTrialExhausted}
              className="h-12 rounded-2xl px-6 text-base shadow-[0_12px_32px_rgba(34,197,94,0.22)]"
            >
              {loading ? "Crafting your viral post..." : isTrialExhausted ? "Upgrade to continue" : "Generate"}
            </Button>
            <Button
              onClick={generateHooks}
              disabled={hooksLoading || isTrialExhausted}
              variant="secondary"
              className="h-12 rounded-2xl px-6 text-base transition-all"
            >
              {hooksLoading ? "Generating hooks..." : "Generate 3 hooks"}
            </Button>
          </div>
          {isTrialExhausted ? (
            <div className="rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              You’ve used your 3 free generations. Upgrade to continue.
            </div>
          ) : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}

          {hookOptions.length ? (
            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {hookOptions.map((hook) => (
                <button
                  key={hook}
                  type="button"
                  onClick={() =>
                    {
                      setResult((current) => ({
                        ...(current ?? {}),
                        hook
                      }));
                      syncInteraction({
                        type: "selected_hook",
                        platform,
                        tone,
                        outputFormat,
                        content,
                        result: { hook }
                      });
                    }
                  }
                  className={`rounded-[1.25rem] border p-4 text-left text-sm transition-all ${
                    (result?.hook ?? "") === hook
                      ? "border-primary/40 bg-primary/10 text-foreground shadow-[0_10px_24px_rgba(34,197,94,0.12)]"
                      : "border-white/10 bg-background/60 text-muted-foreground hover:border-white/20 hover:text-foreground"
                  }`}
                >
                  {hook}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Card>

      {result ? (
        <section className="space-y-4">
          <Card className="rounded-[1.75rem] border border-white/10 bg-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold tracking-tight text-foreground">Transformed Result</p>
              <CopyButton label="Copy all" value={buildFullResult(result)} variant="ghost" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => syncFeedback("strong", toLearningSnapshot(result))}
              >
                Strong
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => syncFeedback("weak", toLearningSnapshot(result))}
              >
                Weak
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => syncFeedback("performed_well", toLearningSnapshot(result))}
              >
                Performed well
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => syncFeedback("performed_badly", toLearningSnapshot(result))}
              >
                Performed badly
              </Button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <Section
                title="Hook"
                content={result.hook ?? ""}
                copyLabel="Copy hook"
                onCopy={() =>
                  syncInteraction({
                    type: "copied_hook",
                    platform,
                    tone,
                    outputFormat,
                    content,
                    result: toLearningSnapshot(result)
                  })
                }
                actionLabel={sectionLoading.hook ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("hook")}
                actionDisabled={Boolean(sectionLoading.hook)}
                highlight
              />
              <Section
                title="CTA"
                content={result.cta ?? ""}
                copyLabel="Copy CTA"
                onCopy={() =>
                  syncInteraction({
                    type: "copied_cta",
                    platform,
                    tone,
                    outputFormat,
                    content,
                    result: toLearningSnapshot(result)
                  })
                }
                actionLabel={sectionLoading.cta ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("cta")}
                actionDisabled={Boolean(sectionLoading.cta)}
              />
              <Section
                title="Caption"
                content={result.caption ?? ""}
                copyLabel="Copy caption"
                onCopy={() =>
                  syncInteraction({
                    type: "copied_caption",
                    platform,
                    tone,
                    outputFormat,
                    content,
                    result: toLearningSnapshot(result)
                  })
                }
                className="lg:col-span-2"
                actionLabel={sectionLoading.caption ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("caption")}
                actionDisabled={Boolean(sectionLoading.caption)}
              />
              <Section
                title="Pinned Comment"
                content={result.pinnedComment ?? result.pinned_comment ?? ""}
                copyLabel="Copy pinned comment"
                actionLabel={sectionLoading.pinnedComment ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("pinnedComment")}
                actionDisabled={Boolean(sectionLoading.pinnedComment)}
              />
              <Section
                title="Hashtags"
                content={Array.isArray(result.hashtags) ? result.hashtags.join(" ") : result.hashtags ?? ""}
                copyLabel="Copy hashtags"
                onCopy={() =>
                  syncInteraction({
                    type: "copied_hashtags",
                    platform,
                    tone,
                    outputFormat,
                    content,
                    result: toLearningSnapshot(result)
                  })
                }
                actionLabel={sectionLoading.hashtags ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("hashtags")}
                actionDisabled={Boolean(sectionLoading.hashtags)}
              />
              <Section
                title="Story Text"
                content={result.story ?? result.story_text ?? ""}
                copyLabel="Copy story text"
                className="lg:col-span-2"
                actionLabel={sectionLoading.story ? "Regenerating..." : "Regenerate"}
                onAction={() => regenerateSection("story")}
                actionDisabled={Boolean(sectionLoading.story)}
              />
              <Section title="Best Time To Post" content={result.bestPostTime ?? ""} copyLabel="Copy time" />
              <Section title="Content Type" content={result.contentType ?? ""} copyLabel="Copy type" />
              <Section
                title="Why This Time Works"
                content={result.timeReason ?? ""}
                copyLabel="Copy reason"
                className="lg:col-span-2"
              />
              <Section
                title="Suggested Audio"
                content={result.suggestedAudio ?? ""}
                copyLabel="Copy audio"
                className="lg:col-span-2"
              />
              <div className="lg:col-span-2">
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() =>
                    syncInteraction({
                      type: "saved_result",
                      platform,
                      tone,
                      outputFormat,
                      content,
                      result: toLearningSnapshot(result)
                    })
                  }
                >
                  Save result
                </Button>
              </div>
            </div>
          </Card>
        </section>
      ) : null}
    </main>
  );
}

function buildFullResult(result: RemixResult) {
  return [
    `Hook: ${result.hook ?? ""}`,
    `Caption:\n${result.caption ?? ""}`,
    `Pinned Comment: ${result.pinnedComment ?? result.pinned_comment ?? ""}`,
    `CTA: ${result.cta ?? ""}`,
    `Hashtags: ${Array.isArray(result.hashtags) ? result.hashtags.join(" ") : result.hashtags ?? ""}`,
    `Story Text:\n${result.story ?? result.story_text ?? ""}`,
    `Best Time To Post: ${result.bestPostTime ?? ""}`,
    `Why This Time Works: ${result.timeReason ?? ""}`,
    `Suggested Audio: ${result.suggestedAudio ?? ""}`,
    `Content Type: ${result.contentType ?? ""}`
  ].join("\n\n");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-12 w-full rounded-2xl border border-white/10 bg-background/80 px-4 text-sm text-foreground shadow-sm"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function Section({
  title,
  content,
  copyLabel,
  onCopy,
  className,
  actionLabel,
  onAction,
  actionDisabled,
  highlight
}: {
  title: string;
  content: string;
  copyLabel?: string;
  onCopy?: () => void;
  className?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`space-y-2 rounded-[1.25rem] border border-white/10 bg-background/60 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-200 hover:border-white/20 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/75">{title}</p>
        <div className="flex items-center gap-2">
          {onAction ? (
            <Button size="sm" variant="ghost" onClick={onAction} disabled={actionDisabled}>
              {actionLabel ?? "Regenerate"}
            </Button>
          ) : null}
          {copyLabel ? <CopyButton label={copyLabel} value={content} variant="ghost" onCopy={onCopy} /> : null}
        </div>
      </div>
      <p
        className={`whitespace-pre-wrap ${
          highlight
            ? "text-xl font-semibold leading-8 tracking-tight text-foreground sm:text-2xl"
            : "text-sm leading-6 text-muted-foreground"
        }`}
      >
        {content}
      </p>
    </div>
  );
}
