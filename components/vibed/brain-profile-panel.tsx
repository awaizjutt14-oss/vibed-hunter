"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { vibedBrain } from "@/lib/vibed-hunter-data";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function BrainProfilePanel() {
  const tp = vibedBrain.tasteProfile;
  const dna = vibedBrain.captionDNA;
  const preferred = [...tp.preferredTraits];
  const disliked = [...tp.dislikedTraits];
  const [profiles, setProfiles] = useState<Array<{ id: string; name: string; versionLabel?: string; isActive: boolean }>>([]);

  useEffect(() => {
    fetch("/api/brain/profile/list")
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles ?? []))
      .catch(() => {});
  }, []);

  const switchProfile = async (id: string) => {
    await fetch("/api/brain/profile/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const refreshed = await fetch("/api/brain/profile/list").then((res) => res.json()).catch(() => null);
    if (refreshed?.profiles) setProfiles(refreshed.profiles);
  };
  return (
    <Card className="card-raise">
      <CardTitle>Vibed Brain: Taste Profile</CardTitle>
      <CardDescription className="mt-2">All recommendations pass through this profile before you see them.</CardDescription>
      <div className="mt-3 flex flex-wrap gap-2">
        {profiles.map((p) => (
          <Button key={p.id} size="sm" variant={p.isActive ? "default" : "secondary"} onClick={() => switchProfile(p.id)}>
            {p.versionLabel || p.name}
          </Button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ProfileBlock title="Preferred traits" items={preferred} />
        <ProfileBlock title="Disliked traits" items={disliked} tone="warn" />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="First-frame importance" value={tp.firstFrameImportance} />
        <Metric label="Hook importance" value={tp.hookImportance} />
        <Metric label="US audience bias" value={tp.usAudienceBias} />
        <Metric label="Replay preference" value={tp.replayPreference} />
        <Metric label="Repost safety threshold" value={tp.repostSafetyThreshold / 100} format="percent" />
        <Metric label="Premium preference" value={tp.premiumFeel} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ProfileBlock title="Rejection rules" items={vibedBrain.rejectionRules} tone="warn" />
        <ProfileBlock
          title="Hook preferences"
          items={[
            `Approved: ${vibedBrain.hookPreferences.approvedStyles.join(", ")}`,
            `Banned: ${vibedBrain.hookPreferences.bannedStyles.join(", ")}`,
            `Ideal length: ${vibedBrain.hookPreferences.idealLength[0]}–${vibedBrain.hookPreferences.idealLength[1]} words`,
            `Avoid: ${vibedBrain.hookPreferences.avoidPhrases.join(", ")}`
          ]}
        />
      </div>
      <div className="mt-4 rounded-2xl border border-border/60 bg-muted/40 p-4">
        <p className="text-sm font-semibold">Caption DNA</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {dna.ctaStyle}. {dna.paragraphs}. Tone: {dna.tone}. {dna.premium ? "Premium feel on." : "Premium feel off."}{" "}
          {dna.minimalHashtags ? "Minimal hashtags." : ""} Always pinned comment. Avoid robotic/bloated wording. Versions: {dna.versions}.
        </p>
      </div>
    </Card>
  );
}

function ProfileBlock({ title, items, tone = "neutral" }: { title: string; items: string[]; tone?: "neutral" | "warn" }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <Badge key={item} className={tone === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-200" : ""}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value, format = "score" }: { label: string; value: number; format?: "score" | "percent" }) {
  const display = format === "percent" ? `${Math.round(value * 100)}%` : Math.round(value * 100) / 100;
  return (
    <div className="rounded-2xl bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{display}</p>
    </div>
  );
}
