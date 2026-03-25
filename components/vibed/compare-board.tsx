"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/lib/vibed-hunter-data";
import { FeedbackReason, FeedbackRating } from "@/lib/brain-feedback-store";
import { reasons } from "@/components/vibed/training-board";

type Mode = "post" | "hook" | "caption";

async function savePairwinner(winner: Opportunity, loser: Opportunity, mode: Mode, reasonsSelected: FeedbackReason[]) {
  const reasonTag = mode === "hook" ? "better hook" : mode === "caption" ? "better caption" : "better overall";
  const winnerReasons = Array.from(new Set([...reasonsSelected, "pairwise win", reasonTag as FeedbackReason].filter(Boolean)));
  await Promise.all([
    fetch("/api/brain/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: winner.id, rating: "strong" as FeedbackRating, reasons: winnerReasons })
    }),
    fetch("/api/brain/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: loser.id, rating: "weak" as FeedbackRating, reasons: [...reasonsSelected, "pairwise loss"] })
    })
  ]).catch(() => {});
}

export function CompareBoard({ items, mode }: { items: Opportunity[]; mode: Mode }) {
  const pairs = useMemo(() => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const out: Array<[Opportunity, Opportunity]> = [];
    for (let i = 0; i < shuffled.length - 1; i += 2) out.push([shuffled[i], shuffled[i + 1]]);
    return out.slice(0, 4);
  }, [items]);

  const [cursor, setCursor] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<FeedbackReason[]>([]);
  const [keyboardHint, setKeyboardHint] = useState(false);
  const pair = pairs[cursor];
  if (!pair) return null;
  const [a, b] = pair;

  const renderBody = (o: Opportunity) => {
    if (mode === "hook") return <p className="text-lg font-semibold">{o.bestHook}</p>;
    if (mode === "caption") return <p className="whitespace-pre-wrap text-sm text-muted-foreground">{o.caption}</p>;
    return (
      <>
        <p className="text-lg font-semibold">{o.bestHook}</p>
        <p className="mt-2 text-sm text-muted-foreground">{o.summary}</p>
      </>
    );
  };

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!pair) return;
      if (e.key.toLowerCase() === "a") {
        savePairwinner(a, b, mode, selectedReasons).then(() => {
          setSelectedReasons([]);
          setCursor((c) => Math.min(pairs.length, c + 1));
        });
      }
      if (e.key.toLowerCase() === "l") {
        savePairwinner(b, a, mode, selectedReasons).then(() => {
          setSelectedReasons([]);
          setCursor((c) => Math.min(pairs.length, c + 1));
        });
      }
      if (e.key.toLowerCase() === "r") {
        setSelectedReasons([]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [a, b, mode, pair, pairs.length, selectedReasons]);

  return (
    <Card className="card-raise">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle>Compare {mode === "post" ? "two posts" : mode === "hook" ? "two hooks" : "two captions"}</CardTitle>
          <CardDescription className="mt-1">Pick the better fit; pairwise wins train faster than singles.</CardDescription>
        </div>
        <Badge>{cursor + 1} / {pairs.length}</Badge>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[a, b].map((o) => (
          <div key={o.id} className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">{o.pillar} · {o.bestPlatform}</p>
            {renderBody(o)}
            <p className="mt-2 text-xs text-muted-foreground">Brain: {o.brain.explanation || "Aligned"}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {reasons.map((reason) => {
          const active = selectedReasons.includes(reason);
          return (
            <Button
              key={reason}
              size="sm"
              variant={active ? "default" : "ghost"}
              onClick={() => setSelectedReasons((prev) => active ? prev.filter((r) => r !== reason) : [...prev, reason])}
            >
              {reason}
            </Button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await savePairwinner(a, b, mode, selectedReasons);
            setSelectedReasons([]);
            setCursor((c) => Math.min(pairs.length, c + 1));
          }}
        >
          A wins
        </Button>
        <Button
          size="sm"
          onClick={async () => {
            await savePairwinner(b, a, mode, selectedReasons);
            setSelectedReasons([]);
            setCursor((c) => Math.min(pairs.length, c + 1));
          }}
        >
          B wins
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Each win = strong signal; loss = weak signal. Reasons sharpen the re-rank. Shortcuts: A / L to pick, R to clear reasons.
      </p>
    </Card>
  );
}
