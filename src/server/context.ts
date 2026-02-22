import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const createContext = async () => {
    const session = await getSession();
    return {
        session,
        prisma,
    };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
