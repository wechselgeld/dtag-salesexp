import type {
  NextRequest,
} from 'next/server';
import {
  NextResponse,
} from 'next/server';
import {
  getSession,
} from '@/lib/auth';
import {
  httpLogger,
  formatDuration,
  formatStatus,
} from './lib/logger';
import pc from 'picocolors';

export async function middleware(req: NextRequest) {
  const start = Date.now();
  const path = req.nextUrl.pathname;

  let response: NextResponse | undefined;

  // Protect /admin routes
  if (path.startsWith('/admin')) {
    const session = await getSession();

    // Redirect to login if no session
    if (!session) {
      response = NextResponse.redirect(new URL('/login', req.url));
    }
    else {
      // Role check
      const roles = [
        'ADMIN',
        'SUPER_ADMIN',
        'OD_MANAGER',
        'LOCATION_MANAGER',
        'TEAM_LEADER',
      ];
      if (!roles.includes(session.role as string)) {
        response = NextResponse.redirect(new URL('/', req.url));
      }
    }
  }

  // Redirect authenticated users away from login
  if (!response && path === '/login') {
    const session = await getSession();
    const adminRoles = [
      'ADMIN',
      'SUPER_ADMIN',
      'OD_MANAGER',
      'LOCATION_MANAGER',
      'TEAM_LEADER',
    ];
    if (session && adminRoles.includes(session.role as string)) {
      response = NextResponse.redirect(new URL('/admin/products', req.url));
    }
  }

  // Protect Sales Tool routes
  if (!response && path.startsWith('/products')) {
    const sessionCookie = req.cookies.get('auth-token');
    if (!sessionCookie) {
      response = NextResponse.redirect(new URL('/setup', req.url));
    }
    else {
      // Verify signed cookie
      const {
        verifyJWT,
      } = await import('@/lib/auth');
      const payload = await verifyJWT(sessionCookie.value, 'auth');
      if (!payload) {
        // Invalid or tampered cookie
        response = NextResponse.redirect(new URL('/setup', req.url));
        response.cookies.delete('auth-token');
      }
    }
  }

  // Redirect / to /products (which gates to /setup)
  if (!response && path === '/') {
    response = NextResponse.redirect(new URL('/products', req.url));
  }

  const res = response || NextResponse.next();

  // Log the request in the pretty style
  const duration = Date.now() - start;
  httpLogger.info(`${pc.bold(pc.cyan(req.method))} ${pc.white(path)} ${formatStatus(res.status)} ${pc.gray(`in ${formatDuration(duration)}`)}`);

  return res;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
    '/products/:path*',
    '/',
  ],
};
