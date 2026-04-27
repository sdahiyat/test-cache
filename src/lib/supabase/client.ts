import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

export type { SupabaseClient };

let browserClient: SupabaseClient<Database> | null = null;

export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const supabase = createBrowserClient();
