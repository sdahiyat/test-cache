import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================
// Environment variable validation
// ============================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// ============================================================
// Database type placeholder (expanded in later tasks)
// ============================================================
export type Database = Record<string, unknown>

// ============================================================
// Browser client (singleton)
// Used in Client Components and client-side code
// ============================================================
let browserClient: SupabaseClient | null = null

export function createClientComponentClient(): SupabaseClient {
  if (browserClient) return browserClient
  browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return browserClient
}

// ============================================================
// Server client factory
// Creates a new instance per request using cookie store
// Used in Server Components and API routes
// ============================================================
export function createServerComponentClient(): SupabaseClient {
  // Import cookies dynamically to avoid issues in non-server contexts
  // This function should only be called from server-side code
  const { cookies } = require('next/headers')
  const cookieStore = cookies()

  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        cookie: cookieStore.toString(),
      },
    },
  })
}

// ============================================================
// Service role client (bypasses RLS)
// Used for admin operations and server-side data access
// NEVER expose this to the client
// ============================================================
export function createServiceRoleClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl!, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

// ============================================================
// Default export: browser client for convenience
// ============================================================
const supabase = createClientComponentClient()
export default supabase
