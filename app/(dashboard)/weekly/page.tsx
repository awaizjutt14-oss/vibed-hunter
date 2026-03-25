import { Badge } from "@/components/ui/badge";
import { getDailyPlanner } from "@/lib/vibed-hunter-data";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WeeklyPlannerPage() {
  const daily = getDailyPlanner();
  const slots = ["12:30 PM", "6:30 PM", "9:15 PM"] as const;
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Weekly Command Center</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Plan all 21 slots for the week in one place.</h1>
        <p className="mt-3 text-muted-foreground">Current picks autofill each day; adjust as you go.</p>
      </section>
      <div className="grid gap-4">
        {days.map((day) => (
          <Card key={day}>
            <CardTitle className="px-4 pt-4">{day}</CardTitle>
            <CardDescription className="px-4">12:30 curiosity · 6:30 engineering · 9:15 mastery</CardDescription>
            <div className="mt-4 grid gap-3 px-4 pb-4 md:grid-cols-3">
              {slots.map((slot, i) => {
                const pick = daily[i]?.chosen;
                return (
                  <div key={slot} className="rounded-2xl border border-border/60 bg-muted/40 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">{slot}</p>
                    <p className="mt-2 text-sm font-semibold">{pick?.bestHook ?? "Add post"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{pick?.summary ?? ""}</p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
