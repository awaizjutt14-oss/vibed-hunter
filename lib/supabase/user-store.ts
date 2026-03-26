import type { User } from "next-auth";
import { createSupabaseServerClient } from "@/lib/supabase/client";

const USERS_TABLE_SETUP_SQL = `
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
`;

let usersTableChecked = false;

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

  console.info("Supabase save attempt.", { email });

  const tableReady = await ensureUsersTableAvailable();
  if (!tableReady) {
    console.error("Supabase save error: users table unavailable.", { email });
    return { ok: false, reason: "table_unavailable" as const };
  }

  const usersTable = supabase.from("users" as any);

  const { error: insertError } = await usersTable.upsert([{ email }] as any, {
    onConflict: "email",
    ignoreDuplicates: true
  });
  if (insertError) {
    console.error("Failed to insert Supabase user.", insertError);
    return { ok: false, reason: "insert_failed" as const, error: insertError };
  }

  console.info("Supabase save success.", { email });
  return { ok: true as const };
}
