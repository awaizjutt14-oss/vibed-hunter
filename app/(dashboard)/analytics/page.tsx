import { Badge } from "@/components/ui/badge";
import { AnalyticsReview } from "@/components/vibed/analytics-review";
import { getAnalyticsData } from "@/lib/vibed-hunter-data";

export default function AnalyticsPage() {
  const data = getAnalyticsData();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Analytics / Performance Review</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Understand what Vibed should repeat and what to avoid.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Track slot, hook, topic, format, and retention patterns so the recommendation engine keeps improving with real brand feedback.
        </p>
      </section>
      <AnalyticsReview data={data} />
    </div>
  );
}
