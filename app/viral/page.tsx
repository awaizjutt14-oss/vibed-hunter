"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/vibed/copy-button";

type Result = {
  hook: string;
  caption: string;
  cta?: string;
  pinned_comment: string;
  hashtags: string[];
  note?: string;
};

const contentTypes = ["engineering", "machines", "satisfying processes", "precision work", "AI/tech", "manufacturing"];

export default function ViralPage() {
  const [topic, setTopic] = useState("Machine slicing metal threads thinner than hair");
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("engineering");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, contentType })
      });
      if (!res.ok) {
        const t = await res.json().catch(() => ({}));
        throw new Error(t.error || "Failed to generate");
      }
      const json = (await res.json()) as Result;
      setResult(json);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 md:py-14">
      <Card className="p-6 md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Viral Caption Bot</p>
            <h1 className="text-3xl font-semibold">Create a Vibed-ready post in one tap.</h1>
            <p className="text-sm text-muted-foreground">Hook, caption, CTA, pinned comment, and hashtags—auto-formatted for {platform}.</p>
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm font-medium">Topic / what the clip shows</p>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="Describe the clip in one or two lines"
              className="mt-2"
            />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Platform</p>
              <select
                className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div>
              <p className="text-sm font-medium">Content type</p>
              <select
                className="mt-2 w-full rounded-md border border-border bg-background p-2 text-sm"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                {contentTypes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </Card>

      {result && (
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold">Generated</h2>
            <div className="flex flex-wrap gap-2">
              <CopyButton label="Copy all" value={formatAll(result)} />
            </div>
          </div>
          {result.note ? <p className="text-xs text-muted-foreground">{result.note}</p> : null}
          <Section title="Hook" text={result.hook} />
          <Section title="Caption" text={result.caption} />
          <Section title="CTA" text={result.cta ?? "Follow @vibed.media for more content like this"} />
          <Section title="Pinned comment" text={result.pinned_comment} />
          <Section title="Hashtags" text={result.hashtags.join(" ")} />
        </Card>
      )}
    </main>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <CopyButton label="Copy" value={text} variant="ghost" />
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function formatAll(r: Result) {
  return [
    `Hook: ${r.hook}`,
    "Caption:",
    r.caption,
    `CTA: ${r.cta ?? "Follow @vibed.media for more content like this"}`,
    `Pinned comment: ${r.pinned_comment}`,
    `Hashtags: ${r.hashtags.join(" ")}`
  ].join("\n");
}
