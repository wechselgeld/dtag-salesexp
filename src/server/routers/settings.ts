import { router, publicProcedure, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const settingsRouter = router({
    getAll: publicProcedure.query(async () => {
        return await prisma.systemSetting.findMany();
    }),

    getDesignSettings: publicProcedure.query(async () => {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ['magentatv_background_image', 'header_background_image']
                }
            }
        });

        const result: Record<string, string> = {
            magentatv_background_image: '',
            header_background_image: ''
        };
        settings.forEach((s) => {
            result[s.key] = s.value;
        });

        return result;
    }),

    getPricingSettings: publicProcedure.query(async () => {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: [
                        'magentatv_smart_price',
                        'magentatv_smartstream_price',
                        'magentatv_megastream_price',
                        'shipping_hardware_fee',
                        'plus_karte_first_price',
                        'plus_karte_following_price'
                    ]
                }
            }
        });

        // Default values as fallback
        const defaultSettings = {
            magentatv_smart_price: '10',
            magentatv_smartstream_price: '17',
            magentatv_megastream_price: '30',
            shipping_hardware_fee: '6.95',
            plus_karte_first_price: '19.95',
            plus_karte_following_price: '9.95'
        };

        const result: Record<string, string> = { ...defaultSettings };
        settings.forEach((s) => {
            result[s.key] = s.value;
        });

        return {
            magentatv_smart_price: parseFloat(result.magentatv_smart_price),
            magentatv_smartstream_price: parseFloat(result.magentatv_smartstream_price),
            magentatv_megastream_price: parseFloat(result.magentatv_megastream_price),
            shipping_hardware_fee: parseFloat(result.shipping_hardware_fee),
            plus_karte_first_price: parseFloat(result.plus_karte_first_price),
            plus_karte_following_price: parseFloat(result.plus_karte_following_price)
        };
    }),

    update: protectedProcedure
        .input(
            z.object({
                key: z.string(),
                value: z.string()
            })
        )
        .mutation(async ({ input }) => {
            return await prisma.systemSetting.upsert({
                where: { key: input.key },
                update: { value: input.value },
                create: { key: input.key, value: input.value }
            });
        }),

    updateMany: protectedProcedure
        .input(z.array(z.object({ key: z.string(), value: z.string() })))
        .mutation(async ({ input }) => {
            const updates = input.map(item =>
                prisma.systemSetting.upsert({
                    where: { key: item.key },
                    update: { value: item.value },
                    create: { key: item.key, value: item.value }
                })
            );
            return await prisma.$transaction(updates);
        })
});
