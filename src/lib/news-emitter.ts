import {
	EventEmitter,
} from 'node:events';

// To prevent EventEmitter resets during HMR in Next.js development
const globalForNewsEmitter = global as unknown as { newsEmitter: EventEmitter };

export const newsEmitter =
	globalForNewsEmitter.newsEmitter || new EventEmitter();

// Allow multiple clients to connect without throwing warning
newsEmitter.setMaxListeners(2000);

if (process.env.NODE_ENV !== 'production') {
	globalForNewsEmitter.newsEmitter = newsEmitter;
}
