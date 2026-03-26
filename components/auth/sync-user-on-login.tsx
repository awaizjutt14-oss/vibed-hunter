"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const SYNC_KEY_PREFIX = "vibed-hunter-supabase-sync";

export function SyncUserOnLogin({ email }: { email: string }) {
  useEffect(() => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const storageKey = `${SYNC_KEY_PREFIX}:${normalizedEmail}`;
    if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey) === "done") {
      return;
    }

    async function syncUser() {
      try {
        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
          console.error("Saving user to Supabase (frontend) failed: missing client config");
          return;
        }

        console.log("Saving user to Supabase (frontend)", { email: normalizedEmail });

        const { error } = await supabase.from("users").upsert(
          {
            email: normalizedEmail
          } as any,
          {
            onConflict: "email"
          }
        );

        if (error) {
          console.error("Saving user to Supabase (frontend) error", error);
          return;
        }

        console.log("Saving user to Supabase (frontend) success");
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(storageKey, "done");
        }
      } catch (error) {
        console.error("Saving user to Supabase (frontend) error", error);
      }
    }

    void syncUser();
  }, [email]);

  return null;
}
