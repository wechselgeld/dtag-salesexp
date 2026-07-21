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

export async function middleware(req: NextRequest) {
	const start = Date.now();
	const path = req.nextUrl.pathname;

	let response: NextResponse;

	if (path === '/shutdown' || path === '/impressum' || path === '/privacy') {
		response = NextResponse.next();
	}
	else if (path.startsWith('/api/')) {
		response = NextResponse.json({ error: 'System shutdown' }, { status: 410 });
	}
	else {
		response = NextResponse.redirect(new URL('/shutdown', req.url));
	}

	// Log the request in the pretty style
	const duration = Date.now() - start;
	httpLogger.info(`${pc.bold(pc.cyan(req.method))} ${pc.white(path)} ${formatStatus(response.status)} ${pc.gray(`in ${formatDuration(duration)}`)}`);

	return response;
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

