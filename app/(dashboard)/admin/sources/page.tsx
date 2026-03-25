import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { SourceControls } from "@/components/dashboard/source-controls";
import { VibedModeToggle } from "@/components/dashboard/vibed-mode-toggle";
import { Input } from "@/components/ui/input";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { getSourceIntelligence } from "@/lib/source-intelligence";

export default async function AdminSourcesPage() {
  const snapshot = await getDashboardSnapshot();
  const vibedOnlyEnabled = Boolean(snapshot.user && snapshot.user.settings && "highConfidenceOnly" in snapshot.user.settings ? snapshot.user.settings.highConfidenceOnly : false);

  return (
    <div className="space-y-6">
      <div>
        <Badge>Admin</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Manage the Vibed Media source stack.</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Keep the source pool focused on visual-first science, robotics, engineering, nature, weird-but-real discovery, and short-form-friendly stories.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Vibed-only mode</CardTitle>
            <CardDescription className="mt-2">When enabled, ingestion favors only the strongest visual-first sources for your channel.</CardDescription>
          </div>
          <VibedModeToggle enabled={vibedOnlyEnabled} />
        </div>
      </Card>

      <Card>
        <CardTitle>Add source</CardTitle>
        <CardDescription className="mt-2">Add public metadata sources and tag them so the engine knows how strongly they fit Vibed Media.</CardDescription>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Input placeholder="Source name" />
          <Input placeholder="Source URL" />
          <Input placeholder="Source type" />
        </div>
        <Button className="mt-6">Create connector</Button>
      </Card>

      <div className="grid gap-4">
        {snapshot.sources.map((source) => {
          const intelligence = getSourceIntelligence(source);
          const sourceId = "id" in source ? source.id : source.url;
          const isActive = "isActive" in source ? source.isActive : true;

          return (
            <Card key={source.url}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>{source.name}</CardTitle>
                    <Badge>{intelligence.category}</Badge>
                    <Badge>{intelligence.status}</Badge>
                    <Badge>{intelligence.priority} priority</Badge>
                  </div>
                  <CardDescription>{source.url}</CardDescription>
                  <div className="grid gap-2 rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground md:min-w-[420px]">
                    <div className="flex items-center justify-between">
                      <span>Channel fit</span>
                      <span>{intelligence.channelFitScore}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Visual strength</span>
                      <span>{intelligence.visualPotential}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Short-form fit</span>
                      <span>{intelligence.shortFormFit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Repost safety confidence</span>
                      <span>{intelligence.repostSafetyConfidence}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Freshness</span>
                      <span>{intelligence.freshness}</span>
                    </div>
                  </div>
                </div>
                <div className="min-w-[220px]">
                  <SourceControls sourceId={sourceId} isActive={isActive} priority={intelligence.priority} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
