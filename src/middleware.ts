import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // IMPORTANT: Server Actions in Next.js 16 reject requests when x-forwarded-host
  // doesn't match origin. When running behind a cloud gateway, normalize the headers.
  const origin = req.headers.get('origin');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const requestHeaders = new Headers(req.headers);
  if (origin && forwardedHost && forwardedHost !== origin) {
    try {
      const originUrl = new URL(origin);
      requestHeaders.set('x-forwarded-host', originUrl.host);
      requestHeaders.set('x-forwarded-proto', originUrl.protocol.replace(':', ''));
      requestHeaders.set('host', originUrl.host);
    } catch {
      // ignore parse errors
    }
  }

  // Auth check for /admin/* routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // IMPORTANT: NextAuth uses different cookie names on http vs https:
    //   http:  next-auth.session-token
    //   https: __Secure-next-auth.session-token
    // Vercel is HTTPS in production → __Secure- prefix is used.
    // We try both names so the middleware works in both dev and prod.
    const isHttps = req.nextUrl.protocol === 'https:' || req.headers.get('x-forwarded-proto') === 'https';
    const cookieName = isHttps ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET ?? 'zhk-constructor-dev-secret-change-me',
      cookieName,
    });

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
