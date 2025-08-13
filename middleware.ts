import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin') || (pathname.startsWith('/account') && !pathname.includes('/login'))) {
    try {
      const sessionCookie = request.cookies.get('mv_session');
      if (!sessionCookie?.value) {
        return NextResponse.redirect(new URL('/account/login', request.url));
      }
      
      const session = jwt.verify(sessionCookie.value, process.env.AUTH_SECRET!) as any;
      if (pathname.startsWith('/admin') && session.role !== 'admin') {
        return NextResponse.redirect(new URL('/account', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*']
};
