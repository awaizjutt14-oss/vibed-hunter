import Link from "next/link";
import { Bookmark, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        <header className="sticky top-4 z-20 mb-8 rounded-[1.75rem] border border-white/10 bg-card/85 px-4 py-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Vibed Media</p>
                <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Vibed Hunter</h1>
              </div>
            </Link>
            <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border border-transparent px-4 py-2.5 text-sm text-muted-foreground transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl space-y-8 pb-10">{children}</main>
      </div>
    </div>
  );
}
