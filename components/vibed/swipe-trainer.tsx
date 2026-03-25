"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/lib/vibed-hunter-data";
import { FeedbackRating, FeedbackReason } from "@/lib/brain-feedback-store";
import { ratings, reasons } from "@/components/vibed/training-board";

async function save(id: string, rating: FeedbackRating, reasons: FeedbackReason[]) {
  await fetch("/api/brain/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, rating, reasons })
  }).catch(() => {});
}

export function SwipeTrainer({ items }: { items: Opportunity[] }) {
  const queue = useMemo(() => [...items], [items]);
  const [index, setIndex] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<FeedbackReason[]>([]);

  const current = queue[index];

  useEffect(() => setSelectedReasons([]), [index]);

  // keyboard shortcuts: 1 perfect, 2 strong, 3 maybe, 4 weak, 5 never; R reset reasons
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!current) return;
      const map: Record<string, FeedbackRating> = {
        "1": "perfect",
        "2": "strong",
        "3": "maybe",
        "4": "weak",
        "5": "never show again"
      };
      if (map[e.key]) {
        save(current.id, map[e.key], selectedReasons).then(() => {
          setIndex((i) => Math.min(queue.length, i + 1));
        });
      }
      if (e.key.toLowerCase() === "r") setSelectedReasons([]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, queue.length, selectedReasons]);

  if (!current) return null;

  return (
    <Card className="card-raise">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CardTitle>Swipe review</CardTitle>
          <CardDescription className="mt-1">Fast single-card training. Pick a rating, tap a couple reasons, move on.</CardDescription>
        </div>
        <Badge>{index + 1} / {queue.length}</Badge>
      </div>
      <div className="mt-4 rounded-2xl border border-border/60 bg-muted/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-primary">{current.pillar} · {current.bestPlatform}</p>
        <p className="mt-2 text-lg font-semibold">{current.bestHook}</p>
        <p className="mt-2 text-sm text-muted-foreground">{current.summary}</p>
        <p className="mt-2 text-xs text-muted-foreground">Brain: {current.brain.explanation || "Aligned with Vibed Brain profile."}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ratings.map((rating) => (
          <Button
            key={rating}
            size="sm"
            variant="secondary"
            onClick={async () => {
              await save(current.id, rating, selectedReasons);
              setIndex((i) => Math.min(queue.length, i + 1));
            }}
          >
            {rating}
          </Button>
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
              onClick={() => {
                setSelectedReasons((prev) => active ? prev.filter((r) => r !== reason) : [...prev, reason]);
              }}
            >
              {reason}
            </Button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Reason chips speed up the brain—pairwise choices below add even stronger signals.</p>
    </Card>
  );
}
