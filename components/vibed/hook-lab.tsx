"use client";

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const templates = [
  "This looks fake but it is real",
  "Wait, how is this possible",
  "This should not work, but it does",
  "Nobody talks about this part",
  "At first glance this makes no sense",
  "This visual should not be real"
];

export function HookLab({ initialHooks }: { initialHooks: string[] }) {
  const [pool, setPool] = useState(initialHooks);
  const [left, setLeft] = useState(initialHooks[0] ?? "");
  const [right, setRight] = useState(initialHooks[1] ?? initialHooks[0] ?? "");

  const uniquePool = useMemo(() => [...new Set(pool)], [pool]);

  function regenerate() {
    const generated = templates
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    setPool([...initialHooks, ...generated]);
    setLeft(generated[0]);
    setRight(generated[1]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Generate 5 new hooks</CardTitle>
            <CardDescription className="mt-2">Mock rewrite behavior for quickly testing alternative Vibed hook angles.</CardDescription>
          </div>
          <Button onClick={regenerate}>
            <Shuffle className="mr-2 h-4 w-4" />
            Generate 5 new hooks
          </Button>
        </div>
        <div className="mt-4 grid gap-2">
          {uniquePool.slice(0, 8).map((hook) => (
            <button
              key={hook}
              type="button"
              className="rounded-2xl border border-border px-4 py-3 text-left text-sm text-foreground hover:bg-muted"
              onClick={() => setLeft(hook)}
            >
              {hook}
            </button>
          ))}
        </div>
      </Card>
      <Card>
        <CardTitle>Compare 2 hooks</CardTitle>
        <CardDescription className="mt-2">Use this mini-tool to choose a cleaner opener before building the full post pack.</CardDescription>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Hook A</p>
            <p className="mt-2 text-lg font-semibold">{left}</p>
          </div>
          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Hook B</p>
            <p className="mt-2 text-lg font-semibold">{right}</p>
          </div>
          <div className="flex gap-2">
            {uniquePool.slice(0, 6).map((hook) => (
              <Button key={hook} size="sm" variant="secondary" onClick={() => setRight(hook)}>
                Try {hook.slice(0, 14)}...
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
