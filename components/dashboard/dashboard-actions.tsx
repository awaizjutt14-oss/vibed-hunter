"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardActions() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function runAction(url: string) {
    setMessage(null);
    const response = await fetch(url, { method: "POST" });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Action failed.");
      return;
    }
    setMessage(payload.message ?? "Done.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex gap-3">
        <Button disabled={isPending} onClick={() => runAction("/api/ingest/run")}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Find viral content
        </Button>
        <Button variant="secondary" disabled={isPending} onClick={() => runAction("/api/packets/generate")}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create 5 post-ready ideas
        </Button>
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
