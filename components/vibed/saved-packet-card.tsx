import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Opportunity } from "@/lib/vibed-hunter-data";

export function SavedPacketCard({ item }: { item: Opportunity }) {
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{item.status}</Badge>
        <Badge>{item.suggestedSlot}</Badge>
        <Badge>{item.bestPlatform}</Badge>
      </div>
      <CardTitle className="mt-4">{item.bestHook}</CardTitle>
      <CardDescription className="mt-2">{item.title}</CardDescription>
      <div className="mt-4 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
        <p>Source: {item.sourceName}</p>
        <p className="mt-2">Best hook: {item.bestHook}</p>
        <p className="mt-2">Slot fit: {item.suggestedSlot}</p>
        <p className="mt-2">Viral score: {item.scores.viralPotential}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild><Link href={`/packets/${item.id}`}>Open pack</Link></Button>
        <Button variant="secondary">Mark as posted</Button>
        <Button variant="ghost">Archive</Button>
      </div>
    </Card>
  );
}
