import { Badge } from "@/components/ui/badge";
import { OpportunityFeedClient } from "@/components/vibed/opportunity-feed-client";
import { getOpportunities } from "@/lib/vibed-hunter-data";

export default function OpportunityFeedPage() {
  const items = getOpportunities();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Opportunity Feed</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Every candidate content opportunity in one scrollable feed.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Filter for US-first, high repost safety, top-scoring only, or rewrite-for-Vibed mode when you need a tighter list.
        </p>
      </section>
      <OpportunityFeedClient items={items} />
    </div>
  );
}
