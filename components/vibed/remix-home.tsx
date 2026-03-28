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
  post_type?: string;
  total_slides?: number;
  cover_headline?: string;
  cover_subheadline?: string;
  slides?: Array<{
    slide_number: number;
    headline: string;
    body_text: string;
    highlight_words: string[];
    visual_direction: string;
  }>;
  final_cta?: string;
};

const platforms = ["Instagram", "TikTok", "YouTube Shorts", "Facebook"];
const tones = ["viral", "storytelling", "authority", "warm", "luxury", "educational", "funny"];
const outputFormats = ["Caption", "Hook", "Full post", "Script", "Carousel text", "Story text"];
const contentFormats = [
  {
    label: "Breaking News",
    description: "For fast updates, business changes, tech moves, and major developments."
  },
  {
    label: "Story / Explainer",
    description: "For animal stories, machine stories, unusual facts, and narrative-style reveals."
  },
  {
    label: "List / Utility",
    description: "For body hacks, quick tips, facts, and save-worthy carousel posts."
  }
] as const;
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
  const [contentFormat, setContentFormat] = useState<(typeof contentFormats)[number]["label"] | "">("");
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
      contentType: payload.contentType?.trim() || "Curiosity",
      post_type: payload.post_type?.trim() || contentFormat || "Story / Explainer",
      total_slides: payload.total_slides ?? (Array.isArray(payload.slides) ? payload.slides.length : 0),
      cover_headline: payload.cover_headline?.trim() || "Build a clearer carousel angle",
      cover_subheadline: payload.cover_subheadline?.trim() || "One strong idea per slide.",
      slides:
        payload.slides?.length
          ? payload.slides
          : [
              {
                slide_number: 1,
                headline: "Start with the strongest hook",
                body_text: "Lead with the main point in the clearest possible words.",
                highlight_words: ["strongest", "hook"],
                visual_direction: "Use the most visually striking frame as the cover."
              }
            ],
      final_cta: payload.final_cta?.trim() || payload.cta?.trim() || "Follow for more post-ready ideas."
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
    contentFormat: (typeof contentFormats)[number]["label"];
  }>) {
    const input = (overrides?.input ?? content).trim();

    const response = await fetch("/api/remix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        action: "Turn into Vibed style",
        contentFormat: overrides?.contentFormat ?? contentFormat,
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

    if (!contentFormat) {
      setError("Choose a content format first.");
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
      <section className="vibed-glass vibed-glow-ring relative overflow-hidden rounded-[2.25rem] px-6 py-8 shadow-[0_36px_140px_rgba(0,0,0,0.42)] sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.16),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(124,242,255,0.12),transparent_24%),linear-gradient(120deg,rgba(255,255,255,0.02),transparent_50%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-5">
            <span className="vibed-badge text-emerald-200/75">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(73,255,182,0.9)]" />
              Vibed Media Creator Console
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Design your next post in seconds
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Turn rough ideas into hooks, captions, and creator-ready content with a cinematic workflow built for
                high-performance social storytelling.
              </p>
            </div>
            <TrialStatusPanel status={trialStatus} exhausted={isTrialExhausted} compact={false} />
          </div>
          <div className="vibed-panel flex w-full max-w-sm flex-col gap-5 rounded-[1.8rem] p-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Launch Sequence</p>
              <p className="text-sm leading-6 text-slate-300">
                Shape the concept, generate the package, and refine the strongest angle without leaving the screen.
              </p>
            </div>
            <div className="vibed-divider" />
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Flow</span>
                <span>Idea → Hook → Caption</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mode</span>
                <span>{vibedMode ? "Premium Vibed" : "Standard"}</span>
              </div>
            </div>
            <Button
              onClick={transform}
              disabled={loading || isTrialExhausted}
              className="h-12 rounded-[1.2rem] text-base"
            >
              {loading ? "Crafting your viral post..." : isTrialExhausted ? "Upgrade to continue" : "Start designing"}
            </Button>
          </div>
        </div>
      </section>

      <Card className="overflow-hidden rounded-[2rem] p-0">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent)] p-6 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
                  Creator Input
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">
                  Build a carousel post
                </h2>
                <p className="max-w-xl text-sm leading-6 text-slate-400">
                  Choose a format, generate slide-by-slide content, and turn ideas into post-ready carousel drafts.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-100">What is your post about?</label>
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Paste a caption, hook, rough draft, notes, or post idea..."
                  className="min-h-[220px]"
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <Field label="Platform">
                  <Select value={platform} onChange={setPlatform} options={platforms} />
                </Field>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-100">Content format</label>
                  <div className="grid gap-3">
                    {contentFormats.map((format) => (
                      <button
                        key={format.label}
                        type="button"
                        onClick={() => setContentFormat(format.label)}
                        className={`rounded-[1.2rem] border px-4 py-4 text-left transition-all duration-300 ${
                          contentFormat === format.label
                            ? "border-emerald-300/28 bg-emerald-400/[0.08] shadow-[0_18px_34px_rgba(73,255,182,0.12)]"
                            : "border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] hover:border-white/18 hover:bg-white/[0.04]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-white">{format.label}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{format.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={transform}
                    disabled={loading || isTrialExhausted}
                    className="h-12 min-w-[12rem] rounded-[1.2rem] text-base"
                  >
                    {loading ? "Crafting your viral post..." : isTrialExhausted ? "Upgrade to continue" : "Generate"}
                  </Button>
                  <Button
                    onClick={generateHooks}
                    disabled={hooksLoading || isTrialExhausted || !contentFormat}
                    variant="secondary"
                    className="h-12 rounded-[1.2rem] px-5 text-base"
                  >
                    {hooksLoading ? "Generating hooks..." : "Generate 3 hooks"}
                  </Button>
                </div>
              </div>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-6 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),transparent)] p-6 sm:p-7">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Mode Matrix</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Choose the emotional direction, then refine the final output only if you need more control.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`rounded-[1.15rem] border px-4 py-3 text-left text-sm transition-all duration-300 ${
                      tone === preset.tone && extraInstructions === preset.extraInstructions
                        ? "border-emerald-300/30 bg-emerald-400/[0.08] text-white shadow-[0_16px_34px_rgba(73,255,182,0.12)]"
                        : "border-white/8 bg-white/[0.025] text-slate-400 hover:border-white/16 hover:bg-white/[0.04] hover:text-slate-100"
                    }`}
                  >
                    <span className="block font-medium">{preset.label}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-slate-500">{preset.tone}</span>
                  </button>
                ))}
              </div>
            </div>

            <TrialStatusPanel status={trialStatus} exhausted={isTrialExhausted} compact />

            <details className="vibed-panel rounded-[1.5rem] p-5">
              <summary className="cursor-pointer list-none text-sm font-medium text-slate-100">
                Advanced options
              </summary>
              <div className="mt-5 grid gap-5">
                <Field label="Style">
                  <Select value={tone} onChange={setTone} options={tones} />
                </Field>

                <Field label="Output format">
                  <Select value={outputFormat} onChange={setOutputFormat} options={outputFormats} />
                </Field>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-100">Vibed mode</label>
                  <button
                    type="button"
                    onClick={() => setVibedMode((current) => !current)}
                    className={`flex h-12 w-full items-center justify-between rounded-[1.2rem] border px-4 text-sm transition-all duration-300 ${
                      vibedMode
                        ? "border-emerald-300/30 bg-emerald-400/[0.08] text-white"
                        : "border-white/10 bg-black/20 text-slate-400"
                    }`}
                  >
                    <span>{vibedMode ? "On" : "Off"}</span>
                    <span className="text-xs uppercase tracking-[0.16em]">
                      {vibedMode ? "Premium Vibed style" : "Standard remix"}
                    </span>
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-100">Extra instructions</label>
                  <Textarea
                    value={extraInstructions}
                    onChange={(event) => setExtraInstructions(event.target.value)}
                    placeholder="e.g. stronger hook, more curiosity, shorter"
                    className="min-h-[130px]"
                  />
                </div>
              </div>
            </details>
          </div>
        </div>

          {hookOptions.length ? (
            <div className="border-t border-white/8 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.02))] px-6 py-6 sm:px-7">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Hook Options</p>
                  <p className="mt-1 text-sm text-slate-300">Pick the strongest opening before you refine the full package.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
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
                      ? "border-emerald-300/30 bg-emerald-400/[0.08] text-white shadow-[0_18px_40px_rgba(73,255,182,0.12)]"
                      : "border-white/8 bg-white/[0.025] text-slate-400 hover:border-white/16 hover:text-white"
                  }`}
                >
                  {hook}
                </button>
              ))}
            </div>
            </div>
          ) : null}
      </Card>

      {result ? (
        <section className="space-y-4">
          {contentFormat && result.slides?.length ? (
            <Card className="rounded-[2rem] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
                    Carousel Draft
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <p className="text-xl font-semibold tracking-[-0.03em] text-white">Slide-by-slide output</p>
                    <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                      {result.post_type}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyButton label="Copy caption" value={result.caption ?? ""} variant="ghost" />
                  <CopyButton label="Copy full carousel" value={buildFullCarousel(result)} variant="ghost" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <Section title="Cover Headline" content={result.cover_headline ?? ""} highlight />
                <Section title="Cover Subheadline" content={result.cover_subheadline ?? ""} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {result.slides.map((slide) => (
                  <div key={slide.slide_number} className="vibed-panel rounded-[1.35rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                        Slide {slide.slide_number}
                      </p>
                      <CopyButton label="Copy slide" value={buildSlideCopy(slide)} variant="ghost" />
                    </div>
                    <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{slide.headline}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{slide.body_text}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {slide.highlight_words.map((word) => (
                        <span
                          key={`${slide.slide_number}-${word}`}
                          className="rounded-full border border-amber-300/18 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-100"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 rounded-[1rem] border border-white/8 bg-black/20 px-3 py-3 text-sm text-slate-400">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Visual direction
                      </span>
                      <span className="mt-2 block">{slide.visual_direction}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Section title="Caption" content={result.caption ?? ""} copyLabel="Copy caption" />
                <Section title="Final CTA" content={result.final_cta ?? ""} copyLabel="Copy CTA" />
              </div>
            </Card>
          ) : null}

          <Card className="rounded-[2rem] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">Output Package</p>
                <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white">Transformed Result</p>
              </div>
              <CopyButton label="Copy all" value={buildFullResult(result)} variant="ghost" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
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
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
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
                  className="rounded-[1.15rem]"
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

function buildSlideCopy(slide: NonNullable<RemixResult["slides"]>[number]) {
  return [
    `Slide ${slide.slide_number}`,
    `Headline: ${slide.headline}`,
    `Body: ${slide.body_text}`,
    `Highlight words: ${slide.highlight_words.join(", ")}`,
    `Visual direction: ${slide.visual_direction}`
  ].join("\n");
}

function buildFullCarousel(result: RemixResult) {
  return [
    `Post Type: ${result.post_type ?? ""}`,
    `Total Slides: ${result.total_slides ?? result.slides?.length ?? 0}`,
    `Cover Headline: ${result.cover_headline ?? ""}`,
    result.cover_subheadline ? `Cover Subheadline: ${result.cover_subheadline}` : "",
    ...(result.slides ?? []).map((slide) => buildSlideCopy(slide)),
    `Caption:\n${result.caption ?? ""}`,
    `Final CTA: ${result.final_cta ?? ""}`
  ]
    .filter(Boolean)
    .join("\n\n");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-100">{label}</label>
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
      className="h-12 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] outline-none transition-all duration-300 focus:border-emerald-300/25 focus:shadow-[0_0_0_4px_rgba(73,255,182,0.08)]"
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
    <div className={`vibed-panel rounded-[1.35rem] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/14 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">{title}</p>
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
            ? "text-2xl font-semibold leading-8 tracking-[-0.03em] text-white sm:text-[2rem]"
            : "text-sm leading-6 text-slate-300"
        }`}
      >
        {content}
      </p>
    </div>
  );
}

function TrialStatusPanel({
  status,
  exhausted,
  compact
}: {
  status: TrialStatusPayload;
  exhausted: boolean;
  compact?: boolean;
}) {
  const progress = Math.min((status.free_posts_used / status.free_posts_limit) * 100, 100);

  if (status.is_paid) {
    return (
      <div className={`rounded-[1.5rem] border border-emerald-300/18 bg-emerald-400/[0.07] p-4 ${compact ? "" : "max-w-xl"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">Access</p>
            <p className="mt-2 text-base font-semibold text-white">Pro access active</p>
          </div>
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
            Unlimited
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-[1.5rem] border ${exhausted ? "border-amber-300/18 bg-amber-300/[0.07]" : "border-white/10 bg-white/[0.03]"} p-4 ${compact ? "" : "max-w-xl"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Free Trial</p>
          <p className="mt-2 text-base font-semibold text-white">
            {exhausted
              ? "You’ve used your 3 free generations this month."
              : `Free generations left: ${status.remaining_free_generations} / ${status.free_posts_limit}`}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {exhausted
              ? "Upgrade to keep generating premium post packages."
              : `You’ve used ${status.free_posts_used} of ${status.free_posts_limit} free generations this month.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-28">
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full ${exhausted ? "bg-amber-300" : "bg-[linear-gradient(90deg,#49ffb6,#7cf2ff)]"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Link
            href="/settings"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
              exhausted
                ? "border border-amber-300/18 bg-amber-300/10 text-amber-100 hover:bg-amber-300/14"
                : "border border-white/10 bg-white/[0.04] text-white hover:border-white/18 hover:bg-white/[0.08]"
            }`}
          >
            {exhausted ? "Unlock Pro" : "Upgrade"}
          </Link>
        </div>
      </div>
      {!compact && exhausted ? (
        <div className="mt-4 rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
          Premium mode unlocks unlimited generations, advanced iteration, and a smoother creator workflow.
        </div>
      ) : null}
    </div>
  );
}
