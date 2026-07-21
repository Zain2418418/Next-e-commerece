import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public auth pages
  const isAuthPage = path === '/login' || path === '/signup' || path === '/api/auth/verify';

  // Read auth token from cookies
  const token = request.cookies.get('token')?.value || '';

  // 1. Agar user logged in hai aur login/signup page par jaye, to home par bhej do
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  // 2. Sirf /checkout, /profile, aur /admin ke liye login required hai (/cart IS NOW PUBLIC)
  const isProtectedPath = 
    path.startsWith('/checkout') || 
    path.startsWith('/profile') || 
    path.startsWith('/admin');

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  return NextResponse.next();
}

// Matching Paths config: /cart ko matcher se bhi hata diya hai
export const config = {
  matcher: [
    '/login',
    '/signup',
    '/checkout/:path*',
    '/profile/:path*',
    '/admin/:path*'
  ],
};