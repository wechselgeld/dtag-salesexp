import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith('/admin')) {
        const session = await getSession();

        // Redirect to login if no session
        if (!session) {
            return NextResponse.redirect(new URL('/login', req.url));
        }

        // Role check
        const roles = ['ADMIN', 'OD_MANAGER', 'LOCATION_MANAGER', 'TEAM_LEADER'];
        if (!roles.includes(session.role as string)) {
            return NextResponse.redirect(new URL('/', req.url));
        }
    }

    // Redirect authenticated users away from login
    if (path === '/login') {
        const session = await getSession();
        if (session) {
            return NextResponse.redirect(new URL('/admin/products', req.url));
        }
    }

    // Protect Sales Tool routes
    if (path.startsWith('/products')) {
        const sessionCookie = req.cookies.get('sales-session-id');
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/setup', req.url));
        }

        // Verify signed cookie
        const { verifySessionId } = await import('@/lib/auth');
        const sessionId = await verifySessionId(sessionCookie.value);
        if (!sessionId) {
            // Invalid or tampered cookie
            const response = NextResponse.redirect(new URL('/setup', req.url));
            response.cookies.delete('sales-session-id');
            return response;
        }
    }

    // Redirect / to /products (which gates to /setup)
    if (path === '/') {
        return NextResponse.redirect(new URL('/products', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/login',
        '/products/:path*',
        '/'
    ],
};
