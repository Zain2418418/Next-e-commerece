import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper function to decode JWT payload in Edge runtime (Without external heavy libs)
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Dedicated Admin Login Page Handler
  if (path === '/admin/login') {
    const token =
      request.cookies.get('token')?.value ||
      request.cookies.get('authToken')?.value ||
      '';

    // Agar pehle se admin token maujood hai, to direct dashboard par bhejain
    if (token) {
      const payload = decodeJwtPayload(token);
      if (payload && payload.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.nextUrl));
      }
    }
    // Warna login page open hone dein
    return NextResponse.next();
  }

  // 2. Auth pages list
  const isAuthPage = 
    path === '/login' || 
    path === '/auth/login' || 
    path === '/signup' || 
    path === '/auth/signup' ||
    path === '/api/auth/verify';

  // 3. Read auth token from cookies
  const token = 
    request.cookies.get('token')?.value || 
    request.cookies.get('authToken')?.value || 
    '';

  // 4. Logged-in user logged-out pages (Login/Signup) par nahi ja sakta
  if (isAuthPage && token) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirectTo, request.nextUrl));
  }

  // 5. Protected Routes Check (/profile & /admin)
  const isProtectedPath = path.startsWith('/profile') || path.startsWith('/admin');

  // Agar protected route hai aur token nahi hai:
  // - /admin paths -> Dedicated /admin/login page
  // - Baaki protected paths (/profile) -> Standard /auth/login page
  if (isProtectedPath && !token) {
    if (path.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
    }
    const loginUrl = new URL('/auth/login', request.nextUrl);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  // 🔒 6. Strict Admin Protection Check
  if (path.startsWith('/admin') && token) {
    const payload = decodeJwtPayload(token);

    // Agar token invalid hai ya role admin nahi hai -> Access Denied (Redirect to Admin Login or Home)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.nextUrl));
    }
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