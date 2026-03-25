import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/vibed/copy-button";
import { getOpportunity } from "@/lib/vibed-hunter-data";

export default async function TopicFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getOpportunity(id);
  if (!item) return notFound();

  const copyFields = [
    ["Final hook", item.bestHook],
    ["Cover text", item.coverHeadline],
    ["Caption", item.caption],
    ["Pinned comment", item.pinnedComment],
    ["Hashtags", item.hashtags.join(" ")]
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{item.suggestedSlot}</Badge>
          <Badge>{item.pillar}</Badge>
          <Badge>{item.bestPlatform}</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-semibold">{item.bestHook}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Chosen because: {item.whyItWins ?? item.reasonChosen}</p>
      </section>

      <Card className="p-5 space-y-4">
        {copyFields.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{label}</p>
              <CopyButton label="Copy" value={value} />
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{value}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <FeedbackButton id={item.id} rating="strong" label="More like this" />
          <FeedbackButton id={item.id} rating="weak" label="Less like this" />
          <FeedbackButton id={item.id} rating="never show again" label="Never show again" />
          <FeedbackButton id={item.id} rating="perfect" label="Exactly Vibed" />
        </div>
      </Card>
    </div>
  );
}

function FeedbackButton({ id, rating, label }: { id: string; rating: "strong" | "weak" | "never show again" | "perfect"; label: string }) {
  async function act() {
    await fetch("/api/brain/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rating, reasons: [label.toLowerCase()] })
    }).catch(() => {});
  }
  return <Button size="sm" variant="ghost" onClick={act}>{label}</Button>;
}
