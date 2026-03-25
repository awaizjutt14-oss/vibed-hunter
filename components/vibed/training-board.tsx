"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/lib/vibed-hunter-data";
import { FeedbackRating, FeedbackReason } from "@/lib/brain-feedback-store";

export const ratings: FeedbackRating[] = ["perfect", "strong", "maybe", "weak", "never show again"];
export const reasons: FeedbackReason[] = ["weak first frame", "not premium enough", "bad hook potential", "too random", "low US fit", "too repetitive", "weak replay value", "bad caption potential"];

export function TrainingBoard({ items }: { items: Opportunity[] }) {
  const initial = useMemo(() => Object.fromEntries(items.map((i) => [i.id, { rating: "" as FeedbackRating, reasons: [] as FeedbackReason[] }])), [items]);
  const [feedback, setFeedback] = useState<Record<string, { rating: FeedbackRating; reasons: FeedbackReason[] }>>(initial);

  // load existing feedback
  useEffect(() => {
    fetch("/api/brain/feedback")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.feedback) return;
        const loaded = Object.fromEntries(
          (data.feedback as Array<{ id: string; rating: FeedbackRating; reasons: FeedbackReason[] }>).map((f) => [
            f.id,
            { rating: f.rating, reasons: f.reasons ?? [] }
          ])
        );
        setFeedback((prev) => ({ ...prev, ...loaded }));
      })
      .catch(() => {});
  }, []);

  const saveFeedback = async (id: string, rating: FeedbackRating, reasons: FeedbackReason[]) => {
    setFeedback((prev) => ({ ...prev, [id]: { rating, reasons } }));
    try {
      await fetch("/api/brain/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rating, reasons })
      });
    } catch (_) {
      /* ignore offline */
    }
  };

  return (
    <div className="grid gap-4">
      {items.map((item) => {
        const fb = feedback[item.id] ?? { rating: "", reasons: [] };
        return (
          <Card key={item.id} className="card-raise">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>{item.bestHook}</CardTitle>
                <CardDescription className="mt-1">{item.summary}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge>{item.pillar}</Badge>
                  <Badge>{item.bestPlatform}</Badge>
                  <Badge className="border-primary/40 bg-primary/10 text-primary">Viral {item.scores.viralPotential}</Badge>
                </div>
              </div>
              <div className="rounded-2xl bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                {item.brain.explanation}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {ratings.map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={fb.rating === rating ? "default" : "secondary"}
                  onClick={() => saveFeedback(item.id, rating, fb.reasons)}
                >
                  {rating}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {reasons.map((reason) => {
                const active = fb.reasons.includes(reason);
                return (
                  <Button
                    key={reason}
                    size="sm"
                    variant={active ? "default" : "ghost"}
                  onClick={() => {
                    const existing = fb.reasons ?? [];
                    const next = active ? existing.filter((r) => r !== reason) : [...existing, reason];
                    saveFeedback(item.id, fb.rating, next);
                  }}
                >
                  {reason}
                </Button>
              );
            })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Microcopy: These signals will tune the adaptive scoring (simulated locally for now).</p>
          </Card>
        );
      })}
    </div>
  );
}
