"use client";

import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type ExampleType = "great-post" | "bad-post" | "hook-good" | "hook-bad" | "caption-good" | "caption-bad";

export function ExamplesTrainer() {
  const [type, setType] = useState<ExampleType>("great-post");
  const [quality, setQuality] = useState<"good" | "bad">("good");
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    const res = await fetch("/api/brain/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, text, quality, notes })
    });
    if (res.ok) {
      setMessage("Saved to Vibed Brain");
      setText("");
      setNotes("");
    } else {
      setMessage("Failed to save");
    }
    setTimeout(() => setMessage(""), 1500);
  }

  return (
    <Card className="card-raise">
      <CardTitle>Train from examples</CardTitle>
      <CardDescription className="mt-2">Add hooks, captions, or posts you love (or dislike) to sharpen the brain.</CardDescription>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ExampleType)}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="great-post">Great Vibed post</option>
          <option value="bad-post">Bad-fit post</option>
          <option value="hook-good">Hook I like</option>
          <option value="hook-bad">Hook I dislike</option>
          <option value="caption-good">Caption in my tone</option>
          <option value="caption-bad">Caption too robotic</option>
        </select>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value as "good" | "bad")}
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="good">Good</option>
          <option value="bad">Bad</option>
        </select>
        <Button onClick={submit}>Save example</Button>
      </div>
      <div className="mt-3 grid gap-3">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste hook/caption/post text here" />
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes (why good/bad)" />
      </div>
      {message ? <p className="mt-2 text-sm text-primary">{message}</p> : null}
    </Card>
  );
}
