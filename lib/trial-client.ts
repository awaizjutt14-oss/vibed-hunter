"use client";

import { FREE_POSTS_LIMIT, type TrialStatusPayload } from "@/lib/trial-types";

export const DEFAULT_TRIAL_STATUS: TrialStatusPayload = {
  allowed: true,
  free_posts_used: 0,
  free_posts_limit: FREE_POSTS_LIMIT,
  is_paid: false,
  subscription_status: "free",
  remaining_free_generations: FREE_POSTS_LIMIT
};

export async function fetchTrialStatus() {
  const response = await fetch("/api/trial-status", {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load free trial status.");
  }

  return (await response.json()) as TrialStatusPayload;
}

