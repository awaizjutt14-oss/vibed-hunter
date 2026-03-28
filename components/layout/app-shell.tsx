import Link from "next/link";
import { Bookmark, Settings, Sparkles } from "lucide-react";
import { auth, signOut } from "@/auth";
import { AuthGate } from "@/components/auth/auth-gate";
import { AccessRestricted } from "@/components/auth/access-restricted";
import { SyncUserOnLogin } from "@/components/auth/sync-user-on-login";
import { Button } from "@/components/ui/button";
import { isAllowedEmail } from "@/lib/access-control";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings }
];

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth().catch(() => null);

  if (!session?.user?.email) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <AuthGate />
      </div>
    );
  }

  if (!isAllowedEmail(session.user.email)) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
        <AccessRestricted />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <SyncUserOnLogin />
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-emerald-400/12 blur-[110px]" />
        <div className="absolute right-[-10%] top-[12%] h-[24rem] w-[24rem] rounded-full bg-cyan-300/8 blur-[120px]" />
        <div className="absolute bottom-[-14%] left-[16%] h-[30rem] w-[30rem] rounded-full bg-blue-500/8 blur-[140px]" />
      </div>
      <div className="relative mx-auto w-full max-w-[90rem] px-4 py-4 sm:px-6 sm:py-6">
        <header className="vibed-glass vibed-glow-ring sticky top-4 z-20 mb-12 rounded-[2rem] px-5 py-4 sm:px-6">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="group flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-emerald-300/15 bg-[linear-gradient(180deg,rgba(73,255,182,0.14),rgba(73,255,182,0.04))] text-primary shadow-[0_18px_40px_rgba(73,255,182,0.14)] transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="absolute inset-[1px] rounded-[1.3rem] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_40%)]" />
                <Sparkles className="relative h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.34em] text-emerald-200/60">Vibed Media</p>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-[-0.03em] sm:text-2xl">Vibed Hunter</h1>
                  <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:inline-flex">
                    Creator Intelligence
                  </span>
                </div>
              </div>
            </Link>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href as any}
                      className={cn(
                        "flex items-center gap-2 rounded-full border border-transparent px-4 py-2.5 text-sm text-muted-foreground transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              {session?.user?.email ? (
                <div className="flex items-center gap-3 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-2 py-2 sm:pl-4">
                  <div className="hidden items-center gap-3 sm:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold uppercase text-foreground/80">
                      {(session.user.name || session.user.email || "V").slice(0, 1)}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-medium text-foreground/90">{session.user.name || "Creator"}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <Button type="submit" variant="secondary" className="rounded-full">
                      Logout
                    </Button>
                  </form>
                </div>
              ) : (
                <Button asChild variant="secondary" className="rounded-full">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[78rem] space-y-10 pb-12">{children}</main>
      </div>
    </div>
  );
}
