import { NextRequest, NextResponse } from 'next/server'

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/sessions',
  '/feed',
  '/study',
  '/settings',
  '/upgrade',
]

// Auth routes that authenticated users should not access
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )
}

function getSessionFromCookies(request: NextRequest): boolean {
  // Check for Supabase session cookies
  // Supabase v2 uses cookies with the format: sb-<project-ref>-auth-token
  // Also support legacy format: supabase-auth-token

  const cookies = request.cookies

  // Check for any Supabase auth cookie (v2 format)
  for (const [name, value] of cookies) {
    if (
      (name.startsWith('sb-') && name.endsWith('-auth-token')) ||
      name === 'supabase-auth-token'
    ) {
      if (value && value !== 'null' && value !== '{}') {
        return true
      }
    }
  }

  // Also check for access_token cookie (some configurations)
  const accessToken = cookies.get('sb-access-token')
  if (accessToken?.value) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const hasSession = getSessionFromCookies(request)

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(pathname) && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute(pathname) && hasSession) {
    const redirectTo = searchParams.get('redirectTo') || '/dashboard'
    // Ensure redirect is to a safe internal path
    const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/dashboard'
    return NextResponse.redirect(new URL(safeRedirect, request.url))
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
     * - public folder files
     * - API routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
