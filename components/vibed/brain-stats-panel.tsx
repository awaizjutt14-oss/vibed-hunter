import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Stats = {
  totalRated: number;
  topPrefs: string[];
  topDislikes: string[];
  brainConfidence: number;
  reasonCounts: Array<{ reason: string; count: number }>;
};

export function BrainStatsPanel({ stats }: { stats: Stats }) {
  return (
    <Card className="card-raise">
      <CardTitle>Brain confidence</CardTitle>
      <CardDescription className="mt-2">How well Vibed Brain thinks it matches your taste.</CardDescription>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total items rated</p>
          <p className="mt-2 text-2xl font-semibold">{stats.totalRated}</p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Brain confidence</p>
          <p className="mt-2 text-2xl font-semibold">{Math.round(stats.brainConfidence * 100)}%</p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Strongest dislikes</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {stats.topDislikes.map((d) => <Badge key={d} className="border-amber-500/40 bg-amber-500/10 text-amber-200">{d}</Badge>)}
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-muted/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Strongest learned preferences</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stats.topPrefs.map((p) => <Badge key={p}>{p}</Badge>)}
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-muted/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Reason frequency</p>
        <div className="mt-3 space-y-2">
          {stats.reasonCounts.map((entry) => (
            <div key={entry.reason}>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{entry.reason}</span>
                <span>{entry.count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, entry.count * 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
