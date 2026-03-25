import Link from "next/link";
import { Bookmark, Compass, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Today", icon: Compass },
  { href: "/recs", label: "Topics", icon: Sparkles },
  { href: "/publish", label: "Final Post", icon: Sparkles },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/learn", label: "Learn", icon: Sparkles }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="rounded-[2rem] border border-border bg-card/95 p-5 shadow-glow card-raise">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/20 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Vibed Media</p>
              <h1 className="text-xl font-semibold">Vibed Hunter</h1>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href as any} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground")}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-6 pb-8">{children}</main>
      </div>
    </div>
  );
}
