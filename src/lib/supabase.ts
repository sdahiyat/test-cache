import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// ---------------------------------------------------------------------------
// Browser / client-side Supabase client
// ---------------------------------------------------------------------------
// Use this client in React components, hooks, and any browser-side code.
// It uses the anon key and respects Row-Level Security policies.
// ---------------------------------------------------------------------------

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export default supabase;

// ---------------------------------------------------------------------------
// Browser client convenience factory
// ---------------------------------------------------------------------------

/**
 * Returns the shared browser-side Supabase client.
 * Equivalent to importing `supabase` directly.
 */
export function createBrowserClient(): SupabaseClient<Database> {
  return supabase;
}

// ---------------------------------------------------------------------------
// Server-side Supabase client (service role)
// ---------------------------------------------------------------------------
// ⚠️  SECURITY WARNING:
//     SUPABASE_SERVICE_ROLE_KEY bypasses ALL Row-Level Security policies.
//     This client must ONLY be used in:
//       - Next.js API route handlers (src/app/api/*)
//       - Server Actions
//       - Server Components that need elevated privileges
//     NEVER import createServerSupabaseClient() in client components or
//     expose the service role key to the browser bundle.
// ---------------------------------------------------------------------------

/**
 * Creates a server-side Supabase client with the service role key.
 * Call this function inside API routes or Server Actions — never in the browser.
 */
export function createServerSupabaseClient(): SupabaseClient<Database> {
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
