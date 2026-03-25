import { Button } from "@/components/ui/button";
import { DashboardIdeas } from "@/components/vibed/dashboard-ideas";
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
  scoreBreakdown?: {
    engagement: number;
    trendRelevance: number;
    categoryMatch: number;
  };
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
        categoryLabel: "curiosity/science",
        scoreBreakdown: { engagement: 82, trendRelevance: 85, categoryMatch: 96 }
      },
      {
        slot: "6:30 PM",
        hook: "CNC cuts metal edges cleaner than paper",
        bestTopic: "Precision machine payoff",
        angle: "Impossible precision with obvious reward",
        videoHint: "Look for clean machine precision with obvious payoff",
        avoid: "Avoid messy camera angles",
        viralScore: 91,
        categoryLabel: "satisfying/engineering",
        scoreBreakdown: { engagement: 88, trendRelevance: 86, categoryMatch: 96 }
      },
      {
        slot: "9:15 PM",
        hook: "This balance clip feels fake until replayed",
        bestTopic: "Replay-worthy human control",
        angle: "How is this even real?",
        videoHint: "Look for replay-worthy human skill or impossible control",
        avoid: "Avoid blurry or shaky clips",
        viralScore: 93,
        categoryLabel: "crazy human skill",
        scoreBreakdown: { engagement: 91, trendRelevance: 87, categoryMatch: 96 }
      }
    ];
  }
}

export default async function DashboardPage() {
  const picks = await getPicks();

  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-card/70 px-6 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/90">Daily Ideas</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Find your next viral post
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              3 ready-to-use ideas for today
            </p>
          </div>
          <Button asChild className="h-12 rounded-2xl px-6 text-base">
            <Link href="/bot">Get today&apos;s ideas</Link>
          </Button>
        </div>
      </section>

      <DashboardIdeas picks={picks} />
    </main>
  );
}
