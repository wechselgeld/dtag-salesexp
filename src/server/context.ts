import {
    getSession,
} from '@/lib/auth';
import {
    getScopedPrisma,
} from '@/lib/prisma-extended';

// Set TRUST_PROXY=true in .env.production only when the app runs behind a
// verified reverse proxy (Vercel, Railway, Nginx with proxy_set_header).
// Without this guard, any client can spoof X-Forwarded-For: 127.0.0.1 and
// bypass IP-based rate limiting and allowlist checks in session.ts.
const TRUST_PROXY = process.env.TRUST_PROXY === 'true';

function extractClientIp(req: Request): string | undefined {
    if (TRUST_PROXY) {
        const xff = req.headers.get('x-forwarded-for');
        if (xff) return xff.split(',')[0].trim();
    }
    // x-real-ip is set by Nginx/Vercel edge and cannot be spoofed by the client.
    return req.headers.get('x-real-ip') || undefined;
}

export const createContext = async ({
    req,
}: { req?: Request }) => {
    const session = await getSession();
    const ip = req ? extractClientIp(req) : undefined;
    const traceId = `tr_${globalThis.crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    const sessionUser = session ? {
        id: session.sub,
        email: session.email as string | undefined,
        role: session.role as string,
        isEditor: !!session.isEditor,
        odRegionId: session.odRegionId as string | null | undefined,
        locationId: session.locationId as string | null | undefined,
        teamId: session.teamId as string | null | undefined,
    } : null;

    return {
        session,
        prisma: getScopedPrisma(sessionUser),
        req,
        ip,
        traceId,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
