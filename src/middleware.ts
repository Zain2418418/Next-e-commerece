import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define auth pages (both /login and /auth/login)
  const isAuthPage = 
    path === '/login' || 
    path === '/auth/login' || 
    path === '/signup' || 
    path === '/auth/signup' ||
    path === '/api/auth/verify';

  // Read auth token from cookies
  const token = 
    request.cookies.get('token')?.value || 
    request.cookies.get('authToken')?.value || 
    '';

  // 1. Agar user logged in hai aur login/signup page par aaye:
  if (isAuthPage && token) {
    // Target redirect param read karein (agar URL mein redirect=/checkout ho)
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectTo, request.nextUrl));
  }

  // 2. Sirf /profile aur /admin ko middleware level par protect karein
  const isProtectedPath = 
    path.startsWith('/profile') || 
    path.startsWith('/admin');

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/auth/login', request.nextUrl);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matching Paths config
export const config = {
  matcher: [
    '/login',
    '/auth/login',
    '/signup',
    '/auth/signup',
    '/profile/:path*',
    '/admin/:path*'
  ],
};