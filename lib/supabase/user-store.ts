import type { User } from "next-auth";
import { createSupabaseServerClient } from "@/lib/supabase/client";

const USERS_TABLE_SETUP_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  user_email text not null unique,
  created_at timestamptz not null default now()
);
`;

const GENERATION_HISTORY_SETUP_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.generation_history (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  input text not null,
  hook text not null,
  caption text not null,
  created_at timestamptz not null default now()
);
`;

const CAROUSEL_DRAFTS_SETUP_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.carousel_drafts (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  format text not null,
  input text not null,
  cover_headline text not null,
  cover_subheadline text,
  slides_json jsonb not null,
  caption text not null,
  final_cta text not null,
  created_at timestamptz not null default now()
);
`;

let usersTableChecked = false;
let generationHistoryChecked = false;
let carouselDraftsChecked = false;

async function ensureUsersTableAvailable() {
  if (usersTableChecked) return true;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase users table check skipped: client is not configured.");
    return false;
  }

  const { error } = await supabase.from("users").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Supabase users table is not ready.", {
      message: error.message,
      hint: "Run the SQL in supabase/users.sql before logging in.",
      sql: USERS_TABLE_SETUP_SQL
    });
    return false;
  }

  usersTableChecked = true;
  return true;
}

async function ensureGenerationHistoryTableAvailable() {
  if (generationHistoryChecked) return true;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase generation_history check skipped: client is not configured.");
    return false;
  }

  const { error } = await supabase.from("generation_history").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Supabase generation_history table is not ready.", {
      message: error.message,
      hint: "Create public.generation_history before saving generated content.",
      sql: GENERATION_HISTORY_SETUP_SQL
    });
    return false;
  }

  generationHistoryChecked = true;
  return true;
}

async function ensureCarouselDraftsTableAvailable() {
  if (carouselDraftsChecked) return true;

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Supabase carousel_drafts check skipped: client is not configured.");
    return false;
  }

  const { error } = await supabase.from("carousel_drafts").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Supabase carousel_drafts table is not ready.", {
      message: error.message,
      hint: "Create public.carousel_drafts before saving carousel drafts.",
      sql: CAROUSEL_DRAFTS_SETUP_SQL
    });
    return false;
  }

  carouselDraftsChecked = true;
  return true;
}

export async function saveUserToDatabase(user: Pick<User, "email">) {
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    console.error("saveUserToDatabase skipped: missing user email.");
    return { ok: false, reason: "missing_email" as const };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("saveUserToDatabase skipped: Supabase client is not configured.");
    return { ok: false, reason: "missing_client" as const };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Server sync is using the anon key and may be blocked by RLS.");
  }

  console.info("Supabase save attempt.", { email });

  const tableReady = await ensureUsersTableAvailable();
  if (!tableReady) {
    console.error("Supabase save error: users table unavailable.", { email });
    return { ok: false, reason: "table_unavailable" as const };
  }

  const usersTable = supabase.from("users" as any);

  const { error: insertError } = await usersTable.upsert([{ user_email: email }] as any, {
    onConflict: "user_email",
    ignoreDuplicates: true
  });
  if (insertError) {
    console.error("Supabase insert error:", insertError);
    return {
      ok: false,
      reason: "insert_failed" as const,
      error: {
        message: insertError.message,
        code: "code" in insertError ? insertError.code : undefined,
        details: "details" in insertError ? insertError.details : undefined,
        hint: "hint" in insertError ? insertError.hint : undefined
      }
    };
  }

  console.info("Supabase save success.", { email });
  return { ok: true as const };
}

export async function saveGenerationToDatabase(args: {
  userEmail?: string | null;
  input: string;
  hook: string;
  caption: string;
}) {
  const userEmail = args.userEmail?.trim().toLowerCase();
  const input = args.input.trim();
  const hook = args.hook.trim();
  const caption = args.caption.trim();

  if (!userEmail || !input || !hook || !caption) {
    console.error("saveGenerationToDatabase skipped: missing required fields.", {
      hasUserEmail: Boolean(userEmail),
      hasInput: Boolean(input),
      hasHook: Boolean(hook),
      hasCaption: Boolean(caption)
    });
    return { ok: false, reason: "missing_fields" as const };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("saveGenerationToDatabase skipped: Supabase client is not configured.");
    return { ok: false, reason: "missing_client" as const };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is missing. Generation history sync is using the anon key and may be blocked by RLS.");
  }

  const tableReady = await ensureGenerationHistoryTableAvailable();
  if (!tableReady) {
    console.error("Supabase generation history save error: table unavailable.", { userEmail });
    return { ok: false, reason: "table_unavailable" as const };
  }

  const { error } = await supabase.from("generation_history" as any).insert([
    {
      user_email: userEmail,
      input,
      hook,
      caption
    }
  ] as any);

  if (error) {
    console.error("Supabase generation history insert error:", error);
    return {
      ok: false,
      reason: "insert_failed" as const,
      error: {
        message: error.message,
        code: "code" in error ? error.code : undefined,
        details: "details" in error ? error.details : undefined,
        hint: "hint" in error ? error.hint : undefined
      }
    };
  }

  console.info("Saved generation history.", { userEmail });
  return { ok: true as const };
}

export async function fetchRecentGenerationHistory(userEmail?: string | null) {
  const normalizedEmail = userEmail?.trim().toLowerCase();
  if (!normalizedEmail) {
    console.info("No generation history exists: missing user email.");
    return [];
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Generation history fetch skipped: Supabase client is not configured.");
    return [];
  }

  const tableReady = await ensureGenerationHistoryTableAvailable();
  if (!tableReady) {
    console.info("No generation history exists: generation_history table unavailable.", { userEmail: normalizedEmail });
    return [];
  }

  const { data, error } = await supabase
    .from("generation_history" as any)
    .select("input, hook, caption, created_at")
    .eq("user_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Generation history fetch error:", error);
    return [];
  }

  const history = Array.isArray(data) ? data : [];
  if (history.length) {
    console.info("Fetched generation history.", {
      userEmail: normalizedEmail,
      count: history.length
    });
  } else {
    console.info("No generation history exists.", { userEmail: normalizedEmail });
  }

  return history as Array<{
    input: string;
    hook: string;
    caption: string;
    created_at?: string;
  }>;
}

export async function saveCarouselDraftToDatabase(args: {
  userEmail?: string | null;
  format: string;
  input: string;
  coverHeadline: string;
  coverSubheadline?: string | null;
  slides: unknown[];
  caption: string;
  finalCta: string;
}) {
  const userEmail = args.userEmail?.trim().toLowerCase();
  const format = args.format.trim();
  const input = args.input.trim();
  const coverHeadline = args.coverHeadline.trim();
  const coverSubheadline = args.coverSubheadline?.trim() || null;
  const caption = args.caption.trim();
  const finalCta = args.finalCta.trim();

  if (!userEmail || !format || !input || !coverHeadline || !caption || !finalCta || !args.slides.length) {
    console.error("saveCarouselDraftToDatabase skipped: missing required fields.", {
      hasUserEmail: Boolean(userEmail),
      hasFormat: Boolean(format),
      hasInput: Boolean(input),
      hasCoverHeadline: Boolean(coverHeadline),
      hasSlides: Boolean(args.slides.length),
      hasCaption: Boolean(caption),
      hasFinalCta: Boolean(finalCta)
    });
    return { ok: false, reason: "missing_fields" as const };
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("saveCarouselDraftToDatabase skipped: Supabase client is not configured.");
    return { ok: false, reason: "missing_client" as const };
  }

  const tableReady = await ensureCarouselDraftsTableAvailable();
  if (!tableReady) {
    console.error("Supabase carousel draft save error: table unavailable.", { userEmail });
    return { ok: false, reason: "table_unavailable" as const };
  }

  const { error } = await supabase.from("carousel_drafts" as any).insert([
    {
      user_email: userEmail,
      format,
      input,
      cover_headline: coverHeadline,
      cover_subheadline: coverSubheadline,
      slides_json: args.slides,
      caption,
      final_cta: finalCta
    }
  ] as any);

  if (error) {
    console.error("Supabase carousel draft insert error:", error);
    return {
      ok: false,
      reason: "insert_failed" as const,
      error: {
        message: error.message,
        code: "code" in error ? error.code : undefined,
        details: "details" in error ? error.details : undefined,
        hint: "hint" in error ? error.hint : undefined
      }
    };
  }

  console.info("Saved carousel draft.", { userEmail, format });
  return { ok: true as const };
}

export async function countGenerationHistoryForUser(userEmail?: string | null, options?: { since?: Date }) {
  const normalizedEmail = userEmail?.trim().toLowerCase();
  if (!normalizedEmail) {
    console.info("Generation history count skipped: missing user email.");
    return 0;
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    console.error("Generation history count skipped: Supabase client is not configured.");
    return 0;
  }

  const tableReady = await ensureGenerationHistoryTableAvailable();
  if (!tableReady) {
    console.info("Generation history count skipped: generation_history table unavailable.", { userEmail: normalizedEmail });
    return 0;
  }

  let query = supabase
    .from("generation_history" as any)
    .select("id", { count: "exact", head: true })
    .eq("user_email", normalizedEmail);

  if (options?.since) {
    query = query.gte("created_at", options.since.toISOString());
  }

  const { count, error } = await query;

  if (error) {
    console.error("Generation history count error:", error);
    return 0;
  }

  return Number(count ?? 0);
}
