import { Badge } from "@/components/ui/badge";
import { PostPackPanel } from "@/components/vibed/post-pack-panel";
import { getDailyPlanner, getPack } from "@/lib/vibed-hunter-data";

export default function PostPacksPage() {
  const featured = getPack(getDailyPlanner()[0].chosen.id);
  if (!featured) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Post Pack Generator</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Generate the full Vibed post pack in one panel.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Hooks, cover text, caption, pinned comment, hashtags, CTA, editing notes, and safety notes all live in the same creator-facing workflow.
        </p>
      </section>
      <PostPackPanel pack={featured} />
    </div>
  );
}
