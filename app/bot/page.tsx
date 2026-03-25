"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/vibed/copy-button";

type Rec = {
  slot: string;
  timeslot: string;
  category: string;
  hook: string;
  what_to_show: string;
  why_it_works: string;
  caption: string;
  pinned_comment: string;
  hashtags: string[];
  videoType: string;
  bestTopic: string;
  angle: string;
  hookDirection: string;
  backupTopics: string[];
  avoid: string;
  videoHint: string;
  hookStyle: string;
};

type CaptionPack = {
  hook: string;
  caption: string;
  pinned_comment: string;
  hashtags: string[];
};

export default function BotPage() {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [notToPost, setNotToPost] = useState<string[]>([]);
  const [brainNotes, setBrainNotes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<Rec | null>(null);
  const [pack, setPack] = useState<CaptionPack | null>(null);
  const [packLoading, setPackLoading] = useState(false);
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [tone, setTone] = useState("viral");
  const [audience, setAudience] = useState("general audience");

  const nicheChips = ["AI", "fitness", "cars", "business", "fashion", "tech", "finance", "travel"];

  async function getPicks() {
    if (!niche.trim()) {
      setError("Enter your niche to get better ideas");
      setRecs([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        niche,
        platform,
        tone,
        audience
      });
      const res = await fetch(`/api/dynamic-picks?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch topics");
      const json = await res.json();
      setRecs(json.recs ?? []);
      setNotToPost(json.notToPost ?? []);
      setBrainNotes(json.brainNotes ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-4 px-4 py-8 md:py-12">
      <Card className="p-6">
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Vibed Bot</p>
            <h1 className="text-2xl font-semibold">What should I post in my niche today?</h1>
            <p className="text-sm text-muted-foreground">Get 3 niche-specific ideas for your audience</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">What&apos;s your niche?</label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. fitness, AI tools, luxury cars, fashion, cooking, gaming"
                className="h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm text-foreground outline-none ring-0 transition focus:border-primary"
              />
              <div className="flex flex-wrap gap-2">
                {nicheChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setNiche(chip)}
                    className="rounded-full border border-white/10 bg-card px-3 py-1.5 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm text-foreground"
              >
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube Shorts</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm text-foreground"
              >
                <option>viral</option>
                <option>educational</option>
                <option>storytelling</option>
                <option>authority</option>
                <option>funny</option>
                <option>luxury</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-background px-4 text-sm text-foreground"
              >
                <option>general audience</option>
                <option>beginners</option>
                <option>creators</option>
                <option>entrepreneurs</option>
                <option>students</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={getPicks} disabled={loading}>
              {loading ? "Thinking..." : "Get ideas for my niche"}
            </Button>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>

      {!niche.trim() ? (
        <Card className="p-6 text-center">
          <p className="text-base font-medium">Enter your niche to get better ideas</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {recs.map((rec) => (
          <Card key={rec.slot + rec.hook} className="h-full border-border/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.16em] text-primary">{rec.timeslot}</p>
              <Button size="sm" variant="ghost" onClick={() => sendFeedback(rec, "save")}>Save</Button>
            </div>
            <h2 className="text-lg font-semibold leading-tight">{rec.hook}</h2>
            <p className="text-sm text-muted-foreground">{rec.why_it_works}</p>
            <p className="text-xs text-muted-foreground">{rec.what_to_show}</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => openDetail(rec)}>
                Use this
              </Button>
              <div
                onClick={() => sendFeedback(rec, "copy_hook")}
                className="contents"
              >
                <CopyButton label="Copy hook" value={rec.hook} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {notToPost.length ? (
        <Card className="p-4">
          <p className="text-sm font-semibold">What not to post today</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {notToPost.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {brainNotes.length ? (
        <Card className="p-4">
          <p className="text-sm font-semibold">Vibed Brain learning</p>
          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
            {brainNotes.map((note) => (
              <p key={note}>• {note}</p>
            ))}
          </div>
        </Card>
      ) : null}

      {active ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 md:items-center" onClick={() => closeDetail()}>
          <div className="w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.14em] text-primary">{active.timeslot}</p>
              <Button size="sm" variant="ghost" onClick={() => closeDetail()}>Close</Button>
            </div>
            <h3 className="mt-2 text-xl font-semibold leading-tight">{active.hook}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{active.why_it_works}</p>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              {packLoading ? <p>Loading pack...</p> : pack ? (
                <>
                  <Block title="Category" text={active.category} />
                  <Block title="What to show" text={active.what_to_show} />
                  <Block title="Caption" text={pack.caption} />
                  <Block title="Pinned comment" text={pack.pinned_comment} />
                  <Block title="Hashtags" text={pack.hashtags.join(" ")} />
                  <Block title="Safety note" text={active.avoid} />
                </>
              ) : (
                <p>Tap “Use this” to load pack.</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyButton label="Copy hook" value={active.hook} />
              {pack ? <CopyButton label="Copy caption" value={pack.caption} /> : null}
              <Button size="sm" variant="ghost" onClick={() => sendFeedback(active, "more")}>More like this</Button>
              <Button size="sm" variant="ghost" onClick={() => sendFeedback(active, "less")}>Less like this</Button>
              <Button size="sm" variant="ghost" onClick={() => sendFeedback(active, "good_hook")}>Good hook</Button>
              <Button size="sm" variant="ghost" onClick={() => sendFeedback(active, "weak_hook")}>Weak hook</Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );

  async function openDetail(rec: Rec) {
    await sendFeedback(rec, "use");
    setActive(rec);
    setPackLoading(true);
    setPack({
      hook: rec.hook,
      caption: rec.caption,
      pinned_comment: rec.pinned_comment,
      hashtags: rec.hashtags
    });
    setPackLoading(false);
  }

  function closeDetail() {
    setActive(null);
    setPack(null);
  }

  async function sendFeedback(rec: Rec, signal: "use" | "save" | "copy_hook" | "more" | "less" | "good_hook" | "weak_hook") {
    try {
      await fetch("/api/brain/feedback-lite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: rec.slot,
          category: rec.category,
          hookStyle: rec.hookStyle,
          signal
        })
      });
    } catch {
      // fail soft; this is a lightweight learning layer
    }
  }
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-foreground/80">{title}</p>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
