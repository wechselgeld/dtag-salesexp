import {
    router, protectedProcedure, publicProcedure, requirePermission,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma, Prisma,
} from '@/lib/prisma';
import {
    TRPCError,
} from '@trpc/server';
import {
    invalidateCache,
} from '@/lib/cache';
import bcrypt from 'bcryptjs';
import {
    canCreateNews,
} from '@/lib/rbac';

// Schema for product creation/update
const priceHistorySchema = z.object({
    price: z.number().min(0),
    label: z.string().optional().nullable(),
});

const productSchema = z.object({
    name: z.string().min(1),
    category: z.string(),
    basePrice: z.number().min(0),
    description: z.string().optional(),

    // Specifics
    dataVolume: z.string().optional(),
    downloadSpeed: z.number().optional(),
    uploadSpeed: z.number().optional(),
    contractDuration: z.number().default(24),

    // Business Case Options
    allowNewActivation: z.boolean().default(true).optional(),
    allowMove: z.boolean().default(true).optional(),
    allowPlanChange: z.boolean().default(true).optional(),
    allowSpeedUp: z.boolean().default(false).optional(),

    // Fees
    activationFeeNew: z.number().optional().nullable(),
    activationFeeMove: z.number().optional().nullable(),
    activationFeePlanChange: z.number().optional().nullable(),
    activationFeeSpeedUp: z.number().optional().nullable(),
    allowMagentaTV: z.boolean().default(false),
    allowHybrid: z.boolean().default(false),
    allowHardwareTiers: z.boolean().default(false),
    hasMagentaTVBundle: z.boolean().default(false),
    magentaTVBundleName: z.string().optional().nullable(),
    magentaTVBundlePrice: z.number().optional().nullable(),

    // Devices
    deviceManufacturer: z.string().optional().nullable(),
    purchasePrice: z.number().optional().nullable(),
    rentalPrice: z.number().optional().nullable(),

    features: z.array(z.string()).default([
    ]),
    targetGroups: z.array(z.string()).default([
    ]),
    salesArguments: z.array(z.string()).default([
    ]),
    salesScript: z.string().optional().nullable(),
    magentaInfosUrl: z.string().optional().nullable(),
    priceHistory: z.array(priceHistorySchema).default([
    ]),
});

const tierSchema = z.object({
    price: z.number().min(0),
    fromMonth: z.number().min(1),
    toMonth: z.number().min(1),
    discountTarget: z.enum([
        'BASE_PRICE',
        'MAGENTA_TV',
    ]).default('BASE_PRICE'),
    discountType: z.enum([
        'ABSOLUTE',
        'RELATIVE',
    ]).default('ABSOLUTE'),
});

const specialPriceSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    internalNote: z.string().optional(),
    productIds: z.array(z.string()).min(1),
    tiers: z.array(tierSchema).min(1),
    magentaTVRequirement: z.enum([
        'REQUIRED',
        'NOT_ALLOWED',
        'NONE',
        'ONLY_SMART',
        'ONLY_SMARTSTREAM',
        'ONLY_MEGASTREAM',
    ]).default('NONE'),
    requiresSpeedUp: z.boolean().default(false),
    requiresMove: z.boolean().default(false),
    requiresNewActivation: z.boolean().default(false),
    priority: z.number().default(0),
    isActive: z.boolean().default(true),
    discountTarget: z.enum([
        'BASE_PRICE',
        'MAGENTA_TV',
    ]).default('BASE_PRICE'),
    discountType: z.enum([
        'ABSOLUTE',
        'RELATIVE',
    ]).default('ABSOLUTE'),
});

const adminProcedure = protectedProcedure.use(requirePermission('sudo:required'));

const catalogProcedure = protectedProcedure.use(requirePermission('catalog:manage'));
const pricesProcedure = protectedProcedure.use(requirePermission('prices:manage'));
const creditsProcedure = protectedProcedure.use(requirePermission('credits:manage'));

export const adminRouter = router({
    getDashboardStats: adminProcedure.query(async () => {
        const [
            products,
            users,
            specialPrices,
            teams,
        ] = await Promise.all([
            prisma.product.count(),
            prisma.user.count(),
            prisma.specialPrice.count(),
            prisma.team.count(),
        ]);
        return {
            products,
            users,
            specialPrices,
            teams,
        };
    }),

    getCurrentUser: protectedProcedure.query(({
        ctx,
    }) => {
        // ctx.session is already populated with the full user record by the isAuthed middleware
        return ctx.session as any;
    }),

    getMaintenanceStatus: publicProcedure.query(async () => {
        const setting = await prisma.systemSetting.findUnique({
            where: {
                key: 'maintenance_mode',
            },
        });
        return setting?.value === 'true';
    }),

    toggleMaintenanceMode: adminProcedure
        .input(z.object({
            enabled: z.boolean(),
        }))
        .mutation(({
            input,
        }) => {
            return prisma.systemSetting.upsert({
                where: {
                    key: 'maintenance_mode',
                },
                update: {
                    value: input.enabled ? 'true' : 'false',
                },
                create: {
                    key: 'maintenance_mode',
                    value: input.enabled ? 'true' : 'false',
                },
            });
        }),

    getSecuritySettings: adminProcedure.query(async () => {
        const [
            setting,
            requireEmail,
        ] = await Promise.all([
            prisma.systemSetting.findUnique({
                where: {
                    key: 'allowed_ips',
                },
            }),
            prisma.systemSetting.findUnique({
                where: {
                    key: 'require_email_verification',
                },
            }),
        ]);
        return {
            allowedIps: setting?.value || '',
            requireEmailVerification: requireEmail?.value === 'true',
        };
    }),

    updateSecuritySettings: adminProcedure
        .input(z.object({
            allowedIps: z.string(),
            requireEmailVerification: z.boolean().optional(),
        }))
        .mutation(async ({
            input,
        }) => {
            await prisma.systemSetting.upsert({
                where: {
                    key: 'allowed_ips',
                },
                update: {
                    value: input.allowedIps,
                },
                create: {
                    key: 'allowed_ips',
                    value: input.allowedIps,
                },
            });
            if (input.requireEmailVerification !== undefined) {
                await prisma.systemSetting.upsert({
                    where: {
                        key: 'require_email_verification',
                    },
                    update: {
                        value: input.requireEmailVerification.toString(),
                    },
                    create: {
                        key: 'require_email_verification',
                        value: input.requireEmailVerification.toString(),
                    },
                });
            }
            return {
                success: true,
            };
        }),

    // --- Product CRUD ---
    getAllProducts: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
            category: z.string().optional(),
        }))
        .query(async ({
            input,
        }) => {
            const limit = input.limit ?? 50;
            const {
                cursor, search, category,
            } = input;

            const where: any = {
                isActive: true,
            };
            if (search) {
                where.OR = [
                    {
                        name: {
                            contains: search,
                        },
                    },
                    {
                        description: {
                            contains: search,
                        },
                    },
                ];
            }
            if (category && category !== 'ALL') {
                where.category = category;
            }

            const items = await prisma.product.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                orderBy: {
                    priority: 'desc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return {
                items: items.map(product => ({
                    ...product,
                    features: product.features ? JSON.parse(product.features) : [
                    ],
                    targetGroups: (product as any).targetGroups ? JSON.parse((product as any).targetGroups) : [
                    ],
                })),
                nextCursor,
            };
        }),
    createProduct: catalogProcedure
        .input(productSchema)
        .mutation(async ({
            input,
        }) => {
            const {
                features, targetGroups, salesArguments, priceHistory, ...data
            } = input;
            const result = await prisma.product.create({
                data: {
                    ...data,
                    features: JSON.stringify(features),
                    targetGroups: JSON.stringify(targetGroups),
                    salesArguments: {
                        create: salesArguments.map((text, i) => ({
                            text,
                            sortOrder: i,
                            isActive: true,
                        })),
                    },
                    priceHistory: {
                        create: priceHistory.map(ph => ({
                            price: ph.price,
                            label: ph.label,
                        })),
                    },
                },
            });
            invalidateCache('product');
            return result;
        }),

    updateProduct: catalogProcedure
        .input(productSchema.extend({
            id: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
            const {
                id, features, targetGroups, salesArguments, priceHistory: _priceHistory, ...data
            } = input;

            // Fetch the current basePrice before updating so we know whether to
            // append a PriceHistory record. PriceHistory is an append-only audit
            // ledger — deleting it (old behavior) destroyed compliance data.
            const existing = await prisma.product.findUnique({
                where: {
                    id,
                },
                select: {
                    basePrice: true,
                },
            });

            await prisma.salesArgument.deleteMany({
                where: {
                    productId: id,
                },
            });
            // PriceHistory is NOT deleted here. Old entries are permanent.

            const result = await prisma.product.update({
                where: {
                    id,
                },
                data: {
                    ...data,
                    features: JSON.stringify(features),
                    targetGroups: JSON.stringify(targetGroups),
                    salesArguments: {
                        create: salesArguments.map((text, i) => ({
                            text,
                            sortOrder: i,
                            isActive: true,
                        })),
                    },
                },
            });

            // Only append a history record if the price actually changed.
            if (existing && data.basePrice !== undefined && existing.basePrice !== data.basePrice) {
                await prisma.priceHistory.create({
                    data: {
                        productId: id,
                        price: data.basePrice,
                        label: 'Manual update',
                    },
                });
            }

            invalidateCache('product');
            return result;
        }),

    deleteProduct: catalogProcedure
        .input(z.object({
            id: z.string(),
            sudoPassword: z.string().optional(),
        }))
        .mutation(async ({
            input, ctx,
        }) => {
            const bcrypt = await import('bcryptjs');
            const session = ctx.session as any;
            if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
            if (!isSudoValid) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const result = await prisma.product.delete({
                where: {
                    id: input.id,
                },
            });
            invalidateCache('product');
            return result;
        }),

    getProductById: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({
            input,
        }) => {
            const product = await prisma.product.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    salesArguments: {
                        orderBy: {
                            sortOrder: 'asc',
                        },
                    },
                    priceHistory: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                },
            });
            if (!product) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }
            return {
                ...product,
                features: product.features ? JSON.parse(product.features) : [
                ],
                targetGroups: (product as any).targetGroups ? JSON.parse((product as any).targetGroups) : [
                ],
            };
        }),

    // --- Special Price CRUD ---
    getAllSpecialPrices: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(1000).default(50),
            cursor: z.string().nullish(),
            search: z.string().optional(),
        }))
        .query(async ({
            input,
        }) => {
            const limit = input.limit ?? 50;
            const {
                cursor, search,
            } = input;

            const where: any = {
            };
            if (search) {
                where.OR = [
                    {
                        name: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive',
                        },
                    },
                ];
            }

            const items = await prisma.specialPrice.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor,
                } : undefined,
                where,
                include: {
                    products: true,
                    tiers: {
                        orderBy: {
                            fromMonth: 'asc',
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return {
                items,
                nextCursor,
            };
        }),

    getSpecialPriceById: protectedProcedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({
            input,
        }) => {
            const sp = await prisma.specialPrice.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    products: true,
                    tiers: {
                        orderBy: {
                            fromMonth: 'asc',
                        },
                    },
                },
            });
            if (!sp) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                });
            }
            return sp;
        }),

    createSpecialPrice: pricesProcedure
        .input(specialPriceSchema)
        .mutation(async ({
            input,
        }) => {
            const {
                tiers, productIds, ...data
            } = input;
            const result = await prisma.specialPrice.create({
                data: {
                    ...data,
                    products: {
                        connect: productIds.map(id => ({
                            id,
                        })),
                    },
                    tiers: {
                        create: tiers,
                    },
                },
                include: {
                    tiers: true,
                    products: true,
                },
            });
            invalidateCache('product');
            return result;
        }),

    updateSpecialPrice: pricesProcedure
        .input(specialPriceSchema.extend({
            id: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
            const {
                id, tiers, productIds, ...data
            } = input;
            await prisma.specialPriceTier.deleteMany({
                where: {
                    specialPriceId: id,
                },
            });
            const result = await prisma.specialPrice.update({
                where: {
                    id,
                },
                data: {
                    ...data,
                    products: {
                        set: productIds.map(pid => ({
                            id: pid,
                        })),
                    },
                    tiers: {
                        create: tiers,
                    },
                },
                include: {
                    tiers: true,
                    products: true,
                },
            });
            invalidateCache('product');
            return result;
        }),

    deleteSpecialPrice: pricesProcedure
        .input(z.object({
            id: z.string(),
            sudoPassword: z.string().optional(),
        }))
        .mutation(async ({
            input, ctx,
        }) => {
            const bcrypt = await import('bcryptjs');
            const session = ctx.session as any;
            if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
            if (!isSudoValid) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const result = await prisma.specialPrice.delete({
                where: {
                    id: input.id,
                },
            });
            invalidateCache('product');
            return result;
        }),

    // One-Time Credits Management
    oneTimeCredit: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(1000).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
            }))
            .query(async ({
                input,
            }) => {
                const limit = input.limit ?? 50;
                const {
                    cursor, search,
                } = input;

                const where: any = {
                };
                if (search) {
                    where.OR = [
                        {
                            name: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        // Value is a float, so we can't search it directly with contains.
                        // We could cast it but for credits usually name search is sufficient.
                        // { value: { equals: parseFloat(search) || undefined } }
                    ];
                }

                const items = await prisma.oneTimeCredit.findMany({
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

                return {
                    items,
                    nextCursor,
                };
            }),

        getById: protectedProcedure
            .input(z.object({
                id: z.string(),
            }))
            .query(async ({
                input,
            }) => {
                const credit = await prisma.oneTimeCredit.findUnique({
                    where: {
                        id: input.id,
                    },
                });
                if (!credit) { throw new Error('Credit not found'); }
                return credit;
            }),

        create: creditsProcedure
            .input(z.object({
                name: z.string().min(1, 'Name is required'),
                value: z.number().min(0, 'Value must be positive'),
                isActive: z.boolean().default(true),
            }))
            .mutation(async ({
                input,
            }) => {
                const result = await prisma.oneTimeCredit.create({
                    data: input,
                });
                invalidateCache('product');
                return result;
            }),

        update: creditsProcedure
            .input(z.object({
                id: z.string(),
                name: z.string().min(1, 'Name is required'),
                value: z.number().min(0, 'Value must be positive'),
                isActive: z.boolean(),
            }))
            .mutation(async ({
                input,
            }) => {
                const {
                    id, ...data
                } = input;
                const result = await prisma.oneTimeCredit.update({
                    where: {
                        id,
                    },
                    data,
                });
                invalidateCache('product');
                return result;
            }),

        delete: creditsProcedure
            .input(z.object({
                id: z.string(),
                sudoPassword: z.string().optional(),
            }))
            .mutation(async ({
                input, ctx,
            }) => {
                const bcrypt = await import('bcryptjs');
                const session = ctx.session as any;
                if (!session.password) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                    });
                }
                const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
                if (!isSudoValid) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                    });
                }
                const result = await prisma.oneTimeCredit.delete({
                    where: {
                        id: input.id,
                    },
                });
                invalidateCache('product');
                return result;
            }),
    }),

    // --- News CRUD ---
    news: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(1000).default(50),
                cursor: z.string().nullish(),
                search: z.string().optional(),
            }))
            .query(async ({
                input,
            }) => {
                const limit = input.limit ?? 50;
                const {
                    cursor, search,
                } = input;

                const where: any = {
                };
                if (search) {
                    where.OR = [
                        {
                            title: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                        {
                            content: {
                                contains: search,
                                mode: 'insensitive',
                            },
                        },
                    ];
                }

                const items = await (prisma.news as any).findMany({
                    take: limit + 1,
                    cursor: cursor ? {
                        id: cursor,
                    } : undefined,
                    where,
                    include: {
                        odRegion: {
                            select: {
                                name: true,
                            },
                        },
                        location: {
                            select: {
                                name: true,
                            },
                        },
                        team: {
                            select: {
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                });

                let nextCursor: typeof cursor | undefined = undefined;
                if (items.length > limit) {
                    const nextItem = items.pop();
                    nextCursor = nextItem!.id;
                }

                return {
                    items,
                    nextCursor,
                };
            }),

        create: protectedProcedure
            .input(z.object({
                title: z.string().min(1),
                content: z.string().min(1),
                priority: z.enum([
                    'INFO',
                    'UPDATE',
                    'IMPORTANT',
                    'CRITICAL',
                ]).default('INFO'),
                odRegionId: z.string().optional().nullable(),
                locationId: z.string().optional().nullable(),
                teamId: z.string().optional().nullable(),
            }))
            .use(requirePermission('news:create'))
            .mutation(async ({
                input, ctx,
            }) => {
                const session = ctx.session as any;
                const {
                    odRegionId, locationId, teamId, ...data
                } = input;

                if (!canCreateNews(session, {
                    odRegionId,
                    locationId,
                    teamId,
                })) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Du hast nicht die erforderlichen Rechte für diesen Bereich.',
                    });
                }

                const userLocId = session.effectiveLocationId || session.locationId;
                const userOdId = session.effectiveOdRegionId || session.odRegionId;

                if (session.role === 'LOCATION_MANAGER') {
                    if (teamId) {
                        const team = await prisma.team.findUnique({
                            where: { id: teamId },
                            select: { locationId: true },
                        });
                        if (!team || team.locationId !== userLocId) {
                            throw new TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Das ausgewählte Team gehört nicht zu Deinem Standort.',
                            });
                        }
                    }
                    if (locationId && locationId !== userLocId) {
                        throw new TRPCError({
                            code: 'FORBIDDEN',
                            message: 'Die ausgewählte Filiale gehört nicht zu Deinem Standort.',
                        });
                    }
                } else if (session.role === 'OD_MANAGER') {
                    if (locationId) {
                        const loc = await prisma.location.findUnique({
                            where: { id: locationId },
                            select: { odRegionId: true },
                        });
                        if (!loc || loc.odRegionId !== userOdId) {
                            throw new TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Die ausgewählte Filiale gehört nicht zu Deiner Vertriebsdirektion.',
                            });
                        }
                    }
                    if (teamId) {
                        const team = await prisma.team.findUnique({
                            where: { id: teamId },
                            include: { location: { select: { odRegionId: true } } },
                        });
                        if (!team || team.location?.odRegionId !== userOdId) {
                            throw new TRPCError({
                                code: 'FORBIDDEN',
                                message: 'Das ausgewählte Team gehört nicht zu Deiner Vertriebsdirektion.',
                            });
                        }
                    }
                }

                const news = await (prisma.news as any).create({
                    data: {
                        ...data,
                        odRegionId: odRegionId || null,
                        locationId: locationId || null,
                        teamId: teamId || null,
                    },
                    include: {
                        odRegion: {
                            select: {
                                name: true,
                            },
                        },
                        location: {
                            select: {
                                name: true,
                            },
                        },
                        team: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                // Invalidate news active cache keys
                await invalidateCache('news:active');

                // Emit the newly created news to SSE subscribers
                import('@/lib/news-emitter').then(({
                    publishNewsEvent,
                }) => {
                    publishNewsEvent(news);
                });

                return news;
            }),

        delete: protectedProcedure
            .use(requirePermission('news:delete'))
            .input(z.object({
                id: z.string(),
            }))
            .mutation(async ({
                input, ctx,
            }) => {
                const session = ctx.session as any;
                const news = await (prisma.news as any).findUnique({
                    where: {
                        id: input.id,
                    },
                });
                if (!news) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                    });
                }

                if (!canCreateNews(session, {
                    odRegionId: news.odRegionId,
                    locationId: news.locationId,
                    teamId: news.teamId,
                })) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Du hast keine Berechtigung, diese News zu löschen.',
                    });
                }

                const deleted = await (prisma.news as any).delete({
                    where: {
                        id: input.id,
                    },
                });

                // Invalidate news active cache keys
                await invalidateCache('news:active');

                return deleted;
            }),
    }),

    // --- Sales Arguments CRUD ---
    salesArguments: router({
        list: protectedProcedure.query(() => {
            return prisma.salesArgument.findMany({
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
                orderBy: [
                    {
                        productId: 'asc',
                    },
                    {
                        sortOrder: 'asc',
                    },
                ],
            });
        }),

        listByProduct: protectedProcedure
            .input(z.object({
                productId: z.string(),
            }))
            .query(({
                input,
            }) => {
                return prisma.salesArgument.findMany({
                    where: {
                        productId: input.productId,
                        isActive: true,
                    },
                    orderBy: {
                        sortOrder: 'asc',
                    },
                });
            }),

        create: catalogProcedure
            .input(z.object({
                text: z.string().min(1),
                productId: z.string(),
                sortOrder: z.number().default(0),
            }))
            .mutation(({
                input,
            }) => {
                return prisma.salesArgument.create({
                    data: input,
                });
            }),

        update: catalogProcedure
            .input(z.object({
                id: z.string(),
                text: z.string().min(1),
                sortOrder: z.number().default(0),
                isActive: z.boolean(),
            }))
            .mutation(({
                input,
            }) => {
                const {
                    id, ...data
                } = input;
                return prisma.salesArgument.update({
                    where: {
                        id,
                    },
                    data,
                });
            }),

        delete: catalogProcedure
            .input(z.object({
                id: z.string(),
                sudoPassword: z.string().optional(),
            }))
            .mutation(async ({
                input, ctx,
            }) => {
                const bcrypt = await import('bcryptjs');
                const session = ctx.session as any;
                if (!session.password) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                });
            }
            const isSudoValid = await bcrypt.compare(input.sudoPassword || '', session.password);
            if (!isSudoValid) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Sicherheitsbestätigung (Passwort) fehlgeschlagen.',
                    });
                }
                return prisma.salesArgument.delete({
                    where: {
                        id: input.id,
                    },
                });
            }),
    }),

    // --- Settings & Profile ---
    settings: router({
        changePassword: protectedProcedure
            .input(z.object({
                oldPassword: z.string(),
                newPassword: z.string().min(6),
            }))
            .mutation(async ({
                input, ctx,
            }) => {
                const userId = ctx.session.sub as string;
                const user = await prisma.user.findUnique({
                    where: {
                        id: userId,
                    },
                });

                if (!user) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                    });
                }

                const bcrypt = await import('bcryptjs');
                if (user.password) {
                    const isValid = await bcrypt.compare(input.oldPassword, user.password);

                    if (!isValid) {
                        throw new TRPCError({
                            code: 'UNAUTHORIZED',
                            message: 'Das alte Passwort ist nicht korrekt.',
                        });
                    }
                }

                const hashedPassword = await bcrypt.hash(input.newPassword, 10);
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        password: hashedPassword,
                        sessionVersion: {
                            increment: 1,
                        },
                    },
                });

                return {
                    success: true,
                };
            }),
    }),

    // --- Bulk Price Updates ---
    bulkUpdatePrices: adminProcedure
        .input(z.object({
            category: z.string().min(1),
            mode: z.enum([
                'FIXED',
                'PERCENTAGE',
            ]),
            value: z.number(), // positive = increase, negative = decrease
        }))
        .mutation(async ({
            input,
        }) => {
            const products = await prisma.product.findMany({
                where: {
                    category: input.category,
                    isActive: true,
                },
                select: {
                    id: true,
                    basePrice: true,
                },
            });

            if (products.length === 0) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `Keine aktiven Produkte in der Kategorie "${input.category}" gefunden.`,
                });
            }

            const updates = products.map((p) => {
                const newPrice = input.mode === 'FIXED'
                    ? p.basePrice + input.value
                    : p.basePrice * (1 + input.value / 100);
                return {
                    id: p.id,
                    basePrice: Math.max(0, Math.round(newPrice * 100) / 100),
                };
            });

            // Single UPDATE statement with a CASE expression instead of N individual
            // ORM updates in a transaction. For 1000 products this drops from
            // 1000 round-trips to 1, eliminating lock escalation and memory bloat.
            await prisma.$executeRaw`
                UPDATE "Product"
                SET "basePrice" = CASE id
                    ${Prisma.join(
                updates.map((u) => Prisma.sql`WHEN ${u.id}::text THEN ${u.basePrice}::double precision`),
                ' ',
            )}
                END,
                "updatedAt" = now()
                WHERE id IN (${Prisma.join(updates.map((u) => u.id))})
            `;

            // Append audit trail entries for every affected product.
            // bulkUpdatePrices previously wrote no history at all.
            await prisma.priceHistory.createMany({
                data: updates.map((u) => ({
                    productId: u.id,
                    price: u.basePrice,
                    label: `Bulk ${input.mode === 'FIXED' ? `+${input.value}€` : `${input.value}%`} (${input.category})`,
                })),
            });

            invalidateCache('product');
            return {
                updated: updates.length,
                category: input.category,
            };
        }),

    // Triggered manually from the admin UI or a deploy hook.
    // Previously this ran as a fire-and-forget deleteMany on every login request,
    // causing unindexed table-locking deletes under concurrent load.
    cleanupSessions: protectedProcedure.mutation(async ({
        ctx,
    }) => {
        const session = ctx.session as any;
        if (session?.role !== 'ADMIN') {
            throw new TRPCError({
                code: 'FORBIDDEN',
            });
        }
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const [
            users,
            sessions,
        ] = await Promise.all([
            prisma.user.deleteMany({
                where: {
                    isVerified: false,
                    createdAt: {
                        lt: twoHoursAgo,
                    },
                },
            }),
            prisma.userSession.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            }),
        ]);
        return {
            deletedUsers: users.count,
            deletedSessions: sessions.count,
        };
    }),
});
