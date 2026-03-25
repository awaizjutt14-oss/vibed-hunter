import { cn } from "@/lib/utils/cn";

export function ScoreBar({ label, value, tone = "emerald" }: { label: string; value: number; tone?: "emerald" | "amber" | "sky" | "rose" }) {
  const toneClass = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    sky: "bg-sky-400",
    rose: "bg-rose-400"
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div className={cn("h-2 rounded-full", toneClass)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
