import { Badge } from "@/components/ui/badge";
import { getDailyPlanner, getPack } from "@/lib/vibed-hunter-data";
import { PostPackPanel } from "@/components/vibed/post-pack-panel";

export default function PublishPage() {
  const planner = getDailyPlanner();
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Final Publish</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Copy-ready output for today’s slots.</h1>
        <p className="mt-3 text-muted-foreground">Hook, caption, pinned comment, hashtags, cover, CTA, first-frame notes — all in one screen.</p>
      </section>
      <div className="space-y-6">
        {planner.map((slot) => {
          const pack = getPack(slot.chosen.id);
          if (!pack) return null;
          return (
            <div key={slot.slot} className="space-y-2">
              <h2 className="text-xl font-semibold">{slot.slot} · {slot.pillar}</h2>
              <PostPackPanel pack={pack} firstFrameIdea={slot.chosen.firstFrameIdea} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
