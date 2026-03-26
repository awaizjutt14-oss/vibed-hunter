import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          user_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          created_at?: string;
        };
      };
      generation_history: {
        Row: {
          id: string;
          user_email: string;
          input: string;
          hook: string;
          caption: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          input: string;
          hook: string;
          caption: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          input?: string;
          hook?: string;
          caption?: string;
          created_at?: string;
        };
      };
      generation_usage: {
        Row: {
          user_id: string;
          user_email: string | null;
          free_posts_used: number;
          is_paid: boolean;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          user_email?: string | null;
          free_posts_used?: number;
          is_paid?: boolean;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          user_email?: string | null;
          free_posts_used?: number;
          is_paid?: boolean;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      generation_usage_events: {
        Row: {
          event_id: string;
          user_id: string;
          action: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          action: string;
          created_at?: string;
        };
        Update: {
          event_id?: string;
          user_id?: string;
          action?: string;
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
