import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Yahan humne 'next/server' kar diya hai

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't need token protection
  const isPublicPath = path === '/login' || path === '/signup' || path === '/api/auth/verify';

  // Read cookie token issued by the login route
  const token = request.cookies.get('token')?.value || '';

  // If user has token and tries to access public login pages, push them to homepage
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // If user doesn't have token and wants to access protected dashboard/cart areas, force login
  if (!isPublicPath && !token) {
    // Add additional paths you want to protect in the matcher config below
    if (path.startsWith('/cart') || path.startsWith('/profile') || path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.nextUrl));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to filter middleware execution
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/cart/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ],
};