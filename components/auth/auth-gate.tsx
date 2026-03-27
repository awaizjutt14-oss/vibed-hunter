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

  async function handleGoogle() {
    setLoading("google");
    setError(null);
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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError("Email login failed. Check your credentials and try again.");
      setLoading(null);
      return;
    }

    window.location.href = "/";
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[8%] h-[22rem] w-[22rem] rounded-full bg-emerald-400/16 blur-[120px]" />
        <div className="absolute right-[8%] top-[18%] h-[20rem] w-[20rem] rounded-full bg-cyan-300/10 blur-[130px]" />
        <div className="absolute bottom-[4%] left-[22%] h-[24rem] w-[24rem] rounded-full bg-blue-500/10 blur-[150px]" />
      </div>

      <Card className="relative w-full max-w-5xl overflow-hidden rounded-[2.25rem] p-0">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] p-8 sm:p-10 lg:border-b-0 lg:border-r">
            <span className="vibed-badge text-emerald-200/75">
              <Sparkles className="h-3.5 w-3.5" />
              Vibed Media
            </span>
            <div className="mt-6 max-w-xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                Creator intelligence, locked to your account.
              </h1>
              <p className="text-sm leading-7 text-slate-300 sm:text-base">
                Sign in to access Vibed Hunter, keep your generation history, and unlock a persistent free trial that
                follows your account across refreshes and devices.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-300">
              <div className="vibed-panel rounded-[1.25rem] px-4 py-3">
                Vibed-style hooks, captions, and post packages
              </div>
              <div className="vibed-panel rounded-[1.25rem] px-4 py-3">
                Trial limits enforced server-side from your saved history
              </div>
              <div className="vibed-panel rounded-[1.25rem] px-4 py-3">
                Personalized memory from your previous generations
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/[0.04]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Secure Access</p>
                <p className="mt-1 text-lg font-semibold text-white">Sign in to continue</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Button onClick={handleGoogle} disabled={loading !== null} className="h-12 w-full rounded-[1.2rem] text-base">
                {loading === "google" ? "Connecting..." : "Continue with Google"}
              </Button>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                <span className="h-px flex-1 bg-white/10" />
                Optional email login
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
                  {loading === "email" ? "Signing in..." : "Continue with email"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>

              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

