import type {
	CalculationResult,
} from '@/types/product';

// ─── Price Formatting ────────────────────────────────────────────────
export const fmt = (n: number) => n.toFixed(2).replace('.', ',');
export const fmtPrice = (n: number) => `${fmt(n)} \u20AC`;

// ─── Date ────────────────────────────────────────────────────────────
export function getDate(): string {
	const now = new Date();
	return `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
}

// ─── Daily Price Trivialization ──────────────────────────────────────
/** Returns a human-readable daily cost string without unsupported unicode (e.g. ≈). */
export function formatDailyPrice(monthlyAvg: number): string {
	const daily = monthlyAvg / 30;
	if (daily < 1) {
		return `ca. ${(daily * 100).toFixed(0)} Cent pro Tag`;
	}
	return `ca. ${fmt(daily)} \u20AC pro Tag`;
}

// ─── Monthly Cost Steps ───────────────────────────────────────────────
export interface CostStep {
	start: number;
	end: number;
	total: number;
}

/**
 * Compresses a 24-month cost array into consecutive equal-price ranges.
 * e.g. [29.95, 29.95, 49.95, 49.95] → [{start:1,end:2,total:29.95}, {start:3,end:4,total:49.95}]
 */
export function computeSteps(monthlyCosts: CalculationResult['monthlyCosts']): CostStep[] {
	if (monthlyCosts.length === 0) return [];

	const steps: CostStep[] = [];
	let cur: CostStep = {
		start: 1,
		end: 1,
		total: monthlyCosts[0].total,
	};

	for (let i = 1; i < monthlyCosts.length; i++) {
		if (Math.abs(monthlyCosts[i].total - cur.total) < 0.01) {
			cur.end = i + 1;
		}
		else {
			steps.push({ ...cur });
			cur = {
				start: i + 1,
				end: i + 1,
				total: monthlyCosts[i].total,
			};
		}
	}
	steps.push(cur);
	return steps;
}

/**
 * Builds a synthetic monthlyCosts-shaped array from a flat number[] for use with computeSteps.
 * Used to combine multiple products' monthly totals into combined steps.
 */
export function buildCombinedSteps(monthlyTotals: number[]): CostStep[] {
	const synthetic = monthlyTotals.map((total, idx) => ({
		month: idx + 1,
		basePrice: 0,
		effectivePrice: 0,
		addonCosts: 0,
		magentaTVCost: 0,
		total,
	}));
	return computeSteps(synthetic);
}
