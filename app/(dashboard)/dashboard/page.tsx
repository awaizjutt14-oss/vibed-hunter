import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/vibed/copy-button";
import Link from "next/link";

type Pick = {
  slot: "12:30 PM" | "6:30 PM" | "9:15 PM";
  hook: string;
  bestTopic: string;
  angle: string;
  videoHint: string;
  avoid: string;
  viralScore: number;
  categoryLabel: string;
};

async function getPicks(): Promise<Pick[]> {
  const baseUrl = process.env.APP_BASE_URL?.length ? process.env.APP_BASE_URL : "http://127.0.0.1:3001";
  try {
    const res = await fetch(`${baseUrl}/api/dynamic-picks`, { cache: "no-store" });
    if (!res.ok) throw new Error("failed");
    const json = await res.json();
    return (json.recs ?? []) as Pick[];
  } catch {
    return [
      {
        slot: "12:30 PM",
        hook: "Microscope shows crystals growing like alien machines",
        bestTopic: "Tiny-scale science visual",
        angle: "Looks fake at first glance",
        videoHint: "Look for microscope or tiny-scale science visuals",
        avoid: "Avoid text-heavy overlays",
        viralScore: 88,
        categoryLabel: "curiosity/science"
      },
      {
        slot: "6:30 PM",
        hook: "CNC cuts metal edges cleaner than paper",
        bestTopic: "Precision machine payoff",
        angle: "Impossible precision with obvious reward",
        videoHint: "Look for clean machine precision with obvious payoff",
        avoid: "Avoid messy camera angles",
        viralScore: 91,
        categoryLabel: "satisfying/engineering"
      },
      {
        slot: "9:15 PM",
        hook: "This balance clip feels fake until replayed",
        bestTopic: "Replay-worthy human control",
        angle: "How is this even real?",
        videoHint: "Look for replay-worthy human skill or impossible control",
        avoid: "Avoid blurry or shaky clips",
        viralScore: 93,
        categoryLabel: "crazy human skill"
      }
    ];
  }
}

function buildCaption(pick: Pick) {
  return [
    pick.hook,
    "",
    `At first it just feels unreal.`,
    `Then the detail kicks in and you have to watch again.`,
    "",
    `This is the kind of ${pick.bestTopic.toLowerCase()} people instantly send to friends. Would you replay this?`
  ].join("\n");
}

export default async function DashboardPage() {
  const picks = await getPicks();

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-primary">Daily Ideas</p>
          <h1 className="text-3xl font-semibold">3 content ideas for today</h1>
          <p className="text-sm text-muted-foreground">Hooks and captions, ready to use.</p>
        </div>
        <Button asChild>
          <Link href="/bot">Refresh ideas</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {picks.map((pick) => {
          const caption = buildCaption(pick);
          return (
            <Card key={pick.slot + pick.hook} className="h-full space-y-4 border-border/70 p-5">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.16em] text-primary">{pick.slot}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{pick.categoryLabel}</span>
                  <span>Viral score {pick.viralScore}</span>
                </div>
                <h2 className="text-xl font-semibold leading-tight">{pick.hook}</h2>
              </div>

              <p className="text-sm text-muted-foreground">{pick.videoHint}</p>

              <div className="rounded-2xl bg-muted/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80">Caption</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{caption}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <CopyButton label="Copy hook" value={pick.hook} />
                <CopyButton label="Copy caption" value={caption} />
              </div>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
