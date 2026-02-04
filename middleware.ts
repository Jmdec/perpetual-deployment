// middleware.ts (root level)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  console.log('Middleware:', { pathname, hasToken: !!token })

  // Public paths that don't require authentication
  // Only login, register, and legal pages are public
  const publicPaths = [
    '/login', 
    '/register', 
    '/cookies',
    '/terms',
    '/privacy'
  ]
  const isPublicPath = publicPaths.includes(pathname)
  
  // API routes should be handled separately
  const isApiRoute = pathname.startsWith('/api/')
  
  // PWA files - CRITICAL for PWA to work
  const isPWAFile = pathname === '/manifest.json' || 
                    pathname === '/sw.js' ||
                    pathname === '/workbox-' ||
                    pathname.startsWith('/workbox-') ||
                    pathname === '/swe-worker-' ||
                    pathname.startsWith('/swe-worker-')
  
  // Static and public assets
  const isPublicAsset = pathname.startsWith('/_next') || 
                        pathname.startsWith('/static') ||
                        pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|json|js)$/)

  // Don't process API routes, public assets, or PWA files
  if (isApiRoute || isPublicAsset || isPWAFile) {
    console.log('Middleware: Allowing asset/API/PWA:', pathname)
    return NextResponse.next()
  }

  // Allow unauthenticated access to specific API routes
  if (isApiRoute && pathname === '/api/events/invites') {
    console.log('Middleware: Allowing unauthenticated access to /api/events/invites')
    return NextResponse.next()
  }

  // If accessing protected route without token, redirect to login
  if (!token && !isPublicPath) {
    console.log('Middleware: No token, redirecting to login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If has token and on login/register page, redirect to home or specified redirect URL
  if (token && (pathname === '/login' || pathname === '/register')) {
    console.log('Middleware: User has token on login/register, redirecting...')
    
    // Check if there's a redirect parameter
    const redirectTo = request.nextUrl.searchParams.get('redirect')
    
    if (redirectTo) {
      console.log('Middleware: Redirecting to specified path:', redirectTo)
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    
    // Default redirect to home page
    console.log('Middleware: Redirecting to home page')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow access to all other routes for authenticated users
  console.log('Middleware: Allowing access')
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - PWA files (manifest.json, sw.js, workbox files)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|swe-worker-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
