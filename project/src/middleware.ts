import type { NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refreshes the auth session cookie when needed.
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
