import { LockKeyhole, ShieldAlert, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AccessRestricted() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_24%,rgba(73,255,182,0.1),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(124,242,255,0.08),transparent_22%),linear-gradient(180deg,#05070a_0%,#070b10_44%,#040608_100%)]" />
        <div className="absolute left-[8%] top-[8%] h-[26rem] w-[26rem] rounded-full bg-emerald-400/12 blur-[140px]" />
        <div className="absolute right-[8%] top-[18%] h-[20rem] w-[20rem] rounded-full bg-cyan-300/8 blur-[135px]" />
      </div>

      <Card className="relative w-full max-w-3xl overflow-hidden rounded-[2.3rem] border-white/10 bg-[linear-gradient(180deg,rgba(10,14,20,0.9),rgba(6,9,14,0.95))] p-0 shadow-[0_34px_120px_rgba(0,0,0,0.5)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(73,255,182,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent)] p-8 sm:p-10 lg:border-b-0 lg:border-r">
            <span className="vibed-badge border-emerald-300/18 bg-emerald-300/[0.08] text-emerald-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Private Workspace
            </span>
            <div className="mt-7 max-w-xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl">
                This workspace is currently private.
              </h1>
              <p className="text-sm leading-7 text-slate-300 sm:text-base">
                Access is limited to approved accounts.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm text-slate-300">
              <div className="vibed-panel rounded-[1.25rem] px-4 py-3">Brand site stays public on vibed.media</div>
              <div className="vibed-panel rounded-[1.25rem] px-4 py-3">Product workspace remains restricted on app.vibed.media</div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-white/10 bg-white/[0.04]">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-200/70">Access Status</p>
                <p className="mt-1 text-lg font-semibold text-white">Restricted access</p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.015))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/10 bg-white/[0.04]">
                  <LockKeyhole className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm leading-7 text-slate-400">
                  Sign in with an approved email account to access the private Vibed Hunter workspace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
