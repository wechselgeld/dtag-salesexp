import {
    router, protectedProcedure, publicProcedure,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    TRPCError,
} from '@trpc/server';
import {
    getCached, invalidateCache,
} from '@/lib/cache';

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

const adminProcedure = protectedProcedure.use(({
    ctx, next,
}) => {
    if ((ctx.session as any)?.role !== 'ADMIN') {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Nur Administratoren erlaubt.',
        });
    }
    return next({
        ctx,
    });
});

const editorProcedure = protectedProcedure.use(({
    ctx, next,
}) => {
    const session = ctx.session as any;
    if (session?.role !== 'ADMIN' && !session?.isEditor) {
        throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du benötigst Editor-Rechte für diese Aktion.',
        });
    }
    return next({
        ctx,
    });
});

export const adminRouter = router({
    getDashboardStats: protectedProcedure.query(async () => {
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

    getSecuritySettings: protectedProcedure.query(async () => {
        const setting = await prisma.systemSetting.findUnique({
            where: {
                key: 'allowed_ips',
            },
        });
        const requireEmail = await prisma.systemSetting.findUnique({
            where: {
                key: 'require_email_verification',
            },
        });
        return {
            allowedIps: setting?.value || '',
            requireEmailVerification: requireEmail?.value !== 'false',
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
            limit: z.number().min(1).max(100).default(50),
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
    createProduct: editorProcedure
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

    updateProduct: editorProcedure
        .input(productSchema.extend({
            id: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
            const {
                id, features, targetGroups, salesArguments, priceHistory, ...data
            } = input;

            // Recreate relations to preserve order easily and cleanly update
            await prisma.salesArgument.deleteMany({
                where: {
                    productId: id,
                },
            });
            await prisma.priceHistory.deleteMany({
                where: {
                    productId: id,
                },
            });

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

    deleteProduct: editorProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
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
            limit: z.number().min(1).max(100).default(50),
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

    createSpecialPrice: editorProcedure
        .input(specialPriceSchema)
        .mutation(({
            input,
        }) => {
            const {
                tiers, productIds, ...data
            } = input;
            return prisma.specialPrice.create({
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
        }),

    updateSpecialPrice: editorProcedure
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
            return prisma.specialPrice.update({
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
        }),

    deleteSpecialPrice: editorProcedure
        .input(z.object({
            id: z.string(),
        }))
        .mutation(async ({
            input,
        }) => {
            await prisma.specialPrice.delete({
                where: {
                    id: input.id,
                },
            });
        }),

    // One-Time Credits Management
    oneTimeCredit: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(100).default(50),
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

        create: editorProcedure
            .input(z.object({
                name: z.string().min(1, 'Name is required'),
                value: z.number().min(0, 'Value must be positive'),
                isActive: z.boolean().default(true),
            }))
            .mutation(({
                input,
            }) => {
                return prisma.oneTimeCredit.create({
                    data: input,
                });
            }),

        update: editorProcedure
            .input(z.object({
                id: z.string(),
                name: z.string().min(1, 'Name is required'),
                value: z.number().min(0, 'Value must be positive'),
                isActive: z.boolean(),
            }))
            .mutation(({
                input,
            }) => {
                const {
                    id, ...data
                } = input;
                return prisma.oneTimeCredit.update({
                    where: {
                        id,
                    },
                    data,
                });
            }),

        delete: editorProcedure
            .input(z.object({
                id: z.string(),
            }))
            .mutation(({
                input,
            }) => {
                return prisma.oneTimeCredit.delete({
                    where: {
                        id: input.id,
                    },
                });
            }),
    }),

    // --- News CRUD ---
    news: router({
        list: protectedProcedure
            .input(z.object({
                limit: z.number().min(1).max(100).default(50),
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
            .mutation(async ({
                input, ctx,
            }) => {
                const session = ctx.session as any;
                const { odRegionId, locationId, teamId, ...data } = input;

                const { canCreateNews } = await import('@/lib/rbac');
                if (!canCreateNews(session, { odRegionId, locationId, teamId })) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'Du hast nicht die erforderlichen Rechte für diesen Bereich.',
                    });
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

                // Emit the newly created news to SSE subscribers
                import('@/lib/news-emitter').then(({
                    newsEmitter,
                }) => {
                    newsEmitter.emit('add', news);
                });

                return news;
            }),

        delete: protectedProcedure
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

                const { canCreateNews } = await import('@/lib/rbac');
                if (!canCreateNews(session, { odRegionId: news.odRegionId, locationId: news.locationId, teamId: news.teamId })) {
                    throw new TRPCError({ code: 'FORBIDDEN', message: 'Du hast keine Berechtigung, diese News zu löschen.' });
                }

                return (prisma.news as any).delete({
                    where: {
                        id: input.id,
                    },
                });
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

        create: editorProcedure
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

        update: editorProcedure
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

        delete: editorProcedure
            .input(z.object({
                id: z.string(),
            }))
            .mutation(({
                input,
            }) => {
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
                const isValid = await bcrypt.compare(input.oldPassword, user.password);

                if (!isValid) {
                    throw new TRPCError({
                        code: 'UNAUTHORIZED',
                        message: 'Das alte Passwort ist nicht korrekt.',
                    });
                }

                const hashedPassword = await bcrypt.hash(input.newPassword, 10);
                await prisma.user.update({
                    where: {
                        id: userId,
                    },
                    data: {
                        password: hashedPassword,
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

            // Calculate new prices
            const updates = products.map((p) => {
                let newPrice: number;
                if (input.mode === 'FIXED') {
                    newPrice = p.basePrice + input.value;
                }
                else {
                    newPrice = p.basePrice * (1 + input.value / 100);
                }
                // Ensure price is not negative and round to 2 decimals
                newPrice = Math.max(0, Math.round(newPrice * 100) / 100);
                return {
                    id: p.id,
                    basePrice: newPrice,
                };
            });

            // Execute all updates in a transaction
            await prisma.$transaction(
                updates.map((u) =>
                    prisma.product.update({
                        where: {
                            id: u.id,
                        },
                        data: {
                            basePrice: u.basePrice,
                        },
                    }),
                ),
            );

            invalidateCache('product');

            return {
                updated: updates.length,
                category: input.category,
            };
        }),
});
