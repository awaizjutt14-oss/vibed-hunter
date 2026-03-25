import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function AnalyticsReview({
  data
}: {
  data: {
    topSlot: string;
    topHookType: string;
    topTopicType: string;
    topPillar: string;
    repeat: string[];
    avoid: string[];
    posts: Array<{ date: string; slot: string; hook: string; topic: string; format: string; views: number; likes: number; shares: number; comments: number; saves: number; watchTime: string; note: string }>;
    memory: Array<{ date: string; slot: string; hook: string; topic: string; platform: string; result: string; views: number; saves: number; shares: number; note: string }>;
    patterns: { bestSlot: string; bestHookType: string; bestTopicType: string; bestPillar: string; bestFormat: string; bestCover: string };
  };
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Best slot", data.topSlot],
          ["Best hook type", data.topHookType],
          ["Best topic type", data.topTopicType],
          ["Best pillar", data.topPillar]
        ].map(([label, value]) => (
          <Card key={label}>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="mt-3 text-2xl">{value}</CardTitle>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>What to repeat</CardTitle>
          <div className="mt-4 grid gap-2">
            {data.repeat.map((item) => <div key={item} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">{item}</div>)}
          </div>
        </Card>
        <Card>
          <CardTitle>What to avoid</CardTitle>
          <div className="mt-4 grid gap-2">
            {data.avoid.map((item) => <div key={item} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">{item}</div>)}
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Performance memory</CardTitle>
        <CardDescription className="mt-2">What we already posted and how it performed.</CardDescription>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {data.memory.map((item) => (
            <div key={`${item.date}-${item.hook}`} className="rounded-2xl border border-border/60 bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-primary">{item.slot} · {item.platform}</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{item.hook}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.topic}</p>
              <p className="mt-2 text-sm text-muted-foreground">Views {item.views.toLocaleString()} · Saves {item.saves.toLocaleString()} · Shares {item.shares.toLocaleString()}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle>Performance review</CardTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Slot</th>
                <th className="pb-3">Hook</th>
                <th className="pb-3">Views</th>
                <th className="pb-3">Saves</th>
                <th className="pb-3">Watch time</th>
              </tr>
            </thead>
            <tbody>
              {data.posts.map((post) => (
                <tr key={`${post.date}-${post.hook}`} className="border-t border-border">
                  <td className="py-3">{post.date}</td>
                  <td className="py-3">{post.slot}</td>
                  <td className="py-3">{post.hook}</td>
                  <td className="py-3">{post.views.toLocaleString()}</td>
                  <td className="py-3">{post.saves.toLocaleString()}</td>
                  <td className="py-3">{post.watchTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card>
        <CardTitle>Patterns detected</CardTitle>
        <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(data.patterns).map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-muted/60 px-4 py-3 text-sm">
              {(() => {
                const pretty = label.replace(/([A-Z])/g, " $1").trim();
                const display = pretty.charAt(0).toUpperCase() + pretty.slice(1);
                return (
                  <>
                    <span className="font-medium text-foreground">{display}</span>
                    <p className="text-muted-foreground">{value}</p>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
