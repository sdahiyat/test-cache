import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/sessions',
  '/feed',
  '/study',
  '/settings',
  '/upgrade',
]

const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Read tokens from cookies
  const accessToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // Also try the newer Supabase cookie format (project-ref based)
  // Supabase JS v2 stores the session as a JSON string in a cookie named
  // `sb-<project-ref>-auth-token`. We attempt a fallback by checking all
  // cookies for the auth-token pattern.
  let parsedAccessToken = accessToken
  let parsedRefreshToken = refreshToken

  if (!parsedAccessToken) {
    for (const [name, cookie] of request.cookies) {
      if (name.endsWith('-auth-token')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookie.value))
          if (parsed?.access_token) {
            parsedAccessToken = parsed.access_token
            parsedRefreshToken = parsed.refresh_token
          }
        } catch {
          // Not JSON or not the right shape — skip
        }
        break
      }
    }
  }

  let isAuthenticated = false

  if (parsedAccessToken && parsedRefreshToken) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
      await supabase.auth.setSession({
        access_token: parsedAccessToken,
        refresh_token: parsedRefreshToken,
      })
      const { data } = await supabase.auth.getUser()
      isAuthenticated = !!data.user
    } catch {
      isAuthenticated = false
    }
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route)

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api routes
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
}
