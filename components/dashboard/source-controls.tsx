"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type SourceControlsProps = {
  sourceId: string;
  isActive: boolean;
  priority: "high" | "medium" | "low";
};

export function SourceControls(props: SourceControlsProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function updatePriority(priority: "high" | "medium" | "low") {
    setMessage(null);
    const response = await fetch("/api/sources/priority", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: props.sourceId, priority })
    });
    setMessage(response.ok ? `Priority set to ${priority}.` : "Could not update priority.");
    startTransition(() => router.refresh());
  }

  async function updateStatus(isActive: boolean) {
    setMessage(null);
    const response = await fetch("/api/sources/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: props.sourceId, isActive })
    });
    setMessage(response.ok ? (isActive ? "Source enabled." : "Source disabled.") : "Could not update source.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(["high", "medium", "low"] as const).map((priority) => (
          <Button key={priority} size="sm" variant={props.priority === priority ? "default" : "secondary"} disabled={isPending} onClick={() => updatePriority(priority)}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={props.isActive ? "secondary" : "default"} disabled={isPending} onClick={() => updateStatus(!props.isActive)}>
          {props.isActive ? "Disable" : "Enable"}
        </Button>
      </div>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
    </div>
  );
}
