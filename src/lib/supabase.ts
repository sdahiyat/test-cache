import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing required Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Browser singleton client for client components
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createBrowserSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
  }
  return browserClient
}

// Server client factory for Server Components and API routes
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // Ignore errors in read-only cookie stores (e.g., in Server Components)
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch {
          // Ignore errors in read-only cookie stores
        }
      },
    },
  })
}

// Default export for backwards compatibility
export const supabase = createBrowserSupabaseClient()
