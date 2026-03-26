"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
        const supabase = createSupabaseBrowserClient();
        if (!supabase) {
          console.error("Insert error:", "Supabase client not initialized");
          return;
        }

        console.log("Saving user to Supabase:", normalizedEmail);

        const { error } = await supabase.from("users").upsert(
          {
            email: normalizedEmail
          } as any,
          {
            onConflict: "email"
          }
        );

        if (error) {
          console.error("Insert error:", error);
          return;
        }

        console.log("User saved successfully");
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(storageKey, "done");
        }
      } catch (error) {
        console.error("Insert error:", error);
      }
    }

    void syncUser();
  }, [session]);

  return null;
}
