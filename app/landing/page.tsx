import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Orbit,
  RadioTower,
  Sparkles,
  ToyBrick,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const pillars = [
  {
    title: "Viral Tech",
    text: "Breakthrough tools, strange capabilities, and tech moments that instantly feel worth sharing.",
    icon: Cpu
  },
  {
    title: "Engineering",
    text: "Complex systems, hidden mechanisms, and precision builds turned into clear visual storytelling.",
    icon: Wrench
  },
  {
    title: "Machines",
    text: "Satisfying movement, impossible control, and industrial visuals built for replay value.",
    icon: ToyBrick
  },
  {
    title: "Tools & Gadgets",
    text: "Objects that feel smarter, sharper, cleaner, or oddly futuristic the second you see them.",
    icon: Sparkles
  },
  {
    title: "Future Ideas",
    text: "Concepts, signals, and internet-native ideas that make tomorrow feel scroll-stopping today.",
    icon: Orbit
  }
] as const;

const ecosystem = [
  {
    title: "Content",
    text: "Short-form media built around curiosity, machines, gadgets, and future-facing internet culture."
  },
  {
    title: "Creator Systems",
    text: "Internal workflows designed to make high-output publishing feel cleaner, faster, and more intentional."
  },
  {
    title: "Vibed Hunter",
    text: "The creative operating layer for turning raw ideas into hooks, captions, and post-ready angles."
  },
  {
    title: "Future Products",
    text: "A growing ecosystem of media tools, creator utilities, and brand-led experiments."
  }
] as const;

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(73,255,182,0.16),transparent_24%),radial-gradient(circle_at_84%_14%,rgba(124,242,255,0.08),transparent_21%),linear-gradient(180deg,#04070b_0%,#070b11_42%,#04070a_100%)]" />
        <div className="absolute left-[4%] top-[4%] h-[34rem] w-[34rem] rounded-full bg-emerald-400/12 blur-[155px]" />
        <div className="absolute right-[-3%] top-[12%] h-[26rem] w-[26rem] rounded-full bg-cyan-300/8 blur-[145px]" />
        <div className="absolute bottom-[-12%] left-[24%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/9 blur-[180px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[86rem] flex-col gap-14 px-4 py-6 sm:px-6 lg:px-8">
        <header className="vibed-glass vibed-glow-ring sticky top-4 z-20 rounded-[2rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(73,255,182,0.14),rgba(73,255,182,0.05))] text-primary shadow-[0_18px_40px_rgba(73,255,182,0.14)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.34em] text-emerald-200/60">Vibed Media</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Modern Media Brand</h1>
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex">
                    Brand Ecosystem
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="#ecosystem">Explore Vibed Media</Link>
              </Button>
              <Button asChild className="rounded-full px-6">
                <Link href="https://app.vibed.media">
                  Open Vibed Hunter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="space-y-8 pt-6 sm:pt-10">
            <span className="vibed-badge border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Premium media for the future-facing internet
            </span>
            <div className="max-w-3xl space-y-5">
              <h2 className="text-[3rem] font-semibold tracking-[-0.08em] text-white sm:text-[4.9rem] sm:leading-[0.94]">
                Where viral tech meets modern media.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Vibed Media is a digital media brand focused on viral tech, engineering, machines, gadgets, and
                future-facing internet content. We turn complex ideas into visuals that feel addictive, premium, and
                easy to understand.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full px-6 text-base shadow-[0_16px_38px_rgba(73,255,182,0.18)]">
                <Link href="#about">
                  Explore Vibed Media
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 rounded-full px-6 text-base">
                <Link href="https://app.vibed.media">Open Vibed Hunter</Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-7">
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
                  Brand Direction
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Machines, ideas, and internet culture — reimagined.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Built to make future-focused content feel cinematic, premium, and immediately watchable.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Focus</p>
                  <p className="mt-2 text-lg font-semibold text-white">Tech, machines, engineering, gadgets</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Format</p>
                  <p className="mt-2 text-lg font-semibold text-white">Scroll-stopping media for modern platforms</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="about" className="grid gap-6 pt-2 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">About Vibed Media</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">A brand built around visual obsession</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Vibed Media exists to package complexity into compelling internet-native media. The brand focuses on
              technology, engineering, machines, gadgets, and future ideas, but always through a lens that feels
              visual first, culturally sharp, and easy to feel instantly.
            </p>
          </Card>
          <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Why it lands</p>
            <p className="mt-3 text-lg leading-8 text-slate-300">
              We make complicated things feel visually addictive and simple to understand. That is the brand promise:
              sharp ideas, premium execution, and content that feels native to the internet people actually watch.
            </p>
          </Card>
        </section>

        <section id="pillars" className="space-y-5 pt-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Content pillars</p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              The ideas shaping the Vibed Media feed
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;

              return (
                <Card
                  key={pillar.title}
                  className="rounded-[1.6rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/18"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-emerald-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-5 text-lg font-semibold tracking-[-0.03em] text-white">{pillar.title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{pillar.text}</p>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="ecosystem" className="space-y-5 pt-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Ecosystem</p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Vibed Media is bigger than one tool
            </h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            {ecosystem.map((item) => (
              <Card
                key={item.title}
                className="rounded-[1.7rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.016))] p-6 backdrop-blur-md"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/70">{item.title}</p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="channel" className="grid gap-6 pt-4 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="rounded-[1.9rem] border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-emerald-200">
                <RadioTower className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Channel</p>
                <p className="mt-1 text-xl font-semibold text-white">@vibed.media</p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              Follow for viral tech, engineering visuals, machines, gadgets, and future-facing clips packaged with
              stronger taste and cleaner storytelling.
            </p>
          </Card>
          <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Social presence</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">Built to feel native to the feed</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              The content is designed for internet attention: visual payoff, future tension, clean hooks, and premium
              pacing that makes even technical subjects feel instantly watchable.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link href="https://www.instagram.com/vibed.media/" target="_blank" rel="noreferrer">
                  Follow @vibed.media
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="rounded-full px-6">
                <Link href="https://app.vibed.media">Try Vibed Hunter</Link>
              </Button>
            </div>
          </Card>
        </section>

        <section className="pb-10 pt-6">
          <Card className="rounded-[2rem] border-emerald-300/14 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-10">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">Final CTA</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Follow the brand. Explore the ecosystem. Open the tool when you are ready.
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Vibed Media is the brand. Vibed Hunter is one part of the system. Together they shape a more intentional
              future for creator publishing.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link href="https://www.instagram.com/vibed.media/" target="_blank" rel="noreferrer">
                  Follow the page
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 rounded-full px-6 text-base">
                <Link href="#ecosystem">Explore the ecosystem</Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 rounded-full px-6 text-base">
                <Link href="https://app.vibed.media">Try the tool</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
