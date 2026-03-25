import Link from "next/link";
import { ArrowRight, Sparkles, Play, ShieldCheck, Eye, Clock3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const pillars = [
  { title: "12:30 PM", subtitle: "Curiosity / Science / Future", line: "Mind-bending realities that feel unreal but are real." },
  { title: "6:30 PM", subtitle: "Satisfying Engineering", line: "Precision processes, machines and builds that mesmerize." },
  { title: "9:15 PM", subtitle: "Crazy Human Skill", line: "Impossible-looking control and mastery that spark replays." }
];

const proof = [
  { icon: Eye, title: "Vibed-first scoring", desc: "First-frame power, curiosity gap, replay value, US fit, repost safety." },
  { icon: ShieldCheck, title: "Brand-safe", desc: "No cringe hype, no spam hooks, copyright-safer rewrites by design." },
  { icon: Clock3, title: "Daily slots locked", desc: "Best pick for each posting slot, plus backups and what-to-avoid." },
  { icon: Zap, title: "Post-ready packs", desc: "Hooks, captions, pinned comments, cover text, hashtags, timing—ready to ship." }
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <section className="rounded-[28px] border border-border bg-card/90 p-8 shadow-xl backdrop-blur md:p-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-4 w-4" />
          Vibed Media — Official
        </div>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
          The content command center for Vibed Media.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
          We hunt the internet, learn our taste, and deliver three creator-ready post packs every day. No clutter, just decisions: what to post, why it wins, and what to avoid.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button size="lg" asChild>
            <Link href="/dashboard" className="inline-flex items-center gap-2">
              Open Vibed Hunter
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="mailto:hello@vibed.media" className="inline-flex items-center gap-2">
              Talk to Vibed Media
              <Play className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/bot" className="inline-flex items-center gap-2">
              Use simple bot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="h-full border-border/70 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-primary">{pillar.title}</p>
            <CardTitle className="mt-2 text-lg">{pillar.subtitle}</CardTitle>
            <CardDescription className="mt-3 text-sm text-muted-foreground">{pillar.line}</CardDescription>
          </Card>
        ))}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {proof.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="h-full border-border/70 p-5">
              <div className="mb-3 inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription className="mt-2 text-sm text-muted-foreground">{item.desc}</CardDescription>
            </Card>
          );
        })}
      </section>

      <section className="mt-12 rounded-3xl border border-border/70 bg-muted/30 p-6 md:p-8">
        <h2 className="text-2xl font-semibold">What you get every day</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Top pick for 12:30 / 6:30 / 9:15 with backups and “what not to post”.</li>
          <li>• Hooks, captions, pinned comment, cover text, hashtags, CTA, best posting time.</li>
          <li>• Source-safe, originality-focused angles with citations.</li>
          <li>• Continuous learning from Vibed Brain + Instagram history.</li>
        </ul>
      </section>
    </main>
  );
}
