import {
	EventEmitter,
} from 'node:events';
import {
	redis,
} from './redis';

const globalForNewsEmitter = globalThis as unknown as {
	newsEmitter: EventEmitter;
	pubSubSubscribed: boolean;
};

export const newsEmitter =
	globalForNewsEmitter.newsEmitter || new EventEmitter();

// Allow multiple clients to connect without throwing warning
newsEmitter.setMaxListeners(2000);

if (process.env.NODE_ENV !== 'production') {
	globalForNewsEmitter.newsEmitter = newsEmitter;
}

// Set up Dragonfly Redis Pub/Sub listener (singleton connection for clustering)
if (!globalForNewsEmitter.pubSubSubscribed) {
	const subRedis = redis.duplicate({
		lazyConnect: false,
		enableOfflineQueue: true,
	});

	subRedis.on('error', (err) => {
		console.error('News Pub/Sub Redis error:', err);
	});

	subRedis.on('message', (_channel, message) => {
		try {
			const news = JSON.parse(message);
			newsEmitter.emit('local_add', news);
		}
		catch (err) {
			console.error('Failed to parse Pub/Sub news payload:', err);
		}
	});

	subRedis.subscribe('news_cluster_sync')
		.then(() => {
			console.log('Successfully subscribed to news_cluster_sync Pub/Sub channel');
		})
		.catch((err) => {
			console.error('Failed to subscribe to news_cluster_sync:', err);
		});

	globalForNewsEmitter.pubSubSubscribed = true;
}

// When emitting news, this function is used instead of direct emitter.emit
export function publishNewsEvent(news: any) {
	// Publish to Redis/Dragonfly cluster
	redis.publish('news_cluster_sync', JSON.stringify(news))
		.catch((err) => {
			console.error('Failed to publish news event to Redis:', err);
			// Fallback to local-only emit to maintain service if Redis is down
			newsEmitter.emit('local_add', news);
		});
}
