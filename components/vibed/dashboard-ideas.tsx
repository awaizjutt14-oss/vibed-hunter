"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/vibed/copy-button";
import { applyLearningBoost, getLearningSummary, recordLearningInteraction, type LearningPick } from "@/lib/vibed-learning";

type Pick = LearningPick & {
  bestTopic: string;
  angle: string;
  videoHint: string;
  avoid: string;
  scoreBreakdown?: {
    engagement: number;
    trendRelevance: number;
    categoryMatch: number;
  };
};

export function DashboardIdeas({ picks }: { picks: Pick[] }) {
  const [orderedPicks, setOrderedPicks] = useState<Pick[]>(picks);
  const [summaryLabel, setSummaryLabel] = useState("Learning from your clicks and copies");
  const [expandedCaptions, setExpandedCaptions] = useState<Record<string, boolean>>({});
  const [savedHooks, setSavedHooks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOrderedPicks(applyLearningBoost(picks));
    setSummaryLabel(formatSummary());
  }, [picks]);

  const rendered = useMemo(() => orderedPicks, [orderedPicks]);

  function handleInteraction(pick: Pick, type: "click" | "copy_hook" | "copy_caption" | "copy_full_post") {
    recordLearningInteraction(pick, type);
    setOrderedPicks(applyLearningBoost(picks));
    setSummaryLabel(formatSummary());
  }

  function toggleSaved(pick: Pick) {
    setSavedHooks((current) => ({ ...current, [pick.slot + pick.hook]: !current[pick.slot + pick.hook] }));
  }

  if (!rendered.length) {
    return (
      <section className="rounded-[1.75rem] border border-dashed border-white/15 bg-card/60 px-6 py-12 text-center shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
        <h2 className="text-2xl font-semibold tracking-tight">No ideas yet. Tap below to generate today&apos;s picks.</h2>
        <p className="mt-3 text-sm text-muted-foreground">Vibed Hunter will turn fresh trends into creator-ready ideas for you.</p>
        <Button asChild className="mt-6 h-12 rounded-2xl px-6 text-base">
          <Link href="/bot">Get today&apos;s ideas</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="grid gap-6 md:grid-cols-3">
      {rendered.map((pick) => {
        const caption = buildCaption(pick);
        const fullPost = buildFullPost(pick);
        const cardKey = pick.slot + pick.hook;
        const expanded = !!expandedCaptions[cardKey];
        const saved = !!savedHooks[cardKey];
        return (
          <Card
            key={cardKey}
            className="group h-full rounded-[1.75rem] border border-white/10 bg-card/80 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-card sm:p-6"
          >
            <div className="flex h-full flex-col gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/12 px-2.5 py-1 font-medium text-primary">{pick.slot}</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-muted-foreground">{pick.categoryLabel}</span>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-muted-foreground">Viral score {pick.viralScore}</span>
                </div>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.75rem]">
                  {pick.hook}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">{pick.videoHint}</p>
                <p className="text-xs text-primary/80">{summaryLabel}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                {pick.scoreBreakdown ? (
                  <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-2xl border border-white/10 bg-background/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Engagement</p>
                      <p className="mt-1 font-semibold text-foreground">{pick.scoreBreakdown.engagement}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-background/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Trend</p>
                      <p className="mt-1 font-semibold text-foreground">{pick.scoreBreakdown.trendRelevance}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-background/40 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Vibed Fit</p>
                      <p className="mt-1 font-semibold text-foreground">{pick.scoreBreakdown.categoryMatch}</p>
                    </div>
                  </div>
                ) : null}
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">Caption</p>
                <p
                  className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground"
                  style={
                    expanded
                      ? undefined
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden"
                        }
                  }
                >
                  {caption}
                </p>
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  onClick={() => setExpandedCaptions((current) => ({ ...current, [cardKey]: !expanded }))}
                >
                  {expanded ? "Hide full caption" : "View full caption"}
                </button>
              </div>

              <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button size="lg" className="h-12 rounded-2xl px-5" onClick={() => handleInteraction(pick, "click")}>
                  Use This
                </Button>
                <CopyButton
                  label="Copy Full Post"
                  value={fullPost}
                  variant="secondary"
                  onCopy={() => handleInteraction(pick, "copy_full_post")}
                />
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-2xl px-5"
                  onClick={() => toggleSaved(pick)}
                >
                  {saved ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

function buildCaption(pick: Pick) {
  return [
    pick.hook,
    "",
    "At first it just feels unreal.",
    "Then the detail kicks in and you have to watch again.",
    "",
    `This is the kind of ${pick.bestTopic.toLowerCase()} people instantly send to friends. Would you replay this?`
  ].join("\n");
}

function buildFullPost(pick: Pick) {
  const caption = buildCaption(pick);
  return [pick.hook, "", caption].join("\n");
}

function formatSummary() {
  const summary = getLearningSummary();
  if (!summary.totalInteractions) return "Learning from your clicks and copies";
  const parts = [
    summary.topCategory ? `prefers ${summary.topCategory}` : null,
    summary.topHookStyle ? `${summary.topHookStyle} hooks` : null,
    summary.topLength ? `${summary.topLength} length` : null
  ].filter(Boolean);
  return parts.length ? `Learning: ${parts.join(" · ")}` : "Learning from your clicks and copies";
}
