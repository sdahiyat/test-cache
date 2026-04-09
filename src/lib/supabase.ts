import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. ' +
    'Please add it to your .env.local file.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Please add it to your .env.local file.'
  )
}

// Browser client singleton — created once, reused across client components
let browserClient: SupabaseClient<Database> | null = null

export function createBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient
  browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return browserClient
}

// Server client factory — new instance per call, for Server Components / API routes
export function createServerClient(): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Convenience default export — the browser singleton
export const supabase = createBrowserClient()
