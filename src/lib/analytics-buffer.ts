import {
	prisma,
} from './prisma';

/**
 * In-Memory Analytics Buffer
 * 
 * Collects analytics events in memory and batch-writes them to the database
 * every 60 seconds or when the buffer reaches 100 events.
 * This minimizes DB load: instead of 1 INSERT per event, we do 1 UPSERT per unique key per flush.
 */

interface BufferedEvent {
    date: string; // YYYY-MM-DD
    eventType: string;
    path: string | null;
    productId: string | null;
    category: string | null;
    teamId: string | null;
    count: number;
}

// Create a unique key for deduplication
function eventKey(e: Omit<BufferedEvent, 'count'>): string {
	return `${e.date}|${e.eventType}|${e.path ?? ''}|${e.productId ?? ''}|${e.category ?? ''}|${e.teamId ?? ''}`;
}

class AnalyticsBuffer {
	private buffer = new Map<string, BufferedEvent>();
	private flushInterval: ReturnType<typeof setInterval> | null = null;
	private isFlushing = false;

	constructor() {
		// Flush every 60 seconds
		this.flushInterval = setInterval(() => this.flush(), 60_000);

		// Flush on process exit
		if (typeof process !== 'undefined') {
			process.on('beforeExit', () => this.flush());
		}
	}

	track(event: {
        eventType: string;
        path?: string | null;
        productId?: string | null;
        category?: string | null;
        teamId?: string | null;
    }) {
		const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
		const entry: Omit<BufferedEvent, 'count'> = {
			date: today,
			eventType: event.eventType,
			path: event.path ?? null,
			productId: event.productId ?? null,
			category: event.category ?? null,
			teamId: event.teamId ?? null,
		};

		const key = eventKey(entry);
		const existing = this.buffer.get(key);

		if (existing) {
			existing.count += 1;
		}
		else {
			this.buffer.set(key, {
				...entry,
				count: 1,
			});
		}

		// Auto-flush if buffer is large
		if (this.buffer.size >= 100) {
			this.flush();
		}
	}

	async flush() {
		if (this.isFlushing || this.buffer.size === 0) { return; }
		this.isFlushing = true;

		// Snapshot and clear buffer atomically
		const events = Array.from(this.buffer.values());
		this.buffer.clear();

		try {
			// Batch upsert using a transaction
			await prisma.$transaction(
				events.map((e) =>
					prisma.analyticsEvent.upsert({
						where: {
							analytics_unique_event: {
								date: new Date(e.date),
								eventType: e.eventType,
								path: e.path ?? '',
								productId: e.productId ?? '',
								category: e.category ?? '',
								teamId: e.teamId ?? '',
							},
						},
						update: {
							count: {
								increment: e.count,
							},
						},
						create: {
							date: new Date(e.date),
							eventType: e.eventType,
							path: e.path ?? '',
							productId: e.productId ?? '',
							category: e.category ?? '',
							teamId: e.teamId ?? '',
							count: e.count,
						},
					}),
				),
			);
		}
		catch (error) {
			// On failure, re-add events to buffer for next flush
			console.error('[Analytics] Flush failed, re-buffering events:', error);
			events.forEach((e) => {
				const key = eventKey(e);
				const existing = this.buffer.get(key);
				if (existing) {
					existing.count += e.count;
				}
				else {
					this.buffer.set(key, e);
				}
			});
		}
		finally {
			this.isFlushing = false;
		}
	}

	destroy() {
		if (this.flushInterval) {
			clearInterval(this.flushInterval);
			this.flushInterval = null;
		}
	}
}

// Singleton
const globalForAnalytics = globalThis as unknown as {
    analyticsBuffer: AnalyticsBuffer | undefined;
};

export const analyticsBuffer =
    globalForAnalytics.analyticsBuffer ?? new AnalyticsBuffer();

if (process.env.NODE_ENV !== 'production') {
	globalForAnalytics.analyticsBuffer = analyticsBuffer;
}
