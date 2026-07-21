import type {
	NextRequest,
} from 'next/server';
import {
	NextResponse,
} from 'next/server';
import {
	httpLogger,
	formatDuration,
	formatStatus,
} from './lib/logger';
import pc from 'picocolors';

async function getMiddlewareSession(req: NextRequest) {
	const token = req.cookies.get('auth-token')?.value;
	if (!token) return null;
	try {
		const {
			verifyJWT,
		} = await import('@/lib/auth');
		return await verifyJWT(token, 'auth');
	}
	catch {
		return null;
	}
}

export async function middleware(req: NextRequest) {
	const start = Date.now();
	const path = req.nextUrl.pathname;

	let response: NextResponse | undefined;

	// Check if there is an authenticated session
	const session = await getMiddlewareSession(req);

	if (session) {
		// If authenticated, follow original middleware logic to manage paths
		// Protect /admin routes
		if (path.startsWith('/admin')) {
			// Role check
			const roles = [
				'ADMIN',
				'OD_MANAGER',
				'LOCATION_MANAGER',
				'TEAM_LEADER',
			];
			if (!roles.includes(session.role as string)) {
				response = NextResponse.redirect(new URL('/', req.url));
			}
			else if (path === '/admin') {
				response = NextResponse.redirect(new URL('/admin/products', req.url));
			}
		}

		// Redirect authenticated users away from login/shutdown/unlock-experience
		if (!response && (path === '/login' || path === '/shutdown' || path === '/unlock-experience')) {
			const adminRoles = [
				'ADMIN',
				'OD_MANAGER',
				'LOCATION_MANAGER',
				'TEAM_LEADER',
			];
			if (adminRoles.includes(session.role as string)) {
				response = NextResponse.redirect(new URL('/admin/products', req.url));
			} else {
				response = NextResponse.redirect(new URL('/products', req.url));
			}
		}

		// Protect Sales Tool routes
		if (!response && path.startsWith('/products')) {
			// Allowed since authenticated
		}

		// Redirect / to /products
		if (!response && path === '/') {
			response = NextResponse.redirect(new URL('/products', req.url));
		}
	} else {
		// NOT authenticated
		if (
			path === '/shutdown' ||
			path === '/unlock-experience' ||
			path === '/impressum' ||
			path === '/privacy' ||
			path === '/api/auth/logout' ||
			path.startsWith('/api/bypass-login')
		) {
			response = NextResponse.next();
		}
		else if (path.startsWith('/api/')) {
			response = NextResponse.json({ error: 'System shutdown' }, { status: 410 });
		}
		else {
			response = NextResponse.redirect(new URL('/shutdown', req.url));
		}
	}

	const res = response || NextResponse.next();

	// Log the request in the pretty style
	const duration = Date.now() - start;
	httpLogger.info(`${pc.bold(pc.cyan(req.method))} ${pc.white(path)} ${formatStatus(res.status)} ${pc.gray(`in ${formatDuration(duration)}`)}`);

	return res;
}


export const config = {
	matcher: [
		/*
		 * Match all request paths except for:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!_next/static|_next/image|favicon.ico).*)',
	],
};

