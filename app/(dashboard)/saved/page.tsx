import { Badge } from "@/components/ui/badge";
import { SavedPacketCard } from "@/components/vibed/saved-packet-card";
import { getSavedLibrary } from "@/lib/vibed-hunter-data";

export default function SavedLibraryPage() {
  const items = getSavedLibrary();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-border bg-card p-8">
        <Badge>Saved Library</Badge>
        <h1 className="mt-4 text-4xl font-semibold">Reusable content packets for future posting windows.</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Every saved item stores its best hook, slot fit, score profile, and draft state so the team can recycle good ideas without rebuilding them from scratch.
        </p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <SavedPacketCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
