import {
    router, publicProcedure, protectedProcedure, requirePermission,
} from '@/server/trpc';
import {
    z,
} from 'zod';
import {
    prisma,
} from '@/lib/prisma';
import {
    getCached, invalidateCache,
} from '@/lib/cache';

// 1 hour
const TTL = 1000 * 60 * 60;

export const settingsRouter = router({
    getAll: protectedProcedure
        .use(requirePermission('settings:manage'))
        .query(() => {
            return prisma.systemSetting.findMany();
        }),

    getDesignSettings: publicProcedure.query(() => {
        return getCached('systemSettings:design', TTL, async () => {
            const settings = await prisma.systemSetting.findMany({
                where: {
                    key: {
                        in: [
                            'magentatv_background_image',
                            'smartphone_background_image',
                            'header_background_image',
                            'category_image_MOBILE',
                            'category_image_FIBER',
                            'category_image_DSL',
                            'category_image_MAGENTA_TV_OTT',
                            'category_image_DEVICE',
                        ],
                    },
                },
            });

            const result: Record<string, string> = {
                magentatv_background_image: '',
                smartphone_background_image: '',
                header_background_image: '',
                category_image_MOBILE: '',
                category_image_FIBER: '',
                category_image_DSL: '',
                category_image_MAGENTA_TV_OTT: '',
                category_image_DEVICE: '',
            };
            settings.forEach((s) => {
                result[s.key] = s.value;
            });

            return result;
        });
    }),

    getPricingSettings: publicProcedure.query(() => {
        return getCached('systemSettings:pricing', TTL, async () => {
            const settings = await prisma.systemSetting.findMany({
                where: {
                    key: {
                        in: [
                            'magentatv_smart_price',
                            'magentatv_smartstream_price',
                            'magentatv_megastream_price',
                            'shipping_hardware_fee',
                            'plus_karte_first_price',
                            'plus_karte_following_price',
                            'mobile_tier_smartphone',
                            'mobile_tier_top',
                            'mobile_tier_premium',
                            'mobile_tier_premium_plus',
                        ],
                    },
                },
            });

            // Default values as fallback
            const defaultSettings = {
                magentatv_smart_price: '10',
                magentatv_smartstream_price: '17',
                magentatv_megastream_price: '30',
                shipping_hardware_fee: '6.95',
                plus_karte_first_price: '19.95',
                plus_karte_following_price: '9.95',
                mobile_tier_smartphone: '10',
                mobile_tier_top: '20',
                mobile_tier_premium: '30',
                mobile_tier_premium_plus: '40',
            };

            const result: Record<string, string> = {
                ...defaultSettings,
            };
            settings.forEach((s) => {
                result[s.key] = s.value;
            });

            return {
                magentatv_smart_price: parseFloat(result.magentatv_smart_price),
                magentatv_smartstream_price: parseFloat(result.magentatv_smartstream_price),
                magentatv_megastream_price: parseFloat(result.magentatv_megastream_price),
                shipping_hardware_fee: parseFloat(result.shipping_hardware_fee),
                plus_karte_first_price: parseFloat(result.plus_karte_first_price),
                plus_karte_following_price: parseFloat(result.plus_karte_following_price),
                mobile_tier_smartphone: parseFloat(result.mobile_tier_smartphone),
                mobile_tier_top: parseFloat(result.mobile_tier_top),
                mobile_tier_premium: parseFloat(result.mobile_tier_premium),
                mobile_tier_premium_plus: parseFloat(result.mobile_tier_premium_plus),
            };
        });
    }),

    update: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(
            z.object({
                key: z.string(),
                value: z.string(),
            }),
        )
        .mutation(async ({
            input,
        }) => {
            const result = await prisma.systemSetting.upsert({
                where: {
                    key: input.key,
                },
                update: {
                    value: input.value,
                },
                create: {
                    key: input.key,
                    value: input.value,
                },
            });
            invalidateCache('systemSettings');
            return result;
        }),

    updateMany: protectedProcedure
        .use(requirePermission('settings:manage'))
        .input(z.array(z.object({
            key: z.string(),
            value: z.string(),
        })))
        .mutation(async ({
            input,
        }) => {
            const updates = input.map(item =>
                prisma.systemSetting.upsert({
                    where: {
                        key: item.key,
                    },
                    update: {
                        value: item.value,
                    },
                    create: {
                        key: item.key,
                        value: item.value,
                    },
                }),
            );
            const result = await prisma.$transaction(updates);
            invalidateCache('systemSettings');
            return result;
        }),
});
