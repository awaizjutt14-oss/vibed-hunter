"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Status = {
  connected: boolean;
  username?: string;
  lastSyncedAt?: string;
  status?: string;
  missingPermissions?: string[];
};

export function InstagramStatusPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/instagram/status")
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setStatus(json);
      })
      .catch(() => {});
    // If env is not configured, status API will set connected:false; we only mark config missing when status explicitly says so
    // (lightweight; avoids a redirect from /api/instagram/connect).
    return () => {
      mounted = false;
    };
  }, []);

  const connected = status?.connected;

  return (
    <Card className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Instagram Sync</p>
        {connected ? <span className="text-xs text-green-600">Connected</span> : <span className="text-xs text-muted-foreground">Not connected</span>}
      </div>
      {connected ? (
        <>
          <p className="text-sm text-muted-foreground">@{status?.username ?? "unknown"}</p>
          <p className="text-xs text-muted-foreground">
            Last sync: {status?.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : "—"}
          </p>
          {status?.missingPermissions?.length ? (
            <p className="text-xs text-amber-600">Missing: {status.missingPermissions.join(", ")}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Sync health: OK</p>
          )}
        </>
      ) : configMissing ? (
        <p className="text-xs text-amber-600">Set IG_APP_ID, IG_APP_SECRET, IG_REDIRECT_URI to connect.</p>
      ) : (
        <Button size="sm" asChild>
          <a href="/api/instagram/connect">Connect Instagram</a>
        </Button>
      )}
    </Card>
  );
}
