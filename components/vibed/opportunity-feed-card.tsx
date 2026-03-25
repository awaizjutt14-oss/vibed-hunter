import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Opportunity } from "@/lib/vibed-hunter-data";
import { ScoreBar } from "@/components/vibed/score-bar";
import { CopyButton } from "@/components/vibed/copy-button";
import { ThumbsDown, ThumbsUp } from "lucide-react";

export function OpportunityFeedCard({ item }: { item: Opportunity }) {
  async function sendFeedback(rating: "strong" | "weak") {
    await fetch("/api/brain/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, rating, reasons: rating === "strong" ? ["feed inline like"] : ["feed inline dislike"] })
    }).catch(() => {});
  }
  return (
    <Card className="overflow-hidden card-raise soft-fade">
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <div className="rounded-[1.5rem] border border-border bg-gradient-to-br from-primary/20 via-transparent to-amber-400/10 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-primary">{item.previewLabel}</p>
          <div className="mt-5 rounded-[1.25rem] bg-black/30 p-4">
            <p className="text-sm text-muted-foreground">{item.category}</p>
            <p className="mt-3 text-xl font-semibold leading-tight">{item.bestHook}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Viral potential</span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{item.scores.viralPotential}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{item.pillar}</Badge>
            <Badge>{item.bestPlatform}</Badge>
            <Badge>{item.formatType}</Badge>
            <Badge>{item.status}</Badge>
          </div>
          <div>
            <CardTitle>{item.bestHook}</CardTitle>
            <CardDescription className="mt-2">{item.summary}</CardDescription>
            <p className="mt-2 text-sm text-muted-foreground">Original headline: {item.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">Source: {item.sourceName}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ScoreBar label="Viral potential" value={item.scores.viralPotential} />
            <ScoreBar label="Transformability" value={item.transformabilityScore} tone="amber" />
            <ScoreBar label="Visual power" value={item.scores.visualPower} tone="sky" />
            <ScoreBar label="Repost safety" value={item.scores.repostSafety} tone="emerald" />
            <ScoreBar label="First-frame strength" value={item.scores.firstFrame} tone="sky" />
            <ScoreBar label="Comment bait" value={item.scores.commentBait} tone="amber" />
            <ScoreBar label="Share/save" value={item.scores.shareSavePotential} tone="emerald" />
          </div>
          <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Why it may work for Vibed</p>
            <p className="mt-2">{item.whyItWorks}</p>
            <p className="mt-2">Suggested slot: {item.suggestedSlot}</p>
            {item.duplicateWarning ? <p className="mt-2 text-amber-300">Duplicate idea warning: {item.duplicateWarning}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild><Link href={`/topics/${item.id}`}>Open</Link></Button>
            <Button variant="secondary" asChild><Link href="/saved">Save</Link></Button>
            <Button variant="secondary" asChild><Link href={`/topics/${item.id}`}>Generate hooks</Link></Button>
            <Button variant="ghost" asChild><Link href={`/packets/${item.id}`}>Build pack</Link></Button>
            <Button variant="ghost">Reject</Button>
            <Button size="sm" variant="ghost" onClick={() => sendFeedback("strong")}><ThumbsUp className="h-4 w-4" /></Button>
            <Button size="sm" variant="ghost" onClick={() => sendFeedback("weak")}><ThumbsDown className="h-4 w-4" /></Button>
            <CopyButton label="Copy hook" value={item.bestHook} />
          </div>
          <p className="text-xs text-muted-foreground">Microcopy: Open to inspect hook/caption; Build pack to enter the creator command center.</p>
        </div>
      </div>
    </Card>
  );
}
