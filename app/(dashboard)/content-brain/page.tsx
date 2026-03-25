"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/vibed/copy-button";

type HuntPost = {
  time: string;
  category: string;
  idea: string;
  hook: string;
  caption: string;
  whyItCouldWork: string;
};

export default function ContentBrainPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<HuntPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function findContent() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hunt", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to find content.");
      }

      const payload = (await response.json()) as { posts?: HuntPost[] };
      setPosts(Array.isArray(payload.posts) ? payload.posts : []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to find content.");
    } finally {
      setLoading(false);
    }
  }

  function usePost(post: HuntPost) {
    const prefill = [post.hook, post.idea, post.caption].join("\n\n");
    router.push(`/remix?prefill=${encodeURIComponent(prefill)}`);
  }

  return (
    <main className="flex flex-col gap-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card via-card to-card/70 px-6 py-8 shadow-[0_24px_100px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-primary/90">Content Brain</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Find your next Vibed-ready post
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Three intentional daily ideas built for curiosity, visual payoff, and replay value.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={findContent}
              disabled={loading}
              className="h-12 rounded-2xl px-6 text-base shadow-[0_12px_32px_rgba(34,197,94,0.22)]"
            >
              {loading ? "Finding..." : "Find Content"}
            </Button>
            <Button
              onClick={findContent}
              disabled={loading}
              variant="secondary"
              className="h-12 rounded-2xl px-6 text-base"
            >
              {loading ? "Loading..." : "Regenerate"}
            </Button>
          </div>
        </div>
      </section>

      {posts.length === 0 ? (
        <Card className="rounded-[1.75rem] border border-white/10 bg-card/85 p-8 text-center shadow-[0_20px_80px_rgba(0,0,0,0.22)] backdrop-blur">
          <p className="text-lg font-semibold tracking-tight text-foreground">Nothing generated yet</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tap Find Content to generate three daily ideas for 12:30 PM, 6:30 PM, and 9:15 PM.
          </p>
          {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
        </Card>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={`${post.time}-${post.hook}`}
              className="rounded-[1.75rem] border border-white/10 bg-card/85 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur sm:p-6"
            >
              <div className="flex h-full flex-col gap-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/90">{post.time}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">
                      {post.category}
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">{post.hook}</h2>
                </div>

                <div className="space-y-4 text-sm leading-6 text-muted-foreground">
                  <Block title="Idea" content={post.idea} />
                  <Block title="Caption" content={post.caption} />
                  <Block title="Why It Could Work" content={post.whyItCouldWork} />
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Button onClick={() => usePost(post)} className="h-11 rounded-2xl px-5 text-base">
                    Use this
                  </Button>
                  <CopyButton label="Copy hook" value={post.hook} variant="secondary" />
                  <CopyButton label="Copy caption" value={post.caption} variant="ghost" />
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}

function Block({ title, content }: { title: string; content: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">{title}</p>
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}
