import {
 NextResponse,
} from 'next/server';
import {
 logout,
} from '@/lib/auth';

export async function GET(request: Request) {
    await logout();

    const url = new URL(request.url);
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || url.host;
    const protocol = request.headers.get('x-forwarded-proto') || (url.protocol.startsWith('https') ? 'https' : 'http');

    const targetUrl = new URL('/login', `${protocol}://${host}`);
    url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(targetUrl);
}
