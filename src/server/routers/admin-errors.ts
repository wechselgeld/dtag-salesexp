import {
    router, protectedProcedure, requirePermission,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';

export interface SerializedErrorLog {
    id: string;
    traceId: string;
    path: string | null;
    type: string | null;
    message: string;
    stack: string | null;
    details: any;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
    clientIp: string | null;
    createdAt: Date;
}

export const adminErrorsRouter = router({
    list: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
                type: z.string().optional(),
            }),
        )
        .query(async ({
            input,
        }): Promise<{ items: SerializedErrorLog[]; nextCursor: string | undefined }> => {
            const limit = input.limit ?? 50;
            const {
                cursor,
            } = input;

            const where: any = {
};

            if (input.search) {
                const searchLower = input.search.trim();
                where.OR = [
                    {
                        traceId: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        path: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        message: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        userEmail: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        userRole: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                    {
                        clientIp: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                ];
            }

            if (input.type && input.type !== 'ALL') {
                where.type = input.type;
            }

            const items = await prisma.errorLog.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                orderBy: {
                    createdAt: 'desc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            // Map and cast to prevent recursive tRPC/Prisma JSON type inference
            const serialized: SerializedErrorLog[] = items.map((item) => ({
                id: item.id,
                traceId: item.traceId,
                path: item.path,
                type: item.type,
                message: item.message,
                stack: item.stack,
                details: item.details as any,
                userId: item.userId,
                userEmail: item.userEmail,
                userRole: item.userRole,
                clientIp: item.clientIp,
                createdAt: item.createdAt,
            }));

            return {
                items: serialized,
                nextCursor: nextCursor || undefined,
            };
        }),

    clearAll: protectedProcedure
        .use(requirePermission('settings:manage'))
        .mutation(async () => {
            await prisma.errorLog.deleteMany();
            return {
                success: true,
            };
        }),
});
