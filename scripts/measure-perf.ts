import { appRouter } from '../src/server/routers/_app';
import { createContext } from '../src/server/context';
import { headers } from 'next/headers';
import { prisma } from '../src/lib/prisma';

// Create a mock context with admin session
async function getAdminCaller() {
  return appRouter.createCaller({
    session: {
      sub: 'test-admin-id',
      role: 'ADMIN',
      id: 'test-admin-id'
    },
    prisma: prisma,
    req: new Request('http://localhost', { headers: new Headers() }) as any,
    ip: '127.0.0.1',
  } as any);
}

// Create a mock context with public/guest session
async function getPublicCaller() {
  return appRouter.createCaller({
    session: null,
    prisma: prisma,
    req: new Request('http://localhost', { headers: new Headers() }) as any,
    ip: '127.0.0.1',
  } as any);
}

async function measure(name: string, fn: () => Promise<any>, runs = 10) {
  // warmup
  await fn().catch(() => {});

  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    await fn().catch(() => {});
  }
  const end = performance.now();
  const avg = (end - start) / runs;

  console.log(`[${name}] Avg over ${runs} runs: ${avg.toFixed(2)}ms`);
  return avg;
}

async function runBenchmark() {
  const adminCaller = await getAdminCaller();
  const publicCaller = await getPublicCaller();

  console.log('--- Starting Benchmark ---');

  await measure('admin.getDashboardStats', () => adminCaller.admin.getDashboardStats(), 20);
  await measure('product.getCategoryStats', () => publicCaller.product.getCategoryStats(), 20);
  await measure('product.getAllProducts', () => publicCaller.product.getAllProducts(), 10);
  await measure('session.getIsEmailRequired', () => publicCaller.session.getIsEmailRequired(), 50);
  await measure('settings.getDesignSettings', () => publicCaller.settings.getDesignSettings(), 20);

  console.log('--- Benchmark Complete ---');
  process.exit(0);
}

runBenchmark().catch(console.error);
