import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

/**
 * Browser (client-side) Supabase client.
 * Uses the anon key — subject to RLS policies.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Alias for components that import createBrowserClient pattern.
 */
export function createClientComponentClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

/**
 * Server-side Supabase client for use in API routes and Server Components.
 * Uses the service role key when available (bypasses RLS), otherwise falls
 * back to the anon key (respects RLS).
 */
export function createServerComponentClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceRoleKey ?? supabaseAnonKey!;
  return createClient<Database>(supabaseUrl!, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Admin client using the service role key.
 * Only use in server-side code — never expose to the client.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient<Database>(supabaseUrl!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export default supabase;
