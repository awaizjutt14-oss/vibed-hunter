import { BrainProfilePanel } from "@/components/vibed/brain-profile-panel";
import { TrainingBoard } from "@/components/vibed/training-board";
import { Badge } from "@/components/ui/badge";
import { BrainStatsPanel } from "@/components/vibed/brain-stats-panel";
import { SwipeTrainer } from "@/components/vibed/swipe-trainer";
import { CompareBoard } from "@/components/vibed/compare-board";
import { ExamplesTrainer } from "@/components/vibed/examples-trainer";
import { getOpportunities, getBrainStats } from "@/lib/vibed-hunter-data";

export default async function BrainPage() {
  const items = getOpportunities().slice(0, 9);
  const stats = await getBrainStats();
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Vibed Brain</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Train the app to judge content like Vibed Media.</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Taste profile, rejection rules, hook DNA, caption DNA, and adaptive scoring live here. Rate items to tighten the brain.
        </p>
      </section>
      <BrainStatsPanel stats={stats} />
      <BrainProfilePanel />
      <ExamplesTrainer />
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Fast swipe training</h2>
        <p className="text-sm text-muted-foreground">Swipe-style: tap a rating, tag a couple reasons, auto-advance.</p>
        <SwipeTrainer items={items} />
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Pairwise training</h2>
        <p className="text-sm text-muted-foreground">Pairwise wins push ranking faster than single ratings.</p>
        <div className="grid gap-4">
          <CompareBoard items={items} mode="post" />
          <CompareBoard items={items} mode="hook" />
          <CompareBoard items={items} mode="caption" />
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Taste training</h2>
        <p className="text-sm text-muted-foreground">Rate opportunities; reasons will bias future rankings and tie-breaks.</p>
        <TrainingBoard items={items} />
      </section>
    </div>
  );
}
