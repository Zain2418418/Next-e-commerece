import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public auth pages
  const isAuthPage = path === '/login' || path === '/signup' || path === '/api/auth/verify';

  // Read auth token from cookies (checking both 'token' and fallback 'authToken')
  const token = 
    request.cookies.get('token')?.value || 
    request.cookies.get('authToken')?.value || 
    '';

  // 1. Agar user logged in hai aur login/signup page par jaye, to home par bhej do
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // 2. Sirf /checkout, /profile, aur /admin ke liye login required hai
  const isProtectedPath = 
    path === '/checkout' || 
    path.startsWith('/checkout/') || 
    path.startsWith('/profile') || 
    path.startsWith('/admin');

  if (isProtectedPath && !token) {
    // 🚀 URL ke sath ?redirect= parameter attach kar ke bhej rahe hain
    const loginUrl = new URL('/login', request.nextUrl);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Matching Paths config (Fixed matcher array)
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/checkout',
    '/checkout/:path*',
    '/profile',
    '/profile/:path*',
    '/admin',
    '/admin/:path*'
  ],
};