"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/vibed/copy-button";

type Slot = {
  slot: string;
  id: string;
  hook: string;
  hookDirection?: string;
  reason: string;
  fitLabel: string;
  videoType: string;
  bestTopic: string;
  backupTopics: string[];
  avoid: string[];
  preview: string;
  platform: string;
  backupId?: string;
};

export function TodayCards({ slots }: { slots: Slot[] }) {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {slots.map((slot) => (
        <TodayCard key={slot.slot} slot={slot} />
      ))}
    </section>
  );
}

function TodayCard({ slot }: { slot: Slot }) {
  const [showAlt, setShowAlt] = useState(false);

  async function sendFeedback(reason: string) {
    await fetch("/api/brain/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slot.id, rating: reason === "exactly" ? "perfect" : reason === "never" ? "never show again" : reason === "more" ? "strong" : "weak", reasons: [reason] })
    }).catch(() => {});
  }

  return (
    <Card className="p-5 space-y-4 border-border/60">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary">{slot.slot}</p>
          <p className="mt-1 text-sm text-muted-foreground">{slot.videoType}</p>
        </div>
        <Badge className="bg-primary/10 text-primary">{slot.fitLabel}</Badge>
      </div>
      <p className="text-xl font-semibold leading-tight">{slot.hook}</p>
      {slot.hookDirection ? <p className="text-xs text-muted-foreground">Hook direction: {slot.hookDirection}</p> : null}
      <div className="space-y-2 text-sm">
        <div><span className="text-muted-foreground">Best topic:</span> {slot.bestTopic}</div>
        <div className="text-muted-foreground">Backups: {slot.backupTopics.join(", ")}</div>
      </div>
      <p className="text-sm text-muted-foreground">{slot.reason}</p>
      <p className="text-xs text-muted-foreground">Avoid: {slot.avoid.join(", ")}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" asChild><Link href={`/topics/${slot.id}`}>Use this</Link></Button>
        {slot.backupId ? <Button size="sm" variant="ghost" onClick={() => setShowAlt(!showAlt)}>Show better option</Button> : null}
        <CopyButton label="Copy hook" value={slot.hook} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <FeedbackChip label="More like this" onClick={() => sendFeedback("more")} />
        <FeedbackChip label="Less like this" onClick={() => sendFeedback("less")} />
        <FeedbackChip label="Never show again" onClick={() => sendFeedback("never")} />
        <FeedbackChip label="Exactly Vibed" onClick={() => sendFeedback("exactly")} />
      </div>
      {showAlt && slot.backupId ? (
        <div className="rounded-2xl bg-muted/40 p-3 text-sm">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Alternative</p>
          <Link className="text-primary underline-offset-4 hover:underline" href={`/topics/${slot.backupId}`}>Open alternative</Link>
        </div>
      ) : null}
    </Card>
  );
}

function FeedbackChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="rounded-full bg-muted px-3 py-1 hover:bg-muted/80">
      {label}
    </button>
  );
}
