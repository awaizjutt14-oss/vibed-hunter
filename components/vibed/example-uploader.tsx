"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const tagOptions = ["love this", "good fit", "maybe", "hate this", "my style", "not my style", "high performer", "low performer"] as const;

export function ExampleUploader({ existing }: { existing: Array<{ id: string; title: string; tags: string[] }> }) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  async function save() {
    await fetch("/api/brain/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "other", text: title, quality: tags.includes("hate this") || tags.includes("not my style") ? "bad" : "good", notes: tags })
    }).catch(() => {});
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
    setTitle("");
    setTags([]);
  }

  return (
    <Card className="p-5 space-y-3">
      <p className="text-sm font-semibold">Feed examples (screenshots, hooks, captions)</p>
      <Textarea placeholder="Paste a description or link to the example" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        {tagOptions.map((tag) => {
          const active = tags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => setTags((prev) => active ? prev.filter((t) => t !== tag) : [...prev, tag])}
              className={`rounded-full px-3 py-1 text-sm ${active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <Button onClick={save} disabled={!title.trim()}>Save example</Button>
      {saved ? <p className="text-xs text-primary">Saved.</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {existing.slice(0, 6).map((ex) => <Badge key={ex.id}>{ex.title}</Badge>)}
      </div>
    </Card>
  );
}
