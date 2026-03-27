import Link from "next/link";
import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Hook-first output",
    text: "Start from angles built to stop the scroll, not generic content filler."
  },
  {
    title: "Brand memory",
    text: "Vibed Hunter learns the strongest patterns from your past generations."
  },
  {
    title: "Monthly access",
    text: "Free usage follows your account, with clean upgrade paths when you grow."
  },
  {
    title: "Built for creators and media pages",
    text: "Designed for operators shipping fast across reels, shorts, and modern page formats."
  }
] as const;

const steps = [
  "Drop in your rough idea",
  "Generate hooks and captions",
  "Refine the strongest angle",
  "Publish faster"
] as const;

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(73,255,182,0.15),transparent_24%),radial-gradient(circle_at_84%_12%,rgba(124,242,255,0.09),transparent_20%),linear-gradient(180deg,#04070b_0%,#070b11_42%,#04070a_100%)]" />
        <div className="absolute left-[6%] top-[6%] h-[30rem] w-[30rem] rounded-full bg-emerald-400/12 blur-[150px]" />
        <div className="absolute right-[-4%] top-[10%] h-[24rem] w-[24rem] rounded-full bg-cyan-300/8 blur-[140px]" />
        <div className="absolute bottom-[-12%] left-[18%] h-[28rem] w-[28rem] rounded-full bg-emerald-500/8 blur-[170px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[86rem] flex-col gap-12 px-4 py-6 sm:px-6 lg:px-8">
        <header className="vibed-glass vibed-glow-ring sticky top-4 z-20 rounded-[2rem] px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.35rem] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(73,255,182,0.14),rgba(73,255,182,0.05))] text-primary shadow-[0_18px_40px_rgba(73,255,182,0.14)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.34em] text-emerald-200/60">Vibed Media</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">Vibed Hunter</h1>
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex">
                    Creator OS
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="rounded-full">
                <Link href="https://app.vibed.media">Login</Link>
              </Button>
              <Button asChild className="rounded-full px-6">
                <Link href="https://app.vibed.media">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-8 pt-6 sm:pt-10">
            <span className="vibed-badge border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Creator intelligence for modern media pages
            </span>
            <div className="max-w-3xl space-y-5">
              <h2 className="text-[3rem] font-semibold tracking-[-0.08em] text-white sm:text-[4.8rem] sm:leading-[0.95]">
                Build viral content like a machine.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Vibed Hunter turns rough ideas into hooks, captions, and post-ready angles built for modern media
                pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full px-6 text-base shadow-[0_16px_38px_rgba(73,255,182,0.18)]">
                <Link href="https://app.vibed.media">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 rounded-full px-6 text-base">
                <Link href="#how-it-works">
                  <Play className="mr-2 h-4 w-4" />
                  See How It Works
                </Link>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden rounded-[2rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-7">
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200/75">Inside Vibed</p>
                <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">An operating system for faster publishing</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Structured for creators who need stronger hooks, cleaner captions, and better angles without losing taste.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Output</p>
                  <p className="mt-2 text-lg font-semibold text-white">Hooks, captions, CTA, story text</p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Built for</p>
                  <p className="mt-2 text-lg font-semibold text-white">Media pages, operators, fast-moving creators</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section id="features" className="space-y-5 pt-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Features</p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              The premium workflow behind every post package
            </h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="rounded-[1.6rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/18"
              >
                <p className="text-lg font-semibold tracking-[-0.03em] text-white">{feature.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-400">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="grid gap-6 pt-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="rounded-[1.9rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.042),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">How it works</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">From rough thought to post-ready angle</h3>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Built for the fastest loop in content: idea in, strongest angle out, publish without overthinking the draft.
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step, index) => (
              <Card
                key={step}
                className="rounded-[1.6rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.016))] p-6 backdrop-blur-md"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200/70">
                  Step {index + 1}
                </p>
                <p className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{step}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="pricing" className="space-y-5 pt-6">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/70">Pricing preview</p>
            <h3 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Start free, upgrade when the workflow becomes essential
            </h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-[1.75rem] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Free</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">3 generations/month</p>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Premium hook and caption generation
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Memory-informed outputs
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Account-based monthly access
                </li>
              </ul>
            </Card>
            <Card className="rounded-[1.75rem] border-emerald-300/14 bg-[linear-gradient(180deg,rgba(73,255,182,0.08),rgba(255,255,255,0.016))] p-7 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/75">Pro</p>
              <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white">Coming soon</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Monetization coming soon. Expect deeper iteration, more monthly output, and a smoother creator operating workflow.
              </p>
            </Card>
          </div>
        </section>

        <section className="pb-10 pt-6">
          <Card className="rounded-[2rem] border-emerald-300/14 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.3)] backdrop-blur-md sm:p-10">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">Final CTA</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
              Turn every rough idea into a sharper publishing machine
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Vibed Hunter is built for creators and media operators who want faster output without sacrificing taste.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link href="https://app.vibed.media">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="h-12 rounded-full px-6 text-base">
                <Link href="#features">View Demo</Link>
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}
