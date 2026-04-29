// Server-only: uses the service role key, which bypasses RLS. Never import
// from a Client Component or expose to the browser.
import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from './types'

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
