"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

const SYNC_KEY_PREFIX = "vibed-hunter-supabase-sync";

export function SyncUserOnLogin() {
  const { data: session } = useSession();

  useEffect(() => {
    const normalizedEmail = session?.user?.email?.trim().toLowerCase();
    if (!normalizedEmail) return;

    const storageKey = `${SYNC_KEY_PREFIX}:${normalizedEmail}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "done") {
      return;
    }

    async function syncUser() {
      try {
        console.log("Calling sync-user API", { email: normalizedEmail });

        const response = await fetch("/api/auth/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email: normalizedEmail })
        });

        const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          console.error("sync-user API error", payload.error || "Unknown sync error");
          return;
        }

        console.log("sync-user API success");
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(storageKey, "done");
        }
      } catch (error) {
        console.error("sync-user API request failed", error);
      }
    }

    void syncUser();
  }, [session]);

  return null;
}
