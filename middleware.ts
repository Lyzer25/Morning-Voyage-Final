import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`MIDDLEWARE: Processing ${pathname}`);

  if (pathname.startsWith('/admin') || (pathname.startsWith('/account') && !pathname.includes('/login'))) {
    console.log(`MIDDLEWARE: Protected route ${pathname}, checking session...`);

    try {
      // Debug cookie reading in middleware
      const sessionCookie = request.cookies.get('mv_session');
      console.log('MIDDLEWARE: Session cookie exists:', !!sessionCookie?.value);
      if (!sessionCookie?.value) {
        console.log('MIDDLEWARE: No session cookie, redirecting to login');
        return NextResponse.redirect(new URL('/account/login', request.url));
      }

      console.log('MIDDLEWARE: Attempting JWT verification with jose...');
      console.log('MIDDLEWARE: AUTH_SECRET exists:', !!process.env.AUTH_SECRET);

      // Edge-compatible JWT verify using jose
      const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET || '');
      const { payload } = await jwtVerify(sessionCookie.value, secretKey);
      const session = payload as any;

      console.log('MIDDLEWARE: JWT verified successfully for:', session?.email);

      if (pathname.startsWith('/admin') && session?.role !== 'admin') {
        console.log(`MIDDLEWARE: User ${session?.email} is not admin, redirecting to account`);
        return NextResponse.redirect(new URL('/account', request.url));
      }

      console.log(`MIDDLEWARE: Access granted to ${pathname} for ${session?.email}`);

    } catch (error) {
      console.error('MIDDLEWARE: Session verification failed:', error);
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  console.log(`MIDDLEWARE: Allowing request to ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*']
};
