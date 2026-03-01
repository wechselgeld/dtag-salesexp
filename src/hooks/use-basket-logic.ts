import { useEffect, useRef } from "react";
import { useBasketStore, BasketItem } from "@/hooks/use-basket-store";
import { useNewsNotificationStore } from "@/lib/store/news-notification-store";
import { calculateProductCosts, DEFAULT_PRICING } from "@/hooks/use-cost-calculator";
import { trpc } from "@/lib/trpc";
import { PricingSettings } from "@/types/product";

export function useBasketLogic() {
    const { items, basketCredits } = useBasketStore();
    const addNotification = useNewsNotificationStore((state) => state.addNotification);
    const lastNudgeRef = useRef<string | null>(null);

    const { data: pricingSettings } = trpc.settings.getPricingSettings.useQuery();
    const settings = pricingSettings || DEFAULT_PRICING;

    // Cross-Sell Detector (Fixed + Mobile Advantage)
    useEffect(() => {
        if (items.length === 0) {
            lastNudgeRef.current = null;
            return;
        }

        const hasMobile = items.some((i) => i.product.category === "MOBILE");
        const hasFixed = items.some(
            (i) => i.product.category === "FIBER" || i.product.category === "DSL"
        );

        let nudgeId = null;
        let title = "";
        let content = "";

        if (hasMobile && !hasFixed) {
            nudgeId = "nudge-fixed-missing";
            title = "Preisvorteil durch Festnetz";
            content = "Dein Kunde nutzt Mobilfunk. Biete ihm zusätzlich Festnetz an.";
        } else if (hasFixed && !hasMobile) {
            nudgeId = "nudge-mobile-missing";
            title = "Preisvorteil durch Mobilfunk";
            content = "Dein Kunde nutzt Festnetz. Biete ihm zusätzlich Mobilfunk an.";
        }

        if (nudgeId && lastNudgeRef.current !== nudgeId) {
            addNotification({
                id: nudgeId + Date.now(),
                title,
                content,
                priority: "SALES"
            });
            lastNudgeRef.current = nudgeId;
        } else if (!nudgeId) {
            lastNudgeRef.current = null;
        }
    }, [items, addNotification]);

    // Cache calculations for each item to avoid redundant expensive calls
    const itemsWithCosts = items.map(item => ({
        item,
        costs: calculateProductCosts({
            product: item.product,
            businessCase: item.config.businessCase,
            magentaTVPackage: item.config.magentaTVPackage,
            selectedSpecialPriceIds: item.config.selectedSpecialPriceIds,
            selectedAddonIds: item.config.selectedAddonIds,
            vouchers: item.config.vouchers,
            hardwarePurchaseType: item.config.hardwarePurchaseType,
            plusKartenCount: item.config.plusKartenCount,
            settings: settings
        })
    }));

    // Aggregated Totals
    const totals = itemsWithCosts.reduce((acc, entry) => {
        return {
            monthly: acc.monthly + entry.costs.averageMonthlyCost,
            daily: acc.daily + entry.costs.averageMonthlyCost / 30
        };
    }, { monthly: 0, daily: 0 });

    // Monthly steps calculation (24 months)
    const combinedSteps = itemsWithCosts.length > 0 ? (() => {
        const monthlyTotals = Array(24).fill(0);
        itemsWithCosts.forEach((entry) => {
            entry.costs.monthlyCosts.forEach((mc, index) => {
                if (index < 24) monthlyTotals[index] += mc.total;
            });
        });

        const steps: { start: number; end: number; total: number }[] = [];
        let currentStep = { start: 1, end: 1, total: monthlyTotals[0] };

        for (let i = 1; i < 24; i++) {
            if (Math.abs(monthlyTotals[i] - currentStep.total) < 0.01) {
                currentStep.end = i + 1;
            } else {
                steps.push({ ...currentStep });
                currentStep = { start: i + 1, end: i + 1, total: monthlyTotals[i] };
            }
        }
        steps.push(currentStep);
        return steps;
    })() : [];

    // One-time costs breakdown
    const oneTimeBreakdowns = itemsWithCosts.flatMap((entry) => entry.costs.oneTimeCosts.breakdown);

    const oneTimeBreakdownNoShipping = oneTimeBreakdowns.filter(c => c.name !== "Versand Hardware");
    const totalOneTimeItems = oneTimeBreakdownNoShipping.reduce((acc, curr) => acc + curr.cost, 0);
    const hasDevice = items.some((i) => i.product.category === "DEVICE");
    const globalShippingFee = hasDevice ? settings.shipping_hardware_fee : 0;

    const groupedOneTimeCosts = oneTimeBreakdownNoShipping.reduce((acc, curr) => {
        acc[curr.name] = (acc[curr.name] || 0) + curr.cost;
        return acc;
    }, {} as Record<string, number>);

    if (globalShippingFee > 0) {
        groupedOneTimeCosts["Versand Hardware"] = globalShippingFee;
    }

    const totalCredits = basketCredits.reduce((acc, credit) => acc + credit.value, 0);
    const totalOneTime = (totalOneTimeItems + globalShippingFee) - totalCredits;

    return {
        totals,
        combinedSteps,
        groupedOneTimeCosts,
        totalOneTime,
        totalCredits,
        hasDevice,
        deviceShippingCost: globalShippingFee,
        settings
    };
}
