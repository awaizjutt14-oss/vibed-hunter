"use client";

import { useState } from "react";
import { ArrowRight, LockKeyhole, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AuthGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGoogle() {
    setLoading("google");
    setError(null);
    setMessage(null);
    try {
      await signIn("google", { redirectTo: "/" });
    } catch {
      setError("Google sign-in is not available right now.");
      setLoading(null);
    }
  }

  async function handleEmailLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading("email");
    setError(null);
    setMessage(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError(result.error);
      setLoading(null);
      return;
    }

    setMessage("Success. Opening your workspace...");
    window.setTimeout(() => {
      window.location.href = "/";
    }, 350);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.08),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(124,242,255,0.08),transparent_24%),linear-gradient(180deg,#05070a_0%,#070b10_44%,#040608_100%)]" />
        <div className="absolute left-[7%] top-[8%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/14 blur-[140px]" />
        <div className="absolute left-[18%] top-[22%] h-[18rem] w-[18rem] rounded-full bg-lime-300/8 blur-[110px]" />
        <div className="absolute right-[8%] top-[14%] h-[22rem] w-[22rem] rounded-full bg-cyan-300/8 blur-[140px]" />
        <div className="absolute bottom-[0%] left-[28%] h-[26rem] w-[26rem] rounded-full bg-emerald-500/8 blur-[170px]" />
      </div>

      <Card className="relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,14,20,0.88),rgba(6,9,14,0.94))] p-0 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(73,255,182,0.11),transparent_30%)]" />
            <span className="vibed-badge relative border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/90">
              <Sparkles className="h-3.5 w-3.5" />
              VIBED MEDIA CREATOR OS
            </span>
            <div className="relative mt-8 max-w-xl space-y-6">
              <h1 className="text-4xl font-semibold tracking-[-0.065em] text-white sm:text-6xl sm:leading-[1.02]">
                Build viral content like a machine.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-[1.02rem]">
                Vibed Hunter turns rough ideas into hooks, captions, and post-ready angles built for modern media
                pages.
              </p>
            </div>
            <div className="relative mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[-0.02em] text-white">Hook-first output</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Built to stop scrolling.</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[-0.02em] text-white">Brand memory</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Learns your style over time.</p>
              </div>
              <div className="rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur">
                <p className="text-sm font-semibold tracking-[-0.02em] text-white">Monthly access</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">Your free usage follows your account.</p>
              </div>
            </div>
            <p className="relative mt-10 text-sm leading-7 text-slate-500">
              Made for pages built on consistency, speed, and taste.
            </p>
          </div>

          <div className="bg-[linear-gradient(180deg,rgba(8,11,16,0.94),rgba(5,8,12,0.98))] p-8 sm:p-10 lg:p-12">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/12 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/70">PRIVATE ACCESS</p>
                <p className="mt-1 text-lg font-semibold text-white">Enter your creator workspace</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur sm:p-7">
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[2.15rem]">
                Enter your creator workspace
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
                Sign in to access your saved history, free monthly generations, and creator memory.
              </p>

              <div className="mt-8 space-y-4">
              <Button onClick={handleGoogle} disabled={loading !== null} className="h-12 w-full rounded-[1.2rem] text-base">
                {loading === "google" ? "Connecting..." : "Enter with Google"}
              </Button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                Email access
                <span className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  className="h-12 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-emerald-300/25 focus:shadow-[0_0_0_4px_rgba(73,255,182,0.08)]"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className="h-12 w-full rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(9,13,19,0.92),rgba(7,10,15,0.88))] px-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-emerald-300/25 focus:shadow-[0_0_0_4px_rgba(73,255,182,0.08)]"
                />
                <Button type="submit" variant="secondary" disabled={loading !== null} className="h-12 w-full rounded-[1.2rem] text-base">
                  {loading === "email" ? "Checking your account..." : "Unlock with email"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              {!error && message ? <p className="text-sm text-emerald-300">{message}</p> : null}
              <p className="text-xs leading-6 text-slate-500">
                New email? We&apos;ll create your account automatically. Existing email? We&apos;ll sign you in.
              </p>
              <p className="border-t border-white/8 pt-4 text-xs leading-6 text-slate-500">
                No reset tricks. Your account keeps your progress.
              </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
