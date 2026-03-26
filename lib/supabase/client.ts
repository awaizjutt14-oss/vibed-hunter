import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
};

let browserClient: SupabaseClient<Database> | null = null;
let serverClient: SupabaseClient<Database> | null = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function canInitializeSupabase() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function createSupabaseBrowserClient() {
  if (!canInitializeSupabase()) {
    console.error("Supabase browser client not initialized: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }

  if (!browserClient) {
    browserClient = createClient<Database>(getSupabaseUrl()!, getSupabaseAnonKey()!);
  }

  return browserClient;
}

export function createSupabaseServerClient() {
  if (!canInitializeSupabase()) {
    console.error("Supabase server client not initialized: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    return null;
  }

  if (!serverClient) {
    serverClient = createClient<Database>(
      getSupabaseUrl()!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || getSupabaseAnonKey()!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return serverClient;
}
