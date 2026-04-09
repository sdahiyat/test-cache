import { createServerClient } from '@/lib/supabase'

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

/**
 * Returns the current session or null.
 * For use in Server Components and API routes.
 */
export async function getSession() {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('getSession error:', error.message)
    return null
  }
  return data.session ?? null
}

/**
 * Returns the authenticated user or null.
 * Uses getUser() for a more secure server-side check.
 */
export async function getUser() {
  const supabase = createServerClient()
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    // Not an error worth logging loudly — just means no session
    return null
  }
  return data.user ?? null
}

/**
 * Signs the current user out.
 * For use in Server Actions or API routes.
 */
export async function signOut() {
  const supabase = createServerClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('signOut error:', error.message)
  }
}
