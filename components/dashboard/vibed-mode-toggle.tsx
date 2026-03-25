"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

export function VibedModeToggle({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function toggle() {
    setMessage(null);
    const response = await fetch("/api/sources/vibed-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled })
    });
    setMessage(response.ok ? (!enabled ? "Vibed-only mode enabled." : "Vibed-only mode disabled.") : "Could not update mode.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={toggle} disabled={isPending}>
        {enabled ? "Disable Vibed-only mode" : "Enable Vibed-only mode"}
      </Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
