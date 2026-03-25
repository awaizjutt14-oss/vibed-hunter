import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { DailySlotPlan } from "@/lib/vibed-hunter-data";
import { ScoreBar } from "@/components/vibed/score-bar";
import { CopyButton } from "@/components/vibed/copy-button";

export function SlotCard({ slot }: { slot: DailySlotPlan }) {
  const item = slot.chosen;
  const fullPackText = [
    `Hook: ${item.bestHook}`,
    `Caption: ${item.caption}`,
    `Pinned comment: ${item.pinnedComment}`,
    `Hashtags: ${item.hashtags.join(" ")}`,
    `CTA: ${item.cta}`
  ].join("\n");

  return (
    <Card className="relative overflow-hidden card-raise soft-fade">
      <div className="absolute right-[-24px] top-[-24px] h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg">{slot.slot}</CardTitle>
          <CardDescription className="mt-2">{slot.pillar}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{item.bestPlatform}</Badge>
          <div className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary shadow-[0_10px_30px_-20px_rgba(255,40,110,0.8)]">
            Viral potential {item.scores.viralPotential}
          </div>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary">Best hook</p>
          <p className="mt-2 text-xl font-semibold leading-tight">{item.bestHook}</p>
          <p className="mt-2 text-xs text-muted-foreground">Optimized for this slot’s vibe and platform.</p>
        </div>
        <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Why it fits</p>
          <p className="mt-2">{item.reasonChosen}</p>
          <p className="mt-2 text-xs text-foreground">Why this wins: {item.whyItWins}</p>
          <p className="mt-1 text-xs text-muted-foreground">Why this loses: {item.whyItLoses}</p>
          <p className="mt-2 text-xs">Best platform: {item.bestPlatform}</p>
          <p className="mt-2 text-xs text-muted-foreground">Brain: {item.brain.explanation || "Aligned with Vibed Brain profile."}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Confidence {Math.round(item.brain.confidence * 100)}% · Source: {item.brain.trainingInfluence === "training" ? "training signals" : "default scoring"}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Matched: {item.brain.signalsMatched.join(", ") || "n/a"}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Conflicted: {item.brain.signalsConflicted.join(", ") || "none"}</p>
        </div>
        <div className="grid gap-3">
          <ScoreBar label="Viral potential" value={item.scores.viralPotential} tone="rose" />
          <ScoreBar label="First-frame strength" value={item.scores.firstFrame} tone="sky" />
          <ScoreBar label="Visual power" value={item.scores.visualPower} tone="sky" />
          <ScoreBar label="Curiosity gap" value={item.scores.curiosityGap} tone="amber" />
          <ScoreBar label="Share / save potential" value={item.scores.shareSavePotential} tone="emerald" />
          <ScoreBar label="Comment bait" value={item.scores.commentBait} tone="amber" />
          <ScoreBar label="Repost safety" value={item.scores.repostSafety} tone="emerald" />
          <ScoreBar label="Slot fit" value={item.scores.slotFit} tone="emerald" />
          <ScoreBar label="US relevance" value={item.scores.usRelevance} tone="emerald" />
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton label="Copy hook" value={item.bestHook} />
          <CopyButton label="Copy caption" value={item.caption} />
          <CopyButton label="Copy pinned comment" value={item.pinnedComment} />
          <CopyButton label="Copy hashtags" value={item.hashtags.join(" ")} />
          <CopyButton label="Copy full pack" value={fullPackText} variant="default" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild><Link href={`/topics/${item.id}`}>Use now</Link></Button>
          <Button variant="secondary" asChild><Link href={`/topics/${item.id}`}>Generate caption</Link></Button>
          <Button variant="ghost" asChild><Link href={`/packets/${item.id}`}>Create full post pack</Link></Button>
          <Button variant="secondary" asChild><Link href="/saved">Save</Link></Button>
          <Button variant="ghost">Dismiss</Button>
        </div>
        <p className="text-xs text-muted-foreground">Microcopy: Use now opens the focused hook/caption view; full pack opens the creator command center.</p>
      </div>
    </Card>
  );
}
