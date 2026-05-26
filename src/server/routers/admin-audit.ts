import {
    router, protectedProcedure, requirePermission,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    revertAuditLog,
} from '@/lib/audit-revert';

export interface SerializedAuditLog {
    id: string;
    action: string;
    entityType: string | null;
    entityId: string | null;
    message: string;
    details: any;
    userId: string | null;
    userEmail: string | null;
    userRole: string | null;
    clientIp: string | null;
    revertedFromId: string | null;
    createdAt: Date;
}

export const adminAuditRouter = router({
    list: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
                action: z.string().optional(),
                entityType: z.string().optional(),
            }),
        )
        .query(async ({
            input,
        }): Promise<{ items: SerializedAuditLog[]; nextCursor: string | undefined }> => {
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
                    {
                        entityId: {
                            contains: searchLower,
                            mode: 'insensitive',
                        },
                    },
                ];
            }

            if (input.action && input.action !== 'ALL') {
                where.action = input.action;
            }

            if (input.entityType && input.entityType !== 'ALL') {
                where.entityType = input.entityType;
            }

            const items = await prisma.auditLog.findMany({
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

            const serialized: SerializedAuditLog[] = items.map((item) => ({
                id: item.id,
                action: item.action,
                entityType: item.entityType,
                entityId: item.entityId,
                message: item.message,
                details: item.details,
                userId: item.userId,
                userEmail: item.userEmail,
                userRole: item.userRole,
                clientIp: item.clientIp,
                revertedFromId: item.revertedFromId,
                createdAt: item.createdAt,
            }));

            return {
                items: serialized,
                nextCursor: nextCursor || undefined,
            };
        }),

    getCurrentState: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(
            z.object({
                entityType: z.string(),
                entityId: z.string(),
            }),
        )
        .query(async ({
            input,
        }) => {
            const {
 entityType, entityId,
} = input;
            const modelLower = entityType.charAt(0).toLowerCase() + entityType.slice(1);
            const model = (prisma as any)[modelLower];
            if (!model) {
                return null;
            }

            const where = entityType === 'SystemSetting' ? {
 key: entityId,
} : {
 id: entityId,
};

            // Fetch based on entity type to load nested relations if they exist
            let include: any = undefined;
            if (entityType === 'Product') {
                include = {
 salesArguments: true,
priceHistory: true,
};
            }
 else if (entityType === 'SpecialPrice') {
                include = {
 tiers: true,
products: true,
};
            }
 else if (entityType === 'Addon') {
                include = {
 tiers: true,
compatibleProducts: true,
};
            }

            try {
                const current = await model.findUnique({
                    where,
                    include,
                });
                return current;
            }
 catch (err) {
                console.warn('[getCurrentState include failed, falling back to simple query]', err);
                try {
                    const current = await model.findUnique({
 where,
});
                    return current;
                }
 catch {
                    return null;
                }
            }
        }),

    revert: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(
            z.object({
                logId: z.string(),
            }),
        )
        .mutation(({
            input,
        }) => {
            return revertAuditLog(input.logId);
        }),

    clearAll: protectedProcedure
        .use(requirePermission('settings:manage'))
        .mutation(async () => {
            await prisma.auditLog.deleteMany();
            return {
                success: true,
            };
        }),
});
