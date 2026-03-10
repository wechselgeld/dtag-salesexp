import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const createContext = async ({ req }: { req?: Request }) => {
    const sessionJwt = await getSession();

    let session: any = null;
    if (sessionJwt && sessionJwt.sub) {
        const user = await prisma.user.findUnique({
            where: { id: sessionJwt.sub as string },
            include: { location: true, odRegion: true, team: true }
        });
        if (user) {
            session = { ...user, sub: user.id };
        } else {
            session = sessionJwt; // Fallback to raw JWT if deleted
        }
    }

    // Attempt to extract IP from request headers if available
    let ip: string | undefined = undefined;
    if (req) {
        const forwardedFor = req.headers.get("x-forwarded-for");
        if (forwardedFor) {
            ip = forwardedFor.split(',')[0].trim();
        } else {
            ip = req.headers.get("x-real-ip") || undefined;
        }
    }

    return {
        session,
        prisma,
        req,
        ip,
    };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
