import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getDailyPlanner } from "@/lib/vibed-hunter-data";

export default function PlannerPage() {
  const planner = getDailyPlanner();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge>Daily Planner</Badge>
            <h1 className="mt-4 text-4xl font-semibold">Auto-fill today’s three Vibed posting slots.</h1>
            <p className="mt-4 max-w-3xl text-muted-foreground">
              The planner separates curiosity science, satisfying engineering, and late-night human skill so the daily lineup does not feel repetitive.
            </p>
          </div>
          <Button>Auto-fill today</Button>
        </div>
      </section>
      <div className="grid gap-4">
        {planner.map((slot) => (
          <Card key={slot.slot}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>{slot.slot}</CardTitle>
                <CardDescription className="mt-2">{slot.pillar}</CardDescription>
              </div>
              <Badge>{slot.chosen.bestPlatform}</Badge>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-primary">Chosen item</p>
                <p className="mt-2 text-lg font-semibold">{slot.chosen.bestHook}</p>
                <p className="mt-2 text-sm text-muted-foreground">{slot.chosen.reasonChosen}</p>
                <p className="mt-2 text-sm text-muted-foreground">Pack ready: {slot.chosen.status === "drafted" || slot.chosen.status === "saved" ? "yes" : "not yet"}</p>
              </div>
              <div className="grid gap-2">
                {slot.backups.map((backup) => (
                  <div key={backup.id} className="rounded-2xl bg-muted/40 p-4">
                    <p className="font-medium">{backup.bestHook}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{backup.scores.viralPotential} score</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
