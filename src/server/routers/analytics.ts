import { router, publicProcedure, protectedProcedure } from '@/server/trpc';
import { z } from 'zod';
import { analyticsBuffer } from '@/lib/analytics-buffer';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const analyticsRouter = router({
    // --- Public: Fire-and-forget tracking ---
    track: publicProcedure
        .input(z.object({
            eventType: z.enum(['PAGE_VIEW', 'PRODUCT_VIEW', 'BASKET_ADD']),
            path: z.string().optional(),
            productId: z.string().optional(),
            category: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
            // Extract teamId from sales session cookie (no auth needed)
            let teamId: string | null = null;
            try {
                const cookieStore = await cookies();
                const token = cookieStore.get('sales-session-id')?.value;
                if (token) {
                    const { verifySessionId } = await import('@/lib/auth');
                    const sessionId = await verifySessionId(token);
                    if (sessionId) {
                        const session = await prisma.salesSession.findUnique({
                            where: { id: sessionId },
                            select: { teamId: true },
                        });
                        teamId = session?.teamId ?? null;
                    }
                }
            } catch {
                // Don't fail tracking if session lookup fails
            }

            analyticsBuffer.track({
                eventType: input.eventType,
                path: input.path,
                productId: input.productId,
                category: input.category,
                teamId,
            });

            return { success: true };
        }),

    // --- Admin: Dashboard data ---
    getDashboard: protectedProcedure
        .input(z.object({
            days: z.number().min(1).max(365).default(30),
        }).optional())
        .query(async ({ input }) => {
            const days = input?.days ?? 30;
            const since = new Date();
            since.setDate(since.getDate() - days);
            since.setHours(0, 0, 0, 0);

            // Force flush buffer before querying
            await analyticsBuffer.flush();

            // Total events by type
            const eventsByType = await (prisma as any).analyticsEvent.groupBy({
                by: ['eventType'],
                where: { date: { gte: since } },
                _sum: { count: true },
            });

            // Daily trend
            const dailyTrend = await (prisma as any).analyticsEvent.groupBy({
                by: ['date', 'eventType'],
                where: { date: { gte: since } },
                _sum: { count: true },
                orderBy: { date: 'asc' },
            });

            // Top products (PRODUCT_VIEW + BASKET_ADD)
            const topProducts = await (prisma as any).analyticsEvent.groupBy({
                by: ['productId', 'eventType'],
                where: {
                    date: { gte: since },
                    eventType: { in: ['PRODUCT_VIEW', 'BASKET_ADD'] },
                    productId: { not: null },
                },
                _sum: { count: true },
                orderBy: { _sum: { count: 'desc' } },
                take: 30,
            });

            // Resolve product names
            const productIds = [...new Set(topProducts.map((p: any) => p.productId).filter(Boolean))] as string[];
            const products = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: { id: true, name: true, category: true },
            });
            const productMap = new Map(products.map(p => [p.id, p]));

            // Top categories
            const topCategories = await (prisma as any).analyticsEvent.groupBy({
                by: ['category'],
                where: {
                    date: { gte: since },
                    eventType: 'PAGE_VIEW',
                    category: { not: null },
                },
                _sum: { count: true },
                orderBy: { _sum: { count: 'desc' } },
            });

            // Usage by team
            const teamUsage = await (prisma as any).analyticsEvent.groupBy({
                by: ['teamId'],
                where: {
                    date: { gte: since },
                    teamId: { not: null },
                },
                _sum: { count: true },
                orderBy: { _sum: { count: 'desc' } },
                take: 20,
            });

            // Resolve team names
            const teamIds = teamUsage.map((t: any) => t.teamId).filter(Boolean) as string[];
            const teams = await prisma.team.findMany({
                where: { id: { in: teamIds } },
                select: { id: true, name: true, location: { select: { name: true } } },
            });
            const teamMap = new Map(teams.map(t => [t.id, t]));

            // Basket conversion rate
            const viewsTotal = eventsByType.find((e: any) => e.eventType === 'PRODUCT_VIEW')?._sum?.count ?? 0;
            const basketTotal = eventsByType.find((e: any) => e.eventType === 'BASKET_ADD')?._sum?.count ?? 0;
            const conversionRate = viewsTotal > 0 ? (basketTotal / viewsTotal) * 100 : 0;

            return {
                period: { days, since: since.toISOString() },
                kpis: {
                    totalPageViews: eventsByType.find((e: any) => e.eventType === 'PAGE_VIEW')?._sum?.count ?? 0,
                    totalProductViews: viewsTotal,
                    totalBasketAdds: basketTotal,
                    conversionRate: Math.round(conversionRate * 10) / 10,
                },
                dailyTrend: dailyTrend.map((d: any) => ({
                    date: d.date.toISOString().slice(0, 10),
                    eventType: d.eventType,
                    count: d._sum?.count ?? 0,
                })),
                topProducts: topProducts.map((p: any) => ({
                    productId: p.productId,
                    eventType: p.eventType,
                    count: p._sum?.count ?? 0,
                    name: productMap.get(p.productId!)?.name ?? 'Unbekannt',
                    category: productMap.get(p.productId!)?.category ?? '',
                })),
                topCategories: topCategories.map((c: any) => ({
                    category: c.category,
                    count: c._sum?.count ?? 0,
                })),
                teamUsage: teamUsage.map((t: any) => ({
                    teamId: t.teamId,
                    count: t._sum?.count ?? 0,
                    name: teamMap.get(t.teamId!)?.name ?? 'Unbekannt',
                    location: teamMap.get(t.teamId!)?.location?.name ?? '–',
                })),
            };
        }),
});
