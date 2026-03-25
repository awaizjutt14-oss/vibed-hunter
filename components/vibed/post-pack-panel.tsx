"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/vibed/copy-button";
import { Button } from "@/components/ui/button";

type Pack = {
  hookOptions: string[];
  selectedHook: string;
  coverHeadline: string;
  imageHeadline: string;
  caption: string;
  pinnedComment: string;
  hashtags: string[];
  bestPostingTime: string;
  bestPlatform: string;
  audioVibe: string;
  contentPillar: string;
  safetyNotes: string;
  whyItShouldPerform: string;
  editingNotes: string;
  cta: string;
  sourceLinks: { label: string; url: string }[];
};

const modes = ["shorter", "more viral", "more informative", "more premium", "more cinematic"] as const;

export function PostPackPanel({ pack, firstFrameIdea }: { pack: Pack; firstFrameIdea?: string }) {
  const baseSections = useMemo(
    () =>
      [
        ["Selected hook", pack.selectedHook],
        ["Cover headline", pack.coverHeadline],
        ["2-line image headline", pack.imageHeadline],
        ["Caption", pack.caption],
        ["Pinned comment", pack.pinnedComment],
        ["Hashtags", pack.hashtags.join(" ")],
        ["CTA", pack.cta],
        ["Best posting time", pack.bestPostingTime],
        ["Best platform", pack.bestPlatform],
        ["Suggested audio vibe", pack.audioVibe],
        ["Suggested content pillar", pack.contentPillar],
        ["Safety notes", pack.safetyNotes],
        ["Why this should perform", pack.whyItShouldPerform],
        ["Editing notes", pack.editingNotes],
        ["First frame idea", firstFrameIdea ?? "Open on the most visual beat"],
        ["Cover text suggestion", pack.coverHeadline]
      ] as const,
    [pack, firstFrameIdea]
  );

  const [activeMode, setActiveMode] = useState<(typeof modes)[number]>("shorter");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const nextDrafts = Object.fromEntries(baseSections.map(([label, content]) => [label, applyRewrite(content, activeMode)]));
    setDrafts(nextDrafts);
  }, [baseSections, activeMode]);

  return (
    <div className="space-y-5">
      <Card className="card-raise">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Publishing cockpit</CardTitle>
            <CardDescription className="mt-2">Finalize hooks, cover, caption, CTA, and safety in one place.</CardDescription>
          </div>
          <div className="flex gap-2">
            {pack.hookOptions.slice(0, 3).map((hook) => (
              <Badge key={hook}>{hook}</Badge>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Microcopy: Pick a rewrite lens, tweak the text, copy, and ship.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {modes.map((mode) => (
            <Button key={mode} size="sm" variant={activeMode === mode ? "default" : "secondary"} onClick={() => setActiveMode(mode)}>
              {mode}
            </Button>
          ))}
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-4">
          {baseSections.map(([label]) => {
            const content = drafts[label] ?? "";
            return (
              <Card key={label} className="card-raise">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{label}</CardTitle>
                  <CopyButton label="Copy" value={content} />
                </div>
                <Textarea value={content} onChange={(e) => setDrafts((prev) => ({ ...prev, [label]: e.target.value }))} />
              </Card>
            );
          })}
        </div>
        <div className="grid gap-4">
          <Card className="card-raise">
            <CardTitle>Hook options</CardTitle>
            <CardDescription className="mt-2">Cycle through the best three before you lock the cover text.</CardDescription>
            <div className="mt-4 grid gap-2">
              {pack.hookOptions.map((hook) => (
                <div key={hook} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-foreground">{applyRewrite(hook, activeMode)}</div>
              ))}
            </div>
          </Card>
          <Card className="card-raise">
            <CardTitle>Source links</CardTitle>
            <div className="mt-4 grid gap-2">
              {pack.sourceLinks.map((source) => (
                <a key={source.url} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-primary" href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function applyRewrite(text: string, mode: (typeof modes)[number]) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  const shorten = (ratio: number) => words.slice(0, Math.max(4, Math.min(words.length, Math.round(words.length * ratio)))).join(" ");

  switch (mode) {
    case "shorter":
      return shorten(0.65);
    case "more viral":
      return tidy(`${shorten(0.85)} | feels fake but it's real`);
    case "more informative":
      return tidy(`${shorten(0.95)} — quick explainer, clean takeaway.`);
    case "more premium":
      return tidy(`Refined cut: ${shorten(0.95)} — tight, confident, minimal.`);
    case "more cinematic":
      return tidy(`${shorten(0.95)} — frame it like a reveal shot.`);
    default:
      return cleaned;
  }
}

function tidy(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
