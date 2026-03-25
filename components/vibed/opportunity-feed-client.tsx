"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/lib/vibed-hunter-data";
import { OpportunityFeedCard } from "@/components/vibed/opportunity-feed-card";

export function OpportunityFeedClient({ items }: { items: Opportunity[] }) {
  const [rewriteForVibed, setRewriteForVibed] = useState(true);
  const [usFirst, setUsFirst] = useState(true);
  const [highSafetyOnly, setHighSafetyOnly] = useState(false);
  const [topScoringOnly, setTopScoringOnly] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (usFirst && item.scores.usRelevance < 80) return false;
      if (highSafetyOnly && item.scores.repostSafety < 85) return false;
      if (topScoringOnly && item.scores.viralPotential < 88) return false;
      return true;
    });
  }, [items, usFirst, highSafetyOnly, topScoringOnly]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button variant={rewriteForVibed ? "default" : "secondary"} onClick={() => setRewriteForVibed((value) => !value)}>Rewrite for Vibed</Button>
        <Button variant={usFirst ? "default" : "secondary"} onClick={() => setUsFirst((value) => !value)}>US-first filter</Button>
        <Button variant={highSafetyOnly ? "default" : "secondary"} onClick={() => setHighSafetyOnly((value) => !value)}>High repost safety only</Button>
        <Button variant={topScoringOnly ? "default" : "secondary"} onClick={() => setTopScoringOnly((value) => !value)}>Only show top-scoring</Button>
      </div>
      <div className="grid gap-4">
        {filtered.map((item) => (
          <OpportunityFeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
