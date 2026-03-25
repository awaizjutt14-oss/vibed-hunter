import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PostPackPanel } from "@/components/vibed/post-pack-panel";
import { HookLab } from "@/components/vibed/hook-lab";
import { getPack } from "@/lib/vibed-hunter-data";

export default async function PacketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pack = getPack(id);
  if (!pack) return notFound();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{pack.bestPlatform}</Badge>
          <Badge>{pack.bestPostingTime}</Badge>
          <Badge>{pack.contentPillar}</Badge>
        </div>
        <h1 className="mt-4 text-4xl font-semibold">{pack.selectedHook}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{pack.whyItShouldPerform}</p>
      </section>
      <HookLab initialHooks={pack.hookOptions} />
      <PostPackPanel pack={pack} />
    </div>
  );
}
